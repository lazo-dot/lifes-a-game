/* Life's a Game · Erklärtexte und Wilmas Vorrang (v8c „Ruhiger Bildschirm“)
 * DOM-frei, läuft im Browser (window.LAGHilfe) und in Node (Tests).
 * Erklärungen stehen hinter einem „?“ und öffnen ein Info-Blatt: ein Thema, höchstens 60 Wörter (Konzept v8c, Regel 3).
 * Wilma zeigt immer nur einen Hinweis, nach Vorrang: offener Nachtrag, Check-in, Meilenstein, Hof- oder Wetterspruch (Regel 5).
 */
(function (root) {
  'use strict';
  const MAX_WORDS = 60;
  /** id → [Titel, Text]. Texte aus v8.1 (Text-Inventar), nur gekürzt, wo es über 60 Wörter waren. */
  const X = {
    heute: ['Heute', 'Hake ab, was du geschafft hast. An schlechten Tagen zählt die Mini-Version voll. Tippst du auf eine Gewohnheit, siehst du alle Angaben dazu und kannst sie bearbeiten, im Kalender ansehen oder pausieren.'],
    nachtragen: ['Nachtragen', 'Vergessen einzutragen? Gestern und vorgestern lassen sich nachholen. Nachgetragenes zählt voll, nur Funde gibt es dafür keine. Hat ein Regentag den Tag gerettet, bekommst du ihn durch das Nachtragen zurück. Ist ein Tag wirklich ausgefallen, rettet eine Extra-Runde heute deine Serie.'],
    regentage: ['Regentage', 'Ein Regentag rettet automatisch einen verpassten Tag deiner Serie. Für je 7 erledigte Termine bekommst du einen, höchstens zwei. Verzeihende Hilfen setzen keine Zähler zurück.'],
    todo: ['To-dos', 'Nur der Titel ist Pflicht. Aufwand und Fähigkeit bestimmen die XP, ein Datum plant das To-do für einen Tag. Jedes To-do kann einmal einen Fund bringen.'],
    gewohnheiten: ['Gewohnheiten', 'Jede Gewohnheit hängt an einer Routine, die du schon hast. Auf dem Hof wird daraus ein Beet, das mit der Gewohnheitsstärke wächst. Erinnerungen bringt im Prototyp Wilma zur Ankerzeit. Pausierte Gewohnheiten zählen nicht als verpasst und behalten ihre Stärke.'],
    logbuch: ['Logbuch', 'Ein Eintrag pro Tag schließt den Tag ab. Es gibt nur ein paar XP dafür, das Schreiben selbst ist der Gewinn. Wähl das Wetter deines Tages, Hof und Musik passen sich an.'],
    fortschritt: ['Fortschritt', 'Du vergleichst dich hier nur mit dir selbst. Gezählt wird, was du wirklich getan hast. Mit jedem Level wird auf dem Hof ein weiterer Deko-Platz frei, jede Fähigkeit lässt ihr Gebäude wachsen.'],
    kalender: ['Erntekalender', 'Erledigt: geschafft. Mini: Mini-Version geschafft, zählt voll. Extra-Runde: ausgefallen, am Tag danach gerettet. Regentag: ausgefallen, automatisch gerettet. Offen: geplant, nicht erledigt. Nicht geplant: nichts stand an. Abgeschrägte Ecke: nachgetragen, zählt voll, ohne Fund. Bei „Alle Gewohnheiten“ zeigt die Farbe, wie viel an einem Tag erledigt war. Tippe auf einen Tag für Datum und Status.'],
    gemeistert: ['Gemeistert', 'Hält eine Gewohnheit 30 Tage ohne Erinnerung an mindestens 70 % der Termine, gilt sie als gemeistert und landet hier. Gemeistert wird nie entzogen.'],
    truhe: ['Truhe', 'Bei jeder Erledigung kann etwas für deinen Hof auftauchen, und jede neue Wachstumsstufe bringt eine Ernte. Funde lassen sich weder kaufen noch erzwingen. Mit jedem Level wird ein weiterer Deko-Platz frei.'],
    darstellung: ['Darstellung', '„Lesbare Schrift“ zeigt Fließtexte in der Systemschrift, Überschriften und Zahlen bleiben in Pixel-Schrift. Das Thema ändert nur die Farben der Oberfläche, nicht den Hof; „Passend zur Jahreszeit“ wechselt mit ihr. „Gut unterscheidbar“ nutzt Farben, die auch bei Rot-Grün-Schwäche auseinanderzuhalten sind, und passt zu jedem Thema.'],
    akzent: ['Akzentfarbe', 'Die Akzentfarbe gilt für Überschriften, Anker, aktive Tabs und Hervorhebungen. „Thema“ nimmt die Farbe des Farbthemas. Alle Farben sind in jedem Thema gut lesbar.'],
    daten: ['Daten & Sicherung', 'Alles bleibt auf diesem Gerät. Eine Sicherung ist eine Textdatei mit allen Daten, mit der du deinen Hof später wiederherstellen kannst.'],
    beta: ['Beta-Zahlen', 'Diese Zahlen bleiben auf dem Gerät. Sie helfen dir und uns, wenn du sie freiwillig weitergibst, zu prüfen, ob der Hof beim Dranbleiben hilft. „Gehalten“ heißt: in den 14 Tagen bis dahin mindestens die Hälfte der geplanten Termine geschafft.']
  };
  const words = s => String(s).trim().split(/\s+/).filter(Boolean).length;
  const explain = id => (X[id] ? { id, title: X[id][0], text: X[id][1] } : null);

  /** Akzentfarben (docs/farbthemen.json → akzente): Reihenfolge und Namen der Auswahl. „thema“ = Feld fehlt. */
  const ACCENTS = [['thema', 'Thema'], ['gold', 'Gold'], ['mint', 'Mint'], ['himmel', 'Himmel'], ['rose', 'Rose'], ['lavendel', 'Lavendel'], ['weiss', 'Weiß']];

  /**
   * Wilmas eine Nachricht. c = { late: [{ title, day }], checkin: bool, milestones: [{ id, text, ... }], sayings: [text], idx }
   * Vorrang: Nachtrag, Check-in, Meilenstein, Spruch (Sprüche wechseln mit idx). Die übrigen kommen später dran.
   */
  function pickHint(c) {
    if (c.late && c.late.length) { const x = c.late[0]; return { kind: 'late', text: `${x.day[0].toUpperCase() + x.day.slice(1)} ist bei „${x.title}“ noch nichts eingetragen.`, item: x }; }
    if (c.checkin) return { kind: 'checkin', text: 'Magst du kurz auf deinen Tag schauen? Der Check-in dauert keine halbe Minute.' };
    if (c.milestones && c.milestones.length) { const m = c.milestones[0]; return { kind: 'milestone', text: m.text, item: m }; }
    const s = c.sayings && c.sayings.length ? c.sayings : ['Schön, dass du da bist.'];
    return { kind: 'spruch', text: s[(c.idx || 0) % s.length], more: s.length > 1 };
  }

  const api = { MAX_WORDS, X, words, explain, ACCENTS, pickHint };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.LAGHilfe = api;
})(typeof self !== 'undefined' ? self : this);
