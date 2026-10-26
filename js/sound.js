// Little chiptune sounds made on the spot with the Web Audio API, and a cheerful tune for each country.
let ac = null, on = true, timer = null, cur = null;
const ctx = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } } if (ac && ac.state === 'suspended') ac.resume(); return ac; };
function tone(f0, f1, dur, type = 'square', vol = 0.06, delay = 0) {
  const a = ctx(); if (!a || !on) return; const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur); o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, vol = 0.08, hi = 1200) { const a = ctx(); if (!a || !on) return; const n = Math.floor(a.sampleRate * dur), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); f.type = 'lowpass'; f.frequency.value = hi; g.gain.value = vol; s.buffer = b; s.connect(f).connect(g).connect(a.destination); s.start(); }
export const SFX = {
  jump: () => tone(320, 640, 0.12, 'square', 0.04),
  hop: () => tone(260, 900, 0.2, 'square', 0.05),
  switch: () => { tone(660, 660, 0.06, 'square', 0.04); tone(990, 990, 0.08, 'square', 0.04, 0.06); },
  open: () => { tone(220, 440, 0.2, 'triangle', 0.08); },
  shut: () => tone(330, 160, 0.18, 'triangle', 0.07),
  panel: () => { tone(880, 880, 0.05, 'square', 0.04); tone(1320, 1320, 0.07, 'square', 0.04, 0.05); },
  tick: () => tone(1200, 1200, 0.03, 'square', 0.03),
  smash: () => { noise(0.35, 0.18, 900); tone(140, 50, 0.3, 'sawtooth', 0.06); },
  build: () => { tone(500, 480, 0.05, 'square', 0.05); tone(500, 480, 0.05, 'square', 0.05, 0.1); },
  splash: () => noise(0.4, 0.12, 2400),
  ouch: () => tone(500, 120, 0.3, 'square', 0.06),
  star: () => { for (const [i, f] of [988, 1319, 1568].entries()) tone(f, f, 0.08, 'square', 0.04, i * 0.06); },
  back: () => tone(300, 600, 0.15, 'triangle', 0.05),
  nothing: () => tone(200, 180, 0.06, 'square', 0.03),
  done: () => { for (const [i, f] of [523, 659, 784, 1047, 784, 1047].entries()) tone(f, f, 0.14, 'square', 0.05, i * 0.11); },
  ok: () => tone(700, 900, 0.06, 'square', 0.04),
};
// a loop of notes over a bass line
const TUNES = {
  meadow: { bpm: 132, mel: [72, 0, 76, 79, 77, 76, 74, 0, 72, 74, 76, 0, 79, 0, 77, 76], bass: [48, 55, 52, 55] },
  cave: { bpm: 104, mel: [69, 0, 72, 0, 76, 74, 72, 0, 69, 0, 67, 0, 69, 72, 0, 0], bass: [45, 45, 43, 40] },
  castle: { bpm: 120, mel: [74, 77, 81, 77, 74, 0, 72, 74, 76, 0, 79, 76, 74, 0, 0, 0], bass: [50, 53, 48, 55] },
  lake: { bpm: 116, mel: [76, 0, 74, 72, 74, 0, 76, 79, 81, 0, 79, 76, 74, 0, 72, 0], bass: [48, 52, 53, 55] },
  sky: { bpm: 140, mel: [79, 81, 84, 0, 81, 79, 76, 0, 77, 79, 81, 0, 79, 0, 76, 0], bass: [53, 55, 52, 57] },
  sunset: { bpm: 126, mel: [72, 76, 79, 84, 79, 76, 77, 81, 84, 0, 81, 77, 76, 79, 72, 0], bass: [48, 53, 55, 48] },
  title: { bpm: 128, mel: [72, 72, 79, 79, 81, 81, 79, 0, 77, 77, 76, 76, 74, 74, 72, 0], bass: [48, 53, 48, 55] },
};
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
export function music(name) {
  if (cur === name) return; cur = name; clearInterval(timer); timer = null; if (!name || !TUNES[name]) return;
  const T = TUNES[name], step = 60 / T.bpm / 2; let i = 0;
  timer = setInterval(() => { if (!on) return; const m = T.mel[i % T.mel.length]; if (m) tone(hz(m), hz(m), step * 0.9, 'square', 0.022); if (i % 4 === 0) tone(hz(T.bass[(i / 4) % T.bass.length]), hz(T.bass[(i / 4) % T.bass.length]), step * 3.2, 'triangle', 0.05); i++; }, step * 1000);
}
export function setSound(v) { on = v; if (!on) { const c = cur; music(null); cur = c; } else { const c = cur; cur = null; music(c); } }
export const soundOn = () => on;
export const unlock = () => ctx();
