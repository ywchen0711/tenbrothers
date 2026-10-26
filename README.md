# 十兄弟 · Ten Brothers

可愛像素風的橫向解謎過關遊戲。十個兄弟各有一種本領，每一關都要好幾個兄弟一起動腦、輪流出力，才過得去。

| | 兄弟 | 本領 |
|---|---|---|
| 老大 | **Josh 智多星** | 只有他看得懂控制台，按 X 開關同色的門；卡關時按 H，他會想出提示 |
| 老二 | **Jasper 飛毛腿** | 跑得最快、跳得最遠，趕得上計時門 |
| 老三 | **Hank 大力士** | 推得動木箱，一拳打碎裂牆 |
| 老四 | **Bobby 彈簧腿** | 跳得比別人高一倍 |
| 老五 | **Tiny 小不點** | 個子最小，鑽得過鐵柵欄 |
| 老六 | **Cliff 壁虎** | 貼著牆就能往上爬 |
| 老七 | **Finn 浪裡白條** | 只有他會游泳，潛得到水底的壓板 |
| 老八 | **Tank 鐵布衫** | 不怕尖刺，壓得下鐵壓板 |
| 老九 | **Max 巧手** | 隨身帶木板，到哪兒都能搭橋 |
| 老十 | **Leo 小飛俠** | 撐傘滑翔，乘著風扇飛上高處 |

- **十關**：兄弟出發、大力士的箱子、小不點的祕密通道、尖刺與高牆、過河、乘風而上、三兄弟同心、水底的機關、鐵木與傘，最後一關十兄弟大會師，每個兄弟都要出一份力。
- **機關**：同色的壓板與門、只有 Josh 會用的控制台、計時按鈕、只有 Tank 壓得下的鐵壓板、只有站著才出現的橋、木箱、裂牆、鐵柵欄、尖刺、水、風扇。兄弟之間還可以疊羅漢——站在別人頭上跳得更高。
- 每關有星星可以收集，進度會自動記錄。

操作：← → 走，↑ / 空白鍵 / Z 跳（Cliff 用 ↑ 爬牆，Finn 用 ↑ 游泳），X 使出本領，Tab / Q / E 或數字 1～0 換兄弟（也可以點上方的頭像），H 提示，R 重來，Esc 選單。手機上有虛擬按鈕。

Play: https://ywchen0711.github.io/tenbrothers/

Pure HTML / Canvas / ES modules, no build step; all art and sound are made in code. The rules live in `js/engine.js` with no drawing in them, and `node tools/solve.mjs` plays every level's built-in solution through those rules to prove each one can be finished.
