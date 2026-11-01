/* Synthetische Personas für den 30-Tage-Testlauf.
 * Alle Parameter sind Annahmen (Startwerte), keine Messdaten. Sie orientieren sich an
 * Befunden aus dem Leitfaden: Neuheitseffekt-Abfall nach 3–8 Wochen (Koivisto & Hamari 2019),
 * Abbruch nach Serienbruch (Silverman & Barasch 2023), Erinnerungen vs. Auslöser (Stawarz 2015).
 *
 * Felder:
 *  adh        Grundwahrscheinlichkeit, eine geplante Gewohnheit wirklich auszuführen
 *  tiny       Anteil der „schlechten Tage“, an denen statt nichts die Mini-Version gemacht wird
 *  weekend    Faktor für adh am Wochenende
 *  open       Wahrscheinlichkeit, die App an einem Tag zu öffnen (zu Beginn)
 *  openFloor  Untergrenze der Öffnungsrate nach Abklingen der Neuheit (Anteil von open)
 *  tau        Abklingzeit der Neuheit in Tagen
 *  hours      typische Öffnungszeiten (Stunden); bestimmt Check-in-Fenster und „Farm schläft“
 *  checkin    Wahrscheinlichkeit, den Check-in zu machen, wenn er angeboten wird
 *  journal    Wahrscheinlichkeit für einen Logbuch-Eintrag an einem Öffnungstag
 *  todos      erledigte To-dos pro Öffnungstag (Mittelwert)
 *  repair     Wahrscheinlichkeit, „Extra-Runde erledigt“ zu nutzen, wenn angeboten
 *  lossSens   Abbruchneigung nach sichtbarem Serienbruch
 *  rewardSens Abbruchneigung bei langen Phasen ohne Belohnungsmoment
 *  churn0     Grund-Abbruchrisiko pro Tag
 *  sick       Wahrscheinlichkeit pro Tag, dass eine Störung (Krankheit, Reise, Stress) beginnt
 *  wantMore   möchte in Woche 1 mehr als 3 Gewohnheiten anlegen
 *  habits     [Titel, Frequenz, Aufwand, Serie an?]
 */
module.exports = [
  { id: 'studentin', label: 'Studentin, 21, Cozy-Gamerin, nachtaktiv',
    adh: 0.72, tiny: 0.35, weekend: 0.8, open: 0.95, openFloor: 0.55, tau: 14, hours: [11, 15, 23, 0, 1],
    checkin: 0.7, journal: 0.45, todos: 1.2, repair: 0.6, lossSens: 0.15, rewardSens: 0.6, churn0: 0.004, sick: 0.02, wantMore: false,
    habits: [['Lesen', { kind: 'daily' }, 1, true], ['Spazieren', { kind: 'weekly', timesPerWeek: 3 }, 2, false], ['Vokabeln', { kind: 'daily' }, 1, true]] },
  { id: 'vater', label: 'Vater, 38, zwei Kinder, Vollzeit',
    adh: 0.62, tiny: 0.6, weekend: 0.7, open: 0.85, openFloor: 0.5, tau: 18, hours: [6, 7, 21, 22],
    checkin: 0.55, journal: 0.15, todos: 0.8, repair: 0.4, lossSens: 0.25, rewardSens: 0.2, churn0: 0.005, sick: 0.03, wantMore: false,
    habits: [['Dehnen', { kind: 'daily' }, 1, true], ['Mit Kindern lesen', { kind: 'daily' }, 1, false], ['Laufen', { kind: 'weekly', timesPerWeek: 2 }, 3, false]] },
  { id: 'pflege', label: 'Pflegekraft, 45, Wechselschicht',
    adh: 0.58, tiny: 0.5, weekend: 1.0, open: 0.8, openFloor: 0.5, tau: 20, hours: [5, 13, 14, 22, 23],
    checkin: 0.5, journal: 0.3, todos: 0.6, repair: 0.4, lossSens: 0.3, rewardSens: 0.2, churn0: 0.005, sick: 0.02, wantMore: false, shift: true,
    habits: [['Wasser trinken', { kind: 'daily' }, 1, true], ['Rückenübungen', { kind: 'weekly', timesPerWeek: 3 }, 2, false], ['Abschalten-Ritual', { kind: 'daily' }, 1, false]] },
  { id: 'rentner', label: 'Rentner, 67, routiniert, wenig Spielerfahrung',
    adh: 0.85, tiny: 0.3, weekend: 1.0, open: 0.75, openFloor: 0.7, tau: 30, hours: [8, 9, 18],
    checkin: 0.75, journal: 0.25, todos: 0.5, repair: 0.2, lossSens: 0.1, rewardSens: 0.05, churn0: 0.006, sick: 0.015, wantMore: false, lowLogging: true,
    habits: [['Spaziergang', { kind: 'daily' }, 2, false], ['Blutdruck messen', { kind: 'daily' }, 1, false], ['Gedächtnistraining', { kind: 'weekdays', days: [1, 3, 5] }, 1, false]] },
  { id: 'entwickler', label: 'Entwickler, 29, Habitica-Abbrecher, Optimierer',
    adh: 0.8, tiny: 0.15, weekend: 0.85, open: 1.0, openFloor: 0.6, tau: 10, hours: [9, 13, 20, 23],
    checkin: 0.8, journal: 0.3, todos: 2.5, repair: 0.8, lossSens: 0.35, rewardSens: 0.7, churn0: 0.005, sick: 0.01, wantMore: true,
    habits: [['Krafttraining', { kind: 'weekly', timesPerWeek: 3 }, 3, true], ['Meditation', { kind: 'daily' }, 1, true], ['Side-Project', { kind: 'daily' }, 2, true]] },
  { id: 'selbstfuersorge', label: 'Gestalterin, 26, kommt von Finch, schwankende Energie',
    adh: 0.6, tiny: 0.55, weekend: 0.9, open: 0.9, openFloor: 0.6, tau: 20, hours: [10, 19, 22],
    checkin: 0.75, journal: 0.7, todos: 0.7, repair: 0.3, lossSens: 0.2, rewardSens: 0.35, churn0: 0.004, sick: 0.04, wantMore: false, lowSpells: true,
    habits: [['Tagebuch-Minute', { kind: 'daily' }, 1, false], ['Draußen sein', { kind: 'daily' }, 1, false], ['Yoga', { kind: 'weekly', timesPerWeek: 2 }, 2, false]] },
  { id: 'perfektionistin', label: 'Beraterin, 33, serienfixiert, viel unterwegs',
    adh: 0.83, tiny: 0.25, weekend: 0.9, open: 0.95, openFloor: 0.65, tau: 14, hours: [6, 7, 22],
    checkin: 0.65, journal: 0.2, todos: 1.5, repair: 0.9, lossSens: 0.6, rewardSens: 0.25, churn0: 0.003, sick: 0.025, wantMore: false, travel: true,
    habits: [['Joggen', { kind: 'daily' }, 2, true], ['Kein Handy nach 22 Uhr', { kind: 'daily' }, 1, true], ['Fachartikel lesen', { kind: 'daily' }, 1, true]] },
  { id: 'azubi', label: 'Azubi, 19, Gamer, wenig Struktur',
    adh: 0.5, tiny: 0.3, weekend: 0.6, open: 0.9, openFloor: 0.35, tau: 9, hours: [16, 20, 23, 0],
    checkin: 0.35, journal: 0.1, todos: 0.8, repair: 0.5, lossSens: 0.3, rewardSens: 0.8, churn0: 0.007, sick: 0.02, wantMore: true,
    habits: [['Früh aufstehen', { kind: 'daily' }, 2, true], ['Zimmer aufräumen', { kind: 'weekly', timesPerWeek: 2 }, 1, false], ['Pushups', { kind: 'daily' }, 1, true]] },
  { id: 'gelegenheit', label: 'Verwaltungsangestellte, 52, öffnet die App selten',
    adh: 0.78, tiny: 0.3, weekend: 1.0, open: 0.55, openFloor: 0.6, tau: 25, hours: [12, 19],
    checkin: 0.4, journal: 0.1, todos: 0.4, repair: 0.3, lossSens: 0.15, rewardSens: 0.1, churn0: 0.005, sick: 0.02, wantMore: false,
    habits: [['Gemüse essen', { kind: 'daily' }, 1, false], ['Radfahren', { kind: 'weekly', timesPerWeek: 2 }, 2, false], ['Pflanzen gießen', { kind: 'weekdays', days: [1, 4] }, 1, false]] },
  { id: 'sportlerin', label: 'Sportstudentin, 23, flexible Wochenziele',
    adh: 0.82, tiny: 0.2, weekend: 1.0, open: 0.9, openFloor: 0.6, tau: 16, hours: [7, 12, 18],
    checkin: 0.6, journal: 0.25, todos: 1.0, repair: 0.6, lossSens: 0.2, rewardSens: 0.3, churn0: 0.004, sick: 0.02, wantMore: false,
    habits: [['Intervalltraining', { kind: 'weekly', timesPerWeek: 3 }, 3, false], ['Mobility', { kind: 'weekly', timesPerWeek: 4 }, 1, false], ['Proteinfrühstück', { kind: 'daily' }, 1, true]] }
];
