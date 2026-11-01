# Prototyp v5 · Zusammenfassung für den Abgleich

Stand: 01.11.2026 · umgesetzt mit Claude Code im Repo `lifes-a-game-v4`. Die Abgleich-Checkliste ist bewusst nicht ausgefüllt.

## Umgesetzt

**Muss (H)**
1. **Repo-Struktur:** `src/` (ein Modul pro Datei), `public/` (HTML, CSS, Manifest, `sw.js`, Icons, Schriften), `tests/`, `docs/`, `tools/`. `npm run build` stellt `dist/` zusammen (siehe Abweichung 1).
2. **Tests:** 42 Node-Tests, alle grün (`npm test`), davon 23 neu. Abgedeckt: Stärke (exakte Formel, Regentag/nachgeholt = 1, heute zählt nicht), Wochenziel anteilig (Start und Pause mitten in der Woche), Pausen, Regentage (max. 2, nur mit Serie, automatisch), Reparatur (48 h, nur nach Erledigung heute, nicht bei Wochen-Gewohnheiten), Serie (Mini verlängert, Wochen-Serie), XP (10 × Aufwand, Mini 50 %, Nachholen 0, Anti-Farming an nicht geplanten Tagen, in Pausen, vor dem Anlegen, über dem Wochenziel), Level (beide Kurven, mehrere Stufen, Skill-/Charakter-XP aus Gewohnheiten, To-dos und Logbuch), Bearbeiten ab Datum, Ausschleichen, Graduierung, Ernte einmal pro Stufe, Fundchancen, Datenmodell (nur Eingaben gespeichert), Import, Farm schläft, Beta-Metriken.
3. **Echte PWA:** Manifest, Service Worker mit Offline-Cache (Version und Dateiliste setzt der Build automatisch), Hinweis „Neue Version bereit · Neu laden“ statt ungefragtem Neuladen. Schriften liegen lokal (Abweichung 2). In Headless-Chrome geprüft: Service Worker aktiv, App lädt offline vollständig. Hosting: GitHub-Actions-Workflow für GitHub Pages (`.github/workflows/pages.yml`, testet vor dem Veröffentlichen), Netlify Drop als Alternative. Anleitung im README.

**Sollte (M)**
4. **Fundchancen offen:** Truhe → „Wie Funde entstehen“: 12 % pro Erledigung (einmal pro Gewohnheit und Tag bzw. pro To-do), davon 20 % selten (2,4 % / 9,6 %), Ernte sicher, „Gemeistert“ sicher selten, alle Gegenstände nach Seltenheit, Erwartungswerte. Die Zahlen kommen direkt aus den Konstanten der Logik (`dropOdds`).
5. **Barrierefreiheit:** alle Schriftgrößen in rem; Einstellung „Schrift: Normal / Groß / Sehr groß“ (Fortschritt → Darstellung); Farbschema „Gut unterscheidbar“ (Okabe-Ito-Palette, für Rot-Grün-Schwäche); im Erntekalender eigenes Muster je Status (erledigt voll, Mini halb, nachgeholt gestreift, Regentag Tropfen, offen Kreuz), größere Kacheln; Mini-Haken mit eigenem, kleinerem Symbol. Vorhandene ARIA-Labels aus v4 (Tabs, Haken, Regentage, Fortschrittsbalken, Kalender als Bild mit Zusammenfassung) geprüft.
6. **Beta-Metriken:** Fortschritt → „Selbsttest · Beta-Zahlen“: gehalten und gemeistert nach 30/66 Tagen, Anteil Mini-Versionen (gesamt und 30 Tage), Rückkehr nach Serienbruch binnen 7 Tagen (mit Median), Check-in-Quote, Anteil mit Anker. Wird aus den gespeicherten Eingaben abgeleitet; Export als JSON-Datei oder in die Zwischenablage, keine Übertragung. Definitionen in Abweichung 4.

**Außerdem**
- „Gemeistert“ bleibt dauerhaft (Abweichung 3); vorher konnte das Abzeichen bei sinkender Stärke wieder verschwinden.

## Offen

- **7 · Erinnerungen über die installierte PWA:** ohne Server nicht sinnvoll machbar. Web Push auf iOS (ab 16.4, nur installiert) braucht einen Push-Server mit VAPID-Schlüssel, der zur Ankerzeit sendet; zeitgesteuerte lokale Benachrichtigungen (Notification Triggers) und Periodic Background Sync gibt es in Safari nicht. Eine Benachrichtigung nur bei geöffneter App brächte gegenüber Wilma nichts. → **Für Flutter vorgemerkt** (lokale Notifications, z. B. `flutter_local_notifications`, ohne Server). Im Prototyp bleibt Wilma als In-App-Nudge (E2 🟡).
- **8 · Schrittweise Freischaltung (N):** nicht umgesetzt. Es fehlen noch Inhalte zum Freischalten (Bereiche, Jahreszeiten-Inhalte, Crafting); vorher im Koordinations-Chat festlegen, was über die ersten Wochen freigeschaltet wird.
- **9 · Teilbare Karten (N):** nicht umgesetzt.
- **H6 · Akkuverbrauch:** im Selbsttest auf dem iPhone messen.
- **Test auf dem iPhone:** Installation über Safari und Offline-Betrieb auf dem Gerät stehen aus (siehe README). iOS-Dynamic-Type wird nicht übernommen; die Schriftgröße stellt man in der App ein (in Flutter nativ).

## Abweichungen

Siehe [ABWEICHUNGEN.md](ABWEICHUNGEN.md): 1 Kopier-Build nach `dist/` · 2 Schriften lokal · 3 „Gemeistert“ dauerhaft · 4 Definitionen der Beta-Metriken.
