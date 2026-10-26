// The levels. Each is built square by square (see the key at the top of engine.js), lists the brothers who play it
// (the first in the list starts in control), a hint Josh can think of, and a solution that tools/solve.mjs plays
// through the rules to prove the level can be finished. The first ten are drawn by hand; the thirty after them are
// put together from the puzzle pieces in modules.js.
import { PIECES } from './modules.js';
import { BROTHERS, ORDER } from './brothers.js';
function make(w, h, build) {
  const g = Array.from({ length: h }, () => Array(w).fill('.'));
  const at = (x, y, c) => { if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = c; };
  const box = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) at(x, y, c); };
  build({ at, box, w, h });
  return g.map((r) => r.join(''));
}
const ground = (b, from = 0, to = b.w - 1, top = 10) => b.box(from, top, to, b.h - 1, '#');

export const LEVELS = [
  {
    id: 'start', name: '兄弟出發', theme: 'meadow', bros: ['josh', 'jasper'],
    intro: '十兄弟的冒險開始了！先讓老大 Josh 打開門，再看老二 Jasper 的飛毛腿。',
    hint: '我站到控制台前按 X 開門。坑太寬，只有 Jasper 跳得過去——他踩住對面的壓板，橋就會出現。',
    en: { name: 'Off We Go', intro: "The ten brothers' adventure begins! First the eldest, Josh, opens the door — then see how fast Jasper's legs are.", hint: "I'll stand at the control panel and press X to open the door. The pit is too wide for anyone but Jasper — when he stands on the plate on the far side, a bridge appears." },
    bridges: 'A',
    map: make(36, 12, (b) => {
      ground(b); b.box(15, 10, 19, 11, '.'); b.box(15, 10, 19, 10, 'A');
      b.box(10, 0, 10, 6, '#'); b.box(10, 7, 10, 9, 'Q'); b.at(7, 9, 'q');
      b.at(21, 9, 'a'); b.box(31, 9, 33, 9, 'E');
      b.at(2, 9, '@'); b.at(3, 9, '@'); b.at(17, 6, '*'); b.at(5, 7, '*'); b.at(26, 8, '*');
    }),
    solve: [['sel', 'josh'], ['go', 7], ['act'], ['sel', 'jasper'], ['go', 12], ['hold', { right: 1 }, 0.15], ['jump', 1, 0.55], ['go', 21], ['sel', 'josh'], ['go', 25], ['go', 31], ['sel', 'jasper'], ['go', 33]],
  },
  {
    id: 'crate', name: '大力士的箱子', theme: 'meadow', bros: ['hank', 'bobby'],
    intro: 'Hank 力氣最大，推得動箱子、打得碎裂牆；Bobby 是彈簧腿，跳得比誰都高。',
    hint: 'Hank 打碎裂牆，把箱子推到壓板上，門就一直開著。高台上的壓板只有 Bobby 跳得上去——他踩著，Hank 就能穿過下面的隧道。',
    en: { name: "Hank's Crate", intro: 'Hank is the strongest: he can push crates and smash cracked walls. Bobby has springs in his legs and jumps higher than anyone.', hint: 'Hank smashes the cracked wall and pushes the crate onto the plate so the door stays open. The plate up on the high block is one only Bobby can jump to — while he stands there, Hank can walk through the tunnel below.' },
    map: make(40, 12, (b) => {
      ground(b);
      b.box(8, 0, 8, 6, '#'); b.box(8, 7, 8, 9, 'C'); b.at(10, 9, 'k'); b.at(14, 9, 'a');
      b.box(17, 0, 17, 6, '#'); b.box(17, 7, 17, 9, 'A');
      b.box(22, 6, 30, 7, '#'); b.box(22, 8, 22, 9, 'B'); b.at(25, 5, 'b');
      b.box(35, 9, 37, 9, 'E'); b.at(2, 9, '@'); b.at(3, 9, '@'); b.at(26, 3, '*'); b.at(12, 6, '*'); b.at(33, 7, '*');
    }),
    solve: [['sel', 'hank'], ['go', 7], ['face', 1], ['act'], ['go', 9], ['go', 13], ['go', 12], ['jump', 1, 0.5], ['go', 19], ['sel', 'bobby'], ['go', 12], ['jump', 1, 0.5], ['go', 20], ['jump', 1, 0.6], ['go', 25], ['sel', 'hank'], ['go', 33], ['sel', 'bobby'], ['go', 36], ['sel', 'hank'], ['go', 35]],
  },
  {
    id: 'grate', name: '小不點的祕密通道', theme: 'cave', bros: ['tiny', 'josh'],
    intro: 'Tiny 是最小的弟弟，鐵柵欄攔得住大家，攔不住他。',
    hint: 'Tiny 鑽進柵欄裡的小房間，踩住壓板，下面的門就開了。我過去以後打開控制台，Tiny 再從右邊的柵欄鑽出來。',
    en: { name: "Tiny's Secret Passage", intro: 'Tiny is the youngest and smallest. Iron grates stop everyone else — not him.', hint: "Tiny slips through the grate into the little room and stands on the plate, and the door below opens. Once I'm through, I open the control panel, and Tiny squeezes out through the grate on the right." },
    map: make(40, 12, (b) => {
      ground(b); b.box(0, 0, 39, 0, '#');
      b.box(10, 8, 12, 8, '-'); b.box(13, 4, 19, 4, '#'); b.box(13, 8, 19, 8, '#'); b.box(13, 5, 13, 7, 'n'); b.at(17, 7, 'a');
      b.box(20, 1, 20, 4, '#'); b.box(20, 5, 20, 7, 'n'); b.at(20, 8, '#'); b.at(20, 9, 'A');
      b.at(24, 9, 'q'); b.box(28, 1, 28, 6, '#'); b.box(28, 7, 28, 9, 'Q'); b.box(32, 9, 34, 9, 'E');
      b.at(2, 9, '@'); b.at(3, 9, '@'); b.at(16, 6, '*'); b.at(6, 6, '*'); b.at(25, 5, '*');
    }),
    solve: [['sel', 'tiny'], ['go', 9], ['jump', 1, 0.4], ['go', 17], ['sel', 'josh'], ['go', 24], ['act'], ['sel', 'tiny'], ['go', 23], ['go', 33], ['sel', 'josh'], ['go', 32]],
  },
  {
    id: 'spikes', name: '尖刺與高牆', theme: 'castle', bros: ['tank', 'cliff'],
    intro: 'Tank 皮粗肉厚，尖刺扎不痛他；Cliff 是壁虎，再高的牆也爬得上去。',
    hint: 'Tank 走過尖刺，站上鐵壓板，尖刺上就會出現一條橋。高牆頂上的壓板讓 Cliff 爬上去踩，Tank 就能穿過牆下的門。',
    en: { name: 'Spikes and a High Wall', intro: "Tank's skin is so tough that spikes can't hurt him; Cliff is a gecko who can climb any wall.", hint: 'Tank walks over the spikes and stands on the iron plate — a bridge appears over the spikes. The plate on top of the high wall is for Cliff to climb up to; while he stands there, Tank can walk through the door below.' },
    bridges: 'W',
    map: make(42, 12, (b) => {
      ground(b); b.box(8, 9, 15, 9, '^'); b.box(8, 8, 15, 8, 'W'); b.at(17, 9, 'w');
      b.box(22, 4, 30, 7, '#'); b.box(22, 8, 22, 9, 'A'); b.at(27, 3, 'a');
      b.box(36, 9, 38, 9, 'E'); b.at(2, 9, '@'); b.at(4, 9, '@'); b.at(11, 6, '*'); b.at(25, 2, '*'); b.at(33, 7, '*');
    }),
    solve: [['sel', 'tank'], ['go', 17], ['sel', 'cliff'], ['go', 7], ['jump', 1, 0.4], ['go', 19], ['go', 21], ['hold', { right: 1, up: 1 }, 1.4], ['hold', { right: 1 }, 0.3], ['go', 27], ['sel', 'tank'], ['go', 36], ['sel', 'cliff'], ['go', 37]],
  },
  {
    id: 'river', name: '過河', theme: 'meadow', bros: ['max', 'finn'],
    intro: 'Finn 是浪裡白條，水裡來去自如；Max 手最巧，隨身帶著木板，到哪兒都能搭橋。',
    hint: 'Finn 潛到水底踩住壓板，水面會升起一截橋，但還差三格。Max 走到橋頭按 X 搭木板補上。Finn 最後自己游過去。',
    en: { name: 'Across the River', intro: 'Finn swims like a fish; Max is handy and carries planks, so he can build a bridge anywhere.', hint: "Finn dives down and stands on the plate at the bottom, and part of a bridge rises out of the water — but it's three squares short. Max walks to the end and presses X to lay planks. Finn swims across on his own at the end." },
    bridges: 'A', planks: 3,
    map: make(36, 12, (b) => {
      b.box(0, 7, 9, 11, '#'); b.box(21, 7, 35, 11, '#'); b.box(10, 11, 20, 11, '#'); b.box(10, 7, 20, 10, '~'); b.box(10, 7, 17, 7, 'A'); b.at(14, 10, 'a');
      b.box(30, 6, 32, 6, 'E'); b.at(3, 6, '@'); b.at(5, 6, '@'); b.at(15, 4, '*'); b.at(19, 9, '*'); b.at(26, 4, '*');
    }),
    solve: [['sel', 'finn'], ['go', 9], ['hold', { right: 1 }, 0.4], ['go', 14], ['wait', 1.2], ['sel', 'max'], ['go', 17], ['face', 1], ['act'], ['go', 18], ['act'], ['go', 19], ['act'], ['go', 23], ['go', 31], ['sel', 'finn'], ['go', 20], ['hold', { up: 1 }, 0.6], ['jump', 1, 0.5], ['go', 30]],
  },
  {
    id: 'wind', name: '乘風而上', theme: 'sky', bros: ['leo', 'jasper'],
    intro: 'Leo 撐著小傘，風扇一吹就飛上天；Jasper 的腿快得能跑贏計時門。',
    hint: 'Leo 站上風扇飛上高台，再從台邊撐傘飄過大坑，踩住壓板放下橋給 Jasper。Jasper 踩計時按鈕後全速衝過門；Leo 用前面的風扇飛過高牆。',
    en: { name: 'Riding the Wind', intro: "Leo flies when a fan blows under his umbrella; Jasper's legs can beat a timed door.", hint: 'Leo stands on the fan to fly up to the high ledge, then glides across the big pit and stands on the plate to lower a bridge for Jasper. Jasper steps on the timed button and races through the door; Leo flies over the high wall on the fan in front of it.' },
    bridges: 'A',
    map: make(64, 14, (b) => {
      ground(b, 0, 63, 12); b.box(13, 12, 26, 13, '.'); b.box(13, 12, 26, 12, 'A');
      b.at(4, 12, 'F'); b.box(5, 4, 12, 4, '-'); b.at(28, 11, 'a');
      b.at(31, 11, 't'); b.box(53, 5, 53, 8, '#'); b.box(53, 9, 53, 11, 'T'); b.at(50, 12, 'F');
      b.box(58, 11, 60, 11, 'E'); b.at(1, 11, '@'); b.at(2, 11, '@'); b.at(18, 6, '*'); b.at(42, 9, '*'); b.at(50, 2, '*');
    }),
    solve: [['sel', 'leo'], ['go', 4], ['wait', 1.4], ['hold', { right: 1 }, 0.4], ['go', 11], ['hold', { right: 1 }, 0.2], ['hold', { right: 1, jump: 1 }, 3.2], ['go', 28], ['sel', 'jasper'], ['go', 30], ['go', 55], ['sel', 'leo'], ['go', 49], ['go', 50], ['wait', 1.6], ['hold', { right: 1, jump: 1 }, 1.4], ['go', 59], ['sel', 'jasper'], ['go', 58]],
  },
  {
    id: 'stack', name: '三兄弟同心', theme: 'cave', bros: ['hank', 'tiny', 'cliff'],
    intro: '箱子可以墊腳，壓板可以用箱子壓住。三個人要一起想。',
    hint: 'Hank 打碎裂牆，把箱子推到高台邊當墊腳石。Tiny 從右邊鑽進高台底下的小房間踩壓板開門；Hank 進門後再推一個箱子壓住另一塊同色的壓板，Tiny 就能出來。最後 Cliff 爬上高牆踩壓板，打開牆下的隧道。',
    en: { name: 'Three Hearts as One', intro: 'Crates make good steps, and a crate can hold down a plate. The three of them have to think together.', hint: 'Hank smashes the wall and pushes the crate against the high ledge as a step. Tiny squeezes into the little room under the ledge from the right and stands on the plate to open the door; once Hank is through, he pushes another crate onto the second plate of the same colour, so Tiny can come out. Last, Cliff climbs the high wall and stands on the plate that opens the tunnel beneath.' },
    map: make(46, 12, (b) => {
      ground(b);
      b.box(5, 0, 5, 6, '#'); b.box(5, 7, 5, 9, 'C'); b.at(8, 9, 'k');
      b.box(12, 7, 19, 9, '#'); b.box(14, 8, 18, 9, '.'); b.at(16, 9, 'a'); b.box(19, 8, 19, 9, 'n');
      b.box(22, 0, 22, 6, '#'); b.box(22, 7, 22, 9, 'A'); b.at(25, 9, 'k'); b.at(28, 9, 'a');
      b.box(32, 4, 38, 9, '#'); b.box(33, 8, 38, 9, '.'); b.box(32, 8, 32, 9, 'B'); b.at(35, 3, 'b');
      b.box(42, 9, 44, 9, 'E'); b.at(1, 9, '@'); b.at(2, 9, '@'); b.at(3, 9, '@'); b.at(16, 5, '*'); b.at(30, 6, '*'); b.at(36, 1, '*');
    }),
    solve: [['sel', 'hank'], ['go', 4], ['face', 1], ['act'], ['go', 7], ['go', 10], ['jump', 1, 0.3], ['land'], ['jump', 1, 0.4], ['go', 17], ['go', 21],
      ['sel', 'tiny'], ['go', 10], ['jump', 1, 0.3], ['land'], ['jump', 1, 0.4], ['go', 20], ['go', 16],
      ['sel', 'hank'], ['go', 24], ['go', 27], ['sel', 'tiny'], ['go', 20], ['go', 26],
      ['sel', 'cliff'], ['go', 10], ['jump', 1, 0.3], ['land'], ['jump', 1, 0.4], ['go', 21], ['go', 26], ['jump', 1, 0.4], ['go', 31], ['hold', { right: 1, up: 1 }, 2.0], ['hold', { right: 1 }, 0.3], ['go', 35],
      ['sel', 'hank'], ['jump', 1, 0.4], ['go', 42], ['sel', 'tiny'], ['jump', 1, 0.4], ['go', 43], ['sel', 'cliff'], ['go', 44]],
  },
  {
    id: 'water', name: '水底的機關', theme: 'lake', bros: ['josh', 'bobby', 'finn'],
    intro: '水底藏著壓板，高柱上也有壓板。老大 Josh 要靠兩個弟弟幫忙才走得到控制台。',
    hint: 'Finn 先潛到水底踩壓板開門，我再打開控制台放下水面的橋。Finn 從牆下的水道游過去。後面 Bobby 跳上高柱踩壓板，就會出現一道階梯讓我爬上控制台。',
    en: { name: 'The Machine Under the Water', intro: "There's a plate at the bottom of the water and another on a high ledge. Josh needs both his brothers' help to reach the control panel.", hint: 'Finn first dives to the plate at the bottom to open the door, and I open the control panel to lower the bridge over the water. Finn swims through the channel under the wall. Further on, Bobby jumps onto the high ledge and stands on the plate, and steps appear for me to climb to the control panel.' },
    bridges: 'QB',
    map: make(44, 13, (b) => {
      ground(b); b.box(6, 10, 18, 11, '~'); b.box(6, 10, 14, 10, 'Q'); b.at(15, 10, '#'); b.at(10, 11, 'a'); b.at(3, 9, 'q');
      b.box(13, 0, 13, 6, '#'); b.box(13, 7, 13, 9, 'A');
      b.box(21, 6, 22, 6, '#'); b.at(21, 5, 'b'); b.at(24, 8, 'B'); b.at(25, 7, 'B'); b.box(26, 6, 28, 6, '#'); b.at(27, 5, 'r');
      b.box(34, 0, 34, 6, '#'); b.box(34, 7, 34, 9, 'R'); b.box(38, 9, 40, 9, 'E');
      b.at(1, 9, '@'); b.at(2, 9, '@'); b.at(4, 9, '@'); b.at(12, 7, '*'); b.at(22, 2, '*'); b.at(31, 7, '*');
    }),
    solve: [['sel', 'finn'], ['go', 6], ['go', 10], ['wait', 0.6], ['sel', 'josh'], ['go', 3], ['act'], ['go', 14], ['go', 15], ['jump', 1, 0.65], ['go', 20],
      ['sel', 'bobby'], ['go', 14], ['go', 15], ['jump', 1, 0.65], ['go', 20], ['jump', 1, 0.5], ['go', 21],
      ['sel', 'finn'], ['go', 17], ['hold', { up: 1 }, 0.5], ['jump', 1, 0.5], ['go', 20],
      ['sel', 'josh'], ['go', 23], ['jump', 1, 0.3], ['land'], ['jump', 1, 0.3], ['land'], ['jump', 1, 0.3], ['go', 27], ['act'], ['go', 31], ['go', 38],
      ['sel', 'bobby'], ['go', 24], ['go', 39], ['sel', 'finn'], ['go', 40]],
  },
  {
    id: 'iron', name: '鐵、木與傘', theme: 'castle', bros: ['tank', 'max', 'leo'],
    intro: '尖刺坑、深溝、斷崖和高牆，一關比一關難。',
    hint: 'Max 用木板蓋住第一個尖刺坑。Tank 走過溝底的尖刺，站上鐵壓板，溝上就有橋。斷崖再由 Max 搭三塊木板。最後 Leo 乘著風扇上高柱踩壓板開門，自己再從牆頭飄過去。',
    en: { name: 'Iron, Wood and an Umbrella', intro: 'A spike pit, a trench, a cliff edge and a high wall — each harder than the last.', hint: 'Max covers the first spike pit with planks. Tank walks over the spikes at the bottom of the trench and stands on the iron plate, and a bridge spans the trench. Max lays three more planks over the drop. Last, Leo rides the fan up to the high ledge and stands on the plate to open the door, then floats over the top of the wall himself.' },
    bridges: 'W', planks: 7,
    map: make(52, 13, (b) => {
      ground(b); b.box(6, 10, 9, 10, '^');
      b.box(14, 10, 21, 10, 'W'); b.box(14, 11, 21, 11, '^'); b.at(23, 9, 'w');
      b.box(27, 10, 29, 12, '.');
      b.at(33, 10, 'F'); b.box(34, 3, 35, 3, '#'); b.at(34, 2, 'a'); b.box(38, 4, 38, 6, '#'); b.box(38, 7, 38, 9, 'A');
      b.box(44, 9, 46, 9, 'E'); b.at(1, 9, '@'); b.at(2, 9, '@'); b.at(3, 9, '@'); b.at(18, 8, '*'); b.at(28, 7, '*'); b.at(41, 3, '*');
    }),
    solve: [['sel', 'tank'], ['go', 9], ['jump', 1, 0.4], ['go', 13], ['go', 21], ['jump', 1, 0.5], ['go', 23],
      ['sel', 'max'], ['go', 5], ['face', 1], ['act'], ['go', 6], ['act'], ['go', 7], ['act'], ['go', 8], ['act'], ['go', 13], ['go', 26], ['face', 1], ['act'], ['go', 27], ['act'], ['go', 28], ['act'], ['go', 31],
      ['sel', 'leo'], ['go', 32], ['go', 33], ['wait', 1.6], ['hold', { right: 1 }, 0.35], ['go', 34],
      ['sel', 'tank'], ['go', 40], ['sel', 'max'], ['go', 41],
      ['sel', 'leo'], ['go', 35], ['hold', { right: 1, jump: 1 }, 0.6], ['go', 39], ['hold', { right: 1, jump: 1 }, 1.2], ['go', 45], ['sel', 'tank'], ['go', 44], ['sel', 'max'], ['go', 46]],
  },
  {
    id: 'all', name: '十兄弟大會師', theme: 'sunset', bros: ['josh', 'jasper', 'hank', 'bobby', 'tiny', 'cliff', 'finn', 'tank', 'max', 'leo'],
    intro: '最後一關！十兄弟全員到齊，每個人都要出一份力，大家才走得到終點。',
    hint: '一路上每道關卡都只有一位兄弟打得開：裂牆找 Hank，柵欄找 Tiny，控制台是我，尖刺找 Tank，水底壓板找 Finn，斷崖找 Max，高台找 Bobby（Hank 再用箱子壓住門），高牆找 Cliff，最高的牆讓 Leo 飛過去，計時門交給 Jasper——他踩住壓板，上面的門就開了。',
    en: { name: 'All Ten Together', intro: 'The last level! All ten brothers are here, and every one of them has to do his part to reach the end.', hint: "Every obstacle along the way can only be opened by one brother: the cracked wall needs Hank, the grate Tiny, the control panel me, the spikes Tank, the underwater plate Finn, the drop Max, the high ledge Bobby (then Hank holds the door with a crate), the high wall Cliff, the highest wall Leo flies over, and the timed door is Jasper's — when he stands on the plate, the door above opens." },
    bridges: 'WB', planks: 3,
    map: make(134, 14, (b) => {
      ground(b, 0, 133, 11);
      b.box(13, 0, 13, 6, '#'); b.box(13, 7, 13, 10, 'C');
      b.box(16, 9, 18, 9, '-'); b.box(19, 5, 25, 5, '#'); b.box(19, 9, 25, 9, '#'); b.box(19, 6, 19, 8, 'n'); b.at(23, 8, 'a');
      b.box(26, 0, 26, 5, '#'); b.box(26, 6, 26, 8, 'n'); b.at(26, 9, '#'); b.at(26, 10, 'A');
      b.at(29, 10, 'q'); b.box(31, 0, 31, 6, '#'); b.box(31, 7, 31, 10, 'Q');
      b.box(34, 11, 41, 11, 'W'); b.box(34, 12, 41, 12, '^'); b.at(43, 10, 'w');
      b.box(47, 11, 56, 12, '~'); b.box(47, 11, 56, 11, 'B'); b.at(51, 12, 'b');
      b.box(60, 11, 62, 13, '.');
      b.box(66, 7, 67, 7, '#'); b.at(66, 6, 'd'); b.box(71, 0, 71, 6, '#'); b.box(71, 7, 71, 10, 'D'); b.at(74, 10, 'k'); b.at(77, 10, 'd');
      b.box(82, 4, 88, 8, '#'); b.box(82, 9, 82, 10, 'Y'); b.at(85, 3, 'y');
      b.at(92, 11, 'F'); b.box(96, 4, 96, 7, '#'); b.box(96, 8, 96, 10, 'Z'); b.at(98, 10, 'z');
      b.at(100, 10, 't'); b.box(115, 9, 117, 9, '-'); b.box(119, 7, 121, 7, '-'); b.box(122, 0, 122, 4, '#'); b.box(122, 5, 122, 6, 'G'); b.box(122, 7, 122, 8, '#'); b.box(122, 9, 122, 10, 'T'); b.at(125, 10, 'g');
      b.box(126, 9, 131, 10, 'E'); b.box(132, 0, 133, 10, '#');
      for (let i = 0; i < 10; i++) b.at(1 + i, 10, '@');
      for (const [x, y] of [[22, 7], [37, 8], [52, 9], [61, 8], [66, 3], [85, 1], [94, 2], [110, 8], [120, 5]]) b.at(x, y, '*');
    }),
    solve: (() => {
      const all = ['josh', 'jasper', 'hank', 'bobby', 'tiny', 'cliff', 'finn', 'tank', 'max', 'leo'], but = (...x) => all.filter((id) => !x.includes(id));
      const each = (ids, f) => ids.flatMap((id) => [['sel', id], ...f(id)]);
      return [
        ['sel', 'hank'], ['go', 12], ['face', 1], ['act'],
        ['sel', 'tiny'], ['go', 15], ['jump', 1, 0.35], ['go', 18], ['go', 23],
        ...each(but('tiny'), () => [['go', 28]]),
        ['sel', 'josh'], ['go', 29], ['act'],
        ['sel', 'tiny'], ['go', 27], ['go', 30],
        ['sel', 'tank'], ['go', 41], ['jump', 1, 0.5], ['go', 43],
        ...each(but('tank', 'finn'), () => [['go', 45]]),
        ['sel', 'finn'], ['go', 47], ['go', 51], ['wait', 0.6],
        ...each(but('finn', 'tank'), () => [['go', 58]]), ['sel', 'tank'], ['go', 57],
        ['sel', 'finn'], ['go', 55], ['go', 56], ['hold', { up: 1 }, 0.5], ['jump', 1, 0.5], ['go', 58],
        ['sel', 'max'], ['go', 59], ['face', 1], ['act'], ['go', 60], ['act'], ['go', 61], ['act'], ['go', 64],
        ...each(but('max'), () => [['go', 64]]),
        ['sel', 'bobby'], ['go', 65], ['hold', { jump: 1 }, 0.4], ['hold', { jump: 1, right: 1 }, 0.25], ['land'], ['go', 66],
        ['sel', 'hank'], ['go', 73], ['go', 76],
        ['sel', 'bobby'], ['go', 69], ['go', 73], ['go', 75], ['jump', 1, 0.5], ['go', 79],
        ...each(but('hank', 'bobby'), () => [['go', 73], ['go', 75], ['jump', 1, 0.5], ['go', 79]]),
        ['sel', 'hank'], ['jump', 1, 0.5], ['go', 79],
        ['sel', 'cliff'], ['go', 81], ['hold', { right: 1, up: 1 }, 2.4], ['hold', { right: 1 }, 0.3], ['go', 85],
        ...each(but('cliff'), () => [['go', 90]]),
        ['sel', 'cliff'], ['go', 89], ['go', 90],
        ['sel', 'leo'], ['go', 91], ['go', 92], ['wait', 1.6], ['hold', { right: 1, jump: 1 }, 1.6], ['go', 98],
        ...each(but('leo', 'jasper'), () => [['go', 108]]),
        ['sel', 'jasper'], ['go', 99], ['go', 125],
        ...each(but('jasper'), (id) => [['go', 114], ['jump', 1, 0.3], ['land'], ['go', 117], ['jump', 1, 0.35], ['land'], ['go', 121], ['go', 124], ['go', 127 + (all.indexOf(id) % 5)]]),
        ['sel', 'jasper'], ['go', 128],
      ];
    })(),
  },
  ...MORE(),
];

// ---------------------------------------------------------------- levels built from pieces
function fromPieces(spec) {
  const need = new Set(spec.extra || []);
  for (const [name, o] of spec.pieces) { for (const id of PIECES[name].needs) need.add(id); if (o) { need.add(o.stool); need.add(o.climber); } }
  const bros = ORDER.filter((id) => need.has(id)), n = bros.length, plates = [...'abdgjyz'], panels = [...'qrs'];
  let x = n + 2, bridges = '', planks = 0; const placed = [];
  for (const [name, o] of spec.pieces) {
    const P = PIECES[name], k = { ...(o || {}) };
    if (P.plate) { k.l = plates.shift(); k.L = k.l.toUpperCase(); if (P.bridge) bridges += k.L; }
    if (P.panel) { k.p = panels.shift(); k.P = k.p.toUpperCase(); if (P.bridge) bridges += k.P; }
    if (name === 'trench') bridges += 'W';
    planks += P.planks || 0; placed.push({ P, x, k }); x += P.w;
  }
  const ex = x + 1, ew = Math.max(3, n), w = ex + ew + 2;
  const map = make(w, 14, (b) => {
    ground(b, 0, w - 1, 11);
    for (const { P, x: px, k } of placed) { P.build(b, px, k); b.at(px + P.w - 1, 8, '*'); }
    b.box(ex, 9, ex + ew - 1, 10, 'E'); b.box(w - 2, 0, w - 1, 10, '#');
    for (let i = 0; i < n; i++) b.at(1 + i, 10, '@');
  });
  const steps = placed.map(({ P }) => P.hint);
  const zh = steps.map((h, i) => (i === 0 ? '先' : i === steps.length - 1 ? '最後' : '接著') + h[0]).join('；') + '。';
  const en = steps.map((h, i) => (i === 0 ? 'First, ' : i === steps.length - 1 ? 'Last, ' : 'Then ') + h[1].charAt(0).toLowerCase() + h[1].slice(1)).join('. ') + '.';
  const solve = [...placed.flatMap(({ P, x: px, k }) => P.solve(bros, px, k)), ...bros.flatMap((id, i) => [['sel', id], ['go', ex + (i % ew)]])];
  return { id: spec.id, name: spec.name[0], theme: spec.theme, bros, intro: spec.intro[0], hint: zh, en: { name: spec.name[1], intro: spec.intro[1], hint: en }, bridges, planks, map, solve };
}
function MORE() {
  const S = (stool, climber) => ['stackWall', { stool, climber }];
  return [
    { id: 'm11', name: ['碎石與控制台', 'Rubble and a Panel'], theme: 'meadow', intro: ['一道裂牆、一扇鎖著的門：Hank 出力，Josh 動腦。', 'A cracked wall and a locked door: Hank brings the muscle, Josh the brains.'], pieces: [['crack'], ['panel'], ['crack']] },
    { id: 'm12', name: ['踩著我的頭', 'Stand on My Head'], theme: 'meadow', intro: ['高台太高跳不上去？那就踩著哥哥的頭上去吧！', "The ledge is too high to jump? Then jump on your brother's head!"], pieces: [S('josh', 'jasper'), ['jasperPit'], S('jasper', 'josh')] },
    { id: 'm13', name: ['水花朵朵', 'Splash Pool'], theme: 'lake', intro: ['一座水池、一道斷崖。Finn 下水，Max 搭橋。', 'A pool and a drop. Finn dives in, Max builds a bridge.'], pieces: [['pool'], ['gap'], ['pool']] },
    { id: 'm14', name: ['地底小房間', 'The Hidden Room'], theme: 'cave', intro: ['洞穴裡藏著只有 Tiny 鑽得進去的小房間。', 'The cave hides a little room only Tiny can squeeze into.'], pieces: [['crack'], ['closet'], ['crack']] },
    { id: 'm15', name: ['鐵板一塊', 'Iron Plate'], theme: 'castle', intro: ['尖刺溝只有 Tank 走得過去；高台要靠兩兄弟疊起來。', 'Only Tank can walk the spike trench; the ledge takes two brothers stacked up.'], pieces: [['trench'], S('tank', 'max'), ['gap']] },
    { id: 'm16', name: ['風之谷', 'Valley of Wind'], theme: 'sky', intro: ['大坑寬得誰都跳不過——除了會飛的 Leo。', 'The pit is too wide for anyone to jump — except Leo, who flies.'], pieces: [['panel'], ['glideBridge']] },
    { id: 'm17', name: ['翻過大石塊', 'Over the Top'], theme: 'castle', intro: ['Cliff 爬上去，Hank 推箱子，石塊再高也不怕。', 'Cliff climbs, Hank pushes crates — no block is too high.'], pieces: [['crateStep'], ['cliffBlock'], ['crateStep']] },
    { id: 'm18', name: ['彈簧與木箱', 'Springs and Crates'], theme: 'meadow', intro: ['Bobby 跳上高台開門，可是他一離開門就關了……', 'Bobby jumps up to open the door — but it shuts the moment he leaves...'], pieces: [['bobbyCrate'], ['gap']] },
    { id: 'm19', name: ['和時間賽跑', 'Race the Clock'], theme: 'sunset', intro: ['計時門一下子就關上，全世界只有 Jasper 跑得贏它。', 'The timed door shuts in a flash — only Jasper can beat it.'], pieces: [['crack'], ['jasperTimed']] },
    { id: 'm20', name: ['小飛俠出動', 'Leo to the Rescue'], theme: 'lake', intro: ['高牆後面才有開門的壓板，水底也藏著一塊。', 'The plate that opens the gate is behind the high wall — and another lies under water.'], pieces: [['pool'], ['leoWall']] },
    { id: 'm21', name: ['三人同行', 'Three on the Road'], theme: 'cave', intro: ['橋、小房間和大石塊，三兄弟各管一關。', 'A bridge, a little room and a great block — one for each of three brothers.'], pieces: [['panelBridge'], ['closet'], ['cliffBlock']] },
    { id: 'm22', name: ['尖刺城', 'Spike Castle'], theme: 'castle', intro: ['城裡到處是尖刺和高牆。', 'The castle is full of spikes and high walls.'], pieces: [['crack'], ['trench'], ['bobbySolo']] },
    { id: 'm23', name: ['水上木橋', 'Planks on the Water'], theme: 'lake', intro: ['控制台、水池和斷崖，三兄弟輪流上場。', 'A control panel, a pool and a drop — three brothers take turns.'], pieces: [['panel'], ['pool'], ['gap']] },
    { id: 'm24', name: ['高台接力', 'Ledge Relay'], theme: 'meadow', intro: ['一個墊腳、一個踩頭，再讓 Bobby 一跳衝天。', 'One gives a leg up, one climbs, and Bobby springs sky-high.'], pieces: [S('hank', 'tiny'), ['bobbyBridge'], ['crateStep']] },
    { id: 'm25', name: ['飛越深淵', 'Over the Abyss'], theme: 'sky', intro: ['兩個大坑：一個要飛的，一個要跑的。', 'Two great pits: one for the flyer, one for the runner.'], pieces: [['jasperPit'], ['glideBridge']] },
    { id: 'm26', name: ['雙重祕道', 'Twin Tunnels'], theme: 'cave', intro: ['柵欄、石塊和木箱，三個兄弟各顯神通。', 'Grates, blocks and crates — three brothers, three gifts.'], pieces: [['crateStep'], ['closet'], ['cliffBlock']] },
    { id: 'm27', name: ['四兄弟', 'Four Brothers'], theme: 'castle', intro: ['四道關卡、四個兄弟，一個都不能少。', 'Four obstacles, four brothers — not one can be left out.'], pieces: [['panel'], ['trench'], ['pool'], ['gap']] },
    { id: 'm28', name: ['風與沙', 'Wind and Sand'], theme: 'sunset', intro: ['Leo 飛過高牆，Jasper 跑贏計時門。', 'Leo flies over the wall; Jasper outruns the timed door.'], pieces: [['leoWall'], ['jasperTimed']] },
    { id: 'm29', name: ['疊羅漢大賽', 'Tower of Brothers'], theme: 'meadow', intro: ['兩座高台，換不同的兄弟墊腳。', 'Two ledges — a different brother gives the leg up each time.'], pieces: [S('josh', 'max'), ['crack'], S('max', 'finn'), ['pool']] },
    { id: 'm30', name: ['黑暗洞窟', 'Dark Cavern'], theme: 'cave', intro: ['又黑又深的洞穴，要四個兄弟一起才走得出去。', 'A deep, dark cave that takes four brothers to get out of.'], pieces: [['crack'], ['closet'], ['panelBridge'], ['gap']] },
    { id: 'm31', name: ['攻城', 'Storm the Castle'], theme: 'castle', intro: ['城門、城牆和尖刺溝，一路攻進去！', 'Gates, walls and a spike trench — fight your way in!'], pieces: [['bobbyCrate'], ['cliffBlock'], ['trench']] },
    { id: 'm32', name: ['湖心島', 'Island in the Lake'], theme: 'lake', intro: ['湖中央有座島，島後面有個大坑。', 'There is an island in the middle of the lake, and a great pit behind it.'], pieces: [['panel'], ['pool'], ['glideBridge']] },
    { id: 'm33', name: ['五兄弟', 'Five Brothers'], theme: 'sky', intro: ['五種本領，一關一關接力。', 'Five gifts, one after another.'], pieces: [['jasperPit'], ['crack'], ['closet'], ['pool'], ['cliffBlock']] },
    { id: 'm34', name: ['天空之路', 'Road in the Sky'], theme: 'sky', intro: ['雲上的路斷斷續續，要飛、要跳、還要搭橋。', 'The road through the clouds keeps breaking: fly, spring and build.'], pieces: [['glideBridge'], ['bobbyBridge'], ['gap']] },
    { id: 'm35', name: ['銅牆鐵壁', 'Iron Walls'], theme: 'castle', intro: ['Tank 當墊腳石，Josh 踩著他上高台。', 'Tank gives Josh a leg up to the ledge.'], pieces: [['trench'], ['crateStep'], ['panel'], S('tank', 'josh')] },
    { id: 'm36', name: ['夕陽賽道', 'Sunset Run'], theme: 'sunset', intro: ['跑、跳、搭橋，趕在太陽下山前回家！', 'Run, spring and build — home before the sun goes down!'], pieces: [['bobbySolo'], ['jasperTimed'], ['gap']] },
    { id: 'm37', name: ['地底河', 'Underground River'], theme: 'cave', intro: ['洞穴深處有一條地底河。', 'Deep in the cave runs an underground river.'], pieces: [['crack'], ['closet'], ['pool'], ['panelBridge']] },
    { id: 'm38', name: ['六兄弟', 'Six Brothers'], theme: 'sunset', intro: ['六個兄弟、六道關卡，一路接力到終點。', 'Six brothers, six obstacles, a relay all the way to the end.'], pieces: [['crack'], ['panel'], ['trench'], ['pool'], ['gap'], ['leoWall']] },
    { id: 'm39', name: ['七兄弟', 'Seven Brothers'], theme: 'meadow', intro: ['七個兄弟，長長的一條路。', 'Seven brothers and a long, long road.'], pieces: [['jasperPit'], ['closet'], ['cliffBlock'], ['bobbyCrate'], ['glideBridge'], ['gap']] },
    { id: 'm40', name: ['再一次大會師', 'All Together Again'], theme: 'sunset', intro: ['真正的最後一關！十兄弟再次全員出動。', 'The true final level! All ten brothers set out once more.'], pieces: [['panelBridge'], ['closet'], ['bobbySolo'], ['crateStep'], ['cliffBlock'], ['trench'], ['pool'], ['gap'], ['glideBridge'], ['jasperTimed']] },
  ].map(fromPieces);
}
