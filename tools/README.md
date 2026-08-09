# 建置腳本

字典資料是產生的，不是手寫的。改資料請改這裡再重新產生。

```bash
pip3 install -r requirements.txt

# 下載 CC-CEDICT（CC BY-SA 4.0）
curl -sL -o cedict.txt.gz \
  https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz
gunzip cedict.txt.gz

python3 build_irregular.py     # -> irregular.json（不規則變化，10 KB）
python3 build_cedict.py        # -> 檢視排序品質報告
```

## 最常見的工作：修一個查錯的字

編輯 `build_cedict.py` 裡的 `OVERRIDES`，重新產生 `cedict.js`。

```python
OVERRIDES = {
    "sentence": ["句子"],        # 原本會給「判處」
    "respect":  ["尊重", "尊敬"], # 原本會給「方面」
}
```

指定的中文若不在 CC-CEDICT 裡，會自動補一筆並用 `zhuyin_build.py` 產生注音。
**未來匯入教育部國中小基本字彙，走的就是這個機制。**

## 新學期單字表進來時

```bash
pip3 install pypdf

# 1. 先看解析對不對
python3 import_wordlist.py 單字表.pdf

# 2. 跟現有資料對帳（同一學期的表可以驗證解析器）
python3 import_wordlist.py 單字表.pdf --check ../words.js

# 3. 產生中文＋注音草稿
python3 import_wordlist.py 單字表.pdf --draft draft.json
```

草稿分三種狀態：

| 狀態 | 意思 |
|---|---|
| `reuse` | 以前學期配過了，直接沿用（跨學期重複的字不該重做，也不該不一致） |
| `guess` | 自動查到的三個候選，挑一個或自己改 |
| `missing` | 字典裡沒有，要手動填 |

校對完把結果併進 `../words.js` 的 `curriculum`，加一組新學期並把
`CURRENT_TERM` 指過去就好。

### 學校 PDF 的結構

一週一欄的表格。文字抽出來之後，各週的第 N 個字會被串在同一行：

```
1. beautiful adj. 1. agree v. 1. school n. ...
```

所以是**照編號切欄，不是照行讀**。實際檔案裡遇過的髒資料：`concentrate v,`
（逗號當句點）、`because con`（沒句點）、`mountain n..`（兩個句點）、
孤兒的 `n.` 自成一行。解析器都有處理。

**詞性標記（adj. / v. / n.）是這份 PDF 白送的**，而且正好解掉最常見的錯誤 ——
`interesting` 標 adj. 就不會給「興趣」。

### 拿 2025-2026 Spring（一下）驗證的結果

12 週有 10 週跟手打的 `words.js` 完全吻合。兩處不符都是**手打資料有錯**：
Wk 5 少了 `figure out` 和 `important`（只有 8 個字），Wk 7 的 `stand up`
被截成 `stand`。已修正。

## 檔案

| 檔案 | 用途 |
|---|---|
| `zhuyin_build.py` | 注音生成管線（繁簡處理、台灣讀音、「一」變調） |
| `build_cedict.py` | CC-CEDICT → `cedict.js`，含排序調校與人工修正層 |
| `build_irregular.py` | 用 lemminflect 當標準答案，找出後綴規則還原不了的字 |
| `import_wordlist.py` | 學校單字表 PDF/Word → 週次、單字、詞性，並產生中文草稿 |
| `migrate_words.py` | `words.js` 舊格式 → 結構化多義項格式（一次性，已執行完） |

`build_irregular.py` 的 `candidates()` 必須與 `../inflect.js` 的
`inflectCandidates()` 保持一致，改一邊要改另一邊。
