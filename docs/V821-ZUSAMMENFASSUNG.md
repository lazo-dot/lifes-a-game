# Zusammenfassung 8.2.1 – Arbeitsablauf

Auftrag: `docs/auftraege/arbeitsablauf.md`. Branch `ablauf`. **Keine Änderung an Spielregeln, Oberfläche oder Daten**; in der App nur, was die Vorschau braucht (Speicher-Präfix, Band, Service Worker, Update-Hinweis).

## Eingerichtet

1. **Abnahme-Skript `npm run abnahme`** (`tools/abnahme.js`)
   - Liest `docs/abnahme.json`: Abschnitt `immer` plus Versionsabschnitt (`v8`, `v8.2`, `v8.2.1`; für 8.2.1 gibt es keinen).
   - Baut `dist/`, startet einen eigenen Server, Headless-Chrome über das DevTools-Protokoll (gemeinsam: `tools/ux/chrome.js`), Test-Hof, 12 Uhr, Erklärungen als gesehen.
   - Misst alle 17 Prüfungen auf beiden Geräten (390 × 844 und 430 × 932 pt, 3×). Kontraste in 7 Themen × 4 Zuständen × 7 Ansichten (5 Tabs, Info-Blatt, Einstellungen) am gerenderten Bild.
   - Ausgabe als Tabelle (Grenzwert / gemessen / ok), Exit-Code 1 bei einer Verletzung. Bericht `docs/abnahme-ergebnis.md`, Screenshots `docs/screenshots/` (Standard und Pergament: Heute oben, alle Tabs, Info-Blatt, Einstellungen).
   - Bekannt offene Punkte stehen in `BEKANNT_OFFEN` mit Verweis auf `docs/feedback.md`. Ist ein solcher Punkt erfüllt, meldet der Bericht „jetzt erfüllt – Eintrag streichen“.
   - `tools/ux/screenshots-v8a.js` und `screenshots-v8c.js` sind darin aufgegangen. `aufgaben-v8c.js` und `screenshots-v8b.js` nutzen die gemeinsame Chrome-Steuerung, `aufgaben-v8c.js` startet seinen Server selbst.
2. **Vorschau-Adresse** `https://lazo-dot.github.io/lifes-a-game/preview/`
   - Workflow `Vorschau` testet jeden Push außer `main` und stößt danach `Pages` an. `Pages` veröffentlicht `main` unter `/` und den Branch unter `/preview/` (`PREVIEW_BRANCH=… npm run build`).
   - Eigener Speicher: IndexedDB `preview-lifes-a-game`, localStorage mit Präfix `preview-`, Cache `preview-lag-…`. Der Service Worker hat den Scope `…/preview/`, der von `main` lässt `…/preview/` durch und räumt nur eigene Caches auf. Manifest „Life's a Game (Vorschau)“.
   - Band oben: „Vorschau · ‹Branch› · ‹Version›“.
   - Kein Hinweis „Neue Version bereit“ beim ersten Besuch der Vorschau (`src/app.js`: nur der eigene Service Worker zählt).
3. **Test-Hooks** `.githooks/` (aktiv mit `git config core.hooksPath .githooks`, beschrieben in `README.md`)
   - `pre-commit`: `npm test`.
   - `pre-push`: `npm run abnahme -- --ohne-bilder`.
   - Node wird auch ohne `PATH` gefunden (`.githooks/node-pfad.sh`).
4. **Schlanke `CLAUDE.md`** (54 Zeilen): Projekt, Ablauf mit Verweis auf `docs/auftraege/README.md`, Quellen, Prinzipien, Architekturregeln, Prüfen vor dem Push, Arbeitsweise. Die erledigten Arbeitslisten v5–v8c liegen in `docs/archiv/arbeitslisten.md`.

## Prüfung

- `npm test`: 105 grün (unverändert, keine neuen Tests: Version ohne Regel- oder Logikänderung).
- `npm run abnahme`: **grün, 2 Prüfungen bekannt offen** (Laufzeit ca. 3,5 Minuten).

| Prüfung | Grenzwert | gemessen (390 / 430 pt) |
|---|---|---|
| erster Haken | ≤ 480 pt | 469 / 469 |
| Karten im ersten Bildschirm | ≥ 3 | 3 / 3 |
| Wörter | Heute 100, Gewohnheiten 100, Logbuch 80, Fortschritt 130, Truhe 160, Summe 500 | 86, 63, 62, 103, 139, Summe 453 |
| Seitenhöhe | Heute 1300, Fortschritt 1800 | 1085 / 1085, 1546 / 1429 |
| Szene | ganzzahlig, ohne Seitenstreifen | 1×, 0 pt Rest |
| Großansicht | ≥ 3× | 3× / 3× |
| Tap-Flächen | ≥ 44 pt (außer `.cal-cell`) | kleinste 44 pt |
| Textkontrast | ≥ 4,5 | kleinster 5,08 |
| Nicht-Text-Kontrast | ≥ 3,0 | **bekannt offen**: Zahnrad in Pergament 1,05; Eingabefelder 1,6–2,4; Abhak-Kasten beim Überfahren 2,3 |
| Kontextzeile ohne Abschneiden | Anker | **bekannt offen**: 3 von 3 / 2 von 3 abgeschnitten |
| Erklärungen | ≤ 60 Wörter | längste 54 |
| Ebenen | ≤ 2 | 2 |
| Konsolenfehler | 0 | 0 |
| Speicherschema / Migration | 4; v3, v5, v7, v8 | 4; alle laden |

- Vorschau lokal geprüft (main unter `/`, Vorschau unter `/preview/` auf derselben Herkunft): getrennte Datenbanken und Caches, eigener Service-Worker-Scope, Band sichtbar, Daten von main nach Schreiben in der Vorschau unverändert, keine Konsolenfehler.
- Testleitfaden (`node tools/ux/aufgaben-v8c.js`): alle Aufgaben lösbar, v6-Daten laden unverändert.
- Hooks: `pre-commit` läuft bei jedem Commit dieses Branches.

## Offen

- **Vorschau online erst nach dem Merge:** GitHub startet `workflow_run` nur mit Workflow-Dateien, die auf `main` liegen. Erst danach erzeugt ein Push auf einen Branch die Vorschau. Online also erst ab dem ersten Branch-Push nach dem Merge prüfbar; nach dem Merge liegt unter `/preview/` zunächst `ablauf`.
- **Zwei neue Kontrast-Funde** (Eingabefelder, Hover-Ring des Abhak-Kastens) stehen in `docs/feedback.md` und als bekannt offen in der Abnahme. Behoben werden sie nicht in dieser Version, weil der Auftrag App-Änderungen ausschließt. Bitte im Koordinations-Chat zuordnen (Vorschlag v9).
- Abweichungen: `docs/ABWEICHUNGEN.md`, Abschnitt 8.2.1 (9 Punkte).
