# Life's a Game – Hinweise für Claude Code

Gamifizierter Habit-Tracker mit To-dos und Logbuch als gemütliche Pixel-Farm. Gewohnheiten wachsen als Pflanzen, Skills als Gebäude. Entwickler: Lars (MacBook Pro M4). Sprache im Projekt: Deutsch (UI, Kommentare dürfen Englisch sein).

## Quellen der Wahrheit

- `docs/habit-tracker-entwicklungsleitfaden.md` – **verbindlich** für Mechaniken, Formeln, Datenmodell und Prinzipien (aktuell v1.3).
- `docs/abgleich-checkliste.md` – Prüfpunkte und Prioritäten; Abschnitt „Ergebnis v4“ und Abschnitt H sind die Arbeitsliste für v5.
- `docs/marketingkonzept.md` – Fair-Play-Versprechen und Kritikpunkte, die die App erfüllen muss (v. a. Abschnitte 4 und 5).

Leitfaden und Checkliste werden im claude.ai-Projekt „Life's a Game“ gepflegt (Koordinations-Chat). **Hier nicht inhaltlich ändern.** Weicht die Umsetzung bewusst ab, die Abweichung mit Grund in `docs/ABWEICHUNGEN.md` eintragen. Lars bringt sie in den Koordinations-Chat, dort wird der Leitfaden angepasst und die neue Fassung nach `docs/` kopiert.

## Unverhandelbare Prinzipien (Kurzfassung, Details im Leitfaden)

1. Nutzer besitzen ihre Ziele – nur anpassbare Vorschläge, keine Normziele.
2. XP ist Feedback, keine Bezahlung – keine Währung, kein Laden, nur Überraschungsfunde (12 %, davon 20 % selten) und garantierte Funde bei Ernte/„Gemeistert“.
3. Serien verzeihen – optional, Regentage (1 pro 7 Termine, max. 2), Reparatur innerhalb 48 h, nach Bruch „X-mal dieses Jahr“ statt „0“.
4. Auslöser statt Erinnerungen – Anker „Nach ___ werde ich ___“ ist Pflicht; Erinnerungen werden ausgeschlichen, Ziel ist „Gemeistert“.
5. Spielaktionen nur nach echten Erledigungen; die Farm schläft 22–6 Uhr.
6. Keine Dark Patterns: keine Countdowns, Schuld-Nachrichten, Verlustmechaniken, bezahlter Serienschutz, kein Confirmshaming.
7. Pflanzen sterben nie – sie wachsen nur langsamer.
8. Daten bleiben lokal, keine Tracking- oder Werbe-SDKs, Export/Import mit einem Tipp.

Jede neue Funktion gegen diese Liste und Leitfaden Abschnitt 7 („Bewusst NICHT umsetzen“) prüfen.

## Ausgangslage

Prototyp v4 wurde im Chat „Programmer“ als Artifact gebaut. Zwei mögliche Quellen:

1. **Bevorzugt:** der Projektordner aus dem Programmer-Chat (Module als einzelne Dateien plus Node-Tests). Lars legt ihn in dieses Repo.
2. **Fallback:** `reference/v4-artifact-bundle.html` – das gebündelte Artifact (eine Datei, ~160 KB). Module darin: `LAG` (Spiellogik), `LAGStore` (IndexedDB), `LAGScene`, `LAGSprites`, `LAGAudio` (prozedurale Klaviermusik + Effekte), `LAGUI`, `LAGDemo` (Demo-Hof). Bei Nutzung zuerst in Dateien zerlegen.

Technik bisher: klassische Skripte mit Namensraum, kein Build-Schritt, läuft per Doppelklick und in Node testbar. Wechsel zu ES-Modulen oder einem Build-Tool nur mit klarem Nutzen, dann in `docs/ABWEICHUNGEN.md` begründen.

## Architekturregeln

- **Spiellogik bleibt UI-frei** (keine DOM-, Canvas- oder Audio-Zugriffe in `LAG`). Sie wird später 1:1 nach Dart (Flutter) portiert.
- **Gespeichert werden nur Eingaben** (Gewohnheiten mit `history`, Logs als Datum→Status-Map, Pausen, Check-ins, Logbuch, Truhe). Stärke, Serien, Regentage, XP, Level und Graduierung werden abgeleitet.
- Formeln exakt nach Leitfaden: Stärke `s = s·(1−0.044) + 0.044·erledigt` pro geplantem Termin; angebrochene Wochen `ceil(N × aktive Tage / 7)`; XP `10 × effort`, Mini-Version 50 %; Level Charakter `100·L^1.5`, Skills `50·L^1.5`.
- Szene: statische Ebenen nur bei Änderung neu zeichnen, Animation und Musik im Hintergrund pausieren, `prefers-reduced-motion` respektieren.

## Arbeitsliste v5 (Priorität aus der Checkliste)

**Muss (H)**
1. Repo-Struktur aufräumen (`src/` je Modul, `tests/`, `docs/`, `public/` mit Manifest, Icons, `sw.js`).
2. Tests: alle Formeln aus Leitfaden 4.1–4.5 und Abschnitt 3 abdecken (Stärke, Wochenziel anteilig, Pausen, Regentage, Reparatur, Serie, XP inkl. Anti-Farming, Level, Graduierung, Ernte einmal pro Stufe). `npm test` muss grün sein, bevor committet wird.
3. Echte PWA: Web-App-Manifest, Service Worker mit Offline-Cache, Hosting unter HTTPS (Vorschlag: GitHub Pages, Alternative Netlify). Ziel: Lars installiert die App über Safari → „Zum Home-Bildschirm“ und nutzt sie offline.

**Sollte (M)**
4. Fundchancen in der App offen anzeigen (Truhe → „Wie Funde entstehen“).
5. Barrierefreiheit: skalierbare Schrift, Symbole zusätzlich zur Farbe (Erntekalender, Status), VoiceOver-/ARIA-Labels, farbenblind-taugliche Palette.
6. Beta-Metriken lokal erfassen und exportierbar machen (Leitfaden 9): gehaltene/gemeisterte Gewohnheiten nach 30/66 Tagen, Mini-Nutzung, Rückkehr nach Serienbruch, Check-in-Quote. Keine Übertragung an Server.
7. Erinnerungen über die installierte PWA prüfen (Web Push auf iOS nur bei installierter App ab iOS 16.4). Wenn ohne Server nicht sinnvoll machbar: dokumentieren und für Flutter vormerken.

**Kann (N)**
8. Schrittweise Freischaltung von Inhalten über die ersten Wochen.
9. Teilbare Karten (Woche, Erntekalender, Gemeistert) als Bild.

## Arbeitsweise

- Kleine, thematische Commits; vor jedem Commit Tests laufen lassen.
- Nach Abschluss von v5: `docs/abgleich-checkliste.md` **nicht** selbst ausfüllen, sondern eine kurze Zusammenfassung in `docs/V5-ZUSAMMENFASSUNG.md` schreiben (umgesetzt, offen, Abweichungen). Der Abgleich passiert im Koordinations-Chat.
- Keine Gesundheitsversprechen in Texten der App (keine „heilt“, „gegen Stress/Depression“).
- Keine fremden Markennamen (z. B. Stardew Valley) in App-Texten, Metadaten oder Dateinamen für die Auslieferung.
