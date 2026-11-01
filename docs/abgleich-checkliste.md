# Life's a Game – Abgleich-Checkliste Prototyp ↔ Leitfaden v1.4

Stand: 01.11.2026 (v5 abgeglichen) · Wird für jede Prototyp-Version neu ausgefüllt (v3, v4 …). Referenz: [Entwicklungsleitfaden v1.2](habit-tracker-entwicklungsleitfaden.md)

Bewertung: ✅ erfüllt · 🟡 teilweise · ❌ fehlt · ⚠️ widerspricht Leitfaden · — bewusst verschoben
Priorität (Spalte „Prio“, für Selbsttest und Flutter): **H** muss · **M** sollte · **N** kann

---

## A. Kernmechanik (Phase 1)

| # | Prüfpunkt | Leitfaden | v2 | v3 | v4 | v5 | Prio | Notiz |
|---|---|---|---|---|---|---|---|---|
| A1 | Anker „Nach ___ werde ich ___“ ist Pflichtfeld beim Anlegen | 3, 5.1 | ❌ | ✅ | ✅ | ✅ |  |  |
| A2 | Mini-Version pro Gewohnheit, zählt voll für Stärke/Streak, 50 % XP | 4.1 | ❌ | ✅ | ✅ | ✅ |  |  |
| A3 | Frequenz: täglich, x-mal pro Woche, Wochentage | 3 | ❌ | ✅ | ✅ | ✅ |  |  |
| A4 | Aufwand 1–3 → XP `10 × effort` | 4.1 | 🟡 S/M/L 10/25/50 | ✅ | ✅ | ✅ |  |  |
| A5 | Anti-Farming: XP max. 1× pro geplantem Termin | 4.1 | | ✅ | ✅ | ✅ |  | pro Termin, aus Log berechnet |
| A6 | XP-Text mit echter Fortschrittsinfo („12× diesen Monat“) | 4.1 | | ✅ | ✅ | ✅ |  |  |
| A7 | Level-Kurve `round(100 × L^1.5)` | 4.1 | 🟡 linear | ✅ | ✅ | ✅ |  | Skills 50 × L^1.5 – in Leitfaden übernommen |
| A8 | „Noch X bis Level Y“ sichtbar | 4.1 | | ✅ | ✅ | ✅ |  |  |
| A9 | Rückgängig ohne rote Minus-Animation | 4.1 | ⚠️ Minus-Anzeige | ⚠️ | ✅ | ✅ |  | Minus-Anzeige entfernt |
| A10 | Gewohnheitsstärke `a = 0.044` pro geplantem Termin | 4.2 | ❌ | ✅ | ✅ | ✅ |  |  |
| A11 | Wöchentliche Gewohnheiten pro Termin, nicht pro Tag berechnet | 4.2 | ❌ | 🟡 | ✅ | ✅ |  | angebrochene Wochen anteilig (Leitfaden v1.4) |
| A12 | Streak pro Gewohnheit ein/aus, Standard aus bei wöchentlich | 4.3 | ❌ | ✅ | ✅ | ✅ |  |  |
| A13 | Mini-Version verlängert Streak | 4.3 | ❌ | ✅ | ✅ | ✅ |  |  |
| A14 | Regentag-Token: 1 pro 7 Termine, max. 2, automatisch eingesetzt | 4.3 | ❌ | ✅ | ✅ | ✅ |  |  |
| A15 | Reparatur-Quest innerhalb 48 h | 4.3 | ❌ | ✅ | ✅ | ✅ |  |  |
| A16 | Nach Bruch „X Tage dieses Jahr“ statt „0“ | 4.3 | ❌ | ✅ | ✅ | ✅ |  |  |
| A17 | To-dos mit Aufwand, optional Skill, Fälligkeit ohne Countdown | 5.2 | ✅ | ✅ | ✅ | ✅ |  | im Tab „Heute“ |
| A18 | Skills frei benennbar, eigene Level | 3 | 🟡 5 feste Skills | ✅ | ✅ | ✅ |  | frei benennbar, max. 6 |

## B. Belohnungsökonomie

| # | Prüfpunkt | Leitfaden | v2 | v3 | v4 | v5 | Prio | Notiz |
|---|---|---|---|---|---|---|---|---|
| B1 | Kein fester Gold-Lohn pro Aufgabe | 4.4 | ⚠️ 5/12/25 Gold | ✅ | ✅ | ✅ |  | gar keine Währung mehr |
| B2 | Gold aus Ernte bei neuer Wachstumsstufe | 4.4 | ❌ | ❌ | ✅ | ✅ |  | Ernte einmal pro Wachstumsstufe |
| B3 | Überraschungs-Drops 10–15 %, seltene Items seltener | 4.4 | ❌ | ✅ | ✅ | ✅ |  | 12 %, davon 20 % selten |
| B4 | Gold bei Meilensteinen (Skill-Level, Gemeistert) | 4.4 | | 🟡 | ✅ | ✅ |  | seltener Fund bei „Gemeistert“ |
| B5 | Laden nur Kosmetik, nie XP/Wachstum/Streak-Schutz | 4.4 | ✅ | — | — | — |  | kein Laden mehr (Leitfaden v1.4) |
| B6 | Nur eine Währung | 4.4, 7 | ✅ | ✅ | ✅ | ✅ |  |  |

## C. Spielwelt & Atmosphäre (Phase 2)

| # | Prüfpunkt | Leitfaden | v2 | v3 | v4 | v5 | Prio | Notiz |
|---|---|---|---|---|---|---|---|---|
| C1 | Jede Gewohnheit = eigene Pflanze/Beet, wächst mit Stärke | 4.2, 5.4 | 🟡 Hof wächst gesamt | ✅ | ✅ | ✅ |  | max. 12 Beete sichtbar |
| C2 | Pflanzen sterben nie, werden nur kleiner/blasser | 4.2, Prinzip 8 | | ✅ | ✅ | ✅ |  |  |
| C3 | Skills als Gebäude/Bereiche, wachsen mit Level | 5.4 | | 🟡 | ✅ | ✅ |  | v3 war bereits erfüllt (Gebäude pro Skill) – Bewertung korrigiert |
| C4 | NPC reagiert auf echten Fortschritt, ohne Schuldton | 4.5, 5.4 | ✅ Wilma | ✅ | ✅ | ✅ |  |  |
| C5 | Tageszeit, Wetter, Jahreszeit, Musik je Wetter | 5.4 | ✅ | ✅ | ✅ | ✅ |  |  |
| C6 | Musik und Effekte getrennt schaltbar | 5.4 | ✅ | ✅ | ✅ | ✅ |  |  |
| C7 | Keine Spielaktionen ohne echte Erledigung | Prinzip 6 | ✅ | ✅ | ✅ | ✅ |  |  |
| C8 | „Farm schläft nachts“ (spät keine Spielaktionen) | 5.4 | | ✅ | ✅ | ✅ |  | 22–6 Uhr |
| C9 | Schrittweise Freischaltung über die ersten Wochen | 5.4 | ❌ | ❌ | ❌ | ❌ | N | braucht erst Festlegung der Inhalte (Koordinations-Chat) |
| C10 | Performance: statische Ebenen gecacht, Pause im Hintergrund | 5.4 | ✅ | ✅ | ✅ | ✅ |  |  |

## D. Rituale, Statistik, Onboarding

| # | Prüfpunkt | Leitfaden | v2 | v3 | v4 | v5 | Prio | Notiz |
|---|---|---|---|---|---|---|---|---|
| D1 | Morgen-Check-in (< 30 s, überspringbar) | 4.6 | ❌ | 🟡 | ✅ | ✅ |  | Check-in öffnet 5–14 Uhr von selbst, sonst per Knopf |
| D2 | Logbuch schließt den Tag ab, kleine XP 1×/Tag | 4.6, 5.3 | ✅ | ✅ | ✅ | ✅ |  |  |
| D3 | Wechselnde Reflexionsfragen | 5.3 | | ✅ | ✅ | ✅ |  |  |
| D4 | Erntekalender (Jahres-Kachelraster) | 5.5 | 🟡 7-Tage-Leiste | ❌ | ✅ | ✅ |  | Jahres-Kachelraster fehlt |
| D5 | Skill-Verlaufsgraph | 5.5 | ❌ | ✅ | ✅ | ✅ |  | 30 Tage |
| D6 | Onboarding mit NPC, max. 3 Gewohnheiten zum Start | 5.1 | ❌ Beispieldaten | ❌ | ✅ | ✅ |  | max. 3 aktive Gewohnheiten in den ersten 7 Tagen |
| D7 | Keine Beispieldaten im echten Profil | 5.1 | ⚠️ | ⚠️ | ✅ | ✅ |  | Demo-Hof als eigener, nicht gespeicherter Modus |

## E. Nudges (Phase 3 – im Prototyp nur vorbereiten)

| # | Prüfpunkt | Leitfaden | v2 | v3 | v4 | v5 | Prio | Notiz |
|---|---|---|---|---|---|---|---|---|
| E1 | Nudge-Text = Plan des Nutzers („Nach dem Kaffee: dehnen“) | 4.5 | ❌ | ✅ | ✅ | ✅ |  | über Wilma |
| E2 | Max. 1 Nudge pro Gewohnheit/Tag zur Ankerzeit | 4.5 | | 🟡 | 🟡 | 🟡 | — | ohne Push-Server nicht machbar → Flutter (lokale Notifications) |
| E3 | Ausschleichen-Vorschlag ab Stärke ≥ 0,8 und 14 Terminen | 4.5 | ❌ | ✅ | ✅ | ✅ |  |  |
| E4 | Graduierung „Gemeistert“ nach 30 Tagen ohne Erinnerung | 4.5 | ❌ | ✅ | ✅ | ✅ |  | „Gemeistert“ jetzt dauerhaft (Leitfaden v1.4) |
| E5 | Installationshinweis für iOS-Web-Push | 4.5 | ❌ | ❌ | ✅ | ✅ |  |  |

## F. Technik & Daten

| # | Prüfpunkt | Leitfaden | v2 | v3 | v4 | v5 | Prio | Notiz |
|---|---|---|---|---|---|---|---|---|
| F1 | Datenmodell entspricht Leitfaden 3 | 3 | ❌ | ✅ | ✅ | ✅ |  | weitgehend |
| F2 | Spiellogik als UI-freies Modul (portierbar nach Dart) | 2 | ❌ Einzeldatei | ❌ | ✅ | ✅ |  | Module LAG (Logik), Store, Scene, Sprites, Audio, UI, Demo – klassische Skripte mit Namensraum |
| F3 | Tests für Formeln (Stärke, Streak, Tokens, XP) | 2 | ❌ | ❌ | 🟡 | ✅ |  | 42 Node-Tests grün, im Koordinations-Chat nachgeprüft |
| F4 | Manifest + Service Worker (installierbar, offline) | 2 | ❌ | ❌ | 🟡 | 🟡 | H | Manifest, Service Worker, Offline in Headless-Chrome geprüft; Test auf dem iPhone steht aus |
| F5 | IndexedDB statt localStorage | 2 | ❌ | ❌ | ✅ | ✅ |  | IndexedDB |
| F6 | Export/Import aller Daten | 5.6 | ❌ | 🟡 | ✅ | ✅ |  | Export, Import, Löschen |
| F7 | Pausieren/Archivieren statt Löschen, Löschen ohne Hürde | 5.6 | | ❌ | ✅ | ✅ |  | Bearbeiten (ab Datum, ohne Rückwirkung), Pausieren, Archivieren; Löschen mit Rückgängig |
| F8 | Reduzierte Bewegung respektiert | 5.6 | ✅ | ✅ | ✅ | ✅ |  |  |

## G. Ausschlüsse (dürfen nicht vorkommen)

| # | Prüfpunkt | v2 | v3 | v4 | v5 |
|---|---|---|---|---|---|
| G1 | Countdowns / „läuft ab“ | ✅ keine | ✅ keine | ✅ keine | ✅ keine |
| G2 | Ranglisten, Gruppen-Schaden | ✅ keine | ✅ keine | ✅ keine | ✅ keine |
| G3 | Verdorren, HP-Verlust, Schuld-Pushs | ✅ keine | ✅ keine | ✅ keine | ✅ keine |
| G4 | Confirmshaming beim Pausieren/Löschen | | ✅ keine |
| G5 | Bezahlter Streak-Schutz, Premiumwährung | ✅ keine | ✅ keine | ✅ keine | ✅ keine |
---

## H. Neu ab v5 (aus Marketingkonzept und Technik)

| # | Prüfpunkt | Quelle | v4 | v5 | Prio | Notiz |
|---|---|---|---|---|---|---|
| H1 | App ist gehostet (HTTPS, eigene Adresse) und auf dem iPhone installierbar, läuft offline | Leitfaden 2 | ❌ | 🟡 | H | GitHub-Pages-Workflow (testet vor Veröffentlichung), Repo gepusht; Installation auf dem iPhone steht aus |
| H2 | Formeln (Stärke, Streak, Tokens, XP, Wochenziel) mit automatischen Tests abgesichert, Tests laufen grün | Leitfaden 2 | 🟡 | ✅ |  | 42 Tests, alle Formeln |
| H3 | Fundchancen in der App offen einsehbar (12 %, davon 20 % selten) | Marketing 5, Kritik 3 | ❌ | ✅ |  | Truhe → „Wie Funde entstehen“, Werte direkt aus der Logik |
| H4 | Barrierefreiheit: skalierbare Schrift, Symbole zusätzlich zur Farbe im Erntekalender, VoiceOver-Labels | Marketing 5, Kritik 7 | ❌ | ✅ |  | Schrift in 3 Stufen, Okabe-Ito-Palette, Muster im Erntekalender, ARIA geprüft; iOS-Dynamic-Type erst in Flutter |
| H5 | Beta-Metriken lokal erfasst (gehaltene/gemeisterte Gewohnheiten nach 30/66 Tagen, Mini-Nutzung, Rückkehr nach Bruch, Check-in-Quote) und exportierbar | Leitfaden 9 | ❌ | ✅ |  | Fortschritt → „Selbsttest · Beta-Zahlen“, Export als JSON |
| H6 | Akkuverbrauch von Musik und Animation auf dem iPhone gemessen | Marketing 5, Kritik 9 | ❌ | ❌ | M | im Selbsttest messen |
| H7 | Teilbare Karten (Woche, Erntekalender, Gemeistert) als Bild | Marketing Phase 3 | ❌ | ❌ | N |  |

## Ergebnis v3 (01.11.2026)

- **Erfüllt:** 35 von 54 Prüfpunkten (plus alle 5 Ausschlüsse eingehalten). Die komplette Kernmechanik steht: Anker, Mini-Version, Frequenzen, Stärke als Pflanze, verzeihende Serien mit Regentagen und Reparatur, Funde statt Gold, Ausschleichen und Graduierung, Wilma, Rückblicke, Export. Keine Ausschlüsse verletzt.
- **Muss in v4 (H):**
  1. Onboarding mit NPC, max. 3 Gewohnheiten, ohne Beispieldaten (D6, D7)
  2. Gewohnheiten bearbeiten und archivieren (F7)
  3. Erntekalender als Jahresraster (D4)
  4. Code in Module trennen: Logik / Szene / Musik / UI, mit Tests für die Formeln (F2, F3) – Voraussetzung für den Flutter-Port
  5. Echte PWA: Manifest + Service Worker, damit v4 auf dem iPhone installierbar ist und sich selbst testen lässt (F4)
- **Sollte in v4 (M):** Minus-Anzeige beim Rückgängig entfernen (A9) · Morgen-Check-in (D1) · Ernte als garantierter Fund (B2) · IndexedDB und Import (F5, F6) · Installationshinweis iOS (E5) · Stärke bei Wochen-Gewohnheiten pro Termin prüfen (A11)
- **Kann (N):** Fund bei „Gemeistert“ (B4) · Skills als Gebäude (C3) · schrittweise Freischaltung (C9) · Push außerhalb der App (E2)
- **Leitfaden angepasst (v1.2):** Gold und Laden entfallen zugunsten von Funden, Truhe und Deko-Plätzen; Hof in Draufsicht; Skill-Kurve 50 × L^1.5.

---

## Ergebnis v4 (01.11.2026)

- **Erfüllt:** 49 von 54 Prüfpunkten aus A–F (v3: 35), einer bewusst entfallen (Laden), alle Ausschlüsse eingehalten. Alle Muss-Punkte aus dem Abgleich v3 sind umgesetzt oder so weit vorbereitet, wie es im Artifact möglich ist: Onboarding mit Demo-Hof, Bearbeiten/Pausieren/Archivieren, Erntekalender, Code in Modulen, IndexedDB, Import, Morgen-Check-in, Ernte.
- **Offen, weil im Artifact nicht machbar:** Hosting und Installation als PWA (F4, H1), Push außerhalb der App (E2), Verifikation der Tests im Repo (F3, H2).
- **Muss in v5 (H):** H1 Hosting + Installation · H2 Tests im Repo prüfen und ergänzen.
- **Sollte in v5 (M):** H3 Fundchancen anzeigen · H4 Barrierefreiheit · H5 Beta-Metriken für den Selbsttest · E2 echte Erinnerungen über die installierte PWA prüfen.
- **Kann (N):** C9 schrittweise Freischaltung · H6 Akku messen · H7 teilbare Karten.
- **Leitfaden angepasst (v1.3):** 9 der 10 Abweichungen aus v4 übernommen (abgeleitete Werte, Zusatzfelder, Regentag = erledigt, anteilige Wochen, 5 Wetter, harte Onboarding-Grenze, Check-in-Fenster, Demo-Hof, Löschen mit Rückgängig). Die Technikwahl „klassische Skripte“ gilt für den Prototyp; über ES-Module entscheidet v5.

---

## Ergebnis v5 (01.11.2026)

Umgesetzt mit Claude Code im Repo `lifes-a-game-v4` (GitHub: lazo-dot/lifes-a-game).

- **Erfüllt:** 50 von 54 Punkten aus A–F (v4: 49), einer bewusst entfallen (Laden), dazu H2–H5. Alle Ausschlüsse eingehalten. Die 42 Tests wurden im Koordinations-Chat nachgeprüft: alle grün.
- **Muss vor dem Selbsttest (H):** F4/H1 – App über GitHub Pages auf dem iPhone installieren und offline prüfen (Flugmodus).
- **Im Selbsttest (M):** H6 Akkuverbrauch messen.
- **Bewusst nach Flutter verschoben:** E2 echte Erinnerungen (Web Push auf iOS braucht einen Server; lokale Notifications gehen erst nativ), iOS-Dynamic-Type.
- **Kann (N):** C9 schrittweise Freischaltung (erst Inhalte festlegen), H7 teilbare Karten.
- **Leitfaden angepasst (v1.4):** alle 4 Abweichungen übernommen – Kopier-Build nach `dist/`, keine externen Anfragen (Schriften lokal), „Gemeistert“ dauerhaft, Definitionen der Beta-Metriken – plus Push-Entscheidung für Flutter.

---

## Ergebnis Selbsttest / Flutter (später ausfüllen)

- **Erkenntnisse aus dem Selbsttest:** …
- **Leitfaden anpassen:** …
