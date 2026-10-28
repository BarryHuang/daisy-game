// v3 自己的 Service Worker（scope 是 /v3/）
//
// 為什麼不用根目錄那支：那支是 v1 的，v3 不想為了自己的檔案去動它。
// 這支的 scope 比根目錄的更具體，所以 /v3/ 底下的頁面歸這支管；
// 內容區 iframe 打開的 v1 頁面在根目錄，照舊歸根目錄那支管。
//
// ⚠ 根目錄那支 activate 時會刪掉「名字不是它自己」的所有快取，包括這支的。
// 所以 v1 一改版、她又先開了 v1，v3 的快取就會被清掉；下次連網打開 v3 時
// fetch handler 會邊用邊存回來。代價只是那之後第一次「離線」開 v3 會失敗。
// 要根治得改根目錄那支（只刪 daisy- 開頭、非 v3 的），等 v3 取代 v1 時再一起改。
//
// CACHE_NAME 由 tools/stamp_version.py 蓋章（和根目錄那支同一個時間）。
const CACHE_NAME = 'daisy-v3-20261028-0857';

// tests/v3.js 會檢查 v3 底下每個要用到的檔案都列在這裡
const PRECACHE = [
  './',
  './index.html',
  './core/theme.css',
  './core/nav.js',
  './core/speech.js',
  './world/index.html',
  './world/landmarks.js',
  // v3 從外面借用的（唯讀）
  '../zhuyin.js',
  '../version.js',
  '../firebase-config.js',
  '../icon-192.png',
  '../v2/art/hamster.svg',
  '../v2/lab/petstore.js',
  '../v2/lab/book3d.js',
  '../v2/lab/planet.js',
  '../v2/vendor/three.module.min.js',
  '../audio.js',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) =>
    // cache: 'reload'：不要從瀏覽器的 HTTP 快取拿舊檔（根目錄那支踩過這個雷）
    Promise.allSettled(PRECACHE.map((u) => cache.add(new Request(u, { cache: 'reload' }))))));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((names) => Promise.all(names.filter((n) => n.startsWith('daisy-v3-') && n !== CACHE_NAME).map((n) => caches.delete(n))))
    .then(() => self.clients.claim()));
});

// 先回快取讓畫面秒開，背景抓新版蓋掉（同根目錄那支）
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const hasQuery = new URL(event.request.url).search !== '';
  event.respondWith(caches.open(CACHE_NAME).then((cache) => cache.match(event.request).then((cached) => {
    const network = fetch(event.request).then((res) => {
      if (res && res.ok && !hasQuery) cache.put(event.request, res.clone());
      return res;
    }).catch(() => cached);
    return (hasQuery ? null : cached) || network;
  })));
});
