/* Life's a Game · Sprite-Exporte übernehmen (v8a)
 * Sucht Aseprite-Exporte (name.json + name.png) in art/src/ und art/platzhalter/ und kopiert sie nach public/sprites/.
 * art/src/ hat Vorrang: Liegt dort eine handgezeichnete Fassung, ersetzt sie den Platzhalter gleichen Namens.
 * Schreibt public/sprites/index.json (Liste der Sheets). hof-karte.json in public/sprites/ wird von Hand gepflegt und nicht angefasst.
 * Dateien werden nur geschrieben, wenn sich der Inhalt ändert (sonst baut `npm start` endlos neu).
 *   node tools/sprites.js   (läuft auch bei jedem Build)
 */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'public', 'sprites');
const SOURCES = ['art/src', 'art/platzhalter'];

const walk = dir => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : []).flatMap(e => {
  const p = path.join(dir, e.name); return e.isDirectory() ? walk(p) : [p];
});
const writeIfChanged = (file, buf) => {
  if (fs.existsSync(file) && fs.readFileSync(file).equals(buf)) return false;
  fs.writeFileSync(file, buf); return true;
};

function findSheets() {
  const found = new Map();                                  // Name → { json, png, src }
  for (const src of SOURCES) for (const f of walk(path.join(ROOT, src))) {
    if (!f.endsWith('.json')) continue;
    let meta; try { meta = JSON.parse(fs.readFileSync(f, 'utf8')).meta; } catch (e) { continue; }
    if (!meta || !Array.isArray(meta.frameTags)) continue;    // kein Aseprite-Export
    const name = path.basename(f, '.json'), png = path.join(path.dirname(f), meta.image || name + '.png');
    if (!found.has(name) && fs.existsSync(png)) found.set(name, { json: f, png, src });
  }
  return found;
}

function syncSprites() {
  fs.mkdirSync(OUT, { recursive: true });
  const found = findSheets(); let changed = 0;
  for (const [name, s] of found) {
    const json = JSON.parse(fs.readFileSync(s.json, 'utf8')); json.meta.image = name + '.png';
    changed += writeIfChanged(path.join(OUT, name + '.json'), Buffer.from(JSON.stringify(json) + '\n'));
    changed += writeIfChanged(path.join(OUT, name + '.png'), fs.readFileSync(s.png));
  }
  const names = [...found.keys()].sort();
  changed += writeIfChanged(path.join(OUT, 'index.json'), Buffer.from(JSON.stringify({ sheets: names }, null, 1) + '\n'));
  return { count: names.length, changed, placeholders: [...found.values()].filter(s => s.src === 'art/platzhalter').length };
}

if (require.main === module) { const r = syncSprites(); console.log(`sprites/: ${r.count} Sheets (${r.placeholders} Platzhalter), ${r.changed} Dateien aktualisiert`); }
module.exports = { syncSprites, findSheets };
