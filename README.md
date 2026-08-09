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
| `words.js` | 她的課堂單字（FET Spelling / CET Vocabulary，按週）。`wordEntries` 是主資料，每個字可有多個義項、注音逐字對齊。`wordTranslations` 由它自動產生，供舊遊戲使用 |
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

### 導覽
主頁是 `daisy_hamster.html`（PWA 的 `start_url` 也指這裡）。
`menu.js` 在每一頁左上角注入浮動下拉選單，那就是全站導覽——
沒有獨立的首頁，`index.html` 只是把網站根目錄轉址到倉鼠頁
（Pages 根目錄需要有 index.html，否則會退回渲染 README）。

### 頁面
`daisy_dictionary.html`（查單字）· `story_hub.html`（課文）·
`daisy_hamster.html`（主遊戲）· `daisy_hangman.html` · `daisy_scramble.html` ·
`daisy_snake.html` · `parent_dashboard.html` · `words_review.html`（注音校對工具）

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

8. **`.zh` 這個 class 撞過兩次。** 它是「中文詞本體」的樣式（字級 1.8rem 以上、
   `flex:1`），發音鈕如果也叫 `.zh` 會被套上去，變成又大又會撐開版面。
   按鈕一律用 `.say-zh`。

9. **遊戲的下拉選單不能重建。** `setupConfig()` 會連帶呼叫 `init()`，
   Firebase 資料若在她玩到一半才回來，會把進行中的遊戲重置掉。只 append
   `<option>`。

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

版本號是部署時間，會顯示在每一頁左上角選單的最上面。手機上重新整理之後
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

0. **二上題庫** — 新增 `term2_1_questions.js`，在 `exams.js` 的 `EXAM_TERMS`
   加一組，`words.js` 的 `CURRENT_TERM` 改過去。倉鼠頁不用改
1. **作業容器** — 每次閱讀作業一組生字，紀錄才有意義、遊戲題庫才有範圍
2. **複習排程** — 熟練度資料已經在收集了，還沒有東西去用它。
   `getWeakWords()` 可以直接餵給遊戲當題庫
3. **人工核心層** — 匯入教育部「國中小基本字彙」，用 `OVERRIDES` 機制

已完成：窄欄版面（iPad 分割畫面）、語音輸入、學期分層、逐字熟練度、
單字表匯入工具。

## 待處理的風險與技術債

- ⚠️ **Realtime Database 安全規則**（家長要確認）。repo 是公開的，資料庫位址
  等於公開，防線全在規則上。若是 `{".read": true, ".write": true}`，任何人都能
  讀寫甚至清空她的學習紀錄
- `daisy_hamster.html` 與 `daisy_hamster_beta.html` 有 1,275 行差異，是兩份
  平行演化的複本
- `parent_dashboard.html` 用 Firebase 8.10.1，其餘頁面用 10.9.0

---

## 建置腳本

字典資料不是手寫的，由腳本產生（腳本未納入本 repo，在開發機上）：
`build_cedict.py`（CC-CEDICT → `cedict.js`）、`build_irregular.py`（不規則
變化表）、`migrate_words.py`（`words.js` 格式遷移）。
需要 `pypinyin`、`opencc-python-reimplemented`、`wordfreq`、`jieba`、`lemminflect`。
