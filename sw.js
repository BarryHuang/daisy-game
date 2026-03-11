const CACHE_NAME = 'daisy-hamster-v5';
const urlsToCache = [
  './daisy_hamster.html',
  './manifest.json',
  './style.css',
  './words.js',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
  'https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.9.0/firebase-database-compat.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // 強制立刻啟用新的 Service Worker
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // 刪除舊的快取
          }
        })
      );
    })
  );
});

// 使用 "Stale-while-revalidate" (邊用舊的邊更新) 策略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchedResponse = fetch(event.request).then((networkResponse) => {
          // 將最新抓取到的版本存入快取中
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }).catch(() => {
          // 如果網路斷線，就回傳快取
          return cachedResponse;
        });
        // 優先回傳快取讓畫面秒開，同時背景去抓新的蓋掉快取 (下次打開就會是新的)
        return cachedResponse || fetchedResponse;
      });
    })
  );
});
