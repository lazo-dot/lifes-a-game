# Auftrag: Fragebogen „Hof-Testrunde“ veröffentlichen (eigenes Repo)

Ziel: Testpersonen **ohne Claude-Konto** können den Fragebogen am Handy öffnen. Er liegt fertig unter `docs/auftraege/testrunde/site/` (eine HTML-Datei, Schrift Pixelify Sans lokal, keine externen Anfragen, speichert nichts auf einem Server; Antworten schickt die Person per „Antworten senden/kopieren“).

**Wichtig:** main des App-Repos ist bis 23.11. eingefroren (Selbsttest). Im App-Repo **nichts committen oder pushen**; die Dateien unter `docs/auftraege/testrunde/` und die geänderte `docs/auftraege/README.md` kommen später mit dem v9-Branch ins Repo.

## Schritte
1. Neuen Ordner `~/Desktop/lifes-a-game-test` anlegen, `git init`, Inhalt von `docs/auftraege/testrunde/site/` (inkl. `fonts/`) dorthin kopieren – unverändert.
2. `README.md` (2–3 Sätze: Fragebogen zum Usability-Test von Life's a Game, keine Datenspeicherung) und `.nojekyll` anlegen.
3. Öffentliches GitHub-Repo `lazo-dot/lifes-a-game-test` anlegen und pushen (`gh repo create lazo-dot/lifes-a-game-test --public --source . --push`).
4. GitHub Pages einschalten: Quelle Branch `main`, Ordner `/` (`gh api -X POST repos/lazo-dot/lifes-a-game-test/pages -f "source[branch]=main" -f "source[path]=/"`).
5. Warten, bis `https://lazo-dot.github.io/lifes-a-game-test/` erreichbar ist (1–3 Minuten), dann im Browser prüfen: Seite lädt, Pixel-Schrift in den Überschriften, keine Konsolenfehler, einmal komplett durchklicken bis „Antworten kopieren“.
6. Lars die Adresse nennen. Keine Zusammenfassungsdatei nötig.

## Nicht tun
- Den Fragebogen inhaltlich nicht ändern (Fragen kommen aus dem Testleitfaden, Koordinations-Chat).
- Keine Analyse-, Formular- oder Font-Dienste einbinden.
