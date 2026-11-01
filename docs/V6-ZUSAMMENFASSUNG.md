# Prototyp v6 · Zusammenfassung für den Abgleich

Stand: 01.11.2026 · umgesetzt mit Claude Code nach Arbeitsliste v6 (CLAUDE.md) und Leitfaden v1.5. Die Abgleich-Checkliste ist bewusst nicht ausgefüllt.

## Umgesetzt

**1 · Nachtragen (Leitfaden 4.3, 4.4, 5.5, Datenmodell `lateLogs`)**
- Gestern und vorgestern lassen sich als erledigt oder Mini nachtragen; nochmal tippen nimmt den Nachtrag zurück. Nicht möglich: heute (dafür gibt es den normalen Haken), ältere Tage, Tage vor dem Anlegen, pausierte und nicht geplante Tage, Einträge vom selben Tag, Wochen-Gewohnheiten über das Wochenziel hinaus.
- Nachgetragenes steht wie jeder Eintrag in `logs` und zählt damit voll für Stärke, Serie, XP und Ernte; `lateLogs` markiert es. Zufallsfunde entscheidet jetzt die Logik (`dropAllowed`): nur am selben Tag, nie für Nachgetragenes.
- Oberfläche: Tab „Heute“ → Bereich „Gestern und vorgestern“ (erscheint nur, wenn es etwas nachzutragen gibt). Text ohne Schuldton: „Vergessen einzutragen? Hier lässt sich das nachholen. Nachgetragenes zählt voll, nur Funde gibt es dafür keine.“
- Verpasster Tag mit Serie: zuerst „Doch erledigt? Nachtragen / Mini nachtragen / Nein, ist ausgefallen“, erst danach die Extra-Runde.
- Erntekalender: nachgetragene Tage mit abgeschrägter Ecke (Form zusätzlich zur Farbe), im Tooltip „nachgetragen“, eigener Eintrag in der Legende.

**2 · Erreichbare Graduierung (Leitfaden 4.5)**
- Ausschleichen ab Stärke ≥ 0,6 und 12 der letzten 14 geplanten Termine gehalten (Mini, Regentag, nachgeholt zählen); Wochen-Gewohnheiten: Ziel der letzten zwei abgeschlossenen Wochen erreicht. Der Vorschlag nennt „X der letzten 14 Termine geschafft“.
- „Gemeistert“ am ersten Tag mit 30 Tagen ohne Erinnerung und ≥ 70 % gehaltenen Terminen in den 30 Tagen bis dahin; bleibt dauerhaft.
- Regentag und nachgeholter Tag setzen `run` nicht mehr zurück. `run` wird sonst nur noch von der Simulationsvariante `path` gelesen; die App nutzt für den Vorschlag jetzt `held14`.
- Bereits unter v5 Gemeistertes bleibt gemeistert (Abweichung v6-1).

**3 · Tests:** 65 Tests, alle grün (v5: 42). 23 neue in `tests/v6.test.js`: Grenzen des Nachtragens, volle Wirkung, kein Fund, Kalendermarkierung, kein Reset durch Regentag/nachgeholt, Ausschleichen 12 von 14 (täglich und wöchentlich), Graduierung mit 70 % (täglich, Wochentage, wöchentlich, später Tag, dauerhaft, auch unter Stärke 0,8), Migration. Angepasst: der v5-Test „Ausschleichen“ (prüfte „14 in Folge“; 13 von 14 lösen jetzt den Vorschlag aus), begründet im Commit.

**Migration der v5-Daten:** Gleiches Speicherschema (`schema: 4`). Beim ersten Start mit v6 ergänzt die App nur `rulesV6Since` und speichert sofort; alle Eingaben (Gewohnheiten, Logs, Pausen, To-dos, Logbuch, Check-ins, Truhe, Einstellungen) bleiben unverändert. Test: ein v5-Stand wird importiert, und alles außer dem Stichtag ist identisch, Stärke, Serie, XP, Level und Kalender rechnen gleich. Zusätzlich lokal geprüft: ein v5-Hof in IndexedDB wird geladen, der Stichtag gespeichert, `lateLogs` entsteht erst beim ersten Nachtrag. Backups aus v5 lassen sich weiter importieren.

**4 · Beta-Zahlen:** `betaMetrics` enthält `rulesSince` (= `rulesV6Since`), damit sich der Selbsttest vor und nach dem Update trennen lässt. Auch im Export enthalten.

## Simulationsergebnis

`OPT=backfill node tools/sim/sim72.js 300` (300 Läufe je Persona, Mittel über die 10 Personas):

| Kennzahl | v5 | v6 | Referenz `backfill,grad` |
|---|---|---|---|
| Personen mit „Gemeistert“ (anyGraduated) | 0,5 % | **51,1 %** | 49 % |
| „Gehalten“ an Tag 66 (held66) | 90,3 % | **91,1 %** | 90 % |
| Abgeschaltete Erinnerungen je Person (remOffPerUser) | 0,07 | **1,60** | 1,55 |
| Erstes Abschalten (Tag, Mittel) | 43 | 35,7 | ~36 (Bericht, Befund 8) |
| Erstes „Gemeistert“ (Tag, Mittel) | – | 54,1 | ~61 (Bericht, Befund 8) |

v6 liegt nah an der Referenz. Die kleinen Unterschiede (+2 Pp. „Gemeistert“) kommen vermutlich daher, dass die App bei Wochentags-Gewohnheiten die letzten 14 *geplanten Termine* zählt, die Simulationsvariante 14 Kalendertage, und dass die App „Gemeistert“ jeden Tag prüft. „Gemeistert“ kommt im Mittel um Tag 54, früher als die rund 61 Tage aus Befund 8. Aus dem Bericht geht nicht eindeutig hervor, zu welcher Variante dieser Wert gehört; im Koordinations-Chat gegen den Referenzlauf prüfen.

Je Persona (v6): Studentin 81 %, Vater 57 %, Pflege 22 %, Rentner 55 %, Entwickler 96 %, Selbstfürsorge 16 %, Perfektionistin 98 %, Azubi 0 %, Gelegenheit 3 %, Sportlerin 84 %. Wie im Bericht bleibt „Gemeistert“ bei wenig Struktur selten.

## Offen

- **Test auf dem iPhone** nach dem Push: Update-Hinweis „Neue Version bereit“, Daten unverändert, Nachtragen in der installierten App.
- **Nicht in v6** (laut CLAUDE.md nach dem Selbsttest): Etappen-Weg, Knospe/Wochenernte, Tagesrhythmus, Freischaltungen, Saatgut-Liste, mehrere Anker.
- Versionsangaben bewusst unverändert gelassen (außerhalb der Arbeitsliste): Fußzeile „Prototyp V5“ und `package.json` 5.0.0. Die Cache-Version ändert sich trotzdem, weil sie aus dem Inhalt berechnet wird.

## Abweichungen

Siehe [ABWEICHUNGEN.md](ABWEICHUNGEN.md), Abschnitt v6: 1 alte Graduierungsregel für die Zeit vor dem Update · 2 gleitende 30-Tage-Spanne · 3 Wochen-Gewohnheiten: abgeschlossene Wochen · 4 Nachtragen über „nachgeholt“ · 5 Extra-Runde in zwei Schritten.
