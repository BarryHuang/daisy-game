// lookups.js — 記錄她查過的單字，並讓其他頁面拿得到
//
// 設計原則：先寫本機再同步雲端。查字典常常發生在沒有網路、也還沒登入的時候，
// 那種情況下還是要記得住，不能因為 Firebase 不在就整個失效。
//
//   本機： localStorage["daisy_dict_lookups"] = { word: {n, t, zh} }
//   雲端： users/<CODE>/lookups/<word>       = {n, t, zh}
//          n = 查過幾次, t = 最後一次時間, zh = 當時看到的中文

const LOOKUPS_KEY = "daisy_dict_lookups";
const USER_KEY = "daisy_hamster_user";          // 沿用倉鼠遊戲的登入代碼

// Firebase 的 key 不能含 . $ # [ ] /
function lookupKey(word) {
  return String(word).toLowerCase().trim().replace(/[.$#\[\]\/]/g, "_");
}

function currentUserCode() {
  try { return localStorage.getItem(USER_KEY) || ""; } catch (e) { return ""; }
}

// ---------- 本機 ----------
function readLocalLookups() {
  try { return JSON.parse(localStorage.getItem(LOOKUPS_KEY)) || {}; }
  catch (e) { return {}; }
}

function writeLocalLookups(map) {
  try { localStorage.setItem(LOOKUPS_KEY, JSON.stringify(map)); } catch (e) {}
}

// ---------- 雲端（設定與 SDK 載入統一放在 firebase-config.js）----------
function getDb() {
  if (!currentUserCode()) return Promise.resolve(null);      // 還沒登入就不連
  if (typeof getFirebaseDb !== "function") return Promise.resolve(null);
  return getFirebaseDb();
}

// ---------- 對外 ----------
function recordLookup(word, zh) {
  const key = lookupKey(word);
  if (!key) return;

  const map = readLocalLookups();
  const prev = map[key] || { n: 0 };
  map[key] = { n: (prev.n || 0) + 1, t: Date.now(), zh: zh || prev.zh || "" };
  writeLocalLookups(map);

  const code = currentUserCode();
  if (!code) return;
  getDb().then((db) => {
    if (!db) return;
    db.ref("users/" + code + "/lookups/" + key).set(map[key]).catch(() => {});
  });
}

// 合併本機與雲端，最近查的排前面
function fetchLookups(callback) {
  const local = readLocalLookups();
  const code = currentUserCode();

  const finish = (remote) => {
    const merged = Object.assign({}, remote || {}, {});
    for (const [w, v] of Object.entries(local)) {
      const r = merged[w];
      merged[w] = !r ? v
        : { n: Math.max(r.n || 0, v.n || 0),
            t: Math.max(r.t || 0, v.t || 0),
            zh: r.zh || v.zh };
    }
    callback(Object.entries(merged)
      .map(([w, v]) => ({ word: w, n: v.n || 1, t: v.t || 0, zh: v.zh || "" }))
      .sort((a, b) => b.t - a.t));
  };

  if (!code) return finish(null);
  getDb().then((db) => {
    if (!db) return finish(null);
    db.ref("users/" + code + "/lookups").once("value")
      .then((snap) => finish(snap.val()))
      .catch(() => finish(null));
  });
}

// 把「我查過的字」塞進遊戲既有的 words 物件，下拉選單就會自己長出來
function attachLookupCategory(wordsObj, onReady) {
  fetchLookups((list) => {
    const usable = list.filter((x) => /^[a-z][a-z'-]*$/.test(x.word));
    if (!usable.length) return;
    const recent = usable.slice(0, 20).map((x) => x.word);
    const often = usable.filter((x) => x.n > 1)
      .sort((a, b) => b.n - a.n).slice(0, 20).map((x) => x.word);

    const group = { "最近查的": recent };
    if (often.length >= 4) group["查過很多次"] = often;
    wordsObj["⭐ 我查過的字"] = group;
    if (typeof onReady === "function") onReady(wordsObj);
  });
}
