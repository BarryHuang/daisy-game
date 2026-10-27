// planner.js — 排今天的小徑（純函式，沒有畫面）
//
// 她打開 v2，不用選分類、不用選週次：這支看日曆（今天是第幾週、星期幾、
// 考試前一天沒）和記憶盒（哪些字到期了、哪些題型還很弱），排出今天的 3–4 關。
//
// ★ 一天的內容第一次打開時就定下來、存起來（呼叫端負責存）。不能每次打開都
//   重排：她練到一半，記憶盒變了，重排會換一批字，前面做的就白做了。
//
// 輸入全部由呼叫端傳進來（日曆、課表、記憶盒…），所以可以在 node 裡測。

/** 一關做幾個字。一關大約 2–3 分鐘，整條小徑約 10 分鐘 */
export const SIZES = { hear: 6, see: 6, spell: 6, use: 5, card: 8, test: 10 };

/** 同一天每次算出來都一樣、換一天就不一樣的雜湊（排序打平手時用） */
function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

const key = (w) => String(w).toLowerCase().trim();
/** 拼得出來嗎：只有字母、空白、連字號（空白和連字號會自動填） */
const spellable = (w) => /^[A-Za-z][A-Za-z '\-]*$/.test(String(w).trim());

/**
 * 某個字某個題型的優先順序，數字越小越該練：
 *   0 到期了（過期越久、盒號越低越前面）
 *   1 這個題型從沒練過
 *   2 還沒到期（越快到期越前面）
 * 同一級裡，錯得越多越前面；再打平就用當天的雜湊，每天的順序不一樣。
 */
function rank(word, skill, mastery, ymd) {
  const rec = mastery[key(word)];
  const k = rec && rec.k && rec.k[skill];
  const wrong = rec ? (rec.w || 0) / Math.max(1, (rec.w || 0) + (rec.r || 0)) : 0;
  const tie = hash(key(word) + ':' + skill + ':' + ymd) / 4294967296;
  if (k && k.d <= ymd) return [0, k.d, k.b || 0, -wrong, tie];
  if (!k) return [1, 0, 0, -wrong, tie];
  return [2, k.d, k.b || 0, -wrong, tie];
}
const cmp = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };

/**
 * 從 pool 挑 n 個最該練 skill 的字。
 * avoid：前面幾關已經挑過的字，盡量不要重複（字不夠才重複），
 * 這樣同一個字不會在三關裡連續出現三次。
 */
function pick(pool, skill, n, ctx, avoid) {
  const uniq = [...new Map(pool.map((w) => [key(w), w])).values()];
  const ranked = uniq.map((w) => ({ w, r: rank(w, skill, ctx.mastery, ctx.ymd) })).sort((a, b) => cmp(a.r, b.r));
  // 這個題型「到期」的字永遠優先，不受「前面幾關挑過」的限制 —— 它就是今天最該
  // 複習的東西。第一版一律避開，結果 valley 的「選意思」今天到期，卻因為第一關
  // 「聽一聽」先挑走了它，整天都沒被複習到（測試抓到的）
  const due = ranked.filter((x) => x.r[0] === 0);
  const fresh = ranked.filter((x) => x.r[0] !== 0 && !avoid.has(key(x.w)));
  const rest = ranked.filter((x) => x.r[0] !== 0 && avoid.has(key(x.w)));
  const chosen = due.concat(fresh, rest).slice(0, n).map((x) => x.w);
  chosen.forEach((w) => avoid.add(key(w)));
  return chosen;
}

/**
 * 先從 primary 挑，不夠再從 backup 補。
 * 平常週一定要用這個：本週的新字和以前的字在記憶盒裡都是「沒練過」，混在一起排
 * 的話打平，可能只排到一兩個本週的字 —— 但週五要考的就是本週這幾個。
 */
function pickPreferring(primary, backup, skill, n, ctx, avoid) {
  const first = pick(primary, skill, n, ctx, avoid);
  if (first.length >= n) return first;
  const have = new Set(first.map(key));
  return first.concat(pick(backup.filter((w) => !have.has(key(w))), skill, n - first.length, ctx, avoid));
}

const STATION = {
  card:  { skill: null,    name: '看新字', zy: 'ㄎㄢˋ ㄒㄧㄣ ㄗˋ',     em: '📖', color: 'sky' },
  hear:  { skill: 'hear',  name: '聽一聽', zy: 'ㄊㄧㄥ ㄧ ㄊㄧㄥ',      em: '👂', color: 'rose' },
  see:   { skill: 'see',   name: '選意思', zy: 'ㄒㄩㄢˇ ㄧˋ ㄙ˙',      em: '👀', color: 'sky' },
  spell: { skill: 'spell', name: '拼拼看', zy: 'ㄆㄧㄣ ㄆㄧㄣ ㄎㄢˋ',    em: '✏️', color: 'persimmon' },
  use:   { skill: 'use',   name: '填填看', zy: 'ㄊㄧㄢˊ ㄊㄧㄢˊ ㄎㄢˋ',  em: '🧩', color: 'plum' },
  test:  { skill: 'spell', name: '小考',   zy: 'ㄒㄧㄠˇ ㄎㄠˇ',          em: '📝', color: 'persimmon' },
  chest: { skill: null,    name: '寶箱',   zy: 'ㄅㄠˇ ㄒㄧㄤ',           em: '🎁', color: 'wheat' },
};
function station(type, words, extra) {
  return Object.assign({ id: type, type, words }, STATION[type], extra || {});
}

const NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十'];
const NUM_ZY = ['', 'ㄧ', 'ㄦˋ', 'ㄙㄢ', 'ㄙˋ', 'ㄨˇ', 'ㄌㄧㄡˋ', 'ㄑㄧ', 'ㄅㄚ', 'ㄐㄧㄡˇ', 'ㄕˊ'];
function numZy(n) {
  if (n <= 10) return NUM_ZY[n];
  if (n < 20) return 'ㄕˊ ' + NUM_ZY[n - 10];
  return 'ㄦˋ ㄕˊ';
}
const WEEKDAY = ['', '一', '二', '三', '四', '五', '六', '日'];
const WEEKDAY_ZY = ['', 'ㄧ', 'ㄦˋ', 'ㄙㄢ', 'ㄙˋ', 'ㄨˇ', 'ㄌㄧㄡˋ', 'ㄖˋ'];

/**
 * 小徑上方那一行字：中文＋注音（一個字一組）。
 *   第八週 · 期中複習 ／ 第十週 · 星期一 ／ 明天考試 ／ 考試日 加油
 */
function headline(week) {
  const parts = [];
  if (week.n >= 1 && week.n <= 20) parts.push({ zh: '第' + NUM[week.n] + '週', zy: 'ㄉㄧˋ ' + numZy(week.n) + ' ㄓㄡ' });
  if (week.kind === 'review') {
    parts.push(week.review === 'final' ? { zh: '期末複習', zy: 'ㄑㄧˊ ㄇㄛˋ ㄈㄨˋ ㄒㄧˊ' } : { zh: '期中複習', zy: 'ㄑㄧˊ ㄓㄨㄥ ㄈㄨˋ ㄒㄧˊ' });
  } else if (week.isTestEve) {
    parts.push({ zh: '明天考試', zy: 'ㄇㄧㄥˊ ㄊㄧㄢ ㄎㄠˇ ㄕˋ' });
  } else if (week.isTestDay) {
    parts.push({ zh: '考試加油', zy: 'ㄎㄠˇ ㄕˋ ㄐㄧㄚ ㄧㄡˊ' });
  } else {
    parts.push({ zh: '星期' + WEEKDAY[week.weekday], zy: 'ㄒㄧㄥ ㄑㄧˊ ' + WEEKDAY_ZY[week.weekday] });
  }
  return parts;
}

/**
 * 排今天的小徑。
 *
 *   ymd       今天（YYYYMMDD）
 *   week      calendar.js 的 currentWeek(ymd)
 *   words     words.js 的 words
 *   lists     { fet, cet } 這學期兩份課表的名稱（calendar.js 的 TERM.lists）
 *   scope     複習週要複習哪些組：calendar.js 的 reviewScope(n)；平常週可省略
 *   mastery   mastery.js 的 readMastery()
 *   seen      看過的新字卡 { word: ymd }
 *   hasMeaning(word)  這個字有沒有中文意思（沒有的不能出「選意思」和「拼拼看」）
 *   canCloze(word)    這個字能不能出「填填看」（例句裡有它的原形，見 cloze.js）；
 *                     省略就不排填填看
 *
 * 回傳 { ymd, kind, headline, stations: [{ id, type, skill, words, name, zy, em, color }] }
 */
export function planToday({ ymd, week, words, lists, scope, mastery = {}, seen = {}, hasMeaning = () => true, canCloze = () => false }) {
  const ctx = { ymd, mastery };
  const listOf = (list, k) => (k && words[list] && words[list][k]) || [];
  const isNew = (w) => !seen[key(w)] && !mastery[key(w)];

  // 這學期到這週為止學過的所有字（週末、開學前後的「什麼都複習」用）
  const learnedSoFar = () => {
    const out = [];
    for (const list of [lists.fet, lists.cet]) {
      for (const [k, arr] of Object.entries(words[list] || {})) {
        const ns = (k.match(/\d+/g) || []).map(Number);
        if (ns.length && Math.min(...ns) <= Math.max(1, week.n)) out.push(...(list === lists.fet ? arr.map((w) => ({ w, fet: true })) : arr.map((w) => ({ w, fet: false }))));
      }
    }
    return out;
  };

  const avoid = new Set();
  const stations = [];
  const meaningful = (arr) => arr.filter(hasMeaning);
  const clozable = (arr) => arr.filter(canCloze);

  if (week.kind === 'review' || week.kind === 'none') {
    // 複習週：從範圍內挑到期的、最弱的字，三種題型各一關
    const pool = week.kind === 'review' && scope
      ? scope.flatMap(({ list, key: k }) => listOf(list, k).map((w) => ({ w, fet: list === lists.fet })))
      : learnedSoFar();
    const all = pool.map((x) => x.w), fet = pool.filter((x) => x.fet).map((x) => x.w);
    const cet = pool.filter((x) => !x.fet).map((x) => x.w);
    // 有填填看的話，聽一聽和選意思各少一個，整條小徑還是 10 分鐘左右
    const cl = clozable(cet).length ? 1 : 0;
    stations.push(station('hear', pick(all, 'hear', SIZES.hear - cl, ctx, avoid)));
    stations.push(station('see', pick(meaningful(all), 'see', SIZES.see - cl, ctx, avoid)));
    // 填填看出 CET（字彙課）的字：CET 要「認得、也會用」，FET 練的是拼
    if (cl) stations.push(station('use', pick(clozable(cet), 'use', SIZES.use, ctx, avoid)));
    stations.push(station('spell', pick(meaningful(fet).filter(spellable), 'spell', SIZES.spell, ctx, avoid)));
  } else {
    const fetWeek = listOf(lists.fet, week.fetKey), cetWeek = listOf(lists.cet, week.cetKey);
    const thisWeek = [...fetWeek, ...cetWeek];
    const everything = learnedSoFar().map((x) => x.w);
    const cetEverything = () => learnedSoFar().filter((x) => !x.fet).map((x) => x.w);

    if (week.weekday <= 3) {
      // 週一到週三：新字分三天看完，再練
      const unseen = meaningful(thisWeek).filter(isNew);
      const daysLeft = 4 - week.weekday;                         // 週一 3、週二 2、週三 1
      const nCards = Math.min(SIZES.card, Math.ceil(unseen.length / daysLeft));
      if (nCards > 0) stations.push(station('card', unseen.slice(0, nCards)));
      // 「選意思」只考看過的字：今天剛看的新字卡，加上以前看過的本週字
      const introduced = meaningful(thisWeek).filter((w) => !isNew(w) || unseen.slice(0, nCards).includes(w));
      stations.push(station('see', pickPreferring(introduced, meaningful(everything), 'see', SIZES.see, ctx, avoid)));
      stations.push(station('spell', pickPreferring(meaningful(fetWeek).filter(spellable), meaningful(everything).filter(spellable), 'spell', SIZES.spell, ctx, avoid)));
      // 週一最後聽一聽；週二、三改成填填看（新字至少看過一次卡、選過一次意思了）
      const introducedCet = clozable(cetWeek).filter((w) => introduced.includes(w));
      if (week.weekday >= 2 && introducedCet.length) {
        stations.push(station('use', pickPreferring(introducedCet, clozable(cetEverything()), 'use', SIZES.use, ctx, avoid)));
      } else {
        stations.push(station('hear', pickPreferring(thisWeek, everything, 'hear', SIZES.hear - 1, ctx, avoid)));
      }
    } else if (week.isTestEve) {
      // 考前一天：先暖身，再把本週所有拼字聽寫一遍
      stations.push(station('see', pick(meaningful(thisWeek), 'see', 5, ctx, avoid)));
      stations.push(station('test', meaningful(fetWeek).filter(spellable).slice(0, SIZES.test), { dictation: true }));
    } else if (week.isTestDay) {
      // 考試當天：輕鬆一點
      stations.push(station('hear', pickPreferring(thisWeek, everything, 'hear', 5, ctx, avoid)));
      stations.push(station('see', pick(meaningful(everything), 'see', 5, ctx, avoid)));
    } else {
      // 週末：只複習到期的、最弱的
      stations.push(station('see', pick(meaningful(everything), 'see', SIZES.see - 1, ctx, avoid)));
      stations.push(station('use', pick(clozable(cetEverything()), 'use', SIZES.use, ctx, avoid)));
      const fetAll = learnedSoFar().filter((x) => x.fet).map((x) => x.w);
      stations.push(station('spell', pick(meaningful(fetAll).filter(spellable), 'spell', 5, ctx, avoid)));
    }
  }

  stations.push(station('chest', []));
  return { ymd, kind: week.kind, headline: headline(week), stations: stations.filter((s) => s.type === 'chest' || s.words.length) };
}
