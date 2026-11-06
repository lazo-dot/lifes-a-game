# Abnahme-Ergebnis

Erzeugt von `npm run abnahme` (tools/abnahme.js) · Version 9.0.0 · 6.11.2026, 13:28:30 · Abschnitte: immer, v9

Geräte: iPhone 13–15 (390 × 844 pt), iPhone Pro Max (430 × 932 pt) · Test-Hof, 12 Uhr, Erklärungen als gesehen · Kontraste in 7 Themen.

**Grün**

| Prüfung | Grenzwert | gemessen | ok |
|---|---|---|---|
| `tests_gruen` | true | 122 grün, 0 rot | ja |
| `speicherschema` | 4 | 4 | ja |
| `erster_haken_max_pt` | 480 | 390: 478 · 390 mit Meldung: 430 · 430: 468 · 430 mit Meldung: 421 | ja |
| `karten_im_ersten_bildschirm_min` | 3 | 390: 3 · 430: 3 | ja |
| `woerter_max` | heute 100, gewohnheiten 100, logbuch 80, fortschritt 130, truhe 160, summe 500 | 390: heute 90, gewohnheiten 63, logbuch 75, fortschritt 106, truhe 139, summe 473 · 430: heute 90, gewohnheiten 63, logbuch 75, fortschritt 106, truhe 139, summe 473 | ja |
| `seitenhoehe_max_pt` | heute 1300, fortschritt 1800 | 390: heute 1202, fortschritt 1565 · 430: heute 1183, fortschritt 1520 | ja |
| `kontextzeile_ohne_abschneiden` | anker | 390: 0 von 3 abgeschnitten · 430: 0 von 3 abgeschnitten | ja |
| `szene_ganzzahlig` | true | 390: 1× · 430: 1× | ja |
| `szene_seitenstreifen` | false | 390: 0 pt Rest · 430: 0 pt Rest | ja |
| `grossansicht_faktor_min` | 3 | 390: 3× · 430: 3× | ja |
| `tapflaeche_min_pt` | 44 | 390: kleinste 44 pt (191 Elemente) · 430: kleinste 44 pt (191 Elemente) | ja |
| `kontrast_text_min` | 4.5 | kleinster 5.08 (8176 Texte, 7 Themen × 4 Zustände × 7 Ansichten) | ja |
| `kontrast_nichttext_min` | 3 | kleinster 5.21 (308 Elemente, 7 Themen × 4 Zustände × 7 Ansichten) | ja |
| `erklaerung_woerter_max` | 60 | längste 54 Wörter (14 Erklärungen) | ja |
| `ebenen_max` | 2 | 390: 2 · 430: 2 | ja |
| `migration_exporte` | v3, v5, v7, v8 | v3, v5, v7, v8 laden | ja |
| `abhaken_wieder_moeglich_ms` | 50 | 28 ms (Stufe erledigt), nächster Haken frei | ja |
| `rueckmeldung_dauer_ms` | mini 400, erledigt 600, ernte 900, fund 900 | mini 310, erledigt 550, ernte 803, fund 866 | ja |
| `entdeckungen_test_hof` | true | 19 Hof-Tage → 5 Entdeckungen (Schmetterlinge, Steg am Teich, Bienenwiese, Regenbogen, Eichhörnchen) | ja |
| `bildzeit_ms` | cpu_drosselung 4, mittel_max 16 | 0.4 ms im Mittel (75 Bilder, 4× gedrosselt) | ja |
| `screenshot_paar_woche` | hof-gute-woche.png, hof-schwache-woche.png | neu erzeugt: hof-gute-woche.png, hof-schwache-woche.png | ja |
| `bekannt_offen_erlaubt` | false | 0 Einträge in BEKANNT_OFFEN | ja |
| `konsolenfehler` | 0 | 0 | ja |

Screenshots: `docs/screenshots/` (390 pt, Standard und Pergament: Heute oben, alle Tabs, Info-Blatt, Einstellungen; v9: `hof-gute-woche.png` / `hof-schwache-woche.png`).

`bildzeit_ms` misst die Rechenzeit je Szenenbild (update + tick + draw, die Szene läuft mit 15 Bildern/s), nicht den Abstand der Bildschirm-Bilder.
