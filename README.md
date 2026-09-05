# daisy-game

給 Daisy 的英文學習 PWA。多個獨立 HTML 頁面，共用資料與樣式，用 Firebase
Realtime Database 跨裝置同步，倉鼠寵物當獎勵層。

---

## 使用者是誰（所有設計決策的前提）

- 七歲，就讀雙語國際學校
- **英文閱讀** ≈ 台灣國中一年級程度
- **中文是母語，口語流利**；但**識字**只有小一升小二程度
- 學校用 **myON** 出線上閱讀作業。**myON 的閱讀器選不起字**，所以瀏覽器
  擴充功能、bookmarklet 這類注入式方案全部無效
- 目前和家長一起讀，未來會自己讀

**核心洞察**：她聽得懂「驚訝」，只是不認得那兩個字。所以**每個中文字都標注音
就是完整解答**——注音不是輔助功能，它是產品本身。

---

## 檔案結構

### 資料層
| 檔案 | 內容 |
|---|---|
| `words.js` | 她的課堂單字（FET Spelling / CET Vocabulary 按週，Santa Sleigh 這種讀本單元按組）。`wordEntries` 是主資料，每個字可有多個義項、注音逐字對齊。`wordTranslations` 由它自動產生，供舊遊戲使用 |
| `cedict.js` | 4.8 MB（gzip 1.75 MB），71,753 個中文詞、68,664 個英文查詢鍵。整部 CC-CEDICT，無門檻（CC BY-SA 4.0） |
| `firebase-config.js` | 全站唯一一份 Firebase 設定 + 延遲載入 SDK |
| `exams.js` | 測驗題庫的學期登錄表。題庫綁學期，舊的留著當參考但不再是預設 |

### 共用模組
| 檔案 | 用途 |
|---|---|
| `zhuyin.js` | 直排注音渲染器（台灣課本排法），樣式自動注入 |
| `inflect.js` | 詞形還原：產生候選字形再去索引裡試。含英式→美式拼法 |
| `lookups.js` | 記錄查過的單字。先寫 localStorage，有登入才同步雲端 |
| `wordlists.js` | 她自己建的單字卡清單。在字典加字，會出現在 `flashcards.html` 和遊戲選單 |
| `mastery.js` | 每個字的答對／答錯／連對次數 |
| `rewards.js` | `awardCoins()`：遊戲把金幣加進倉鼠存檔。用 transaction，因為倉鼠頁可能同時開著並整包寫回 `petData` |
| `wordset.js` | 進遊戲時隨機挑一組單字集。`pickRandomCategory()` / `applyPendingWeek()` 各加一行，見下面第 12 條 |

### 導覽
主頁是 `daisy_hamster.html`（PWA 的 `start_url` 也指這裡）。
`menu.js` 在每一頁左上角注入浮動下拉選單，那就是全站導覽——
沒有獨立的首頁，`index.html` 只是把網站根目錄轉址到倉鼠頁
（Pages 根目錄需要有 index.html，否則會退回渲染 README）。

### 頁面
`daisy_dictionary.html`（查單字）· `wordbook.html`（單字總表）·
`story_hub.html`（課文）· `daisy_hamster.html`（主遊戲）·
`parent_dashboard.html` · `words_review.html`（注音校對工具）

`wordbook.html` 是給她自己翻的總表：課表 523 個字（外加她的單字卡和查過的字），
可搜尋英文或中文、依課表或字母排序、只看要加強的；每個字顯示 emoji、中文加注音、
熟練度（✅ 學會／🔥 要加強／○ 沒練過），點一下會唸出來並展開例句。
家長後台的「還沒學會的字」是給爸媽看雲端紀錄的，兩者不重疊。

遊戲頁（都吃同一組題庫來源：本學期字表 → 她自建的清單 → 查過的字 → 弱字）：

| 頁面 | 練什麼 |
|---|---|
| `daisy_hangman.html` 猜單字 | 拼字 |
| `daisy_scramble.html` 字母重組 | 拼字 |
| `daisy_snake.html` 彩虹小蟲 | 拼字 |
| `daisy_hex.html` 圍貓貓 | 純益智，不練單字 |
| `daisy_memory.html` 翻翻樂 | 英文↔中文配對 |
| `daisy_whack.html` 打地鼠 | 聽發音／看中文，選對的字 |
| `daisy_boss.html` 弱字怪獸戰 | 弱字，一個字問三種題型 |
| `daisy_runner.html` 倉鼠跑酷 | 反射速度下的字義判斷 |
| `daisy_restaurant.html` 倉鼠餐廳 | 整句聽力＋食物與數量（菜單寫在頁面內，不吃課本字表） |
| `daisy_pusher.html` 單字推幣機 | 答對拿硬幣，再抓時機投；台面跨局累積不重鋪 |
| `daisy_claw.html` 單字夾娃娃 | 同上，外加瞄準；夾到的字留在收藏櫃 |

`daisy_multiply.html`（九九乘法）是唯一不吃單字表的頁面：左邊看整段乘法表、
點一格用中文唸出來，右邊做選擇題。它自己記熟練度（`localStorage["daisy_multiply"]`
＋ `users/<CODE>/multiply`），格式跟 `mastery.js` 一樣但**故意不共用** ——
`getWeakWords()` 不帶 pool 時會把整份資料倒給弱字怪獸戰當題庫，
`"7x8"` 混進去，遊戲會叫她拼一個不存在的單字。

---

## 已知的坑（動手前先讀）

1. **wordfreq 的中文語料偏大陸。** 直接拿它排序會得到 視頻／信息／軟件 而不是
   影片／資訊／軟體。`build_cedict.py` 用三個訊號修正（OpenCC `s2twp`、
   CC-CEDICT 的 `(Tw)` 標記、成對提權）。台灣用詞還要**豁免最低詞頻門檻**，
   否則 `印表機`（zipf 2.24）會被當罕見詞丟掉。

2. **詞頻綁「字形」不綁「讀音」。** `強[jiàng]`（頑固）會偷走 `強[qiáng]` 的
   高詞頻。單字詞的次要讀音要重罰，否則 `的[di1]` 會變成 "taxi" 的答案。

3. **pypinyin 的詞組字典是簡體鍵值。** 繁體字要先逐字轉簡再查，否則
   「睡覺」會念成 ㄕㄨㄟˋ ㄐㄩㄝˊ。但繁簡合併會反咬：`隻`→`只` 變 ㄓˇ、
   `擦乾`→`擦干` 變 ㄍㄢˋ。

4. **不要再加詞頻門檻。** 曾經兩邊各設 2.5，害 `pangolin` 查不到
   （穿山甲中文 2.26、英文 2.36，兩道都砍）。後來實測：**把門檻全部拿掉，
   25 個回歸樣本只有 4 個變動，而且第一名全部不變**，檔案只從 4.12 長到
   4.77 MB。門檻對排序品質幾乎沒貢獻（計分本身已經處理了），卻一直在
   製造涵蓋漏洞。

   順帶記一下規模的天花板：**整部 CC-CEDICT 在這個壓縮格式下就是 ~4.8 MB**，
   沒有「再放寬就能查到更多」這回事。剩下查不到的字是 CC-CEDICT 本身沒有。

5. **演算法有天花板。** 詞頻、義項位置、語域、破音字、字數、地區訊號全部用盡
   後，仍有約三分之一是選錯義項（`sentence → 判處`）。這種錯誤只能人工修，
   見 `build_cedict.py` 的 `OVERRIDES`。

6. **注音以家長判斷為準。** 交叉比對顯示原本手工的注音常比自動管線準
   （`長滿草的 ㄓㄤˇ`、`快速地 ˙ㄉㄜ`）。家長已決定 `建築物` 保留 ㄓㄨˊ、
   `記得` 保留 ㄉㄜˊ，**不要改回去**。

7. **`words.js` 有四個頂層宣告，不是兩個。** `words`、`wordTranslations`、
   `wordImages`（每個字的 emoji）、`wordExamples`（每個字的英文例句）。
   後兩個只有倉鼠頁的複習卡在用，很容易在改動時被漏掉——2026-08 就漏過一次，
   結果複習卡按「下一個」直接黑畫面。

8. **`wordlists.js` 的 `words` 是 `{w, zh, z}` 物件，不是字串。**
   改成物件時漏改 `flashcards.html`，`deck[pos]` 變成物件卻還被當字串用，
   丟出 `word.toLowerCase is not a function`。而且它發生在 `async` 函式裡，
   變成 unhandled rejection —— **畫面只是卡在「準備中…」，什麼都不顯示**。
   非同步流程要自己接錯誤，否則失敗是無聲的。

9. **`.zh` 這個 class 撞過兩次。** 它是「中文詞本體」的樣式（字級 1.8rem 以上、
   `flex:1`），發音鈕如果也叫 `.zh` 會被套上去，變成又大又會撐開版面。
   按鈕一律用 `.say-zh`。

10. **遊戲的下拉選單不能重建。** `setupConfig()` 會連帶呼叫 `init()`，
   Firebase 資料若在她玩到一半才回來，會把進行中的遊戲重置掉。只 append
   `<option>`。

11. **推幣機的幣堆是單層的，開局就必須鋪到出口邊緣。** `daisy_pusher.html`
   的物理很簡單：推板是一道會前進的牆，幣互相擠開，越過前緣就掉進獎池。
   兩件事只有實測才看得出來：

   - 投一枚幣，整堆只會前進「一枚的面積 ÷ 台寬」≈ 2px。所以幣堆前緣若離出口
     還有 18px，要投十幾顆才會有第一枚掉下來 —— 實測前三個版本整場零掉幣。
     開局要鋪到 `EDGE - 1`，才是真的推幣機：投一顆大概掉一顆，偶爾雪崩。
   - 推板要從**完全伸出**的位置起跑（`clock = PERIOD / 2`）。從縮回處起跑的話，
     第一趟會把整堆往前平移一個衝程，還沒投幣就先嘩啦啦掉一排。縮回時幣堆
     留在原地，下一趟只推到同一點，所以之後推板空轉並不會再送幣。

   鋪幣的密度要按台面面積算（`AREA_PER_COIN`），不能寫死顆數：同樣 70 顆在
   手機上擠爆、在 iPad 上稀到推力傳不過去。

   **台面不重鋪。** 上一局辛苦推到快掉下去的寶石，開新局如果重鋪就白費了 ——
   那是這個遊戲最有價值的東西。`ensureTable()` 只在台上不到 25 枚時才
   `fillMachine()`，平常一路留著，還存進 `localStorage["daisy_pusher_table"]`
   （連同當時的台寬，換裝置或轉向時等比例縮回來）。讀回來只跑 8 次 `separate()`：
   存下來的排法本來就擠開過了，跑太多次會把她推到前緣的那一疊往回推散。

   連帶兩件事：獎品被推下去就不會再有，所以 `topUpPrizes()` 每題檢查、少於兩個
   補一個，但**只補小獎**（🍭⭐🎁）—— 💎 和 🧸 只能靠開台就埋著的，或連對三次
   換來的。實測補太大方的版本，一局打完台上躺著四顆 💎，那就不用推了。
   另外快掉下去的獎品會畫一圈呼吸的光，開局的訊息也會說「上次推到一半的 💎
   還在最前面」。

   **落點由她抓時機決定。** 投幣頭在最上方的軌道來回跑（越後面的題目跑越快），
   答對只是拿到投幣的權利，按下投幣鈕的那一刻投幣頭在哪就落在哪。
   所以 `dropCoin()` **不能加隨機偏移** —— 加了「抓時機」就沒有意義了。

12. **隨機單字集要從「所有 (類別, 週次) 組合」裡抽，不能先抽類別再抽週次。**
   `words` 的各類別大小差很多：二上 FET Spelling 15 組、二上 CET Vocabulary
   14 組、二上 Santa Sleigh 7 組、一下兩份各 12／13 組，常用單字只有 2 組
   （星期、月份）。先抽類別的話，她有六分之一的機會拿到星期或月份。
   攤平抽之後常用單字佔 2/63 ≈ 3.2%。
   （當初只有一下時的實測：3000 抽，常用單字 7.3%，對上 2/27 = 7.4%，
   27 組每組 92～130 次。）

   接法是 `wordset.js` 的兩個一行呼叫，順序不能顛倒 —— 週次的 `<option>` 在
   `setupWeek()` 跑完之前並不存在，所以抽到的週次要先記在 `pendingWeek`：

   ```js
   function setupConfig() {
       catS.innerHTML = ...;
       pickRandomCategory(catS);      // 記下類別和週次
       setupWeek();
   }
   function setupWeek() {
       wkS.innerHTML = ...;
       applyPendingWeek(wkS);         // 一定要在下面那行開局之前
       resetGame();
   }
   ```

   只在載入時生效一次，之後她自己換類別，週次照舊停在第一組。

   結算畫面的「再玩一次」則走 `shuffleWordSet(catS, wkS, setupWeek)`，換一組再開局。
   它排掉剛玩完的那一組（否則約 1/27 會原地重來），而且**她自己點的類別不會被洗掉**：
   「🔥 加強複習」「⭐ 我的單字卡」「⭐ 我查過的字」是遊戲載入後才塞進 `words` 的，
   不在抽籤池裡 —— 在那些類別裡按再玩一次，只會換類別內的組。選了「加強複習」
   卻被丟去背星期月份是最惱人的。猜單字和字母重組沒有「一輪」，它們的
   「換個單字」是在同一組裡換字，維持原樣。

13. **Service Worker 的 `cache.add(url)` 會走瀏覽器的 HTTP 快取。**
   GitHub Pages 對這些檔案送 `Cache-Control: max-age=600`，所以「清掉快取重裝」
   會從 HTTP 快取抓回同一批舊檔，原封不動存進新名字的快取裡 —— 快取名是新的、
   版本號還是舊的，看起來像更新過了，實際上一個字都沒換。
   `install` 一定要 `cache.add(new Request(url, { cache: 'reload' }))`。

   同一顆 bug 在選單的「強制更新」上還有兩層：

   - 它原本會 `unregister()` Service Worker。註銷之後頁面重新註冊、重新 install，
     正好觸發上面那件事，等於把剛刪掉的舊檔又抓回來。改成 `registration.update()`：
     它會繞過 HTTP 快取重抓 `sw.js`，新的 SW 再用 `cache:'reload'` 裝一份真的新的。
   - 結尾原本是 `location.reload(true)`。**那個 `true` 早就從規範拿掉、所有瀏覽器
     都忽略**，等於普通重整，照樣吃 HTTP 快取。
   - 順序不能顛倒：先刪快取再 `update()`，反過來會把新裝好的檔案刪掉。

   實測（用會送 `max-age=600` 的伺服器模擬 Pages，比對修正前後）：
   修正前部署後重整四次都還是舊版、按強制更新也毫無作用；修正後重整第二次就換新，
   按強制更新立刻換新。這個測試值得留著 —— 光看程式碼三個坑都不明顯。

14. **版本號本身也可能是從快取來的。** 選單顯示的數字讀自快取裡的 `version.js`，
   快取是舊的那個數字就是舊的，於是「已經最新」和「根本沒更新到」長得一模一樣。
   `checkForUpdate()` 改成直接向網路要 `version.js?ts=…`（`cache: "no-store"`）
   來核對，有新版就在 ☰ 上點紅點、把按鈕改成「更新到 …」，並主動叫 SW 去裝。
   `sw.js` 也因此改成不快取帶查詢字串的請求。

---

## 測試技巧：怎麼從外面驅動頁面

頁面之間是 classic script，頂層的 `const`（`words`、`CURRENT_TERM`、
`EXAM_TERMS`、`meaningOf`…）是**詞法綁定，不是 `window` 的屬性**，所以
`iframe.contentWindow.words` 一律是 `undefined`。這一點踩過三次。

要從外面驅動，把測試碼**注入成頁面自己的 `<script>`**，它就跟其他 classic
script 共用同一個詞法環境：

```js
const s = iframe.contentDocument.createElement('script');
s.textContent = `attachWordlistCategory(words, function(){ ... });`;
iframe.contentDocument.body.appendChild(s);
```

## 本機測試

```bash
python3 -m http.server 8123
# http://localhost:8123/story_hub.html
```

Service Worker 需要 `http://` 或 `localhost`，用 `file://` 開測不到離線功能。

**部署前一定要跑**（`CACHE_NAME` 不再手動改）：

```bash
python3 tools/stamp_version.py    # 蓋版本到 version.js 和 sw.js
```

版本號是部署時間（**台北時間**，寫死 +08:00，不看跑的機器在哪個時區 ——
在雲端跑會是 UTC，差 8 小時，手機上看到的時間就對不上，而且「比大小知新舊」
會反過來），會顯示在每一頁左上角選單的最上面。手機上重新整理之後
打開選單就能確認載到的是不是最新版；還是舊的就按旁邊的「強制更新」，
它會清掉所有快取、註銷 Service Worker 再重載。

---

## 目前進度

PR #12（分支 `fix/word-data-and-sw`）包含：

- 修好 `sw.js`（原本 `addAll(ASSETS_TO_CACHE)` 變數名打錯，**離線快取從來沒生效過**）
- `words.js` 改成結構化多義項格式，修正 21 筆注音
- 新增字典（`daisy_dictionary.html` + `cedict.js`）
- 查詢紀錄閉環：查過的字 → 家長後台 → 遊戲題庫
- 收斂重複資料：`words` 和 Firebase 設定各自從多份變成一份

**尚未合併，尚未在真實環境測試。**

---

## 接下來要做的

0. **二上題庫** — 單字表已經匯入（`CURRENT_TERM` 已指向 `"2-1"`），還缺測驗題庫：
   新增 `term2_1_questions.js`，在 `exams.js` 的 `EXAM_TERMS` 加一組。
   在那之前 `examCurrentTerm()` 會自己退回一下的題庫，不會壞。倉鼠頁不用改
1. **作業容器** — 每次閱讀作業一組生字，紀錄才有意義、遊戲題庫才有範圍
2. **複習排程** — 熟練度資料已經在收集了，還沒有東西去用它。
   `getWeakWords()` 可以直接餵給遊戲當題庫
3. **人工核心層** — 匯入教育部「國中小基本字彙」，用 `OVERRIDES` 機制

已完成：窄欄版面（iPad 分割畫面）、語音輸入、學期分層、逐字熟練度、
單字表匯入工具、二上（2026-2027 Fall）單字表。

## 待處理的風險與技術債

- ⚠️ **Realtime Database 安全規則**（家長要確認）。repo 是公開的，資料庫位址
  等於公開，防線全在規則上。若是 `{".read": true, ".write": true}`，任何人都能
  讀寫甚至清空她的學習紀錄
- `parent_dashboard.html` 用 Firebase 8.10.1，其餘頁面用 10.9.0

---

## 建置腳本

字典資料不是手寫的，由腳本產生（腳本未納入本 repo，在開發機上）：
`build_cedict.py`（CC-CEDICT → `cedict.js`）、`build_irregular.py`（不規則
變化表）、`migrate_words.py`（`words.js` 格式遷移）。
需要 `pypinyin`、`opencc-python-reimplemented`、`wordfreq`、`jieba`、`lemminflect`。
