// Ergänzende Tests v5: Formeln aus Leitfaden 3 und 4.1–4.5, Fundchancen und Beta-Metriken (9).
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../src/logic.js');

const T = '2026-11-01'; // Sonntag
const daily = { kind: 'daily' };
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);
function habit(o = {}) {
  const createdAt = o.createdAt || L.addDays(T, -99);
  return L.newHabit({ title: 'Dehnen', anchor: 'dem Kaffee', tinyVersion: 'Eine Übung', frequency: o.frequency || daily, skillId: 's1',
    effort: o.effort || 1, streakEnabled: o.streak !== false, remindersEnabled: o.rem !== false }, createdAt, o.id || 'h1');
}
const fill = (h, from, to, status = 'done') => { for (let k = from; k <= to; k = L.addDays(k, 1)) h.logs[k] = status; return h; };
const state = habits => { const s = L.emptyState(habits.reduce((a, h) => (h.createdAt < a ? h.createdAt : a), T)); s.onboarded = true; s.habits = habits; return s; };

/* ---------- 4.2 Stärke ---------- */
test('Stärke folgt exakt s = s·(1−a) + a·x mit a = 0,044', () => {
  const h = habit({ createdAt: '2026-10-27', streak: false });
  h.logs['2026-10-27'] = 'done'; h.logs['2026-10-29'] = 'tiny';                 // 28. und 30. verpasst, 31. offen? nein: Stichtag 31.
  let s = 0; for (const x of [1, 0, 1, 0]) s = s * (1 - 0.044) + 0.044 * x;
  near(L.computeHabit(h, '2026-10-31').s, s);                                    // heute (31.) zählt noch nicht als verpasst
});

test('Stärke: heute noch offen kostet nichts, Pflanze stirbt nie (Stufe ≥ 0)', () => {
  const h = habit({ createdAt: L.addDays(T, -200), streak: false }); fill(h, h.createdAt, L.addDays(T, -100));
  const d = L.computeHabit(h, T);
  assert.ok(d.s > 0 && d.stage >= 0); assert.equal(L.stageOf(0), 0);
  assert.equal(L.STAGES[L.stageOf(0.9)][1], 'Ausgewachsen'); assert.equal(L.STAGES[L.stageOf(0.899)][1], 'Blüte');
});

test('Regentag und nachgeholter Tag zählen für die Stärke voll', () => {
  const a = fill(habit({ createdAt: L.addDays(T, -10) }), L.addDays(T, -10), L.addDays(T, -1));
  const b = fill(habit({ createdAt: L.addDays(T, -10) }), L.addDays(T, -10), L.addDays(T, -1));
  b.logs[L.addDays(T, -3)] = 'repaired';
  const c = fill(habit({ createdAt: L.addDays(T, -10) }), L.addDays(T, -10), L.addDays(T, -1)); delete c.logs[L.addDays(T, -1)];
  const da = L.computeHabit(a, T), db = L.computeHabit(b, T), dc = L.computeHabit(c, T);
  near(da.s, db.s); assert.equal(dc.days[L.addDays(T, -1)], 'watered'); near(da.s, dc.s);
});

/* ---------- 4.2 Wochenziele anteilig ---------- */
test('Wochenziel anteilig bei Pause mitten in der Woche: ceil(N × aktive Tage / 7)', () => {
  const h = habit({ createdAt: '2026-10-12', frequency: { kind: 'weekly', timesPerWeek: 3 }, streak: false });
  L.pause(h, '2026-10-22'); L.resume(h, '2026-10-26');                          // Woche 19.–25.: Mo–Mi aktiv = 3 Tage → Ziel ceil(9/7) = 2
  ['2026-10-13', '2026-10-14', '2026-10-15', '2026-10-20', '2026-10-21'].forEach(k => h.logs[k] = 'done');
  const s1 = L.computeHabit(h, '2026-10-26').s;
  let s = 0; for (const x of [1, 1, 1, 1, 1]) s = s * (1 - 0.044) + 0.044 * x;    // Woche 1: 3/3, Woche 2: 2/2 → kein Abzug
  near(s1, s);
  assert.equal(L.computeHabit(h, '2026-10-26').streak, 2);
});

test('Wochenziel nicht erreicht: fehlende Termine kosten je einmal Stärke, Serie reißt', () => {
  const h = habit({ createdAt: '2026-10-19', frequency: { kind: 'weekly', timesPerWeek: 3 } });
  h.logs['2026-10-20'] = 'done';
  const d = L.computeHabit(h, '2026-10-26');
  let s = 0; for (const x of [1, 0, 0]) s = s * (1 - 0.044) + 0.044 * x;
  near(d.s, s); assert.equal(d.streak, 0);
});

/* ---------- 4.1 XP, Anti-Farming, Level ---------- */
test('XP: 10 × Aufwand, Mini 50 %, Nachholen ohne XP', () => {
  assert.equal(L.xpFor(1, 'done'), 10); assert.equal(L.xpFor(2, 'done'), 20); assert.equal(L.xpFor(3, 'done'), 30);
  assert.equal(L.xpFor(3, 'tiny'), 15); assert.equal(L.xpFor(3, 'repaired'), 0);
});

test('Anti-Farming: Einträge an nicht geplanten Tagen bringen keine XP', () => {
  const h = habit({ createdAt: '2026-10-26', frequency: { kind: 'weekdays', days: [1] } });   // nur montags
  fill(h, '2026-10-26', '2026-10-31');
  assert.equal(L.computeHabit(h, '2026-10-31').xp, 10);
});

test('Anti-Farming: Logs vor dem Anlegen und in Pausen zählen nicht', () => {
  const h = habit({ createdAt: '2026-10-20' }); h.logs['2026-10-10'] = 'done';
  fill(h, '2026-10-20', '2026-10-31'); L.pause(h, '2026-10-25'); h.pauses[0].to = '2026-10-28';
  assert.equal(L.computeHabit(h, '2026-10-31').xp, 10 * (5 + 4));                         // 20.–24. und 28.–31.
});

test('Level: mehrere Stufen auf einmal, Charakter-XP aus Gewohnheiten, To-dos und Logbuch', () => {
  assert.deepEqual(L.lvl(100 + 283 + 10, L.charNeed), { l: 3, into: 10, need: 520 });
  const h = fill(habit({ createdAt: L.addDays(T, -4), effort: 2 }), L.addDays(T, -4), T);
  const s = state([h]); s.todos = [{ id: 't', title: 'x', effort: 3, skillId: 's1', doneAt: T }, { id: 'u', title: 'y', effort: 3, skillId: 's1' }];
  s.journal = [{ date: T, text: 'a', weather: 'sonnig' }];
  const D = L.derive(s, T);
  assert.equal(D.sk.s1, 5 * 20 + 30); assert.equal(D.total, 130 + 10);
  assert.deepEqual(D.levels.s1, { l: 2, into: 80, need: 141 }); assert.equal(D.char.l, 2);
});

test('Bearbeiten: Frequenzwechsel gilt ab dem Tag, alte Termine bleiben', () => {
  const h = fill(habit({ createdAt: '2026-10-25' }), '2026-10-25', '2026-10-26');
  L.applyEdit(h, { title: h.title, anchor: h.anchor, tinyVersion: h.tinyVersion, frequency: { kind: 'weekdays', days: [3] }, skillId: 's1', effort: 1, streakEnabled: true, remindersEnabled: true }, '2026-10-27');
  assert.equal(h.history.length, 2); assert.equal(L.settingsAt(h, '2026-10-26').frequency.kind, 'daily');
  const d = L.computeHabit(h, T);
  assert.equal(d.days['2026-10-27'], 'off'); assert.equal(d.days['2026-10-28'], 'missed'); assert.equal(d.xp, 20);
});

/* ---------- 4.3 Serie, Regentage, Reparatur ---------- */
test('Regentage: höchstens 2, nur mit eingeschalteter Serie', () => {
  const h = fill(habit({ createdAt: L.addDays(T, -60) }), L.addDays(T, -60), L.addDays(T, -1));
  assert.equal(L.computeHabit(h, T).tokens, 2);
  const off = fill(habit({ createdAt: L.addDays(T, -20), streak: false }), L.addDays(T, -20), L.addDays(T, -2));
  assert.equal(L.computeHabit(off, T).days[L.addDays(T, -1)], 'missed');
});

test('Regentage: zwei Tage verpasst, beide gerettet, dritter reißt die Serie', () => {
  const h = fill(habit({ createdAt: L.addDays(T, -20) }), L.addDays(T, -20), L.addDays(T, -4));
  const d = L.computeHabit(h, T);
  assert.equal(d.days[L.addDays(T, -3)], 'watered'); assert.equal(d.days[L.addDays(T, -2)], 'watered'); assert.equal(d.days[L.addDays(T, -1)], 'missed');
  assert.equal(d.streak, 0); assert.equal(d.tokens, 0);
});

test('Reparatur nur innerhalb von 48 h und nur nach einer Erledigung heute', () => {
  const h = fill(habit({ createdAt: L.addDays(T, -3) }), L.addDays(T, -3), L.addDays(T, -2));
  assert.equal(L.computeHabit(h, T).canRepair, false);                          // heute noch nicht erledigt
  h.logs[T] = 'tiny'; assert.equal(L.computeHabit(h, T).canRepair, true);       // Mini zählt als Extra-Runde
  const late = habit({ createdAt: '2026-10-22', frequency: { kind: 'weekdays', days: [4, 0] } });   // Do und So
  ['2026-10-22', '2026-10-25', T].forEach(k => late.logs[k] = 'done');          // Do 29.10. verpasst, liegt 3 Tage zurück
  assert.equal(L.computeHabit(late, T).days['2026-10-29'], 'missed'); assert.equal(L.computeHabit(late, T).canRepair, false);
  const weekly = habit({ createdAt: '2026-10-19', frequency: { kind: 'weekly', timesPerWeek: 2 } }); weekly.logs[T] = 'done';
  assert.equal(L.computeHabit(weekly, T).canRepair, false);
});

test('Serie: Wochen-Gewohnheit zählt Wochen, laufende Woche zählt erst bei erreichtem Ziel', () => {
  const h = habit({ createdAt: '2026-10-19', frequency: { kind: 'weekly', timesPerWeek: 2 } });
  ['2026-10-20', '2026-10-22', '2026-10-27'].forEach(k => h.logs[k] = 'done');
  assert.equal(L.computeHabit(h, '2026-10-28').streak, 1);
  h.logs['2026-10-28'] = 'done'; assert.equal(L.computeHabit(h, '2026-10-28').streak, 2);
});

/* ---------- 4.5 Ausschleichen und Graduierung ---------- */
test('Ausschleichen: Vorschlag ab Stärke ≥ 0,8 und 14 Terminen in Folge', () => {
  const h = fill(habit({ createdAt: L.addDays(T, -40) }), L.addDays(T, -40), T);
  assert.equal(L.computeHabit(h, T).suggestOff, true);
  const short = fill(habit({ createdAt: L.addDays(T, -40) }), L.addDays(T, -40), T); delete short.logs[L.addDays(T, -5)]; short.streakEnabled = false;
  assert.equal(L.computeHabit(short, T).suggestOff, false);                     // Lauf nur 5
  const quiet = fill(habit({ createdAt: L.addDays(T, -40), rem: false }), L.addDays(T, -40), T);
  assert.equal(L.computeHabit(quiet, T).suggestOff, false);                     // Erinnerung schon aus
});

test('Graduierung: 30 Tage ohne Erinnerung und kräftig → gemeistert, bleibt gemeistert', () => {
  const h = fill(habit({ createdAt: '2026-08-01' }), '2026-08-01', '2026-10-01');
  h.remindersEnabled = false; h.remOffAt = '2026-09-01';
  assert.equal(L.computeHabit(h, '2026-09-30').graduated, false);               // erst 29 Tage
  const d = L.computeHabit(h, '2026-10-01');
  assert.equal(d.graduated, true); assert.equal(d.gradDate, '2026-10-01');
  const later = L.computeHabit(h, '2026-11-20');                                // danach lange nichts erledigt
  assert.ok(later.s < 0.8); assert.equal(later.graduated, true); assert.equal(later.gradDate, '2026-10-01');
  assert.equal(L.gradRewardDue(h, later), true); h.gradRewarded = true; assert.equal(L.gradRewardDue(h, later), false);
});

test('Graduierung: zu schwach oder Erinnerung wieder an → nicht gemeistert', () => {
  const weak = habit({ createdAt: '2026-09-01', rem: false });                  // Erinnerung von Anfang an aus, kaum erledigt
  ['2026-09-02', '2026-09-10'].forEach(k => weak.logs[k] = 'done');
  assert.equal(L.computeHabit(weak, T).graduated, false);
  const on = fill(habit({ createdAt: '2026-08-01' }), '2026-08-01', T);
  assert.equal(L.computeHabit(on, T).graduated, false);
});

/* ---------- 4.4 Funde ---------- */
test('Fundchancen: 12 % pro Erledigung, davon 20 % selten (2,4 % / 9,6 %)', () => {
  const o = L.dropOdds();
  near(o.any, 0.12); near(o.rare, 0.024); near(o.common, 0.096);
  assert.ok(o.rareItems.every(k => L.ITEMS[k].rare)); assert.ok(o.commonItems.every(k => !L.ITEMS[k].rare));
  const seq = vals => { let i = 0; return () => vals[i++]; };
  assert.equal(L.ITEMS[L.rollDrop(seq([0.119, 0.1, 0]))].rare, true);           // Fund, selten
  assert.equal(L.ITEMS[L.rollDrop(seq([0.119, 0.2, 0]))].rare, false);          // Fund, häufig
  assert.equal(L.rollDrop(seq([0.12])), null);
});

test('Ernte: jede neue Stufe einmal, nach Rückgang keine zweite Ernte', () => {
  const h = fill(habit({ createdAt: L.addDays(T, -40) }), L.addDays(T, -40), L.addDays(T, -20));
  h.harvestStage = L.computeHabit(h, L.addDays(T, -20)).stage;
  const d = L.computeHabit(h, T); assert.ok(d.stage <= h.harvestStage); assert.equal(L.harvestsDue(h, d), 0);
});

/* ---------- 3 Datenmodell ---------- */
test('Datenmodell: neue Gewohnheit speichert nur Eingaben, Anker ohne „nach“', () => {
  const h = L.newHabit({ title: ' Lesen ', anchor: 'Nach dem Essen', tinyVersion: ' 1 Seite ', frequency: daily, skillId: 's2', effort: 2, streakEnabled: true, remindersEnabled: false }, T, 'x');
  assert.equal(h.title, 'Lesen'); assert.equal(h.anchor, 'dem Essen'); assert.equal(h.tinyVersion, '1 Seite');
  assert.deepEqual(h.history, [{ from: T, effort: 2, frequency: daily }]); assert.deepEqual(h.logs, {}); assert.deepEqual(h.pauses, []);
  assert.equal(h.remOffAt, T); assert.equal(h.harvestStage, 0); assert.equal(h.gradRewarded, false);
  for (const k of ['strength', 'streak', 'tokens', 'xp', 'graduatedAt']) assert.equal(k in h, false);
});

test('Import: aktuelle Sicherung wird angenommen, fehlende Truhe ergänzt', () => {
  const s = state([habit()]); delete s.chest; const r = L.importState(JSON.parse(JSON.stringify(s)), T);
  assert.ok(r.ok); assert.deepEqual(r.state.chest, { items: {}, placed: [] });
  assert.equal(L.importState({ schema: 99 }, T).ok, false);
});

test('Farm schläft von 22 bis 6 Uhr', () => {
  assert.equal(L.farmSleeps(22), true); assert.equal(L.farmSleeps(5), true); assert.equal(L.farmSleeps(6), false); assert.equal(L.farmSleeps(21), false);
});

/* ---------- 9 Beta-Metriken ---------- */
test('Beta-Metriken: gehalten nach 30 Tagen, Mini-Anteil, Rückkehr nach Bruch, Check-in-Quote', () => {
  const kept = fill(habit({ createdAt: '2026-09-01', id: 'a' }), '2026-09-01', '2026-10-31');
  ['2026-09-05', '2026-09-06', '2026-09-07'].forEach(k => kept.logs[k] = 'tiny');
  const dropped = fill(habit({ createdAt: '2026-09-01', id: 'b', streak: false }), '2026-09-01', '2026-09-10');
  dropped.logs['2026-09-14'] = 'done';                                          // Bruch am 11., Rückkehr am 14. (3 Tage)
  const young = habit({ createdAt: '2026-10-20', id: 'c' });
  const s = state([kept, dropped, young]);
  s.startedAt = '2026-10-29'; s.checkins = { '2026-10-29': { todos: [] }, '2026-10-30': { skipped: true }, '2026-10-31': { todos: [], weather: 'sonnig' } };
  const m = L.betaMetrics(s, T);
  assert.deepEqual(m.cohorts.d30, { eligible: 2, held: 1, mastered: 0 });
  assert.deepEqual(m.cohorts.d66, { eligible: 0, held: 0, mastered: 0 });
  assert.equal(m.withAnchor, 3);
  assert.equal(m.tiny.tiny, 3); assert.equal(m.tiny.completions, 61 + 11);
  assert.equal(m.breaks.breaks, 2); assert.equal(m.breaks.returnedWithin7, 1); assert.equal(m.breaks.medianDays, 3);
  assert.deepEqual(m.checkins, { days: 4, opened: 3, done: 2, skipped: 1, share: 0.5 });
});
