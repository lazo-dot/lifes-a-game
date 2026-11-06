/* Platzhalter v9 „Hof-Tage und Entdeckungen“ (Stil B) – NICHT für den Launch, per Code erzeugt.
 * Genau die Teile aus docs/auftraege/v9.md Abschnitt 5, nichts darüber hinaus:
 *   entdeckungen/hof-entdeckungen  32 × 32: steg, bienenstock, bank-laterne, hofschild, obstbaum, obstbaum-fruechte, gemuesebeet, festtisch
 *   entdeckungen/hof-besucher      16 × 16, je 2 Frames: schmetterling, biene, frosch, eichhoernchen
 * Regenbogen, Glühwürmchen, Funken, Glitzern und Wolkenschatten zeichnet die App per Code.
 * Gleiche Regeln wie pix.py (dort mit Pillow): Palette art/palette-stil-b.json, Lichtkante oben links, Eigenschatten unten rechts,
 * Umriss in der dunkelsten Stufe der Rampe, Ebenen base/glow/shadow, Aseprite-JSON mit meta.platzhalter = true.
 * Läuft ohne Abhängigkeiten:  node art/platzhalter/entdeckungen.js
 */
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const HERE = __dirname, PAL = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'palette-stil-b.json'), 'utf8'));
const RAMPS = Object.fromEntries(Object.entries(PAL).filter(([k]) => k !== 'Fähigkeiten'));
const SHADOW = PAL['Umriss & Nacht'][0];
const ALLOWED = new Set(Object.values(RAMPS).flat().map(c => c.toLowerCase()));
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

class Sprite {
  constructor(w, h) { this.w = w; this.h = h; this.mat = [...Array(h)].map(() => Array(w).fill(null)); this.glow = [...Array(h)].map(() => Array(w).fill(null)); this.sh = [...Array(h)].map(() => Array(w).fill(false)); this.sid = 0; }
  fill(test, ramp, idx = 2, bevel = true) { this.sid++; for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (test(x, y)) this.mat[y][x] = [ramp, idx, this.sid, bevel]; }
  rect(x, y, w, h, ramp, idx = 2, bevel = true) { this.fill((a, b) => a >= x && a < x + w && b >= y && b < y + h, ramp, idx, bevel); }
  ellipse(x, y, w, h, ramp, idx = 2, bevel = true) { const cx = x + (w - 1) / 2, cy = y + (h - 1) / 2, rx = w / 2, ry = h / 2; this.fill((a, b) => ((a - cx) / rx) ** 2 + ((b - cy) / ry) ** 2 <= 1, ramp, idx, bevel); }
  px(x, y, ramp, idx = 2) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) { this.sid++; this.mat[y][x] = [ramp, idx, this.sid, false]; } }
  hline(x, y, w, ramp, idx) { this.rect(x, y, w, 1, ramp, idx, false); }
  vline(x, y, h, ramp, idx) { this.rect(x, y, 1, h, ramp, idx, false); }
  light(x, y, w, h, i = 1) { for (let b = y; b < y + h; b++) for (let a = x; a < x + w; a++) if (a >= 0 && b >= 0 && a < this.w && b < this.h) this.glow[b][a] = RAMPS['Licht & Glut'][i]; }
  shadow(cx, cy, rx, ry) { ry = ry || Math.max(2, rx >> 2); for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (((x - cx - 1) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) this.sh[y][x] = true; }
  render() {
    const { w, h } = this, base = new Uint8Array(w * h * 4), set = (img, x, y, c) => { const o = (y * w + x) * 4, [r, g, b] = rgb(c); img[o] = r; img[o + 1] = g; img[o + 2] = b; img[o + 3] = 255; };
    const same = (x, y, sid) => x >= 0 && y >= 0 && x < w && y < h && this.mat[y][x] && this.mat[y][x][2] === sid;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const m = this.mat[y][x]; if (!m) continue; const [ramp, idx, sid, bevel] = m, r = RAMPS[ramp]; let i = idx;
      if (bevel) { if (!same(x, y - 1, sid) || !same(x - 1, y, sid)) i = idx + 1; else if (!same(x, y + 1, sid) || !same(x + 1, y, sid)) i = idx - 1; }
      set(base, x, y, r[Math.max(0, Math.min(r.length - 1, i))]); }
    const out = Uint8Array.from(base);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (base[(y * w + x) * 4 + 3]) continue;
      for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < w && ny < h && this.mat[ny][nx]) { set(out, x, y, RAMPS[this.mat[ny][nx][0]][0]); break; } } }
    const glow = new Uint8Array(w * h * 4), shadow = new Uint8Array(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (this.glow[y][x]) set(glow, x, y, this.glow[y][x]); if (this.sh[y][x]) set(shadow, x, y, SHADOW); }
    return { base: out, glow, shadow };
  }
}

/* ---------- PNG (RGBA, 8 Bit) ohne Abhängigkeiten ---------- */
const CRC = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
const crc = buf => { let c = -1; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function png(w, h, rgba) {
  const chunk = (type, data) => { const len = Buffer.alloc(4), td = Buffer.concat([Buffer.from(type, 'ascii'), data]), c = Buffer.alloc(4); len.writeUInt32BE(data.length); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc((w * 4 + 1) * h); for (let y = 0; y < h; y++) Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

/** Sheet wie pix.export_sheet: Zeilen = Ebenen, Spalten = Frames; tags: [{ name, from, to, direction }], names: Name je Frame. */
function exportSheet(name, frames, names, tags, [w, h], outdir, ms = 100) {
  const layers = ['base', 'glow', 'shadow'], W = w * frames.length, H = h * layers.length, img = new Uint8Array(W * H * 4), out = [];
  layers.forEach((layer, li) => frames.forEach((fr, fi) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const s = (y * w + x) * 4, d = ((li * h + y) * W + fi * w + x) * 4; for (let k = 0; k < 4; k++) img[d + k] = fr[layer][s + k]; }
    out.push({ filename: `${name} (${layer}) ${names[fi]}`, frame: { x: fi * w, y: li * h, w, h }, rotated: false, trimmed: false, spriteSourceSize: { x: 0, y: 0, w, h }, sourceSize: { w, h }, duration: ms });
  }));
  const bad = new Set(); for (let i = 0; i < img.length; i += 4) if (img[i + 3]) { const c = '#' + [img[i], img[i + 1], img[i + 2]].map(v => v.toString(16).padStart(2, '0')).join(''); if (!ALLOWED.has(c) && c !== SHADOW) bad.add(c); }
  if (bad.size) throw new Error(`${name}: Farben außerhalb der Palette: ${[...bad].join(', ')}`);
  fs.mkdirSync(outdir, { recursive: true });
  fs.writeFileSync(path.join(outdir, name + '.png'), png(W, H, img));
  const meta = { app: 'lifes-a-game art/platzhalter/entdeckungen.js (Aseprite-kompatibel)', version: '1.0', image: name + '.png', format: 'RGBA8888', size: { w: W, h: H }, scale: '1',
    frameTags: tags, layers: layers.map(l => ({ name: l, opacity: l === 'shadow' ? 77 : 255, blendMode: l === 'glow' ? 'addition' : 'normal' })),
    anchor: { x: w >> 1, y: h - 1, note: 'Fußpunkt unten Mitte' }, platzhalter: true };
  fs.writeFileSync(path.join(outdir, name + '.json'), JSON.stringify({ frames: out, meta }, null, 1) + '\n');
  return { W, H, img };
}

/* ---------- Orte und Dinge (32 × 32, Fußpunkt 16/31) ---------- */
const ORTE = {
  steg(s) {            // Bohlen-Steg von oben, ragt nach rechts unten ins Wasser
    s.shadow(16, 30, 14, 2);
    s.rect(1, 20, 30, 9, 'Holz', 3);
    for (let x = 4; x < 31; x += 4) s.vline(x, 21, 7, 'Holz', 1);
    for (const [x, y] of [[0, 19], [29, 19], [0, 27], [29, 27]]) s.rect(x, y, 3, 3, 'Holz', 1);
  },
  bienenstock(s) {     // Strohkorb auf kleinem Holzbock
    s.shadow(16, 30, 7, 2);
    s.rect(10, 27, 12, 3, 'Holz', 2); s.rect(11, 30, 2, 1, 'Holz', 1); s.rect(19, 30, 2, 1, 'Holz', 1);
    s.ellipse(10, 15, 12, 13, 'Frucht gelb', 2);
    for (const y of [18, 21, 24]) s.hline(11, y, 10, 'Frucht gelb', 1);
    s.rect(15, 24, 3, 2, 'Erde & Beet', 0, false);
  },
  'bank-laterne'(s) {  // Holzbank mit Laterne daneben (Ruheecke)
    s.shadow(14, 30, 12, 2);
    s.rect(3, 21, 18, 3, 'Holz', 2); s.rect(3, 25, 18, 3, 'Holz', 3);
    for (const x of [4, 18]) s.rect(x, 28, 2, 3, 'Holz', 1);
    s.rect(25, 15, 2, 16, 'Stein', 1);
    s.rect(23, 9, 6, 6, 'Stein', 1); s.rect(24, 10, 4, 4, 'Licht & Glut', 1, false); s.hline(22, 8, 8, 'Stein', 2);
    s.light(24, 10, 4, 4, 1); s.light(25, 11, 2, 2, 0);
  },
  hofschild(s) {       // Holzschild auf Pfosten, „Gründungsdatum“ als Schriftandeutung
    s.shadow(16, 30, 6, 2);
    s.rect(15, 20, 2, 11, 'Holz', 2);
    s.rect(5, 11, 22, 10, 'Holz', 3);
    s.hline(8, 14, 16, 'Holz', 1); s.hline(10, 17, 12, 'Holz', 1);
    s.px(7, 12, 'Frucht gelb', 2); s.px(24, 12, 'Frucht gelb', 2);
  },
  obstbaum(s) { baum(s, false); },
  'obstbaum-fruechte'(s) { baum(s, true); },
  gemuesebeet(s) {     // kleines Beet 32 × 16: Kohl und Möhren
    s.shadow(16, 30, 15, 2);
    s.rect(1, 18, 30, 13, 'Holz', 2);
    s.rect(3, 20, 26, 9, 'Erde & Beet', 1);
    for (const x of [4, 11, 18, 25]) s.ellipse(x, 20, 5, 4, 'Laub', 3);
    for (const x of [5, 9, 13, 17, 21, 25]) { s.px(x, 26, 'Frucht gelb', 1); s.px(x, 25, 'Gras', 3); }
  },
  festtisch(s) {       // Erntefest: Lampions an einer Schnur, Tisch mit Tuch
    s.shadow(16, 30, 13, 2);
    s.hline(0, 9, 32, 'Holz', 1);
    [[3, 'Frucht rot'], [11, 'Frucht gelb'], [19, 'Blüte rosa'], [27, 'Frucht gelb']].forEach(([x, r]) => { s.rect(x, 10, 3, 4, r, 2); s.light(x, 11, 3, 2, 1); });
    s.rect(4, 22, 24, 5, 'Putz & Stoff', 2); s.rect(4, 27, 24, 1, 'Holz', 2);
    for (const x of [5, 25]) s.rect(x, 28, 2, 3, 'Holz', 1);
    s.ellipse(8, 22, 4, 3, 'Frucht rot', 2); s.ellipse(14, 21, 5, 4, 'Frucht gelb', 2); s.ellipse(21, 22, 4, 3, 'Laub', 3);
  }
};
function baum(s, fruits) {
  s.shadow(17, 30, 11, 3);
  s.rect(14, 22, 4, 9, 'Holz', 2);
  s.ellipse(3, 2, 26, 22, 'Laub', 2);
  s.ellipse(8, 5, 11, 8, 'Laub', 3, false);
  if (fruits) for (const [x, y] of [[7, 10], [13, 7], [20, 9], [23, 15], [10, 16], [17, 18]]) s.rect(x, y, 2, 2, 'Frucht rot', 2, false);
}

/* ---------- Besucher (16 × 16, je 2 Frames, Fußpunkt 8/15) ---------- */
const BESUCHER = {
  schmetterling: f => s => {
    if (f === 0) { s.rect(4, 6, 3, 3, 'Blüte rosa', 2); s.rect(9, 6, 3, 3, 'Blüte rosa', 2); s.rect(5, 9, 2, 2, 'Blüte rosa', 1); s.rect(9, 9, 2, 2, 'Blüte rosa', 1); }
    else { s.rect(6, 6, 1, 4, 'Blüte rosa', 2, false); s.rect(9, 6, 1, 4, 'Blüte rosa', 2, false); }
    s.vline(7, 7, 4, 'Umriss & Nacht', 2); s.vline(8, 7, 4, 'Umriss & Nacht', 2);
  },
  biene: f => s => {
    s.ellipse(5, 8, 6, 4, 'Frucht gelb', 2); s.vline(7, 8, 4, 'Umriss & Nacht', 1); s.vline(9, 8, 4, 'Umriss & Nacht', 1);
    if (f === 0) { s.rect(6, 6, 2, 2, 'Glas', 3, false); s.rect(9, 6, 2, 2, 'Glas', 3, false); } else { s.rect(5, 7, 2, 1, 'Glas', 3, false); s.rect(10, 7, 2, 1, 'Glas', 3, false); }
  },
  frosch: f => s => {
    s.shadow(8, 15, 4, 1);
    s.ellipse(4, 9, 8, 6, 'Laub', 1);
    s.rect(5, 8, 2, 2, 'Laub', 3, false); s.rect(9, 8, 2, 2, 'Laub', 3, false); s.px(5, 8, 'Umriss & Nacht', 0); s.px(10, 8, 'Umriss & Nacht', 0);
    if (f === 1) s.rect(6, 13, 4, 1, 'Gras', 4, false);
    s.rect(3, 13, 2, 2, 'Laub', 0, false); s.rect(11, 13, 2, 2, 'Laub', 0, false);
  },
  eichhoernchen: f => s => {
    s.shadow(8, 15, 4, 1);
    s.ellipse(f ? 9 : 8, 2, 5, 10, 'Frucht gelb', 0);
    s.ellipse(3, 7, 6, 8, 'Holz', 3);
    s.rect(3, 6, 2, 2, 'Holz', 3); s.px(4, 9, 'Umriss & Nacht', 0);
  }
};

function main() {
  const out = path.join(HERE, 'entdeckungen');
  const orte = Object.keys(ORTE), fr1 = orte.map(k => { const s = new Sprite(32, 32); ORTE[k](s); return s.render(); });
  const a = exportSheet('hof-entdeckungen', fr1, orte, orte.map((n, i) => ({ name: n, from: i, to: i, direction: 'forward' })), [32, 32], out);
  const bes = Object.keys(BESUCHER), fr2 = [], names = [], tags = [];
  bes.forEach((k, i) => { [0, 1].forEach(f => { const s = new Sprite(16, 16); BESUCHER[k](f)(s); fr2.push(s.render()); names.push(`${k}-${f + 1}`); }); tags.push({ name: k, from: 2 * i, to: 2 * i + 1, direction: 'pingpong' }); });
  const b = exportSheet('hof-besucher', fr2, names, tags, [16, 16], out, 260);
  // Vorschau 4× auf Grasgrund (nur Ebene base)
  const k = 4, gap = 4, VW = (a.W + gap + b.W) * k, VH = 32 * k, prev = new Uint8Array(VW * VH * 4), [gr, gg, gb] = rgb(RAMPS.Gras[2]);
  for (let i = 0; i < VW * VH; i++) { prev[i * 4] = gr; prev[i * 4 + 1] = gg; prev[i * 4 + 2] = gb; prev[i * 4 + 3] = 255; }
  const blit = (src, SW, ox, rows) => { for (let y = 0; y < rows; y++) for (let x = 0; x < SW; x++) { const s = (y * SW + x) * 4; if (!src[s + 3]) continue;
    for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) { const d = (((y) * k + j) * VW + (ox + x) * k + i) * 4; prev[d] = src[s]; prev[d + 1] = src[s + 1]; prev[d + 2] = src[s + 2]; } } };
  blit(a.img, a.W, 0, 32); blit(b.img, b.W, a.W + gap, 16);
  fs.writeFileSync(path.join(HERE, 'vorschau-entdeckungen.png'), png(VW, VH, prev));
  console.log(`entdeckungen/: hof-entdeckungen (${orte.length} × 32×32), hof-besucher (${bes.length} × 2 Frames 16×16), Vorschau vorschau-entdeckungen.png`);
}
if (require.main === module) main();
module.exports = { Sprite, exportSheet, png };
