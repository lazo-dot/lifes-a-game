# Life's a Game – Pixel-Style-Guide (Stil B) und Asset-Liste v8

Stand: 02.11.2026 · Grundlage: Entscheidung 3 im [Projektstatus](projektstatus.md) („Richtung B – detailreich mit Licht“), [Leitfaden](habit-tracker-entwicklungsleitfaden.md) Abschnitt 2 · Dateien im Repo: `art/palette-stil-b.gpl` (Aseprite), `art/palette-stil-b.png` (Vorschau), `art/palette-stil-b.json`, `art/palette.py`

Dieses Dokument dient zugleich als **Briefing für einen Pixel-Artist**. Es legt fest, wie die Grafiken aussehen, in welchem Format sie geliefert werden und in welcher Reihenfolge sie entstehen.

---

## 1. Stil in einem Satz

Ein gemütlicher Hof in Draufsicht (leicht schräg, „3/4-Ansicht“ für Gebäude), gezeichnet mit **farbigen Umrissen, drei bis fünf Schattierungen pro Material, Licht von oben links, weichen Schlagschatten und warmem Abendlicht**. Er wirkt lebendig und hochwertig, bleibt aber auf einem iPhone-Bildschirm auf einen Blick lesbar.

**Bezug:** Die Detailtiefe orientiert sich an „Sea of Stars“. Es werden aber keine Motive, Figuren oder Formen übernommen. Alle Grafiken sind eigenständig.

## 2. Raster und Maße

| Element | Größe (px) | Hinweise |
|---|---|---|
| Kachel (Gras, Weg, Wasser, Ufer) | 16 × 16 | Alles richtet sich an diesem Raster aus |
| Szene (logisch) | 256 × 160 | 16 × 10 Kacheln, wie in v7 |
| Pflanze je Wachstumsstufe | 16 × 16 | ein Frame je Stufe, Fußpunkt unten Mitte |
| Beet | 48 × 16 (+ Rahmen) | 3 Kacheln, nimmt bis zu 3 Pflanzen-Sprites auf. Muss sich klar vom Gras abheben: Holzrahmen mit Lichtkante und Eckpfosten, dunkle gefurchte Erde, Schlagschatten unten, heller Trampelrand, Schild in der Fähigkeitsfarbe |
| Gebäude je Fähigkeit | 32 × 32 bis 48 × 40 | Grundfläche 2 × 2 bis 3 × 2 Kacheln, Dach darf nach oben überstehen |
| Wohnhaus | 48 × 40 | |
| Truhengegenstand | 16 × 16 (hohe: 16 × 24) | z. B. Laterne, Vogelscheuche |
| Tier | 16 × 16 | 2–4 Frames Leerlauf |
| Bauer (Spielfigur) | 16 × 24 | 4 Richtungen × 4 Frames Gehen |
| Wilma (Porträt) | 32 × 32 | 3 Ausdrücke: freundlich, freut sich, nachdenklich |
| Symbole (Fähigkeiten, Status) | 16 × 16 | für Oberfläche und Truhe |

**Fußpunkt:** Bei allen Objekten unten Mitte. Die Szene sortiert nach diesem Punkt, wer weiter unten steht, wird vorne gezeichnet.

## 3. Lesbarkeit auf dem iPhone (Vorrang vor Detail)

1. **Ganzzahlig skalieren.** Die Szene wird nur 1×, 2× oder 3× vergrößert, nie krumm. In v7 wird die kompakte Szene auf dem iPhone krumm verkleinert (256 × 160 px auf ca. 240 × 150 pt). Dadurch verschwimmen einzelne Pixel. **v8:** Die kompakte Szene zeigt 1:1 (256 × 160 pt) oder einen Ausschnitt in 2×, Antippen öffnet den ganzen Hof.
2. **Silhouette vor Farbe.** Jede Pflanzenstufe und jedes Gebäude muss als einfarbige Silhouette erkennbar sein. Prüfe das in Aseprite mit einer schwarzen Ebene darüber.
3. **Mindestgrößen.**
   - Unterschiede zwischen Wachstumsstufen sind mindestens 3 px hoch oder breit.
   - Gebäudeausbau ist an der Form erkennbar, nicht nur an Details: ein neues Stockwerk, ein Anbau, ein Turm.
   - Das Hauptsymbol jedes Gebäudes (Mühlenflügel, Glasdach, Bücherturm usw.) ist mindestens 8 × 8 px groß.
4. **Kontrast.** Objekte heben sich durch Umriss und Schlagschatten vom Gras ab. Kein Objekt hat dieselbe Helligkeit wie sein Untergrund.
5. **Farbe trägt keine Information allein.** Fähigkeitsfarben erscheinen an Fahne, Dachakzent oder Früchten. Die Gebäudeform muss trotzdem eindeutig sein. Das ist wichtig für das Farbschema „Gut unterscheidbar“.

## 4. Farbe

**Palette:** `art/palette-stil-b.gpl` in Aseprite laden (Palette → Load). Sie enthält 81 Farben in Rampen:

| Gruppe | Stufen | Einsatz |
|---|---|---|
| Umriss & Nacht | 4 | tiefste Schatten, Umrisse auf hellem Grund, Nachtfarben |
| Gras, Laub | je 5 | Boden, Bäume, Pflanzen |
| Erde & Beet, Weg & Sand, Holz | je 5 | Beete, Wege, Gebäudeteile |
| Dach rot, Dach schiefer, Stein | je 5 | Gebäude |
| Putz & Stoff, Glas | je 4 | Wände, Fenster, Gewächshaus |
| Wasser | 5 | Teich, Fluss |
| Blüte rosa, Frucht rot, Frucht gelb | je 4 | Blüten und Früchte |
| Licht & Glut | 4 | Fensterlicht, Laternen, Abendlicht |
| Fähigkeiten | 8 | Fahnen und Akzente je Fähigkeit |

**Regeln:**
- **Farbtonverschiebung.** Schatten wandern in Richtung Blau-Violett, Lichter in Richtung Warmgelb. Die Rampen sind schon so angelegt, also keine eigenen Grautöne mischen.
- **Grundton in der Mitte der Rampe.** Die dunkelste Stufe ist für Schatten und Umrisse, die hellste nur für Glanzlichter (wenige Pixel).
- **Neue Farben nur in Absprache**, dann in `palette.py` ergänzen, damit `.gpl` und Vorschau aktuell bleiben.
- **Farbthemen der Oberfläche** (Ideenspeicher) betreffen nur die Bedienoberfläche, nicht die Hof-Grafik.

## 5. Umriss, Licht, Schatten

- **Umriss:** 1 px, in der dunkelsten Stufe der eigenen Rampe, also kein Schwarz. Die Innenkanten sind heller oder fehlen ganz („Selective Outlining“). Auf der Lichtseite (oben links) darf der Umriss eine Stufe heller sein.
- **Lichtrichtung:** von oben links, einheitlich für alle Grafiken.
  - Lichtkante: 1 px in der hellsten Stufe oben links.
  - Eigenschatten: unten rechts.
- **Schlagschatten:** weich und oval, nach unten rechts versetzt. **Als eigene Ebene liefern** (siehe 7). Die App zeichnet ihn mit einheitlicher Deckkraft (ca. 30 %, Blau-Violett), damit alle Schatten zusammenpassen.
- **Kein Anti-Aliasing gegen Transparenz:** Kanten zum transparenten Hintergrund sind hart, keine halbtransparenten Randpixel.
- **Dithering** sparsam und nur für große Flächen (Wasser, Himmel, Lichtkegel), nicht auf kleinen Sprites.

## 6. Licht-Ebenen für Tageszeit und Wetter

Die Stimmung entsteht in der App über Ebenen, nicht über eigene Varianten jeder Grafik:

| Ebene | Inhalt | Wird gezeichnet als |
|---|---|---|
| Tönung | eine Farbe je Tageszeit (Morgen, Tag, Abend, Nacht) | Multiplizieren über der Szene |
| Leuchten | Fenster, Laternen, Glühwürmchen, Gewächshaus innen | Addieren nach der Tönung, damit es abends leuchtet |
| Schatten | Schlagschatten aller Objekte | einheitliche Deckkraft, nachts ausgeblendet |
| Wetter | Wolkenschatten, Regen, Schnee, Blitz | Partikel bzw. Overlay |

Deshalb liefert der Artist bei Gebäuden und Lichtquellen **eine eigene Leucht-Ebene** mit, also nur die Pixel, die abends leuchten sollen.

## 7. Lieferformat (für Artist und Claude Code)

- **Arbeitsdateien:** Aseprite (`.aseprite`), eine Datei je Objektgruppe. Ebenen heißen genau `base`, `glow`, `shadow`. Ausbaustufen bzw. Wachstumsstufen sind Frames, getaggt mit `stufe-1` … `stufe-4` bzw. `keim` … `ausgewachsen`.
- **Export:** PNG-Spritesheet plus JSON (Aseprite: Export Sprite Sheet → Typ „Packed“, JSON „Array“, Layers getrennt). Die App und später Flutter/Flame lesen dieselben Dateien.
- **Dateinamen:** Kleinbuchstaben, ohne Umlaute, mit Bindestrich: `gebaeude-muehle.aseprite`, `pflanzen-beere.aseprite`, `deko-laterne.aseprite`.
- **Ordner im Repo:** `art/src/` (Aseprite), `public/sprites/` (Exporte). Die Exporte erzeugt ein Build-Skript, sodass Claude Code sie nicht von Hand pflegt.
- **Rechte:** vollständige, zeitlich unbegrenzte Nutzungsrechte, auch kommerziell, für alle Plattformen inklusive App Stores und Marketing. Nennung des Artists in der App unter „Mitwirkende“.
- **Keine KI-generierten Grafiken**, auch nicht als Vorlage (Marketingkonzept, Kritik 2). Bitte im Auftrag schriftlich bestätigen lassen.

---

## 8. Asset-Liste v8 (Reihenfolge = Produktionsreihenfolge)

Aufwand grob für Stil B, eine erfahrene Person. Bei einem Pixel-Artist hängen die Kosten vom Stundensatz ab.

### Paket 1 · Gebäude je Fähigkeit (Priorität hoch, ca. 70–90 h)

Jedes Gebäude hat **4 Ausbaustufen**: 1 Fundament/Baustelle · 2 Grundbau · 3 ausgebaut · 4 prächtig (Fahne in Fähigkeitsfarbe, Licht, Deko). Vorschlag für die Zuordnung zu Fähigkeitsstufen: 1–2 → Stufe 1, 3–5 → 2, 6–9 → 3, ab 10 → 4 (Festlegung in Leitfaden 5.4).

| Gebäude | passt zu Symbol | Erkennungszeichen (Silhouette) |
|---|---|---|
| Mühle | Stiefel (Körper, Ausdauer) | Steinturm mit Flügelkreuz |
| Archiv | Buch (Geist, Wissen) | breiter Steinbau mit Säulenvorhalle, Bogenfenstern und Schriftrollen; Stufe 4 mit Kuppel-Lesesaal |
| Gewächshaus | Blume (Kreativität, Natur) | Glasdach, Pflanzen innen |
| Schmiede | Kiste (Alltag, Ordnung) | offene Schmiede: Pultdach auf Pfosten, Esse mit Feuer und Kamin, Amboss, Wassertrog; Stufe 4 mit Funken und Blasebalg |
| Gemeinschaftshaus | Herz (Soziales) | Pavillon mit Bänken und Lichterkette |
| Musikpavillon | Note (Musik) | offener Rundbau mit Notenständer |
| Backhaus | Pfanne (Kochen) | Lehmofen mit Rauch |
| Kontor | Münze (Finanzen) | kleines Fachwerkhaus mit Waage-Schild |
| Scheune | (Standard, freie Fähigkeit) | rotes Satteldach mit Tor |

Gebäudetyp wird beim Anlegen bzw. Umbenennen einer Fähigkeit gewählt, mit Vorschlag passend zum Symbol.

### Paket 2 · Pflanzen (hoch, ca. 12–16 h)

- **4 Pflanzensorten × 5 Wachstumsstufen** (Keim, Setzling, Jungpflanze, Blüte, Ausgewachsen). Vorschlag: Beere, Blume, Kürbis/Gemüse, kleiner Baum. Die Sorte wählt man beim Anlegen der Gewohnheit, Früchte und Blüten tragen die Fähigkeitsfarbe.
- **Zusätzlich:** Variante „gemeistert“ (goldener Schimmer als Leucht-Ebene) und eine optionale Zwischenstufe „Knospe“ (Simulations-Kandidat).
- **Saisonal:** im Winter dieselben Sprites mit Schnee-Auflage als eigener Ebene. Keine eigenen Winter-Pflanzen.

### Paket 3 · Truhengegenstände (mittel, ca. 45–60 h)

**Ziel: 36 Gegenstände**, davon 20 % selten (7–8). Die 12 bestehenden werden im neuen Stil neu gezeichnet.

| Gruppe | Gegenstände | selten |
|---|---|---|
| Garten (8) | Blumenbeet ✓, Blumentopf ✓, Gießkanne, Sonnenblumen, Kräuterkiste, Rankbogen, Steinpfad, Vogeltränke | Brunnen ✓ |
| Wege & Hof (8) | Holzbank ✓, Laterne ✓, Fass ✓, Wegweiser ✓, Heuballen ✓, Zaunstück, Briefkasten, Schubkarre | Vogelscheuche ✓ |
| Tiere (6) | Huhn ✓, Ente ✓, Katze, Hase | Bienenstock ✓, Pfau |
| Frühling (3) | Tulpenreihe, Vogelhaus | Kirschbaum |
| Sommer (3) | Sonnenschirm, Hängematte | Teich-Seerosen |
| Herbst (3) | Kürbisstapel, Laubhaufen | Erntekrone |
| Winter (3) | Schneemann, Schlitten | Lichterbaum |
| Besonderes (2) | – | Sternwarte-Fernrohr, Windspiel |

✓ = gibt es schon (neu zeichnen). Saisonale Gegenstände lassen sich nur in ihrer Jahreszeit **finden**, bleiben danach aber dauerhaft in der Truhe. Es gibt kein Verpassen und keinen Countdown.

### Paket 4 · Landschaft und Zwischenbereiche (mittel, ca. 35–45 h)

**Grundsatz:** Zwischen den Arealen (Gebäude, Beete, Wege, Teich) liegt kein leeres Gras. Jeder Bereich hat einen eigenen Charakter:

| Bereich | Bepflanzung |
|---|---|
| Waldrand (Hofrand) | Bäume, die teils angeschnitten am Bildrand stehen; darunter Farn, Pilze, Baumstümpfe |
| Wegsäume | hohes Gras, Klee, einzelne Wildblumen; unregelmäßige Wegkante |
| Wiese | dichte Wildblumen in drei Farben, Lavendel, Klee; hellere Grasfläche |
| Teichufer | Schilf, Seerosen, bemooste Steine, Trittsteine vom Weg |
| Ruheecken | Baumstumpf, liegender Stamm, Pilze |
| Zwischenflächen | Büsche (rund, blühend), Steine |
| Boden | weiche Grasflächen in 3 Tönen und kleine Erdstellen gegen eintöniges Grün |

**Flora und Kleinteile (16 × 16):** Busch rund, Busch blühend, Farn, hohes Gras, Wildblumen gelb, weiß und rosa, Lavendel, Pilze, Schilf, Seerose, Stein klein, Stein bemoost, Baumstumpf, liegender Stamm, Trittstein, Kleefleck (17 Platzhalter vorhanden).

**Bäume (32 × 32):** Eiche, Tanne, Birke, Weide, jeweils in 4 Jahreszeiten (Platzhalter in der Sommerfassung vorhanden).

**Weitere Teile:**

- **Kacheln:** Gras in 4 Jahreszeiten, Weg mit Rändern, Wasser mit 4 Animations-Frames, Ufer-Übergänge (16 Kacheln je Übergang).
- **Gebäude und Ränder:** Wohnhaus mit 2 Varianten (Tag und Winter-Dach), Zaun, Steg.

### Paket 5 · Figuren (niedrig, ca. 15–20 h)

- **Bauer:** 4 Richtungen × 4 Frames
- **Wilma:** Porträt mit 3 Ausdrücken, dazu ein kleines Hof-Sprite
- **Tiere:** je 2–4 Frames Leerlauf (aus Paket 3)

### Paket 6 · Licht und Wetter (niedrig, ca. 8–12 h)

- **Partikel:** Regen- und Schnee-Frames, Blätter im Herbst, Glühwürmchen
- **Wolkenschatten:** als große, weich gerasterte Form
- **Farbwerte:** die Tönungsfarben je Tageszeit, als Zahlen in einer Datei

**Summe:** ca. 185–245 h. Das liegt im Rahmen der Schätzung für Stil B.

**Vorschlag für die Staffelung:**
- **v8a:** Pakete 1, 2 und die Technik dazu (Sprite-Sheets, ganzzahlige Skalierung, Gebäudewahl). Hier entsteht der größte sichtbare Gewinn.
- **v8b:** Paket 3 mit Sammelalbum und Saisonlogik, dazu die Farbthemen der Oberfläche.
- **v9:** Pakete 4 bis 6.

Bis neue Grafiken da sind, nutzt die App die bisherigen Zeichnungen weiter. Das Sprite-System fällt ohne Datei auf den alten Code zurück.

## 9. Abnahme je Grafik

- [ ] Nur Farben aus der Palette
- [ ] Umriss in der eigenen Rampe, Licht von oben links
- [ ] Schatten und Leuchten als eigene Ebenen
- [ ] Als Silhouette eindeutig, Stufen unterscheiden sich in der Form
- [ ] In der App bei 1× auf 390 pt Breite erkennbar (Screenshot auf dem iPhone)
- [ ] Mit Farbschema „Gut unterscheidbar“ und Abend-Tönung geprüft
- [ ] Ebenen- und Frame-Namen nach Abschnitt 7
