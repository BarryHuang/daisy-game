# -*- coding: utf-8 -*-
"""把學校發的單字表電子檔轉成 curriculum 用的資料。

學校的 PDF 是「一週一欄」的表格，文字抽出來之後每一列會變成
    1. beautiful adj. 1. agree v. 1. school n. ...
也就是各週的第 N 個字被串在同一行。所以是照編號切欄，不是照行讀。

詞性有兩種寫法，同一間學校兩份表就不一樣（FET 沒括號、CET 有）：
    1. shadow n.       1. visit (v.)

實際檔案裡的髒東西（都遇過，都要容錯）：
    concentrate v,     逗號當句點
    because con        沒句點，而且是 con 不是 conj
    mountain n..       兩個句點
    孤兒的 "n." 自成一行（上一格換行溢出）
    8. hermit / crab / n.   一格裡的詞太長被拆成三行，整列跟著散掉

最後一項用 join_wrapped() 處理：不是以「數字.」開頭的行，接回上一行。
表頭同理 —— "Week 16&17 Week" / "18&19" / "W20" 也會被拆行。

⚠️ 週次與欄位是照順序對上的（weeks[:欄數]）。中間夾一欄 Review（自己沒有
編號單字）時這個假設會歪掉，例如 CET 的 Week 14/15/16&17/18&19/W20：
只有 4 欄有字，第 4 欄其實是 W20 不是 18&19。解析結果一定要跟 PDF 對一遍。

用法：
    python3 import_wordlist.py 單字表.pdf              # 看解析結果
    python3 import_wordlist.py 單字表.pdf --json out.json
    python3 import_wordlist.py 單字表.pdf --check ../words.js   # 跟現有資料對帳
"""
import argparse, io, json, re, sys

# phr. / PV（片語動詞）是二年級的表才開始出現的
POS = r"(?:n|v|adj|adv|conj?|prep|pron|interj|phr|PV)"
# 括號是選擇性的：FET 寫 "shadow n."，CET 寫 "visit (v.)"
CELL = re.compile(r"(\d+)\.\s+(.+?)\s+\(?(" + POS + r")\.{0,2}[.,]?\)?(?=\s+\d+\.\s|\s*$)")
ROW_START = re.compile(r"^\s*\d+\.\s")
WEEK_HEADER = re.compile(r"(?:Wk|Week)\s*\d")
# 表頭被拆行時的續行，例如 "18&19"、"W20"：整行只有週次記號
WEEK_CONT = re.compile(r"^\s*(?:(?:Weeks?|Wk|W)\s*)?\d+(?:\s*[&/]\s*\d+)?\s*$")
MARKER = re.compile(r"(?:^|\s)\d+\.\s")


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
    """'Wk1&2 Week 3 Week 4 Week 5 Week 6 7 8' -> ['Wk 1&2','Wk 3',...,'Wk 8']

    'W20'（沒有 eek）也算。合併週次一律正規化成 '&'，跟 words.js 一致。
    Trailing bare numbers happen when adjacent header cells collapse together."""
    num_re = r"\d+(?:\s*[&/]\s*\d+)?"
    labels, last = [], None
    for tok in re.finditer(r"\b(?:Weeks?|Wk|W)\s*(" + num_re + r")|(?<=\s)(" + num_re + r")(?=\s|$)", line):
        num = tok.group(1) or tok.group(2)
        if tok.group(2) and last is None:
            continue                      # 還沒看到週次就出現的數字，不算
        labels.append("Wk " + re.sub(r"\s*[&/]\s*", "&", num))
        last = num
    return labels


def row_incomplete(line):
    """這一列還沒收完 —— 編號的數量比解析出來的格子多，表示最後一格被拆行了。

    "8. garden n. 8. scent n. 8. arrive v. 8. hermit" 有 4 個編號但只湊得出
    3 格，所以 "crab" 和後面那行 "n. 8. empty adj. ..." 都還是這一列的。
    """
    return len(MARKER.findall(line)) > len(CELL.findall(line))


def join_wrapped(lines):
    """把被拆行的表格內容接回上一行。

    只在上一行「收不完」時才接，否則像
        1. lie (v.) 1. bottom (n.)
        Review Midterm
    這種下一格是 Review 的情況，會把 Review 黏進最後一格而讓它解析不出來。
    """
    out = []
    for raw in lines:
        line = raw.strip()
        if not line:
            continue
        if out and ROW_START.match(out[-1]) and row_incomplete(out[-1]) \
                and not ROW_START.match(line):
            out[-1] += " " + line
        else:
            out.append(line)
    return out


def parse(text):
    """-> [(week_label, [(word, pos), ...]), ...]"""
    lines = join_wrapped(text.splitlines())
    blocks, current = [], None

    i = 0
    while i < len(lines):
        line = lines[i]
        if WEEK_HEADER.search(line) and len(parse_week_labels(line)) >= 2:
            # 表頭也會被拆行："Week 14 Week 15 Week 16&17 Week" / "18&19" / "W20"
            while i + 1 < len(lines) and WEEK_CONT.match(lines[i + 1]):
                line += " " + lines[i + 1]
                i += 1
            current = {"weeks": parse_week_labels(line), "rows": []}
            blocks.append(current)
            i += 1
            continue
        i += 1
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
        # 夾在中間的 Review 欄會讓「第 N 欄 = 第 N 個週次」不成立，這時務必
        # 拿 PDF 對一遍再貼進 words.js
        if ncols and len(b["weeks"]) > ncols:
            print("  ⚠️  %s：表頭有 %d 個週次但只有 %d 欄有字，對應可能要人工調整"
                  % ("/".join(b["weeks"]), len(b["weeks"]), ncols), file=sys.stderr)
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


# words.js 的 curriculum 底下，每一份清單都長這樣（固定縮排 6 格）：
#       "FET Spelling": {
#         "Wk 1": [ "shadow", ... ],
#       }
LIST_BLOCK = re.compile(r'^      "([^"]+)": \{$(.*?)^      \}', re.S | re.M)


def list_blocks(src):
    """-> [(清單名, {單字...}), ...]，同名的清單（不同學期）會各出現一次。"""
    out = []
    for m in LIST_BLOCK.finditer(src):
        ws = {w.lower() for w in re.findall(r'^\s+"([^"]+)",?$', m.group(2), re.M)}
        if ws:
            out.append((m.group(1), ws))
    return out


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
        parsed = {w.lower() for _, items in weeks for w, _ in items}
        blocks = list_blocks(io.open(a.check, encoding="utf-8").read())
        if not blocks:
            print("\n對帳：在", a.check, "裡找不到任何清單區塊")
            return
        # words.js 現在有兩個學期、各兩份清單，同名的 "FET Spelling" 有好幾個。
        # 挑跟這份 PDF 重疊最多的那一個，不然會拿一下的資料對二上的表。
        name, existing = max(blocks, key=lambda b: len(parsed & b[1]))
        print("\n對帳（比對 %s）：PDF %d 個字 / words.js %d 個字"
              % (name, len(parsed), len(existing)))
        print("  只在 PDF 有（現有資料漏掉的）:", sorted(parsed - existing) or "無")
        print("  只在 words.js 有:", sorted(existing - parsed) or "無")


main()
