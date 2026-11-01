/* Life's a Game · Start
 * Lädt den gespeicherten Hof (IndexedDB), startet die Oberfläche und registriert den Service Worker.
 */
(async function (root) {
  'use strict';
  const L = root.LAG, today = L.dkey(new Date());
  let state = null;
  try {
    const saved = await root.LAGStore.load();
    if (saved) { const r = L.importState(saved, today); if (r.ok) state = r.state; }
  } catch (e) { state = null; }
  root.LAGUI.boot(state);

  // H5: offline-fähig und installierbar. Nur mit Manifest (nicht in der Artifact-Vorschau) und sicherem Kontext.
  const hasManifest = !!document.querySelector('link[rel="manifest"]');
  if (hasManifest && 'serviceWorker' in navigator && root.isSecureContext) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* z. B. file:// – App läuft trotzdem */ });
  }
})(typeof self !== 'undefined' ? self : this);
