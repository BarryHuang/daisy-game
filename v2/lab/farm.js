// farm.js — 後院菜園的規則（純函式，沒有畫面）
//
// 為什麼獨立成一支：畫面（garden.js）和規則分開，規則才測得到
// （tests/run.js 直接 import 這支）。
//
// ★ 這裡的規則和存檔格式必須和 v1（daisy_hamster.html 的「後院菜園」）完全一致。
//   v1 和 v2 共用同一份 petData：她在 v1 種的菜，要能在 v2 收；反過來也是。
//     petData.farm["garden:0"] = { crop: 'carrot', day: 20261020 }
//   田的編號、作物種類、價錢、天數、賣價、經驗值都照抄 v1 的 CROPS。
//
// 每個動作（種、收）都寫成「改一份 petData」的函式，由呼叫端放進 Firebase 的
// transaction 裡執行：扣錢、種下、任務進度要嘛一起成功、要嘛一起不算。
// v1 是改完記憶體再整包 set()，同時開著兩邊的時候會互相蓋掉。

/** 和 v1 一模一樣（daisy_hamster.html 的 CROPS） */
export const CROPS = {
  carrot:  { emoji: '🥕', name: '紅蘿蔔', zy: ['ㄏㄨㄥˊ', 'ㄌㄨㄛˊ', 'ㄅㄛ˙'], cost: 8,  days: 1, sell: [16, 24],  exp: 6  },
  corn:    { emoji: '🌽', name: '玉米',   zy: ['ㄩˋ', 'ㄇㄧˇ'],               cost: 14, days: 1, sell: [26, 38],  exp: 10 },
  straw:   { emoji: '🍓', name: '草莓',   zy: ['ㄘㄠˇ', 'ㄇㄟˊ'],              cost: 22, days: 2, sell: [58, 78],  exp: 18 },
  pumpkin: { emoji: '🎃', name: '南瓜',   zy: ['ㄋㄢˊ', 'ㄍㄨㄚ'],             cost: 35, days: 2, sell: [92, 126], exp: 28 },
};
export const PLOTS = 4;                  // v1 的 garden 地圖有 4 塊田（MAPS.garden.farm）
export const QUEST_ALL_BONUS = 30;       // v1：三件每日挑戰全破的額外獎勵

/**
 * 今天是哪一天（20261020 這種整數）。**用裝置的本地時間**，和 v1 的 farmDay() 一樣 ——
 * 不是 calendar.js 的台北時間。菜園的資料是 v1 寫的，基準要跟 v1 對齊；
 * 她在台灣，兩者其實是同一天。
 */
export function farmDay(d) {
  d = d || new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}
/** 兩個 farmDay 差幾天（跨月跨年都要對） */
export function farmDayDiff(from, to) {
  const toDate = (n) => new Date(Math.floor(n / 10000), Math.floor(n / 100) % 100 - 1, n % 100);
  return Math.round((toDate(to) - toDate(from)) / 86400000);
}

export const plotKey = (i) => 'garden:' + i;

/**
 * 一塊田現在的樣子。
 *   { empty:true }
 *   { crop, c, grown, left, ripe, stage }   stage 0 剛種、1 長大中、2 可以收
 */
export function plotState(pet, i, today) {
  const d = ((pet && pet.farm) || {})[plotKey(i)];
  if (!d || !CROPS[d.crop]) return { empty: true };
  const c = CROPS[d.crop];
  const grown = Math.max(0, farmDayDiff(d.day, today));
  const left = Math.max(0, c.days - grown);
  const ripe = left === 0;
  return { empty: false, crop: d.crop, c, grown, left, ripe, stage: ripe ? 2 : Math.min(1, grown) };
}

/**
 * 每日挑戰的進度（照 v1 的 updateQuestProgress，但不碰畫面）。
 * 挑戰是 v1 每天抽的，日期用 toLocaleDateString() 存；不是今天的就不動 ——
 * 舊的那批留給 v1 換新，不要幫昨天的挑戰加進度。
 * 回傳這次剛完成的挑戰（給畫面顯示），以及是不是剛好三件全破。
 */
export function questProgress(pet, id, amount, todayStr) {
  const q = pet.quests;
  const out = { completed: [], allBonus: false };
  if (!q || !Array.isArray(q.list) || q.date !== todayStr) return out;
  const it = q.list.find((x) => x.id === id);
  if (!it || it.done) return out;
  it.current = (it.current || 0) + amount;
  if (it.current >= it.target) {
    it.current = it.target; it.done = true;
    pet.coins = (pet.coins || 0) + (it.reward || 0);
    out.completed.push({ text: it.text, reward: it.reward });
    if (!q.bonus && q.list.every((x) => x.done)) {
      q.bonus = true;
      pet.coins += QUEST_ALL_BONUS;
      out.allBonus = true;
    }
  }
  return out;
}

/**
 * 種菜。直接改 pet，回傳結果。不能種的時候 pet 一個欄位都不動。
 *   { ok:false, why:'busy' | 'coins' | 'crop' }
 *   { ok:true, quest }
 */
export function plant(pet, i, cropKey, today, todayStr) {
  const c = CROPS[cropKey];
  if (!c) return { ok: false, why: 'crop' };
  if (!plotState(pet, i, today).empty) return { ok: false, why: 'busy' };
  if ((pet.coins || 0) < c.cost) return { ok: false, why: 'coins' };
  pet.coins -= c.cost;
  if (!pet.farm) pet.farm = {};
  pet.farm[plotKey(i)] = { crop: cropKey, day: today };
  return { ok: true, quest: questProgress(pet, 'plant', 1, todayStr) };
}

/**
 * 收成。rand 是 0–1 的亂數（測試時可以固定）。
 *   { ok:false, why:'empty' | 'unripe' }
 *   { ok:true, crop, gain, exp, levelUp, level, quest }
 */
export function harvest(pet, i, today, todayStr, rand = Math.random()) {
  const st = plotState(pet, i, today);
  if (st.empty) return { ok: false, why: 'empty' };
  if (!st.ripe) return { ok: false, why: 'unripe', left: st.left };
  const c = st.c;
  const gain = c.sell[0] + Math.floor(rand * (c.sell[1] - c.sell[0] + 1));
  delete pet.farm[plotKey(i)];
  pet.coins = (pet.coins || 0) + gain;
  pet.exp = (pet.exp || 0) + c.exp;
  // v1 的 addHappiness(4) 是 (happiness || 50) + 4：快樂度剛好是 0 的時候會被當成 50。
  // 這是 v1 的小怪癖，但兩邊的規則必須一樣，所以照抄
  pet.happiness = Math.min(100, (pet.happiness || 50) + 4);
  // 升級：每 level × 100 經驗升一級，經驗歸零（v1 一樣）
  const level = pet.level || 1;
  let levelUp = false;
  if (pet.exp >= level * 100) { pet.level = level + 1; pet.exp = 0; levelUp = true; }
  return { ok: true, crop: st.crop, gain, exp: c.exp, levelUp, level: pet.level || level, quest: questProgress(pet, 'harvest', 1, todayStr) };
}
