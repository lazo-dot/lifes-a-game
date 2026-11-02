/* Life's a Game · Pixel-Sprites (geteilt von Szene und Oberfläche) */
(function (root) {
  'use strict';
  const O = '#1e2a30';
  const MAPS = {
    gem: { m: ["...oo...", "..oGGo..", ".oGwGGo.", "oGwGGGgo", "oGGGGggo", ".oGGggo.", "..oggo..", "...oo..."], p: { o: '#0f3d24', G: '#7fcf8a', g: '#367a4c', w: '#e0ffe4' } },
    flame: { m: ["...r....", "..rr....", "..rro...", ".rrooro.", ".rooyor.", "rooyyoor", "royyyyor", ".rryyrr."], p: { r: '#c4382a', o: '#f08a24', y: '#ffd84a' } },
    boot: { m: ["..oooo..", "..oRRo..", "..oRRo..", "..oRRo..", "..oRRoo.", ".oRRRRRo", "oRRRRRRo", "oooooooo"], p: { o: '#3a0e16', R: '#e0605a' } },
    book: { m: ["oooooooo", "oBBBBBBo", "oBwwwwBo", "oBBBBBBo", "oBwwwBBo", "oBBBBBBo", "oBBBBBBo", "oooooooo"], p: { o: '#101f4d', B: '#5a8fe0', w: '#dfe9ff' } },
    flower: { m: ["..pp....", ".pyyp...", "..pp.pp.", "..g.pyyp", "..g..pp.", "..gg.g..", "...ggg..", "....g..."], p: { p: '#f080c0', y: '#ffe066', g: '#4cb05a' } },
    crate: { m: ["oooooooo", "oWWWWWWo", "oWoWWoWo", "oWWooWWo", "oWWooWWo", "oWoWWoWo", "oWWWWWWo", "oooooooo"], p: { o: '#3a2010', W: '#d99a5a' } },
    heart: { m: [".oo..oo.", "oHHooHHo", "oHwHHHHo", "oHHHHHHo", ".oHHHHo.", "..oHHo..", "...oo...", "........"], p: { o: '#4e0e1e', H: '#f0607a', w: '#ffd0d8' } },
    note: { m: ["....oooo", "...oNNNo", "...oNooo", "...oN...", "...oN...", ".oooN...", "oNNNo...", ".ooo...."], p: { o: '#2a1a4a', N: '#b48cf0' } },
    pan: { m: ["........", ".oooo...", "oPPPPo..", "oPwPPooo", "oPPPPoWW", ".oooo.oo", "........", "........"], p: { o: '#2a2a2a', P: '#5a6070', w: '#9aa4b4', W: '#a8693a' } },
    coin: { m: ["..oooo..", ".oYYYYo.", "oYwYYYdo", "oYwYYYdo", "oYYYYYdo", "oYYYYddo", ".oddddo.", "..oooo.."], p: { o: '#5a2e10', Y: '#f6c64a', w: '#fff3b0', d: '#d18a1e' } },
    sonnig: { m: ["y..y..y.", ".y.yy.y.", "..yyyy..", "yyyYYyyy", ".yyYYyy.", "..yyyy..", ".y.yy.y.", "y..y..y."], p: { y: '#f0a81c', Y: '#ffe27a' } },
    heiter: { m: ["..y.y...", "...yyy..", "..yyyyy.", ".gggyyy.", "gwwwwgy.", "gwwwwwg.", ".ggggggg", "........"], p: { y: '#f0a81c', w: '#ffffff', g: '#8a98ab' } },
    bewoelkt: { m: ["........", "..ggg...", ".gwwwg..", "gwwwwwgg", "gwwwwwwg", ".gggggg.", "........", "........"], p: { w: '#ffffff', g: '#8d9ab0' } },
    regen: { m: [".ggggg..", "gwwwwwg.", "gggggggg", "........", ".b..b..b", "b..b..b.", "........", ".b..b..."], p: { w: '#e8eef5', g: '#7d8ba0', b: '#6aa8ff' } },
    gewitter: { m: [".ggggg..", "gGGGGGgg", "gggggggg", "...yy...", "..yy....", ".yyyy...", "...yy...", "..y....."], p: { g: '#5d6678', G: '#818ca0', y: '#ffd84a' } },
    p0: { m: [".....", ".....", ".....", ".l.l.", "..G..", "....."], p: { l: '#a8f2a0', G: '#3fa356' } },
    p1: { m: [".....", "..l..", ".lGl.", "..G..", "..G..", "....."], p: { l: '#a8f2a0', G: '#3fa356' } },
    p2: { m: ["..l..", ".lGl.", "lGGGl", ".lGl.", "..G..", "....."], p: { l: '#a8f2a0', G: '#3fa356' } },
    p3: { m: [".FwF.", "lGFGl", "lGGGl", ".lGl.", "..G..", "....."], p: { l: '#a8f2a0', G: '#3fa356', w: '#fff6e0' } },
    p4: { m: [".FFF.", "FwFFf", "lFFfl", ".lGl.", "..G..", "....."], p: { l: '#a8f2a0', G: '#3fa356', w: '#fff6e0' } },
    farmerA: { m: ["..HHHH..", ".HHHHHH.", "HhhhhhhH", "..SSSS..", "..SeeS..", "..SSSS..", ".CCCCCC.", "SCCCCCCS", "..CCCC..", "..PPPP..", "..P..P..", "..F..F.."], p: { H: '#f0cf74', h: '#c99a3e', S: '#f6c9a0', e: O, C: '#3f7fbf', P: '#4a3f6b', F: '#5a3a28' } },
    farmerB: { m: ["..HHHH..", ".HHHHHH.", "HhhhhhhH", "..SSSS..", "..SeeS..", "..SSSS..", ".CCCCCC.", "SCCCCCCS", "..CCCC..", "..PPPP..", ".P....P.", ".F....F."], p: { H: '#f0cf74', h: '#c99a3e', S: '#f6c9a0', e: O, C: '#3f7fbf', P: '#4a3f6b', F: '#5a3a28' } },
    gear: { m: ["...oo...", ".o.WW.o.", "oWWWWWWo", ".WWooWW.", ".WWooWW.", "oWWWWWWo", ".o.WW.o.", "...oo..."], p: { o: '#2a2a30', W: '#c8ccd4' } },
    speaker: { m: ["....o...", "...oW..w", "oooWW.w.", "oWWWW.w.", "oWWWW.w.", "oooWW.w.", "...oW..w", "....o..."], p: { o: '#2a2a30', W: '#e8e4d8', w: '#9fd3e8' } },
    mute: { m: ["....o...", "...oW...", "oooWWr.r", "oWWWW.r.", "oWWWW.r.", "oooWWr.r", "...oW...", "....o..."], p: { o: '#2a2a30', W: '#e8e4d8', r: '#e8604f' } },
    flowers: { m: ["oooooooo", "oPyPyPyo", "oGgGgGgo", "oyPyPyPo", "oGgGgGgo", "oooooooo"], p: { o: '#5a3a28', P: '#f080b0', y: '#ffe066', G: '#3f7a4c', g: '#5f9c5a' } },
    bench: { m: ["oooooooooo", "oWWWWWWWWo", "oooooooooo", "oWWWWWWWWo", "oooooooooo", ".o......o.", ".o......o."], p: { o: '#3a2414', W: '#c08a50' } },
    lantern: { m: ["..oo..", ".oyyo.", ".oYYo.", ".oyyo.", "..oo..", "..oo..", "..oo..", ".oooo."], p: { o: '#222428', y: '#f6c64a', Y: '#fff3b0' } },
    barrel: { m: [".oooo.", "oWWWWo", "oBBBBo", "oWWWWo", "oBBBBo", "oWWWWo", ".oooo."], p: { o: '#2a1a10', W: '#a8693a', B: '#5a3a20' } },
    pot: { m: ["gGgGg.", "GgGgG.", ".oRRo.", ".oRRo.", "..oo.."], p: { g: '#5f9c5a', G: '#3f7a4c', o: '#5a2a1a', R: '#c0603a' } },
    sign: { m: ["oooooo", "oWWWWo", "oWkkWo", "oooooo", "..oo..", "..oo.."], p: { o: '#2a1a10', W: '#c99a5a', k: '#5a3a20' } },
    hay: { m: [".oooooo.", "oYyYyYyo", "oyYyYyYo", "oYyYyYyo", ".oooooo."], p: { o: '#7a5a2a', Y: '#e8c56a', y: '#c99a3e' } },
    scarecrow: { m: ["..HHH...", ".HHHHH..", "..SSS...", "WTTTTTW.", "..TTT...", "...W....", "...W...."], p: { H: '#f0cf74', S: '#e2c27c', T: '#5a7bbf', W: '#7a4a24' } },
    chicken: { m: ["..r..", ".www.", "wwwwy", ".www.", "..y.."], p: { r: '#e0483a', w: '#fffaf0', y: '#f08a24' } },
    duck: { m: ["..gg..", ".gGgy.", "wwwww.", ".www.."], p: { g: '#2f7a4a', G: '#3fa060', y: '#f0a020', w: '#fffaf0' } },
    beehive: { m: [".oooo.", "oYYYYo", "oyyyyo", "oYYYYo", "oyyyyo", "oooooo"], p: { o: '#5a3a10', Y: '#f0c860', y: '#c8962a' } },
    well: { m: ["RRRRRRRR", "o......o", "oSSSSSSo", "oSbbbbSo", "oSbbbbSo", "oSSSSSSo", ".oooooo."], p: { R: '#7a4e30', o: '#2a2a30', S: '#9aa0a8', b: '#2f4f6e' } },
    wilma: { m: ["bbbbbbbbbbbb", "bbbooooooobb", "bboggggggGob", "boggSSSSgGgo", "bogSSSSSSgGo", "boSkkSSkkSgo", "boSkeSSekSgo", "bboSSSmSSsob", "bbboSSSSsobb", "bboTTTTTttob", "boTTTTTTTtto", "boTTTTTTTtto"], p: { o: O, g: '#c9c3dc', G: '#9a92b8', S: '#f0c39a', s: '#d09a7a', k: '#4a3a5a', e: O, m: '#c05a5a', T: '#5a9a7a', t: '#3e7a5e', b: '#3a5a48' } }
  };
  const STYLES = [{ c: '#e0605a', hi: '#f6a69c', dk: '#93291f' }, { c: '#5a8fe0', hi: '#a8c6f6', dk: '#24498f' }, { c: '#f080c0', hi: '#f8bcdc', dk: '#a33a75' }, { c: '#d99a5a', hi: '#f0c896', dk: '#8a5530' }, { c: '#f0607a', hi: '#f8a8b6', dk: '#9b1f33' }, { c: '#b48cf0', hi: '#dcc8fa', dk: '#5e3a9a' }];
  const ICONS = ['boot', 'book', 'flower', 'crate', 'heart', 'note', 'pan', 'coin'];
  const cache = new Map(), urls = new Map();
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function sprite(name, pal, flip) {
    const key = name + '|' + (pal ? JSON.stringify(pal) : '') + (flip ? 'f' : ''); let c = cache.get(key); if (c) return c;
    const mp = MAPS[name], p = Object.assign({}, mp.p, pal || {}), w = Math.max(...mp.m.map(r => r.length));
    c = document.createElement('canvas'); c.width = w; c.height = mp.m.length; const x = c.getContext('2d');
    mp.m.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const col = p[row[i]]; if (col) { x.fillStyle = col; x.fillRect(flip ? w - 1 - i : i, j, 1, 1); } } });
    cache.set(key, c); return c;
  }
  function img(name, scale = 2, alt = '', pal) {
    const key = name + scale + (pal ? JSON.stringify(pal) : ''), s = sprite(name, pal); let u = urls.get(key);
    if (!u) { const c = document.createElement('canvas'); c.width = s.width * scale; c.height = s.height * scale; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(s, 0, 0, c.width, c.height); u = c.toDataURL(); urls.set(key, u); }
    return `<img class="pi" src="${u}" alt="${esc(alt)}" width="${s.width * scale}" height="${s.height * scale}">`;
  }
  root.LAGSprites = { O, MAPS, STYLES, ICONS, sprite, img, esc };
})(typeof self !== 'undefined' ? self : this);
