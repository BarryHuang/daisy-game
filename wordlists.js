// wordlists.js — 她自己建的單字清單（單字卡）
//
// 從字典把字加進清單，清單就變成一組單字卡，可以在 flashcards.html 複習，
// 也會出現在倉鼠拼字和其他遊戲的下拉選單裡。
//
// 跟 lookups.js / mastery.js 同一套：先寫本機，有登入再同步雲端。
//   本機： localStorage["daisy_wordlists"] = { id: {name, words[], t} }
//   雲端： users/<CODE>/wordlists/<id>
//
// words 裡存的是 { w, zh, z }：加入的當下就把中文和注音一起存下來。
// 她收的字多半來自大字典（hesitate、photosynthesis），課表的 wordTranslations
// 查不到；倉鼠頁又沒有載那 3 MB 的 cedict.js。存下來就不用載，也離線可用，
// 而且存的正好是她當時看到的那個義項。
// 舊資料是純字串，下面一律正規化，不用做搬遷。

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

/** 舊的純字串和新的物件都吃 */
function normWord(item) {
  if (typeof item === "string") return { w: item, zh: "", z: [] };
  return { w: item.w || "", zh: item.zh || "", z: item.z || [] };
}

function addToList(id, word, meaning) {
  const w = String(word).trim();
  const map = readLists();
  if (!map[id] || !w) return false;
  const has = map[id].words.some((x) => normWord(x).w.toLowerCase() === w.toLowerCase());
  if (has) return false;
  map[id].words.push({ w: w, zh: (meaning && meaning.zh) || "", z: (meaning && meaning.z) || [] });
  map[id].t = Date.now();
  writeLists(map);
  syncList(id, map[id]);
  return true;
}

function removeFromList(id, word) {
  const map = readLists();
  if (!map[id]) return;
  map[id].words = map[id].words.filter(
    (x) => normWord(x).w.toLowerCase() !== String(word).toLowerCase());
  map[id].t = Date.now();
  writeLists(map);
  syncList(id, map[id]);
}

/** 最近改過的排前面 */
function getLists() {
  return Object.entries(readLists())
    .map(([id, v]) => ({ id, name: v.name || "清單",
                         words: (v.words || []).map(normWord), t: v.t || 0 }))
    .sort((a, b) => b.t - a.t);
}

function listsContaining(word) {
  const w = String(word).toLowerCase();
  return getLists().filter((l) => l.words.some((x) => x.w.toLowerCase() === w)).map((l) => l.id);
}

/** 這個字在任何一張單字卡裡存過的中文。倉鼠頁的複習卡靠這個顯示中文， */
/*  否則大字典來的字（hesitate…）在那邊會是空白。 */
function wordlistMeaning(word) {
  const w = String(word).toLowerCase();
  for (const l of getLists()) {
    const hit = l.words.find((x) => x.w.toLowerCase() === w && x.zh);
    if (hit) return { zh: hit.zh, z: hit.z };
  }
  return null;
}

/** 給只需要一行字的地方用，格式跟 wordTranslations 一致 */
function wordlistMeaningText(word) {
  const m = wordlistMeaning(word);
  if (!m) return "";
  const zy = (m.z || []).filter(Boolean).join(" ");
  return m.zh + (zy ? " (" + zy + ")" : "");
}

/**
 * 補寫中文。這個修正之前加入的字只存了英文，複習卡那邊會是空白；
 * 她下次在字典看到同一個字時就順手補起來，不用她重加一次。
 */
function backfillMeaning(word, meaning) {
  if (!meaning || !meaning.zh) return false;
  const w = String(word).toLowerCase();
  const map = readLists();
  let changed = false;
  for (const [id, list] of Object.entries(map)) {
    (list.words || []).forEach((item, i) => {
      const n = normWord(item);
      if (n.w.toLowerCase() === w && !n.zh) {
        list.words[i] = { w: n.w, zh: meaning.zh, z: meaning.z || [] };
        changed = true;
      }
    });
    if (changed) { list.t = Date.now(); syncList(id, list); }
  }
  if (changed) writeLists(map);
  return changed;
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
      const usable = l.words.map((x) => x.w).filter((w) => /^[a-zA-Z]{2,}$/.test(w));
      if (usable.length) group[l.name] = usable;
    });
    if (!Object.keys(group).length) return;
    wordsObj["⭐ 我的單字卡"] = group;
    if (typeof onReady === "function") onReady(wordsObj);
  });
}
