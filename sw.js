/* Life's a Game · Service Worker
 * Eigene Dateien: Cache zuerst (offline). Schriften von Google: einmal laden, danach aus dem Cache.
 * Bei jeder neuen Version VERSION erhöhen, dann werden alte Caches entfernt.
 */
const VERSION = 'lag-v4.0.0';
const ASSETS = [
  './', 'index.html', 'styles.css', 'manifest.webmanifest',
  'js/logic.js', 'js/store.js', 'js/sprites.js', 'js/music.js', 'js/scene.js', 'js/demo.js', 'js/ui.js', 'js/app.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'
];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== 'lag-fonts').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open('lag-fonts').then(async c => { const hit = await c.match(req); if (hit) return hit; try { const res = await fetch(req); c.put(req, res.clone()); return res; } catch (err) { return Response.error(); } }));
    return;
  }
  if (url.origin !== self.location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => req.mode === 'navigate' ? caches.match('index.html') : Response.error())));
});
