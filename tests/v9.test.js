// Tests v9 „Hof-Tage und lebendige Welt“: Zählregel der Hof-Tage, Schwellen der 11 Entdeckungen, hofGesehen (überlebt Löschen),
// Import/Export alter Versionen, Einstellung effects und Stufen der Abhak-Rückmeldung, Wilmas Vorrang. Spielregeln unverändert.
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../src/logic.js');
const HX = require('../src/hilfe.js');

const T = '2026-11-06';
const hab = (id, logs = {}, extra = {}) => Object.assign(L.newHabit({ title: 'G' + id, anchor: 'dem Kaffee', tinyVersion: 'mini', frequency: { kind: 'daily' }, skillId: 's1', effort: 1 }, '2026-08-01', id), { logs }, extra);
const st = habits => Object.assign(L.emptyState('2026-08-01'), { onboarded: true, habits });
const days = (n, from = '2026-09-01') => [...Array(n)].map((_, i) => L.addDays(from, i));
const logsOf = (keys, v = 'done') => Object.fromEntries(keys.map(k => [k, v]));

test('Hof-Tage: erledigt und Mini zählen, nachgetragen auch', () => {
  const h = hab('a', { '2026-11-01': 'done', '2026-11-02': 'tiny' });
  L.logLate(h, '2026-11-05', 'done', T);
  assert.equal(L.hofTage(st([h]), T), 3);
});

test('Hof-Tage: Extra-Runde, Regentag, To-dos, Logbuch und Check-in zählen nicht', () => {
  const h = hab('a', { '2026-11-01': 'repaired' }, { streakEnabled: true });
  const s = st([h]);
  s.todos.push({ id: 't', title: 'x', effort: 1, skillId: 's1', doneAt: '2026-11-02' });
  s.journal.push({ date: '2026-11-03', weather: 'heiter', text: 'x' });
  s.checkins['2026-11-04'] = { weather: 'heiter', todos: [] };
  assert.equal(L.hofTage(s, T), 0);
  // Regentag („watered“) steht nie im Log, sondern wird abgeleitet: zählt also auch dann nicht, wenn er einen Tag rettet
  const r = hab('r', logsOf(days(8, '2026-10-20')), { streakEnabled: true, createdAt: '2026-10-20', history: [{ from: '2026-10-20', effort: 1, frequency: { kind: 'daily' } }] });
  assert.equal(L.computeHabit(r, '2026-10-29').days['2026-10-28'], 'watered');
  assert.equal(L.hofTage(st([r]), '2026-10-29'), 8);
});

test('Hof-Tage: mehrere Erledigungen am selben Tag zählen einmal', () => {
  const a = hab('a', { '2026-11-01': 'done', '2026-11-02': 'done' }), b = hab('b', { '2026-11-01': 'tiny', '2026-11-03': 'done' });
  assert.equal(L.hofTage(st([a, b]), T), 3);
});

test('Hof-Tage: pausierte und archivierte zählen, gelöschte nicht, Zukunft nicht', () => {
  const a = hab('a', { '2026-10-01': 'done' }), b = hab('b', { '2026-10-02': 'done' });
  L.pause(b, '2026-10-03');
  assert.ok(b.archivedAt);
  const s = st([a, b]);
  assert.equal(L.hofTage(s, T), 2);
  s.habits.splice(0, 1);
  assert.equal(L.hofTage(s, T), 1);
  assert.equal(L.hofTage(st([hab('c', { '2026-11-10': 'done' })]), T), 0);
});

test('Entdeckungen: genau 11 mit den Schwellen aus dem Auftrag, aufsteigend, je ein Satz', () => {
  assert.deepEqual(L.ENTDECKUNGEN.map(e => [e.id, e.schwelle]), [['schmetterlinge', 3], ['steg', 7], ['bienenwiese', 12], ['regenbogen', 15], ['eichhoernchen', 19],
    ['obstwiese', 23], ['gluehwuermchen', 27], ['gemuesegarten', 31], ['erntefest', 36], ['ruheecke', 42], ['hofschild', 50]]);
  L.ENTDECKUNGEN.forEach(e => { assert.ok(e.name && e.ort && e.art); assert.equal((e.satz.match(/[.!?]/g) || []).length <= 2, true); assert.ok(HX.words(e.satz) <= 20); });
});

test('Entdeckungen: Schwellen genau an der Grenze', () => {
  const at = n => L.entdeckungen(st([hab('a', logsOf(days(n)))]), T).filter(e => e.erreicht).map(e => e.id);
  assert.deepEqual(at(0), []);
  assert.deepEqual(at(2), []);
  assert.deepEqual(at(3), ['schmetterlinge']);
  assert.deepEqual(at(6), ['schmetterlinge']);
  assert.deepEqual(at(7), ['schmetterlinge', 'steg']);
  assert.equal(at(49).length, 10);
  assert.equal(at(50).length, 11);
  assert.equal(at(70).length, 11);
});

test('hofGesehen: Fehlt das Feld, gilt {}; Erreichtes ist neu, bis es gesehen ist', () => {
  const s = st([hab('a', logsOf(days(7)))]);
  let e = L.entdeckungen(s, T);
  assert.deepEqual(e.filter(x => x.neu).map(x => x.id), ['schmetterlinge', 'steg']);
  assert.deepEqual(L.markHofGesehen(s, ['schmetterlinge', 'steg', 'unbekannt'], T), ['schmetterlinge', 'steg']);
  assert.deepEqual(s.hofGesehen, { schmetterlinge: T, steg: T });
  assert.deepEqual(L.markHofGesehen(s, ['steg'], '2026-12-01'), [], 'ein gesetztes Datum bleibt');
  e = L.entdeckungen(s, T);
  assert.equal(e.filter(x => x.neu).length, 0);
  assert.equal(e.find(x => x.id === 'steg').gesehenAm, T);
});

test('hofGesehen: Gesehenes bleibt sichtbar, wenn die Gewohnheit gelöscht wird', () => {
  const s = st([hab('a', logsOf(days(12)))]);
  L.markHofGesehen(s, L.entdeckungen(s, T).filter(e => e.neu).map(e => e.id), T);
  s.habits = [];
  const e = L.entdeckungen(s, T);
  assert.equal(L.hofTage(s, T), 0);
  assert.deepEqual(e.filter(x => x.sichtbar).map(x => x.id), ['schmetterlinge', 'steg', 'bienenwiese']);
  assert.equal(e.filter(x => x.erreicht).length, 0);
});

test('Import: hofGesehen und effects bleiben erhalten, ungültige Werte fallen weg, ohne Feld unverändert', () => {
  const s = st([hab('a', logsOf(days(3)))]); s.rulesV6Since = '2026-08-01';
  const plain = JSON.parse(JSON.stringify(s));
  const r0 = L.importState(JSON.parse(JSON.stringify(plain)), T);
  assert.ok(r0.ok); assert.equal('hofGesehen' in r0.state, false); assert.equal('effects' in r0.state, false);
  assert.deepEqual(r0.state, plain, 'v8-Export ohne neue Felder lädt unverändert');
  const r1 = L.importState(Object.assign(JSON.parse(JSON.stringify(plain)), { hofGesehen: { steg: '2026-10-01' }, effects: 'ruhig' }), T);
  assert.deepEqual(r1.state.hofGesehen, { steg: '2026-10-01' }); assert.equal(r1.state.effects, 'ruhig'); assert.equal(r1.state.schema, 4);
  const r2 = L.importState(Object.assign(JSON.parse(JSON.stringify(plain)), { hofGesehen: [1], effects: 'laut' }), T);
  assert.ok(r2.ok); assert.equal('hofGesehen' in r2.state, false); assert.equal('effects' in r2.state, false);
});

test('Import: v3-, v5-, v7- und v8-Exporte laden, Hof-Tage aus den Logs', () => {
  const v3 = { v: 3, skills: [{ id: 's1', name: 'Körper', icon: 'boot', st: 0 }], habits: [{ id: 'a', title: 'Dehnen', anchor: 'dem Kaffee', tiny: 'eine', freq: { kind: 'daily' }, skillId: 's1', effort: 1, createdAt: '2026-10-01', log: logsOf(days(4, '2026-10-01')) }], todos: [], journal: [], inv: {}, placed: [] };
  const r3 = L.importState(v3, T); assert.ok(r3.ok); assert.equal(L.hofTage(r3.state, T), 4);
  const base = st([hab('a', logsOf(days(8)))]);
  const v5 = JSON.parse(JSON.stringify(base)); delete v5.rulesV6Since; v5.skills.forEach(x => delete x.buildingType); v5.habits.forEach(h => delete h.plantType);
  const v7 = JSON.parse(JSON.stringify(v5)); v7.rulesV6Since = '2026-08-01';
  const v8 = Object.assign(JSON.parse(JSON.stringify(base)), { theme: 'wald', accent: 'mint' });
  for (const [name, obj] of [['v5', v5], ['v7', v7], ['v8', v8]]) {
    const r = L.importState(obj, T); assert.ok(r.ok, name); L.migrateV8a(r.state);
    assert.equal(r.state.schema, 4, name); assert.equal(L.hofTage(r.state, T), 8, name);
    assert.deepEqual(L.entdeckungen(r.state, T).filter(e => e.erreicht).map(e => e.id), ['schmetterlinge', 'steg'], name);
  }
});

test('Hof-Tage ändern keine Spielregel: Stärke, XP und Funde wie vorher', () => {
  const h = hab('a', logsOf(days(10))), s = st([h]), before = JSON.stringify(L.derive(s, T));
  L.entdeckungen(s, T); L.markHofGesehen(s, ['schmetterlinge'], T);
  assert.equal(JSON.stringify(L.derive(s, T)), before);
  assert.equal(L.C.DROP_P, 0.12); assert.equal(L.C.RARE_P, 0.2);
});

test('effects: fehlt = normal, ruhig halbiert die Funken und lässt das Wippen weg', () => {
  assert.equal(L.effectsOf({}), 'normal'); assert.equal(L.effectsOf({ effects: 'ruhig' }), 'ruhig'); assert.equal(L.effectsOf({ effects: 'x' }), 'normal');
  assert.deepEqual(L.EFFECTS, ['ruhig', 'normal']);
  const n = L.rueckmeldung('erledigt'), r = L.rueckmeldung('erledigt', { effects: 'ruhig' });
  assert.equal(n.funken, 6); assert.equal(n.wippen, true); assert.equal(n.erde, true);
  assert.equal(r.funken, 3); assert.equal(r.wippen, false);
  assert.equal(L.rueckmeldung('mini', { effects: 'ruhig' }).funken, 1);
});

test('Rückmeldung: Stufen und Dauern, reduzierte Bewegung nur dunklere Erde', () => {
  const m = L.rueckmeldung('mini'), e = L.rueckmeldung('erledigt'), h = L.rueckmeldung('ernte'), f = L.rueckmeldung('fund');
  assert.deepEqual([m.funken, m.ms, m.erde], [3, 400, false]);
  assert.deepEqual([e.funken, e.ms], [6, 600]);
  assert.deepEqual([h.ms, h.wachsen, f.ms, f.truhe], [900, true, 900, true]);
  for (const s of ['mini', 'erledigt', 'ernte', 'fund']) {
    const x = L.rueckmeldung(s, { reduce: true });
    assert.deepEqual([x.funken, x.wippen, x.wachsen, x.truhe, x.erde], [0, false, false, false, true], s);
  }
});

test('Wilma: Neu entdeckt nach Check-in und vor Meilenstein, mehrere gebündelt', () => {
  const neu = L.ENTDECKUNGEN.slice(0, 1), zwei = L.ENTDECKUNGEN.slice(0, 3), ms = [{ id: 'm', text: 'Meilenstein' }];
  assert.equal(HX.pickHint({ late: [{ title: 'x', day: 'gestern' }], checkin: true, neu, milestones: ms }).kind, 'late');
  assert.equal(HX.pickHint({ checkin: true, neu, milestones: ms }).kind, 'checkin');
  const one = HX.pickHint({ neu, milestones: ms });
  assert.equal(one.kind, 'entdeckt'); assert.match(one.text, /Schmetterlinge/);
  const many = HX.pickHint({ neu: zwei, milestones: ms });
  assert.equal(many.kind, 'entdeckt'); assert.match(many.text, /3 neue Dinge/); assert.equal(many.items.length, 3);
  assert.equal(HX.pickHint({ neu: [], milestones: ms }).kind, 'milestone');
});
