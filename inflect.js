// inflect.js — 把文章裡的變化形還原成字典查得到的原形
// 文章裡出現的是 hesitated / consequences / running，不是原形。
// 這裡不追求「正確還原」，而是「產生候選再去索引裡試」——命中就對了，
// 所以規則寬鬆一點也不會有壞處。
// 規則對照 build_irregular.py 的 candidates()，兩邊要一起改。

function inflectCandidates(word) {
  const w = String(word).toLowerCase().trim();
  const out = [];
  const add = (...xs) => {
    for (const x of xs) if (x && x.length > 1 && !out.includes(x)) out.push(x);
  };

  add(w);
  if (typeof IRREGULAR !== "undefined" && IRREGULAR[w]) add(IRREGULAR[w]);

  if (w.endsWith("ies") && w.length > 4) add(w.slice(0, -3) + "y");
  if (w.endsWith("es") && w.length > 3) add(w.slice(0, -2), w.slice(0, -1));
  if (w.endsWith("s") && !w.endsWith("ss")) add(w.slice(0, -1));

  if (w.endsWith("ed") && w.length > 3) {
    add(w.slice(0, -2), w.slice(0, -1));
    if (w.length > 4 && w[w.length - 3] === w[w.length - 4]) add(w.slice(0, -3)); // stopped→stop
    if (w.endsWith("ied")) add(w.slice(0, -3) + "y");                             // tried→try
  }

  if (w.endsWith("ing") && w.length > 4) {
    add(w.slice(0, -3), w.slice(0, -3) + "e");
    if (w.length > 5 && w[w.length - 4] === w[w.length - 5]) add(w.slice(0, -4)); // running→run
  }

  if (w.endsWith("er") && w.length > 3) add(w.slice(0, -2), w.slice(0, -1));
  if (w.endsWith("est") && w.length > 4) add(w.slice(0, -3), w.slice(0, -2));
  if (w.endsWith("ly") && w.length > 3) add(w.slice(0, -2));

  return out;
}

// 依序試候選，回傳第一個在 index 裡命中的 { form, hit }
function resolveWord(word, lookup) {
  for (const form of inflectCandidates(word)) {
    const hit = lookup(form);
    if (hit) return { form, hit };
  }
  return null;
}
