// calendar.js — 學期日曆：今天是第幾週、這週學哪一組字、哪天考試
//
// 為什麼需要：v1 全站沒有「現在是第幾週」這件事。主頁每次打開都停在
// FET Wk 1（words 的第一組），遊戲則是在全部組合裡隨機抽 —— 十月中了，
// 她不手動點兩個下拉選單的話，就是在拼開學第一週早就會的字。
//
// 有了日曆，v2 的「今日任務」才排得出來：這週的新字、考試前一天的模擬
// 小考、期中複習週要複習哪幾週。
//
// 換學期只要改 TERM。週次不是連續的時候（中間放假），在 skipWeeks 裡
// 列出「放假那週的週一」，之後的週次會自動往後順延。
//
// 時間一律用台北時間（+08:00），不看裝置時區。理由和
// tools/stamp_version.py 一樣：同一個人在不同時區的裝置上，「今天」要一樣。
// 台灣自 1979 年起沒有日光節約時間，寫死 +08:00 是正確的。

const TERM = {
  id: "2-1",
  // 第 1 週的週一。往回推算：2026-10-19（週一）是 Wk 8
  wk1Monday: "2026-08-31",
  // 每週拼字小考是星期幾（1 = 週一 … 5 = 週五）
  testWeekday: 5,
  // 課表沒有新字的週次 = 考試複習週。值是複習範圍的名稱
  reviewWeeks: { 8: "midterm", 9: "midterm", 18: "final", 19: "final" },
  // 放假而不算週次的週（填那週的週一，YYYY-MM-DD）。目前沒有
  skipWeeks: [],
  // 這學期的兩份課表在 words 裡的名稱
  lists: { fet: "二上 · FET Spelling", cet: "二上 · CET Vocabulary" },
};

const CAL_TZ_MS = 8 * 3600 * 1000;
const CAL_DAY_MS = 86400 * 1000;

/** 台北時間的「今天」，整數 YYYYMMDD。比對、存檔、當亂數種子都用這個 */
function taipeiDay(date) {
  const t = new Date((date ? +date : Date.now()) + CAL_TZ_MS);
  return t.getUTCFullYear() * 10000 + (t.getUTCMonth() + 1) * 100 + t.getUTCDate();
}

/** YYYYMMDD ↔ 從 1970 起算的第幾天。日期加減一律走這個，不碰時區 */
function ymdToDays(ymd) {
  const y = Math.floor(ymd / 10000), m = Math.floor(ymd / 100) % 100, d = ymd % 100;
  return Math.round(Date.UTC(y, m - 1, d) / CAL_DAY_MS);
}
function daysToYmd(days) {
  const t = new Date(days * CAL_DAY_MS);
  return t.getUTCFullYear() * 10000 + (t.getUTCMonth() + 1) * 100 + t.getUTCDate();
}
function addDays(ymd, n) { return daysToYmd(ymdToDays(ymd) + n); }
function isoToYmd(iso) { return +String(iso).replace(/-/g, ""); }

/** 1 = 週一 … 7 = 週日 */
function weekdayOf(ymd) {
  return ((ymdToDays(ymd) + 3) % 7) + 1; // 1970-01-01 是週四
}

/**
 * 「Wk 1&2」「Wk 11/12」「Wk 7&8」都要對得上第 1、2 週…這種合併週。
 * 不是週次的 key（「第 1 組」「星期」「洲名與洋名」）回傳空陣列。
 */
function weekNumbersOf(key) {
  const m = /^Wk\s+(.+)$/.exec(String(key).trim());
  if (!m) return [];
  return (m[1].match(/\d+/g) || []).map(Number);
}

/** 在 words[list] 裡找涵蓋第 n 週的那一組 key，找不到回傳 null */
function weekKeyFor(listName, n, wordsObj) {
  const W = wordsObj || (typeof words !== "undefined" ? words : {});
  const weeks = W[listName] || {};
  for (const key of Object.keys(weeks))
    if (weekNumbersOf(key).indexOf(n) >= 0) return key;
  return null;
}

/** 日期 → 第幾週（從 1 起算，扣掉 skipWeeks）。開學前是 0 或負數 */
function weekNumberOf(ymd, term) {
  const T = term || TERM;
  const start = ymdToDays(isoToYmd(T.wk1Monday));
  const today = ymdToDays(ymd);
  let n = Math.floor((today - start) / 7) + 1;
  // 每一個「已經過去或就是這週」的放假週，都讓週次少算一
  for (const iso of T.skipWeeks || []) {
    const skipMon = ymdToDays(isoToYmd(iso));
    if (skipMon <= today && skipMon >= start) n--;
  }
  return n;
}

/**
 * 今天在學期裡的位置。v2 的規劃器只看這個物件。
 *
 *   kind:  'new'    這週有新字
 *          'review' 課表沒字的考試複習週（Wk 8–9 期中、Wk 18–19 期末）
 *          'none'   開學前、學期結束後，或這週剛好兩份課表都沒有
 */
function currentWeek(date, opts) {
  const o = opts || {};
  const T = o.term || TERM;
  const ymd = typeof date === "number" && date > 19000000 && date < 30000000 ? date : taipeiDay(date);
  const n = weekNumberOf(ymd, T);
  const fetKey = weekKeyFor(T.lists.fet, n, o.words);
  const cetKey = weekKeyFor(T.lists.cet, n, o.words);
  const review = (T.reviewWeeks || {})[n] || null;
  const weekday = weekdayOf(ymd);

  let kind = "none";
  if (review) kind = "review";
  else if (fetKey || cetKey) kind = "new";

  const daysToTest = T.testWeekday - weekday;  // 負數 = 這週的考試已經過了
  return {
    ymd, n, kind, review, fetKey, cetKey, weekday,
    isWeekend: weekday >= 6,
    isTestDay: kind === "new" && weekday === T.testWeekday,
    isTestEve: kind === "new" && weekday === T.testWeekday - 1,
    daysToTest,
  };
}

/**
 * 複習週要複習哪幾組：從上一個複習週（或開學）之後，到這週之前的所有週次。
 * Wk 8 期中 → Wk 1–7；Wk 18 期末 → Wk 10–17。
 * 回傳 [{ list, key }]，兩份課表都算。
 */
function reviewScope(n, opts) {
  const o = opts || {};
  const T = o.term || TERM;
  const W = o.words || (typeof words !== "undefined" ? words : {});
  const reviewNs = Object.keys(T.reviewWeeks || {}).map(Number).sort((a, b) => a - b);
  // 往前找「這一段複習週」的第一週，再往前找上一段的最後一週
  let first = n;
  while (reviewNs.indexOf(first - 1) >= 0) first--;
  let from = 1;
  for (const r of reviewNs) if (r < first) from = r + 1;

  const out = [];
  for (const list of [T.lists.fet, T.lists.cet]) {
    for (const key of Object.keys(W[list] || {})) {
      const ns = weekNumbersOf(key);
      if (ns.length && ns.some((x) => x >= from && x < first)) out.push({ list, key });
    }
  }
  return out;
}

// 讓 node 的測試也載得到（瀏覽器沒有 module，這段不會執行）
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TERM, taipeiDay, ymdToDays, daysToYmd, addDays, weekdayOf,
    weekNumbersOf, weekKeyFor, weekNumberOf, currentWeek, reviewScope };
}
