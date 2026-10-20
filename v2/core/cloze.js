// cloze.js — 句子填空：用單字卡的例句（words.js 的 wordExamples）挖空（純函式，沒有畫面）
//
// 例句是一個字一句、彼此不會提到對方的答案（修卷子洩漏時整批查過）。
// 二上 290 個週單字裡，280 個字的例句裡出現的是「原形」，就只用這些：
// 另外幾句是 peeked、creatures、makes sense 這種變化形，挖空之後選項要跟著
// 變化，但我們沒有詞性，猜錯會出現 *swimmed 這種字 —— 寧可不出。

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * 把例句裡的 word 挖掉。找不到原形就回傳 null。
 *   clozeOf('valley', 'The river runs through the valley.')
 *   → { before: 'The river runs through the ', answer: 'valley', after: '.' }
 * answer 是句子裡的寫法（句首會是大寫），選項就照這個寫法出。
 */
export function clozeOf(word, sentence) {
  if (!word || !sentence) return null;
  const m = new RegExp('(^|[^A-Za-z])(' + esc(String(word).trim()) + ')(?![A-Za-z])', 'i').exec(sentence);
  if (!m) return null;
  const at = m.index + m[1].length;
  return { before: sentence.slice(0, at), answer: m[2], after: sentence.slice(at + m[2].length) };
}

/**
 * 挑誘答。
 *   - 不出句子裡已經有的字（不然她會以為是要再填一次）
 *   - 片語配片語、單字配單字；專有名詞配專有名詞（Africa 的誘答不能是 soil）
 *   - 長度接近的優先
 * 答案在句首時，誘答也改成大寫開頭，不然一看大小寫就知道答案。
 * rand：給測試用的亂數，畫面上用 Math.random。
 */
export function clozeDistractors(word, cloze, pool, n = 2, rand = Math.random) {
  const lw = String(word).toLowerCase();
  const inSentence = new Set((cloze.before + ' ' + cloze.after).toLowerCase().match(/[a-z]+/g) || []);
  const phrase = /\s/.test(word.trim()), proper = /^[A-Z]/.test(word);
  const seen = new Set([lw]);
  const cands = pool.filter((d) => {
    const ld = String(d).toLowerCase();
    if (seen.has(ld)) return false;
    seen.add(ld);
    return !ld.split(/[^a-z]+/).some((p) => p && inSentence.has(p));
  });
  // 同類的優先；同類湊不滿（例如 American 是這學期唯一的形容詞專有名詞）再放寬
  const sameKind = (d) => (/\s/.test(d.trim()) === phrase ? 0 : 2) + (/^[A-Z]/.test(d) === proper ? 0 : 1);
  const scored = cands.map((d) => ({ d, s: sameKind(d) * 100 + Math.abs(d.length - word.length) + rand() * 3 })).sort((a, b) => a.s - b.s);
  // 句首的答案是大寫，誘答也跟著大寫；反過來，答案是小寫時專有名詞誘答一看就不對，也沒關係
  const startCap = /^[A-Z]/.test(cloze.answer);
  return scored.slice(0, n).map(({ d }) => (startCap ? d[0].toUpperCase() + d.slice(1) : d));
}
