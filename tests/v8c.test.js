// Tests v8c „Ruhiger Bildschirm“: Info-Blatt (öffnen, schließen, Fokus), Erklärungen ≤ 60 Wörter, Wilmas Vorrang,
// Akzentfarben-Kontrast in allen Themen, Nicht-Text-Kontrast des leeren Abhak-Kastens (8.1.1), Migration. Spielregeln unverändert.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const L = require('../src/logic.js');
const HX = require('../src/hilfe.js');
const { createSheets } = require('../src/sheet.js');

const ROOT = path.join(__dirname, '..');
const CSS = fs.readFileSync(path.join(ROOT, 'public', 'styles.css'), 'utf8');
const UI = fs.readFileSync(path.join(ROOT, 'src', 'ui.js'), 'utf8');
const FT = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'farbthemen.json'), 'utf8'));

/* ---------- Kleines Ersatz-DOM für das Info-Blatt ---------- */
function fakeDoc() {
  const doc = { activeElement: null };
  class El {
    constructor(tag) { this.tagName = tag.toUpperCase(); this.attrs = {}; this.children = []; this.parent = null; this.listeners = {}; this.style = {}; this.className = ''; this.id = ''; this.textContent = ''; this.innerHTML = ''; this.disabled = false; this.hidden = false;
      const self = this; this.classList = { add: (...c) => { self.className = [...new Set((self.className + ' ' + c.join(' ')).trim().split(/\s+/))].join(' '); }, contains: c => self.className.split(/\s+/).includes(c) }; }
    setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'id') this.id = v; }
    getAttribute(k) { return this.attrs[k] ?? null; }
    append(...cs) { cs.forEach(c => { c.parent = this; this.children.push(c); }); }
    remove() { if (this.parent) { this.parent.children = this.parent.children.filter(c => c !== this); this.parent = null; } }
    addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); }
    dispatch(t, e = {}) { const ev = Object.assign({ type: t, target: this, preventDefault() { this.defaultPrevented = true; }, stopPropagation() {} }, e); for (let n = this; n; n = n.parent) (n.listeners[t] || []).forEach(f => f(ev)); return ev; }
    focus() { doc.activeElement = this; }
    all() { return this.children.flatMap(c => [c, ...c.all()]); }
    querySelectorAll() { return this.all().filter(c => c.tagName === 'BUTTON' || c.tagName === 'INPUT'); }
    contains(x) { return x === this || this.all().includes(x); }
  }
  doc.body = new El('body');
  doc.createElement = t => new El(t);
  doc.contains = x => doc.body.contains(x);
  doc.querySelector = sel => doc.body.all().find(c => sel === '#' + c.id || sel === '.' + c.className) || null;
  return doc;
}
const setup = (opt = {}) => { const doc = fakeDoc(), trigger = doc.createElement('button'); trigger.id = 'karte'; doc.body.append(trigger); trigger.focus();
  return { doc, trigger, sheets: createSheets(doc, Object.assign({ raf: f => f() }, opt)) }; };
const wrapOf = doc => doc.body.children.find(c => c.className.includes('sheet-wrap'));
const panelOf = doc => wrapOf(doc).children[1];
const find = (doc, cls) => doc.body.all().find(c => c.className.split(/\s+/).includes(cls));

test('Info-Blatt öffnen: role="dialog", aria-modal, aria-labelledby auf den Titel, Fokus auf dem Titel, Schließen-Knopf vorhanden', () => {
  const { doc, sheets } = setup();
  sheets.open({ title: '5 Minuten dehnen', html: '<p>…</p>' });
  const p = panelOf(doc), title = find(doc, 'sheet-hd').children[0];
  assert.equal(p.getAttribute('role'), 'dialog'); assert.equal(p.getAttribute('aria-modal'), 'true');
  assert.equal(p.getAttribute('aria-labelledby'), title.id); assert.equal(title.textContent, '5 Minuten dehnen');
  assert.equal(doc.activeElement, title); assert.equal(find(doc, 'sheet-x').textContent, 'Schließen');
  assert.ok(find(doc, 'grip')); assert.ok(wrapOf(doc).classList.contains('in')); assert.equal(sheets.isOpen(), true);
});

test('Info-Blatt schließen: Knopf, Tippen daneben, Escape und Wischen nach unten; Fokus kehrt zum Auslöser zurück', () => {
  for (const how of ['knopf', 'daneben', 'escape', 'wischen']) {
    const { doc, trigger, sheets } = setup(); let reason = null;
    sheets.open({ title: 'X', html: '', onClose: r => { reason = r; } });
    if (how === 'knopf') find(doc, 'sheet-x').dispatch('click');
    if (how === 'daneben') find(doc, 'sheet-bg').dispatch('click');
    if (how === 'escape') doc.activeElement.dispatch('keydown', { key: 'Escape' });
    if (how === 'wischen') { find(doc, 'grip').dispatch('pointerdown', { clientY: 100 }); wrapOf(doc).dispatch('pointermove', { clientY: 230 }); wrapOf(doc).dispatch('pointerup', {}); }
    assert.equal(sheets.isOpen(), false, how); assert.equal(wrapOf(doc), undefined, how); assert.equal(doc.activeElement, trigger, how); assert.equal(reason, how);
  }
});

test('Info-Blatt: kurzes Ziehen schließt nicht, Tab hält den Fokus im Blatt', () => {
  const { doc, sheets } = setup();
  sheets.open({ title: 'X', html: '' });
  find(doc, 'grip').dispatch('pointerdown', { clientY: 100 }); wrapOf(doc).dispatch('pointermove', { clientY: 130 }); wrapOf(doc).dispatch('pointerup', {});
  assert.equal(sheets.isOpen(), true); assert.equal(panelOf(doc).style.transform, '');
  const x = find(doc, 'sheet-x'); x.focus(); const ev = x.dispatch('keydown', { key: 'Tab' });
  assert.equal(ev.defaultPrevented, true); assert.equal(doc.activeElement, x);   // einziges Bedienelement: bleibt drin
});

test('Info-Blatt: Auslöser nach Neuzeichnen weg → Fokus auf refocus; Ersetzen behält den ersten Auslöser; reduzierte Bewegung ohne Animation', () => {
  let { doc, trigger, sheets } = setup();
  const neu = doc.createElement('button'); neu.className = 'hopen';
  sheets.open({ title: 'A', html: '', refocus: '.hopen' }); trigger.remove(); doc.body.append(neu); sheets.close();
  assert.equal(doc.activeElement, neu);
  ({ doc, trigger, sheets } = setup());
  sheets.open({ title: 'A', html: '' }); sheets.open({ title: 'B (Erklärung)', html: '' });
  assert.equal(doc.body.children.filter(c => c.className.includes('sheet-wrap')).length, 1);
  sheets.close(); assert.equal(doc.activeElement, trigger);
  ({ doc, sheets } = setup({ reduce: true })); sheets.open({ title: 'A', html: '' });
  assert.ok(wrapOf(doc).classList.contains('still'));
  assert.match(CSS, /\.sheet-wrap\.still \.sheet,\.sheet-wrap\.still \.sheet-bg\{transition:none\}/);
});

/* ---------- Erklärungen ---------- */
test('Erklärungen hinter „?“: höchstens 60 Wörter, ein Titel, und jede benutzte ID existiert', () => {
  for (const [id, [title, text]] of Object.entries(HX.X)) { assert.ok(title, id); assert.ok(HX.words(text) <= HX.MAX_WORDS, `${id}: ${HX.words(text)} Wörter`); }
  const used = new Set([...UI.matchAll(/(?:qBtn|head)\([^)]*?'([a-z]+)'\)/g)].map(m => m[1]).concat([...UI.matchAll(/data-x="([a-z]+)"/g)].map(m => m[1])));
  for (const id of used) assert.ok(HX.explain(id), 'fehlt: ' + id);
  assert.ok(used.size >= 10);
  assert.match(UI, /aria-label="Erklärung: \$\{esc\(x\.title\)\}"/);
  assert.match(CSS, /\.q\{[^}]*min-width:44px;min-height:44px/);
});

/* ---------- Wilma ---------- */
test('Wilma zeigt einen Hinweis nach Vorrang: Nachtrag, Check-in, Meilenstein, Spruch', () => {
  const late = [{ id: 'h1', k: '2026-11-01', title: '10 Minuten lesen', day: 'gestern' }], ms = [{ id: 'unlock', text: 'Eine Woche geschafft!' }], say = ['A', 'B', 'C'];
  assert.equal(HX.pickHint({ late, checkin: true, milestones: ms, sayings: say }).kind, 'late');
  assert.equal(HX.pickHint({ late, checkin: true, milestones: ms, sayings: say }).text, 'Gestern ist bei „10 Minuten lesen“ noch nichts eingetragen.');
  assert.equal(HX.pickHint({ late: [], checkin: true, milestones: ms, sayings: say }).kind, 'checkin');
  assert.equal(HX.pickHint({ late: [], checkin: false, milestones: ms, sayings: say }).text, 'Eine Woche geschafft!');
  const sp = HX.pickHint({ late: [], checkin: false, milestones: [], sayings: say, idx: 4 }); assert.equal(sp.kind, 'spruch'); assert.equal(sp.text, 'B'); assert.equal(sp.more, true);
  assert.equal(HX.pickHint({}).kind, 'spruch');
});

/* ---------- Farben ---------- */
const lum = hex => { const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const SURF = ['panel', 'panel-dk', 'panel-in', 'panel-2', 'bg-a'];
const vars = body => Object.fromEntries([...body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(m => [m[1], m[2].toLowerCase()]));
const themeVars = th => { const out = {}; for (const m of CSS.matchAll(new RegExp(`(?:^|\\n)\\[data-theme="${th}"\\]\\{([^}]*)\\}`, 'g'))) Object.assign(out, vars(m[1])); return out; };
const accentCss = (k, light) => { const sel = light ? `[data-theme="pergament"][data-accent="${k}"],[data-theme="pergament"] [data-accent="${k}"]{` : `\n[data-accent="${k}"]{`; const i = CSS.indexOf(sel); return i < 0 ? null : vars(CSS.slice(i, CSS.indexOf('}', i)))['accent']; };

test('Akzentfarben: CSS entspricht farbthemen.json „akzente“ (dunkel und hell für Pergament), Auswahl hat alle sieben', () => {
  for (const [k, v] of Object.entries(FT.akzente.dunkel)) if (v) assert.equal(accentCss(k, false), v.toLowerCase(), k);
  for (const [k, v] of Object.entries(FT.akzente.hell)) if (v) assert.equal(accentCss(k, true), v.toLowerCase(), k + ' (hell)');
  assert.deepEqual(HX.ACCENTS.map(a => a[0]), Object.keys(FT.akzente.dunkel));
  assert.match(CSS, /--accent:var\(--wood-lt\)/);
  assert.ok(!/(?<![-\w])color:var\(--wood-lt\)/.test(CSS.replace('.apv:not([data-accent]){color:var(--wood-lt)}', '')), 'Überschriften nutzen --accent');
});

test('Akzentfarben: ≥ 4,5:1 auf allen Flächen in allen sieben Themen (Thema = wood-lt)', () => {
  const fails = [];
  for (const th of Object.keys(FT.themen)) {
    const t = themeVars(th), light = th === 'pergament';
    for (const [k, v] of Object.entries(light ? FT.akzente.hell : FT.akzente.dunkel)) {
      const c = v ? v.toLowerCase() : t['wood-lt'];
      for (const s of SURF) { const r = ratio(c, t[s]); if (r < 4.5) fails.push(`${th}/${k} auf ${s}: ${r.toFixed(2)}`); }
    }
  }
  assert.deepEqual(fails, []);
});

test('8.1.1 Nicht-Text-Kontrast: leerer Abhak-Kasten (Rand in text-soft) ≥ 3:1 im Ruhezustand, in allen Themen und mit „Gut unterscheidbar“', () => {
  assert.match(CSS, /\.chk\{[^}]*box-shadow:inset 0 0 0 2px var\(--text-soft\)/);
  assert.match(CSS, /\.chk::after\{[^}]*background:var\(--text-soft\)/);
  const fails = [];
  for (const th of Object.keys(FT.themen)) { const t = themeVars(th); for (const s of ['panel-dk', 'panel-in', 'panel']) { const r = ratio(t['text-soft'], t[s]); if (r < 3) fails.push(`${th}: text-soft auf ${s} = ${r.toFixed(2)}`); } }
  assert.deepEqual(fails, []);
  assert.match(CSS, /\[data-theme="pergament"\] :is\(\.logo,\.levelup h2\)\{text-shadow:0 2px 0 var\(--wood-dk\)\}/);
});

/* ---------- Daten ---------- */
test('Migration: ein v8-Export (mit theme und accent) lädt unverändert, Schema bleibt 4', () => {
  const T = '2026-11-02', s = L.emptyState(T); s.onboarded = true; L.migrateV8a(s);
  s.chest = { items: { bench: 2 }, placed: [{ itemId: 'lantern', slot: 0 }, { itemId: 'cat' }] }; s.theme = 'pergament'; s.accent = 'mint'; s.palette = 'cb';
  const exp = JSON.parse(JSON.stringify(s)), r = L.importState(JSON.parse(JSON.stringify(exp)), T);
  assert.equal(r.ok, true); L.migrateV8a(r.state); assert.deepEqual(r.state, exp); assert.equal(r.state.schema, 4); assert.equal(r.state.accent, 'mint');
  const v81 = JSON.parse(JSON.stringify(exp)); delete v81.accent; const r2 = L.importState(v81, T); L.migrateV8a(r2.state); assert.equal(r2.state.accent, undefined);
});
