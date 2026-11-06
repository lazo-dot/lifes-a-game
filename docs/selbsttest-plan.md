# Life's a Game – Selbsttest-Plan (vorab festgelegt)

Stand: 02.11.2026 · Prototyp 8.2.1 auf main · Durchführung: Lars · Auswertung: Koordinations-Chat
Bezug: [Projektstatus](projektstatus.md) Entscheidungen 10–11 · [Leitfaden](habit-tracker-entwicklungsleitfaden.md) Abschnitt 9

Dieser Plan legt **vor** dem Blick auf die Daten fest, was gemessen wird und was als Erfolg gilt (wie eine Präregistrierung). Spätere Änderungen werden unten mit Datum und Grund vermerkt, nicht stillschweigend.

---

## 1. Rahmen

- **Zeitraum:** 03.11. – 23.11.2026 (3 Wochen). Verlängerung auf 66 Tage (bis 07.01.2027) möglich, die Hauptauswertung bleibt nach 3 Wochen.
- **Version eingefroren:** Auf main wird in dieser Zeit **nichts veröffentlicht** außer Fehlerbehebungen, die Daten oder Bedienung gefährden. v9 läuft nur als Branch unter `…/preview/` (eigener Speicher, berührt die Selbsttest-Daten nicht).
- **Ausgangslage festhalten (03.11.):** In der App unter Einstellungen „Sicherung erstellen“ und den Text speichern; Beta-Zahlen exportieren; Liste der Gewohnheiten mit Anker, Mini-Version und Erinnerung an/aus notieren.
- **Höchstens 3–5 Gewohnheiten**, die du wirklich aufbauen willst – keine Testgewohnheiten, die du ohnehin täglich tust.

## 2. Ersatz-Erinnerungen (prüft das Ausschleichen)

Die PWA kann keine Erinnerungen außerhalb der App senden. Damit „Erinnerung aus → Gemeistert“ trotzdem etwas misst:

1. Für jede Gewohnheit mit „Erinnerung“ in der App eine **Handy-Erinnerung** zur Ankerzeit anlegen (Anleitung unten), täglich bzw. an den Plan-Tagen. Text wie in der App: „Nach dem Kaffee: dehnen“ – der Plan, kein „Zeit zum …!“.
2. Schlägt die App vor, die Erinnerung abzuschalten (Ausschleichen), schaltest du **beide** ab: in der App und die Handy-Erinnerung (löschen, nicht nur ausblenden). Datum notieren.
3. Gewohnheiten ohne Erinnerung in der App bekommen auch keine Handy-Erinnerung.
4. Bei „3× pro Woche“ ohne feste Tage: Erinnerung täglich; wird das Wochenziel erreicht, die übrigen Tage einfach wegwischen.

So entspricht der Test dem späteren Flutter-Verhalten (lokale Benachrichtigung zur Ankerzeit).

### 2a. iPhone (iOS) – App „Erinnerungen“

1. App **Erinnerungen** öffnen, optional eine Liste „Selbsttest“ anlegen (unten rechts „Liste hinzufügen“).
2. Unten links **„Neue Erinnerung“** → Text eingeben, z. B. „Nach dem Kaffee: dehnen“.
3. Rechts auf das **ⓘ** tippen → **Datum** und **Uhrzeit** einschalten → Ankerzeit wählen (eher 5–10 Minuten *nach* der üblichen Ankerzeit, damit sie nach der Routine kommt).
4. **Wiederholen** → „Täglich“ oder **„Eigene“ → „Wöchentlich“** und die Plan-Tage antippen.
5. Oben rechts **„Fertig“**.
6. Prüfen: Einstellungen → Mitteilungen → Erinnerungen → „Mitteilungen erlauben“ ist an; ein aktiver Fokus (z. B. „Schlafen“) kann sie sonst stummschalten.
7. **Abschalten beim Ausschleichen:** Erinnerung nach links wischen → „Löschen“.

### 2b. Android – Google Kalender (oder Google Tasks)

Die Menüs heißen je nach Hersteller und Version leicht anders; der Weg ist überall ähnlich.

1. **Google Kalender** öffnen → unten rechts **„+“** → **„Aufgabe“** (falls nicht angeboten: „Termin“).
2. Titel eingeben, z. B. „Nach dem Kaffee: dehnen“.
3. Datum = heute, **Uhrzeit** = Ankerzeit (5–10 Minuten danach).
4. **„Wiederholt sich nicht“** antippen → **„Täglich“** oder **„Benutzerdefiniert“ → „Wöchentlich“** und die Plan-Tage wählen.
5. Bei einem **Termin** zusätzlich die Benachrichtigung auf **„Zum Zeitpunkt des Termins“** stellen; als Dauer genügen 5 Minuten.
6. **Speichern**.
7. Prüfen: Einstellungen → Apps → Kalender → Benachrichtigungen → an; „Nicht stören“ bzw. Schlafenszeit-Modus kann sie sonst stummschalten. Auf Geräten mit starkem Energiesparen (z. B. Samsung, Xiaomi) den Kalender unter Akku von der Optimierung ausnehmen, falls Erinnerungen ausbleiben.
8. **Abschalten beim Ausschleichen:** Eintrag öffnen → Papierkorb → **„Diese und alle folgenden“**.

*Alternativen:* App **Google Tasks** („+“ → Uhr-Symbol → Datum, Uhrzeit, „Wiederholen“) oder die **Uhr-App** (Wecker mit Bezeichnung und Wochentagen; nur sinnvoll, wenn ein Ton gewünscht ist).

### 2c. Prototyp auf dem Startbildschirm

- **iPhone:** Safari → `https://lazo-dot.github.io/lifes-a-game/` → Teilen-Symbol → **„Zum Home-Bildschirm“**.
- **Android:** Chrome → Adresse öffnen → Menü **⋮** → **„App installieren“** bzw. **„Zum Startbildschirm hinzufügen“**.
- Der Selbsttest läuft in der installierten App. Safari-/Chrome-Tab und Vorschau (`…/preview/`) speichern getrennt und eignen sich für Tests mit anderen Personen.

## 3. Was du notierst

| Wann | Was | Wo |
|---|---|---|
| Täglich, abends (1 Minute) | Für jede Gewohnheit: erledigt? eingetragen? Wenn erledigt, aber nicht eingetragen → Strich | Notiz-App, Vorlage unten |
| Bei Anlass | „Motiviert“ / „Nervt“ / „Verstehe ich nicht“ mit einem Satz | `docs/feedback.md` (oder hier im Chat) |
| Sonntags | Beta-Zahlen exportieren; Akku und Nutzungszeit (Wege siehe unten) | Notiz |
| Sonntags (2 Minuten) | Drei Fragen 1–5: „Ich habe die App gern geöffnet.“ · „Ich hatte das Gefühl, meine Gewohnheiten selbst zu wählen.“ · „Ich habe Fortschritt gespürt.“ (Kurzform Autonomie/Kompetenz nach METUX) | Notiz |
| Tag 21 | Sicherung + Beta-Zahlen exportieren, beides hierher bringen | Koordinations-Chat |

**Akku und Nutzungszeit ablesen (sonntags):**
- **iPhone:** Einstellungen → **Batterie** → „Letzte 10 Tage“ → Liste nach App: Anteil von „Life's a Game“ (je nach iOS-Version unter **Safari** geführt). Nutzungszeit: Einstellungen → **Bildschirmzeit** → „Alle Aktivitäten anzeigen“ → Woche.
- **Android:** Einstellungen → **Akku** → „Akkunutzung“ (Samsung: „Akku und Gerätepflege“ → Akku) → Anteil von „Life's a Game“ (ggf. unter **Chrome** geführt). Nutzungszeit: Einstellungen → **Digital Wellbeing** → Dashboard.
- Notieren: Anteil in % und Minuten pro Woche. Akku-Werte zeigen meist nur die letzten 1–10 Tage – deshalb jeden Sonntag ablesen.

**Vorlage Tagesnotiz:** `TT.MM · Dehnen ✓✓ · Lesen ✓– · Spazieren –– ` (erstes Zeichen: erledigt, zweites: eingetragen)

## 4. Erfolgskriterien (vorab festgelegt)

| # | Frage | Messung | Gilt als erfüllt, wenn … | Folge, wenn nicht |
|---|---|---|---|---|
| K1 | Kennt die App das Verhalten? | erledigt, aber nicht eingetragen (auch nicht nachgetragen) / alle Erledigungen | ≤ 10 % | Nachtragen/Erinnerung zum Eintragen in v10 stärken |
| K2 | Werden Gewohnheiten gehalten? | „gehalten“ nach Leitfaden 9 an Tag 21 | ≥ 2 von 3 Gewohnheiten | Anker/Mini-Version prüfen (v10-Vorlagen) |
| K3 | Hilft die Mini-Version? | Anteil Mini an gehaltenen Terminen; Tage, die nur dank Mini gehalten wurden | Mini wird genutzt (≥ 1× pro Woche) und nicht zur Regel (≤ 40 %) | > 40 %: Mini zu leicht oder Ziel zu hoch |
| K4 | Rückkehr nach Ausfall | Rückkehr nach Serienbruch ≤ 7 Tage (Leitfaden 9) | bei jedem Bruch | Rückkehr-Moment in v10 (Wilma, Fresh Start) |
| K5 | Ausschleichen erreichbar? | erster Vorschlag zum Abschalten | bis Tag 21 für mind. 1 Gewohnheit | Schwelle 0,6 + 12/14 prüfen |
| K6 | Motivation | Wochenfragen (Mittel) | Woche 3 nicht schlechter als Woche 1 um mehr als 1 Punkt | Belohnungsloch → Freischaltungen (v9) dichter |
| K7 | Akku | Anteil am Wochenverbrauch | ≤ 3 % bei normaler Nutzung | Szene/Musik-Pausen prüfen (Marketing Kritik 9) |

**Einschränkung:** n = 1, die Testperson kennt alle Regeln. Die Ergebnisse sind Hinweise für v10, keine Belege. Belastbarer werden sie erst mit dem Usability-Test und einer Beta.

## 5. Änderungen am Plan

| Datum | Änderung | Grund |
|---|---|---|
| 03.11.2026 | Anleitungen für iPhone und Android (Erinnerungen, Installation, Akku, Nutzungszeit) ergänzt; „iOS-Erinnerung“ → „Handy-Erinnerung“ | Wunsch Lars; Kriterien unverändert |
