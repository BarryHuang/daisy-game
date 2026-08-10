// rewards.js — 讓遊戲頁把金幣發進倉鼠的存檔
//
// 金幣存在 users/<CODE>/petData/coins（倉鼠頁的存檔本體）。
// 用 transaction 加值：倉鼠頁可能同時開著並整包 set(petData)，
// 普通的 read-then-write 會互相蓋掉。
// 沒登入（沒有通關密碼）就不發，回報 false 讓遊戲顯示提示。

function awardCoins(n, callback) {
  let code = "";
  try { code = (localStorage.getItem("daisy_hamster_user") || "").trim(); } catch (e) {}
  if (!code || !(n > 0) || typeof getFirebaseDb !== "function") {
    if (callback) callback(false);
    return;
  }
  getFirebaseDb().then((db) => {
    if (!db) { if (callback) callback(false); return; }
    db.ref("users/" + code + "/petData/coins")
      .transaction((c) => (c || 0) + n)
      .then(() => { if (callback) callback(true); })
      .catch(() => { if (callback) callback(false); });
  });
}
