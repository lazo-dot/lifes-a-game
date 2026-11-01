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

  // H1: offline-fähig und installierbar. Nur mit Manifest (nicht im Einzeldatei-Bundle) und sicherem Kontext (HTTPS oder localhost).
  const hasManifest = !!document.querySelector('link[rel="manifest"]');
  if (hasManifest && 'serviceWorker' in navigator && root.isSecureContext) {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Neue Version ist installiert. Nicht ungefragt neu laden, sonst ginge z. B. ein angefangener Logbuch-Text verloren.
      if (hadController) root.LAGUI.notify('<span><b>Neue Version bereit.</b> Lade neu, um sie zu nutzen.</span>', { label: 'Neu laden', fn: () => root.location.reload() });
    });
    navigator.serviceWorker.register('sw.js').catch(() => { /* z. B. file:// – App läuft trotzdem */ });
  }
})(typeof self !== 'undefined' ? self : this);
