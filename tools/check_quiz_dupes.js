// check_quiz_dupes.js — 抓測驗卷裡「兩題其實是同一句」和「答案被別題洩漏」
//
// 為什麼需要這支：Wk 5 和 Wk 7 的句子都取自課本原句，但課文篇幅有限 ——
// strong 和 wave 整篇只出現在「Strong winds cause high waves.」這一句，
// natural 和 feature 只出現在「Landforms are natural features on Earth.」。
// 當時為了湊滿 10 題，就把同一句挖不同的空格出了好幾次：
//
//     Q2  ___ winds cause high waves.      → Strong
//     Q3  Strong winds cause high ___.     → waves
//     Q5  Strong winds ___ high waves.     → cause
//
// 十題裡三題長一樣。cloze_quiz.js 是一次把十題全部攤在同一頁上的，所以
// 這種重複一眼就看得到 —— 是女兒自己寫的時候發現的，不是我測出來的。
//
// 兩種檢查：
//   重複（會 exit 1）：把空格填回答案之後，兩題的句子一樣
//   洩漏（只提醒）：某題的答案，原封不動出現在另一題的句子裡
//
// 洩漏不當成錯誤，是因為它和「用課本原句」本來就互相衝突 —— 課文就那幾句，
// 彼此一定會提到對方的字。要不要為了避免洩漏而放棄原句，是教學上的取捨，
// 不是程式能決定的事。
//
// 用法（需要 node）：
//     node tools/check_quiz_dupes.js
// 有重複時 exit code 1，可以掛進 CI 或 pre-commit。

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/** 'He is ___.' + 'happy' -> 排序過的字詞集合，用來比對兩句是不是同一句 */
function normalize(sentence, answer) {
  return sentence.replace('___', answer)
    .toLowerCase().replace(/[^a-z ]/g, ' ')
    .split(/\s+/).filter(Boolean).sort().join(' ');
}

// 洩漏要連變化形一起抓：Q5 的「These ___ are called continents.」裡的
// continents 就是 Q6 的答案 continent，只比對原形的話會漏掉。
// 規則很粗，但課表的字就是這幾種變化，夠用。
function stems(word) {
  const w = word.toLowerCase();
  const out = new Set([w]);
  [/ies$/, /es$/, /s$/, /ed$/, /ing$/].forEach((re) => {
    if (re.test(w)) {
      const base = w.replace(re, '');
      out.add(base);
      out.add(base + 'y');  // flies -> fly
      out.add(base + 'e');  // divided -> divide
    }
  });
  return out;
}

function wordsIn(sentence) {
  const out = new Set();
  sentence.replace('___', ' ').toLowerCase().replace(/[^a-z ]/g, ' ')
    .split(/\s+/).filter(Boolean)
    .forEach((w) => stems(w).forEach((s) => out.add(s)));
  return out;
}

/** 答案也要展開，'features' 要能對上句子裡的 'feature' */
function leaksInto(answer, sentence) {
  const bag = wordsIn(sentence);
  return [...stems(answer)].some((s) => s.length > 2 && bag.has(s));
}

/** 逐題切塊，順序不固定（lemma 寫在 wrong 前面或後面都要抓到） */
function parse(html) {
  const unquote = (s) => (s || '').replace(/\\'/g, "'");
  return html.split(/\{\s*sentence:/).slice(1).map((block) => {
    const body = block.split(/source:/)[0];
    return {
      sentence: unquote((body.match(/^\s*'((?:[^'\\]|\\.)*)'/) || [])[1]),
      answer: unquote((body.match(/answer: '((?:[^'\\]|\\.)*)'/) || [])[1]),
    };
  }).filter((q) => q.sentence && q.answer);
}

let dupes = 0;
const leaks = [];

fs.readdirSync(ROOT)
  .filter((f) => /^daisy_.*\.html$/.test(f))
  .filter((f) => fs.readFileSync(path.join(ROOT, f), 'utf8').includes('startClozeQuiz'))
  .sort()
  .forEach((file) => {
    const qs = parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));

    // ① 重複：填回答案之後一模一樣的句子
    const groups = new Map();
    qs.forEach((q, i) => {
      const key = normalize(q.sentence, q.answer);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(i + 1);
    });
    const repeated = [...groups.entries()].filter(([, ns]) => ns.length > 1);

    // ② 洩漏：這題的答案出現在別題的句子裡
    qs.forEach((q, i) => {
      qs.forEach((other, j) => {
        if (i === j) return;
        if (leaksInto(q.answer, other.sentence)) {
          leaks.push(`${file}  Q${j + 1} 的句子裡有 Q${i + 1} 的答案 "${q.answer}"`);
        }
      });
    });

    if (repeated.length) {
      dupes += repeated.length;
      console.log('✗ ' + file.padEnd(24) + qs.length + ' 題');
      repeated.forEach(([, ns]) => {
        const q = qs[ns[0] - 1];
        console.log('    ' + ns.map((n) => 'Q' + n).join('/') + ' 是同一句：'
                  + q.sentence.replace('___', q.answer));
        ns.forEach((n) => console.log(`      Q${n}  ${qs[n - 1].sentence}  → ${qs[n - 1].answer}`));
      });
    } else {
      console.log('✓ ' + file.padEnd(24) + qs.length + ' 題');
    }
  });

if (leaks.length) {
  console.log('\n提醒：答案出現在別題的句子裡（' + leaks.length + ' 處）。'
            + '用課本原句就會這樣，不一定要改：');
  leaks.forEach((l) => console.log('  · ' + l));
}

if (dupes) {
  console.log('\n共 ' + dupes + ' 組重複句。課文原句不夠用的時候，'
            + '自己寫一句她讀得懂的，不要同一句挖兩次。');
  process.exit(1);
}
console.log('\n沒有兩題是同一句 ✓');
