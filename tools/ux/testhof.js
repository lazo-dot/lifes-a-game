/* Erzeugt einen Test-Hof für Usability-Sitzungen, immer passend zum heutigen Datum.
 * Aufruf (im Repo):  node tools/ux/testhof.js > testhof.json
 * Einspielen NUR in einem normalen Safari-Tab (nicht in der installierten App, deren Daten getrennt sind):
 * Fortschritt → Sicherung importieren → Text einfügen → Wiederherstellen.
 * Inhalt: 3 Gewohnheiten seit 20 Tagen, gestern bei „10 Minuten lesen“ nicht eingetragen (Nachtragen),
 * eine Wochen-Gewohnheit, Funde in der Truhe, zwei Logbuch-Einträge, ein offenes To-do.
 */
const L = require('../../src/logic.js');
const today = L.dkey(new Date()), start = L.addDays(today, -20);
const S = L.emptyState(start);
S.onboarded = true; S.rulesV6Since = start; S.freshSeen = today.slice(0, 7);
const mk = (id, i) => L.newHabit(i, start, id);
const read = mk('t1', { title: '10 Minuten lesen', anchor: 'dem Zähneputzen am Abend', anchorTime: '22:00', tinyVersion: 'Eine Seite lesen',
  frequency: { kind: 'daily' }, skillId: 's2', effort: 2, streakEnabled: true, remindersEnabled: true });
const walk = mk('t2', { title: 'Spazieren gehen', anchor: 'dem Mittagessen', anchorTime: '13:00', tinyVersion: 'Einmal um den Block',
  frequency: { kind: 'weekly', timesPerWeek: 3 }, skillId: 's1', effort: 2, streakEnabled: false, remindersEnabled: true });
const stretch = mk('t3', { title: '5 Minuten dehnen', anchor: 'dem ersten Kaffee', anchorTime: '08:00', tinyVersion: 'Eine Dehnübung',
  frequency: { kind: 'daily' }, skillId: 's1', effort: 1, streakEnabled: false, remindersEnabled: true });
for (let d = 20; d >= 2; d--) {                  // bis vorgestern
  const k = L.addDays(today, -d);
  if (d !== 9 && d !== 10) read.logs[k] = d % 6 === 0 ? 'tiny' : 'done';   // zwei Lücken vor 9–10 Tagen
  if (d % 2 === 0 && L.weekday(k) !== 0) walk.logs[k] = 'done';
  if (d % 4 !== 1) stretch.logs[k] = d % 3 === 0 ? 'tiny' : 'done';
}
// gestern: lesen NICHT eingetragen (Aufgabe „Nachtragen“), dehnen eingetragen
stretch.logs[L.addDays(today, -1)] = 'done';
S.habits.push(read, walk, stretch);
S.chest.items = { bench: 1, flowers: 2, lantern: 1 };
S.journal.push({ date: L.addDays(today, -3), text: 'Lesen klappt abends gut, wenn das Handy weg ist.', weather: 'heiter' },
  { date: L.addDays(today, -1), text: 'Langer Tag, nur kurz gedehnt.', weather: 'bewoelkt' });
S.todos.push({ id: 'td1', title: 'Geburtstagsgeschenk besorgen', effort: 2, skillId: 's3', dueDate: L.addDays(today, 2) });
S.habits.forEach(h => { const d = L.computeHabit(h, today); h.harvestStage = d.stage; h.rolled = ''; });
const chk = L.importState(JSON.parse(JSON.stringify(S)), today);
if (!chk.ok) { console.error(chk.error); process.exit(1); }
process.stdout.write(JSON.stringify(S));
