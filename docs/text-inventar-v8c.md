# Text-Inventar v8c „Ruhiger Bildschirm“

Jeder Text der Oberfläche aus v8.1 mit seinem neuen Ort. Grundlage: `src/ui.js` und `public/index.html` auf `main` (8.1.0). Konzept: `docs/ux-verschlankung-v8c.md`, Regel 4.

**Orte**
- **E1:** Ebene 1, sichtbar ohne Antippen.
- **IB:** Info-Blatt. Es öffnet über die Karte, ein „?“, „mehr“ oder einen Knopf; Erklärungen hinter „?“ stehen in `src/hilfe.js`.
- **ES:** Bildschirm Einstellungen (Zahnrad).
- **gleich:** Overlay oder Meldung, schon vorher erst auf Aktion sichtbar, unverändert.
- **entfällt:** nur, wenn der Text wörtlich doppelt vorkommt.

Verändert wurde nur, was ausdrücklich in der Tabelle steht. Alle anderen Texte stehen wörtlich am neuen Ort.

## Kopfzeile und Rahmen

| Text v8.1 | v8c | Notiz |
|---|---|---|
| „Life's a Game“ | E1 | |
| Datum „2. November · Herbst · Montag · Sonnig“ | E1 | Kurzform „Mo 2. Nov · Herbst · sonnig“, gleicher Inhalt |
| „Musik: an/aus“, „Effekte: an/aus“ | ES → Ton | Dazu ein Lautsprecher-Knopf auf dem Hof, beschriftet „Ton ausschalten / einschalten“ |
| Fußzeile „Speichert nur auf diesem Gerät · Sicherung unter Fortschritt“ | ES → Daten & Sicherung und Über die App | „Speichert nur auf diesem Gerät.“ Der Zusatz „Sicherung unter Fortschritt“ war ein Wegweiser zu einem Ort, den es nicht mehr gibt |
| Fußzeile „Demo-Hof · nichts wird gespeichert“ | ES → Daten (im Demo-Hof) | Zusätzlich steht die Demo-Leiste weiter auf E1 |
| Fußzeile „Prototyp v8.1.0“ | ES → Über die App | „Prototyp v8.2.0“ |
| Demo-Leiste „Du siehst einen Demo-Hof …“, „Demo beenden“ | E1 | unverändert |
| Szene-Beschreibung (aria-label) | E1 | unverändert |
| Legende unter dem Hof (Fähigkeit · Stufe, Beete) | E1 | Desktop unverändert, schmal ausgeblendet wie bisher |

## Wilma

| Text v8.1 | v8c | Notiz |
|---|---|---|
| „Wilma · Nachbarin“ | E1 | als „Wilma:“ vor dem Hinweis (Desktop und schmal) |
| „Antippen für mehr“ | E1 | jetzt ein Knopf „Mehr“, wenn es weitere Sprüche gibt |
| Hofsprüche (Schlaf, erste Gewohnheit, Plan zur Ankerzeit, Wochenziel, „Langer Tag?“, Gebäude wächst, Wetter, Logbuch, Gruß, „Alles erledigt“) | E1 | ein Spruch zur Zeit, Vorrang nach Regel 5 |
| „Glückwunsch! … ist gemeistert …“ | E1 (Meilenstein) | |
| „… läuft fast von allein. Magst du die Erinnerung abschalten?“ | E1 (Meilenstein) | Knopf „Ansehen“ öffnet das Info-Blatt der Gewohnheit |

## Heute

| Text v8.1 | v8c | Notiz |
|---|---|---|
| Überschrift „Heute“ | E1 | „Heute · x von y“ |
| „Hake ab, was du geschafft hast. An schlechten Tagen zählt die Mini-Version voll.“ | IB „?“ (heute) | beim ersten Besuch einmal offen |
| Zwischenüberschrift „Gewohnheiten“ | entfällt | steht wörtlich als Tab „Gewohnheiten“; die Liste folgt direkt auf „Heute · x von y“ |
| Karte: „Nach … · ca. 08:00“ | E1 | als „8 Uhr · nach …“ in der Kontextzeile, vollständig im IB |
| Karte: Titel | E1 | |
| Karte: Stufe · Stärke % | E1 (Abzeichen) und IB | Abzeichen zeigen Pflanze und %; Stufenname im IB und für Screenreader |
| Karte: Fähigkeit +XP | IB | „Körper · +10 XP je Erledigung“ |
| Karte: „x× diesen Monat“ / „x von y diese Woche“ | IB bzw. E1 | Wochenstand bleibt auf E1 (Kontextzeile) |
| Karte: Serie „x in Folge“ | E1 (Abzeichen Flamme) und IB | |
| Karte: Regentage-Knopf und Erklärung | IB (Zeile Serie, „?“ regentage) | |
| Karte: „Mini: …“ | IB und Bestätigung | Die Bestätigung nach „Mini“ nennt den Mini-Text |
| Mini-Knopf | E1 | Knopf „Mini“, Mini-Text als Beschriftung für Screenreader |
| „Gestern ist nichts eingetragen. Doch erledigt?“, „Nachtragen“, „Mini nachtragen“, „Nein, ist ausgefallen“ | E1 (Zeile „Gestern offen: …“, Knopf „Eintragen“) und IB | Im IB stehen „Erledigt“, „Mini: …“ und die Extra-Runde |
| „… ist ausgefallen. Mach heute eine Runde extra …“, „Extra-Runde erledigt“ | IB (Nachtragen) | |
| „Gestern und vorgestern“ | E1 | als „Gestern / Vorgestern offen:“ je Zeile |
| „Vergessen einzutragen? … zurück.“ (34 Wörter) | IB „mehr“ (nachtragen) | auf E1 der Satz „Nachtragen zählt voll“ |
| „nachgetragen“, „von einem Regentag gerettet“, „mit einer Extra-Runde gerettet“ | E1 | als Status in der Zeile |
| Banner „Als App installieren: …“, „Verstanden“ | E1 (Wilma, Meilenstein) und ES → Über die App | |
| Banner „Eine Woche geschafft! Wenn du magst, kannst du jetzt weitere Gewohnheiten pflanzen.“, „Gewohnheit pflanzen“, „Später“ | E1 (Wilma, Meilenstein) | **gekürzt** auf „Eine Woche geschafft! Magst du noch etwas pflanzen?“ (Wortlaut der Konzept-Vorschau), Knöpfe „Pflanzen“ / „Später“ |
| Banner „Ein neuer Monat beginnt …“, „Gewohnheiten ansehen“, „Später“ | E1 (Wilma, Meilenstein) | Knöpfe „Ansehen“ / „Später“ |
| „Check-in für heute öffnen“ | E1 (Wilma: Check-in) | „Magst du kurz auf deinen Tag schauen? Der Check-in dauert keine halbe Minute.“, Knöpfe „Check-in“ / „Später“ |
| „Heute frei“, „Wochenziel erreicht: x von y“, „Heute nicht geplant · …“ | E1 | „Heute frei:“ mit Namen als Knöpfen; Grund für Screenreader und im IB |
| „To-dos“ | E1 | „To-dos · n“ mit „?“ |
| To-do-Formular (Platzhalter, Aufwand, Fähigkeit, „Geplant für (optional)“, „Hinzufügen“) | IB „+ To-do“ | Titel Pflicht, der Rest unter „Mehr: Aufwand, Fähigkeit, Datum“ |
| To-do: „Für heute geplant“ / „Geplant für …“ | E1 (Kurzform) und IB | |
| To-do: Fähigkeit und +XP | IB | |
| „Keine offenen To-dos.“ | entfällt | „To-dos · 0“ sagt dasselbe |
| „Heute steht keine Gewohnheit an.“, „Noch keine Gewohnheit …“ | E1 | |

## Gewohnheiten

| Text v8.1 | v8c | Notiz |
|---|---|---|
| Einleitung „Jede Gewohnheit hängt an einer Routine …“ | IB „?“ (gewohnheiten) | |
| „Neue Gewohnheit“ + Vorlagen-Knöpfe + Formular | E1: „+ Gewohnheit“ und Vorlagen; Formular im IB | |
| Formular (Schritte 1–6, Hinweise, Vorschau, Fehler) | IB | Wortlaut unverändert |
| Wilma „Drei Beete sind für den Anfang genug …“ | E1 | als Kontextzeile |
| „Aktiv · n“, „Pausiert · n“ | E1 | |
| „Pausierte Gewohnheiten zählen nicht als verpasst …“ | IB „?“ (gewohnheiten) | |
| Karte: Plan, Rhythmus, Aufwand, Mini, Fähigkeit, Stärke, „Tag x von etwa 66“, Serie, Gesamt, „Wilma erinnert“, Stärke-Balken | IB | Auf E1 stehen Titel, Anker · Rhythmus und Abzeichen. „Tag x von etwa 66“ steht nur noch im IB, nicht mehr bei jeder Gewohnheit |
| „Gemeistert“, „Pausiert“ (Abzeichen) | E1 | |
| „Läuft fast von allein: … Abschalten“ | IB und Wilma | |
| „Bearbeiten“, „Pausieren“, „Fortsetzen“, „Löschen“ | IB | neu: „Kalender“ |
| „Neuer Aufwand oder Rhythmus gilt ab heute …“ | IB (Bearbeiten) | |

## Logbuch

| Text v8.1 | v8c | Notiz |
|---|---|---|
| Einleitung „Ein Eintrag pro Tag schließt den Tag ab …“ | IB „?“ (logbuch) | |
| Wetterwahl, „Frage des Tages“, „Andere Frage“, Eingabe, „Tag abschließen · +10 XP“ | E1 | unverändert |
| „Tag abgeschlossen …“, Eintrag, „Bearbeiten“ | E1 | unverändert |
| Wochenrückblick | E1 | unverändert |
| „Tagebuch im Farmhaus“ und Einträge | E1 | unverändert |

## Fortschritt

| Text v8.1 | v8c | Notiz |
|---|---|---|
| „Du vergleichst dich hier nur mit dir selbst …“ | IB „?“ (fortschritt) | |
| Level, Erfahrung, „Noch x× … bis …“ | E1 | |
| Fähigkeiten mit Stufe, Gebäude, XP, „Ändern“, „+ Neue Fähigkeit“ | E1 | |
| „Verlauf der Fähigkeiten · letzte 30 Tage“ mit Kurven | IB (Fähigkeit antippen) | „Letzte 30 Tage: +x XP“ und Kurve |
| „Erntekalender“, Auswahl, Jahr, Kalender | E1 | mit „?“ |
| „Tippe auf einen Tag, um Datum und Status zu sehen.“ | E1 | |
| Statistik („x erledigt in …“) | E1 | |
| Legende mit Erklärungen (7 Einträge) | E1 (Kurznamen) und IB „?“ (kalender) | Die Erklärungen stehen im IB |
| „Monatsrückblick …“ mit 5 Kacheln | E1 | als Abzeichen mit Symbol, Zahl und Kurzwort; Langform für Screenreader |
| „Ruhmeshalle“ | E1 | als „Gemeistert“ mit „?“ |
| „Noch keine gemeisterte Gewohnheit. Hält eine Gewohnheit 30 Tage ohne Erinnerung, landet sie hier.“ | E1 und IB „?“ (gemeistert) | „Noch keine gemeisterte Gewohnheit.“ auf E1, der Rest genauer im IB |
| Darstellung (Schrift, Thema, Farben, Schriftart) und Erklärung | ES → Darstellung | Erklärung im IB „?“ (darstellung), neu: Akzentfarbe |
| „Vorläufige Grafiken: …“ | ES → Über die App | |
| „Selbsttest · Beta-Zahlen“, Kacheln, Hinweise, Knöpfe | ES → Beta-Zahlen | Hinweise im IB „?“ (beta) |
| „Deine Daten“, Hinweis, Sicherung, Import, Löschen, Einfügen, Wiederherstellen | ES → Daten & Sicherung | Hinweis im IB „?“ (daten) |
| „Tipp: In Safari über ‚Teilen‘ …“ | ES → Über die App | |

## Truhe

| Text v8.1 | v8c | Notiz |
|---|---|---|
| Einleitung „Bei jeder Erledigung kann etwas …“ | IB „?“ (truhe) | |
| „Die Farm schläft …“ | E1 | |
| „Funde · x von y Plätzen belegt“, Gegenstände, „Aufstellen“, „Kein Platz frei“ | E1 | |
| „Die Truhe ist leer …“ | E1 | |
| „Auf dem Hof“, „Läuft frei herum“, „Platz n“, „Einlagern“ | E1 | |
| „Noch nichts aufgestellt.“ | E1 | |
| „Mit jedem Level wird ein weiterer Deko-Platz frei (Level x: y Plätze).“ | IB „?“ (truhe, fortschritt) | Die Platzzahl steht in „Funde · x von y Plätzen“ |
| Sammelalbum, Gruppen „x von y gefunden“, Kacheln, Silhouetten, „Findbar im …“ | E1 | Gruppen eingeklappt, die erste offen |
| „Wie Funde entstehen“ mit Regeln und Zahlen | IB „Wie funktionieren Funde?“ | Zahlen und Regeln gleich, Sätze gekürzt |
| „Häufige Funde / Seltene Funde / Jetzt findbar …“ (Listen) | entfällt | Dieselben Namen stehen im Sammelalbum, mit Jahreszeit |

## Overlays und Meldungen

Onboarding, Check-in, Großansicht, Level-Aufstieg und alle Bestätigungen bleiben unverändert (**gleich**). Geändert sind nur zwei Texte:
- Die Bestätigung nach „Mini“ nennt jetzt den Mini-Text.
- Neu ist die Bestätigung „Notiert.“ nach „+ To-do“.
