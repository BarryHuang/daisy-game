# -*- coding: utf-8 -*-
"""Work out which English surface forms the JS suffix rules CANNOT reduce, and
ship only those as a lookup table. lemminflect is the oracle here; it never
ships to the browser."""
import io, json, re
from lemminflect import getAllLemmas
from wordfreq import top_n_list

# Mirror of the JS candidate generator in dictionary.js — keep the two in sync.
def candidates(w):
    out = [w]
    def add(*xs):
        for x in xs:
            if x and len(x) > 1 and x not in out: out.append(x)
    if w.endswith("ies") and len(w) > 4: add(w[:-3] + "y")
    if w.endswith("es") and len(w) > 3:  add(w[:-2], w[:-1])
    if w.endswith("s") and not w.endswith("ss"): add(w[:-1])
    if w.endswith("ed") and len(w) > 3:
        add(w[:-2], w[:-1])
        if len(w) > 4 and w[-3] == w[-4]: add(w[:-3])       # stopped -> stop
        if w.endswith("ied"): add(w[:-3] + "y")             # tried -> try
    if w.endswith("ing") and len(w) > 4:
        add(w[:-3], w[:-3] + "e")
        if len(w) > 5 and w[-4] == w[-5]: add(w[:-4])       # running -> run
    if w.endswith("er") and len(w) > 3:  add(w[:-2], w[:-1])
    if w.endswith("est") and len(w) > 4: add(w[:-3], w[:-2])
    if w.endswith("ly") and len(w) > 3:  add(w[:-2])
    return out

def main():
    vocab = [w for w in top_n_list("en", 60000) if re.match(r"^[a-z]+$", w)]
    known = set(vocab)
    irregular = {}
    covered = failed = 0
    for w in vocab:
        lemmas = {l for forms in getAllLemmas(w).values() for l in forms}
        lemmas.discard(w)
        if not lemmas:
            continue
        # only worth shipping if the lemma is a word the dictionary could hold
        lemmas = {l for l in lemmas if l in known}
        if not lemmas:
            continue
        if lemmas & set(candidates(w)):
            covered += 1
        else:
            failed += 1
            irregular[w] = sorted(lemmas)[0]

    print("inflected forms checked: %d" % (covered + failed))
    print("  handled by suffix rules: %d (%.1f%%)" % (covered, 100 * covered / (covered + failed)))
    print("  need the exception table: %d" % failed)
    print("  table size: %.1f KB" % (len(json.dumps(irregular)) / 1024))
    print("  samples:", dict(list(irregular.items())[:12]))
    io.open("irregular.json", "w", encoding="utf-8").write(
        json.dumps(irregular, ensure_ascii=False, separators=(",", ":"), sort_keys=True))

main()
