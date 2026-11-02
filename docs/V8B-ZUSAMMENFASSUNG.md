# Prototyp v8b – Truhe und Personalisierung (8.1.0)

Branch `v8b`, noch nicht auf `main` (vor dem Push auf main fragt Claude Code nach). Grundlage: Leitfaden v1.8 (4.4, 5.4), Style-Guide Paket 3 und Staffelung, `art/platzhalter/README.md`.

Spielregeln unverändert: Stärke, XP, Fundchance (12 %, davon 20 % selten), Regentage, Nachtragen und Graduierung sind nicht angefasst. Speicherschema bleibt 4; neu ist nur das optionale Feld `theme`.

## Umgesetzt (Muss)

| Nr. | Punkt | Umsetzung |
|---|---|---|
| H1 | Gegenstände aus dem Katalog | `ITEMS` in `src/logic.js`: 37 Deko + 5 Tiere mit Name, Gruppe, selten, Jahreszeit, Tier; die 12 bisherigen IDs unverändert. Ein Test vergleicht Feld für Feld mit `deko-katalog.json` und prüft die Frames in den Sheets. Saisonale Gegenstände nur in ihrer Jahreszeit findbar (`LAG.seasonKey`, wie die Jahreszeit in der Kopfzeile). Ziehung als reine Funktion: Fund und Seltenheit wie bisher, dann gleichverteilt aus `LAG.findable(tag, selten)`. Auch Ernte und „Gemeistert“ ziehen nur Findbares. Die Fundchancen-Anzeige listet die jetzt findbaren Gegenstände und erklärt die Jahreszeit-Regel. |
| H2 | Sammelalbum | In der Truhe unter den Funden: Gruppen Garten (9), Hof (14), Selten (6), Tiere (5), Jahreszeiten (8), jeweils „x von y gefunden“. Gefundene mit Bild und Name, offene als graue Silhouette mit gestricheltem Rand, Name und bei saisonalen „Findbar im …“. Antippen zeigt Details (selten/häufig, wie viele in der Truhe bzw. auf dem Hof). Keine Prozente, keine Fristen, kein „verpasst“. |
| H3 | Deko und Tiere als Sprites | Deko aus Sheet `deko` (16 × 24, Fußpunkt unten Mitte) auf den Deko-Plätzen, mit Schatten und abends Leucht-Ebene (Laterne, Kürbislaterne). Tiere aus `tiere` an freien Plätzen der Karte (Ente im Teich), 2 Frames pingpong à 500 ms, je Tier versetzt. Bei reduzierter Bewegung stehen sie still. Fehlt ein Sheet: bisherige Zeichnung. |
| H4 | Wohnhaus und Bauer | Wohnhaus aus `wohnhaus`, Fenster leuchten abends. Bauer aus `bauer`, läuft den Wanderweg, Richtung (unten/oben/links/rechts) nach Bewegung, 4 Frames à 150 ms nur beim Gehen; bei reduzierter Bewegung steht er. Bauer und Tiere werden nach Fußpunkt sortiert. |
| H5 | Farbthemen | 7 Themen nach `docs/farbthemen.json` (Standard, Wald, Herbst, Frost, Meer, Kirschblüte, Pergament hell) und „Passend zur Jahreszeit“ (Frühling Kirschblüte, Sommer Meer, Herbst Herbst, Winter Frost), als CSS-Token (`[data-theme]`). Ursprünglich waren 5 Themen beauftragt; auf Wunsch von Lars nach der Vorgabe aus dem Koordinations-Chat umgestellt. Die Hof-Grafik bleibt. „Gut unterscheidbar“ bleibt eigene Einstellung und kombiniert sich mit jedem Thema (im hellen Thema mit eigener dunkler Variante). Auswahl in Fortschritt → Darstellung mit kleiner Vorschau (Hintergrund, Fläche, Holz); bei „Jahreszeit“ steht das aktuelle Thema dabei. Die Statusleisten-Farbe folgt dem Thema. |

Sollte-Punkte gab es in diesem Auftrag nicht.

## Tests

`npm test`: **95 von 95 grün** (68 bestehende + 12 v8a + 15 v8b). Bestehende Tests sind unverändert (Abweichung 3).

v8b-Tests: Katalog = JSON, alte 12 IDs, Frames in den Sheets und Gruppengrößen, Jahreszeit an Grenztagen (28.02./01.03., 31.05./01.06., 31.08./01.09., 30.11./01.12., 29.02.), saisonale Filter, Ziehung (Reihenfolge der Entscheidungen, Gleichverteilung, 50 000 Ziehungen: 12 % Funde, 20 % selten, nichts außerhalb der Jahreszeit), Fundchancen-Anzeige, Sammelalbum, **Migration eines v8-Exports mit Truhe und platzierten Gegenständen (lädt unverändert)**, Frame-Auswahl (forward/pingpong), Bauer 4 × 4, Hof-Karte, Farbthemen = `farbthemen.json`, Thema nach Jahreszeit, die Kontrastpaare aus der JSON, Kontrast aller Paare in der App.

## Messwerte (Headless-Chrome, 390 × 844, dpr 3, Test-Hof)

- Szene: 3 Bildpunkte je Szenen-Pixel (1×, 160 pt hoch), alle vier Sheets (`deko`, `tiere`, `wohnhaus`, `bauer`) geladen
- Erster Haken: **478 pt, ohne Scrollen sichtbar** (wie v8a), in allen sieben Themen und „Jahreszeit“ gleich
- Sammelalbum: 42 Kacheln, kleinste 103 × 90 pt (≥ 44 pt)
- Testleitfaden mit dem Test-Hof (12 Uhr): Aufgaben 1–7, 8 „Gebäude ändern“ (3116 Pixel geändert) und Logbuch lösbar. Kleiner als 44 pt sind nur die Kalenderkacheln (dokumentierte Ausnahme seit v7).
- Bilder unter `docs/screenshots-v8b/`: `hof-tag.png`, `hof-abend.png`, `hof-*-szene-3x.png`, `sammelalbum.png`, `thema-<id>.png` und `thema-<id>-darstellung.png` für alle sieben Themen und `jahreszeit`. Für die Hof-Bilder stellt das Skript sechs Deko-Teile und sechs Tiere auf; der Test-Hof selbst bleibt unverändert.

## Kontrastwerte je Thema (WCAG AA)

Geprüft werden alle Paare aus Text (`--text`, `--text-soft`, `--wood-lt`, `--leaf`, `--leaf-hi`, `--water`, `--rare`, `--repair`) auf allen Flächen (`--panel-dk`, `--panel`, `--panel-2`, `--panel-in`, `--bg-a`) mit ≥ 4,5:1, dazu Knopftext (`--ink-dk` auf `--wood`), `--text` auf `--panel-3`, die Zahl am Tab (Weiß auf `--leaf-dk`), und mit ≥ 3:1 Knopf-Flächen, Fokusrahmen und Haken gegen die Flächen. Jedes Thema einzeln und zusammen mit „Gut unterscheidbar“. Ausgabe: `KONTRAST=1 node tests/v8b.test.js`.

| Thema | kleinster Textkontrast | Text/Fläche | Nebentext/Fläche | Knopftext | kleinster Wert Bedienelemente |
|---|---|---|---|---|---|
| Standard | 4,87 (Wasserblau auf panel-2) | 12,24 | 6,77 | 7,44 | 5,42 |
| Wald | 5,19 (Zahl am Tab) | 12,89 | 7,55 | 8,37 | 6,01 |
| Herbst | 5,59 (Zahl am Tab) | 13,38 | 7,42 | 7,55 | 6,02 |
| Frost | 5,53 (Zahl am Tab) | 13,69 | 7,35 | 9,72 | 7,21 |
| Meer | 5,29 (Zahl am Tab) | 13,61 | 7,63 | 9,88 | 7,47 |
| Kirschblüte | 5,12 (Zahl am Tab) | 14,23 | 7,70 | 9,23 | 7,44 |
| Pergament (hell) | 4,70 (Selten-Lila auf bg-a) | 13,93 | 7,01 | 5,66 | 4,44 (Holz auf bg-a) |

Einzige Änderung am Standardthema: Die Zahl am Tab war mit 4,21:1 knapp unter AA und ist jetzt weiß (Abweichung 7). In Pergament sind Grün, Blau und Orange etwas dunkler als in der JSON, weil sie auch als Schrift dienen (Abweichung 11).

## Abweichungen

`docs/ABWEICHUNGEN.md`, Abschnitt v8b, Nr. 1–11. Die wichtigsten: Katalog fest in `logic.js` mit Abgleich-Test (1), `theme` auf oberster Ebene wie `palette` (5), sieben Themen und „Jahreszeit“ nach `farbthemen.json` (6), Hühner und Ente stehen jetzt auch still (8), Pergament-Statusfarben etwas dunkler (11).

## Offene Punkte

- Auf einem echten iPhone nicht geprüft (Animation, Themen in der installierten App, Statusleisten-Farbe, Pergament bei Tageslicht).
- Pergament: Kalender und einige Schmuckfarben (z. B. Rand seltener Funde) sind auf Dunkel ausgelegt; lesbar, aber nach dem Selbsttest ansehen.
- Die Hof-Bilder zeigen aufgestellte Deko nur mit einem vorbereiteten Hof; im Test-Hof steht nichts.
- Ohne Sheet `tiere` erscheinen Katze, Hase und Igel nicht (nur Rückfall für Huhn und Ente).
- Deko-Plätze unten an den Beeten (y 93) liegen bei hohen Gegenständen leicht über dem Beetrand; nach dem Selbsttest prüfen, ob die Karte angepasst werden soll.
- Umherlaufende Tiere, Freischaltungen und Animationen: v9.
