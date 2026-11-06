# Übergabe Koordinations-Chat (Stand 02.11.2026)

Für einen neuen Koordinations-Chat im Projekt „Life's a Game“. Zuerst `claude/projektstatus.md` und `claude/habit-tracker-entwicklungsleitfaden.md` lesen (Projektanweisung), danach diese Notiz.

## 1. Rolle

Der Koordinations-Chat behält den Überblick über alle Chats und Dokumente. Er bewertet nächste Schritte, prüft jede Version gegen den Leitfaden (Abgleich) und pflegt als einziger Leitfaden, Projektstatus, Checkliste, Konzepte und Auftragsdateien. Programmiert wird in Claude Code auf Lars' MacBook. Andere Chats nennen Abweichungen nur am Ende ihrer Antwort.

**Lars:**
- arbeitet auf Deutsch
- gibt kurze Rückmeldungen wie „fertig“, „Ja“ oder „V8.1 ist gepusht“
- schätzt Empfehlungen mit Begründung
- Überschreiben von Dokumenten ist erlaubt, solange alle wichtigen Rechercheergebnisse erhalten bleiben

## 2. Wo was liegt

| Was | Wo |
|---|---|
| Repo | `~/Desktop/lifes-a-game` (bis 01.11. `lifes-a-game-v4`), GitHub `lazo-dot/lifes-a-game` (öffentlich), App auf GitHub Pages `https://lazo-dot.github.io/lifes-a-game/` |
| Docs im Projekt (Original) | `claude/`: projektstatus, Leitfaden (v1.10), abgleich-checkliste (kurz; Verlauf in `claude/archiv/`), selbsttest-plan, namensfindung, prompt-spieleentwickler (Rollen-Prompt + Forschung zu Spielgefühl/Neuheit/Gemütlichkeit), pixel-styleguide-stil-b, ux-verschlankung-v8c, ux-heuristische-evaluation-v6, ux-testleitfaden-v6, simulation-30/72-tage (abgeschlossen), marketingkonzept, marktanalyse. **Projekt = Quelle, Repo-`docs/` = Kopien (Entscheidung 15)** |
| Docs im Repo (Kopien plus Repo-eigene) | `docs/`: Kopien der Projekt-Docs; Claude Code schreibt `V*-ZUSAMMENFASSUNG.md` und `ABWEICHUNGEN.md`; dazu `farbthemen.json` (7 Themen, Akzente, Kontraste), `text-inventar-v8c.md`, Screenshots |
| Neuer Ablauf (ab 02.11.) | `docs/auftraege/` (README + Auftragsdateien), `docs/abnahme.json` (Grenzwerte), `docs/feedback.md` (Lars' Sammelstelle) |
| Grafik-Platzhalter | `art/platzhalter/` mit Python-Generatoren: `pix.py` (Zeichenkern), `gebaeude.py`, `pflanzen.py`, `natur.py`, `deko.py`, `figuren.py`, `hof.py`, Vorschau-Skripte. Palette: `art/palette-stil-b.*` |
| Werkzeuge des Koordinations-Chats | `docs/werkzeuge/`: `farbthemen-kontrast.py` (WCAG-Prüfung), `textmenge-messen.js` (Wörter, Höhe, Bedienelemente je Tab), `entwurf-heute-v8c.html` (Vorlage für Entwürfe) |
| Simulation, UX-Werkzeuge | `tools/sim/` (Personas, 30/72 Tage), `tools/ux/testhof.js` (Test-Hof passend zum heutigen Datum) |

## 3. Technische Arbeitsweise (was funktioniert)

- **Abnahme selbst laufen lassen (ab 8.2.1):** Im Container Chromium ohne Sandbox über ein Wrapper-Skript (`exec /opt/pw-browsers/chromium-*/chrome-linux64/chrome --no-sandbox --disable-dev-shm-usage "$@"`) und `CHROME=<wrapper> npm run abnahme -- --ohne-bilder` (ca. 4 min). Ohne `--no-sandbox` meldet das Skript „Chrome antwortet nicht“.
- **Repo lesen:** `git clone https://github.com/lazo-dot/lifes-a-game.git` geht im Cloud-Container. `lazo-dot.github.io` ist dort nicht erreichbar, die Live-Seite kann man also nicht prüfen. Stattdessen lokal bauen (`npm run build`), `dist/` mit `python3 -m http.server` ausliefern und mit Playwright messen. Test-Hof einspielen mit `LAGStore.save(JSON)` und Neuladen.
- **Ins Repo schreiben:** über die Brücke zu Lars' Rechner mit `device_commit_files`. Die Datei muss vorher unter `/mnt/user-data/outputs/…` liegen. `device_bash` (Shell auf dem Mac) war zuletzt nicht nutzbar, weil die Ordner nicht eingehängt wurden. Löschen und git sind daher nicht möglich, Claude Code committet.
- **Nur schreiben, wenn Claude Code nicht gerade arbeitet**, sonst landen halbe Stände in seinen Commits.
- **Projekt-Docs:** lokal bearbeiten und mit `project_write` und `local_path` hochladen. Danach dieselbe Datei in `docs/` im Repo ablegen.

## 4. Stand

- **Online:** 8.2.1 (v8c „Ruhiger Bildschirm“ plus Arbeitsablauf: `npm run abnahme`, Vorschau `/preview/`, Hooks, schlanke CLAUDE.md), 105 Tests, Abnahme grün mit 2 bekannt offenen Punkten. Wichtige Stände davor:
  - v6: Nachtragen, erreichbare Graduierung
  - v7: Bedienbarkeit
  - v8a: Sprite-Sheets in Stil B, Gebäude je Fähigkeit
  - v8b: 42 Truhengegenstände, Sammelalbum, 7 Farbthemen
- **Grafik:** Stil B ist entschieden (Sea-of-Stars-nah). Alle Grafiken sind KI-Platzhalter, die vor dem Launch ersetzt werden müssen (Marketingkonzept, Fair-Play).
- **Selbsttest:** 03.–23.11. nach `claude/selbsttest-plan.md` (Kriterien vorab, iOS-Ersatz-Erinnerungen). **main bleibt bis 23.11. auf 8.2.1 eingefroren**, v9 nur als Vorschau. **Bis v10 keine Regeländerungen** (Stärke, XP, Fundchance 12 % / 20 % selten, Regentage, Nachtragen, Graduierung).
- **Usability-Test:** Kurztest mit 1–2 Personen **jetzt auf 8.2.1** (Testleitfaden Abschnitt 0, an Info-Blatt und Einstellungen angepasst), voller Test mit 5 Personen auf v10.
- **Kritische Durchsicht 02.11.:** Entscheidungen 10–15 im Projektstatus (Freeze, Selbsttest-Methode, Kurztest, Hof-Tage nur Gewohnheiten, Grafik-/PWA-Grenze, Dokument-Hoheit), Leitfaden v1.10.

## 5. Nächste Schritte

1. ~~Arbeitsablauf 8.2.1~~ ✅ erledigt und abgeglichen (02.11.). Vorschau online beim ersten v9-Push prüfen.
2. **Selbsttest 03.–23.11.** nach `claude/selbsttest-plan.md`; **main bleibt eingefroren** (Entscheidung 10). Am 23.11. Sicherung + Beta-Zahlen + Notizen auswerten (K1–K7), Ergebnis in die Checkliste.
3. **Kurztest** mit 1–2 Personen auf 8.2.1 (Testleitfaden Abschnitt 0), Ergebnisse vor dem v9-Auftrag einarbeiten.
4. **Namensfindung** nach `claude/namensfindung.md`: Lars wählt Favoriten bis 09.11., Prüfung (Marken, Stores, Domain, Handles) hier bis 16.11., Entscheidung bis 30.11.
5. **v9 – Welt und Freischaltungen**, nur auf Branch + Vorschau bis 23.11. Erst Entwurf zeigen, dann `docs/auftraege/v9.md`. Reihenfolge (Entscheidung 14):
   - Aus `docs/feedback.md`: Anker zuerst und umbrechbar; Zahnrad im Pergament-Thema; Rand der Eingabefelder ≥ 3:1; Hover-Ring des Abhak-Kastens ≥ 3:1. Danach `BEKANNT_OFFEN` leeren.
   - Hof-Tage **nur über Gewohnheiten** (voll, Mini, nachgetragen; nicht To-dos, Logbuch, Regentag, Extra-Runde), Freischaltungen etwa alle 5–7 Hof-Tage bis Woche 10, in Woche 3–8 dichter (Randbereiche, Tiere, Hof-Ereignisse).
   - Abhak-Rückmeldung am eigenen Beet, Hof als Wochenanzeige („2-Sekunden-Prüfung“), Effekte ruhig/normal (`claude/prompt-spieleentwickler.md`, B6).
   - Grafik nur, soweit Freischaltungen und Animationen es brauchen; keine großen neuen Platzhalter-Pakete vor der Grafiker-Entscheidung.
   - `abnahme.json`: Abschnitt `v9`; Vorschlag `kontrast_ausnahmen` prüfen.
   - Mit dem Auftrag ins Repo: Leitfaden v1.10, Checkliste (kurz) + Archiv, Übergabe, Testleitfaden, Selbsttest-Plan, Regel „main eingefroren bis 23.11.“ in `docs/auftraege/README.md`; Rollen-Prompt `docs/rolle-spieleentwickler.md` (Quelle: `claude/prompt-spieleentwickler.md` Teil A) mit Verweis in `CLAUDE.md`.
6. **v10:** Regel- und Ablaufthemen nach dem Selbsttest: Vorlagen (U18), Glossar (U7), Regentag-Regel (U8), Etappen-Weg, Wochenernte, Tagesrhythmus. Danach Usability-Test mit 5 Personen, dann PWA einfrieren.
7. **Flutter:** zuerst Logik + Tests + lokale Erinnerungen mit Ausschleichen, dann Szene und Hof-Widget.

## 6. Offene Entscheidungen bei Lars

- **Wer die echten Grafiken zeichnet** (selbst in Aseprite, Pixel-Artist oder Mischung), Budget und Zeitplan – nötig vor dem Grafikteil von v9 (Style-Guide = Briefing, ca. 190–250 h)
- **App-Name** bis 30.11. (Fahrplan in `claude/namensfindung.md`)
- Details der Freischaltungen (Bereiche, Reihenfolge) – Entwurf in v9 vorlegen

## 7. Gelernt

- **Jede Version selbst nachmessen**, nicht nur die Zusammenfassung lesen. Gefunden wurden so: nicht-ganzzahlige Skalierung, leere Seitenstreifen, Großansicht nur 2×, leerer Haken mit zu wenig Kontrast, abgeschnittener Anker. Dafür gibt es jetzt `abnahme.json`; neue Funde dort als Grenzwert ergänzen.
- **Sichtbare Änderungen erst als Entwurf zeigen** (Bild aus HTML und Playwright). Das spart Nachbesserungs-Runden.
- **Farben immer mit Kontrastprüfung liefern**, auch für den Ruhezustand von Bedienelementen.
- **Claude Code überschreibt gelegentlich Docs** mit älteren Fassungen. Nach jedem Lauf die Versionszeile von Leitfaden und Checkliste im Repo prüfen.
- **Artifacts brauchen ein Claude-Konto** zum Öffnen (auch mit Link). Für Menschen ohne Konto: eigene Seite auf GitHub Pages in einem separaten Repo (Beispiel `lifes-a-game-test`), nicht im App-Repo (sonst Update-Hinweis auf Lars' iPhone).
- **Claude Code darf keine öffentlichen Repos anlegen oder Pages einschalten** (Rechteprüfung). Solche Schritte als Befehle für Lars in den Auftrag schreiben; `gh` liegt auf dem Mac unter `~/.local/bin/gh` (angemeldet).
- **Eigenständige HTML-Seiten brauchen `[hidden]{display:none!important}`**, sobald Elemente mit `display:flex/grid` per `hidden` umgeschaltet werden (Artifacts bringen die Regel mit, GitHub Pages nicht).
- **Ins Repo schreiben geht jetzt über die Brücke:** Ordner `~/Desktop/lifes-a-game` ist freigegeben, `device_commit_files` mit `expectedMtimeMs` (vorher `device_list_dir`), nur wenn Claude Code nicht arbeitet. Nicht committen – das macht Claude Code.
- **Ein Claude-Code-Chat pro Auftrag.** Der erste Chat lief über v5–v8c, das führte zu Kontextverlust.
