// mastery.js — 記錄每個單字她到底會不會
//
// 為什麼需要：倉鼠只記總數（totalWordsCleared），所以學期一換，
// 上學期那 242 個字等於消失了，沒有人知道哪些她其實還沒學會。
// 有了逐字紀錄，才可能做隔週複習，也才能告訴家長「這 12 個字她一直錯」。
//
// 跟 lookups.js 一樣：先寫本機，有登入再同步雲端。
//   本機： localStorage["daisy_mastery"] = { word: {r,w,t,s} }
//   雲端： users/<CODE>/mastery/<word>
//     r = 答對次數, w = 答錯次數, t = 最後一次時間, s = 目前連對幾次

const MASTERY_KEY = "daisy_mastery";

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
 * 記一次作答。
 * errors 是「答對前錯了幾次」——沒錯就過關和錯五次才過關，熟練度差很多，
 * 所以帶錯誤的過關不算連對。
 */
function recordAttempt(word, correct, errors) {
  const key = masteryKey(word);
  if (!key) return;

  const map = readMastery();
  const prev = map[key] || { r: 0, w: 0, s: 0 };
  const clean = correct && !(errors > 1);

  map[key] = {
    r: (prev.r || 0) + (correct ? 1 : 0),
    w: (prev.w || 0) + (correct ? 0 : 1),
    t: Date.now(),
    s: clean ? (prev.s || 0) + 1 : 0
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

/** 連對三次就算學會了，之後不用一直複習 */
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
  const now = Date.now();
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

/** 合併雲端資料（換裝置時用）；本機較新的不覆蓋 */
function syncMastery(callback) {
  const code = masteryUser();
  if (!code || typeof getFirebaseDb !== "function") return callback && callback(readMastery());
  getFirebaseDb().then((db) => {
    if (!db) return callback && callback(readMastery());
    db.ref("users/" + code + "/mastery").once("value").then((snap) => {
      const remote = snap.val() || {}, local = readMastery(), merged = {};
      for (const w of new Set([...Object.keys(remote), ...Object.keys(local)])) {
        const a = remote[w] || {}, b = local[w] || {};
        merged[w] = (b.t || 0) >= (a.t || 0)
          ? { r: Math.max(a.r || 0, b.r || 0), w: Math.max(a.w || 0, b.w || 0), t: b.t || a.t || 0, s: b.s || 0 }
          : { r: Math.max(a.r || 0, b.r || 0), w: Math.max(a.w || 0, b.w || 0), t: a.t || 0, s: a.s || 0 };
      }
      writeMastery(merged);
      callback && callback(merged);
    }).catch(() => callback && callback(readMastery()));
  });
}
