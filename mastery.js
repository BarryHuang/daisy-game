// mastery.js — 記錄每個單字她到底會不會
//
// 為什麼需要：倉鼠只記總數（totalWordsCleared），所以學期一換，
// 上學期那 242 個字等於消失了，沒有人知道哪些她其實還沒學會。
// 有了逐字紀錄，才可能做隔週複習，也才能告訴家長「這 12 個字她一直錯」。
//
// 跟 lookups.js 一樣：先寫本機，有登入再同步雲端。
//   本機： localStorage["daisy_mastery"] = { word: {r,w,t,s,k} }
//   雲端： users/<CODE>/mastery/<word>
//     r = 答對次數, w = 答錯次數, t = 最後一次時間, s = 目前連對幾次
//     k = 各題型的記憶盒（v2 加的，見下面）
//
// ── v2：間隔複習 ─────────────────────────────────────────────────────
// v1 的「連對 3 次就畢業」有兩個問題：
//   ① 不看時間 —— 同一個下午玩三次翻翻樂就畢業，之後永遠不會再複習
//   ② 不分題型 —— 三選一認得出 planet，和自己拼得出 planet 被當成同一件事，
//      但 FET 考的是拼
// 所以在 r/w/t/s 旁邊加上 k：每個題型一個 Leitner 盒。
//     k = { see|hear|spell|use: { b, d, day, u } }
//       b   盒號 0–5，對應間隔 BOX_DAYS[b] 天
//       d   下次到期日 YYYYMMDD
//       day 上次升盒的日子 —— 同一題型一天最多升一盒，這是解決 ① 的關鍵
//       u   最後更新的毫秒時間，跨裝置合併時誰新用誰
//
// v1 的欄位和函式（isMastered、getWeakWords）完全照舊，v1 的頁面不受影響。
// recordAttempt 多了第四個參數 skill，沒帶就是 'see'，所以 v1 的 15 個呼叫點
// 不用改。

const MASTERY_KEY = "daisy_mastery";
const MASTERY_VERSION_KEY = "daisy_mastery_v";
const MASTERY_BACKUP_KEY = "daisy_mastery_v1_backup";

/** 題型。順序就是 v2 介面上的顏色順序 */
const SKILLS = ["see", "hear", "spell", "use"];
/** 第 b 盒多久之後再考一次（天） */
const BOX_DAYS = [0, 1, 2, 4, 8, 16];
const MAX_BOX = BOX_DAYS.length - 1;
/** 盒號到這裡算「記住了」 */
const KNOWN_BOX = 3;
/**
 * 答對但錯了幾次以內還算數。跟 v1 的「乾淨」定義一樣（errors > 1 才不算），
 * 平板上手指按歪一下很常見，不該因為一次誤觸就整個掉回第一盒。
 */
const ERROR_TOLERANCE = 1;

// 測試要能控制時間；平常就是 Date.now()
let masteryClock = () => Date.now();
function setMasteryClock(fn) { masteryClock = fn || (() => Date.now()); }

/** 台北時間的今天（YYYYMMDD）。calendar.js 有同一支，這裡不依賴它的載入順序 */
function masteryToday() {
  const t = new Date(masteryClock() + 8 * 3600 * 1000);
  return t.getUTCFullYear() * 10000 + (t.getUTCMonth() + 1) * 100 + t.getUTCDate();
}
function masteryAddDays(ymd, n) {
  const y = Math.floor(ymd / 10000), m = Math.floor(ymd / 100) % 100, d = ymd % 100;
  const t = new Date(Date.UTC(y, m - 1, d) + n * 86400000);
  return t.getUTCFullYear() * 10000 + (t.getUTCMonth() + 1) * 100 + t.getUTCDate();
}

function masteryKey(word) {
  return String(word).toLowerCase().trim().replace(/[.$#\[\]\/]/g, "_");
}

function readMastery() {
  try { return JSON.parse(localStorage.getItem(MASTERY_KEY)) || {}; }
  catch (e) { return {}; }
}

function writeMastery(map) {
  try { localStorage.setItem(MASTERY_KEY, JSON.stringify(map)); } catch (e) {}
}

function masteryUser() {
  try { return localStorage.getItem("daisy_hamster_user") || ""; } catch (e) { return ""; }
}

/**
 * 某個題型答了一次之後，記憶盒怎麼變。純函式，方便測。
 *   答對：今天還沒升過就升一盒，到期日往後推那一盒的天數
 *   答錯：掉回第 1 盒，明天再考
 */
function nextBox(prev, ok, today, nowMs) {
  const p = prev || { b: 0, d: today, day: 0 };
  if (ok) {
    if (p.day === today) return Object.assign({}, p, { u: nowMs }); // 今天升過了
    const b = Math.min(MAX_BOX, (p.b || 0) + 1);
    return { b, d: masteryAddDays(today, BOX_DAYS[b]), day: today, u: nowMs };
  }
  return { b: 1, d: masteryAddDays(today, 1), day: p.day || 0, u: nowMs };
}

/**
 * 記一次作答。
 * errors 是「答對前錯了幾次」——沒錯就過關和錯五次才過關，熟練度差很多，
 * 所以帶錯誤的過關不算連對。
 * skill 是題型（see / hear / spell / use），沒帶就當成 see。
 */
function recordAttempt(word, correct, errors, skill) {
  const key = masteryKey(word);
  if (!key) return;
  ensureMasteryMigrated();

  const map = readMastery();
  const prev = map[key] || { r: 0, w: 0, s: 0 };
  const clean = correct && !(errors > ERROR_TOLERANCE);
  const now = masteryClock();
  const sk = SKILLS.indexOf(skill) >= 0 ? skill : "see";

  const k = Object.assign({}, prev.k || {});
  k[sk] = nextBox(k[sk], clean, masteryToday(), now);

  map[key] = {
    r: (prev.r || 0) + (correct ? 1 : 0),
    w: (prev.w || 0) + (correct ? 0 : 1),
    t: now,
    s: clean ? (prev.s || 0) + 1 : 0,
    k
  };
  writeMastery(map);

  const code = masteryUser();
  if (!code || typeof getFirebaseDb !== "function") return;
  getFirebaseDb().then((db) => {
    if (!db) return;
    db.ref("users/" + code + "/mastery/" + key).set(map[key]).catch(() => {});
  });
}

function getMastery(word) {
  return readMastery()[masteryKey(word)] || null;
}

/** 連對三次就算學會了，之後不用一直複習（v1 的定義，v1 的頁面在用，不要改） */
function isMastered(word) {
  const m = getMastery(word);
  return !!m && m.s >= 3;
}

/**
 * 最該複習的字，最弱的排前面。
 * 錯得多的優先，其次是很久沒出現的 —— 只看錯誤次數的話，
 * 上學期學過但從沒複習的字永遠不會被撈出來。
 */
function getWeakWords(limit, pool) {
  const map = readMastery();
  const now = masteryClock();
  const day = 86400000;

  const scored = Object.entries(map)
    .filter(([w]) => !pool || pool.some((p) => p.toLowerCase() === w))
    .filter(([, m]) => (m.s || 0) < 3)
    .map(([w, m]) => {
      const wrong = m.w || 0, right = m.r || 0;
      const rate = wrong / Math.max(1, wrong + right);
      const stale = Math.min(30, (now - (m.t || now)) / day) / 30;
      return { word: w, score: rate * 3 + stale, wrong, right, last: m.t || 0 };
    })
    .sort((a, b) => b.score - a.score);

  return limit ? scored.slice(0, limit) : scored;
}

// ── v2 的查詢 ────────────────────────────────────────────────────────

/** 某個字某個題型的盒號，沒紀錄是 0 */
function skillBox(word, skill) {
  const m = getMastery(word);
  return (m && m.k && m.k[skill] && m.k[skill].b) || 0;
}

/**
 * 記住了沒。依課程看不同的題型：
 *   fet（拼字課）→ 要拼得出來：spell ≥ KNOWN_BOX
 *   cet（字彙課）→ 要認得、也會用：see 和 use 都 ≥ KNOWN_BOX
 *   沒指定        → 任何一個題型到了就算
 */
function isKnown(word, course) {
  const m = getMastery(word);
  const k = (m && m.k) || {};
  const b = (s) => (k[s] && k[s].b) || 0;
  if (course === "fet") return b("spell") >= KNOWN_BOX;
  if (course === "cet") return b("see") >= KNOWN_BOX && b("use") >= KNOWN_BOX;
  return SKILLS.some((s) => b(s) >= KNOWN_BOX);
}

/**
 * 今天（或指定日）到期該複習的 (字, 題型)。
 *   pool  只看這些字（可省略）
 *   limit 最多幾筆
 * 排序：過期越久越前面，同一天到期的盒號越低越前面（越不熟的先複習）。
 */
function getDue(today, pool, limit) {
  ensureMasteryMigrated();
  const day = today || masteryToday();
  const allow = pool ? new Set(pool.map(masteryKey)) : null;
  const out = [];
  for (const [w, m] of Object.entries(readMastery())) {
    if (allow && !allow.has(w)) continue;
    for (const [skill, rec] of Object.entries((m && m.k) || {})) {
      if (rec && rec.d && rec.d <= day) out.push({ word: w, skill, b: rec.b || 0, d: rec.d });
    }
  }
  out.sort((a, b) => (a.d - b.d) || (a.b - b.b) || (a.word < b.word ? -1 : 1));
  return limit ? out.slice(0, limit) : out;
}

// ── 從 v1 的資料遷移 ─────────────────────────────────────────────────

/** 同一個字每次算出來都一樣的小雜湊，用來把到期日分散開 */
function masteryHash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/**
 * v1 的紀錄沒有 k。第一次載入 v2 版的 mastery.js 時補上：
 *   已經「畢業」（s ≥ 3）的字 → see 第 2 盒
 *   練過但還沒畢業的字       → see 第 1 盒
 * 到期日用字的雜湊分散在未來 14 天，不然升級當天會有三百個字同時到期，
 * 今日任務直接爆掉。
 *
 * 遷移前先把整份 v1 資料備份到 daisy_mastery_v1_backup。只新增欄位，
 * 不刪除、不改任何 v1 欄位。做過一次就不再做（daisy_mastery_v = 2）。
 */
function migrateMastery(map, today) {
  const out = {};
  for (const [w, m] of Object.entries(map || {})) {
    if (!m || m.k) { out[w] = m; continue; }
    const tried = (m.r || 0) + (m.w || 0) > 0;
    if (!tried) { out[w] = m; continue; }
    const b = (m.s || 0) >= 3 ? 2 : 1;
    const spread = masteryHash(w) % 14;
    out[w] = Object.assign({}, m, {
      k: { see: { b, d: masteryAddDays(today, spread), day: 0, u: m.t || 0 } }
    });
  }
  return out;
}

let masteryMigrated = false;
function ensureMasteryMigrated() {
  if (masteryMigrated) return;
  masteryMigrated = true;
  try {
    if (localStorage.getItem(MASTERY_VERSION_KEY) === "2") return;
    const raw = localStorage.getItem(MASTERY_KEY);
    if (raw && !localStorage.getItem(MASTERY_BACKUP_KEY))
      localStorage.setItem(MASTERY_BACKUP_KEY, raw);
    writeMastery(migrateMastery(readMastery(), masteryToday()));
    localStorage.setItem(MASTERY_VERSION_KEY, "2");
  } catch (e) {}
}

/**
 * 主頁 v1 自己記的錯字清單（petData.stats.mistakeWords，全大寫）併進來。
 * 那份清單是「拼錯過」的字，所以放到 spell 第 0 盒、今天到期。
 * 已經有 spell 紀錄的字不動 —— 新的紀錄比那份舊清單準。
 */
function importLegacyMistakes(list) {
  if (!Array.isArray(list) || !list.length) return 0;
  ensureMasteryMigrated();
  const map = readMastery();
  const today = masteryToday(), now = masteryClock();
  let n = 0;
  for (const raw of list) {
    const key = masteryKey(raw);
    if (!key) continue;
    const m = map[key] || { r: 0, w: 0, s: 0, t: now };
    const k = Object.assign({}, m.k || {});
    if (k.spell) continue;
    k.spell = { b: 0, d: today, day: 0, u: now };
    map[key] = Object.assign({}, m, { k });
    n++;
  }
  if (n) writeMastery(map);
  return n;
}

// ── 跨裝置同步 ───────────────────────────────────────────────────────

/**
 * 兩份紀錄合併成一份。純函式，方便測。
 *   r / w：取大的（舊行為，無法知道兩邊各自加了多少，取大的至少不會變少）
 *   t / s：誰的 t 新用誰
 *   k：每個題型各自比 u，誰新用誰 —— 平板上練拼字、手機上玩翻翻樂，
 *      兩邊的進度都要留下來，不能整筆被另一台蓋掉
 */
function mergeMasteryRecord(a, b) {
  a = a || {}; b = b || {};
  const newer = (b.t || 0) >= (a.t || 0) ? b : a;
  const out = {
    r: Math.max(a.r || 0, b.r || 0),
    w: Math.max(a.w || 0, b.w || 0),
    t: newer.t || 0,
    s: newer.s || 0,
  };
  const ka = a.k || {}, kb = b.k || {};
  const skills = new Set([...Object.keys(ka), ...Object.keys(kb)]);
  if (skills.size) {
    out.k = {};
    for (const s of skills) {
      const x = ka[s], y = kb[s];
      out.k[s] = !x ? y : !y ? x : ((y.u || 0) >= (x.u || 0) ? y : x);
    }
  }
  return out;
}

/** 合併雲端資料（換裝置時用）；本機較新的不覆蓋 */
function syncMastery(callback) {
  ensureMasteryMigrated();
  const code = masteryUser();
  if (!code || typeof getFirebaseDb !== "function") return callback && callback(readMastery());
  getFirebaseDb().then((db) => {
    if (!db) return callback && callback(readMastery());
    db.ref("users/" + code + "/mastery").once("value").then((snap) => {
      const remote = snap.val() || {}, local = readMastery(), merged = {};
      for (const w of new Set([...Object.keys(remote), ...Object.keys(local)]))
        merged[w] = mergeMasteryRecord(remote[w], local[w]);
      // 雲端那份可能是還沒升級的裝置寫的，沒有 k 的補上
      writeMastery(migrateMastery(merged, masteryToday()));
      callback && callback(readMastery());
    }).catch(() => callback && callback(readMastery()));
  });
}

// 讓 node 的測試也載得到（瀏覽器沒有 module，這段不會執行）
if (typeof module !== "undefined" && module.exports) {
  module.exports = { SKILLS, BOX_DAYS, KNOWN_BOX, ERROR_TOLERANCE, setMasteryClock,
    masteryToday, masteryAddDays, masteryKey, readMastery, writeMastery, nextBox,
    recordAttempt, getMastery, isMastered, getWeakWords, skillBox, isKnown, getDue,
    migrateMastery, ensureMasteryMigrated, importLegacyMistakes, mergeMasteryRecord,
    syncMastery, _resetMigrationFlag: () => { masteryMigrated = false; } };
}
