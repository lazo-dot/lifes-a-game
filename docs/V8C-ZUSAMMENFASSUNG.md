# Prototyp v8c – Ruhiger Bildschirm (8.2.0)

Branch `v8c`, noch nicht auf `main` (vor dem Push auf main fragt Claude Code nach). Grundlage: `docs/ux-verschlankung-v8c.md`, Vorschau `docs/vorschau-v8c-heute.png`, `docs/farbthemen.json` (akzente).

Spielregeln, Speicherschema 4 und Daten sind unverändert. Neu ist nur das optionale Feld `accent` neben `theme`.

## Umgesetzt (Muss)

| Nr. | Punkt | Umsetzung |
|---|---|---|
| 8.1.1 | Kontrast-Nachtrag | Leerer Abhak-Kasten: Rand in `--text-soft`, ≥ 3:1 in allen Themen. Die Haken-Andeutung ist ebenfalls `--text-soft`, aber gedämpft (Abweichung 1). Titel-Schatten in Pergament ohne dunkle Umrandung. Test für den Nicht-Text-Kontrast im Ruhezustand. |
| H1 | Info-Blatt | Eine Komponente `src/sheet.js`: geht von unten auf, mit Ziehgriff. Schließt per Tippen daneben, Wischen nach unten (> 70 px), Escape oder „Schließen“ (88 × 44 pt). `role="dialog"`, `aria-modal`, `aria-labelledby`. Der Fokus geht auf den Titel, bleibt im Blatt und kehrt danach zum Auslöser zurück. Bei reduzierter Bewegung ohne Animation. |
| H2 | Kompakte Karten | Haken, Titel, Kontextzeile (Uhrzeit · Anker bzw. Wochenstand), Abzeichen (Pflanze mit %, Flamme nur bei aktiver Serie), „Mini“. Antippen der Karte öffnet das Info-Blatt: Anker, Rhythmus, Pflanze mit Stärke und „Tag x von etwa 66“, Serie mit Regentagen, Fähigkeit mit XP, Monats- bzw. Wochenzähler, Jahr, Mini, Erinnerung und Stärkebalken. Dazu die Knöpfe Bearbeiten, Kalender, Pausieren bzw. Fortsetzen und Löschen. Die Bestätigung nach „Mini“ nennt den Mini-Text. Die Liste in „Gewohnheiten“ ist genauso kompakt (ohne Haken). |
| H3 | Erklärungen hinter „?“ | 14 Erklärungen in `src/hilfe.js`, jede ≤ 60 Wörter (Test). Das „?“ ist 44 × 44 pt mit `aria-label` „Erklärung: …“. Beim ersten Besuch steht jede Erklärung einmal offen, gemerkt in `localStorage` (`lag:erklaert`). |
| H4 | Nachtragen | Eine Zeile je Tag: „Gestern offen: … [Eintragen]“, darunter „Nachtragen zählt voll · mehr“. Ohne offenen Tag gibt es keinen Block. Das Blatt bietet „Erledigt“, „Mini: …“ und, wenn möglich, die Extra-Runde. |
| H5 | Wilma | Ein Hinweis zur Zeit, Vorrang nach `LAGHilfe.pickHint`: Nachtrag, Check-in, Meilenstein (erste Woche, neuer Monat, Gemeistert, Erinnerung abschalten, Installieren), Hofspruch. Jeder Hinweis hat seine Knöpfe. Meilenstein und Check-in sind keine eigenen Kästen mehr. |
| H6 | To-dos | „+ To-do“ öffnet ein Blatt, nur der Titel ist Pflicht. Aufwand, Fähigkeit und Datum stehen unter „Mehr“. Die Zeile zeigt Titel und Datum; Antippen zeigt Fähigkeit, XP und Datum. |
| H7 | Einstellungen | Eigener Bildschirm über das Zahnrad (44 pt). Abschnitte: Darstellung (Thema, Akzent, Schriftgröße, Schriftart, Farben), Ton, Daten & Sicherung, Beta-Zahlen, Über die App (Version, Vorläufige Grafiken, Speicherhinweis, Installations-Tipp). Musik und Effekte sind aus der Kopfzeile verschwunden; auf dem Hof bleibt ein Lautsprecher-Knopf. Die Fußzeile entfällt. |
| H8 | Fortschritt und Truhe | Fortschritt: Level, Fähigkeiten (Antippen zeigt den Verlauf der letzten 30 Tage), Erntekalender mit Kurzlegende, Monatsrückblick als Abzeichen, Gemeistert, jeweils mit „?“. Truhe: Funde, „Auf dem Hof“, Sammelalbum mit eingeklappten Gruppen (die erste offen), „Wie funktionieren Funde?“ als Info-Blatt. Die Liste der findbaren Gegenstände entfällt. |
| H9 | Schrift und Akzent | Drei Ebenen: Titel (Pixel-Schrift, Akzentfarbe), Inhalt (`text`), Kontext (`.ctx`, kleiner, `text-soft`). Zahlen erscheinen als Abzeichen mit Symbol. Die Akzentfarbe `--accent` ersetzt `wood-lt` in allen 28 Textstellen (Überschriften, Anker, aktive Tabs, Hervorhebungen). Die sieben Werte stammen aus `farbthemen.json`, mit hellen Werten für Pergament. Auswahl unter Einstellungen → Darstellung mit „Aa“-Vorschau. |

Text-Inventar: `docs/text-inventar-v8c.md`. Wörtlich doppelt und deshalb entfallen sind nur:
- die Zwischenüberschrift „Gewohnheiten“ (steht als Tab),
- „Keine offenen To-dos.“ („To-dos · 0“),
- die Listen der findbaren Gegenstände (stehen im Album).

Ein Text wurde gekürzt, siehe Abweichung 2.

## Tests

`npm test`: **105 von 105 grün** (68 bestehende + 12 v8a + 15 v8b + 10 v8c).

Die v8c-Tests:
- **Info-Blatt (4 Tests mit einem kleinen Ersatz-DOM):**
  - Öffnen mit Rolle, Titel und Fokus.
  - Schließen auf vier Wegen, mit Fokus zurück zum Auslöser.
  - Kurzes Ziehen schließt nicht, Tab hält den Fokus im Blatt.
  - Ist der Auslöser nach dem Neuzeichnen weg, landet der Fokus am Ersatz-Element; Ersetzen eines Blatts behält den ersten Auslöser; bei reduzierter Bewegung keine Animation.
- **Erklärungen:** höchstens 60 Wörter, und jede benutzte ID existiert.
- **Wilma:** der Vorrang der Hinweise.
- **Akzentfarben:**
  - Die CSS-Werte entsprechen der JSON.
  - Kontrast ≥ 4,5:1 auf allen fünf Flächen in allen sieben Themen.
- **8.1.1:** Nicht-Text-Kontrast des leeren Abhak-Kastens.
- **Migration:** Ein v8-Export mit `theme` und `accent` lädt unverändert.

Der Testleitfaden ist mit dem Test-Hof weiter vollständig lösbar (`tools/ux/aufgaben-v8c.js`, 12 Uhr):
- Aufgaben 1 bis 8 und Logbuch, zusätzlich „+ To-do“.
- Neue Wege: Bearbeiten und Pausieren über Karte → Info-Blatt, Nachtragen über „Eintragen“.
- Der erste Haken liegt bei 469 pt. Kleiner als 44 pt sind nur die Kalenderkacheln (Ausnahme seit v7).

## Messwerte gegen die Ziele (390 × 844, Test-Hof, 12 Uhr)

Gemessen mit `node tools/ux/screenshots-v8c.js`, für v8.1 mit demselben Skript gegen `main`. Die Zahlen für v8.1 liegen nahe an denen des Konzepts, zum Beispiel 1.430 statt 1.451 Wörter. „Ohne Interaktion“ ist der Dauerzustand, in dem jede Erklärung einmal gesehen ist. Die Spalte „Erstbesuch“ zählt die einmal offenen Erklärungen mit.

| Messgröße | v8.1 | Ziel v8c | v8c | Erstbesuch | |
|---|---|---|---|---|---|
| Wörter auf Heute | 220 | ≤ 100 | **86** | 120 | ✅ (beim ersten Besuch nicht, siehe unten) |
| Gewohnheitskarten im ersten Bildschirm | 2 | ≥ 3 | **3** | – | ✅ |
| Seitenhöhe Heute | 2.311 pt | ≤ 1.400 pt | **1.085 pt** | 1.302 pt | ✅ |
| Seitenhöhe Fortschritt | 4.120 pt | ≤ 2.000 pt | **1.546 pt** | 1.763 pt | ✅ |
| Wörter in allen Tabs | 1.430 | ≤ 700 | **453** | 627 | ✅ |
| Ebenen bis zu jeder Information | – | ≤ 2 | **2** | – | ✅ Info-Blatt; eine Erklärung aus einem Blatt ersetzt das Blatt, öffnet also keine dritte Ebene |
| Erster Haken | 478 pt | gleich oder höher | **469 pt** | 686 pt | ✅ (beim ersten Besuch nicht, siehe unten) |
| Tap-Flächen | ≥ 44 pt | unverändert | ≥ 44 pt | – | ✅ außer Kalenderkacheln (wie bisher) |
| Kontraste | AA | unverändert | AA | – | ✅ Tests, dazu Akzente ≥ 4,98:1 |

Je Tab (v8.1 → v8c):

| Tab | Wörter | Seitenhöhe | Bedienelemente | Erklärtexte ≥ 8 Wörter |
|---|---|---|---|---|
| Heute | 220 → 86 | 2.311 → 1.085 pt | 22 → 21 | 4 → 2 |
| Gewohnheiten | 328 → 63 | 2.868 → 931 pt | 37 → 13 | 2 → 0 |
| Logbuch | 110 → 62 | 1.351 → 1.116 pt | 10 → 11 | 2 → 1 |
| Fortschritt | 403 → 103 | 4.120 → 1.546 pt | 32 → 15 | 9 → 1 |
| Truhe | 369 → 139 | 3.046 → 1.541 pt | 48 → 54 | 2 → 0 |
| **Summe** | **1.430 → 453** | | **149 → 114** | **19 → 4** |

**Verfehlt nur beim ersten Besuch:** Wörter auf Heute (120) und erster Haken (686 pt). Beim allerersten Öffnen steht die Erklärung zu „Heute“ einmal offen über der Liste (Regel 3). Nach „Verstanden“ oder dem ersten Tab-Wechsel gelten die Dauerwerte.

**Truhe mit mehr Bedienelementen (54):** Das Sammelalbum hat 42 antippbare Kacheln und 5 Gruppen-Knöpfe. Die Gruppen sind eingeklappt, gezählt wird aber nur die offene erste Gruppe. Die Liste der findbaren Gegenstände ist dafür weg.

Info-Blatt (Messung im Browser):
- `role="dialog"`, Fokus auf dem Titel, Escape schließt und gibt den Fokus an die Karte zurück.
- Das Blatt einer Gewohnheit ist 465 pt hoch, die Erklärung „Heute“ hat 32 Wörter.

Screenshots in `docs/screenshots-v8c/`:
- `tab-*.png`: alle fünf Tabs als ganze Seite (die Tab-Leiste erscheint dabei mitten im Bild).
- `info-blatt.png`, `erklaerung-blatt.png`, `nachtragen-blatt.png`
- `einstellungen.png`, `einstellungen-unten.png`
- `akzent-mint.png`, `akzent-himmel.png`, `akzent-rose.png`
- `pergament.png`, `pergament-info-blatt.png`

## Abweichungen

`docs/ABWEICHUNGEN.md`, Abschnitt v8c, Nr. 1–11. Die wichtigsten:
- **Nr. 1:** Gedämpfte Haken-Andeutung.
- **Nr. 2:** Gekürzter Meilenstein-Text.
- **Nr. 5:** Formulare im Info-Blatt.
- **Nr. 6:** Nachtragen und Extra-Runde in einem Blatt.
- **Nr. 10:** Das Funde-Blatt hat 65 Wörter.

## Offene Punkte

- **Echtes Gerät:** Auf einem echten iPhone nicht geprüft: Wischen am Blatt, Safe-Area im Blatt und in den Einstellungen, VoiceOver.
- **Testleitfaden:** Er beschreibt noch die alten Wege. Laut Konzept wird er vor dem Test auf v10 angepasst; bis dahin gelten die Wege oben.
- **Zahnrad im hellen Thema:** Das Symbol ist hell gezeichnet und wirkt auf Pergament blass. Es sollte ein Pergament-Symbol bekommen.
- **Desktop-Ansicht:** Wilma steht dort weiter in der linken Spalte. Nicht gesondert vermessen, das Konzept misst nur 390 pt.
