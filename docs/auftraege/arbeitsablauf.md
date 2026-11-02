# Auftrag: Arbeitsablauf einrichten (8.2.1)

Ziel: weniger Handarbeit zwischen Koordinations-Chat, Lars und Claude Code; Fehler werden vor dem Push gefunden statt danach. **Keine Änderung an der App selbst** (Spielregeln, Oberfläche, Daten bleiben gleich).

Lies: `docs/auftraege/README.md`, `docs/abnahme.json`, `CLAUDE.md`. Committe die Dateien vom Koordinations-Chat zuerst so, wie sie liegen (`docs/auftraege/`, `docs/abnahme.json`, `docs/feedback.md`, Leitfaden v1.9, Checkliste).

## 1. Abnahme-Skript `npm run abnahme`
- `tools/abnahme.js` misst alle Werte aus `docs/abnahme.json` → Abschnitt `immer` plus den Abschnitt der aktuellen Version (Version aus `package.json`, z. B. `v9`), auf allen `geraete` und, wo sinnvoll, in allen `themen`.
- Baut auf den vorhandenen Mess-Skripten auf (`tools/ux/screenshots-v8*.js`, Headless-Chrome über DevTools-Protokoll, Test-Hof, 12 Uhr, Erklärungen als gesehen markiert). Zusammenführen statt kopieren; alte Skripte dürfen dann wegfallen.
- Ausgabe: Tabelle Grenzwert / gemessen / ok je Prüfung, Exit-Code ≠ 0 bei einer Verletzung. Zusätzlich `docs/abnahme-ergebnis.md` (wird bei jedem Lauf überschrieben).
- Prüfungen, die heute schon nicht erfüllt sind (z. B. `kontextzeile_ohne_abschneiden` für den Anker), stehen als **bekannt offen** in der Ausgabe und lassen den Lauf noch grün – mit Verweis auf `docs/feedback.md`. Alles andere muss grün sein.
- Screenshots je Lauf nach `docs/screenshots/` (Heute, alle Tabs, ein Info-Blatt, Einstellungen; Standard und Pergament), ersetzen die versionsbezogenen Ordner künftig.

## 2. Vorschau-Adresse für Branches
- GitHub Action: Bei Push auf einen anderen Branch als `main` wird `npm run build` ausgeführt und `dist/` unter `/preview/` auf GitHub Pages veröffentlicht; `main` bleibt unter `/`.
- Die Vorschau speichert unter eigenem Namen (IndexedDB und localStorage mit Präfix `preview-`), damit sie die Daten von main im selben Safari nicht berührt. Service Worker mit eigenem Scope `/preview/`.
- Sichtbarer Hinweis in der Vorschau: kleines Band „Vorschau · <Branch> · <Version>“.
- In der Zusammenfassung die Vorschau-Adresse nennen.

## 3. Test-Hook
- `git config core.hooksPath .githooks`, Hook `pre-commit` führt `npm test` aus (schnell, ohne Browser); `pre-push` zusätzlich `npm run abnahme`. Abschalten nur bewusst mit `--no-verify`.
- In `README.md` kurz beschreiben, wie man die Hooks nach dem Klonen aktiviert.

## 4. Schlanke `CLAUDE.md`
- Ziel ≤ 120 Zeilen: Projekt in 3 Sätzen, Quellen der Wahrheit, Prinzipien (Kurzfassung), Architekturregeln, Ablauf (Verweis auf `docs/auftraege/README.md`), Prüfen vor dem Push (`npm test`, `npm run abnahme`), Arbeitsweise.
- Erledigte Arbeitslisten v5–v8c nach `docs/archiv/arbeitslisten.md` verschieben, nichts löschen.
- Aktuelle Arbeitsliste steht künftig nur in der jeweiligen Auftragsdatei.

## Prüfen
- `npm test` grün, `npm run abnahme` grün (bis auf „bekannt offen“), Vorschau-Adresse erreichbar und mit eigenem Speicher (Daten von main unverändert), Hooks greifen.
- Version 8.2.1, kurze Zusammenfassung `docs/V821-ZUSAMMENFASSUNG.md` (was eingerichtet ist, Abnahme-Ergebnis, Vorschau-Adresse). In `docs/auftraege/README.md` den Stand von `arbeitsablauf.md` auf „erledigt“ setzen. Vor dem Push auf main fragen.
