/* Life's a Game · Klang
 * Effekte und generative Klaviermusik je Wetter. Kennt keinen Spielzustand, nur zwei Rückfragen (opts).
 */
(function (root) {
  'use strict';
  function createAudio(opts) {
    // opts.soundOn(), opts.musicOn(), opts.isNight()
    let AC = null, noiseBuf = null;
    function audio() { try { AC = AC || new (root.AudioContext || root.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) { return null; } return AC; }
    function tone(f, d, o = {}) {
      if (!opts.soundOn()) return; const a = audio(); if (!a) return;
      const { type = 'square', to = null, vol = .06, at = 0 } = o, t = a.currentTime + at, os = a.createOscillator(), g = a.createGain();
      os.type = type; os.frequency.setValueAtTime(f, t); if (to) os.frequency.exponentialRampToValueAtTime(to, t + d);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); os.connect(g); g.connect(a.destination); os.start(t); os.stop(t + d + .03);
    }
    const sfx = {
      check() { tone(523, .07, { to: 784 }); tone(1047, .1, { at: .07, vol: .05 }); },
      tiny() { tone(440, .07, { to: 660, type: 'triangle', vol: .06 }); tone(880, .09, { at: .07, type: 'triangle', vol: .045 }); },
      level() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .12, { at: i * .09, vol: .055 })); tone(1047, .5, { at: .5, type: 'triangle', vol: .08 }); tone(1568, .5, { at: .5, type: 'triangle', vol: .045 }); },
      drop() { [1319, 1568, 1976, 2637].forEach((f, i) => tone(f, .08, { at: i * .06, type: 'triangle', vol: .05 })); },
      harvest() { [659, 784, 988, 1319].forEach((f, i) => tone(f, .1, { at: i * .08, type: 'triangle', vol: .06 })); },
      tick() { tone(880, .03, { vol: .02 }); },
      soft() { tone(523, .05, { type: 'triangle', vol: .03 }); },          // A9: leises, neutrales Rückgängig
      err() { tone(220, .12, { type: 'triangle', vol: .035 }); },
      place() { tone(330, .05, { type: 'triangle', vol: .06 }); tone(494, .08, { at: .05, type: 'triangle', vol: .05 }); },
      cluck() { tone(720, .05, { to: 520, type: 'triangle', vol: .06, at: .3 }); tone(820, .06, { to: 600, type: 'triangle', vol: .06, at: .38 }); },
      page() { tone(300, .04, { type: 'triangle', vol: .035 }); tone(500, .05, { type: 'triangle', vol: .025, at: .04 }); }
    };
    function noise(a) { if (noiseBuf) return noiseBuf; noiseBuf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return noiseBuf; }
    function thunder() {
      if (!opts.soundOn() && !opts.musicOn()) return; const a = audio(); if (!a) return; const t = a.currentTime + .35 + Math.random() * .6;
      const src = a.createBufferSource(); src.buffer = noise(a); const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 160; const g = a.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.5, t + .08); g.gain.exponentialRampToValueAtTime(.001, t + 2.6); src.connect(lp); lp.connect(g); g.connect(a.destination); src.start(t); src.stop(t + 2.7);
    }

    const Music = (() => {
      let ctx = null, master, bus, wave, rainGain, timer = null, nextT = 0, step = 0, mood = 'heiter', melIdx = 10, playing = false;
      const SCALES = { ionian: [0, 2, 4, 5, 7, 9, 11], lydian: [0, 2, 4, 6, 7, 9, 11], dorian: [0, 2, 3, 5, 7, 9, 10], aeolian: [0, 2, 3, 5, 7, 8, 10], phrygian: [0, 1, 3, 5, 7, 8, 10] };
      const MOODS = {
        sonnig: { bpm: 100, key: 60, scale: 'ionian', prog: [0, 4, 5, 3], bars: 1, style: 'arp', mel: .55, vel: .55, rain: 0 },
        heiter: { bpm: 84, key: 55, scale: 'lydian', prog: [0, 1, 5, 4], bars: 1, style: 'broken', mel: .4, vel: .5, rain: 0 },
        bewoelkt: { bpm: 70, key: 57, scale: 'dorian', prog: [0, 3, 0, 6], bars: 2, style: 'rolled', mel: .3, vel: .45, rain: 0 },
        regen: { bpm: 60, key: 50, scale: 'aeolian', prog: [0, 5, 2, 6], bars: 2, style: 'sparse', mel: .28, vel: .42, rain: .035 },
        gewitter: { bpm: 78, key: 52, scale: 'phrygian', prog: [0, 1, 0, 6], bars: 2, style: 'ostinato', mel: .16, vel: .5, rain: .06 }
      };
      const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
      function build() {
        ctx = audio(); if (!ctx) return false;
        const real = new Float32Array([0, 1, .55, .3, .17, .1, .06, .035, .02]); wave = ctx.createPeriodicWave(real, new Float32Array(real.length));
        master = ctx.createGain(); master.gain.value = 0; const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; master.connect(comp); comp.connect(ctx.destination);
        bus = ctx.createGain(); const dry = ctx.createGain(); dry.gain.value = .72; const wet = ctx.createGain(); wet.gain.value = .38;
        const conv = ctx.createConvolver(), len = Math.floor(ctx.sampleRate * 2.8), ir = ctx.createBuffer(2, len, ctx.sampleRate);
        for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8); }
        conv.buffer = ir; bus.connect(dry); dry.connect(master); bus.connect(conv); conv.connect(wet); wet.connect(master);
        const src = ctx.createBufferSource(); src.buffer = noise(ctx); src.loop = true; const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1000;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7000; rainGain = ctx.createGain(); rainGain.gain.value = 0; src.connect(hp); hp.connect(lp); lp.connect(rainGain); rainGain.connect(master); src.start();
        return true;
      }
      function note(m, t, dur, vel) {
        const f = mtof(m), o = ctx.createOscillator(), flt = ctx.createBiquadFilter(), g = ctx.createGain(); o.setPeriodicWave(wave); o.frequency.value = f;
        flt.type = 'lowpass'; flt.frequency.setValueAtTime(Math.min(9000, f * 8 + 1400), t); flt.frequency.exponentialRampToValueAtTime(Math.max(320, f * 1.6), t + 1.1);
        const end = Math.min(Math.max(.7, Math.min(4, 3.4 * Math.pow(262 / f, .5))), dur + .9);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel * .2, t + .006); g.gain.exponentialRampToValueAtTime(vel * .07, t + .28); g.gain.exponentialRampToValueAtTime(.0001, t + end);
        o.connect(flt); flt.connect(g); g.connect(bus); o.start(t); o.stop(t + end + .05);
      }
      const chordTones = (M, d) => [0, 2, 4, 6].map(k => { const i = d + k, sc = SCALES[M.scale]; return M.key + sc[i % 7] + 12 * Math.floor(i / 7); });
      const scaleNote = (M, i) => { const sc = SCALES[M.scale]; return M.key + sc[((i % 7) + 7) % 7] + 12 * Math.floor(i / 7); };
      function schedule() {
        const M = MOODS[mood], night = opts.isNight(), e = 60 / (M.bpm * (night ? .85 : 1)) / 2, v = M.vel * (night ? .75 : 1);
        while (nextT < ctx.currentTime + .2) {
          const s = step % 8, bar = Math.floor(step / 8), ch = chordTones(M, M.prog[Math.floor(bar / M.bars) % M.prog.length]), b = ch[0] - 12, t = nextT + (s % 2 ? e * .06 : 0) + (Math.random() - .5) * .008, R = Math.random;
          switch (M.style) {
            case 'arp': if (s === 0) note(b, t, e * 8, v * .75); if (s === 4) note(b + 7, t, e * 4, v * .45); note(ch[[0, 1, 2, 3, 2, 1, 2, 1][s]], t, e * 2, v * .42); break;
            case 'broken': if (s === 0 || s === 4) note(b, t, e * 4, v * .65); note(ch[[0, 2, 1, 2, 0, 2, 1, 2][s]] + 12, t, e * 2, v * .36); break;
            case 'rolled': if (s === 0) { note(b, t, e * 8, v * .7); ch.forEach((n, i) => note(n + 12, t + i * .04, e * 8, v * .38)); } if (s === 4) ch.slice(0, 3).forEach((n, i) => note(n + 12, t + i * .05, e * 4, v * .26)); if (s === 6 && R() < .35) note(ch[3] + 24, t, e * 2, v * .24); break;
            case 'sparse': if (s === 0) { note(b, t, e * 16, v * .7); ch.slice(0, 3).forEach((n, i) => note(n + 12, t + i * .06, e * 8, v * .32)); } if (R() < .22) note(scaleNote(M, 14 + [0, 2, 4, 5, 7][Math.floor(R() * 5)]), t, e * 3, v * .24); break;
            case 'ostinato': note(b + (s % 2 ? 12 : 0), t, e * 1.3, v * ([0, 3, 6].includes(s) ? .5 : .28)); if (s === 0) ch.slice(0, 3).forEach((n, i) => note(n + 12, t + i * .03, e * 6, v * .32)); if (s === 4) note(ch[2] + 12, t, e * 3, v * .24); break;
          }
          if (s % 2 === 0 && R() < M.mel * (s === 0 ? .6 : 1)) {
            melIdx = Math.max(8, Math.min(17, melIdx + [-2, -1, -1, 0, 1, 1, 2][Math.floor(R() * 7)])); let n = scaleNote(M, melIdx);
            if (s === 0) { let best = n, bd = 99; ch.forEach(c => [12, 24].forEach(o => { const d = Math.abs(c + o - n); if (d < bd) { bd = d; best = c + o; } })); n = best; }
            note(n, t, e * (R() < .4 ? 4 : 2), v * .85);
          }
          nextT += e; step++;
        }
      }
      return {
        get playing() { return playing; },
        start(m) {
          if (m) mood = m; if (playing) return; if (!ctx && !build()) return; if (ctx.state === 'suspended') ctx.resume(); playing = true; nextT = ctx.currentTime + .12; step = 0;
          master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(master.gain.value, ctx.currentTime); master.gain.linearRampToValueAtTime(.55, ctx.currentTime + 2);
          rainGain.gain.setTargetAtTime(MOODS[mood].rain, ctx.currentTime, .8); clearInterval(timer); timer = setInterval(schedule, 40); schedule();
        },
        stop() { if (!playing) return; playing = false; const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0, t + .6); setTimeout(() => { if (!playing) clearInterval(timer); }, 700); },
        setMood(m) { if (!MOODS[m] || m === mood) return; mood = m; melIdx = 10; step = Math.ceil(step / 8) * 8; if (ctx && rainGain) rainGain.gain.setTargetAtTime(MOODS[m].rain, ctx.currentTime, .8); }
      };
    })();
    root.document && root.document.addEventListener('visibilitychange', () => { if (!AC) return; if (root.document.hidden) AC.suspend(); else if (opts.soundOn() || opts.musicOn()) AC.resume(); });
    return { sfx, thunder, Music };
  }
  root.LAGAudio = { createAudio };
})(typeof self !== 'undefined' ? self : this);
