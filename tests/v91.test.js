// Tests v9.1 „Wege finden“: Wilmas einzeilige Hinweise (Feld `zeile` neben dem vollen Satz `text`), Erklärung „Heute“ nennt den Weg über das Info-Blatt.
// Keine Spielregeln betroffen.
const test = require('node:test');
const assert = require('node:assert/strict');
const HX = require('../src/hilfe.js');

test('v9.1: jeder Hinweis mit Ziel hat eine kurze Zeile, der volle Satz bleibt unverändert', () => {
  const late = [{ id: 't1', k: '2026-11-24', title: '10 Minuten lesen', day: 'gestern' }];
  const x = HX.pickHint({ late, checkin: true });
  assert.equal(x.kind, 'late');
  assert.equal(x.text, 'Gestern ist bei „10 Minuten lesen“ noch nichts eingetragen.');
  assert.equal(x.zeile, 'Gestern noch offen: 10 Minuten lesen');
  assert.ok(x.zeile.length < x.text.length);
  const ci = HX.pickHint({ checkin: true });
  assert.equal(ci.kind, 'checkin'); assert.ok(ci.zeile && HX.words(ci.zeile) <= 6);
  const neu = HX.pickHint({ neu: [{ id: 'steg', name: 'Steg am Teich' }] });
  assert.equal(neu.zeile, 'Neu auf deinem Hof: Steg am Teich'); assert.equal(neu.zeile, neu.text);
});

test('v9.1: Meilenstein nimmt seine Zeile, ohne eigene Zeile den vollen Satz; Sprüche bleiben ohne Zeile', () => {
  const m = HX.pickHint({ milestones: [{ id: 'unlock', text: 'Eine Woche geschafft! Magst du noch etwas pflanzen?', zeile: 'Eine Woche geschafft! Noch etwas pflanzen?' }] });
  assert.equal(m.kind, 'milestone'); assert.equal(m.zeile, 'Eine Woche geschafft! Noch etwas pflanzen?');
  assert.equal(HX.pickHint({ milestones: [{ id: 'x', text: 'Nur Text.' }] }).zeile, 'Nur Text.');
  assert.equal(HX.pickHint({ sayings: ['A'] }).zeile, undefined);
});

test('v9.1: Erklärung „Heute“ nennt Abhaken im Info-Blatt und bleibt unter 60 Wörtern', () => {
  const x = HX.explain('heute');
  assert.match(x.text, /abhaken/); assert.match(x.text, /pausieren/); assert.ok(HX.words(x.text) <= HX.MAX_WORDS);
});
