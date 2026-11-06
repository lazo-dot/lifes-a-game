# Life's a Game – Hinweise für Claude Code

Gamifizierter Habit-Tracker mit To-dos und Logbuch als gemütliche Pixel-Farm: Gewohnheiten wachsen als Pflanzen, Skills als Gebäude. Installierbare PWA auf GitHub Pages (`https://lazo-dot.github.io/lifes-a-game/`), Entwickler Lars (MacBook Pro M4), Sprache im Projekt Deutsch (UI; Kommentare dürfen Englisch sein). Stand: 8.2.1 (v8c „Ruhiger Bildschirm“ plus Arbeitsablauf); Selbsttest und Usability-Test laufen auf `main`.

## Ablauf

Jeder Schritt hat eine Auftragsdatei in `docs/auftraege/` (angelegt vom Koordinations-Chat). Ablauf, Regeln und Stand: **`docs/auftraege/README.md`**. Die aktuelle Arbeitsliste steht nur in der jeweiligen Auftragsdatei; erledigte Listen: `docs/archiv/arbeitslisten.md`.

Kurz: Auftrag lesen → auf einem Branch arbeiten → `npm test` und `npm run abnahme` grün → Branch pushen → Vorschau unter `https://lazo-dot.github.io/lifes-a-game/preview/` → Zusammenfassung `docs/V<version>-ZUSAMMENFASSUNG.md` → Merge nach `main` erst nach Freigabe von Lars.

## Quellen der Wahrheit

- `docs/habit-tracker-entwicklungsleitfaden.md` – **verbindlich** für Mechaniken, Formeln, Datenmodell und Prinzipien (aktuell v1.10).
- `docs/auftraege/<auftrag>.md` – was jetzt zu tun ist.
- `docs/rolle-spieleentwickler.md` – Rolle und Arbeitsweise (gepflegt im Koordinations-Chat).
- `docs/abnahme.json` – Grenzwerte für `npm run abnahme` (Abschnitt `immer` plus Abschnitt der Version).
- `docs/feedback.md` – Lars' Beobachtungen; offene Punkte, die die Abnahme schon kennt, stehen dort.
- `docs/ux-verschlankung-v8c.md` (Regeln 1–8), `docs/pixel-styleguide-stil-b.md` (Raster, Licht-Ebenen, Lieferformat), `docs/farbthemen.json` (Themen und Akzente, Test auf Übereinstimmung).
- `docs/ux-testleitfaden-v6.md` – Usability-Test; alle Aufgaben müssen lösbar bleiben (Bearbeiten und Pausieren über das Info-Blatt).
- Hintergrund: `docs/abgleich-checkliste.md`, `docs/ux-heuristische-evaluation-v6.md`, `docs/simulation-*.md`, `docs/marketingkonzept.md`.

Auftragsdateien, Leitfaden, Checkliste, Konzepte und `abnahme.json` pflegt nur der Koordinations-Chat (claude.ai-Projekt „Life's a Game“). **Hier nicht inhaltlich ändern**, sondern so committen, wie sie im Arbeitsverzeichnis liegen. Bewusste Abweichungen mit Grund in `docs/ABWEICHUNGEN.md` (Abschnitt der jeweiligen Version).

## Unverhandelbare Prinzipien (Kurzfassung, Details im Leitfaden)

1. Nutzer besitzen ihre Ziele – nur anpassbare Vorschläge, keine Normziele.
2. XP ist Feedback, keine Bezahlung – keine Währung, kein Laden, nur Überraschungsfunde (12 %, davon 20 % selten, nur am selben Tag) und garantierte Funde bei Ernte/„Gemeistert“.
3. Serien verzeihen – Regentage, Nachtragen 48 h, Extra-Runde; verzeihende Mechaniken setzen keine Zähler zurück.
4. Auslöser statt Erinnerungen – Anker ist Pflicht; Erinnerungen werden ausgeschlichen, Ziel ist „Gemeistert“.
5. Spielaktionen nur nach echten Erledigungen; die Farm schläft 22–6 Uhr.
6. Keine Dark Patterns: keine Countdowns, Schuld-Nachrichten, Verlustmechaniken, kein Confirmshaming.
7. Pflanzen sterben nie, „Gemeistert“ wird nie entzogen.
8. Daten bleiben lokal, keine externen Anfragen.

## Architekturregeln

- `src/logic.js` bleibt UI-frei. Spielregeln (Stärke, XP, Fundchance 12 %/20 %, Regentage, Nachtragen, Graduierung) ändern sich nur, wenn eine Auftragsdatei es ausdrücklich verlangt. Bestehende Tests bleiben inhaltlich unverändert.
- Gespeichert werden nur Eingaben; das Speicherschema bleibt `4`. Seit v8 dazugekommen, alle optional bzw. migriert: `skill.buildingType`, `habit.plantType` (`LAG.migrateV8a`), `theme`, `accent`. Bestehende Truhen, platzierte Gegenstände und Exporte (v3, v5, v7, v8) bleiben gültig.
- Klassische Skripte, Kopier-Build nach `dist/` (`tools/build.js`), kein Bundler, keine Abhängigkeiten.
- Vorschau-Build: `PREVIEW_BRANCH=<branch> npm run build` → Cache `preview-lag-…`, Speicher mit Präfix `preview-` (IndexedDB `preview-lifes-a-game`, localStorage `preview-…`), Service Worker mit Scope `…/preview/`, Band „Vorschau · Branch · Version“. Erkannt wird die Vorschau am Pfad (`src/store.js`). Der Service Worker von `main` lässt `…/preview/` durch.
- Workflows: `.github/workflows/vorschau.yml` (Tests auf jedem Branch außer `main`) stößt `pages.yml` an, das `main` unter `/` und den Branch unter `/preview/` veröffentlicht. Beide wirken erst, wenn sie auf `main` liegen.

## Prüfen vor dem Push

- `npm test` grün (105 Tests: 68 bis v7 + 12 v8a + 15 v8b + 10 v8c).
- `npm run abnahme` grün – misst `docs/abnahme.json` im Headless-Chrome (eigener Server, beide Geräte, Kontraste in allen Themen und Zuständen), schreibt `docs/abnahme-ergebnis.md` und Screenshots nach `docs/screenshots/`. Bekannt offene Punkte stehen in `BEKANNT_OFFEN` (`tools/abnahme.js`) mit Verweis auf `docs/feedback.md` und lassen den Lauf grün; neue Funde nicht. Optionen: `--url <adresse>`, `--ohne-tests`, `--ohne-bilder`.
- Bei Änderungen an Abläufen zusätzlich `node tools/ux/aufgaben-v8c.js` (alle Aufgaben des Testleitfadens, v6-Daten laden unverändert).
- Hooks: `git config core.hooksPath .githooks` (einmal je Klon). `pre-commit` führt `npm test` aus, `pre-push` `npm run abnahme --ohne-bilder`. Überspringen nur bewusst mit `--no-verify`.

## Arbeitsweise

- Kleine, thematische Commits. **Vor dem Push auf `main` Lars fragen** (danach aktualisiert sich die App auf seinem iPhone). Branches dürfen gepusht werden (Vorschau).
- Zum Schluss je Version eine Zusammenfassung `docs/V<version>-ZUSAMMENFASSUNG.md`: was umgesetzt ist, Testanzahl, Abnahme-Ergebnis, Vorschau-Adresse, Abweichungen, offene Punkte. In `docs/auftraege/README.md` den Stand des Auftrags auf „erledigt“ setzen. Checkliste nicht selbst ausfüllen.
- Keine Gesundheitsversprechen in App-Texten, keine fremden Markennamen.
- Node liegt auf Lars' Mac unter `~/.local/node-v26.13.0-darwin-arm64/bin` und ist in manchen Shells (z. B. der Desktop-App) nicht im `PATH`; die Hooks finden ihn selbst (`.githooks/node-pfad.sh`).
