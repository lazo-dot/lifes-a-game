/* Life's a Game · Service Worker
 * Alle App-Dateien kommen aus dem Cache einer Version (offline, und HTML und Skripte passen immer zusammen).
 * VERSION und ASSETS setzt der Build (tools/build.js) automatisch: neuer Inhalt = neue Version = alter Cache wird entfernt.
 * Die App zeigt nach einem Update einen Hinweis zum Neuladen (src/app.js).
 */
const VERSION = '__VERSION__';
const ASSETS = __ASSETS__;
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== self.location.origin) return;
  const key = req.mode === 'navigate' ? './' : req;
  e.respondWith(caches.open(VERSION).then(c => c.match(key, { ignoreSearch: true })).then(hit => hit || fetch(req)).catch(() => Response.error()));
});
