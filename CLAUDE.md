# Life's a Game – Hinweise für Claude Code

Gamifizierter Habit-Tracker mit To-dos und Logbuch als gemütliche Pixel-Farm. Gewohnheiten wachsen als Pflanzen, Skills als Gebäude. Entwickler: Lars (MacBook Pro M4). Sprache im Projekt: Deutsch (UI, Kommentare dürfen Englisch sein). Aktueller Stand: Prototyp v6 (installierbare PWA, GitHub Pages). **Nächstes Ziel: Prototyp v7 – Bedienbarkeit.**

## Quellen der Wahrheit

- `docs/habit-tracker-entwicklungsleitfaden.md` – **verbindlich** für Mechaniken, Formeln, Datenmodell und Prinzipien (aktuell v1.6).
- `docs/ux-heuristische-evaluation-v6.md` – **Grundlage für v7** (Funde U1–U18 mit Empfehlungen).
- `docs/ux-testleitfaden-v6.md` – der Usability-Test, der nach v7 läuft; Aufgaben dort müssen weiter funktionieren.
- `docs/abgleich-checkliste.md`, `docs/simulation-*.md`, `docs/marketingkonzept.md` – Hintergrund.

Leitfaden, Checkliste und Berichte werden im claude.ai-Projekt „Life's a Game“ gepflegt (Koordinations-Chat). **Hier nicht inhaltlich ändern.** Bewusste Abweichungen mit Grund in `docs/ABWEICHUNGEN.md` eintragen (Abschnitt „v7“).

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

- `src/logic.js` bleibt UI-frei. **v7 ändert keine Spielregeln** – Logik und bestehende Tests bleiben inhaltlich unverändert (nur Hilfsfunktionen ergänzen, falls nötig, mit Tests).
- Gespeichert werden nur Eingaben; das Speicherschema bleibt gleich. Lars' Selbsttest-Daten müssen das Update unverändert überstehen.
- Klassische Skripte, Kopier-Build nach `dist/`, kein Bundler. `npm test` grün vor jedem Commit.

## Arbeitsliste v7 – Bedienbarkeit (Funde aus `docs/ux-heuristische-evaluation-v6.md`)

Referenzgerät: iPhone, 390 × 844 pt, Safari und als installierte App. Prüfen mit `npm start` und den Browser-Werkzeugen auf dieser Größe, zusätzlich auf Desktop-Breite (dort darf das bisherige Layout bleiben).

**Muss (H)**
1. **U1 – Abhaken ohne Scrollen.** Auf schmalen Bildschirmen ist der erste Haken im Tab „Heute“ ohne Scrollen sichtbar. Vorschlag: Tab-Leiste fest unten (Symbol + kurzer Text, Safe Area beachten), Hof-Szene kompakt oben, Erfahrung und Fähigkeiten in den Tab „Fortschritt“ oder einklappbar. Wilma bleibt erreichbar, aber nicht vor der Liste. Damit erledigt sich U15 (Tabs in zwei Zeilen).
2. **U17 – Keine Information nur im Tooltip.** Alles, was heute nur über `title` erklärt wird (Regentage, Kalenderkacheln inkl. „nachgetragen“), lässt sich antippen: kleines Info-Feld bzw. bei Kalenderkacheln Datum + Status. `title` darf zusätzlich bleiben.
3. **U8/U9 – Regentag und Nachtragen verständlich.** Wenn ein Tag mit verbrauchtem Regentag nachgetragen wird, sagt die App das: „Dein Regentag ist wieder frei.“ (Die Logik leitet das bereits ab – prüfen und per Test absichern.) Im Bereich „Gestern und vorgestern“ einen Satz ergänzen, dass Nachtragen einen Regentag zurückgibt. „Nachgeholt“ in der Oberfläche einheitlich „Extra-Runde“ nennen; Kalenderlegende mit einem kurzen Satz je Zustand.
4. **U12/U13 – Tap-Flächen und Haken.** Alle Bedienelemente mindestens 44 × 44 pt (Haken, Mini, To-do-Löschen, Kalender-Pfeile, Chips). Der Haken ist im Ruhezustand als Haken-Feld erkennbar (z. B. Haken-Symbol gedimmt); Mini als gleichwertige zweite Option daneben. Löschen-× mit Abstand zum Haken.

**Sollte (M)**
5. **U3** Zahlen auf der Heute-Karte mit Kurztext statt nur Symbol („90 in Folge“, „2 Regentage“).
6. **U4/U5/U6 Wortwahl:** Kopfzeile „1. November · Herbst“ statt „Tag 1“; ab Tag 66 „Tag 93 · die üblichen 66 Tage sind geschafft“; „Noch 3× Dehnen bis Körper Stufe 2“ statt „Einheiten“.
7. **U11** Schalter „Erinnerung“ heißt bis zur Flutter-Version „Wilma erinnert in der App“ (mit einem Satz Erklärung).
8. **U10** Versionsanzeige aus `package.json`; `package.json` auf 7.0.0.
9. **U2** Hinweise (Toasts) unten über der Tab-Leiste, verdecken keine Bedienelemente.

**Kann (N)**
10. **U14** Anlegen-Formular: Schritte 5–6 (Fähigkeit, Aufwand, Optionen) einklappbar mit sinnvollen Vorgaben, damit das Formular kürzer wirkt. Keine Pflichtfelder entfernen.
11. **U16** Option „Lesbare Schrift“ unter Darstellung: Fließtext in einer gut lesbaren Systemschrift, Überschriften und Zahlen bleiben Pixel-Schrift.

**Nicht in v7:** Spielregeln, neue Mechaniken (Etappen-Weg, Knospe, Tagesrhythmus, Freischaltungen, Vorlagen-Ausbau), Sprite-Sheets/Grafikstil – das wird nach Selbsttest und Usability-Test entschieden.

## Prüfen vor dem Push

- `npm test` grün; Simulation muss nicht neu laufen (Regeln unverändert).
- `tools/ux/testhof.js` erzeugt weiterhin einen gültigen Test-Hof; alle 8 Aufgaben aus `docs/ux-testleitfaden-v6.md` sind in v7 lösbar.
- Auf 390 × 844: erster Haken ohne Scrollen sichtbar; keine Tap-Fläche unter 44 pt (kurz messen, z. B. per Skript in den DevTools).
- Bestehende v6-Daten laden unverändert.

## Arbeitsweise

- Kleine, thematische Commits. Vor dem Push auf `main` Lars fragen (danach aktualisiert sich die App auf seinem iPhone).
- Zum Schluss `docs/V7-ZUSAMMENFASSUNG.md`: je Fund U… umgesetzt / teilweise / nicht, mit kurzer Begründung; Vorher/Nachher der Position des ersten Hakens und der kleinsten Tap-Fläche; Abweichungen in `docs/ABWEICHUNGEN.md` (v7). Checkliste nicht selbst ausfüllen.
- Keine Gesundheitsversprechen in App-Texten, keine fremden Markennamen.
