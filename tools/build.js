/* Life's a Game · Build
 * Übernimmt die Sprite-Exporte (tools/sprites.js), kopiert public/ und src/ nach dist/ (auslieferbare App) und setzt im Service Worker Version und Dateiliste.
 * Kein Bundler, keine Abhängigkeiten: dist/ ist dieselbe App aus klassischen Skripten, nur zusammengestellt.
 *   node tools/build.js           → dist/
 *   node tools/build.js --bundle  → zusätzlich dist-bundle/lifes-a-game.html (eine Datei, z. B. für die Artifact-Vorschau)
 */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..'), DIST = path.join(ROOT, 'dist');
const pkg = require(path.join(ROOT, 'package.json'));
const { syncSprites } = require('./sprites');

const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
  if (e.name.startsWith('.')) return [];
  const p = path.join(dir, e.name); return e.isDirectory() ? walk(p) : [p];
});

function build() {
  syncSprites();                                          // v8a: Aseprite-Exporte → public/sprites/ (nur bei Änderung)
  fs.rmSync(DIST, { recursive: true, force: true });
  const files = [];                                       // [Zielpfad relativ zu dist, Quelle]
  for (const f of walk(path.join(ROOT, 'public'))) files.push([path.relative(path.join(ROOT, 'public'), f), f]);
  for (const f of walk(path.join(ROOT, 'src'))) if (f.endsWith('.js')) files.push([path.join('js', path.relative(path.join(ROOT, 'src'), f)), f]);
  const hash = crypto.createHash('sha256');
  for (const [rel, src] of files.sort((a, b) => a[0].localeCompare(b[0]))) {
    const out = path.join(DIST, rel); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.copyFileSync(src, out);
    hash.update(rel); hash.update(fs.readFileSync(src));
  }
  // Nur was die App braucht, wird vorab gecacht (keine Lizenztexte).
  const assets = ['./', ...files.map(([rel]) => rel.split(path.sep).join('/')).filter(r => r !== 'sw.js' && !r.endsWith('.txt'))];
  const version = `lag-${pkg.version}-${hash.digest('hex').slice(0, 8)}`;
  const swPath = path.join(DIST, 'sw.js');
  fs.writeFileSync(swPath, fs.readFileSync(swPath, 'utf8').replace('__VERSION__', version).replace('__ASSETS__', JSON.stringify(assets)));
  const idx = path.join(DIST, 'index.html');              // U10: Versionsanzeige aus package.json
  fs.writeFileSync(idx, fs.readFileSync(idx, 'utf8').replace('__APP_VERSION__', pkg.version));
  fs.writeFileSync(path.join(DIST, 'version.txt'), version + '\n');
  return { version, count: files.length };
}

/** Eine einzelne HTML-Datei mit eingebettetem CSS und JS. Ohne Manifest, daher registriert sie keinen Service Worker. */
function bundle() {
  const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(DIST, 'styles.css'), 'utf8');
  const body = html.match(/<body>([\s\S]*?)<script/)[1];
  const js = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => fs.readFileSync(path.join(DIST, m[1]), 'utf8')).join('\n');
  const fonts = 'https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600;700&family=VT323&display=swap';
  const out = `<title>Life's a Game</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<link rel="stylesheet" href="${fonts}">\n<style>\n${css}\n</style>\n${body}<script>\n${js}\n</script>\n`;
  const dir = path.join(ROOT, 'dist-bundle'); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'lifes-a-game.html'), out);
  return Math.round(out.length / 1024);
}

if (require.main === module) {
  const r = build(); console.log(`dist/ gebaut · ${r.count} Dateien · ${r.version}`);
  if (process.argv.includes('--bundle')) console.log(`dist-bundle/lifes-a-game.html · ${bundle()} KB`);
}
module.exports = { build };
