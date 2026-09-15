// fx.js — 「手感」的執行期工具：粒子、浮動數字、震動、交錯進場
//
// 手遊之所以爽，大半不是美術而是回饋密度：按下去有反應、答對有東西噴出來、
// 答錯畫面會晃。這些全部是純程式，不需要任何素材，所以先做這一層 CP 值最高。
//
// 用法（遊戲頁只要在既有的成功／失敗分支各加一行）：
//   fxBurst(event)           答對：從點擊位置噴碎片
//   fxFloat('+2 💰', event)  獲得金幣：數字往上飄
//   fxShake(el)              答錯：元素左右甩
//   fxPop(el)                任何要強調一下的元素
//   fxStagger('.card')       進場交錯落下
//
// 所有函式都吃 Event 或 {x,y} 或 Element，取不到座標就用畫面中央，不會壞。

/** 系統設了「減少動態效果」就整個停掉 —— 有些孩子對動畫敏感 */
function fxReduced() {
  try { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
  catch (e) { return false; }
}

/** 把 Event / Element / {x,y} 都正規化成畫面座標 */
function fxPoint(src) {
  if (!src) return { x: innerWidth / 2, y: innerHeight / 2 };
  if (typeof src.clientX === 'number' && src.clientX) return { x: src.clientX, y: src.clientY };
  if (src.touches && src.touches[0]) return { x: src.touches[0].clientX, y: src.touches[0].clientY };
  const el = src.nodeType === 1 ? src : (src.target && src.target.nodeType === 1 ? src.target : null);
  if (el) { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  if (typeof src.x === 'number') return { x: src.x, y: src.y };
  return { x: innerWidth / 2, y: innerHeight / 2 };
}

const FX_COLORS = ['#ffcf3f', '#ff6b9d', '#5b8def', '#46c76a', '#9b5de5', '#ff9f2e'];

/** 從一個點噴出碎片。n 給大一點是「過關」等級的慶祝 */
function fxBurst(at, n = 12, colors = FX_COLORS) {
  if (fxReduced()) return;
  const { x, y } = fxPoint(at);
  for (let i = 0; i < n; i++) {
    const d = document.createElement('div');
    d.className = 'fx-spark';
    // 以點擊處為圓心均勻散開，再加一點亂數，才不會像時鐘刻度
    const ang = (Math.PI * 2 * i) / n + (Math.random() - .5) * .6;
    const dist = 45 + Math.random() * 55;
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    d.style.background = colors[i % colors.length];
    d.style.setProperty('--dx', Math.cos(ang) * dist - 5 + 'px');
    d.style.setProperty('--dy', Math.sin(ang) * dist - 5 + 'px');
    d.style.animationDelay = (Math.random() * .06) + 's';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 800);
  }
}

/** 往上飄的字（+2 💰、Great!、Combo ×3） */
function fxFloat(text, at, color) {
  if (fxReduced()) return;
  const { x, y } = fxPoint(at);
  const d = document.createElement('div');
  d.className = 'fx-floater';
  d.textContent = text;
  d.style.left = x + 'px';
  d.style.top = (y - 10) + 'px';
  if (color) d.style.color = color;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 1200);
}

/** 重新觸發 CSS 動畫：一定要先移除 class、強制 reflow，再加回去 */
function fxReplay(el, cls, ms) {
  if (!el || fxReduced()) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms);
}

function fxPop(el)   { fxReplay(el, 'fx-pop', 400); }
function fxShake(el) { fxReplay(el, 'fx-shake', 480); fxHaptic(30); }

/** 手機震動。Android 支援，iOS Safari 不支援 —— 不支援就安靜跳過 */
function fxHaptic(ms) {
  try { if (navigator.vibrate && !fxReduced()) navigator.vibrate(ms || 15); } catch (e) {}
}

/** 進場交錯落下：一次全部出現很平，錯開 60ms 就有「發牌」的感覺 */
function fxStagger(selector, step = 60) {
  if (fxReduced()) return;
  document.querySelectorAll(selector).forEach((el, i) => {
    el.style.animationDelay = (i * step) + 'ms';
    el.classList.add('fx-drop');
  });
}

/** 數字滾動到新值，而不是直接跳。金幣、經驗值用這個會有賺到的感覺 */
function fxCountTo(el, to, ms = 600) {
  if (!el) return;
  const from = parseInt(String(el.textContent).replace(/[^\d-]/g, ''), 10) || 0;
  if (fxReduced() || from === to) { el.textContent = to; return; }
  const t0 = performance.now();
  const tick = (t) => {
    const k = Math.min(1, (t - t0) / ms);
    // ease-out，最後才慢下來
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(tick); else { el.textContent = to; fxPop(el); }
  };
  requestAnimationFrame(tick);
}
