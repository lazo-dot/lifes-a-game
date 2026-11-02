# Archiv: erledigte Arbeitslisten aus CLAUDE.md

Mit 8.2.1 aus `CLAUDE.md` hierher verschoben (nichts gelöscht). Die aktuelle Arbeitsliste steht künftig nur in der jeweiligen Auftragsdatei unter `docs/auftraege/`.
Neueste zuerst. v5–v7 stammen aus älteren Ständen von `CLAUDE.md` (Commits 985e47f, 4507dfa, c93fdb2), v8a–v8c aus dem Stand 8.2.0.

Hinweise zu Skripten: `tools/ux/screenshots-v8a.js` und `screenshots-v8c.js` sind seit 8.2.1 in `npm run abnahme` (`tools/abnahme.js`) aufgegangen; `tools/ux/aufgaben-v8c.js` startet seinen Server selbst (`node tools/ux/aufgaben-v8c.js`).

## Arbeitsliste v8c – Ruhiger Bildschirm (Version 8.2.0, erledigt)

Grundlage: `docs/ux-verschlankung-v8c.md` (Regeln 1–8, Tabelle Abschnitt 5, Ziele Abschnitt 6). Keine Änderung an Spielregeln, Speicherschema oder Daten.

**Muss (H)**
- **8.1.1:** Leerer Abhak-Kasten mit Rand in `--text-soft` (≥ 3:1), Titel-Schatten in Pergament, Test für Nicht-Text-Kontrast.
1. **Info-Blatt** als eine Komponente (`src/sheet.js`): von unten, Ziehgriff, schließt per daneben tippen, Wischen, Escape, Knopf (44 pt); `role="dialog"`, Fokus hinein und zurück; ohne Animation bei reduzierter Bewegung.
2. **Kompakte Gewohnheitskarten** (Heute, Gewohnheiten): Haken, Titel, Anker mit Uhrzeit, Abzeichen, Mini. Karte antippen öffnet das Info-Blatt mit allen Angaben und Bearbeiten, Kalender, Pausieren. Die Bestätigung nach Mini nennt den Mini-Text.
3. **Erklärungen hinter „?“** (`src/hilfe.js`, ≤ 60 Wörter, 44 pt), beim ersten Besuch einmal offen (localStorage).
4. **Nachtragen** als eine Zeile je offenem Tag, Erklärung hinter „mehr“.
5. **Wilma:** ein Hinweis zur Zeit (Nachtrag, Check-in, Meilenstein, Hofspruch).
6. **„+ To-do“** als Blatt, nur Titel Pflicht, der Rest unter „Mehr“.
7. **Einstellungen** (Zahnrad): Darstellung, Ton, Daten & Sicherung, Beta-Zahlen, Über die App; keine Fußzeile, kein Musik/Effekte in der Kopfzeile.
8. **Fortschritt** und **Truhe** verschlankt (Erklärungen hinter „?“, Album eingeklappt, Funde als Info-Blatt).
9. **Schrift in drei Ebenen** und **Akzentfarbe** (`accent`, `farbthemen.json` → akzente).

**Pflicht:** Text-Inventar `docs/text-inventar-v8c.md`. **Messung:** `node tools/ux/screenshots-v8c.js` (Ziele aus Abschnitt 6), Aufgaben: `tools/ux/aufgaben-v8c.js`.

## Arbeitsliste v8b (erledigt, 8.1.0 auf main)

Grundlage: Leitfaden 4.4 und 5.4, Style-Guide Paket 3 und Staffelung, `art/platzhalter/README.md`. v8a (Sprite-System, Skalierung, Gebäude, Pflanzen, Karte) ist auf `main`.

**Muss (H)**
1. **Gegenstände aus dem Katalog:** `ITEMS` nach `art/platzhalter/deko/deko-katalog.json` (37 Deko + 5 Tiere, Gruppe, selten, Jahreszeit, Tier), die 12 bisherigen IDs bleiben; Test auf Übereinstimmung. Saisonale nur in ihrer Jahreszeit findbar (Herbst = Sep–Nov usw.), gefunden bleiben sie. Ziehung: Fund und Seltenheit wie bisher, dann gleichverteilt aus den jetzt findbaren (`LAG.findable`, `pickItem`, `rollDrop` mit Tag). Fundchancen-Anzeige zeigt die jetzt findbaren.
2. **Sammelalbum in der Truhe:** Gruppen Garten, Hof, Selten, Tiere, Jahreszeiten mit „x von y gefunden“; gefundene mit Bild und Name, offene als Silhouette mit Name und „Findbar im …“. Kein Countdown, keine Vollständigkeits-Prozente, kein Hinweis auf Verpasstes. Tap-Flächen ≥ 44 pt, Information nicht nur über Farbe.
3. **Deko und Tiere als Sprites:** Sheet `deko` (16 × 24) auf den Deko-Plätzen, Schatten und Leucht-Ebene; Tiere aus `tiere` mit 2 Frames Leerlauf (pingpong, 500 ms) auf freien Plätzen, bei reduzierter Bewegung still. Rückfall auf die bisherige Zeichnung.
4. **Wohnhaus und Bauer als Sprites:** `wohnhaus` (Fenster leuchten abends), `bauer` 4 Richtungen × 4 Frames entlang des Wanderwegs, Animation nur beim Gehen, bei reduzierter Bewegung kein Laufen.
5. **Farbthemen:** 7 Themen nach `docs/farbthemen.json` (Standard, Wald, Herbst, Frost, Meer, Kirschblüte, Pergament hell) und „Passend zur Jahreszeit“, nur Oberfläche (nicht die Hof-Grafik), WCAG AA mit Test aller Paare, kombinierbar mit „Gut unterscheidbar“, Auswahl in Fortschritt → Darstellung mit Vorschau.

**Nicht in v8b:** Freischaltungen (v9, Entscheidung 7 offen), umherlaufende Tiere, Wetter-Partikel, Gebäude-Animationen, Regeländerungen, Flutter.



## Arbeitsliste v8a (erledigt, 8.0.0 auf main)

Grundlage: `docs/pixel-styleguide-stil-b.md` (Abschnitte 2, 3, 6, 7, 8), Leitfaden 5.4, `art/platzhalter/README.md`. Entwickelt auf Branch `v8a`, nach Freigabe als 8.0.0 nach `main` gemergt und auf GitHub Pages veröffentlicht; Selbsttest und Usability-Test laufen auf v8a. Regeln, Stärke, XP, Funde und Graduierung bleiben unverändert.

**Muss (H)**
1. **Sprite-System:** Loader für Aseprite-JSON (Array) + PNG mit Ebenen base/glow/shadow, Frame-Tags, `meta.anchor`, `meta.platzhalter` (`src/sheets.js`). Build kopiert die Exporte nach `public/sprites/` (`tools/sprites.js`, Quelle `art/src/` vor `art/platzhalter/`); der Service Worker cached sie. Fehlt eine Datei: Rückfall auf den bisherigen Zeichencode. Reihenfolge: Boden → Schatten (eine Farbe, 30 %, nachts aus) → base nach Fußpunkt-y → Tönung (multiplizieren) → glow (addieren); kein Glätten.
2. **Ganzzahlige Skalierung:** Szene logisch 256 × 160, nur 1×/2×/3× in CSS-Pixeln, Canvas = CSS-Größe × devicePixelRatio. iPhone kompakt 1:1 (256 × 160 pt). Antippen öffnet die Großansicht (größter ganzzahliger Faktor, verschiebbar, Schließen 44 pt).
3. **Gebäude je Fähigkeit:** `skill.buildingType` (muehle, archiv, gewaechshaus, schmiede, gemeinschaftshaus, musikpavillon, backhaus, kontor, scheune), Migration nach Symbol, Auswahl als Raster mit Namen (≥ 44 pt). Ausbaustufe 1–2 → 1, 3–5 → 2, 6–9 → 3, ab 10 → 4 (`LAG.buildingStage`).
4. **Pflanzen und Beete:** `habit.plantType` (beere, blume, kuerbis, baeumchen), Wachstumsstufen keim … ausgewachsen + gemeistert (`LAG.plantFrame`). Beete 48 × 16 nach Style-Guide 2, bis zu 3 Pflanzen je Beet.
5. **Hof als Karte:** `public/sprites/hof-karte.json` mit Plätzen und Zonen, Streuung per festem Seed. Statische Ebenen nur bei Änderung neu zeichnen.

**Sollte (M):** Stufe-4-Gebäude, Gewächshaus und Schmiede leuchten abends (glow). Hinweis „Vorläufige Grafiken“ in den Einstellungen, solange `meta.platzhalter` gilt.

**Nacharbeit v8a.1:** Kompakte Szene ohne Seitenstreifen (logische Breite = floor(verfügbare Breite / Faktor), Kern 256 × 160 mittig, Ränder nur Natur aus den Randzonen der Karte); Großansicht mit dem größten Faktor, bei dem die Höhe passt (iPhone 3×), verschiebbar, Hinweis „Zum Umsehen wischen“.

**Nicht in v8a:** Truhengegenstände (Paket 3), Farbthemen, Figuren, Tiere, neue Wetter-Partikel, Flutter.

## Arbeitsliste v7 – Bedienbarkeit (Funde aus `docs/ux-heuristische-evaluation-v6.md`)

Referenzgerät: iPhone, 390 × 844 pt, Safari und als installierte App. Prüfen mit `npm start` und den Browser-Werkzeugen auf dieser Größe, zusätzlich auf Desktop-Breite (dort darf das bisherige Layout bleiben).

**Muss (H)**
1. **U1 – Abhaken ohne Scrollen.** Auf schmalen Bildschirmen ist der erste Haken im Tab „Heute“ ohne Scrollen sichtbar. Vorschlag: Tab-Leiste fest unten (Symbol + kurzer Text, Safe Area beachten), Hof-Szene kompakt oben, Erfahrung und Fähigkeiten in den Tab „Fortschritt“ oder einklappbar. Wilma bleibt erreichbar, aber nicht vor der Liste. Damit erledigt sich U15 (Tabs in zwei Zeilen).
2. **U17 – Keine Information nur im Tooltip.** Alles, was heute nur über `title` erklärt wird (Regentage, Kalenderkacheln inkl. „nachgetragen“), lässt sich antippen: kleines Info-Feld bzw. bei Kalenderkacheln Datum + Status. `title` darf zusätzlich bleiben.
3. **U8/U9 – Regentag und Nachtragen verständlich.** Wenn ein Tag mit verbrauchtem Regentag nachgetragen wird, sagt die App das: „Dein Regentag ist wieder frei.“ (Die Logik leitet das bereits ab – prüfen und per Test absichern.) Im Bereich „Gestern und vorgestern“ einen Satz ergänzen, dass Nachtragen einen Regentag zurückgibt. „Nachgeholt“ in der Oberfläche einheitlich „Extra-Runde“ nennen; Kalenderlegende mit einem kurzen Satz je Zustand.
4. **U12/U13 – Tap-Flächen und Haken.** Alle Bedienelemente mindestens 44 × 44 pt (Haken, Mini, To-do-Löschen, Kalender-Pfeile, Chips). Der Haken ist im Ruhezustand als Haken-Feld erkennbar (z. B. Haken-Symbol gedimmt); Mini als gleichwertige zweite Option daneben. Löschen-× mit Abstand zum Haken.

**Sollte (M)**
5. **U3** Zahlen auf der Heute-Karte mit Kurztext statt nur Symbol („90 in Folge“, „2 Regentage“).
6. **U4/U5/U6 Wortwahl:** Kopfzeile „1. November · Herbst“ statt „Tag 1“; ab Tag 66 „Tag 93 · die üblichen 66 Tage sind geschafft“; „Noch 3× Dehnen bis Körper Stufe 2“ statt „Einheiten“.
7. **U11** Schalter „Erinnerung“ heißt bis zur Flutter-Version „Wilma erinnert in der App“ (mit einem Satz Erklärung).
8. **U10** Versionsanzeige aus `package.json`; `package.json` auf 7.0.0.
9. **U2** Hinweise (Toasts) unten über der Tab-Leiste, verdecken keine Bedienelemente.

**Kann (N)**
10. **U14** Anlegen-Formular: Schritte 5–6 (Fähigkeit, Aufwand, Optionen) einklappbar mit sinnvollen Vorgaben, damit das Formular kürzer wirkt. Keine Pflichtfelder entfernen.
11. **U16** Option „Lesbare Schrift“ unter Darstellung: Fließtext in einer gut lesbaren Systemschrift, Überschriften und Zahlen bleiben Pixel-Schrift.

**Nicht in v7:** Spielregeln, neue Mechaniken (Etappen-Weg, Knospe, Tagesrhythmus, Freischaltungen, Vorlagen-Ausbau), Sprite-Sheets/Grafikstil – das wird nach Selbsttest und Usability-Test entschieden.

## Arbeitsliste v6

Lars nutzt v5 gerade im Selbsttest auf dem iPhone. **Seine Daten müssen das Update unverändert überstehen** (gleiches Speicherschema oder saubere Migration, Test dafür).

**Muss (H)**
1. **Nachtragen (Leitfaden 4.3, 4.4, 5.5, Datenmodell `lateLogs`):**
   - Gestern und vorgestern lassen sich als erledigt oder Mini nachtragen (und wieder zurücknehmen); ältere Tage nicht.
   - Nachgetragene Einträge zählen voll für Stärke, Serie, XP und Ernte, würfeln aber keinen Zufallsfund.
   - Im Erntekalender dezent markiert (Muster/Symbol, nicht nur Farbe – Barrierefreiheit).
   - Die „Extra-Runde“ erscheint erst, wenn der Tag nicht nachgetragen wurde; zuerst wird „Gestern doch erledigt? Nachtragen“ angeboten.
   - UI-Ort nach eigenem Ermessen (z. B. Tab „Heute“ → kleiner Bereich „Gestern“), ohne Schuldton.
2. **Erreichbare Graduierung (Leitfaden 4.5):**
   - Ausschleichen-Vorschlag ab Stärke ≥ 0,6 und 12 von 14 geplanten Terminen gehalten (Mini, Regentag, nachgeholt zählen; Wochen-Gewohnheiten: Wochenziel der letzten zwei Wochen erreicht).
   - „Gemeistert“ = erster Tag mit 30 Tagen ohne Erinnerung und ≥ 70 % gehaltenen Terminen in diesen 30 Tagen; bleibt dauerhaft.
   - Regentag und nachgeholt setzen den Zähler `run` nicht mehr auf 0 (bisher `computeHabit`). Prüfen, wo `run` sonst noch genutzt wird.
   - Bereits gemeisterte Gewohnheiten bleiben gemeistert.
3. **Tests:** neue Regeln vollständig abdecken (Nachtragen-Grenzen, kein Fund beim Nachtragen, Graduierung mit 70 %, kein Reset durch Regentag/nachgeholt, Migration bestehender v5-Daten). Bestehende Tests anpassen, wo sie die alten Schwellen prüfen – im Commit begründen.
4. **Simulation gegen v6:** Die Simulation nutzt für Ausschleichen und „Gemeistert“ die Regeln der App (`suggestOff`, `graduated`). Unter v5 ergibt `OPT=backfill node tools/sim/sim72.js 300` null gemeisterte Gewohnheiten. Mit der v6-Logik sollte derselbe Aufruf in die Nähe der Simulationsvariante `backfill,grad` kommen (Referenzlauf im Koordinations-Chat: Personen mit „Gemeistert“ 49 %, „gehalten“ Tag 66 90 %, abgeschaltete Erinnerungen 1,55 je Person). Ergebnis (Kennzahlen „anyGraduated“, „held66“, „remOffPerUser“ gemittelt über Personas) in der Zusammenfassung berichten; deutliche Abweichungen begründen.

**Nicht in v6** (wird nach dem Selbsttest entschieden): Etappen-Weg zu „Gemeistert“, Zwischenstufe „Knospe“/Wochenernte, Tagesrhythmus, Freischaltungen, Saatgut-Liste, mehrere Anker.

## Arbeitsliste v5 (Priorität aus der Checkliste)

**Muss (H)**
1. Repo-Struktur aufräumen (`src/` je Modul, `tests/`, `docs/`, `public/` mit Manifest, Icons, `sw.js`).
2. Tests: alle Formeln aus Leitfaden 4.1–4.5 und Abschnitt 3 abdecken (Stärke, Wochenziel anteilig, Pausen, Regentage, Reparatur, Serie, XP inkl. Anti-Farming, Level, Graduierung, Ernte einmal pro Stufe). `npm test` muss grün sein, bevor committet wird.
3. Echte PWA: Web-App-Manifest, Service Worker mit Offline-Cache, Hosting unter HTTPS (Vorschlag: GitHub Pages, Alternative Netlify). Ziel: Lars installiert die App über Safari → „Zum Home-Bildschirm“ und nutzt sie offline.

**Sollte (M)**
4. Fundchancen in der App offen anzeigen (Truhe → „Wie Funde entstehen“).
5. Barrierefreiheit: skalierbare Schrift, Symbole zusätzlich zur Farbe (Erntekalender, Status), VoiceOver-/ARIA-Labels, farbenblind-taugliche Palette.
6. Beta-Metriken lokal erfassen und exportierbar machen (Leitfaden 9): gehaltene/gemeisterte Gewohnheiten nach 30/66 Tagen, Mini-Nutzung, Rückkehr nach Serienbruch, Check-in-Quote. Keine Übertragung an Server.
7. Erinnerungen über die installierte PWA prüfen (Web Push auf iOS nur bei installierter App ab iOS 16.4). Wenn ohne Server nicht sinnvoll machbar: dokumentieren und für Flutter vormerken.

**Kann (N)**
8. Schrittweise Freischaltung von Inhalten über die ersten Wochen.
9. Teilbare Karten (Woche, Erntekalender, Gemeistert) als Bild.
