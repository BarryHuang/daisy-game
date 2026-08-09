const CACHE_NAME = 'daisy-20260810-0038';

const LOCAL_ASSETS = [
  './',
  './index.html',
  './daisy_hamster.html',
  './daisy_snake.html',
  './daisy_dictionary.html',
  './story_hub.html',
  './manifest.json',
  './style.css',
  './words.js',
  './zhuyin.js',
  './inflect.js',
  './cedict.js',
  './lookups.js',
  './mastery.js',
  './menu.js',
  './version.js',
  './wordlists.js',
  './flashcards.html',
  './exams.js',
  './final_questions.js',
  './firebase-config.js',
  './words_review.html',
  './daisy_hangman.html',
  './daisy_scramble.html',
  './parent_dashboard.html',
  './manifest_dictionary.json',
  './dict-icon-192.png',
  './dict-icon-512.png',
  './dict-icon-maskable.png',
  './final_questions.js',
  './icon-192.png',
  './icon-512.png',
  './daisy_hamster_beta.html',
  './daisy_vocab_final.html',
  './daisy_grammar_final.html',
  './daisy_hex.html',
  './final_exam_pronunciation.html',
  './autumn_book.html',
  './every_season.html',
  './georgia_eyes.html',
  './midterm_questions.js',
  './snake_icon.svg'
];

// 跨網域資源（CDN / Firebase）不放進 install 階段：任何一個失敗都會讓
// cache.addAll() 整批 reject，導致 Service Worker 安裝失敗、離線完全失效。
// 它們改由下面的 fetch handler 在實際用到時順手快取。
const RUNTIME_ASSETS = [
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
  'https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.9.0/firebase-database-compat.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // 逐一 add，單一檔案失敗（例如檔名打錯）不會拖垮整個安裝
      Promise.allSettled(LOCAL_ASSETS.map((url) => cache.add(url)))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

// Stale-while-revalidate：先回快取讓畫面秒開，背景抓新版蓋掉，下次開就是新的
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cached) => {
        const network = fetch(event.request).then((response) => {
          // 只快取成功的回應；opaque / 錯誤回應存進去會污染快取
          if (response && response.ok) cache.put(event.request, response.clone());
          return response;
        }).catch(() => cached);

        return cached || network;
      })
    )
  );
});
