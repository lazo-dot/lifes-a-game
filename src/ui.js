/* Life's a Game · Oberfläche
 * Rendering und Ereignisse. Spielregeln kommen ausschließlich aus LAG (logic.js).
 */
(function (root) {
  'use strict';
  const L = root.LAG, SP = root.LAGSprites, SH = root.LAGSheets, Store = root.LAGStore, HX = root.LAGHilfe, img = SP.img, esc = SP.esc;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const reduce = !!(root.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const today = () => L.dkey(new Date()), hour = () => new Date().getHours();
  const uid = () => Math.random().toString(36).slice(2, 9);
  const WNAME = { sonnig: 'Sonnig', heiter: 'Heiter', bewoelkt: 'Bewölkt', regen: 'Regen', gewitter: 'Gewitter' };
  const DAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const PROMPTS = ['Was lief heute gut?', 'Worüber hast du dich gefreut?', 'Was hat dir Energie gegeben, was hat sie gekostet?', 'Was nimmst du dir für morgen vor?', 'Wofür bist du heute dankbar?', 'Was hast du heute über dich gelernt?', 'Welche kleine Sache hat den Tag besser gemacht?'];
  const IDEAS = [
    { title: 'Ein Glas Wasser trinken', anchor: 'dem Aufstehen', tiny: 'Drei Schlucke', time: '07:00', skill: 0 },
    { title: '5 Minuten dehnen', anchor: 'dem ersten Kaffee', tiny: 'Eine Dehnübung', time: '08:00', skill: 0 },
    { title: '10 Minuten lesen', anchor: 'dem Zähneputzen am Abend', tiny: 'Eine Seite lesen', time: '22:00', skill: 1 },
    { title: 'Spazieren gehen', anchor: 'dem Mittagessen', tiny: 'Einmal um den Block', time: '13:00', skill: 0 },
    { title: 'Fünf Minuten aufräumen', anchor: 'dem Abendessen', tiny: 'Einen Gegenstand wegräumen', time: '19:00', skill: 2 },
    { title: 'Jemandem schreiben', anchor: 'der Mittagspause', tiny: 'Eine kurze Nachricht schicken', time: '12:30', skill: 2 }
  ];

  let S = null, D = null, realState = null, scene = null, au = null, preview = null, sheets = null;
  const U = { npcIdx: 0, selWeather: null, editingJournal: false, draft: '', promptShift: 0, renaming: null, editHabit: null, wipeArmed: false, showExport: false,
    importPending: null, calHabit: '', calYear: null, lastTodoSkill: null, obStep: null, ci: null, undo: null, ciLater: false };

  // v8a: Gebäude je Fähigkeit und Pflanzensorten (Namen immer als Text, nicht nur Bild)
  const BNAME = { muehle: 'Mühle', archiv: 'Archiv', gewaechshaus: 'Gewächshaus', schmiede: 'Schmiede', gemeinschaftshaus: 'Gemeinschafts&shy;haus', musikpavillon: 'Musik&shy;pavillon', backhaus: 'Backhaus', kontor: 'Kontor', scheune: 'Scheune' };
  const PNAME = { beere: 'Beere', blume: 'Blume', kuerbis: 'Kürbis', baeumchen: 'Bäumchen' };
  const sheetUrls = new Map();
  /** Vorschaubild aus einem Sprite-Sheet (Ebene base), ganzzahlig vergrößert. Ohne Sheet: leer. */
  function sheetImg(sheet, tag, scale, sil) {
    const key = sheet + tag + scale + (sil ? 's' : ''); if (sheetUrls.has(key)) return sheetUrls.get(key);
    const sh = SH && SH.get(sheet); if (!sh || !sh.rect('base', tag)) return '';
    const c = document.createElement('canvas'); c.width = sh.w * scale; c.height = sh.h * scale; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.scale(scale, scale);
    SH.draw(x, sh, 'base', tag, sh.anchor.x, sh.anchor.y); if (sil) silhouette(x, c);
    const h = `<img class="pi" src="${c.toDataURL()}" alt="" width="${c.width}" height="${c.height}">`; sheetUrls.set(key, h); return h;
  }
  /** v8b: noch nicht gefundene Gegenstände als neutrale Silhouette (eine Farbe, gleiche Form). */
  function silhouette(x, c) { x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#56666b'; x.fillRect(0, 0, c.width, c.height); x.globalCompositeOperation = 'source-over'; }
  /** v8b: Bild eines Truhengegenstands aus dem Sheet deko bzw. tiere; ohne Sheet die bisherige Zeichnung (gibt es nur für die 12 alten IDs), sonst eine Kiste. */
  function itemImg(id, scale = 2, sil) {
    const it = L.ITEMS[id], h = sheetImg(it && it.animal ? 'tiere' : 'deko', id, scale, sil); if (h) return h;
    const name = SP.MAPS[id] ? id : 'crate', key = 'legacy' + name + scale + (sil ? 's' : ''); if (sheetUrls.has(key)) return sheetUrls.get(key);
    const sp = SP.sprite(name), k = scale * 2, c = document.createElement('canvas'); c.width = sp.width * k; c.height = sp.height * k; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(sp, 0, 0, c.width, c.height); if (sil) silhouette(x, c);
    const out = `<img class="pi" src="${c.toDataURL()}" alt="" width="${c.width}" height="${c.height}">`; sheetUrls.set(key, out); return out;
  }

  /* ---------- Hilfen ---------- */
  const skillById = id => S.skills.find(s => s.id === id) || S.skills[0];
  const styleOf = s => SP.STYLES[(s ? s.st : 0) % SP.STYLES.length];
  const freqText = f => f.kind === 'daily' ? 'Täglich' : f.kind === 'weekly' ? f.timesPerWeek + '× pro Woche' : f.days.slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map(d => DAYS[d]).join(', ');
  const planText = h => 'Nach ' + h.anchor + ': ' + h.title;
  const fmt = (k, o = { weekday: 'short', day: 'numeric', month: 'short' }) => L.parseKey(k).toLocaleDateString('de-DE', o);
  const active = () => S.habits.filter(h => !h.archivedAt);
  const portrait = () => img('wilma', 5, '').replace('class="pi"', 'class="pi portrait"');
  const pct = (x, d = 0) => (x * 100).toLocaleString('de-DE', { maximumFractionDigits: d }) + ' %';
  const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = () => navigator.standalone === true || (root.matchMedia && matchMedia('(display-mode: standalone)').matches);

  /* ---------- v8c: Info-Blatt und Erklärungen hinter „?“ ---------- */
  const timeText = s => { if (!s) return ''; const [a, b] = s.split(':').map(Number); return b ? `${a}:${String(b).padStart(2, '0')} Uhr` : `${a} Uhr`; };
  const qBtn = id => { const x = HX.explain(id); return `<button type="button" class="q" data-act="explain" data-x="${id}" aria-label="Erklärung: ${esc(x.title)}">?</button>`; };
  const SEEN = Store.prefix + 'lag:erklaert';   // 8.2.1: Vorschau mit eigenem Präfix
  const seen = () => { try { return new Set(JSON.parse(localStorage.getItem(SEEN) || '[]')); } catch (e) { return new Set(); } };
  function markSeen(ids) { const s0 = seen(); ids.forEach(i => s0.add(i)); try { localStorage.setItem(SEEN, JSON.stringify([...s0])); } catch (e) { /* nur Bedienhilfe */ } }
  /** Beim ersten Besuch steht eine Erklärung einmal offen unter der Überschrift; gemerkt nur auf diesem Gerät (Bedienhilfe, keine Eingabe). */
  const onceBox = id => seen().has(id) ? '' : `<div class="once" data-once="${id}"><p>${esc(HX.explain(id).text)}</p><button class="btn ghost sm" type="button" data-act="once-ok" data-x="${id}">Verstanden</button></div>`;
  /** Überschrift mit „?“ (Ebene 1) und beim ersten Besuch der offenen Erklärung. */
  const head = (tag, title, id, cls = '') => `<div class="hd2${cls ? ' ' + cls : ''}"><${tag}>${title}</${tag}>${qBtn(id)}</div>${onceBox(id)}`;
  function openSheet(title, html, trigger, o = {}) { return sheets.open(Object.assign({ title, html, trigger }, o)); }
  const closeSheet = () => sheets && sheets.close();
  /** Abzeichen: Symbol und Zahl, die Bedeutung steht als Text für Screenreader daneben. */
  const badge = (icon, txt, sr, cls = '') => `<span class="bdg${cls ? ' ' + cls : ''}">${icon}<span aria-hidden="true">${txt}</span><span class="vh">${sr}</span></span>`;

  /* ---------- Speichern ---------- */
  let saveT = 0;
  const canSave = () => S && !S.demo && S.onboarded;
  function save() { if (!canSave()) return; clearTimeout(saveT); saveT = setTimeout(() => Store.save(S), 250); }
  function flush() { if (canSave()) { clearTimeout(saveT); Store.save(S); } }
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
  root.addEventListener('pagehide', flush);

  const derive = () => (D = L.derive(S, today()));
  const weather = () => L.currentWeather(S, today(), preview);
  function phase() { const hr = hour(); if (L.farmSleeps(hr)) return 'night'; if (L.journalOn(S, today())) return hr >= 20 ? 'night' : 'evening'; return hr < 9 ? 'morning' : hr < 18 ? 'day' : 'evening'; }

  /* ---------- Effekte ---------- */
  function floatText(txt, x, y, cls) { const d = document.createElement('div'); d.className = 'fx ' + cls; d.textContent = txt; d.style.left = x + 'px'; d.style.top = (y - 14) + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 1050); }
  function sparks(x, y, colors, n = 10) {
    if (reduce) return;
    for (let i = 0; i < n; i++) { const s = document.createElement('div'); s.className = 'sparkle'; s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.background = colors[i % colors.length]; document.body.appendChild(s);
      const a = Math.random() * Math.PI * 2, r = 24 + Math.random() * 36; s.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${Math.cos(a) * r}px,${Math.sin(a) * r - 20}px)`, opacity: 0 }], { duration: 650, easing: 'steps(8)', fill: 'forwards' }); setTimeout(() => s.remove(), 700); }
  }
  const pointOf = (ev, el) => { if (ev && ev.clientX) return [ev.clientX, ev.clientY]; const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top]; };
  let toastT = 0, toastQ = [], toastBusy = false;
  function toast(html, action, ms = 4200) { toastQ.push({ html, action, ms }); if (!toastBusy) nextToast(); }
  function nextToast() {
    const t0 = $('.toast'); if (t0) t0.remove(); const item = toastQ.shift(); if (!item) { toastBusy = false; return; } toastBusy = true;
    const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.innerHTML = item.html + (item.action ? `<button class="btn sm" type="button">${esc(item.action.label)}</button>` : ''); document.body.appendChild(t);
    if (item.action) t.querySelector('button').onclick = () => { item.action.fn(); clearTimeout(toastT); nextToast(); };
    clearTimeout(toastT); toastT = setTimeout(nextToast, toastQ.length ? Math.min(item.ms, 2600) : item.ms);
  }
  function levelUp(what, text) {
    au.sfx.level();
    const o = document.createElement('div'); o.className = 'levelup'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Aufgestiegen');
    o.innerHTML = `<div class="frame">${img('gem', 5, '')}<h2>Aufgestiegen!</h2><div class="what">${esc(what)}</div><p>${esc(text)}</p><button class="btn" type="button">Weiter</button></div>`;
    document.body.appendChild(o); const b = o.querySelector('button'); b.focus();
    const r = o.querySelector('.frame').getBoundingClientRect(); [0, 250, 500].forEach(t => setTimeout(() => sparks(r.left + r.width / 2, r.top + 40, ['#f4d58e', '#7fcf8a', '#fff3b0', '#c99cf2'], 16), t));
    const close = () => o.remove(); b.onclick = close; o.addEventListener('click', e => { if (e.target === o) close(); }); o.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ---------- Info-Feld (U17) ----------
   * Antippen eines Elements mit data-info zeigt den Text in einem kleinen Feld darunter; Antippen daneben oder Esc schließt es.
   */
  function closeInfo() { const o = $('#infopop'); if (o) o.remove(); }
  function showInfo(el) {
    const open = $('#infopop'), same = open && open.dataset.for === el.dataset.info; closeInfo(); if (same) return;
    const o = document.createElement('div'); o.id = 'infopop'; o.className = 'infopop'; o.setAttribute('role', 'status'); o.dataset.for = el.dataset.info; o.textContent = el.dataset.info;
    document.body.appendChild(o);
    const r = el.getBoundingClientRect(), w = o.offsetWidth, h = o.offsetHeight;
    let x = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), innerWidth - w - 8), y = r.bottom + 6;
    if (y + h > innerHeight - 80) y = Math.max(8, r.top - h - 6);
    o.style.left = x + 'px'; o.style.top = y + 'px';
  }
  root.addEventListener('scroll', closeInfo, { passive: true });

  /* ---------- Belohnungen ---------- */
  const snapshot = () => ({ c: D.char.l, s: Object.fromEntries(S.skills.map(s => [s.id, D.levels[s.id].l])) });
  function grant(type) { S.chest.items[type] = (S.chest.items[type] || 0) + 1; }
  function afterAction(before, skillId, pt, xp, info) {
    derive(); save();
    if (xp > 0) { floatText('+' + xp + ' XP', pt[0], pt[1], 'xp'); sparks(pt[0], pt[1], ['#7fcf8a', '#c8f2cc', '#fffaf0'], 8); }
    if (info) toast(info);
    checkRewards(pt);
    const sk = skillId ? skillById(skillId) : null;
    if (D.char.l > before.c) setTimeout(() => levelUp('Level ' + D.char.l, `Auf deinem Hof ist jetzt Platz für ${L.slotsFor(D.char.l)} Dekorationen.`), 450);
    else if (sk && D.levels[sk.id].l > before.s[sk.id]) setTimeout(() => levelUp(sk.name + ' · Stufe ' + D.levels[sk.id].l, 'Das Gebäude dieser Fähigkeit wächst auf deinem Hof.'), 450);
  }
  function rollDrop(pt) {
    const type = L.rollDrop(Math.random, today()); if (!type) return; grant(type); save();
    setTimeout(() => { au.sfx.drop(); floatText('Fund: ' + L.ITEMS[type].name, pt[0], pt[1] - 24, 'drop'); sparks(pt[0], pt[1] - 20, ['#c99cf2', '#f4d58e', '#ffffff'], 12); }, 650);
    toast(`${itemImg(type, 1)}<span><b>Fund!</b> ${L.ITEMS[type].name}${L.ITEMS[type].rare ? ' (selten)' : ''} liegt jetzt in deiner Truhe.</span>`);
  }
  /** B2 Ernte bei neuer Wachstumsstufe, B4 Fund bei „Gemeistert“. */
  function checkRewards(pt) {
    let any = false;
    S.habits.forEach(h => {
      const d = D.H[h.id], n = L.harvestsDue(h, d);
      if (n > 0) {
        h.harvestStage = d.stage; any = true; const got = [];
        for (let i = 0; i < n; i++) { const t = L.pickItem(Math.random, Math.random() < L.C.RARE_P, today()); grant(t); got.push(L.ITEMS[t].name); }
        if (scene) scene.glowBed(h.id); setTimeout(() => au.sfx.harvest(), 300);
        toast(`${img('p' + d.stage, 4, '', { F: styleOf(skillById(h.skillId)).c, f: styleOf(skillById(h.skillId)).dk })}<span><b>Ernte!</b> „${esc(h.title)}“ ist jetzt ${L.STAGES[d.stage][1]}. In der Truhe: ${esc(got.join(', '))}.</span>`, null, 5200);
      }
      if (L.gradRewardDue(h, d)) {
        h.gradRewarded = true; any = true; const t = L.pickItem(Math.random, true, today()); grant(t);
        toast(`${img('gem', 3, '')}<span><b>Gemeistert!</b> „${esc(h.title)}“ hält ohne Erinnerung. Als Dank liegt ${L.ITEMS[t].name} in deiner Truhe.</span>`, null, 6000);
      }
    });
    if (any) { save(); R.chestBadge(); if (pt && !reduce) sparks(pt[0], pt[1] - 10, ['#f4d58e', '#7fcf8a'], 10); }
  }
  function logHabit(h, status, pt) {
    const t = today(), prev = h.logs[t], H0 = D.H[h.id], before = snapshot();
    if (prev === status) { delete h.logs[t]; au.sfx.soft(); derive(); save(); refresh(); return; }   // A9: still zurückbuchen
    if (H0.weekly && !prev && H0.weekCnt >= H0.N) { au.sfx.err(); toast('<span><b>Wochenziel schon erreicht.</b> Mehr bringt diese Woche keine zusätzlichen XP. Genieß die Pause.</span>'); return; }
    h.logs[t] = status; status === 'tiny' ? au.sfx.tiny() : au.sfx.check(); if (S.chest.placed.some(p => p.itemId === 'chicken')) au.sfx.cluck();
    derive(); const Hn = D.H[h.id], sk = skillById(h.skillId), units = L.unitsToNext(D.levels[sk.id], h.effort);
    const gained = Math.max(0, L.xpFor(h.effort, status) - (prev ? L.xpFor(h.effort, prev) : 0));
    const info = `${img(sk.icon, 3, '')}<span><b>${esc(sk.name)} +${L.xpFor(h.effort, status)} XP</b> · ${esc(h.title)}: ${Hn.weekly ? Hn.weekCnt + ' von ' + Hn.N + ' diese Woche' : Hn.month + '× diesen Monat'}${status === 'tiny' ? ` · Mini „${esc(h.tinyVersion)}“ zählt voll für die Stärke` : ''} · noch ${units}× bis ${esc(sk.name)} Stufe ${D.levels[sk.id].l + 1}</span>`;
    if (!prev && L.dropAllowed(h, t, t)) { h.rolled = t; rollDrop(pt); }
    afterAction(before, h.skillId, pt, gained, info); refresh();
    const row = document.querySelector(`[data-hid="${h.id}"]`); if (row) row.classList.add('pop');
  }

  /** v6 Nachtragen: zählt voll, würfelt aber keinen Fund. Derselbe Knopf nimmt den Nachtrag zurück. */
  function logLateUI(h, k, status, pt) {
    const t = today(), before = snapshot(), was = h.logs[k], undo = L.isLate(h, k) && was === status, frees = !undo && L.freesRainDay(h, k, t);
    if (!L.logLate(h, k, status, t)) { au.sfx.err(); return; }
    if (undo) { au.sfx.soft(); derive(); save(); refresh(); scene.refresh(); return; }
    status === 'tiny' ? au.sfx.tiny() : au.sfx.check();
    derive(); const sk = skillById(h.skillId), x = Math.max(0, L.xpFor(h.effort, status) - L.xpFor(h.effort, was));
    afterAction(before, h.skillId, pt, x, `${img(sk.icon, 3, '')}<span><b>Nachgetragen.</b> ${esc(h.title)}, ${dayName(k)}${status === 'tiny' ? ' (Mini)' : ''} · zählt voll für Stärke und Serie${frees ? '. <b>Dein Regentag ist wieder frei.</b>' : ''}</span>`);
    refresh(); scene.refresh();
  }
  const lateNote = (h, x) => { const v = D.H[h.id].days[x.k];
    const n = x.late ? 'nachgetragen' : v === 'watered' ? 'von einem Regentag gerettet' : v === 'repaired' ? 'mit einer Extra-Runde gerettet' : '';
    return n ? `<div class="meta"><span>${n}</span></div>` : ''; };
  const dayName = k => { const n = L.daysBetween(k, today()); return n === 1 ? 'gestern' : n === 2 ? 'vorgestern' : fmt(k); };
  /** v8c: offene Tage zum Nachtragen, eine Zeile je Tag; Auswahl im Info-Blatt. */
  function lateRows() {
    const t = today(), rows = [];
    active().forEach(h => L.lateDays(h, t).forEach(x => { if (x.status !== 'done' && x.status !== 'tiny' || x.late) rows.push([h, x]); }));
    active().forEach(h => { const d = D.H[h.id]; if (d.canRepair && d.repairKey && !rows.some(([y, x]) => y === h && x.k === d.repairKey)) rows.push([h, { k: d.repairKey, repairOnly: true }]); });
    return rows.sort((a, b) => a[1].k.localeCompare(b[1].k) || a[0].title.localeCompare(b[0].title));
  }
  const lateState = (h, x) => { if (x.repairOnly) return 'ausgefallen'; const v = D.H[h.id].days[x.k]; return x.late ? 'nachgetragen' : v === 'watered' ? 'mit Regentag gerettet' : v === 'repaired' ? 'mit Extra-Runde gerettet' : 'offen'; };
  function lateHTML() {
    const rows = lateRows(); if (!rows.length) return '';
    return `<div class="late">${rows.map(([h, x]) => { const lbl = dayName(x.k), st = lateState(h, x);
      return `<div class="late1"><span><b>${lbl[0].toUpperCase() + lbl.slice(1)} ${st}:</b> ${esc(h.title)}</span><button class="btn sm${x.late ? ' alt' : ''}" type="button" data-act="late-open" data-id="${h.id}" data-k="${x.k}">${x.late ? 'Ändern' : x.repairOnly ? 'Extra-Runde' : 'Eintragen'}</button></div>`; }).join('')}
      <p class="ctx">Nachtragen zählt voll · <button type="button" class="lnk" data-act="explain" data-x="nachtragen">mehr</button></p></div>`;
  }
  /** Info-Blatt zu einem offenen Tag: Erledigt, Mini (antippen nimmt einen Nachtrag zurück) und, wenn möglich, die Extra-Runde. */
  function lateSheet(h, k, trigger) {
    const d = D.H[h.id], x = L.lateDays(h, today()).find(y => y.k === k) || { k, status: null }, lbl = dayName(k), can = L.canLogLate(h, k, today());
    const btns = can ? ['done', 'tiny'].map(st => { const on = x.late && x.status === st;
      return `<button class="btn${st === 'tiny' ? ' alt' : ''}" type="button" data-act="late" data-id="${h.id}" data-k="${k}" data-st="${st}" aria-pressed="${on}">${on ? '✓ ' : ''}${st === 'tiny' ? 'Mini: ' + esc(h.tinyVersion) : 'Erledigt'}</button>`; }).join('') : '';
    const rep2 = d.canRepair && d.repairKey === k ? `<p>Ist ${lbl} wirklich ausgefallen? Mach heute eine Runde extra, dann bleibt deine Serie bestehen.</p><div class="row-btns"><button class="btn alt" type="button" data-act="repair" data-id="${h.id}">Extra-Runde erledigt</button></div>` : '';
    openSheet(`${lbl[0].toUpperCase() + lbl.slice(1)}: ${h.title}`, `<p class="ctx">${x.late ? 'Nachgetragen. Nochmal antippen nimmt den Nachtrag zurück.' : 'Doch erledigt? Nachgetragenes zählt voll, bringt aber keinen Fund.'}</p>${btns ? `<div class="row-btns">${btns}</div>` : ''}${rep2}`, trigger, { refocus: '#p-today .late button, #p-today .hd2 h2' });
  }

  /* ---------- Gewohnheits-Formular  /* ---------- Gewohnheits-Formular (Onboarding, Neu, Bearbeiten) ---------- */
  function skillOptions(sel) { return S.skills.map(s => `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${esc(s.name)}</option>`).join('') + (S.skills.length < L.C.MAX_SKILLS ? '<option value="__new">+ Neue Fähigkeit …</option>' : ''); }
  function habitForm(p, h) {
    const f = h ? h.frequency : { kind: 'daily' }, days = f.kind === 'weekdays' ? f.days : [1, 2, 3, 4, 5], n = f.kind === 'weekly' ? f.timesPerWeek : 3, eff = h ? h.effort : 2, plant = (h && h.plantType) || L.suggestPlant(S.habits.length);
    return `<form class="hform" data-form="${p}" novalidate>
      <div class="step"><b>1</b><label for="${p}-title">Was möchtest du tun?</label><div class="ctl"><input class="in" id="${p}-title" data-f="title" maxlength="60" placeholder="z. B. 10 Minuten dehnen" value="${h ? esc(h.title) : ''}"></div></div>
      <div class="step"><b>2</b><label for="${p}-anchor">Wann genau? Nach welcher Routine?</label><div class="ctl"><span class="pre">Nach</span><input class="in" id="${p}-anchor" data-f="anchor" maxlength="60" placeholder="dem ersten Kaffee" value="${h ? esc(h.anchor) : ''}"><input class="in" type="time" data-f="time" aria-label="Ungefähre Uhrzeit der Routine (optional)" value="${h ? esc(h.anchorTime) : ''}"></div></div>
      <div class="step"><b>3</b><span class="lab">Wie oft ist realistisch?</span>
        <div class="ctl">${[['daily', 'Täglich'], ['weekdays', 'An bestimmten Tagen'], ['weekly', 'X-mal pro Woche']].map(([k, l]) => `<button type="button" class="chip" data-freq="${k}" aria-pressed="${f.kind === k}">${l}</button>`).join('')}</div>
        <div class="ctl" data-g="days" ${f.kind === 'weekdays' ? '' : 'hidden'}>${[1, 2, 3, 4, 5, 6, 0].map(d => `<button type="button" class="chip" data-day="${d}" aria-pressed="${days.includes(d)}">${DAYS[d]}</button>`).join('')}</div>
        <div class="ctl" data-g="times" ${f.kind === 'weekly' ? '' : 'hidden'}><input class="in" type="number" min="1" max="6" value="${n}" data-f="n" style="flex:0 0 80px" aria-label="Mal pro Woche"><span>mal pro Woche, an beliebigen Tagen</span></div></div>
      <div class="step"><b>4</b><label for="${p}-tiny">Was ist die Mini-Version für schlechte Tage?</label><div class="ctl"><input class="in" id="${p}-tiny" data-f="tiny" maxlength="60" placeholder="z. B. eine einzige Dehnübung" value="${h ? esc(h.tinyVersion) : ''}"></div><p class="hint" style="grid-column:2">Eine echte kleine Handlung, nicht nur „App öffnen“.</p></div>
      <details class="more"${h ? ' open' : ''}><summary>Fähigkeit, Aufwand und Optionen <span class="hint">(mit Vorgaben, zum Ändern antippen)</span></summary>
      <div class="step"><b>5</b><label for="${p}-skill">Zu welcher Fähigkeit gehört das?</label><div class="ctl"><select class="in" id="${p}-skill" data-f="skill">${skillOptions(h ? h.skillId : null)}</select><input class="in" data-f="newskill" maxlength="20" placeholder="Name der neuen Fähigkeit" aria-label="Name der neuen Fähigkeit" hidden></div>
        <span class="lab" style="grid-column:2" id="${p}-plant">Was wächst im Beet?</span><div class="ctl ppick" role="group" aria-labelledby="${p}-plant">${L.PLANTS.map(k => `<button type="button" class="chip pchip" data-plant="${k}" aria-pressed="${plant === k}">${sheetImg('pflanzen-' + k, 'ausgewachsen', 2)}<span>${PNAME[k]}</span></button>`).join('')}</div></div>
      <div class="step"><b>6</b><span class="lab">Aufwand und Optionen</span>
        <div class="ctl">${[1, 2, 3].map(e => `<button type="button" class="chip" data-eff="${e}" aria-pressed="${eff === e}">${['Leicht', 'Mittel', 'Schwer'][e - 1]} · ${10 * e} XP</button>`).join('')}</div>
        <div class="ctl"><label class="sw"><input type="checkbox" data-f="streak" ${h ? (h.streakEnabled ? 'checked' : '') : 'checked'}> Serie zählen</label><label class="sw"><input type="checkbox" data-f="rem" ${h ? (h.remindersEnabled ? 'checked' : '') : 'checked'}> Wilma erinnert in der App</label></div>
        <p class="hint" style="grid-column:2">Wilma zeigt dir deinen Plan, wenn du die App öffnest. Mitteilungen außerhalb der App gibt es im Prototyp noch nicht.</p></div></details>
      ${h ? '<p class="hint">Neuer Aufwand oder Rhythmus gilt ab heute. Bisherige Tage behalten ihre Werte.</p>' : ''}
      <div class="preview" data-f="preview">Nach ${h ? esc(h.anchor) : '___'} werde ich ${h ? esc(h.title) : '___'}.</div><div class="err" data-f="err" hidden></div>
      <div class="row-btns"><button class="btn" type="submit">${h ? 'Änderungen speichern' : 'Gewohnheit pflanzen'}</button>${h ? `<button class="btn ghost" type="button" data-act="edit-cancel">Abbrechen</button>` : ''}</div></form>`;
  }
  function readForm(form) {
    const q = s => form.querySelector(s), pressed = sel => [...form.querySelectorAll(sel)].filter(b => b.getAttribute('aria-pressed') === 'true');
    const kind = (pressed('[data-freq]')[0] || {}).dataset.freq || 'daily';
    const frequency = kind === 'weekly' ? { kind, timesPerWeek: Math.round(+q('[data-f=n]').value || 0) } : kind === 'weekdays' ? { kind, days: pressed('[data-day]').map(b => +b.dataset.day) } : { kind };
    return { title: q('[data-f=title]').value, anchor: q('[data-f=anchor]').value, anchorTime: q('[data-f=time]').value, tinyVersion: q('[data-f=tiny]').value, frequency,
      skillId: q('[data-f=skill]').value, newSkill: q('[data-f=newskill]').value.trim(), effort: +((pressed('[data-eff]')[0] || {}).dataset || {}).eff || 0,
      streakEnabled: q('[data-f=streak]').checked, remindersEnabled: q('[data-f=rem]').checked, plantType: ((pressed('[data-plant]')[0] || {}).dataset || {}).plant };
  }
  function fillIdea(form, idea) {
    const q = s => form.querySelector(s);
    q('[data-f=title]').value = idea.title; q('[data-f=anchor]').value = idea.anchor; q('[data-f=tiny]').value = idea.tiny; q('[data-f=time]').value = idea.time;
    const sk = S.skills[idea.skill]; if (sk) q('[data-f=skill]').value = sk.id; updatePreview(form); q('[data-f=title]').focus();
  }
  function updatePreview(form) { const i = readForm(form); form.querySelector('[data-f=preview]').textContent = `Nach ${L.cleanAnchor(i.anchor) || '___'} werde ich ${i.title.trim() || '___'}.`; }
  function submitForm(form) {
    const kind = form.dataset.form, i = readForm(form), err = form.querySelector('[data-f=err]'), t = today();
    const miss = L.validateHabitInput(i); if (i.skillId === '__new' && !i.newSkill) miss.push('einen Namen für die neue Fähigkeit');
    if (kind !== 'edit') { const c = L.canAddHabit(S, t); if (!c.ok) miss.push(`etwas Geduld: weitere Gewohnheiten ab ${fmt(c.unlockOn, { weekday: 'long', day: 'numeric', month: 'long' })}`); }
    if (miss.length) { const more = form.querySelector('details.more'); if (more && (!i.effort || (i.skillId === '__new' && !i.newSkill))) more.open = true;   // U14: Fehler nie versteckt
      err.hidden = false; err.textContent = 'Bitte ergänze noch: ' + miss.join(', ') + '.'; au.sfx.err(); return; }
    err.hidden = true;
    if (i.skillId === '__new') { const id = 's' + uid(), icon = SP.ICONS[S.skills.length % SP.ICONS.length]; S.skills.push({ id, name: i.newSkill, icon, st: S.skills.length, buildingType: L.suggestBuilding(icon) }); i.skillId = id; }
    if (kind === 'edit') {
      const h = S.habits.find(x => x.id === U.editHabit); L.applyEdit(h, i, t); U.editHabit = null; au.sfx.place(); closeSheet();
      toast(`<span><b>Gespeichert.</b> „${esc(h.title)}“ ist aktualisiert.</span>`);
    } else {
      const h = L.newHabit(i, t, uid()); S.habits.push(h); au.sfx.place();
      if (kind === 'new') { closeSheet(); toast(`${img('p1', 3, '')}<span><b>Gepflanzt!</b> Auf deinem Hof wächst jetzt ein neues Beet.</span>`); }
    }
    derive(); save(); if (kind === 'ob') showOnboarding('habits'); refresh(); scene.refresh();
  }

  /* ---------- Overlays ---------- */
  const overlay = html => { $('#overlay').innerHTML = html ? `<div class="overlay">${html}</div>` : ''; const f = $('#overlay .frame'); if (f) { const t = f.querySelector('h2'); if (t) { t.tabIndex = -1; t.focus(); } } };
  function showOnboarding(step) {
    U.obStep = step; const n = S.habits.length;
    const dots = ['welcome', 'habits', 'done'].map(s => `<i class="${s === step || (step === 'done') || (step === 'habits' && s === 'welcome') ? 'on' : ''}"></i>`).join('');
    let h = `<div class="frame" role="dialog" aria-modal="true" aria-labelledby="obT"><div class="steps" aria-hidden="true">${dots}</div>`;
    if (step === 'welcome') {
      const v3 = Store.legacyV3();
      h += `<div class="say">${portrait()}<div><div class="who">Wilma · Nachbarin</div><h2 id="obT">Willkommen auf deinem Hof!</h2></div></div>
        <div class="say"><span></span><div style="display:grid;gap:8px">
          <p>Jede Gewohnheit wird hier zu einem Beet. Je beständiger du sie pflegst, desto kräftiger wächst sie.</p>
          <p>Verpasst du einen Tag, wächst die Pflanze nur etwas langsamer. Auf diesem Hof stirbt nichts.</p>
          <p>Wir fangen klein an: mit höchstens drei Gewohnheiten, jede an einer Routine, die du schon hast.</p></div></div>
        <div class="row-btns"><button class="btn" type="button" data-act="ob-start">Hof anlegen</button><button class="btn alt" type="button" data-act="demo-start">Erst eine Demo ansehen</button></div>
        ${v3 ? `<div class="banner info"><span class="sp">Auf diesem Gerät gibt es eigene Daten aus Version 3 (${(v3.habits || []).length} Gewohnheiten).</span><button class="btn sm" type="button" data-act="ob-v3">Übernehmen</button></div>` : ''}
        <div class="row-btns"><button class="btn ghost" type="button" data-act="import-open">Sicherung importieren</button></div>
        <input type="file" id="importFile" accept="application/json,.json" hidden><div class="err" id="importErr" hidden></div>`;
    } else if (step === 'habits') {
      h += `<div class="say">${portrait()}<div><div class="who">Wilma</div><h2 id="obT">Was soll auf deinem Hof wachsen?</h2><p>Such dir bis zu drei Gewohnheiten aus. Nach der ersten Woche kannst du weitere pflanzen.</p></div></div>`;
      if (n) h += `<h3>Gepflanzt · ${n} von ${L.C.START_HABITS}</h3><div class="planted">${S.habits.map(x => `<div>${img('p0', 3, '')}<span>${esc(planText(x))}</span><button class="del" type="button" data-act="ob-remove" data-id="${x.id}" aria-label="${esc(x.title)} entfernen">×</button></div>`).join('')}</div>`;
      if (n < L.C.START_HABITS) h += `<h3>Ideen zum Anpassen</h3><div class="ideas">${IDEAS.map((x, i) => `<button type="button" class="chip idea" data-act="idea" data-i="${i}">${esc(x.title)} · nach ${esc(x.anchor)}</button>`).join('')}</div>${habitForm('ob', null)}`;
      else h += `<p class="hint">Drei Beete sind ein guter Anfang. Mehr Platz gibt es nach der ersten Woche.</p>`;
      h += `<div class="row-btns"><button class="btn" type="button" data-act="ob-next" ${n ? '' : 'disabled'}>Weiter</button><button class="btn ghost" type="button" data-act="ob-back">Zurück</button></div>`;
    } else {
      h += `<div class="say">${portrait()}<div><div class="who">Wilma</div><h2 id="obT">Dein Hof ist bereit.</h2></div></div>
        <div class="ci-list"><div>${img('sonnig', 3, '')}<span><b>Morgens</b> zeigt dir ein kurzer Check-in deine Pläne für den Tag. Er dauert keine halbe Minute und lässt sich überspringen.</span></div>
        <div>${img('gem', 3, '')}<span><b>Tagsüber</b> hakst du im Tab „Heute“ ab. An schlechten Tagen zählt die Mini-Version voll.</span></div>
        <div>${img('bewoelkt', 3, '')}<span><b>Abends</b> schließt du den Tag im Logbuch ab und wählst sein Wetter.</span></div></div>
        <div class="row-btns"><button class="btn" type="button" data-act="ob-finish">Zum Hof</button></div>`;
    }
    overlay(h + '</div>');
  }
  function finishOnboarding() {
    const t = today(); S.onboarded = true; S.startedAt = t; S.checkins[t] = { skipped: true };
    overlay(''); derive(); flush(); refresh(); scene.refresh(true);
    toast(`${portrait().replace('portrait', '')}<span><b>Wilma:</b> Schön, dass du da bist. Ich schau ab und zu vorbei.</span>`);
  }
  function startDemo() { realState = S; S = root.LAGDemo.demoState(today()); preview = null; overlay(''); $('#demoBar').hidden = false; derive(); refresh(); scene.refresh(true); }
  function endDemo() { S = realState; applyLook(); realState = null; $('#demoBar').hidden = true; derive(); refresh(); scene.refresh(true); if (!S.onboarded) showOnboarding('welcome'); }

  function showCheckin() {
    U.ci = U.ci || { todos: new Set(S.todos.filter(t => !t.doneAt && t.dueDate === today()).map(t => t.id)), weather: null };
    const due = active().filter(h => D.H[h.id].due && !D.H[h.id].doneToday), open = S.todos.filter(t => !t.doneAt);
    const minutes = s => { if (!s) return 9999; const [a, b] = s.split(':').map(Number); return a * 60 + b; };
    due.sort((a, b) => minutes(a.anchorTime) - minutes(b.anchorTime));
    overlay(`<div class="frame" role="dialog" aria-modal="true" aria-labelledby="ciT">
      <div class="say">${portrait()}<div><div class="who">Wilma</div><h2 id="ciT">Guten ${hour() < 11 ? 'Morgen' : 'Tag'}!</h2><p>Das steht heute an. Dauert keine halbe Minute.</p></div></div>
      <h3>Deine Pläne für heute</h3>
      <div class="ci-list">${due.length ? due.map(h => { const st = styleOf(skillById(h.skillId)); return `<div>${img('p' + D.H[h.id].stage, 3, '', { F: st.c, f: st.dk })}<span class="plan">${esc(planText(h))}${h.anchorTime ? ' · ca. ' + esc(h.anchorTime) : ''}</span></div>`; }).join('') : '<div>Heute steht keine Gewohnheit an.</div>'}</div>
      <h3>Welche To-dos nimmst du dir vor? Optional, bis zu drei</h3>
      <div class="ideas">${open.length ? open.map(t => `<button type="button" class="chip" data-act="ci-todo" data-id="${t.id}" aria-pressed="${U.ci.todos.has(t.id)}">${esc(t.title)}</button>`).join('') : '<span class="hint">Keine offenen To-dos.</span>'}</div>
      <form class="add" id="ciTodoForm"><input class="in" id="ciTodo" maxlength="90" placeholder="Neues To-do für heute" aria-label="Neues To-do für heute"><button class="btn alt" type="submit">Hinzufügen</button></form>
      <h3>Wie fühlst du dich? Optional</h3>
      <div class="weather" role="group" aria-label="Stimmung als Wetter">${L.WEATHER.map(w => `<button type="button" class="wbtn" data-act="ci-weather" data-w="${w}" aria-pressed="${U.ci.weather === w}">${img(w, 4, '')}${WNAME[w]}</button>`).join('')}</div>
      <div class="row-btns"><button class="btn" type="button" data-act="ci-done">Los geht's</button><button class="btn ghost" type="button" data-act="ci-skip">Überspringen</button></div></div>`);
  }
  function closeCheckin(done) {
    const t = today();
    if (done) { S.checkins[t] = { todos: [...U.ci.todos], weather: U.ci.weather }; S.todos.forEach(x => { if (U.ci.todos.has(x.id)) x.dueDate = t; }); }
    else S.checkins[t] = { skipped: true };
    U.ci = null; overlay(''); derive(); save(); refresh(); scene.refresh();
  }

  /* ---------- Erntekalender ---------- */
  const LEGEND = [['done', 'Erledigt:', 'an diesem Tag geschafft.'], ['tiny', 'Mini:', 'die Mini-Version geschafft, zählt voll.'],
    ['repaired', 'Extra-Runde:', 'ausgefallen, mit einer Extra-Runde am Tag danach gerettet.'], ['watered', 'Regentag:', 'ausgefallen, automatisch von einem Regentag gerettet.'],
    ['empty', 'Offen:', 'geplant, aber nicht erledigt.'], ['off', 'Nicht geplant:', 'an diesem Tag stand nichts an.'],
    ['done late', 'Nachgetragen (abgeschrägte Ecke):', 'später eingetragen, zählt voll, bringt aber keinen Fund.']];
  function calendarHTML() {
    const t = today(), year = U.calYear || t.slice(0, 4), hid = U.calHabit && S.habits.some(h => h.id === U.calHabit) ? U.calHabit : '';
    const g = L.yearGrid(S, D, hid || null, year, t), firstYear = Math.min(+S.startedAt.slice(0, 4), ...S.habits.map(h => +h.createdAt.slice(0, 4)));
    const label = { done: 'erledigt', tiny: 'Mini-Version', repaired: 'mit Extra-Runde gerettet', watered: 'Regentag', empty: 'offen', off: 'nicht geplant', before: 'noch nicht angelegt', future: '', none: '' };
    let months = ''; for (let m = 1; m <= 12; m++) { const k = `${year}-${String(m).padStart(2, '0')}-01`, c = g.cells.find(x => x.k === k); if (c) months += `<span class="m" style="grid-column:${c.col + 2}">${fmt(k, { month: 'short' }).replace('.', '')}</span>`; }
    const wd = [['Mo', 0], ['Mi', 2], ['Fr', 4]].map(([l, r]) => `<span class="wd" style="grid-row:${r + 2}">${l}</span>`).join('');
    const cells = g.cells.map(c => { if (c.v === 'none') return ''; const tip = typeof c.v === 'number' ? `${c.v === 0 ? 'nichts' : c.v === 4 ? '5 oder mehr' : c.v === 3 ? '3–4' : c.v} erledigt` : label[c.v];
      const info = tip ? `${fmt(c.k, { weekday: 'long', day: 'numeric', month: 'long' })}: ${tip}${c.late ? ', nachgetragen' : ''}` : '';
      return `<i class="cal-cell v-${c.v}${c.late ? ' late' : ''}${c.k === t ? ' v-today' : ''}" style="grid-column:${c.col + 2};grid-row:${c.row + 2}"${info ? ` title="${info}" data-info="${info}"` : ''}></i>`; }).join('');
    let stat;
    if (hid) { const days = Object.entries(D.H[hid].days).filter(([k]) => k.startsWith(year)); const done = days.filter(([, v]) => v === 'done').length, tiny = days.filter(([, v]) => v === 'tiny').length, rep = days.filter(([, v]) => v === 'repaired' || v === 'watered').length;
      stat = `${done + tiny} erledigt in ${year}${tiny ? `, davon ${tiny} als Mini-Version` : ''}${rep ? ` · ${rep} gerettet` : ''}`; }
    else { const n = g.cells.filter(c => typeof c.v === 'number' && c.v > 0).length; stat = `${n} ${n === 1 ? 'Tag' : 'Tage'} in ${year} mit mindestens einer Erledigung`; }
    const legend = hid ? LEGEND.map(([v, l]) => `<span><i class="v-${v}"></i>${l.replace(/:$/, '').replace(' (abgeschrägte Ecke)', '')}</span>`).join('')
      : `<span>wenig</span>${[0, 1, 2, 3, 4].map(v => `<i class="v-${v}"></i>`).join('')}<span>viel</span>`;
    return `<div class="harvest"><div class="ctl"><select class="in" id="calHabit" aria-label="Kalender für">${[['', 'Alle Gewohnheiten'], ...S.habits.map(h => [h.id, h.title + (h.archivedAt ? ' (pausiert)' : '')])].map(([v, l]) => `<option value="${v}" ${v === hid ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>
      <button class="btn ghost" type="button" data-act="cal-prev" ${+year <= firstYear ? 'disabled' : ''} aria-label="Vorheriges Jahr">‹</button><span>${year}</span><button class="btn ghost" type="button" data-act="cal-next" ${year >= t.slice(0, 4) ? 'disabled' : ''} aria-label="Nächstes Jahr">›</button></div>
      <div class="cal-scroll"><div class="cal-grid" style="--cols:${g.cols}" role="img" aria-label="Erntekalender ${year}: ${esc(stat)}">${months}${wd}${cells}</div></div>
      <div class="cal-info" id="calInfo" aria-live="polite">Tippe auf einen Tag, um Datum und Status zu sehen.</div>
      <div class="ctx">${esc(stat)}</div><div class="cal-legend">${legend}</div></div>`;
  }

  /* ---------- Darstellung (H4) ---------- */
  const SCALES = [[1, 'Normal'], [1.15, 'Groß'], [1.3, 'Sehr groß']];
  /** v8b: Farbthemen der Oberfläche (CSS [data-theme], Werte aus docs/farbthemen.json); gespeichert als S.theme, Standard = Feld fehlt. */
  const THEMES = [['', 'Standard'], ['wald', 'Wald'], ['herbst', 'Herbst'], ['frost', 'Frost'], ['meer', 'Meer'], ['kirschbluete', 'Kirschblüte'], ['pergament', 'Pergament (hell)'], ['jahreszeit', 'Passend zur Jahreszeit']];
  function applyLook() {
    const de = document.documentElement; de.style.setProperty('--ts', S.textScale || 1);
    const th = L.themeFor(S.theme, today()); if (th !== 'standard') de.dataset.theme = th; else delete de.dataset.theme;
    const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = getComputedStyle(de).getPropertyValue('--bg-a').trim() || '#0d1719';
    if (S.accent && S.accent !== 'thema') de.dataset.accent = S.accent; else delete de.dataset.accent;
    if (S.readableFont) de.dataset.font = 'lesbar'; else delete de.dataset.font;
    if (S.palette === 'cb') de.dataset.palette = 'cb'; else delete de.dataset.palette;
  }
  /* ---------- Beta-Metriken (H5) ---------- */
  function metricsHTML() {
    if (S.demo) return '';
    const m = L.betaMetrics(S, today()), c = m.cohorts, frac = (a, b) => b ? `${a} von ${b}` : '–';
    return `<div class="hd2"><h3>Beta-Zahlen</h3>${qBtn('beta')}</div><div class="data">
      <div class="tiles"><div class="tile"><strong>${frac(c.d30.held, c.d30.eligible)}</strong><span>nach 30 Tagen gehalten</span></div><div class="tile"><strong>${frac(c.d66.held, c.d66.eligible)}</strong><span>nach 66 Tagen gehalten</span></div>
      <div class="tile"><strong>${frac(c.d66.mastered, c.d66.eligible)}</strong><span>nach 66 Tagen gemeistert</span></div><div class="tile"><strong>${m.tiny.completions ? pct(m.tiny.share) : '–'}</strong><span>Mini-Versionen</span></div>
      <div class="tile"><strong>${m.breaks.breaks ? frac(m.breaks.returnedWithin7, m.breaks.breaks) : '–'}</strong><span>nach einer Pause binnen 7 Tagen weitergemacht</span></div><div class="tile"><strong>${pct(m.checkins.share)}</strong><span>Tage mit Check-in</span></div></div>
      <div class="row-btns"><button class="btn alt" type="button" data-act="metrics-save">Als Datei sichern</button><button class="btn ghost" type="button" data-act="metrics-copy">Kopieren</button></div></div>`;
  }
  function metricsJSON() { return JSON.stringify({ app: "Life's a Game", version: 5, metrics: L.betaMetrics(S, today()) }, null, 2); }

  /* ---------- Bereiche ---------- */
  const R = {
    cal() { const d = new Date(), w = weather(), short = o => d.toLocaleDateString('de-DE', o).replace('.', ''); $('#cal').innerHTML = `${img(w, 2, '')}<span>${short({ weekday: 'short' })} ${d.getDate()}. ${short({ month: 'short' })} · ${L.seasonOf(d.getMonth())} · ${WNAME[w].toLowerCase()}</span>`; },
    hud() {
      const c = D.char; $('#lvlNum').textContent = c.l; $('#xpText').textContent = c.into + ' / ' + c.need + ' XP'; $('#xpBar').style.width = Math.round(c.into / c.need * 100) + '%';
      const w = $('#xpBarWrap'); w.setAttribute('aria-valuenow', c.into); w.setAttribute('aria-valuemin', 0); w.setAttribute('aria-valuemax', c.need);
      let best = null; S.skills.forEach(s => { active().filter(h => h.skillId === s.id).forEach(h => { const u = L.unitsToNext(D.levels[s.id], h.effort); if (!best || u < best.u) best = { s, h, u }; }); });
      $('#nearText').textContent = best ? `Noch ${best.u}× „${best.h.title}“ bis ${best.s.name} Stufe ${D.levels[best.s.id].l + 1}` : '';
      const open = active().filter(h => D.H[h.id].due && !D.H[h.id].doneToday).length + S.todos.filter(t => !t.doneAt && (!t.dueDate || t.dueDate <= today())).length;
      $('#nToday').textContent = open || ''; $('#nToday').hidden = !open;
      const on = !!(S.sound || S.music), sb = $('#sndBtn'); sb.innerHTML = img(on ? 'speaker' : 'mute', 3, ''); sb.setAttribute('aria-pressed', on); sb.setAttribute('aria-label', on ? 'Ton ausschalten' : 'Ton einschalten');
      R.chestBadge();
    },
    chestBadge() { const n = Object.values(S.chest.items).reduce((a, b) => a + b, 0); $('#nChest').textContent = n || ''; $('#nChest').hidden = !n; },
    legend() { const a = active(); $('#legend').innerHTML = S.skills.map(s => `<span>${img(s.icon, 2, '')}${esc(s.name)} · Stufe ${D.levels[s.id].l}</span>`).join('') + (a.length ? `<span>Beete: ${Math.min(a.length, L.C.MAX_BEDS)} von ${a.length}</span>` : ''); },
    skills() {
      $('#skills').innerHTML = S.skills.map(s => {
        const l = D.levels[s.id], st = styleOf(s), sty = `--c:${st.c};--hi:${st.hi};--dk:${st.dk}`;
        if (U.renaming === s.id) return `<div class="skill" style="${sty}"><button class="iconbtn" type="button" data-act="icon" data-sid="${s.id}" title="Symbol wechseln">${img(s.icon, 3, 'Symbol wechseln')}</button><input class="in" id="renameIn" value="${esc(s.name)}" maxlength="20" aria-label="Name der Fähigkeit"><button class="btn sm ren" type="button" data-act="renok">OK</button>
          <div class="bpick" role="group" aria-label="Gebäude für ${esc(s.name)}"><span class="lab">Gebäude auf dem Hof</span>${L.BUILDINGS.map(b => `<button type="button" class="chip bchip" data-act="btype" data-sid="${s.id}" data-v="${b}" aria-pressed="${s.buildingType === b}">${sheetImg('gebaeude-' + b, 'stufe-4', 1)}<span>${BNAME[b]}</span></button>`).join('')}</div></div>`;
        return `<div class="skill" style="${sty}">${img(s.icon, 3, '')}<button type="button" class="sopen" data-act="ssheet" data-sid="${s.id}"><span class="stat-line"><span>${esc(s.name)} <span class="lv">Stufe ${l.l} · ${BNAME[s.buildingType] || ''}</span></span><span>${l.into}/${l.need}</span></span><span class="vh">, Verlauf anzeigen</span></button><button class="iconbtn ren" type="button" data-act="ren" data-sid="${s.id}" aria-label="${esc(s.name)} umbenennen">Ändern</button><div class="bar sm sk"><i style="width:${Math.round(l.into / l.need * 100)}%"></i></div></div>`;
      }).join('') + (S.skills.length < L.C.MAX_SKILLS ? `<div><button class="btn ghost" type="button" data-act="addskill">+ Neue Fähigkeit</button></div>` : '');
      const ri = $('#renameIn'); if (ri) { ri.focus(); ri.select(); }
    },
    today() {
      const t = today(), minutes = s => { if (!s) return 9999; const [a, b] = s.split(':').map(Number); return a * 60 + b; };
      const due = active().filter(h => D.H[h.id].due).sort((a, b) => (!!D.H[a.id].doneToday - !!D.H[b.id].doneToday) || (minutes(a.anchorTime) - minutes(b.anchorTime)));
      const free = active().filter(h => !D.H[h.id].due), doneN = due.filter(h => D.H[h.id].doneToday).length;
      let h = head('h2', `Heute <span class="cnt">· ${doneN} von ${due.length}</span>`, 'heute');
      h += '<div class="list">' + (due.length ? due.map(x => habitRow(x)).join('') : `<div class="empty">${active().length ? 'Heute steht keine Gewohnheit an.' : 'Noch keine Gewohnheit. Unter „Gewohnheiten“ kannst du eine pflanzen.'}</div>`) + '</div>';
      h += lateHTML();
      if (free.length) h += `<div class="free"><span class="ctx">Heute frei:</span>${free.map(x => { const d = D.H[x.id]; return `<button type="button" class="chip" data-act="hsheet" data-id="${x.id}">${esc(x.title)}<span class="vh">, ${d.weekly ? `Wochenziel erreicht: ${d.weekCnt} von ${d.N}` : 'heute nicht geplant · ' + freqText(x.frequency)}</span></button>`; }).join('')}</div>`;
      const open = S.todos.filter(x => !x.doneAt).sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999')), doneT = S.todos.filter(x => x.doneAt === t);
      h += `<div class="hd2"><h3>To-dos <span class="cnt">· ${open.length}</span></h3>${qBtn('todo')}</div>`;
      h += `<div class="list">${open.map(todoRow).join('')}${doneT.map(todoRow).join('')}</div><div class="row-btns"><button class="btn alt" type="button" id="todoAdd" data-act="todo-new">+ To-do</button></div>`;
      $('#todayBody').innerHTML = h;
    },
    habits() {
      const t = today(), c = L.canAddHabit(S, t), act = active(), paused = S.habits.filter(h => h.archivedAt);
      let h = head('h2', 'Gewohnheiten', 'gewohnheiten');
      if (c.ok) h += `<div class="row-btns"><button class="btn" type="button" id="hNew" data-act="hnew">+ Gewohnheit</button></div><div class="ideas" aria-label="Vorlagen">${IDEAS.map((x, i) => `<button type="button" class="chip idea" data-act="idea-new" data-i="${i}">${esc(x.title)}</button>`).join('')}</div>`;
      else h += `<p class="ctx">Drei Beete sind für den Anfang genug. Ab ${fmt(c.unlockOn, { weekday: 'long', day: 'numeric', month: 'long' })} kannst du weitere pflanzen. Bis dahin: Lass die ersten richtig Wurzeln schlagen.</p>`;
      h += act.length ? `<h3>Aktiv · ${act.length}</h3><div class="list">${act.map(x => habitRow(x, { check: false })).join('')}</div>` : '';
      if (paused.length) h += `<h3>Pausiert · ${paused.length}</h3><div class="list">${paused.map(x => habitRow(x, { check: false })).join('')}</div>`;
      $('#p-habits').innerHTML = h;
    },
    journal() {
      const t = today(), cur = L.journalOn(S, t);
      let h = head('h2', 'Logbuch', 'logbuch');
      if (cur && !U.editingJournal) h += `<div class="closed">${img('gem', 2, '')} Tag abgeschlossen. Auf deinem Hof bricht der Abend an.</div><div class="entry"><header>${img(cur.weather, 3, '')} Heute · ${WNAME[cur.weather]}</header><p>${esc(cur.text)}</p><div><button class="btn alt" type="button" data-act="editj">Bearbeiten</button></div></div>`;
      else {
        const pr = PROMPTS[(new Date().getDate() + U.promptShift) % PROMPTS.length], w = U.selWeather || weather();
        h += `<div style="display:grid;gap:12px"><div class="weather" role="group" aria-label="Wie war dein Tag?">${L.WEATHER.map(id => `<button type="button" class="wbtn" data-act="weather" data-w="${id}" aria-pressed="${w === id}">${img(id, 4, '')}${WNAME[id]}</button>`).join('')}</div>
          <div class="prompt">Frage des Tages: ${pr} <button class="iconbtn" type="button" data-act="prompt">Andere Frage</button></div>
          <textarea class="in" id="jText" placeholder="Schreib ein paar Zeilen über deinen Tag …" aria-label="Logbuch-Eintrag">${cur ? esc(cur.text) : esc(U.draft)}</textarea>
          <div class="row-btns"><button class="btn" type="button" data-act="savej">${cur ? 'Speichern' : 'Tag abschließen · +' + L.C.JOURNAL_XP + ' XP'}</button>${cur ? '<button class="btn ghost" type="button" data-act="editj-cancel">Abbrechen</button>' : ''}</div></div>`;
      }
      const wk = L.weekStart(t), inWeek = k => L.weekStart(k) === wk, ents = S.journal.filter(j => inWeek(j.date));
      let doneW = 0, tinyW = 0; S.habits.forEach(x => { for (const k in x.logs) if (inWeek(k)) { if (x.logs[k] === 'done') doneW++; else if (x.logs[k] === 'tiny') tinyW++; } });
      const wc = {}; ents.forEach(j => wc[j.weather] = (wc[j.weather] || 0) + 1); const topW = Object.entries(wc).sort((a, b) => b[1] - a[1])[0];
      const bestH = S.habits.map(x => [x, Object.keys(x.logs).filter(k => inWeek(k) && (x.logs[k] === 'done' || x.logs[k] === 'tiny')).length]).sort((a, b) => b[1] - a[1])[0];
      h += `<div class="week-review"><b>Wochenrückblick</b><span>${ents.length} ${ents.length === 1 ? 'Eintrag' : 'Einträge'} · ${doneW + tinyW} erledigte Termine${tinyW ? `, davon ${tinyW} als Mini-Version` : ''}</span>${topW ? `<span>Häufigstes Wetter: ${WNAME[topW[0]]}</span>` : ''}${bestH && bestH[1] ? `<span>Am häufigsten: ${esc(bestH[0].title)} (${bestH[1]}×)</span>` : ''}</div>`;
      const past = S.journal.filter(j => j.date !== t).sort((a, b) => b.date.localeCompare(a.date));
      if (past.length) h += '<h3>Tagebuch im Farmhaus</h3><div class="list">' + past.map(j => `<div class="entry"><header>${img(j.weather, 3, '')} ${fmt(j.date, { weekday: 'long', day: 'numeric', month: 'long' })}</header><p>${esc(j.text)}</p></div>`).join('') + '</div>';
      $('#p-journal').innerHTML = h;
    },
    progress() {
      const t = today(), ym = t.slice(0, 7), mName = new Date().toLocaleDateString('de-DE', { month: 'long' });
      let done = 0, tiny = 0, grown = 0; S.habits.forEach(x => { const d = D.H[x.id]; done += d.month; tiny += d.monthTiny; if (d.stage > d.stageMonthStart) grown++; });
      const grads = S.habits.filter(x => D.H[x.id].graduated), jm = S.journal.filter(j => j.date.startsWith(ym)).length;
      let h = head('h2', 'Fortschritt', 'fortschritt');
      h += `<div class="hd2"><h3>Erntekalender</h3>${qBtn('kalender')}</div>${calendarHTML()}
        <h3>Monatsrückblick ${mName}</h3><div class="badges month">${[['gem', done, 'erledigt', 'erledigte Termine'], ['boot', tiny, 'Mini', 'davon Mini-Versionen'], ['p2', grown, 'gewachsen', 'Pflanzen gewachsen'], ['flower', grads.length, 'gemeistert', 'gemeistert'], ['book', jm, 'Logbuch', 'Logbuch-Einträge']].map(([ic, n, w, sr]) => `<span class="bdg">${img(ic, 2, '')}<b>${n}</b> <span aria-hidden="true">${w}</span><span class="vh">${sr}</span></span>`).join('')}</div>`;
      h += `<div class="hd2"><h3>Gemeistert</h3>${qBtn('gemeistert')}</div>` + (grads.length ? `<div class="hall">${grads.map(g => `<div>${img('gem', 3, '')}<span>${esc(g.title)} · gemeistert am ${fmt(D.H[g.id].gradDate, { day: 'numeric', month: 'long' })}</span></div>`).join('')}</div>` : '<p class="ctx">Noch keine gemeisterte Gewohnheit.</p>');
      $('#progressBody').innerHTML = h;
      const sc = $('#p-progress .cal-scroll'); if (sc) sc.scrollLeft = (U.calYear || t.slice(0, 4)) === t.slice(0, 4) ? sc.scrollWidth : 0;
    },
    chest() {
      const cap = L.slotsFor(D.char.l), used = S.chest.placed.filter(p => !L.ITEMS[p.itemId].animal).length, sleep = L.farmSleeps(hour());
      let h = head('h2', 'Truhe', 'truhe');
      if (sleep) h += `<div class="sleep">Die Farm schläft. Ab 6 Uhr kannst du wieder dekorieren. Abhaken geht natürlich jederzeit.</div>`;
      h += `<h3>Funde · ${used} von ${cap} Plätzen belegt</h3>`;
      const inv = Object.entries(S.chest.items).filter(([, n]) => n > 0);
      h += inv.length ? `<div class="inv">${inv.map(([k, n]) => { const it = L.ITEMS[k], full = !it.animal && used >= cap; return `<div class="item${it.rare ? ' r' : ''}"><div class="pv">${itemImg(k, 2)}</div><h4>${it.name}<span class="badge ${it.rare ? 'rare' : 'com'}">${it.rare ? 'selten' : 'häufig'}</span></h4><div class="cnt">${n}× in der Truhe</div><button class="btn sm" type="button" data-act="place" data-type="${k}" ${sleep || full ? 'disabled' : ''}>${full ? 'Kein Platz frei' : 'Aufstellen'}</button></div>`; }).join('')}</div>`
        : '<div class="empty">Die Truhe ist leer. Erledige Gewohnheiten und To-dos, manchmal taucht dabei etwas auf.</div>';
      h += '<h3>Auf dem Hof</h3>' + (S.chest.placed.length ? `<div class="inv">${S.chest.placed.map((p, i) => `<div class="item${L.ITEMS[p.itemId].rare ? ' r' : ''}"><div class="pv">${itemImg(p.itemId, 2)}</div><h4>${L.ITEMS[p.itemId].name}</h4><div class="cnt">${L.ITEMS[p.itemId].animal ? 'Läuft frei herum' : 'Platz ' + (p.slot + 1)}</div><button class="btn sm alt" type="button" data-act="stash" data-i="${i}" ${sleep ? 'disabled' : ''}>Einlagern</button></div>`).join('')}</div>` : '<p class="ctx">Noch nichts aufgestellt.</p>');
      h += albumHTML();
      h += `<div class="row-btns"><button class="btn ghost" type="button" id="oddsBtn" data-act="odds">Wie funktionieren Funde?</button></div>`;
      $('#p-chest').innerHTML = h;
    },
    npc() {
      const x = hint(); U.hint = x; $('#npcFace').innerHTML = img('wilma', 3, ''); $('#npcText').textContent = x.text;
      const a = { late: () => `<button class="btn sm" type="button" data-act="late-open" data-id="${x.item.id}" data-k="${x.item.k}">Eintragen</button>`,
        checkin: () => `<button class="btn sm" type="button" data-act="ci-open">Check-in</button><button class="btn ghost" type="button" data-act="ci-later">Später</button>`,
        milestone: () => x.item.acts || '', spruch: () => x.more ? `<button class="btn ghost" type="button" data-act="npc-next" aria-label="Nächster Hinweis von Wilma">Mehr</button>` : '' }[x.kind]();
      $('#npcAct').innerHTML = a; $('#npcAct').hidden = !a;
    },
    /** v8c: Einstellungen als eigener Bildschirm (Zahnrad in der Kopfzeile). */
    settings() {
      const b = $('#settingsBody'); if (!b) return;
      const onoff = (act, v, on) => `<button type="button" class="chip" data-act="${act}" data-v="1" aria-pressed="${!!v === true}">An</button><button type="button" class="chip" data-act="${act}" data-v="" aria-pressed="${!v}">Aus</button>`;
      let h = `<div class="hd2"><h3>Darstellung</h3>${qBtn('darstellung')}</div><div class="look">
        <div class="ctl thm" role="group" aria-label="Farbthema"><span class="lab">Thema</span>${THEMES.map(([v, l]) => { const shown = L.themeFor(v || 'standard', today()), now = v === 'jahreszeit' ? ` (jetzt ${THEMES.find(x => (x[0] || 'standard') === shown)[1]})` : '';
          return `<button type="button" class="chip tchip" data-act="theme" data-v="${v}" aria-pressed="${(S.theme || '') === v}"><span class="tpv" data-theme="${shown}" aria-hidden="true"><i></i><i></i><i></i></span>${l}${now}</button>`; }).join('')}</div>
        <div class="ctl" role="group" aria-label="Akzentfarbe"><span class="lab">Akzent ${qBtn('akzent')}</span>${HX.ACCENTS.map(([v, l]) => `<button type="button" class="chip achip" data-act="accent" data-v="${v}" aria-pressed="${(S.accent || 'thema') === v}"><span class="apv" ${v === 'thema' ? '' : `data-accent="${v}"`} aria-hidden="true">Aa</span>${l}</button>`).join('')}</div>
        <div class="ctl" role="group" aria-label="Schriftgröße"><span class="lab">Schrift</span>${SCALES.map(([v, l]) => `<button type="button" class="chip" data-act="scale" data-v="${v}" aria-pressed="${(S.textScale || 1) === v}">${l}</button>`).join('')}</div>
        <div class="ctl" role="group" aria-label="Schriftart"><span class="lab">Schriftart</span><button type="button" class="chip" data-act="font" data-v="" aria-pressed="${!S.readableFont}">Pixel</button><button type="button" class="chip" data-act="font" data-v="1" aria-pressed="${!!S.readableFont}">Lesbare Schrift</button></div>
        <div class="ctl" role="group" aria-label="Farben"><span class="lab">Farben</span><button type="button" class="chip" data-act="palette" data-v="" aria-pressed="${S.palette !== 'cb'}">Standard</button><button type="button" class="chip" data-act="palette" data-v="cb" aria-pressed="${S.palette === 'cb'}">Gut unterscheidbar</button></div></div>
        <h3>Ton</h3><div class="look"><div class="ctl" role="group" aria-label="Musik"><span class="lab">Musik</span>${onoff('music', S.music)}</div><div class="ctl" role="group" aria-label="Effekte"><span class="lab">Effekte</span>${onoff('sound', S.sound)}</div></div>`;
      h += `<div class="hd2"><h3>Daten & Sicherung</h3>${qBtn('daten')}</div><div class="data">${S.demo ? '<p class="ctx">Demo-Hof · nichts wird gespeichert. Im Demo-Hof sind Sicherung und Löschen ausgeschaltet.</p>' : `
        <p class="ctx">Speichert nur auf diesem Gerät.</p>
        <div class="row-btns"><button class="btn alt" type="button" data-act="export">${U.showExport ? 'Sicherung ausblenden' : 'Sicherung erstellen'}</button><button class="btn alt" type="button" data-act="import-open">Sicherung importieren</button><button class="btn ghost" type="button" data-act="wipe">${U.wipeArmed ? 'Wirklich alles löschen? Nochmal tippen' : 'Alles löschen'}</button></div>
        ${U.showExport ? `<textarea class="in" id="exportTxt" readonly aria-label="Sicherung">${esc(JSON.stringify(S))}</textarea><div class="row-btns"><button class="btn sm" type="button" data-act="copy">In die Zwischenablage kopieren</button></div>` : ''}
        <input type="file" id="importFile" accept="application/json,.json" hidden>
        <details><summary class="ctx">Oder Sicherungstext einfügen</summary><div style="display:grid;gap:8px;margin-top:8px"><textarea class="in" id="importTxt" aria-label="Sicherungstext"></textarea><div><button class="btn sm" type="button" data-act="import-paste">Prüfen</button></div></div></details>
        <div class="err" id="importErr" hidden></div>
        ${U.importPending ? `<div class="banner info"><span class="sp">Die Sicherung enthält ${U.importPending.habits.length} Gewohnheiten, ${U.importPending.todos.length} To-dos und ${U.importPending.journal.length} Logbuch-Einträge. Sie ersetzt die Daten auf diesem Gerät.</span><button class="btn sm" type="button" data-act="import-apply">Wiederherstellen</button><button class="btn ghost" type="button" data-act="import-cancel">Abbrechen</button></div>` : ''}`}</div>`;
      h += metricsHTML();
      h += `<h3>Über die App</h3><div class="data"><p>Life's a Game · Prototyp v${esc(VERSION)}</p><p class="ctx">Speichert nur auf diesem Gerät. Keine Anfragen an andere Dienste.</p>
        ${SH && SH.placeholder() ? '<p class="ctx"><b>Vorläufige Grafiken:</b> Gebäude, Pflanzen, Natur, Deko, Tiere, Wohnhaus und Bauer auf dem Hof sind Platzhalter. Sie werden vor dem Start durch handgezeichnete Grafiken ersetzt.</p>' : ''}
        ${isIOS() && !standalone() ? '<p class="ctx">Tipp: In Safari über „Teilen“ → „Zum Home-Bildschirm“ wird der Hof zur App, die offline läuft.</p>' : ''}</div>`;
      b.innerHTML = h;
    }
  };
  /** v8b Sammelalbum: Gruppen eingeklappt mit „x von y“, die erste offen (v8c). Gefundene mit Bild, offene als Silhouette. Ohne Prozente, ohne Fristen. */
  function albumHTML() {
    if (!U.albumOpen) U.albumOpen = new Set(['garten']);
    return `<h3>Sammelalbum</h3><div class="album">${L.album(S.chest).map(g => `<details class="alb-g" data-g="${g.id}"${U.albumOpen.has(g.id) ? ' open' : ''}><summary><span>${g.name}</span><span class="ctx">${g.found} von ${g.total} gefunden</span></summary><div class="alb">${g.items.map(({ id, found }) => {
      const it = L.ITEMS[id], when = it.season ? `Findbar im ${L.SEASON_NAME[it.season]}` : '', n = S.chest.items[id] || 0, out = S.chest.placed.filter(p => p.itemId === id).length;
      const info = found ? `${it.name} · ${it.rare ? 'selten' : 'häufig'}${it.season ? ' · ' + L.SEASON_NAME[it.season] : ''}. ${n ? n + '× in der Truhe' : ''}${n && out ? ', ' : ''}${out ? out + '× auf dem Hof' : ''}.` : `${it.name}: noch nicht gefunden.${when ? ' ' + when + '.' : ''}`;
      return `<button type="button" class="alb-i${found ? '' : ' open'}" data-act="info" data-info="${esc(info)}" aria-label="${esc(it.name)}, ${found ? 'gefunden' : 'noch nicht gefunden'}${when ? ', ' + when : ''}"><span class="pv">${itemImg(id, 2, !found)}</span><span class="nm">${esc(it.name)}</span>${!found && when ? `<span class="wh">${when}</span>` : ''}</button>`; }).join('')}</div></details>`).join('')}</div>`;
  }
  /** „Wie funktionieren Funde?“: Fundchancen, Regeln und Jahreszeit (die Liste der findbaren Gegenstände zeigt das Album). */
  function oddsSheet(trigger) {
    const o = L.dropOdds(today());
    openSheet('Wie funktionieren Funde?', `<dl class="kv"><dt>Je Erledigung</dt><dd>${pct(o.any)} Chance, einmal pro Gewohnheit und Tag bzw. pro To-do</dd><dt>Davon selten</dt><dd>${pct(o.rareShare)}, also ${pct(o.rare, 1)} je Erledigung</dd><dt>Ernte</dt><dd>Jede neue Wachstumsstufe bringt sicher einen Fund</dd><dt>Gemeistert</dt><dd>Sicher ein seltener Fund</dd><dt>Jahreszeit</dt><dd>Jetzt ${L.SEASON_NAME[o.season]}. Saisonale Funde nur dann, sie bleiben danach</dd></dl>
      <p class="ctx">Nichts zu kaufen, keine versteckten Quoten. Im Mittel bringen 8 Erledigungen einen Fund, 42 einen seltenen. Logbuch-Einträge bringen keine Funde.</p>`, trigger, { refocus: '#oddsBtn' });
  }
  /** Fähigkeit antippen: Stufe, Gebäude und Verlauf der letzten 30 Tage. */
  function skillSheet(s, trigger) {
    const l = D.levels[s.id], st = styleOf(s), b = D.byDay[s.id], keys = [...Array(30)].map((_, i) => L.addDays(today(), i - 29)); let acc = 0;
    const vals = keys.map(k => acc += b[k] || 0), max = Math.max(1, acc), line = vals.map((v, i) => (i / 29 * 200).toFixed(1) + ',' + (36 - v / max * 32).toFixed(1)).join(' ');
    openSheet(s.name, `<dl class="kv"><dt>Stufe</dt><dd>${l.l} · ${l.into} von ${l.need} XP bis Stufe ${l.l + 1}</dd><dt>Gebäude</dt><dd>${BNAME[s.buildingType] || ''}</dd><dt>Letzte 30 Tage</dt><dd>+${acc} XP</dd></dl>
      <div class="spark">${img(s.icon, 3, '')}<svg viewBox="0 0 200 40" preserveAspectRatio="none" role="img" aria-label="${esc(s.name)}: ${acc} XP in 30 Tagen"><line x1="0" y1="38" x2="200" y2="38" stroke="currentColor" stroke-opacity=".4" stroke-width="1" vector-effect="non-scaling-stroke"/><polygon points="0,38 ${line} 200,38" fill="${st.c}" opacity=".18"/><polyline points="${line}" fill="none" stroke="${st.c}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg><div class="r">Verlauf der Fähigkeit</div></div>
      <div class="row-btns"><button class="btn" type="button" data-act="ren" data-sid="${s.id}">Ändern</button></div>`, trigger, { refocus: `[data-sid="${s.id}"]` });
  }
  /** U17: Regentage als Knopf, Antippen erklärt sie (kein Tooltip nötig). */
  const tokBtn = d => `<button type="button" class="tok" data-act="explain" data-x="regentage" aria-label="Regentage: ${d.tokens} von 2. Erklärung anzeigen">${[0, 1].map(i => `<i class="${i < d.tokens ? '' : 'e'}"></i>`).join('')}<span>${d.tokens} ${d.tokens === 1 ? 'Regentag' : 'Regentage'} bereit</span></button>`;
  /** v8c: Abzeichen einer Gewohnheit: Pflanze mit Stärke, Serie nur wenn aktiv. */
  function habitBadges(h, d, st) {
    const pct = Math.round(d.s * 100);
    let b = badge(img('p' + d.stage, 2, '', { F: st.c, f: st.dk }), pct + ' %', `${L.STAGES[d.stage][1]}, Stärke ${pct} %`);
    if (h.streakEnabled && d.streak) b += badge(img('flame', 2, ''), d.streak, `${d.streak} ${d.weekly ? (d.streak === 1 ? 'Woche' : 'Wochen') : ''} in Folge`);
    if (d.graduated) b += badge(img('gem', 2, ''), '', 'Gemeistert', 'gold');
    if (h.archivedAt) b += `<span class="bdg">Pausiert</span>`;
    return b;
  }
  /** Kontextzeile: zuerst Uhrzeit bzw. Wochenstand, dann der Anker (wird bei Platzmangel am Ende gekürzt; vollständig im Info-Blatt). */
  const habitCtx = (h, d) => d.weekly ? `${d.weekCnt} von ${d.N} diese Woche · nach ${esc(h.anchor)}` : `${h.anchorTime ? timeText(h.anchorTime) + ' · ' : ''}nach ${esc(h.anchor)}`;
  /** v8c Regel 2: kompakte Karte, höchstens zwei Textzeilen und eine Reihe Abzeichen. Antippen (außer Haken und Mini) öffnet das Info-Blatt. */
  function habitRow(h, opt = {}) {
    const d = D.H[h.id], st = styleOf(skillById(h.skillId)), done = d.doneToday === 'done', tiny = d.doneToday === 'tiny', check = opt.check !== false;
    return `<div class="row hrow${done || tiny ? ' done' : ''}${check ? '' : ' nochk'}" data-hid="${h.id}">
      ${check ? `<button class="chk${tiny ? ' tiny' : ''}" type="button" data-act="hdone" data-id="${h.id}" aria-pressed="${done || tiny}" aria-label="${done || tiny ? 'Rückgängig' : 'Erledigt'}: ${esc(h.title)}"></button>` : ''}
      <button class="hopen" type="button" data-act="hsheet" data-id="${h.id}"><span class="row-title">${esc(h.title)}</span><span class="ctx">${check ? habitCtx(h, d) : `nach ${esc(h.anchor)} · ${freqText(h.frequency)}`}</span><span class="badges">${habitBadges(h, d, st)}</span><span class="vh">, Details öffnen</span></button>
      ${check ? `<button class="minib" type="button" data-act="htiny" data-id="${h.id}" aria-pressed="${tiny}" aria-label="${tiny ? 'Rückgängig' : 'Mini-Version erledigt'}: ${esc(h.tinyVersion)}">Mini</button>` : ''}</div>`;
  }
  /** Info-Blatt einer Gewohnheit: alle übrigen Angaben und die Aktionen Bearbeiten, Kalender, Pausieren. */
  function habitSheet(h, trigger) {
    const d = D.H[h.id], sk = skillById(h.skillId), st = styleOf(sk), pct = Math.round(d.s * 100), stage = L.STAGES[d.stage][1];
    const html = `<dl class="kv"><dt>Anker</dt><dd>nach ${esc(h.anchor)}${h.anchorTime ? ', ca. ' + timeText(h.anchorTime) : ''} · ${freqText(h.frequency)}</dd>
      <dt>Pflanze</dt><dd>${stage} · Stärke ${pct} % · ${d.age > 66 ? `Tag ${d.age}, die üblichen 66 Tage sind geschafft` : `Tag ${d.age} von etwa 66`}${d.graduated ? ' · <b>Gemeistert</b>' : ''}</dd>
      ${h.streakEnabled ? `<dt>Serie</dt><dd>${d.streak} ${d.weekly ? (d.streak === 1 ? 'Woche' : 'Wochen') : ''} in Folge${d.weekly ? '' : ' ' + tokBtn(d)}</dd>` : ''}
      <dt>Fähigkeit</dt><dd>${img(sk.icon, 2, '')} ${esc(sk.name)} · +${10 * h.effort} XP je Erledigung</dd>
      <dt>Gezählt</dt><dd>${d.weekly ? `${d.weekCnt} von ${d.N} diese Woche` : `${d.month}× diesen Monat`} · ${d.year}× dieses Jahr</dd>
      <dt>Mini</dt><dd>${esc(h.tinyVersion)}</dd>
      <dt>Wilma erinnert</dt><dd>${h.remindersEnabled ? 'an' : h.remOffAt ? `aus seit ${L.daysBetween(h.remOffAt, today())} Tagen${!d.graduated ? ' (30 für „Gemeistert“)' : ''}` : 'aus'}</dd></dl>
      <div class="bar sm sk" style="--c:${st.c};--hi:${st.hi};--dk:${st.dk}" role="progressbar" aria-label="Gewohnheitsstärke" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
      ${d.suggestOff ? `<div class="suggest">Läuft fast von allein: ${d.weekly ? 'Wochenziel zwei Wochen nacheinander erreicht' : `${d.held14} der letzten ${d.of14} Termine geschafft`}. Erinnerung abschalten? Hältst du die Gewohnheit danach 30 Tage lang an mindestens 70 % der Termine, gilt sie als gemeistert. <button class="btn sm" type="button" data-act="remoff" data-id="${h.id}">Abschalten</button></div>` : ''}
      <div class="row-btns">${h.archivedAt ? `<button class="btn" type="button" data-act="resume" data-id="${h.id}">Fortsetzen</button>` : `<button class="btn" type="button" data-act="edit" data-id="${h.id}">Bearbeiten</button><button class="btn" type="button" data-act="hcal" data-id="${h.id}">Kalender</button><button class="btn" type="button" data-act="pause" data-id="${h.id}">Pausieren</button>`}<button class="btn ghost" type="button" data-act="delhabit" data-id="${h.id}">Löschen</button></div>`;
    openSheet(h.title, html, trigger, { refocus: `[data-hid="${h.id}"] .hopen` });
  }
  /** v8c: To-do kompakt; Antippen zeigt Fähigkeit, XP und Datum. */
  function todoRow(x) {
    const t = today(), plan = x.dueDate && !x.doneAt ? (x.dueDate === t ? 'heute geplant' : fmt(x.dueDate)) : '';
    return `<div class="row trow${x.doneAt ? ' done' : ''}" data-tid="${x.id}"><button class="chk" type="button" data-act="todo" aria-pressed="${!!x.doneAt}" aria-label="${x.doneAt ? 'Als offen markieren' : 'Erledigen'}: ${esc(x.title)}"></button>
      <button class="hopen" type="button" data-act="tsheet"><span class="row-title">${esc(x.title)}</span>${plan ? `<span class="ctx">${plan}</span>` : ''}<span class="vh">, Details öffnen</span></button><button class="del" type="button" data-act="deltodo" aria-label="Aufgabe löschen: ${esc(x.title)}">×</button></div>`;
  }
  function todoSheet(x, trigger) {
    const sk = skillById(x.skillId);
    openSheet(x.title, `<dl class="kv"><dt>Fähigkeit</dt><dd>${img(sk.icon, 2, '')} ${esc(sk.name)}</dd><dt>Aufwand</dt><dd>${['Leicht', 'Mittel', 'Schwer'][x.effort - 1]} · +${10 * x.effort} XP</dd><dt>Geplant</dt><dd>${x.dueDate ? (x.dueDate === today() ? 'Für heute geplant' : 'Geplant für ' + fmt(x.dueDate)) : 'ohne Datum'}</dd>${x.doneAt ? `<dt>Erledigt</dt><dd>${fmt(x.doneAt)}</dd>` : ''}</dl>`, trigger, { refocus: '#todoAdd' });
  }
  /** „+ To-do“: nur der Titel ist Pflicht, Aufwand, Fähigkeit und Datum liegen unter „Mehr“. */
  function todoNewSheet(trigger) {
    openSheet('Neues To-do', `<form class="add todo-form" id="todoForm"><label for="tTitle" class="ctx">Was ist zu tun?</label><input class="in" id="tTitle" placeholder="z. B. Steuerunterlagen sortieren" maxlength="90">
      <details class="more"><summary>Mehr: Aufwand, Fähigkeit, Datum</summary><div class="todo-more">
        <select class="in" id="tEff" aria-label="Aufwand"><option value="1">Leicht · 10 XP</option><option value="2" selected>Mittel · 20 XP</option><option value="3">Schwer · 30 XP</option></select>
        <select class="in" id="tSkill" aria-label="Fähigkeit">${S.skills.map(s => `<option value="${s.id}" ${s.id === U.lastTodoSkill ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
        <label class="due"><span>Geplant für (optional)</span><input class="in" type="date" id="tDue"></label></div></details>
      <div class="row-btns"><button class="btn" type="submit">Hinzufügen</button></div><p class="ctx">${esc(HX.explain('todo').text)}</p></form>`, trigger, { refocus: '#todoAdd' });
    const ti = $('#tTitle'); if (ti) ti.focus();
  }
  function refresh(...parts) { if (!S) return; if (!parts.length) parts = ['cal', 'hud', 'legend', 'skills', 'today', 'habits', 'journal', 'progress', 'chest', 'npc', 'settings']; parts.forEach(p => R[p]()); }

  /** Wilmas Sprüche (Hof, Wetter, Tageszeit); Meilensteine und Nachträge haben Vorrang (LAGHilfe.pickHint). */
  function sayings() {
    const t = today(), now = new Date(), hr = now.getHours(), mins = hr * 60 + now.getMinutes(), list = [], w = weather();
    if (L.farmSleeps(hr)) return ['Die Farm schläft. Gute Nacht, morgen geht es weiter.'];
    if (!active().length) return ['Noch ist es ruhig hier. Unter „Gewohnheiten“ kannst du dein erstes Beet pflanzen.'];
    const open = active().filter(h => D.H[h.id].due && !D.H[h.id].doneToday);
    open.forEach(h => { if (h.anchorTime && h.remindersEnabled) { const [a, b] = h.anchorTime.split(':').map(Number); if (Math.abs(a * 60 + b - mins) <= 75) list.push(planText(h) + '.'); } });
    const wk = L.weekStart(t);
    active().forEach(h => { const d = D.H[h.id]; if (d.weekly) { if (d.weekCnt >= d.N) list.push(`Wochenziel geschafft: ${h.title}, ${d.weekCnt} von ${d.N}.`); } else { const c = Object.keys(h.logs).filter(k => L.weekStart(k) === wk && (h.logs[k] === 'done' || h.logs[k] === 'tiny')).length; if (c >= 4) list.push(`Du hast diese Woche schon ${c}× „${h.title}“ geschafft!`); } });
    if (hr >= 18 && open.length) list.push(`Langer Tag? Die Mini-Version zählt auch: ${open[0].tinyVersion}.`);
    const near = active().map(h => [h, skillById(h.skillId), L.unitsToNext(D.levels[skillById(h.skillId).id], h.effort)]).sort((a, b) => a[2] - b[2])[0];
    if (near && near[2] <= 2) list.push(`Noch ${near[2]}× „${near[0].title}“, dann wächst dein ${near[1].name}-Gebäude.`);
    if (w === 'regen' || w === 'gewitter') list.push('Bei dem Wetter bleibt man gern drinnen. Eine kleine Aufgabe am Schreibtisch geht immer.');
    if (w === 'sonnig' && hr < 18) list.push('Was für ein Tag! Der Hof glänzt in der Sonne.');
    if (!L.journalOn(S, t) && hr >= 19) list.push('Magst du den Tag mit ein paar Zeilen im Logbuch abschließen?');
    if (!list.length) list.push(open.length ? `Guten ${hr < 11 ? 'Morgen' : 'Tag'}! Was davon passt als Erstes zu deinem Tag?` : 'Alles erledigt für heute. Dein Hof sieht prächtig aus.');
    return list;
  }
  /** Meilensteine (früher eigene Kästen): erste Woche geschafft, neuer Monat, Gemeistert, Erinnerung abschalten, App installieren. */
  function milestones() {
    const t = today(), ym = t.slice(0, 7), m = [], c = L.canAddHabit(S, t);
    if (S.demo) return m;
    if (c.ok && active().length >= L.C.START_HABITS && !S.unlockSeen) m.push({ id: 'unlock', text: 'Eine Woche geschafft! Magst du noch etwas pflanzen?', acts: '<button class="btn sm" type="button" data-act="unlock-go">Pflanzen</button><button class="btn ghost" type="button" data-act="unlock-no">Später</button>' });
    if (new Date().getDate() <= 3 && S.freshSeen !== ym && S.startedAt < ym + '-01') m.push({ id: 'fresh', text: 'Ein neuer Monat beginnt, ein guter Moment für einen frischen Start. Möchtest du eine Gewohnheit anpassen oder neu anfangen?', acts: '<button class="btn sm" type="button" data-act="fresh-go">Ansehen</button><button class="btn ghost" type="button" data-act="fresh-no">Später</button>' });
    S.habits.forEach(h => { const d = D.H[h.id]; if (d.graduated && L.daysBetween(d.gradDate, t) < 7) m.push({ id: 'grad', text: `Glückwunsch! „${h.title}“ ist gemeistert. Das klappt jetzt ganz ohne Erinnerung.` }); });
    active().forEach(h => { if (D.H[h.id].suggestOff) m.push({ id: 'remoff', text: `„${h.title}“ läuft fast von allein. Magst du die Erinnerung abschalten?`, acts: `<button class="btn sm" type="button" data-act="hsheet" data-id="${h.id}">Ansehen</button>` }); });
    if (isIOS() && !standalone() && !S.installHintSeen) m.push({ id: 'install', text: 'Als App installieren: Tippe in Safari auf „Teilen“ und dann auf „Zum Home-Bildschirm“. Danach läuft dein Hof auch offline.', acts: '<button class="btn sm" type="button" data-act="install-ok">Verstanden</button>' });
    return m;
  }
  function hint() {
    const t = today(), sleep = L.farmSleeps(hour());
    const late = sleep ? [] : lateRows().filter(([h, x]) => !x.late && !x.repairOnly && lateState(h, x) === 'offen').map(([h, x]) => ({ id: h.id, k: x.k, title: h.title, day: dayName(x.k) }));
    return HX.pickHint({ late, checkin: !sleep && !S.demo && !S.checkins[t] && hour() >= 5 && !U.ciLater, milestones: sleep ? [] : milestones(), sayings: sayings(), idx: U.npcIdx });
  }

  /* ---------- Einstellungen (v8c, eigener Bildschirm) ---------- */
  const VERSION = (document.querySelector('meta[name="lag-version"]') || {}).content || '';
  function openSettings() {
    if ($('#settings')) return; closeSheet(); closeInfo();
    const el = document.createElement('section'); el.id = 'settings'; el.className = 'screen'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'setT');
    el.innerHTML = `<div class="screen-in"><div class="screen-hd"><h2 id="setT" tabindex="-1">Einstellungen</h2><button class="btn" type="button" data-act="settings-close">Fertig</button></div><div id="settingsBody"></div></div>`;
    document.body.append(el); document.documentElement.classList.add('noscroll'); R.settings(); $('#setT').focus(); au.sfx.page();
  }
  function closeSettings() { const el = $('#settings'); if (!el) return false; el.remove(); document.documentElement.classList.remove('noscroll'); U.showExport = false; U.wipeArmed = false; const g = $('#gearBtn'); if (g) g.focus(); return true; }

  /* ---------- Import  /* ---------- Import ---------- */
  function handleImportText(txt, onboarding) {
    const err = $('#importErr'); let obj = null; try { obj = JSON.parse(txt); } catch (e) { obj = undefined; }
    const r = obj === undefined ? { ok: false, error: 'Das ist keine gültige Sicherung (kein lesbarer Text).' } : L.importState(obj, today());
    if (!r.ok) { if (err) { err.hidden = false; err.textContent = r.error; } au.sfx.err(); return; }
    if (onboarding) { applyImport(r.state); return; }
    U.importPending = r.state; R.settings();
  }
  function applyImport(state) { state.onboarded = true; L.migrateV8a(state); S = state; applyLook(); U.importPending = null; derive(); flush(); overlay(''); closeSettings(); refresh(); scene.refresh(true); toast('<span><b>Wiederhergestellt.</b> Dein Hof ist wieder da.</span>'); }

  /* ---------- Ereignisse ---------- */
  const tabs = () => $$('.tab');
  function selectTab(b, focus) {
    markSeen($$('.panel:not([hidden]) [data-once]').map(x => x.dataset.once));
    tabs().forEach(x => { const on = x === b; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; }); $$('.panel').forEach(p => p.hidden = p.id !== 'p-' + b.dataset.tab); if (focus) b.focus();
    if (b.dataset.tab !== 'journal' && preview) { preview = null; scene.refresh(); R.cal(); }
    if (b.dataset.tab === 'progress') R.progress();
    au.sfx.page();
  }
  function commitRename() { const s = S.skills.find(x => x.id === U.renaming), v = ($('#renameIn') || {}).value; if (s && v && v.trim()) s.name = v.trim().slice(0, 20); U.renaming = null; save(); refresh(); scene.refresh(); au.sfx.tick(); }
  function deleteHabit(h) {
    const idx = S.habits.indexOf(h); S.habits.splice(idx, 1); if (U.editHabit === h.id) U.editHabit = null; au.sfx.soft(); derive(); save(); refresh(); scene.refresh();
    toast(`<span><b>Gelöscht.</b> „${esc(h.title)}“ ist entfernt.</span>`, { label: 'Rückgängig', fn: () => { S.habits.splice(Math.min(idx, S.habits.length), 0, h); derive(); save(); refresh(); scene.refresh(); } }, 6000);
  }

  function bind() {
    tabs().forEach((b, i) => { b.addEventListener('click', () => selectTab(b)); b.addEventListener('keydown', e => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { e.preventDefault(); const all = tabs(); selectTab(all[(i + d + all.length) % all.length], true); } }); });
    $('#gearBtn').addEventListener('click', openSettings);
    $('#sndBtn').addEventListener('click', () => { const on = !(S.sound || S.music); S.sound = on; if (!on) { S.music = false; au.Music.stop(); } save(); R.hud(); R.settings(); if (on) au.sfx.tick(); });
    document.addEventListener('pointerdown', function once() { if (S && S.music && !au.Music.playing) au.Music.start(weather()); document.removeEventListener('pointerdown', once); });

    document.addEventListener('input', e => { const el = e.target; if (el.id === 'jText') U.draft = el.value; const f = el.closest && el.closest('[data-form]'); if (f && (el.dataset.f === 'title' || el.dataset.f === 'anchor')) updatePreview(f); });
    $('#scene').addEventListener('click', openBig);
    $('#scene').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBig(); } });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { if ($('#infopop')) closeInfo(); else if (sheets.isOpen()) closeSheet(); else if (!closeBig()) closeSettings(); } if (e.target.id === 'renameIn') { if (e.key === 'Enter') { e.preventDefault(); commitRename(); } if (e.key === 'Escape') { U.renaming = null; R.skills(); } } });
    document.addEventListener('change', e => {
      const el = e.target;
      if (el.dataset.f === 'skill') { const f = el.closest('[data-form]'), ns = f.querySelector('[data-f=newskill]'); ns.hidden = el.value !== '__new'; if (!ns.hidden) ns.focus(); }
      if (el.id === 'calHabit') { U.calHabit = el.value; R.progress(); }
      if (el.id === 'importFile' && el.files[0]) { const r = new FileReader(); r.onload = () => handleImportText(String(r.result), U.obStep === 'welcome' && !S.onboarded); r.readAsText(el.files[0]); el.value = ''; }
    });
    document.addEventListener('toggle', e => { const g = e.target.dataset && e.target.dataset.g; if (g && U.albumOpen) { if (e.target.open) U.albumOpen.add(g); else U.albumOpen.delete(g); } }, true);
    document.addEventListener('submit', e => {
      const f = e.target; e.preventDefault();
      if (f.dataset.form) { submitForm(f); return; }
      if (f.id === 'todoForm') {
        const t = $('#tTitle').value.trim(); if (!t) { au.sfx.err(); $('#tTitle').focus(); return; }
        U.lastTodoSkill = $('#tSkill').value; const due = $('#tDue').value || undefined;
        S.todos.unshift({ id: uid(), title: t, effort: +$('#tEff').value, skillId: U.lastTodoSkill, dueDate: due }); au.sfx.tick(); save(); refresh('today', 'hud', 'npc'); closeSheet();
        toast(`<span><b>Notiert.</b> „${esc(t)}“ steht in deinen To-dos.</span>`); return;
      }
      if (f.id === 'ciTodoForm') {
        const t = $('#ciTodo').value.trim(); if (!t) return; const id = uid(); S.todos.unshift({ id, title: t, effort: 1, skillId: S.skills[0].id });
        if (U.ci.todos.size < 3) U.ci.todos.add(id); au.sfx.tick(); showCheckin();
      }
    });
    document.addEventListener('click', e => {
      const chip = e.target.closest('[data-form] [data-freq], [data-form] [data-day], [data-form] [data-eff], [data-form] [data-plant]');
      if (chip) {
        const form = chip.closest('[data-form]');
        if (chip.dataset.freq) { form.querySelectorAll('[data-freq]').forEach(b => b.setAttribute('aria-pressed', b === chip)); form.querySelector('[data-g=days]').hidden = chip.dataset.freq !== 'weekdays'; form.querySelector('[data-g=times]').hidden = chip.dataset.freq !== 'weekly'; if (form.dataset.form !== 'edit') form.querySelector('[data-f=streak]').checked = chip.dataset.freq !== 'weekly'; }
        else if (chip.dataset.day) chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') !== 'true');
        else if (chip.dataset.plant) form.querySelectorAll('[data-plant]').forEach(b => b.setAttribute('aria-pressed', b === chip));
        else form.querySelectorAll('[data-eff]').forEach(b => b.setAttribute('aria-pressed', b === chip));
        au.sfx.tick(); return;
      }
      const cell = e.target.closest('.cal-grid i[data-info]');
      if (cell) { $$('.cal-grid i.sel').forEach(x => x.classList.remove('sel')); cell.classList.add('sel'); $('#calInfo').textContent = cell.dataset.info; return; }
      if (!e.target.closest('[data-act="info"]')) closeInfo();
      const el = e.target.closest('[data-act]'); if (!el || el.tagName === 'INPUT' || el.disabled) return;
      const act = el.dataset.act, t = today(), pt = pointOf(e, el), habit = () => S.habits.find(x => x.id === el.dataset.id);
      switch (act) {
        case 'big-close': closeBig(); break;
        case 'hdone': { const h = habit(); logHabit(h, h.logs[t] === 'tiny' ? 'tiny' : 'done', pt); scene.refresh(); break; }
        case 'htiny': logHabit(habit(), 'tiny', pt); scene.refresh(); break;
        case 'info': showInfo(el); break;
        case 'explain': { const x = HX.explain(el.dataset.x); if (x) { openSheet(x.title, `<p>${esc(x.text)}</p>`, el); markSeen([x.id]); } break; }
        case 'once-ok': markSeen([el.dataset.x]); el.closest('[data-once]').remove(); break;
        case 'hsheet': habitSheet(habit(), el); break;
        case 'hcal': U.calHabit = el.dataset.id; closeSheet(); selectTab($('#t-progress')); { const hv = $('#p-progress .harvest'); if (hv) hv.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' }); } break;
        case 'tsheet': todoSheet(S.todos.find(y => y.id === el.closest('[data-tid]').dataset.tid), el); break;
        case 'todo-new': todoNewSheet(el); break;
        case 'hnew': U.editHabit = null; openSheet('Neue Gewohnheit', `<div class="ideas" aria-label="Vorlagen">${IDEAS.map((x, i) => `<button type="button" class="chip idea" data-act="idea" data-i="${i}">${esc(x.title)}</button>`).join('')}</div>${habitForm('new', null)}`, el, { refocus: '#hNew' }); break;
        case 'idea-new': { openSheet('Neue Gewohnheit', habitForm('new', null), el, { refocus: '#hNew' }); const f = $('.sheet [data-form="new"]'); if (f) fillIdea(f, IDEAS[+el.dataset.i]); au.sfx.tick(); break; }
        case 'late-open': lateSheet(habit(), el.dataset.k, el); break;
        case 'ssheet': skillSheet(S.skills.find(x => x.id === el.dataset.sid), el); break;
        case 'odds': oddsSheet(el); break;
        case 'npc-next': U.npcIdx++; au.sfx.page(); R.npc(); break;
        case 'ci-later': U.ciLater = true; au.sfx.soft(); R.npc(); break;
        case 'settings-close': closeSettings(); break;
        case 'accent': S.accent = el.dataset.v === 'thema' ? undefined : el.dataset.v; applyLook(); save(); R.settings(); au.sfx.tick(); break;
        case 'music': S.music = !!el.dataset.v; save(); R.settings(); R.hud(); if (S.music) au.Music.start(weather()); else au.Music.stop(); break;
        case 'sound': S.sound = !!el.dataset.v; save(); R.settings(); R.hud(); if (S.sound) au.sfx.tick(); break;
        case 'late': logLateUI(habit(), el.dataset.k, el.dataset.st, pt); closeSheet(); break;
        case 'repair': { const h = habit(), d = D.H[h.id]; if (d.repairKey) { h.logs[d.repairKey] = 'repaired'; au.sfx.tiny(); toast(`${img('flame', 3, '')}<span><b>Serie gerettet.</b> Die Extra-Runde zählt für den verpassten Tag.</span>`); derive(); save(); refresh(); } closeSheet(); break; }
        case 'todo': { const row = el.closest('[data-tid]'), x = S.todos.find(y => y.id === row.dataset.tid), before = snapshot();
          if (x.doneAt) { delete x.doneAt; au.sfx.soft(); derive(); save(); refresh(); scene.refresh(); break; }
          x.doneAt = t; au.sfx.check(); if (!x.rolled) { x.rolled = true; rollDrop(pt); } derive(); const sk = skillById(x.skillId);
          afterAction(before, x.skillId, pt, 10 * x.effort, `${img(sk.icon, 3, '')}<span><b>${esc(sk.name)} +${10 * x.effort} XP</b> · ${esc(x.title)} erledigt</span>`); refresh(); scene.refresh(); break; }
        case 'deltodo': { const row = el.closest('[data-tid]'), i = S.todos.findIndex(y => y.id === row.dataset.tid), x = S.todos.splice(i, 1)[0]; au.sfx.soft(); derive(); save(); refresh();
          toast(`<span><b>Gelöscht.</b> „${esc(x.title)}“</span>`, { label: 'Rückgängig', fn: () => { S.todos.splice(i, 0, x); derive(); save(); refresh(); } }); break; }
        case 'idea': { const f = el.closest('.sheet, .frame, .panel').querySelector('[data-form="ob"], [data-form="new"]'); if (f) { fillIdea(f, IDEAS[+el.dataset.i]); au.sfx.tick(); } break; }
        case 'edit': { const h = habit(); U.editHabit = h.id; openSheet(`„${h.title}“ bearbeiten`, habitForm('edit', h), el, { refocus: `[data-hid="${h.id}"] .hopen`, onClose: () => { U.editHabit = null; } }); break; }
        case 'edit-cancel': closeSheet(); break;
        case 'pause': { const h = habit(); L.pause(h, t); au.sfx.soft(); derive(); save(); refresh(); scene.refresh(); toast(`<span><b>Pausiert.</b> „${esc(h.title)}“ ruht, bis du sie fortsetzt.</span>`); closeSheet(); break; }
        case 'resume': { const h = habit(); L.resume(h, t); au.sfx.place(); derive(); save(); refresh(); scene.refresh(); toast(`<span><b>Weiter geht's.</b> „${esc(h.title)}“ ist wieder aktiv.</span>`); closeSheet(); break; }
        case 'delhabit': deleteHabit(habit()); closeSheet(); break;
        case 'remoff': { const h = habit(); h.remindersEnabled = false; h.remOffAt = t; au.sfx.place(); toast(`${img('gem', 3, '')}<span><b>Erinnerung aus.</b> Hältst du „${esc(h.title)}“ jetzt 30 Tage, ist sie gemeistert.</span>`); derive(); save(); refresh(); closeSheet(); break; }
        case 'ren': closeSheet(); U.renaming = el.dataset.sid; R.skills(); break;
        case 'renok': commitRename(); break;
        case 'btype': { const s = S.skills.find(x => x.id === el.dataset.sid), v = ($('#renameIn') || {}).value; s.buildingType = el.dataset.v; R.skills(); if (v != null) $('#renameIn').value = v; au.sfx.tick(); save(); scene.refresh(); break; }
        case 'icon': { const s = S.skills.find(x => x.id === el.dataset.sid), v = ($('#renameIn') || {}).value, was = L.suggestBuilding(s.icon); s.icon = SP.ICONS[(SP.ICONS.indexOf(s.icon) + 1) % SP.ICONS.length];
          if (s.buildingType === was) s.buildingType = L.suggestBuilding(s.icon); /* Vorschlag folgt dem Symbol, bis man selbst wählt */ R.skills(); if (v != null) $('#renameIn').value = v; au.sfx.tick(); save(); R.legend(); scene.refresh(); break; }
        case 'addskill': { if (S.skills.length >= L.C.MAX_SKILLS) break; const id = 's' + uid(); const icon = SP.ICONS[S.skills.length % SP.ICONS.length]; S.skills.push({ id, name: 'Neue Fähigkeit', icon, st: S.skills.length, buildingType: L.suggestBuilding(icon) }); U.renaming = id; derive(); save(); refresh(); scene.refresh(); break; }
        case 'weather': U.selWeather = el.dataset.w; preview = U.selWeather; au.sfx.tick(); $$('.wbtn[data-act=weather]').forEach(b => b.setAttribute('aria-pressed', b.dataset.w === U.selWeather)); scene.refresh(); R.cal(); R.npc(); break;
        case 'prompt': U.promptShift++; au.sfx.page(); R.journal(); break;
        case 'editj': U.editingJournal = true; U.selWeather = L.journalOn(S, t).weather; au.sfx.page(); R.journal(); break;
        case 'editj-cancel': U.editingJournal = false; preview = null; R.journal(); scene.refresh(); break;
        case 'savej': { const txt = ($('#jText').value || '').trim(); if (!txt) { au.sfx.err(); $('#jText').focus(); break; }
          const cur = L.journalOn(S, t), w = U.selWeather || weather(); preview = null;
          if (cur) { cur.text = txt; cur.weather = w; U.editingJournal = false; au.sfx.tick(); derive(); save(); }
          else { const before = snapshot(); S.journal.push({ date: t, weather: w, text: txt, promptId: String((new Date().getDate() + U.promptShift) % PROMPTS.length) }); U.draft = ''; au.sfx.check(); afterAction(before, null, pt, L.C.JOURNAL_XP, `${img('gem', 3, '')}<span><b>Tag abgeschlossen.</b> Dein Eintrag liegt jetzt im Tagebuch im Farmhaus.</span>`); }
          refresh(); scene.refresh(); break; }
        case 'cal-prev': U.calYear = String(+(U.calYear || t.slice(0, 4)) - 1); R.progress(); break;
        case 'cal-next': U.calYear = String(+(U.calYear || t.slice(0, 4)) + 1); R.progress(); break;
        case 'export': U.showExport = !U.showExport; R.settings(); break;
        case 'copy': { const ta = $('#exportTxt'); try { navigator.clipboard.writeText(ta.value).then(() => toast('<span><b>Kopiert.</b> Speichere den Text zum Beispiel in einer Notiz oder Datei.</span>'), () => { ta.select(); toast('<span>Der Text ist markiert. Kopiere ihn mit Cmd+C.</span>'); }); } catch (err) { ta.select(); } break; }
        case 'import-open': { const f = $('#importFile'); if (f) f.click(); break; }
        case 'import-paste': handleImportText(($('#importTxt') || {}).value || '', false); break;
        case 'import-apply': applyImport(U.importPending); break;
        case 'import-cancel': U.importPending = null; R.settings(); break;
        case 'wipe': if (U.wipeArmed) { U.wipeArmed = false; U.showExport = false; Store.clear(); S = L.emptyState(t); closeSettings(); applyLook(); derive(); refresh(); scene.refresh(true); showOnboarding('welcome'); }
          else { U.wipeArmed = true; R.settings(); setTimeout(() => { if (U.wipeArmed) { U.wipeArmed = false; R.settings(); } }, 4000); } break;
        case 'place': { if (L.farmSleeps(hour()) || !S.chest.items[el.dataset.type]) break; const type = el.dataset.type;
          if (L.ITEMS[type].animal) S.chest.placed.push({ itemId: type }); else { const used = new Set(S.chest.placed.map(p => p.slot)), cap = L.slotsFor(D.char.l); let slot = -1; for (let i = 0; i < cap; i++) if (!used.has(i)) { slot = i; break; } if (slot < 0) { au.sfx.err(); break; } S.chest.placed.push({ itemId: type, slot }); }
          if (!--S.chest.items[type]) delete S.chest.items[type]; au.sfx.place(); save(); refresh('chest', 'hud'); scene.refresh(); break; }
        case 'stash': { if (L.farmSleeps(hour())) break; const p = S.chest.placed.splice(+el.dataset.i, 1)[0]; S.chest.items[p.itemId] = (S.chest.items[p.itemId] || 0) + 1; au.sfx.tick(); save(); refresh('chest', 'hud'); scene.refresh(); break; }
        case 'fresh-go': S.freshSeen = t.slice(0, 7); save(); selectTab($('#t-habits')); R.today(); R.npc(); break;
        case 'fresh-no': S.freshSeen = t.slice(0, 7); save(); R.today(); R.npc(); break;
        case 'unlock-go': S.unlockSeen = true; save(); selectTab($('#t-habits')); R.today(); R.npc(); break;
        case 'unlock-no': S.unlockSeen = true; save(); R.today(); R.npc(); break;
        case 'scale': S.textScale = +el.dataset.v; applyLook(); save(); R.settings(); au.sfx.tick(); break;
        case 'font': S.readableFont = !!el.dataset.v || undefined; applyLook(); save(); R.settings(); au.sfx.tick(); break;
        case 'theme': S.theme = el.dataset.v || undefined; applyLook(); save(); R.settings(); au.sfx.tick(); break;
        case 'palette': S.palette = el.dataset.v || undefined; applyLook(); save(); R.settings(); scene.refresh(true); au.sfx.tick(); break;
        case 'metrics-save': { const a = document.createElement('a'), url = URL.createObjectURL(new Blob([metricsJSON()], { type: 'application/json' }));
          a.href = url; a.download = `lifes-a-game-beta-${t}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); break; }
        case 'metrics-copy': { const txt = metricsJSON(); try { navigator.clipboard.writeText(txt).then(() => toast('<span><b>Kopiert.</b> Die Beta-Zahlen liegen in der Zwischenablage.</span>'), () => toast('<span>Kopieren hat nicht geklappt. Nutze „Als Datei sichern“.</span>')); } catch (err) { toast('<span>Kopieren hat nicht geklappt. Nutze „Als Datei sichern“.</span>'); } break; }
        case 'install-ok': S.installHintSeen = true; save(); R.today(); R.npc(); break;
        // Onboarding
        case 'ob-start': showOnboarding('habits'); break;
        case 'ob-back': showOnboarding('welcome'); break;
        case 'ob-next': showOnboarding('done'); break;
        case 'ob-finish': finishOnboarding(); break;
        case 'ob-remove': S.habits = S.habits.filter(x => x.id !== el.dataset.id); derive(); showOnboarding('habits'); scene.refresh(); break;
        case 'ob-v3': { const v3 = Store.legacyV3(); if (v3) applyImport(L.migrateV3(v3, t)); break; }
        case 'demo-start': startDemo(); break;
        case 'demo-end': endDemo(); break;
        // Check-in
        case 'ci-open': showCheckin(); break;
        case 'ci-todo': { const id = el.dataset.id; if (U.ci.todos.has(id)) U.ci.todos.delete(id); else if (U.ci.todos.size < 3) U.ci.todos.add(id); else { au.sfx.err(); break; } el.setAttribute('aria-pressed', U.ci.todos.has(id)); au.sfx.tick(); break; }
        case 'ci-weather': U.ci.weather = U.ci.weather === el.dataset.w ? null : el.dataset.w; $$('[data-act=ci-weather]').forEach(b => b.setAttribute('aria-pressed', b.dataset.w === U.ci.weather)); au.sfx.tick(); break;
        case 'ci-done': closeCheckin(true); break;
        case 'ci-skip': closeCheckin(false); break;
      }
    });
  }

  /* ---------- Aufbau für schmale Bildschirme (U1) ----------
   * Bis 767 px: Tab-Leiste fest unten, Erfahrung und Fähigkeiten im Tab „Fortschritt“, Wilma am Ende von „Heute“.
   * Die Knoten werden nur umgehängt (gleiche ids), Ereignisse laufen über document und bleiben erhalten.
   */
  const narrowMQ = root.matchMedia ? matchMedia('(max-width: 767px)') : null;
  let wasNarrow = null;
  function layout() {
    const narrow = !!(narrowMQ && narrowMQ.matches), scene = $('.scene');
    if (narrow === wasNarrow) return; wasNarrow = narrow;
    if (narrow) { $('#statsSlot').append($('#charBox'), $('#skillsBox')); $('#npcSlot').append($('#npc')); }   // Wilma oben in „Heute“
    else { scene.after($('#charBox')); $('#charBox').after($('#skillsBox')); $('#skillsBox').after($('#npc')); }
    document.documentElement.classList.toggle('narrow', narrow);
  }
  /** v8a: Szene nur ganzzahlig vergrößert (1×, 2×, 3×); statt leerer Seitenstreifen zeigt sie seitlich mehr Welt (v8a.1). */
  function sizeScene() {
    const box = $('.scene'), cs = getComputedStyle(box), w = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const k = SH ? SH.sceneScale(w) : 1; scene.view($('#scene'), k, SH ? SH.sceneWidth(w, k) : 256);
  }
  const SWIPED = Store.prefix + 'lag:umsehen-gewischt';
  const swiped = () => { try { return localStorage.getItem(SWIPED) === '1'; } catch (e) { return false; } };
  /** Großansicht: größter ganzzahliger Faktor, bei dem die Höhe passt; breiter als der Bildschirm → waagerecht verschiebbar, startet mittig. */
  function openBig() {
    closeBig(); au.sfx.page();
    const el = document.createElement('div'); el.className = 'bigscene'; el.id = 'bigScene';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Dein Hof in der Großansicht');
    el.innerHTML = `<div class="big-bar"><span>Dein Hof</span><button class="btn" type="button" data-act="big-close">Schließen</button></div><div class="big-scroll"><canvas aria-label="Dein Hof von oben, vergrößert"></canvas></div><p class="big-hint" aria-live="polite" hidden>Zum Umsehen wischen</p>`;
    document.body.append(el);
    const sc = el.querySelector('.big-scroll'), cv = el.querySelector('canvas'), k = SH.largeScale(sc.clientWidth, sc.clientHeight);
    scene.view(cv, k, SH.sceneWidth(sc.clientWidth, k)); el.querySelector('.big-bar span').textContent = `Dein Hof · ${k}×`; scene.refresh();
    sc.scrollLeft = (sc.scrollWidth - sc.clientWidth) / 2; sc.scrollTop = (sc.scrollHeight - sc.clientHeight) / 2;
    // Hinweis „Zum Umsehen wischen“, bis man einmal gewischt hat (gemerkt nur auf diesem Gerät)
    const hint = el.querySelector('.big-hint');
    if (sc.scrollWidth > sc.clientWidth + 1 && !swiped()) {
      hint.hidden = false;
      const start = sc.scrollLeft;
      sc.addEventListener('scroll', function moved() { if (Math.abs(sc.scrollLeft - start) < 8) return; hint.hidden = true; try { localStorage.setItem(SWIPED, '1'); } catch (e) { /* egal */ } sc.removeEventListener('scroll', moved); });
    }
    el.querySelector('[data-act=big-close]').focus();
  }
  function closeBig() { const el = $('#bigScene'); if (!el) return false; scene.unview(el.querySelector('canvas')); el.remove(); $('#scene').focus(); return true; }
  function tabIcons() {
    const ic = { today: 'sonnig', habits: 'p3', journal: 'book', progress: 'gem', chest: 'crate' };
    $$('.tab .ti').forEach(sp => { sp.innerHTML = img(ic[sp.dataset.icon], 3, ''); });
    $('#gearBtn').innerHTML = img('gear', 4, '');
  }

  /** 8.2.1: Band „Vorschau · Branch · Version“, nur in der Vorschau unter …/preview/. */
  function previewBand() {
    if (!Store.prefix || $('#previewBand')) return; const env = root.LAG_ENV || {};
    const b = document.createElement('div'); b.id = 'previewBand'; b.className = 'preview-band'; b.setAttribute('role', 'note');
    b.textContent = `Vorschau · ${env.branch || 'Branch'} · ${env.version || VERSION}`; document.body.prepend(b);
  }

  /* ---------- Start ---------- */
  function boot(state, assets) {
    S = state || L.emptyState(today()); L.migrateV8a(S); applyLook(); previewBand();
    sheets = root.LAGSheet.createSheets(document, { reduce, raf: f => requestAnimationFrame(() => requestAnimationFrame(f)) });
    au = root.LAGAudio.createAudio({ soundOn: () => !!(S && S.sound), musicOn: () => !!(S && S.music), isNight: () => phase() === 'night' });
    derive();
    scene = root.LAGScene.createScene($('#scene'), { state: () => S, D: () => D, weather, phase, sleeps: () => L.farmSleeps(hour()), thunder: () => au.thunder(), onMood: m => { au.Music.setMood(m); R.cal(); }, reduce });
    tabIcons(); layout(); sizeScene(); if (narrowMQ) narrowMQ.addEventListener('change', () => { layout(); sizeScene(); }); root.addEventListener('resize', () => { layout(); sizeScene(); });
    bind(); refresh(); scene.start(assets);
    if (assets) Promise.resolve(assets).then(() => refresh(), () => {});   // Vorschaubilder und Hinweis „Vorläufige Grafiken“
    if (!S.onboarded) showOnboarding('welcome');
    else { checkRewards(null); if (L.needsCheckin(S, today(), hour())) showCheckin(); }
    let lastDay = today();
    setInterval(() => { if (today() !== lastDay) { lastDay = today(); U.editingJournal = false; U.selWeather = null; preview = null; derive(); refresh(); if (S.onboarded && !$('#overlay').innerHTML && L.needsCheckin(S, today(), hour())) showCheckin(); } R.cal(); R.npc(); scene.refresh(); }, 30000);
  }
  root.LAGUI = { boot, notify: toast };
})(typeof self !== 'undefined' ? self : this);
