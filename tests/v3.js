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
  const items = N.ALL.flatMap((s) => [...(s.items || []), ...(s.extra || [])].map((it) => ({ s, it })));

  describe("選單與路由 nav.js", () => {
    it("6 區出現在選單上，家長區不在（要長按才進得去）", () => {
      assert.deepStrictEqual(N.SECTIONS.map((s) => s.id), ["world", "tasks", "games", "words", "papers", "stories"]);
      assert.ok(!N.SECTIONS.includes(N.PARENT));
    });

    it("每一個要打開的頁面都存在", () => {
      N.ALL.filter((s) => s.page).forEach((s) => assert.ok(fs.existsSync(path.join(ROOT, s.page)), s.page));
      N.ALL.filter((s) => s.module).forEach((s) => assert.ok(fs.existsSync(path.join(V3, s.module)), s.module));
      N.ALL.forEach((s) => assert.ok(s.page || s.module || s.items, s.id + " 沒有內容"));
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
      assert.strictEqual(N.parseRoute("").page, "v3/world/index.html");
      assert.strictEqual(N.parseRoute("#world/daisy_hamster.html").item.name, "拼字冒險", "v1 的倉鼠頁從小星球的「家」進去");
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

  const B = await import(pathToFileURL(path.join(ROOT, "v2/lab/book3d.js")).href);
  const L = await import(pathToFileURL(path.join(V3, "world/landmarks.js")).href);
  describe("可愛風 3D（book3d.js 的主題）", () => {
    const hex = (n) => n.toString(16);
    it("預設是繪本主題，v2 畫出來不變（調色盤、排線、紙紋、描邊都是原本的數字）", () => {
      assert.strictEqual(B.currentTheme, "book");
      assert.strictEqual(hex(B.P.grass[0]), "b7cd8f");
      assert.strictEqual(B.sharedUniforms.uHatchScale.value, 1);
      assert.strictEqual(B.sharedUniforms.uGrain.value, 1);
      assert.strictEqual(B.sharedUniforms.uShadeMix.value, 0.5);
      assert.strictEqual(B.sharedUniforms.uShadeDark.value, 0.8);
    });
    it("換成可愛風：糖果色、沒有排線和紙紋；別的模組登記的調色盤也跟著換", () => {
      const C = B.themable("garden", { carrot: 0xd9772f, soil: 0x86603f });
      B.applyTheme("cute");
      assert.strictEqual(hex(B.P.grass[0]), "8ee05a");
      assert.strictEqual(hex(B.P.roof), "ff6b9a");
      assert.strictEqual(B.sharedUniforms.uHatchScale.value, 0);
      assert.strictEqual(B.sharedUniforms.uGrain.value, 0);
      assert.strictEqual(hex(C.carrot), "ff8a2a");
      B.applyTheme("book");
      assert.strictEqual(hex(B.P.grass[0]), "b7cd8f", "換回繪本要完全還原");
      assert.strictEqual(hex(C.carrot), "d9772f");
      assert.strictEqual(B.sharedUniforms.uHatchScale.value, 1);
    });
    it("小星球上的 7 區，順序和 v1 倉鼠世界一樣（daisy_hamster.html 的 MAP_ORDER）", () => {
      const src = fs.readFileSync(path.join(ROOT, "daisy_hamster.html"), "utf8");
      const order = JSON.parse(src.match(/const MAP_ORDER = (\[[^\]]+\])/)[1].replace(/'/g, '"'));
      assert.deepStrictEqual(L.REGIONS.map((r) => r.name), order);
    });
    it("每個新地標都建得出來（家用小屋、後院用菜園，不用另外做）", () => {
      // blob()（地上的影子）用 canvas 畫貼圖；node 沒有，給一個什麼都不做的替身
      global.document = global.document || { createElement: () => ({ getContext: () => ({
        createRadialGradient: () => ({ addColorStop() {} }), fillRect() {}, fillStyle: "" }) }) };
      L.REGIONS.filter((r) => r.make).forEach((r) => { const g = r.make(); assert.ok(g.children.length > 0, r.name); });
      const fair = L.makeFair(); const before = fair.children[1].rotation.z;
      fair.userData.tick(1); assert.ok(fair.children[1].rotation.z > before, "摩天輪會轉");
    });
    it("地標之間、地標和倉鼠站的位置都不重疊", () => {
      const d2r = Math.PI / 180;
      const dir = ([la, lo]) => [Math.cos(la * d2r) * Math.sin(lo * d2r), Math.sin(la * d2r), Math.cos(la * d2r) * Math.cos(lo * d2r)];
      const ang = (a, b) => Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])) / d2r;
      const spots = [[18, 8], ...L.REGIONS.filter((r) => r.at).map((r) => r.at)];
      for (let i = 0; i < spots.length; i++) for (let j = i + 1; j < spots.length; j++)
        assert.ok(ang(dir(spots[i]), dir(spots[j])) > 25, spots[i] + " 和 " + spots[j] + " 太近");
      L.REGIONS.filter((r) => r.at).forEach((r) => { const a = ang(dir(r.at), dir(r.stand)); assert.ok(a > 6 && a < 16, r.name + " 站的位置 " + a.toFixed(1) + "°"); });
    });
  });

  describe("今日任務 tasks.js", () => {
    const src = fs.readFileSync(path.join(V3, "tasks/tasks.js"), "utf8");
    it("「用今天的字玩」的 6 個遊戲都看得懂 ?set=（有載入 wordset.js），也都在遊戲中心裡", () => {
      const list = JSON.parse(src.match(/SET_GAMES = (\[[^\]]+\])/)[1].replace(/'/g, '"'));
      assert.strictEqual(list.length, 6);
      const games = N.sectionById("games").items.map((it) => it.page);
      list.forEach((f) => {
        assert.match(fs.readFileSync(path.join(ROOT, f), "utf8"), /wordset\.js/, f);
        assert.ok(games.includes(f), f + " 不在遊戲中心");
      });
    });
    it("和 v2 存在同一個地方（在 v2 做過的不會不見），金幣：一關 5、寶箱 40", () => {
      assert.match(src, /'daisy2_today_'/); assert.match(src, /'daisy2_seen'/);
      assert.match(src, /REWARD = \{ station: 5, chest: 40 \}/);
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
