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
| Docs im Projekt (Original) | `claude/`: projektstatus, Leitfaden (v1.9), abgleich-checkliste, pixel-styleguide-stil-b, ux-verschlankung-v8c, ux-heuristische-evaluation-v6, ux-testleitfaden-v6, simulation-30/72-tage, marketingkonzept, marktanalyse |
| Docs im Repo (Kopien plus Repo-eigene) | `docs/`: Kopien der Projekt-Docs; Claude Code schreibt `V*-ZUSAMMENFASSUNG.md` und `ABWEICHUNGEN.md`; dazu `farbthemen.json` (7 Themen, Akzente, Kontraste), `text-inventar-v8c.md`, Screenshots |
| Neuer Ablauf (ab 02.11.) | `docs/auftraege/` (README + Auftragsdateien), `docs/abnahme.json` (Grenzwerte), `docs/feedback.md` (Lars' Sammelstelle) |
| Grafik-Platzhalter | `art/platzhalter/` mit Python-Generatoren: `pix.py` (Zeichenkern), `gebaeude.py`, `pflanzen.py`, `natur.py`, `deko.py`, `figuren.py`, `hof.py`, Vorschau-Skripte. Palette: `art/palette-stil-b.*` |
| Werkzeuge des Koordinations-Chats | `docs/werkzeuge/`: `farbthemen-kontrast.py` (WCAG-Prüfung), `textmenge-messen.js` (Wörter, Höhe, Bedienelemente je Tab), `entwurf-heute-v8c.html` (Vorlage für Entwürfe) |
| Simulation, UX-Werkzeuge | `tools/sim/` (Personas, 30/72 Tage), `tools/ux/testhof.js` (Test-Hof passend zum heutigen Datum) |

## 3. Technische Arbeitsweise (was funktioniert)

- **Repo lesen:** `git clone https://github.com/lazo-dot/lifes-a-game.git` geht im Cloud-Container. `lazo-dot.github.io` ist dort nicht erreichbar, die Live-Seite kann man also nicht prüfen. Stattdessen lokal bauen (`npm run build`), `dist/` mit `python3 -m http.server` ausliefern und mit Playwright messen. Test-Hof einspielen mit `LAGStore.save(JSON)` und Neuladen.
- **Ins Repo schreiben:** über die Brücke zu Lars' Rechner mit `device_commit_files`. Die Datei muss vorher unter `/mnt/user-data/outputs/…` liegen. `device_bash` (Shell auf dem Mac) war zuletzt nicht nutzbar, weil die Ordner nicht eingehängt wurden. Löschen und git sind daher nicht möglich, Claude Code committet.
- **Nur schreiben, wenn Claude Code nicht gerade arbeitet**, sonst landen halbe Stände in seinen Commits.
- **Projekt-Docs:** lokal bearbeiten und mit `project_write` und `local_path` hochladen. Danach dieselbe Datei in `docs/` im Repo ablegen.

## 4. Stand

- **Online:** 8.2.0 (v8c „Ruhiger Bildschirm“), 105 Tests. Wichtige Stände davor:
  - v6: Nachtragen, erreichbare Graduierung
  - v7: Bedienbarkeit
  - v8a: Sprite-Sheets in Stil B, Gebäude je Fähigkeit
  - v8b: 42 Truhengegenstände, Sammelalbum, 7 Farbthemen
- **Grafik:** Stil B ist entschieden (Sea-of-Stars-nah). Alle Grafiken sind KI-Platzhalter, die vor dem Launch ersetzt werden müssen (Marketingkonzept, Fair-Play).
- **Selbsttest:** läuft seit 02.11. auf main parallel zur Entwicklung. Deshalb gibt es **bis v10 keine Regeländerungen** (Stärke, XP, Fundchance 12 % / 20 % selten, Regentage, Nachtragen, Graduierung).
- **Usability-Test:** Kurz-Vortest mit 1–2 Personen auf v9, der volle Test mit 5 Personen auf v10. Der Testleitfaden muss vorher an die neuen Wege angepasst werden (Info-Blatt, Einstellungen).

## 5. Nächste Schritte

1. **Arbeitsablauf 8.2.1:** Lars startet einen neuen Claude-Code-Chat und schreibt „Setz docs/auftraege/arbeitsablauf.md um.“ Claude Code richtet ein: Abnahme-Skript, Vorschau-Adresse `/preview/`, Hooks, schlanke CLAUDE.md. Danach abgleichen und die Vorschau-Adresse prüfen.
2. **v9 – Welt und Freischaltungen** (Auftragsdatei `docs/auftraege/v9.md` anlegen, vorher Entwurf zeigen):
   - Freischaltungen nach Entscheidung 7 (Richtung entschieden): „Hof-Tage“ (Tage mit mindestens einer Erledigung, aufsummiert, gehen nie verloren); etwa alle 5–7 Hof-Tage bis Woche 10 ein neuer Randbereich (Obstwiese, Bienenwiese, Steg, Gemüsegarten), umherlaufende Tiere, Hof-Ereignisse (Regenbogen, Erntefest). Farbthemen und Bedienung bleiben frei. Für Freischaltungen braucht es neue Platzhalter-Grafiken.
   - Paket 4–6 des Style-Guides: Landschaft, Animationen (Mühlenflügel, Rauch, Wasser), Licht und Wetter.
   - Aus `docs/feedback.md`: Anker zuerst und umbrechbar statt abgeschnitten; Zahnrad im Pergament-Thema.
3. **v10:** Regel- und Ablaufthemen nach dem Selbsttest: Vorlagen (U18), Glossar (U7), Regentag-Regel (U8), Etappen-Weg, Wochenernte, Tagesrhythmus. Danach Usability-Test.
4. Später: Flutter + Flame (Roadmap Schritt 7).

## 6. Offene Entscheidungen bei Lars

- Wer die echten Grafiken zeichnet (selbst in Aseprite, Pixel-Artist oder Mischung), Budget und Zeitplan (Style-Guide = Briefing, ca. 190–250 h)
- App-Name für den Launch („Life's a Game“ bleibt Arbeitstitel, Marketingkonzept 7)
- Details der Freischaltungen (Bereiche, Reihenfolge) – Entwurf in v9 vorlegen

## 7. Gelernt

- **Jede Version selbst nachmessen**, nicht nur die Zusammenfassung lesen. Gefunden wurden so: nicht-ganzzahlige Skalierung, leere Seitenstreifen, Großansicht nur 2×, leerer Haken mit zu wenig Kontrast, abgeschnittener Anker. Dafür gibt es jetzt `abnahme.json`; neue Funde dort als Grenzwert ergänzen.
- **Sichtbare Änderungen erst als Entwurf zeigen** (Bild aus HTML und Playwright). Das spart Nachbesserungs-Runden.
- **Farben immer mit Kontrastprüfung liefern**, auch für den Ruhezustand von Bedienelementen.
- **Claude Code überschreibt gelegentlich Docs** mit älteren Fassungen. Nach jedem Lauf die Versionszeile von Leitfaden und Checkliste im Repo prüfen.
- **Ein Claude-Code-Chat pro Auftrag.** Der erste Chat lief über v5–v8c, das führte zu Kontextverlust.
