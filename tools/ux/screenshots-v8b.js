/* Life's a Game · Screenshots und Messung v8b (Headless-Chrome über das DevTools-Protokoll, ohne Abhängigkeiten)
 * Lädt den Test-Hof, stellt Deko und Tiere auf (nur für die Bilder) und speichert unter docs/screenshots-v8b/ (390 × 844 pt):
 *   hof-tag.png, hof-abend.png (Tab „Heute“), hof-tag-szene-3x.png, hof-abend-szene-3x.png (Szene dreifach, ohne Glätten),
 *   sammelalbum.png (Truhe), thema-<id>.png je Farbthema (Tab „Heute“ und Darstellung).
 * Prüft dabei: Szene 160 pt hoch, ganzzahlig, erster Haken ohne Scrollen, Tap-Flächen im Sammelalbum ≥ 44 pt.
 *   npm start   (in einem zweiten Terminal)
 *   node tools/ux/screenshots-v8b.js [http://localhost:8000/]
 * Benötigt Google Chrome und Node ≥ 22 (WebSocket).
 */
'use strict';
const { spawn, execFileSync } = require('child_process'), fs = require('fs'), path = require('path'), os = require('os');
const ROOT = path.resolve(__dirname, '..', '..'), OUT = path.join(ROOT, 'docs', 'screenshots-v8b');
const url = process.argv[2] || 'http://localhost:8000/';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const hof = JSON.parse(execFileSync(process.execPath, [path.join(__dirname, 'testhof.js')], { encoding: 'utf8' }));
// Nur für die Bilder: sechs Deko-Plätze (Level 3) und Tiere belegt, ein paar Funde mehr in der Truhe.
hof.chest = {
  items: { bench: 1, flowers: 2, telescope: 1, leaf_pile: 1, egg_basket: 1, birdbath: 1 },
  placed: [['sunflower', 0], ['lantern', 1], ['wheelbarrow', 2], ['pumpkin_lantern', 3], ['well', 4], ['milk_can', 5]].map(([itemId, slot]) => ({ itemId, slot }))
    .concat(['chicken', 'chicken', 'cat', 'duck', 'rabbit', 'hedgehog'].map(itemId => ({ itemId })))
};
const THEMES = ['', 'wald', 'herbst', 'meer', 'kirschbluete'];

async function session(port, hour, minute, theme) {
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'lag-shot-'));
  const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + prof, '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
  let list; for (let i = 0; i < 50 && !list; i++) { try { list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); } catch (e) { await sleep(200); } }
  const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let id = 0; const pend = {}; ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400)); return r.result.result.value; };
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `(()=>{ const R = Date, n = new R(); n.setHours(${hour}, ${minute}, 0, 0); const off = n - R.now();
    class D extends R { constructor(...a) { if (a.length) super(...a); else super(R.now() + off); } static now() { return R.now() + off; } } window.Date = D; })();` });
  await send('Page.enable'); await send('Page.navigate', { url }); await sleep(1500);
  await ev(`(async()=>{ await LAGStore.save(${JSON.stringify(Object.assign({}, hof, theme ? { theme } : {}))}); })()`); await send('Page.reload'); await sleep(2200);
  await ev(`(async()=>{ const ci = document.querySelector('[data-act=ci-skip]'); if (ci) ci.click(); window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 600)); })()`);
  const shot = async (name, clip) => { const p = await send('Page.captureScreenshot', Object.assign({ format: 'png' }, clip ? { clip: Object.assign({ scale: 1 }, clip), captureBeyondViewport: true } : {})); fs.writeFileSync(path.join(OUT, name), Buffer.from(p.result.data, 'base64')); };
  const close = async () => { ws.close(); ch.kill(); await sleep(300); fs.rmSync(prof, { recursive: true, force: true }); };
  return { ev, shot, close };
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
