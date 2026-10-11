// check_mastery_keys.js — 檢查測驗卷會不會把「不是單字的東西」記進熟練度
//
// 為什麼需要這支：每張測驗卷交卷時都會呼叫 recordAttempt(key)，而 key 預設
// 就是答案本身。閱讀理解的答案是整句話（"almost three-quarters"、"over
// oceans"），整段克漏字的答案是變化形（"divided"、"continents"）——
// 這些直接記進去，錯題本就會跑出一個叫 "seven" 的「單字」要她練。
//
// 正確做法是補 lemma 欄位（整段克漏字寫成 {divided|divide}）。這支就是在
// 抓漏掉 lemma 的題目。
//
// 判斷標準：key 必須是 words.js 裡的某個單字，或至少 wordTranslations 查得到。
//
// 用法（需要 node）：
//     node tools/check_mastery_keys.js
// 有問題時 exit code 1，可以掛進 CI 或 pre-commit。

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const wordsSrc = read('words.js');
const words = new Function(wordsSrc + '; return words;')();
const translations = new Function(wordsSrc + '; return wordTranslations;')();

const inLists = new Set();
Object.values(words).forEach((cat) =>
  Object.values(cat).forEach((arr) =>
    (arr || []).forEach((w) => inLists.add(String(w).toLowerCase()))));

const isRealWord = (k) =>
  inLists.has(k) || !!(translations[k] || translations[k.toLowerCase()]);

let problems = 0;

/** 選擇／聽寫測驗：逐題切塊，lemma 寫在 wrong 前面或後面都要抓到 */
function checkClozeQuiz(file) {
  const html = read(file);
  const blocks = html.split(/\{\s*sentence:/).slice(1);
  const junk = [];
  blocks.forEach((block) => {
    const body = block.split(/\},?\s*\n\s*(?:\{|\]\))/)[0];
    const answer = (body.match(/answer: '((?:[^'\\]|\\.)*)'/) || [])[1];
    const lemma = (body.match(/lemma: '((?:[^'\\]|\\.)*)'/) || [])[1];
    const key = String(lemma || answer || '').replace(/\\'/g, "'").toLowerCase().trim();
    if (key && !isRealWord(key)) junk.push(key);
  });
  report(file, blocks.length, junk);
}

/** 整段克漏字：只掃 paragraphs 那一段，不然會抓到 JS 自己的大括號 */
function checkPassageCloze(file) {
  const html = read(file);
  const from = html.indexOf('paragraphs:');
  const to = html.indexOf('extra:', from);
  const para = html.slice(from, to < 0 ? undefined : to);
  const specs = [...para.matchAll(/\{([^}|]+)(?:\|([^}]+))?\}/g)];
  const junk = specs
    .map((m) => String(m[2] || m[1]).toLowerCase().trim())
    .filter((k) => !isRealWord(k));
  report(file, specs.length, junk);
}

function report(file, count, junk) {
  if (junk.length) {
    problems += junk.length;
    console.log('✗ ' + file.padEnd(28) + '會被當單字記進熟練度: ' + junk.join(', '));
  } else {
    console.log('✓ ' + file.padEnd(28) + count + ' 題');
  }
}

fs.readdirSync(ROOT)
  .filter((f) => /^daisy_.*\.html$/.test(f))
  .sort()
  .forEach((f) => {
    const html = read(f);
    if (html.includes('startPassageCloze')) checkPassageCloze(f);
    else if (html.includes('startClozeQuiz')) checkClozeQuiz(f);
  });

if (problems) {
  console.log('\n共 ' + problems + ' 筆會污染熟練度。'
            + '給那幾題補上 lemma（整段克漏字寫成 {divided|divide}）。');
  process.exit(1);
}
console.log('\n所有測驗的熟練度 key 都是真的單字 ✓');
