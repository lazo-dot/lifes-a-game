/* Life's a Game · Speicher
 * IndexedDB (F5) mit localStorage als Rückfallebene, falls IndexedDB blockiert ist (z. B. privates Fenster).
 */
(function (root) {
  'use strict';
  const DB = 'lifes-a-game', STORE = 'kv', KEY = 'state-v4', LS = 'lag4:';
  let dbp = null;
  function open() {
    return new Promise((res, rej) => {
      if (!root.indexedDB) return rej(new Error('IndexedDB nicht verfügbar'));
      const r = root.indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  function tx(mode, fn) {
    dbp = dbp || open();
    return dbp.then(db => new Promise((res, rej) => {
      const t = db.transaction(STORE, mode), st = t.objectStore(STORE), req = fn(st);
      t.oncomplete = () => res(req && req.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
    }));
  }
  const lsGet = k => { try { const v = localStorage.getItem(LS + k); return v ? JSON.parse(v) : undefined; } catch (e) { return undefined; } };
  const lsSet = k => v => { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e) { /* voll oder gesperrt */ } };
  async function get(k) { try { const v = await tx('readonly', s => s.get(k)); return v === undefined ? lsGet(k) : v; } catch (e) { return lsGet(k); } }
  async function set(k, v) { try { await tx('readwrite', s => s.put(v, k)); } catch (e) { lsSet(k)(v); } }
  async function del(k) { try { await tx('readwrite', s => s.delete(k)); } catch (e) { /* egal */ } try { localStorage.removeItem(LS + k); } catch (e) { /* egal */ } }
  function legacyV3() { try { const r = localStorage.getItem('lifes-a-game-v3'); const o = r ? JSON.parse(r) : null; return o && o.v === 3 && !o.example ? o : null; } catch (e) { return null; } }
  root.LAGStore = { load: () => get(KEY), save: v => set(KEY, v), clear: () => del(KEY), legacyV3 };
})(typeof self !== 'undefined' ? self : this);
