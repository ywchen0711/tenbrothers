// The game: the title, choosing a level, playing it (switching between brothers), the little windows over the
// picture, the camera, sounds and sparkles, and remembering which levels are done.
import { load, update, TS, cell } from './engine.js';
import { LEVELS } from './data/levels.js';
import { BROTHERS } from './data/brothers.js';
import { broSprite, broHead, tile, door, trigger, crate, star, goalFlag, backdrop, THEMES, GROUP } from './art.js';
import { SFX, music, setSound, soundOn, unlock } from './sound.js';
import { tr, isEn, getLang, setLang, bTitle, bSkill, bDesc, bWho, bRank, lName, lIntro, lHint } from './i18n.js';

const LW = 320, LH = 180, KEY = 'tenbrothers.v1', GAME = 'tenbrothers', DT = 1 / 120;
const cv = document.getElementById('cv'), g = cv.getContext('2d'), ui = document.getElementById('ui');
let K = 3, scene = 'title', W = null, LI = 0, cam = { x: 0, y: 0 }, acc = 0, last = performance.now(), parts = [], toastT = 0, toastMsg = '', cloud = null, paused = false;
let save = { unlocked: 1, stars: {}, done: {} };
try { save = { ...save, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) {}
const store = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {} if (cloud) cloud.touch(GAME, KEY); };
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// ---------------------------------------------------------------- the screen: a 320 x 180 picture, drawn crisp at a whole-number scale
function fit() {
  const sw = innerWidth, sh = innerHeight - (matchMedia('(pointer: coarse)').matches ? 0 : 0), s = Math.min(sw / LW, sh / LH);
  K = Math.max(2, Math.ceil(s * (devicePixelRatio || 1))); cv.width = LW * K; cv.height = LH * K;
  cv.style.width = LW * s + 'px'; cv.style.height = LH * s + 'px'; document.documentElement.style.setProperty('--s', s);
}
addEventListener('resize', fit); fit();

// ---------------------------------------------------------------- keys and buttons
const held = new Set(); let jumpP = false, actP = false;
const KEYS = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', Space: 'jump', KeyZ: 'jump', KeyK: 'jump', KeyX: 'act', KeyJ: 'act' };
addEventListener('keydown', (e) => {
  unlock(); const k = KEYS[e.code];
  if (k) { if (k === 'jump' && !held.has('jump')) jumpP = true; if (k === 'up' && !held.has('up') && scene === 'play') jumpP = jumpP || false; if (k === 'act' && !held.has('act')) actP = true; held.add(k); e.preventDefault(); }
  if (scene === 'play' && !paused) {
    if (e.code === 'Tab' || e.code === 'KeyE') { e.preventDefault(); pick(W.active + (e.shiftKey ? -1 : 1)); }
    if (e.code === 'KeyQ') pick(W.active - 1);
    if (/^Digit\d$/.test(e.code)) { const n = (+e.code.slice(5) + 9) % 10; if (n < W.bros.length) pick(n); }
    if (e.code === 'KeyR') restart();
    if (e.code === 'KeyH') hint();
    if (e.code === 'Escape' || e.code === 'KeyP') pauseMenu();
  }
  if (e.code === 'Enter' || e.code === 'NumpadEnter') { const b = ui.querySelector('.go'); if (b) { e.preventDefault(); b.click(); } }
});
addEventListener('keyup', (e) => { const k = KEYS[e.code]; if (k) held.delete(k); });
addEventListener('blur', () => held.clear());
// the buttons on a touch screen
for (const b of document.querySelectorAll('#pad [data-k]')) {
  const k = b.dataset.k, down = (e) => { e.preventDefault(); unlock(); if (k === 'swap') { if (scene === 'play') pick(W.active + 1); return; } if (k === 'menu') { if (scene === 'play') pauseMenu(); return; } if (k === 'jump') jumpP = true; if (k === 'act') actP = true; held.add(k); b.classList.add('on'); }, up = (e) => { e.preventDefault(); held.delete(k); b.classList.remove('on'); };
  b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
}
cv.addEventListener('pointerdown', (e) => { unlock(); if (scene !== 'play' || paused) return; const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * LW, y = (e.clientY - r.top) / r.height * LH; if (y < 20) { const i = Math.floor((x - 4) / 20); if (i >= 0 && i < W.bros.length) pick(i); } });

// ---------------------------------------------------------------- playing a level
function startLevel(i) {
  LI = i; W = load(LEVELS[i]); paused = false; parts = []; scene = 'play';
  const b = W.bros[0]; cam.x = b.x - LW / 2; cam.y = b.y - LH / 2; clampCam(1);
  music(LEVELS[i].theme); clearUI(); introCard();
}
function restart() { const keepI = LI; W = load(LEVELS[keepI]); parts = []; toast(tr('重新開始！', 'Starting again!')); }
function pick(i) { if (!W) return; const n = W.bros.length; W.active = ((i % n) + n) % n; SFX.switch(); const b = W.bros[W.active]; toast(`${bWho(b.d)}${tr('：', ': ')}${bSkill(b.d)}`, 1.6); }
function hint() { const L = LEVELS[LI]; toast(`${L.bros.includes('josh') ? tr('Josh 想了想：', 'Josh thinks: ') : tr('想一想：', 'Think: ')}${lHint(L)}`, 9); SFX.panel(); }
const WHY = { water: (b) => (b.id === 'finn' ? '' : tr(`噗通！${b.d.name} 不會游泳，被沖回起點了。`, `Splash! ${b.d.name} can't swim — washed back to the start.`)), spike: (b) => tr(`哎喲！${b.d.name} 被尖刺扎到了——只有 Tank 不怕尖刺。`, `Ouch! ${b.d.name} hit the spikes — only Tank can walk on them.`), fall: (b) => tr(`${b.d.name} 掉下去了！`, `${b.d.name} fell!`) };
function events() {
  for (const ev of W.events) {
    const b = ev.id ? W.bros.find((q) => q.id === ev.id) : null;
    if (ev.type === 'jump') (b?.d.can === 'hop' ? SFX.hop : SFX.jump)();
    if (ev.type === 'die') { (ev.why === 'water' ? SFX.splash : SFX.ouch)(); toast(WHY[ev.why]?.(b) || '', 2.6); burst(ev.x, ev.y, ev.why === 'water' ? '#8ad8ff' : '#ffffff', 12); }
    if (ev.type === 'back') SFX.back();
    if (ev.type === 'open') SFX.open(); if (ev.type === 'shut') SFX.shut();
    if (ev.type === 'panel') SFX.panel(); if (ev.type === 'tick') SFX.tick();
    if (ev.type === 'smash') { SFX.smash(); burst(ev.x, ev.y, '#a88a6a', 22); }
    if (ev.type === 'build') { SFX.build(); burst(ev.x, ev.y, '#d89a58', 8); }
    if (ev.type === 'noplank') toast(tr('木板用完了！', 'No planks left!'), 1.6);
    if (ev.type === 'nothing') { SFX.nothing(); const w = W.bros.find((q) => q.id === ev.id); toast(tr(`${w.d.name} 在這裡用不上「${w.d.skill}」。`, `${w.d.name} can't use “${bSkill(w.d)}” here.`), 1.6); }
    if (ev.type === 'star') { SFX.star(); burst(ev.x + 4, ev.y + 4, '#fff4a0', 10); }
    if (ev.type === 'done') setTimeout(cleared, 600);
  }
}
function cleared() {
  if (scene !== 'play') return; SFX.done(); const L = LEVELS[LI], got = W.got;
  save.done[L.id] = true; save.stars[L.id] = Math.max(save.stars[L.id] || 0, got); save.unlocked = Math.max(save.unlocked, Math.min(LEVELS.length, LI + 2)); store();
  scene = 'clear'; clearUI();
  const last = LI === LEVELS.length - 1, box = el('div', 'card clear', `<h2>${last ? tr('十兄弟大會師！', 'All Ten Together!') : tr('過關！', 'Level clear!')}</h2><p class="stars">${'★'.repeat(got)}${'☆'.repeat(W.stars.length - got)}</p><p>${last ? tr('十個兄弟，十種本領，一個也不能少。恭喜你帶著大家走完全程！', 'Ten brothers, ten gifts, and not one could be left out. You brought them all the way — well done!') : tr(`「${esc(L.name)}」完成了。`, `“${esc(lName(L))}” is done.`)}</p>`);
  const row = el('div', 'btns');
  if (!last) row.append(btn(tr('下一關', 'Next level'), () => startLevel(LI + 1), true)); row.append(btn(tr('再玩一次', 'Play again'), () => startLevel(LI)), btn(tr('選擇關卡', 'Levels'), levelSelect, last));
  box.append(row); ui.append(box);
}
// the camera follows whoever you are playing
function clampCam(snap) {
  const b = W.bros[W.active], tx = b.x + b.w / 2 - LW / 2 + b.face * 24, ty = b.y - LH / 2 + 10, mw = W.w * TS, mh = W.h * TS;
  cam.x += (tx - cam.x) * (snap ? 1 : 0.08); cam.y += (ty - cam.y) * (snap ? 1 : 0.08);
  cam.x = mw <= LW ? (mw - LW) / 2 : Math.max(0, Math.min(mw - LW, cam.x)); cam.y = mh <= LH - 18 ? (mh - LH) / 2 - 9 : Math.max(-18, Math.min(mh - LH, cam.y));
}

// ---------------------------------------------------------------- sparkles
function burst(x, y, col, n) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, s = 30 + Math.random() * 70; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 0.5 + Math.random() * 0.4, col }); } }
function toast(msg, secs = 2.4) { toastMsg = msg; toastT = msg ? secs : 0; }

// ---------------------------------------------------------------- drawing
function draw(t) {
  g.setTransform(K, 0, 0, K, 0, 0); g.imageSmoothingEnabled = false;
  if (!W) { drawTitle(t); return; }
  const L = LEVELS[LI], T = THEMES[L.theme] || THEMES.meadow, cx = Math.round(cam.x), cy = Math.round(cam.y);
  const bg = backdrop(L.theme, 480, LH), off = -((cx * 0.3) % 480 + 480) % 480; g.drawImage(bg, off, 0); g.drawImage(bg, off + 480, 0);
  const x0 = Math.floor(cx / TS) - 1, y0 = Math.floor(cy / TS) - 1, x1 = x0 + LW / TS + 2, y1 = y0 + LH / TS + 2;
  const solidG = (x, y) => { const c = cell(W, x, y); return c === '#' || c === 'X'; };
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (x < 0 || y < 0 || x >= W.w || y >= W.h) continue; const c = W.t[y][x]; if (c === '.') continue;
    const sx = x * TS - cx, sy = y * TS - cy;
    if (c === 'E') { g.fillStyle = `rgba(255,240,160,${0.18 + Math.sin(t * 3) * 0.06})`; g.fillRect(sx, sy, TS, TS); if (cell(W, x - 1, y) !== 'E' && cell(W, x, y - 1) !== 'E') g.drawImage(goalFlag(t), sx, sy - 16 + (cell(W, x, y + 1) === 'E' ? 16 : 0)); continue; }
    if (/[ABDGJYZWQRST]/.test(c)) { g.drawImage(door(c, !!W.open[c], W.bridges.includes(c)), sx, sy); continue; }
    if (/[abdgjyzwqrst]/.test(c)) { const tr = W.triggers.find((q) => q.x === x && q.y === y); g.drawImage(trigger(c, !!tr?.held, !!W.on[c.toUpperCase()]), sx, sy); if (c === 't' && W.timer > 0) { g.fillStyle = GROUP.T; g.fillRect(sx, sy - 4, Math.round(16 * W.timer / 3.2), 2); } continue; }
    const around = [solidG(x, y - 1), solidG(x + 1, y), solidG(x, y + 1), solidG(x - 1, y)].map((v) => (v ? '1' : '0')).join('');
    const im = tile(L.theme, c, x, y, c === '~' ? cell(W, x, y - 1) : around, t); if (im) g.drawImage(im, sx, sy);
    if (c === 'F') { g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 1; for (let i = 0; i < 3; i++) { const yy = sy - ((t * 60 + i * 30) % 100), xx = sx + 3 + i * 5; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx, yy - 6); g.stroke(); } }
  }
  for (const s of W.stars) if (!s.got) g.drawImage(star(t), Math.round(s.x - 1 - cx), Math.round(s.y - 1 - cy + Math.sin(t * 3 + s.x) * 1.5));
  for (const c of W.crates) g.drawImage(crate(), Math.round(c.x - cx), Math.round(c.y - cy));
  // the brothers: the one you play last, so he is in front
  const order = W.bros.map((b, i) => i).sort((a, b) => (a === W.active) - (b === W.active));
  for (const i of order) {
    const b = W.bros[i]; if (b.dead && Math.floor(t * 12) % 2) continue;
    const pose = b.dead ? 'hurt' : b.swim ? 'swim' : b.glide ? 'glide' : b.climb ? 'climb' : !b.ground ? (b.vy < 0 ? 'jump' : 'jump') : b.push > 0 ? 'push' : Math.abs(b.vx) > 8 ? 'walk' : 'stand';
    const fr = pose === 'walk' || pose === 'push' ? Math.floor(b.walk / 6) % 2 : pose === 'climb' || pose === 'swim' ? Math.floor(t * 6) % 2 : pose === 'stand' ? (Math.floor(t * 1.3 + i) % 4 === 3 ? 3 : Math.floor(t * 2 + i) % 2) : 0;
    const img = broSprite(b.id, pose, fr, b.face), sx = Math.round(b.x + b.w / 2 - 8 - cx), sy = Math.round(b.y + b.h - 20 - cy);
    g.drawImage(img, sx, sy);
    if (b.exit) { g.fillStyle = '#fff4a0'; g.fillRect(sx + 7 + Math.round(Math.sin(t * 5 + i) * 6), sy - 3, 1, 1); }
    if (i === W.active) { const by = sy - 7 + Math.round(Math.sin(t * 6) * 1.5); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(sx + 5, by); g.lineTo(sx + 11, by); g.lineTo(sx + 8, by + 4); g.fill(); g.strokeStyle = '#2a1a2a'; g.lineWidth = 0.6; g.stroke(); }
  }
  for (const p of parts) { g.fillStyle = p.col; g.fillRect(Math.round(p.x - cx), Math.round(p.y - cy), 2, 2); }
  hud(t);
}
function hud(t) {
  const L = LEVELS[LI];
  g.fillStyle = 'rgba(30,20,50,0.55)'; g.fillRect(0, 0, LW, 19);
  W.bros.forEach((b, i) => {
    const x = 4 + i * 20, on = i === W.active;
    g.fillStyle = on ? '#fff4a0' : 'rgba(255,255,255,0.2)'; g.fillRect(x - 1, 1, 18, 17); g.fillStyle = on ? b.d.shirt : 'rgba(0,0,0,0.25)'; g.fillRect(x, 2, 16, 15);
    g.drawImage(broHead(b.id), x, 3); if (b.exit) { g.fillStyle = '#5ae85a'; g.fillRect(x + 12, 13, 4, 4); }
    g.fillStyle = '#ffffff'; g.font = 'bold 5px sans-serif'; g.textAlign = 'left'; g.fillText(String((i + 1) % 10), x + 1, 7);
  });
  const b = W.bros[W.active];
  g.textAlign = 'right'; g.font = 'bold 7px "Noto Sans TC", sans-serif'; g.fillStyle = '#ffffff';
  g.fillText(lName(L), LW - 4, 8); g.font = '6px "Noto Sans TC", sans-serif'; g.fillStyle = '#fff4a0';
  g.fillText(`★ ${W.got}/${W.stars.length}${W.planks || L.planks ? tr(`　木板 ${W.planks}`, `   planks ${W.planks}`) : ''}`, LW - 4, 16);
  // who you are and what X does
  g.textAlign = 'left'; g.font = 'bold 7px "Noto Sans TC", sans-serif'; const label = `${bWho(b.d)}${tr('　X：', '   X: ')}${bSkill(b.d)}`, tw = g.measureText(label).width;
  g.fillStyle = 'rgba(30,20,50,0.6)'; g.fillRect(3, LH - 13, tw + 8, 11); g.fillStyle = '#ffffff'; g.fillText(label, 7, LH - 5);
  if (W.timer > 0) { g.fillStyle = 'rgba(30,20,50,0.6)'; g.fillRect(LW / 2 - 30, 22, 60, 7); g.fillStyle = GROUP.T; g.fillRect(LW / 2 - 29, 23, 58 * W.timer / 3.2, 5); }
  if (toastT > 0 && toastMsg) wrapText(toastMsg, LW / 2, LH - 30);
}
function wrapText(msg, x, y) {
  g.font = 'bold 7px "Noto Sans TC", sans-serif'; const max = 260, lines = []; let line = '';
  for (const ch of isEn() ? msg.split(/(?<= )/) : msg) { if (line && g.measureText(line + ch).width > max) { lines.push(line); line = ''; } line += ch; } lines.push(line); // English breaks between words, Chinese anywhere
  const h = lines.length * 10 + 6, top = y - h + 10; g.fillStyle = 'rgba(255,255,255,0.92)'; g.fillRect(x - max / 2 - 6, top - 8, max + 12, h); g.strokeStyle = '#2a1a2a'; g.lineWidth = 1; g.strokeRect(x - max / 2 - 6 + 0.5, top - 8 + 0.5, max + 11, h - 1);
  g.fillStyle = '#2a1a2a'; g.textAlign = 'left'; lines.forEach((l, i) => g.fillText(l, x - max / 2, top + i * 10));
}
function drawTitle(t) {
  const bg = backdrop('meadow', 480, LH), off = -((t * 8) % 480); g.drawImage(bg, off, 0); g.drawImage(bg, off + 480, 0);
  g.fillStyle = '#6aa84a'; g.fillRect(0, 150, LW, 30); g.fillStyle = '#5ac84a'; g.fillRect(0, 150, LW, 4);
  Object.keys(BROTHERS).forEach((id, i) => { const x = 22 + i * 28, hop = Math.max(0, Math.sin(t * 4 + i * 0.7)) * 6; g.drawImage(broSprite(id, hop > 1 ? 'jump' : 'stand', Math.floor(t * 2 + i) % 2, 1), x, 131 - hop); });
}

// ---------------------------------------------------------------- the little windows
const clearUI = () => { ui.innerHTML = ''; };
function btn(label, f, primary) { const b = el('button', primary ? 'go' : '', esc(label)); b.onclick = () => { SFX.ok(); f(); }; return b; }
function padLabels() { for (const [k, zh, en] of [['menu', '選單', 'Menu'], ['swap', '換人', 'Swap'], ['jump', '跳', 'Jump']]) { const b = document.querySelector(`#pad [data-k="${k}"]`); if (b) b.textContent = tr(zh, en); } document.title = tr('十兄弟 Ten Brothers', 'Ten Brothers 十兄弟'); }
function title() {
  padLabels(); W = null; scene = 'title'; music('title'); clearUI();
  const box = el('div', 'card title', `<h1>${tr('十兄弟', 'Ten Brothers')}</h1><p class="sub">${tr('Ten Brothers · 同心協力過關卡', '十兄弟 · Brothers in arms, puzzles to solve')}</p><p>${tr('十個兄弟，每人一種本領。每一關都要好幾個兄弟一起動腦、一起出力才過得去。', 'Ten brothers, each with one special gift. Every level needs several of them to think and work together to get through.')}</p>`);
  const row = el('div', 'btns'); const next = Math.min(LEVELS.length - 1, save.unlocked - 1);
  row.append(btn(save.done[LEVELS[0].id] ? tr(`繼續（第 ${next + 1} 關）`, `Continue (level ${next + 1})`) : tr('開始冒險', 'Start'), () => startLevel(next), true), btn(tr('選擇關卡', 'Levels'), levelSelect), btn(tr('認識十兄弟', 'Meet the brothers'), meet), btn(isEn() ? '中文' : 'English', () => { setLang(isEn() ? 'zh' : 'en'); title(); }));
  box.append(row); ui.append(box);
}
function levelSelect() {
  W = null; scene = 'select'; clearUI();
  const box = el('div', 'card select', `<h2>${tr('選擇關卡', 'Choose a level')}</h2>`), grid = el('div', 'levels');
  LEVELS.forEach((L, i) => { const open = i < save.unlocked, b = el('button', `lv ${open ? '' : 'lock'} ${save.done[L.id] ? 'done' : ''}`, `<b>${i + 1}</b><span>${esc(lName(L))}</span><small>${open ? `${'★'.repeat(save.stars[L.id] || 0)}${'☆'.repeat(Math.max(0, L.map.join('').split('*').length - 1 - (save.stars[L.id] || 0)))}` : '🔒'}</small><i>${L.bros.map((id) => BROTHERS[id].name).join('・')}</i>`); if (open) b.onclick = () => { SFX.ok(); startLevel(i); }; grid.append(b); });
  box.append(grid); const row = el('div', 'btns'); row.append(btn(tr('返回', 'Back'), title, true)); box.append(row); ui.append(box);
}
function meet() {
  W = null; scene = 'select'; clearUI();
  const box = el('div', 'card meet', `<h2>${tr('十兄弟', 'The Ten Brothers')}</h2>`), list = el('div', 'bros');
  for (const [id, d] of Object.entries(BROTHERS)) { const r = el('div', 'bro'), c = document.createElement('canvas'); c.width = 16; c.height = 20; c.getContext('2d').drawImage(broSprite(id, 'stand', 0, 1), 0, 0); r.append(c, el('div', '', `<b>${bRank(d)}${tr('　', ' · ')}${esc(bWho(d))}</b><span>${esc(bDesc(d))}</span>`)); list.append(r); }
  box.append(list); const row = el('div', 'btns'); row.append(btn(tr('返回', 'Back'), title, true)); box.append(row); ui.append(box);
}
function introCard() {
  const L = LEVELS[LI]; paused = true;
  const box = el('div', 'card intro', `<p class="lvno">${tr(`第 ${LI + 1} 關`, `Level ${LI + 1}`)}</p><h2>${esc(lName(L))}</h2><p>${esc(lIntro(L))}</p>`), list = el('div', 'bros small');
  for (const id of L.bros) { const d = BROTHERS[id], r = el('div', 'bro'), c = document.createElement('canvas'); c.width = 16; c.height = 20; c.getContext('2d').drawImage(broSprite(id, 'stand', 0, 1), 0, 0); r.append(c, el('div', '', `<b>${esc(bWho(d))}</b><span>${esc(bSkill(d))}</span>`)); list.append(r); }
  box.append(list, el('p', 'keys', tr('← → 走　↑ / 空白鍵 跳（Cliff 爬、Finn 游）　X 本領　Tab 或 1～0 換兄弟　H 提示　R 重來', '← → walk   ↑ / Space jump (Cliff climbs, Finn swims)   X gift   Tab or 1–0 switch brother   H hint   R restart')));
  const row = el('div', 'btns'); row.append(btn(tr('出發！', 'Go!'), () => { clearUI(); paused = false; }, true)); box.append(row); ui.append(box);
}
function pauseMenu() {
  if (paused) return; paused = true; clearUI();
  const box = el('div', 'card pause', `<h2>${esc(lName(LEVELS[LI]))}</h2>`), row = el('div', 'btns col');
  const resume = () => { clearUI(); paused = false; };
  row.append(btn(tr('繼續', 'Resume'), resume, true), btn(tr('提示', 'Hint'), () => { resume(); hint(); }), btn(tr('重新開始', 'Restart'), () => { resume(); restart(); }), btn(tr('選擇關卡', 'Levels'), levelSelect), btn(soundOn() ? tr('聲音：開', 'Sound: on') : tr('聲音：關', 'Sound: off'), () => { setSound(!soundOn()); resume(); }), btn(isEn() ? '中文' : 'English', () => { setLang(isEn() ? 'zh' : 'en'); padLabels(); resume(); }));
  box.append(row); ui.append(box);
}

// ---------------------------------------------------------------- the loop
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now; const t = now / 1000;
  if (scene === 'play' && W && !paused) {
    acc += dt;
    while (acc >= DT) {
      update(W, DT, { left: held.has('left'), right: held.has('right'), up: held.has('up'), down: held.has('down'), jump: held.has('jump') || (held.has('up') && W.bros[W.active].d.can !== 'climb' && W.bros[W.active].d.can !== 'swim'), jumpP: jumpP || (held.has('up') && !upWas && W.bros[W.active].d.can !== 'climb' && !W.bros[W.active].swim), actP });
      upWas = held.has('up'); jumpP = false; actP = false; events(); acc -= DT;
    }
    clampCam(false);
    for (const p of parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.life -= dt; } parts = parts.filter((p) => p.life > 0);
    toastT = Math.max(0, toastT - dt);
  } else { acc = 0; jumpP = false; actP = false; }
  draw(t); requestAnimationFrame(loop);
}
let upWas = false;
window.TB = { get W() { return W; }, startLevel, LEVELS, cleared, get scene() { return scene; }, get save() { return save; } };
(async () => { try { cloud = await import('/save.js'); await cloud.pull(GAME, KEY); save = { ...save, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) { cloud = null; } title(); requestAnimationFrame(loop); })();
