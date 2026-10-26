// Puzzle pieces for building levels: each is a stretch of ground with one obstacle that some brother's gift opens,
// laid out at a column x on a level 14 squares high (the ground's top at row 11). Each knows who it needs, how to
// draw itself, a hint in both languages, and how to bring every brother across it (so tools/solve.mjs can prove the
// level). Pieces that use a switch take a letter from the level: plates and bridges a b d g j y z, panels q r s.
//   build(b, x, k)  draws it;  k is { l: plate letter, L: its door / bridge, p: panel, P: its door, stool, climber }
//   solve(all, x, k) the moves that bring everyone in `all` to its far side
import { BROTHERS } from './brothers.js';
// how long to hold a direction for the same distance, by how fast a brother runs
const dur = (id, t) => t * 90 / BROTHERS[id].speed;
const but = (all, ...out) => all.filter((id) => !out.includes(id));
const each = (ids, f) => ids.flatMap((id) => [['sel', id], ...f(id)]);
const goAll = (ids, col) => each(ids, () => [['go', col]]);

export const PIECES = {
  crack: {
    w: 5, needs: ['hank'], hint: ['Hank 打碎裂牆', 'Hank smashes the cracked wall'],
    build: (b, x) => { b.box(x + 2, 0, x + 2, 6, '#'); b.box(x + 2, 7, x + 2, 10, 'C'); },
    solve: (all, x) => [['sel', 'hank'], ['go', x + 1], ['face', 1], ['act'], ...goAll(all, x + 4)],
  },
  panel: {
    w: 6, needs: ['josh'], panel: true, hint: ['Josh 用控制台開門', 'Josh opens the door at the control panel'],
    build: (b, x, k) => { b.at(x + 1, 10, k.p); b.box(x + 3, 0, x + 3, 6, '#'); b.box(x + 3, 7, x + 3, 10, k.P); },
    solve: (all, x) => [['sel', 'josh'], ['go', x + 1], ['act'], ...goAll(all, x + 5)],
  },
  panelBridge: {
    w: 9, needs: ['josh'], panel: true, bridge: true, hint: ['Josh 用控制台放下坑上的橋', 'Josh lowers the bridge over the pit from the control panel'],
    build: (b, x, k) => { b.at(x + 1, 10, k.p); b.box(x + 3, 11, x + 6, 13, '.'); b.box(x + 3, 11, x + 6, 11, k.P); },
    solve: (all, x) => [['sel', 'josh'], ['go', x + 1], ['act'], ...goAll(all, x + 8)],
  },
  closet: {
    w: 14, needs: ['tiny'], plate: true, hint: ['Tiny 鑽進柵欄後的小房間踩壓板開門，大家過去後他再從右邊的柵欄鑽出來', 'Tiny slips through the grate into the little room and holds the plate; when everyone is through he squeezes out through the grate on the right'],
    build: (b, x, k) => { b.box(x + 1, 9, x + 3, 9, '-'); b.box(x + 4, 5, x + 10, 5, '#'); b.box(x + 4, 9, x + 10, 9, '#'); b.box(x + 4, 6, x + 4, 8, 'n'); b.at(x + 8, 8, k.l); b.box(x + 11, 0, x + 11, 5, '#'); b.box(x + 11, 6, x + 11, 8, 'n'); b.at(x + 11, 9, '#'); b.at(x + 11, 10, k.L); },
    solve: (all, x) => [['sel', 'tiny'], ['go', x], ['jump', 1, 0.35], ['go', x + 3], ['go', x + 8], ...goAll(but(all, 'tiny'), x + 13), ['sel', 'tiny'], ['go', x + 12], ['go', x + 13]],
  },
  trench: {
    w: 12, needs: ['tank'], hint: ['Tank 走過溝底的尖刺，站上鐵壓板，溝上就有橋', 'Tank walks along the spikes in the trench and stands on the iron plate to bring out the bridge'],
    build: (b, x) => { b.box(x + 1, 11, x + 8, 11, 'W'); b.box(x + 1, 12, x + 8, 12, '^'); b.at(x + 10, 10, 'w'); },
    solve: (all, x) => [['sel', 'tank'], ['go', x + 8], ['jump', 1, 0.5], ['go', x + 10], ...goAll(but(all, 'tank'), x + 11)],
  },
  pool: {
    w: 13, needs: ['finn'], plate: true, bridge: true, hint: ['Finn 潛到水底踩壓板，水面就有橋；大家過去後他自己游上岸', 'Finn dives to the plate at the bottom to raise a bridge; when everyone is across he swims out'],
    build: (b, x, k) => { b.box(x + 1, 11, x + 10, 12, '~'); b.box(x + 1, 11, x + 10, 11, k.L); b.at(x + 5, 12, k.l); },
    solve: (all, x) => [['sel', 'finn'], ['go', x + 1], ['go', x + 5], ['wait', 0.6], ...goAll(but(all, 'finn'), x + 12), ['sel', 'finn'], ['go', x + 9], ['go', x + 10], ['hold', { up: 1 }, 0.5], ['jump', 1, 0.5], ['go', x + 12]],
  },
  gap: {
    w: 6, needs: ['max'], planks: 3, hint: ['Max 在斷崖上搭三塊木板', 'Max lays three planks over the drop'],
    build: (b, x) => { b.box(x + 1, 11, x + 3, 13, '.'); },
    solve: (all, x) => [['sel', 'max'], ['go', x], ['face', 1], ['act'], ['go', x + 1], ['act'], ['go', x + 2], ['act'], ...goAll(all, x + 5)],
  },
  bobbyCrate: {
    w: 16, needs: ['bobby', 'hank'], plate: true, hint: ['Bobby 跳上高台踩壓板開門，Hank 進門後把箱子推到另一塊同色的壓板上壓住，大家再跳過箱子', 'Bobby jumps up to the plate on the high ledge to open the door; Hank goes through and pushes the crate onto the other plate of that colour to hold it, and everyone hops over the crate'],
    build: (b, x, k) => { b.box(x + 2, 7, x + 3, 7, '#'); b.at(x + 2, 6, k.l); b.box(x + 7, 0, x + 7, 6, '#'); b.box(x + 7, 7, x + 7, 10, k.L); b.at(x + 10, 10, 'k'); b.at(x + 13, 10, k.l); },
    solve: (all, x) => [['sel', 'bobby'], ['go', x + 1], ['hold', { jump: 1 }, 0.4], ['hold', { jump: 1, right: 1 }, 0.25], ['land'], ['go', x + 2], ['sel', 'hank'], ['go', x + 9], ['go', x + 12],
      ['sel', 'bobby'], ['go', x + 5], ['go', x + 9], ['go', x + 11], ['jump', 1, 0.5], ['go', x + 15], ...each(but(all, 'hank', 'bobby'), () => [['go', x + 9], ['go', x + 11], ['jump', 1, 0.5], ['go', x + 15]]), ['sel', 'hank'], ['jump', 1, 0.5], ['go', x + 15]],
  },
  bobbySolo: {
    w: 11, needs: ['bobby'], plate: true, hint: ['Bobby 跳上高台踩壓板開門，大家過去後他從高台直接跳過牆', 'Bobby jumps up to the plate on the high ledge to open the door; when everyone is through he leaps over the wall from the ledge'],
    build: (b, x, k) => { b.box(x + 2, 7, x + 3, 7, '#'); b.at(x + 2, 6, k.l); b.box(x + 6, 5, x + 6, 6, '#'); b.box(x + 6, 7, x + 6, 10, k.L); },
    solve: (all, x) => [['sel', 'bobby'], ['go', x + 1], ['hold', { jump: 1 }, 0.4], ['hold', { jump: 1, right: 1 }, 0.25], ['land'], ['go', x + 2], ...goAll(but(all, 'bobby'), x + 9), ['sel', 'bobby'], ['go', x + 3], ['jump', 1, 0.8], ['go', x + 10]],
  },
  bobbyBridge: {
    w: 12, needs: ['bobby'], plate: true, bridge: true, hint: ['Bobby 跳上高台踩壓板，坑上就有橋；大家過去後他從高台跳過坑', 'Bobby jumps up to the plate on the high ledge and a bridge spans the pit; when everyone is over he jumps across from the ledge'],
    build: (b, x, k) => { b.box(x + 2, 7, x + 3, 7, '#'); b.at(x + 2, 6, k.l); b.box(x + 5, 11, x + 8, 13, '.'); b.box(x + 5, 11, x + 8, 11, k.L); },
    solve: (all, x) => [['sel', 'bobby'], ['go', x + 1], ['hold', { jump: 1 }, 0.4], ['hold', { jump: 1, right: 1 }, 0.25], ['land'], ['go', x + 2], ...goAll(but(all, 'bobby'), x + 11), ['sel', 'bobby'], ['go', x + 3], ['jump', 1, 0.8], ['go', x + 11]],
  },
  cliffBlock: {
    w: 11, needs: ['cliff'], plate: true, hint: ['Cliff 爬上大石塊踩壓板，打開下面的隧道', 'Cliff climbs the great block and stands on the plate to open the tunnel beneath'],
    build: (b, x, k) => { b.box(x + 2, 4, x + 8, 8, '#'); b.box(x + 2, 9, x + 2, 10, k.L); b.at(x + 5, 3, k.l); },
    solve: (all, x) => [['sel', 'cliff'], ['go', x + 1], ['hold', { right: 1, up: 1 }, 2.4], ['hold', { right: 1 }, 0.3], ['go', x + 5], ...goAll(but(all, 'cliff'), x + 10), ['sel', 'cliff'], ['go', x + 9], ['go', x + 10]],
  },
  leoWall: {
    w: 11, needs: ['leo'], plate: true, hint: ['Leo 乘風扇飛過高牆，踩住牆後的壓板開門', 'Leo rides the fan over the high wall and stands on the plate behind it to open the gate'],
    build: (b, x, k) => { b.at(x + 2, 11, 'F'); b.box(x + 6, 4, x + 6, 7, '#'); b.box(x + 6, 8, x + 6, 10, k.L); b.at(x + 8, 10, k.l); },
    solve: (all, x) => [['sel', 'leo'], ['go', x + 1], ['go', x + 2], ['wait', 1.6], ['glide', x + 8], ['go', x + 8], ...goAll(but(all, 'leo'), x + 10)],
  },
  jasperTimed: {
    w: 30, needs: ['jasper'], plate: true, timed: true, hint: ['Jasper 踩計時按鈕後全速衝過下面的門，踩住後面的壓板；大家再爬階梯走上面的門', 'Jasper steps on the timed button and races through the lower door to the plate behind it; then everyone climbs the steps to the upper door'],
    build: (b, x, k) => { b.at(x + 2, 10, 't'); b.box(x + 17, 9, x + 19, 9, '-'); b.box(x + 21, 7, x + 23, 7, '-'); b.box(x + 24, 0, x + 24, 4, '#'); b.box(x + 24, 5, x + 24, 6, k.L); b.box(x + 24, 7, x + 24, 8, '#'); b.box(x + 24, 9, x + 24, 10, 'T'); b.at(x + 27, 10, k.l); },
    solve: (all, x) => [...goAll(but(all, 'jasper'), x + 10), ['sel', 'jasper'], ['go', x + 1], ['go', x + 27],
      ...each(but(all, 'jasper'), () => [['go', x + 16], ['jump', 1, 0.3], ['land'], ['go', x + 19], ['jump', 1, 0.35], ['land'], ['go', x + 23], ['go', x + 26], ['go', x + 29]])],
  },
  jasperPit: {
    w: 12, needs: ['jasper'], plate: true, bridge: true, hint: ['只有 Jasper 跳得過寬坑，他踩住對面的壓板，橋就出現了', 'Only Jasper can jump the wide pit; when he stands on the plate on the far side, the bridge appears'],
    build: (b, x, k) => { b.box(x + 3, 11, x + 7, 13, '.'); b.box(x + 3, 11, x + 7, 11, k.L); b.at(x + 9, 10, k.l); },
    solve: (all, x) => [['sel', 'jasper'], ['go', x], ['hold', { right: 1 }, 0.15], ['jump', 1, 0.55], ['go', x + 9], ...goAll(but(all, 'jasper'), x + 11)],
  },
  glideBridge: {
    w: 29, needs: ['leo'], plate: true, bridge: true, hint: ['Leo 乘風扇飛上高台，撐傘飄過大坑，踩住對面的壓板放下橋', 'Leo rides the fan up to the high ledge, glides across the great pit and stands on the plate to lower the bridge'],
    build: (b, x, k) => { b.at(x + 3, 11, 'F'); b.box(x + 4, 4, x + 11, 4, '-'); b.box(x + 12, 11, x + 24, 13, '.'); b.box(x + 12, 11, x + 24, 11, k.L); b.at(x + 26, 10, k.l); },
    solve: (all, x) => [['sel', 'leo'], ['go', x + 3], ['wait', 1.6], ['hold', { right: 1 }, 0.4], ['go', x + 10], ['hold', { right: 1 }, 0.2], ['glide', x + 26], ['go', x + 26], ...goAll(but(all, 'leo'), x + 28)],
  },
  crateStep: {
    w: 12, needs: ['hank'], hint: ['Hank 把箱子推到高台邊，大家踩著箱子爬上去', 'Hank pushes the crate against the high block so everyone can climb up on it'],
    build: (b, x) => { b.box(x + 5, 8, x + 9, 10, '#'); b.at(x + 2, 10, 'k'); },
    solve: (all, x) => [['sel', 'hank'], ['go', x + 1], ['go', x + 3], ...each(all, () => [['go', x + 3], ['jump', 1, 0.3], ['land'], ['jump', 1, 0.4], ['land'], ['go', x + 11]])],
  },
  // two brothers working as one: one stands still, the other jumps up on his head to the ledge and holds the plate
  stackWall: {
    w: 12, needs: [], plate: true, hint: ['一個兄弟站在高台下，另一個踩著他的頭跳上高台踩壓板開門；大家過去後，台上的兄弟從高台跳過矮牆', 'One brother stands under the ledge while another jumps on his head up to the plate; when everyone is through, the one on the ledge jumps over the low wall'],
    build: (b, x, k) => { b.box(x + 3, 8, x + 5, 8, '#'); b.at(x + 4, 7, k.l); b.box(x + 8, 7, x + 8, 8, '#'); b.box(x + 8, 9, x + 8, 10, k.L); },
    solve: (all, x, k) => [['sel', k.stool], ['go', x + 1], ['sel', k.climber], ['go', x], ['hop', x + 1], ['hop', x + 4], ['go', x + 4], ...goAll(but(all, k.climber), x + 10), ['sel', k.climber], ['go', x + 5], ['hop', x + 10], ['go', x + 11]],
  },
};
