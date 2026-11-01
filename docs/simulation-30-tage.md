# Life's a Game – Simulierter 30-Tage-Testlauf (Prototyp v5)

Stand: 01.11.2026 · Grundlage: [Leitfaden v1.4](habit-tracker-entwicklungsleitfaden.md), Spiellogik `src/logic.js` aus v5

> **Wichtig:** Das ist eine Simulation mit synthetischen Personas, keine Nutzerstudie. Die Spielwerte (Stärke, Serien, Regentage, Reparatur, XP, Level, Ernte, Funde, Beta-Zahlen) berechnet die echte v5-Logik. Das *Verhalten* der Personas beruht auf Annahmen. Belastbar sind deshalb vor allem **strukturelle Befunde** (was die Regeln bei bestimmtem Verhalten zwangsläufig tun), weniger die absoluten Zahlen, insbesondere nicht die Abbruchquoten. Alle Optimierungen sind Hypothesen für Selbsttest und Beta.

---

## 1. Methode

- **Zeitraum:** 30 Tage ab Montag, 02.11.2026; 400 Durchläufe pro Persona (Monte Carlo), 10 Personas.
- **Ablauf pro Tag:** Persona öffnet die App (oder nicht), führt Gewohnheiten aus (voll, Mini oder gar nicht), trägt sie ein – **nur an Tagen, an denen sie die App öffnet** –, nutzt ggf. „Extra-Runde erledigt“, macht Check-in, Logbuch und To-dos. Funde, Ernte und Level kommen aus der Logik.
- **Verhaltensmodell:** Ausführungswahrscheinlichkeit, Mini-Neigung, Wochenend-Effekt, Störungsphasen (Krankheit, Reise), Neuheitseffekt (Öffnungsrate klingt ab, Koivisto & Hamari 2019), typische Öffnungszeiten. Abbruchrisiko steigt nach sichtbarem Serienbruch (Silverman & Barasch 2023), bei langen Phasen ohne Belohnungsmoment, bei mehreren Tagen ohne Öffnen und – beim Optimierer-Typ – durch das 3er-Limit in Woche 1.
- **Varianten:** (A) Nachtragen für gestern/vorgestern erlaubt, (B) Check-in den ganzen Tag statt nur 5–14 Uhr.
- Code: `sim/personas.js`, `sim/sim.js` (bei Bedarf ins Repo unter `tools/sim/`).

## 2. Personas

| Persona | Gewohnheiten | Besonderheit im Modell |
|---|---|---|
| Studentin, 21, Cozy-Gamerin | Lesen, Spazieren 3×/Wo., Vokabeln | nachtaktiv, öffnet oft nach 22 Uhr |
| Vater, 38, zwei Kinder | Dehnen, Vorlesen, Laufen 2×/Wo. | wenig Zeit, nutzt Mini-Version oft |
| Pflegekraft, 45, Wechselschicht | Wasser, Rückenübungen 3×/Wo., Abschalt-Ritual | Anker wackeln bei Schichtwechsel, öffnet früh oder spät |
| Rentner, 67 | Spaziergang, Blutdruck messen, Gedächtnistraining Mo/Mi/Fr | sehr regelmäßig, trägt öfter nicht ein, keine Serien |
| Entwickler, 29, Habitica-Abbrecher | Kraft 3×/Wo., Meditation, Side-Project | will mehr als 3 Gewohnheiten, belohnungsgetrieben |
| Gestalterin, 26, kommt von Finch | Tagebuch-Minute, Draußen sein, Yoga 2×/Wo. | Tage mit wenig Energie, viel Logbuch |
| Beraterin, 33 | Joggen, Handy-Pause, Fachartikel | serienfixiert, reist (Störungen montags) |
| Azubi, 19 | Früh aufstehen, Aufräumen 2×/Wo., Pushups | wenig Struktur, öffnet nachmittags/abends |
| Verwaltungsangestellte, 52 | Gemüse, Radfahren 2×/Wo., Pflanzen gießen Mo/Do | macht viel, öffnet die App selten |
| Sportstudentin, 23 | Intervalle 3×/Wo., Mobility 4×/Wo., Proteinfrühstück | flexible Wochenziele |

## 3. Ergebnisse je Persona

Mittelwerte über 400 Läufe. „Eingetragen“ = Anteil des tatsächlich ausgeführten Verhaltens, das die App kennt. „Gehalten“ = Beta-Definition aus Leitfaden 9 (Tag 30).

| Persona | Ausgeführt (geplante Termine) | Eingetragen | Stärke Tag 30 | Gehalten Tag 30 | Check-in angeboten¹ | Öffnungen 22–6 Uhr | „Extra-Runde“ genutzt / davon eigentlich erledigt |
|---|---|---|---|---|---|---|---|
| Studentin | 77 % | 68 % | 45 % | 85 % | 35 % | 60 % | 6,1 / 50 % |
| Vater | 81 % | 61 % | 35 % | 66 % | 74 % | 25 % | 2,2 / 58 % |
| Pflegekraft | 72 % | 59 % | 33 % | 54 % | 64 % | 59 % | 2,0 / 51 % |
| Rentner | 87 % | 57 % | 32 % | 54 % | 89 % | 0 % | – (keine Serien) |
| Entwickler | 79 % | 75 % | 50 % | 94 % | 75 % | 25 % | 6,3 / 46 % |
| Gestalterin | 75 % | 68 % | 33 % | 61 % | 55 % | 34 % | – (keine Serien) |
| Beraterin | 82 % | 73 % | 62 % | 98 % | 89 % | 32 % | 10,5 / 51 % |
| Azubi | 61 % | 58 % | 26 % | 35 % | 0 % | 50 % | 3,2 / 36 % |
| Verwaltung | 83 % | 44 % | 21 % | 50 % | 74 % | 0 % | – (keine Serien) |
| Sportstudentin | 84 % | 67 % | 45 % | 95 % | 89 % | 0 % | 3,0 / 62 % |

¹ Anteil der Öffnungstage, an denen die App zwischen 5 und 14 Uhr geöffnet wurde.

**Über alle Personas:** im Schnitt 17,7 tatsächlich erledigte, aber nicht eingetragene Termine pro Person in 30 Tagen; Charakter-Level 3,3; 6,8 Funde (davon 1,4 selten); Ende Tag 30 stehen 46 % der Pflanzen noch bei Keim oder Setzling, 11 % bei Blüte oder höher, keine ausgewachsen.

**Referenzwerte der Logik (jeder Termin erledigt):** Setzling an Tag 4, Jungpflanze Tag 10, Blüte Tag 21, ausgewachsen Tag 52. Stärke an Tag 30: 74 %. Stärke 80 % (Voraussetzung für „Erinnerung abschalten“) frühestens an Tag 36, „Gemeistert“ damit frühestens um Tag 66.

## 4. Befunde und Optimierungen

### Befund 1 – Die App misst Eintragen, nicht Verhalten (hoch)

Wer an einem Tag die App nicht öffnet, hat dort einen verpassten Termin – auch wenn die Gewohnheit erledigt wurde. Es gibt keine Möglichkeit, gestern nachzutragen. In der Simulation kennt die App im Schnitt nur **63 %** des tatsächlich ausgeführten Verhaltens; am stärksten trifft es genau die Zuverlässigen, die die App selten öffnen (Rentner 57 %, Verwaltung 44 %). Folgen: Stärke und Pflanzen fallen zu niedrig aus, Serien reißen ohne echten Ausfall, die Beta-Zahl „gehalten“ unterschätzt den Erfolg (Rentner: 87 % ausgeführt, aber nur 54 % „gehalten“).

Rund **die Hälfte aller „Extra-Runde erledigt“-Klicks** betrifft Tage, an denen die Gewohnheit eigentlich erledigt war. Die Taste wird also als Nachtrage-Knopf benutzt – entweder mit einer überflüssigen Extra-Runde oder mit einem kleinen Schummeln. Beides passt nicht zum Fair-Play-Anspruch.

**Variante A (Nachtragen für gestern und vorgestern):** eingetragen 63 % → 86 %, Stärke Tag 30 38 % → 49 %, „gehalten“ 69 % → 92 %, Nutzung der Extra-Runde halbiert sich bei mehreren Personas.

**Optimierung:** „Gestern nachtragen“ (bis 48 h, ehrlich als *erledigt* bzw. *Mini*) von der „Extra-Runde“ trennen. Im Erntekalender nachgetragene Tage dezent markieren. Funde nur für Eintragungen am selben Tag würfeln, damit Nachtragen kein Farming wird.

### Befund 2 – Das Alleinstellungsmerkmal ist im ersten Monat unsichtbar (hoch)

Kein einziger simulierter Nutzer erreicht in 30 Tagen den Vorschlag „Erinnerung abschalten“ – selbst bei perfekter Erfüllung frühestens an Tag 36, „Gemeistert“ frühestens um Tag 66. Das ist forschungsgemäß richtig (Lally 2010), fällt aber in die Phase, in der der Neuheitseffekt nachlässt.

**Optimierung:** Den Weg zu „Gemeistert“ von Anfang an sichtbar machen, ohne die Formel zu ändern – z. B. ein „Wurzeln“-Pfad pro Gewohnheit mit Etappen (Anker steht · 3 Wochen gehalten · Erinnerung abgeschaltet · Gemeistert) und Wilma, die die nächste Etappe erklärt. Optional: Erinnerung schon ab Stärke 0,6 und 14 Terminen *freiwillig* abschaltbar anbieten; die 30-Tage-Graduierung bleibt.

### Befund 3 – Belohnungsloch in Woche 3–4 (mittel)

Ernten kommen gebündelt am Anfang: im Schnitt 1,5–1,7 pro Woche in Woche 1–2, dann 0,9 in Woche 3–4, weil die nächste Stufe (Blüte) erst um Tag 21–26 erreicht wird. Der Anteil der Öffnungstage mit einem Belohnungsmoment sinkt von 64 % (Woche 2) auf 53 % (Woche 4) – gleichzeitig mit dem Neuheitsabfall.

**Optimierung:** Zwischen Jungpflanze und Blüte eine Zwischenstufe einziehen (z. B. „Knospe“ bei 0,75) oder eine wöchentliche, nicht verlierbare „Wochenernte“ für erreichte Wochenziele. Keine höhere Fundrate – sie ist bewusst niedrig (Crowding-out).

### Befund 4 – Check-in-Fenster und „Farm schläft“ passen nicht zu allen Tagesrhythmen (mittel)

- Der Morgen-Check-in (5–14 Uhr) wird Nachtaktiven kaum angeboten: Azubi 0 %, Studentin 35 % der Öffnungstage. **Variante B** (ganzer Tag bis 22 Uhr) hebt die Check-in-Quote im Schnitt von 27 % auf 36 %.
- Bei Studentin, Pflegekraft und Azubi fällt jede zweite Öffnung in 22–6 Uhr – genau dann ist Dekorieren gesperrt. Für Schichtarbeit ist „nachts“ aber Tageszeit.

**Optimierung:** Tagesrhythmus beim Onboarding abfragen („Wann beginnt dein Tag? Wann schläfst du?“). Check-in = erste Öffnung im eigenen Tagesbeginn (bzw. abends als „Plan für morgen“), Schlafenszeit der Farm aus dieser Angabe. Ergänzend: Tageswechsel nicht um Mitternacht, sondern z. B. um 4 Uhr (Erledigungen um 0:30 zählen noch für den Vortag) – im Modell nicht simuliert, aber bei Nachtaktiven naheliegend.

### Befund 5 – Wechselschicht und flexible Ziele (mittel)

Die Pflegekraft führt nur 72 % ihrer täglichen Termine aus und hält 54 %. Dass Schichtwechsel feste Anker („Nach dem Frühstück“) aushebeln, ist hier eine Modellannahme, deckt sich aber mit Stawarz 2015 (Auslöser müssen im Alltag zuverlässig vorkommen). Wochen-Gewohnheiten funktionieren dagegen gut (Sportstudentin: 95 % gehalten).

**Optimierung:** Beim Anlegen mehrere Anker zulassen („Nach dem Frühstück **oder** nach der Spätschicht“) und bei unregelmäßigem Alltag aktiv „x-mal pro Woche“ vorschlagen.

### Befund 6 – Onboarding-Grenze bremst den Optimierer-Typ (niedrig, Annahme)

Der Entwickler stößt in Woche 1 an fast 6 Öffnungstagen auf das 3er-Limit; im Modell ist das der Haupttreiber seines frühen Abbruchs (Median Tag 9). Das hängt stark an der Modellannahme. Die Grenze ist forschungsgemäß sinnvoll (Habitica-Überforderung).

**Optimierung:** Weitere Gewohnheiten schon in Woche 1 als „Saatgut“ notieren lassen, die nach Tag 7 gepflanzt werden – die Idee geht nicht verloren, der Fokus bleibt.

### Befund 7 – Was gut funktioniert

- **Mini-Version** wird genau von den Zeitknappen genutzt (Vater 32 %, Pflegekraft 34 %, Gestalterin 37 % aller Erledigungen) und hält ihre Pflanzen im Wachstum.
- **Regentage** greifen automatisch (bis 4 pro Person bei Reisenden), **Rückkehr nach Bruch** innerhalb von 7 Tagen liegt bei 79–94 %.
- **Fundrate** ergibt rund 1,5–2 Funde pro Woche – spürbar, aber nicht inflationär; Deko-Plätze (5–7 nach 30 Tagen) und Funde halten sich die Waage.
- **Wochen-Gewohnheiten** mit anteiligem Wochenziel erzeugen keine unfairen Einbrüche.

## 5. Vorschlag zur Priorisierung

| Prio | Optimierung | Befund | Wann |
|---|---|---|---|
| H | „Gestern nachtragen“ (48 h) getrennt von „Extra-Runde“ | 1 | vor Beta, ggf. schon v6 |
| H | Sichtbarer Weg zu „Gemeistert“ ab Tag 1 | 2 | v6 |
| M | Zwischenstufe oder Wochenernte gegen das Loch in Woche 3–4 | 3 | v6 |
| M | Tagesrhythmus im Onboarding → Check-in, Farm-Schlaf, Tageswechsel | 4 | v6 / Flutter |
| M | Mehrere Anker, Wochenziel-Vorschlag bei unregelmäßigem Alltag | 5 | Flutter |
| N | „Saatgut“-Liste für Gewohnheiten über dem Limit | 6 | Flutter |

Keine dieser Änderungen berührt die Prinzipien; alle betreffen Messung und Rhythmus, nicht die Belohnungshöhe. **Nichts davon wird in den Leitfaden übernommen, bevor der Selbsttest es bestätigt** – besonders Befund 1 lässt sich in den eigenen Beta-Zahlen direkt prüfen (wie oft war eine Gewohnheit erledigt, aber nicht eingetragen?).

## 6. Grenzen

- Personas und Parameter sind Annahmen; Abbruchquoten sind Modellfolgen, keine Prognosen.
- Nicht modelliert: Spaß an Szene und Musik, Wilma-Texte, Bedienfehler, Benachrichtigungen, Gewohnheiten über 3 hinaus, Bearbeiten und Pausieren.
- Unterschiede unter etwa 3 Prozentpunkten zwischen Varianten liegen im Rauschen (400 Läufe je Persona).
