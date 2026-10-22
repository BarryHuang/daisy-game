// shelf.js — 書架上有什麼（v1 的遊戲、故事、工具）
//
// v2 不重寫 v1 的遊戲：書架只是一面大圖示、不用下拉選單的入口，點下去開 v1 原本那一頁。
// set: true 的遊戲讀得懂 ?set=（wordset.js），可以「用今天的字玩」。
// 中文名稱一律帶注音（一個字一組，tests/run.js 會檢查字數對得上）。

export const SHELVES = [
  {
    id: 'today', name: '用今天的字玩', zy: 'ㄩㄥˋ ㄐㄧㄣ ㄊㄧㄢ ㄉㄜ˙ ㄗˋ ㄨㄢˊ', color: 'leaf',
    say: '用今天練過的字玩遊戲。',
    items: [
      { href: 'daisy_memory.html',   em: '🎴', name: '翻翻樂',   zy: 'ㄈㄢ ㄈㄢ ㄌㄜˋ',           set: true },
      { href: 'daisy_whack.html',    em: '🔨', name: '打地鼠',   zy: 'ㄉㄚˇ ㄉㄧˋ ㄕㄨˇ',          set: true },
      { href: 'daisy_claw.html',     em: '🕹️', name: '夾娃娃',   zy: 'ㄐㄧㄚˊ ㄨㄚˊ ㄨㄚ˙',         set: true },
      { href: 'daisy_pusher.html',   em: '💰', name: '推幣機',   zy: 'ㄊㄨㄟ ㄅㄧˋ ㄐㄧ',           set: true },
      { href: 'daisy_hangman.html',  em: '🎯', name: '猜單字',   zy: 'ㄘㄞ ㄉㄢ ㄗˋ',             set: true },
      { href: 'daisy_scramble.html', em: '🫧', name: '字母重組', zy: 'ㄗˋ ㄇㄨˇ ㄔㄨㄥˊ ㄗㄨˇ',     set: true },
    ],
  },
  {
    id: 'games', name: '更多遊戲', zy: 'ㄍㄥˋ ㄉㄨㄛ ㄧㄡˊ ㄒㄧˋ', color: 'persimmon',
    say: '更多遊戲。',
    items: [
      { href: 'daisy_hamster.html',    em: '🐹', name: '拼字冒險', zy: 'ㄆㄧㄣ ㄗˋ ㄇㄠˋ ㄒㄧㄢˇ' },
      { href: 'daisy_boss.html',       em: '⚔️', name: '怪獸戰',   zy: 'ㄍㄨㄞˋ ㄕㄡˋ ㄓㄢˋ' },
      { href: 'daisy_runner.html',     em: '🏃', name: '倉鼠跑酷', zy: 'ㄘㄤ ㄕㄨˇ ㄆㄠˇ ㄎㄨˋ' },
      { href: 'daisy_restaurant.html', em: '🍳', name: '倉鼠餐廳', zy: 'ㄘㄤ ㄕㄨˇ ㄘㄢ ㄊㄧㄥ' },
      { href: 'daisy_snake.html',      em: '🐛', name: '彩虹小蟲', zy: 'ㄘㄞˇ ㄏㄨㄥˊ ㄒㄧㄠˇ ㄔㄨㄥˊ' },
      { href: 'daisy_hex.html',        em: '🐱', name: '圍貓貓',   zy: 'ㄨㄟˊ ㄇㄠ ㄇㄠ' },
    ],
  },
  {
    id: 'read', name: '讀故事', zy: 'ㄉㄨˊ ㄍㄨˋ ㄕˋ', color: 'plum',
    say: '讀故事。',
    items: [
      { href: 'story_hub.html',    em: '📚', name: '課文複習', zy: 'ㄎㄜˋ ㄨㄣˊ ㄈㄨˋ ㄒㄧˊ' },
      { href: 'autumn_book.html',  em: '🍂', en: 'My Autumn Book' },
      { href: 'every_season.html', em: '🌸', en: 'Every Season' },
      { href: 'georgia_eyes.html', em: '🎨', en: "Through Georgia's Eyes" },
    ],
  },
  {
    id: 'tools', name: '查東西和練習', zy: 'ㄔㄚˊ ㄉㄨㄥ ㄒㄧ˙ ㄏㄢˋ ㄌㄧㄢˋ ㄒㄧˊ', color: 'sky',
    say: '查單字，還有練習。',
    items: [
      { href: 'daisy_dictionary.html', em: '📖', name: '查單字',   zy: 'ㄔㄚˊ ㄉㄢ ㄗˋ' },
      { href: 'flashcards.html',       em: '🃏', name: '單字卡',   zy: 'ㄉㄢ ㄗˋ ㄎㄚˇ' },
      { href: 'wordbook.html',         em: '📒', name: '單字總表', zy: 'ㄉㄢ ㄗˋ ㄗㄨㄥˇ ㄅㄧㄠˇ' },
      { href: 'daisy_practice.html',   em: '📝', name: '練習中心', zy: 'ㄌㄧㄢˋ ㄒㄧˊ ㄓㄨㄥ ㄒㄧㄣ' },
      { href: 'daisy_mistakes.html',   em: '📕', name: '錯題本',   zy: 'ㄘㄨㄛˋ ㄊㄧˊ ㄅㄣˇ' },
      { href: 'daisy_multiply.html',   em: '✖️', name: '九九乘法', zy: 'ㄐㄧㄡˇ ㄐㄧㄡˇ ㄔㄥˊ ㄈㄚˇ' },
    ],
  },
];

/** 今天的字：今天小徑上出現過的字（不含寶箱），照出現順序、不重複 */
export function todaysWords(plan) {
  if (!plan || !plan.stations) return [];
  const out = new Map();
  plan.stations.forEach((s) => (s.words || []).forEach((w) => { if (!out.has(w.toLowerCase())) out.set(w.toLowerCase(), w); }));
  return [...out.values()];
}

/** 遊戲的網址：從 v2/ 回到根目錄；可以帶今天的字 */
export function hrefOf(item, words) {
  const base = '../' + item.href;
  return item.set && words && words.length ? base + '?set=' + words.map(encodeURIComponent).join(',') : base;
}

// ── 考卷 ──────────────────────────────────────────────────────────────
// 有手工卷（課本原句出的）就用手工卷；沒有就用 daisy_paper.html 自動出一張
export const HANDMADE = {
  fet: { 'Wk 1': 'daisy_fet_wk1.html', 'Wk 2': 'daisy_fet_wk2.html', 'Wk 3': 'daisy_fet_wk3.html',
         'Wk 4': 'daisy_fet_wk4.html', 'Wk 5': 'daisy_fet_wk5.html', 'Wk 6': 'daisy_fet_wk6.html' },
  cet: { 'Wk 1&2': 'daisy_cet_wk1.html', 'Wk 3': 'daisy_cet_wk3.html', 'Wk 4': 'daisy_cet_wk4.html',
         'Wk 5': 'daisy_cet_wk5.html', 'Wk 6': 'daisy_cet_wk6.html', 'Wk 7': 'daisy_cet_wk7.html' },
};

/**
 * 到第 n 週為止的考卷，新的在前面。FET 和 CET 同一週排在一起。
 *   words  words.js 的 words；lists  calendar.js 的 TERM.lists
 */
export function papersUpTo(n, words, lists) {
  const out = [];
  for (const c of ['fet', 'cet']) {
    for (const wk of Object.keys(words[lists[c]] || {})) {
      const ns = (wk.match(/\d+/g) || []).map(Number);
      if (!ns.length || Math.min(...ns) > n) continue;
      const hand = HANDMADE[c][wk];
      out.push({ wk, c, sort: Math.max(...ns), em: c === 'fet' ? '✏️' : '📗',
        en: (c === 'fet' ? 'FET ' : 'CET ') + wk, auto: !hand,
        href: hand || 'daisy_paper.html?c=' + c + '&wk=' + encodeURIComponent(wk) });
    }
  }
  return out.sort((a, b) => b.sort - a.sort || (a.c < b.c ? -1 : 1));
}
