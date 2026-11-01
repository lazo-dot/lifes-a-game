// Tests für die Spiellogik · Ausführen: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../src/logic.js');

const T = '2026-11-01'; // Sonntag
const daily = { kind: 'daily' };
function habit(o = {}) {
  const base = L.newHabit({ title: 'Dehnen', anchor: 'dem Kaffee', tinyVersion: 'Eine Übung', frequency: o.frequency || daily, skillId: 's1', effort: o.effort || 2, streakEnabled: o.streak !== false, remindersEnabled: o.rem !== false }, o.createdAt || L.addDays(T, -99), 'h1');
  if (o.createdAt) { base.createdAt = o.createdAt; base.history[0].from = o.createdAt; }
  return base;
}
const fill = (h, from, to, status = 'done') => { for (let k = from; k <= to; k = L.addDays(k, 1)) h.logs[k] = status; return h; };

test('Stärke: 66 konsequente Termine ergeben etwa 95 %', () => {
  const h = habit({ createdAt: L.addDays(T, -65) }); fill(h, h.createdAt, T);
  const d = L.computeHabit(h, T);
  assert.ok(d.s > 0.94 && d.s < 0.96, `Stärke ${d.s}`);
  assert.equal(d.stage, 4);
});

test('Stärke: ein verpasster Termin kostet etwa 4 %', () => {
  const h = habit({ createdAt: L.addDays(T, -40), streak: false }); fill(h, h.createdAt, L.addDays(T, -2));
  const before = L.computeHabit(h, L.addDays(T, -1)).s;  // gestern noch offen = kein Verlust
  const after = L.computeHabit(h, T).s;                    // gestern verpasst
  assert.ok(Math.abs((before - after) / before - 0.044) < 0.002);
});

test('Mini-Version zählt voll für Stärke und Serie, gibt 50 % XP', () => {
  const a = fill(habit({ createdAt: L.addDays(T, -9) }), L.addDays(T, -9), T, 'done');
  const b = fill(habit({ createdAt: L.addDays(T, -9) }), L.addDays(T, -9), T, 'tiny');
  const da = L.computeHabit(a, T), db = L.computeHabit(b, T);
  assert.equal(da.s, db.s); assert.equal(da.streak, db.streak);
  assert.equal(db.xp, da.xp / 2);
});

test('XP: 10 × Aufwand, Aufwandsänderung wirkt nur ab dem Änderungstag', () => {
  const h = habit({ createdAt: L.addDays(T, -3), effort: 1 }); fill(h, L.addDays(T, -3), L.addDays(T, -1));
  L.applyEdit(h, { title: h.title, anchor: h.anchor, tinyVersion: h.tinyVersion, frequency: daily, skillId: 's1', effort: 3, streakEnabled: true, remindersEnabled: true }, T);
  h.logs[T] = 'done';
  assert.equal(L.computeHabit(h, T).xp, 3 * 10 + 30);
});

test('Regentage: 1 Token je 7 Termine, maximal 2, retten automatisch', () => {
  const h = habit({ createdAt: L.addDays(T, -30) }); fill(h, h.createdAt, L.addDays(T, -2));
  let d = L.computeHabit(h, L.addDays(T, -1)); assert.equal(d.tokens, 2);
  d = L.computeHabit(h, T);                                   // gestern verpasst → Token
  assert.equal(d.tokens, 1); assert.equal(d.days[L.addDays(T, -1)], 'watered'); assert.ok(d.streak >= 29);
});

test('Ohne Token reißt die Serie, Reparatur innerhalb 48 h stellt sie wieder her', () => {
  const h = habit({ createdAt: L.addDays(T, -5) }); fill(h, h.createdAt, L.addDays(T, -2)); h.logs[T] = 'done';
  let d = L.computeHabit(h, T); assert.equal(d.streak, 1); assert.ok(d.canRepair);
  h.logs[d.repairKey] = 'repaired'; d = L.computeHabit(h, T);
  assert.equal(d.streak, 6); assert.equal(d.canRepair, false);
});

test('Nach einem Bruch bleibt die Jahreszahl erhalten', () => {
  const h = habit({ createdAt: '2026-10-01', streak: false }); fill(h, '2026-10-01', '2026-10-20');
  assert.equal(L.computeHabit(h, T).year, 20); assert.equal(L.computeHabit(h, T).streak, 0);
});

test('Wochen-Gewohnheit: XP und Stärke nur bis zum Wochenziel (Anti-Farming)', () => {
  const h = habit({ createdAt: '2026-10-26', frequency: { kind: 'weekly', timesPerWeek: 2 }, effort: 1 }); fill(h, '2026-10-26', '2026-10-30');
  const d = L.computeHabit(h, '2026-10-31');
  assert.equal(d.weekCnt, 2); assert.equal(d.xp, 20); assert.equal(d.due, false);
});

test('Wochen-Gewohnheit: Stärke pro Termin, angebrochene erste Woche anteilig (A11)', () => {
  const h = habit({ createdAt: '2026-10-31', frequency: { kind: 'weekly', timesPerWeek: 2 } }); // Samstag: 2 aktive Tage
  h.logs['2026-10-31'] = 'done';
  const d = L.computeHabit(h, '2026-11-02');                    // Woche abgeschlossen, Ziel anteilig = 1
  assert.ok(Math.abs(d.s - 0.044) < 1e-9, `Stärke ${d.s}`);
  const full = habit({ createdAt: '2026-10-19', frequency: { kind: 'weekly', timesPerWeek: 2 } }); full.logs['2026-10-20'] = 'done';
  const s = L.computeHabit(full, '2026-10-27').s;               // 1 von 2 → einmal 1, einmal 0
  assert.ok(Math.abs(s - 0.044 * (1 - 0.044)) < 1e-9);
});

test('Wochentage: nicht geplante Tage zählen nicht als verpasst', () => {
  const h = habit({ createdAt: '2026-10-26', frequency: { kind: 'weekdays', days: [1, 3, 5] } });
  ['2026-10-26', '2026-10-28', '2026-10-30'].forEach(k => h.logs[k] = 'done');
  const d = L.computeHabit(h, T);
  assert.equal(d.streak, 3); assert.equal(d.days['2026-10-27'], 'off'); assert.equal(d.due, false);
});

test('Pausieren friert die Gewohnheit ein, Fortsetzen zählt ab dann weiter', () => {
  const h = habit({ createdAt: '2026-10-20' }); fill(h, '2026-10-20', '2026-10-24');
  L.pause(h, '2026-10-25'); const paused = L.computeHabit(h, T);
  assert.equal(paused.paused, true); assert.equal(paused.due, false); assert.equal(paused.streak, 5);
  L.resume(h, T); const d = L.computeHabit(h, T);
  assert.equal(d.paused, false); assert.equal(d.due, true); assert.equal(h.archivedAt, undefined);
});

test('Level-Kurven nach Leitfaden', () => {
  assert.equal(L.charNeed(1), 100); assert.equal(L.charNeed(4), 800); assert.equal(L.skillNeed(2), 141);
  assert.deepEqual(L.lvl(250, L.charNeed), { l: 2, into: 150, need: 283 });
  assert.equal(L.unitsToNext({ into: 100, need: 141 }, 2), 3);
});

test('Ernte: neue Wachstumsstufe genau einmal (Hochwassermarke)', () => {
  const h = habit({ createdAt: L.addDays(T, -15) }); fill(h, h.createdAt, T);
  const d = L.computeHabit(h, T); assert.equal(d.stage, 2); assert.equal(L.harvestsDue(h, d), 2);
  h.harvestStage = d.stage; assert.equal(L.harvestsDue(h, d), 0);
});

test('Funde: 12 % Chance, sonst nichts', () => {
  assert.equal(L.rollDrop(() => 0.5), null);
  assert.ok(L.ITEMS[L.rollDrop(() => 0.05)]);
});

test('Onboarding: höchstens 3 aktive Gewohnheiten in der ersten Woche', () => {
  const s = L.emptyState('2026-10-28'); s.habits = [1, 2, 3].map(i => Object.assign(habit(), { id: 'h' + i }));
  assert.equal(L.canAddHabit(s, T).ok, false); assert.equal(L.canAddHabit(s, T).unlockOn, '2026-11-04');
  assert.equal(L.canAddHabit(s, '2026-11-04').ok, true);
  L.pause(s.habits[0], T); assert.equal(L.canAddHabit(s, T).ok, true);
});

test('Eingaben: Anker und Mini-Version sind Pflicht', () => {
  const miss = L.validateHabitInput({ title: 'Lesen', anchor: ' ', tinyVersion: '', frequency: daily, effort: 2 });
  assert.deepEqual(miss, ['nach welcher Routine', 'eine Mini-Version']);
  assert.equal(L.cleanAnchor('Nach dem Essen'), 'dem Essen');
});

test('Erntekalender: Jahresraster mit 7 Zeilen und Status pro Tag', () => {
  const s = L.emptyState(T); const h = habit({ createdAt: '2026-10-29' }); h.logs['2026-10-29'] = 'done'; h.logs['2026-10-30'] = 'tiny'; s.habits = [h];
  const D = L.derive(s, T), g = L.yearGrid(s, D, h.id, '2026', T);
  assert.equal(g.cells.length % 7, 0);
  const at = k => g.cells.find(c => c.k === k).v;
  assert.equal(at('2026-10-29'), 'done'); assert.equal(at('2026-10-30'), 'tiny'); assert.equal(at('2026-10-31'), 'empty'); assert.equal(at('2026-12-01'), 'future');
  assert.equal(L.yearGrid(s, D, null, '2026', T).cells.find(c => c.k === '2026-10-29').v, 1);
});

test('Import: v3-Daten werden migriert, kaputte Daten abgelehnt', () => {
  const v3 = { v: 3, skills: [{ id: 's1', name: 'A', icon: 'boot', st: 0 }], habits: [{ id: 'x', title: 'T', anchor: 'a', tiny: 'b', freq: { kind: 'weekly', n: 2 }, skillId: 's1', effort: 1, streak: false, rem: true, createdAt: '2026-10-01', log: { '2026-10-02': 'done' } }], todos: [], journal: [], inv: { bench: 1 }, placed: [] };
  const r = L.importState(v3, T);
  assert.ok(r.ok); assert.equal(r.state.habits[0].frequency.timesPerWeek, 2); assert.equal(r.state.habits[0].tinyVersion, 'b'); assert.equal(r.state.chest.items.bench, 1);
  assert.equal(L.importState({ schema: 4, habits: 'kaputt' }, T).ok, false);
  assert.equal(L.importState(null, T).ok, false);
});

test('Check-in nur einmal am Tag, nur vormittags bis 14 Uhr', () => {
  const s = L.emptyState(T); s.onboarded = true; s.habits = [habit()];
  assert.equal(L.needsCheckin(s, T, 8), true); assert.equal(L.needsCheckin(s, T, 15), false);
  s.checkins[T] = { weather: 'sonnig' }; assert.equal(L.needsCheckin(s, T, 8), false);
  assert.equal(L.currentWeather(s, T, null), 'sonnig');
});
