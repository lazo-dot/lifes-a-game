/* Life's a Game · lokaler Server zum Entwickeln
 * Baut dist/, liefert es unter http://localhost:8000 aus und baut bei Änderungen in public/ oder src/ neu.
 * localhost gilt im Browser als sicherer Kontext, der Service Worker läuft also auch hier.
 *   npm start   (Port ändern: PORT=8080 npm start)
 * serveDir(dir, port) nutzt auch tools/abnahme.js (eigener Server auf freiem Port, ohne Neubau bei Änderungen).
 */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const { build } = require('./build');
const ROOT = path.resolve(__dirname, '..'), DIST = path.join(ROOT, 'dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' };

/** Statischer Server für dir; Port 0 = freier Port, ohne host auf allen Schnittstellen (wie bisher). Liefert den laufenden http.Server (Port in server.address().port). */
function serveDir(dir, port, host) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(dir, path.normalize(p));
    if (!file.startsWith(dir)) { res.writeHead(403).end(); return; }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Nicht gefunden'); return; }
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' }).end(data);
    });
  });
  return new Promise(r => server.listen(port, host, () => r(server)));
}

if (require.main === module) {
  const PORT = +process.env.PORT || 8000;
  let r = build(); console.log(`gebaut: ${r.version}`);
  let timer = 0;
  for (const dir of ['public', 'src']) fs.watch(path.join(ROOT, dir), { recursive: true }, () => {
    clearTimeout(timer); timer = setTimeout(() => { try { r = build(); console.log(`neu gebaut: ${r.version}`); } catch (e) { console.error(e.message); } }, 150);
  });
  serveDir(DIST, PORT).then(() => console.log(`Life's a Game läuft auf http://localhost:${PORT}`));
}
module.exports = { serveDir };
