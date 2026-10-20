// kit.js — v2 頁面共用的小工具：字的資料、注音、聲音、金幣
//
// 字的資料來自根目錄的 words.js（以 <script> 載入，是全域變數）：
//   wordEntries（中文意思＋注音）、wordImages（emoji）、wordExamples（例句）

export const $ = (s, el) => (el || document).querySelector(s);
export const $$ = (s, el) => [...(el || document).querySelectorAll(s)];

/** 中文＋注音：zy('拼拼看', 'ㄆㄧㄣ ㄆㄧㄣ ㄎㄢˋ') */
export const zy = (zh, z) => renderZhuyin(zh, String(z).split(' '));

/**
 * 查字的資料。專有名詞（Africa、Earth、Monday…）在 wordEntries 裡是大寫的 key，
 * 只用小寫查會查不到 —— 規劃器的測試抓到過：週四的模擬小考會因此少考三個字。
 * 所以一律先用原字查，查不到再用小寫。
 */
function lookup(table, w) {
  if (typeof table === 'undefined' || !table) return undefined;
  return table[w] ?? table[String(w).toLowerCase()];
}
export const entryOf = (w) => lookup(typeof wordEntries !== 'undefined' ? wordEntries : null, w);
export function meaningOf(w) {
  const e = entryOf(w);
  return e && e.s && e.s[0] && e.s[0].zh ? e.s[0] : null;
}
/** 中文意思（第一個義項）帶注音 */
export function meaningHTML(w) {
  const s = meaningOf(w);
  return s ? renderZhuyin(s.zh, s.z || []) : '';
}
export const emojiOf = (w) => lookup(typeof wordImages !== 'undefined' ? wordImages : null, w) || '📖';
export const exampleOf = (w) => lookup(typeof wordExamples !== 'undefined' ? wordExamples : null, w) || '';

// ── 聲音 ──────────────────────────────────────────────────────────────
export function sfx(name) { try { window.daisyAudio && window.daisyAudio.sfx(name); } catch (e) {} }
export function unlockAudio() { try { window.daisyAudio && window.daisyAudio.unlock(); } catch (e) {} }

let voices = [];
function loadVoices() { voices = (window.speechSynthesis && speechSynthesis.getVoices()) || []; }
if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
const voiceFor = (lang) => voices.find((v) => v.lang === lang)
  || voices.find((v) => v.lang.replace('_', '-').startsWith(lang))
  || voices.find((v) => v.lang.startsWith(lang.split('-')[0]));

/**
 * 唸出來。iPad 的 Safari 規定第一次發聲一定要在「她點下去的那一刻」執行，
 * 放進 setTimeout 會被擋掉 —— 所以每一關的第一個字都在點擊的當下同步呼叫。
 */
export function say(text, lang = 'zh-TW', rate) {
  if (!window.speechSynthesis || !text) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  const v = voiceFor(lang); if (v) u.voice = v;
  u.rate = rate || (lang.startsWith('en') ? 0.8 : 0.95);
  speechSynthesis.speak(u);
}
export const speakEn = (w) => say(w, 'en-US');

// ── 金幣與登入 ─────────────────────────────────────────────────────────
export function loginCode() {
  try { return (localStorage.getItem('daisy_hamster_user') || '').trim(); } catch (e) { return ''; }
}
/** 發金幣（rewards.js 的 awardCoins，用 transaction，v1 開著也不會互相蓋掉） */
export function award(n) {
  return new Promise((resolve) => {
    if (typeof awardCoins !== 'function') return resolve(false);
    awardCoins(n, resolve);
  });
}

/** 打亂（Fisher–Yates） */
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
