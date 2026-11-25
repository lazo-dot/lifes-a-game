# Abnahme-Ergebnis

Erzeugt von `npm run abnahme` (tools/abnahme.js) · Version 9.1.0 · 25.11.2026, 08:45:08 · Abschnitte: immer, v9, v9.1

Geräte: iPhone 13–15 (390 × 844 pt), iPhone Pro Max (430 × 932 pt) · Test-Hof, 12 Uhr, Erklärungen als gesehen · Kontraste in 7 Themen.

**Grün**

| Prüfung | Grenzwert | gemessen | ok |
|---|---|---|---|
| `tests_gruen` | true | 125 grün, 0 rot | ja |
| `speicherschema` | 4 | 4 | ja |
| `erster_haken_max_pt` | 450 | 390: 440 · 430: 430 | ja |
| `karten_im_ersten_bildschirm_min` | 3 | 390: 3 · 430: 3 | ja |
| `woerter_max` | heute 100, gewohnheiten 100, logbuch 80, fortschritt 130, truhe 160, summe 500 | 390: heute 85, gewohnheiten 63, logbuch 67, fortschritt 106, truhe 139, summe 460 · 430: heute 85, gewohnheiten 63, logbuch 67, fortschritt 106, truhe 139, summe 460 | ja |
| `seitenhoehe_max_pt` | heute 1300, fortschritt 1800 | 390: heute 1164, fortschritt 1565 · 430: heute 1145, fortschritt 1520 | ja |
| `kontextzeile_ohne_abschneiden` | anker | 390: 0 von 3 abgeschnitten · 430: 0 von 3 abgeschnitten | ja |
| `info_blatt_aktionen_ohne_scrollen` | Erledigt, Mini, Bearbeiten, Pausieren | 390: Erledigt bis 579 pt, Mini bis 579 pt, Bearbeiten bis 635 pt, Pausieren bis 635 pt · 430: Erledigt bis 667 pt, Mini bis 667 pt, Bearbeiten bis 723 pt, Pausieren bis 723 pt | ja |
| `szene_ganzzahlig` | true | 390: 1× · 430: 1× | ja |
| `szene_seitenstreifen` | false | 390: 0 pt Rest · 430: 0 pt Rest | ja |
| `grossansicht_faktor_min` | 3 | 390: 3× · 430: 3× | ja |
| `tapflaeche_min_pt` | 44 | 390: kleinste 44 pt (194 Elemente) · 430: kleinste 44 pt (194 Elemente) | ja |
| `kontrast_text_min` | 4.5 | kleinster 5.08 (8204 Texte, 7 Themen × 4 Zustände × 7 Ansichten) | ja |
| `kontrast_nichttext_min` | 3 | kleinster 5.21 (308 Elemente, 7 Themen × 4 Zustände × 7 Ansichten) | ja |
| `erklaerung_woerter_max` | 60 | längste 54 Wörter (14 Erklärungen) | ja |
| `ebenen_max` | 2 | 390: 2 · 430: 2 | ja |
| `migration_exporte` | v3, v5, v7, v8 | v3, v5, v7, v8 laden | ja |
| `erster_haken_mit_meldung_max_pt` | 450 | 390 mit Meldung: 430 · 430 mit Meldung: 421 | ja |
| `abhaken_wieder_moeglich_ms` | 50 | 37 ms (Stufe fund), nächster Haken frei | ja |
| `rueckmeldung_dauer_ms` | mini 400, erledigt 600, ernte 900, fund 900 | mini 346, erledigt 563, ernte 817, fund 817 | ja |
| `entdeckungen_test_hof` | true | 19 Hof-Tage → 5 Entdeckungen (Schmetterlinge, Steg am Teich, Bienenwiese, Regenbogen, Eichhörnchen) | ja |
| `bildzeit_ms` | cpu_drosselung 4, mittel_max 16 | 0.9 ms im Mittel (75 Bilder, 4× gedrosselt) | ja |
| `screenshot_paar_woche` | hof-gute-woche.png, hof-schwache-woche.png | neu erzeugt: hof-gute-woche.png, hof-schwache-woche.png | ja |
| `bekannt_offen_erlaubt` | false | 0 Einträge in BEKANNT_OFFEN | ja |
| `konsolenfehler` | 0 | 0 | ja |

Screenshots: `docs/screenshots/` (390 pt, Standard und Pergament: Heute oben, alle Tabs, Info-Blatt, Einstellungen; v9: `hof-gute-woche.png` / `hof-schwache-woche.png`).

`bildzeit_ms` misst die Rechenzeit je Szenenbild (update + tick + draw, die Szene läuft mit 15 Bildern/s), nicht den Abstand der Bildschirm-Bilder.
