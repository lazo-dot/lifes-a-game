# Life's a Game – Entwurf v9 „Hof-Tage und lebendige Welt“

Stand: 06.11.2026 · **Freigegeben 06.11.2026 (Lars): F1 Zahl ohne Schwelle, F2 Effekt-Regler ja, F3 Liste wie unten** · Grundlage: Leitfaden v1.10 (5.4), Projektstatus Entscheidungen 7, 10, 13, 14, `prompt-spieleentwickler.md` Teil B, Hof-Testrunde P1 · Danach: Auftragsdatei `docs/auftraege/v9.md`

**Rahmen:** nur Branch `v9` + Vorschau `/preview/` bis zur Selbsttest-Auswertung (23.11.), dann Merge nach Freigabe. **Keine Regeländerung** (Stärke, XP, Funde, Regentage, Nachtragen, Graduierung). Grafiker noch offen → **nur die nötigsten Platzhalter** (Entscheidung 14).

---

## 1. Ziel in einem Satz

Der Hof belohnt Beständigkeit über die ersten zehn Wochen mit kleinen Entdeckungen – besonders dicht in Woche 3–8, wo laut Simulation und Forschung die Motivation einbricht – und zeigt auf einen Blick, wie die Woche lief.

## 2. Bausteine und Reihenfolge

| # | Baustein | Warum | Umfang |
|---|---|---|---|
| A | **Offene Punkte aus `feedback.md`:** Anker zuerst und umbrechbar; Zahnrad in Pergament ≥ 3 : 1; Rand der Eingabefelder ≥ 3 : 1; Hover-Ring des Abhak-Kastens ≥ 3 : 1; danach `BEKANNT_OFFEN` leeren | Abnahme wieder ohne Ausnahmen grün | klein |
| B | **Hof-Tage und Entdeckungen** (Abschnitt 3) | Belohnungsloch ab Woche 3–4 (Simulation 72 Tage, Rodrigues 2022) | mittel – Kern von v9 |
| C | **Rückmeldung beim Abhaken am eigenen Beet** (Abschnitt 4) | Ursache → Wirkung lesbar machen (Kao 2024) | klein–mittel |
| D | **Lebendiger Hof:** Tiere aus der Truhe laufen umher, Wasser glitzert, Rauch aus dem Kamin, Wolkenschatten; Hof zeigt „heute gepflegt“ (Abschnitt 5) | Welt als Anzeige (UbiFit), Gemütlichkeit | mittel |
| E | *Nur falls weitere Testpersonen es bestätigen:* Info-Blatt und „?“ besser auffindbar (Abschnitt 6) | Hof-Testrunde P1: Umwege bei Abhaken, Ändern, Pausieren | klein |

**Nicht in v9:** Mühlenflügel, Gebäude-Animationen und Jahreszeiten-Fassungen der Bäume (brauchen echte Grafik oder viele Frames) · soziale Funktionen · Fokus-Timer · Regeländerungen.

## 3. Hof-Tage und Entdeckungen

### 3.1 Zählregel (Entscheidungen 7 und 13)

- **Hof-Tag** = ein Kalendertag, an dem mindestens eine Gewohnheit als **erledigt** oder **Mini** eingetragen ist – auch nachgetragen. **Nicht:** To-dos, Logbuch, Check-in, Regentag, Extra-Runde („repariert“).
- **Abgeleitet, nicht gespeichert:** aus den Logs aller (auch pausierter und archivierter) Gewohnheiten; gelöschte Gewohnheiten zählen nicht mehr. Damit zählen auch Tage vor dem Update – wer schon länger dabei ist, findet beim Update gleich mehrere Entdeckungen vor.
- **Gehen nie verloren** (außer durch Löschen der Gewohnheit selbst, dann bleiben bereits *gesehene* Entdeckungen trotzdem freigeschaltet, siehe 3.4).

### 3.2 Entdeckungen (Vorschlag)

Schwellen in Hof-Tagen. Annahme: aktive Nutzer haben 4–6 Hof-Tage pro Woche → Woche ≈ Hof-Tage / 5.

| Hof-Tage | ≈ Woche | Entdeckung | Wo auf dem Hof | Art |
|---|---|---|---|---|
| 3 | 1 | **Schmetterlinge** über der Wiese | Wiese (Kern, im iPhone-Bild sichtbar) | Besucher |
| 7 | 2 | **Steg** am Teich, ab dann Frösche am Ufer | Teichufer | Bereich |
| 12 | 3 | **Bienenwiese:** Bienenstock, Bienen über den Blumen | Wiese | Bereich |
| 15 | 3–4 | **Regenbogen** nach Regen-Stimmung (ab dann gelegentlich) | Himmel | Ereignis |
| 19 | 4 | **Eichhörnchen** am Waldrand | Waldrand | Besucher |
| 23 | 5 | **Obstwiese** mit zwei Obstbäumen (Früchte im Spätsommer/Herbst) | linker Rand (Großansicht) + Rand im iPhone-Bild | Bereich |
| 27 | 5–6 | **Glühwürmchen** an Sommer- und Frühherbstabenden; im Winter: Laternen am Weg | Wegsäume | Ereignis |
| 31 | 6–7 | **Gemüsegarten** | rechter Rand | Bereich |
| 36 | 7–8 | **Erntefest:** Lampions und Tisch am Wohnhaus für einen Tag, danach einmal pro Jahreszeit | vor dem Wohnhaus | Ereignis |
| 42 | 8–9 | **Ruheecke** mit Bank und Laterne; Wilma sitzt dort manchmal | Ruheecke | Bereich |
| 50 | 10 | **Hofchronik vollständig:** Wilma schenkt ein Hofschild mit dem Gründungsdatum | am Weg | Abschluss |

Dichte: 6 Entdeckungen zwischen Woche 3 und 8, danach größere Abstände – danach tragen Jahreszeiten, Sammelalbum, Ernte und „Gemeistert“.

### 3.3 Prinzipien-Check

- **Keine Verlust- oder Druckmechanik:** nichts verfällt, nichts ist zeitlich begrenzt; Ereignisse kommen wieder.
- **Keine Countdowns:** Siehe Frage F1 – Empfehlung: Anzahl der Hof-Tage zeigen, die **nächste Schwelle nicht** (Überraschung statt Zielzahl).
- **Kein Farming:** ein Hof-Tag pro Kalendertag, egal wie viele Erledigungen; Nachtragen ist auf 48 h begrenzt (bestehende Regel).
- **Cozy-Säulen:** Besucher und Ereignisse bedrohen nichts, füllen den Hof, sind weich animiert.

### 3.4 Darstellung und Ablauf

- **Neu entdeckt:** Beim ersten Öffnen nach Erreichen einer Schwelle (nicht 22–6 Uhr, die Farm schläft) funkelt die Stelle auf dem Hof kurz; Wilma sagt einen Satz („Schau mal, am Teich steht jetzt ein Steg.“). Vorrang in Wilmas Liste: Nachtrag → Check-in → **Neu entdeckt** → Meilenstein → Spruch.
- **Antippen** der Stelle oder des Hinweises öffnet ein Info-Blatt: Name, ein Satz, Datum der Entdeckung.
- **Hofchronik** im Tab Fortschritt (eine kompakte Karte): „23 Hof-Tage · 6 Entdeckungen“; Antippen öffnet die Liste mit Datum. Noch nicht entdeckte erscheinen nicht (keine Silhouetten, keine Lücken).
- **Mehrere auf einmal** (z. B. beim Update mit langer Vorgeschichte): eine gebündelte Meldung („Auf deinem Hof gibt es 3 neue Dinge“), Funkeln an allen Stellen.
- **Gespeichert** wird nur, welche Entdeckungen schon **gesehen** wurden: optionales Feld `hofGesehen: { [id]: Datum }` auf oberster Ebene (wie `theme`). Speicherschema bleibt `4`, ältere Versionen ignorieren es. Was einmal gesehen ist, bleibt sichtbar – auch wenn später eine Gewohnheit gelöscht wird.

### 3.5 Logik (UI-frei, nach Dart portierbar)

- `LAG.hofTage(state)` → Anzahl; `LAG.entdeckungen(state)` → Liste `{id, schwelle, erreicht, gesehen}`; Schwellen als Tabelle in `logic.js`.
- Tests: Zählregel (erledigt/Mini/nachgetragen zählen; repariert, Regentag, To-do, Logbuch nicht; mehrere Gewohnheiten am selben Tag = 1), pausierte/archivierte zählen, gelöschte nicht, Schwellen, `hofGesehen` bleibt nach Löschen, v8-Exporte laden unverändert.

## 4. Rückmeldung beim Abhaken

| Stufe | Rückmeldung | Dauer |
|---|---|---|
| Mini | leiser Ton, 3 Funken zum eigenen Beet, Pflanze wippt einmal | ≤ 400 ms |
| erledigt | Ton, 6 Funken zum Beet, Pflanze wippt, Erde wird kurz dunkler („gegossen“) | ≤ 600 ms |
| Ernte (neue Wachstumsstufe) | wie erledigt + Pflanze wächst sichtbar um eine Stufe, kleines Aufleuchten | ≤ 900 ms |
| Fund | wie erledigt + Truhen-Symbol hüpft einmal | ≤ 900 ms |
| „Gemeistert“ | goldener Schimmer am Beet (vorhanden) + Wilma-Satz | bestehend |

- **Nie blockierend:** Der nächste Haken ist sofort tippbar (Grenzwert in der Abnahme).
- Ist die Szene nicht im Bild (gescrollt), fliegen keine Funken; das Beet zeigt den Zustand beim Zurückscrollen.
- **„Reduzierte Bewegung“:** keine Funken, kein Wippen – nur die dunklere Erde.
- **Effekte** in den Einstellungen (Darstellung): „ruhig / normal“ (Kao 2020), optionales Feld `effects`; „ruhig“ = halbe Funkenzahl, kein Wippen. *(Frage F2)*

## 5. Lebendiger Hof und Anzeige auf einen Blick

- **Tiere aus der Truhe laufen umher** (bisher stehen sie): kurze Wege zwischen freien Punkten der Hof-Karte, Pausen, nie über Beete und Gebäude, ganzzahlige Pixelschritte; nachts schlafen sie. Ente schwimmt.
- **Kleine Bewegung:** Wasser-Glitzern (4 Frames, per Code), Kaminrauch am Wohnhaus (vorhanden im Zeichencode, ins Sprite übernehmen), Wolkenschatten bei „bewölkt“, Regen/Schnee wie bisher.
- **„Heute gepflegt“:** Beete mit heute erledigter Gewohnheit haben dunkle, feuchte Erde mit Glanzpunkten; offene Beete bleiben neutral (**kein** „trocken“ oder Welken – nur positiv).
- **2-Sekunden-Prüfung** (Abnahme, Screenshot-Paar): Test-Hof nach einer guten und nach einer schwachen Woche nebeneinander – der Unterschied ist ohne Text erkennbar (Pflanzengröße, feuchte Erde, Besucher).
- **Performance:** Animationen nur, solange die Szene sichtbar ist; Bildzeit im Headless-Chrome mit 4-facher CPU-Drosselung ≤ 16 ms im Mittel; Hintergrund-Tab pausiert (bestehend). Akku im Selbsttest beobachten (K7).

## 6. Bedienung (nur bei Bestätigung durch weitere Tests)

Hof-Testrunde P1: Abhaken mit Umweg (4/7), Ändern 3/7, Pausieren 3/7, Wunsch nach „zugänglicheren Tooltips“. Wenn mindestens eine weitere Person dieselben Stellen nennt:

- Karten bekommen ein sichtbares Zeichen, dass sie antippbar sind (Pfeil „›“ rechts), Tap-Fläche ≥ 44 pt.
- Im Info-Blatt stehen **Bearbeiten** und **Pausieren** als eigene Knöpfe oben, nicht in einer Liste.
- „?“ als deutlicher Knopf mit Rahmen statt als Zeichen.
- Textbudget aus v8c bleibt.

Entscheidung dazu fällt vor dem Auftrag, sobald 2–3 weitere Antworten da sind.

## 7. Grafik (nur das Nötigste, Platzhalter per Code)

| Teil | Größe | Frames |
|---|---|---|
| Schmetterling, Biene, Frosch, Eichhörnchen | 8 × 8 bzw. 16 × 16 | je 2 |
| Steg, Bienenstock, Bank mit Laterne, Hofschild | 16 × 16 bis 32 × 16 | 1 |
| Obstbaum (2 Fassungen: ohne/mit Früchten) | 32 × 32 | 1 |
| Gemüsebeet (klein) | 32 × 16 | 1 |
| Lampions/Festtisch | 32 × 16 | 1 |
| Regenbogen, Glühwürmchen, Funken, Wasser-Glitzern, Wolkenschatten | per Code | – |

Rund 12 kleine Sprites statt der Pakete 4–6 (ca. 50–75 h Artist-Zeit). Alles bleibt als Platzhalter markiert und folgt Palette und Style-Guide.

## 8. Abnahme (Vorschlag für Abschnitt `v9` in `abnahme.json`)

| Prüfung | Grenzwert |
|---|---|
| Alle bisherigen `immer`-Prüfungen | grün, **keine** „bekannt offen“ mehr |
| `abhaken_wieder_moeglich_ms` | ≤ 50 ms nach dem ersten Haken |
| `rueckmeldung_dauer_ms` | erledigt ≤ 600, Ernte/Fund ≤ 900 |
| `bildzeit_ms` (4× CPU-Drosselung) | ≤ 16 im Mittel |
| `hof_tage_tests` | Zählregel-Tests vorhanden und grün |
| `woerter_max.fortschritt` | ≤ 130 (Hofchronik muss ins bestehende Budget passen) |
| `zwei_sekunden` | Screenshot-Paar gute/schwache Woche liegt bei (Sichtprüfung hier) |

## 9. Entscheidungen (06.11.2026)

- **F1 Hof-Tage:** Die Zahl wird gezeigt („23 Hof-Tage · 6 Entdeckungen“), die nächste Schwelle **nicht** – Entdeckungen bleiben Überraschung.
- **F2 Effekte:** Regler „ruhig / normal“ unter Einstellungen → Darstellung (optionales Feld `effects`, Standard „normal“).
- **F3 Entdeckungen:** Liste aus 3.2 unverändert.
- **Baustein E (Bedienung)** ist **nicht** Teil des Auftrags v9; er folgt als v9.1, sobald weitere Testantworten die Umwege bestätigen.
