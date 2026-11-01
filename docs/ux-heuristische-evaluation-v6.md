# Life's a Game – Heuristische Evaluation Prototyp v6

Stand: 01.11.2026 · Methode: Expertenreview nach den 10 Heuristiken von Nielsen, Schweregrad 0–4 · Grundlage: v6 lokal gebaut und in Headless-Chrome auf iPhone-Größe (390 × 844 pt) durchgespielt (Onboarding, Anlegen, Heute, alle Tabs, Demo-Hof mit Verlauf, große Schrift), dazu Code von `src/ui.js`.

> Ein einzelner Gutachter findet erfahrungsgemäß nur einen Teil der Probleme; Echtgerät (Safari, Touch, Tastatur), VoiceOver und Ton wurden nicht geprüft. Die Funde sind Hypothesen für den [Usability-Test](ux-testleitfaden-v6.md), der sie bestätigen oder verwerfen soll.

**Schweregrade:** 0 kein Problem · 1 kosmetisch · 2 gering · 3 wichtig, sollte behoben werden · 4 Katastrophe, vor Beta beheben

---

## 1. Zusammenfassung

- **3 wichtige Probleme (Schweregrad 3):** Die tägliche Kernaktion liegt weit unter dem sichtbaren Bereich (U1); Regentag und Nachtragen greifen beim selben verpassten Tag gleichzeitig, ohne dass der Unterschied erklärt wird (U8); Erklärungen stecken in Tooltips, die auf dem iPhone nicht erscheinen (U17).
- **12 geringe, 3 kosmetische Probleme.**
- **Stark:** Ton ohne Schuld, Fehlermeldung beim Anlegen, Löschen mit Rückgängig, Demo-Hof, Vorschau „Nach … werde ich …“, Barrierefreiheits-Einstellungen, Vorlagen beim Anlegen.

## 2. Funde

| # | Heuristik | Problem | Beleg | Schwere | Empfehlung |
|---|---|---|---|---|---|
| U1 | 1 Sichtbarkeit des Systemstatus / 8 Minimalismus | **Abhaken liegt unter dem Falz.** Auf dem iPhone stehen vor der Heute-Liste Hof-Szene, Erfahrung, Fähigkeiten, Wilma und zwei Reihen Tabs. Der erste Haken liegt im Demo-Hof bei ~1.760 pt, also gut zwei Bildschirmhöhen tief; bei einem neuen Hof bei ~1,5 Bildschirmhöhen. Jeder tägliche Besuch beginnt mit Scrollen. | Messung im Browser | **3** | Auf schmalen Bildschirmen: Tab-Leiste fest unten (wie iOS-Apps), Hof-Szene kompakt oben, Erfahrung/Fähigkeiten in den Tab „Fortschritt“. Ziel: erster Haken ohne Scrollen sichtbar. |
| U2 | 1 Sichtbarkeit | Hinweise von Wilma erscheinen als Overlay über dem Fähigkeiten-Bereich und verdecken Inhalt. | Screenshot nach Onboarding | 1 | Toast unten über der Tab-Leiste, kürzer sichtbar. |
| U3 | 6 Wiedererkennen | Auf der Heute-Karte stehen Zahlen nur mit Symbol: Flamme „90“ (Serie), Tropfen (Regentage). Ohne Legende unklar. | Demo „Heute“ | 2 | Kurztext: „🔥 90 in Folge · 💧 2 Regentage“ oder eine Legende beim ersten Mal. |
| U4 | 2 Sprache der Nutzer | „Herbst · **Tag 1** · Sonntag“ im Kopf meint den Tag im Monat (Spielkonvention), kollidiert aber mit „Tag 46 von etwa 66“ (Alter der Gewohnheit). | Kopfzeile, Gewohnheitsdetails | 2 | „1. November · Herbst“ oder „Herbst, 1. Tag“ – nicht „Tag 1“. |
| U5 | 2 Sprache | „Tag 93 von etwa 66“ wirkt wie ein Fehler, sobald die 66 überschritten sind. | Demo „Gewohnheiten“ | 2 | Ab Tag 66: „Tag 93 · die üblichen 66 Tage sind geschafft“. |
| U6 | 2 Sprache | „Noch 3 **Einheiten** bis Körper Stufe 2“ – unklar, was eine Einheit ist. | Erfahrungs-Bereich | 2 | „Noch 3× Dehnen bis Körper Stufe 2“ (konkrete Gewohnheit nennen). |
| U7 | 2 Sprache / 10 Hilfe | Viele eigene Begriffe in kurzer Zeit: Stärke (%), Stufe, Serie, Termine, Regentag, Mini, Ernte, Fund, nachgeholt, nachgetragen, Ausschleichen, gemeistert. | gesamte App | 2 | Begriffe schrittweise einführen (Wilma erklärt beim ersten Auftreten), Glossar unter Fortschritt. |
| U8 | 4 Konsistenz / 9 Fehler verstehen | **Regentag und Nachtragen am selben Tag.** Ist gestern nichts eingetragen, wird der Tag automatisch per Regentag „bewässert“ und zugleich zum Nachtragen angeboten. Ob ein Nachtrag den Regentag zurückgibt, sagt die App nicht. Kalender zeigt „Regentag“, Heute zeigt „Vergessen einzutragen?“. | Logik `lateDays` + Kalenderlegende; im Test-Hof reproduzierbar | **3** | Beim Nachtragen ausdrücklich sagen: „Dein Regentag kommt zurück.“ Regentag erst bei Ablauf der 48 h verbrauchen oder als „vorläufig“ zeigen. |
| U9 | 4 Konsistenz | Vier ähnliche Zustände: nachgetragen, nachgeholt (Extra-Runde), Regentag, Mini. Im Kalender alle mit eigener Form – gut –, sprachlich aber nah beieinander. | Kalenderlegende | 2 | „Nachgeholt“ in „Extra-Runde“ umbenennen; Legende mit einem Satz pro Zustand. |
| U10 | 4 Konsistenz | Fußzeile zeigt „Prototyp V5“, obwohl v6 läuft. | Fußzeile | 1 | Version aus `package.json` anzeigen. |
| U11 | 5 Fehlervermeidung | Schalter „**Erinnerung**“ ist beim Anlegen an, im Prototyp gibt es aber keine Mitteilungen außerhalb der App (nur Wilma in der App). Weckt falsche Erwartungen. | Formular Schritt 6 | 2 | Bis Flutter: „Wilma erinnert in der App an deinen Plan“ statt „Erinnerung“. |
| U12 | 5 Fehlervermeidung / 7 Flexibilität | Tap-Flächen unter der iOS-Empfehlung von 44 pt: Haken 34 × 34, Mini-Knopf 129 × 25, To-do-Löschen 23 × 26. | Messung im Browser | 2 | Mindestens 44 × 44 pt; Löschen-× weiter vom Haken weg. |
| U13 | 6 Wiedererkennen | Der Haken ist ein leerer Kasten ohne Beschriftung; die Mini-Version ein kleiner Chip daneben. Erstnutzer könnten den Kasten für eine Markierung oder den Chip für den Hauptknopf halten. | Heute-Karte | 2 | Kasten mit Haken-Symbol im Ruhezustand oder Text „Erledigt“; Mini als zweite, gleich große Option. |
| U14 | 8 Minimalismus | Das Anlegen-Formular zeigt alle 6 Schritte, Uhrzeit und zwei Schalter auf einer Seite (~900 pt); das Onboarding-Fenster ist insgesamt ~1.550 pt lang. | Onboarding Schritt 2 | 2 | Schritt für Schritt (eine Frage pro Bildschirm) oder Schritte 5–6 einklappen mit sinnvollen Vorgaben. |
| U15 | 8 Minimalismus | Fünf Tabs umbrechen auf 390 pt in zwei Zeilen. | Screenshot | 1 | Siehe U1 (Tab-Leiste unten mit Symbolen). |
| U16 | 8 Lesbarkeit | Fließtexte (Wilma, Erklärungen) in Pixel-Schrift VT323; bei langen Texten anstrengend. Einstellung „Groß“ hilft. | alle Texte | 2 | Pixel-Schrift für Überschriften und Zahlen, für Fließtext eine gut lesbare Schrift (oder Option „Lesbare Schrift“). |
| U17 | 10 Hilfe / 1 Sichtbarkeit | **Erklärungen in Tooltips** (`title`): Regentage („retten automatisch einen verpassten Tag“) und Kalenderkacheln (Datum, Status, „nachgetragen“). Auf dem iPhone gibt es kein Hovern – die Erklärungen sind dort unsichtbar. | Code `ui.js` | **3** | Antippen öffnet ein kleines Info-Feld; Kalender: Tippen auf Kachel zeigt Datum und Status. |
| U18 | 7 Flexibilität | Vorlagen gibt es bereits (6 Ideen in Onboarding und „Gewohnheiten“), aber nur eine pro Bereich und mit fester Anker-Formulierung. | Onboarding | 1 | Siehe Ideenspeicher „Vorlagen“: mehr Vorlagen, 2–3 Anker zur Auswahl. |

## 3. Was gut funktioniert

- **Ton:** keine Schuld, keine Dringlichkeit; „Auf diesem Hof stirbt nichts“ erklärt das Kernversprechen gleich am Anfang (Heuristik 2).
- **Fehlermeldung beim Anlegen** nennt genau, was fehlt („nach welcher Routine, eine Mini-Version“), und die Live-Vorschau „Nach … werde ich …“ zeigt den Plan (Heuristiken 1, 9).
- **Nutzerkontrolle:** Löschen sofort mit Rückgängig, Nachtragen zurücknehmbar, Demo-Hof ohne Speicherung, Sicherung exportier- und importierbar (Heuristik 3).
- **Ausschleichen-Vorschlag** erklärt die Bedingung für „Gemeistert“ in einem Satz (Heuristik 10).
- **Barrierefreiheit:** drei Schriftgrößen, Farbschema für Rot-Grün-Schwäche, Muster im Kalender, ARIA-Labels für Haken („Erledigt: …“) (Heuristik 7).
- **Wochenrückblick und Ruhmeshalle** geben Fortschritt ohne Vergleich mit anderen.

## 4. Was der Usability-Test klären soll

| Fund | Prüfen mit Aufgabe / Frage im Testleitfaden |
|---|---|
| U1, U12, U13 | Aufgabe 2 (abhaken, Mini) – Zeit bis zum ersten Haken, Fehlgriffe |
| U8, U9, U17 | Aufgabe 3 (Nachtragen), Verständnisfrage 2 (Regentag) |
| U14, U11 | Aufgabe 1 (eigene Gewohnheit anlegen) |
| U3, U6, U7 | Verständnisfragen 1 und 3 |
| U4, U5 | Nachfrage im Abschlussgespräch |

## 5. Vorschlag zur Einordnung

Die Schweregrad-3-Funde (U1, U8, U17) und U12 (Tap-Flächen) sind Kandidaten für v7 – unabhängig von den Spielregeln und ohne Einfluss auf Logik und Tests. Entscheidung nach dem Usability-Test, zusammen mit Selbsttest und Simulations-Kandidaten.
