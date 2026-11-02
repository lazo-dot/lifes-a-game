/* Life's a Game · Messung und Screenshots v8c (Headless-Chrome über das DevTools-Protokoll, ohne Abhängigkeiten)
 * Misst wie im Konzept docs/ux-verschlankung-v8c.md, Abschnitt 6 (390 × 844 pt, Test-Hof, 12 Uhr, ohne Tab-Leiste):
 *   Wörter je Tab ohne Interaktion (gesamt und im ersten Bildschirm), Seitenhöhe, Bedienelemente, Erklärtexte (≥ 8 Wörter),
 *   Gewohnheitskarten im ersten Bildschirm, erster Haken, kleinste Tap-Fläche.
 * „Ohne Interaktion“ = Dauerzustand: Die einmaligen Erklärungen gelten als gesehen. Mit --erstbesuch werden sie mitgezählt.
 * Speichert unter docs/screenshots-v8c/: tab-<id>.png (ganze Seite), info-blatt.png, nachtragen-blatt.png, einstellungen.png,
 *   akzent-<id>.png (3 Akzentfarben), pergament.png.
 *   npm start   (in einem zweiten Terminal)
 *   node tools/ux/screenshots-v8c.js [http://localhost:8000/] [--nur-messen] [--erstbesuch]
 * Ohne Screenshots auch gegen ältere Versionen nutzbar (z. B. v8.1 auf einem anderen Port), solange LAGStore.save existiert.
 */
'use strict';
const { spawn, execFileSync } = require('child_process'), fs = require('fs'), path = require('path'), os = require('os');
const ROOT = path.resolve(__dirname, '..', '..'), OUT = path.join(ROOT, 'docs', 'screenshots-v8c');
const args = process.argv.slice(2), url = args.find(a => !a.startsWith('--')) || 'http://localhost:8000/';
const onlyMeasure = args.includes('--nur-messen'), firstVisit = args.includes('--erstbesuch');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const hof = execFileSync(process.execPath, [path.join(__dirname, 'testhof.js')], { encoding: 'utf8' });
const SEEN = JSON.stringify(['heute', 'nachtragen', 'regentage', 'todo', 'gewohnheiten', 'logbuch', 'fortschritt', 'kalender', 'gemeistert', 'truhe', 'darstellung', 'akzent', 'daten', 'beta']);

async function session(port, extra = {}) {
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'lag-shot-'));
  const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + prof, '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
  let list; for (let i = 0; i < 50 && !list; i++) { try { list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); } catch (e) { await sleep(200); } }
  const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let id = 0; const pend = {}; ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 600)); return r.result.result.value; };
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `(()=>{ const R = Date, n = new R(); n.setHours(12, 0, 0, 0); const off = n - R.now();
    class D extends R { constructor(...a) { if (a.length) super(...a); else super(R.now() + off); } static now() { return R.now() + off; } } window.Date = D; })();` });
  await send('Page.enable'); await send('Page.navigate', { url }); await sleep(1500);
  const st = Object.assign(JSON.parse(hof), extra);
  await ev(`(async()=>{ await LAGStore.save(${JSON.stringify(st)}); ${firstVisit ? '' : `try { localStorage.setItem('lag:erklaert', ${JSON.stringify(SEEN)}); } catch (e) {}`} })()`);
  await send('Page.reload'); await sleep(2200);
  await ev(`(async()=>{ const ci = document.querySelector('[data-act=ci-skip]'); if (ci) ci.click(); window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 500)); })()`);
  const shot = async (name, full) => {
    let clip; if (full) { const h = await ev('document.documentElement.scrollHeight'); clip = { x: 0, y: 0, width: 390, height: h, scale: 1 }; }
    const p = await send('Page.captureScreenshot', Object.assign({ format: 'png' }, clip ? { clip, captureBeyondViewport: true } : {})); fs.writeFileSync(path.join(OUT, name), Buffer.from(p.result.data, 'base64'));
  };
  const close = async () => { ws.close(); ch.kill(); await sleep(300); fs.rmSync(prof, { recursive: true, force: true }); };
  return { ev, shot, close };
}

// Messung eines Tabs (läuft in der Seite). Zählt sichtbaren Text der App ohne Tab-Leiste, Overlays und Toasts.
const MEASURE = tab => `(async()=>{
  const w = ms => new Promise(r => setTimeout(r, ms)), b = document.querySelector('[data-tab="${tab}"]'); b.click(); await w(400); window.scrollTo(0, 0); await w(200);
  const tabs = document.querySelector('.tabs'), tb = tabs.getBoundingClientRect(), fixed = getComputedStyle(tabs).position === 'fixed', vh = fixed ? tb.top : innerHeight;
  const skip = el => el.closest('.tabs, .toast, #overlay, .sheet-wrap, #settings, [hidden]');
  const words = s => (s.match(/[A-Za-zÄÖÜäöüß0-9%+]+/g) || []).length;
  let all = 0, first = 0; const tw = document.createTreeWalker(document.querySelector('.wrap'), NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());) { const el = n.parentElement; if (!el || skip(el) || !n.textContent.trim()) continue; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('.vh')) continue;
    const r = document.createRange(); r.selectNodeContents(n); const rc = r.getBoundingClientRect(); if (!rc.width && !rc.height) continue; const k = words(n.textContent); all += k; if (rc.top < vh && rc.bottom > 0) first += k; }
  const ctl = [...document.querySelectorAll('.wrap button, .wrap input, .wrap select, .wrap textarea, .wrap summary')].filter(e => !skip(e) && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
  const blocks = [...document.querySelectorAll('.wrap p, .wrap .ctx, .wrap .hint, .wrap .sub, .wrap .once, .wrap .empty, .wrap .banner')].filter(e => !skip(e) && e.getClientRects().length && words(e.innerText) >= 8 && !e.querySelector('p'));
  const small = ctl.filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.width < 44 || r.height < 44); }).map(e => (e.getAttribute('aria-label') || e.textContent).trim().slice(0, 24) + ' ' + Math.round(e.getBoundingClientRect().width) + '×' + Math.round(e.getBoundingClientRect().height));
  const panel = document.getElementById('p-${tab}');
  const cards = [...panel.querySelectorAll('.hrow, .row[data-hid]')].filter(e => e.getBoundingClientRect().bottom <= vh).length;
  const chk = document.querySelector('#p-today .chk');
  return { woerter: all, woerterErsterBildschirm: first, seitenhoehe: document.documentElement.scrollHeight - (fixed ? tb.height : 0), bedienelemente: ctl.length, erklaertexte: blocks.length,
    kartenImErstenBildschirm: '${tab}' === 'today' ? cards : undefined, ersterHaken: '${tab}' === 'today' && chk ? Math.round(chk.getBoundingClientRect().top + scrollY) : undefined, kleinerAls44: small };
})()`;

(async () => {
  const report = { url, erstbesuch: firstVisit, tabs: {} };
  if (!onlyMeasure) { fs.mkdirSync(OUT, { recursive: true }); for (const old of fs.readdirSync(OUT)) if (old.endsWith('.png')) fs.rmSync(path.join(OUT, old)); }
  const s = await session(9371);
  for (const tab of ['today', 'habits', 'journal', 'progress', 'chest']) {
    report.tabs[tab] = await s.ev(MEASURE(tab));
    if (!onlyMeasure) await s.shot(`tab-${tab}.png`, true);
  }
  const t = report.tabs; report.summe = { woerter: Object.values(t).reduce((a, x) => a + x.woerter, 0), bedienelemente: Object.values(t).reduce((a, x) => a + x.bedienelemente, 0), erklaertexte: Object.values(t).reduce((a, x) => a + x.erklaertexte, 0) };
  if (!onlyMeasure) {
    const w = 'new Promise(r => setTimeout(r, 450))';
    // Info-Blatt einer Gewohnheit: öffnen, Fokus prüfen, schließen per Escape, Fokus zurück
    await s.ev(`(async()=>{ document.querySelector('[data-tab=today]').click(); window.scrollTo(0, 0); await ${w}; })()`);
    report.infoBlatt = await s.ev(`(async()=>{ const t = document.querySelector('#p-today .hopen'); t.focus(); t.click(); await ${w};
      const sh = document.querySelector('.sheet'), r = sh.getBoundingClientRect(), x = document.querySelector('.sheet-x').getBoundingClientRect();
      return { rolle: sh.getAttribute('role'), titel: document.getElementById(sh.getAttribute('aria-labelledby')).textContent, fokusAufTitel: document.activeElement.id === sh.getAttribute('aria-labelledby'),
        aktionen: [...sh.querySelectorAll('.row-btns .btn')].map(b => b.textContent), hoehe: Math.round(r.height), schliessen: [Math.round(x.width), Math.round(x.height)] }; })()`);
    await s.shot('info-blatt.png');
    report.infoBlatt.escapeSchliesst = await s.ev(`(async()=>{ document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await ${w}; return !document.querySelector('.sheet-wrap') && document.activeElement.classList.contains('hopen'); })()`);
    // Erklärung hinter „?“
    await s.ev(`(async()=>{ document.querySelector('#p-today .q').click(); await ${w}; })()`);
    report.erklaerung = await s.ev(`document.querySelector('.sheet-body').innerText.split(/\\s+/).length`);
    await s.shot('erklaerung-blatt.png');
    await s.ev(`(async()=>{ document.querySelector('.sheet-bg').click(); await ${w}; })()`);
    // Einstellungen
    await s.ev(`(async()=>{ document.getElementById('gearBtn').click(); await ${w}; })()`);
    report.einstellungen = await s.ev(`({ fokus: document.activeElement.id, abschnitte: [...document.querySelectorAll('#settings h3')].map(h => h.textContent) })`);
    await s.shot('einstellungen.png');
    await s.ev(`(async()=>{ const sc = document.getElementById('settings'); sc.scrollTo(0, sc.scrollHeight); await ${w}; })()`);
    await s.shot('einstellungen-unten.png');
    await s.close();
    for (const [i, a] of ['mint', 'himmel', 'rose'].entries()) { const x = await session(9380 + i, { accent: a }); await x.shot(`akzent-${a}.png`); await x.close(); }
    const pg = await session(9385, { theme: 'pergament' }); await pg.shot('pergament.png'); await pg.ev(`(async()=>{ document.querySelector('#p-today .hopen').click(); await new Promise(r => setTimeout(r, 450)); })()`); await pg.shot('pergament-info-blatt.png'); await pg.close();
    // Nachtragen: gestern bei einer Gewohnheit offen lassen
    const nt = await session(9386); await nt.ev(`(async()=>{ const b = document.querySelector('#p-today .late button'); if (b) { b.click(); await new Promise(r => setTimeout(r, 450)); } })()`); await nt.shot('nachtragen-blatt.png'); await nt.close();
  } else await s.close();
  console.log(JSON.stringify(report, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
