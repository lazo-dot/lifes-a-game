# Life's a Game – Testleitfaden Usability-Test (Prototyp v6)

Stand: 02.11.2026 · Durchführung auf **Prototyp 8.2.1** (Wege aus v8c: Karte antippen öffnet das Info-Blatt mit Bearbeiten/Pausieren, Sicherung im Bildschirm Einstellungen; Grafiken sind vorläufige Platzhalter) · **Kurztest jetzt (Abschnitt 0), voller Test auf v10** · Bezug: [Heuristische Evaluation v6](ux-heuristische-evaluation-v6.md) · Durchführung: Lars

## 0. Kurztest jetzt (8.2.1, 1–2 Personen, ca. 20 Minuten)

Zweck: früh prüfen, ob die Grundbegriffe (Anker, Mini, Nachtragen, Regentag, Stärke) verstanden werden, bevor v9 die Welt komplexer macht. Nicht auf den vollen Test warten.

- **Personen:** 1–2 aus dem Umfeld, die die App noch nicht gesehen haben; möglichst T1 (60+, spielt kaum) oder T4 (nutzt eine Habit-App).
- **Vorbereitung:** wie Abschnitt 3 (Sicherung deiner Daten, Test-Hof im Safari-Tab auf der Hauptadresse, nicht in der installierten App).
- **Ablauf:** Einleitungstext und Einverständnis (Abschnitt 4) · Aufgaben **1, 2, 3, 7** (Abschnitt 5) · Verständnisfragen **1–3** (Abschnitt 7) · Abschlussfragen „Was hat dich verwirrt?“ und „Würdest du sie nutzen?“. SUS entfällt (bei 1–2 Personen ohne Aussagekraft).
- **Notieren:** Beobachtungsbogen (Abschnitt 8) nur für diese Zeilen, wörtliche Zitate.
- **Ergebnis:** Bögen oder Stichpunkte hier in den Chat oder in `docs/feedback.md`. Funde, die v9 betreffen (Begriffe, Hof-Verständnis), fließen direkt in den v9-Auftrag.
- **Unbegleitete Ergänzung:** Fragebogen „Hof-Testrunde“ zum Weiterleiten, https://lazo-dot.github.io/lifes-a-game-test/ (ohne Anmeldung; Start mit leerem Hof, Aufgaben Anlegen/Abhaken/Mini/Ändern/Pausieren/Hof/Logbuch, Verständnisfragen, SUS). Ersetzt den begleiteten Kurztest nicht: Lautes Denken, Nachtragen und Regentag fehlen dort.

## 1. Ziel und Rahmen

- **Ziel:** Prüfen, ob Menschen ohne Vorwissen die Kernabläufe schaffen, die Spielregeln verstehen und den Hof lesen können. Im Fokus stehen die Funde U1, U8, U12, U13, U14 und U17 der heuristischen Evaluation sowie die v8a-Neuerungen (Gebäudewahl, Pflanzensorte, Großansicht).
- **Methode:** moderierter Test mit lautem Denken, danach SUS-Fragebogen und Verständnisfragen.
- **Umfang:** 5 Personen, je ca. 35 Minuten.
- **Ergebnisse:** Erfolgsquote, Zeit und Fehler je Aufgabe, SUS-Wert, Verständnis, Liste der Probleme mit Schweregrad. Sie fließen zusammen mit Selbsttest und Simulation in v10.

## 2. Teilnehmende

Fünf Personen, möglichst gemischt nach den Simulations-Personas. Niemand sollte die App vorher gesehen haben.

| # | Profil | Warum |
|---|---|---|
| T1 | 60+, nutzt das Smartphone, spielt kaum | Lesbarkeit, Tap-Flächen, Begriffe |
| T2 | 18–25, spielt Cozy-Games (z. B. Stardew) | Zielgruppe, Spiel-Erwartungen |
| T3 | berufstätig mit Familie, wenig Zeit | Schnelligkeit des täglichen Ablaufs |
| T4 | nutzt schon eine Habit-App (z. B. Habitica, Finch, Streaks) | Vergleich, Umstieg |
| T5 | wenig Struktur im Alltag oder Schichtarbeit | Anker, Nachtragen, Regentage |

## 3. Vorbereitung

**Wichtig: deine eigenen Selbsttest-Daten schützen.**
1. Vor der ersten Sitzung in deiner installierten App: Zahnrad (Einstellungen) → Daten & Sicherung → „Sicherung erstellen“.
2. Getestet wird **nicht in der installierten App**, sondern in einem **normalen Safari-Tab** auf `https://lazo-dot.github.io/lifes-a-game/`. Auf dem iPhone speichert ein Tab getrennt von der App vom Home-Bildschirm, deine Daten bleiben also unberührt. Wenn möglich: ein zweites Gerät oder das Gerät der Testperson.

**Test-Hof vor jeder Sitzung neu erzeugen** (passt sich ans heutige Datum an):
1. Im Repo: `node tools/ux/testhof.js > testhof.json`
2. Inhalt der Datei aufs iPhone bringen (z. B. per AirDrop oder Notiz) und kopieren.
3. Im Safari-Tab: Willkommen → „Sicherung importieren“ → Text einfügen → „Wiederherstellen“. Bei einem bereits benutzten Tab: Zahnrad → Daten & Sicherung → „Oder Sicherungstext einfügen“ → Text einfügen → „Prüfen“ → „Wiederherstellen“.

**Hinweis an die Testperson (beim Einleitungstext):** Die Grafiken sind vorläufig und werden noch ersetzt. Bewertet wird die Bedienung, nicht die Optik.

Der Test-Hof enthält:
- drei Gewohnheiten seit 20 Tagen: „10 Minuten lesen“ täglich mit Serie, „Spazieren gehen“ 3× pro Woche, „5 Minuten dehnen“ täglich;
- „10 Minuten lesen“ ist gestern nicht eingetragen, die App hat dafür automatisch einen Regentag verbraucht (prüft Fund U8);
- drei Funde in der Truhe, zwei Logbuch-Einträge und ein offenes To-do;
- zwei Fähigkeiten (Körper → Mühle, Geist → Archiv), beide noch in frühen Ausbaustufen.

**Weitere Vorbereitung:**
- Uhrzeit: zwischen 8 und 21 Uhr testen. Ab 22 Uhr „schläft die Farm“, dann lässt sich nicht dekorieren (Aufgabe 6).
- Musik aus, Effekte an.
- Einverständnis und Beobachtungsbogen ausdrucken, Stoppuhr bereithalten.
- Optional eine Bildschirmaufnahme in iOS mit Mikrofon, nur mit Einverständnis.

## 4. Ablauf (ca. 35 Minuten)

| Phase | Dauer |
|---|---|
| Begrüßung, Einverständnis, kurze Vorfragen | 5 min |
| 8 Aufgaben mit lautem Denken | 20 min |
| SUS-Fragebogen | 3 min |
| Verständnisfragen und Abschlussgespräch | 7 min |

### Einleitungstext (vorlesen)

> „Danke, dass du mitmachst. Ich zeige dir eine App, die ich gerade entwickle: Man pflegt damit Gewohnheiten und To-dos, und dazu wächst ein kleiner Hof. Getestet wird die App, nicht du. Du kannst nichts falsch machen, und wenn etwas nicht klappt, liegt es an der App, genau das will ich herausfinden.
> Bitte denk laut: Sag, was du siehst, was du erwartest und was dich überrascht. Ich werde wenig helfen, weil ich sehen möchte, wie die App ohne mich funktioniert. Wenn du nicht weiterkommst, sag es einfach, dann gehen wir zur nächsten Aufgabe. Du kannst jederzeit abbrechen.“

### Einverständnis (kurz, unterschreiben lassen)

> Ich nehme freiwillig an einem Test der App „Life's a Game“ teil. Notizen [und eine Bildschirmaufnahme mit Ton] werden nur zur Verbesserung der App verwendet, anonymisiert ausgewertet und nach Abschluss der Auswertung gelöscht. Es werden keine Gesundheitsdaten erhoben. Ich kann jederzeit ohne Angabe von Gründen abbrechen.
> Datum, Name, Unterschrift

### Vorfragen

1. Nutzt du eine App für Gewohnheiten, To-dos oder Tagebuch? Welche, und wie lange schon?
2. Spielst du Videospiele? Wenn ja, welche Art?
3. Wie sicher fühlst du dich mit dem Smartphone (1 = unsicher, 5 = sehr sicher)?

## 5. Aufgaben

Lies jeweils nur den Aufgabentext vor, nicht die Hinweise. Starte bei jeder Aufgabe auf dem Tab „Heute“ ganz oben.

| # | Aufgabentext (vorlesen) | Erfolgskriterium | Beobachten | Prüft |
|---|---|---|---|---|
| 1 | „Du möchtest dir angewöhnen, jeden Morgen ein Glas Wasser zu trinken. Leg das als neue Gewohnheit an.“ | Gewohnheit angelegt **mit eigenem, sinnvollem Anker** und echter Mini-Version | Wird der Anker verstanden („Nach welcher Routine“)? Wird eine Vorlage genutzt? Abbrüche im langen Formular? Erwartung bei „Erinnerung“? Wird die Pflanzensorte bemerkt oder bewusst gewählt? Sucht die Person die neue Pflanze danach auf dem Hof? | U11, U14, U18, v8a |
| 2 | „Du hast heute schon gedehnt. Trag das ein. Beim Lesen hast du heute nur eine Seite geschafft. Trag auch das ein.“ | „Dehnen“ voll erledigt, „Lesen“ als Mini | Zeit bis zum ersten Haken, Scrollen, Fehlgriffe (Kasten vs. Mini-Knopf) | U1, U12, U13 |
| 3 | „Gestern Abend hast du doch gelesen, aber vergessen, es einzutragen. Hol das nach.“ | „Lesen“ für gestern nachgetragen | Wird die Zeile „Gestern“ mit „Eintragen“ gefunden? Kommentar zum Regentag? | U8, U9 |
| 4 | „Spazieren gehen klappt nicht dreimal pro Woche. Ändere das auf zweimal pro Woche.“ | Frequenz auf 2× pro Woche geändert und gespeichert | Wird die Karte angetippt (Info-Blatt) und dort „Bearbeiten“ gefunden? Wird der Hinweis „gilt ab heute“ verstanden? | Heuristik 3, 6 |
| 5 | „Schau nach: An wie vielen Tagen hast du in den letzten Wochen gelesen?“ | Antwort aus Erntekalender oder Gewohnheitsdetails, ungefähr richtig (± 2) | Wird der Kalender gefunden und gelesen? Versucht die Person, auf Kacheln zu tippen? | U17 |
| 6 | „In deiner Truhe liegt etwas für den Hof. Stell einen Gegenstand auf deinen Hof.“ | Gegenstand aufgestellt und auf dem Hof sichtbar | Ist klar, woher Funde kommen? Wird der Gegenstand auf dem Hof gefunden? Wird die Großansicht (Antippen der Szene) entdeckt und gewischt? | Heuristik 6, v8a |
| 7 | „Du fährst nächste Woche eine Woche in den Urlaub und willst mit dem Dehnen so lange aussetzen. Was machst du?“ | Gewohnheit pausiert, **nicht** gelöscht | Wird „Pausieren“ im Info-Blatt der Karte gefunden? Gibt es Sorge, dass die Pflanze leidet? | Heuristik 3 |
| 8 | „Zu deiner Fähigkeit ‚Geist‘ passt eher eine Scheune als das Archiv. Ändere das.“ | Gebäudetyp der Fähigkeit auf Scheune geändert, auf dem Hof sichtbar | Wo wird zuerst gesucht (Gewohnheit, Hof, Fortschritt)? Wird „Ändern“ bei der Fähigkeit gefunden? Wird das Raster verstanden? | v8a (Abweichung 10) |
| (9) | *Nur wenn Zeit bleibt:* „Schreib einen kurzen Eintrag für heute und schließ den Tag ab.“ | Logbuch-Eintrag gespeichert | Wird die Wetterwahl verstanden? | Heuristik 2 |

**Bewertung je Aufgabe:** 2 = ohne Hilfe geschafft · 1 = mit Umweg oder kleinem Hinweis · 0 = nicht geschafft oder abgebrochen. Hilfe nur geben, wenn die Person ausdrücklich nicht weiterkommt, und notieren.

## 6. SUS-Fragebogen (System Usability Scale)

Nach den Aufgaben, auf Papier oder im Formular. Skala: 1 = stimme überhaupt nicht zu … 5 = stimme voll zu.

1. Ich denke, dass ich diese App gerne häufig benutzen würde.
2. Ich fand die App unnötig komplex.
3. Ich fand die App einfach zu benutzen.
4. Ich glaube, ich würde die Hilfe einer technisch versierten Person brauchen, um die App benutzen zu können.
5. Ich fand, die verschiedenen Funktionen in dieser App waren gut integriert.
6. Ich denke, die App enthielt zu viele Ungereimtheiten.
7. Ich kann mir vorstellen, dass die meisten Menschen den Umgang mit dieser App sehr schnell lernen.
8. Ich fand die App sehr umständlich zu nutzen.
9. Ich fühlte mich bei der Benutzung der App sehr sicher.
10. Ich musste eine Menge lernen, bevor ich anfangen konnte, mit dieser App zu arbeiten.

**Auswertung:**
- Ungerade Fragen: Antwort − 1.
- Gerade Fragen: 5 − Antwort.
- Summe × 2,5 ergibt einen Wert von 0 bis 100.
- Einordnung: Ein Durchschnitt um 68 gilt als üblich, ab etwa 80 als gut. Bei 5 Personen ist der Wert nur eine grobe Orientierung.

## 7. Verständnisfragen und Abschluss

Ohne die App anzusehen beantworten lassen und die Antworten wörtlich notieren.

1. „Was bedeuten die Prozentzahl und die Pflanze bei einer Gewohnheit?“ Richtig ist sinngemäß: Wie gefestigt die Gewohnheit ist; sie wächst mit Beständigkeit, einzelne Ausfälle schaden wenig.
2. „Was passiert, wenn du einen Tag verpasst? Was ist ein Regentag?“ Richtig ist sinngemäß: Die Pflanze wächst langsamer und stirbt nicht. Ein Regentag rettet automatisch die Serie, und man verdient ihn sich durch Erledigungen.
3. „Was ist die Mini-Version, und wann würdest du sie nutzen?“
4. „Was bedeutet ‚Gemeistert‘, und wie kommt man dahin?“ Das ist offen, weil es im Test nicht vorkommt. Interessant ist, ob es überhaupt jemand bemerkt.
5. „Was zeigen die Gebäude auf dem Hof, und warum sehen sie unterschiedlich weit gebaut aus?“ Richtig ist sinngemäß: Jedes Gebäude gehört zu einer Fähigkeit und wird mit deren Level ausgebaut.

**Abschlussgespräch:**
- Was hat dir gefallen? Was hat dich gestört oder verwirrt?
- Würdest du die App nutzen? Was müsste dafür anders sein?
- Was würdest du gern auf deinem Hof sehen oder bauen? (Ideen für Freischaltungen, Entscheidung 7)
- Ein Wort, das die App für dich beschreibt?

## 8. Beobachtungsbogen (pro Person)

**Teilnehmende Person:** T__ · **Datum:** __ · **Gerät/iOS:** __ · **Smartphone-Sicherheit (1–5):** __ · **Spielt:** ja/nein

| Aufgabe | Bewertung 0/1/2 | Zeit (s) | Fehlgriffe / Umwege | Zitate (lautes Denken) | Hilfe gegeben? |
|---|---|---|---|---|---|
| 1 Anlegen | | | | | |
| 2 Abhaken + Mini | | | | | |
| 3 Nachtragen | | | | | |
| 4 Bearbeiten | | | | | |
| 5 Kalender | | | | | |
| 6 Truhe | | | | | |
| 7 Pausieren | | | | | |
| 8 Gebäude ändern | | | | | |
| (9) Logbuch | | | | | |

**SUS-Wert:** __ · **Verständnisfragen richtig (von 4, ohne Frage 4):** __

**Beobachtete Probleme:**

| Problem | Wo | Schwere 1–4 | Passt zu Fund U… |
|---|---|---|---|
| | | | |

## 9. Auswertung nach 5 Sitzungen

1. **Aufgaben:** Erfolgsquote (Mittel der 0/1/2-Werte), mittlere Zeit und häufigste Fehlgriffe je Aufgabe.
2. **SUS:** Mittelwert und Spanne.
3. **Verständnis:** Anteil richtiger Antworten je Frage.
4. **Probleme zusammenführen:** Gleiche Probleme bündeln und zählen, wie viele Personen betroffen waren. Den Schweregrad als höchsten beobachteten Wert ansetzen, bei 3 oder mehr Betroffenen +1.
5. **Abgleich mit der heuristischen Evaluation:** Für jeden Fund U1–U18 festhalten, ob er bestätigt, nicht beobachtet oder widerlegt wurde. Neue Probleme ergänzen.
6. **Ergebnis hierher bringen:** Beobachtungsbögen bzw. die zusammengefasste Liste. Der Koordinations-Chat erstellt daraus die UX-Punkte für die nächste Version.

**Hinweise für die Moderation:**
- Nicht erklären, nicht bestätigen („gut so“).
- Auf Fragen mit einer Gegenfrage antworten: „Was würdest du erwarten?“
- Pausen aushalten. Schweigen ist oft der Moment, in dem sich ein Problem zeigt.
- Notiere wörtliche Zitate, sie sind später am wertvollsten.
