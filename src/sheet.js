/* Life's a Game · Info-Blatt (v8c, Konzept Regel 1)
 * Eine gemeinsame Komponente für Ebene 2: geht von unten auf, Ziehgriff, schließt per Tippen daneben, Wischen nach unten, Escape oder Knopf (44 pt).
 * role="dialog", aria-modal, aria-labelledby auf den Titel; der Fokus geht beim Öffnen auf den Titel, bleibt im Blatt (Tab) und kehrt beim Schließen
 * zum Auslöser zurück (gibt es ihn nach einem Neuzeichnen nicht mehr: zum Element aus `refocus`). Bei reduzierter Bewegung ohne Animation.
 * Nutzt nur wenige DOM-Funktionen, damit es in Node mit einem kleinen Ersatz-DOM testbar ist (tests/v8c.test.js).
 */
(function (root) {
  'use strict';
  const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const SWIPE_CLOSE = 70;   // px nach unten
  let seq = 0;

  function createSheets(doc, opt = {}) {
    let cur = null;
    const later = opt.raf || (f => setTimeout(f, 16));

    /** Öffnet ein Blatt. o = { title, html, trigger, refocus, cls, onClose }. Ein offenes Blatt wird ersetzt (der Fokus kehrt dann zum ersten Auslöser zurück). */
    function open(o) {
      const returnTo = cur ? cur.returnTo : (o.trigger || doc.activeElement), refocus = cur && !o.refocus ? cur.refocus : o.refocus;
      if (cur) close('ersetzt', true);
      const id = 'sheetT' + (++seq);
      const wrap = doc.createElement('div'); wrap.className = 'sheet-wrap' + (o.cls ? ' ' + o.cls : '');
      const bg = doc.createElement('div'); bg.className = 'sheet-bg';
      const panel = doc.createElement('div'); panel.className = 'sheet';
      panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-labelledby', id);
      const grip = doc.createElement('div'); grip.className = 'grip'; grip.setAttribute('aria-hidden', 'true');
      const head = doc.createElement('div'); head.className = 'sheet-hd';
      const h = doc.createElement('h2'); h.id = id; h.setAttribute('tabindex', '-1'); h.textContent = o.title;
      const x = doc.createElement('button'); x.className = 'btn ghost sheet-x'; x.setAttribute('type', 'button'); x.textContent = 'Schließen';
      const body = doc.createElement('div'); body.className = 'sheet-body'; body.innerHTML = o.html || '';
      head.append(h, x); panel.append(grip, head, body); wrap.append(bg, panel); doc.body.append(wrap);
      const s = { wrap, panel, body, title: h, returnTo, refocus, onClose: o.onClose, closed: false };
      cur = s;
      bg.addEventListener('click', () => close('daneben'));
      x.addEventListener('click', () => close('knopf'));
      wrap.addEventListener('keydown', e => {
        if (e.key === 'Escape') { e.preventDefault && e.preventDefault(); e.stopPropagation && e.stopPropagation(); close('escape'); return; }
        if (e.key === 'Tab') {   // Fokus bleibt im Blatt
          const f = [...panel.querySelectorAll(FOCUSABLE)].filter(el => !el.disabled && !el.hidden); if (!f.length) return;
          const first = f[0], last = f[f.length - 1], a = doc.activeElement;
          if (e.shiftKey && (a === first || a === h)) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
        }
      });
      // Wischen nach unten: am Griff oder an der Kopfzeile ziehen
      let y0 = null, dy = 0;
      const down = e => { y0 = e.clientY; dy = 0; };
      const move = e => { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); panel.style.transform = dy ? `translateY(${dy}px)` : ''; };
      const up = () => { if (y0 == null) return; y0 = null; if (dy > SWIPE_CLOSE) close('wischen'); else panel.style.transform = ''; };
      [grip, head].forEach(el => el.addEventListener('pointerdown', down));
      wrap.addEventListener('pointermove', move); wrap.addEventListener('pointerup', up); wrap.addEventListener('pointercancel', up);
      if (opt.reduce) wrap.classList.add('in', 'still'); else later(() => wrap.classList.add('in'));
      h.focus();
      return s;
    }
    /** Schließt das offene Blatt. Fokus zurück zum Auslöser bzw. zu `refocus`. quiet: ohne Fokuswechsel (beim Ersetzen). */
    function close(reason = 'knopf', quiet) {
      const s = cur; if (!s) return false; cur = null; s.closed = true; s.wrap.remove();
      if (!quiet) {
        const back = s.returnTo && doc.contains(s.returnTo) ? s.returnTo : s.refocus ? doc.querySelector(s.refocus) : null;
        if (back && back.focus) back.focus();
        if (s.onClose) s.onClose(reason);
      }
      return true;
    }
    return { open, close, current: () => cur, isOpen: () => !!cur, SWIPE_CLOSE };
  }

  const api = { createSheets, FOCUSABLE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.LAGSheet = api;
})(typeof self !== 'undefined' ? self : this);
