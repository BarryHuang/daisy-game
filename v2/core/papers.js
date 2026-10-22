// papers.js — 自動出每週的選擇填空卷（純函式，沒有畫面）
//
// 手工卷只有 12 張（FET Wk 1–6、CET Wk 1–7，用課本原句出的），課表排到 Wk 20。
// 沒有手工卷的週，就用單字卡的例句（wordExamples）自動出一張：
//   - 挖空和「只用原形」的規則跟「填填看」一樣（cloze.js）
//   - 誘答挑**同詞性**的字（pos.js），a / an 後面的空格也要對得上母音
//   - 先挑同一週的字（她這週正在學的），不夠再從整學期挑
//   - 同一週每次出的卷子一樣（用週次當亂數種子）：重新整理不會換題，
//     她第二次寫才知道自己有沒有進步
// 例句一個字一句、彼此不會提到對方的答案（修手工卷洩漏時查過），所以自動卷
// 本來就不太會洩漏；tests/run.js 會對每一週的卷子檢查重複和洩漏。

import { clozeOf } from './cloze.js';

const BLANK = '___';

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
/** 給種子的亂數（mulberry32）：同一個種子每次出一樣的序列 */
export function seeded(seed) {
  let a = hash(String(seed));
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 'continents' → {continents, continent, …}：抓洩漏時連變化形一起比 */
export function stems(word) {
  const w = String(word).toLowerCase();
  const out = new Set([w]);
  [/ies$/, /es$/, /s$/, /ed$/, /ing$/].forEach((re) => {
    if (re.test(w)) { const b = w.replace(re, ''); out.add(b); out.add(b + 'y'); out.add(b + 'e'); }
  });
  return out;
}
const wordsIn = (sentence) => {
  const out = new Set();
  (String(sentence).toLowerCase().match(/[a-z]+/g) || []).forEach((w) => stems(w).forEach((s) => out.add(s)));
  return out;
};
/** answer 有沒有出現在 sentence 裡（含變化形；片語要每個字都在） */
export function leaksInto(answer, sentence) {
  const bag = wordsIn(sentence.replace(BLANK, ' '));
  const parts = String(answer).toLowerCase().split(/[^a-z]+/).filter((p) => p.length > 2);
  return parts.length > 0 && parts.every((p) => [...stems(p)].some((s) => s.length > 2 && bag.has(s)));
}

const startsVowel = (w) => /^[aeiou]/i.test(w) && !/^(uni|use|one|eu)/i.test(w);

/**
 * 出一張卷。
 *   list       這一週的字
 *   pool       整學期的字（誘答的來源）
 *   exampleOf  (w) → 例句
 *   posOf      (w) → 'n' | 'v' | 'adj' | 'adv' | 'prep' | 'prop' | 'phr'
 *   seed       亂數種子（例如 'fet:Wk 10'）
 *   source     每題右下角的小標（例如 'FET Wk 10'）
 * 回傳 { questions: [{ sentence, answer, lemma, wrong:[2], source }], skipped: [挖不出空格的字] }
 */
export function makePaper({ list, pool, exampleOf, posOf, seed, source }) {
  const rand = seeded(seed);
  const lc = (w) => String(w).toLowerCase();
  const weekSet = new Set(list.map(lc));
  const uniq = [...new Map(list.map((w) => [lc(w), w])).values()];
  const poolUniq = [...new Map(pool.map((w) => [lc(w), w])).values()];
  const questions = [], skipped = [];

  for (const w of uniq) {
    const c = clozeOf(w, exampleOf(w));
    if (!c) { skipped.push(w); continue; }
    const sentence = c.before + BLANK + c.after;
    const p = posOf(w);
    const article = /\ban\s*$/i.test(c.before) ? 'an' : /\ba\s*$/i.test(c.before) ? 'a' : null;
    const fitsArticle = (d) => !article || (article === 'an') === startsVowel(d);
    const usable = poolUniq.filter((d) => lc(d) !== lc(w) && !leaksInto(d, sentence));
    // 由嚴到鬆：同詞性＋冠詞對 → 同詞性 → 冠詞對 → 什麼都行
    // （後兩層只有詞性太少的才會走到，例如這學期 CET 只有 across 一個介系詞）
    const tiers = [
      usable.filter((d) => posOf(d) === p && fitsArticle(d)),
      usable.filter((d) => posOf(d) === p),
      usable.filter((d) => fitsArticle(d) && posOf(d) !== 'phr'),
      usable,
    ];
    const wrong = [];
    for (const tier of tiers) {
      const ranked = tier.filter((d) => !wrong.includes(d))
        .map((d) => ({ d, r: (weekSet.has(lc(d)) ? 0 : 1) + rand() }))
        .sort((a, b) => a.r - b.r);
      for (const { d } of ranked) { if (wrong.length < 2) wrong.push(d); }
      if (wrong.length >= 2) break;
    }
    // 答案在句首是大寫，誘答也跟著大寫（不然一看大小寫就知道）
    const cap = /^[A-Z]/.test(c.answer) && p !== 'prop';
    questions.push({
      sentence, answer: c.answer, lemma: w, source,
      wrong: wrong.map((d) => (cap ? d[0].toUpperCase() + d.slice(1) : d)),
    });
  }
  // 例句偶爾會提到同一週的另一個字（A bison is a big ___. 洩漏了 bison 那題）。
  // 十題攤在同一頁，抄得到。拿掉「洩漏最多」的那題，直到沒有洩漏或只剩 8 題
  const MIN = 8;
  for (;;) {
    if (questions.length <= MIN) break;
    const count = questions.map((b) => questions.filter((a) => a !== b && leaksInto(a.lemma, b.sentence)).length);
    const worst = Math.max(...count);
    if (!worst) break;
    const [gone] = questions.splice(count.indexOf(worst), 1);
    skipped.push(gone.lemma);
  }
  // 題目順序也打亂（固定種子）：不要每次都照單字表的順序，前後題容易互相提示
  for (let i = questions.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [questions[i], questions[j]] = [questions[j], questions[i]]; }
  return { questions, skipped };
}

/** 卷子裡的問題：兩題填回答案後是同一句（重複）、某題答案出現在別題的句子裡（洩漏） */
export function auditPaper(questions) {
  const norm = (q) => q.sentence.replace(BLANK, q.answer).toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter(Boolean).sort().join(' ');
  const dupes = [], leaks = [];
  questions.forEach((a, i) => questions.forEach((b, j) => {
    if (j <= i) return;
    if (norm(a) === norm(b)) dupes.push([a.answer, b.answer]);
  }));
  questions.forEach((a) => questions.forEach((b) => {
    if (a !== b && leaksInto(a.lemma, b.sentence)) leaks.push(a.lemma + ' → ' + b.sentence);
  }));
  return { dupes, leaks };
}
