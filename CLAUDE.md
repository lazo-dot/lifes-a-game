# Life's a Game – Hinweise für Claude Code

Gamifizierter Habit-Tracker mit To-dos und Logbuch als gemütliche Pixel-Farm. Gewohnheiten wachsen als Pflanzen, Skills als Gebäude. Entwickler: Lars (MacBook Pro M4). Sprache im Projekt: Deutsch (UI, Kommentare dürfen Englisch sein). Aktueller Stand: Prototyp v7 (installierbare PWA, GitHub Pages, Bedienbarkeit). **In Arbeit auf Branch `v8a`: Grafik auf Sprite-Sheets (Stil B).**

## Quellen der Wahrheit

- `docs/habit-tracker-entwicklungsleitfaden.md` – **verbindlich** für Mechaniken, Formeln, Datenmodell und Prinzipien (aktuell v1.8).
- `docs/pixel-styleguide-stil-b.md` – **Grundlage für v8a** (Raster, Lesbarkeit, Licht-Ebenen, Lieferformat, Asset-Liste).
- `docs/ux-heuristische-evaluation-v6.md` – Grundlage für v7 (Funde U1–U18 mit Empfehlungen).
- `docs/ux-testleitfaden-v6.md` – der Usability-Test, der nach v7 läuft; Aufgaben dort müssen weiter funktionieren.
- `docs/abgleich-checkliste.md`, `docs/simulation-*.md`, `docs/marketingkonzept.md` – Hintergrund.

Leitfaden, Checkliste und Berichte werden im claude.ai-Projekt „Life's a Game“ gepflegt (Koordinations-Chat). **Hier nicht inhaltlich ändern.** Bewusste Abweichungen mit Grund in `docs/ABWEICHUNGEN.md` eintragen (Abschnitt der jeweiligen Version, aktuell „v8a“).

## Unverhandelbare Prinzipien (Kurzfassung, Details im Leitfaden)

1. Nutzer besitzen ihre Ziele – nur anpassbare Vorschläge, keine Normziele.
2. XP ist Feedback, keine Bezahlung – keine Währung, kein Laden, nur Überraschungsfunde (12 %, davon 20 % selten, nur am selben Tag) und garantierte Funde bei Ernte/„Gemeistert“.
3. Serien verzeihen – Regentage, Nachtragen 48 h, Extra-Runde; verzeihende Mechaniken setzen keine Zähler zurück.
4. Auslöser statt Erinnerungen – Anker ist Pflicht; Erinnerungen werden ausgeschlichen, Ziel ist „Gemeistert“.
5. Spielaktionen nur nach echten Erledigungen; die Farm schläft 22–6 Uhr.
6. Keine Dark Patterns: keine Countdowns, Schuld-Nachrichten, Verlustmechaniken, kein Confirmshaming.
7. Pflanzen sterben nie, „Gemeistert“ wird nie entzogen.
8. Daten bleiben lokal, keine externen Anfragen.

## Architekturregeln

- `src/logic.js` bleibt UI-frei. **v8a ändert keine Spielregeln** – Logik und bestehende Tests bleiben inhaltlich unverändert (nur Hilfsfunktionen ergänzen, falls nötig, mit Tests).
- Gespeichert werden nur Eingaben; das Speicherschema bleibt `4`. v8a ergänzt nur `skill.buildingType` und `habit.plantType` (`LAG.migrateV8a`); alle übrigen Daten bleiben unverändert.
- Klassische Skripte, Kopier-Build nach `dist/`, kein Bundler. `npm test` grün vor jedem Commit.

## Arbeitsliste v8a – Grafik auf Sprite-Sheets (Stil B)

Grundlage: `docs/pixel-styleguide-stil-b.md` (Abschnitte 2, 3, 6, 7, 8), Leitfaden 5.4, `art/platzhalter/README.md`. Arbeit auf Branch `v8a`, **nicht nach main mergen, nicht auf GitHub Pages veröffentlichen** (auf v7 laufen Selbsttest und Usability-Test). Regeln, Stärke, XP, Funde und Graduierung bleiben unverändert.

**Muss (H)**
1. **Sprite-System:** Loader für Aseprite-JSON (Array) + PNG mit Ebenen base/glow/shadow, Frame-Tags, `meta.anchor`, `meta.platzhalter` (`src/sheets.js`). Build kopiert die Exporte nach `public/sprites/` (`tools/sprites.js`, Quelle `art/src/` vor `art/platzhalter/`); der Service Worker cached sie. Fehlt eine Datei: Rückfall auf den bisherigen Zeichencode. Reihenfolge: Boden → Schatten (eine Farbe, 30 %, nachts aus) → base nach Fußpunkt-y → Tönung (multiplizieren) → glow (addieren); kein Glätten.
2. **Ganzzahlige Skalierung:** Szene logisch 256 × 160, nur 1×/2×/3× in CSS-Pixeln, Canvas = CSS-Größe × devicePixelRatio. iPhone kompakt 1:1 (256 × 160 pt). Antippen öffnet die Großansicht (größter ganzzahliger Faktor, verschiebbar, Schließen 44 pt).
3. **Gebäude je Fähigkeit:** `skill.buildingType` (muehle, archiv, gewaechshaus, schmiede, gemeinschaftshaus, musikpavillon, backhaus, kontor, scheune), Migration nach Symbol, Auswahl als Raster mit Namen (≥ 44 pt). Ausbaustufe 1–2 → 1, 3–5 → 2, 6–9 → 3, ab 10 → 4 (`LAG.buildingStage`).
4. **Pflanzen und Beete:** `habit.plantType` (beere, blume, kuerbis, baeumchen), Wachstumsstufen keim … ausgewachsen + gemeistert (`LAG.plantFrame`). Beete 48 × 16 nach Style-Guide 2, bis zu 3 Pflanzen je Beet.
5. **Hof als Karte:** `public/sprites/hof-karte.json` mit Plätzen und Zonen, Streuung per festem Seed. Statische Ebenen nur bei Änderung neu zeichnen.

**Sollte (M):** Stufe-4-Gebäude, Gewächshaus und Schmiede leuchten abends (glow). Hinweis „Vorläufige Grafiken“ in den Einstellungen, solange `meta.platzhalter` gilt.

**Nacharbeit v8a.1:** Kompakte Szene ohne Seitenstreifen (logische Breite = floor(verfügbare Breite / Faktor), Kern 256 × 160 mittig, Ränder nur Natur aus den Randzonen der Karte); Großansicht mit dem größten Faktor, bei dem die Höhe passt (iPhone 3×), verschiebbar, Hinweis „Zum Umsehen wischen“.

**Nicht in v8a:** Truhengegenstände (Paket 3), Farbthemen, Figuren, Tiere, neue Wetter-Partikel, Flutter.

## Prüfen vor dem Push

- `npm test` grün (68 bestehende + v8a-Tests).
- `node tools/ux/screenshots-v8a.js` (bei laufendem `npm start`): Szene genau 256 × 160 pt, keine verschwommenen Pixel, erster Haken ohne Scrollen (v7: 468 pt). Screenshots unter `docs/screenshots-v8a/`.
- Alle 8 Aufgaben aus `docs/ux-testleitfaden-v6.md` weiter lösbar; v7-Daten werden migriert (nur Gebäude- und Pflanzentyp kommen dazu).

## Arbeitsweise

- Kleine, thematische Commits. Vor dem Push auf `main` Lars fragen (danach aktualisiert sich die App auf seinem iPhone).
- Zum Schluss je Version eine Zusammenfassung (v8a: `docs/V8A-ZUSAMMENFASSUNG.md`): was umgesetzt ist (Muss/Sollte), Testanzahl, Messwerte (Szenengröße, erster Haken), Abweichungen in `docs/ABWEICHUNGEN.md` (v8a), offene Punkte. Checkliste nicht selbst ausfüllen.
- Keine Gesundheitsversprechen in App-Texten, keine fremden Markennamen.
