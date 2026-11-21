# -*- coding: utf-8 -*-
# 用法：python3 tools/lesson_arnold/build.py   （需要 pypinyin、opencc-python-reimplemented）
# 產生 lesson_arnold_apple_tree.html。加 --zy 會印出所有注音給人工校對。
import json, re, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from data import SECTIONS, S, W, EXTRA, GRAMMAR, EVENTS
from zhuyin_build import zhuyin_of

# 台灣讀音／破音字修正（pypinyin 用大陸讀音或抓錯詞組）
FIX = {'期': 'ㄑㄧˊ', '禿': 'ㄊㄨ', '長': 'ㄓㄤˇ'}  # 這課的「長」都是生長

def zy(s):
    out = []
    for ch, r in zhuyin_of(s):
        if ch in FIX: r = FIX[ch]
        if not re.match(r'[一-鿿]', ch): r = ''
        out.append(r or '')
    assert len(out) == len(s), s
    return out

def sect_of(n):
    for x in SECTIONS:
        if x['range'][0] <= n <= x['range'][1]: return x['id']

sentences, words = [], {}
for i, (en, zh, ids) in enumerate(S, 1):
    sentences.append(dict(n=i, en=en, zh=zh, z=zy(zh), w=ids, sec=sect_of(i)))
    for wid in ids:
        t, b, kb, kt, mz, diff, tip, fet = W[wid]
        assert t in en, (wid, t, en)
        if wid in words: continue
        words[wid] = dict(id=wid, t=t, b=b, kb=kb, kt=kt, zh=mz, z=zy(mz), diff=diff, tip=tip, fet=fet, s=i, sec=sect_of(i))
assert set(words) == set(W), set(W) - set(words)
for wid, (t, b, kb, kt, mz, diff, tip, fet) in EXTRA.items():
    words[wid] = dict(id=wid, t=t, b=b, kb=kb, kt=kt, zh=mz, z=zy(mz), diff=diff, tip=tip, fet=fet, s=0, sec='')

data = dict(sections=SECTIONS, sentences=sentences, words=list(words.values()),
            grammar=GRAMMAR, events=EVENTS)
tpl = open(os.path.join(HERE, 'template.html'), encoding='utf-8').read()
out = tpl.replace('/*__DATA__*/null', json.dumps(data, ensure_ascii=False))
open(os.path.join(ROOT, 'lesson_arnold_apple_tree.html'), 'w', encoding='utf-8').write(out)
print(len(sentences), 'sentences', len(words), 'words', sum(1 for w in words.values() if w['fet']), 'FET')
if '--zy' in sys.argv:
    for w in words.values(): print(w['zh'], ' '.join(w['z']))
    for s in sentences: print(s['zh'], ' '.join(x or '_' for x in s['z']))
