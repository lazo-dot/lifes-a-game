// Tests v8a: Sprite-Sheets, Stufen für Gebäude und Pflanzen, Migration v7 → v8a, ganzzahlige Skalierung. Spielregeln unverändert.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const L = require('../src/logic.js');
const SH = require('../src/sheets.js');

const T = '2026-11-02';
const SPR = path.join(__dirname, '..', 'public', 'sprites');
const readSheet = n => JSON.parse(fs.readFileSync(path.join(SPR, n + '.json'), 'utf8'));
const clone = o => JSON.parse(JSON.stringify(o));

/* ---------- Loader ---------- */
test('Loader: Ebenen base/glow/shadow, Frame-Tags und Fußpunkt aus dem Aseprite-Export', () => {
  const sh = SH.parseSheet(readSheet('gebaeude-muehle'), 'gebaeude-muehle');
  assert.deepEqual(sh.layers, ['base', 'glow', 'shadow']);
  assert.deepEqual(sh.tags, ['stufe-1', 'stufe-2', 'stufe-3', 'stufe-4']);
  assert.deepEqual(sh.anchor, { x: 24, y: 47 }); assert.equal(sh.platzhalter, true);
  assert.deepEqual(sh.rect('base', 'stufe-3'), { x: 96, y: 0, w: 48, h: 48, ox: 0, oy: 0 });
  assert.deepEqual(sh.rect('glow', 'stufe-4'), { x: 144, y: 48, w: 48, h: 48, ox: 0, oy: 0 });
  assert.equal(Math.round(sh.opacity.shadow * 100), 30);
  assert.equal(sh.rect('base', 'stufe-9'), null);
  const p = SH.parseSheet(readSheet('pflanzen-beere'));
  assert.deepEqual(p.tags, ['keim', 'setzling', 'jungpflanze', 'bluete', 'ausgewachsen', 'gemeistert']);
  assert.deepEqual(p.anchor, { x: 8, y: 15 });
});

test('Loader: alle Exporte in public/sprites sind gültig, Index und Karte passen zusammen', () => {
  const idx = JSON.parse(fs.readFileSync(path.join(SPR, 'index.json'), 'utf8')).sheets;
  assert.ok(idx.length >= 15);
  for (const n of idx) { const sh = SH.parseSheet(readSheet(n), n); assert.ok(fs.existsSync(path.join(SPR, sh.image)), n); assert.ok(sh.layers.includes('base')); }
  for (const b of L.BUILDINGS) assert.ok(idx.includes('gebaeude-' + b), b);
  for (const p of L.PLANTS) { assert.ok(idx.includes('pflanzen-' + p), p); assert.deepEqual(SH.parseSheet(readSheet('pflanzen-' + p)).tags.slice(0, 5), L.PLANT_FRAMES); }
  const map = JSON.parse(fs.readFileSync(path.join(SPR, 'hof-karte.json'), 'utf8'));
  assert.ok(map.gebaeude.length >= L.C.MAX_SKILLS); assert.ok(map.beete.length * 3 >= L.C.MAX_BEDS); assert.equal(map.deko.length, 12);
  for (const z of map.zonen) for (const ref of (z.teile || []).concat((z.fest || []).map(f => f[0]))) {
    const [sheet, tag] = ref.split(':'); assert.ok(SH.parseSheet(readSheet(sheet)).tags.includes(tag), ref);
  }
});

test('Loader: getrimmte Frames behalten ihren Versatz, Exporte ohne Ebenen-Namen gelten als base', () => {
  const sh = SH.parseSheet({ frames: [{ filename: 'x 0', frame: { x: 5, y: 6, w: 10, h: 8 }, trimmed: true, spriteSourceSize: { x: 3, y: 8, w: 10, h: 8 }, sourceSize: { w: 16, h: 16 } }], meta: { frameTags: [{ name: 'a', from: 0, to: 0 }] } });
  assert.deepEqual(sh.rect('base', 'a'), { x: 5, y: 6, w: 10, h: 8, ox: 3, oy: 8 });
  assert.deepEqual(sh.anchor, { x: 8, y: 15 });          // ohne meta.anchor: unten Mitte
  assert.throws(() => SH.parseSheet({ frames: [{ filename: 'x (glow) 0', frame: { x: 0, y: 0, w: 1, h: 1 } }], meta: {} }), /base/);
  assert.throws(() => SH.parseSheet({ nope: 1 }));
});

test('Loader: fehlende oder kaputte Dateien führen zum Rückfall (Sheet bzw. Karte fehlt), nie zu einem Fehler', async () => {
  const files = { 'sprites/index.json': { sheets: ['ok', 'fehlt', 'kaputt', 'ohnebild'] }, 'sprites/ok.json': readSheet('pflanzen-blume'), 'sprites/kaputt.json': { frames: 'x' }, 'sprites/ohnebild.json': readSheet('pflanzen-beere') };
  const deps = {
    getJSON: async u => { if (!(u in files)) throw new Error('404 ' + u); return clone(files[u]); },
    loadImage: async src => { if (!src.endsWith('pflanzen-blume.png')) throw new Error('Bild fehlt'); return { src }; }
  };
  const r = await SH.load('sprites/', deps);
  assert.deepEqual(r, { sheets: 1, map: false });
  assert.ok(SH.get('ok')); for (const n of ['fehlt', 'kaputt', 'ohnebild']) assert.equal(SH.get(n), null);
  assert.equal(SH.map(), null);                           // ohne Karte zeichnet die Szene mit dem bisherigen Code
  assert.equal(SH.draw(null, null, 'base', 'keim', 0, 0), false);
  const none = await SH.load('leer/', { getJSON: async () => { throw new Error('offline'); }, loadImage: async () => { throw new Error('x'); } });
  assert.equal(none.map, false);
});

/* ---------- Stufen ---------- */
test('Gebäude-Ausbaustufe aus dem Skill-Level: 1–2 → 1, 3–5 → 2, 6–9 → 3, ab 10 → 4', () => {
  const exp = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 2, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4, 11: 4, 25: 4 };
  for (const [lv, st] of Object.entries(exp)) assert.equal(L.buildingStage(+lv), st, 'Level ' + lv);
});

test('Pflanzenbild aus der Wachstumsstufe: keim … ausgewachsen, gemeistert bleibt; schwächere Stärke zeigt die kleinere Stufe', () => {
  assert.deepEqual([0, 1, 2, 3, 4].map(i => L.plantFrame(i, false)), ['keim', 'setzling', 'jungpflanze', 'bluete', 'ausgewachsen']);
  // Abbildung über die Stärke (Leitfaden STAGES): Grenzen 0,15 · 0,35 · 0,6 · 0,9
  const at = s => L.plantFrame(L.stageOf(s), false);
  assert.deepEqual([0, .149, .15, .349, .35, .599, .6, .899, .9, 1].map(at), ['keim', 'keim', 'setzling', 'setzling', 'jungpflanze', 'jungpflanze', 'bluete', 'bluete', 'ausgewachsen', 'ausgewachsen']);
  assert.equal(at(.5), 'jungpflanze'); assert.equal(at(.3), 'setzling');   // sinkt die Stärke, wird die Pflanze kleiner, verschwindet aber nie
  assert.equal(L.plantFrame(0, true), 'gemeistert'); assert.equal(L.plantFrame(2, true), 'gemeistert');
  assert.equal(L.plantFrame(-1, false), 'keim'); assert.equal(L.plantFrame(9, false), 'ausgewachsen');
});

/* ---------- Migration ---------- */
function v7State() {      // Stand, wie ihn v7 speichert: kein buildingType, kein plantType
  const s = L.emptyState('2026-10-20'); s.onboarded = true; s.skills.forEach(x => delete x.buildingType);
  s.skills.push({ id: 's4', name: 'Musik', icon: 'note', st: 4 }, { id: 's5', name: 'Geld', icon: 'coin', st: 5 }, { id: 's6', name: 'Eigenes', icon: 'unbekannt', st: 0 });
  const h = i => L.newHabit({ title: 'G' + i, anchor: 'dem Kaffee', tinyVersion: 'klein', frequency: { kind: 'daily' }, skillId: 's1', effort: 1, streakEnabled: true, remindersEnabled: true }, '2026-10-20', 'h' + i);
  s.habits = [0, 1, 2, 3, 4].map(h); s.habits[0].logs['2026-10-21'] = 'done'; s.textScale = 1.15; s.lateLogs = undefined;
  return JSON.parse(JSON.stringify(s));
}
test('Migration v7 → v8a: Gebäude nach Symbol, Pflanzen reihum, sonst bleibt alles gleich', () => {
  const raw = v7State(), s = clone(raw);
  assert.equal(L.migrateV8a(s), true);
  assert.deepEqual(s.skills.map(x => x.buildingType), ['muehle', 'archiv', 'schmiede', 'musikpavillon', 'kontor', 'scheune']);
  assert.deepEqual(s.habits.map(h => h.plantType), ['beere', 'blume', 'kuerbis', 'baeumchen', 'beere']);
  const strip = o => { const c = clone(o); c.skills.forEach(x => delete x.buildingType); c.habits.forEach(h => delete h.plantType); return c; };
  assert.deepEqual(strip(s), raw);
  assert.equal(L.migrateV8a(s), false);                    // zweiter Lauf ändert nichts
  const D7 = L.derive(raw, T), D8 = L.derive(s, T);       // Regeln unverändert
  assert.equal(D8.total, D7.total); assert.deepEqual(D8.levels, D7.levels); assert.deepEqual(D8.H.h0.days, D7.H.h0.days);
});

test('Migration: Symbol-Zuordnung für alle Gebäude, eigene Wahl bleibt erhalten', () => {
  const map = { boot: 'muehle', book: 'archiv', flower: 'gewaechshaus', crate: 'schmiede', heart: 'gemeinschaftshaus', note: 'musikpavillon', pan: 'backhaus', coin: 'kontor', x: 'scheune' };
  for (const [icon, b] of Object.entries(map)) assert.equal(L.suggestBuilding(icon), b);
  const s = v7State(); s.skills[0].buildingType = 'backhaus'; s.habits[2].plantType = 'blume'; s.skills[1].buildingType = 'gibtsnicht';
  L.migrateV8a(s);
  assert.equal(s.skills[0].buildingType, 'backhaus'); assert.equal(s.habits[2].plantType, 'blume'); assert.equal(s.skills[1].buildingType, 'archiv');
});

test('Import: alte Exporte (v7, v5, v3) lassen sich weiter importieren und bekommen Typen; neue Exporte bleiben im Schema 4', () => {
  const r7 = L.importState(clone(v7State()), T); assert.equal(r7.ok, true); L.migrateV8a(r7.state);
  assert.ok(r7.state.skills.every(s => L.BUILDINGS.includes(s.buildingType))); assert.ok(r7.state.habits.every(h => L.PLANTS.includes(h.plantType)));
  const v5 = v7State(); delete v5.rulesV6Since; const r5 = L.importState(v5, T); assert.equal(r5.ok, true); assert.equal(r5.migrated, true);
  const v3 = { v: 3, sound: true, skills: [{ id: 's1', name: 'Körper', icon: 'boot', st: 0 }], habits: [{ id: 'a', title: 'Dehnen', anchor: 'dem Kaffee', tiny: 'eine', freq: { kind: 'daily' }, skillId: 's1', effort: 1, streak: true, rem: true, createdAt: '2026-10-01', log: {} }] };
  const r3 = L.importState(v3, T); assert.equal(r3.ok, true); L.migrateV8a(r3.state); assert.equal(r3.state.skills[0].buildingType, 'muehle'); assert.equal(r3.state.habits[0].plantType, 'beere');
  const v8 = clone(r7.state); assert.equal(v8.schema, 4);   // v8a-Export ist für v7 lesbar (nur zusätzliche Felder)
  const back = L.importState(clone(v8), T); assert.equal(back.ok, true); assert.deepEqual(back.state.skills, v8.skills);
});

test('Neue Gewohnheit und neuer Hof speichern die gewählten Typen', () => {
  const i = { title: 'Lesen', anchor: 'dem Essen', tinyVersion: '1 Seite', frequency: { kind: 'daily' }, skillId: 's2', effort: 1, streakEnabled: true, remindersEnabled: true };
  assert.equal(L.newHabit({ ...i, plantType: 'kuerbis' }, T, 'x').plantType, 'kuerbis');
  assert.equal('plantType' in L.newHabit({ ...i, plantType: 'kaktus' }, T, 'x'), false);   // Unbekanntes wird nicht gespeichert, Migration ergänzt
  const h = L.newHabit(i, T, 'y'); L.applyEdit(h, { ...i, plantType: 'baeumchen' }, T); assert.equal(h.plantType, 'baeumchen');
  assert.deepEqual(L.emptyState(T).skills.map(s => s.buildingType), ['muehle', 'archiv', 'schmiede']);
  assert.equal(L.suggestPlant(0), 'beere'); assert.equal(L.suggestPlant(5), 'blume');
});

/* ---------- Skalierung ---------- */
test('Skalierung immer ganzzahlig (1×, 2×, 3×): 390, 430, 768 und 1024 pt breit', () => {
  const cases = { 390: 1, 430: 1, 768: 3, 1024: 3, 255: 1, 511: 1, 512: 2, 767: 2 };
  for (const [w, k] of Object.entries(cases)) { const s = SH.sceneScale(+w); assert.equal(s, k, w + ' pt'); assert.ok(Number.isInteger(s)); }
  // Großansicht (v8a.1): größter Faktor, bei dem die Höhe passt; die Breite darf überstehen (verschiebbar)
  assert.equal(SH.largeScale(390, 781), 3); assert.equal(SH.largeScale(430, 869), 3); assert.equal(SH.largeScale(768, 1000), 3);
  assert.equal(SH.largeScale(1024, 400), 2); assert.equal(SH.largeScale(844, 330), 2); assert.equal(SH.largeScale(600, 200), 1); assert.equal(SH.largeScale(2560, 1440), 3);
  for (let w = 200; w <= 2000; w += 7) for (const h of [170, 300, 600, 900]) { assert.ok(Number.isInteger(SH.sceneScale(w))); const k = SH.largeScale(w, h); assert.ok([1, 2, 3].includes(k)); assert.ok(160 * k <= h); }
});

test('Breitenregel (v8a.1): logische Breite = floor(verfügbare Breite / Faktor), mindestens 256, Höhe bleibt 160', () => {
  // kompakt: verfügbare Breite im Rahmen, Faktor aus sceneScale
  const compact = w => { const k = SH.sceneScale(w); return [k, SH.sceneWidth(w, k)]; };
  assert.deepEqual(compact(358), [1, 358]);   // iPhone 390 pt: keine Streifen, 51 px mehr Welt je Seite
  assert.deepEqual(compact(398), [1, 398]);   // 430 pt
  assert.deepEqual(compact(736), [2, 368]);   // 768 pt, eine Spalte
  assert.deepEqual(compact(514), [2, 257]);   // Desktop-Spalte
  assert.deepEqual(compact(992), [3, 330]);   // 1024 pt, eine Spalte
  assert.deepEqual(compact(200), [1, 256]);   // nie schmaler als der Kern
  for (let w = 256; w <= 2000; w += 3) { const [k, lw] = compact(w); assert.ok(Number.isInteger(lw)); assert.ok(lw * k <= w); assert.ok((lw + 1) * k > w); }
  // Großansicht: 3× auf dem iPhone, Kern 768 pt breit und verschiebbar; auf breiten Bildschirmen seitlich mehr Welt
  assert.equal(SH.sceneWidth(390, SH.largeScale(390, 781)), 256);
  assert.equal(SH.sceneWidth(1280, SH.largeScale(1280, 740)), 426);
  // Die Karte füllt die Ränder nur mit Natur: Randzonen enthalten nur natur-Sheets, alle Spielplätze liegen im Kern
  const map = JSON.parse(fs.readFileSync(path.join(SPR, 'hof-karte.json'), 'utf8'));
  const rand = map.zonen.filter(z => z.rand); assert.ok(rand.length >= 4);
  for (const z of rand) { assert.ok(z.teile.every(t => t.startsWith('natur-')), z.name); assert.ok(z.rechteck[0] + z.rechteck[2] <= 0 || z.rechteck[0] >= 256, z.name); }
  for (const [x] of map.gebaeude) assert.ok(x >= 0 && x < 256);
  assert.ok(map.deko.every(([x]) => x >= 0 && x < 256)); assert.ok(map.beete.every(([x]) => x >= 0 && x + 48 <= 256));
});
