// The world of a level, and how it moves: pure rules with no drawing in them, so a level can be played out by a
// script (tools/solve.mjs plays every level's solution to prove it can be finished).
//
// The map is rows of characters, one per 16-pixel square:
//   #  ground          X  bricks        -  a plank or ledge you can stand on and jump up through
//   C  a cracked wall (Hank breaks it)   n  an iron grate (only Tiny slips through)   ^  spikes (only Tank walks on them)
//   ~  water (only Finn swims)           F  a fan blowing upward (it lifts Leo)       E  the way out (everyone must stand in it)
//   a b d g j y z  plates: anyone standing on one (or a crate) opens the doors of its letter, A B D G J Y Z
//   w  an iron plate: only Tank or a crate is heavy enough; it opens W
//   q r s  control panels: Josh presses X to open or shut Q R S
//   t  a timed button: step on it and T opens for a few seconds
//   A B D G J Y Z W Q R S T  doors, shut until opened — or, for the letters a level lists in `bridges`, bridges that are
//      only there while their switch is on
//   k  a wooden crate (only Hank pushes it)   *  a star   @  where the brothers start (in the order the level lists them)
import { BROTHERS } from './data/brothers.js';
export const TS = 16, GRAV = 980, FALL = 430, TIMED = 3.2;
const PLATES = 'abdgjyzw', PANELS = 'qrs', DOORS = PLATES.toUpperCase() + 'QRST';

export function load(L) {
  const rows = L.map.map((r) => r.split('')), h = rows.length, w = Math.max(...rows.map((r) => r.length));
  for (const r of rows) while (r.length < w) r.push('.');
  const W = { L, w, h, t: rows, bros: [], crates: [], stars: [], got: 0, open: {}, on: { Q: false, R: false, S: false }, timer: 0, planks: L.planks || 0, active: 0, time: 0, done: false, events: [], bridges: L.bridges || '', triggers: [] };
  let n = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = rows[y][x];
    if (c === '@') { const id = L.bros[n++]; if (id) W.bros.push(bro(id, x, y)); rows[y][x] = '.'; }
    else if (c === 'k') { W.crates.push({ crate: true, x: x * TS, y: y * TS, w: 16, h: 16, vx: 0, vy: 0, dx: 0 }); rows[y][x] = '.'; }
    else if (c === '*') { W.stars.push({ x: x * TS + 4, y: y * TS + 4, got: false }); rows[y][x] = '.'; }
    else if (PLATES.includes(c) || c === 't' || PANELS.includes(c)) W.triggers.push({ c, x, y });
  }
  update(W, 0);
  return W;
}
function bro(id, cx, cy) {
  const d = BROTHERS[id], w = d.w || 12, h = d.h || 15, x = cx * TS + (TS - w) / 2, y = (cy + 1) * TS - h;
  return { id, d, x, y, w, h, vx: 0, vy: 0, ground: false, face: 1, spawn: { x, y }, dead: 0, swim: false, glide: false, climb: false, exit: false, coyote: 0, on: null, dx: 0, walk: 0, push: 0 };
}

export const cell = (W, tx, ty) => (ty >= W.h ? '.' : tx < 0 || tx >= W.w || ty < 0 ? '#' : W.t[ty][tx]);
const isDoor = (W, c) => DOORS.includes(c);
// is this square solid for this one?
function solid(W, e, tx, ty) {
  const c = cell(W, tx, ty);
  if (c === '#' || c === 'X' || c === 'C' || c === 'F') return true;
  if (c === 'n') return !(e.d && e.d.can === 'small');
  if (isDoor(W, c)) return W.bridges.includes(c) ? !!W.open[c] : !W.open[c];
  return false;
}
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function hitTiles(W, e, x, y) {
  const x0 = Math.floor(x / TS), x1 = Math.floor((x + e.w - 0.001) / TS), y0 = Math.floor(y / TS), y1 = Math.floor((y + e.h - 0.001) / TS);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (solid(W, e, tx, ty)) return true;
  return false;
}
// what stops a fall: ground, planks and ledges, the tops of crates, the heads of brothers
function landing(W, e, x, y) {
  const bottom = y + e.h;
  if (Math.abs(bottom - Math.round(bottom / TS) * TS) < 0.01) { const ty = Math.round(bottom / TS), x0 = Math.floor(x / TS), x1 = Math.floor((x + e.w - 0.001) / TS); for (let tx = x0; tx <= x1; tx++) { const c = cell(W, tx, ty); if (c === '-' || (isDoor(W, c) && W.bridges.includes(c) && W.open[c])) return 'plank'; } }
  for (const o of [...W.crates, ...(e.crate ? [] : W.bros)]) { if (o === e || o.dead) continue; if (Math.abs(bottom - o.y) < 0.01 && x < o.x + o.w && x + e.w > o.x) return o; }
  return null;
}
function moveX(W, e, dx) {
  let moved = 0;
  while (Math.abs(dx) > 1e-6) {
    const s = Math.sign(dx) * Math.min(1, Math.abs(dx)), nx = e.x + s;
    if (hitTiles(W, e, nx, e.y)) { e.vx = 0; return moved; }
    // crates block the way; Hank pushes them
    const box = { x: nx, y: e.y, w: e.w, h: e.h }, c = W.crates.find((o) => o !== e && overlap(box, o));
    if (c) { if (e.d && e.d.can === 'strong' && e.ground && Math.abs(moveX(W, c, s)) > 0) e.push = 0.2; else { e.vx = 0; return moved; } }
    e.x = nx; moved += s; dx -= s;
  }
  return moved;
}
function moveY(W, e, dy) {
  while (Math.abs(dy) > 1e-6) {
    const s = Math.sign(dy) * Math.min(1, Math.abs(dy)), ny = e.y + s;
    if (s > 0) { // crossing a plank's top or someone's head on the way down: stop on it
      const o = landing(W, e, e.x, e.y); if (o) { e.on = o === 'plank' ? null : o; return true; }
      const b0 = e.y + e.h, b1 = b0 + s, k = Math.floor(b1 / TS) * TS;
      if (b0 <= k + 0.001 && b1 > k) { const snap = { ...e, y: k - e.h }; if (landing(W, snap, e.x, k - e.h) === 'plank') { e.y = k - e.h; e.on = null; return true; } }
      for (const o2 of [...W.crates, ...(e.crate ? [] : W.bros)]) { if (o2 === e || o2.dead) continue; if (b0 <= o2.y + 0.001 && b1 > o2.y && e.x < o2.x + o2.w && e.x + e.w > o2.x) { e.y = o2.y - e.h; e.on = o2; return true; } }
    }
    if (hitTiles(W, e, e.x, ny)) return s > 0 ? (e.on = null, true) : (e.vy = 0, false);
    if (s < 0 && W.crates.some((o) => o !== e && overlap({ x: e.x, y: ny, w: e.w, h: e.h }, o))) { e.vy = 0; return false; }
    e.y = ny; dy -= s;
  }
  return false;
}
const onGround = (W, e) => hitTiles(W, e, e.x, e.y + 1) || !!landing(W, e, e.x, e.y);

function die(W, b, why) { if (b.dead) return; b.dead = 0.8; b.vx = 0; b.vy = 0; W.events.push({ type: 'die', id: b.id, why, x: b.x + b.w / 2, y: b.y + b.h / 2 }); }
function inCell(W, e, ch, part = 1) { const x0 = Math.floor((e.x + 1) / TS), x1 = Math.floor((e.x + e.w - 1) / TS), y0 = Math.floor((e.y + e.h * (1 - part)) / TS), y1 = Math.floor((e.y + e.h - 1) / TS); for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (cell(W, tx, ty) === ch) return { tx, ty }; return null; }

// one tick of the world. input: { left, right, up, down, jump, jumpP, actP } for the brother in control
export function update(W, dt, input = {}) {
  W.time += dt; W.events.length = 0;
  // switches and doors: plates are held by whoever stands on them; panels stay as Josh left them
  const was = { ...W.open }; W.open = { ...W.on };
  if (W.timer > 0) W.timer = Math.max(0, W.timer - dt);
  for (const tr of W.triggers) {
    const zone = { x: tr.x * TS + 1, y: tr.y * TS + 8, w: TS - 2, h: 8 };
    const held = [...W.bros.filter((b) => !b.dead), ...W.crates].some((e) => overlap(zone, e) && (tr.c !== 'w' || e.crate || e.d.can === 'tough'));
    tr.held = held;
    if (held && PLATES.includes(tr.c)) W.open[tr.c.toUpperCase()] = true;
    if (held && tr.c === 't') { if (W.timer < TIMED - 0.05 && !tr.was) W.events.push({ type: 'tick' }); W.timer = TIMED; }
    tr.was = held;
  }
  if (W.timer > 0) W.open.T = true;
  // a door never shuts on someone standing in it
  for (const ch of DOORS) if (was[ch] && !W.open[ch] && !W.bridges.includes(ch)) { for (let ty = 0; ty < W.h; ty++) for (let tx = 0; tx < W.w; tx++) if (W.t[ty][tx] === ch && [...W.bros, ...W.crates].some((e) => !e.dead && overlap(e, { x: tx * TS, y: ty * TS, w: TS, h: TS }))) W.open[ch] = true; }
  for (const ch of DOORS) if (!!was[ch] !== !!W.open[ch]) W.events.push({ type: W.open[ch] ? 'open' : 'shut', ch });
  if (!dt) return;
  // crates fall
  for (const c of W.crates) { c.vy = Math.min(FALL, c.vy + GRAV * dt); const x0 = c.x; if (moveY(W, c, c.vy * dt)) c.vy = 0; c.dx = c.x - x0; }
  // the brothers
  W.bros.forEach((b, i) => {
    const me = i === W.active, I = me ? input : {}, d = b.d, x0 = b.x;
    if (b.dead) { b.dead -= dt; if (b.dead <= 0) { b.dead = 0; b.x = b.spawn.x; b.y = b.spawn.y; b.vx = b.vy = 0; W.events.push({ type: 'back', id: b.id }); } b.dx = 0; return; }
    const water = !!inCell(W, b, '~', 0.5);
    if (water && d.can !== 'swim') return die(W, b, 'water');
    b.swim = water; b.wet = water ? 0.3 : Math.max(0, (b.wet || 0) - dt);
    const want = (I.right ? 1 : 0) - (I.left ? 1 : 0);
    if (want) b.face = want;
    const top = (b.push > 0 ? 0.55 : 1) * d.speed * (water ? 0.75 : 1);
    b.push = Math.max(0, b.push - dt);
    const acc = b.ground ? 1800 : 1100; b.vx += Math.max(-acc * dt, Math.min(acc * dt, want * top - b.vx));
    b.ground = onGround(W, b); if (b.ground) b.coyote = 0.08; else b.coyote = Math.max(0, b.coyote - dt);
    b.leap = Math.max(0, (b.leap || 0) - dt);
    if (water && !b.leap) { // Finn swims: sinks slowly, strokes upward, jumps out at the surface
      b.vy += 300 * dt; if (I.up || I.jump) b.vy -= 1000 * dt; b.vy = Math.max(-130, Math.min(80, b.vy));
      if (I.jumpP && !inCell(W, { ...b, y: b.y - 6 }, '~', 0.5)) { b.vy = -d.jump * 0.95; b.leap = 0.3; }
    } else {
      b.vy = Math.min(FALL, b.vy + GRAV * dt);
      if (I.jumpP && (b.ground || b.coyote > 0 || b.wet > 0)) { b.vy = -d.jump; b.ground = false; b.coyote = 0; W.events.push({ type: 'jump', id: b.id }); }
      if (!I.jump && b.vy < -120) b.vy += GRAV * dt * 1.4; // a short hop when the key is let go
    }
    // Leo's umbrella and the fans
    b.glide = d.can === 'glide' && !b.ground && !water && I.jump && b.vy > 0;
    if (b.glide) b.vy = Math.min(b.vy, 42);
    if (d.can === 'glide' && inFan(W, b)) { b.vy = Math.max(-175, b.vy - 2600 * dt); b.glide = true; }
    // Cliff climbs
    b.climb = false;
    if (d.can === 'climb' && want) { const side = want > 0 ? b.x + b.w + 1 : b.x - 1, wall = solid(W, b, Math.floor(side / TS), Math.floor((b.y + 2) / TS)) || solid(W, b, Math.floor(side / TS), Math.floor((b.y + b.h - 2) / TS));
      if (wall) { b.climb = true; b.vy = I.up ? -78 : Math.min(b.vy, 30); }
      else if (I.up && solid(W, b, Math.floor(side / TS), Math.floor((b.y + b.h + 2) / TS)) && b.vy > -150) b.vy = -150; // over the top
    }
    moveX(W, b, b.vx * dt);
    if (moveY(W, b, b.vy * dt)) { if (b.vy > 0) b.vy = 0; }
    b.ground = onGround(W, b);
    b.dx = b.x - x0; b.walk = b.ground && Math.abs(b.vx) > 5 ? b.walk + Math.abs(b.dx) : 0;
    if (b.y > W.h * TS + 32) return die(W, b, 'fall');
    if (d.can !== 'tough' && inCell(W, b, '^', 0.4)) return die(W, b, 'spike');
    for (const s of W.stars) if (!s.got && overlap(b, { x: s.x, y: s.y, w: 8, h: 8 })) { s.got = true; W.got++; W.events.push({ type: 'star', x: s.x, y: s.y }); }
    if (me && I.actP) act(W, b);
  });
  // ride on whoever you stand on
  for (const b of W.bros) if (!b.dead && b.on && b.on.dx) moveX(W, b, b.on.dx);
  for (const b of W.bros) { const cx = Math.floor((b.x + b.w / 2) / TS), cy = Math.floor((b.y + b.h - 2) / TS); b.exit = !b.dead && [0, 1, 2].some((k) => cell(W, cx, cy + k) === 'E'); } // (standing on a brother's head in the doorway counts)
  if (!W.done && W.bros.every((b) => b.exit && b.ground)) { W.done = true; W.events.push({ type: 'done' }); }
}
function inFan(W, b) {
  const tx = Math.floor((b.x + b.w / 2) / TS);
  for (let ty = Math.floor((b.y + b.h - 1) / TS); ty < W.h && ty <= Math.floor((b.y + b.h) / TS) + 9; ty++) { const c = cell(W, tx, ty); if (c === 'F') return true; if (solid(W, b, tx, ty) || c === '-') return false; }
  return false;
}
// X: what each brother does with their own gift
function act(W, b) {
  const d = b.d, ahead = b.face > 0 ? Math.floor((b.x + b.w + 3) / TS) : Math.floor((b.x - 3) / TS);
  if (d.can === 'panel') { const p = W.triggers.find((tr) => PANELS.includes(tr.c) && overlap(b, { x: tr.x * TS, y: tr.y * TS, w: TS, h: TS })); if (p) { const D = p.c.toUpperCase(); W.on[D] = !W.on[D]; W.events.push({ type: 'panel', ch: D, on: W.on[D] }); update(W, 0); return; } }
  if (d.can === 'strong') { const rows = [Math.floor((b.y + 1) / TS), Math.floor((b.y + b.h - 1) / TS)]; for (const ty of rows) if (cell(W, ahead, ty) === 'C') { smash(W, ahead, ty); W.events.push({ type: 'smash', x: ahead * TS + 8, y: ty * TS + 8 }); return; } }
  if (d.can === 'build') { if (!b.ground) return; if (W.planks <= 0) { W.events.push({ type: 'noplank' }); return; } const ty = Math.round((b.y + b.h) / TS), c = cell(W, ahead, ty); if (c === '.' || c === '~' || c === '^') { W.t[ty][ahead] = '-'; W.planks--; W.events.push({ type: 'build', x: ahead * TS + 8, y: ty * TS }); } return; }
  W.events.push({ type: 'nothing', id: b.id });
}
function smash(W, tx, ty) { if (cell(W, tx, ty) !== 'C') return; W.t[ty][tx] = '.'; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) smash(W, tx + dx, ty + dy); }
