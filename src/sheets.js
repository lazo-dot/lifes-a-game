/* Life's a Game · Sprite-Sheets (v8a)
 * Lädt Aseprite-Exporte (JSON „Array“ + PNG, Ebenen getrennt) aus sprites/ und die Hof-Karte.
 * Ebenen: base, glow (abends addieren), shadow (eine Farbe, ca. 30 %). Frame-Tags = Stufen. meta.anchor = Fußpunkt unten Mitte.
 * Fehlt eine Datei oder schlägt das Laden fehl, ist das Sheet einfach nicht da: Die Szene zeichnet dann mit dem bisherigen Code.
 * parseSheet und die Skalierung sind DOM-frei und laufen in Node (Tests).
 */
(function (root) {
  'use strict';
  const SCENE_W = 256, SCENE_H = 160, LAYERS = ['base', 'glow', 'shadow'];

  /** Aseprite-JSON → { name, image, w, h, anchor, platzhalter, tags: [..], rect(layer, tag), layerOpacity } oder Fehler. */
  function parseSheet(json, name) {
    if (!json || !Array.isArray(json.frames) || !json.meta) throw new Error('Kein Aseprite-Array-Export');
    const meta = json.meta, byLayer = {};
    for (const f of json.frames) {
      // Dateiname laut Aseprite-Vorgabe „{title} ({layer}) {frame}“. Ohne Ebenen-Angabe gilt alles als base.
      const m = /\(([^)]+)\)/.exec(f.filename || ''), layer = m ? m[1].trim() : 'base';
      (byLayer[layer] = byLayer[layer] || []).push(f);
    }
    if (!byLayer.base || !byLayer.base.length) throw new Error('Ebene „base“ fehlt');
    const n = byLayer.base.length, tags = {};
    (meta.frameTags || []).forEach(t => { if (t.from >= 0 && t.from < n) tags[t.name] = t.from; });
    if (!Object.keys(tags).length) byLayer.base.forEach((f, i) => { tags[String(i)] = i; });
    const first = byLayer.base[0], w = first.sourceSize ? first.sourceSize.w : first.frame.w, h = first.sourceSize ? first.sourceSize.h : first.frame.h;
    const anchor = meta.anchor && Number.isFinite(meta.anchor.x) && Number.isFinite(meta.anchor.y) ? { x: meta.anchor.x, y: meta.anchor.y } : { x: Math.floor(w / 2), y: h - 1 };
    const opacity = {}; (meta.layers || []).forEach(l => { opacity[l.name] = (l.opacity ?? 255) / 255; });
    return {
      name: name || String(meta.image || '').replace(/\.png$/, ''), image: meta.image, w, h, anchor, platzhalter: meta.platzhalter === true,
      tags: Object.keys(tags), layers: LAYERS.filter(l => byLayer[l] && byLayer[l].length === n), opacity,
      /** Quellrechteck im PNG samt Versatz (bei getrimmten Frames), oder null. */
      rect(layer, tag) {
        const fr = byLayer[layer] && byLayer[layer][tags[tag]]; if (!fr) return null;
        const off = fr.trimmed && fr.spriteSourceSize ? fr.spriteSourceSize : { x: 0, y: 0 };
        return { x: fr.frame.x, y: fr.frame.y, w: fr.frame.w, h: fr.frame.h, ox: off.x, oy: off.y };
      }
    };
  }

  /** Ganzzahliger Faktor der kompakten Szene: 1×, 2× oder 3×, nie krumm. */
  const sceneScale = width => Math.max(1, Math.min(3, Math.floor(width / SCENE_W)));
  /** Großansicht: größter Faktor, bei dem die Höhe passt (1×–3×); in der Breite darf sie überstehen und wird verschoben. */
  const largeScale = (width, height) => Math.max(1, Math.min(3, Math.floor(height / SCENE_H)));
  /** Logische Breite bei Faktor k: so viel Welt, wie ganzzahlig in die verfügbare Breite passt, mindestens der Kern (256). */
  const sceneWidth = (width, k) => Math.max(SCENE_W, Math.floor(width / k));

  /* ---------- Laden (Browser) ---------- */
  const sheets = new Map(); let map = null;
  const loadImage = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('Bild fehlt: ' + src)); im.src = src; });
  const getJSON = url => fetch(url).then(r => { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); });
  async function loadSheet(name, base, deps) {
    try {
      const sh = parseSheet(await deps.getJSON(base + name + '.json'), name);
      sh.img = await deps.loadImage(base + (sh.image || name + '.png'));
      return sh;
    } catch (e) { return null; }
  }
  /** Lädt die Liste aus sprites/index.json, alle Sheets und die Hof-Karte. Scheitert nie: Fehlendes bleibt leer. */
  async function load(base = 'sprites/', deps = { getJSON, loadImage }) {
    let names = [];
    try { names = (await deps.getJSON(base + 'index.json')).sheets || []; } catch (e) { names = []; }
    const got = await Promise.all(names.map(n => loadSheet(n, base, deps)));
    got.forEach(s => { if (s) sheets.set(s.name, s); });
    try { map = await deps.getJSON(base + 'hof-karte.json'); } catch (e) { map = null; }
    return { sheets: sheets.size, map: !!map };
  }

  /** Zeichnet eine Ebene eines Frames so, dass der Fußpunkt auf (fx, fy) liegt. Gibt false zurück, wenn es das Bild nicht gibt. */
  function draw(c, sh, layer, tag, fx, fy) {
    const r = sh && sh.img && sh.rect(layer, tag); if (!r) return false;
    c.drawImage(sh.img, r.x, r.y, r.w, r.h, fx - sh.anchor.x + r.ox, fy - sh.anchor.y + r.oy, r.w, r.h);
    return true;
  }
  const api = {
    SCENE_W, SCENE_H, parseSheet, sceneScale, largeScale, sceneWidth, load, loadSheet, draw,
    get: name => sheets.get(name) || null, map: () => map,
    placeholder: () => [...sheets.values()].some(s => s.platzhalter)
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.LAGSheets = api;
})(typeof self !== 'undefined' ? self : this);
