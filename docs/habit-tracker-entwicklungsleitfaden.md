# Life's a Game – Entwicklungsleitfaden Habit Tracker (forschungs- und marktbasiert)

Version 1.5 · Stand: 01.11.2026
Grundlagen: [Research Insights for App Design](https://claude.ai/code/artifact/bf3f4dda-dc8c-4703-8009-641d0208463d) · [Marktanalyse](marktanalyse-habit-apps.md) · [Projektstatus](projektstatus.md) · [Marketingkonzept](marketingkonzept.md) · Prototyp v5 (Repo `lifes-a-game-v4`, GitHub Pages) · [Simulation 30 Tage](simulation-30-tage.md) · [Simulation 72 Tage](simulation-72-tage.md) · [Abgleich-Checkliste](abgleich-checkliste.md)

Dieses Dokument übersetzt die Forschung zu Motivation, Gamification und Gewohnheitsbildung sowie die Erkenntnisse aus der Marktanalyse in konkrete Entwicklungsentscheidungen. Zahlenwerte (XP, Kurven, Wahrscheinlichkeiten) sind begründete Startwerte, die im Prototyp getestet und angepasst werden.

### Änderungen in v1.5 (für Prototyp v6, aus den Simulationen)

| Bereich | Änderung | Grund |
|---|---|---|
| Eintragen | **Nachtragen** für gestern und vorgestern (48 h), ehrlich als erledigt bzw. Mini; getrennt von der „Extra-Runde“ | Simulation: App kennt sonst nur ~60 % des Verhaltens; die Hälfte der Extra-Runden wurde als Nachtrage-Knopf benutzt |
| Funde | Zufallsfunde nur für Eintragungen am selben Tag; nachgetragene Einträge zählen für Stärke, Serie, XP und Ernte, würfeln aber keinen Fund | Nachtragen darf kein Farming werden |
| Ausschleichen | Vorschlag ab Stärke ≥ 0,6 und 12 von 14 geplanten Terminen gehalten (statt Stärke ≥ 0,8 und 14 in Folge) | Simulation 72 Tage: unter v5-Regeln erreicht niemand „Gemeistert“ |
| Graduierung | „Gemeistert“ = 30 Tage ohne Erinnerung mit ≥ 70 % gehaltenen Terminen (statt Stärke ≥ 0,8) | An Lally 2010 orientiert: einzelne Ausfälle schaden kaum |
| Zähler | Regentag und nachgeholter Tag zählen als gehalten und setzen keinen Zähler zurück | Verzeihende Mechaniken dürfen nicht bestrafen (Prinzip 4) |
| Erntekalender | Nachgetragene Tage dezent markiert | Transparenz |

Alle übrigen Kandidaten aus den Simulationen (Etappen-Weg, Knospe/Wochenernte, Tagesrhythmus, Freischaltungen, Saatgut, mehrere Anker) werden **nach dem Selbsttest** entschieden.

### Änderungen in v1.4 (Abgleich mit Prototyp v5)

| Bereich | Änderung | Grund |
|---|---|---|
| Technik | Prototyp: klassische Skripte, Kopier-Build nach `dist/` (setzt Cache-Version des Service Workers automatisch), kein Bundler | Service Worker muss im Wurzelverzeichnis liegen; keine vergessenen Cache-Versionen |
| Datenschutz | Keine externen Anfragen, auch nicht für Schriften (Pixelify Sans, VT323 lokal, OFL) | Daten bleiben auf dem Gerät; App ab dem ersten Start offline |
| Graduierung | „Gemeistert“ wird einmal erreicht und nie wieder entzogen | Ein verschwindendes Abzeichen wäre eine Verlustmechanik (Prinzipien 7, 8) |
| Erinnerungen | Echte Erinnerungen erst in Flutter (lokale Notifications); im PWA-Prototyp bleibt Wilma als In-App-Hinweis | Web Push auf iOS braucht einen Server, zeitgesteuerte lokale Benachrichtigungen gibt es in Safari nicht |
| Metriken | Definitionen für „gehalten“ und „Rückkehr nach Bruch“ festgelegt (Abschnitt 9) | Vergleichbare Zahlen im Selbsttest |
| Barrierefreiheit | Schrift in drei Stufen, Farbschema „Gut unterscheidbar“ (Okabe-Ito), Muster statt nur Farbe im Erntekalender | In v5 umgesetzt |

### Änderungen in v1.3 (Abgleich mit Prototyp v4)

| Bereich | Änderung | Grund |
|---|---|---|
| Datenmodell | Stärke, Regentage, Graduierung und „verpasst“ werden aus den Logs abgeleitet, nicht gespeichert; Logs als Datum→Status-Map pro Gewohnheit | Eine Quelle der Wahrheit – Rückgängig, Bearbeiten und Import bleiben konsistent |
| Datenmodell | Zusatzfelder: `history` (Aufwand/Frequenz ab Datum), `pauses`, `remindersOffAt`, `harvestStage`, `gradRewarded`, `checkins`; Truhe als Map | Bearbeiten ohne Rückwirkung, Pausieren, Ernte nur einmal pro Stufe |
| Stärke | Regentag-Termine zählen wie „repariert“ voll (1) | Formel 4.2 präzisiert |
| Wochenziele | Angebrochene Wochen anteilig: `ceil(N × aktive Tage / 7)` | Keine Strafe beim Anlegen oder Pausieren mitten in der Woche |
| Logbuch | Fünf Wetter-Stimmungen (inkl. „heiter“) | Musik und Szene haben fünf Stimmungen |
| Onboarding | Harte Grenze: max. 3 aktive Gewohnheiten in den ersten 7 Tagen, danach Angebot per Banner; Demo-Hof als eigener, nicht gespeicherter Modus | 5.1 präzisiert; Zeigen ohne Beispieldaten im Profil |
| Check-in | Öffnet sich nur zwischen 5 und 14 Uhr von selbst, sonst per Knopf | Morgenritual nicht am Abend aufdrängen |
| Löschen | Sofort mit Rückgängig statt Bestätigungsdialog; nur „Alles löschen“ mit neutraler zweiter Bestätigung | Löschen ohne Hürde, ohne Confirmshaming |
| Technik | Prototyp v4: Module als klassische Skripte mit Namensraum (`LAG`, `LAGStore`, `LAGScene`, `LAGSprites`, `LAGAudio`, `LAGUI`, `LAGDemo`); ab v5 Entwicklung mit Claude Code | Testbar in Node, bündelbar; Hosting und PWA brauchen ein Repo |
| Neu | Fundchancen offen anzeigen, Barrierefreiheit (4.4, 5.6) | Marketingkonzept, Kritik 3 und 7 |

### Änderungen in v1.2 (Abgleich mit Prototyp v3)

| Bereich | Änderung | Grund |
|---|---|---|
| Belohnung | Gold und Laden entfallen. Überraschungsfunde landen in der Truhe; pro Level wird ein Deko-Platz frei | In v3 umgesetzt und schlanker: keine Währung, kein Preis-Lohn, Prinzip 2 noch konsequenter |
| Grafik | Hof in Draufsicht (v3) statt Seitenansicht (v2) | Stilreferenz von Lars; Draufsicht passt zu Beeten pro Gewohnheit |
| Level-Kurven | Charakter `100 × L^1.5`, Skills `50 × L^1.5` | v3; Skills sollen schneller steigen als der Charakter |
| Ist-Stand | Markierungen beziehen sich jetzt auf v3 | Abgleich-Checkliste |

### Änderungen in v1.1 gegenüber v1.0

| Bereich | Änderung | Grund |
|---|---|---|
| Plattform | Flutter + Flame statt „iOS nativ“ | iOS zuerst, Android ohne Neuschreiben (Konzept-Chat) |
| Belohnung | Gold nur aus Ernte und Drops, nicht als fester Lohn pro Aufgabe; Laden bleibt | Widerspruch Prototyp ↔ Prinzip 2 aufgelöst |
| Begleiter/NPC | Von Phase 4 in Phase 2 vorgezogen (im Prototyp bereits vorhanden) | Finch-Erfolg, Verbundenheit ohne soziale Features |
| Neu | Täglicher Check-in (morgens Plan, abends Logbuch) | Finch-Ritual |
| Neu | Erntekalender (Jahres-Kachelraster) in Phase 1 | HabitKit; günstig, stark motivierend |
| Neu | Onboarding mit max. 3 Gewohnheiten, weitere schrittweise | Habitica-Überforderung vermeiden |
| Neu | Monetarisierungsregeln (Abschnitt 6) | Marktanalyse Abschnitt 7 |
| Neu | Ist-Stand Prototyp v2 je Modul markiert | Abgleich Projektstatus |
| Präzisiert | Mini-Version muss eine echte Handlung sein | Duolingo: zu billige Streaks bringen nichts |

Legende Ist-Stand: ✅ im Prototyp v5 umgesetzt · 🟡 teilweise · ⬜ offen

---

## 1. Leitprinzipien (gelten für jedes Feature)

| # | Prinzip | Konsequenz für die Entwicklung | Quelle |
|---|---|---|---|
| 1 | Nutzer besitzen ihre Ziele | Keine festen Vorgaben, nur anpassbare Vorschläge | Busch et al. (RCT); SDT |
| 2 | XP ist Feedback, keine Bezahlung | XP mit echter Fortschrittsinfo; Items nur als unerwartete Funde, keine Währung | Deci, Koestner & Ryan 1999 |
| 3 | Elemente nach Bedürfnis wählen | Kompetenz → Graphen/Erntekalender; Verbundenheit → NPC/Begleiter; Autonomie → freie Wahl | Sailer et al. 2017 |
| 4 | Streaks verzeihen | Keine Broken-Streak-Meldungen, Reparatur möglich, Gesamtzahl statt „0“ | Silverman & Barasch 2023 |
| 5 | Auslöser statt Erinnerungen | Jede Gewohnheit an bestehende Routine koppeln, Erinnerungen ausschleichen | Stawarz et al. 2015 |
| 6 | Spiel nur durch echte Handlungen | Keine Spielaktionen ohne erledigte Gewohnheit | Paschmann et al. 2025 |
| 7 | Keine Dark Patterns | Keine Countdowns, Schuld-Pushs, Verlustmechaniken oder bezahlten Streak-Schutz | Gray et al. 2018; Mathur et al. 2019 |
| 8 | Wachsen statt sterben | Pflanzen wachsen langsamer, verdorren aber nie | Marktanalyse (Forest, Habitica als Negativbeispiel) |

---

## 2. Plattform und Architektur

- **Prototyp:** PWA im Browser zum Testen der Mechanik. Bis v4 als Artifact im Chat, **ab v5 mit Claude Code** im git-Repo `lifes-a-game-v4` (GitHub: lazo-dot/lifes-a-game), veröffentlicht über GitHub Pages (HTTPS). Klassische Skripte mit Namensraum, ein Kopier-Build nach `dist/`, kein Bundler. Tests mit `node --test`.
- **Produkt:** **Flutter** (iOS zuerst auf dem MacBook Pro M4, danach Android aus derselben Codebasis). Pixel-Szene mit **Flame**, Listen und Formulare als Flutter-Widgets, Notifications, Widgets und Haptik über Plugins.
- **Portierbarkeit:** Spiellogik (Formeln, Streak-Regeln, Datenmodell) im Prototyp als eigenes, UI-freies Modul halten und mit Tests absichern. Sie wird 1:1 nach Dart übertragen; Szene und Musik (Ebenen-System, Wetter-Musik-Logik) ebenfalls getrennt halten.
- **Daten:** lokal zuerst (IndexedDB im Prototyp ✅, SQLite/Isar o. ä. in Flutter), Sync später optional.
- **Keine externen Anfragen:** Schriften, Grafiken und Musik liegen in der App bzw. werden erzeugt. Keine Tracking-, Werbe- oder Analyse-Dienste ✅.
- **Abgeleitete Werte:** Gespeichert werden nur Eingaben (Gewohnheiten mit Verlauf, Logs, Pausen, Check-ins, Logbuch, Truhe). Stärke, Serien, Regentage, XP, Level und Graduierung werden daraus berechnet.
- **Grafikstil:** v3 nutzt einen Hof in Draufsicht nach Stilreferenz von Lars (ein Beet pro Gewohnheit). Offen ist noch der Detailgrad: Stardew-nah (einfacher zu produzieren) oder Sea-of-Stars-nah (Licht, Wetter, mehr Asset-Aufwand). Vor Phase 2 der nativen App festlegen, da es die Asset-Pipeline (Aseprite, Spritesheets, Auflösung) bestimmt.

---

## 3. Datenmodell (PWA-Prototyp, später Dart)

```ts
type Frequency =
  | { kind: "daily" }
  | { kind: "weekly"; timesPerWeek: number }   // flexible Gewohnheiten (Weathers)
  | { kind: "weekdays"; days: number[] };

interface Habit {
  id: string;
  title: string;                 // "10 Minuten dehnen"
  anchor: string;                // "Nach dem ersten Kaffee" – Pflichtfeld (Stawarz 2015)
  anchorTime?: string;           // ungefähre Uhrzeit des Ankers, nur für Nudges
  tinyVersion: string;           // "1 Dehnübung" – echte Mini-Handlung (Fogg 2009)
  skillId: string;               // Verknüpfung zu Skill/Identität (Weathers; Sailer)
  history: {                     // Aufwand und Frequenz gelten ab Datum – Bearbeiten wirkt nicht rückwirkend
    from: string;                // YYYY-MM-DD
    effort: 1 | 2 | 3;           // vom Nutzer gesetzt, gewichtet XP (Mekler 2017)
    frequency: Frequency;
  }[];
  streakEnabled: boolean;        // optional pro Gewohnheit (Weathers)
  remindersEnabled: boolean;
  remindersOffAt?: string;       // Start der 30-Tage-Graduierung
  pauses: { from: string; to?: string }[];
  log: Record<string, "done" | "tiny" | "repaired">; // Datum → Status; "verpasst" wird abgeleitet
  lateLogs?: Record<string, true>; // ab v6: nachgetragene Tage (zählen voll, würfeln keinen Fund, im Kalender markiert)
  harvestStage: number;          // höchste bereits geerntete Wachstumsstufe
  gradRewarded: boolean;         // Fund für "Gemeistert" schon vergeben
  plotId?: string;               // Beet auf dem Hof
  archivedAt?: string;
  createdAt: string;
}

// Abgeleitet, nicht gespeichert: strength (4.2), streak, repairTokens (4.3),
// graduatedAt (4.5), XP und Level (4.1)

interface CheckIn {
  date: string;
  todoIds: string[];             // für heute ausgewählte To-dos
  weather?: JournalEntry["weather"];
}

interface Todo {
  id: string;
  title: string;
  effort: 1 | 2 | 3;
  skillId?: string;
  dueDate?: string;              // nur zur Planung, kein Countdown
  doneAt?: string;
}

interface Skill {
  id: string;
  name: string;                  // vom Nutzer benennbar, z. B. "Läufer", "Koch"
  xp: number;
  level: number;
}

interface JournalEntry {
  date: string;
  text: string;
  weather?: "sonnig" | "heiter" | "bewölkt" | "regen" | "gewitter"; // Stimmung, steuert Szene & Musik
  promptId?: string;
}

interface Chest {                // Truhe – keine Währung
  items: Record<string, number>;  // itemId → Anzahl (Seltenheit am Item definiert)
  placed: { itemId: string; slot: number }[]; // Deko-Plätze, 1 pro Level
}
```

**Aufgabentypen:** Zwei Typen – **Gewohnheiten** (wiederkehrend, mit Frequenz inkl. täglich) und **To-dos** (einmalig). Habiticas „Dailies“ sind bei uns Gewohnheiten mit `daily`-Frequenz; ein dritter Typ würde das Onboarding verkomplizieren. Bei Bedarf nach dem Selbsttest neu bewerten.

---

## 4. Kernmechaniken

### 4.1 XP und Level ✅

- **Basis-XP pro Erledigung:** `10 × effort` (also 10/20/30).
- **Mini-Version:** zählt voll für Stärke und Streak, gibt 50 % XP. Sie muss eine echte, kleine Handlung sein („1 Dehnübung“, nicht „App öffnen“) – Duolingo-Befund: Streaks, die fast nichts verlangen, bringen keine Nutzung.
- **Anti-Farming:** XP pro Gewohnheit maximal einmal pro geplantem Termin.
- **Formulierung:** „Kochen +20 XP – 12× diesen Monat gekocht“. XP immer mit einer echten Fortschrittsinfo verbinden.
- **Level-Kurven (Startwert):** Charakter `round(100 × L^1.5)`, Skills `round(50 × L^1.5)`.
- **Nähe sichtbar machen:** „Noch 2 Einheiten bis Fitness Lv 5“ (Paschmann 2025).
- **Rückgängig machen:** Abhaken lässt sich korrigieren; XP werden still zurückgebucht, ohne rote Minus-Animation ✅.

### 4.2 Gewohnheitsstärke („wachsende Pflanze“) ✅

Gewohnheitsbildung braucht im Median 66 Tage (Spanne 18–254), ein einzelner verpasster Tag schadet kaum (Lally 2010). Statt eines fragilen Zählers gibt es einen gleitenden Stärkewert – dasselbe Prinzip wie Loops „Habit Strength“, also im Markt erprobt:

```
strength_neu = strength_alt × (1 − a) + a × erledigt   // erledigt = 1 (done/tiny/repaired/Regentag) oder 0
a = 0.044   // pro geplantem Termin
```

- Nach ~66 konsequenten Terminen ~95 %; ein verpasster Termin kostet ~4 %.
- **Darstellung:** Pflanze wächst in Stufen (Keim → Setzling → … → ausgewachsen bei ≥ 0,9). Sinkt die Stärke, wird die Pflanze kleiner bzw. blasser, **stirbt aber nie** (Prinzip 8).
- Wöchentliche Gewohnheiten werden pro geplantem Termin berechnet. Angebrochene Wochen (Start, Pause) zählen anteilig: Ziel = `ceil(N × aktive Tage / 7)`. Pausierte Tage zählen weder als erledigt noch als verpasst.
- **Ernte ✅:** Beim ersten Erreichen einer neuen Wachstumsstufe ein garantierter Fund für die Truhe (einmal pro Stufe) – belohnt Beständigkeit statt Menge.

### 4.3 Streaks (optional, verzeihend) ✅

- Pro Gewohnheit ein-/ausschaltbar; Standard **aus** bei wöchentlichen Gewohnheiten.
- **Streak ≠ Tagesziel:** Die Mini-Version verlängert den Streak (Duolingo: Trennung von Streak und Tagesziel steigerte die Bindung).
- **Regentag-Token:** Alle 7 erledigten Termine 1 Token, maximal 2 gespeichert (Duolingo: 2 gleichzeitige Freezes wirken besser als 1). Ein verpasster Tag wird automatisch „bewässert“.
- **Nachtragen ⬜ v6:** Erledigungen von gestern und vorgestern lassen sich nachtragen (voll oder Mini). Sie zählen für Stärke, Serie, XP und Ernte genauso wie Eintragungen am selben Tag, würfeln aber keinen Zufallsfund und sind im Erntekalender dezent markiert. Ältere Tage lassen sich nicht nachtragen.
- **Reparatur-Quest:** Nur für Tage, an denen die Gewohnheit wirklich ausgefallen ist: Ohne Token kann ein Streak 48 h lang gerettet werden, indem die Gewohnheit am Folgetag zusätzlich erledigt wird („Extra-Runde“). Die App zeigt die Extra-Runde erst an, wenn der Tag nicht nachgetragen wurde, und bietet zuerst „Gestern doch erledigt? Nachtragen“ an.
- **Regentag und nachgeholt ⬜ v6** zählen für alle Zähler als gehaltener Termin; sie setzen weder die Serie noch den Zähler für das Ausschleichen zurück.
- **Nach einem Bruch:** Anzeige „47 Tage Kochen dieses Jahr“ statt „0 Tage“. Keine Push-Nachricht zum Bruch.
- **Neustart-Momente:** Zu Monatsbeginn bzw. neuer Jahreszeit freundliche Einladung zum Neustart (Fresh-Start-Effekt).
- Streak-Schutz wird **nie verkauft**.

### 4.4 Belohnungsökonomie: Funde und Truhe ✅

Seit v1.2 ohne Gold und Laden (in v3 so umgesetzt):

- **XP ist die einzige feste Rückmeldung.** Keine Währung, kein Preis-Lohn.
- **Überraschungsfunde:** Bei jeder Erledigung am selben Tag 12 % Chance auf einen Fund, davon 20 % selten (nachgetragene Einträge würfeln nicht). Funde (Deko, Saatgut, Tiere) landen in der **Truhe**.
- **Deko-Plätze:** Mit jedem Charakter-Level wird ein weiterer Platz auf dem Hof frei. Fortschritt schaltet also Raum frei, Funde füllen ihn.
- **Garantierte Funde ✅:** bei jeder neu erreichten Wachstumsstufe (Ernte) und ein seltener Fund bei „Gemeistert“.
- **Transparenz ✅:** Die Fundchancen sind in der Truhe unter „Wie Funde entstehen“ offen einsehbar (12 % pro Erledigung, davon 20 % selten; Ernte und „Gemeistert“ sicher). Die angezeigten Werte kommen direkt aus der Spiellogik.
- **Nie verkaufen oder vergeben:** XP, Wachstumsbeschleuniger, Streak-Schutz, Schutz vor Verlust.
- **Echtgeld (später):** nur kosmetische Pakete, die direkt in die Truhe gehen (Abschnitt 6). Keine In-Game-Währung.

### 4.5 Nudges (Erinnerungen) 🟡 (Logik ✅, Push ⬜ v5)

- Text ist der Plan des Nutzers: **„Nach dem Kaffee: dehnen“**, nicht „Zeit zum Dehnen!“.
- Maximal 1 Nudge pro Gewohnheit und Tag zur Ankerzeit; mit einem Tipp stumm schaltbar.
- In der App überbringt der NPC den Plan zur Ankerzeit (v3: Wilma ✅), aber ohne Schuldgefühl („Die Pflanzen warten auf dich“ statt „Deine Pflanzen verdursten!“).
- **Ausschleichen ⬜ v6:** Ab Stärke ≥ 0,6 und wenn 12 der letzten 14 geplanten Termine gehalten wurden (Mini, Regentag und nachgeholt zählen; bei Wochen-Gewohnheiten: Wochenziel der letzten zwei Wochen erreicht), schlägt die App vor, die Erinnerung abzuschalten. Freiwillig, jederzeit umkehrbar.
- **Graduierung ⬜ v6:** Am ersten Tag, an dem eine Gewohnheit 30 Tage ohne Erinnerung gelaufen ist und in diesen 30 Tagen mindestens 70 % der geplanten Termine gehalten wurden (Mini, Regentag, nachgeholt zählen; Wochen-Gewohnheiten gegen das anteilige Wochenziel) → Badge „Gemeistert“ und Eintrag in die Ruhmeshalle. (Bis v5: Stärke ≥ 0,8 – laut Simulation praktisch unerreichbar.) **Einmal erreicht, wird „Gemeistert“ nie wieder entzogen**, auch wenn die Stärke später sinkt. Schaltet der Nutzer die Erinnerung selbst wieder ein, beginnt eine neue Graduierung. Ziel: Die Gewohnheit funktioniert ohne die App (Stawarz 2015). **Kein großer Wettbewerber bietet das – zentrales Alleinstellungsmerkmal.**
- Ausschleichen und Graduierung sind umgesetzt ✅. **Echte Erinnerungen außerhalb der App erst in Flutter** (lokale Notifications zur Ankerzeit, ohne Server). Im PWA-Prototyp übernimmt Wilma diese Rolle, denn Web Push auf iOS bräuchte einen eigenen Push-Server.
- PWA-Hinweis: Web-Push auf iOS nur, wenn die PWA zum Home-Bildschirm hinzugefügt wurde (ab iOS 16.4). Im Prototyp Installationshinweis; in Flutter native Notifications.

### 4.6 Täglicher Check-in ✅

Ein kurzes Ritual macht die App selbst zur Gewohnheit (Finch-Prinzip):

- **Morgens (beim ersten Öffnen):** Tagesübersicht der Gewohnheiten mit ihren Ankern, optional 1–3 To-dos für heute auswählen und optional die Stimmung als Wetter wählen. Unter 30 Sekunden, jederzeit überspringbar.
- **Abends:** Logbuch-Eintrag schließt den Tag ab ✅.
- Der Morgen-Check-in öffnet sich nur zwischen 5 und 14 Uhr von selbst, danach per Knopf im Tab „Heute“.
- Kein Zwang, keine Strafe beim Auslassen.

---

## 5. Module

### 5.1 Onboarding & Gewohnheit anlegen ✅

**Erster Start:**
- Kurze Einführung durch den NPC, dann **höchstens 3 aktive Gewohnheiten in den ersten 7 Tagen** (pausierte zählen nicht). Danach bietet ein Banner an, weitere zu pflanzen; ab dann unbegrenzt (Habitica-Überforderung vermeiden).
- Keine Beispieldaten im echten Profil. Zum Zeigen und Ausprobieren gibt es einen **Demo-Hof** als eigenen Modus, der nicht gespeichert wird.

**Dialog „Gewohnheit anlegen“:**
1. Was möchtest du tun? (Titel)
2. **Wann genau?** „Nach ___ werde ich ___“ (Pflicht)
3. Wie oft ist realistisch? (Vorschlag, frei änderbar – nie feste Normziele wie „10.000 Schritte“)
4. Was ist die Mini-Version für schlechte Tage? (echte Handlung)
5. Zu welchem Skill gehört das? (wählen oder neu anlegen, Name frei)
6. Streak ja/nein, Erinnerung ja/nein, Aufwand 1–3

### 5.2 To-dos (Quests) ✅

- Einmalige Aufgaben mit Aufwand 1–3, gleiche XP-Logik, ohne Stärke/Streak. Optional einem Skill zugeordnet.
- Fälligkeitsdatum nur zur Planung; kein Countdown, kein „läuft ab“.
- Kein Gold-Lohn, nur XP und Funde (4.4) ✅.

### 5.3 Logbuch (Journal) ✅

- **Leichte Gamifizierung:** einmal pro Tag kleine XP für einen Eintrag, keine XP pro Wort.
- Wetter als Stimmungswahl steuert Szene und Musik ✅ – ein schöner, nicht-belohnender Rückkanal.
- Wechselnde Reflexionsfragen ✅, Wochenrückblick ✅, Archiv als Tagebuch im Farmhaus.
- Begründung: Reflexion ist oft schon intrinsisch motiviert – starke externe Belohnung könnte sie verdrängen (Crowding-out; Johnson 2016).

### 5.4 Spielwelt (Farm) 🟡

- Jede Gewohnheit = eine Pflanze/ein Beet; Skills = Gebäude oder Bereiche, die mit dem Level wachsen.
- **Nur echte Handlungen treiben die Welt an.** Funde kommen ausschließlich aus Erledigungen. Keine eigenständigen Minispiele (Paschmann 2025).
- **Begleiter/NPC (Phase 2, vorgezogen):** reagiert auf Fortschritte („Du warst diese Woche jeden Tag laufen!“), überbringt Nudges und Check-in. Deckt Verbundenheit ab, solange es keine sozialen Features gibt (Sailer 2017; Finch). v3: Wilma ✅. Später optional ein Farm-Tier als zweiter Begleiter.
- **Atmosphäre:** Tageszeit, Wetter, Jahreszeiten, wetterabhängige Klaviermusik ✅. Musik und Effekte getrennt schaltbar.
- **Schrittweise Freischaltung:** neue Bereiche, Jahreszeiten-Inhalte, Crafting über die ersten Wochen verteilt (Neuheitseffekt-Abfall nach ca. 3–8 Wochen, Koivisto & Hamari 2019).
- **Saisonale Events** pro Jahreszeit als Inhalts-Rhythmus (Habitica-Prinzip), ohne Zeitdruck und ohne verpassbare Exklusiv-Belohnungen.
- **„Die Farm schläft nachts“ ✅ (22–6 Uhr):** spätabends keine Spielaktionen – kurze Sessions, kein Grinding (Allcott et al. 2022).
- **Performance:** statische Ebenen nur bei Änderung neu zeichnen, Animation und Musik im Hintergrund pausieren ✅.

### 5.5 Fortschritt & Statistiken 🟡

- **Erntekalender (Phase 1) ✅:** Jahres-Kachelraster pro Gewohnheit und gesamt im Pixel-Stil; Kachelfarbe nach Status (erledigt / Mini / repariert); nachgetragene Tage ab v6 dezent markiert.
- Pro Skill ein Verlaufsgraph ✅ (v3: 30 Tage) (Vergleich mit sich selbst, nicht mit anderen – Sailer 2017). Gerade hier ist Habitica am schwächsten.
- Monatsrückblick ✅: erledigte Termine, gewachsene Pflanzen, gemeisterte Gewohnheiten.

### 5.6 Daten & Einstellungen ✅

- Export aller Daten (JSON) ✅, Import zur Wiederherstellung ✅.
- Gewohnheiten bearbeiten ✅ (Änderungen an Aufwand/Frequenz gelten ab dem Tag der Änderung).
- Gewohnheit pausieren/archivieren ✅. Löschen sofort mit Rückgängig, ohne Bestätigungsdialog; nur „Alles löschen“ mit einer neutralen zweiten Bestätigung ✅.
- **Barrierefreiheit ✅:** Schriftgrößen in rem mit Einstellung Normal / Groß / Sehr groß, Farbschema „Gut unterscheidbar“ (Okabe-Ito), eigene Muster je Status im Erntekalender, ARIA-Labels. iOS-Dynamic-Type folgt nativ in Flutter.
- Sounds, Musik, Nudges einzeln schaltbar; reduzierte Bewegung respektieren ✅.

---

## 6. Monetarisierung (vorläufig)

- **Kern dauerhaft kostenlos:** unbegrenzte Gewohnheiten, To-dos, Logbuch, Grundfarm, Statistiken inkl. Erntekalender.
- **Bezahlt:** kosmetische Pakete direkt in die Truhe (Gebäude, Deko, Tiere), saisonale Inhaltspakete, evtl. Sync und erweiterte Statistiken.
- **Alternative:** Einmalkauf „Farm-Erweiterung“ – passt zur Indie-Kultur von Stardew-Fans.
- **Regeln:**
  - Niemals verkaufen: Streak-Schutz, XP, schnelleres Wachstum, Schutz vor Verlust.
  - Gratisversion nachträglich nie verschärfen (Atoms-Erfahrung).
  - Transparente Preise, keine stillen Abo-Verlängerungen nach Testphasen (Fabulous-Erfahrung).

---

## 7. Bewusst NICHT umsetzen

- Ranglisten im MVP (später nur opt-in, kooperative Dorf-Ziele bevorzugt – Hanus & Fox 2015)
- Gruppen-Schaden bei verpassten Aufgaben (Habitica)
- Countdown-Quests und „läuft in 2 Std. ab“ (Berger et al. 2018)
- Verdorrende Pflanzen, HP-Verlust, „Deine Pflanzen sterben!“-Pushs, Confirmshaming beim Pausieren
- Fester Lohn pro Aufgabe (Gold, Münzen, Punkte zum Ausgeben)
- Feste Standardziele ohne Anpassung
- Bezahlte Streak-Freezes oder Bezahlung gegen Schuldgefühl
- In-Game-Währung bzw. Premiumwährung
- Erschwertes Löschen

---

## 8. Umsetzungsphasen

| Phase | Inhalt | Plattform | Stand (v5) |
|---|---|---|---|
| 1 – Kern | Gewohnheit mit Anker + Mini-Version, Onboarding (max. 3), Logging, Stärke, Skills/XP, verzeihende Streaks mit Tokens, To-dos, Erntekalender, Bearbeiten/Pausieren, Export/Import | PWA | ✅ |
| 2 – Welt | Hof mit Beeten und Gebäuden, Ernte, Funde und Truhe, NPC-Begleiter, Check-in, Logbuch, Sounds & Musik | PWA → Flutter | ✅ (Prototyp) |
| 3 – Nudges | Anker-basierte Erinnerungen, Ausschleichen, Graduierung | Logik im Prototyp, Erinnerungen in Flutter (iOS) | 🟡 Logik ✅, Erinnerungen → Flutter |
| 4 – Langzeit | Jahreszeiten-Inhalte, Freischaltungen, NPC-Story, saisonale Events, Monatsrückblicke, Widgets, Apple Health | Flutter (iOS) | 🟡 Jahreszeiten-Optik, Monatsrückblick |
| 5 – Sozial (optional) | Kooperatives Dorf mit Freunden, Teilen von Wochenkarten | Flutter (iOS, dann Android) | ⬜ |

**Nächster Schritt:** Prototyp v6 mit Claude Code (Nachtragen, erreichbare Graduierung, siehe Änderungen v1.5), parallel Selbsttest. Danach Entscheidung über die übrigen Simulations-Kandidaten, dann Flutter-Grundgerüst: Logik und Tests 1:1 nach Dart, Szene mit Flame, lokale Notifications.

---

## 9. Erfolg messen (Selbst- und Beta-Test)

- **Hauptmetrik:** Anzahl gehaltener und gemeisterter Gewohnheiten nach 30/66 Tagen – nicht Zeit in der App.
- **Nebenmetriken:** Anteil der Gewohnheiten mit Anker, Nutzung der Mini-Version, Rückkehr nach einem Streak-Bruch, Check-in-Quote. In v5 lokal berechnet (Fortschritt → „Selbsttest · Beta-Zahlen“) und als JSON exportierbar, keine Übertragung ✅.
- **Definitionen:**
  - *Gehalten nach 30/66 Tagen:* In den 14 Tagen bis Tag 30 bzw. 66 wurde mindestens die Hälfte der geplanten Termine erledigt (Mini, nachgeholt und Regentag zählen mit; Wochen-Gewohnheiten gegen das Wochenziel).
  - *Rückkehr nach Serienbruch:* Nach dem ersten verpassten Termin innerhalb von 7 Tagen wieder erledigt (mit Median der Tage).
  - Gelöschte Gewohnheiten fehlen in den Zahlen.
- **Fragebogen:** Bedürfnisbefriedigung (Autonomie, Kompetenz, Verbundenheit) nach METUX (Peters, Calvo & Ryan 2018), z. B. nach 2 und 8 Wochen.
- **Warnsignale:** sehr viele Mini-Aufgaben pro Tag (XP-Farming), lange Spielsessions ohne Erledigungen, Abbruch direkt nach Streak-Bruch, lange Phasen ohne Fund oder freien Deko-Platz (Ökonomie zu knapp).
- **Zielgruppen-Hypothesen (Beta):** Cozy-Game-Spieler (Stardew, Animal Crossing), Habitica-Abbrecher, Finch-Nutzer, die mehr Fortschritt wollen.

---

## Kernquellen

**Forschung:** Deci & Ryan 1985 · Deci, Koestner & Ryan 1999 · Fogg 2009 · Peters, Calvo & Ryan 2018 · Sailer et al. 2017 · Mekler et al. 2017 · Koivisto & Hamari 2019 · Hanus & Fox 2015 · Paschmann et al. 2025 (JMR) · Barari 2024 · Bitrián et al. 2021 · Berger et al. 2018 · Silverman & Barasch 2023 (JCR) · Weathers et al. (JAMS) · Lally et al. 2010 · Stawarz, Cox & Blandford 2015 (CHI) · Busch, Utesch & Strauss (RCT) · Villalobos-Zúñiga (UNIL 2022) · Johnson et al. 2016 · Gray et al. 2018 · Mathur et al. 2019 · Allcott, Gentzkow & Song 2022

**Markt:** Duolingo-Blog (Streak-Experimente) · Finch, Habitica, Loop, HabitKit, Forest, Atoms, Fabulous – Details und Links in der [Marktanalyse](marktanalyse-habit-apps.md)

Vollständige Forschungszusammenfassungen: [Research Insights for App Design](https://claude.ai/code/artifact/bf3f4dda-dc8c-4703-8009-641d0208463d)
