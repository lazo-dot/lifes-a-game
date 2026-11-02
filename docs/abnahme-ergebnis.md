# Abnahme-Ergebnis

Erzeugt von `npm run abnahme` (tools/abnahme.js) · Version 8.2.1 · 2.11.2026, 17:49:08 · Abschnitte: immer

Geräte: iPhone 13–15 (390 × 844 pt), iPhone Pro Max (430 × 932 pt) · Test-Hof, 12 Uhr, Erklärungen als gesehen · Kontraste in 7 Themen.

**Grün** · 2 bekannt offen

| Prüfung | Grenzwert | gemessen | ok |
|---|---|---|---|
| `tests_gruen` | true | 105 grün, 0 rot | ja |
| `speicherschema` | 4 | 4 | ja |
| `erster_haken_max_pt` | 480 | 390: 469 · 430: 469 | ja |
| `karten_im_ersten_bildschirm_min` | 3 | 390: 3 · 430: 3 | ja |
| `woerter_max` | heute 100, gewohnheiten 100, logbuch 80, fortschritt 130, truhe 160, summe 500 | 390: heute 86, gewohnheiten 63, logbuch 62, fortschritt 103, truhe 139, summe 453 · 430: heute 86, gewohnheiten 63, logbuch 62, fortschritt 103, truhe 139, summe 453 | ja |
| `seitenhoehe_max_pt` | heute 1300, fortschritt 1800 | 390: heute 1085, fortschritt 1546 · 430: heute 1085, fortschritt 1429 | ja |
| `kontextzeile_ohne_abschneiden` | anker | 390: 3 von 3 abgeschnitten · 430: 2 von 3 abgeschnitten | bekannt offen |
| `szene_ganzzahlig` | true | 390: 1× · 430: 1× | ja |
| `szene_seitenstreifen` | false | 390: 0 pt Rest · 430: 0 pt Rest | ja |
| `grossansicht_faktor_min` | 3 | 390: 3× · 430: 3× | ja |
| `tapflaeche_min_pt` | 44 | 390: kleinste 44 pt (188 Elemente) · 430: kleinste 44 pt (188 Elemente) | ja |
| `kontrast_text_min` | 4.5 | kleinster 5.08 (7756 Texte, 7 Themen × 4 Zustände × 7 Ansichten) | ja |
| `kontrast_nichttext_min` | 3 | kleinster 1.05 (308 Elemente, 7 Themen × 4 Zustände × 7 Ansichten) | bekannt offen |
| `erklaerung_woerter_max` | 60 | längste 54 Wörter (14 Erklärungen) | ja |
| `ebenen_max` | 2 | 390: 2 · 430: 2 | ja |
| `migration_exporte` | v3, v5, v7, v8 | v3, v5, v7, v8 laden | ja |
| `konsolenfehler` | 0 | 0 | ja |

## Funde

**`kontextzeile_ohne_abschneiden`** – bekannt offen (docs/feedback.md · 02.11. · Heute · Anker wird in der Kontextzeile abgeschnitten → v9)

- 390 anker: „8 Uhr · nach dem ersten Kaffee“
- 390 anker: „0 von 3 diese Woche · nach dem Mittagessen“
- 390 anker: „22 Uhr · nach dem Zähneputzen am Abend“
- 430 anker: „0 von 3 diese Woche · nach dem Mittagessen“
- 430 anker: „22 Uhr · nach dem Zähneputzen am Abend“

**`kontrast_nichttext_min`** – bekannt offen (docs/feedback.md · 02.11. · Einstellungen · Zahnrad im Pergament-Thema blass → v9; docs/feedback.md · 02.11. · Eingabefelder: Rand zu schwach (Abnahme 8.2.1); docs/feedback.md · 02.11. · Abhak-Kasten beim Überfahren zu schwach (Abnahme 8.2.1))

- heute: Einstellungen (Symbol) – 1.05 (pergament/ruhezustand, pergament/aktiv, pergament/hover, pergament/gut-unterscheidbar)
- gewohnheiten: Einstellungen (Symbol) – 1.05 (pergament/ruhezustand, pergament/aktiv, pergament/hover, pergament/gut-unterscheidbar)
- logbuch: Einstellungen (Symbol) – 1.05 (pergament/ruhezustand, pergament/aktiv, pergament/hover, pergament/gut-unterscheidbar)
- fortschritt: Einstellungen (Symbol) – 1.05 (pergament/ruhezustand, pergament/aktiv, pergament/hover, pergament/gut-unterscheidbar)
- truhe: Einstellungen (Symbol) – 1.05 (pergament/ruhezustand, pergament/aktiv, pergament/hover, pergament/gut-unterscheidbar)
- logbuch: Logbuch-Eintrag (Eingabefeld) – 1.58 (28×, z. B. standard/ruhezustand, standard/aktiv, standard/hover, standard/gut-unterscheidbar, wald/ruhezustand, wald/aktiv)
- fortschritt: Kalender für (Eingabefeld) – 1.89 (28×, z. B. standard/ruhezustand, standard/aktiv, standard/hover, standard/gut-unterscheidbar, wald/ruhezustand, wald/aktiv)
- heute: Erledigt: 5 Minuten dehnen (Abhak-Kasten) – 2.25 (standard/hover, wald/hover, herbst/hover, frost/hover, kirschbluete/hover, pergament/hover)
- heute: Erledigt: Spazieren gehen (Abhak-Kasten) – 2.25 (standard/hover, wald/hover, herbst/hover, frost/hover, kirschbluete/hover, pergament/hover)
- heute: Erledigt: 10 Minuten lesen (Abhak-Kasten) – 2.25 (standard/hover, wald/hover, herbst/hover, frost/hover, kirschbluete/hover, pergament/hover)
- heute: Erledigen: Geburtstagsgeschenk besorgen (Abhak-Kasten) – 2.25 (standard/hover, wald/hover, herbst/hover, frost/hover, kirschbluete/hover, pergament/hover)

Screenshots: `docs/screenshots/` (390 pt, Standard und Pergament: Heute oben, alle Tabs, Info-Blatt, Einstellungen).
