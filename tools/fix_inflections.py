#!/usr/bin/env python3
"""
把 cedict.js 索引裡「名詞被硬展開成 -ing / -ed」的假條目清掉。

為什麼會有這種東西：建字典索引時，每個英文釋義字都會被展開成各種變化形，
這樣她在文章裡看到 hesitated、mice 才查得到。但展開的時候不看詞性，
所以名詞也被造出了進行式和過去式 —— 於是「口徑」的釋義 "bore; caliber"
讓 boring 多出一個「口徑」的意思，heading 變成「腦袋」，canned 變成「可以」。

判斷規則（CC-CEDICT 的寫法很固定，所以可以靠釋義本身判詞性）：
  1. 只看 -ing / -ed 結尾的索引字
  2. 釋義裡本來就有這個字 -> 是真的，留著
  3. 否則找出是哪個釋義字被展開成它
  4. 那個義項是動詞嗎？CC-CEDICT 的動詞一律寫成 "to bore a hole"。
     是動詞就留著（動詞本來就有 -ing/-ed）；是名詞就是假的，拿掉
  5. 整個字被清空也沒關係 —— inflect.js 在查詢時會把 racing 還原成 race，
     而且卡片上會標出還原成什麼，反而比直接說 racing = 種族 誠實

重跑字典（build_cedict.py）之後要再跑一次這支。

用法：
    python3 tools/fix_inflections.py            # 直接改 cedict.js
    python3 tools/fix_inflections.py --dry-run  # 只報告，不改檔
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CEDICT_JS = ROOT / "cedict.js"

WORD_RE = re.compile(r"[a-z][a-z'-]*")
# CC-CEDICT 的動詞多半寫成 "to civilize"，但有些漏掉 "to"（文明化 的釋義就只有
# "civilize"）。這些字尾幾乎一定是動詞，補進來才不會把對的也砍掉。
VERBY_RE = re.compile(r"(ize|ise|ify|ate|en)$")
DOUBLING_RE = re.compile(r"[^aeiou][aeiou][bcdfgklmnprstvz]$")


def senses(gloss):
    """把釋義切成義項。回傳 [(文字, 是不是被截斷的最後一段)]。

    CEDICT.g 是截斷過的，結尾帶一個真的 '…'，最後一個字可能被切一半。
    不處理的話會把 "demented" 讀成 "demente"，再倒推出一堆假的原形。
    """
    g = str(gloss or "")
    truncated = g.rstrip().endswith("…")
    g = re.sub(r"…\s*$", "", g)
    parts = [p.strip().lower() for p in re.split(r"[;/]", g)]
    parts = [p for p in parts if p]
    return [(p, truncated and k == len(parts) - 1) for k, p in enumerate(parts)]


def safe_words(text, partial):
    """義項裡可信的字。被切一半的那段，最後一個字丟掉。"""
    words = WORD_RE.findall(text)
    return words[:-1] if partial else words


def inflections_of(base):
    """base 的 -ing / -ed 形。規則對照 inflect.js 的反向。"""
    out = {base + "ing", base + "ed"}
    if base.endswith("e"):
        out.add(base[:-1] + "ing")
        out.add(base + "d")
    if base.endswith("y") and not re.search(r"[aeiou]y$", base):
        out.add(base[:-1] + "ied")
    if DOUBLING_RE.search(base):
        out.add(base + base[-1] + "ing")
        out.add(base + base[-1] + "ed")
    return out


def is_fake(word, gloss):
    """這個索引字是不是「名詞被硬展開」來的。是的話回傳 (原形, 義項)。"""
    parsed = senses(gloss)
    for text, partial in parsed:
        if word in safe_words(text, partial):
            return None                       # 釋義裡真的有這個字
    for text, partial in parsed:
        for base in safe_words(text, partial):
            if word == base or len(base) < 3:
                continue
            if word not in inflections_of(base):
                continue
            is_verb = (text.startswith("to ")
                       or re.search(r"\bto " + re.escape(base) + r"\b", text)
                       or VERBY_RE.search(base))
            return None if is_verb else (base, text)
    return None


def split_source(src):
    """把 cedict.js 切成 (前面, CEDICT 的物件字面值, 分號後到下一段之間的空白, 後面)。

    中間那段空白要原樣留著，不然每次跑都會多一個換行。
    """
    head = "const CEDICT="
    i = src.index(head)
    j = src.index("const IRREGULAR=")
    body = src[i + len(head):j]
    literal = body.rstrip()
    gap = body[len(literal):]
    assert literal.endswith(";"), "CEDICT 後面應該是分號，檔案格式變了？"
    return src[:i + len(head)], literal[:-1], gap, src[j:]


def main():
    dry = "--dry-run" in sys.argv
    src = CEDICT_JS.read_text(encoding="utf-8")
    prefix, literal, gap, suffix = split_source(src)
    data = json.loads(literal)

    index, words, glosses = data["i"], data["w"], data["g"]
    removed, emptied = [], []

    for key in list(index):
        if not key.endswith(("ing", "ed")) or len(key) < 5:
            continue
        kept = []
        for ref in index[key]:
            fake = is_fake(key, glosses[ref])
            if fake:
                removed.append((key, words[ref], fake[0], str(glosses[ref])[:40]))
            else:
                kept.append(ref)
        if len(kept) == len(index[key]):
            continue
        if kept:
            index[key] = kept
        else:
            # 整條清空就把 key 拿掉，讓 inflect.js 在查詢時還原成原形
            del index[key]
            emptied.append(key)

    print(f"拿掉 {len(removed)} 筆假索引，影響 "
          f"{len({r[0] for r in removed})} 個查詢字")
    print(f"其中 {len(emptied)} 個字整條清空，改由 inflect.js 還原成原形")
    print("\n前 15 筆：")
    for key, zh, base, gloss in removed[:15]:
        print(f"  {key:<15}{zh:<8}← 由「{base}」展開　{gloss}")

    if dry:
        print("\n--dry-run：沒有改檔")
        return
    if not removed:
        print("\n沒有要改的，檔案不動")
        return

    # 只重新序列化，不改排版慣例（緊湊、不跳脫非 ASCII），
    # 這樣 diff 只會落在索引那一段
    out = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    CEDICT_JS.write_text(prefix + out + ";" + gap + suffix, encoding="utf-8")
    print(f"\ncedict.js 已更新（{len(out):,} bytes）")


if __name__ == "__main__":
    main()
