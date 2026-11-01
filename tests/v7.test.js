// Tests v7: Hilfsfunktion für die Anzeige (U8). Die Spielregeln selbst ändern sich in v7 nicht.
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../src/logic.js');

const T = '2026-11-01';
const daily = { kind: 'daily' };
const habit = (o = {}) => L.newHabit({ title: 'Lesen', anchor: 'dem Abendessen', tinyVersion: 'Eine Seite', frequency: o.frequency || daily, skillId: 's1',
  effort: 1, streakEnabled: o.streak !== false, remindersEnabled: true }, o.createdAt || L.addDays(T, -20), 'h1');
const fill = (h, from, to) => { for (let k = from; k <= to; k = L.addDays(k, 1)) h.logs[k] = 'done'; return h; };

test('U8: Nachtragen auf einen Regentag gibt den Regentag zurück', () => {
  const h = fill(habit(), L.addDays(T, -20), L.addDays(T, -2)), y = L.addDays(T, -1);
  const before = L.computeHabit(h, T);
  assert.equal(before.days[y], 'watered'); assert.equal(before.tokens, 1);
  assert.equal(L.freesRainDay(h, y, T), true);
  L.logLate(h, y, 'done', T);
  const after = L.computeHabit(h, T);
  assert.equal(after.days[y], 'done'); assert.equal(after.tokens, before.tokens + 1); assert.equal(after.streak, before.streak + 1);
});

test('U8: kein Hinweis, wenn kein Regentag verbraucht wurde oder Nachtragen nicht geht', () => {
  const plain = fill(habit({ streak: false }), L.addDays(T, -20), L.addDays(T, -2));
  assert.equal(L.computeHabit(plain, T).days[L.addDays(T, -1)], 'missed'); assert.equal(L.freesRainDay(plain, L.addDays(T, -1), T), false);
  const old = fill(habit(), L.addDays(T, -20), L.addDays(T, -4));
  assert.equal(L.computeHabit(old, T).days[L.addDays(T, -3)], 'watered'); assert.equal(L.freesRainDay(old, L.addDays(T, -3), T), false);   // älter als 48 h
});

test('U8: Test-Hof – gestern bei „10 Minuten lesen“ Regentag verbraucht, Nachtragen gibt ihn zurück', () => {
  const { execFileSync } = require('node:child_process');
  const s = JSON.parse(execFileSync(process.execPath, [require.resolve('../tools/ux/testhof.js')], { encoding: 'utf8' }));
  const today = L.dkey(new Date()), y = L.addDays(today, -1), read = s.habits.find(h => h.title === '10 Minuten lesen');
  assert.equal(L.importState(JSON.parse(JSON.stringify(s)), today).ok, true);
  assert.equal(L.computeHabit(read, today).days[y], 'watered');
  assert.equal(L.freesRainDay(read, y, today), true);
});
