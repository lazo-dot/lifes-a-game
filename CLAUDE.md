# Life's a Game – Hinweise für Claude Code

Gamifizierter Habit-Tracker mit To-dos und Logbuch als gemütliche Pixel-Farm. Gewohnheiten wachsen als Pflanzen, Skills als Gebäude. Entwickler: Lars (MacBook Pro M4). Sprache im Projekt: Deutsch (UI, Kommentare dürfen Englisch sein). Aktueller Stand: Prototyp v8b (8.1.0) auf `main` (installierbare PWA, GitHub Pages; Hof in Stil B mit Platzhalter-Grafiken, Truhe mit Sammelalbum, sieben Farbthemen). **Selbsttest und Usability-Test laufen auf main.** In Arbeit: v8c „Ruhiger Bildschirm“ (8.2.0) auf Branch `v8c`.

## Quellen der Wahrheit

- `docs/habit-tracker-entwicklungsleitfaden.md` – **verbindlich** für Mechaniken, Formeln, Datenmodell und Prinzipien (aktuell v1.8).
- `docs/pixel-styleguide-stil-b.md` – **Grundlage für v8a/v8b** (Raster, Lesbarkeit, Licht-Ebenen, Lieferformat, Asset-Liste, Paket 3, Staffelung).
- `docs/ux-heuristische-evaluation-v6.md` – Grundlage für v7 (Funde U1–U18 mit Empfehlungen).
- `docs/ux-verschlankung-v8c.md` – **verbindlich für v8c** (Regeln 1–8, Maßnahmen je Bildschirm, Ziele); Vorschau `docs/vorschau-v8c-heute.png`.
- `docs/farbthemen.json` – Farbthemen und Akzentfarben (Werte für das CSS, Test auf Übereinstimmung).
- `docs/ux-testleitfaden-v6.md` – der Usability-Test (Aufgabe 8: Gebäude ändern); Aufgaben dort müssen weiter funktionieren (ab v8c: Bearbeiten und Pausieren über das Info-Blatt).
- `docs/abgleich-checkliste.md`, `docs/simulation-*.md`, `docs/marketingkonzept.md` – Hintergrund.

Leitfaden, Checkliste und Berichte werden im claude.ai-Projekt „Life's a Game“ gepflegt (Koordinations-Chat). **Hier nicht inhaltlich ändern.** Bewusste Abweichungen mit Grund in `docs/ABWEICHUNGEN.md` eintragen (Abschnitt der jeweiligen Version, aktuell „v8c“).

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

- `src/logic.js` bleibt UI-frei. **v8a/v8b ändern keine Spielregeln** – keine Änderung an Stärke, XP, Fundchance (12 %, davon 20 % selten), Regentagen, Nachtragen oder Graduierung (der Selbsttest läuft parallel auf main). Bestehende Tests bleiben inhaltlich unverändert.
- Gespeichert werden nur Eingaben; das Speicherschema bleibt `4`. v8a ergänzt nur `skill.buildingType` und `habit.plantType` (`LAG.migrateV8a`), v8b nur das optionale `theme`, v8c nur das optionale `accent`. Bestehende Truhen, platzierte Gegenstände und Exporte bleiben gültig.
- Klassische Skripte, Kopier-Build nach `dist/`, kein Bundler. `npm test` grün vor jedem Commit.

## Arbeitsliste v8c – Ruhiger Bildschirm (Version 8.2.0, Branch `v8c`)

Grundlage: `docs/ux-verschlankung-v8c.md` (Regeln 1–8, Tabelle Abschnitt 5, Ziele Abschnitt 6). Keine Änderung an Spielregeln, Speicherschema oder Daten.

**Muss (H)**
- **8.1.1:** Leerer Abhak-Kasten mit Rand in `--text-soft` (≥ 3:1), Titel-Schatten in Pergament, Test für Nicht-Text-Kontrast.
1. **Info-Blatt** als eine Komponente (`src/sheet.js`): von unten, Ziehgriff, schließt per daneben tippen, Wischen, Escape, Knopf (44 pt); `role="dialog"`, Fokus hinein und zurück; ohne Animation bei reduzierter Bewegung.
2. **Kompakte Gewohnheitskarten** (Heute, Gewohnheiten): Haken, Titel, Anker mit Uhrzeit, Abzeichen, Mini. Karte antippen öffnet das Info-Blatt mit allen Angaben und Bearbeiten, Kalender, Pausieren. Die Bestätigung nach Mini nennt den Mini-Text.
3. **Erklärungen hinter „?“** (`src/hilfe.js`, ≤ 60 Wörter, 44 pt), beim ersten Besuch einmal offen (localStorage).
4. **Nachtragen** als eine Zeile je offenem Tag, Erklärung hinter „mehr“.
5. **Wilma:** ein Hinweis zur Zeit (Nachtrag, Check-in, Meilenstein, Hofspruch).
6. **„+ To-do“** als Blatt, nur Titel Pflicht, der Rest unter „Mehr“.
7. **Einstellungen** (Zahnrad): Darstellung, Ton, Daten & Sicherung, Beta-Zahlen, Über die App; keine Fußzeile, kein Musik/Effekte in der Kopfzeile.
8. **Fortschritt** und **Truhe** verschlankt (Erklärungen hinter „?“, Album eingeklappt, Funde als Info-Blatt).
9. **Schrift in drei Ebenen** und **Akzentfarbe** (`accent`, `farbthemen.json` → akzente).

**Pflicht:** Text-Inventar `docs/text-inventar-v8c.md`. **Messung:** `node tools/ux/screenshots-v8c.js` (Ziele aus Abschnitt 6), Aufgaben: `tools/ux/aufgaben-v8c.js`.

<details><summary>Arbeitsliste v8b (erledigt, 8.1.0 auf main)</summary>

Grundlage: Leitfaden 4.4 und 5.4, Style-Guide Paket 3 und Staffelung, `art/platzhalter/README.md`. v8a (Sprite-System, Skalierung, Gebäude, Pflanzen, Karte) ist auf `main`.

**Muss (H)**
1. **Gegenstände aus dem Katalog:** `ITEMS` nach `art/platzhalter/deko/deko-katalog.json` (37 Deko + 5 Tiere, Gruppe, selten, Jahreszeit, Tier), die 12 bisherigen IDs bleiben; Test auf Übereinstimmung. Saisonale nur in ihrer Jahreszeit findbar (Herbst = Sep–Nov usw.), gefunden bleiben sie. Ziehung: Fund und Seltenheit wie bisher, dann gleichverteilt aus den jetzt findbaren (`LAG.findable`, `pickItem`, `rollDrop` mit Tag). Fundchancen-Anzeige zeigt die jetzt findbaren.
2. **Sammelalbum in der Truhe:** Gruppen Garten, Hof, Selten, Tiere, Jahreszeiten mit „x von y gefunden“; gefundene mit Bild und Name, offene als Silhouette mit Name und „Findbar im …“. Kein Countdown, keine Vollständigkeits-Prozente, kein Hinweis auf Verpasstes. Tap-Flächen ≥ 44 pt, Information nicht nur über Farbe.
3. **Deko und Tiere als Sprites:** Sheet `deko` (16 × 24) auf den Deko-Plätzen, Schatten und Leucht-Ebene; Tiere aus `tiere` mit 2 Frames Leerlauf (pingpong, 500 ms) auf freien Plätzen, bei reduzierter Bewegung still. Rückfall auf die bisherige Zeichnung.
4. **Wohnhaus und Bauer als Sprites:** `wohnhaus` (Fenster leuchten abends), `bauer` 4 Richtungen × 4 Frames entlang des Wanderwegs, Animation nur beim Gehen, bei reduzierter Bewegung kein Laufen.
5. **Farbthemen:** 7 Themen nach `docs/farbthemen.json` (Standard, Wald, Herbst, Frost, Meer, Kirschblüte, Pergament hell) und „Passend zur Jahreszeit“, nur Oberfläche (nicht die Hof-Grafik), WCAG AA mit Test aller Paare, kombinierbar mit „Gut unterscheidbar“, Auswahl in Fortschritt → Darstellung mit Vorschau.

**Nicht in v8b:** Freischaltungen (v9, Entscheidung 7 offen), umherlaufende Tiere, Wetter-Partikel, Gebäude-Animationen, Regeländerungen, Flutter.

</details>

<details><summary>Arbeitsliste v8a (erledigt, 8.0.0 auf main)</summary>

Grundlage: `docs/pixel-styleguide-stil-b.md` (Abschnitte 2, 3, 6, 7, 8), Leitfaden 5.4, `art/platzhalter/README.md`. Entwickelt auf Branch `v8a`, nach Freigabe als 8.0.0 nach `main` gemergt und auf GitHub Pages veröffentlicht; Selbsttest und Usability-Test laufen auf v8a. Regeln, Stärke, XP, Funde und Graduierung bleiben unverändert.

**Muss (H)**
1. **Sprite-System:** Loader für Aseprite-JSON (Array) + PNG mit Ebenen base/glow/shadow, Frame-Tags, `meta.anchor`, `meta.platzhalter` (`src/sheets.js`). Build kopiert die Exporte nach `public/sprites/` (`tools/sprites.js`, Quelle `art/src/` vor `art/platzhalter/`); der Service Worker cached sie. Fehlt eine Datei: Rückfall auf den bisherigen Zeichencode. Reihenfolge: Boden → Schatten (eine Farbe, 30 %, nachts aus) → base nach Fußpunkt-y → Tönung (multiplizieren) → glow (addieren); kein Glätten.
2. **Ganzzahlige Skalierung:** Szene logisch 256 × 160, nur 1×/2×/3× in CSS-Pixeln, Canvas = CSS-Größe × devicePixelRatio. iPhone kompakt 1:1 (256 × 160 pt). Antippen öffnet die Großansicht (größter ganzzahliger Faktor, verschiebbar, Schließen 44 pt).
3. **Gebäude je Fähigkeit:** `skill.buildingType` (muehle, archiv, gewaechshaus, schmiede, gemeinschaftshaus, musikpavillon, backhaus, kontor, scheune), Migration nach Symbol, Auswahl als Raster mit Namen (≥ 44 pt). Ausbaustufe 1–2 → 1, 3–5 → 2, 6–9 → 3, ab 10 → 4 (`LAG.buildingStage`).
4. **Pflanzen und Beete:** `habit.plantType` (beere, blume, kuerbis, baeumchen), Wachstumsstufen keim … ausgewachsen + gemeistert (`LAG.plantFrame`). Beete 48 × 16 nach Style-Guide 2, bis zu 3 Pflanzen je Beet.
5. **Hof als Karte:** `public/sprites/hof-karte.json` mit Plätzen und Zonen, Streuung per festem Seed. Statische Ebenen nur bei Änderung neu zeichnen.

**Sollte (M):** Stufe-4-Gebäude, Gewächshaus und Schmiede leuchten abends (glow). Hinweis „Vorläufige Grafiken“ in den Einstellungen, solange `meta.platzhalter` gilt.

**Nacharbeit v8a.1:** Kompakte Szene ohne Seitenstreifen (logische Breite = floor(verfügbare Breite / Faktor), Kern 256 × 160 mittig, Ränder nur Natur aus den Randzonen der Karte); Großansicht mit dem größten Faktor, bei dem die Höhe passt (iPhone 3×), verschiebbar, Hinweis „Zum Umsehen wischen“.

**Nicht in v8a:** Truhengegenstände (Paket 3), Farbthemen, Figuren, Tiere, neue Wetter-Partikel, Flutter.

</details>

## Prüfen vor dem Push

- `npm test` grün (68 bestehende + 12 v8a- + 15 v8b- + 10 v8c-Tests).
- `node tools/ux/screenshots-v8a.js` (bei laufendem `npm start`): Szene genau 256 × 160 pt, keine verschwommenen Pixel, erster Haken ohne Scrollen (v7: 468 pt). Screenshots unter `docs/screenshots-v8a/`.
- `node tools/ux/screenshots-v8c.js` (bei laufendem `npm start`): Messwerte gegen die Ziele aus `docs/ux-verschlankung-v8c.md`, Screenshots unter `docs/screenshots-v8c/`; `tools/ux/aufgaben-v8c.js`: alle Aufgaben des Testleitfadens.
- `node tools/ux/screenshots-v8b.js`: Hof Tag/Abend mit Deko, Tieren, Wohnhaus und Bauer, Sammelalbum, alle 7 Themen und „Jahreszeit“ unter `docs/screenshots-v8b/`.
- Alle 8 Aufgaben aus `docs/ux-testleitfaden-v6.md` weiter lösbar; v7-Daten werden migriert (nur Gebäude- und Pflanzentyp kommen dazu), v8-Exporte laden unverändert.

## Arbeitsweise

- Kleine, thematische Commits. Vor dem Push auf `main` Lars fragen (danach aktualisiert sich die App auf seinem iPhone).
- Zum Schluss je Version eine Zusammenfassung (v8c: `docs/V8C-ZUSAMMENFASSUNG.md`): was umgesetzt ist (Muss/Sollte), Testanzahl, Messwerte (Szenengröße, erster Haken), Abweichungen in `docs/ABWEICHUNGEN.md` (v8c), offene Punkte. Checkliste nicht selbst ausfüllen.
- Keine Gesundheitsversprechen in App-Texten, keine fremden Markennamen.
