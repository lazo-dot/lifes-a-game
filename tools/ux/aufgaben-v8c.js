/* Life's a Game · Aufgaben des Testleitfadens (docs/ux-testleitfaden-v6.md) in Headless-Chrome (390 × 844) mit dem Test-Hof, Wege ab v8c:
 * Anlegen über „+ Gewohnheit“, Bearbeiten und Pausieren über das Info-Blatt der Karte, Nachtragen über „Eintragen“, To-do über „+ To-do“.
 * Prüft danach, dass ein v6-Hof unverändert geladen wird. Taps auf Elemente unter 44 pt werden gemeldet.
 *   npm start, dann: node tools/ux/testhof.js > hof.json; NOON=1 node tools/ux/aufgaben-v8c.js <tmp-ordner> hof.json [url]
 */
const { spawn } = require('child_process'), fs = require('fs'), path = require('path');
const [dir, hofFile, url = 'http://localhost:8000/'] = process.argv.slice(2);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const prof = fs.mkdtempSync(path.join(dir, 'chrome-'));
const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9335', '--user-data-dir=' + prof, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  let list; for (let i = 0; i < 50; i++) { try { list = await (await fetch('http://127.0.0.1:9335/json/list')).json(); break; } catch { await sleep(200); } }
  const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = {}; ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 500)); return r.result.result.value; };
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  if (process.env.NOON) await send('Page.addScriptToEvaluateOnNewDocument', { source: `(()=>{ const R = Date, n = new R(); n.setHours(12, 0, 0, 0); const off = n - R.now();
    class D extends R { constructor(...a) { if (a.length) super(...a); else super(R.now() + off); } static now() { return R.now() + off; } } window.Date = D; })();` });
  await send('Page.enable'); await send('Page.navigate', { url }); await sleep(1500);
  const hof = fs.readFileSync(hofFile, 'utf8');
  await ev(`(async()=>{ await LAGStore.save(${hof}); })()`); await send('Page.reload'); await sleep(1500);
  const out = await ev(`(async()=>{
    const w = ms => new Promise(r => setTimeout(r, ms)), $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
    const T = LAG.dkey(new Date()), Y = LAG.addDays(T, -1), res = {}, state = async () => await LAGStore.load();
    // Taps nur auf sichtbare, ausreichend große Elemente
    const tap = async el => { if (!el) throw new Error('Element fehlt'); el.scrollIntoView({ block: 'center' }); await w(50); const b = el.getBoundingClientRect();
      if (b.width < 44 || b.height < 44) res.small = (res.small || []).concat((el.getAttribute('aria-label') || el.textContent).trim().slice(0, 30) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height));
      el.click(); await w(150); };
    const tab = async t => { await tap($('[data-tab="' + t + '"]')); window.scrollTo(0, 0); };
    const setVal = (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
    const flush = async () => { document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('pagehide')); await w(300); };
    if ($('[data-act=ci-skip]')) await tap($('[data-act=ci-skip]'));
    // 1 Anlegen
    await tab('habits'); await tap($('[data-act=hnew]')); const f = $('.sheet [data-form="new"]');
    setVal(f.querySelector('[data-f=title]'), 'Ein Glas Wasser trinken'); setVal(f.querySelector('[data-f=anchor]'), 'dem Aufstehen'); setVal(f.querySelector('[data-f=tiny]'), 'Drei Schlucke');
    await tap(f.querySelector('button[type=submit]')); await flush();
    let s = await state(); const wHab = s.habits.find(h => h.title === 'Ein Glas Wasser trinken'); res['1 Anlegen'] = !!wHab && wHab.anchor === 'dem Aufstehen' && wHab.tinyVersion === 'Drei Schlucke';
    // 2 Abhaken + Mini
    await tab('today'); const firstChk = $('#todayBody .chk').getBoundingClientRect(); res.firstCheckTop = Math.round(firstChk.top);
    const row = t => $$('#todayBody [data-hid]').find(r => r.innerText.includes(t));
    await tap(row('5 Minuten dehnen').querySelector('[data-act=hdone]')); await tap(row('10 Minuten lesen').querySelector('[data-act=htiny]')); await flush();
    s = await state(); const H = t => s.habits.find(h => h.title === t);
    res['2 Abhaken + Mini'] = H('5 Minuten dehnen').logs[T] === 'done' && H('10 Minuten lesen').logs[T] === 'tiny';
    // 3 Nachtragen
    const late = $$('#todayBody .late1').find(r => r.innerText.includes('10 Minuten lesen')); await tap(late.querySelector('[data-act=late-open]')); await tap($('.sheet [data-st=done]'));
    res.toast3 = ($('.toast') || {}).innerText; await flush(); s = await state();
    res['3 Nachtragen'] = H('10 Minuten lesen').logs[Y] === 'done' && !!H('10 Minuten lesen').lateLogs[Y];
    // 4 Bearbeiten
    await tab('today'); await tap(row('Spazieren gehen').querySelector('[data-act=hsheet]')); res.sheet4 = !!$('.sheet [data-act=edit]'); await tap($('.sheet [data-act=edit]'));
    const ef = $('.sheet [data-form="edit"]'); setVal(ef.querySelector('[data-f=n]'), '2'); await tap(ef.querySelector('button[type=submit]')); await flush(); s = await state();
    res['4 Bearbeiten'] = H('Spazieren gehen').frequency.timesPerWeek === 2;
    // 5 Kalender
    await tab('progress'); const sel = $('#calHabit'); sel.value = H('10 Minuten lesen').id; sel.dispatchEvent(new Event('change', { bubbles: true })); await w(100);
    const stat = $('#progressBody .harvest .ctx').textContent; const cells = $$('.cal-grid i[data-info]'); await tap(cells[cells.length - 3]);
    res['5 Kalender'] = /erledigt in/.test(stat) && $('#calInfo').textContent.includes(':'); res.stat5 = stat; res.calInfo = $('#calInfo').textContent;
    // 6 Truhe
    await tab('chest'); const place = $('[data-act=place]:not([disabled])'); const before = (await state()).chest.placed.length;
    if (place) { await tap(place); await flush(); } s = await state();
    res['6 Truhe'] = place ? s.chest.placed.length === before + 1 : 'Farm schläft (22–6 Uhr) – nicht prüfbar';
    // 7 Pausieren
    await tab('habits'); const c7 = $$('#p-habits [data-hid]').find(c => c.innerText.includes('5 Minuten dehnen')); await tap(c7.querySelector('[data-act=hsheet]')); await tap($('.sheet [data-act=pause]')); await flush(); s = await state();
    res['7 Pausieren'] = !!H('5 Minuten dehnen') && !!H('5 Minuten dehnen').archivedAt;
    // 8 Gebäude ändern: „Geist“ auf Scheune, auf dem Hof sichtbar (Pixel im Bereich des 2. Gebäudeplatzes ändern sich)
    const region = () => { const c = $('#scene'), k = c.height / 160, lw = c.width / k, ox = Math.floor((lw - 256) / 2);
      return c.getContext('2d').getImageData((ox + 42) * k, 6 * k, 48 * k, 48 * k).data; };
    await tab('progress'); const r0 = region();
    const sk8 = $$('#skills .skill').find(x => x.innerText.includes('Geist')); await tap(sk8.querySelector('[data-act=ren]'));
    await tap($$('.bchip').find(x => x.innerText.includes('Scheune'))); await tap($('[data-act=renok]')); await flush(); await w(400);
    const r1 = region(); let diff = 0; for (let i = 0; i < r0.length; i += 4) if (Math.abs(r0[i] - r1[i]) + Math.abs(r0[i + 1] - r1[i + 1]) + Math.abs(r0[i + 2] - r1[i + 2]) > 30) diff++;
    s = await state(); res.diff8 = diff; res['8 Gebäude ändern'] = s.skills.find(x => x.name === 'Geist').buildingType === 'scheune' && diff > 500;
    // (To-do) „+ To-do“: nur Titel
    await tab('today'); await tap($('[data-act=todo-new]')); setVal($('#tTitle'), 'Fahrrad aufpumpen'); await tap($('.sheet .todo-form button[type=submit]')); await flush(); s = await state();
    res['To-do anlegen'] = s.todos.some(x => x.title === 'Fahrrad aufpumpen') && !$('.sheet');
    // (9) Logbuch
    await tab('journal'); await tap($('[data-act=weather][data-w=heiter]')); setVal($('#jText'), 'Guter Tag.'); await tap($('[data-act=savej]')); await flush(); s = await state();
    res['9 Logbuch'] = s.journal.some(j => j.date === T && j.text === 'Guter Tag.');
    return res;
  })()`);
  console.log(JSON.stringify(out, null, 1));
  // v6-Daten laden unverändert
  const v6 = JSON.parse(hof); v6.habits[0].lateLogs = { [v6.habits[0].createdAt]: true }; v6.textScale = 1.15;
  await ev(`(async()=>{ await LAGStore.save(${JSON.stringify(v6)}); })()`); await send('Page.reload'); await sleep(1500);
  const same = await ev(`(async()=>JSON.stringify(await LAGStore.load()))()`);
  const a = JSON.parse(same), strip = o => { o.skills.forEach(x => delete x.buildingType); o.habits.forEach(h => delete h.plantType); return JSON.stringify(o); };
  console.log('Alte Daten geladen, nur Gebäude-/Pflanzentyp ergänzt:', strip(a) === strip(JSON.parse(JSON.stringify(v6))), a.skills.map(x => x.buildingType).join(','));
  ws.close(); ch.kill(); await sleep(300); fs.rmSync(prof, { recursive: true, force: true });
})().catch(e => { console.error(e); ch.kill(); process.exit(1); });
