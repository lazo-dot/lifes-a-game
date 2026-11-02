# Life's a Game · Prototyp V5

Installierbare Web-App (PWA): Gewohnheiten, To-dos und Logbuch als Pixel-Hof. Alle Daten bleiben auf dem Gerät (IndexedDB), es gibt keine Anfragen an Dritte.

Verbindliche Regeln: [CLAUDE.md](CLAUDE.md) und [Entwicklungsleitfaden](docs/habit-tracker-entwicklungsleitfaden.md). Stand v5: [docs/V5-ZUSAMMENFASSUNG.md](docs/V5-ZUSAMMENFASSUNG.md).

## Aufbau

| Ordner / Datei | Inhalt | Port nach Flutter |
|---|---|---|
| `src/logic.js` | Spielregeln ohne Oberfläche: Stärke, Serie, Regentage, XP, Level, Ernte, Graduierung, Fundchancen, Beta-Metriken, Kalender, Import | 1:1 nach Dart (`lib/logic/`) |
| `src/store.js` | Speicher: IndexedDB, Rückfall auf localStorage | Isar/SQLite |
| `src/scene.js`, `src/sprites.js` | Hof-Szene, Pixel-Sprites | Flame, Spritesheets |
| `src/music.js` | Effekte und Klaviermusik je Wetter | Audio-Plugin |
| `src/ui.js`, `src/app.js` | Oberfläche, Start, Service-Worker-Registrierung | Flutter-Widgets |
| `src/demo.js` | Demo-Hof (wird nie gespeichert) | – |
| `public/` | `index.html`, `styles.css`, Manifest, `sw.js`, Icons, Schriften | entfällt |
| `tests/` | Node-Tests für alle Formeln | als Dart-Tests übernehmen |
| `tools/` | `build.js` (dist/ bauen), `serve.js` (lokaler Server), `abnahme.js` (Abnahme im Browser), `ux/` (Test-Hof, Chrome-Steuerung, Aufgaben), `make_icons.py` | – |
| `docs/` | Leitfaden, Checkliste, Marketing, Abweichungen, Zusammenfassung v5 | – |

`dist/` wird gebaut und nicht eingecheckt: `public/` plus `src/` als `js/`, der Service Worker bekommt Version und Dateiliste automatisch.

## Befehle

Voraussetzung: Node ab Version 20.

```bash
npm test          # alle Tests
npm start         # baut dist/ und startet http://localhost:8000, baut bei Änderungen neu
npm run build     # nur dist/ bauen
npm run bundle    # zusätzlich dist-bundle/lifes-a-game.html (eine Datei, z. B. für die Artifact-Vorschau)
npm run abnahme   # Grenzwerte aus docs/abnahme.json im Headless-Chrome messen → docs/abnahme-ergebnis.md, docs/screenshots/
```

`npm run abnahme` baut `dist/`, startet einen eigenen Server und braucht Google Chrome (anderer Pfad: `CHROME=… npm run abnahme`).

Ohne Server: `dist/index.html` per Doppelklick öffnen (dann ohne Offline-Modus).

## Test-Hooks (einmal nach dem Klonen)

```bash
git config core.hooksPath .githooks
```

Danach läuft vor jedem Commit `npm test` und vor jedem Push `npm run abnahme` (ca. 3–4 Minuten). Bewusst überspringen nur mit `--no-verify`.

## Aufs iPhone bringen

iOS installiert eine Web-App nur über **HTTPS**.

**A · GitHub Pages (empfohlen, dauerhaft, Updates per Push)**
1. Auf github.com ein neues Repository anlegen (z. B. `lifes-a-game`, öffentlich, denn Pages ist in kostenlosen Konten nur für öffentliche Repos verfügbar).
2. Im Repository: Settings → Pages → Source: **GitHub Actions**.
3. Dieses Repo hochladen: `git remote add origin https://github.com/<name>/lifes-a-game.git` und `git push -u origin main`.
4. Der Workflow `.github/workflows/pages.yml` testet, baut und veröffentlicht. Adresse: `https://<name>.github.io/lifes-a-game/`.
   Vorschau: Ein Push auf einen anderen Branch als `main` landet (nach grünen Tests, Workflow „Vorschau“) unter `https://<name>.github.io/lifes-a-game/preview/` – mit eigenem Speicher, eigenem Service Worker und einem Band „Vorschau · Branch · Version“.
5. Die Adresse auf dem iPhone in **Safari** öffnen → Teilen → „Zum Home-Bildschirm“.

**B · Netlify Drop (ohne Git, ca. 2 Minuten)**
1. `npm run build`
2. https://app.netlify.com/drop öffnen und den Ordner `dist` hineinziehen.
3. Die `https://…netlify.app`-Adresse in Safari öffnen → „Zum Home-Bildschirm“.

**Updates:** Nach einem neuen Build ändert sich die Cache-Version von selbst. Die installierte App lädt sie beim nächsten Öffnen im Hintergrund und zeigt dann „Neue Version bereit · Neu laden“.

**Datensicherung:** Fortschritt → „Sicherung erstellen“. Wiederherstellen über „Sicherung importieren“ oder beim ersten Start.

## Offline prüfen

Nach dem ersten Laden in Safari (oder Chrome) die Verbindung trennen bzw. den Flugmodus einschalten und die App neu öffnen. Sie muss vollständig laden, mit Schriften. In Chrome zeigt DevTools → Application → Service Workers den Status.
