// wordset.js — 進遊戲時隨機挑一組單字集
//
// 為什麼需要：每個遊戲的兩個下拉選單都是「建好 <option> 就停在第一個」，
// 結果她每次進去玩的都是 FET Spelling 的 Wk 2，其他 26 組等於不存在。
//
// 抽法是「從所有 (類別, 週次) 的組合裡均勻抽一組」，不是先抽類別再抽週次：
// FET Spelling 有 12 組、CET Vocabulary 13 組，常用單字只有 2 組（星期、月份），
// 先抽類別的話星期和月份會佔掉三分之一的機會。
//
// 用法（遊戲頁的兩個函式各加一行，順序很重要）：
//   setupConfig() 建好類別選項之後   -> pickRandomCategory(catS);
//   setupWeek()   建好週次選項之後   -> applyPendingWeek(wkS);
//   結算畫面的「再玩一次」按鈕        -> shuffleWordSet(catS, wkS, setupWeek);
// 週次要分兩段做，是因為在 setupWeek() 跑完之前，週次的 <option> 還不存在。
//
// 只在頁面載入時生效一次：setupConfig() 只會跑一次，之後她自己在選單裡換類別，
// 週次就照原本的行為停在第一組，不會又被隨機掉。

let pendingWeek = null;

// 抽籤池在載入這一刻就定案。遊戲稍後會把「🔥 加強複習」「⭐ 我的單字卡」
// 「⭐ 我查過的字」塞進 words —— 那三個只會是她自己在選單點的，不該被隨機抽到，
// 「再玩一次」時也不該把她的選擇洗掉。
const WORDSET_POOL = [];
if (typeof words !== "undefined")
  for (const [cat, weeks] of Object.entries(words))
    for (const wk of Object.keys(weeks || {})) WORDSET_POOL.push([cat, wk]);

function setPick(catSelect, cat, wk) {
  catSelect.value = cat;
  // 類別名稱對不上任何 <option> 時 value 會變成空字串，遊戲就找不到字了
  if (catSelect.selectedIndex < 0) { catSelect.selectedIndex = 0; return false; }
  pendingWeek = wk;
  return true;
}

function pickRandomCategory(catSelect) {
  if (!catSelect || !catSelect.options.length || !WORDSET_POOL.length) return;
  const [cat, wk] = WORDSET_POOL[Math.floor(Math.random() * WORDSET_POOL.length)];
  setPick(catSelect, cat, wk);
}

/**
 * 「再玩一次」時換一組，不要讓她連玩三輪都在背同十個字。
 *
 * rebuildWeeks 就是遊戲自己的 setupWeek：它會重建週次選項、由 applyPendingWeek()
 * 套用抽到的那一週，然後照原本的流程開局。所以呼叫端只要把 setupWeek 傳進來，
 * 不用自己處理週次。
 *
 * 兩個刻意的行為：
 *   - 她目前在的類別若不在抽籤池裡（🔥 加強複習、⭐ 我的單字卡…），表示是她自己
 *     點的，就留在那個類別只換裡面的組 —— 選了「加強複習」卻被丟去背星期月份
 *     是最惱人的。
 *   - 排掉剛玩完的那一組，否則約 1/27 的機率會原地重來一次。
 */
function shuffleWordSet(catSelect, weekSelect, rebuildWeeks) {
  if (!catSelect || !weekSelect) return;
  const nowCat = catSelect.value, nowWk = weekSelect.value;

  const inPool = WORDSET_POOL.some(([c]) => c === nowCat);
  const pool = inPool ? WORDSET_POOL
    : Object.keys((typeof words !== "undefined" && words[nowCat]) || {}).map((w) => [nowCat, w]);

  const choices = pool.filter(([c, w]) => !(c === nowCat && w === nowWk));
  if (choices.length) {
    const [cat, wk] = choices[Math.floor(Math.random() * choices.length)];
    setPick(catSelect, cat, wk);
  }
  // 一組都換不了（例如她的清單只有一組）就照原樣重來
  if (typeof rebuildWeeks === "function") rebuildWeeks();
}

function applyPendingWeek(weekSelect) {
  if (!pendingWeek || !weekSelect) return;
  weekSelect.value = pendingWeek;
  pendingWeek = null;
  if (weekSelect.selectedIndex < 0) weekSelect.selectedIndex = 0;
}
