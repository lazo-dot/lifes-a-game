/* Life's a Game · Headless-Chrome über das DevTools-Protokoll (ohne Abhängigkeiten), gemeinsam für tools/abnahme.js und tools/ux/*.js
 *   const s = await open({ width: 390, height: 844, dpr: 3, hour: 12 });
 *   await s.loadHof(url, state);   // Test-Hof einspielen, Erklärungen als gesehen markieren, neu laden, Check-in überspringen
 *   await s.ev('…'); await s.shot('datei.png', true); s.errors; await s.close();
 * Feste Uhrzeit (Standard 12:00 am heutigen Tag), Touch-Emulation, Konsolenfehler und Ausnahmen werden gesammelt.
 * Benötigt Google Chrome (Pfad mit CHROME=… änderbar) und Node ≥ 22 (WebSocket).
 */
'use strict';
const { spawn, execFileSync } = require('child_process'), fs = require('fs'), path = require('path'), os = require('os'), net = require('net');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
/** Test-Hof passend zum heutigen Datum (tools/ux/testhof.js). */
const testhof = () => JSON.parse(execFileSync(process.execPath, [path.join(__dirname, 'testhof.js')], { encoding: 'utf8' }));

async function open({ width = 390, height = 844, dpr = 3, hour = 12, minute = 0, init = '' } = {}) {
  if (!fs.existsSync(CHROME)) throw new Error(`Google Chrome nicht gefunden (${CHROME}). Pfad mit CHROME=… angeben.`);
  const port = await freePort(), prof = fs.mkdtempSync(path.join(os.tmpdir(), 'lag-chrome-'));
  const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + prof, '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
  let list; for (let i = 0; i < 75 && !list; i++) { try { list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); } catch (e) { await sleep(200); } }
  if (!list) { ch.kill(); throw new Error('Chrome antwortet nicht auf dem DevTools-Port.'); }
  const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  const errors = [];
  let id = 0; const pend = {};
  ws.onmessage = e => { const m = JSON.parse(e.data);
    if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; return; }
    if (m.method === 'Runtime.exceptionThrown') errors.push((m.params.exceptionDetails.exception || {}).description || m.params.exceptionDetails.text);
    else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value || a.description || '').join(' '));
    else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push(m.params.entry.text + (m.params.entry.url ? ' · ' + m.params.entry.url : '')); };
  const send = (method, params = {}) => new Promise((r, j) => { const i = ++id; pend[i] = m => m.error ? j(new Error(method + ': ' + m.error.message)) : r(m.result); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 600)); return r.result.value; };
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `(()=>{ const R = Date, n = new R(); n.setHours(${hour}, ${minute}, 0, 0); const off = n - R.now();
    class D extends R { constructor(...a) { if (a.length) super(...a); else super(R.now() + off); } static now() { return R.now() + off; } } window.Date = D; })();${init}` });
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
  /** Wartet, bis die Oberfläche steht (Tab „Heute“ oder Begrüßung). */
  const ready = async () => { for (let i = 0; i < 60; i++) { if (await ev(`!!(window.LAGStore && document.querySelector('#p-today, #overlay .frame'))`).catch(() => false)) break; await sleep(100); } await sleep(500); };
  const goto = async url => { await send('Page.navigate', { url }); await ready(); };
  const reload = async () => { await send('Page.reload'); await ready(); };
  /** Hof einspielen und neu laden; seen = Erklärungen gelten als gesehen (Dauerzustand ohne Interaktion). */
  const loadHof = async (url, state, { seen = true } = {}) => {
    if (url) await goto(url);
    await ev(`(async()=>{ await LAGStore.save(${JSON.stringify(state)}); ${seen ? `try { localStorage.setItem(LAGStore.prefix + 'lag:erklaert', JSON.stringify(Object.keys(LAGHilfe.X))); } catch (e) {}` : ''} })()`);
    await reload();
    await ev(`(async()=>{ const ci = document.querySelector('[data-act=ci-skip]'); if (ci) ci.click(); window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 400)); })()`);
  };
  /** Screenshot (full = ganze Seitenhöhe) nach file. */
  const shot = async (file, full) => {
    let clip; if (full) { const h = await ev('document.documentElement.scrollHeight'); clip = { x: 0, y: 0, width, height: h, scale: 1 }; }
    const p = await send('Page.captureScreenshot', Object.assign({ format: 'png' }, clip ? { clip, captureBeyondViewport: true } : {}));
    fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, Buffer.from(p.data, 'base64'));
  };
  const close = async () => { ws.close(); ch.kill(); await sleep(300); fs.rmSync(prof, { recursive: true, force: true }); };
  return { send, ev, goto, reload, loadHof, shot, close, errors, width, height, dpr };
}

module.exports = { open, testhof, sleep, CHROME };
