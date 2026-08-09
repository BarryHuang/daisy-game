# -*- coding: utf-8 -*-
"""把學校發的單字表電子檔轉成 curriculum 用的資料。

學校的 PDF 是「一週一欄」的表格，文字抽出來之後每一列會變成
    1. beautiful adj. 1. agree v. 1. school n. ...
也就是各週的第 N 個字被串在同一行。所以是照編號切欄，不是照行讀。

實際檔案裡的髒東西（都遇過，都要容錯）：
    concentrate v,     逗號當句點
    because con        沒句點，而且是 con 不是 conj
    mountain n..       兩個句點
    孤兒的 "n." 自成一行（上一格換行溢出）

用法：
    python3 import_wordlist.py 單字表.pdf              # 看解析結果
    python3 import_wordlist.py 單字表.pdf --json out.json
    python3 import_wordlist.py 單字表.pdf --check ../words.js   # 跟現有資料對帳
"""
import argparse, io, json, re, sys

POS = r"(?:n|v|adj|adv|conj?|prep|pron|interj)"
CELL = re.compile(r"(\d+)\.\s+(.+?)\s+(" + POS + r")\.{0,2}[.,]?(?=\s+\d+\.\s|\s*$)")
WEEK_HEADER = re.compile(r"(?:Wk|Week)\s*\d")


def read_text(path):
    if path.lower().endswith(".pdf"):
        from pypdf import PdfReader
        return "\n".join((p.extract_text() or "") for p in PdfReader(path).pages)
    if path.lower().endswith(".docx"):
        import zipfile
        with zipfile.ZipFile(path) as z:
            xml = z.read("word/document.xml").decode("utf-8", "ignore")
        xml = re.sub(r"</w:p>", "\n", xml)
        return re.sub(r"<[^>]+>", "", xml)
    return io.open(path, encoding="utf-8").read()


def parse_week_labels(line):
    """'Wk1/2 Week 3 Week 4 Week 5 Week 6 7 8' -> ['Wk 1/2','Wk 3',...,'Wk 8']

    Trailing bare numbers happen when adjacent header cells collapse together."""
    labels, last = [], None
    for tok in re.finditer(r"(?:Wk|Week)\s*(\d+(?:/\d+)?)|(?<=\s)(\d+)(?=\s|$)", line):
        num = tok.group(1) or tok.group(2)
        if tok.group(2) and last is None:
            continue                      # 還沒看到週次就出現的數字，不算
        labels.append("Wk " + num)
        last = num
    return labels


def parse(text):
    """-> [(week_label, [(word, pos), ...]), ...]"""
    lines = [l.rstrip() for l in text.splitlines()]
    blocks, current = [], None

    for line in lines:
        if WEEK_HEADER.search(line) and len(parse_week_labels(line)) >= 2:
            current = {"weeks": parse_week_labels(line), "rows": []}
            blocks.append(current)
            continue
        if current is None:
            continue
        cells = CELL.findall(line)
        if cells:
            current["rows"].append(cells)

    out = []
    for b in blocks:
        ncols = max((len(r) for r in b["rows"]), default=0)
        # 最後幾個週次通常是 Review，沒有自己的單字欄
        weeks = b["weeks"][:ncols]
        cols = [[] for _ in range(ncols)]
        for row in b["rows"]:
            for i, (_, word, pos) in enumerate(row):
                if i < ncols:
                    cols[i].append((word.strip(), pos))
        for w, items in zip(weeks, cols):
            if items:
                out.append((w, items))
    return out


# ---------------------------------------------------------------- 草稿
# 詞性是這份 PDF 白送的資訊，而且正好解掉最常見的錯誤：
# interesting 標 adj. 就不該給「興趣」，wonder 標 n. 和 v. 答案也不一樣。
POS_HINT = {"v": "to ", "n": "", "adj": "", "adv": "", "con": "", "conj": ""}


def load_cedict(path="../cedict.js"):
    txt = io.open(path, encoding="utf-8").read()
    body = txt[txt.index("const CEDICT=") + len("const CEDICT="):]
    return json.loads(body[:body.index(";\nconst IRREGULAR")])


def load_existing(path="../words.js"):
    """已經配過中文的字直接沿用 —— 跨學期重複的字不該重做，也不該不一致。"""
    txt = io.open(path, encoding="utf-8").read()
    out = {}
    for m in re.finditer(r'"((?:[^"\\]|\\.)*)": \{ s:\[(.*?)\] \}', txt):
        senses = re.findall(r'zh:"([^"]*)",z:\[([^\]]*)\]', m.group(2))
        out[m.group(1).lower()] = [(zh, [z.strip('"') for z in zs.split(",") if z])
                                   for zh, zs in senses]
    return out


def make_draft(weeks, out_path):
    ced = load_cedict()
    existing = load_existing()
    draft, reused, guessed, missing = {}, 0, 0, 0

    for wk, items in weeks:
        rows = []
        for word, pos in items:
            key = word.lower()
            if key in existing:
                rows.append({"w": word, "pos": pos, "status": "reuse",
                             "senses": [{"zh": zh, "z": z} for zh, z in existing[key]]})
                reused += 1
                continue
            ids = ced["i"].get(key) or ced["i"].get(key.replace(" ", ""))
            if not ids:
                rows.append({"w": word, "pos": pos, "status": "missing", "senses": []})
                missing += 1
                continue
            cands = [{"zh": ced["w"][i],
                      "z": [ced["s"][int(n)] for n in ced["z"][i].split(",")],
                      "en": ced["g"][i]} for i in ids[:3]]
            rows.append({"w": word, "pos": pos, "status": "guess", "senses": cands})
            guessed += 1
        draft[wk] = rows

    io.open(out_path, "w", encoding="utf-8").write(
        json.dumps(draft, ensure_ascii=False, indent=1))
    print("\n草稿 -> %s" % out_path)
    print("  沿用舊翻譯 %d 個 / 自動產生 %d 個 / 查不到 %d 個" % (reused, guessed, missing))
    if missing:
        print("  查不到（要人工填）:",
              ", ".join(r["w"] for rows in draft.values() for r in rows if r["status"] == "missing"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("path")
    ap.add_argument("--json")
    ap.add_argument("--check", help="拿現有的 words.js 對帳")
    ap.add_argument("--draft", help="產生中文＋注音草稿，輸出 JSON 給人工校對")
    a = ap.parse_args()

    weeks = parse(read_text(a.path))
    total = sum(len(v) for _, v in weeks)
    print("解析出 %d 週、%d 個字\n" % (len(weeks), total))
    for wk, items in weeks:
        print("  %-9s %s" % (wk, "、".join("%s(%s)" % (w, p) for w, p in items)))

    if a.json:
        io.open(a.json, "w", encoding="utf-8").write(json.dumps(
            {wk: [{"w": w, "pos": p} for w, p in items] for wk, items in weeks},
            ensure_ascii=False, indent=1))
        print("\n已寫入", a.json)

    if a.draft:
        make_draft(weeks, a.draft)

    if a.check:
        src = io.open(a.check, encoding="utf-8").read()
        existing = set(re.findall(r'"([a-zA-Z][a-zA-Z \'-]*)"',
                       re.search(r'"FET Spelling":\s*(\{.*?\n\s{4}\})', src, re.S).group(1)))
        parsed = {w.lower() for _, items in weeks for w, _ in items}
        existing = {e.lower() for e in existing if not re.match(r"^wk", e, re.I)}
        print("\n對帳：PDF %d 個字 / words.js %d 個字" % (len(parsed), len(existing)))
        only_pdf = sorted(parsed - existing)
        only_js = sorted(existing - parsed)
        print("  只在 PDF 有（現有資料漏掉的）:", only_pdf or "無")
        print("  只在 words.js 有:", only_js or "無")


main()
