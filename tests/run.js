// tests/run.js — 零依賴的單元測試
//
//     node tests/run.js
//
// 不裝任何套件，只用 node 內建的 assert。專案刻意沒有 package.json / 建置流程，
// 測試也維持這個原則：clone 下來就能跑。
//
// 測的是「純邏輯」的共用模組：學期日曆、記憶模型。畫面的東西用 Playwright 測。

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

// ── 假的 localStorage（mastery.js 要用）──────────────────────────────
const store = new Map();
global.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};

// words.js 沒有 module.exports（瀏覽器專用），用 Function 把變數撈出來
const words = new Function(fs.readFileSync(path.join(ROOT, "words.js"), "utf8") + "; return words;")();
global.words = words;

const cal = require(path.join(ROOT, "calendar.js"));
const M = require(path.join(ROOT, "mastery.js"));

// ── 極簡測試框架 ─────────────────────────────────────────────────────
let passed = 0, failed = 0, group = "";
function describe(name, fn) { group = name; console.log("\n" + name); fn(); }
function it(name, fn) {
  try { fn(); passed++; console.log("  ✓ " + name); }
  catch (e) { failed++; console.log("  ✗ " + name + "\n      " + (e.message || e).split("\n").join("\n      ")); }
}

/** 把 mastery.js 的「現在」設成台北時間某天的中午 */
function setDay(ymd, hour) {
  const y = Math.floor(ymd / 10000), m = Math.floor(ymd / 100) % 100, d = ymd % 100;
  const ms = Date.UTC(y, m - 1, d, (hour == null ? 12 : hour) - 8);
  M.setMasteryClock(() => ms);
  return ms;
}
function fresh() {
  store.clear();
  M._resetMigrationFlag();
}

// ════════════════════════════════════════════════════════════════════
describe("學期日曆 calendar.js", () => {
  it("台北時間跨日：UTC 10/18 16:30 已經是台北的 10/19", () => {
    assert.strictEqual(cal.taipeiDay(new Date("2026-10-18T16:30:00Z")), 20261019);
    assert.strictEqual(cal.taipeiDay(new Date("2026-10-18T15:59:00Z")), 20261018);
  });

  it("星期幾：10/19 是週一、10/23 是週五、10/25 是週日", () => {
    assert.strictEqual(cal.weekdayOf(20261019), 1);
    assert.strictEqual(cal.weekdayOf(20261023), 5);
    assert.strictEqual(cal.weekdayOf(20261025), 7);
  });

  it("合併週的 key：Wk 1&2、Wk 11/12、Wk 7&8 都拆得開", () => {
    assert.deepStrictEqual(cal.weekNumbersOf("Wk 1&2"), [1, 2]);
    assert.deepStrictEqual(cal.weekNumbersOf("Wk 11/12"), [11, 12]);
    assert.deepStrictEqual(cal.weekNumbersOf("Wk 16&17"), [16, 17]);
    assert.deepStrictEqual(cal.weekNumbersOf("第 1 組"), []);
    assert.deepStrictEqual(cal.weekNumbersOf("洲名與洋名"), []);
  });

  it("10/19（使用者確認的基準點）是 Wk 8、期中複習週", () => {
    const w = cal.currentWeek(20261019);
    assert.strictEqual(w.n, 8);
    assert.strictEqual(w.kind, "review");
    assert.strictEqual(w.review, "midterm");
    assert.strictEqual(w.isTestDay, false, "複習週沒有每週小考");
  });

  it("Wk 9 也是期中複習週", () => {
    assert.strictEqual(cal.currentWeek(20261026).n, 9);
    assert.strictEqual(cal.currentWeek(20261026).kind, "review");
  });

  it("11/2 是 Wk 10，兩份課表都對到 Wk 10", () => {
    const w = cal.currentWeek(20261102);
    assert.strictEqual(w.n, 10);
    assert.strictEqual(w.kind, "new");
    assert.strictEqual(w.fetKey, "Wk 10");
    assert.strictEqual(w.cetKey, "Wk 10");
  });

  it("開學第 1、2 週的 CET 都對到 Wk 1&2，FET 各自對到 Wk 1 / Wk 2", () => {
    const a = cal.currentWeek(20260831), b = cal.currentWeek(20260907);
    assert.strictEqual(a.n, 1); assert.strictEqual(b.n, 2);
    assert.strictEqual(a.cetKey, "Wk 1&2"); assert.strictEqual(b.cetKey, "Wk 1&2");
    assert.strictEqual(a.fetKey, "Wk 1");   assert.strictEqual(b.fetKey, "Wk 2");
  });

  it("Wk 16、17 的 CET 都對到 Wk 16&17", () => {
    assert.strictEqual(cal.currentWeek(cal.addDays(20260831, 15 * 7)).cetKey, "Wk 16&17");
    assert.strictEqual(cal.currentWeek(cal.addDays(20260831, 16 * 7)).cetKey, "Wk 16&17");
  });

  it("新字週的週五是考試日、週四是考前一天", () => {
    const fri = cal.currentWeek(20261106), thu = cal.currentWeek(20261105);
    assert.strictEqual(fri.isTestDay, true);
    assert.strictEqual(thu.isTestEve, true);
    assert.strictEqual(thu.daysToTest, 1);
    assert.strictEqual(cal.currentWeek(20261107).isWeekend, true);
  });

  it("開學前是 kind:none，不會亂對到某一週", () => {
    const w = cal.currentWeek(20260801);
    assert.ok(w.n <= 0);
    assert.strictEqual(w.kind, "none");
  });

  it("放假週會讓之後的週次順延", () => {
    const term = Object.assign({}, cal.TERM, { skipWeeks: ["2026-10-05"] });
    assert.strictEqual(cal.currentWeek(20261019, { term }).n, 7);
    assert.strictEqual(cal.currentWeek(20260928, { term }).n, 5, "放假之前不受影響");
  });

  it("期中複習範圍 = Wk 1–7，不含 Wk 10 之後", () => {
    const keys = cal.reviewScope(8).map((x) => x.list.includes("FET") ? "F:" + x.key : "C:" + x.key);
    for (const k of ["F:Wk 1", "F:Wk 7", "C:Wk 1&2", "C:Wk 7"]) assert.ok(keys.includes(k), "缺 " + k);
    for (const k of ["F:Wk 10", "C:Wk 10", "C:Wk 20"]) assert.ok(!keys.includes(k), "不該有 " + k);
    assert.deepStrictEqual(cal.reviewScope(9), cal.reviewScope(8), "Wk 9 和 Wk 8 是同一段複習");
  });

  it("期末複習範圍 = Wk 10–17", () => {
    const keys = cal.reviewScope(18).map((x) => x.key);
    for (const k of ["Wk 10", "Wk 16&17", "Wk 17"]) assert.ok(keys.includes(k), "缺 " + k);
    for (const k of ["Wk 7", "Wk 20", "Wk 1&2"]) assert.ok(!keys.includes(k), "不該有 " + k);
  });
});

// ════════════════════════════════════════════════════════════════════
describe("記憶模型 mastery.js：Leitner 盒", () => {
  it("新字答對一次 → 第 1 盒，明天到期", () => {
    const b = M.nextBox(null, true, 20261019, 1);
    assert.strictEqual(b.b, 1); assert.strictEqual(b.d, 20261020);
  });

  it("★ 同一天連對三次只升一盒（v1 會直接畢業）", () => {
    fresh(); setDay(20261019);
    for (let i = 0; i < 3; i++) M.recordAttempt("planet", true, 0);
    const m = M.getMastery("planet");
    assert.strictEqual(m.k.see.b, 1, "同一天不能升超過一盒");
    assert.strictEqual(m.s, 3, "v1 的連對次數照舊累計");
    assert.strictEqual(M.isMastered("planet"), true, "v1 的 isMastered 語意不變");
    assert.strictEqual(M.isKnown("planet"), false, "但 v2 不算記住");
  });

  it("隔天、再隔天各答對一次 → 第 3 盒，算記住", () => {
    fresh();
    setDay(20261019); M.recordAttempt("planet", true, 0);
    setDay(20261020); M.recordAttempt("planet", true, 0);
    setDay(20261022); M.recordAttempt("planet", true, 0);
    const k = M.getMastery("planet").k.see;
    assert.strictEqual(k.b, 3);
    assert.strictEqual(k.d, 20261026, "第 3 盒隔 4 天");
    assert.strictEqual(M.isKnown("planet"), true);
  });

  it("答錯 → 掉回第 1 盒、明天再考", () => {
    fresh();
    for (const d of [20261019, 20261020, 20261022]) { setDay(d); M.recordAttempt("valley", true, 0); }
    setDay(20261026); M.recordAttempt("valley", false, 0);
    const k = M.getMastery("valley").k.see;
    assert.strictEqual(k.b, 1); assert.strictEqual(k.d, 20261027);
  });

  it("錯一次還算數，錯兩次就不算（和 v1 的「乾淨」定義一致）", () => {
    fresh(); setDay(20261019);
    M.recordAttempt("island", true, 1, "spell");
    assert.strictEqual(M.getMastery("island").k.spell.b, 1);
    setDay(20261020); M.recordAttempt("island", true, 2, "spell");
    assert.strictEqual(M.getMastery("island").k.spell.b, 1, "錯兩次 → 掉回第 1 盒");
  });

  it("題型分開記：拼得出來 ≠ 認得出來", () => {
    fresh();
    for (const d of [20261019, 20261020, 20261022]) { setDay(d); M.recordAttempt("storm", true, 0, "see"); }
    assert.strictEqual(M.isKnown("storm", "cet"), false, "CET 還要 use");
    assert.strictEqual(M.isKnown("storm", "fet"), false, "FET 要 spell");
    assert.strictEqual(M.skillBox("storm", "see"), 3);
    assert.strictEqual(M.skillBox("storm", "spell"), 0);
  });

  it("沒帶題型或帶錯的題型 → 當成 see（v1 的 15 個呼叫點不用改）", () => {
    fresh(); setDay(20261019);
    M.recordAttempt("wave", true, 0);
    M.recordAttempt("thick", true, 0, "bogus");
    assert.ok(M.getMastery("wave").k.see);
    assert.ok(M.getMastery("thick").k.see);
  });

  it("盒號最多到 5", () => {
    let b = null;
    for (let i = 0; i < 9; i++) b = M.nextBox(b, true, 20261001 + i, i);
    assert.strictEqual(b.b, 5);
  });

  it("getDue：只列到期的、過期越久越前面、可以限定範圍", () => {
    fresh();
    setDay(20261019); M.recordAttempt("a1", true, 0); M.recordAttempt("b2", false, 0);
    setDay(20261015); M.recordAttempt("c3", true, 0);
    // a1 → 10/20 到期；b2 答錯 → 10/20；c3 → 10/16
    const due = M.getDue(20261020).map((x) => x.word);
    assert.deepStrictEqual(due, ["c3", "a1", "b2"]);
    assert.deepStrictEqual(M.getDue(20261019).map((x) => x.word), ["c3"]);
    assert.deepStrictEqual(M.getDue(20261020, ["A1"]).map((x) => x.word), ["a1"], "範圍不分大小寫");
    assert.strictEqual(M.getDue(20261020, null, 1).length, 1);
  });
});

// ════════════════════════════════════════════════════════════════════
describe("記憶模型：從 v1 遷移", () => {
  it("畢業的字 → see 第 2 盒；練過的 → 第 1 盒；沒練過的不動", () => {
    const out = M.migrateMastery({
      grad: { r: 5, w: 0, s: 3, t: 1 }, mid: { r: 1, w: 2, s: 0, t: 1 }, none: { r: 0, w: 0, s: 0 },
    }, 20261019);
    assert.strictEqual(out.grad.k.see.b, 2);
    assert.strictEqual(out.mid.k.see.b, 1);
    assert.strictEqual(out.none.k, undefined);
    assert.strictEqual(out.grad.r, 5, "v1 欄位原封不動");
  });

  it("到期日分散在 14 天內，不會三百個字同一天到期", () => {
    const v1 = {};
    for (let i = 0; i < 300; i++) v1["word" + i] = { r: 3, w: 0, s: 3, t: 1 };
    const out = M.migrateMastery(v1, 20261019);
    const perDay = {};
    for (const m of Object.values(out)) perDay[m.k.see.d] = (perDay[m.k.see.d] || 0) + 1;
    const days = Object.keys(perDay).map(Number);
    assert.strictEqual(days.length, 14);
    assert.ok(Math.min(...days) >= 20261019 && Math.max(...days) <= 20261101);
    assert.ok(Math.max(...Object.values(perDay)) < 40, "最多的一天也不到 40 個");
  });

  it("第一次載入時備份 v1 資料、只做一次", () => {
    fresh(); setDay(20261019);
    const v1 = { planet: { r: 4, w: 1, s: 3, t: 5 } };
    store.set("daisy_mastery", JSON.stringify(v1));
    M.ensureMasteryMigrated();
    assert.deepStrictEqual(JSON.parse(store.get("daisy_mastery_v1_backup")), v1);
    assert.strictEqual(store.get("daisy_mastery_v"), "2");
    assert.strictEqual(M.getMastery("planet").k.see.b, 2);
    // 再跑一次不會重複遷移、不會蓋掉備份
    store.set("daisy_mastery", JSON.stringify({ planet: { r: 9, w: 9, s: 0, t: 9 } }));
    M._resetMigrationFlag(); M.ensureMasteryMigrated();
    assert.strictEqual(M.getMastery("planet").k, undefined, "已經遷移過就不再動");
    assert.deepStrictEqual(JSON.parse(store.get("daisy_mastery_v1_backup")), v1);
  });

  it("主頁舊的錯字清單（全大寫）→ spell 第 0 盒、今天到期；已有 spell 紀錄的不動", () => {
    fresh(); setDay(20261019);
    M.recordAttempt("nod", true, 0, "spell");
    setDay(20261020);
    const n = M.importLegacyMistakes(["MEETING", "NOD", "WINDOW BOX"]);
    assert.strictEqual(n, 2);
    assert.strictEqual(M.getMastery("meeting").k.spell.b, 0);
    assert.strictEqual(M.getMastery("meeting").k.spell.d, 20261020);
    assert.strictEqual(M.getMastery("nod").k.spell.b, 1, "已經有的不被舊清單蓋掉");
    assert.ok(M.getMastery("window box").k.spell);
  });
});

// ════════════════════════════════════════════════════════════════════
describe("記憶模型：跨裝置合併", () => {
  it("每個題型各自比新舊：平板練拼字、手機玩選擇，兩邊都留下來", () => {
    const tablet = { r: 3, w: 1, t: 100, s: 1, k: { spell: { b: 2, d: 1, day: 1, u: 100 }, see: { b: 1, d: 1, day: 1, u: 10 } } };
    const phone  = { r: 5, w: 0, t: 200, s: 2, k: { see: { b: 3, d: 1, day: 1, u: 200 } } };
    const m = M.mergeMasteryRecord(tablet, phone);
    assert.strictEqual(m.k.spell.b, 2, "平板的拼字進度要留著");
    assert.strictEqual(m.k.see.b, 3, "手機的選擇題比較新");
    assert.strictEqual(m.r, 5); assert.strictEqual(m.w, 1);
    assert.strictEqual(m.s, 2, "s 跟著比較新的那筆");
  });

  it("只有一邊有紀錄時原樣保留", () => {
    const only = { r: 1, w: 0, t: 5, s: 1, k: { see: { b: 1, d: 2, day: 1, u: 5 } } };
    assert.deepStrictEqual(M.mergeMasteryRecord(undefined, only), only);
    const v1only = { r: 1, w: 0, t: 5, s: 1 };
    assert.deepStrictEqual(M.mergeMasteryRecord(v1only, undefined), v1only);
  });
});

// ════════════════════════════════════════════════════════════════════
describe("v1 相容性", () => {
  it("getWeakWords 回傳的形狀不變（v1 的遊戲靠它）", () => {
    fresh(); setDay(20261019);
    M.recordAttempt("planet", false, 0);
    const w = M.getWeakWords(5);
    assert.ok(w.length && typeof w[0].word === "string" && "score" in w[0]);
  });

  it("v1 的三參數呼叫照樣更新 r / w / s", () => {
    fresh(); setDay(20261019);
    M.recordAttempt("busy", true, 0); M.recordAttempt("busy", false, 0); M.recordAttempt("busy", true, 0);
    const m = M.getMastery("busy");
    assert.strictEqual(m.r, 2); assert.strictEqual(m.w, 1); assert.strictEqual(m.s, 1);
  });
});

// ════════════════════════════════════════════════════════════════════
// v2 後院菜園的規則（ES module，用動態 import 載入）
// ════════════════════════════════════════════════════════════════════
(async () => {
  const F = await import(require("url").pathToFileURL(path.join(ROOT, "v2/lab/farm.js")).href);
  const TODAY = "2026/10/20";      // 每日挑戰的日期字串（v1 用 toLocaleDateString）
  const clone = (o) => JSON.parse(JSON.stringify(o));

  describe("後院菜園 farm.js：和 v1 共用存檔", () => {
    it("作物表和 v1 一模一樣（價錢、天數、賣價、經驗）", () => {
      const html = fs.readFileSync(path.join(ROOT, "daisy_hamster.html"), "utf8");
      const block = html.slice(html.indexOf("const CROPS = {"), html.indexOf("};", html.indexOf("const CROPS = {")));
      for (const [k, c] of Object.entries(F.CROPS)) {
        const m = new RegExp(k + ":\\s*\\{[^}]*cost:\\s*(\\d+),\\s*days:\\s*(\\d+),\\s*sell:\\s*\\[(\\d+),\\s*(\\d+)\\],\\s*exp:\\s*(\\d+)").exec(block);
        assert.ok(m, "v1 找不到 " + k);
        assert.deepStrictEqual([c.cost, c.days, c.sell[0], c.sell[1], c.exp], m.slice(1).map(Number), k + " 和 v1 不一樣");
      }
      assert.ok(/farm:\s*\[[^\]]*\]/.test(html) && html.match(/garden:[\s\S]*?farm:\s*\[([^\]]*)\]/)[1].split(",").length === F.PLOTS, "田的數量和 v1 不同");
    });

    it("讀得懂 v1 種下去的菜：v1 前天種的草莓，今天熟了", () => {
      const v1pet = { coins: 100, farm: { "garden:2": { crop: "straw", day: 20261018 } } };
      const st = F.plotState(v1pet, 2, 20261020);
      assert.strictEqual(st.ripe, true);
      assert.strictEqual(F.plotState(v1pet, 2, 20261019).left, 1);
      assert.strictEqual(F.plotState(v1pet, 2, 20261019).stage, 1);
      assert.strictEqual(F.plotState(v1pet, 0, 20261020).empty, true);
    });

    it("跨月、跨年的天數都對", () => {
      assert.strictEqual(F.farmDayDiff(20261231, 20270101), 1);
      assert.strictEqual(F.farmDayDiff(20260228, 20260301), 1);
      assert.strictEqual(F.farmDayDiff(20261020, 20261020), 0);
    });

    it("長大的樣子：一天的菜隔天就熟；兩天的菜中間有一個「長大中」", () => {
      const pet = { farm: { "garden:0": { crop: "carrot", day: 20261020 }, "garden:1": { crop: "pumpkin", day: 20261020 } } };
      assert.deepStrictEqual([0, 1].map((d) => F.plotState(pet, 0, 20261020 + d).stage), [0, 2]);
      assert.deepStrictEqual([0, 1, 2].map((d) => F.plotState(pet, 1, 20261020 + d).stage), [0, 1, 2]);
    });

    it("種菜：扣錢、寫成 v1 的格式 garden:N", () => {
      const pet = { coins: 50, farm: {} };
      const r = F.plant(pet, 3, "corn", 20261020, TODAY);
      assert.strictEqual(r.ok, true);
      assert.strictEqual(pet.coins, 36);
      assert.deepStrictEqual(pet.farm["garden:3"], { crop: "corn", day: 20261020 });
    });

    it("錢不夠、田不是空的 → 存檔一個欄位都不動", () => {
      const poor = { coins: 7, farm: {}, quests: null };
      const snap = clone(poor);
      assert.strictEqual(F.plant(poor, 0, "carrot", 20261020, TODAY).why, "coins");
      assert.deepStrictEqual(poor, snap);
      const busy = { coins: 999, farm: { "garden:0": { crop: "corn", day: 20261019 } } };
      const snap2 = clone(busy);
      assert.strictEqual(F.plant(busy, 0, "carrot", 20261020, TODAY).why, "busy");
      assert.deepStrictEqual(busy, snap2);
    });

    it("還沒熟不能收，存檔不動", () => {
      const pet = { coins: 10, farm: { "garden:1": { crop: "straw", day: 20261019 } } };
      const snap = clone(pet);
      const r = F.harvest(pet, 1, 20261020, TODAY, 0.5);
      assert.strictEqual(r.why, "unripe"); assert.strictEqual(r.left, 1);
      assert.deepStrictEqual(pet, snap);
    });

    it("收成：田變空、金幣在 v1 的賣價範圍內、加經驗和快樂", () => {
      const mk = () => ({ coins: 0, exp: 0, level: 1, happiness: 98, farm: { "garden:0": { crop: "pumpkin", day: 20261018 } } });
      const lo = mk(), hi = mk();
      assert.strictEqual(F.harvest(lo, 0, 20261020, TODAY, 0).gain, 92);
      assert.strictEqual(F.harvest(hi, 0, 20261020, TODAY, 0.9999).gain, 126);
      assert.strictEqual(lo.farm["garden:0"], undefined);
      assert.strictEqual(lo.coins, 92); assert.strictEqual(lo.exp, 28);
      assert.strictEqual(lo.happiness, 100, "快樂度最多 100");
    });

    it("快樂度 0 的時候照 v1 的怪癖當成 50（兩邊規則要一致）", () => {
      const pet = { coins: 0, happiness: 0, farm: { "garden:0": { crop: "carrot", day: 20261019 } } };
      F.harvest(pet, 0, 20261020, TODAY, 0);
      assert.strictEqual(pet.happiness, 54);
    });

    it("經驗滿 level×100 就升級、經驗歸零（v1 一樣）", () => {
      const pet = { coins: 0, exp: 95, level: 1, farm: { "garden:0": { crop: "corn", day: 20261019 } } };
      const r = F.harvest(pet, 0, 20261020, TODAY, 0);
      assert.strictEqual(r.levelUp, true); assert.strictEqual(pet.level, 2); assert.strictEqual(pet.exp, 0);
    });

    it("每日挑戰：今天的「收成 1 株」完成 → 加獎勵；三件全破再加 30", () => {
      const pet = { coins: 0, exp: 0, level: 1, farm: { "garden:0": { crop: "carrot", day: 20261019 } },
        quests: { date: TODAY, v: 2, bonus: false, list: [
          { id: "harvest", text: "收成 1 株菜", target: 1, current: 0, reward: 16, done: false },
          { id: "feed", text: "餵倉鼠", target: 2, current: 2, reward: 8, done: true },
          { id: "bath", text: "洗澡", target: 1, current: 1, reward: 6, done: true } ] } };
      const r = F.harvest(pet, 0, 20261020, TODAY, 0);
      assert.strictEqual(r.quest.completed.length, 1);
      assert.strictEqual(r.quest.allBonus, true);
      assert.strictEqual(pet.coins, 16 + 16 + 30, "賣價 16 + 挑戰 16 + 全破 30");
      assert.strictEqual(pet.quests.bonus, true);
    });

    it("不是今天的挑戰不動（那批留給 v1 換新）", () => {
      const pet = { coins: 50, farm: {}, quests: { date: "2026/10/19", bonus: false, list: [
        { id: "plant", text: "種 1 株", target: 1, current: 0, reward: 10, done: false }] } };
      F.plant(pet, 0, "carrot", 20261020, TODAY);
      assert.strictEqual(pet.quests.list[0].current, 0);
      assert.strictEqual(pet.coins, 42, "只扣種子錢，沒有拿到昨天挑戰的獎勵");
    });
  });

  console.log("\n" + (failed ? "✗ " : "✓ ") + passed + " 通過" + (failed ? "，" + failed + " 失敗" : ""));
  process.exit(failed ? 1 : 0);
})();
