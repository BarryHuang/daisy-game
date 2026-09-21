# 背景音樂（選用）

這個資料夾**可以是空的**。空的時候，`audio.js` 會用 Web Audio 即時演奏
每張地圖自己的曲子（每首只有幾百 bytes 的和弦＋旋律資料）。

想換成真的音樂，把檔案照地圖名字丟進來就好，程式不用改：

```
music/home.mp3      🏠 倉鼠的家
music/garden.mp3    🌻 後院草地
music/park.mp3      🌳 大公園
music/street.mp3    🏙️ 熱鬧街道
music/arcade.mp3    🕹️ 遊戲中心
music/fair.mp3      🎠 遊樂園
music/beach.mp3     🏖️ 陽光沙灘
```

`.ogg` 也可以（先找 `.mp3`，沒有才找 `.ogg`）。
只放其中幾首也行 —— 沒有檔案的那幾張地圖會自動退回即時演奏。

## 三件一定要注意的事

**① 檔案要小。** 這是離線 PWA，Service Worker 會把資源整包快取起來。
七首兩分鐘的 MP3 大概 20MB，手機第一次載會等到天荒地老。建議：

- 剪成 **30~60 秒、頭尾接得起來的循環段**（程式是 `loop = true`，會一直接下去）
- **64~96kbps、單聲道**
- 每首控制在 **300~500KB**

**② 檔名要加進 `sw.js` 的快取清單**，不然離線時沒有音樂。
加在 `'./audio.js'` 那幾行旁邊就好。

**③ 授權挑 CC0 或公共領域。** 這個 repo 是公開的，把檔案放進來等於在散布
它們。CC-BY 也可以，但要標註出處 —— 那就順便把出處寫進 `README.md`
和遊戲裡的 ⚙️ 設定面板。

## 去哪裡找

| 來源 | 授權 | 備註 |
|---|---|---|
| [FreePD](https://freepd.com/) — Comedy / Happy 分類 | 公共領域，不用標註 | 最省事，輕快可愛的曲子很多 |
| [Pixabay Music](https://pixabay.com/music/) — 搜 kids / playful / ukulele / marimba | 不用標註，可商用 | 木琴＋烏克麗麗的音色跟倉鼠世界最搭 |
| [Kenney](https://kenney.nl/assets) — Music Jingles | CC0 | 短過場音樂好用，曲目較少 |
| [itch.io](https://itch.io/game-assets/free/tag-music) | 依各包 | 有整包的 cute farm / pixel village 系列 |
| [Incompetech](https://incompetech.com/music/royalty-free/music.html) | CC-BY 4.0，要標註 | Pixel Peeker Polka、Fluffing a Duck、Carefree 氣質最對 |
| [OpenGameArt](https://opengameart.org/) — 篩 CC0 | 依作品 | 雜，但挖得到寶 |

## 運作方式

`musicPlay(地圖名)` 會先用即時演奏頂著，同時去抓 `music/<地圖>.mp3`。
抓到而且解碼成功就**無縫換手**成音檔；抓不到（404）就記下來，之後不再重試。

這樣設計是因為抓檔案是非同步的 —— 一進地圖就等檔案的話，會有一兩秒的
空白；先讓即時演奏補上，聽起來才連續。

## 一個預期內的小雜訊

沒放音檔的地圖，第一次進去時 Console 會出現兩筆 404（`.mp3` 和 `.ogg` 各試一次）。
那是正常的 —— 程式就是靠「抓不到」來判斷要不要退回即時演奏，
試過一次就記起來，不會重複抓。不想看到的話就是把音檔補齊。
