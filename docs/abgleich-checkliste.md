# Life's a Game – Abgleich-Checkliste Prototyp ↔ Leitfaden

Stand: 02.11.2026 (8.2.1 abgeglichen) · Referenz: [Entwicklungsleitfaden v1.10](habit-tracker-entwicklungsleitfaden.md) · Verlauf v2–8.2.1 mit allen Prüftabellen: [Archiv](archiv/abgleich-checkliste-v2-bis-8-2-1.md)

**Aufgabenteilung:** Messbares (erster Haken, Tap-Flächen, Kontraste, Textmenge, Szene, Migration, Konsolenfehler) prüft `npm run abnahme` gegen `docs/abnahme.json`. Diese Checkliste hält fest, was sich nicht messen lässt, und je Version das Ergebnis. Sie misst **nicht**, ob Menschen die App verstehen oder motiviert bleiben – dafür gibt es Kurztest, Usability-Test und Selbsttest.

---

## Prüfschema je Version (Koordinations-Chat)

| # | Prüfung | Wie |
|---|---|---|
| P1 | Tests und Abnahme selbst laufen lassen, nicht nur den Bericht lesen | `npm test`, `CHROME=… npm run abnahme` (Übergabe-Notiz 3) |
| P2 | Spielregeln unverändert (bis v10) bzw. genau wie im Auftrag geändert | Diff von `src/logic.js` und Tests |
| P3 | Speicher und Bestand: Schema 4, Migration alter Exporte, Daten von main unberührt | Abnahme `migration_exporte`, ggf. Vorschau-Trennung |
| P4 | Ausschlüsse eingehalten: keine Countdowns, Ranglisten, Verlust-/Schuldmechaniken, kein Confirmshaming, keine Währung oder bezahlter Schutz, Spielaktionen nur nach echter Erledigung | Durchsicht neuer Texte und Abläufe |
| P5 | Abweichungen (`docs/ABWEICHUNGEN.md`) bewertet: übernehmen, ablehnen oder später | hier unter „Ergebnis“ |
| P6 | Sichtbare Änderungen angesehen (Screenshots Standard + Pergament, 390 pt) | `docs/screenshots/` |
| P7 | Neue Funde als Grenzwert in `abnahme.json` oder als Punkt in `docs/feedback.md` | – |
| P8 | Versionszeilen von Leitfaden und Checkliste im Repo prüfen (Claude Code überschreibt gelegentlich) | Kopfzeilen |

---

## Ergebnis 8.2.1 – Arbeitsablauf (02.11.2026, auf main)

Keine Änderung an Regeln, Oberfläche oder Daten; in der App nur Speicher-Präfix, Band und Service Worker für die Vorschau.

| Punkt | 8.2.1 | Notiz |
|---|---|---|
| `npm run abnahme` (17 Prüfungen, 2 Geräte, Kontraste 7 Themen × 4 Zustände × 7 Ansichten) | ✅ | im Koordinations-Chat selbst gelaufen: grün, 2 bekannt offen, Werte identisch mit `docs/abnahme-ergebnis.md` |
| Vorschau `/preview/` mit eigenem Speicher | ✅ lokal / ⬜ online | lokal nachgestellt: DB `preview-lifes-a-game`, eigener Service-Worker-Scope, Band, Daten von main unverändert. Online erst ab dem ersten Branch-Push nach dem Merge (beim v9-Push prüfen) |
| Hooks pre-commit / pre-push | ✅ | `git config core.hooksPath .githooks` je Klon |
| Schlanke `CLAUDE.md`, Archiv | ✅ | 54 Zeilen, `docs/archiv/arbeitslisten.md` |
| Speicher von main unverändert | ✅ | `lifes-a-game`, `lag4:`; Cache-Präfix `lag-` wie bisher |

Tests 105/105 grün (nachgeprüft). Abweichungen 1–9 zur Kenntnis, keine Leitfaden-Änderung nötig; Vorschlag `kontrast_ausnahmen` (Abweichung 3) beim v9-Abschnitt von `abnahme.json` prüfen.

**Bekannt offen → v9:** Anker abgeschnitten (390 pt: 3 von 3) · Zahnrad Pergament 1,05 : 1 · **neu:** Rand der Eingabefelder 1,6–1,9 : 1 · Hover-Ring des Abhak-Kastens 2,25 : 1 (nur Maus/Trackpad).

---

## Ergebnis Selbsttest (nach [Selbsttest-Plan](selbsttest-plan.md), 23.11.2026)

- **Kriterien K1–K7:** …
- **Leitfaden anpassen (v10):** …
