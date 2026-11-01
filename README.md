# Life's a Game · Prototyp V4

Installierbare Web-App (PWA): Gewohnheiten, To-dos und Logbuch als Pixel-Hof. Alle Daten bleiben auf dem Gerät (IndexedDB).

## Aufbau

| Datei | Inhalt | Port nach Flutter |
|---|---|---|
| `js/logic.js` | Spielregeln ohne Oberfläche: Stärke, Serie, Regentage, XP, Level, Ernte, Onboarding-Regel, Kalender, Import/Migration | 1:1 nach Dart (`lib/logic/`) |
| `tests/logic.test.js` | 19 Tests für alle Formeln | als Dart-Tests übernehmen |
| `js/store.js` | Speicher: IndexedDB, Rückfall auf localStorage | Isar/SQLite |
| `js/scene.js` | Hof-Szene (Draufsicht), Ebenen-Cache, Wetter, Licht | Flame |
| `js/music.js` | Effekte und Klaviermusik je Wetter | Audio-Plugin |
| `js/sprites.js` | Pixel-Sprites | Spritesheets (Aseprite) |
| `js/ui.js` | Oberfläche, Onboarding, Check-in, Erntekalender | Flutter-Widgets |
| `js/demo.js` | Demo-Hof (wird nie gespeichert) | – |
| `sw.js`, `manifest.webmanifest`, `icons/` | Offline-Betrieb und Installation | entfällt |

## Lokal starten

```bash
cd lifes-a-game-v4
python3 -m http.server 8000
# Browser: http://localhost:8000
```

Direktes Öffnen der `index.html` per Doppelklick funktioniert auch, dann aber ohne Offline-Modus.

## Tests

```bash
node --test tests/logic.test.js
```

## Aufs iPhone bringen

iOS installiert eine Web-App nur über **HTTPS**. Zwei einfache Wege:

**A · Netlify Drop (ohne Konto, ca. 2 Minuten)**
1. https://app.netlify.com/drop öffnen.
2. Den Ordner `lifes-a-game-v4` in das Fenster ziehen.
3. Die angezeigte `https://…netlify.app`-Adresse auf dem iPhone in **Safari** öffnen.
4. Teilen → „Zum Home-Bildschirm“.

**B · GitHub Pages (dauerhaft, mit Updates per Push)**
1. Neues Repository anlegen, Inhalt dieses Ordners hochladen.
2. Settings → Pages → Branch `main`, Ordner `/root`.
3. Die Adresse `https://<name>.github.io/<repo>/` in Safari öffnen und zum Home-Bildschirm hinzufügen.

**Updates:** Bei jeder neuen Version in `sw.js` die Konstante `VERSION` erhöhen, sonst zeigt das iPhone weiter die alte Version aus dem Cache. Die App einmal schließen und neu öffnen.

**Datensicherung:** Fortschritt → „Sicherung erstellen“ (Text kopieren und z. B. in Notizen ablegen). Wiederherstellen über „Sicherung importieren“ oder beim ersten Start.

## Werkzeuge

- `python3 tools/make_icons.py` · erzeugt die App-Icons neu
- `python3 tools/build_bundle.py` · baut `dist/lifes-a-game-v4.html` (eine Datei, für die Vorschau als Artifact)
