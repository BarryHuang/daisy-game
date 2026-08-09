# -*- coding: utf-8 -*-
"""Migrate words.js from the flat "中文 (ㄅㄆㄇ)" string to structured multi-sense
entries. Existing human-written bopomofo is authoritative and kept as-is; only
senses that currently have none are generated, and every generated one is listed
for review. FIXES below are the errors found by cross-checking."""
import io, json, re, sys
sys.path.insert(0, ".")
from zhuyin_build import zhuyin_of

SRC = "repo/words.js"

# Confirmed wrong in the existing data -> corrected reading, keyed by 中文 sense.
FIXES = {
    "真相":   ["ㄓㄣ", "ㄒㄧㄤˋ"],          # 相 in 真相 is xiàng, not xiāng
    # 建築物 / 記得 : 依家長決定保留原本的讀音（ㄓㄨˊ、ㄉㄜˊ），不修改
    "骨頭":   ["ㄍㄨˇ", "ㄊㄡ˙"],           # 頭 is neutral
    # 期 in 星期 is ㄑㄧˊ in Taiwan (ㄑㄧ is the mainland reading)
    "星期一": ["ㄒㄧㄥ", "ㄑㄧˊ", "ㄧ"],
    "星期二": ["ㄒㄧㄥ", "ㄑㄧˊ", "ㄦˋ"],
    "星期三": ["ㄒㄧㄥ", "ㄑㄧˊ", "ㄙㄢ"],
    "星期四": ["ㄒㄧㄥ", "ㄑㄧˊ", "ㄙˋ"],
    "星期五": ["ㄒㄧㄥ", "ㄑㄧˊ", "ㄨˇ"],
    "星期六": ["ㄒㄧㄥ", "ㄑㄧˊ", "ㄌㄧㄡˋ"],
    "星期日": ["ㄒㄧㄥ", "ㄑㄧˊ", "ㄖˋ"],
    # NB: 傳播 is ㄔㄨㄢˊ ㄅㄛˋ in Taiwan (MOE); ㄅㄛ is the mainland reading.
    # The original data was already correct — do not "fix" it.
}

# Bopomofo the pipeline gets wrong for these specific senses (reviewed by hand).
GEN_FIXES = {
    "球場":   ["ㄑㄧㄡˊ", "ㄔㄤˇ"],
    "想知道": ["ㄒㄧㄤˇ", "ㄓ", "ㄉㄠˋ"],
    "說謊":   ["ㄕㄨㄛ", "ㄏㄨㄤˇ"],
    "硬的":   ["ㄧㄥˋ", "ㄉㄜ˙"],
    "欽佩":   ["ㄑㄧㄣ", "ㄆㄟˋ"],
    "鄉村":   ["ㄒㄧㄤ", "ㄘㄨㄣ"],
    "字母":   ["ㄗˋ", "ㄇㄨˇ"],
    "罐子":   ["ㄍㄨㄢˋ", "ㄗ˙"],
    "在……後面": ["ㄗㄞˋ", "", "", "ㄏㄡˋ", "ㄇㄧㄢ˙"],
    "在……上方": ["ㄗㄞˋ", "", "", "ㄕㄤˋ", "ㄈㄤ"],
}

def initials(zy):
    """First bopomofo symbol of each syllable — enough to tell whether a bracket
    of readings belongs to a given set of characters."""
    return [z[0] for z in zy if z]

def belongs_to(zy, zh):
    """Does this bracket of readings plausibly annotate this Chinese string?"""
    if len(zy) != len(zh):
        return False
    return initials(zy) == initials([z for _, z in zhuyin_of(zh)])

def load():
    s = io.open(SRC, encoding="utf-8").read()
    wm = re.search(r"const words\s*=\s*\{(.*?)\n\s*\};", s, re.S).group(1)
    tm = re.search(r"wordTranslations\s*=\s*\{(.*?)\n\s*\};", s, re.S).group(1)
    trans = re.findall(r'"([^"]+)"\s*:\s*"([^"]*)"', tm)
    # word -> ["列表/週次", ...]
    src = {}
    cur_list = None
    for line in wm.splitlines():
        m = re.match(r'\s*"([^"]+)"\s*:\s*\{', line)
        if m:
            cur_list = m.group(1); continue
        m = re.match(r'\s*"([^"]+)"\s*:\s*\[(.*)\]', line)
        if m and cur_list:
            wk = m.group(1)
            for w in re.findall(r'"([^"]+)"', m.group(2)):
                src.setdefault(w.lower(), []).append(cur_list + " / " + wk)
    return trans, src

def split_senses(val):
    """'原野/球場 (ㄩㄢˊ ㄧㄝˇ)' -> [('原野', [ㄩㄢˊ, ㄧㄝˇ]), ('球場', None)]
    The trailing bracket only ever annotates the FIRST sense in the old format."""
    m = re.match(r"^(.*?)\s*\(([ˊˇˋ˙ㄅ-ㄩ\s.]*)\)\s*$", val)
    zy = m.group(2).split() if m else []
    body = (m.group(1) if m else val).strip().replace("...", "……")
    parts = []
    for p in body.split("/"):
        p = p.strip()
        if not p: continue
        note = None
        nm = re.match(r"^(.*?)\s*[(（]([^)）]*)[)）]\s*$", p)
        if nm:
            p, note = nm.group(1).strip(), nm.group(2).strip()
        parts.append([p, None, note])
    # The bracket annotates whichever sense its readings actually fit — the old
    # format put it at the end of the line regardless of which sense it described.
    if zy:
        owner = next((i for i, p in enumerate(parts) if belongs_to(zy, p[0])), None)
        if owner is None and len(zy) == len(parts[0][0]):
            owner = 0
        if owner is not None:
            parts[owner][1] = zy
    return parts

def bopomofo_for(zh):
    if zh in GEN_FIXES: return GEN_FIXES[zh], False
    return [z for _, z in zhuyin_of(zh)], True

def main():
    trans, src = load()
    entries, generated, unresolved = {}, [], []
    for en, val in trans:
        senses = []
        for zh, zy, note in split_senses(val):
            if zh in FIXES:
                zy = FIXES[zh]
            elif zy is None:
                zy, was_auto = bopomofo_for(zh)
                if was_auto: generated.append((en, zh, " ".join(zy)))
            if len(zy) != len(zh):
                unresolved.append((en, zh, zy))
            s = {"zh": zh, "z": zy}
            if note: s["note"] = note
            senses.append(s)
        entries[en] = {"s": senses, "src": src.get(en.lower(), [])}

    print("entries: %d   senses: %d" % (len(entries), sum(len(e["s"]) for e in entries.values())))
    print("multi-sense entries: %d" % sum(1 for e in entries.values() if len(e["s"]) > 1))
    print("\n-- auto-generated, PLEASE REVIEW (%d) --" % len(generated))
    for g in generated: print("   %-12s %s  %s" % g)
    print("\n-- length mismatch, unresolved (%d) --" % len(unresolved))
    for u in unresolved: print("   ", u)
    io.open("entries.json", "w", encoding="utf-8").write(
        json.dumps(entries, ensure_ascii=False, indent=0))

main()
