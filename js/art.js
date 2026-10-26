// Cute pixel art, drawn square by square in code: the ten brothers (big heads, little bodies, each with his own hair,
// shirt and the thing he is known for — Josh's glasses, Jasper's headband and running shoes, Hank's muscles, Bobby's
// springs, Tiny's cap, Cliff's goggles, Finn's swim goggles, Tank's iron helmet, Max's hard hat, Leo's umbrella), the
// squares of every kind of country, doors and plates in the colour of their letter, crates, stars and the sky behind.
import { rng, hash } from './util.js';
import { grid, OUT, dk, lt, mixC } from './px.js';
import { BROTHERS } from './data/brothers.js';

const CACHE = new Map();
const keep = (key, f) => { if (!CACHE.has(key)) CACHE.set(key, f()); return CACHE.get(key); };
const SKIN = '#f8c8a0', WHITE = '#ffffff', OUTL = '#2a1a2a';
// the colour of each switch and the doors it works
export const GROUP = { A: '#e8504a', B: '#4a8ae8', D: '#4ac860', G: '#f09030', J: '#a860e0', Y: '#f0d040', Z: '#f070b0', W: '#8a8a9a', Q: '#30c8d8', R: '#d850c8', S: '#90d840', T: '#f0b020' };

// ---------------------------------------------------------------- the brothers (16 x 20), facing right
// pose: stand, walk, jump, fall, climb, swim, glide, push, hurt
export function broSprite(id, pose = 'stand', frame = 0, face = 1) {
  return keep(`b${id}${pose}${frame}${face}`, () => {
    const d = BROTHERS[id], small = id === 'tiny', G = grid(16, 20), f = frame % 2;
    const shirt = d.shirt, hair = d.hair, pants = id === 'hank' ? '#3a3a5a' : dk(shirt, 0.45);
    const oy = small ? 6 : 0, sc = small ? 0.78 : 1; // Tiny is drawn smaller
    const hx = 8, hy = 6 + oy + (pose === 'stand' && f ? 1 : 0), hr = 5.4 * sc;
    // legs and feet
    const legY = small ? 16 : 15;
    if (pose === 'swim') { G.rect(3, 15, 3, 2, pants); G.rect(11, 14 + f, 3, 2, pants); }
    else if (pose === 'jump' || pose === 'glide') { G.rect(5, legY, 2, 3, pants); G.rect(9, legY - 1, 2, 3, pants); G.rect(4, legY + 2, 3, 1, '#4a3a3a'); G.rect(9, legY + 1, 3, 1, '#4a3a3a'); }
    else if (pose === 'walk' || pose === 'push') { const s = f ? 1 : -1; G.rect(6 + s, legY, 2, 4, pants); G.rect(9 - s, legY, 2, 4, dk(pants, 0.15)); G.rect(5 + s, legY + 3, 3, 2, id === 'jasper' ? '#e8e8e8' : '#4a3a3a'); G.rect(9 - s, legY + 3, 3, 2, id === 'jasper' ? '#e8e8e8' : '#4a3a3a'); }
    else { G.rect(5, legY, 2, 4, pants); G.rect(9, legY, 2, 4, pants); G.rect(4, legY + 3, 3, 2, id === 'jasper' ? '#e8e8e8' : '#4a3a3a'); G.rect(9, legY + 3, 3, 2, id === 'jasper' ? '#e8e8e8' : '#4a3a3a'); }
    if (id === 'jasper' && pose !== 'swim') { G.set(4, legY + 4, '#e83a3a'); G.set(10, legY + 4, '#e83a3a'); }
    if (id === 'bobby' && pose !== 'swim') for (const x of [5, 10]) { G.set(x, legY + 5 > 19 ? 19 : legY + 5, '#c8c8d0'); }
    // the body
    const bw = id === 'hank' || id === 'tank' ? 4.6 : 3.8;
    G.shape((x, y) => y > 10.5 + oy * 0.8 && y < legY + 0.5 && Math.abs(x - 8) < bw * sc + (y - 11) * 0.05, (x, y) => (id === 'max' && y > legY - 2 ? '#8a5a2a' : shirt));
    if (id === 'josh') G.rect(7, 12 + oy, 2, 2, WHITE); // a collar
    if (id === 'hank') { G.ell(3.5, 13, 2, 2.2, SKIN); G.ell(12.5, 13, 2, 2.2, SKIN); } // big arms
    if (id === 'max') { G.set(10, legY - 1, '#c8c8d0'); G.set(11, legY - 2, '#c8c8d0'); } // a hammer in the belt
    if (id === 'leo' && pose !== 'glide') G.poly([[4, 11 + oy], [2, 17 + oy], [6, 16 + oy]], '#e84a3a'); // a little cape
    // arms
    const ar = pose === 'climb' ? [[12, 8 + f], [3, 9 - f]] : pose === 'push' ? [[13, 12], [12, 13]] : pose === 'jump' ? [[13, 9], [3, 10]] : pose === 'swim' ? [[14, 11 + f], [2, 11 - f]] : [[12, 13 + (pose === 'walk' ? f : 0)], [4, 13 - (pose === 'walk' ? f : 0)]];
    if (id !== 'hank') for (const [x, y] of ar) G.rect(x - 1, y + oy * 0.7, 2, 2, SKIN);
    // the head
    G.ell(hx, hy, hr, hr * 0.95, SKIN);
    // hair, hats and the rest
    const top = (low, col) => G.shape((x, y) => Math.hypot((x - hx) / (hr + 0.5), (y - hy) / (hr * 0.95 + 0.5)) <= 1 && y < low, col);
    switch (id) {
      case 'josh': top(hy - 1.5, hair); G.rect(4, hy - 1, 2, 2, hair); break;
      case 'jasper': top(hy - 2, hair); for (const x of [5, 8, 11]) G.set(x, hy - hr - 0.5, hair); G.rect(3, hy - 2, 11, 1, '#e83a3a'); G.set(2, hy - 1, '#e83a3a'); G.set(1, hy, '#e83a3a'); break;
      case 'hank': top(hy - 2.5, hair); break;
      case 'bobby': top(hy - 1, hair); G.ell(hx + 2, hy - hr, 1.4, 1.4, hair); break;
      case 'tiny': top(hy - 0.5, '#e84a6a'); G.rect(hx, hy - 1, 5, 1, '#e84a6a'); G.set(hx, hy - hr - 0.4, '#ffffff'); break; // a cap
      case 'cliff': top(hy - 1.5, hair); G.rect(4, hy - 2, 9, 1, '#2a8a5a'); G.set(9, hy - 2, '#a8f0d0'); G.set(11, hy - 2, '#a8f0d0'); break;
      case 'finn': top(hy - 1.5, hair); G.rect(4, hy - 3, 9, 1, '#2a6ab8'); G.set(9, hy - 3, '#c8f0ff'); G.set(12, hy - 3, '#c8f0ff'); break;
      case 'tank': top(hy - 0.5, '#9a9aa8'); G.rect(3, hy - 1, 11, 1, '#7a7a88'); G.set(6, hy - 3, '#d8d8e0'); break; // an iron helmet
      case 'max': top(hy - 1, '#f0c030'); G.rect(3, hy - 1, 11, 1, '#d8a020'); G.set(hx, hy - hr - 0.4, '#f8e080'); break; // a hard hat
      case 'leo': top(hy - 1.5, hair); G.set(4, hy - 2, hair); G.set(12, hy - 4, hair); G.set(13, hy - 3, hair); break;
    }
    // the face: two big eyes, rosy cheeks, a smile
    const ey = hy + 0.5, blink = pose === 'stand' && frame === 3;
    for (const ex of [hx + 0.5, hx + 3.5]) { if (blink) G.set(ex, ey, OUTL); else { G.rect(ex, ey - 1, 1, 2, OUTL); G.set(ex, ey - 1, OUTL); } }
    if (!blink && !small) { G.set(hx + 0.5, ey - 1, '#ffffff'); G.set(hx + 3.5, ey - 1, '#ffffff'); }
    if (id === 'josh') { G.rect(hx, ey - 1, 2, 2, null); for (const ex of [hx - 0.5, hx + 2.5]) { G.set(ex, ey - 2, OUTL); G.set(ex + 2, ey - 2, OUTL); G.set(ex, ey + 1, OUTL); G.set(ex + 2, ey + 1, OUTL); } } // glasses
    G.set(hx - 1, ey + 2, '#f8a0a0'); G.set(hx + 5, ey + 2, '#f8a0a0');
    if (pose === 'hurt') { G.set(hx + 1, ey + 3, OUTL); G.set(hx + 2, ey + 3, OUTL); G.set(hx + 3, ey + 3, OUTL); } else { G.set(hx + 1.5, ey + 3, '#c84a4a'); G.set(hx + 2.5, ey + 3, '#c84a4a'); }
    // Leo's umbrella
    if (id === 'leo' && pose === 'glide') { G.rect(8, 0, 1, hy - hr + 1, '#6a4a2a'); for (let x = 2; x <= 14; x++) { const top2 = 1 + Math.round(Math.abs(x - 8) * 0.35); for (let y = top2 - 1; y <= 3; y++) if (y >= 0) G.set(x, y, (x % 4 < 2) ? '#e84a3a' : '#ffffff'); } }
    // outline everything that is drawn
    const out = grid(16, 20);
    for (let y = 0; y < 20; y++) for (let x = 0; x < 16; x++) { const v = G.get(x, y); if (v) out.set(x, y, v); else if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => G.get(x + dx, y + dy))) out.set(x, y, OUTL); }
    const c = out.canvas();
    if (face < 0) { const m = document.createElement('canvas'); m.width = 16; m.height = 20; const g = m.getContext('2d'); g.translate(16, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); return m; }
    return c;
  });
}
// a brother's head for the bar along the top (16 x 14)
export function broHead(id) {
  return keep('head' + id, () => { const s = broSprite(id, 'stand', 0, 1), c = document.createElement('canvas'); c.width = 16; c.height = 14; c.getContext('2d').drawImage(s, 0, id === 'tiny' ? -4 : 0); return c; });
}

// ---------------------------------------------------------------- the countries
export const THEMES = {
  meadow: { sky: ['#8ad0f8', '#e0f4ff'], hill: ['#8ad070', '#6ab858'], dirt: '#c88a4a', top: '#5ac84a', rock: '#a87848', bg: 'hills' },
  cave: { sky: ['#2a2a48', '#4a3a5a'], hill: ['#3a3a5a', '#4a4466'], dirt: '#7a6a8a', top: '#9a8ab0', rock: '#5a4a6a', bg: 'cave' },
  castle: { sky: ['#9ab8e8', '#f0e0f0'], hill: ['#a8a0c8', '#8888b0'], dirt: '#a8a0b8', top: '#c8c0d8', rock: '#8a8098', bg: 'towers', brick: true },
  lake: { sky: ['#7ac8f0', '#d8f8ff'], hill: ['#70b8a8', '#5aa090'], dirt: '#c89a60', top: '#6ad06a', rock: '#a88a5a', bg: 'hills' },
  sky: { sky: ['#a8d8ff', '#fff0f8'], hill: ['#ffffff', '#e8f0ff'], dirt: '#e8d8b0', top: '#f8f0d0', rock: '#d8c8a0', bg: 'clouds' },
  sunset: { sky: ['#f8a070', '#ffe0b0'], hill: ['#c87890', '#a86080'], dirt: '#c88a4a', top: '#e8b048', rock: '#a87848', bg: 'hills' },
};
export function tile(theme, c, x, y, around, t) {
  const T = THEMES[theme] || THEMES.meadow, v = (x * 7 + y * 13) & 3;
  if (c === '#' || c === 'X') return keep(`t${theme}${c}${around}${v}`, () => {
    const G = grid(16, 16), R = rng(hash(`${x},${y}`) % 997 + v), d = c === 'X' || T.brick ? mixC(T.dirt, '#ffffff', 0.05) : T.dirt;
    G.rect(0, 0, 16, 16, d);
    if (c === 'X' || T.brick) { for (let yy = 0; yy < 16; yy += 4) { G.rect(0, yy + 3, 16, 1, dk(d, 0.2)); for (let xx = (yy / 4) % 2 ? 0 : 4; xx < 16; xx += 8) G.rect(xx, yy, 1, 3, dk(d, 0.2)); } G.rect(0, 0, 16, 1, lt(d, 0.2)); }
    else { for (let i = 0; i < 5; i++) { const px = R.int(1, 13), py = R.int(4, 13); G.rect(px, py, 2, 1, dk(d, 0.15)); G.set(px, py - 1, lt(d, 0.15)); } }
    if (around[0] === '0') { G.rect(0, 0, 16, 4, T.top); for (let xx = 0; xx < 16; xx++) G.set(xx, 4 + ((xx + v) % 3 === 0 ? 1 : 0), T.top); G.rect(0, 0, 16, 1, lt(T.top, 0.3)); for (const xx of [2 + v, 9 + v]) G.set(xx, 3, dk(T.top, 0.2)); }
    if (around[1] === '0') G.rect(15, 0, 1, 16, dk(d, 0.3)); if (around[3] === '0') G.rect(0, 0, 1, 16, lt(d, 0.12));
    return G.canvas();
  });
  if (c === '-') return keep('plank' + around[0], () => { const G = grid(16, 16); G.rect(0, 0, 16, 4, '#c8884a'); G.rect(0, 3, 16, 1, '#8a5a2a'); for (const xx of [5, 11]) G.set(xx, 1, '#8a5a2a'); G.rect(1, 4, 2, 3, '#8a5a2a'); G.rect(13, 4, 2, 3, '#8a5a2a'); return G.canvas(); });
  if (c === 'C') return keep('crack' + theme, () => { const G = grid(16, 16), d = mixC(T.rock, '#ffffff', 0.15); G.rect(0, 0, 16, 16, d); G.rect(0, 0, 16, 1, lt(d, 0.3)); G.rect(0, 15, 16, 1, dk(d, 0.3)); for (const [a, b] of [[[3, 0], [7, 6]], [[7, 6], [5, 10]], [[7, 6], [12, 9]], [[12, 9], [10, 16]]]) G.line(a[0], a[1], b[0], b[1], dk(d, 0.5)); return G.canvas(); });
  if (c === 'n') return keep('grate', () => { const G = grid(16, 16); for (let xx = 1; xx < 16; xx += 4) { G.rect(xx, 0, 2, 16, '#7a7a8a'); G.rect(xx, 0, 1, 16, '#a8a8b8'); } G.rect(0, 0, 16, 2, '#5a5a6a'); G.rect(0, 14, 16, 2, '#5a5a6a'); return G.canvas(); });
  if (c === '^') return keep('spike', () => { const G = grid(16, 16); for (let i = 0; i < 4; i++) G.poly([[i * 4, 16], [i * 4 + 2, 7], [i * 4 + 4, 16]], (px) => (px < i * 4 + 2 ? '#e8e8f0' : '#a8a8b8'), { out: OUTL }); return G.canvas(); });
  if (c === '~') { const fr = Math.floor(t * 3) % 2; return keep(`water${around[0]}${fr}`, () => { const G = grid(16, 16); G.rect(0, 0, 16, 16, '#4aa8e8'); if (around[0] !== '~') { G.rect(0, 0, 16, 3, '#8ad8ff'); for (let xx = 0; xx < 16; xx++) if ((xx + fr * 2) % 6 < 2) G.set(xx, 0, '#ffffff'); } for (let i = 0; i < 2; i++) G.rect((i * 7 + fr * 3) % 13, 7 + i * 4, 3, 1, '#6ac0f0'); return G.canvas(); }); }
  if (c === 'F') { const fr = Math.floor(t * 12) % 2; return keep('fan' + fr, () => { const G = grid(16, 16); G.rect(0, 2, 16, 14, '#8a8a9a'); G.rect(0, 2, 16, 2, '#c8c8d8'); G.ell(8, 8, 5, 3, '#3a3a48'); if (fr) G.rect(3, 7, 10, 2, '#d8d8e0'); else G.rect(7, 5, 2, 6, '#d8d8e0'); G.set(8, 8, '#f0d040'); return G.canvas(); }); }
  return null;
}
// switches, doors and bridges in the colour of their letter
export function door(ch, open, isBridge) {
  return keep(`d${ch}${open}${isBridge}`, () => {
    const G = grid(16, 16), col = GROUP[ch] || '#888';
    if (isBridge) { if (open) { G.rect(0, 0, 16, 5, col); G.rect(0, 4, 16, 1, dk(col, 0.35)); for (const xx of [4, 12]) G.set(xx, 2, lt(col, 0.4)); } else for (let xx = 0; xx < 16; xx += 4) G.rect(xx, 1, 2, 1, mixC(col, '#ffffff', 0.4)); return G.canvas(); }
    if (open) { G.rect(1, 0, 2, 16, mixC(col, '#ffffff', 0.55)); G.rect(13, 0, 2, 16, mixC(col, '#ffffff', 0.55)); return G.canvas(); }
    G.rect(0, 0, 16, 16, col); G.rect(0, 0, 16, 1, lt(col, 0.35)); G.rect(0, 15, 16, 1, dk(col, 0.35)); for (const xx of [4, 8, 12]) G.rect(xx, 1, 1, 14, dk(col, 0.25)); G.ell(8, 8, 2.4, 2.4, lt(col, 0.5)); G.set(8, 8, dk(col, 0.4));
    return G.canvas();
  });
}
export function trigger(c, held, on) {
  return keep(`tr${c}${held}${on}`, () => {
    const G = grid(16, 16), up = c.toUpperCase(), col = GROUP[up] || '#888';
    if ('qrs'.includes(c)) { // a control panel on a post
      G.rect(6, 8, 4, 8, '#6a6a7a'); G.shape((x, y) => x > 1 && x < 15 && y > 0.5 && y < 9, '#4a4a5a', { out: OUTL }); G.rect(3, 2, 10, 5, on ? col : dk(col, 0.6)); for (let i = 0; i < 3; i++) G.set(4 + i * 3, 4, on ? '#ffffff' : lt(col, 0.2)); return G.canvas(); }
    if (c === 't') { G.rect(2, 13, 12, 3, '#6a6a7a'); G.ell(8, held ? 13 : 11.5, 4.5, 2.2, col, { out: OUTL }); G.set(8, held ? 12 : 10, '#ffffff'); return G.canvas(); }
    G.rect(1, 14, 14, 2, dk(col, 0.4)); G.rect(2, held ? 13 : 11, 12, held ? 1 : 3, c === 'w' ? '#8a8a9a' : col); if (c === 'w') { G.set(6, 12, '#d8d8e0'); G.set(9, 12, '#d8d8e0'); }
    return G.canvas();
  });
}
export function crate() { return keep('crate', () => { const G = grid(16, 16); G.shape((x, y) => true, (x, y) => (x === 0 || y === 0 || x === 15 || y === 15 ? '#8a5a2a' : '#d89a58'), { out: false, shade: false }); G.line(1, 1, 14, 14, '#a8703a'); G.line(14, 1, 1, 14, '#a8703a'); G.rect(0, 0, 16, 1, '#5a3a1a'); G.rect(0, 15, 16, 1, '#5a3a1a'); G.rect(0, 0, 1, 16, '#5a3a1a'); G.rect(15, 0, 1, 16, '#5a3a1a'); return G.canvas(); }); }
export function star(t) { const fr = Math.floor(t * 8) % 4; return keep('star' + fr, () => { const G = grid(10, 10), w = [4, 3, 1.5, 3][fr]; G.poly([[5, 0], [5 + w * 0.35, 3.5], [5 + w, 4], [5 + w * 0.45, 6], [5 + w * 0.7, 9.5], [5, 7.5], [5 - w * 0.7, 9.5], [5 - w * 0.45, 6], [5 - w, 4], [5 - w * 0.35, 3.5]], (x, y) => (y < 4 ? '#fff4a0' : '#f8c830'), { out: '#a87818' }); return G.canvas(); }); }
// the way out: a little house with a flag
export function goalFlag(t) { const fr = Math.floor(t * 4) % 2; return keep('goal' + fr, () => { const G = grid(16, 32); G.rect(2, 2, 1, 30, '#6a4a2a'); G.poly([[3, 2], [14, 5 + fr], [3, 9]], '#f04a6a'); G.set(6, 5, '#ffffff'); G.set(7, 5, '#ffffff'); return G.canvas(); }); }

// ---------------------------------------------------------------- the sky behind (drawn once per country, larger than the screen)
export function backdrop(theme, w, h) {
  return keep(`bg${theme}${w}x${h}`, () => {
    const T = THEMES[theme] || THEMES.meadow, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), R = rng(hash(theme));
    for (let y = 0; y < h; y++) { g.fillStyle = mixC(T.sky[0], T.sky[1], y / h); g.fillRect(0, y, w, 1); }
    if (T.bg === 'cave') { for (let i = 0; i < 40; i++) { g.fillStyle = mixC(T.hill[0], '#000000', R() * 0.3); const x = R() * w, s = 8 + R() * 30; g.beginPath(); g.moveTo(x - s, 0); g.lineTo(x, s * 1.6); g.lineTo(x + s, 0); g.fill(); } for (let i = 0; i < 25; i++) { g.fillStyle = ['#a8e8ff', '#e8a8ff', '#ffe8a8'][i % 3]; g.fillRect(Math.floor(R() * w), Math.floor(R() * h), 1, 1); } return c; }
    // clouds
    for (let i = 0; i < Math.ceil(w / 60); i++) { const x = R() * w, y = 10 + R() * h * 0.35, s = 6 + R() * 8; g.fillStyle = 'rgba(255,255,255,0.85)'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(Math.round(x + k * s * 0.9), Math.round(y - (k % 2) * s * 0.5), s, 0, 7); g.fill(); } }
    if (T.bg === 'clouds') return c;
    // hills or towers, two rows
    for (const [row, col] of [[0, T.hill[0]], [1, T.hill[1]]]) { g.fillStyle = col; const base = h * (0.62 + row * 0.12); for (let x = 0; x < w; x += 2) { const y = base - (Math.sin(x / (40 + row * 20) + row * 3) * 0.5 + 0.5) * (28 - row * 8) - (T.bg === 'towers' && Math.floor(x / 30) % 3 === 0 ? 26 : 0); g.fillRect(x, Math.round(y), 2, h - Math.round(y)); } }
    if (T.bg === 'towers') for (let x = 0; x < w; x += 90) { g.fillStyle = '#e898a8'; g.beginPath(); g.moveTo(x + 6, h * 0.62 - 26); g.lineTo(x + 15, h * 0.62 - 40); g.lineTo(x + 24, h * 0.62 - 26); g.fill(); }
    return c;
  });
}
