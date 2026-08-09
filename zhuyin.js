// zhuyin.js — 直排注音渲染器（台灣課本排法：注音在字的右側直排，聲調在旁）
// 任何頁面 <script src="./zhuyin.js"></script> 後即可用，樣式會自動注入一次。

const ZHUYIN_TONES = "ˊˇˋ˙";

// 把 "ㄋㄧˇ" 拆成 { symbols:"ㄋㄧ", tone:"ˇ" }
function splitTone(reading) {
  const last = reading.charAt(reading.length - 1);
  return ZHUYIN_TONES.includes(last)
    ? { symbols: reading.slice(0, -1), tone: last }
    : { symbols: reading, tone: "" };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// 單一個字 + 它的注音
function renderChar(char, reading) {
  const ch = escapeHtml(char);
  if (!reading) return `<span class="zy-plain">${ch}</span>`;

  const { symbols, tone } = splitTone(reading);
  const column = [...symbols].map(s => `<i>${s}</i>`).join("");
  const isNeutral = tone === "˙";           // 輕聲點標在注音上方
  const rail = isNeutral
    ? `<b>˙</b><span class="zy-col">${column}</span>`
    : `<span class="zy-col">${column}</span>${tone ? `<b>${tone}</b>` : ""}`;

  return `<span class="zy${isNeutral ? " zy-neutral" : ""}">` +
           `<span class="zy-char">${ch}</span>` +
           `<span class="zy-rail">${rail}</span>` +
         `</span>`;
}

// 主要入口：吃 wordEntries 的 { zh, z } 或任意 [char, reading] 陣列
function renderZhuyin(zh, readings) {
  const chars = [...zh];
  return chars.map((c, i) => renderChar(c, (readings || [])[i] || "")).join("");
}

function renderSense(sense) {
  const body = renderZhuyin(sense.zh, sense.z);
  return sense.note
    ? `${body}<span class="zy-note">${escapeHtml(sense.note)}</span>`
    : body;
}

// ---- 樣式只注入一次 ----
function injectZhuyinStyles() {
  if (document.getElementById("zhuyin-styles")) return;
  const el = document.createElement("style");
  el.id = "zhuyin-styles";
  el.textContent = `
.zy { display:inline-flex; align-items:flex-start;
      font-family:"PingFang TC","Heiti TC","Microsoft JhengHei","Noto Sans TC",sans-serif; }
.zy-char { line-height:1.1; }
.zy-rail { display:flex; align-items:center; align-self:stretch; padding-left:.055em; }
.zy-col  { display:flex; flex-direction:column; font-size:.36em; line-height:1.04; }
.zy-col i, .zy-rail b { font-style:normal; font-weight:400; }
.zy-rail b { font-size:.36em; line-height:1; padding-left:.08em; }
.zy-neutral .zy-rail { flex-direction:column; align-items:center;
                       justify-content:flex-start; padding-top:.02em; }
.zy-neutral .zy-rail b { padding:0 0 .06em 0; }
.zy-plain { font-family:"PingFang TC","Heiti TC","Microsoft JhengHei",sans-serif; }
.zy-line { line-height:1.9; }
.zy-note { font-size:.62em; opacity:.65; margin-left:.35em; vertical-align:.15em; }`;
  document.head.appendChild(el);
}

if (typeof document !== "undefined") {
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", injectZhuyinStyles)
    : injectZhuyinStyles();
}
