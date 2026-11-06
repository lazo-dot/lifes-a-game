# Freigabe Entwurf v9 (Koordinations-Chat, 06.11.2026)

**Freigegeben – mit den folgenden Änderungen.** Sie ändern keine Regeln; Grundlage bleibt `docs/auftraege/v9.md`.

## Muss

1. **Erster Haken bleibt ≤ 480 pt, auch mit „Neu entdeckt“.** Im Entwurf (a-heute) liegt der erste Abhak-Kasten mit der gebündelten Wilma-Meldung bei etwa 480 pt – an der Grenze, und längere Namen schieben ihn darüber. Die Entdeckungs-Meldung wird deshalb **einzeilig und ohne eigenen Knopf**: „Neu auf deinem Hof: 5 Dinge ›“ (die ganze Zeile ist die Tap-Fläche, ≥ 44 pt, öffnet das Blatt „Neu auf deinem Hof“). Bei einer einzelnen Entdeckung: „Neu auf deinem Hof: Steg am Teich ›“. Abnahme `erster_haken_max_pt` mit aktiver Meldung messen.
2. **Steg als Steg, nicht als Brücke an Land:** senkrecht vom Ufer ins Wasser (oberes oder linkes Ufer), Anschluss an den Weg bzw. an einen Trittstein. Heute liegt er waagerecht auf der Uferkante und führt nirgends hin.
3. **Zahlen nicht in der Pixel-Schrift:** In „19 Hof-Tage · 5 Entdeckungen“ liest sich die 5 als S (gleiches Problem wie B/G). Ziffern in Karten, Abzeichen und Blättern in der Schrift der übrigen Zahlen (wie „48 %“). Gilt auch für die Zahl am Tab.
4. **Zwei fast gleiche Zahlen mit verschiedener Bedeutung vermeiden:** Der Erntekalender zeigt „19 Tage in 2026 mit mindestens einer Erledigung“ – dort zählen auch „repariert“ und Logbuch-Einträge, bei Hof-Tagen nicht. Die beiden Zahlen werden auseinanderlaufen (Testperson P1: „Ungereimtheiten“ 4/5). Lösung: Die Satzzeile unter dem Kalender (Ansicht „Alle Gewohnheiten“) zeigt **„N Hof-Tage in <Jahr>“** nach der Hof-Tage-Regel (`hofTage` auf das Jahr begrenzt). Die Färbung der Kacheln bleibt unverändert. Test dazu.
5. **Regenbogen braucht ein Bild** in Hofchronik und „Neu auf deinem Hof“ (kleines Bogen-Symbol, per Code). Heute ist die Zeile ohne Bild und rückt nach links.

## Sollte

6. **Bilder in den Listen gleich ausrichten:** feste Bildspalte (z. B. 48 × 48 pt), Bild darin mittig; heute sitzen Schmetterling, Steg und Bienenstock unterschiedlich hoch.
7. **Kein eigenes „?“ für die Hofchronik:** Im Fortschritt stehen jetzt drei „?“ untereinander. Die Karte mit „›“ ist selbsterklärend; die Erklärung (ein Satz: „Hof-Tage sind Tage, an denen du mindestens eine Gewohnheit gepflegt hast. Sie gehen nie verloren.“) steht oben im Blatt „Hofchronik“.
8. **Schmetterlinge als Schmetterlinge lesbar:** Im Entwurf wirken sie wie rosa Schleifen. Zwei Flügelpaare mit dunklem Körper, 2 Frames Flügelschlag, eher 8 × 8 als größer.
9. **Datum in der Hofchronik = Tag, an dem die Schwelle erreicht wurde** (aus den Logs abgeleitet), nicht der Tag des Ansehens. Sonst steht nach dem Update bei allen fünf dasselbe Datum, und die Chronik erzählt nichts. `hofGesehen` bleibt nur für die Meldung zuständig.

## Kann (nicht zwingend in v9)

10. Erntekalender: Der Knopf „Jahr vor“ (›) bricht in eine eigene Zeile um (390 pt). Wenn mit wenig Aufwand möglich, beide Pfeile mit der Jahreszahl in eine Zeile.

## Gut so (bitte beibehalten)

Anker zuerst und umbrochen · gebündelte Meldung statt fünf einzelner · Hofchronik-Karte mit „›“ (zeigt, dass sie antippbar ist) · keine Silhouetten für Unentdecktes · Bienenwiese, Frösche und Eichhörnchen sind in der kompakten Szene erkennbar · Texte der Entdeckungen kurz und freundlich.
