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
    { href: "daisy_dictionary.html", emoji: "📖", name: "查單字", note: "英翻中・有注音" }
  ]},
  { title: "讀故事", items: [
    { href: "story_hub.html",   emoji: "📚", name: "課文複習" },
    { href: "autumn_book.html", emoji: "🍂", name: "My Autumn Book" },
    { href: "every_season.html",emoji: "🌸", name: "Every Season" },
    { href: "georgia_eyes.html",emoji: "🎨", name: "Through Georgia's Eyes" }
  ]},
  { title: "玩遊戲", items: [
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

  return `<button class="dm-btn" id="dm-btn" aria-label="選單" aria-expanded="false">☰</button>
    <div class="dm-backdrop" id="dm-backdrop"></div>
    <nav class="dm-panel" id="dm-panel" aria-label="全站選單">${groups}</nav>`;
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
@media (prefers-reduced-motion:reduce){.dm-panel,.dm-backdrop{transition:none}}`;
  document.head.appendChild(el);
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
  back.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

if (typeof document !== "undefined") {
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", initMenu)
    : initMenu();
}
