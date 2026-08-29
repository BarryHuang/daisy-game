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
// 週次要分兩段做，是因為在 setupWeek() 跑完之前，週次的 <option> 還不存在。
//
// 只在頁面載入時生效一次：setupConfig() 只會跑一次，之後她自己在選單裡換類別，
// 週次就照原本的行為停在第一組，不會又被隨機掉。

let pendingWeek = null;

function pickRandomCategory(catSelect) {
  if (typeof words === "undefined" || !catSelect || !catSelect.options.length) return;

  const pairs = [];
  for (const [cat, weeks] of Object.entries(words))
    for (const wk of Object.keys(weeks || {})) pairs.push([cat, wk]);
  if (!pairs.length) return;

  const [cat, wk] = pairs[Math.floor(Math.random() * pairs.length)];
  catSelect.value = cat;
  // 類別名稱對不上任何 <option> 時 value 會變成空字串，遊戲就找不到字了
  if (catSelect.selectedIndex < 0) catSelect.selectedIndex = 0;
  else pendingWeek = wk;
}

function applyPendingWeek(weekSelect) {
  if (!pendingWeek || !weekSelect) return;
  weekSelect.value = pendingWeek;
  pendingWeek = null;
  if (weekSelect.selectedIndex < 0) weekSelect.selectedIndex = 0;
}
