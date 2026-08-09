// wordlists.js — 她自己建的單字清單（單字卡）
//
// 從字典把字加進清單，清單就變成一組單字卡，可以在 flashcards.html 複習，
// 也會出現在倉鼠拼字和其他遊戲的下拉選單裡。
//
// 跟 lookups.js / mastery.js 同一套：先寫本機，有登入再同步雲端。
//   本機： localStorage["daisy_wordlists"] = { id: {name, words[], t} }
//   雲端： users/<CODE>/wordlists/<id>

const WORDLISTS_KEY = "daisy_wordlists";

function wlUser() {
  try { return localStorage.getItem("daisy_hamster_user") || ""; } catch (e) { return ""; }
}

function readLists() {
  try { return JSON.parse(localStorage.getItem(WORDLISTS_KEY)) || {}; }
  catch (e) { return {}; }
}

function writeLists(map) {
  try { localStorage.setItem(WORDLISTS_KEY, JSON.stringify(map)); } catch (e) {}
}

function syncList(id, data) {
  const code = wlUser();
  if (!code || typeof getFirebaseDb !== "function") return;
  getFirebaseDb().then((db) => {
    if (!db) return;
    const ref = db.ref("users/" + code + "/wordlists/" + id);
    (data === null ? ref.remove() : ref.set(data)).catch(() => {});
  });
}

// Firebase 的 key 不能含 . $ # [ ] /，所以自己產一個安全的 id
function newListId() {
  return "L" + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
}

function createList(name) {
  const map = readLists();
  const id = newListId();
  map[id] = { name: String(name || "新清單").slice(0, 24), words: [], t: Date.now() };
  writeLists(map);
  syncList(id, map[id]);
  return id;
}

function renameList(id, name) {
  const map = readLists();
  if (!map[id]) return;
  map[id].name = String(name || "").slice(0, 24) || map[id].name;
  map[id].t = Date.now();
  writeLists(map);
  syncList(id, map[id]);
}

function deleteList(id) {
  const map = readLists();
  if (!map[id]) return;
  delete map[id];
  writeLists(map);
  syncList(id, null);
}

function addToList(id, word) {
  const w = String(word).trim();
  const map = readLists();
  if (!map[id] || !w) return false;
  const has = map[id].words.some((x) => x.toLowerCase() === w.toLowerCase());
  if (has) return false;
  map[id].words.push(w);
  map[id].t = Date.now();
  writeLists(map);
  syncList(id, map[id]);
  return true;
}

function removeFromList(id, word) {
  const map = readLists();
  if (!map[id]) return;
  map[id].words = map[id].words.filter((x) => x.toLowerCase() !== String(word).toLowerCase());
  map[id].t = Date.now();
  writeLists(map);
  syncList(id, map[id]);
}

/** 最近改過的排前面 */
function getLists() {
  return Object.entries(readLists())
    .map(([id, v]) => ({ id, name: v.name || "清單", words: v.words || [], t: v.t || 0 }))
    .sort((a, b) => b.t - a.t);
}

function listsContaining(word) {
  const w = String(word).toLowerCase();
  return getLists().filter((l) => l.words.some((x) => x.toLowerCase() === w)).map((l) => l.id);
}

/** 換裝置時把雲端的合併進來；同一份清單以較新的為準 */
function syncLists(callback) {
  const done = () => callback && callback(getLists());
  const code = wlUser();
  if (!code || typeof getFirebaseDb !== "function") return done();
  getFirebaseDb().then((db) => {
    if (!db) return done();
    db.ref("users/" + code + "/wordlists").once("value").then((snap) => {
      const remote = snap.val() || {}, local = readLists(), merged = {};
      for (const id of new Set([...Object.keys(remote), ...Object.keys(local)])) {
        const a = remote[id], b = local[id];
        merged[id] = !a ? b : !b ? a : ((b.t || 0) >= (a.t || 0) ? b : a);
      }
      writeLists(merged);
      done();
    }).catch(done);
  });
}

/**
 * 把清單塞進遊戲既有的 words 物件，下拉選單就會自己長出來。
 * 拼字遊戲的鍵盤只有 A-Z，帶撇號或空白的字放進去會永遠拼不完。
 */
function attachWordlistCategory(wordsObj, onReady) {
  syncLists((lists) => {
    const group = {};
    lists.forEach((l) => {
      const usable = l.words.filter((w) => /^[a-zA-Z]{2,}$/.test(w));
      if (usable.length) group[l.name] = usable;
    });
    if (!Object.keys(group).length) return;
    wordsObj["⭐ 我的單字卡"] = group;
    if (typeof onReady === "function") onReady(wordsObj);
  });
}
