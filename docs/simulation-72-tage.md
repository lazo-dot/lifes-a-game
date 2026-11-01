# Life's a Game – Simulation 72 Tage: v5 gegen optimierte Fassung

Stand: 01.11.2026 · Baut auf [Simulation 30 Tage](simulation-30-tage.md) auf · Spiellogik: `src/logic.js` aus v5

> **Wichtig:** Synthetische Personas, keine Nutzerstudie. Spielwerte berechnet die echte v5-Logik, das Verhalten beruht auf Annahmen. Belastbar sind die **Unterschiede zwischen den Varianten** und Befunde, die direkt aus den Regeln folgen. Absolute Abbruchquoten sind Modellfolgen, keine Prognosen. Unterschiede unter etwa 3 Prozentpunkten liegen im Rauschen.

---

## 1. Aufbau

- **72 Tage** (02.11.2026 – 12.01.2027), damit die Zeit bis „Gemeistert“ (Leitfaden: ab ca. Tag 66) abgedeckt ist. 10 Personas wie im 30-Tage-Lauf, je 300 Durchläufe pro Variante.
- **Neu im Modell gegenüber 30 Tagen:** Die App schlägt das Abschalten der Erinnerung vor, die Persona nimmt mit eigener Wahrscheinlichkeit an; danach läuft die Graduierung. To-dos und Logbuch lassen mit dem Neuheitseffekt nach.
- **Varianten** (einzeln und kombiniert):

| Kürzel | Optimierung | aus Befund |
|---|---|---|
| backfill | Gestern/vorgestern nachtragen (48 h); Funde nur am selben Tag | 1 |
| path | Sichtbarer Weg zu „Gemeistert“: Etappen als Belohnungsmomente, Erinnerung freiwillig ab Stärke 0,6 | 2 |
| stage | Zwischenstufe „Knospe“ bei 0,75 + Wochenernte bei erreichtem Wochenziel | 3 |
| rhythm | Check-in bei erster Öffnung des eigenen Tages, Farm-Schlaf nach eigenem Rhythmus | 4 |
| anchors | Mehrere Anker pro Gewohnheit (Schichtwechsel) | 5 |
| seed | „Saatgut“-Liste statt harter Grenze in Woche 1 | 6 |
| grad | **neu, siehe Befund 8:** erreichbare Graduierung | 8 |
| alle | alle sieben zusammen | |

## 2. Ergebnis im Überblick

Mittelwerte über alle Personas.

| Kennzahl | v5 | nur backfill | nur grad | alle Optimierungen |
|---|---|---|---|---|
| Aktiv an Tag 30 | 62 % | 65 % | 62 % | 67 % |
| Aktiv an Tag 72 | 27 % | 31 % | 26 % | 30 % |
| Verhalten, das die App kennt | 59 % | 83 % | 59 % | 83 % |
| Stärke an Tag 72 | 49 % | 65 % | 49 % | 66 % |
| „Gehalten“ an Tag 66 | 61 % | 90 % | 62 % | 91 % |
| Erinnerungen abgeschaltet je Person | 0,0 | 0,1 | 0,6 | 1,6 |
| Personen mit mind. einer gemeisterten Gewohnheit (Tag 72) | **0 %** | 0 % | 17 % | **49 %** |
| Öffnungstage mit Belohnungsmoment | 54 % | 57 % | 54 % | 63 % |
| Check-in-Quote | 25 % | 24 % | 25 % | 36 % |
| „Extra-Runde“ genutzt je Person | 5,4 | 2,6 | 5,4 | 2,8 |

**Belohnungsmomente pro Woche** (Anteil der Öffnungstage): v5 fällt von 63 % (Woche 2) auf 37 % (Woche 10); mit allen Optimierungen von 73 % auf 54 %. Ernten pro Woche sinken in v5 ab Woche 5 auf 0,2–0,5, mit Zwischenstufe auf 0,3–0,8.

## 3. Befund 8 (neu): „Gemeistert“ ist unter den v5-Regeln praktisch unerreichbar

**Kein einziger** simulierter Nutzer bekommt in 72 Tagen den Vorschlag, die Erinnerung abzuschalten – auch nicht die zuverlässigsten (Beraterin, Sportstudentin). Damit kann keine Gewohnheit „Gemeistert“ werden. Das zentrale Alleinstellungsmerkmal kommt in v5 faktisch nicht vor.

**Ursachen in der Logik:**
1. **Stärke ≥ 0,8 liegt über dem, was realistische Nutzer erreichen.** Die Stärke pendelt sich bei der Erledigungsquote ein. Wer 75–80 % der Termine einträgt – im Modell schon die Fleißigen –, kommt nur kurz über 0,8.
2. **14 Erledigungen in Folge:** Ein Regentag oder ein nachgeholter Tag setzt den Zähler in `computeHabit` auf 0 (`run = 0`). Die verzeihenden Mechaniken bestrafen hier also, was Prinzip 4 widerspricht.
3. **Die Graduierung verlangt danach erneut Stärke ≥ 0,8** am Ende der 30 Tage ohne Erinnerung.
4. Die Lücke beim Eintragen (Befund 1) senkt die Stärke zusätzlich.

**Variante grad** (an Lally 2010 orientiert: einzelne Ausfälle schaden kaum):
- Abschalten vorschlagen ab Stärke 0,6 und 12 von 14 Terminen gehalten (Mini, Regentag und nachgeholt zählen).
- „Gemeistert“ = 30 Tage ohne Erinnerung mit mindestens 70 % gehaltenen Terminen.

Ergebnis: allein 17 % der Personen mit einer gemeisterten Gewohnheit, zusammen mit Nachtragen **49 %**. Erstes Abschalten im Schnitt um Tag 36, erstes „Gemeistert“ um Tag 61 – nah an Lallys Median von 66 Tagen. Bei Personas mit wenig Struktur bleibt es selten (Azubi 0 %, Verwaltung 1 %), was gewollt ist: „Gemeistert“ soll etwas bedeuten.

**Abwägung:** Die neue Regel macht „Gemeistert“ leichter. Wichtig bleibt, dass es eine echte Leistung ist (30 Tage ohne Erinnerung, mind. 70 %). Die genauen Schwellen sollten im Selbsttest und in der Beta geprüft werden.

## 4. Was welche Optimierung bewirkt

| Optimierung | Wirkung in der Simulation | Bewertung |
|---|---|---|
| **backfill** | Bekanntes Verhalten 59 → 83 %, Stärke Tag 72 49 → 65 %, „gehalten“ Tag 66 61 → 90 %, Extra-Runden halbiert, Abbruch Tag 72 −4 Pp. Größter Einzeleffekt; Pflegekraft „gehalten“ 39 → 80 %. | **H** – Voraussetzung für fast alles andere |
| **grad** | Einzige Variante, mit der „Gemeistert“ überhaupt vorkommt; volle Wirkung erst mit backfill. | **H** – macht das USP erlebbar |
| **path** | 2,9 Etappen pro Person, Belohnungsanteil Woche 3–6 von 51 auf 55 %. Allein ohne grad kaum Abschalten. | M – sinnvoll zusammen mit grad |
| **stage** | 1,7 Wochenernten pro Person, Belohnungsanteil Woche 3–6 von 51 auf 53 %. | M |
| **rhythm** | Check-in-Quote 25 → 36 %; Farm-Schlaf blockiert Nachtaktive nicht mehr. | M |
| **seed** | Optimierer-Typ an Tag 30 48 → 58 % aktiv (stark annahmeabhängig). | N |
| **anchors** | Im Mittel kein messbarer Effekt; bei der Pflegekraft nur über die Modellannahme. | N – im Selbsttest qualitativ prüfen |

**Nur die beiden H-Punkte (backfill + grad):** Personen mit „Gemeistert“ 49 %, „gehalten“ Tag 66 90 %, 1,55 abgeschaltete Erinnerungen je Person – praktisch so viel wie alle Optimierungen zusammen. Diese Kombination ist Referenz für v6.

**Kombiniert:** Belohnungsanteil Woche 3–6 von 51 auf 65 %, „gehalten“ Tag 66 von 61 auf 91 %, Personen mit „Gemeistert“ von 0 auf 49 %. Am stärksten profitieren die Serienfixierte (aktiv an Tag 72: 11 → 20 %) und der Optimierer (18 → 33 %); die Azubi-Persona bleibt schwierig (4 %), hier helfen Spielregeln allein wenig.

## 5. Weitere Beobachtungen über 72 Tage

- **Langes Belohnungstal ab Woche 5:** Nach Blüte (um Tag 21–26) kommt bis „ausgewachsen“ (Stärke 0,9, oft nie erreicht) kaum noch eine Ernte. Selbst mit allen Optimierungen sinkt der Belohnungsanteil bis Woche 10 auf ~54 %. Hier greifen erst die Langzeit-Inhalte aus Phase 4 (Jahreszeiten, Freischaltungen) – die offene Entscheidung „Freischaltungen“ im Projektstatus wird damit dringlicher.
- **Sichtbare Serienbrüche steigen mit Nachtragen leicht** (2,6 → 3,4 je Person), weil Serien länger werden und damit öfter als „lang“ zählen. Die Brüche selbst sind nicht häufiger.
- **Funde** bleiben in allen Varianten bei ~14 pro Person in 72 Tagen; Level am Ende 4,4–4,9. Die Fundökonomie muss nicht angepasst werden.

## 6. Empfehlung

| Prio | Änderung für v6 | Leitfaden |
|---|---|---|
| H | Gestern/vorgestern nachtragen (48 h), getrennt von „Extra-Runde“; Funde nur am selben Tag | 4.3, 5.6 |
| H | Graduierung erreichbar machen: Vorschlag ab Stärke 0,6 + 12/14 Terminen; „Gemeistert“ = 30 Tage ohne Erinnerung mit ≥ 70 %; Regentag und nachgeholt setzen keinen Zähler zurück | 4.5 |
| M | Weg zu „Gemeistert“ als Etappen sichtbar | 4.5, 5.5 |
| M | Zwischenstufe „Knospe“ + Wochenernte | 4.2, 4.4 |
| M | Tagesrhythmus im Onboarding (Check-in, Farm-Schlaf, Tageswechsel) | 4.6, 5.4 |
| M | Freischaltungen für Woche 5–10 festlegen (gegen das lange Belohnungstal) | 5.4 |
| N | Saatgut-Liste, mehrere Anker | 5.1 |

Die Änderungen betreffen Messung, Schwellen und Rhythmus – keine Belohnungshöhe, kein Prinzip. Übernahme in den Leitfaden erst nach dem Selbsttest; Befund 8 lässt sich dort direkt beobachten (wird „Erinnerung abschalten?“ je vorgeschlagen?).

## 7. Grenzen

- Annahmen über Verhalten, Abbruch und die Bereitschaft, Erinnerungen abzuschalten, bestimmen die absoluten Werte.
- Nicht modelliert: Spaß an Szene und Musik, echte Erinnerungen außerhalb der App (kommen erst mit Flutter), Bearbeiten und Pausieren, Gewohnheiten über 3 hinaus.
- Die Varianten path, stage, rhythm, seed wirken im Modell nur über Belohnungsmomente und Abbruchrisiko; ihr Effekt auf Freude und Motivation ist im Selbsttest zu prüfen.
- Code: `sim/sim72.js` (Varianten über `OPT=…`), `sim/personas.js`.
