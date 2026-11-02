/* Life's a Game · Hof-Szene (Draufsicht)
 * Statische Ebene wird nur bei Änderung neu gezeichnet (Schlüssel aus Jahreszeit, Wetter, Tageszeit, Beeten, Gebäuden, Deko).
 * Pro Bild kommen nur bewegte Teile dazu (15 fps, Pause im Hintergrund-Tab).
 * v8a: Mit Hof-Karte (sprites/hof-karte.json) zeichnet die Szene Sprite-Sheets (Style-Guide Stil B):
 *   Boden → Schatten (eine Farbe, 30 %, nachts aus) → base nach Fußpunkt-y → Tönung je Tageszeit (multiplizieren) → glow (addieren).
 *   Fehlt die Karte, gilt der bisherige Zeichencode; fehlt ein einzelnes Sheet, zeichnet der bisherige Code nur dieses Objekt.
 * Die Szene rechnet in Höhe 160 und wird auf die Anzeige-Canvas nur ganzzahlig vergrößert (1×, 2×, 3×).
 * v8a.1: Der Kern (256 × 160, alle Spielobjekte) steht mittig; ist eine Anzeige breiter, zeigt sie seitlich mehr Welt
 * (Randzonen der Karte, nur Natur). Ohne Karte bleibt es bei 256 px Breite.
 */
(function (root) {
  'use strict';
  const L = root.LAG, SP = root.LAGSprites, SH = root.LAGSheets, O = SP.O;
  const W = 256, H = 160;
  const mix = (a, b, t) => { const h = x => { const n = parseInt(x.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }; const A = h(a), B = h(b); return '#' + ((1 << 24) | A.map((v, i) => Math.round(v + (B[i] - v) * t)).reduce((acc, v, i) => acc | (v << (16 - 8 * i)), 0)).toString(16).slice(1); };
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  const rect = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  function disc(c, cx, cy, r) { for (let dy = -r; dy <= r; dy++) { const w = Math.floor(Math.sqrt(r * r - dy * dy)); c.fillRect(cx - w, cy + dy, 2 * w + 1, 1); } }
  function oval(c, cx, cy, rx, ry) { for (let dy = -ry; dy <= ry; dy++) { const w = Math.floor(rx * Math.sqrt(1 - (dy * dy) / (ry * ry))); c.fillRect(cx - w, cy + dy, 2 * w + 1, 1); } }
  const riverX = y => 20 + Math.round(5 * Math.sin(y / 26) + 2 * Math.sin(y / 9));
  const SEASONPAL = {
    Frühling: { gA: '#5a9a66', gB: '#54935f', tuft: '#3f7a4c', tree: ['#2e5a3e', '#3f8a4c', '#6fb860'], blossom: '#f6b6d0' },
    Sommer: { gA: '#4f8a62', gB: '#4a845c', tuft: '#3a6c4a', tree: ['#24503a', '#356e46', '#5a9c5a'] },
    Herbst: { gA: '#7c8a56', gB: '#768450', tuft: '#5e6a3c', tree: ['#7a3a1e', '#c46a2a', '#eaa24a'] },
    Winter: { gA: '#d8e4ea', gB: '#cfdce4', tuft: '#aebfca', tree: ['#3a5a50', '#5a7a70', '#e8f0f4'] }
  };
  const BEDS = (() => { const a = []; [72, 112, 134].forEach(y => [132, 154, 196, 218].forEach(x => a.push([x, y]))); return a; })();
  const BSLOTS = [[134, 20], [172, 16], [212, 20], [34, 60], [38, 114], [106, 122]];
  const DSLOTS = [[68, 62], [106, 62], [70, 84], [108, 84], [98, 138], [72, 108], [110, 107], [124, 60], [236, 58], [72, 130], [60, 148], [128, 150]];
  const TREES = []; for (let x = 44; x < 250; x += 13) TREES.push([x, ((x / 13) | 0) % 2 ? 3 : 6, 7, 'oak']); for (let y = 24; y < 156; y += 15) TREES.push([250, y, 6, ((y / 15) | 0) % 2 ? 'pine' : 'oak']);
  [[40, 156, 7, 'oak'], [150, 158, 6, 'pine'], [176, 158, 6, 'oak'], [204, 158, 6, 'pine'], [48, 34, 5, 'pine'], [126, 44, 5, 'pine'], [240, 140, 5, 'oak']].forEach(t => TREES.push(t));
  const ROCKS = [[50, 100], [118, 98], [244, 104], [66, 152], [140, 92], [48, 128]];
  const WAYPTS = [[90, 60], [90, 99], [136, 99], [186, 99], [186, 56], [186, 99], [238, 99], [90, 99], [90, 150], [90, 99]];
  const LEGACY = { way: WAYPTS, deko: DSLOTS, chick: [60, 108, 22, 42], z: [116, 12] };
  // Palette Stil B (art/palette-stil-b.json), nur die Rampen für den Boden
  const PAL = {
    gras: ['#1c4f20', '#3a7d30', '#67aa46', '#92bc6c', '#b6c997'], weg: ['#a96f3d', '#c1945d', '#ceb488', '#d9cbac', '#e6e0cf'],
    wasser: ['#182062', '#284995', '#397fc6', '#6aaacd', '#98cad8'], erde: ['#311312', '#552d21', '#774f31', '#917043', '#a89157'],
    holz: ['#371111', '#683022', '#975c35', '#b8864d', '#c3ac7a'], nacht: ['#1b1630', '#2a2346', '#3b3560', '#4f4a7a']
  };
  const SEASONGROUND = { Frühling: null, Sommer: null, Herbst: ['#a08a40', .35], Winter: ['#e8eef4', .75] };
  const TINT = { morning: '#ffe8d6', day: null, evening: '#b59bd0', night: '#4a4f8a' };   // Multiplizieren je Tageszeit
  const SHADOW = { color: PAL.nacht[1], alpha: .3 };
  const BLD = Lv => { const i = Math.min(Lv, 5); return { w: [0, 0, 16, 20, 24, 28][i], rh: [0, 0, 6, 8, 9, 10][i], wh: [0, 0, 6, 7, 8, 9][i] }; };

  function createScene(canvas, deps) {
    // deps: state(), D(), weather(), phase(), sleeps(), thunder(), onMood(m), reduce
    // Die Szene zeichnet in eine feste 256 × 160-Fläche; sichtbare Canvas (kompakt, Großansicht) bekommen sie ganzzahlig vergrößert.
    const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
    const frameC = mk(), g = frameC.getContext('2d'); g.imageSmoothingEnabled = false;
    const base = mk(), glow = mk(), shc = mk(), views = new Map();
    let mode = 'legacy', M = null, lay = LEGACY;
    let FW = W, OX = 0;                                  // Breite der gezeichneten Welt, Versatz des 256er-Kerns darin
    const core = (c, on) => c.setTransform(1, 0, 0, 1, on ? OX : 0, 0);
    let env = null, envKey = '', lights = [], parts = [], shadows = [], smoke = [], frame = 0, flash = 0, nextBolt = 0, animals = [], glints = [];
    const walker = { i: 0, x: 90, y: 60, pause: 0, flip: false };
    function setMode() {
      M = SH && SH.map(); mode = M ? 'sprites' : 'legacy';
      lay = M ? { way: M.wanderweg, deko: M.deko, chick: M.huehner, z: M.schlafZ } : LEGACY;
      walker.i = 0; [walker.x, walker.y] = lay.way[0];
    }
    const activeHabits = () => deps.state().habits.filter(h => !h.archivedAt).slice(0, L.C.MAX_BEDS);
    const styleOf = s => SP.STYLES[s.st % SP.STYLES.length];
    const skillById = id => deps.state().skills.find(s => s.id === id) || deps.state().skills[0];

    function computeEnv() {
      const S = deps.state(), D = deps.D(), season = L.seasonOf(new Date().getMonth()), weather = deps.weather(), phase = deps.phase();
      const beds = activeHabits().map(h => { const x = D.H[h.id], s = skillById(h.skillId); return [h.id, x.stage, s ? s.st : 0, x.graduated ? 1 : 0, h.plantType].join(':'); }).join(',');
      const blds = S.skills.map(s => s.st + ':' + D.levels[s.id].l + ':' + s.icon + ':' + s.buildingType).join(','), pl = S.chest.placed.map(p => p.itemId + (p.slot ?? '')).join(',');
      return { season, weather, phase, key: [mode, season, weather, phase, beds, blds, pl].join('|') };
    }
    function drawTree(c, x, y, r, kind, P, night) {
      const [d, m, l] = P.tree.map(t => mix(t, '#0e1a2a', night ? .35 : 0));
      c.fillStyle = 'rgba(10,20,30,.28)'; oval(c, x + 3, y + r + 1, r, Math.max(2, r >> 1));
      if (kind === 'pine') { rect(c, x - 1, y + r - 2, 3, 4, '#4a2e1e'); const n = Math.ceil(r * .8); for (let i = 0; i < 3; i++) { const yy = y - r + i * Math.ceil(r * .7), w = 2 + i * Math.ceil(r * .55); for (let j = 0; j < n; j++) { const ww = Math.round(w * j / n) + 1; rect(c, x - ww - 1, yy + j, ww * 2 + 3, 1, O); rect(c, x - ww, yy + j, ww * 2 + 1, 1, j % 3 === 0 ? l : i % 2 ? m : d); } } return; }
      rect(c, x - 1, y + r - 3, 3, 5, '#5a3a28'); c.fillStyle = O; disc(c, x, y, r + 1); c.fillStyle = d; disc(c, x, y, r); c.fillStyle = m; disc(c, x - 1, y - 1, r - 2); c.fillStyle = l; disc(c, x - 2, y - 2, Math.max(1, r - 5));
      if (P.blossom) { c.fillStyle = P.blossom; [[1, -2], [-3, 1], [2, 2], [-1, -4]].forEach(([a, b]) => c.fillRect(x + a, y + b, 1, 1)); }
    }
    function drawHouse(c, x, y, w, roofH, wallH, roof, opt) {
      const night = opt.night, rD = mix(roof, '#10102a', .35), rL = mix(roof, '#ffffff', .25), wall = mix(opt.wall || '#d9b88a', '#2a2a4a', night ? .4 : 0), wallS = mix(wall, '#4a3a2a', .3), beam = mix('#6b4428', '#1a1a2a', night ? .3 : 0);
      c.fillStyle = 'rgba(10,20,30,.3)'; c.fillRect(x + 3, y + 3, w, roofH + wallH);
      rect(c, x - 1, y + roofH - 1, w + 2, wallH + 2, O); rect(c, x, y + roofH, w, wallH, wall); rect(c, x, y + roofH + wallH - 2, w, 2, mix('#8a8a90', '#2a2a40', night ? .4 : 0)); rect(c, x, y + roofH, w, 1, wallS);
      for (let bx = x + 6; bx < x + w - 2; bx += 8) rect(c, bx, y + roofH + 1, 1, wallH - 3, beam);
      rect(c, x - 3, y - 1, w + 6, roofH + 1, O); for (let j = 0; j < roofH; j++) rect(c, x - 2, y + j, w + 4, 1, j === 0 ? rL : j % 3 === 2 ? rD : roof);
      rect(c, x + Math.floor(w / 2), y, 1, roofH, rD); rect(c, x - 2, y + roofH - 1, w + 4, 1, rD);
      if (opt.chimney) { rect(c, x + w - 9, y - 6, 6, 8, O); rect(c, x + w - 8, y - 5, 4, 6, '#8a5a4a'); if (opt.smokeAt) opt.smokeAt.push([x + w - 6, y - 7]); }
      const dw = Math.max(4, Math.floor(w / 7)), dx = x + Math.floor((w - dw) / 2), dh = Math.min(wallH - 3, 8);
      rect(c, dx - 1, y + roofH + wallH - dh - 1, dw + 2, dh + 1, O); rect(c, dx, y + roofH + wallH - dh, dw, dh, mix('#7a4a2a', '#1a1a2a', night ? .3 : 0)); rect(c, dx + dw - 2, y + roofH + wallH - Math.ceil(dh / 2), 1, 1, '#f6c64a');
      for (let i = 0; i < opt.windows; i++) {
        const wx = i % 2 === 0 ? x + 3 + Math.floor(i / 2) * 7 : x + w - 8 - Math.floor(i / 2) * 7, wy = y + roofH + 2;
        if (wx < x + 2 || wx + 5 > x + w - 1 || (wx + 5 > dx - 1 && wx < dx + dw + 1)) continue;
        rect(c, wx - 1, wy - 1, 6, 5, O); rect(c, wx, wy, 4, 3, opt.lit ? '#ffd27a' : mix('#9fd3e8', '#3a4a6a', night ? .5 : 0)); rect(c, wx + 2, wy, 1, 3, beam); if (opt.lit) lights.push([wx + 2, wy + 1, 9]);
      }
      if (opt.flag) { rect(c, x + w + 2, y - 8, 1, 14, O); rect(c, x + w + 3, y - 8, 5, 4, opt.flag); }
      return { doorX: dx + Math.floor(dw / 2), bottom: y + roofH + wallH };
    }
    /** Bisheriges Fähigkeitsgebäude (Code-Zeichnung), links oben (x, y), 28 px hoch. */
    function drawSkillLegacy(c, s, x, y, Lv, o) {
      const st = styleOf(s);
      if (Lv <= 1) { rect(c, x, y + 10, 14, 12, o.dk('#7a5236')); [[x, y + 9], [x + 13, y + 9], [x, y + 21], [x + 13, y + 21]].forEach(([a, b]) => rect(c, a, b, 1, 3, '#c99a5a')); rect(c, x + 4, y + 13, 6, 5, O); rect(c, x + 5, y + 14, 4, 3, '#d99a5a'); }
      else { const b = BLD(Lv); drawHouse(c, x, y + (28 - b.rh - b.wh), b.w, b.rh, b.wh, st.c, { night: o.night, windows: Lv >= 3 ? (Lv >= 4 ? 2 : 1) : 0, chimney: Lv >= 4, smokeAt: Lv >= 4 ? o.smokeAt : null, lit: o.lit, flag: Lv >= 5 ? st.hi : null }); }
      c.drawImage(SP.sprite(s.icon), x - 2, y + 22);
    }
    function buildBase(e) { if (mode === 'sprites') buildSprites(e); else buildLegacy(e); }
    function buildLegacy(e) {
      const S = deps.state(), D = deps.D(), c = base.getContext('2d'), P = SEASONPAL[e.season], night = e.phase === 'night', lit = night || e.phase === 'evening' || e.weather === 'gewitter', dk = t => mix(t, '#1a1a2a', night ? .3 : 0);
      lights = []; const smokeAt = []; glow.getContext('2d').clearRect(0, 0, W, H);
      const gA = mix(P.gA, '#10203a', night ? .3 : 0), gB = mix(P.gB, '#10203a', night ? .3 : 0);
      for (let ty = 0; ty < H; ty += 8) for (let tx = 0; tx < W; tx += 8) rect(c, tx, ty, 8, 8, ((tx + ty) / 8) % 2 ? gA : gB);
      const r = L.rng(9); for (let i = 0; i < 180; i++) { const x = Math.floor(r() * W), y = Math.floor(r() * H); rect(c, x, y, 1, 2, P.tuft); rect(c, x + 2, y + 1, 1, 1, P.tuft); }
      if (e.season !== 'Winter') for (let i = 0; i < 40; i++) rect(c, Math.floor(r() * W), Math.floor(r() * H), 1, 1, pick(r, ['#f6e27a', '#f6a6c8', '#ffffff', '#b8a8ff']));
      const water = mix(e.season === 'Winter' ? '#6a8aa8' : '#2f4f6e', '#0e1a3a', night ? .35 : 0), waterL = mix(water, '#8fb8d8', .25), waterD = mix(water, '#101a30', .3), bank = mix(P.tuft, '#1a2a20', .3);
      for (let y = 0; y < H; y++) { const cx = riverX(y), l = cx - 11; rect(c, l - 2, y, 26, 1, bank); rect(c, l, y, 22, 1, water); rect(c, cx - 3, y, 6, 1, waterD); rect(c, l, y, 2, 1, waterL); rect(c, l + 20, y, 2, 1, waterL); }
      if (e.season !== 'Winter') [[16, 30], [24, 70], [14, 124], [22, 146]].forEach(([x, y]) => { rect(c, x, y, 3, 2, '#4f9a5a'); rect(c, x + 1, y, 1, 1, '#7fcf8a'); });
      const pc = e.season === 'Winter' ? '#e8eef2' : dk('#c9a877'), pe = mix(pc, '#5a3a20', .3), pd = mix(pc, '#7a5a3a', .15);
      const segs = [[30, 95, 216, 10], [86, 56, 10, 40], [86, 104, 10, 56], [182, 46, 10, 50], [40, 78, 10, 18], [118, 104, 8, 20]];
      segs.forEach(([x, y, w, h]) => rect(c, x - 1, y - 1, w + 2, h + 2, pe)); segs.forEach(([x, y, w, h]) => rect(c, x, y, w, h, pc));
      const pr = L.rng(4); for (let i = 0; i < 70; i++) { const s = segs[Math.floor(pr() * segs.length)]; rect(c, s[0] + Math.floor(pr() * s[2]), s[1] + Math.floor(pr() * s[3]), 1, 1, pd); }
      const dl = riverX(99) - 13, plank = dk('#a8784a'); rect(c, dl - 1, 94, 28, 12, O); for (let x = dl; x < dl + 26; x++) rect(c, x, 95, 1, 10, x % 3 === 0 ? mix(plank, '#3a2010', .35) : plank);
      ROCKS.forEach(([x, y]) => { rect(c, x - 1, y - 1, 7, 5, O); rect(c, x, y, 5, 3, '#7a828c'); rect(c, x, y, 4, 1, '#a8b0b8'); });
      TREES.filter(t => t[1] < 20).forEach(t => drawTree(c, t[0], t[1], t[2], t[3], P, night));
      const fh = drawHouse(c, 62, 20, 52, 16, 14, '#5a548e', { night, windows: 4, chimney: true, smokeAt, lit });
      const porch = dk('#a8784a'); rect(c, 61, fh.bottom, 54, 4, O); rect(c, 62, fh.bottom, 52, 3, porch); for (let x = 64; x < 114; x += 8) rect(c, x, fh.bottom, 1, 3, mix(porch, '#3a2010', .4));
      if (e.season === 'Winter') rect(c, 60, 19, 56, 3, '#f6f8ff');
      S.skills.forEach((s, i) => { if (i < BSLOTS.length) drawSkillLegacy(c, s, BSLOTS[i][0], BSLOTS[i][1], D.levels[s.id].l, { night, lit, smokeAt, dk }); });
      activeHabits().forEach((h, i) => {
        const [x, y] = BEDS[i], d = D.H[h.id], sk = skillById(h.skillId), st = sk ? styleOf(sk) : SP.STYLES[0], fw = dk('#b88a52'), soil = mix('#7a5236', '#1a1020', night ? .3 : 0);
        rect(c, x - 1, y - 1, 22, 18, O); rect(c, x, y, 20, 16, fw); rect(c, x + 1, y + 1, 18, 14, soil); for (let k = 0; k < 2; k++) rect(c, x + 1, y + 6 + k * 5, 18, 1, mix(soil, '#2a1408', .35));
        [[x, y], [x + 19, y], [x, y + 15], [x + 19, y + 15], [x + 9, y]].forEach(([a, b]) => rect(c, a, b, 1, 1, mix(fw, '#3a2010', .5)));
        const spr = SP.sprite('p' + d.stage, { F: st.c, f: st.dk }); for (let r2 = 0; r2 < 2; r2++) for (let k = 0; k < 3; k++) c.drawImage(spr, x + 2 + k * 6, y + 2 + r2 * 7);
        if (d.graduated) { rect(c, x + 17, y - 4, 1, 6, O); rect(c, x + 18, y - 4, 3, 2, '#f4d58e'); }
      });
      S.chest.placed.forEach(p => {
        if (L.ITEMS[p.itemId].animal || p.slot === undefined) return; const [x, y] = DSLOTS[p.slot] || [0, 0], spr = SP.sprite(p.itemId);
        c.fillStyle = 'rgba(10,20,30,.25)'; c.fillRect(x + 1, y + spr.height - 1, spr.width, 2); c.drawImage(spr, x, y); if (p.itemId === 'lantern' && lit) lights.push([x + 3, y + 2, 14]);
      });
      TREES.filter(t => t[1] >= 20).forEach(t => drawTree(c, t[0], t[1], t[2], t[3], P, night));
      if (lit) lights.push([fh.doorX, fh.bottom + 2, 10]);
      smoke.length = 0; e.smokeAt = smokeAt;
    }
    /* ---------- v8a: Hof aus Karte und Sprite-Sheets ---------- */
    const seasonal = (e, col) => { const s = SEASONGROUND[e.season]; return s ? mix(col, s[0], s[1]) : col; };
    function drawGround(c, e) {
      const B = M.boden, r = L.rng(M.seed), gr = PAL.gras.map(x => seasonal(e, x)), wg = e.season === 'Winter' ? PAL.weg.map(x => mix(x, '#f2f4f8', .5)) : PAL.weg;
      const wa = e.season === 'Winter' ? PAL.wasser.map(x => mix(x, '#c8d8e8', .55)) : PAL.wasser, er = PAL.erde;
      const x0 = -OX, x1 = FW - OX;                      // ganze sichtbare Welt in Kern-Koordinaten
      rect(c, x0, 0, FW, H, gr[2]);
      // große, weiche Grasflächen in anderen Tönen
      for (const [cx, cy, rx, ry, idx] of B.flecken) { c.fillStyle = gr[idx]; for (let y = Math.max(0, cy - ry); y < Math.min(H, cy + ry); y++) for (let x = Math.max(x0, cx - rx); x < Math.min(x1, cx + rx); x++) { const v = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2; if (v < .75 || (v < 1 && (x + y) % 2 === 0)) c.fillRect(x, y, 1, 1); } }
      // Grasrauschen in festen 256er-Streifen, damit es bei jeder Breite gleich aussieht
      for (let sx = Math.floor(x0 / W) * W; sx < x1; sx += W) { const rs = L.rng(M.seed + sx); for (let i = 0; i < W * H / 10; i++) rect(c, sx + Math.floor(rs() * W), Math.floor(rs() * H), 1, 1, gr[rs() < .5 ? 1 : 3]); }
      // Wege mit unregelmäßigem Rand
      for (const [x0, y0, w, h] of B.wege) {
        rect(c, x0, y0, w, h, wg[2]);
        if (w > h) { for (let x = x0; x < x0 + w; x++) { if (r() < .4) rect(c, x, y0 - 1, 1, 1, wg[2]); if (r() < .35) rect(c, x, y0 + h, 1, 1, wg[1]); } rect(c, x0, y0, w, 1, wg[3]); rect(c, x0, y0 + h - 1, w, 1, wg[1]); }
        else for (let y = y0; y < y0 + h; y++) { if (r() < .4) rect(c, x0 - 1, y, 1, 1, wg[2]); if (r() < .35) rect(c, x0 + w, y, 1, 1, wg[1]); }
        for (let i = 0; i < w * h / 14; i++) rect(c, x0 + Math.floor(r() * w), y0 + Math.floor(r() * h), 1, 1, wg[r() < .5 ? 1 : 3]);
      }
      // Teich mit Ufer
      const T = B.teich; c.fillStyle = er[2]; oval(c, T.cx, T.cy, T.rx + 1, T.ry + 1); c.fillStyle = wa[2]; oval(c, T.cx, T.cy, T.rx - 2, T.ry - 1);
      c.fillStyle = wa[1]; oval(c, T.cx - 1, T.cy + 1, T.rx - 10, T.ry - 6); rect(c, T.cx - 14, T.cy - 8, 17, 1, wa[3]); rect(c, T.cx - 6, T.cy + 6, 12, 1, wa[3]);
      for (const [cx, cy] of B.erdstellen) { c.fillStyle = er[3]; oval(c, cx, cy, 4, 2); }
    }
    /** Beet nach Style-Guide 2: Holzrahmen mit Lichtkante und Eckpfosten, dunkle gefurchte Erde, Schlagschatten, heller Trampelrand, Schild in der Fähigkeitsfarbe. Vorlage art/platzhalter/hof.py. */
    function drawBed(c, x, y, sign, e) {
      const BW = 48, wood = PAL.holz, soil = PAL.erde, gr = PAL.gras.map(v => seasonal(e, v));
      c.fillStyle = gr[3]; for (let yy = y - 1; yy < y + 25; yy++) for (let xx = x - 5; xx < x + BW + 5; xx++) { const edge = xx < x - 3 || xx > x + BW + 2 || yy < y + 1 || yy > y + 22; if (!edge || (xx + yy) % 2 === 0) c.fillRect(xx, yy, 1, 1); }
      rect(c, x - 2, y + 21, BW + 4, 2, gr[0]); rect(c, x - 2, y + 2, BW + 4, 19, wood[0]); rect(c, x - 1, y + 3, BW + 2, 17, wood[2]);
      rect(c, x - 1, y + 3, BW + 2, 1, wood[4]); rect(c, x - 1, y + 19, BW + 2, 1, wood[1]);
      for (const bx of [x + 15, x + 32]) { rect(c, bx, y + 3, 1, 1, wood[1]); rect(c, bx, y + 19, 1, 1, wood[0]); }
      rect(c, x + 1, y + 5, BW - 2, 13, soil[0]); rect(c, x + 2, y + 6, BW - 3, 12, soil[1]);
      for (let yy = y + 8; yy < y + 17; yy += 3) { rect(c, x + 2, yy, BW - 3, 1, soil[2]); rect(c, x + 2, yy + 1, BW - 3, 1, soil[0]); }
      for (const [px, py] of [[x - 2, y + 1], [x + BW, y + 1], [x - 2, y + 19], [x + BW, y + 19]]) { rect(c, px, py, 2, 3, wood[3]); rect(c, px, py, 1, 1, wood[4]); }
      if (sign) { rect(c, x + BW - 4, y - 3, 1, 7, wood[1]); rect(c, x + BW - 8, y - 6, 9, 5, wood[0]); rect(c, x + BW - 7, y - 5, 7, 3, sign); }
    }
    const overlaps = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
    function buildSprites(e) {
      const S = deps.state(), D = deps.D(), c = base.getContext('2d'), gc = glow.getContext('2d'), sc = shc.getContext('2d');
      const night = e.phase === 'night', lit = night || e.phase === 'evening' || e.weather === 'gewitter', ident = x => x;
      lights = []; const smokeAt = [], items = [], occ = [];
      [c, gc, sc].forEach(x => { core(x, false); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.clearRect(0, 0, FW, H); core(x, true); });
      drawGround(c, e);
      // Fähigkeitsgebäude: Ausbaustufe aus dem Skill-Level
      S.skills.forEach((s, i) => {
        const slot = M.gebaeude[i]; if (!slot) return; const [fx, fy] = slot, Lv = D.levels[s.id].l, type = s.buildingType || L.suggestBuilding(s.icon);
        const sh = SH.get('gebaeude-' + type), tag = 'stufe-' + L.buildingStage(Lv); occ.push([fx - 22, fy - 44, 44, 46]);
        if (sh && sh.rect('base', tag)) items.push({ fy, fx, sh, tag, glow: lit && (tag === 'stufe-4' || type === 'gewaechshaus' || type === 'schmiede') });
        else items.push({ fy, draw: cc => drawSkillLegacy(cc, s, fx - 12, fy - 30, Lv, { night: false, lit, smokeAt, dk: ident }) });
      });
      // Beete: bis zu 3 Pflanzen je Beet, so viele Beete wie nötig (mindestens eins)
      const hs = activeHabits(), nBeds = Math.min(M.beete.length, Math.max(1, Math.ceil(hs.length / 3))), gap = M.pflanzenAbstand || 15;
      for (let b = 0; b < nBeds; b++) {
        const [bx, by] = M.beete[b], group = hs.slice(b * 3, b * 3 + 3), sk = group[0] && skillById(group[0].skillId);
        drawBed(c, bx, by, sk ? styleOf(sk).c : PAL.holz[3], e); occ.push([bx - 6, by - 7, 60, 33]);
        group.forEach((h, k) => {
          const d = D.H[h.id], sh = SH.get('pflanzen-' + (h.plantType || L.suggestPlant(S.habits.indexOf(h)))), tag = L.plantFrame(d.stage, d.graduated);
          const x0 = bx + 1 + k * gap, fy = by + 16;
          if (sh && sh.rect('base', tag)) items.push({ fy, fx: x0 + sh.anchor.x, sh, tag, glow: d.graduated });
          else { const st = sk ? styleOf(skillById(h.skillId) || sk) : SP.STYLES[0]; items.push({ fy, draw: cc => { cc.drawImage(SP.sprite('p' + d.stage, { F: st.c, f: st.dk }), x0 + 5, by + 8); if (d.graduated) { rect(cc, x0 + 12, by + 2, 1, 6, O); rect(cc, x0 + 13, by + 2, 3, 2, '#f4d58e'); } } }); }
        });
      }
      // Wohnhaus (noch Code-Zeichnung, bis es ein Sheet gibt)
      const WH = M.wohnhaus;
      items.push({ fy: WH.y + WH.dach + WH.wand + 4, draw: cc => {
        const fh = drawHouse(cc, WH.x, WH.y, WH.b, WH.dach, WH.wand, '#5a548e', { night: false, windows: 4, chimney: true, smokeAt, lit });
        const porch = '#a8784a'; rect(cc, WH.x - 1, fh.bottom, WH.b + 2, 4, O); rect(cc, WH.x, fh.bottom, WH.b, 3, porch); for (let x = WH.x + 2; x < WH.x + WH.b; x += 8) rect(cc, x, fh.bottom, 1, 3, mix(porch, '#3a2010', .4));
        if (e.season === 'Winter') rect(cc, WH.x - 2, WH.y - 1, WH.b + 4, 3, '#f6f8ff');
        if (lit) lights.push([fh.doorX, fh.bottom + 2, 10]);
      } });
      // Truhengegenstände auf ihren Deko-Plätzen
      S.chest.placed.forEach(p => {
        if (L.ITEMS[p.itemId].animal || p.slot === undefined || !lay.deko[p.slot]) return; const [x, y] = lay.deko[p.slot], spr = SP.sprite(p.itemId);
        occ.push([x - 2, y - 2, spr.width + 4, spr.height + 4]);
        items.push({ fy: y + spr.height, draw: cc => { cc.fillStyle = 'rgba(27,22,48,.3)'; cc.fillRect(x + 1, y + spr.height - 1, spr.width, 2); cc.drawImage(spr, x, y); if (p.itemId === 'lantern' && lit) lights.push([x + 3, y + 2, 14]); } });
      });
      // Zwischenbereiche: feste Teile und Streuung per festem Seed (kein Zufall bei jedem Start)
      const placed = [], frei = M.frei || [];
      const flora = (ref, fx, fy) => {
        const [sheet, tag] = ref.split(':'), sh = SH.get(sheet);
        if (sh && sh.rect('base', tag)) items.push({ fy, fx, sh, tag });
        else if (sheet === 'natur-baeume') items.push({ fy, draw: cc => drawTree(cc, fx, fy - 8, 7, tag === 'tanne' ? 'pine' : 'oak', SEASONPAL[e.season], false) });
      };
      M.zonen.forEach((z, zi) => {
        const r = L.rng(M.seed * 1000 + zi);
        if (z.fest) for (const [ref, x, y] of z.fest) {
          const sh = SH.get(ref.split(':')[0]), ax = sh ? sh.anchor.x : 8, ay = sh ? sh.anchor.y : 15, box = [x + 2, y + 4, 12, 12];
          if (occ.some(o => overlaps(o, box))) continue; placed.push(box); flora(ref, x + ax, y + ay);
        }
        if (z.rechteck) for (let i = 0; i < z.versuche; i++) {
          const [rx, ry, rw, rh] = z.rechteck, fx = rx + Math.floor(r() * rw), fy = ry + Math.floor(r() * rh), ref = z.teile[Math.floor(r() * z.teile.length)];
          const [aw, ah] = z.abstand || [12, 8], box = [fx - aw / 2, fy - ah, aw, ah];
          if (fy > H || [...frei, ...occ, ...placed].some(o => overlaps(o, box))) continue;
          placed.push(box); flora(ref, fx, fy);
        }
      });
      items.sort((a, b) => a.fy - b.fy);
      // Schatten: alle Schatten-Ebenen in eine Fläche, dann einheitlich in einer Farbe mit 30 % (nachts aus)
      if (!night) {
        items.forEach(it => { if (it.sh) SH.draw(sc, it.sh, 'shadow', it.tag, it.fx, it.fy); });
        core(sc, false); core(c, false); sc.globalCompositeOperation = 'source-in'; rect(sc, 0, 0, FW, H, SHADOW.color); sc.globalCompositeOperation = 'source-over';
        c.globalAlpha = SHADOW.alpha; c.drawImage(shc, 0, 0); c.globalAlpha = 1; core(c, true);
      }
      items.forEach(it => { if (it.sh) SH.draw(c, it.sh, 'base', it.tag, it.fx, it.fy); else it.draw(c); });
      items.forEach(it => { if (it.glow) SH.draw(gc, it.sh, 'glow', it.tag, it.fx, it.fy); });
      [c, gc, sc].forEach(x => core(x, false));
      smoke.length = 0; e.smokeAt = smokeAt;
    }
    const makeAnimals = () => deps.state().chest.placed.filter(p => L.ITEMS[p.itemId].animal).map((p, i) => p.itemId === 'duck' ? { t: 'duck', y: (20 + i * 37) % 120, v: .25, p: i * 2.1 } : { t: 'chicken', x: lay.chick[0] + 6 + i * 5, y: lay.chick[1] + 4 + i * 9, dx: .4, dy: .2 });
    // Ente: im Fluss (bisher) oder im Teich der Karte
    const duckPos = a => { if (mode !== 'sprites') return [riverX(a.y) - 2, Math.round(a.y)]; const T = M.boden.teich; return [Math.round(T.cx - 3 + Math.cos(a.p) * (T.rx - 12)), Math.round(T.cy - 2 + Math.sin(a.p) * (T.ry - 8))]; };
    function initDynamics(e) {
      parts = []; const rr = Math.random, n = { sonnig: 0, heiter: 2, bewoelkt: 5, regen: 6, gewitter: 7 }[e.weather], wet = e.weather === 'regen' || e.weather === 'gewitter';
      shadows = [...Array(n)].map(() => ({ x: rr() * FW, y: rr() * H, r: 14 + rr() * 16, v: .12 + rr() * .12 }));
      if (wet) { const snow = e.season === 'Winter'; for (let i = 0; i < (snow ? 80 : 130); i++) parts.push({ t: snow ? 'snow' : 'rain', x: rr() * FW, y: rr() * H, v: snow ? .35 + rr() * .35 : 3 + rr() * 2, life: 0 }); }
      else if (e.season === 'Winter') for (let i = 0; i < 30; i++) parts.push({ t: 'snow', x: rr() * FW, y: rr() * H, v: .2 + rr() * .2 });
      if (e.phase === 'night' && !wet && e.season !== 'Winter') for (let i = 0; i < 14; i++) parts.push({ t: 'fly', x: rr() * FW, y: rr() * H, p: rr() * 6.28 });
      if (!wet && (e.season === 'Herbst' || e.season === 'Frühling')) for (let i = 0; i < 8; i++) parts.push({ t: 'leaf', x: rr() * FW, y: rr() * H, p: rr() * 6.28, c: e.season === 'Herbst' ? pick(rr, SEASONPAL.Herbst.tree) : SEASONPAL.Frühling.blossom });
      animals = makeAnimals();
      deps.state().chest.placed.filter(p => p.itemId === 'beehive').forEach(p => { const [x, y] = lay.deko[p.slot] || [0, 0]; for (let i = 0; i < 3; i++) parts.push({ t: 'bee', cx: x + 3, cy: y + 2, p: rr() * 6.28 }); });
      nextBolt = frame + 60 + Math.floor(rr() * 90); flash = 0;
    }
    function tick() {
      frame++;
      shadows.forEach(s => { s.x += s.v; s.y += s.v * .3; if (s.x - s.r > FW) { s.x = -s.r; s.y = Math.random() * H; } });
      for (const p of parts) {
        if (p.t === 'rain') { if (p.life > 0) { if (--p.life === 0) { p.y = -Math.random() * 20; p.x = Math.random() * (FW + 20); } } else { p.y += p.v; p.x -= p.v * .2; if (p.y > H || Math.random() < .012) p.life = 3; } }
        else if (p.t === 'snow') { p.y += p.v; p.x += Math.sin((frame + p.x) * .04) * .3; if (p.y > H) { p.y = -2; p.x = Math.random() * FW; } }
        else if (p.t === 'fly') { p.p += .07; p.x = (p.x + Math.cos(p.p * .7) * .4 + FW) % FW; p.y = (p.y + Math.sin(p.p) * .3 + H) % H; }
        else if (p.t === 'leaf') { p.p += .07; p.x += .4 + Math.sin(p.p) * .5; p.y += .25; if (p.x > FW || p.y > H) { p.x = -4; p.y = Math.random() * H; } }
        else if (p.t === 'bee') p.p += .18;
      }
      if (env.smokeAt && frame % 6 === 0) env.smokeAt.forEach(([x, y]) => smoke.push({ x, y, l: 0 }));
      for (let i = smoke.length - 1; i >= 0; i--) { const s = smoke[i]; s.l++; s.y -= .35; s.x += .15 + Math.sin(s.l * .2) * .15; if (s.l > 40) smoke.splice(i, 1); }
      for (let i = glints.length - 1; i >= 0; i--) if (--glints[i].l <= 0) glints.splice(i, 1);
      if (walker.pause > 0) walker.pause--; else {
        const [tx, ty] = lay.way[(walker.i + 1) % lay.way.length], dx = tx - walker.x, dy = ty - walker.y, dist = Math.hypot(dx, dy);
        if (dist < .7) { walker.i = (walker.i + 1) % lay.way.length; walker.pause = Math.random() < .4 ? 30 + Math.floor(Math.random() * 40) : 0; } else { walker.x += dx / dist * .55; walker.y += dy / dist * .55; if (Math.abs(dx) > .3) walker.flip = dx < 0; }
      }
      const [cx0, cy0, cw, ch] = lay.chick;
      animals.forEach(a => { if (a.t === 'duck') { a.y += a.v; a.p += .01; if (a.y > H + 4) a.y = -6; } else { a.x += a.dx; a.y += a.dy; if (a.x < cx0 || a.x > cx0 + cw) a.dx *= -1; if (a.y < cy0 || a.y > cy0 + ch) a.dy *= -1; if (Math.random() < .02) { a.dx = (Math.random() - .5) * .8; a.dy = (Math.random() - .5) * .6; } } });
      if (env.weather === 'gewitter' && frame >= nextBolt) { flash = 1; nextBolt = frame + 90 + Math.floor(Math.random() * 150); deps.thunder(); }
      if (flash > 0) flash = Math.max(0, flash - .16);
    }
    function draw() {
      const S = deps.state(), D = deps.D(), e = env, night = e.phase === 'night';
      core(g, false); g.globalCompositeOperation = 'source-over'; g.drawImage(base, 0, 0);
      core(g, true);                                     // ab hier Kern-Koordinaten: Wasser, Tiere, Figur, Rauch
      const wl = night ? 'rgba(170,190,255,.35)' : 'rgba(220,240,255,.5)';
      if (mode === 'sprites') { const T = M.boden.teich; for (let k = 0; k < 7; k++) { const a = k * 0.9 + (deps.reduce ? 0 : frame * .01), r2 = .35 + (k % 3) * .2; rect(g, Math.round(T.cx + Math.cos(a) * T.rx * r2) - 1, Math.round(T.cy + Math.sin(a) * T.ry * r2), 3, 1, wl); } }
      else for (let k = 0; k < 26; k++) { const y = (k * 13 + Math.floor(frame * .6)) % H, x = riverX(y) - 7 + ((k * 7) % 12); rect(g, x, y, 3, 1, wl); }
      animals.forEach(a => { if (a.t === 'duck') { const [x, y] = duckPos(a); rect(g, x - 1, y + 4, 8, 1, 'rgba(220,240,255,.4)'); g.drawImage(SP.sprite('duck'), x, y); } });
      const s2 = S.skills[1];
      if (mode === 'legacy' && s2 && D.levels[s2.id].l >= 4) {
        const [bx, by] = BSLOTS[1], b = BLD(D.levels[s2.id].l), cx = bx + Math.floor(b.w / 2), cy = by + (28 - b.rh - b.wh) + 2, a = deps.reduce ? 0 : frame * .05;
        for (let k = 0; k < 4; k++) { const an = a + k * Math.PI / 2; for (let r2 = 2; r2 < 11; r2++) { const px = Math.round(cx + Math.cos(an) * r2), py = Math.round(cy + Math.sin(an) * r2); rect(g, px, py, 1, 1, O); if (r2 > 4) rect(g, px + Math.round(-Math.sin(an)), py + Math.round(Math.cos(an)), 1, 1, '#f2e6c8'); } }
        rect(g, cx - 1, cy - 1, 3, 3, '#7a4a2a');
      }
      smoke.forEach(s => { g.fillStyle = `rgba(220,224,232,${.45 * (1 - s.l / 40)})`; g.fillRect(Math.round(s.x), Math.round(s.y), s.l > 15 ? 3 : 2, s.l > 15 ? 3 : 2); });
      const step = deps.reduce ? 0 : Math.floor(frame / 5) % 2;
      g.fillStyle = 'rgba(10,20,30,.3)'; g.fillRect(Math.round(walker.x) - 3, Math.round(walker.y) + 5, 7, 2);
      g.drawImage(SP.sprite(walker.pause === 0 && step ? 'farmerB' : 'farmerA', null, walker.flip), Math.round(walker.x) - 4, Math.round(walker.y) - 7);
      animals.forEach(a => { if (a.t === 'chicken') { g.fillStyle = 'rgba(10,20,30,.25)'; g.fillRect(Math.round(a.x), Math.round(a.y) + 4, 5, 1); g.drawImage(SP.sprite('chicken', null, a.dx < 0), Math.round(a.x), Math.round(a.y)); } });
      for (const p of parts) if (p.t === 'bee') rect(g, Math.round(p.cx + Math.cos(p.p) * 6), Math.round(p.cy + Math.sin(p.p * 1.3) * 4), 1, 1, '#ffd84a');
      core(g, false);                                    // Wolken, Partikel und Tönung über die ganze Breite
      if (shadows.length) { g.fillStyle = e.weather === 'gewitter' ? 'rgba(8,12,24,.16)' : 'rgba(10,20,30,.12)'; shadows.forEach(s => oval(g, Math.round(s.x), Math.round(s.y), Math.round(s.r), Math.round(s.r * .6))); }
      for (const p of parts) {
        if (p.t === 'rain') { if (p.life > 0) rect(g, Math.round(p.x) - 1, Math.round(p.y), 3, 1, 'rgba(220,235,255,.55)'); else rect(g, Math.round(p.x), Math.round(p.y), 1, 3, 'rgba(190,215,255,.5)'); }
        else if (p.t === 'snow') rect(g, Math.round(p.x), Math.round(p.y), p.v > .45 ? 2 : 1, p.v > .45 ? 2 : 1, '#ffffff');
        else if (p.t === 'leaf') rect(g, Math.round(p.x), Math.round(p.y), 2, 1, p.c);
      }
      if (mode === 'sprites') { if (TINT[e.phase]) { g.globalCompositeOperation = 'multiply'; g.fillStyle = TINT[e.phase]; g.fillRect(0, 0, FW, H); g.globalCompositeOperation = 'source-over'; } }
      else { const grade = { night: 'rgba(14,18,56,.42)', evening: 'rgba(120,50,90,.14)', morning: 'rgba(255,170,120,.07)', day: null }[e.phase]; if (grade) { g.fillStyle = grade; g.fillRect(0, 0, FW, H); } }
      const wx = { bewoelkt: 'rgba(50,60,80,.08)', regen: 'rgba(30,40,70,.18)', gewitter: 'rgba(16,18,40,.28)' }[e.weather]; if (wx) { g.fillStyle = wx; g.fillRect(0, 0, FW, H); }
      g.globalCompositeOperation = 'lighter';
      if (mode === 'sprites') g.drawImage(glow, 0, 0);
      if (e.phase === 'day' && (e.weather === 'sonnig' || e.weather === 'heiter')) { g.fillStyle = `rgba(255,240,200,${.04 + .015 * Math.sin(frame * .05)})`; g.fillRect(0, 0, FW, H); }
      core(g, true);
      const fl = deps.reduce ? 0 : Math.floor(frame / 5) % 2; lights.forEach(([x, y, r]) => { g.fillStyle = 'rgba(255,180,80,.07)'; disc(g, x, y, r + fl); g.fillStyle = 'rgba(255,200,110,.09)'; disc(g, x, y, Math.max(2, r >> 1)); });
      core(g, false);
      for (const p of parts) if (p.t === 'fly' && Math.sin(p.p * 1.7) > -.2) { g.fillStyle = 'rgba(200,255,140,.2)'; disc(g, Math.round(p.x), Math.round(p.y), 2); rect(g, Math.round(p.x), Math.round(p.y), 1, 1, 'rgba(230,255,170,.9)'); }
      core(g, true);
      glints.forEach(gl => { const a = gl.l / 30; g.fillStyle = `rgba(255,236,150,${.5 * a})`; disc(g, gl.x, gl.y, 12 - Math.round(gl.l / 4)); });
      g.globalCompositeOperation = 'source-over';
      if (deps.sleeps()) { const zx = lay.z[0], zy = lay.z[1] - ((frame >> 2) % 10); g.fillStyle = 'rgba(240,240,255,.8)'; [[0, 0], [1, 0], [2, 0], [1, 1], [0, 2], [1, 2], [2, 2]].forEach(([a, b]) => g.fillRect(zx + a, zy + b, 1, 1)); }
      core(g, false);
      if (flash > 0) { g.fillStyle = `rgba(230,235,255,${flash * .5})`; g.fillRect(0, 0, FW, H); }
      present();
    }
    /** Überträgt das Bild ganzzahlig vergrößert und ohne Glätten auf alle sichtbaren Canvas. */
    function present() {
      views.forEach((v, cv) => { const x = cv.getContext('2d'), w = viewW(v); x.imageSmoothingEnabled = false; x.drawImage(frameC, Math.floor((FW - w) / 2), 0, w, H, 0, 0, cv.width, cv.height); });
    }
    const viewW = v => (mode === 'sprites' ? Math.max(W, v.w) : W);
    /** Größen anwenden: CSS-Größe = Breite·k × 160·k, Auflösung = CSS-Größe × devicePixelRatio; die Welt ist so breit wie die breiteste Ansicht. */
    function applyViews() {
      const dpr = root.devicePixelRatio || 1;
      views.forEach((v, cv) => { const w = viewW(v); cv.style.width = w * v.k + 'px'; cv.style.height = H * v.k + 'px'; cv.width = Math.round(w * v.k * dpr); cv.height = Math.round(H * v.k * dpr); });
      let fw = W; views.forEach(v => { fw = Math.max(fw, viewW(v)); });
      if (fw !== FW) { FW = fw; OX = Math.floor((FW - W) / 2); [frameC, base, glow, shc].forEach(c => { c.width = FW; }); g.imageSmoothingEnabled = false; if (env) update(true); }
      if (env) present();
    }
    /** Canvas als Ansicht anmelden: Faktor k (ganzzahlig) und gewünschte logische Breite w (mindestens 256, ohne Karte genau 256). */
    function view(cv, k, w) { views.set(cv, { k: Math.max(1, Math.round(k)), w: Math.floor(w || W) }); applyViews(); }
    function update(force) {
      const e = computeEnv();
      if (force || e.key !== envKey) { const big = force || !env || env.weather !== e.weather || env.phase !== e.phase || env.season !== e.season; env = e; envKey = e.key; buildBase(e); if (big) initDynamics(e); else animals = makeAnimals(); deps.onMood(e.weather); }
    }
    let last = 0, acc = 0, running = false; const STEP = 1000 / 15;
    function loop(ts) { requestAnimationFrame(loop); if (document.hidden) { last = ts; return; } acc += ts - last; last = ts; if (acc < STEP) return; acc %= STEP; update(); tick(); draw(); }
    view(canvas, 1);
    return {
      /** Startet nach dem Laden der Sprite-Sheets (assets: Promise); ohne Sheets oder bei Fehler mit dem bisherigen Zeichencode. */
      start(assets) {
        const go = () => { setMode(); applyViews(); update(true); if (deps.reduce) draw(); else if (!running) { running = true; requestAnimationFrame(loop); } };
        Promise.resolve(assets).catch(() => null).then(go);
      },
      view, unview(cv) { views.delete(cv); applyViews(); },
      mode: () => mode,
      refresh(force) { update(force); if (deps.reduce) draw(); },
      /** Kurzes Leuchten über einem Beet, z. B. bei einer Ernte. */
      glowBed(habitId) {
        const i = activeHabits().findIndex(h => h.id === habitId); if (i < 0) return;
        if (mode === 'sprites') { const bed = M.beete[Math.floor(i / 3)]; if (bed) glints.push({ x: bed[0] + 8 + (i % 3) * (M.pflanzenAbstand || 15), y: bed[1] + 10, l: 30 }); return; }
        const [x, y] = BEDS[i]; glints.push({ x: x + 10, y: y + 8, l: 30 });
      }
    };
  }
  root.LAGScene = { createScene };
})(typeof self !== 'undefined' ? self : this);
