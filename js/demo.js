/* Life's a Game · Demo-Hof
 * Nur zum Ansehen: wird nie gespeichert und nie mit dem echten Profil vermischt (Checkliste D7).
 */
(function (root) {
  'use strict';
  const L = root.LAG;
  function demoState(today) {
    const r = L.rng(42), s = L.emptyState(L.addDays(today, -92));
    s.onboarded = true; s.demo = true;
    s.skills = [{ id: 's1', name: 'Ausdauer', icon: 'boot', st: 0 }, { id: 's2', name: 'Wissen', icon: 'book', st: 1 }, { id: 's3', name: 'Kreativität', icon: 'flower', st: 2 }, { id: 's4', name: 'Ordnung', icon: 'crate', st: 3 }, { id: 's5', name: 'Soziales', icon: 'heart', st: 4 }];
    const mk = (i, days, pd, pt, extra) => {
      const start = L.addDays(today, -days), h = L.newHabit(i, start, 'd' + days);
      for (let k = start; k < today; k = L.addDays(k, 1)) {
        if (!L.isScheduled(h, k)) continue;
        if (i.frequency.kind === 'weekly') { if (r() < i.frequency.timesPerWeek / 7 * 1.05) h.logs[k] = r() < pt ? 'tiny' : 'done'; continue; }
        const x = r(); if (x < pd) h.logs[k] = 'done'; else if (x < pd + pt) h.logs[k] = 'tiny';
      }
      Object.assign(h, extra || {}); const d = L.computeHabit(h, today); h.harvestStage = d.stage; h.gradRewarded = d.graduated; return h;
    };
    s.habits = [
      mk({ title: 'Ein Glas Wasser trinken', anchor: 'dem Aufstehen', anchorTime: '07:00', tinyVersion: 'Drei Schlucke', frequency: { kind: 'daily' }, skillId: 's1', effort: 1, streakEnabled: true, remindersEnabled: false }, 92, .95, .03, { remOffAt: L.addDays(today, -44) }),
      mk({ title: '20 Minuten lesen', anchor: 'dem Zähneputzen am Abend', anchorTime: '22:00', tinyVersion: 'Eine Seite lesen', frequency: { kind: 'daily' }, skillId: 's2', effort: 2, streakEnabled: true, remindersEnabled: true }, 45, .86, .08),
      mk({ title: 'Spazieren gehen', anchor: 'dem Mittagessen', anchorTime: '13:00', tinyVersion: 'Einmal um den Block', frequency: { kind: 'daily' }, skillId: 's1', effort: 2, streakEnabled: true, remindersEnabled: true }, 24, .62, .16),
      mk({ title: 'Skizzieren', anchor: 'dem ersten Kaffee am Wochenende', tinyVersion: 'Eine Linie zeichnen', frequency: { kind: 'weekly', timesPerWeek: 2 }, skillId: 's3', effort: 1, streakEnabled: false, remindersEnabled: false }, 30, 0, .2),
      mk({ title: '10 Minuten aufräumen', anchor: 'dem Abendessen', anchorTime: '19:00', tinyVersion: 'Einen Gegenstand wegräumen', frequency: { kind: 'weekdays', days: [1, 2, 3, 4, 5] }, skillId: 's4', effort: 1, streakEnabled: true, remindersEnabled: true }, 18, .66, .12)
    ];
    s.todos = [
      { id: 't1', title: 'Präsentation für Montag vorbereiten', effort: 3, skillId: 's2' },
      { id: 't2', title: 'Oma anrufen', effort: 2, skillId: 's5' },
      { id: 't3', title: 'Fahrradreifen aufpumpen', effort: 1, skillId: 's1', doneAt: L.addDays(today, -1), rolled: true }
    ];
    s.journal = [
      { date: L.addDays(today, -2), weather: 'regen', text: 'Grauer Tag. Trotzdem die Mini-Version beim Spazieren gemacht, das zählt.' },
      { date: L.addDays(today, -1), weather: 'heiter', text: 'Lesen klappt inzwischen fast automatisch. Spazieren nach dem Essen fühlt sich gut an.' }
    ];
    s.chest = { items: { bench: 1, pot: 2, hay: 1 }, placed: [{ itemId: 'lantern', slot: 0 }, { itemId: 'flowers', slot: 1 }, { itemId: 'chicken' }] };
    s.checkins = { [today]: { weather: null, todos: [] } };
    return s;
  }
  root.LAGDemo = { demoState };
})(typeof self !== 'undefined' ? self : this);
