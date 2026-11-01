# Prototyp v7 · Zusammenfassung für den Abgleich (Bedienbarkeit)

Stand: 01.11.2026 · umgesetzt mit Claude Code nach Arbeitsliste v7 (CLAUDE.md) und `docs/ux-heuristische-evaluation-v6.md`. Spielregeln, Speicherschema und bestehende Tests sind unverändert. Die Abgleich-Checkliste ist bewusst nicht ausgefüllt.

## Messung auf 390 × 844 pt (Test-Hof aus `tools/ux/testhof.js`)

Gemessen in Headless-Chrome mit mobiler Emulation (Touch, 390 × 844), Tab „Heute“ und alle fünf Tabs. Als Tap-Fläche zählen Knöpfe, Felder, Auswahllisten, Aufklapper und Schalter (bei Schaltern das Label).

| | vorher (v6) | nachher (v7) |
|---|---|---|
| Erster Haken im Tab „Heute“ (Oberkante) | **1.700 pt**, ca. zwei Bildschirmhöhen Scrollen | **468 pt**, ohne Scrollen sichtbar |
| Kleinste Tap-Fläche | **288 × 17 pt** („Wie Funde entstehen“); außerdem To-do-Löschen 23 × 26, Kalender-Pfeile 32 × 32, Haken 34 × 34, Mini 143 × 25 | **81 × 44 pt** („Musik: aus“); keine Fläche unter 44 pt |
| Tap-Flächen unter 44 pt | 68 verschiedene Bedienelemente | 0 (Ausnahme: Kalenderkacheln 14 px, Abweichung v7-1) |

Desktop-Breite (1280 px): bisheriges Layout, erster Haken bei 320 pt.

## Stand je Fund

| Fund | Stand | Kurz |
|---|---|---|
| U1 Abhaken unter dem Falz (3) | **umgesetzt** | Bis 767 px: Tab-Leiste fest unten mit Symbol und Text (Safe Area), kompakte Szene, Erfahrung und Fähigkeiten im Tab „Fortschritt“, Wilma am Ende von „Heute“; Hinweise unter der Liste. 1.700 → 468 pt. |
| U2 Hinweise verdecken Inhalt (1) | **umgesetzt** | Hinweise erscheinen unten über der Tab-Leiste. Die Anzeigedauer ist unverändert. |
| U3 Zahlen nur mit Symbol (2) | **umgesetzt** | „7 in Folge“, „2 Regentage“ auf der Heute-Karte. |
| U4 „Tag 1“ in der Kopfzeile (2) | **umgesetzt** | „1. November · Herbst · Sonntag · Sonnig“. |
| U5 „Tag 93 von etwa 66“ (2) | **umgesetzt** | Ab Tag 67: „Tag 93 · die üblichen 66 Tage sind geschafft“. |
| U6 „Einheiten“ (2) | **umgesetzt** | „Noch 3× „5 Minuten dehnen“ bis Körper Stufe 2“, auch im Hinweis nach dem Abhaken und bei Wilma. |
| U7 Viele eigene Begriffe (2) | **nicht** | Nicht in der Arbeitsliste v7 (Glossar bzw. schrittweise Einführung). Teilweise entschärft durch U3, U9, U17. |
| U8 Regentag und Nachtragen (3) | **umgesetzt** (wie in der Arbeitsliste) | Beim Nachtragen auf einen Regentag: „Dein Regentag ist wieder frei.“ Satz im Bereich „Gestern und vorgestern“, Zeile zeigt „von einem Regentag gerettet“. Per Test abgesichert (`freesRainDay`, auch mit dem Test-Hof). Den Regentag später zu verbrauchen wäre eine Regeländerung (Abweichung v7-6). |
| U9 Ähnliche Zustände (2) | **umgesetzt** | „Nachgeholt“ heißt überall „Extra-Runde“; Kalenderlegende mit einem Satz je Zustand. |
| U10 Falsche Version (1) | **umgesetzt** | Fußzeile „Prototyp v7.0.0“ aus `package.json` (der Build setzt sie ein). |
| U11 Schalter „Erinnerung“ (2) | **umgesetzt** | „Wilma erinnert in der App“ mit einem Satz Erklärung; auch in der Gewohnheitskarte. Der Installationshinweis verspricht keine Erinnerungen mehr. |
| U12 Tap-Flächen (2) | **umgesetzt** | Mindestens 44 × 44 pt auf schmalen Bildschirmen und Touch-Geräten; To-do-Löschen mit Abstand zum Haken. Ausnahme Kalenderkacheln (v7-1). |
| U13 Haken unklar (2) | **umgesetzt** | Haken zeigt im Ruhezustand ein gedimmtes Haken-Symbol; „Mini“ als gleich großes Feld direkt darunter, der Text der Mini-Version steht in der Karte. |
| U14 Langes Formular (2) | **umgesetzt** (Variante „einklappen“) | Schritte 5–6 eingeklappt mit Vorgaben, beim Bearbeiten offen; bei Fehlern klappt der Bereich auf. „Eine Frage pro Bildschirm“ nicht umgesetzt. |
| U15 Tabs in zwei Zeilen (1) | **umgesetzt** | Durch U1 (eine Leiste mit fünf Tabs). |
| U16 Pixel-Schrift für Fließtext (2) | **umgesetzt** (als Option) | Darstellung → Schriftart „Lesbare Schrift“: Fließtext in Systemschrift, Überschriften, Zahlen und Knöpfe bleiben Pixel-Schrift. |
| U17 Erklärungen in Tooltips (3) | **umgesetzt** | Regentage sind antippbar (Info-Feld); Kalenderkachel antippen zeigt Datum und Status inkl. „nachgetragen“; Datumsfeld bei To-dos sichtbar beschriftet. `title` bleibt zusätzlich. |
| U18 Wenige Vorlagen (1) | **nicht** | Vorlagen-Ausbau ist laut CLAUDE.md „Nicht in v7“. |

## Prüfungen

- `npm test`: 68 Tests grün (v6: 65; neu 3 Tests für `freesRainDay` in `tests/v7.test.js`). Logik-Regeln und bestehende Tests unverändert.
- **Testleitfaden:** Alle 8 Aufgaben mit dem frisch erzeugten Test-Hof auf 390 × 844 durchgespielt (nur Taps auf sichtbare Bedienelemente), alle Erfolgskriterien erfüllt: Anlegen mit eigenem Anker, Dehnen erledigt und Lesen als Mini, Lesen für gestern nachgetragen (mit Hinweis zum Regentag), Spazieren auf 2× pro Woche, Kalender gelesen (Kachel angetippt), Gegenstand aufgestellt, Dehnen pausiert, Logbuch gespeichert. Aufgabe 6 nur zwischen 6 und 22 Uhr lösbar (Farm schläft), wie im Leitfaden vermerkt; geprüft mit auf 12 Uhr gestellter Uhr.
- **v6-Daten:** Ein v6-Hof (mit `rulesV6Since`, `lateLogs`, Einstellungen) wird unverändert geladen, keine Migration nötig.
- Desktop-Breite: Layout wie bisher.

## Offen / Hinweise

- Echtes iPhone (Safari und installierte App), VoiceOver und Touch-Gefühl sind nicht geprüft; die Messungen stammen aus der Emulation.
- Der Wechsel zwischen schmalem und breitem Aufbau reagiert auf Größenänderungen des Fensters (z. B. iPad-Split-View); in der Größen-Emulation des eingebauten Browsers kam dieses Ereignis nicht an, auf echten Geräten schon.
- CLAUDE.md nennt den Leitfaden v1.6, im Repo liegt noch v1.5.

## Abweichungen

Siehe [ABWEICHUNGEN.md](ABWEICHUNGEN.md), Abschnitt v7: 1 Kalenderkacheln unter 44 pt · 2 Grenze 767 px und Touch-Geräte · 3 Hinweise unter der Liste · 4 optionale Einstellung `readableFont` · 5 Hilfsfunktion `freesRainDay` · 6 U8 nur als Hinweis.
