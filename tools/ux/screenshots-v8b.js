/* Life's a Game · Screenshots und Messung v8b (Headless-Chrome über das DevTools-Protokoll, ohne Abhängigkeiten)
 * Lädt den Test-Hof, stellt Deko und Tiere auf (nur für die Bilder) und speichert unter docs/screenshots-v8b/ (390 × 844 pt):
 *   hof-tag.png, hof-abend.png (Tab „Heute“), hof-tag-szene-3x.png, hof-abend-szene-3x.png (Szene dreifach, ohne Glätten),
 *   sammelalbum.png (Truhe), thema-<id>.png je Farbthema (auch „jahreszeit“) (Tab „Heute“ und Darstellung).
 * Prüft dabei: Szene 160 pt hoch, ganzzahlig, erster Haken ohne Scrollen, Tap-Flächen im Sammelalbum ≥ 44 pt.
 *   npm start   (in einem zweiten Terminal)
 *   node tools/ux/screenshots-v8b.js [http://localhost:8000/]
 * Benötigt Google Chrome und Node ≥ 22 (WebSocket).
 */
'use strict';
const fs = require('fs'), path = require('path'), { open, testhof } = require('./chrome');
const ROOT = path.resolve(__dirname, '..', '..'), OUT = path.join(ROOT, 'docs', 'screenshots-v8b');
const url = process.argv[2] || 'http://localhost:8000/';
const hof = testhof();
// Nur für die Bilder: sechs Deko-Plätze (Level 3) und Tiere belegt, ein paar Funde mehr in der Truhe.
hof.chest = {
  items: { bench: 1, flowers: 2, telescope: 1, leaf_pile: 1, egg_basket: 1, birdbath: 1 },
  placed: [['sunflower', 0], ['lantern', 1], ['wheelbarrow', 2], ['pumpkin_lantern', 3], ['well', 4], ['milk_can', 5]].map(([itemId, slot]) => ({ itemId, slot }))
    .concat(['chicken', 'chicken', 'cat', 'duck', 'rabbit', 'hedgehog'].map(itemId => ({ itemId })))
};
const THEMES = ['', 'wald', 'herbst', 'frost', 'meer', 'kirschbluete', 'pergament', 'jahreszeit'];

async function session(port, hour, minute, theme) {   // 8.2.1: Chrome-Steuerung aus tools/ux/chrome.js (port bleibt nur der Lesbarkeit halber)
  const s = await open({ width: 390, height: 844, dpr: 3, hour, minute });
  await s.loadHof(url, Object.assign({}, hof, theme ? { theme } : {}), { seen: false });
  const shot = (name, clip) => clip ? s.send('Page.captureScreenshot', { format: 'png', clip: Object.assign({ scale: 1 }, clip), captureBeyondViewport: true }).then(p => fs.writeFileSync(path.join(OUT, name), Buffer.from(p.data, 'base64')))
    : s.shot(path.join(OUT, name));
  return { ev: s.ev, shot, close: s.close };
}
const scene3x = `(()=>{ const s = document.querySelector('#scene'), w = Math.round(s.width * 160 / s.height), c = document.createElement('canvas'); c.width = w * 3; c.height = 480; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(s, 0, 0, c.width, c.height); return c.toDataURL(); })()`;
const firstCheck = `(()=>{ const c = document.querySelector('#p-today .chk'), b = c.getBoundingClientRect(); return { top: Math.round(b.top + scrollY), sichtbar: b.bottom <= innerHeight }; })()`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const old of fs.readdirSync(OUT)) if (old.endsWith('.png')) fs.rmSync(path.join(OUT, old));
  const report = {};
  for (const [label, hh, mm, port] of [['tag', 12, 0, 9351], ['abend', 19, 30, 9352]]) {
    const s = await session(port, hh, mm, '');
    await s.ev('new Promise(r => setTimeout(r, 1200))');
    report[label] = { modus: await s.ev(`LAGScene ? document.querySelector('#scene').height / 160 : 0`), ersterHaken: await s.ev(firstCheck),
      sheets: await s.ev(`['deko', 'tiere', 'wohnhaus', 'bauer'].filter(n => LAGSheets.get(n))`) };
    await s.shot(`hof-${label}.png`);
    fs.writeFileSync(path.join(OUT, `hof-${label}-szene-3x.png`), Buffer.from((await s.ev(scene3x)).split(',')[1], 'base64'));
    if (label === 'tag') {
      await s.ev(`(async()=>{ document.querySelector('#t-chest').click(); await new Promise(r => setTimeout(r, 500)); })()`);
      const al = await s.ev(`(()=>{ const a = document.querySelector('.album'), b = a.getBoundingClientRect(), t = [...document.querySelectorAll('.alb-i')].map(e => e.getBoundingClientRect());
        return { x: 0, y: Math.round(b.top + scrollY) - 40, width: innerWidth, height: Math.round(b.height) + 50, kacheln: t.length, kleinsteKachel: [Math.round(Math.min(...t.map(r => r.width))), Math.round(Math.min(...t.map(r => r.height)))],
          gruppen: [...document.querySelectorAll('.alb-g h4')].map(h => h.textContent) }; })()`);
      report.album = { kacheln: al.kacheln, kleinsteKachel: al.kleinsteKachel, gruppen: al.gruppen };
      await s.shot('sammelalbum.png', { x: al.x, y: al.y, width: al.width, height: al.height });
    }
    await s.close();
  }
  report.themen = {};
  for (const [i, th] of THEMES.entries()) {
    const s = await session(9360 + i, 12, 0, th);
    report.themen[th || 'standard'] = { ersterHaken: await s.ev(firstCheck), aktiv: await s.ev(`document.documentElement.dataset.theme || 'standard'`) };
    await s.shot(`thema-${th || 'standard'}.png`);
    await s.ev(`(async()=>{ document.querySelector('#t-progress').click(); await new Promise(r => setTimeout(r, 500)); })()`);
    const lk = await s.ev(`(()=>{ const b = document.querySelector('.look').getBoundingClientRect(); return { x: 0, y: Math.round(b.top + scrollY) - 40, width: innerWidth, height: Math.round(b.height) + 50 }; })()`);
    await s.shot(`thema-${th || 'standard'}-darstellung.png`, lk);
    await s.close();
  }
  console.log(JSON.stringify(report, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
