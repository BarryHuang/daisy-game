// tests/v3.js — v3 的單元測試（零依賴，同 tests/run.js）
//
//     node tests/v3.js
//
// 測純資料和純邏輯：選單、路由、離線清單。畫面用 Playwright 測。

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const ROOT = path.resolve(__dirname, "..");
const V3 = path.join(ROOT, "v3");

let passed = 0, failed = 0;
function describe(name, fn) { console.log("\n" + name); fn(); }
function it(name, fn) {
  try { fn(); passed++; console.log("  ✓ " + name); }
  catch (e) { failed++; console.log("  ✗ " + name + "\n      " + (e.message || e).split("\n").join("\n      ")); }
}

(async () => {
  const N = await import(pathToFileURL(path.join(V3, "core/nav.js")).href);
  const items = N.ALL.flatMap((s) => (s.items || []).map((it) => ({ s, it })));

  describe("選單與路由 nav.js", () => {
    it("6 區出現在選單上，家長區不在（要長按才進得去）", () => {
      assert.deepStrictEqual(N.SECTIONS.map((s) => s.id), ["world", "tasks", "games", "words", "papers", "stories"]);
      assert.ok(!N.SECTIONS.includes(N.PARENT));
    });

    it("每一個要打開的頁面都存在", () => {
      N.ALL.filter((s) => s.page).forEach((s) => assert.ok(fs.existsSync(path.join(ROOT, s.page)), s.page));
      items.forEach(({ it }) => assert.ok(fs.existsSync(path.join(ROOT, it.page)), it.page));
    });

    it("v1 選單上的每一個功能，在 v3 都找得到（只有「v2（beta）」不用）", () => {
      const menu = fs.readFileSync(path.join(ROOT, "menu.js"), "utf8");
      const v1 = [...menu.matchAll(/href: "([^"]+)"/g)].map((m) => m[1]).filter((h) => !h.startsWith("v2/"));
      const v3 = new Set([...N.ALL.map((s) => s.page), ...items.map(({ it }) => it.page)]);
      v1.forEach((h) => assert.ok(v3.has(h), h + " 在 v3 找不到"));
    });

    it("中文名稱都有注音，而且一個字一組", () => {
      const check = (zh, z, tag) => assert.strictEqual([...zh].length, z.split(" ").length, tag + "：" + zh);
      N.ALL.forEach((s) => check(s.name, s.zy, s.id));
      items.filter(({ it }) => !it.en).forEach(({ s, it }) => check(it.name, it.zy, s.id));
    });

    it("每一區都有 🔊 要唸的說明", () => {
      N.ALL.filter((s) => s.items).forEach((s) => assert.ok(s.say && s.say.length > 2, s.id));
    });

    it("路由：空的 → 倉鼠世界；一區 → 大按鈕；區裡的頁面 → 打開那一頁", () => {
      assert.strictEqual(N.parseRoute("").section.id, "world");
      assert.strictEqual(N.parseRoute("").page, "daisy_hamster.html");
      const g = N.parseRoute("#games");
      assert.strictEqual(g.section.id, "games"); assert.strictEqual(g.page, null);
      const m = N.parseRoute("#games/daisy_memory.html?set=sea,make%20sense");
      assert.strictEqual(m.page, "daisy_memory.html?set=sea,make sense");
      assert.strictEqual(m.item.name, "翻翻樂");
      assert.strictEqual(N.parseRoute("#parent/parent_dashboard.html").item.name, "學習後台");
    });

    it("路由不讓網址打開清單外的檔案", () => {
      assert.strictEqual(N.parseRoute("#games/../../etc/passwd").page, null);
      assert.strictEqual(N.parseRoute("#games/daisy_hamster.html").page, null, "倉鼠頁不在遊戲中心裡");
      assert.strictEqual(N.parseRoute("#nope").section.id, "world");
    });
  });

  describe("離線 v3/sw.js", () => {
    const sw = fs.readFileSync(path.join(V3, "sw.js"), "utf8");
    const list = [...sw.slice(sw.indexOf("PRECACHE")).matchAll(/'(\.{1,2}\/[^']*)'/g)].map((m) => m[1]);
    it("v3 底下的每個檔案都在預先快取清單裡", () => {
      const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
      walk(V3).map((f) => "./" + path.relative(V3, f).split(path.sep).join("/"))
        .filter((f) => f !== "./sw.js")
        .forEach((f) => assert.ok(list.includes(f), f + " 沒有列在 v3/sw.js"));
    });
    it("清單上的檔案都存在", () => {
      list.filter((f) => f !== "./").forEach((f) => assert.ok(fs.existsSync(path.join(V3, f)), f));
    });
    it("CACHE_NAME 以 daisy-v3- 開頭（只清自己的舊快取，不碰 v1 的）", () => {
      assert.match(sw, /const CACHE_NAME = 'daisy-v3-\d{8}-\d{4}';/);
    });
  });

  describe("入口", () => {
    it("v2/index.html 轉到 v3（v1 選單的「✨ v2（beta）」不用改）", () => {
      assert.match(fs.readFileSync(path.join(ROOT, "v2/index.html"), "utf8"), /location\.replace\('\.\.\/v3\/'/);
      assert.ok(fs.existsSync(path.join(ROOT, "v2/today.html")), "原本的 v2 首頁還在");
    });
  });

  console.log("\n" + (failed ? "✗ " : "✓ ") + passed + " 通過" + (failed ? "，" + failed + " 失敗" : ""));
  process.exit(failed ? 1 : 0);
})();
