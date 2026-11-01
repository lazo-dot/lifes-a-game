// Tests v6 (Leitfaden v1.5): Nachtragen, erreichbare Graduierung, verzeihende Zähler, Migration von v5-Daten.
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../src/logic.js');

const T = '2026-11-01'; // Sonntag
const daily = { kind: 'daily' };
function habit(o = {}) {
  return L.newHabit({ title: 'Dehnen', anchor: 'dem Kaffee', tinyVersion: 'Eine Übung', frequency: o.frequency || daily, skillId: 's1',
    effort: o.effort || 1, streakEnabled: o.streak !== false, remindersEnabled: o.rem !== false }, o.createdAt || L.addDays(T, -99), o.id || 'h1');
}
const fill = (h, from, to, status = 'done') => { for (let k = from; k <= to; k = L.addDays(k, 1)) h.logs[k] = status; return h; };
const clone = x => JSON.parse(JSON.stringify(x));

/* ---------- Nachtragen ---------- */
test('Nachtragen: nur gestern und vorgestern, nicht heute, nicht älter, nicht vor dem Anlegen', () => {
  const h = habit({ createdAt: L.addDays(T, -10) });
  assert.equal(L.canLogLate(h, L.addDays(T, -1), T), true);
  assert.equal(L.canLogLate(h, L.addDays(T, -2), T), true);
  assert.equal(L.canLogLate(h, L.addDays(T, -3), T), false);
  assert.equal(L.canLogLate(h, T, T), false);
  const young = habit({ createdAt: L.addDays(T, -1) });
  assert.equal(L.canLogLate(young, L.addDays(T, -2), T), false);
  assert.deepEqual(L.lateDays(young, T), [{ k: L.addDays(T, -1), status: null, late: false }]);
  assert.equal(L.logLate(h, L.addDays(T, -3), 'done', T), false); assert.equal(h.logs[L.addDays(T, -3)], undefined);
});

test('Nachtragen: nicht an pausierten oder nicht geplanten Tagen, nicht über einen Eintrag vom selben Tag', () => {
  const p = habit({ createdAt: L.addDays(T, -10) }); L.pause(p, L.addDays(T, -2));
  assert.equal(L.canLogLate(p, L.addDays(T, -1), T), false);
  const wd = habit({ createdAt: L.addDays(T, -10), frequency: { kind: 'weekdays', days: [5] } });        // nur freitags
  assert.equal(L.canLogLate(wd, '2026-10-31', T), false); assert.equal(L.canLogLate(wd, '2026-10-30', T), true);
  const same = habit({ createdAt: L.addDays(T, -10) }); same.logs[L.addDays(T, -1)] = 'tiny';
  assert.equal(L.canLogLate(same, L.addDays(T, -1), T), false);
  assert.equal(L.logLate(same, L.addDays(T, -1), 'done', T), false); assert.equal(same.logs[L.addDays(T, -1)], 'tiny');
});

test('Nachtragen: Wochen-Gewohnheit nicht über das Wochenziel hinaus', () => {
  const h = habit({ createdAt: '2026-10-19', frequency: { kind: 'weekly', timesPerWeek: 2 } });
  h.logs['2026-10-26'] = 'done';
  assert.equal(L.canLogLate(h, '2026-10-31', T), true);
  L.logLate(h, '2026-10-31', 'done', T);
  assert.equal(L.canLogLate(h, '2026-10-30', T), false);                       // Woche voll
  assert.equal(L.canLogLate(h, '2026-10-31', T), true);                        // eigener Nachtrag bleibt zurücknehmbar
});

test('Nachtragen zählt voll für Stärke, Serie, XP und Ernte wie eine Eintragung am selben Tag', () => {
  const ontime = fill(habit({ createdAt: L.addDays(T, -15), effort: 2 }), L.addDays(T, -15), T);
  const late = fill(habit({ createdAt: L.addDays(T, -15), effort: 2 }), L.addDays(T, -15), L.addDays(T, -3)); late.logs[T] = 'done';
  assert.equal(L.logLate(late, L.addDays(T, -2), 'done', T), true);
  assert.equal(L.logLate(late, L.addDays(T, -1), 'tiny', T), true); ontime.logs[L.addDays(T, -1)] = 'tiny';
  const a = L.computeHabit(ontime, T), b = L.computeHabit(late, T);
  assert.equal(b.s, a.s); assert.equal(b.streak, a.streak); assert.equal(b.xp, a.xp); assert.equal(b.run, a.run);
  assert.equal(L.harvestsDue(late, b), L.harvestsDue(ontime, a));
  assert.deepEqual(late.lateLogs, { [L.addDays(T, -2)]: true, [L.addDays(T, -1)]: true });
});

test('Nachtragen: zweites Tippen nimmt zurück, Mini und erledigt lassen sich tauschen', () => {
  const h = habit({ createdAt: L.addDays(T, -10) }), k = L.addDays(T, -1);
  L.logLate(h, k, 'done', T); assert.equal(h.logs[k], 'done');
  L.logLate(h, k, 'tiny', T); assert.equal(h.logs[k], 'tiny'); assert.equal(L.isLate(h, k), true);
  L.logLate(h, k, 'tiny', T); assert.equal(h.logs[k], undefined); assert.equal(L.isLate(h, k), false);
  assert.equal(L.logLate(h, k, 'repaired', T), false);                          // nur erledigt oder Mini
});

test('Nachtragen würfelt keinen Fund; am selben Tag höchstens einmal pro Gewohnheit', () => {
  const h = habit({ createdAt: L.addDays(T, -10) });
  L.logLate(h, L.addDays(T, -1), 'done', T);
  assert.equal(L.dropAllowed(h, L.addDays(T, -1), T), false);
  assert.equal(L.dropAllowed(h, T, T), true);
  h.rolled = T; assert.equal(L.dropAllowed(h, T, T), false);
});

test('Nachtragen ersetzt die Extra-Runde: der Tag ist danach nicht mehr verpasst', () => {
  const h = fill(habit({ createdAt: L.addDays(T, -3) }), L.addDays(T, -3), L.addDays(T, -2)); h.logs[T] = 'done';
  assert.equal(L.computeHabit(h, T).canRepair, true);
  L.logLate(h, L.addDays(T, -1), 'done', T);
  const d = L.computeHabit(h, T); assert.equal(d.canRepair, false); assert.equal(d.streak, 4);
});

test('Erntekalender markiert nachgetragene Tage', () => {
  const s = L.emptyState(T), h = habit({ createdAt: '2026-10-28' }); s.habits = [h];
  h.logs['2026-10-29'] = 'done'; L.logLate(h, '2026-10-30', 'tiny', T);
  const g = L.yearGrid(s, L.derive(s, T), h.id, '2026', T), at = k => g.cells.find(c => c.k === k);
  assert.equal(at('2026-10-30').v, 'tiny'); assert.equal(at('2026-10-30').late, true); assert.equal(at('2026-10-29').late, false);
});

/* ---------- Verzeihende Zähler ---------- */
test('Regentag und nachgeholter Tag setzen run nicht mehr zurück', () => {
  const w = fill(habit({ createdAt: L.addDays(T, -20) }), L.addDays(T, -20), T); delete w.logs[L.addDays(T, -5)];
  const dw = L.computeHabit(w, T);
  assert.equal(dw.days[L.addDays(T, -5)], 'watered'); assert.equal(dw.run, 21);
  const r = fill(habit({ createdAt: L.addDays(T, -20), streak: true }), L.addDays(T, -20), T); r.logs[L.addDays(T, -5)] = 'repaired';
  assert.equal(L.computeHabit(r, T).run, 21);
  const m = fill(habit({ createdAt: L.addDays(T, -20), streak: false }), L.addDays(T, -20), T); delete m.logs[L.addDays(T, -5)];
  assert.equal(L.computeHabit(m, T).run, 5);                                     // echter Ausfall ohne Regentag: neu zählen
});

/* ---------- Ausschleichen ---------- */
test('Ausschleichen: 11 von 14 reichen nicht, Stärke unter 0,6 auch nicht', () => {
  const h = fill(habit({ createdAt: L.addDays(T, -40), streak: false }), L.addDays(T, -40), T);
  [-2, -6, -9].forEach(i => delete h.logs[L.addDays(T, i)]);
  let d = L.computeHabit(h, T); assert.equal(d.held14, 11); assert.equal(d.suggestOff, false);
  h.logs[L.addDays(T, -9)] = 'done'; d = L.computeHabit(h, T); assert.equal(d.held14, 12); assert.equal(d.suggestOff, true);
  const young = fill(habit({ createdAt: L.addDays(T, -13) }), L.addDays(T, -13), T);
  d = L.computeHabit(young, T); assert.equal(d.held14, 14); assert.ok(d.s < 0.6); assert.equal(d.suggestOff, false);
});

test('Ausschleichen: Regentage und Nachgeholtes zählen als gehalten, heute zählt nur, wenn erledigt', () => {
  const h = fill(habit({ createdAt: L.addDays(T, -40) }), L.addDays(T, -40), L.addDays(T, -1));
  delete h.logs[L.addDays(T, -3)]; h.logs[L.addDays(T, -6)] = 'repaired';
  const d = L.computeHabit(h, T);
  assert.equal(d.of14, 14); assert.equal(d.held14, 14); assert.equal(d.suggestOff, true);
});

test('Ausschleichen: Wochen-Gewohnheit braucht das Wochenziel der letzten zwei Wochen', () => {
  const h = habit({ createdAt: '2026-05-04', frequency: { kind: 'weekly', timesPerWeek: 2 } });
  for (let w = '2026-05-04'; w < '2026-10-26'; w = L.addDays(w, 7)) { h.logs[w] = 'done'; h.logs[L.addDays(w, 2)] = 'done'; }
  assert.equal(L.computeHabit(h, T).suggestOff, true);
  delete h.logs['2026-10-21']; assert.equal(L.computeHabit(h, T).suggestOff, false);   // vorletzte Woche nur 1 von 2
});

/* ---------- Graduierung ---------- */
function graduating(heldDays, opts = {}) {      // Erinnerung aus am 01.09., davor kräftig; danach heldDays der ersten 30 Tage erledigt
  const h = fill(habit({ createdAt: '2026-06-01', streak: false }), '2026-06-01', '2026-09-01');
  h.remindersEnabled = false; h.remOffAt = '2026-09-01';
  for (let i = 1; i <= 30; i++) { const k = L.addDays('2026-09-01', i); if (i > 30 - heldDays) h.logs[k] = 'done'; }
  if (opts.after) fill(h, '2026-10-02', opts.after);
  return h;
}
test('Gemeistert (v6): 30 Tage ohne Erinnerung mit mindestens 70 % gehaltenen Terminen', () => {
  const ok = graduating(21), d = L.computeHabit(ok, '2026-10-01');
  assert.equal(d.graduated, true); assert.equal(d.gradDate, '2026-10-01');
  assert.equal(L.computeHabit(ok, '2026-09-30').graduated, false);                // erst 29 Tage ohne Erinnerung
  const low = graduating(20); assert.equal(L.computeHabit(low, '2026-10-01').graduated, false);   // 66,7 %
});

test('Gemeistert (v6) auch ohne Stärke 0,8: 75 % über längere Zeit genügen', () => {
  const h = habit({ createdAt: '2026-07-01', streak: false, rem: false });       // jeden vierten Tag Pause, Stärke pendelt um 0,75
  for (let k = '2026-07-01'; k <= '2026-09-30'; k = L.addDays(k, 1)) if (L.daysBetween('2026-07-01', k) % 4 !== 3) h.logs[k] = 'done';
  const d = L.computeHabit(h, '2026-09-30');
  assert.ok(d.s < 0.8, `Stärke ${d.s}`); assert.equal(d.graduated, true); assert.equal(d.gradDate, '2026-07-31');
});

test('Gemeistert bleibt dauerhaft, auch wenn danach alles liegen bleibt', () => {
  const h = graduating(21), d = L.computeHabit(h, '2026-12-31');
  assert.equal(d.graduated, true); assert.equal(d.gradDate, '2026-10-01');
});

test('Gemeistert: späterer Tag, sobald die 30-Tage-Spanne die 70 % erreicht', () => {
  const h = graduating(20, { after: '2026-10-05' });
  assert.equal(L.computeHabit(h, '2026-10-05').gradDate, '2026-10-02');
});

test('Gemeistert: Regentage, Nachgeholtes und Mini zählen; Wochentage nur geplante Termine', () => {
  const h = graduating(18); h.streakEnabled = true;                              // Regentage füllen Lücken
  for (const i of [1, 2, 3]) h.logs[L.addDays('2026-09-01', i)] = 'tiny';
  h.logs[L.addDays('2026-09-01', 5)] = 'repaired';
  const d = L.computeHabit(h, '2026-10-01');
  assert.ok(L.heldShare(h, d.days, '2026-09-02', '2026-10-01') >= 0.7); assert.equal(d.graduated, true);
  const wd = habit({ createdAt: '2026-08-03', frequency: { kind: 'weekdays', days: [1, 3, 5] }, rem: false });
  for (let k = '2026-08-03'; k <= '2026-09-30'; k = L.addDays(k, 1)) if ([1, 3, 5].includes(L.weekday(k))) wd.logs[k] = 'done';
  const dw = L.computeHabit(wd, '2026-09-30'); assert.equal(dw.graduated, true); assert.equal(dw.gradDate, '2026-09-02');
});

test('Gemeistert: Wochen-Gewohnheit gegen das anteilige Wochenziel', () => {
  const h = habit({ createdAt: '2026-08-31', frequency: { kind: 'weekly', timesPerWeek: 2 }, rem: false });
  for (let w = '2026-08-31'; w <= '2026-10-12'; w = L.addDays(w, 7)) { h.logs[w] = 'done'; h.logs[L.addDays(w, 1)] = 'done'; }
  const d = L.computeHabit(h, '2026-10-15');
  assert.equal(d.graduated, true); assert.equal(d.gradDate, '2026-09-30');
  const half = habit({ createdAt: '2026-08-31', frequency: { kind: 'weekly', timesPerWeek: 2 }, rem: false });
  for (let w = '2026-08-31'; w <= '2026-10-12'; w = L.addDays(w, 7)) half.logs[w] = 'done';
  assert.equal(L.computeHabit(half, '2026-10-15').graduated, false);
});

test('Erinnerung wieder eingeschaltet: keine laufende Graduierung', () => {
  const h = graduating(30); h.remindersEnabled = true; h.remOffAt = null;
  assert.equal(L.computeHabit(h, '2026-10-01').graduated, false);
});

/* ---------- Migration v5 → v6 ---------- */
function v5State() {      // Stand, wie ihn v5 speichert: kein lateLogs, kein rulesV6Since
  const s = L.emptyState('2026-10-25'); delete s.rulesV6Since; s.onboarded = true;
  const a = fill(habit({ createdAt: '2026-10-25', id: 'a' }), '2026-10-25', '2026-10-31'); a.harvestStage = 1; a.rolled = '2026-10-31';
  const b = habit({ createdAt: '2026-10-27', id: 'b', frequency: { kind: 'weekly', timesPerWeek: 3 } }); b.logs['2026-10-28'] = 'tiny';
  const c = habit({ createdAt: '2026-10-26', id: 'c' }); c.logs['2026-10-27'] = 'repaired'; L.pause(c, '2026-10-29');
  s.habits = [a, b, c];
  s.todos = [{ id: 't', title: 'Steuer', effort: 2, skillId: 's2', doneAt: '2026-10-30', rolled: true }];
  s.journal = [{ date: '2026-10-30', weather: 'regen', text: 'ok' }]; s.checkins = { '2026-10-31': { todos: [], weather: 'sonnig' } };
  s.chest = { items: { bench: 1 }, placed: [{ itemId: 'lantern', slot: 0 }] }; s.textScale = 1.15; s.palette = 'cb';
  return s;
}
test('Migration: v5-Daten bleiben unverändert, nur der Stichtag rulesV6Since kommt dazu', () => {
  const saved = v5State(), raw = clone(saved);
  const r = L.importState(clone(saved), T);
  assert.equal(r.ok, true); assert.equal(r.migrated, true); assert.equal(r.state.rulesV6Since, T);
  const { rulesV6Since, ...rest } = r.state; assert.deepEqual(rest, raw);
  assert.ok(r.state.habits.every(h => !('lateLogs' in h)));
  const again = L.importState(clone(r.state), L.addDays(T, 5));
  assert.equal(again.migrated, false); assert.equal(again.state.rulesV6Since, T);  // Stichtag wandert nicht mit
});

test('Migration: Stärke, Serie, XP, Level und Kalender rechnen mit v5-Daten wie bisher', () => {
  const s = v5State(), D5 = L.derive(s, T), r = L.importState(clone(s), T), D6 = L.derive(r.state, T);
  for (const id of ['a', 'b', 'c']) {
    for (const k of ['s', 'streak', 'tokens', 'xp', 'stage', 'year', 'weekCnt', 'paused']) assert.deepEqual(D6.H[id][k], D5.H[id][k], `${id}.${k}`);
    assert.deepEqual(D6.H[id].days, D5.H[id].days);
  }
  assert.equal(D6.total, D5.total); assert.deepEqual(D6.char, D5.char);
});

test('Migration: unter v5 Gemeistertes bleibt gemeistert, auch wenn die 70-%-Regel es nicht träfe', () => {
  // 10 Tage ausgefallen, dann 20 erledigt: Stärke ≥ 0,8 am 30. Tag (v5 ja), aber nur 66,7 % gehalten (v6 nein)
  const h = fill(habit({ createdAt: '2026-06-01', streak: false }), '2026-06-01', '2026-09-01');
  h.remindersEnabled = false; h.remOffAt = '2026-09-01'; fill(h, '2026-09-12', '2026-10-01');
  assert.ok(L.computeHabit(h, '2026-10-01').s >= 0.8);
  assert.equal(L.computeHabit(h, '2026-10-01', '2026-10-20').gradDate, '2026-10-01');   // Update kam danach: v5-Regel gilt
  assert.equal(L.computeHabit(h, '2026-10-01', '2026-09-15').graduated, false);          // Update kam vorher: nur v6-Regel
  fill(h, '2026-10-02', '2026-10-02');
  assert.equal(L.computeHabit(h, '2026-10-02', '2026-09-15').gradDate, '2026-10-02');    // 21 von 30 → v6
});

test('Neuer Hof: v6-Regeln ab dem ersten Tag, Beta-Zahlen nennen den Stichtag', () => {
  const s = L.emptyState(T); assert.equal(s.rulesV6Since, T);
  assert.equal(L.betaMetrics(s, T).rulesSince, T);
  const r = L.importState(clone(v5State()), '2026-11-03'); assert.equal(L.betaMetrics(r.state, '2026-11-05').rulesSince, '2026-11-03');
});
