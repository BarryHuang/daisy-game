# -*- coding: utf-8 -*-
"""注音生成管線。給 migrate_words.py 和 build_cedict.py 共用。

三個非直覺的坑，改之前先讀：
  1. pypinyin 的詞組字典是簡體鍵值，繁體字拿不到詞組讀音（「睡覺」會念成
     ㄕㄨㄟˋ ㄐㄩㄝˊ）。所以要先逐字轉簡再查。
  2. 但繁簡合併會反咬：隻→只 讀成 ㄓˇ、乾→干 在某些詞裡讀成 ㄍㄢˋ。
     見 CHAR_FIX。
  3. pypinyin 用大陸讀音。台灣讀音差異見 OVERRIDE（企鵝 ㄑㄧˋ、星期 ㄑㄧˊ）。
"""
import json, re, sys
from pypinyin import pinyin, Style
import opencc

_t2s = opencc.OpenCC("t2s")
_T2S_CACHE = {}

def to_simplified_aligned(s):
    """Char-by-char T->S so the result keeps the same length as the input.
    pypinyin's phrase dictionary is keyed on simplified characters, so a
    traditional string gets no phrase context (睡覺 would read ㄐㄩㄝˊ)."""
    out = []
    for ch in s:
        if ch not in _T2S_CACHE:
            conv = _t2s.convert(ch)
            _T2S_CACHE[ch] = conv if len(conv) == 1 else ch
        out.append(_T2S_CACHE[ch])
    return "".join(out)


# ---------------------------------------------------------------- bopomofo
TONES = "ˊˇˋ˙"

# Taiwan-standard readings that differ from the mainland dictionary pypinyin ships.
OVERRIDE = {
 # reduplicated kinship / diminutives take 輕聲 on the second syllable
 "媽媽":["ㄇㄚ","ㄇㄚ˙"], "爸爸":["ㄅㄚˋ","ㄅㄚ˙"], "哥哥":["ㄍㄜ","ㄍㄜ˙"],
 "姊姊":["ㄐㄧㄝˇ","ㄐㄧㄝ˙"], "妹妹":["ㄇㄟˋ","ㄇㄟ˙"], "弟弟":["ㄉㄧˋ","ㄉㄧ˙"],
 "奶奶":["ㄋㄞˇ","ㄋㄞ˙"], "爺爺":["ㄧㄝˊ","ㄧㄝ˙"], "寶寶":["ㄅㄠˇ","ㄅㄠ˙"],
 "娃娃":["ㄨㄚˊ","ㄨㄚ˙"], "星星":["ㄒㄧㄥ","ㄒㄧㄥ˙"], "謝謝":["ㄒㄧㄝˋ","ㄒㄧㄝ˙"],
 # neutral-tone second syllables
 "嘴巴":["ㄗㄨㄟˇ","ㄅㄚ˙"], "眼睛":["ㄧㄢˇ","ㄐㄧㄥ˙"], "肚子":["ㄉㄨˋ","ㄗ˙"],
 "衣服":["ㄧ","ㄈㄨ˙"], "漂亮":["ㄆㄧㄠˋ","ㄌㄧㄤ˙"], "頭髮":["ㄊㄡˊ","ㄈㄚˇ"],
 "早上":["ㄗㄠˇ","ㄕㄤ˙"], "晚上":["ㄨㄢˇ","ㄕㄤ˙"],
 # readings the char-level fixes below would otherwise get wrong
 "數字":["ㄕㄨˋ","ㄗˋ"], "長大":["ㄓㄤˇ","ㄉㄚˋ"], "長頸鹿":["ㄔㄤˊ","ㄐㄧㄥˇ","ㄌㄨˋ"],
 "一樣":["ㄧˊ","ㄧㄤˋ"], "不一樣":["ㄅㄨˋ","ㄧˊ","ㄧㄤˋ"],
 "第一":["ㄉㄧˋ","ㄧ"], "一月":["ㄧ","ㄩㄝˋ"],
 "星期":["ㄒㄧㄥ","ㄑㄧˊ"], "星期一":["ㄒㄧㄥ","ㄑㄧˊ","ㄧ"], "星期二":["ㄒㄧㄥ","ㄑㄧˊ","ㄦˋ"],
 "星期三":["ㄒㄧㄥ","ㄑㄧˊ","ㄙㄢ"], "星期四":["ㄒㄧㄥ","ㄑㄧˊ","ㄙˋ"], "星期五":["ㄒㄧㄥ","ㄑㄧˊ","ㄨˇ"],
 "星期六":["ㄒㄧㄥ","ㄑㄧˊ","ㄌㄧㄡˋ"], "星期日":["ㄒㄧㄥ","ㄑㄧˊ","ㄖˋ"],
 "企鵝":["ㄑㄧˋ","ㄜˊ"], "蝸牛":["ㄍㄨㄚ","ㄋㄧㄡˊ"], "擁抱":["ㄩㄥˇ","ㄅㄠˋ"],
 "危險":["ㄨㄟˊ","ㄒㄧㄢˇ"], "微笑":["ㄨㄟˊ","ㄒㄧㄠˋ"], "休息":["ㄒㄧㄡ","ㄒㄧˊ"],
 "夾克":["ㄐㄧㄚˊ","ㄎㄜˋ"], "玫瑰":["ㄇㄟˊ","ㄍㄨㄟˋ"], "帆船":["ㄈㄢˊ","ㄔㄨㄢˊ"],
 "法國":["ㄈㄚˇ","ㄍㄨㄛˊ"], "垃圾":["ㄌㄜˋ","ㄙㄜˋ"], "熟":["ㄕㄡˊ"],
 "液":["ㄧˋ"], "期":["ㄑㄧˊ"], "誰":["ㄕㄟˊ"], "和":["ㄏㄢˋ"],
 # 副詞的「地」讀輕聲 ㄉㄜ˙，不是 ㄉㄧˋ（「草地」那個才是 ㄉㄧˋ，所以不能寫成通則）
 "慢慢地":["ㄇㄢˋ","ㄇㄢˋ","ㄉㄜ˙"], "小心地":["ㄒㄧㄠˇ","ㄒㄧㄣ","ㄉㄜ˙"],
 "安靜地":["ㄢ","ㄐㄧㄥˋ","ㄉㄜ˙"], "緊張地":["ㄐㄧㄣˇ","ㄓㄤ","ㄉㄜ˙"],
 "努力地":["ㄋㄨˇ","ㄌㄧˋ","ㄉㄜ˙"], "很快地":["ㄏㄣˇ","ㄎㄨㄞˋ","ㄉㄜ˙"],
 "快速地":["ㄎㄨㄞˋ","ㄙㄨˋ","ㄉㄜ˙"],
 # CHAR_FIX 把「長」一律讀 ㄔㄤˊ，但「生長」是 ㄓㄤˇ
 "生長":["ㄕㄥ","ㄓㄤˇ"],
 # 台灣讀音：期 ㄑㄧˊ（同 星期）、唯一的「一」不變調
 "假期":["ㄐㄧㄚˋ","ㄑㄧˊ"], "唯一":["ㄨㄟˊ","ㄧ"],
}
# single characters pypinyin reads with the wrong default for these texts;
# words in OVERRIDE are applied afterwards and win where the reading differs.
CHAR_FIX = {
    "髒": "ㄗㄤ", "長": "ㄔㄤˊ", "數": "ㄕㄨˇ",
    "得": "ㄉㄜ˙",   # only ever the structural particle in these sentences
    "著": "ㄓㄜ˙",   # 同上（活著的、盯著看），不是 顯著 的 ㄓㄨˋ
    "隻": "ㄓ",     # T->S folds 隻 into 只, which reads ㄓˇ
    "乾": "ㄍㄢ",   # T->S folds 乾 into 干, which reads ㄍㄢˋ in some phrases
}

def zhuyin_of(s):
    """Return list of [char, zhuyin] for a Chinese string; zhuyin '' for punctuation/latin."""
    if s in OVERRIDE:
        zy = OVERRIDE[s]
        if len(zy) == len(s):
            return [[c, z] for c, z in zip(s, zy)]
    simp = to_simplified_aligned(s)
    raw = pinyin(simp, style=Style.BOPOMOFO, errors=lambda x: [""] * len(x))
    flat = [g[0] if g else "" for g in raw]
    if len(flat) != len(s):
        # fall back to per-character so alignment is never wrong
        flat = []
        for ch in simp:
            r = pinyin(ch, style=Style.BOPOMOFO, errors=lambda x: [""] * len(x))
            flat.append(r[0][0] if r and r[0] else "")
    out = []
    for ch, z in zip(s, flat):
        if not re.match(r"[一-鿿]", ch):
            z = ""
        z = CHAR_FIX.get(ch, z)
        out.append([ch, z])
    # tone sandhi for 一: ㄧˊ before a 4th-tone syllable, ㄧˋ before the rest.
    # Skipped when 一 ends the string or is followed by punctuation (ordinal use);
    # 第一 / 一月 / 星期一 are restored by the phrase overrides below.
    for i, (ch, z) in enumerate(out):
        if ch != "\u4e00" or i + 1 >= len(out):
            continue
        nxt = out[i + 1][1]
        if not nxt:
            continue
        out[i][1] = "\u3127\u02ca" if nxt.endswith("\u02cb") else "\u3127\u02cb"

    # apply multi-char overrides found inside the string, shortest first so a
    # longer phrase (不一樣) wins over the shorter one it contains (一樣)
    for word in sorted(OVERRIDE, key=len):
        zy = OVERRIDE[word]
        if len(word) < 2 or len(zy) != len(word):
            continue
        idx = s.find(word)
        while idx != -1:
            for k in range(len(word)):
                out[idx + k][1] = zy[k]
            idx = s.find(word, idx + 1)
    return out

