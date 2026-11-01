/* 72-Tage-Simulation mit der echten Spiellogik von v5 (src/logic.js).
 * Basis = Prototyp v5. Optimierungen aus simulation-30-tage.md als zuschaltbare Varianten:
 *   backfill  Befund 1: gestern/vorgestern nachtragen (48 h); Funde nur für Eintragungen am selben Tag
 *   path      Befund 2: sichtbarer Weg zu „Gemeistert“ (Etappen als Belohnungsmomente) + Erinnerung freiwillig ab Stärke 0,6
 *   stage     Befund 3: Zwischenstufe „Knospe“ bei 0,75 + Wochenernte (Wochenziel erreicht)
 *   rhythm    Befund 4: Check-in bei erster Öffnung des eigenen Tages, Farm-Schlaf nach eigenem Rhythmus
 *   anchors   Befund 5: mehrere Anker (Schichtwechsel hebelt Anker kaum noch aus)
 *   seed      Befund 6: „Saatgut“-Liste statt harter Grenze in Woche 1
 *   grad      Befund 8 (72 Tage): Ausschleichen ab Stärke 0,6 und 12 von 14 Terminen (Regentag/nachgeholt zählen),
 *             „Gemeistert“ = 30 Tage ohne Erinnerung mit ≥ 70 % der Termine (statt Stärke ≥ 0,8 + 14 in Folge)
 * Aufruf: OPT=all node sim/sim72.js 300   |   OPT=backfill,path node sim/sim72.js 300
 */
const L = require('../../src/logic.js');
const PERSONAS = require('./personas.js');
const START = '2026-11-02', DAYS = +process.env.DAYS || 72, RUNS = +process.argv[2] || 300;
const OPTS = new Set((process.env.OPT || '').split(',').filter(Boolean));
if (OPTS.has('all')) ['backfill', 'path', 'stage', 'rhythm', 'anchors', 'seed'].forEach(o => OPTS.add(o));
const on = o => OPTS.has(o);

// Bereitschaft, die Erinnerung abzuschalten, wenn die App es vorschlägt (Annahme)
const REM_OFF = { studentin: 0.6, vater: 0.6, pflege: 0.5, rentner: 0.45, entwickler: 0.8, selbstfuersorge: 0.6, perfektionistin: 0.45, azubi: 0.5, gelegenheit: 0.6, sportlerin: 0.7 };
function share(H, h, from, to) {            // Anteil gehaltener Termine im Zeitraum (Regentag/nachgeholt/Mini zählen)
  if (H.weekly) { let n = 0; for (const k in H.days) if (k >= from && k <= to && (H.days[k] === 'done' || H.days[k] === 'tiny')) n++;
    return n / Math.max(1, H.N * (L.daysBetween(from, to) + 1) / 7); }
  let p = 0, o = 0; for (let k = from; k <= to; k = L.addDays(k, 1)) { const v = H.days[k]; if (!v || v === 'off') continue; p++; if (v !== 'missed') o++; } return p ? o / p : 0;
}
const OPT_STAGES = [0.15, 0.35, 0.6, 0.75, 0.9];            // mit Zwischenstufe „Knospe“
const poisson = (r, mean) => { let k = 0, p = Math.exp(-mean), s = p; const u = r(); while (u > s && k < 20) { k++; p *= mean / k; s += p; } return k; };

function runOnce(P, seed) {
  const r = L.rng(seed);
  const S = L.emptyState(START); S.onboarded = true;
  P.habits.forEach(([title, frequency, effort, streak], i) => {
    S.habits.push(L.newHabit({ title, anchor: 'Nach dem Frühstück', tinyVersion: 'Mini', frequency, effort, streakEnabled: streak,
      remindersEnabled: true, skillId: S.skills[i % 3].id }, START, 'h' + i));
  });
  const W = Math.ceil(DAYS / 7), z = () => Array(W).fill(0);
  const m = { churnDay: null, openDays: 0, sched: 0, schedDone: 0, actual: 0, logged: 0, unlogged: 0, backfilled: 0,
    repairs: 0, repairBackfill: 0, drops: 0, rare: 0, harvests: 0, milestones: 0, weekHarvests: 0, levelUps: 0,
    rewardDays: 0, maxDrought: 0, visibleBreaks: 0, ciOffered: 0, ciDone: 0, sleepBlocked: 0,
    remOffDay: [], gradDay: [], weekOpen: z(), weekReward: z(), weekHarv: z() };
  let sickLeft = 0, drought = 0, unopened = 0, prevChar = 1, prevSkillL = {}, prevStreak = {}, shiftOff = 0, pendingWeekHarvest = false;
  const actualDone = {}, optStage = {}, mile = {}, remOffAt = {};

  for (let d = 0; d < DAYS; d++) {
    const k = L.addDays(START, d), wd = L.weekday(k), weekend = wd === 0 || wd === 6, w = Math.floor(d / 7);
    if (m.churnDay !== null) continue;
    if (sickLeft > 0) sickLeft--; else if (r() < P.sick * (P.travel && wd === 1 ? 4 : 1)) sickLeft = 2 + Math.floor(r() * 4);
    let adh = P.adh * (weekend ? P.weekend : 1) * (sickLeft > 0 ? 0.25 : 1);
    if (P.lowSpells && r() < 0.25) adh *= 0.4;
    if (P.shift) { if (d % 3 === 0) shiftOff = Math.floor(r() * 3); if (shiftOff !== 0) adh *= on('anchors') ? 0.92 : 0.7; }
    const novelty = P.openFloor + (1 - P.openFloor) * Math.exp(-d / P.tau);
    const opened = r() < P.open * novelty * (sickLeft > 0 ? 0.6 : 1);
    const hours = [P.hours[Math.floor(r() * P.hours.length)], P.hours[Math.floor(r() * P.hours.length)]];
    if (opened) { m.openDays++; m.weekOpen[w]++; unopened = 0; } else unopened++;
    if (opened && !on('rhythm') && L.farmSleeps(hours[0])) m.sleepBlocked++;

    const D0 = L.derive(S, k), newLogs = [];
    S.habits.forEach(h => {
      const H = D0.H[h.id];
      const hadh = adh * (remOffAt[h.id] ? 0.97 : 1);                // ohne Erinnerung minimal weniger (Annahme)
      let act = null;
      if (H.weekly) {
        const left = 7 - ((wd + 6) % 7), need = Math.max(0, H.N - H.weekCnt);
        if (need > 0 && r() < Math.min(1, (need / left) * 1.3) * (hadh / P.adh) * Math.min(1, P.adh + 0.1)) act = 'done';
        else if (need > 0 && r() < P.tiny * 0.3) act = 'tiny';
      } else if (L.isScheduled(h, k)) {
        m.sched++;
        if (r() < hadh) act = 'done'; else if (r() < P.tiny) act = 'tiny';
        if (act) m.schedDone++;
      } else return;
      if (!act) return;
      m.actual++; actualDone[h.id + k] = act;
      if (opened && r() < (P.lowLogging ? 0.85 : 0.96)) { h.logs[k] = act; m.logged++; newLogs.push(h); } else m.unlogged++;
    });
    if (on('backfill') && opened) {
      S.habits.forEach(h => { for (const back of [1, 2]) { const kb = L.addDays(k, -back); if (kb < START) continue;
        if (actualDone[h.id + kb] && !h.logs[kb] && r() < 0.8) { h.logs[kb] = actualDone[h.id + kb]; m.backfilled++; m.unlogged--; m.logged++; } } });
    }
    let reward = false;
    if (opened) {
      const D1 = L.derive(S, k);
      S.habits.forEach(h => {
        const H = D1.H[h.id];
        if (H.canRepair && r() < P.repair) { if (actualDone[h.id + H.repairKey]) m.repairBackfill++; h.logs[H.repairKey] = 'repaired'; m.repairs++; }
        // Ausschleichen: Vorschlag der App (v5: Stärke ≥ 0,8 & 14 in Folge; Variante path: freiwillig ab 0,6 & 14)
        const offer = on('grad')
          ? h.remindersEnabled && !H.paused && H.age >= 14 && H.s >= 0.6 && share(H, h, L.addDays(k, -13), k) >= 12 / 14
          : on('path') ? h.remindersEnabled && !H.paused && H.run >= 14 && H.s >= 0.6
          : H.suggestOff;                                              // Regel der App (v5: 0,8 + 14 in Folge; ab v6 laut Leitfaden 1.5)
        if (offer && r() < REM_OFF[P.id] * 0.35) {                       // nimmt den Vorschlag irgendwann an (pro Tag)
          h.remindersEnabled = false; h.remOffAt = k; remOffAt[h.id] = k; m.remOffDay.push(d + 1);
          if (on('path')) { m.milestones++; reward = true; }
        }
      });
      newLogs.forEach(() => { const it = L.rollDrop(r); if (it) { m.drops++; reward = true; if (L.ITEMS[it].rare) m.rare++; } });
      const nTodo = poisson(r, P.todos * (0.6 + 0.4 * novelty));
      for (let i = 0; i < nTodo; i++) {
        S.todos.push({ id: 't' + d + i, title: 'x', effort: 1 + Math.floor(r() * 2), skillId: S.skills[i % 3].id, doneAt: k, rolled: true });
        const it = L.rollDrop(r); if (it) { m.drops++; reward = true; if (L.ITEMS[it].rare) m.rare++; }
      }
      if (r() < P.journal * (0.6 + 0.4 * novelty)) S.journal.push({ date: k, text: '…', weather: 'heiter' });
      const inWin = hr => hr >= 5 && hr < L.C.CHECKIN_UNTIL_HOUR;
      if (on('rhythm') || inWin(hours[0]) || inWin(hours[1])) { m.ciOffered++; if (r() < P.checkin) { S.checkins[k] = { todoIds: [] }; m.ciDone++; } else S.checkins[k] = { skipped: true }; }
      if (pendingWeekHarvest) { pendingWeekHarvest = false; m.weekHarvests++; reward = true; }
    }
    const D = L.derive(S, k);
    S.habits.forEach(h => {
      const H = D.H[h.id];
      // Ernte: v5-Stufen über die Logik; Variante stage zusätzlich „Knospe“ bei 0,75
      if (opened) {
        if (on('stage')) {
          const st = OPT_STAGES.filter(t => H.s >= t).length;
          if (st > (optStage[h.id] || 0)) { const n = st - (optStage[h.id] || 0); m.harvests += n; m.weekHarv[w] += n; optStage[h.id] = st; reward = true; }
        } else {
          const n = L.harvestsDue(h, H); if (n > 0) { m.harvests += n; m.weekHarv[w] += n; h.harvestStage = H.stage; reward = true; }
        }
        if (!on('grad') && L.gradRewardDue(h, H)) { h.gradRewarded = true; m.drops++; m.rare++; reward = true; }
        // Variante path: Etappen auf dem Weg zu „Gemeistert“
        if (on('path') && !mile[h.id + 'w3'] && H.age >= 21 && L.heldAt(h, k)) { mile[h.id + 'w3'] = 1; m.milestones++; reward = true; }
      }
      const gradNow = on('grad') ? (!!remOffAt[h.id] && L.daysBetween(remOffAt[h.id], k) >= 30 && share(H, h, L.addDays(k, -29), k) >= 0.7) : H.graduated;
      if (on('grad') && gradNow && !mile[h.id + 'g'] && opened) { m.drops++; m.rare++; reward = true; }
      if (gradNow && !mile[h.id + 'g']) { mile[h.id + 'g'] = 1; m.gradDay.push(d + 1); if (on('path')) m.milestones++; }
      if (!H.weekly && h.streakEnabled) { const was = prevStreak[h.id] || 0; if (was >= 3 && H.streak === 0) m.visibleBreaks++; prevStreak[h.id] = H.streak; }
    });
    // Wochenernte am Sonntag: alle Wochenziele bzw. ≥ 70 % der Termine geschafft → beim nächsten Öffnen
    if (on('stage') && wd === 0) {
      const ok = S.habits.every(h => { const H = D.H[h.id]; if (H.weekly) return H.weekCnt >= H.N;
        let p = 0, o = 0; for (let i = 0; i < 7; i++) { const v = H.days[L.addDays(k, -i)]; if (!v || v === 'off') continue; p++; if (v !== 'missed') o++; } return p === 0 || o / p >= 0.7; });
      if (ok) pendingWeekHarvest = true;
    }
    if (D.char.l > prevChar && opened) { m.levelUps += D.char.l - prevChar; prevChar = D.char.l; reward = true; }
    for (const s of S.skills) { const l = D.levels[s.id].l; if (l > (prevSkillL[s.id] || 1) && opened) reward = true; prevSkillL[s.id] = l; }
    if (opened) { if (reward) { m.rewardDays++; m.weekReward[w]++; drought = 0; } else { drought++; m.maxDrought = Math.max(m.maxDrought, drought); } }
    let hz = P.churn0;
    const brokeToday = S.habits.some(h => h.streakEnabled && !D.H[h.id].weekly && prevStreak[h.id] === 0 && D.H[h.id].days[L.addDays(k, -1)] === 'missed');
    if (brokeToday) hz += P.lossSens * 0.12;
    if (opened) hz += P.rewardSens * 0.006 * Math.max(0, drought - 3);
    if (P.wantMore && d < 7 && !on('seed')) hz += 0.015;
    if (unopened >= 4) hz += 0.12;
    if (r() < hz) m.churnDay = d + 1;
  }
  const end = L.addDays(START, DAYS - 1), D = L.derive(S, end), B = L.betaMetrics(S, end);
  Object.assign(m, {
    retained: m.churnDay === null, strength: S.habits.map(h => D.H[h.id].s), stage: S.habits.map(h => D.H[h.id].stage),
    charL: D.char.l, remOff: S.habits.filter(h => !h.remindersEnabled).length, graduated: S.habits.filter(h => mile[h.id + 'g']).length,
    held30: B.cohorts.d30.held / Math.max(1, B.cohorts.d30.eligible), held66: B.cohorts.d66.eligible ? B.cohorts.d66.held / B.cohorts.d66.eligible : null,
    mastered66: B.cohorts.d66.eligible ? B.cohorts.d66.mastered / B.cohorts.d66.eligible : null, ciShare: B.checkins.share
  });
  return m;
}

const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const results = {};
for (const P of PERSONAS) {
  const all = []; for (let i = 0; i < RUNS; i++) all.push(runOnce(P, L.hashStr(P.id) + i * 7919));
  const ret = all.filter(x => x.retained), surv = dd => all.filter(x => x.churnDay === null || x.churnDay > dd).length / all.length;
  const W = Math.ceil(DAYS / 7);
  results[P.id] = {
    label: P.label, n: all.length, nRet: ret.length,
    retain: { d7: surv(7), d14: surv(14), d30: surv(30), d66: surv(66), d72: surv(72) },
    actualRate: mean(all.map(x => x.schedDone / Math.max(1, x.sched))),
    loggedOfActual: mean(all.map(x => x.logged / Math.max(1, x.actual))), unlogged: mean(all.map(x => x.unlogged)),
    strengthEnd: mean(ret.map(x => mean(x.strength))), stageDist: [0, 1, 2, 3, 4].map(s => mean(ret.map(x => x.stage.filter(v => v === s).length / 3))),
    held30: mean(ret.map(x => x.held30)), held66: mean(ret.filter(x => x.held66 !== null).map(x => x.held66)),
    mastered66: mean(ret.filter(x => x.mastered66 !== null).map(x => x.mastered66)),
    remOffPerUser: mean(ret.map(x => x.remOff)), graduatedPerUser: mean(ret.map(x => x.graduated)),
    anyGraduated: ret.length ? ret.filter(x => x.graduated > 0).length / ret.length : null,
    firstRemOffDay: mean(all.filter(x => x.remOffDay.length).map(x => Math.min(...x.remOffDay))),
    firstGradDay: mean(all.filter(x => x.gradDay.length).map(x => Math.min(...x.gradDay))),
    repairs: mean(all.map(x => x.repairs)), repairBackfill: mean(all.filter(x => x.repairs).map(x => x.repairBackfill / x.repairs)),
    visibleBreaks: mean(all.map(x => x.visibleBreaks)),
    drops: mean(ret.map(x => x.drops)), harvests: mean(ret.map(x => x.harvests)), milestones: mean(ret.map(x => x.milestones)), weekHarvests: mean(ret.map(x => x.weekHarvests)),
    charL: mean(ret.map(x => x.charL)), rewardShare: mean(all.map(x => x.rewardDays / Math.max(1, x.openDays))),
    weekRewardShare: Array.from({ length: W }, (_, w) => mean(all.filter(x => x.weekOpen[w] > 0).map(x => x.weekReward[w] / x.weekOpen[w]))),
    weekHarv: Array.from({ length: W }, (_, w) => mean(ret.map(x => x.weekHarv[w]))),
    ciOffered: mean(all.map(x => x.ciOffered / Math.max(1, x.openDays))), ciShare: mean(ret.map(x => x.ciShare)),
    sleepBlocked: mean(all.map(x => x.sleepBlocked / Math.max(1, x.openDays))),
    churnMedian: (a => a.length ? a.sort((p, q) => p - q)[Math.floor(a.length / 2)] : null)(all.filter(x => x.churnDay).map(x => x.churnDay))
  };
}
console.log(JSON.stringify({ days: DAYS, runs: RUNS, opts: [...OPTS], results }, null, 1));
