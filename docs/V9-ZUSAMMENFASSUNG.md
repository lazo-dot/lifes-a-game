# Prototyp v9 – Hof-Tage und lebendige Welt (9.0.0)

Branch `v9`, **nicht auf `main`** (main ist bis zum 23.11.2026 eingefroren; Merge erst nach Lars' Freigabe). Vorschau: https://lazo-dot.github.io/lifes-a-game/preview/ (Band „Vorschau · v9 · 9.0.0“, eigener Speicher, Daten von main unberührt).

Grundlage: `docs/auftraege/v9.md`, Entwurf `docs/v9-entwurf.md`, Freigabe des Screenshot-Entwurfs `docs/entwurf-v9/freigabe.md` (Bilder in `docs/entwurf-v9/`). Spielregeln (Stärke, XP, Level, Funde 12 %/20 %, Regentage, Nachtragen, Ausschleichen, Graduierung) und Speicherschema 4 sind unverändert. Neue optionale Felder: `hofGesehen`, `effects`.

## Was umgesetzt ist

| Baustein | Umsetzung |
|---|---|
| A Feedback | Kontextzeile beginnt mit dem Anker, Uhrzeit bzw. Wochenstand danach, bricht auf zwei Zeilen um („8 Uhr“ bleibt zusammen). Zahnrad in `--text-soft` des Themas, folgt jedem Themenwechsel. Rand der Eingabefelder in `--text-soft`, Hover-Ring des Abhak-Kastens in `--wood-lt`. `BEKANNT_OFFEN` ist leer, die vier Punkte stehen in `docs/feedback.md` unter „Zugeordnet“. |
| B Hof-Tage | `LAG.hofTage`, `hofTageImJahr`, `ENTDECKUNGEN` (genau 11), `entdeckungen` (mit `erreichtAm` aus den Logs), `markHofGesehen`, `hofEreignisse` (Regenbogen, Erntefest, Glühwürmchen, Winterlaternen). Zählregel: erledigt, Mini, nachgetragen; nicht Extra-Runde, Regentag, To-do, Logbuch, Check-in; mehrere am Tag = 1. |
| B Darstellung | Alle 11 Entdeckungen auf dem Hof (Kern bzw. Randzonen, an der Innenkante angeschnitten sichtbar). Neu Entdecktes funkelt einmal an seiner Stelle (nicht 22–6 Uhr). Wilma: „Neu auf deinem Hof: Steg am Teich ›“ bzw. „… 5 Dinge ›“, einzeilig, die Zeile ist die Tap-Fläche; Vorrang nach Check-in, vor Meilenstein. Info-Blatt mit Bild, Satz, Datum und Ort; Antippen der Stelle in der Großansicht öffnet es auch. Hofchronik im Fortschritt: „19 Hof-Tage · 5 Entdeckungen ›“, Blatt mit Erklärsatz und Liste mit Datum. Keine nächste Schwelle, keine Silhouetten. Kalenderzeile: „N Hof-Tage in <Jahr>“. |
| C Abhaken | Mini: 3 Funken vom Haken zum eigenen Beet, Pflanze wippt (≤ 400 ms). Erledigt: 6 Funken, Wippen, Erde kurz dunkler (≤ 600 ms). Ernte: zusätzlich wächst die Pflanze sichtbar um eine Stufe (≤ 900 ms). Fund: zusätzlich hüpft das Truhen-Symbol im Tab (≤ 900 ms). Nie blockierend, keine Funken, wenn die Szene nicht im Bild ist. Reduzierte Bewegung: nur dunklere Erde. Einstellungen → Darstellung → „Effekte: Ruhig / Normal“ (halbe Funken, kein Wippen). Der Ton-Schalter heißt jetzt „Klänge“. |
| D Lebendiger Hof | „Heute gepflegt“: feuchte, dunkle Erde mit Glanzpunkten unter heute erledigten Pflanzen (offene Beete bleiben neutral). Tiere aus der Truhe laufen kurze Wege mit Pausen, ganzzahlig, nie über Beete, Gebäude, Deko, Wohnhaus oder Teich; nachts schlafen sie. Ente schwimmt. Wasser glitzert, Kaminrauch am Wohnhaus-Sprite, Wolkenschatten bei Bewölkung (vorhanden). Animation nur, solange eine Ansicht sichtbar ist. |
| Grafik | Nur die Platzhalter aus Abschnitt 5: `hof-entdeckungen` (Steg, Bienenstock, Bank mit Laterne, Hofschild, Obstbaum ohne/mit Früchten, Gemüsebeet, Festtisch) und `hof-besucher` (Schmetterling, Biene, Frosch, Eichhörnchen, je 2 Frames), erzeugt mit `art/platzhalter/entdeckungen.js`. Regenbogen, Glühwürmchen, Funken, Glitzern per Code. |

Umgesetzt sind alle Muss- und Sollte-Punkte aus der Freigabe, dazu der Kann-Punkt (Jahrespfeile in einer Zeile).

## Tests

**122 grün** (105 bis 8.2.1, unverändert, + 17 in `tests/v9.test.js`): Zählregel (alle Fälle), Schwellen an der Grenze, `hofGesehen` (fehlt = {}, überlebt Löschen), `erreichtAm`, Import mit und ohne neue Felder (ungültige Werte fallen weg), v3/v5/v7/v8-Exporte, keine Regeländerung, `effects`, Stufen der Rückmeldung (auch reduzierte Bewegung), Wilmas Vorrang und gebündelte Meldung, Hof-Tage des Jahres gegen die Kachelfärbung, Hof-Ereignisse.

`node tools/ux/aufgaben-v8c.js`: alle Aufgaben des Testleitfadens lösbar, v6-Daten laden unverändert.

## Abnahme (`npm run abnahme`, Abschnitte `immer` + `v9`): grün, **ohne „bekannt offen“**

| Prüfung | vorher (8.2.1) | v9 |
|---|---|---|
| `kontrast_nichttext_min` (≥ 3) | 1,05 (bekannt offen) | 5,21 |
| `kontextzeile_ohne_abschneiden` | Anker abgeschnitten (bekannt offen) | 0 von 3 |
| `erster_haken_max_pt` (≤ 480) | 469 | 478 (Test-Hof mit Nachtrag-Hinweis), 430 mit „Neu auf deinem Hof“ (430 pt: 468 / 421) |
| `karten_im_ersten_bildschirm_min` | 3 | 3 |
| `woerter_max.fortschritt` (≤ 130) | 103 | 106 |
| `seitenhoehe_max_pt.fortschritt` | 1546 | 1565 |
| `abhaken_wieder_moeglich_ms` (≤ 50) | – | 28 ms, nächster Haken frei |
| `rueckmeldung_dauer_ms` | – | Mini 310, erledigt 550, Ernte 803, Fund 866 ms |
| `bildzeit_ms` (4× gedrosselt, ≤ 16) | – | 0,4 ms Rechenzeit je Szenenbild |
| `entdeckungen_test_hof` | – | 19 Hof-Tage → Schmetterlinge, Steg, Bienenwiese, Regenbogen, Eichhörnchen |
| `screenshot_paar_woche` | – | `docs/screenshots/hof-gute-woche.png`, `hof-schwache-woche.png` |
| `konsolenfehler` | 0 | 0 |

Bericht: `docs/abnahme-ergebnis.md`. Screenshots: `docs/screenshots/`.

**2-Sekunden-Prüfung** (Sichtprüfung des Bildpaars): In der guten Woche gibt es größere Pflanzen, feuchte Erde, Bienenstock, Bienen, Huhn, Hase und Ente. In der schwachen Woche ist der Hof ruhiger, kleinere Pflanzen, weniger Besucher. Nichts welkt oder vertrocknet.

## Abweichungen

`docs/ABWEICHUNGEN.md`, Abschnitt v9 (14 Punkte), u. a.: Meldung ohne „Wilma:“, Datum = Tag der Schwelle, Regeln für Hof-Ereignisse, bisherige Nacht-Glühwürmchen bleiben, „Klänge“ statt „Effekte“ unter Ton, Bildzeit = Rechenzeit je Bild, Audio vorab angelegt.

## Offen

- **Auf dem iPhone prüfen** (Vorschau): Flüssigkeit der Szene mit laufenden Tieren, Akku (K7), Lesbarkeit der kleinen Besucher bei 1×, Funkenflug vom Haken zum Beet.
- **`docs/ux-testleitfaden-v6.md`** nennt „Effekte an“; gemeint ist jetzt „Klänge an“ (Koordinations-Chat).
- **Baustein E** (Bedienung, Testrunde P1) ist wie vereinbart nicht Teil von v9.
- **Grafik:** Alle neuen Teile sind Platzhalter; Plätze der Entdeckungen mit dem Artist festlegen (Abweichung 12).
- Die Hof-Tage-Schwellen zählen ab dem ersten Logeintrag; wer schon lange dabei ist, bekommt beim Update eine gebündelte Meldung („… 5 Dinge“) mit den echten Daten der Schwellen.
