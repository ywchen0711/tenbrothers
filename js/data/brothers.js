// The ten brothers, eldest first. Each can do one thing the others cannot, and every level needs several of them.
//   speed: running speed (pixels a second); jump: the speed they leave the ground with; w, h: their size
export const BROTHERS = {
  josh:   { n: 1, name: 'Josh', zh: '智多星', can: 'panel', skill: '操作機關', desc: '只有他看得懂控制台：站在控制台前按 X，打開或關上同一顏色的門。卡關時按 H，他會想出一條提示。', shirt: '#3a7ad8', hair: '#5a3a24', speed: 92, jump: 285 },
  jasper: { n: 2, name: 'Jasper', zh: '飛毛腿', can: 'run', skill: '跑得飛快', desc: '跑得比誰都快，跳得也最遠，能趕在計時門關上之前衝過去。', shirt: '#e8503a', hair: '#e8a838', speed: 196, jump: 285 },
  hank:   { n: 3, name: 'Hank', zh: '大力士', can: 'strong', skill: '推箱、碎牆', desc: '只有他推得動木箱；站在裂開的牆前按 X，一拳打碎它。', shirt: '#7a5ad0', hair: '#2a2024', speed: 82, jump: 270 },
  bobby:  { n: 4, name: 'Bobby', zh: '彈簧腿', can: 'hop', skill: '跳得很高', desc: '一跳就是別人的兩倍高。', shirt: '#4ab868', hair: '#c8602a', speed: 92, jump: 405 },
  tiny:   { n: 5, name: 'Tiny', zh: '小不點', can: 'small', skill: '鑽過柵欄', desc: '個子最小，鑽得過別人過不去的鐵柵欄。', shirt: '#f0a0c0', hair: '#3a2a1a', speed: 86, jump: 280, w: 9, h: 10 },
  cliff:  { n: 6, name: 'Cliff', zh: '壁虎', can: 'climb', skill: '攀牆', desc: '貼著牆按住 ↑ 就能往上爬。', shirt: '#3ab0b0', hair: '#2a2024', speed: 90, jump: 285 },
  finn:   { n: 7, name: 'Finn', zh: '浪裡白條', can: 'swim', skill: '游泳', desc: '只有他會游泳：在水裡按 ↑ 或跳往上游。別的兄弟掉進水裡會被沖回起點。', shirt: '#38a8e8', hair: '#f0d070', speed: 90, jump: 285 },
  tank:   { n: 8, name: 'Tank', zh: '鐵布衫', can: 'tough', skill: '不怕尖刺', desc: '踩在尖刺上也不痛；他夠重，壓得下鐵壓板。', shirt: '#8a8a98', hair: '#4a3a2a', speed: 74, jump: 272 },
  max:    { n: 9, name: 'Max', zh: '巧手', can: 'build', skill: '搭木板', desc: '站在邊上按 X，在前面搭一塊木板橋（每關木板有限）。', shirt: '#e8b030', hair: '#7a4a2a', speed: 88, jump: 280 },
  leo:    { n: 10, name: 'Leo', zh: '小飛俠', can: 'glide', skill: '撐傘滑翔', desc: '在空中按住跳，撐開小傘慢慢飄；站到風扇上，風會把他吹上去。', shirt: '#a8d848', hair: '#d8483a', speed: 90, jump: 285 },
};
export const ORDER = Object.keys(BROTHERS);
