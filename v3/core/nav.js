// nav.js — v3 左邊選單和每個區的內容（純資料，沒有畫面，tests/v3.js 會檢查）
//
// v1 的選單有 27 項，同類的分散在各組。v3 合併成 6 區，再加一個藏起來的家長區：
//   倉鼠世界、今日任務、遊戲中心、單字本、考卷、故事；家長區要長按倉鼠 2 秒
//
// 每一區之後都會用 v3 自己的骨架重做（見 README 的 v3 一節）。還沒重做的項目，
// 先在內容區用 iframe 打開 v1 原本那一頁（page: 'xxx.html'），v3 第一天就能完整使用。
// 中文名稱一律帶注音（一個字一組）。

export const SECTIONS = [
  // 倉鼠世界：v3 的 3D 小星球（可愛風）。v1 的倉鼠頁（拼字冒險、商店、照顧倉鼠）
  // 從小星球的「家」或右上角的「拼字冒險」進去，所以放在 extra（可以走得到，但不另外列一格）
  { id: 'world', em: '🏠', name: '倉鼠世界', zy: 'ㄘㄤ ㄕㄨˇ ㄕˋ ㄐㄧㄝˋ', color: 'grape',
    say: '倉鼠世界。去找倉鼠玩。', page: 'v3/world/index.html',
    extra: [{ page: 'daisy_hamster.html', em: '🐹', name: '拼字冒險', zy: 'ㄆㄧㄣ ㄗˋ ㄇㄠˋ ㄒㄧㄢˇ' }] },
  { id: 'tasks', em: '⭐', name: '今日任務', zy: 'ㄐㄧㄣ ㄖˋ ㄖㄣˋ ㄨˋ', color: 'sun',
    say: '今日任務。今天要練的字，都排好了。', page: 'v2/today.html' },
  { id: 'games', em: '🎮', name: '遊戲中心', zy: 'ㄧㄡˊ ㄒㄧˋ ㄓㄨㄥ ㄒㄧㄣ', color: 'tangerine',
    say: '遊戲中心。想玩哪一個？',
    items: [
      { page: 'daisy_memory.html',     em: '🎴', name: '翻翻樂',   zy: 'ㄈㄢ ㄈㄢ ㄌㄜˋ' },
      { page: 'daisy_whack.html',      em: '🔨', name: '打地鼠',   zy: 'ㄉㄚˇ ㄉㄧˋ ㄕㄨˇ' },
      { page: 'daisy_boss.html',       em: '⚔️', name: '怪獸戰',   zy: 'ㄍㄨㄞˋ ㄕㄡˋ ㄓㄢˋ' },
      { page: 'daisy_runner.html',     em: '🏃', name: '倉鼠跑酷', zy: 'ㄘㄤ ㄕㄨˇ ㄆㄠˇ ㄎㄨˋ' },
      { page: 'daisy_restaurant.html', em: '🍳', name: '倉鼠餐廳', zy: 'ㄘㄤ ㄕㄨˇ ㄘㄢ ㄊㄧㄥ' },
      { page: 'daisy_pusher.html',     em: '💰', name: '推幣機',   zy: 'ㄊㄨㄟ ㄅㄧˋ ㄐㄧ' },
      { page: 'daisy_claw.html',       em: '🕹️', name: '夾娃娃',   zy: 'ㄐㄧㄚˊ ㄨㄚˊ ㄨㄚ˙' },
      { page: 'daisy_hangman.html',    em: '🎯', name: '猜單字',   zy: 'ㄘㄞ ㄉㄢ ㄗˋ' },
      { page: 'daisy_scramble.html',   em: '🫧', name: '字母重組', zy: 'ㄗˋ ㄇㄨˇ ㄔㄨㄥˊ ㄗㄨˇ' },
      { page: 'daisy_snake.html',      em: '🐛', name: '彩虹小蟲', zy: 'ㄘㄞˇ ㄏㄨㄥˊ ㄒㄧㄠˇ ㄔㄨㄥˊ' },
      { page: 'daisy_hex.html',        em: '🐱', name: '圍貓貓',   zy: 'ㄨㄟˊ ㄇㄠ ㄇㄠ' },
      { page: 'daisy_multiply.html',   em: '✖️', name: '九九乘法', zy: 'ㄐㄧㄡˇ ㄐㄧㄡˇ ㄔㄥˊ ㄈㄚˇ' },
    ] },
  { id: 'words', em: '📒', name: '單字本', zy: 'ㄉㄢ ㄗˋ ㄅㄣˇ', color: 'sky',
    say: '單字本。查單字、看單字卡。',
    items: [
      { page: 'daisy_dictionary.html', em: '📖', name: '查單字',   zy: 'ㄔㄚˊ ㄉㄢ ㄗˋ' },
      { page: 'flashcards.html',       em: '🃏', name: '單字卡',   zy: 'ㄉㄢ ㄗˋ ㄎㄚˇ' },
      { page: 'wordbook.html',         em: '📒', name: '單字總表', zy: 'ㄉㄢ ㄗˋ ㄗㄨㄥˇ ㄅㄧㄠˇ' },
    ] },
  { id: 'papers', em: '📝', name: '考卷', zy: 'ㄎㄠˇ ㄐㄩㄢˋ', color: 'mint',
    say: '考卷。寫寫看，看自己會了多少。',
    items: [
      { page: 'daisy_practice.html', em: '📝', name: '練習中心', zy: 'ㄌㄧㄢˋ ㄒㄧˊ ㄓㄨㄥ ㄒㄧㄣ' },
      { page: 'daisy_mistakes.html', em: '📕', name: '錯題本',   zy: 'ㄘㄨㄛˋ ㄊㄧˊ ㄅㄣˇ' },
    ] },
  { id: 'stories', em: '📚', name: '故事', zy: 'ㄍㄨˋ ㄕˋ', color: 'rose',
    say: '故事。讀課文和繪本。',
    items: [
      { page: 'story_hub.html',    em: '📚', name: '課文複習', zy: 'ㄎㄜˋ ㄨㄣˊ ㄈㄨˋ ㄒㄧˊ' },
      { page: 'autumn_book.html',  em: '🍂', en: 'My Autumn Book' },
      { page: 'every_season.html', em: '🌸', en: 'Every Season' },
      { page: 'georgia_eyes.html', em: '🎨', en: "Through Georgia's Eyes" },
    ] },
];

/** 家長區：不在選單上，長按左上角的倉鼠 2 秒才出現（避免她誤點） */
export const PARENT = { id: 'parent', em: '👨‍👩‍👧', name: '家長區', zy: 'ㄐㄧㄚ ㄓㄤˇ ㄑㄩ', color: 'slate',
  say: '家長區。',
  items: [
    { page: 'parent_dashboard.html',  em: '📊', name: '學習後台',       zy: 'ㄒㄩㄝˊ ㄒㄧˊ ㄏㄡˋ ㄊㄞˊ' },
    { page: 'midterm_checklist.html', em: '✅', name: '期中考複習清單', zy: 'ㄑㄧˊ ㄓㄨㄥ ㄎㄠˇ ㄈㄨˋ ㄒㄧˊ ㄑㄧㄥ ㄉㄢ' },
    { page: 'words_review.html',      em: '🔍', name: '注音校對',       zy: 'ㄓㄨˋ ㄧㄣ ㄐㄧㄠˋ ㄉㄨㄟˋ' },
    { page: 'daisy_about.html',       em: '📣', name: '功能總覽',       zy: 'ㄍㄨㄥ ㄋㄥˊ ㄗㄨㄥˇ ㄌㄢˇ' },
  ] };

export const ALL = [...SECTIONS, PARENT];
export const sectionById = (id) => ALL.find((s) => s.id === id) || null;

/**
 * 網址的 hash → 要顯示什麼。
 *   ''                         → 倉鼠世界
 *   '#games'                   → 遊戲中心（一格一格的大按鈕）
 *   '#games/daisy_memory.html' → 在遊戲中心裡打開 v1 的翻翻樂
 * 只接受這個區裡列出來的頁面，不讓網址打開任意檔案。
 */
export function parseRoute(hash) {
  const raw = decodeURIComponent(String(hash || '').replace(/^#\/?/, ''));
  const [id, ...rest] = raw.split('/');
  const sec = sectionById(id) || SECTIONS[0];
  const want = rest.join('/');
  const item = want && [...(sec.items || []), ...(sec.extra || [])].find((it) => it.page === want.split('?')[0]);
  if (item) return { section: sec, page: want, item };
  if (!sec.items) return { section: sec, page: sec.page, item: null };
  return { section: sec, page: null, item: null };
}

/** 某一頁在 v3 裡的網址（給選單和大按鈕用） */
export const routeOf = (sec, item) => '#' + sec.id + (item ? '/' + item.page : '');
