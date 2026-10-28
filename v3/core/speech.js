// speech.js — v3 的語音（中文說明、英文單字）
//
// iPad 的 Safari 規定第一次發聲一定要在「她點下去的那一刻」同步執行，放進 setTimeout
// 會被擋掉 —— 所以 say() 都是在點擊的 handler 裡直接呼叫。

let voices = [];
function load() { voices = (window.speechSynthesis && speechSynthesis.getVoices()) || []; }
if (window.speechSynthesis) { load(); speechSynthesis.onvoiceschanged = load; }
const voiceFor = (lang) => voices.find((v) => v.lang === lang)
  || voices.find((v) => v.lang.replace('_', '-').startsWith(lang))
  || voices.find((v) => v.lang.startsWith(lang.split('-')[0]));

export function say(text, lang = 'zh-TW', rate) {
  if (!window.speechSynthesis || !text) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  const v = voiceFor(lang); if (v) u.voice = v;
  u.rate = rate || (lang.startsWith('en') ? 0.8 : 0.95);
  speechSynthesis.speak(u);
}
export const sayEn = (w) => say(w, 'en-US');
