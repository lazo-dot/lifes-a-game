# Aufträge für Claude Code

Jeder Entwicklungsschritt hat hier eine Auftragsdatei, angelegt vom Koordinations-Chat (claude.ai-Projekt „Life's a Game“).

**Ablauf**
1. Lars sagt Claude Code: „Setz `docs/auftraege/<datei>.md` um.“
2. Claude Code liest die Datei, `CLAUDE.md` und die dort genannten Grundlagen und arbeitet auf einem Branch.
3. Vor jedem Push: `npm test` und `npm run abnahme` grün (Grenzwerte in `docs/abnahme.json`, eigene Abschnitte je Version möglich).
4. Branch pushen → Vorschau unter `https://lazo-dot.github.io/lifes-a-game/preview/` → Lars prüft auf dem iPhone.
5. Zusammenfassung nach `docs/V<version>-ZUSAMMENFASSUNG.md`, Abweichungen nach `docs/ABWEICHUNGEN.md`. Lars meldet im Koordinations-Chat nur „fertig“.
6. Merge nach main erst nach Freigabe von Lars.

**Regeln**
- Öffentliche Repos anlegen und GitHub Pages einschalten darf Claude Code nicht selbst (Rechteprüfung). Solche Schritte stehen im Auftrag als Befehle für Lars (`gh` liegt unter `~/.local/bin/gh`, angemeldet).
- **main ist bis 23.11.2026 eingefroren** (Selbsttest): nur Branches und Vorschau, kein Merge, kein Push auf main außer Fehlerbehebungen, die Daten oder Bedienung gefährden.
- Auftragsdateien, Leitfaden, Checkliste, Konzepte und `abnahme.json` ändert nur der Koordinations-Chat. Claude Code committet sie so, wie sie im Arbeitsverzeichnis liegen.
- Feedback von Lars sammelt sich in `docs/feedback.md` und wird beim nächsten Abgleich einer Version zugeordnet.

| Datei | Inhalt | Stand |
|---|---|---|
| `arbeitsablauf.md` | Einrichtung: Abnahme-Skript, Vorschau-Adresse, Test-Hook, schlanke CLAUDE.md | erledigt (8.2.1, Branch `ablauf`) |
| `testrunde.md` | Fragebogen „Hof-Testrunde“ als eigenes Repo `lifes-a-game-test` auf GitHub Pages (App-Repo bleibt unberührt) | erledigt (03.11.2026, https://lazo-dot.github.io/lifes-a-game-test/) |
| `v9.md` | v9 „Hof-Tage und lebendige Welt“: Feedback-Punkte, Hof-Tage + 11 Entdeckungen, Abhak-Rückmeldung, lebendiger Hof (nur Branch `v9`, Vorschau) | erledigt (9.0.0, Branch `v9`, Vorschau; Merge nach Lars' Freigabe nach dem 23.11.) |
