# Prototyp v8a · Zusammenfassung (Grafik auf Sprite-Sheets, Stil B)

Stand: 02.11.2026 (v8a.1) · Branch `v8a`, nicht nach `main` gemergt und nicht auf GitHub Pages veröffentlicht (dort läuft v7 für Selbsttest und Usability-Test). Grundlage: Arbeitsliste v8a (CLAUDE.md), `docs/pixel-styleguide-stil-b.md`, Leitfaden 5.4, `art/platzhalter/README.md`. Spielregeln (Stärke, XP, Funde, Graduierung) sind unverändert. Die Abgleich-Checkliste ist nicht ausgefüllt.

Aufräumen: Werkstatt, Bücherturm und `art/platzhalter-v3.zip` waren schon mit Commit `5ec7f40` entfernt und die übrigen Änderungen in `art/` sowie der Style-Guide committet; v8a baut darauf auf.

## Messwerte (390 × 844 pt, devicePixelRatio 3, Test-Hof aus `tools/ux/testhof.js`)

| | v7 | v8a |
|---|---|---|
| Kompakte Szene | ca. 240 × 150 pt, krumm verkleinert | **256 × 160 pt (1:1)**, Canvas 768 × 480 px = CSS × 3 |
| Verschwommene Szenen-Pixel | – | **0** (jeder Szenen-Pixel ist ein gleichfarbiger 3 × 3- bzw. 6 × 6-Block) |
| Großansicht | – | 2×, 512 × 320 pt (v8a.1: 3×), waagerecht verschiebbar, startet mittig; Schließen 108 × 44 pt |
| Erster Haken (Oberkante) | 468 pt | **478 pt**, ohne Scrollen sichtbar (+10 pt durch die 1:1-Szene) |
| Kleinste Tap-Fläche | 81 × 44 pt | 81 × 44 pt, keine unter 44 pt (Gebäude-Raster 138 × 77, Pflanzenwahl ≥ 98 × 46) |
| Desktop 1280 px | Szene 100 % breit | Szene 2× (512 × 320), erster Haken bei 321 pt |

Stand v8a (vor der Nacharbeit). Die aktuellen Werte und Screenshots stehen unter „Nacharbeit v8a.1“. Alle 8 Aufgaben aus `docs/ux-testleitfaden-v6.md` lassen sich weiter lösen (Skript wie in v7, Uhr auf 12 Uhr).

## Veröffentlichung 8.0.0

Nach Freigabe durch Lars als Version 8.0.0 nach `main` gemergt und über GitHub Pages veröffentlicht; Selbsttest und Usability-Test laufen ab jetzt auf v8a. Testleitfaden (Stand v8a) mit dem Test-Hof geprüft: Aufgaben 1–7, neue Aufgabe 8 „Gebäude ändern“ (Fähigkeit „Geist“ auf Scheune, Gebäude auf dem Hof sichtbar gewechselt) und (9) Logbuch lösbar, erster Haken bei 478 pt. Hinweis: Der Test-Hof hat drei Fähigkeiten (Körper → Mühle, Geist → Archiv, Alltag → Schmiede), der Testleitfaden nennt zwei.

## Nacharbeit v8a.1 (Darstellung)

1. **Kompakte Szene ohne Seitenstreifen:** Faktor bleibt ganzzahlig; die logische Breite ist `floor(verfügbare Breite / Faktor)` (mindestens 256), die Höhe 160. Der Kern (256 × 160 mit allen Gebäuden, Beeten, Teich) steht mittig, die Ränder füllt die Karte mit Natur (Randzonen Waldrand, Wegsaum, Wiese; gleicher Seed, keine Spielobjekte). Gilt für kompakte Ansicht, Großansicht und Desktop.
2. **Großansicht 3×:** größter ganzzahliger Faktor, bei dem die Höhe passt, waagerecht verschiebbar, startet mittig; Hinweis „Zum Umsehen wischen“, bis man einmal gewischt hat.

Gemessen mit `node tools/ux/screenshots-v8a.js` (devicePixelRatio 3, Test-Hof; Screenshots unter `docs/screenshots-v8a/`: je Breite Tag und Abend, kompakt, Großansicht und Szene 1:1):

| | 390 × 844 pt | 430 × 932 pt |
|---|---|---|
| Kompakte Szene | **344 × 160 pt** (1×), Rand links/rechts je 23 pt = Seitenabstand + Rahmen, keine Streifen | **384 × 160 pt** (1×) |
| Canvas-Auflösung | 1032 × 480 px = CSS × 3 | 1152 × 480 px |
| Verschwommene Szenen-Pixel | 0 | 0 |
| Großansicht | **3×, 768 × 480 pt**, verschiebbar (sichtbar 390 pt), startet mittig, Hinweis sichtbar | 3×, 768 × 480 pt (sichtbar 430 pt) |
| Erster Haken (Oberkante) | **478 pt**, ohne Scrollen | 455 pt, ohne Scrollen |

Desktop 1280 px: Szene 2× (514 pt verfügbar → 257 × 160 logisch), erster Haken bei 320 pt. Kleinste Tap-Fläche weiterhin 81 × 44 pt, keine unter 44 pt; alle 8 Aufgaben des Testleitfadens lösbar.

## Umgesetzt

**Muss**

| Punkt | Stand | Kurz |
|---|---|---|
| 1 Sprite-System | **umgesetzt** | `src/sheets.js` liest Aseprite-JSON (Array, Ebenen getrennt): Ebenen `base`/`glow`/`shadow` aus dem Dateinamen, Frame-Tags, `meta.anchor` (sonst unten Mitte), `meta.platzhalter`, auch getrimmte Frames. `tools/sprites.js` kopiert die Exporte bei jedem Build nach `public/sprites/` (+ `index.json`), `art/src/` hat Vorrang vor `art/platzhalter/`, geschrieben wird nur bei Änderung. Der Service Worker cached alles (Version aus Inhalt-Hash, `package.json` 8.0.0-a). Zeichenreihenfolge wie verlangt, `imageSmoothingEnabled = false`. Rückfall: ohne Hof-Karte die komplette bisherige Szene; fehlt ein einzelnes Sheet, zeichnet der bisherige Code nur dieses Objekt (Gebäude, Pflanze, Baum). |
| 2 Ganzzahlige Skalierung | **umgesetzt** | Szene rechnet in 256 × 160 und wird auf jede Anzeige nur 1×, 2× oder 3× übertragen (`sceneScale`, `largeScale`). Antippen oder Enter öffnet die Großansicht, Schließen per Knopf oder Escape. |
| 3 Gebäude je Fähigkeit | **umgesetzt** | `skill.buildingType`, Vorschlag nach Symbol, Raster mit Vorschaubild (Stufe 4) und Namen beim „Ändern“ einer Fähigkeit; die Fähigkeit zeigt „Stufe 3 · Archiv“. Ausbaustufe als reine Funktion `buildingStage`. |
| 4 Pflanzen und Beete | **umgesetzt** | `habit.plantType`, Wahl im Formular (Schritt 5) mit Bild und Namen, Vorschlag reihum. Abbildung `plantFrame`: STAGES-Index 0–4 → keim, setzling, jungpflanze, bluete, ausgewachsen; gemeistert eigenes Bild. Beete nach Style-Guide 2 (Vorlage `hof.py`), bis zu 3 Pflanzen je Beet, bis zu 4 Beete. |
| 5 Hof als Karte | **umgesetzt** | `public/sprites/hof-karte.json`: 6 Gebäudeplätze, 4 Beete, Wohnhaus, Wege, Teich, 12 Deko-Plätze, Wanderweg, Zonen (Waldrand oben und unten, Wegsäume, Wiese, Teichufer, Ruheecke, Zwischenflächen) mit `natur-klein` und `natur-baeume`. Streuung per festem Seed; freie Gebäude- und Beetplätze werden mit Natur gefüllt. Statische Ebenen (Boden, Schatten, base, glow) nur bei Änderung neu. |

**Sollte**

| Punkt | Stand | Kurz |
|---|---|---|
| Leuchten abends | **umgesetzt** | glow-Ebene abends, nachts und bei Gewitter für Gebäude in Stufe 4 sowie Gewächshaus und Schmiede; gemeisterte Pflanzen schimmern immer. |
| Hinweis „Vorläufige Grafiken“ | **umgesetzt** | In „Fortschritt“ → Darstellung, solange ein geladenes Sheet `meta.platzhalter: true` hat. |

## Tests

`npm test`: **80 Tests grün** (68 bestehende unverändert + 12 neue in `tests/v8a.test.js`; v8a.1: Großansicht-Regel angepasst, Breitenregel neu): Loader (Ebenen, Tags, Fußpunkt, getrimmte Frames, alle Exporte und Karten-Verweise gültig, Rückfall bei fehlenden oder kaputten Dateien), Gebäude- und Pflanzenstufen, Migration v7 → v8a (nur zwei Felder kommen dazu, Ableitungen gleich), Import alter Exporte (v7, v5, v3), neue Gewohnheit mit Pflanzensorte, Skalierung immer ganzzahlig (390, 430, 768, 1024 pt).

## Abweichungen

Siehe [ABWEICHUNGEN.md](ABWEICHUNGEN.md), Abschnitt v8a: 1 Migration als eigene Funktion · 2 Pflanzensorte reihum · 3 gemeistert zeigt immer das gemeistert-Bild · 4 ein Schild je Beet · 5 Großansicht 3× verschiebbar · 6 Desktop-Spalte 532 px · 7 Wohnhaus, Deko, Figuren, Boden bleiben Code · 8 Früchte noch nicht in Fähigkeitsfarbe · 9 Headless-Chrome statt Playwright · 10 Gebäudewahl beim Bearbeiten der Fähigkeit · 11 breitere Szene nur mit Hof-Karte · 12 Wisch-Hinweis im Browser gemerkt.

## Offen

- Nicht auf einem echten iPhone geprüft (Safari, installierte App, VoiceOver); Messung in der Emulation.
- Platzhalter-Grafiken: Stufe 3 und 4 der Gebäude unterscheiden sich wenig in der Form; keine Animationen (Mühlenflügel, Rauch); keine Jahreszeiten-Fassungen. Beides kommt mit den echten Grafiken.
- Wohnhaus, Truhengegenstände, Bauer und Tiere stehen im alten Stil neben den neuen Sprites (Pakete 3 und 5).
- Die v8a-Migration ergänzt beim ersten Start `buildingType` und `plantType` und speichert sie. Ein Zurück auf v7 liest diese Daten weiter (zusätzliche Felder werden ignoriert).
- Das Gebäude ist nur über „Ändern“ der Fähigkeit wählbar; ob man es dort findet, könnte der nächste Usability-Test zeigen.
