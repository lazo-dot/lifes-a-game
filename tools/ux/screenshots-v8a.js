/* Life's a Game · Screenshots und Messung v8a (Headless-Chrome über das DevTools-Protokoll, ohne Abhängigkeiten)
 * Lädt den Test-Hof, stellt die Uhr auf Tag (12:00) bzw. Abend (19:30) und speichert unter docs/screenshots-v8a/:
 *   tag-kompakt.png, abend-kompakt.png (390 × 844, Tab „Heute“), tag-gross.png, abend-gross.png (Großansicht), szene-1zu1-*.png (Canvas-Inhalt)
 * Prüft dabei: Szene genau 256 × 160 pt, Canvas-Auflösung = CSS-Größe × devicePixelRatio, jeder Szenen-Pixel ist ein gleichfarbiger
 * dpr × dpr-Block (nicht verschwommen), Position des ersten Hakens.
 *   npm start   (in einem zweiten Terminal)
 *   node tools/ux/screenshots-v8a.js [http://localhost:8000/]
 * Benötigt Google Chrome und Node ≥ 22 (WebSocket).
 */
'use strict';
const { spawn, execFileSync } = require('child_process'), fs = require('fs'), path = require('path'), os = require('os');
const ROOT = path.resolve(__dirname, '..', '..'), OUT = path.join(ROOT, 'docs', 'screenshots-v8a');
const url = process.argv[2] || 'http://localhost:8000/';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const hof = execFileSync(process.execPath, [path.join(__dirname, 'testhof.js')], { encoding: 'utf8' });

async function session(port, hour, minute) {
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
  await ev(`(async()=>{ await LAGStore.save(${hof}); })()`); await send('Page.reload'); await sleep(2000);
  const shot = async name => { const p = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(OUT, name), Buffer.from(p.result.data, 'base64')); };
  const close = async () => { ws.close(); ch.kill(); await sleep(300); fs.rmSync(prof, { recursive: true, force: true }); };
  return { ev, shot, close };
}

// Misst die Canvas und prüft, ob jeder Szenen-Pixel ein gleichfarbiger Block ist (ganzzahlig, ohne Glätten).
const MEASURE = sel => `(()=>{ const c = document.querySelector('${sel}'), b = c.getBoundingClientRect(), dpr = devicePixelRatio;
  const k = c.width / 256, d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let bad = 0;
  if (Number.isInteger(k)) for (let y = 0; y < 160; y++) for (let x = 0; x < 256; x++) { const o = ((y * k) * c.width + x * k) * 4;
    for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) { const p = (((y * k + j) * c.width) + x * k + i) * 4; if (d[p] !== d[o] || d[p + 1] !== d[o + 1] || d[p + 2] !== d[o + 2]) { bad++; j = k; break; } } }
  return { cssW: b.width, cssH: b.height, canvasW: c.width, canvasH: c.height, dpr, pxPerScenePx: k, blurredPixels: Number.isInteger(k) ? bad : 'Faktor nicht ganzzahlig' }; })()`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const report = {};
  for (const [label, hh, mm, port] of [['tag', 12, 0, 9341], ['abend', 19, 30, 9342]]) {
    const s = await session(port, hh, mm);
    await s.ev(`(async()=>{ const ci = document.querySelector('[data-act=ci-skip]'); if (ci) ci.click(); window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 600)); })()`);
    const compact = await s.ev(MEASURE('#scene'));
    compact.mode = await s.ev(`LAGSheets.map() ? 'Sprite-Sheets' : 'bisheriger Code'`);
    compact.firstCheckTop = await s.ev(`Math.round(document.querySelector('#p-today .chk').getBoundingClientRect().top + scrollY)`);
    compact.firstCheckVisible = await s.ev(`document.querySelector('#p-today .chk').getBoundingClientRect().bottom <= innerHeight`);
    await s.shot(`${label}-kompakt.png`);
    const sceneUrl = await s.ev(`(()=>{ const c = document.createElement('canvas'); c.width = 256; c.height = 160; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(document.querySelector('#scene'), 0, 0, 256, 160); return c.toDataURL(); })()`);
    fs.writeFileSync(path.join(OUT, `szene-1zu1-${label}.png`), Buffer.from(sceneUrl.split(',')[1], 'base64'));
    await s.ev(`(async()=>{ document.querySelector('#scene').click(); await new Promise(r => setTimeout(r, 600)); })()`);
    const big = await s.ev(MEASURE('#bigScene canvas'));
    big.closeButton = await s.ev(`(()=>{ const b = document.querySelector('[data-act=big-close]').getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; })()`);
    big.scroll = await s.ev(`(()=>{ const s = document.querySelector('.big-scroll'); return { sichtbar: [s.clientWidth, s.clientHeight], gesamt: [s.scrollWidth, s.scrollHeight], links: Math.round(s.scrollLeft) }; })()`);
    await s.shot(`${label}-gross.png`);
    report[label] = { compact, big };
    await s.close();
  }
  console.log(JSON.stringify(report, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
