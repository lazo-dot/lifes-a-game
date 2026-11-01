/* 30-Tage-Simulation mit der echten Spiellogik von Prototyp v5 (src/logic.js).
 * Verhalten der Personas ist synthetisch (siehe personas.js); alle Spielwerte
 * (Stärke, Serien, Regentage, Reparatur, XP, Level, Ernte, Funde, Beta-Zahlen) berechnet logic.js.
 */
const L = require('../src/logic.js');
const PERSONAS = require('./personas.js');

const START = '2026-11-02', DAYS = 30, RUNS = +process.argv[2] || 400;
const BACKFILL = process.env.BACKFILL === '1';   // Variante: Nachtragen für gestern/vorgestern erlaubt
const WINDOW_ALLDAY = process.env.CIALL === '1';  // Variante: Check-in den ganzen Tag (bis 22 Uhr)

function mulberry(seed) { return L.rng(seed); }
function poisson(r, mean) { let k = 0, p = Math.exp(-mean), s = p; const u = r(); while (u > s && k < 20) { k++; p *= mean / k; s += p; } return k; }

function runOnce(P, seed) {
  const r = mulberry(seed);
  const S = L.emptyState(START); S.onboarded = true;
  P.habits.forEach(([title, frequency, effort, streak], i) => {
    S.habits.push(L.newHabit({ title, anchor: 'Nach dem Frühstück', tinyVersion: 'Mini', frequency, effort, streakEnabled: streak,
      remindersEnabled: true, skillId: S.skills[i % 3].id }, START, 'h' + i));
  });
  const m = { churnDay: null, openDays: 0, sched: 0, actual: 0, logged: 0, unlogged: 0, repairs: 0, repairBackfill: 0,
    drops: 0, rare: 0, harvests: 0, levelUps: 0, rewardDays: 0, maxDrought: 0, streakBreaks: 0, visibleBreaks: 0,
    ciOffered: 0, ciDone: 0, schedDone: 0, backfilled: 0, weekReward: [0,0,0,0,0], weekOpen: [0,0,0,0,0], weekDrops: [0,0,0,0,0], weekHarv: [0,0,0,0,0], openOnlyOutsideWindow: 0, sleepOpens: 0, firstRewardDay: null, stageUps: [], wantMoreBlockedDays: 0 };
  let sickLeft = 0, drought = 0, unopened = 0, prevChar = 1, prevSkillL = {}, prevStreak = {}, shiftOff = 0;
  const actualDone = {};                     // tatsächliches Verhalten (unabhängig vom Eintragen)

  for (let d = 0; d < DAYS; d++) {
    const k = L.addDays(START, d), wd = L.weekday(k), weekend = wd === 0 || wd === 6;
    if (m.churnDay !== null) continue;
    // Störungen (Krankheit, Reise, Stress)
    if (sickLeft > 0) sickLeft--; else if (r() < P.sick * (P.travel && wd === 1 ? 4 : 1)) sickLeft = 2 + Math.floor(r() * 4);
    let adh = P.adh * (weekend ? P.weekend : 1) * (sickLeft > 0 ? 0.25 : 1);
    if (P.lowSpells && r() < 0.25) adh *= 0.4;                         // Tage mit wenig Energie
    if (P.shift) { if (d % 3 === 0) shiftOff = Math.floor(r() * 3); if (shiftOff !== 0) adh *= 0.7; } // Schichtwechsel: Anker wackelt
    const novelty = P.openFloor + (1 - P.openFloor) * Math.exp(-d / P.tau);
    const opened = r() < P.open * novelty * (sickLeft > 0 ? 0.6 : 1);
    const hour = P.hours[Math.floor(r() * P.hours.length)];
    const hour2 = P.hours[Math.floor(r() * P.hours.length)];
    if (opened) { m.openDays++; unopened = 0; } else unopened++;
    if (opened && L.farmSleeps(hour)) m.sleepOpens++;
    if (P.wantMore && d < 7 && opened) m.wantMoreBlockedDays++;

    // Verhalten und Eintragen
    const D0 = L.derive(S, k);
    let newLogs = [];
    S.habits.forEach(h => {
      const H = D0.H[h.id];
      let act = null;
      if (H.weekly) {
        const left = 7 - ((wd + 6) % 7);                               // verbleibende Tage der Woche inkl. heute
        const need = Math.max(0, H.N - H.weekCnt);
        if (need > 0 && r() < Math.min(1, (need / left) * 1.3) * (adh / P.adh) * Math.min(1, P.adh + 0.1)) act = 'done';
        else if (need > 0 && r() < P.tiny * 0.3) act = 'tiny';
      } else if (L.isScheduled(h, k)) {
        m.sched++;
        if (r() < adh) act = 'done'; else if (r() < P.tiny) act = 'tiny';
        if (act) m.schedDone++;
      } else return;
      if (!act) return;
      m.actual++; actualDone[h.id + k] = true;
      const logChance = P.lowLogging ? 0.85 : 0.96;
      if (opened && r() < logChance) { h.logs[k] = act; m.logged++; newLogs.push(h); }
      else m.unlogged++;
    });
    if (BACKFILL && opened) {
      S.habits.forEach(h => { for (const back of [1, 2]) { const kb = L.addDays(k, -back); if (kb < START) continue;
        if (actualDone[h.id + kb] && !h.logs[kb] && r() < 0.8) { h.logs[kb] = 'done'; m.backfilled++; m.unlogged--; m.logged++; } } });
    }
    // Reparatur („Extra-Runde erledigt“) anbieten
    if (opened) {
      const D1 = L.derive(S, k);
      S.habits.forEach(h => {
        const H = D1.H[h.id];
        if (H.canRepair && r() < P.repair) {
          if (actualDone[h.id + H.repairKey]) m.repairBackfill++;     // Taste wird als Nachtragen benutzt
          h.logs[H.repairKey] = 'repaired'; m.repairs++;
        }
      });
    }
    // Funde
    let reward = false;
    if (opened) {
      newLogs.forEach(() => { const it = L.rollDrop(r); if (it) { m.drops++; m.weekDrops[Math.floor(d / 7)]++; reward = true; if (L.ITEMS[it].rare) m.rare++; } });
      const nTodo = poisson(r, P.todos);
      for (let i = 0; i < nTodo; i++) {
        S.todos.push({ id: 't' + d + i, title: 'x', effort: 1 + Math.floor(r() * 2), skillId: S.skills[i % 3].id, doneAt: k, rolled: true });
        const it = L.rollDrop(r); if (it) { m.drops++; m.weekDrops[Math.floor(d / 7)]++; reward = true; if (L.ITEMS[it].rare) m.rare++; }
      }
      if (r() < P.journal) S.journal.push({ date: k, text: '…', weather: 'heiter' });
      // Check-in
      const inWin = h => h >= 5 && h < (WINDOW_ALLDAY ? 22 : L.C.CHECKIN_UNTIL_HOUR);
      if (inWin(hour) || inWin(hour2)) { m.ciOffered++; if (r() < P.checkin) { S.checkins[k] = { todoIds: [] }; m.ciDone++; } else S.checkins[k] = { skipped: true }; }
      else m.openOnlyOutsideWindow++;
    }
    // Ernte, Level, Serien
    const D = L.derive(S, k);
    S.habits.forEach(h => {
      const H = D.H[h.id], n = L.harvestsDue(h, H);
      if (n > 0 && opened) { m.harvests += n; m.weekHarv[Math.floor(d / 7)] += n; h.harvestStage = H.stage; reward = true; m.stageUps.push([P.habits[+h.id.slice(1)][0], H.stage, d + 1]); }
      if (!H.weekly && h.streakEnabled) {
        const was = prevStreak[h.id] || 0;
        if (was >= 1 && H.streak === 0) { m.streakBreaks++; if (was >= 3) m.visibleBreaks++; }
        prevStreak[h.id] = H.streak;
      }
    });
    if (D.char.l > prevChar && opened) { m.levelUps += D.char.l - prevChar; prevChar = D.char.l; reward = true; }
    for (const s of S.skills) { const l = D.levels[s.id].l; if (l > (prevSkillL[s.id] || 1) && opened) reward = true; prevSkillL[s.id] = l; }
    if (opened) {
      m.weekOpen[Math.floor(d / 7)]++; if (reward) m.weekReward[Math.floor(d / 7)]++;
      if (reward) { m.rewardDays++; drought = 0; if (m.firstRewardDay === null) m.firstRewardDay = d + 1; }
      else { drought++; m.maxDrought = Math.max(m.maxDrought, drought); }
    }
    // Abbruchrisiko
    let hz = P.churn0;
    const brokeToday = S.habits.some(h => h.streakEnabled && (prevStreak[h.id] === 0) && D.H[h.id].days[L.addDays(k, -1)] === 'missed' && !D.H[h.id].weekly);
    if (brokeToday) hz += P.lossSens * 0.12;
    if (opened) hz += P.rewardSens * 0.006 * Math.max(0, drought - 3);
    if (P.wantMore && d < 7) hz += 0.015;
    if (unopened >= 4) hz += 0.12;
    if (r() < hz) m.churnDay = d + 1;
  }
  const end = L.addDays(START, DAYS - 1);
  const D = L.derive(S, end), B = L.betaMetrics(S, end);
  m.retained = m.churnDay === null;
  m.strength = S.habits.map(h => D.H[h.id].s);
  m.stage = S.habits.map(h => D.H[h.id].stage);
  m.watered = S.habits.reduce((a, h) => a + Object.values(D.H[h.id].days).filter(v => v === 'watered').length, 0);
  m.missed = S.habits.reduce((a, h) => a + Object.values(D.H[h.id].days).filter(v => v === 'missed').length, 0);
  m.charL = D.char.l; m.totalXP = D.total;
  m.slots = L.slotsFor(D.char.l);
  m.suggestOff = S.habits.filter(h => D.H[h.id].suggestOff).length;
  m.held30 = B.cohorts.d30.held; m.elig30 = B.cohorts.d30.eligible;
  m.tinyShare = B.tiny.share; m.ciShare = B.checkins.share; m.returnShare = B.breaks.share; m.breaks = B.breaks.breaks;
  return m;
}

const mean = a => a.reduce((x, y) => x + y, 0) / (a.length || 1);
const pct = x => Math.round(x * 100);
const results = {};
for (const P of PERSONAS) {
  const runs = []; for (let i = 0; i < RUNS; i++) runs.push(runOnce(P, L.hashStr(P.id) + i * 7919));
  const ret = runs.filter(x => x.retained), all = runs;
  const surv = dd => all.filter(x => x.churnDay === null || x.churnDay > dd).length / all.length;
  const stageUps = {}; all.forEach(x => x.stageUps.forEach(([t, st, day]) => { (stageUps[st] = stageUps[st] || []).push(day); }));
  results[P.id] = {
    label: P.label,
    retainD7: surv(7), retainD14: surv(14), retainD30: surv(30),
    openShare: mean(all.map(x => x.openDays / (x.churnDay || DAYS))),
    actualRate: mean(ret.map(x => x.schedDone / Math.max(1, x.sched))),
    backfilled: mean(all.map(x => x.backfilled)),
    weekRewardShare: [0,1,2,3].map(w => { const a = all.filter(x => x.weekOpen[w] > 0); return a.length ? mean(a.map(x => x.weekReward[w] / x.weekOpen[w])) : null; }),
    weekDrops: [0,1,2,3].map(w => mean(ret.map(x => x.weekDrops[w]))), weekHarv: [0,1,2,3].map(w => mean(ret.map(x => x.weekHarv[w]))),
    churnMedianDay: (a => a.length ? a.sort((x,y)=>x-y)[Math.floor(a.length/2)] : null)(all.filter(x => x.churnDay).map(x => x.churnDay)),
    loggedOfActual: mean(all.map(x => x.logged / Math.max(1, x.actual))),
    unloggedPerUser: mean(all.map(x => x.unlogged)),
    repairs: mean(all.map(x => x.repairs)), repairBackfillShare: mean(all.filter(x => x.repairs).map(x => x.repairBackfill / x.repairs)),
    watered: mean(all.map(x => x.watered)), missed: mean(ret.map(x => x.missed)),
    visibleBreaks: mean(all.map(x => x.visibleBreaks)),
    strengthEnd: mean(ret.map(x => mean(x.strength))), maxStrengthEnd: Math.max(...ret.map(x => Math.max(...x.strength), 0)),
    stageDist: [0, 1, 2, 3, 4].map(s => mean(ret.map(x => x.stage.filter(v => v === s).length / x.stage.length))),
    charL: mean(ret.map(x => x.charL)), slots: mean(ret.map(x => x.slots)),
    drops: mean(ret.map(x => x.drops)), rare: mean(ret.map(x => x.rare)), harvests: mean(ret.map(x => x.harvests)),
    rewardDayShare: mean(ret.map(x => x.rewardDays / Math.max(1, x.openDays))), maxDrought: mean(all.map(x => x.maxDrought)),
    ciOfferedShare: mean(all.map(x => x.ciOffered / Math.max(1, x.openDays))), ciShareBeta: mean(ret.map(x => x.ciShare)),
    sleepOpenShare: mean(all.map(x => x.sleepOpens / Math.max(1, x.openDays))),
    tinyShare: mean(ret.map(x => x.tinyShare)), returnShare: mean(ret.filter(x => x.breaks).map(x => x.returnShare)),
    held30Share: mean(ret.map(x => x.elig30 ? x.held30 / x.elig30 : 0)),
    suggestOff: mean(ret.map(x => x.suggestOff)),
    wantMoreBlockedDays: mean(all.map(x => x.wantMoreBlockedDays)),
    stageDay: Object.fromEntries(Object.entries(stageUps).map(([s, a]) => [s, Math.round(mean(a))])),
    churnReasonsDays: all.filter(x => x.churnDay).map(x => x.churnDay)
  };
}
// Referenz: perfekter Nutzer (jeden Termin erledigt)
const perfect = (() => { let s = 0; const out = []; for (let i = 1; i <= 66; i++) { s = L.computeHabit ? s * (1 - L.C.EMA_A) + L.C.EMA_A : s; out.push(s); } return out; })();
const stageDayPerfect = L.STAGES.map(([t]) => perfect.findIndex(v => v >= t) + 1);
const lv = []; let tot = 0; for (let L2 = 1; L2 <= 8; L2++) { tot += L.charNeed(L2); lv.push(tot); }
console.log(JSON.stringify({ runs: RUNS, start: START, perfect30: perfect[29], perfect66: perfect[65], daysTo08: perfect.findIndex(v => v >= 0.8) + 1,
  stageDayPerfect, charXPcum: lv, results }, null, 1));
