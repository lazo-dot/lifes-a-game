/* Life's a Game · Abnahme: misst die Grenzwerte aus docs/abnahme.json im Browser und bricht bei Verletzung ab.
 *   npm run abnahme                       → baut dist/, startet einen eigenen Server, misst, schreibt docs/abnahme-ergebnis.md und docs/screenshots/
 *   node tools/abnahme.js --url http://localhost:8000/   (gegen einen laufenden Server, ohne Neubau)
 *   node tools/abnahme.js --ohne-tests | --ohne-bilder
 * Gemessen wird Abschnitt „immer“ plus der Abschnitt der aktuellen Version (package.json: 8.2.1 → „v8.2.1“, „v8.2“, „v8“, der spezifischste zuletzt),
 * auf allen „geraete“; Kontraste in allen „themen“ und Zuständen aus „kontrast_pruefen_in“ (auf dem ersten Gerät, die Farben hängen nicht von der Breite ab).
 * Headless-Chrome über das DevTools-Protokoll (tools/ux/chrome.js), Test-Hof (tools/ux/testhof.js), 12 Uhr, Erklärungen als gesehen markiert.
 * Bekannte offene Punkte (BEKANNT_OFFEN, mit Verweis auf docs/feedback.md) lassen den Lauf grün, alles andere nicht. Exit-Code 1 bei Verletzung.
 */
'use strict';
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const { open, testhof } = require('./ux/chrome');
const ROOT = path.resolve(__dirname, '..'), PKG = require('../package.json');
const CFG = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'abnahme.json'), 'utf8'));
const OUT_MD = path.join(ROOT, 'docs', 'abnahme-ergebnis.md'), SHOTS = path.join(ROOT, 'docs', 'screenshots');
const args = process.argv.slice(2), opt = n => args.includes(n), argVal = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };

/** Heute schon bekannte Verletzungen: Prüfung + Muster auf den Fund + Quelle. Steht ein Fund nicht hier, ist der Lauf rot. */
const BEKANNT_OFFEN = [
  { pruefung: 'kontextzeile_ohne_abschneiden', fund: /anker/i, quelle: 'docs/feedback.md · 02.11. · Heute · Anker wird in der Kontextzeile abgeschnitten → v9' },
  { pruefung: 'kontrast_nichttext_min', fund: /pergament.*Einstellungen \(Symbol\)/i, quelle: 'docs/feedback.md · 02.11. · Einstellungen · Zahnrad im Pergament-Thema blass → v9' },
  { pruefung: 'kontrast_nichttext_min', fund: /\(Eingabefeld\)/, quelle: 'docs/feedback.md · 02.11. · Eingabefelder: Rand zu schwach (Abnahme 8.2.1)' },
  { pruefung: 'kontrast_nichttext_min', fund: / · hover: .*\(Abhak-Kasten\)/, quelle: 'docs/feedback.md · 02.11. · Abhak-Kasten beim Überfahren zu schwach (Abnahme 8.2.1)' }
];
// Schlüssel, die nur Einstellungen für andere Prüfungen sind
const CONFIG_KEYS = new Set(['tapflaeche_ausnahmen', 'kontrast_pruefen_in']);
const TABS = { heute: 'today', gewohnheiten: 'habits', logbuch: 'journal', fortschritt: 'progress', truhe: 'chest' };

/** Grenzwerte: „immer“ plus Versionsabschnitte vom allgemeinsten zum spezifischsten. */
function limits() {
  const [a, b] = PKG.version.split('.'), keys = [`v${a}`, `v${a}.${b}`, `v${PKG.version}`].filter(k => CFG[k]);
  const L = Object.assign({}, CFG.immer); for (const k of keys) Object.assign(L, CFG[k]);
  return { L, abschnitte: ['immer', ...keys] };
}

/* ---------- Messfunktionen in der Seite (window.__abn), einmal je Dokument geladen ---------- */
const PAGE = `window.__abn = (() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)], w = ms => new Promise(r => setTimeout(r, ms));
  const vis = e => { if (!e.getClientRects().length) return false; const cs = getComputedStyle(e); return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0; };
  const words = s => (s.match(/[A-Za-zÄÖÜäöüß0-9%+]+/g) || []).length;
  const label = e => ((e.getAttribute('aria-label') || e.textContent || e.className).trim().replace(/\\s+/g, ' ').slice(0, 40)) || e.tagName.toLowerCase();
  // Farben
  const parse = s => { if (!s || s === 'transparent') return null; let m = s.match(/^rgba?\\(([^)]+)\\)/);
    if (m) { const p = m[1].split(/[\\s,\\/]+/).filter(Boolean).map(parseFloat); return [p[0], p[1], p[2], p[3] === undefined ? 1 : p[3]]; }
    m = s.match(/^color\\(srgb ([^)]+)\\)/); if (m) { const p = m[1].split(/[\\s\\/]+/).filter(Boolean).map(parseFloat); return [p[0] * 255, p[1] * 255, p[2] * 255, p[3] === undefined ? 1 : p[3]]; } return null; };
  const colorsIn = s => (s.match(/rgba?\\([^)]+\\)|color\\(srgb [^)]+\\)/g) || []).map(parse).filter(Boolean);
  const alpha = e => { let a = 1; for (let n = e; n; n = n.parentElement) a *= +getComputedStyle(n).opacity; return a; };
  // Ohne Kontrastanforderung: Szene, nur für Screenreader, inaktive Elemente und reine Farbmuster (.apv = „Aa“ in der Akzentfarbe, aria-hidden; WCAG: beiläufiger Text)
  const skipText = el => el.closest('.scene, .vh, canvas, #bigScene, [hidden], .apv') || el.closest(':disabled, [aria-disabled=true]');
  /** Was in der Ansicht oben liegt: Einstellungen (eigener Bildschirm), sonst das Info-Blatt, sonst die Seite. */
  const top = () => $('#settings') || $('.sheet') || document.body;
  const covered = el => !top().contains(el);
  /** Scrollbarer Bereich der Ansicht (Einstellungen und Blätter scrollen in sich, sonst das Fenster). */
  const scroller = () => { const t = top(); if (t === document.body) return null;
    return [t, ...t.querySelectorAll('*')].find(e => /auto|scroll/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 2) || null; };
  /** Ganz im Bild und nicht verdeckt oder weggeschnitten (Tab-Leiste, Blatt, Scroll-Leisten): oberstes Element in der Mitte ist el oder liegt in el. */
  const shown = (el, r) => { if (!(r.width > 0 && r.height > 0 && r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth)) return false;
    const tb = $('.tabs'); if (tb && !tb.contains(el) && top() === document.body && getComputedStyle(tb).position === 'fixed' && r.bottom > tb.getBoundingClientRect().top - 16) return false;   // Schatten über der Tab-Leiste
    const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && el.contains(h); };
  const box = r => [r.left, r.top, r.width, r.height];
  let done = new WeakSet();
  /** Kontrast-Messung einer Ansicht beginnen: an den Anfang scrollen. */
  function begin() { done = new WeakSet(); const sc = scroller(); if (sc) sc.scrollTop = 0; window.scrollTo(0, 0); }
  /** Weiter scrollen; false am Ende. */
  function next() { const sc = scroller(); if (sc) { if (sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 1) return false; sc.scrollTop += sc.clientHeight * 0.6; return true; }
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 1) return false; window.scrollBy(0, innerHeight * 0.6); return true; }
  /** Glyphen ausblenden (für das Bild des Hintergrunds), Farben und currentColor bleiben. */
  function hide(on) { let st = $('#abn-hide'); if (on && !st) { st = document.createElement('style'); st.id = 'abn-hide'; st.textContent = '*,*::before,*::after,::placeholder{-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important}'; document.head.append(st); } if (!on && st) st.remove(); }
  /** Häufigste deckende Farbe eines Pixel-Symbols. */
  function iconColor(img) { const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; if (!c.width) return null;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data, cnt = new Map();
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { const k = d[i] + ',' + d[i + 1] + ',' + d[i + 2]; cnt.set(k, (cnt.get(k) || 0) + 1); }
    const t = [...cnt].sort((a, b) => b[1] - a[1])[0]; return t ? [...t[0].split(',').map(Number), 1] : null; }
  /** Was jetzt ganz im Bild ist und noch nicht gemessen wurde: Texte (Farbe, Kasten) und Bedienelemente ohne Text (Abhak-Kästen, Eingabefelder, Symbole). */
  function collect() {
    const texts = [], ctl = [], tw = document.createTreeWalker(top(), NodeFilter.SHOW_TEXT);
    for (let t; (t = tw.nextNode());) { const el = t.parentElement; if (done.has(t) || !el || !t.textContent.trim() || skipText(el) || !vis(el)) continue;
      const r = document.createRange(); r.selectNodeContents(t); const rc = r.getBoundingClientRect(); if (!shown(el, rc)) continue; done.add(t);
      const fg = parse(getComputedStyle(el).color); if (!fg) continue; fg[3] *= alpha(el); texts.push({ label: t.textContent.trim().replace(/\\s+/g, " ").slice(0, 30), fg, r: box(rc) }); }
    for (const e of $$('.chk, input:not([type=hidden]):not([type=file]), select, textarea, button, [role=button]')) {
      if (done.has(e) || !vis(e) || covered(e) || e.disabled || e.closest('.scene, #bigScene')) continue; const rc = e.getBoundingClientRect(); if (!shown(e, rc)) continue; done.add(e);
      const cs = getComputedStyle(e); let cand = [], kind;
      if (e.matches('.chk, input, select, textarea')) { kind = e.matches('.chk') ? 'Abhak-Kasten' : 'Eingabefeld';
        if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') cand.push(parse(cs.borderTopColor));
        cand.push(...colorsIn(cs.boxShadow), parse(cs.backgroundColor)); }
      else if (!e.textContent.trim() && e.querySelector('img')) { kind = 'Symbol'; cand.push(iconColor(e.querySelector('img'))); }
      else continue;
      cand = cand.filter(c => c && c[3] > 0).map(c => c.map((v, i) => i === 3 ? v * alpha(e) : v)); if (cand.length) ctl.push({ label: label(e), kind, cand, r: box(rc) }); }
    return { texts, ctl };
  }
  /** Tap-Flächen aller sichtbaren Bedienelemente. */
  function taps(where, min, except) {
    const bad = []; let n = 0, small = 99;
    for (const e of $$('button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=tab]')) {
      if (!vis(e) || covered(e) || except.some(s => e.matches(s))) continue; const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; n++;
      const m = Math.min(r.width, r.height); small = Math.min(small, m); if (r.width < min || r.height < min) bad.push(where + ': ' + label(e) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
    return { n, small: Math.round(small), bad };
  }
  /** Wörter, Seitenhöhe, Karten und erster Haken eines Tabs (wie docs/ux-verschlankung-v8c.md, Abschnitt 6: ohne Tab-Leiste, Overlays, Toasts). */
  async function tab(t) {
    $('[data-tab="' + t + '"]').click(); await w(400); window.scrollTo(0, 0); await w(200);
    const tabs = $('.tabs'), tb = tabs.getBoundingClientRect(), fixed = getComputedStyle(tabs).position === 'fixed', vh = fixed ? tb.top : innerHeight;
    const skip = el => el.closest('.tabs, .toast, #overlay, .sheet-wrap, #settings, [hidden], .vh');
    let all = 0; const tw = document.createTreeWalker($('.wrap'), NodeFilter.SHOW_TEXT);
    for (let x; (x = tw.nextNode());) { const el = x.parentElement; if (!el || skip(el) || !x.textContent.trim() || !vis(el)) continue;
      const r = document.createRange(); r.selectNodeContents(x); const rc = r.getBoundingClientRect(); if (!rc.width && !rc.height) continue; all += words(x.textContent); }
    const panel = document.getElementById('p-' + t), chk = $('#p-today .chk');
    return { woerter: all, seitenhoehe: Math.round(document.documentElement.scrollHeight - (fixed ? tb.height : 0)),
      karten: t === 'today' ? [...panel.querySelectorAll('.hrow, .row[data-hid]')].filter(e => e.getBoundingClientRect().bottom <= vh).length : undefined,
      ersterHaken: t === 'today' && chk ? Math.round(chk.getBoundingClientRect().top + scrollY) : undefined };
  }
  /** Kontextzeilen der Gewohnheitskarten auf „Heute“: abgeschnitten, wenn der Text breiter ist als die Zeile. */
  function contextLines() { return $$('#p-today .hrow .ctx').filter(vis).map(e => ({ text: e.textContent.trim(), cut: e.scrollWidth > e.clientWidth + 1 })); }
  /** Szene: ganzzahliger Faktor, Canvas = CSS × dpr, jeder Szenen-Pixel ein gleichfarbiger Block, keine Seitenstreifen. */
  function scene(sel) { const c = $(sel), b = c.getBoundingClientRect(), dpr = devicePixelRatio, k = c.height / 160, lw = c.width / k;
    let blurred = 0; if (Number.isInteger(k) && Number.isInteger(lw)) { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      for (let y = 0; y < 160; y++) for (let x = 0; x < lw; x++) { const o = ((y * k) * c.width + x * k) * 4;
        for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) { const p = (((y * k + j) * c.width) + x * k + i) * 4; if (d[p] !== d[o] || d[p + 1] !== d[o + 1] || d[p + 2] !== d[o + 2]) { blurred++; j = k; break; } } } }
    const box = c.parentElement, bcs = getComputedStyle(box), inner = box.clientWidth - parseFloat(bcs.paddingLeft) - parseFloat(bcs.paddingRight);
    return { faktor: b.height / 160, ganzzahlig: Number.isInteger(b.height / 160) && Number.isInteger(k) && Number.isInteger(lw) && c.width === Math.round(b.width * dpr) && blurred === 0,
      blurred, streifen: Math.round(inner - b.width), pxScene: b.height / 160 };
  }
  // Ebenen: höchste Zahl gleichzeitig offener Info-Blätter (über die ganze Sitzung beobachtet)
  let maxSheets = 0; new MutationObserver(() => { maxSheets = Math.max(maxSheets, document.querySelectorAll('.sheet-wrap').length); }).observe(document, { childList: true, subtree: true });
  return { $, $$, w, vis, words, begin, next, hide, collect, taps, tab, contextLines, scene, maxSheets: () => maxSheets };
})();`;
const NOANIM = `(()=>{ const s = document.createElement('style'); s.id = 'abn-noanim'; s.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}'; document.head.append(s); })()`;

/* ---------- Ansichten: je Ansicht öffnen und wieder schließen ---------- */
const VIEWS = [
  ...Object.entries(TABS).map(([n, t]) => ({ name: n, open: `(async()=>{ document.querySelector('[data-tab="${t}"]').click(); await __abn.w(300); window.scrollTo(0, 0); })()` })),
  { name: 'info-blatt', open: `(async()=>{ document.querySelector('[data-tab=today]').click(); await __abn.w(200); document.querySelector('#p-today .hopen').click(); await __abn.w(450); })()`, close: true },
  { name: 'einstellungen', open: `(async()=>{ document.getElementById('gearBtn').click(); await __abn.w(450); })()`, close: true }
];
const CLOSE = `(async()=>{ for (let i = 0; i < 4 && (document.querySelector('.sheet-wrap') || document.getElementById('settings')); i++) {
  (document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await __abn.w(350);
  const x = document.querySelector('#settings [data-act=settings-close], #settings .back, #settings .sheet-x'); if (document.getElementById('settings') && x) { x.click(); await __abn.w(300); } } })()`;

/* ---------- Kontrast am gerenderten Bild ---------- */
const over = (f, b) => { const a = f[3]; return [f[0] * a + b[0] * (1 - a), f[1] * a + b[1] * (1 - a), f[2] * a + b[2] * (1 - a), 1]; };
const lum = c => { const [r, g, b] = c.slice(0, 3).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
/** PNG (8 Bit, RGB oder RGBA, ohne Interlacing, wie Chrome es liefert) → { w, h, data: RGBA }. */
function decodePng(buf) {
  let p = 8, w, h, bd, ct; const idat = [];
  while (p < buf.length) { const len = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); bd = d[8]; ct = d[9]; } else if (type === 'IDAT') idat.push(d); else if (type === 'IEND') break; p += 12 + len; }
  const bpp = ct === 6 ? 4 : ct === 2 ? 3 : 0; if (bd !== 8 || !bpp) throw new Error(`PNG-Format nicht unterstützt (Tiefe ${bd}, Typ ${ct})`);
  const raw = require('zlib').inflateSync(Buffer.concat(idat)), stride = w * bpp, out = Buffer.alloc(w * h * 4); let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) { const f = raw[y * (stride + 1)], cur = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let x = 0; x < stride; x++) { const a = x >= bpp ? cur[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0; let v = cur[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1; else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      cur[x] = v & 255; }
    for (let x = 0; x < w; x++) { const o = (y * w + x) * 4; out[o] = cur[x * bpp]; out[o + 1] = cur[x * bpp + 1]; out[o + 2] = cur[x * bpp + 2]; out[o + 3] = bpp === 4 ? cur[x * bpp + 3] : 255; }
    prev = cur; }
  return { w, h, data: out };
}
/** Farben in Rechtecken (CSS-Pixel = Bildpixel bei dpr 1) mit Anteil ≥ share. */
function colorsIn(img, rects, share) {
  const cnt = new Map(); let n = 0;
  for (const [x0, y0, rw, rh] of rects) for (let y = Math.max(0, Math.floor(y0)); y < Math.min(img.h, Math.ceil(y0 + rh)); y++) for (let x = Math.max(0, Math.floor(x0)); x < Math.min(img.w, Math.ceil(x0 + rw)); x++) {
    const o = (y * img.w + x) * 4, k = (img.data[o] << 16) | (img.data[o + 1] << 8) | img.data[o + 2]; cnt.set(k, (cnt.get(k) || 0) + 1); n++; }
  return [...cnt].filter(([, c]) => c / n >= share).map(([k]) => [k >> 16, (k >> 8) & 255, k & 255, 1]);
}
/** Eine Ansicht abschnittweise durchscrollen: Texte gegen den Hintergrund unter den Glyphen, Bedienelemente ohne Text gegen ihre Umgebung (Ring 2–4 px). */
async function contrastView(s, where, minText, minCtl) {
  const text = { n: 0, worst: 99, bad: [] }, ctl = { n: 0, worst: 99, bad: [] };
  await s.ev('__abn.begin()');
  for (let step = 0; step < 12; step++) {
    const c = await s.ev('__abn.collect()');
    if (c.texts.length || c.ctl.length) {
      await s.ev('__abn.hide(true)'); const shot = await s.send('Page.captureScreenshot', { format: 'png' }); await s.ev('__abn.hide(false)');
      const img = decodePng(Buffer.from(shot.data, 'base64'));
      for (const t of c.texts) { const bg = colorsIn(img, [t.r], 0.08); if (!bg.length) continue; text.n++;
        const k = Math.min(...bg.map(b => ratio(over(t.fg, b), b))); text.worst = Math.min(text.worst, k); if (k < minText) text.bad.push(`${where}: „${t.label}“ ${k.toFixed(2)}`); }
      for (const e of c.ctl) { const [x, y, w, h] = e.r, ring = [[x - 4, y - 4, w + 8, 2], [x - 4, y + h + 2, w + 8, 2], [x - 4, y, 2, h], [x + w + 2, y, 2, h]], bg = colorsIn(img, ring, 0.1); if (!bg.length) continue; ctl.n++;
        const k = Math.max(...e.cand.map(f => Math.min(...bg.map(b => ratio(over(f, b), b))))); ctl.worst = Math.min(ctl.worst, k); if (k < minCtl) ctl.bad.push(`${where}: ${e.label} (${e.kind}) ${k.toFixed(2)}`); }
    }
    if (!await s.ev('__abn.next()')) break; await new Promise(r => setTimeout(r, 60));
  }
  return { text, ctl };
}

/** Pseudo-Zustände (:hover, :active) für alle Bedienelemente erzwingen bzw. aufheben. */
async function forceState(s, cls) {
  await s.send('DOM.enable'); await s.send('CSS.enable');
  const { root } = await s.send('DOM.getDocument', { depth: -1 });
  const { nodeIds } = await s.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: 'button, a[href], input, select, textarea, summary, [role=button], .chk' });
  for (const nodeId of nodeIds) await s.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: cls }).catch(() => {});
}

/* ---------- Ablauf ---------- */
async function main() {
  const { L, abschnitte } = limits(), started = Date.now();
  const R = {};   // Prüfung → { grenzwert, werte: [Text], funde: [Text], gemessen: bool }
  const rec = (key, wert, funde = []) => { const r = R[key] || (R[key] = { grenzwert: L[key], werte: [], funde: [] }); if (wert !== undefined && wert !== null) r.werte.push(wert); r.funde.push(...funde); };
  const lim = k => L[k] !== undefined && L[k] !== null && !(typeof L[k] === 'object' && !Array.isArray(L[k]) && !Object.keys(L[k]).length);
  const log = m => process.stdout.write(m + '\n');

  // 1 Tests
  if (lim('tests_gruen') && L.tests_gruen) {
    if (opt('--ohne-tests')) rec('tests_gruen', 'übersprungen (--ohne-tests)');
    else { log('· npm test …'); const t = spawnSync(process.execPath, ['--test', ...fs.readdirSync(path.join(ROOT, 'tests')).filter(f => f.endsWith('.test.js')).map(f => path.join('tests', f))], { cwd: ROOT, encoding: 'utf8' });
      const out = t.stdout + t.stderr, pass = +(out.match(/^(?:# |ℹ )pass (\d+)/m) || [])[1] || 0, fail = +(out.match(/^(?:# |ℹ )fail (\d+)/m) || [])[1] || 0;   // TAP oder spec
      rec('tests_gruen', `${pass} grün, ${fail} rot`, t.status === 0 ? [] : [`${fail} Tests rot (npm test)`]); }
  }

  // 2 Server
  let url = argVal('--url'), server = null;
  if (!url) { const { build } = require('./build'), { serveDir } = require('./serve'); const b = build(); server = await serveDir(path.join(ROOT, 'dist'), 0, '127.0.0.1'); url = `http://127.0.0.1:${server.address().port}/`; log(`· dist/ gebaut (${b.version}), Server ${url}`); }

  const hof = testhof(), shots = !opt('--ohne-bilder');
  if (shots) { fs.mkdirSync(SHOTS, { recursive: true }); for (const f of fs.readdirSync(SHOTS)) if (f.endsWith('.png')) fs.rmSync(path.join(SHOTS, f)); }
  const errorsAll = [];

  for (const [gi, g] of CFG.geraete.entries()) {
    const tag = `${g.breite}`; log(`· ${g.name} (${g.breite} × ${g.hoehe} pt, ${g.dpr}×) …`);
    const s = await open({ width: g.breite, height: g.hoehe, dpr: g.dpr, init: PAGE });
    try {
      await s.loadHof(url, hof); await s.ev(NOANIM);
      const st = await s.ev(`(async()=>{ const v = await LAGStore.load(); return v && v.schema; })()`);
      if (lim('speicherschema')) rec('speicherschema', gi ? undefined : st, st === L.speicherschema ? [] : [`gespeichert: ${st}`]);

      // Tabs: Wörter, Seitenhöhe, Karten, erster Haken
      const m = {}; for (const [n, t] of Object.entries(TABS)) m[n] = await s.ev(`__abn.tab('${t}')`);
      if (lim('erster_haken_max_pt')) rec('erster_haken_max_pt', `${tag}: ${m.heute.ersterHaken}`, m.heute.ersterHaken <= L.erster_haken_max_pt ? [] : [`${tag}: ${m.heute.ersterHaken} pt`]);
      if (lim('karten_im_ersten_bildschirm_min')) rec('karten_im_ersten_bildschirm_min', `${tag}: ${m.heute.karten}`, m.heute.karten >= L.karten_im_ersten_bildschirm_min ? [] : [`${tag}: ${m.heute.karten} Karten`]);
      if (lim('woerter_max')) { const sum = Object.values(m).reduce((a, x) => a + x.woerter, 0), f = [];
        for (const [n, max] of Object.entries(L.woerter_max)) { const v = n === 'summe' ? sum : (m[n] || {}).woerter; if (v === undefined) f.push(`${n}: nicht gemessen`); else if (v > max) f.push(`${tag} ${n}: ${v} > ${max}`); }
        rec('woerter_max', `${tag}: ` + Object.keys(L.woerter_max).map(n => `${n} ${n === 'summe' ? sum : m[n].woerter}`).join(', '), f); }
      if (lim('seitenhoehe_max_pt')) { const f = []; for (const [n, max] of Object.entries(L.seitenhoehe_max_pt)) if (m[n].seitenhoehe > max) f.push(`${tag} ${n}: ${m[n].seitenhoehe} > ${max}`);
        rec('seitenhoehe_max_pt', `${tag}: ` + Object.keys(L.seitenhoehe_max_pt).map(n => `${n} ${m[n].seitenhoehe}`).join(', '), f); }

      // Kontextzeile
      if (lim('kontextzeile_ohne_abschneiden')) { await s.ev(`(async()=>{ document.querySelector('[data-tab=today]').click(); await __abn.w(300); })()`);
        const cl = await s.ev(`__abn.contextLines()`), cut = cl.filter(c => c.cut);
        rec('kontextzeile_ohne_abschneiden', `${tag}: ${cut.length} von ${cl.length} abgeschnitten`, cut.map(c => `${tag} anker: „${c.text}“`)); }

      // Szene und Großansicht
      await s.ev(`(async()=>{ document.querySelector('[data-tab=today]').click(); window.scrollTo(0, 0); await __abn.w(400); })()`);
      const sc = await s.ev(`__abn.scene('#scene')`);
      if (lim('szene_ganzzahlig')) rec('szene_ganzzahlig', `${tag}: ${sc.faktor}×${sc.ganzzahlig ? '' : ` (${sc.blurred} verschwommen)`}`, sc.ganzzahlig === L.szene_ganzzahlig ? [] : [`${tag}: Faktor ${sc.faktor}, ${sc.blurred} verschwommene Szenen-Pixel`]);
      if (lim('szene_seitenstreifen')) { const has = sc.streifen >= sc.pxScene; rec('szene_seitenstreifen', `${tag}: ${sc.streifen} pt Rest`, has === L.szene_seitenstreifen ? [] : [`${tag}: ${sc.streifen} pt neben der Szene`]); }
      if (shots && gi === 0) await s.shot(path.join(SHOTS, 'standard-heute-oben.png'));
      if (lim('grossansicht_faktor_min')) { await s.ev(`(async()=>{ document.querySelector('#scene').click(); await __abn.w(600); })()`);
        const big = await s.ev(`__abn.scene('#bigScene canvas')`); await s.ev(`(async()=>{ document.querySelector('[data-act=big-close]').click(); await __abn.w(300); })()`);
        rec('grossansicht_faktor_min', `${tag}: ${big.faktor}×`, big.faktor >= L.grossansicht_faktor_min && big.ganzzahlig ? [] : [`${tag}: Faktor ${big.faktor}${big.ganzzahlig ? '' : ', nicht ganzzahlig'}`]); }

      // Tap-Flächen in allen Ansichten
      if (lim('tapflaeche_min_pt')) { const ex = JSON.stringify(L.tapflaeche_ausnahmen || []); let small = 99, n = 0; const f = [];
        for (const v of VIEWS) { await s.ev(v.open); const t = await s.ev(`__abn.taps('${v.name}', ${L.tapflaeche_min_pt}, ${ex})`); small = Math.min(small, t.small); n += t.n; f.push(...t.bad.map(b => `${tag} ${b}`)); if (v.close) await s.ev(CLOSE); }
        rec('tapflaeche_min_pt', `${tag}: kleinste ${small} pt (${n} Elemente)`, f); }

      // Screenshots (erstes Gerät, Standard)
      if (shots && gi === 0) for (const v of VIEWS) { await s.ev(v.open); await s.shot(path.join(SHOTS, `standard-${v.name}.png`), !v.close); if (v.close) await s.ev(CLOSE); }

      // Kontraste: alle Themen × Zustände × Ansichten (erstes Gerät), gemessen am gerenderten Hintergrund
      if (gi === 0 && (lim('kontrast_text_min') || lim('kontrast_nichttext_min'))) {
        const states = L.kontrast_pruefen_in || ['ruhezustand'], ft = { n: 0, worst: 99, bad: [] }, fn = { n: 0, worst: 99, bad: [] };
        await s.send('Emulation.setDeviceMetricsOverride', { width: g.breite, height: g.hoehe, deviceScaleFactor: 1, mobile: true });   // Farben hängen nicht vom dpr ab
        for (const th of CFG.themen) for (const zs of states) {
          await s.ev(`(()=>{ const de = document.documentElement; ${th === 'standard' ? 'delete de.dataset.theme' : `de.dataset.theme = '${th}'`}; ${zs === 'gut-unterscheidbar' ? `de.dataset.palette = 'cb'` : 'delete de.dataset.palette'}; })()`);
          for (const v of VIEWS) {
            await s.ev(v.open);
            if (zs === 'hover' || zs === 'aktiv') await forceState(s, [zs === 'hover' ? 'hover' : 'active']);
            const where = `${v.name} · ${th} · ${zs}`;
            const r = await contrastView(s, where, L.kontrast_text_min || 0, L.kontrast_nichttext_min || 0);
            for (const [acc, x] of [[ft, r.text], [fn, r.ctl]]) { acc.n += x.n; acc.worst = Math.min(acc.worst, x.worst); acc.bad.push(...x.bad); }
            if (zs === 'hover' || zs === 'aktiv') await forceState(s, []);
            if (v.close) await s.ev(CLOSE);
          }
        }
        await s.ev(`(()=>{ const de = document.documentElement; delete de.dataset.theme; delete de.dataset.palette; window.scrollTo(0, 0); })()`);
        await s.send('Emulation.setDeviceMetricsOverride', { width: g.breite, height: g.hoehe, deviceScaleFactor: g.dpr, mobile: true });
        const span = `${CFG.themen.length} Themen × ${states.length} Zustände × ${VIEWS.length} Ansichten`;
        if (lim('kontrast_text_min')) rec('kontrast_text_min', `kleinster ${ft.worst.toFixed(2)} (${ft.n} Texte, ${span})`, ft.bad);
        if (lim('kontrast_nichttext_min')) rec('kontrast_nichttext_min', `kleinster ${fn.worst.toFixed(2)} (${fn.n} Elemente, ${span})`, fn.bad);
      }

      // Erklärungen hinter „?“
      if (lim('erklaerung_woerter_max') && gi === 0) { const x = await s.ev(`Object.entries(LAGHilfe.X).map(([k, [t, x]]) => [k, LAGHilfe.words(x)])`), max = Math.max(...x.map(e => e[1]));
        rec('erklaerung_woerter_max', `längste ${max} Wörter (${x.length} Erklärungen)`, x.filter(e => e[1] > L.erklaerung_woerter_max).map(e => `${e[0]}: ${e[1]} Wörter`)); }

      // Ebenen: jede Schaltfläche im Info-Blatt und jedes „?“ antippen, gleichzeitig offene Blätter zählen (1 + Blätter; Einstellungen = eigener Bildschirm)
      if (lim('ebenen_max')) {
        const acts = await s.ev(`(async()=>{ document.querySelector('[data-tab=today]').click(); await __abn.w(200); document.querySelector('#p-today .hopen').click(); await __abn.w(450);
          const a = [...document.querySelectorAll('.sheet button[data-act]')].map(b => b.dataset.act).filter(a => a !== 'pause'); await ${CLOSE}; return [...new Set(a)]; })()`);
        for (const a of acts) await s.ev(`(async()=>{ document.querySelector('[data-tab=today]').click(); await __abn.w(200); document.querySelector('#p-today .hopen').click(); await __abn.w(450);
          const b = document.querySelector('.sheet button[data-act="${a}"]'); if (b) { b.click(); await __abn.w(450); } await ${CLOSE}; })()`);
        for (const v of VIEWS) { await s.ev(v.open); await s.ev(`(async()=>{ for (const q of [...document.querySelectorAll('.q')].filter(__abn.vis).slice(0, 3)) { q.click(); await __abn.w(400); } })()`); await s.ev(CLOSE); }
        const k = 1 + await s.ev(`__abn.maxSheets()`);
        rec('ebenen_max', `${tag}: ${k}`, k <= L.ebenen_max ? [] : [`${tag}: ${k} Ebenen (Blatt über Blatt)`]);
        await s.reload(); await s.ev(NOANIM);
      }

      // Migration alter Exporte (erstes Gerät)
      if (lim('migration_exporte') && gi === 0) {
        const f = [], ok = [];
        for (const v of L.migration_exporte) { const r = await migrate(s, v, hof); (r === true ? ok : f).push(r === true ? v : `${v}: ${r}`); }
        rec('migration_exporte', ok.length ? ok.join(', ') + ' laden' : '–', f);
      }

      // Pergament: Screenshots über den echten Weg (Thema im Hof gespeichert)
      if (shots && gi === 0) { await s.loadHof(null, Object.assign({}, hof, { theme: 'pergament' })); await s.ev(NOANIM);
        await s.shot(path.join(SHOTS, 'pergament-heute-oben.png'));
        for (const v of VIEWS) { await s.ev(v.open); await s.shot(path.join(SHOTS, `pergament-${v.name}.png`), !v.close); if (v.close) await s.ev(CLOSE); } }

      errorsAll.push(...s.errors.map(e => `${tag}: ${String(e).split('\n')[0].slice(0, 160)}`));
    } finally { await s.close(); }
  }
  if (lim('konsolenfehler')) rec('konsolenfehler', errorsAll.length, errorsAll.length <= L.konsolenfehler ? [] : errorsAll);
  if (server) server.close();

  // Nicht gemessene Grenzwerte (neu in abnahme.json): rot, damit das Skript ergänzt wird
  for (const k of Object.keys(L)) if (!CONFIG_KEYS.has(k) && lim(k) && !R[k]) rec(k, 'nicht gemessen', ['Prüfung fehlt in tools/abnahme.js']);
  return report(R, abschnitte, url, Date.now() - started);
}

/** Alten Export laden (wie die App beim Start bzw. bei „Übernehmen“) und prüfen: Schema 4, alle Gewohnheiten, Hof sichtbar. */
async function migrate(s, v, hof) {
  const c = JSON.parse(JSON.stringify(hof)), n = c.habits.length;
  if (v === 'v3') {
    const v3 = { v: 3, sound: true, skills: [{ id: 's1', name: 'Körper', icon: 'boot', st: 0 }],
      habits: [{ id: 'a', title: 'Dehnen', anchor: 'dem Kaffee', tiny: 'eine Übung', freq: { kind: 'daily' }, skillId: 's1', effort: 1, streak: true, rem: true, createdAt: c.startedAt, log: {} }], todos: [], journal: [], inv: { bench: 1 }, placed: [] };
    await s.ev(`(async()=>{ await LAGStore.clear(); localStorage.setItem(LAGStore.prefix + 'lifes-a-game-v3', ${JSON.stringify(JSON.stringify(v3))}); })()`); await s.reload();
    const r = await s.ev(`(async()=>{ const b = document.querySelector('[data-act=ob-v3]'); if (!b) return 'kein „Übernehmen“ in der Begrüßung'; b.click(); await __abn.w(600);
      const st = await LAGStore.load(); localStorage.removeItem(LAGStore.prefix + 'lifes-a-game-v3'); return st && st.schema === 4 && st.habits.length === 1 && st.skills[0].buildingType ? true : 'gespeichert: ' + JSON.stringify(st && { schema: st.schema, habits: st.habits.length }); })()`);
    return r;
  }
  if (v === 'v7' || v === 'v5') { c.skills.forEach(x => delete x.buildingType); c.habits.forEach(h => delete h.plantType); delete c.theme; delete c.accent; if (v === 'v5') delete c.rulesV6Since; }
  if (v === 'v8') Object.assign(c, { theme: 'wald' });
  await s.loadHof(null, c);
  return s.ev(`(async()=>{ const st = await LAGStore.load(), rows = document.querySelectorAll('#p-today [data-hid]').length;
    return st && st.schema === 4 && st.habits.length === ${n} && st.skills.every(x => x.buildingType) && st.habits.every(h => h.plantType) && rows > 0 && (${v === 'v5'} ? !!st.rulesV6Since : true) ? true
      : 'gespeichert: ' + JSON.stringify(st && { schema: st.schema, habits: st.habits.length, rows }); })()`);
}

/* ---------- Bericht ---------- */
function fmtLimit(v) { if (Array.isArray(v)) return v.join(', '); if (v && typeof v === 'object') return Object.entries(v).map(([k, x]) => `${k} ${x}`).join(', '); return String(v); }
/** Kontrast-Funde je Element zusammenfassen: „Ansicht: Element – kleinster Wert (Thema/Zustand, …)“. */
function group(funde) {
  const g = new Map(), rest = [];
  for (const f of funde) { const m = f.match(/^(.+?) · (.+?) · (.+?): (.*) (\d+\.\d\d)$/); if (!m) { rest.push(f); continue; }
    const k = `${m[1]}: ${m[4]}`, e = g.get(k) || { min: 99, wo: [] }; e.min = Math.min(e.min, +m[5]); e.wo.push(`${m[2]}/${m[3]}`); g.set(k, e); }
  return [...[...g].sort((a, b) => a[1].min - b[1].min).map(([k, e]) => `${k} – ${e.min.toFixed(2)} (${e.wo.length > 8 ? `${e.wo.length}×, z. B. ` + e.wo.slice(0, 6).join(', ') : e.wo.join(', ')})`), ...rest];
}
function report(R, abschnitte, url, ms) {
  const rows = []; let red = 0, known = 0;
  for (const [k, r] of Object.entries(R)) {
    let status = 'ok', quelle = '';
    if (r.funde.length) {
      const rest = r.funde.filter(f => !BEKANNT_OFFEN.some(b => b.pruefung === k && b.fund.test(f)));
      if (rest.length) { status = 'VERLETZT'; red++; } else { status = 'bekannt offen'; known++; quelle = [...new Set(BEKANNT_OFFEN.filter(b => b.pruefung === k).map(b => b.quelle))].join('; '); }
      r.rest = rest;
    } else if (BEKANNT_OFFEN.some(b => b.pruefung === k)) quelle = 'jetzt erfüllt – Eintrag in BEKANNT_OFFEN (tools/abnahme.js) streichen';
    rows.push({ k, grenz: fmtLimit(r.grenzwert), wert: r.werte.join(' · ') || '–', status, quelle, funde: k.startsWith('kontrast') ? group(r.funde) : r.funde, rest: r.rest || [] });
  }
  // Konsole
  const w = [Math.max(10, ...rows.map(r => r.k.length)), Math.max(9, ...rows.map(r => Math.min(28, r.grenz.length)))];
  const line = (a, b, c, d) => `${a.padEnd(w[0])}  ${b.slice(0, 28).padEnd(w[1])}  ${c.padEnd(13)}  ${d}`;
  console.log('\n' + line('Prüfung', 'Grenzwert', 'ok', 'gemessen')); console.log('-'.repeat(w[0] + w[1] + 60));
  for (const r of rows) console.log(line(r.k, r.grenz, r.status === 'ok' ? 'ja' : r.status, r.wert));
  for (const r of rows) if (r.funde.length) { console.log(`\n${r.k} (${r.status}${r.quelle ? ' · ' + r.quelle : ''}):`); for (const f of r.funde.slice(0, 25)) console.log('  - ' + f); if (r.funde.length > 25) console.log(`  … ${r.funde.length - 25} weitere`); }
  console.log(`\n${red ? `ABNAHME ROT: ${red} Prüfung(en) verletzt` : 'Abnahme grün'}${known ? ` · ${known} bekannt offen` : ''} · ${Math.round(ms / 1000)} s`);
  // Datei
  const md = [`# Abnahme-Ergebnis`, '', `Erzeugt von \`npm run abnahme\` (tools/abnahme.js) · Version ${PKG.version} · ${new Date().toLocaleString('de-DE')} · Abschnitte: ${abschnitte.join(', ')}`, '',
    `Geräte: ${CFG.geraete.map(g => `${g.name} (${g.breite} × ${g.hoehe} pt)`).join(', ')} · Test-Hof, 12 Uhr, Erklärungen als gesehen · Kontraste in ${CFG.themen.length} Themen.`, '',
    `**${red ? `Rot: ${red} Prüfung(en) verletzt` : 'Grün'}**${known ? ` · ${known} bekannt offen` : ''}`, '',
    '| Prüfung | Grenzwert | gemessen | ok |', '|---|---|---|---|',
    ...rows.map(r => `| \`${r.k}\` | ${r.grenz} | ${r.wert} | ${r.status === 'ok' ? 'ja' : r.status === 'bekannt offen' ? 'bekannt offen' : '**verletzt**'} |`), ''];
  const det = rows.filter(r => r.funde.length || r.quelle);
  if (det.length) { md.push('## Funde', ''); for (const r of det) { md.push(`**\`${r.k}\`** – ${r.status}${r.quelle ? ` (${r.quelle})` : ''}`, ''); for (const f of r.funde.slice(0, 40)) md.push(`- ${f}`); if (r.funde.length > 40) md.push(`- … ${r.funde.length - 40} weitere`); md.push(''); } }
  md.push('Screenshots: `docs/screenshots/` (390 pt, Standard und Pergament: Heute oben, alle Tabs, Info-Blatt, Einstellungen).', '');
  fs.writeFileSync(OUT_MD, md.join('\n'));
  return red ? 1 : 0;
}

if (require.main === module) main().then(code => process.exit(code)).catch(e => { console.error(e); process.exit(2); });
module.exports = { PAGE, contrastView, decodePng };
