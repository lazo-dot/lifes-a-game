// Tests v8b: Gegenstandskatalog, Saison-Ziehung, Sammelalbum, Tier- und Bauer-Animation, Farbthemen (WCAG AA). Fundchance unverändert.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const L = require('../src/logic.js');
const SH = require('../src/sheets.js');

const ROOT = path.join(__dirname, '..'), SPR = path.join(ROOT, 'public', 'sprites');
const readJSON = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const seq = a => { let i = 0; return () => a[i++ % a.length]; };
const clone = o => JSON.parse(JSON.stringify(o));
const OLD12 = { flowers: ['Blumenbeet', false], bench: ['Holzbank', false], lantern: ['Laterne', false], barrel: ['Fass', false], pot: ['Blumentopf', false],
  sign: ['Wegweiser', false], hay: ['Heuballen', false], scarecrow: ['Vogelscheuche', true], beehive: ['Bienenstock', true], well: ['Brunnen', true],
  chicken: ['Huhn', true, true], duck: ['Ente', true, true] };

/* ---------- Katalog ---------- */
test('Katalog: ITEMS entspricht art/platzhalter/deko/deko-katalog.json (37 Deko-Teile, 5 Tiere, 13 selten)', () => {
  const k = readJSON('art/platzhalter/deko/deko-katalog.json'), all = [...k.deko, ...k.tiere];
  assert.equal(k.deko.length, 37); assert.equal(k.tiere.length, 5);
  assert.deepEqual(Object.keys(L.ITEMS).sort(), all.map(e => e.id).sort());
  for (const e of all) {
    const it = L.ITEMS[e.id];
    assert.equal(it.name, e.name, e.id); assert.equal(it.group, e.gruppe, e.id); assert.equal(it.rare, e.selten, e.id);
    assert.equal(it.season, e.jahreszeit, e.id); assert.equal(!!it.animal, !!e.animal, e.id);
  }
  assert.equal(Object.values(L.ITEMS).filter(i => i.rare).length, 13);
});

test('Katalog: die 12 bisherigen IDs bleiben mit Name, Seltenheit und Tier-Eigenschaft', () => {
  for (const [id, [name, rare, animal]] of Object.entries(OLD12)) {
    assert.equal(L.ITEMS[id].name, name); assert.equal(L.ITEMS[id].rare, rare); assert.equal(!!L.ITEMS[id].animal, !!animal); assert.equal(L.ITEMS[id].season, null);
  }
});

test('Katalog: jeder Gegenstand hat einen Frame im Sheet deko bzw. tiere (16 × 24 bzw. 16 × 16, Fußpunkt unten Mitte)', () => {
  const dk = SH.parseSheet(JSON.parse(fs.readFileSync(path.join(SPR, 'deko.json'), 'utf8'))), ti = SH.parseSheet(JSON.parse(fs.readFileSync(path.join(SPR, 'tiere.json'), 'utf8')));
  assert.deepEqual([dk.w, dk.h, dk.anchor.x, dk.anchor.y], [16, 24, 8, 23]); assert.deepEqual([ti.w, ti.h, ti.anchor.x, ti.anchor.y], [16, 16, 8, 15]);
  for (const [id, it] of Object.entries(L.ITEMS)) assert.ok((it.animal ? ti : dk).rect('base', id), id);
  for (const id of Object.keys(L.ITEMS).filter(k => L.ITEMS[k].animal)) assert.deepEqual(ti.anim(id), { n: 2, dir: 'pingpong', ms: 500 });
  // Gruppen: Garten 9, Hof 14, Selten 6, Tiere 5, Jahreszeiten 8
  assert.deepEqual(L.album({}).map(g => [g.name, g.total]), [['Garten', 9], ['Hof', 14], ['Selten', 6], ['Tiere', 5], ['Jahreszeiten', 8]]);
});

/* ---------- Saison und Ziehung ---------- */
test('Jahreszeit wie in der App: Frühling März–Mai, Sommer Juni–August, Herbst September–November, Winter Dezember–Februar (Grenztage)', () => {
  const cases = { '2026-02-28': 'winter', '2026-03-01': 'fruehling', '2026-05-31': 'fruehling', '2026-06-01': 'sommer', '2026-08-31': 'sommer',
    '2026-09-01': 'herbst', '2026-11-30': 'herbst', '2026-12-01': 'winter', '2027-01-01': 'winter', '2028-02-29': 'winter' };
  for (const [k, s] of Object.entries(cases)) { assert.equal(L.seasonKey(k), s, k); assert.equal(L.SEASON_NAME[s], L.seasonOf(L.parseKey(k).getMonth())); }
});

test('Saisonale Gegenstände sind nur in ihrer Jahreszeit findbar, ganzjährige immer', () => {
  const seasonal = d => [...L.findable(d, false), ...L.findable(d, true)].filter(id => L.ITEMS[id].season).sort();
  assert.deepEqual(seasonal('2026-08-31'), ['hammock', 'parasol']);
  assert.deepEqual(seasonal('2026-09-01'), ['leaf_pile', 'pumpkin_lantern']);
  assert.deepEqual(seasonal('2026-11-30'), ['leaf_pile', 'pumpkin_lantern']);
  assert.deepEqual(seasonal('2026-12-01'), ['feeder', 'snowman']);
  assert.deepEqual(seasonal('2027-02-28'), ['feeder', 'snowman']);
  assert.deepEqual(seasonal('2027-03-01'), ['birdhouse', 'tulip_basket']);
  assert.deepEqual(seasonal(undefined), []);                      // ohne Tag nur ganzjährige
  const yearRound = Object.keys(L.ITEMS).filter(id => !L.ITEMS[id].season);
  for (const d of ['2026-01-15', '2026-04-15', '2026-07-15', '2026-10-15']) for (const id of yearRound) assert.ok(L.findable(d, L.ITEMS[id].rare).includes(id), d + ' ' + id);
  assert.equal(L.findable('2026-10-15', false).length, 23 + 2); assert.equal(L.findable('2026-10-15', true).length, 11);
  assert.equal(L.findable('2026-07-15', true).length, 12);       // Hängematte ist selten
});

test('Ziehung: Fund und Seltenheit wie bisher (12 %, davon 20 %), danach gleichverteilt aus den jetzt findbaren', () => {
  const k = '2026-10-15';
  assert.equal(L.rollDrop(seq([0.12]), k), null);                                  // kein Fund
  assert.equal(L.ITEMS[L.rollDrop(seq([0.119, 0.1, 0]), k)].rare, true);           // Fund, selten
  assert.equal(L.ITEMS[L.rollDrop(seq([0.119, 0.2, 0]), k)].rare, false);          // Fund, häufig
  for (const rare of [false, true]) {
    const pool = L.findable(k, rare), hits = {};
    pool.forEach((_, i) => { const id = L.pickItem(seq([(i + 0.5) / pool.length]), rare, k); hits[id] = (hits[id] || 0) + 1; });
    assert.deepEqual(Object.keys(hits).sort(), pool.slice().sort()); assert.ok(Object.values(hits).every(n => n === 1));   // jeder genau einmal
  }
  assert.equal(L.pickItem(() => 0.999, false, '2026-10-15'), L.findable('2026-10-15', false).at(-1));
  // Häufigkeiten bleiben: über viele Ziehungen 12 % Funde, davon 20 % selten, nie Gegenstände außerhalb der Jahreszeit
  const r = L.rng(42); let n = 0, rare = 0, wrong = 0;
  for (let i = 0; i < 50000; i++) { const id = L.rollDrop(r, '2026-07-15'); if (!id) continue; n++; if (L.ITEMS[id].rare) rare++; if (L.ITEMS[id].season && L.ITEMS[id].season !== 'sommer') wrong++; }
  assert.ok(Math.abs(n / 50000 - 0.12) < 0.006); assert.ok(Math.abs(rare / n - 0.2) < 0.02); assert.equal(wrong, 0);
});

test('Fundchancen-Anzeige zeigt die jetzt findbaren Gegenstände, die Zahlen bleiben', () => {
  const o = L.dropOdds('2026-12-24');
  assert.equal(o.any, 0.12); assert.equal(o.rareShare, 0.2); assert.equal(o.season, 'winter');
  assert.ok(o.commonItems.includes('feeder') && o.rareItems.includes('snowman') && !o.commonItems.includes('parasol'));
  assert.ok(o.commonItems.every(k => !L.ITEMS[k].rare) && o.rareItems.every(k => L.ITEMS[k].rare));
});

/* ---------- Sammelalbum und Migration ---------- */
test('Sammelalbum: gefunden ist, was in der Truhe liegt oder auf dem Hof steht; Saisonfunde bleiben außerhalb ihrer Jahreszeit', () => {
  const a = L.album({ items: { snowman: 1, bench: 2 }, placed: [{ itemId: 'lantern', slot: 0 }, { itemId: 'cat' }] });
  const by = Object.fromEntries(a.map(g => [g.id, g]));
  assert.equal(by.saison.found, 1); assert.ok(by.saison.items.find(i => i.id === 'snowman').found);
  assert.equal(by.hof.found, 2); assert.equal(by.tiere.found, 1); assert.equal(by.garten.found, 0);
  assert.deepEqual(L.album(undefined).map(g => g.found), [0, 0, 0, 0, 0]);
});

test('Migration: ein v8-Export mit Truhe und platzierten Gegenständen lädt unverändert', () => {
  const T = '2026-11-02', s = L.emptyState(T); s.onboarded = true; L.migrateV8a(s);
  s.chest = { items: { bench: 2, well: 1, flowers: 1 }, placed: [{ itemId: 'lantern', slot: 0 }, { itemId: 'scarecrow', slot: 3 }, { itemId: 'chicken' }, { itemId: 'duck' }] };
  s.palette = 'cb'; s.textScale = 1.15;
  const exp = JSON.parse(JSON.stringify(s)), r = L.importState(clone(exp), T);
  assert.equal(r.ok, true); L.migrateV8a(r.state);
  assert.deepEqual(r.state.chest, exp.chest); assert.deepEqual(r.state, exp); assert.equal(r.state.schema, 4);
  for (const p of r.state.chest.placed) assert.ok(L.ITEMS[p.itemId]);
});

/* ---------- Animation ---------- */
test('Frames: forward und pingpong, Tier-Leerlauf 500 ms, Bauer 4 Richtungen × 4 Frames', () => {
  assert.deepEqual([0, 500, 1000, 1500, 2000].map(t => SH.frameAt(2, 'pingpong', t, 500)), [0, 1, 0, 1, 0]);
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map(i => SH.frameAt(4, 'pingpong', i * 100, 100)), [0, 1, 2, 3, 2, 1, 0]);
  assert.deepEqual([0, 1, 2, 3, 4].map(i => SH.frameAt(4, 'forward', i * 150, 150)), [0, 1, 2, 3, 0]);
  assert.equal(SH.frameAt(1, 'forward', 9999, 100), 0); assert.equal(SH.frameAt(4, 'forward', 1000, 0), 0);
  const b = SH.parseSheet(JSON.parse(fs.readFileSync(path.join(SPR, 'bauer.json'), 'utf8')));
  for (const d of ['unten', 'oben', 'links', 'rechts']) { assert.deepEqual(b.anim(d), { n: 4, dir: 'forward', ms: 150 }); assert.notDeepEqual(b.rect('base', d, 0), b.rect('base', d, 3)); }
  assert.deepEqual(b.rect('base', 'links', 9), b.rect('base', 'links', 3));    // nie über den Tag hinaus
  const w = SH.parseSheet(JSON.parse(fs.readFileSync(path.join(SPR, 'wohnhaus.json'), 'utf8')));
  assert.ok(w.rect('glow', 'wohnhaus')); assert.deepEqual(w.anchor, { x: 24, y: 47 });
});

test('Hof-Karte: Fußpunkte für Deko je Platz, Tierplätze im Kern und nicht auf Wegen, Ente im Teich', () => {
  const M = JSON.parse(fs.readFileSync(path.join(SPR, 'hof-karte.json'), 'utf8'));
  assert.equal(M.dekoFuss.length, M.deko.length);
  const inRect = ([x, y], [rx, ry, rw, rh]) => x >= rx && x < rx + rw && y >= ry && y < ry + rh;
  for (const p of M.tiere) { assert.ok(p[0] >= 8 && p[0] < 248 && p[1] <= 160); assert.ok(!M.boden.wege.some(w => inRect(p, w)), 'Tier auf dem Weg: ' + p); }
  const T = M.boden.teich; for (const [x, y] of M.teichTiere) assert.ok(((x - T.cx) / T.rx) ** 2 + ((y - T.cy) / T.ry) ** 2 < 0.8);
});

/* ---------- Farbthemen: WCAG AA ---------- */
const CSS = fs.readFileSync(path.join(ROOT, 'public', 'styles.css'), 'utf8');
const block = sel => { const i = CSS.indexOf(sel + '{'); if (i < 0) return null; const body = CSS.slice(i + sel.length + 1, CSS.indexOf('}', i)); return Object.fromEntries([...body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(m => [m[1], m[2].toLowerCase()])); };
const ROOTV = block(':root'), CB = block(':root[data-palette="cb"]'), CBP = block(':root[data-palette="cb"][data-theme="pergament"]');
const FT = readJSON('docs/farbthemen.json');
const THEMES = ['standard', 'wald', 'herbst', 'frost', 'meer', 'kirschbluete', 'pergament'];
const lum = hex => { const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const BGS = ['panel-dk', 'panel', 'panel-2', 'panel-in', 'bg-a'];
/** Theme-Blöcke stehen je Thema evtl. mehrfach (Werte aus der JSON, dann Zusätze des hellen Themas). */
const themeBlock = th => { const re = new RegExp(`(?:^|\\n)\\[data-theme="${th}"\\]\\{([^}]*)\\}`, 'g'), out = {}; for (const m of CSS.matchAll(re)) for (const v of m[1].matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)) out[v[1]] = v[2].toLowerCase(); return out; };
/** Alle Text-/Hintergrund-Paare der Oberfläche: [Vordergrund, Hintergrund, Mindestwert]. Text 4,5:1, Bedienelemente und Fokus 3:1. */
const PAIRS = [
  ...['text', 'text-soft', 'wood-lt', 'leaf', 'leaf-hi', 'water', 'rare', 'repair', 'tx-rare', 'tx-info', 'tx-err', 'tx-night'].flatMap(f => BGS.map(b => [f, b, 4.5])),
  ['ink-dk', 'wood', 4.5], ['text', 'panel-3', 4.5], ['on-leaf-dk', 'leaf-dk', 4.5],   // Zahl am Tab
  ...BGS.map(b => ['wood', b, 3]), ...BGS.map(b => ['wood-lt', b, 3]), ...['panel-dk', 'panel-in'].map(b => ['leaf', b, 3])
];
const tokens = (th, cb) => Object.assign({}, ROOTV, themeBlock(th), cb ? CB : {}, cb && th === 'pergament' ? CBP : {});

test('Farbthemen: alle sieben aus docs/farbthemen.json mit denselben Werten, Standard entspricht den bisherigen Farben', () => {
  assert.deepEqual(Object.keys(FT.themen), THEMES);
  // Ausnahme (ABWEICHUNGEN v8b): Pergament-Statusfarben etwas dunkler, weil sie auch als Schrift dienen
  const EXC = { pergament: ['leaf', 'water', 'repair'] };
  for (const th of THEMES) { const css = themeBlock(th); for (const [k, v] of Object.entries(FT.themen[th])) if (/^#/.test(v)) {
    if ((EXC[th] || []).includes(k)) assert.ok(lum(css[k]) < lum(v.toLowerCase()), th + ' --' + k + ' dunkler'); else assert.equal(css[k], v.toLowerCase(), th + ' --' + k); } }
  const std = themeBlock('standard'); for (const [k, v] of Object.entries(std)) assert.equal(v, ROOTV[k], k);
  assert.deepEqual(L.THEME_BY_SEASON, FT.jahreszeit_automatisch);
});

test('Farbthema „passend zur Jahreszeit“ folgt der Jahreszeit der App, feste Themen bleiben', () => {
  assert.equal(L.themeFor('jahreszeit', '2026-03-01'), 'kirschbluete'); assert.equal(L.themeFor('jahreszeit', '2026-08-31'), 'meer');
  assert.equal(L.themeFor('jahreszeit', '2026-09-01'), 'herbst'); assert.equal(L.themeFor('jahreszeit', '2026-12-01'), 'frost');
  assert.equal(L.themeFor('wald', '2026-12-01'), 'wald'); assert.equal(L.themeFor(undefined, '2026-12-01'), 'standard'); assert.equal(L.themeFor('quatsch', '2026-12-01'), 'standard');
});

test('Farbthemen: die Werte in docs/farbthemen.json „kontraste“ erreichen ihr Minimum', () => {
  for (const th of THEMES) for (const k of FT.kontraste[th] || []) { const t = tokens(th, false); assert.ok(ratio(t[k.vorne], t[k.hinten]) >= k.mindestens, `${th}: ${k.zweck}`); }
});

test('Farbthemen: jedes Text- und Hintergrund-Paar erfüllt WCAG AA, auch zusammen mit „Gut unterscheidbar“', () => {
  const fails = [];
  for (const th of THEMES) for (const cb of [false, true]) {
    const t = tokens(th, cb);
    for (const [f, b, min] of PAIRS) { const r = ratio(t[f], t[b]); if (r < min) fails.push(`${th}${cb ? '+cb' : ''}: --${f} auf --${b} = ${r.toFixed(2)} (< ${min})`); }
  }
  assert.deepEqual(fails, []);
});

if (require.main === module || process.env.KONTRAST) {
  // node tests/v8b.test.js → Kontrastwerte je Thema (für die Zusammenfassung)
  for (const th of THEMES) { const t = tokens(th, false), r = PAIRS.map(([f, b, min]) => ({ p: `${f}/${b}`, r: ratio(t[f], t[b]), min }));
    const tx = r.filter(x => x.min === 4.5), ui = r.filter(x => x.min === 3), lo = a => a.reduce((m, x) => (x.r < m.r ? x : m));
    console.log(`${th}: Text min ${lo(tx).r.toFixed(2)} (${lo(tx).p}), text/panel ${ratio(t.text, t.panel).toFixed(2)}, text-soft/panel ${ratio(t['text-soft'], t.panel).toFixed(2)}, ink-dk/wood ${ratio(t['ink-dk'], t.wood).toFixed(2)}, Bedienelemente min ${lo(ui).r.toFixed(2)} (${lo(ui).p})`); }
}
