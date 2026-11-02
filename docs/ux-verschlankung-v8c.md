# Life's a Game – Konzept v8c „Ruhiger Bildschirm“

Stand: 02.11.2026 · Anlass: erstes Feedback von Lars zu v8.1 · Grundlage: Messung im Koordinations-Chat (390 × 844 pt, Test-Hof), [UX-Evaluation](ux-heuristische-evaluation-v6.md), Recherche (Quellen unten) · Umsetzung: Claude Code, Version 8.2.0

## 1. Feedback

1. Zu viele Informationen, zu unübersichtlich, vor allem auf dem Handy.
2. Die Schrift lässt sich farblich nicht abheben.
3. Allgemein weniger Text, ohne Informationen zu verlieren, zum Beispiel über Textboxen beim Antippen.

## 2. Messung v8.1 (iPhone-Breite, Test-Hof, ohne Tab-Leiste)

| Tab | Wörter sichtbar | davon im ersten Bildschirm | Seitenhöhe | Bedienelemente | Erklärtexte (≥ 8 Wörter) |
|---|---|---|---|---|---|
| Heute | 219 | 102 | 2.248 pt (2,7 Bildschirme) | 27 | 6 |
| Gewohnheiten | 347 | 76 | 2.931 pt (3,5) | 42 | 11 |
| Logbuch | 120 | 74 | 1.414 pt (1,7) | 15 | 4 |
| Fortschritt | 395 | 78 | 4.108 pt (4,9) | 37 | 11 |
| Truhe | 370 | 74 | 3.109 pt (3,7) | 53 | 12 |
| **Summe** | **1.451** | | | **174** | **44** |

**Befunde:**
- **Jede Gewohnheitskarte zeigt 5–6 Zeilen:** Anker mit Uhrzeit, Titel, Pflanze mit Stärke, Fähigkeit mit XP, Monatszähler, Serie, Regentage und Mini-Text. Auf „Heute“ passen deshalb nur zwei Karten in den ersten Bildschirm.
- **Erklärtexte stehen dauerhaft im Bildschirm**, zum Beispiel „Hake ab …“, die Erklärung zum Nachtragen mit 34 Wörtern, die Fundchancen mit rund 120 Wörtern und die Darstellungs-Erklärung mit rund 70 Wörtern. Sie werden einmal gebraucht und danach jeden Tag überlesen.
- **Das To-do-Formular ist immer offen**, mit 4 Feldern auf „Heute“.
- **Bis zu drei Hinweise konkurrieren**: Meilenstein, Check-in und Wilma.
- **Wiederholungen:** Der Fußzeilen-Hinweis zur Speicherung steht in allen Tabs. „Tag 21 von etwa 66“ steht bei jeder Gewohnheit.
- **Kaum Schrift-Hierarchie:** Fast alles steht in derselben Pixel-Schrift und ähnlicher Größe. Unterschieden wird fast nur über die Farbe, und die ist pro Thema fest.

## 3. Was die Forschung sagt

- **Progressive Disclosure:** Auf der ersten Ebene steht nur, was die meisten oft brauchen. Seltenes kommt auf eine zweite Ebene. Mehr als zwei Ebenen sind meist schlecht bedienbar. Der Zugang zur zweiten Ebene muss sichtbar und klar beschriftet sein (Nielsen Norman Group).
- **Mobil kürzer schreiben:** Einfache Texte versteht man auf dem Handy etwa so gut wie am Computer. Kürze und Priorisierung bleiben trotzdem die Grundregel, weil die Aufmerksamkeit unterwegs oft unterbrochen wird. Bei schwierigen Inhalten lesen Menschen mobil langsamer (NN/g, 276 Teilnehmende).
- **Tooltips funktionieren auf Touch-Geräten nicht.** Zusatzinformation gehört hinter ein sichtbares Bedienelement und erscheint als Popover bzw. Bottom Sheet (Muster aus Design-Systemen wie Material, SAP Fiori, PatternFly). Das deckt sich mit U17 aus der eigenen Evaluation.
- **Text in Ebenen:** Apple stuft Beschriftungen in primär, sekundär und tertiär ab und unterscheidet sie durch Größe, Gewicht und Farbe zugleich. Farbe allein darf keine Information tragen.
- **Gamification-Apps:** Habitica gilt am Markt als überladen (Marktanalyse). Vereinfachte Apps punkten beim täglichen Ablauf damit, dass Abhaken in einem Tap auf dem ersten Bildschirm geht.

## 4. Regeln für v8c

1. **Zwei Ebenen.** Ebene 1 ist das, was man täglich braucht: abhaken, Mini, Nachtragen, ein Hinweis. Ebene 2 ist ein **Info-Blatt**, das von unten aufgeht und alles Weitere enthält. Eine dritte Ebene gibt es nicht. Seltenes wie Daten, Beta-Zahlen und Darstellung kommt in einen eigenen Bildschirm **Einstellungen** (Zahnrad oben rechts).
2. **Textbudget je Karte:** höchstens 2 Textzeilen und eine Reihe kleiner Abzeichen mit Symbol und Zahl.
3. **Erklärungen hinter „?“.** Jeder Erklärtext mit mehr als einem Satz wandert in ein Info-Blatt mit höchstens 60 Wörtern und einem Thema. Der Auslöser ist ein sichtbares „?“ mit mindestens 44 pt, beschriftet für Screenreader. Beim allerersten Mal darf die Erklärung einmal offen stehen und danach eingeklappt bleiben.
4. **Nichts geht verloren.** Claude Code legt ein Text-Inventar an: jeder heutige Text mit seinem neuen Ort (Ebene 1, Info-Blatt oder Einstellungen) oder dem Grund, warum er entfällt. Entfallen darf nur, was wörtlich doppelt vorkommt.
5. **Ein Hinweis zur Zeit.** Wilma zeigt immer nur eine Nachricht, nach Vorrang: offener Nachtrag, Check-in, Meilenstein, Wetter- oder Hofspruch. Die übrigen kommen später.
6. **Formulare erst auf Wunsch.** Statt des offenen To-do-Formulars gibt es „+ To-do“. Es öffnet ein Blatt, in dem nur der Titel Pflicht ist und Aufwand, Fähigkeit und Datum unter „Mehr“ liegen.
7. **Schrift in drei Ebenen**, unterschieden durch Größe, Gewicht und Farbe zugleich:
   - **Titel:** groß, Pixel-Schrift, Akzentfarbe
   - **Inhalt:** normal, Farbe `text`
   - **Kontext:** kleiner, Farbe `text-soft`
   - Zahlen erscheinen als Abzeichen mit Symbol.
8. **Wählbare Schrift-Akzentfarbe:** Thema (Standard), Gold, Mint, Himmel, Rose, Lavendel oder Weiß. Sie gilt für Überschriften, Anker, aktive Tabs und Hervorhebungen. Alle Varianten sind in allen 7 Themen geprüft und erreichen mindestens 4,98:1, siehe `farbthemen.json` → `akzente`.

## 5. Maßnahmen je Bildschirm

| Bildschirm | Ebene 1 (sichtbar) | Wandert ins Info-Blatt bzw. in die Einstellungen |
|---|---|---|
| **Kopfzeile** | Titel, „Mo 2. Nov · Herbst · sonnig“, Zahnrad | Musik und Effekte kommen in die Einstellungen; ein Lautsprecher-Symbol im Hof bleibt als Schnellschalter |
| **Heute** | Hof, ein Wilma-Hinweis, „Heute · 0 von 3“ mit „?“, kompakte Karten (Haken, Titel, Anker mit Uhrzeit, Abzeichen für Pflanze und Stärke, Serie nur wenn an), Mini-Knopf, eine Zeile „Gestern offen: … [Eintragen]“, To-dos kompakt, „+ To-do“ | **Antippen einer Karte** öffnet das Info-Blatt: Anker, Pflanze mit Stärke und „Tag x von etwa 66“, Serie und Regentage, Fähigkeit und XP, Monatszähler, Mini-Text, dazu Bearbeiten, Kalender und Pausieren. Die Erklärung zum Abhaken steht hinter „?“, die zum Nachtragen und zu Regentagen hinter „mehr“. Der Mini-Text erscheint nach Tippen auf „Mini“ in der Bestätigung |
| **Gewohnheiten** | Liste kompakt wie auf Heute, „+ Gewohnheit“, Vorlagen | Einleitung (Anker, Beet, Erinnerungen) hinter „?“; Kennzahlen ins Info-Blatt |
| **Logbuch** | Frage des Tages, Eingabe, Wetterwahl, letzte Einträge | Einleitung hinter „?“ |
| **Fortschritt** | Level und Fähigkeiten (kompakt), Erntekalender, Monatsrückblick, Gemeistert | Erklärungen hinter „?“. Darstellung, Daten, Sicherung, Beta-Zahlen und Hinweis „Vorläufige Grafiken“ kommen in die Einstellungen |
| **Truhe** | Funde mit Aufstellen, Sammelalbum (Gruppen eingeklappt mit „x von y“, die erste offen) | „Wie funktionieren Funde?“ als Info-Blatt mit Fundchancen, Regeln und Jahreszeit; die Liste der findbaren Gegenstände entfällt, weil das Album sie zeigt |
| **Einstellungen (neu)** | Darstellung (Thema, Akzentfarbe, Schriftgröße, Lesbare Schrift, Gut unterscheidbar), Ton, Daten & Sicherung, Beta-Zahlen, Über die App | – |
| **Fußzeile** | entfällt in den Tabs | Hinweis „Speichert nur auf diesem Gerät“ in Einstellungen → Daten |

Den Vergleich zeigt `vorschau-v8c-heute.png`: Heute jetzt, Entwurf und Entwurf mit angetippter Karte.

## 6. Ziele (messbar, 390 × 844 pt, Test-Hof)

| Messgröße | v8.1 | Ziel v8c |
|---|---|---|
| Wörter auf Heute (ohne Interaktion) | 219 | ≤ 100 |
| Gewohnheitskarten im ersten Bildschirm | 2 | ≥ 3 |
| Seitenhöhe Heute | 2.248 pt | ≤ 1.400 pt |
| Seitenhöhe Fortschritt | 4.108 pt | ≤ 2.000 pt |
| Wörter in allen Tabs zusammen | 1.451 | ≤ 700 |
| Ebenen bis zu jeder Information | – | ≤ 2 (Einstellungen zählen als eigener Bildschirm) |
| Erster Haken | 478 pt | gleich oder höher |
| Tap-Flächen, Kontraste | ≥ 44 pt, AA | unverändert |

## 7. Bezug zu Plan und Prinzipien

- Spielregeln, Speicherschema `4` und Daten bleiben unverändert. Neu ist nur das optionale Feld `accent` neben `theme`. Der Selbsttest wird nicht verzerrt.
- Die Aufgaben im Testleitfaden bleiben lösbar. Neue Wege sind Karte antippen → Bearbeiten bzw. Pausieren (Aufgaben 4 und 7) und Einstellungen. Der Testleitfaden wird vor dem Test auf v10 angepasst.
- U7 (viele Begriffe) wird teilweise schon hier entschärft, weil Begriffe in den Info-Blättern erklärt werden. Das Glossar bleibt in v10.
- Reihenfolge: v8c kommt vor v9, weil die Freischaltungen in v9 neue Inhalte bringen und die Oberfläche dann schon aufgeräumt sein soll.

## Quellen

- [Nielsen Norman Group: Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) und [Video](https://www.nngroup.com/videos/progressive-disclosure/)
- [Nielsen Norman Group: Reading Content on Mobile Devices](https://www.nngroup.com/articles/mobile-content/)
- [Apple HIG Referenz: Label-Ebenen](https://charleswiltgen.github.io/Axiom/reference/hig-ref)
- [SAP Fiori: Bottom Sheet](https://www.sap.com/design-system/fiori-design-android/v25-4/components/system-components/bottom-sheet/usage), [PatternFly: Popover](https://www.patternfly.org/components/popover/design-guidelines/)
- Eigene Quellen: [UX-Evaluation v6](ux-heuristische-evaluation-v6.md) (U1, U7, U14, U17), [Marktanalyse](marktanalyse-habit-apps.md)
