// Plays every level's solution (in js/data/levels.js) through the real rules, a tick at a time, and checks that all
// the brothers reach the way out — so no level can be impossible. `node tools/solve.mjs 3` plays one level and tells
// you where everyone ended up.
import { LEVELS } from '../js/data/levels.js';
import { load, update, TS } from '../js/engine.js';
const DT = 1 / 120, only = process.argv[2] != null ? +process.argv[2] : null, verbose = only != null;
let bad = 0;
for (const [i, L] of LEVELS.entries()) {
  if (only != null && i !== only) continue;
  const W = load(L), log = [];
  const tick = (inp = {}) => update(W, DT, inp);
  const me = () => W.bros[W.active];
  const run = (secs, inp) => { const n = Math.round(secs / DT); for (let k = 0; k < n; k++) tick(k === 0 ? { ...inp, jumpP: inp.jump, actP: inp.act } : { ...inp, actP: false, jumpP: false }); };
  for (const [cmd, ...a] of L.solve || []) {
    if (cmd === 'sel') { W.active = W.bros.findIndex((b) => b.id === a[0]); if (W.active < 0) throw new Error(`${L.id}: no ${a[0]}`); }
    else if (cmd === 'go') { const tx = a[0] * TS + 8; for (let k = 0; k < 2400; k++) { const b = me(), c = b.x + b.w / 2; if (Math.abs(c - tx) < 2.5) break; tick({ right: c < tx, left: c > tx, ...(a[1] || {}) }); } run(0.25, {}); }
    else if (cmd === 'jump') run(a[1] ?? 0.45, { jump: true, right: a[0] > 0, left: a[0] < 0 });
    else if (cmd === 'hold') run(a[1], a[0]);
    else if (cmd === 'act') run(0.1, { act: true });
    else if (cmd === 'wait') run(a[0], {});
    else if (cmd === 'glide') { const tx = a[0] * TS + 8; let k = 0; for (; k < 960; k++) { const b = me(); if (b.x + b.w / 2 >= tx - 4) break; tick({ right: true, jump: true, jumpP: k === 0 }); } for (k = 0; k < 960; k++) { tick({ jump: true }); if (me().ground) break; } }
    else if (cmd === 'hop') { const tx = a[0] * TS + 8; for (let k = 0; k < 480; k++) { const b = me(), c = b.x + b.w / 2, d = tx - c; tick({ jump: k < 50, jumpP: k === 0, right: d > 2, left: d < -2 }); if (k > 6 && b.ground) break; } }
    else if (cmd === 'land') { for (let k = 0; k < 240; k++) { tick({}); if (me().ground && k > 2) break; } }
    else if (cmd === 'face') run(0.02, { right: a[0] > 0, left: a[0] < 0 });
    if (verbose) { const b = me(); log.push(`${cmd} ${JSON.stringify(a)} → ${b.id} at ${(b.x / TS).toFixed(1)},${((b.y + b.h) / TS).toFixed(1)}${b.dead ? ' DEAD' : ''} open:${Object.keys(W.open).filter((k) => W.open[k]).join('')} crates:${W.crates.map((c) => (c.x / TS).toFixed(2)).join(',')}`); }
  }
  run(1.5, {});
  if (verbose) console.log(log.join('\n'));
  const where = W.bros.map((b) => `${b.id}@${Math.floor((b.x + b.w / 2) / TS)},${Math.floor((b.y + b.h - 1) / TS)}${b.exit ? '✓' : ''}`).join(' ');
  if (W.done) console.log(`✓ ${i} ${L.name} (${L.bros.join(', ')}) in ${W.time.toFixed(0)}s, stars ${W.got}/${W.stars.length}`);
  else { bad++; console.log(`✗ ${i} ${L.name}: ${where}`); }
}
console.log(bad ? `${bad} level(s) not solved` : 'every level can be finished'); process.exit(bad ? 1 : 0);
