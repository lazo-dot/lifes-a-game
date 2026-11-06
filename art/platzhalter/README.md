# Platzhalter-Grafiken (Stil B) – NICHT für den Launch

Diese Grafiken wurden **per Code mit KI (Claude) erzeugt** und sind nur **Platzhalter**. Laut Marketingkonzept (Kritik 2, Fair-Play) kommen in die veröffentlichte App keine KI-Grafiken. Vor dem Launch werden alle Dateien hier durch handgezeichnete Grafiken ersetzt (`art/src/` → `public/sprites/`).

Zweck:
1. Die Sprite-Technik für v8a lässt sich sofort bauen und testen.
2. Größen, Silhouetten und Stufen sind festgelegt und dienen als Vorlage für den Pixel-Artist.

Grundlage: `docs/pixel-styleguide-stil-b.md`, Palette `art/palette-stil-b.json`.

## Inhalt

| Ordner | Inhalt | Rahmen | Tags |
|---|---|---|---|
| `gebaeude/` | 9 Gebäude je Fähigkeit: Mühle (Körper), Archiv (Geist), Gewächshaus (Kreativität), offene Schmiede (Alltag), Gemeinschaftshaus (Soziales), Musikpavillon (Musik), Backhaus (Kochen), Kontor (Finanzen), Scheune (Standard) | 48 × 48 | `stufe-1` … `stufe-4` |
| `pflanzen/` | 4 Sorten: Beere, Blume, Kürbis, Bäumchen | 16 × 16 | `keim`, `setzling`, `jungpflanze`, `bluete`, `ausgewachsen`, `gemeistert` |
| `natur/natur-klein` | 17 Kleinteile für Zwischenbereiche: Büsche, Farn, hohes Gras, Wildblumen (3 Farben), Lavendel, Pilze, Schilf, Seerose, Steine, Baumstumpf, Stamm, Trittstein, Klee | 16 × 16 | Name je Frame |
| `natur/natur-baeume` | 4 Bäume: Eiche, Tanne, Birke, Weide | 32 × 32 | Name je Frame |
| `deko/deko` | 37 Truhengegenstände (Garten, Hof, Selten, Saisonal); Tag = ID aus `ITEMS` in `src/logic.js` (die 12 bisherigen IDs bleiben) | 16 × 24 | ID je Frame |
| `deko/tiere` | 5 Tiere: Huhn, Ente, Katze, Hase, Igel, je 2 Frames Leerlauf | 16 × 16 | ID je Tier (from–to) |
| `deko/deko-katalog.json` | Name, Gruppe, selten, Jahreszeit je Gegenstand | – | – |
| `figuren/wohnhaus` | Wohnhaus mit Dachgaube, Fenster leuchten abends | 48 × 48 | `wohnhaus` |
| `entdeckungen/hof-entdeckungen` | v9: Steg, Bienenstock, Bank mit Laterne, Hofschild, Obstbaum ohne/mit Früchten, Gemüsebeet, Festtisch mit Lampions (`node entdeckungen.js`, ohne Pillow) | 32 × 32 | Name je Frame |
| `entdeckungen/hof-besucher` | v9: Schmetterling, Biene, Frosch, Eichhörnchen, je 2 Frames | 16 × 16 | Name je Tier (from–to) |
| `figuren/bauer` | Bauer, 4 Richtungen × 4 Frames Gehen | 16 × 24 | `unten`, `oben`, `links`, `rechts` (from–to) |

Jedes Objekt besteht aus `name.png` (Sheet) und `name.json` (Aseprite-Format „Export Sprite Sheet“, Array, Layers getrennt):
- **Zeilen = Ebenen:** `base`, `glow` (abends addieren), `shadow` (eine Farbe, mit ca. 30 % Deckkraft zeichnen, siehe `meta.layers[].opacity`)
- **Spalten = Stufen** (Reihenfolge wie `meta.frameTags`)
- **Fußpunkt:** `meta.anchor` (unten Mitte)
- **Kennzeichnung:** `meta.platzhalter: true`, damit die App bzw. der Build Platzhalter erkennen kann

## Neu erzeugen

```bash
cd art/platzhalter
python3 gebaeude.py && python3 pflanzen.py && python3 natur.py && python3 deko.py && python3 figuren.py   # Sheets + JSON
python3 hof.py                               # Vorschauen (Hof, Silhouetten)
node entdeckungen.js                         # v9: Entdeckungen und Besucher + vorschau-entdeckungen.png (Node, keine Abhängigkeiten)
```

Benötigt Python 3 mit Pillow. `pix.py` ist der Zeichenkern: Er setzt Lichtkante, Eigenschatten und Umriss automatisch, prüft die Palette und exportiert.

## Vorschauen

- `vorschau-gebaeude-tag.png` / `-abend.png`: alle Gebäude und Stufen (3×)
- `vorschau-pflanzen-tag.png` / `-abend.png`: alle Pflanzen im Beet (6×)
- `vorschau-natur-klein.png`, `vorschau-natur-baeume.png`: Flora und Bäume
- `vorschau-deko-tag.png` / `-abend.png`, `vorschau-tiere.png` (`python3 vorschau_deko.py`): Truhengegenstände und Tiere
- `vorschau-figuren.png`: Wohnhaus (Tag/Abend) und Bauer
- `vorschau-hof-tag.png` / `-abend.png`: Hofausschnitt 256 × 160 (3×) mit gestalteten Zwischenbereichen (Waldrand, Wegsäume, Wiese, Teichufer, Ruheecke)
- `vorschau-hof-1zu1.png`: derselbe Hof in Originalgröße, so groß wie auf dem iPhone bei 1 px = 1 pt
- `vorschau-silhouetten.png`: Silhouetten-Test (Style-Guide 3.2)

## Bekannte Grenzen

- Stufe 1 (Baustelle) zeigt schon das Erkennungszeichen des Gebäudes; Stufe 2 behält diese Teile.

- Früchte und Blüten haben feste Standardfarben. Das Einfärben in der Fähigkeitsfarbe übernimmt die App.
- Keim und Setzling sehen bei allen Sorten ähnlich aus (gewollt, früh im Wachstum).
- Stufe 3 und Stufe 4 der Gebäude unterscheiden sich vor allem durch Fahne, Licht und Deko. Der Artist sollte Stufe 4 in der Form stärker absetzen (Anbau, Turm, zweites Stockwerk).
- Keine Animationen bei Gebäuden (Mühlenflügel, Rauch, Wasser). Tiere haben 2 Frames Leerlauf, der Bauer 4 Frames Gehen.
- Truhengegenstände sind 16 × 24 groß (auch niedrige), damit alle im selben Raster liegen; der Fußpunkt ist unten Mitte.
