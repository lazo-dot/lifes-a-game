/* Life's a Game · Spiellogik
 * UI-frei und ohne DOM: läuft im Browser (window.LAG) und in Node (require) für Tests.
 * Alle Datumswerte sind lokale Tagesschlüssel "YYYY-MM-DD", damit die Logik 1:1 nach Dart portierbar ist.
 * Referenz: Entwicklungsleitfaden v1.3, Abschnitte 3, 4 und 9.
 */
(function (root) {
  'use strict';

  /* ---------- Konstanten (Leitfaden 4) ---------- */
  const C = {
    SCHEMA: 4,
    EMA_A: 0.044,          // 4.2 Stärke pro geplantem Termin
    MAX_TOKENS: 2,         // 4.3 Regentage
    TOKEN_EVERY: 7,        // 4.3 1 Token je 7 erledigte Termine
    REPAIR_DAYS: 2,        // 4.3 Reparatur innerhalb 48 h
    DROP_P: 0.12,          // 4.4 Überraschungsfund
    RARE_P: 0.2,           // 4.4 Anteil seltener Funde
    JOURNAL_XP: 10,        // 5.3 kleine XP 1×/Tag
    MAX_SKILLS: 6,
    MAX_BEDS: 12,
    START_HABITS: 3,       // 5.1 Onboarding max. 3
    UNLOCK_DAYS: 7,        // 5.1 weitere nach der ersten Woche
    GRAD_DAYS: 30,         // 4.5 Graduierung
    SUGGEST_STRENGTH: 0.8, // 4.5 Ausschleichen
    SUGGEST_RUN: 14,
    CHECKIN_UNTIL_HOUR: 14 // 4.6 Morgen-Check-in nur bis zum frühen Nachmittag anbieten
  };
  const STAGES = [[0.15, 'Keim'], [0.35, 'Setzling'], [0.6, 'Jungpflanze'], [0.9, 'Blüte'], [2, 'Ausgewachsen']];
  const ITEMS = {
    flowers: { name: 'Blumenbeet', rare: false }, bench: { name: 'Holzbank', rare: false }, lantern: { name: 'Laterne', rare: false },
    barrel: { name: 'Fass', rare: false }, pot: { name: 'Blumentopf', rare: false }, sign: { name: 'Wegweiser', rare: false }, hay: { name: 'Heuballen', rare: false },
    scarecrow: { name: 'Vogelscheuche', rare: true }, beehive: { name: 'Bienenstock', rare: true }, well: { name: 'Brunnen', rare: true },
    chicken: { name: 'Huhn', rare: true, animal: true }, duck: { name: 'Ente', rare: true, animal: true }
  };
  const WEATHER = ['sonnig', 'heiter', 'bewoelkt', 'regen', 'gewitter'];

  /* ---------- Datum (nur Tagesschlüssel) ---------- */
  const pad = n => String(n).padStart(2, '0');
  const dkey = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d, 12); };
  const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return dkey(d); };
  const daysBetween = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 864e5);
  const weekday = k => parseKey(k).getDay();                 // 0 = Sonntag
  const weekStart = k => addDays(k, -((weekday(k) + 6) % 7)); // Montag
  const seasonOf = m => (m >= 2 && m <= 4 ? 'Frühling' : m >= 5 && m <= 7 ? 'Sommer' : m >= 8 && m <= 10 ? 'Herbst' : 'Winter');

  /* ---------- Zufall (deterministisch, injizierbar) ---------- */
  const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  /* ---------- XP & Level (4.1) ---------- */
  const xpFor = (effort, status) => (status === 'done' ? 10 * effort : status === 'tiny' ? 5 * effort : 0);
  const charNeed = L => Math.round(100 * Math.pow(L, 1.5));
  const skillNeed = L => Math.round(50 * Math.pow(L, 1.5));
  function lvl(total, need) { let l = 1; while (total >= need(l)) { total -= need(l); l++; } return { l, into: total, need: need(l) }; }
  const unitsToNext = (level, effort) => Math.max(1, Math.ceil((level.need - level.into) / (10 * effort)));
  const stageOf = s => STAGES.findIndex(([t]) => s < t);
  const ema = (s, x) => s * (1 - C.EMA_A) + C.EMA_A * x;

  /* ---------- Gewohnheit: Einstellungen über die Zeit ----------
   * Aufwand und Frequenz können bearbeitet werden. Damit alte Termine nicht rückwirkend
   * anders zählen, speichert history die Einstellungen ab einem Datum.
   */
  function settingsAt(h, k) {
    let cur = h.history[0];
    for (const e of h.history) { if (e.from <= k) cur = e; else break; }
    return cur;
  }
  const isPaused = (h, k) => (h.pauses || []).some(p => p.from <= k && (!p.to || k < p.to));
  function isScheduled(h, k) {
    if (k < h.createdAt || isPaused(h, k)) return false;
    const f = settingsAt(h, k).frequency;
    return f.kind !== 'weekdays' || f.days.includes(weekday(k));
  }
  const isDoneStatus = st => st === 'done' || st === 'tiny';

  /* ---------- Kernberechnung pro Gewohnheit ----------
   * Die Logs sind die einzige Quelle der Wahrheit. Stärke, Serie, Regentage, XP und Kalender
   * werden daraus abgeleitet (statt gespeichert), damit Rückgängig und Bearbeiten nie inkonsistent werden.
   */
  function computeHabit(h, today) {
    const ym = today.slice(0, 7), y = today.slice(0, 4), mStart = ym + '-01';
    const logs = h.logs || {};
    let s = 0, sMonth = null, streak = 0, run = 0, tokens = 0, prog = 0, xp = 0;
    let month = 0, monthTiny = 0, year = 0, lastPrev = null, lastPrevKey = null, doneToday = null;
    const xpByDay = {}, days = {};
    // 4.5 Graduierung: erster Tag ab 30 Tagen ohne Erinnerung, an dem die Gewohnheit kräftig ist. Danach bleibt sie gemeistert.
    const gradFrom = !h.remindersEnabled && h.remOffAt ? addDays(h.remOffAt, C.GRAD_DAYS) : null;
    let gradAt = null;
    const checkGrad = k => { if (gradFrom && !gradAt && k >= gradFrom && s >= C.SUGGEST_STRENGTH) gradAt = k; };
    // Wochen-Gewohnheiten
    let wk = null, wcnt = 0, wStreak = 0, wN = 0;
    const finishWeek = () => {
      if (wk === null) return;
      let active = 0;
      for (let i = 0; i < 7; i++) { const d = addDays(wk, i); if (d >= h.createdAt && !isPaused(h, d)) active++; }
      const target = Math.min(wN, Math.ceil(wN * active / 7));     // A11: anteilig in angebrochenen Wochen
      for (let i = Math.min(wcnt, target); i < target; i++) s = ema(s, 0);
      if (target > 0) wStreak = wcnt >= target ? wStreak + 1 : 0;
    };
    for (let k = h.createdAt; k <= today; k = addDays(k, 1)) {
      if (k > h.createdAt) checkGrad(addDays(k, -1));
      const st = logs[k], isT = k === today, set = settingsAt(h, k), f = set.frequency;
      if (k === mStart && sMonth === null) sMonth = s;
      if (isT) doneToday = st || null;
      if (f.kind === 'weekly') {
        const w = weekStart(k);
        if (w !== wk) { finishWeek(); wk = w; wcnt = 0; wN = settingsAt(h, w < h.createdAt ? h.createdAt : w).frequency.timesPerWeek; }
        if (isPaused(h, k)) continue;
        if (isDoneStatus(st) && wcnt < wN) {                       // A5: XP nur für geplante Termine
          wcnt++; s = ema(s, 1);
          const x = xpFor(set.effort, st); xp += x; xpByDay[k] = x; days[k] = st;
          if (k.startsWith(y)) year++; if (k.startsWith(ym)) { month++; if (st === 'tiny') monthTiny++; }
        }
        continue;
      }
      if (!isScheduled(h, k)) { if (!isPaused(h, k)) days[k] = 'off'; continue; }
      if (isDoneStatus(st)) {
        s = ema(s, 1); streak++; run++;
        if (++prog >= C.TOKEN_EVERY) { prog = 0; tokens = Math.min(C.MAX_TOKENS, tokens + 1); }
        const x = xpFor(set.effort, st); xp += x; xpByDay[k] = x; days[k] = st;
        if (k.startsWith(y)) year++; if (k.startsWith(ym)) { month++; if (st === 'tiny') monthTiny++; }
        if (!isT) { lastPrev = st; lastPrevKey = k; }
      } else if (st === 'repaired') {
        s = ema(s, 1); streak++; run = 0; days[k] = 'repaired'; lastPrev = st; lastPrevKey = k;
      } else if (!isT) {
        if (h.streakEnabled && tokens > 0) { tokens--; s = ema(s, 1); run = 0; days[k] = 'watered'; lastPrev = 'watered'; }
        else { s = ema(s, 0); streak = 0; run = 0; days[k] = 'missed'; lastPrev = 'missed'; }
        lastPrevKey = k;
      }
    }
    checkGrad(today);
    const freqNow = settingsAt(h, today).frequency, weekly = freqNow.kind === 'weekly';
    const N = weekly ? freqNow.timesPerWeek : 0, weekCnt = weekly ? (wk === weekStart(today) ? wcnt : 0) : 0;
    if (weekly) streak = wStreak + (weekCnt >= N ? 1 : 0);
    if (sMonth === null) sMonth = 0;
    const paused = isPaused(h, today);
    const due = !paused && (weekly ? (weekCnt < N || !!doneToday) : isScheduled(h, today));
    const graduated = !!gradAt;
    const canRepair = h.streakEnabled && !weekly && lastPrev === 'missed' && !!lastPrevKey &&
      daysBetween(lastPrevKey, today) <= C.REPAIR_DAYS && isDoneStatus(doneToday);
    return {
      s, stage: stageOf(s), stageMonthStart: stageOf(sMonth), streak, run, tokens, xp, xpByDay, days,
      month, monthTiny, year, doneToday, weekCnt, N, weekly, due, paused, graduated,
      gradDate: gradAt,
      canRepair, repairKey: canRepair ? lastPrevKey : null,
      suggestOff: h.remindersEnabled && !paused && s >= C.SUGGEST_STRENGTH && run >= C.SUGGEST_RUN,
      age: daysBetween(h.createdAt, today) + 1
    };
  }

  /* ---------- Gesamtzustand ableiten ---------- */
  function derive(state, today) {
    const H = {}; state.habits.forEach(h => { H[h.id] = computeHabit(h, today); });
    const sk = {}, byDay = {};
    state.skills.forEach(s => { sk[s.id] = 0; byDay[s.id] = {}; });
    state.habits.forEach(h => {
      if (sk[h.skillId] === undefined) return;
      sk[h.skillId] += H[h.id].xp;
      const b = byDay[h.skillId]; for (const k in H[h.id].xpByDay) b[k] = (b[k] || 0) + H[h.id].xpByDay[k];
    });
    state.todos.forEach(t => {
      if (!t.doneAt || sk[t.skillId] === undefined) return;
      const x = 10 * t.effort; sk[t.skillId] += x; byDay[t.skillId][t.doneAt] = (byDay[t.skillId][t.doneAt] || 0) + x;
    });
    const total = Object.values(sk).reduce((a, b) => a + b, 0) + state.journal.length * C.JOURNAL_XP;
    const levels = {}; state.skills.forEach(s => { levels[s.id] = lvl(sk[s.id], skillNeed); });
    return { H, sk, byDay, levels, total, char: lvl(total, charNeed) };
  }

  /* ---------- Funde (4.4) ---------- */
  function pickItem(rand, rare) { const pool = Object.keys(ITEMS).filter(k => ITEMS[k].rare === rare); return pool[Math.floor(rand() * pool.length)]; }
  function rollDrop(rand) { if (rand() >= C.DROP_P) return null; return pickItem(rand, rand() < C.RARE_P); }
  /** B2: neue Wachstumsstufe = garantierter Fund. Hochwassermarke verhindert Mehrfach-Ernte nach Rückgängig. */
  const harvestsDue = (h, d) => Math.max(0, d.stage - (h.harvestStage || 0));
  const gradRewardDue = (h, d) => d.graduated && !h.gradRewarded;
  const slotsFor = L => Math.min(12, 3 + L);
  /** H3: Fundchancen zum Anzeigen. Gewürfelt wird höchstens einmal pro Gewohnheit und Tag bzw. einmal pro To-do. */
  function dropOdds() {
    const pool = rare => Object.keys(ITEMS).filter(k => ITEMS[k].rare === rare);
    return { any: C.DROP_P, rare: C.DROP_P * C.RARE_P, common: C.DROP_P * (1 - C.RARE_P), rareShare: C.RARE_P,
      harvestRare: C.RARE_P, commonItems: pool(false), rareItems: pool(true) };
  }

  /* ---------- Onboarding (5.1) ---------- */
  function canAddHabit(state, today) {
    const active = state.habits.filter(h => !h.archivedAt).length;
    if (active < C.START_HABITS) return { ok: true };
    const since = state.startedAt ? daysBetween(state.startedAt, today) : 0;
    if (since >= C.UNLOCK_DAYS) return { ok: true };
    return { ok: false, unlockOn: addDays(state.startedAt || today, C.UNLOCK_DAYS) };
  }
  function validateHabitInput(i) {
    const miss = [];
    if (!i.title || !i.title.trim()) miss.push('was du tun möchtest');
    if (!i.anchor || !i.anchor.trim()) miss.push('nach welcher Routine');
    if (!i.tinyVersion || !i.tinyVersion.trim()) miss.push('eine Mini-Version');
    if (i.frequency && i.frequency.kind === 'weekdays' && !(i.frequency.days || []).length) miss.push('mindestens einen Wochentag');
    if (i.frequency && i.frequency.kind === 'weekly' && !(i.frequency.timesPerWeek >= 1 && i.frequency.timesPerWeek <= 6)) miss.push('1 bis 6 Mal pro Woche');
    if (![1, 2, 3].includes(i.effort)) miss.push('einen Aufwand');
    return miss;
  }
  const cleanAnchor = a => String(a || '').trim().replace(/^nach\s+/i, '');
  function newHabit(i, today, id) {
    return {
      id, title: i.title.trim(), anchor: cleanAnchor(i.anchor), anchorTime: i.anchorTime || '', tinyVersion: i.tinyVersion.trim(),
      frequency: i.frequency, skillId: i.skillId, effort: i.effort, streakEnabled: !!i.streakEnabled, remindersEnabled: !!i.remindersEnabled,
      remOffAt: i.remindersEnabled ? null : today, createdAt: today, history: [{ from: today, effort: i.effort, frequency: i.frequency }],
      pauses: [], logs: {}, harvestStage: 0, gradRewarded: false, rolled: ''
    };
  }
  /** F7: Bearbeiten. Aufwand/Frequenz gelten ab heute, ältere Termine behalten ihre Werte. */
  function applyEdit(h, i, today) {
    const changedSched = h.effort !== i.effort || JSON.stringify(h.frequency) !== JSON.stringify(i.frequency);
    h.title = i.title.trim(); h.anchor = cleanAnchor(i.anchor); h.anchorTime = i.anchorTime || ''; h.tinyVersion = i.tinyVersion.trim(); h.skillId = i.skillId;
    if (h.streakEnabled !== !!i.streakEnabled) h.streakEnabled = !!i.streakEnabled;
    if (h.remindersEnabled !== !!i.remindersEnabled) { h.remindersEnabled = !!i.remindersEnabled; h.remOffAt = h.remindersEnabled ? null : today; }
    if (changedSched) {
      h.effort = i.effort; h.frequency = i.frequency;
      const last = h.history[h.history.length - 1];
      if (last.from === today) { last.effort = i.effort; last.frequency = i.frequency; }
      else h.history.push({ from: today, effort: i.effort, frequency: i.frequency });
    }
    return h;
  }
  function pause(h, today) { if (h.archivedAt) return h; h.archivedAt = today; (h.pauses = h.pauses || []).push({ from: today, to: null }); return h; }
  function resume(h, today) {
    const p = (h.pauses || []).find(x => !x.to); if (p) { if (p.from === today) h.pauses.splice(h.pauses.indexOf(p), 1); else p.to = today; }
    delete h.archivedAt; return h;
  }

  /* ---------- Check-in & Welt (4.6, 5.4) ---------- */
  function dayWeather(key) {
    const r = rng(hashStr(key + 'wx'))(), s = seasonOf(parseKey(key).getMonth());
    const w = { Frühling: [.25, .3, .2, .2, .05], Sommer: [.4, .3, .1, .1, .1], Herbst: [.15, .25, .3, .22, .08], Winter: [.15, .2, .4, .2, .05] }[s];
    let a = 0; for (let i = 0; i < 5; i++) { a += w[i]; if (r < a) return WEATHER[i]; } return 'heiter';
  }
  const journalOn = (state, k) => state.journal.find(j => j.date === k);
  const currentWeather = (state, today, preview) =>
    preview || (journalOn(state, today) || {}).weather || ((state.checkins || {})[today] || {}).weather || dayWeather(today);
  const needsCheckin = (state, today, hour) =>
    !!state.onboarded && !(state.checkins || {})[today] && hour >= 5 && hour < C.CHECKIN_UNTIL_HOUR && state.habits.some(h => !h.archivedAt);
  const farmSleeps = hour => hour >= 22 || hour < 6;

  /* ---------- Erntekalender (5.5) ---------- */
  /** Liefert ein Jahresraster: Spalten = Wochen (Mo–So), Zellen mit Status bzw. Intensität 0–4. */
  function yearGrid(state, D, habitId, yearStr, today) {
    const first = yearStr + '-01-01', last = yearStr + '-12-31', start = weekStart(first), cells = [];
    const h = habitId ? state.habits.find(x => x.id === habitId) : null;
    for (let k = start, i = 0; k <= last || i % 7; k = addDays(k, 1), i++) {
      const col = Math.floor(i / 7), row = i % 7;
      if (k < first || k > last) { cells.push({ k, col, row, v: 'none' }); continue; }
      if (k > today) { cells.push({ k, col, row, v: 'future' }); continue; }
      if (h) {
        const st = D.H[h.id].days[k];
        cells.push({ k, col, row, v: st === 'done' || st === 'tiny' || st === 'repaired' || st === 'watered' ? st : st === 'missed' ? 'empty' : k < h.createdAt ? 'before' : 'off' });
      } else {
        let n = 0; state.habits.forEach(x => { const st = D.H[x.id].days[k]; if (st === 'done' || st === 'tiny' || st === 'repaired') n++; });
        if (state.journal.some(j => j.date === k)) n++;
        cells.push({ k, col, row, v: n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n <= 4 ? 3 : 4 });
      }
    }
    return { cells, cols: Math.ceil(cells.length / 7) };
  }

  /* ---------- Beta-Metriken (Leitfaden 9) ----------
   * Werden wie alles andere aus den gespeicherten Eingaben abgeleitet und nur lokal angezeigt bzw. exportiert.
   * "Gehalten nach X Tagen": in den 14 Tagen bis Tag X mindestens die Hälfte der geplanten Termine erledigt
   * (erledigt, Mini, nachgeholt oder Regentag). Gelöschte Gewohnheiten fehlen, weil ihre Daten weg sind.
   */
  const HOLD_WINDOW = 14, HOLD_SHARE = 0.5, RETURN_DAYS = 7;
  function heldAt(h, day) {
    const d = computeHabit(h, day), from = addDays(day, -(HOLD_WINDOW - 1));
    if (d.weekly) {                                   // Wochen-Gewohnheiten: Erledigungen gegen anteiliges Ziel
      let done = 0; for (const k in d.days) if (k >= from && k <= day && isDoneStatus(d.days[k])) done++;
      return done >= HOLD_SHARE * settingsAt(h, day).frequency.timesPerWeek * HOLD_WINDOW / 7;
    }
    let plan = 0, ok = 0;
    for (let k = from; k <= day; k = addDays(k, 1)) {
      const v = d.days[k]; if (!v || v === 'off') continue;
      plan++; if (v !== 'missed') ok++;
    }
    return plan > 0 && ok >= HOLD_SHARE * plan;
  }
  function betaMetrics(state, today) {
    const D = derive(state, today), out = { date: today, habits: state.habits.length, withAnchor: 0, cohorts: {}, tiny: {}, breaks: {}, checkins: {} };
    out.withAnchor = state.habits.filter(h => (h.anchor || '').trim()).length;
    for (const X of [30, 66]) {
      const c = state.habits.filter(h => D.H[h.id].age >= X), day = h => addDays(h.createdAt, X - 1);
      out.cohorts['d' + X] = { eligible: c.length, held: c.filter(h => heldAt(h, day(h))).length,
        mastered: c.filter(h => D.H[h.id].graduated && D.H[h.id].gradDate <= day(h)).length };
    }
    let all = 0, tiny = 0, all30 = 0, tiny30 = 0; const from30 = addDays(today, -29);
    let breaks = 0, returned = 0; const gaps = [];
    state.habits.forEach(h => {
      const days = D.H[h.id].days, keys = Object.keys(days).sort();
      keys.forEach(k => { const v = days[k]; if (!isDoneStatus(v)) return; all++; if (v === 'tiny') tiny++; if (k >= from30) { all30++; if (v === 'tiny') tiny30++; } });
      // Serienbruch = erster verpasster Termin nach einem erledigten; Rückkehr = wieder erledigt innerhalb von 7 Tagen.
      let prev = null;
      keys.forEach((k, i) => {
        const v = days[k]; if (v === 'off') return;
        if (v === 'missed' && prev && prev !== 'missed') {
          breaks++; const back = keys.slice(i + 1).find(x => isDoneStatus(days[x]) || days[x] === 'repaired');
          if (back && daysBetween(k, back) <= RETURN_DAYS) { returned++; gaps.push(daysBetween(k, back)); }
        }
        prev = v;
      });
    });
    out.tiny = { completions: all, tiny, share: all ? tiny / all : 0, last30: all30, tiny30, share30: all30 ? tiny30 / all30 : 0 };
    gaps.sort((a, b) => a - b);
    out.breaks = { breaks, returnedWithin7: returned, share: breaks ? returned / breaks : 0, medianDays: gaps.length ? gaps[Math.floor((gaps.length - 1) / 2)] : null };
    const ci = state.checkins || {}, start = state.startedAt || today, span = daysBetween(start, today) + 1;
    const keys = Object.keys(ci).filter(k => k >= start && k <= today), done = keys.filter(k => !ci[k].skipped).length;
    out.checkins = { days: span, opened: keys.length, done, skipped: keys.length - done, share: span > 0 ? done / span : 0 };
    return out;
  }

  /* ---------- Neuer Zustand, Migration, Import (F6) ---------- */
  function emptyState(today) {
    return {
      schema: C.SCHEMA, onboarded: false, startedAt: today, sound: true, music: false, freshSeen: '', installHintSeen: false,
      skills: [{ id: 's1', name: 'Körper', icon: 'boot', st: 0 }, { id: 's2', name: 'Geist', icon: 'book', st: 1 }, { id: 's3', name: 'Alltag', icon: 'crate', st: 3 }],
      habits: [], todos: [], journal: [], checkins: {}, chest: { items: {}, placed: [] }
    };
  }
  /** v3 → v4: Feldnamen an Leitfaden 3 angleichen, Historie und Pausen ergänzen. */
  function migrateV3(v3, today) {
    const s = emptyState(today);
    s.onboarded = true; s.sound = v3.sound !== false; s.music = !!v3.music; s.skills = v3.skills || s.skills;
    s.startedAt = (v3.habits || []).reduce((a, h) => (h.createdAt < a ? h.createdAt : a), today);
    s.habits = (v3.habits || []).map(h => {
      const frequency = h.freq.kind === 'weekly' ? { kind: 'weekly', timesPerWeek: h.freq.n } : h.freq.kind === 'weekdays' ? { kind: 'weekdays', days: h.freq.days } : { kind: 'daily' };
      const n = {
        id: h.id, title: h.title, anchor: h.anchor, anchorTime: h.anchorTime || '', tinyVersion: h.tiny || '', frequency, skillId: h.skillId,
        effort: h.effort, streakEnabled: !!h.streak, remindersEnabled: !!h.rem, remOffAt: h.remOffAt || null, createdAt: h.createdAt,
        history: [{ from: h.createdAt, effort: h.effort, frequency }], pauses: [], logs: Object.assign({}, h.log), harvestStage: 0, gradRewarded: false, rolled: h.rolled || ''
      };
      n.harvestStage = computeHabit(n, today).stage; // keine Ernte-Flut nach dem Umzug
      n.gradRewarded = computeHabit(n, today).graduated;
      return n;
    });
    s.todos = (v3.todos || []).map(t => ({ id: t.id, title: t.title, effort: t.effort, skillId: t.skillId, doneAt: t.doneAt, rolled: !!t.rolled }));
    s.journal = v3.journal || [];
    s.chest = { items: Object.assign({}, v3.inv), placed: (v3.placed || []).map(p => ({ itemId: p.type, slot: p.slot })) };
    return s;
  }
  /** Prüft importierte Daten. Gibt { ok, state | error } zurück. */
  function importState(obj, today) {
    try {
      if (!obj || typeof obj !== 'object') return { ok: false, error: 'Die Datei enthält keine gültigen Daten.' };
      if (obj.v === 3) return { ok: true, state: migrateV3(obj, today) };
      if (obj.schema !== C.SCHEMA) return { ok: false, error: 'Diese Datei stammt aus einer unbekannten Version.' };
      for (const key of ['skills', 'habits', 'todos', 'journal']) if (!Array.isArray(obj[key])) return { ok: false, error: `Der Bereich „${key}“ fehlt oder ist beschädigt.` };
      for (const h of obj.habits) {
        if (!h.id || !h.createdAt || !Array.isArray(h.history) || !h.history.length || typeof h.logs !== 'object') return { ok: false, error: `Die Gewohnheit „${h.title || '?'}“ ist unvollständig.` };
      }
      obj.checkins = obj.checkins || {}; obj.chest = obj.chest || { items: {}, placed: [] };
      return { ok: true, state: obj };
    } catch (e) { return { ok: false, error: 'Die Datei konnte nicht gelesen werden.' }; }
  }

  const LAG = {
    C, STAGES, ITEMS, WEATHER,
    dkey, parseKey, addDays, daysBetween, weekday, weekStart, seasonOf, hashStr, rng,
    xpFor, charNeed, skillNeed, lvl, unitsToNext, stageOf, settingsAt, isPaused, isScheduled,
    computeHabit, derive, rollDrop, pickItem, harvestsDue, gradRewardDue, slotsFor, dropOdds, heldAt, betaMetrics,
    canAddHabit, validateHabitInput, cleanAnchor, newHabit, applyEdit, pause, resume,
    dayWeather, journalOn, currentWeather, needsCheckin, farmSleeps, yearGrid,
    emptyState, migrateV3, importState
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = LAG; else root.LAG = LAG;
})(typeof self !== 'undefined' ? self : this);
