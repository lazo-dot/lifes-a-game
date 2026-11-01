# Life's a Game – Hinweise für Claude Code

Gamifizierter Habit-Tracker mit To-dos und Logbuch als gemütliche Pixel-Farm. Gewohnheiten wachsen als Pflanzen, Skills als Gebäude. Entwickler: Lars (MacBook Pro M4). Sprache im Projekt: Deutsch (UI, Kommentare dürfen Englisch sein). Aktueller Stand: Prototyp v5 (installierbare PWA, GitHub Pages). **Nächstes Ziel: Prototyp v6.**

## Quellen der Wahrheit

- `docs/habit-tracker-entwicklungsleitfaden.md` – **verbindlich** für Mechaniken, Formeln, Datenmodell und Prinzipien (aktuell **v1.5**; die Tabelle „Änderungen in v1.5“ ist der Kern von v6).
- `docs/simulation-30-tage.md`, `docs/simulation-72-tage.md` – Begründung der v6-Änderungen (Befunde 1 und 8).
- `docs/abgleich-checkliste.md` – Prüfpunkte aller bisherigen Versionen.
- `docs/marketingkonzept.md` – Fair-Play-Versprechen (Abschnitt 4) und Kritikpunkte (Abschnitt 5), die die App erfüllen muss.

Leitfaden, Checkliste und Berichte werden im claude.ai-Projekt „Life's a Game“ gepflegt (Koordinations-Chat). **Hier nicht inhaltlich ändern.** Bewusste Abweichungen mit Grund in `docs/ABWEICHUNGEN.md` eintragen (für v6 neu beginnen, Abschnitt „v6“).

## Unverhandelbare Prinzipien (Kurzfassung, Details im Leitfaden)

1. Nutzer besitzen ihre Ziele – nur anpassbare Vorschläge, keine Normziele.
2. XP ist Feedback, keine Bezahlung – keine Währung, kein Laden, nur Überraschungsfunde (12 %, davon 20 % selten, nur für Eintragungen am selben Tag) und garantierte Funde bei Ernte/„Gemeistert“.
3. Serien verzeihen – optional, Regentage (1 pro 7 Termine, max. 2), Reparatur innerhalb 48 h, nach Bruch „X-mal dieses Jahr“ statt „0“. Verzeihende Mechaniken setzen keine Zähler zurück.
4. Auslöser statt Erinnerungen – Anker „Nach ___ werde ich ___“ ist Pflicht; Erinnerungen werden ausgeschlichen, Ziel ist „Gemeistert“.
5. Spielaktionen nur nach echten Erledigungen; die Farm schläft 22–6 Uhr.
6. Keine Dark Patterns: keine Countdowns, Schuld-Nachrichten, Verlustmechaniken, bezahlter Serienschutz, kein Confirmshaming.
7. Pflanzen sterben nie, „Gemeistert“ wird nie entzogen.
8. Daten bleiben lokal, keine externen Anfragen, Export/Import mit einem Tipp.

## Architekturregeln (unverändert seit v5)

- Spiellogik in `src/logic.js` bleibt UI-frei; sie wird später 1:1 nach Dart portiert.
- Gespeichert werden nur Eingaben; Stärke, Serien, Regentage, XP, Level und Graduierung werden abgeleitet.
- Klassische Skripte mit Namensraum, Kopier-Build nach `dist/`, kein Bundler. `npm test` muss grün sein, bevor committet wird. Der GitHub-Pages-Workflow veröffentlicht bei Push auf `main`.

## Arbeitsliste v6

Lars nutzt v5 gerade im Selbsttest auf dem iPhone. **Seine Daten müssen das Update unverändert überstehen** (gleiches Speicherschema oder saubere Migration, Test dafür).

**Muss (H)**
1. **Nachtragen (Leitfaden 4.3, 4.4, 5.5, Datenmodell `lateLogs`):**
   - Gestern und vorgestern lassen sich als erledigt oder Mini nachtragen (und wieder zurücknehmen); ältere Tage nicht.
   - Nachgetragene Einträge zählen voll für Stärke, Serie, XP und Ernte, würfeln aber keinen Zufallsfund.
   - Im Erntekalender dezent markiert (Muster/Symbol, nicht nur Farbe – Barrierefreiheit).
   - Die „Extra-Runde“ erscheint erst, wenn der Tag nicht nachgetragen wurde; zuerst wird „Gestern doch erledigt? Nachtragen“ angeboten.
   - UI-Ort nach eigenem Ermessen (z. B. Tab „Heute“ → kleiner Bereich „Gestern“), ohne Schuldton.
2. **Erreichbare Graduierung (Leitfaden 4.5):**
   - Ausschleichen-Vorschlag ab Stärke ≥ 0,6 und 12 von 14 geplanten Terminen gehalten (Mini, Regentag, nachgeholt zählen; Wochen-Gewohnheiten: Wochenziel der letzten zwei Wochen erreicht).
   - „Gemeistert“ = erster Tag mit 30 Tagen ohne Erinnerung und ≥ 70 % gehaltenen Terminen in diesen 30 Tagen; bleibt dauerhaft.
   - Regentag und nachgeholt setzen den Zähler `run` nicht mehr auf 0 (bisher `computeHabit`). Prüfen, wo `run` sonst noch genutzt wird.
   - Bereits gemeisterte Gewohnheiten bleiben gemeistert.
3. **Tests:** neue Regeln vollständig abdecken (Nachtragen-Grenzen, kein Fund beim Nachtragen, Graduierung mit 70 %, kein Reset durch Regentag/nachgeholt, Migration bestehender v5-Daten). Bestehende Tests anpassen, wo sie die alten Schwellen prüfen – im Commit begründen.
4. **Simulation gegen v6:** Die Simulation nutzt für Ausschleichen und „Gemeistert“ die Regeln der App (`suggestOff`, `graduated`). Unter v5 ergibt `OPT=backfill node tools/sim/sim72.js 300` null gemeisterte Gewohnheiten. Mit der v6-Logik sollte derselbe Aufruf in die Nähe der Simulationsvariante `backfill,grad` kommen (Referenzlauf im Koordinations-Chat: Personen mit „Gemeistert“ 49 %, „gehalten“ Tag 66 90 %, abgeschaltete Erinnerungen 1,55 je Person). Ergebnis (Kennzahlen „anyGraduated“, „held66“, „remOffPerUser“ gemittelt über Personas) in der Zusammenfassung berichten; deutliche Abweichungen begründen.

**Nicht in v6** (wird nach dem Selbsttest entschieden): Etappen-Weg zu „Gemeistert“, Zwischenstufe „Knospe“/Wochenernte, Tagesrhythmus, Freischaltungen, Saatgut-Liste, mehrere Anker.

## Arbeitsweise

- Kleine, thematische Commits; vor jedem Commit Tests laufen lassen.
- Beta-Zahlen: In `betaMetrics` ergänzen, ab welchem Datum v6 aktiv ist (z. B. Feld `rulesSince`), damit Lars den Selbsttest vor und nach dem Update auseinanderhalten kann.
- Nach Abschluss: `docs/V6-ZUSAMMENFASSUNG.md` (umgesetzt, offen, Abweichungen, Simulationsergebnis). Checkliste nicht selbst ausfüllen – der Abgleich passiert im Koordinations-Chat.
- Keine Gesundheitsversprechen in App-Texten, keine fremden Markennamen in Texten, Metadaten oder Dateinamen.
