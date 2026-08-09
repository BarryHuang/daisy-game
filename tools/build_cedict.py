# -*- coding: utf-8 -*-
"""Build an English -> Traditional Chinese index (with bopomofo) from CC-CEDICT.

The hard part is not coverage, it is ranking: a raw reverse lookup answers
"democracy" with 德謨克拉西 and "stubborn" with 㥮. Chinese word frequency plus
gloss-quality scoring is what makes the result usable.
"""
import io, json, re, sys, unicodedata
from collections import defaultdict
from pypinyin.style.bopomofo import converter as _BC
from wordfreq import zipf_frequency
from lemminflect import getAllLemmas
from pypinyin import pinyin as _py, Style as _Style
import opencc

_DEFAULT_READING = {}
def is_primary_reading(trad, pinyin_str):
    """wordfreq scores a written form, not a reading. Without this, 強[jiang4]
    'stubborn' borrows the frequency of the far commoner 強[qiang2] 'strong'."""
    if len(trad) != 1:
        return True
    if trad not in _DEFAULT_READING:
        r = _py(trad, style=_Style.TONE3, errors=lambda x: [""])
        _DEFAULT_READING[trad] = (r[0][0] if r and r[0] else "").lower().replace("u:", "v")
    got = pinyin_str.strip().lower().replace("u:", "v")
    got = got if got[-1:].isdigit() else got + "5"
    return got == _DEFAULT_READING[trad] or not _DEFAULT_READING[trad]

CEDICT = "cedict.txt"
HAN = re.compile(r"^[㐀-鿿豈-﫿]+$")

# ---------------------------------------------------------------- bopomofo
def syllable_to_bopomofo(syl):
    """'lu:4' -> 'ㄌㄩˋ',  'ma5' -> 'ㄇㄚ˙',  'zhi1' -> 'ㄓ'"""
    s = syl.strip().lower().replace("u:", "v")
    if not re.match(r"^[a-z]+[1-5]?$", s):
        return ""
    out = _BC.to_bopomofo(s)
    out = re.sub(r"\d", "", out)            # tone 5 leaves a stray digit behind
    return out

def word_bopomofo(trad, pinyin):
    """Per-character readings. CC-CEDICT's pinyin is curated per entry, so this
    sidesteps the polyphone guessing that plagues automatic annotation."""
    syls = pinyin.split()
    chars = list(trad)
    if len(syls) != len(chars):
        return None
    out = [syllable_to_bopomofo(s) for s in syls]
    return None if any(not z for z in out) else out

# ---------------------------------------------------------------- filters
POINTER = re.compile(
    r"^(variant of|old variant of|see |see also|abbr\. for|surname |"
    r"used in|erhua variant|equivalent to)", re.I)
DEMOTE = re.compile(r"\b(archaic|literary|old|dialect|Taiwanese|classical|onomatopoeia|"
                    r"slang|vulgar|derogatory|coll\.|formal|neologism|abbr|"
                    r"Buddhism|chemistry|medicine|physics|loanword)\b", re.I)
PROPER = re.compile(r"[A-Z]")     # CC-CEDICT capitalises proper-noun pinyin
TW_MARK  = re.compile(r"\(Tw\)|Taiwanese term for|\bin Taiwan\b")
PRC_MARK = re.compile(r"\(PRC\)|\bin mainland\b")

_s2twp = opencc.OpenCC("s2twp")
def is_mainland_only(trad, simp):
    """OpenCC's s2twp rewrites mainland vocabulary into the Taiwan equivalent
    (软件->軟體, 视频->影片). If converting this entry's simplified form yields
    something other than the entry itself, the entry IS the mainland variant.
    wordfreq's Chinese corpus is mainland-heavy, so without this those variants
    outrank the words she actually says."""
    try:
        return _s2twp.convert(simp) != trad
    except Exception:
        return False

# Cases where the mainland word also exists in Taiwan, so OpenCC leaves it
# alone and only a human can say which one a Taiwanese child would use.
# 大陸說法 -> 台灣說法。只降大陸那邊不夠：壓下去之後浮上來的往往是更糟的
# 第三名（printer 變「印刷所」），所以要同時把台灣說法拉上來。
TW_PAIRS = {
    "土豆": "馬鈴薯", "菠蘿": "鳳梨", "詞典": "字典", "地鐵": "捷運",
    "酸奶": "優格", "三文治": "三明治", "計算機": "電腦", "激光": "雷射",
    "博客": "部落格", "幼兒園": "幼稚園", "視像": "影片", "單車": "腳踏車",
    "的士": "計程車", "公交車": "公車", "西紅柿": "番茄", "信息": "訊息",
    "軟件": "軟體", "視頻": "影片", "網絡": "網路", "打印機": "印表機",
    "出租車": "計程車", "自行車": "腳踏車", "鼠標": "滑鼠", "屏幕": "螢幕",
    "項目": "專案", "程序": "程式", "質量": "品質", "數據": "資料",
    "冰箱": "冰箱", "空調": "冷氣", "手機": "手機", "電子郵件": "電子郵件",
}
TW_DEMOTE = set(TW_PAIRS)
TW_PROMOTE = set(TW_PAIRS.values())

# A single character is usually a morpheme, not a word she can use on its own,
# and its corpus frequency is inflated by every compound it appears in.
LENGTH_PRIOR = {1: -6, 2: 0, 3: -3, 4: -6, 5: -8, 6: -10}

def parse():
    for line in io.open(CEDICT, encoding="utf-8"):
        if line.startswith("#"): continue
        m = re.match(r"^(\S+) (\S+) \[([^\]]*)\] /(.*)/\s*$", line)
        if not m: continue
        trad, simp, py, gl = m.groups()
        if not HAN.match(trad): continue
        if len(trad) > 6: continue
        yield trad, simp, py, gl.split("/")

# ---------------------------------------------------------------- glosses
PAREN = re.compile(r"\([^)]*\)")
def gloss_keys(gloss):
    """Normalised English lookup keys for one gloss, with where each key sat."""
    scoped = gloss.strip().startswith("(")
    keys = {}
    for sub, part in enumerate(PAREN.sub(" ", gloss).split(";")):
        g = re.sub(r"\s+", " ", part.strip().lower()).strip(" ,")
        if not g or len(g) > 40: continue
        if re.search(r"[^a-z0-9 '\-]", g): continue
        for k in [g, re.sub(r"^to ", "", g), re.sub(r"^(?:a|an|the) ", "", g)]:
            if k and len(k) > 1:
                keys[k] = min(sub, keys.get(k, 99))
    # index inflected gloss keys under their lemma too, so "consequences"
    # in the gloss can be found by searching "consequence"
    for k, sub in list(keys.items()):
        if " " not in k:
            for forms in getAllLemmas(k).values():
                for f in forms:
                    keys[f] = min(sub, keys.get(f, 99))
    return [(k, sub, scoped) for k, sub in keys.items()]

# ---------------------------------------------------------------- 人工修正層
# 演算法的天花板在這裡：底下這些不是難度或詞頻問題，是「選錯義項」，
# 沒有任何自動訊號分辨得出來。這層就是未來匯入教育部國中小基本字彙的入口，
# 每加一筆就是永久修好一個字。
OVERRIDES = {
    "sentence":    ["句子"],
    "respect":     ["尊重", "尊敬"],
    "interesting": ["有趣"],
    "opinion":     ["意見", "看法"],
    "situation":   ["情況"],
    "usually":     ["通常"],
    "worry":       ["擔心"],
    "practice":    ["練習"],
    "exercise":    ["運動", "練習"],
    "polite":      ["有禮貌"],
    "favorite":    ["最喜歡的"],
    "popular":     ["受歡迎"],
    "dictionary":  ["字典"],
    "message":     ["訊息"],
    "information": ["資訊"],
    "printer":     ["印表機"],
    "program":     ["節目", "程式"],
    "project":     ["專案"],
    "subway":      ["捷運"],
    "screen":      ["螢幕"],
    # 她讀的是故事書，mouse 先給動物
    "mouse":       ["老鼠", "滑鼠"],
}

def apply_overrides(entries, index):
    """把人工指定的答案放到第一位；字典裡沒有的就補一筆新條目。"""
    from zhuyin_build import zhuyin_of
    by_word = {}
    for i, e in enumerate(entries):
        by_word.setdefault(e["w"], i)
    added = 0
    for en, wants in OVERRIDES.items():
        hits = index.get(en, [])
        top = hits[0][0] if hits else 0
        for rank, zh in enumerate(wants):
            idx = by_word.get(zh)
            if idx is None:
                zy = [z for _, z in zhuyin_of(zh)]
                if any(not z for z in zy):
                    continue
                idx = len(entries)
                entries.append({"w": zh, "z": zy, "g": [en], "f": 4.5, "p": 1})
                by_word[zh] = idx
                added += 1
            hits = [(sc, i) for sc, i in hits if i != idx]
            hits.insert(rank, (top + 100 - rank, idx))
        index[en] = hits
    return added

# ---------------------------------------------------------------- build
def build():
    entries, seen = [], {}
    index = defaultdict(list)
    skipped_align = 0

    for trad, simp, py, glosses in parse():
        zy = word_bopomofo(trad, py)
        if zy is None:
            skipped_align += 1
            continue
        zipf = zipf_frequency(trad, "zh")
        proper = bool(PROPER.search(py))

        useful = []
        for pos, g in enumerate(glosses):
            g = g.strip()
            if not g or POINTER.match(g): continue
            useful.append((pos, g))
        if not useful: continue
        # "(archaic)" is often written only on the first gloss of a rare
        # reading, so judge the entry as a whole, not each gloss separately
        entry_demoted = any(DEMOTE.search(g) for _, g in useful)
        # a reading that also lists "variant of ..." is usually the archaic or
        # rare spelling (于 "to go" is really 於), so it should not lead
        if any(POINTER.match(g.strip()) for g in glosses):
            entry_demoted = True

        key = (trad, py)
        if key in seen:
            idx = seen[key]
        else:
            idx = len(entries)
            seen[key] = idx
            # wordfreq 的中文語料偏大陸，台灣專用詞（印表機 zipf 1.5）會被
            # 當成罕見詞濾掉。標記起來，讓它們豁免最低詞頻門檻。
            protected = trad in TW_PROMOTE or any(TW_MARK.search(g) for _, g in useful)
            entries.append({"w": trad, "z": zy,
                            "g": [g for _, g in useful][:4],
                            "f": round(zipf, 2), "p": 1 if protected else 0})

        secondary = not is_primary_reading(trad, py)
        mainland = is_mainland_only(trad, simp) or trad in TW_DEMOTE
        for pos, g in useful:
            for k, sub, scoped in gloss_keys(g):
                score = zipf * 10 - pos * 1.5 + LENGTH_PRIOR.get(len(trad), -8)
                # the sense a word leads with is the one she almost always wants
                if pos == 0 and sub == 0 and not scoped: score += 8
                else: score -= sub * 3
                if proper: score -= 12
                if entry_demoted: score -= 8
                if secondary: score -= 14 if len(trad) > 1 else 30
                if mainland: score -= 16          # 她不會這樣說
                if trad in TW_PROMOTE: score += 14
                if TW_MARK.search(g): score += 14  # CC-CEDICT 標為台灣用法
                if PRC_MARK.search(g): score -= 16
                index[k].append((round(score, 2), idx))

    apply_overrides(entries, index)

    best = {}
    for k, hits in index.items():
        per = {}
        for score, idx in hits:
            w = entries[idx]["w"]
            if w not in per or score > per[w][0]: per[w] = (score, idx)
        best[k] = sorted(per.values(), reverse=True)
    return entries, best, skipped_align

def report(entries, index):
    print("entries: %d   english keys: %d" % (len(entries), len(index)))
    for q in ["consequence", "stubborn", "democracy", "hesitate", "photosynthesis",
              "evaporate", "run", "beautiful", "melt", "brave", "predict", "curious",
              "cat", "dog", "water", "book", "cloud", "rain", "jump", "eat", "happy"]:
        hits = sorted(index.get(q, []), reverse=True)[:5]
        show = ["%s(%.1f)" % (entries[i]["w"], entries[i]["f"]) for _, i in hits]
        print("  %-15s %s" % (q, "  ".join(show) if show else "— none —"))

if __name__ == "__main__":
    e, i, sk = build()
    print("skipped (pinyin/char misalignment): %d" % sk)
    report(e, i)
    json.dump({"entries": e, "index": {k: v for k, v in i.items()}},
              io.open("cedict_raw.json", "w", encoding="utf-8"), ensure_ascii=False)

# ---------------------------------------------------------------- emit
def emit(entries, index, max_hits=4, min_zipf=2.5, min_en_zipf=2.2, gloss_len=30):
    """Trim to something a phone can hold, then write a compact payload.

    Three things dominate the size, so each gets its own treatment:
      - multi-word gloss keys ("to engage in business etc") were 78% of all
        keys; only 1- and 2-word keys survive, which keeps phrasal verbs.
      - glosses are truncated; the user typed the English, so the gloss only
        has to disambiguate between competing results.
      - bopomofo repeats across the dictionary, so syllables go in a codebook
        and each reading becomes indexes into it.
    """
    from wordfreq import zipf_frequency as z

    # An inflected form can exist as its own gloss key and give a worse answer
    # than its lemma: "running" hits 營運 from "running/operation", while "run"
    # hits 跑. Merge the lemma's hits in and re-rank, while scores still exist.
    merged = {}
    for k, hits in index.items():
        pool = dict()
        for src in [k] + [l for forms in getAllLemmas(k).values() for l in forms
                          if " " not in k]:
            for sc, i in index.get(src, []):
                if i not in pool or sc > pool[i]: pool[i] = sc
        merged[k] = sorted(((sc, i) for i, sc in pool.items()), reverse=True)
    index = merged

    keep = {}
    for k, hits in index.items():
        if k.count(" ") > 1:
            continue
        if " " not in k and len(k) > 2 and z(k, "en") < min_en_zipf:
            continue                                    # not a real English word
        good = [(sc, i) for sc, i in hits
                if entries[i]["f"] >= min_zipf or entries[i].get("p")][:max_hits]
        if good:
            keep[k] = [i for _, i in good]

    used = sorted({i for v in keep.values() for i in v})
    remap = {old: new for new, old in enumerate(used)}

    syllables, syl_id = [], {}
    def encode(readings):
        out = []
        for r in readings:
            if r not in syl_id:
                syl_id[r] = len(syllables); syllables.append(r)
            out.append(syl_id[r])
        return ",".join(str(n) for n in out)

    def short(gloss):
        g = gloss.split(" / ")[0]
        return g if len(g) <= gloss_len else g[:gloss_len - 1].rstrip() + "\u2026"

    return {
        "s": syllables,
        "w": [entries[i]["w"] for i in used],
        "z": [encode(entries[i]["z"]) for i in used],
        "g": [short(" / ".join(entries[i]["g"])) for i in used],
        "i": {k: [remap[i] for i in v] for k, v in keep.items()},
    }
