# Prototyp v9.1 – Wege finden (9.1.0)

Branch `v9`, **nicht auf `main`** (v9 und v9.1 werden gemeinsam gemergt, erst nach Lars' Freigabe). Vorschau: https://lazo-dot.github.io/lifes-a-game/preview/ (sobald der Branch gepusht ist).

Grundlage: `docs/auftraege/v9-1.md`, Befund aus der Hof-Testrunde P1 (`docs/testrunde-ergebnisse.md`: Abhaken und Ändern „mit Umweg“, Pausieren 3/7, „zugänglichere Tooltips“). Entwurf mit Screenshots in `docs/entwurf-v9-1/` (390 pt, Standard und Pergament), freigegeben am 25.11.2026. Keine Regeländerung, Speicherschema 4, bestehende Tests inhaltlich unverändert, Textbudget aus v8c eingehalten.

## Was umgesetzt ist

| Punkt | Umsetzung |
|---|---|
| 1 Info-Blatt | Ganz oben eine Knopfreihe **Erledigt · Mini** (Mini-Version als zweite Zeile) und **Bearbeiten · Pausieren**. Ist heute schon eingetragen: breiter Knopf „✓ Heute erledigt · Rückgängig“ (bzw. „Mini“). Pausiert: „Fortsetzen“. An freien Tagen nur Bearbeiten · Pausieren mit „Heute frei“. Darunter die Kurzinfo (Anker, Pflanze · Stärke mit Balken). Serie, Alter, Fähigkeit, Gezählt, Mini, Erinnerung, Kalender und Löschen stehen unter „Mehr“ (aufklappbar, keine dritte Ebene). Erledigt, Mini und Rückgängig schließen das Blatt, damit die Rückmeldung am Beet sichtbar ist. |
| 2 Karten | Rechts an jeder Gewohnheitskarte ein „›“. Die ganze Karte öffnet das Info-Blatt; Abhak-Kasten und „Mini“ bleiben eigene Ziele. Für Tastatur und Screenreader bleibt der Titel-Knopf das Ziel. |
| 3 Wilma | Hinweise mit Ziel sind eine Zeile: Porträt, ein Satz, „›“, die ganze Zeile öffnet das Blatt. Nachtrag („Gestern noch offen: Spazieren gehen ›“ → Nachtragen), Check-in („Kurzer Check-in für heute ›“), Meilensteine (eigenes Blatt mit vollem Satz und den bisherigen Knöpfen). Keine Knöpfe mehr in der Karte; nur Sprüche ohne Ziel behalten „Mehr“. |
| 4 „?“ | Gleicher Rahmen wie die Zweitknöpfe (`.btn.alt`), 44 × 44 pt. Beim ersten Besuch eines Tabs einmal offen, wie bisher. Die Erklärung „Heute“ nennt das Abhaken, Bearbeiten und Pausieren im Info-Blatt (32 Wörter). |
| 5 Anlegen | Unter „Wann genau?“ der Platzhalter „z. B. dem ersten Kaffee“ (vor dem Feld steht schon „Nach“) und der Satz „Eine Routine, keine Uhrzeit: z. B. „nach dem ersten Kaffee“. Die Uhrzeit hat ein eigenes Feld.“ Das Uhrzeit-Feld steht beschriftet in einer eigenen Zeile. |

Nebenbei behoben: Ein Toast konnte die Knopfreihe eines frisch geöffneten Blatts bis zu 4 s verdecken (liegt jetzt dahinter). Ein Fehler aus v9: Die Listener für Drehen und Fenstergröße waren in einen Kommentar gerutscht, die Szene passte sich beim Drehen nicht an.

## Tests

**125 grün** (122 aus v9, unverändert, + 3 in `tests/v91.test.js`): kurze Zeile `zeile` für Nachtrag, Check-in, Entdeckung und Meilenstein bei unverändertem vollem Satz `text`; Sprüche ohne Zeile; Erklärung „Heute“ nennt Abhaken und Pausieren und bleibt unter 60 Wörtern.

`node tools/ux/aufgaben-v8c.js`: alle Aufgaben lösbar, zusätzlich über das Info-Blatt: **2b** Abhaken und Rückgängig im Blatt, **4b** Bearbeiten über die Karte in „Gewohnheiten“, **7b** Pausieren von „Heute“ aus, jeweils mit Prüfung „ohne Scrollen im Bild, nicht verdeckt“.

## Abnahme (`npm run abnahme`, Abschnitte `immer` + `v9` + `v9.1`): grün

| Prüfung | vorher (9.0.0) | v9.1 |
|---|---|---|
| `erster_haken_max_pt` (≤ 450, vorher ≤ 480) | 390: 478 · 430: 468 | 390: 440 · 430: 430 |
| `erster_haken_mit_meldung_max_pt` (≤ 450) | 390: 430 · 430: 421 | 390: 430 · 430: 421 |
| `info_blatt_aktionen_ohne_scrollen` (neu) | Bearbeiten/Pausieren erst nach Scrollen, kein Abhaken | 390: Erledigt/Mini bis 579 pt, Bearbeiten/Pausieren bis 635 pt · 430: bis 723 pt |
| `tapflaeche_min_pt` (≥ 44) | 44 (191 Elemente) | 44 (194 Elemente) |
| `kontrast_text_min` / `kontrast_nichttext_min` | 5,08 / 5,21 | 5,08 / 5,21 |
| `woerter_max.heute` (≤ 100) | 90 | 85 |
| `seitenhoehe_max_pt.heute` (≤ 1300) | 390: 1202 · 430: 1183 | 390: 1164 · 430: 1145 |
| `erklaerung_woerter_max` (≤ 60) | 54 | 54 |
| `konsolenfehler` | 0 | 0 |

Bericht: `docs/abnahme-ergebnis.md`. Screenshots: `docs/screenshots/`, Entwurf: `docs/entwurf-v9-1/`.

## Abweichungen

`docs/ABWEICHUNGEN.md`, Abschnitt v9.1 (9 Punkte), u. a.: Abhaken im Blatt nur, wenn die Gewohnheit heute ansteht; ganze Karte statt nur Titelzeile als Tap-Fläche; lange Namen brechen in Wilmas Zeile um (Vorschlag `wilma_zeilen_max: 2`); „Später“ beim Check-in-Hinweis entfällt; Platzhalter ohne „nach“; Toast hinter offenem Blatt; Fehler aus v9 (Drehen) behoben.

## Offen

- **Auf dem iPhone prüfen** (Vorschau): Info-Blatt mit Knopfreihe, Antippen der Karte neben dem Haken (kein versehentliches Öffnen), Wilmas Zeile mit langem Namen, Drehen.
- **Leitfaden 6 (Info-Blatt)**: neue Reihenfolge ggf. beschreiben (Koordinations-Chat).
- **Abnahme-Vorschlag** `wilma_zeilen_max: 2` bei 390 pt (Abweichung 4).
- **Idee:** Steht im Anker eine Uhrzeit („um 8 Uhr“), freundlich auf das Uhrzeit-Feld hinweisen (Abweichung 6).
- Nächste Testrunde: Aufgaben 2, 4 und 7 mit P1 wiederholen.
