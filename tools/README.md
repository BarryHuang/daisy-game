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

## 檔案

| 檔案 | 用途 |
|---|---|
| `zhuyin_build.py` | 注音生成管線（繁簡處理、台灣讀音、「一」變調） |
| `build_cedict.py` | CC-CEDICT → `cedict.js`，含排序調校與人工修正層 |
| `build_irregular.py` | 用 lemminflect 當標準答案，找出後綴規則還原不了的字 |
| `migrate_words.py` | `words.js` 舊格式 → 結構化多義項格式（一次性，已執行完） |

`build_irregular.py` 的 `candidates()` 必須與 `../inflect.js` 的
`inflectCandidates()` 保持一致，改一邊要改另一邊。
