# Life's a Game – Marketingkonzept (preiswert & effizient)

Stand: 01.11.2026 · Grundlage: Chat „Marketingkonzept für die App“, abgestimmt mit [Leitfaden v1.2](habit-tracker-entwicklungsleitfaden.md), [Marktanalyse](marktanalyse-habit-apps.md) und [Projektstatus](projektstatus.md)

---

## 1. Grundidee

Mit kleinem Budget gewinnt man nicht über Werbung, sondern über **eine scharfe Geschichte, zwei Kanäle und eine App, die sich selbst teilt**. Life's a Game hat dafür gute Voraussetzungen: Pixel-Art ist auf Social Media sehr sichtbar, die Cozy-Community ist groß und teilt gern, und im Cozy-Pixel-Segment gibt es keinen Marktführer (Marktanalyse, Abschnitt 4).

**Aufhänger (Hook):**
> „Die Habit-App, in der deine Pflanzen nie sterben – und die will, dass du sie irgendwann nicht mehr brauchst.“

Die Graduierung („Gemeistert, ohne Erinnerung“) widerspricht allem, was andere Apps tun. Genau so etwas wird geteilt und von Presse und Creatorn aufgegriffen.

**Positionierung als Gründer:**
> „Wirtschaftspsychologe und Forscher baut die Habit-App, die er selbst gebraucht hätte: auf Basis der Motivationsforschung, ohne die Tricks, mit denen andere Apps Nutzer binden.“

Motivation, Anreizsysteme, Nudging und Dark Patterns gehören zum Kern der Wirtschaftspsychologie. Das macht Lars glaubwürdig für genau die Themen, mit denen sich die App abgrenzt (Crowding-out, manipulative Gamification). Ein Gründer mit Fachhintergrund ist für Presse, Product Hunt und Creator ein stärkerer Aufhänger als ein reines Indie-Projekt.

**Produkt-Positionierung** (aus der Marktanalyse):
> Life's a Game ist die gemütliche Pixel-Farm, die mit deinem echten Leben wächst – für Menschen, die Gewohnheiten aufbauen wollen, ohne von Streaks und Schuldgefühlen getrieben zu werden.

**Zielgruppen:** Cozy-Gamer (Stardew Valley, Animal Crossing), Habitica-Abbrecher, Finch-Nutzer, die mehr Fortschritt wollen.

---

## 2. Phasen

### Phase 0 – Jetzt bis Beta (ca. 0–15 €/Monat, 2–3 h/Woche)

**Build in Public:** die Entwicklung dokumentieren statt werben. Höchstens zwei Kanäle.

- **Kanal 1 – Kurzvideos** (TikTok, Instagram Reels, YouTube Shorts; ein Video für alle drei): 15–30-s-Clips wie „Wetter wechselt, Musik wechselt mit“, „Gewohnheit erledigt → Pflanze wächst“, Vorher/Nachher von Pixel-Assets, Prototyp v2 → v3 → v4.
- **Content-Format „Forschung in 30 Sekunden“:** „Warum deine Habit-App dich manipuliert – und wie wir es anders machen“. Pro Video ein Befund mit passender Mechanik, z. B. Streak-Bruch (Silverman & Barasch) → Regentage, Crowding-out (Deci et al.) → Funde statt Lohn, Erinnerungen (Stawarz) → Graduierung. Verbindet Expertise und Produkt, ohne zu werben.
- **Kanal 2 – Communities:** Reddit (r/CozyGamers, r/PixelArt, r/IndieDev, r/getdisciplined, r/habits), Bluesky mit #pixelart und #screenshotsaturday. Erst mitreden, dann zeigen; Selbstpromo-Regeln jedes Subreddits beachten.
- **Landingpage mit Warteliste:** GIF, Hook, E-Mail-Feld, Fair-Play-Versprechen (Abschnitt 4), zusätzlich Android-Warteliste. Kostenloser Newsletter-Dienst, monatliches Devlog per Mail.
- **Kleiner Discord** für die ersten 50–200 Interessierten = späterer Beta-Pool.

**Startpunkt:** Neujahr 2027 eignet sich, um Build in Public und Warteliste zu starten (Fresh-Start-Stimmung, viel Interesse an Habit-Themen). Dafür reicht der installierbare Prototyp v4.

### Phase 1 – Beta (TestFlight)

- Tester aus Warteliste und Discord, gezielt aus den drei Zielgruppen.
- Metriken aus dem Leitfaden (Abschnitt 9) erheben, METUX-Fragebogen nach 2 und 8 Wochen. „Wir haben es gemessen“ ist glaubwürdiger als „wissenschaftlich fundiert“.
- Um **Zitate** bitten („Zum ersten Mal seit Jahren halte ich …“) für Screenshots und Website.
- Die Auswertung kann später ein Blogartikel oder Konferenzbeitrag werden – Marketing, das in der Nische kaum jemand kopieren kann.

### Phase 2 – Launch

- **Timing:** Habit-Apps haben die stärkste Nachfrage zum Jahreswechsel; Frühlingsanfang passt gut zur Farm. Der konkrete Termin hängt vom Flutter-Fortschritt ab (Roadmap im Projektstatus). Realistisch: Frühjahr 2027 oder Jahreswechsel 2027/28 – lieber ein guter Launch zum zweiten Termin als ein unfertiger zum ersten.
- **App-Store-Optimierung** (gratis, am wichtigsten): Untertitel und Keywords wie „habit tracker“, „cozy“, „pixel farm“, „routine“. Screenshots erzählen eine Geschichte: Anker → Pflanze wächst → Erntekalender → Gemeistert. Kurzes Preview-Video. Deutsch und Englisch von Anfang an.
- **Apple-Featuring:** über App Store Connect vorschlagen, 4–6 Wochen vor Launch. Indie-Apps mit eigenem Look und ohne Dark Patterns passen gut ins Beuteschema.
- **Micro-Creator-Outreach:** Cozy-Gaming- und Productivity-Creator mit 5.000–50.000 Followern. Kostenlose Kosmetik-Codes statt Geld. Presskit mit GIFs, Logo, Factsheet, Kontakt.
- **Product Hunt** am Launchtag, unterstützt durch Discord und Warteliste.

### Phase 3 – Wachstum aus der App selbst

- **Teilbare Karten:** Wochenkarte, Erntekalender und „Gemeistert“-Badge als Pixel-Bilder mit dezentem App-Namen (HabitKit-Raster werden ständig gepostet).
- **Saisonale Events** als vier Marketing-Anlässe pro Jahr.
- **Empfehlung:** beide Seiten bekommen einen kosmetischen Gegenstand für die Truhe – keine Belohnung, die Druck macht.
- **Bezahlte Werbung erst danach:** kleiner Apple-Search-Ads-Test (ca. 5 €/Tag), wenn die Store-Seite organisch gut konvertiert.

---

## 3. Budget (erstes Jahr, grob)

| Posten | Kosten |
|---|---|
| Apple Developer Program | 99 $/Jahr (erst für TestFlight nötig) |
| Domain + Landingpage | ca. 20–80 €/Jahr |
| Newsletter, Discord, Social | 0 € (Gratis-Tarife) |
| Kosmetik-Codes für Creator | 0 € (eigene Inhalte) |
| Optional: Search-Ads-Test | 100–300 € |
| Optional: Pixel-Artist für Key-Art/Icon | einige hundert € (siehe Kritik 2) |

---

## 4. Fair-Play-Versprechen (Entwurf für Website und Store)

> **Unser Fair-Play-Versprechen**
> - Deine Pflanzen sterben nie. Wenn du einen Tag verpasst, wachsen sie nur etwas langsamer.
> - Keine Schuldgefühle: keine Nachrichten über gerissene Serien, keine Countdowns, keine „Letzte Chance“-Hinweise.
> - Fortschritt ist nicht käuflich. XP, Wachstum und Serienschutz gibt es nur durch das, was du wirklich tust.
> - Funde sind Überraschungen, keine Lootboxen. Sie kosten nie Geld, und die Fundchancen sind offen einsehbar.
> - Der Kern bleibt kostenlos – unbegrenzte Gewohnheiten, To-dos und Logbuch. Wir verschlechtern die Gratisversion nie nachträglich.
> - Deine Daten gehören dir: lokal gespeichert, ohne Werbe-Tracking, Export mit einem Tipp.
> - Unser Ziel ist, dass deine Gewohnheiten irgendwann ohne uns funktionieren.

Jeder Punkt ist im Leitfaden verankert (Prinzipien 1–8, Abschnitte 4.4, 6, 7). Vor Veröffentlichung gegen den dann aktuellen Stand der App prüfen.

---

## 5. Kritik vorbeugen

| # | Mögliche Kritik | Vorbeugung |
|---|---|---|
| 1 | „Noch eine Habit-App“ / „Stardew-Klon“ | Mit den USPs führen (Anker, Graduierung, nie sterbende Pflanzen), nicht mit „Pixel-Farm“. „Inspiriert von Cozy Games“, aber keine fremden Markennamen in Keywords oder App-Name. Namen „Life's a Game“ markenrechtlich (DPMA/EUIPO) und auf gleichnamige Apps prüfen – die Phrase ist sehr generisch. |
| 2 | KI-generierte Grafik oder Musik | In der Pixel-/Cozy-Community ein heikles Thema, das einen Launch kippen kann. Eigene oder beauftragte Assets und das offen sagen – oder transparent machen, wo KI genutzt wurde. Die prozedural erzeugte Klaviermusik ehrlich als „im Code komponiert“ beschreiben. Hier lohnt sich ein bezahlter Pixel-Artist am meisten. |
| 3 | „Manipulative Gamification“ / Lootbox-Vorwurf | Die Überraschungsfunde (variable Belohnung) sind der angreifbarste Punkt. Nie mit Echtgeld verknüpfen, Fundchancen offen anzeigen (12 %, davon 20 % selten), Fair-Play-Versprechen öffentlich machen. Zugleich stärkstes Argument gegen Duolingo und Atoms. |
| 4 | Abo-Frust | Transparente Preise, keine stillen Testabos, Kern dauerhaft gratis (Leitfaden 6), Preisänderungen offen kommunizieren. |
| 5 | Datenschutz beim Logbuch | Stimmungs- und Tagebuchdaten sind sensibel: lokal speichern, keine Tracking- oder Werbe-SDKs, Store-Label möglichst „Keine Daten erhoben“. Website mit Impressum und DSGVO-Datenschutzerklärung; bei Apple Health entsprechend mehr. |
| 6 | Überzogene Wissenschafts- oder Gesundheitsversprechen | „Basierend auf Forschung zu Gewohnheitsbildung“ mit Quellenseite, nie „beweist“, „heilt“ oder „gegen Depression“ (UWG, Heilmittelwerberecht, Apple-Richtlinien). Titel korrekt führen: „Wirtschaftspsychologe (B.Sc.)“, nicht „Psychologe“. Nichts, was nach Therapie klingt. |
| 7 | Barrierefreiheit | Skalierbare Schrift (Pixel-Fonts sind schnell zu klein), Symbole zusätzlich zur Farbe im Erntekalender, farbenblind-taugliche Palette, VoiceOver-Labels, reduzierte Bewegung (in v3 bereits vorhanden). |
| 8 | „Das Spiel lenkt vom Leben ab“ | Aktiv kommunizieren: Spielaktionen nur nach echten Erledigungen, die Farm schläft nachts (22–6 Uhr). Dreht den Einwand in ein Argument. |
| 9 | Datenverlust und Akku | Export zum Launch (in v3 vorhanden), Import ergänzen. Akkuverbrauch von Musik und Animation vor dem Launch messen. |
| 10 | „Nur iOS“ | Android-Warteliste auf der Landingpage macht aus Kritik Leads. |
| 11 | Formales | EU-App-Store: Händlerangabe (Trader) mit öffentlich sichtbarer Adresse – Geschäftsadresse einplanen. Nebentätigkeit ggf. beim Arbeitgeber anzeigen bzw. genehmigen lassen. |

---

## 6. Nächste Marketing-Schritte (an die Roadmap gekoppelt)

| Wann | Schritt |
|---|---|
| Jetzt | Name prüfen (DPMA/EUIPO, App Store), Domain sichern, Social-Handles reservieren |
| Mit Prototyp v4 | Erste 3–5 Clips aus dem Prototyp, Landingpage mit Warteliste und Fair-Play-Versprechen |
| Ab Neujahr 2027 | Build in Public regelmäßig (2–3 h/Woche), Discord öffnen |
| Mit Flutter-Beta | TestFlight-Beta, Metriken + METUX, Zitate sammeln, Presskit |
| 4–6 Wochen vor Launch | Apple-Featuring vorschlagen, Creator anschreiben, Store-Seite finalisieren |
