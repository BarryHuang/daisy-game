// menu.js — 左上角的浮動下拉選單，全站共用
//
// 為什麼不是獨立的首頁：主頁就是倉鼠頁，選單只是疊在上面的一層，
// 不該為了看選單而離開遊戲。
// 任何頁面 <script src="./menu.js"></script> 就會自動長出來。

const MENU_GROUPS = [
  { title: "", items: [
    { href: "daisy_hamster.html", emoji: "🐹", name: "倉鼠拼字冒險", home: true }
  ]},
  { title: "查東西", items: [
    { href: "daisy_dictionary.html", emoji: "📖", name: "查單字", note: "英翻中・有注音" },
    { href: "flashcards.html", emoji: "🃏", name: "單字卡", note: "複習自己收的字" },
    { href: "wordbook.html", emoji: "📒", name: "單字總表", note: "所有單字・看熟練度" }
  ]},
  { title: "讀故事", items: [
    { href: "story_hub.html",   emoji: "📚", name: "課文複習" },
    { href: "autumn_book.html", emoji: "🍂", name: "My Autumn Book" },
    { href: "every_season.html",emoji: "🌸", name: "Every Season" },
    { href: "georgia_eyes.html",emoji: "🎨", name: "Through Georgia's Eyes" }
  ]},
  { title: "玩遊戲", items: [
    { href: "daisy_memory.html",   emoji: "🎴", name: "翻翻樂", note: "配對英文和中文" },
    { href: "daisy_whack.html",    emoji: "🔨", name: "打地鼠", note: "聽發音敲對的字" },
    { href: "daisy_boss.html",     emoji: "⚔️", name: "弱字怪獸戰", note: "打倒不熟的字" },
    { href: "daisy_runner.html",   emoji: "🏃", name: "倉鼠跑酷", note: "衝進對的那道門" },
    { href: "daisy_restaurant.html", emoji: "🍳", name: "倉鼠餐廳", note: "聽客人用英文點餐" },
    { href: "daisy_pusher.html",   emoji: "💰", name: "單字推幣機", note: "投對格子推金幣" },
    { href: "daisy_claw.html",     emoji: "🕹️", name: "單字夾娃娃", note: "夾出對的那隻" },
    { href: "daisy_hangman.html",  emoji: "🎯", name: "猜單字" },
    { href: "daisy_scramble.html", emoji: "🫧", name: "字母重組" },
    { href: "daisy_snake.html",    emoji: "🐛", name: "彩虹小蟲" },
    { href: "daisy_hex.html",      emoji: "🐱", name: "圍貓貓" }
  ]},
  { title: "練習與測驗", items: [
    { href: "daisy_vocab_final.html",        emoji: "✏️", name: "單字測驗" },
    { href: "daisy_grammar_final.html",      emoji: "📝", name: "文法測驗" },
    { href: "final_exam_pronunciation.html", emoji: "🗣️", name: "發音測驗" }
  ]},
  { title: "給爸媽", items: [
    { href: "parent_dashboard.html", emoji: "👨‍👩‍👧", name: "學習後台" },
    { href: "words_review.html",     emoji: "🔍", name: "注音校對" }
  ]}
];

function currentPageName() {
  const f = location.pathname.split("/").pop() || "daisy_hamster.html";
  return f;
}

function buildMenuMarkup() {
  const here = currentPageName();
  const groups = MENU_GROUPS.map((g) => {
    const items = g.items.map((it) => {
      const active = it.href === here;
      return `<a class="dm-item${active ? " dm-active" : ""}" href="${it.href}">
        <span class="dm-emoji">${it.emoji}</span>
        <span class="dm-text"><b>${it.name}</b>${it.note ? `<i>${it.note}</i>` : ""}</span>
        ${active ? '<span class="dm-dot">●</span>' : ""}
      </a>`;
    }).join("");
    return (g.title ? `<div class="dm-title">${g.title}</div>` : "") + items;
  }).join("");

  const ver = typeof APP_VERSION !== "undefined" ? APP_VERSION : "未知版本";
  const foot = `<div class="dm-ver">
      <span>版本 ${ver}</span>
      <button id="dm-refresh" type="button">強制更新</button>
    </div>`;

  return `<button class="dm-btn" id="dm-btn" aria-label="選單" aria-expanded="false">☰</button>
    <div class="dm-backdrop" id="dm-backdrop"></div>
    <nav class="dm-panel" id="dm-panel" aria-label="全站選單">${foot}${groups}</nav>`;
}

function injectMenuStyles() {
  if (document.getElementById("dm-styles")) return;
  const el = document.createElement("style");
  el.id = "dm-styles";
  el.textContent = `
.dm-btn{position:fixed;left:10px;top:calc(8px + env(safe-area-inset-top));z-index:10000;
  width:40px;height:40px;border:0;border-radius:50%;cursor:pointer;
  background:rgba(123,31,162,.92);color:#fff;font-size:19px;line-height:1;
  box-shadow:0 3px 10px rgba(0,0,0,.32)}
.dm-btn:active{transform:scale(.94)}
.dm-backdrop{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.35);
  opacity:0;pointer-events:none;transition:opacity .18s}
.dm-backdrop.dm-open{opacity:1;pointer-events:auto}
.dm-panel{position:fixed;left:8px;top:calc(54px + env(safe-area-inset-top));z-index:9999;
  width:min(264px,calc(100vw - 24px));max-height:calc(100vh - 76px);overflow-y:auto;
  background:#fff;border-radius:18px;padding:8px;
  box-shadow:0 12px 40px rgba(0,0,0,.3);
  font-family:"Noto Sans TC","PingFang TC",-apple-system,sans-serif;
  opacity:0;transform:translateY(-8px) scale(.97);pointer-events:none;
  transition:opacity .18s,transform .18s;transform-origin:top left}
.dm-panel.dm-open{opacity:1;transform:none;pointer-events:auto}
.dm-title{font-size:.68rem;font-weight:800;color:#a9a6b8;letter-spacing:.09em;
  padding:10px 10px 5px}
.dm-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:12px;
  text-decoration:none;color:#3c3b47}
.dm-item:active{background:#f3effa}
.dm-active{background:#f6f1fb}
.dm-emoji{font-size:1.15rem;line-height:1;width:22px;text-align:center;flex:none}
.dm-text{display:flex;flex-direction:column;line-height:1.25;min-width:0}
.dm-text b{font-size:.94rem;font-weight:700}
.dm-text i{font-size:.72rem;color:#8b88a0;font-style:normal;margin-top:2px}
.dm-dot{margin-left:auto;color:#ab47bc;font-size:.6rem}
.dm-ver{border-bottom:1px solid #f0eef8;margin-bottom:4px;padding:6px 8px 10px;
  display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dm-ver span{font-size:.7rem;color:#8b88a0;flex:1;font-variant-numeric:tabular-nums}
.dm-ver button{border:1.5px solid #e3dff0;background:#fff;color:#7b1fa2;border-radius:99px;
  padding:5px 11px;font-size:.7rem;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap}
.dm-ver button:active{background:#f6f1fb}
.dm-stale span{color:#d6336c;font-weight:700}
.dm-stale span::before{content:"有新版本　"}
.dm-stale button{border-color:#f06595;background:#ffe8ef;color:#c2255c}
.dm-hasnew::after{content:"";position:absolute;right:1px;top:1px;
  width:11px;height:11px;border-radius:50%;background:#ff4757;border:2px solid #fff}
@media (prefers-reduced-motion:reduce){.dm-panel,.dm-backdrop{transition:none}}`;
  document.head.appendChild(el);
}

/** 等新的 Service Worker 接手；等不到也不卡住，重載一次通常就換過去了 */
function waitForNewWorker(ms) {
  return new Promise((done) => {
    const timer = setTimeout(done, ms);
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      clearTimeout(timer);
      done();
    }, { once: true });
  });
}

/**
 * 從網路核對版本。
 * 選單上顯示的版本號是從快取裡的 version.js 來的 —— 快取是舊的，那個數字就是舊的，
 * 所以光看它分不出「已經是最新」和「根本沒更新到」。這支直接問網路，
 * 有新版就把按鈕改成看得懂的字，並在 ☰ 上點一顆紅點。
 */
function checkForUpdate() {
  if (typeof fetch !== "function") return;
  fetch("./version.js?ts=" + Date.now(), { cache: "no-store" })
    .then((r) => (r.ok ? r.text() : null))
    .then((text) => {
      const m = text && text.match(/APP_VERSION\s*=\s*"([^"]+)"/);
      const here = typeof APP_VERSION !== "undefined" ? APP_VERSION : "";
      if (!m || !here || m[1] === here) return;

      const box = document.querySelector(".dm-ver");
      const btn = document.getElementById("dm-refresh");
      const hamburger = document.getElementById("dm-btn");
      if (box) box.classList.add("dm-stale");
      if (btn) btn.textContent = "更新到 " + m[1];
      if (hamburger) hamburger.classList.add("dm-hasnew");

      // 既然已經知道有新版，就順手叫 Service Worker 去裝，不用等瀏覽器自己想到。
      // 裝好之後她下次打開就是新的，連按鈕都不用按。
      if (navigator.serviceWorker)
        navigator.serviceWorker.getRegistrations()
          .then((regs) => regs.forEach((r) => r.update().catch(() => {})))
          .catch(() => {});
    })
    .catch(() => { /* 離線就算了，本來就沒得更新 */ });
}

function initMenu() {
  if (document.getElementById("dm-btn")) return;
  injectMenuStyles();
  const host = document.createElement("div");
  host.innerHTML = buildMenuMarkup();
  while (host.firstChild) document.body.appendChild(host.firstChild);

  const btn = document.getElementById("dm-btn");
  const panel = document.getElementById("dm-panel");
  const back = document.getElementById("dm-backdrop");

  const setOpen = (open) => {
    panel.classList.toggle("dm-open", open);
    back.classList.toggle("dm-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "✕" : "☰";
  };

  btn.addEventListener("click", () => setOpen(!panel.classList.contains("dm-open")));

  // 「強制更新」：清掉快取，叫 Service Worker 重抓一份新的，等它接手再重載。
  //
  // 這裡踩過三個坑，都會讓按鈕看起來沒作用：
  //   1. 原本會 unregister() Service Worker。註銷之後頁面重新註冊、重新 install，
  //      而 install 預設走 HTTP 快取，等於把剛剛刪掉的舊檔又抓回來一次。
  //      改成 update()：它會繞過 HTTP 快取重抓 sw.js，新的 SW 再用
  //      cache:'reload' 裝一份真正新鮮的檔案（見 sw.js 的 install）。
  //   2. 原本結尾是 location.reload(true)。那個 true 早就從規範拿掉、
  //      所有瀏覽器都忽略，等於普通重整，照樣吃 HTTP 快取。
  //   3. 順序不能顛倒：一定要先刪快取再 update()，反過來會把新裝好的檔案刪掉。
  const refresh = document.getElementById("dm-refresh");
  if (refresh) refresh.addEventListener("click", async () => {
    refresh.textContent = "更新中…";
    refresh.disabled = true;
    try {
      if (window.caches) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
      if (navigator.serviceWorker) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.update().catch(() => {})));
        await waitForNewWorker(6000);
      }
    } catch (e) { /* 清不掉就算了，還是重新載入 */ }
    location.reload();
  });

  checkForUpdate();
  back.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

if (typeof document !== "undefined") {
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", initMenu)
    : initMenu();
}
