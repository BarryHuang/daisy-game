// firebase-config.js — 全站唯一一份 Firebase 設定
//
// 這份設定原本複製在 daisy_hamster.html / daisy_hamster_beta.html /
// parent_dashboard.html / lookups.js 四個地方，改一個地方就得記得改另外三個。
//
// 注意：這個 repo 是公開的。web config 本來就設計成可公開，不算洩漏，
// 但它等於把資料庫位址公告出去，所以防線全在 Realtime Database 的安全規則。
// 請確認規則不是 {".read": true, ".write": true}。

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCaWfJnDdK4R2mv2Ht3dQm2lyHhmpWIjo4",
  authDomain: "daisygame-30452.firebaseapp.com",
  databaseURL: "https://daisygame-30452-default-rtdb.firebaseio.com",
  projectId: "daisygame-30452",
  storageBucket: "daisygame-30452.firebasestorage.app",
  messagingSenderId: "548508102123",
  appId: "1:548508102123:web:40f02b8557ecca99523dae",
  measurementId: "G-B7N0LC0D6P"
};

const FIREBASE_SDK_URLS = [
  "https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/10.9.0/firebase-database-compat.js"
];

// 給本來就用 <script> 載好 SDK 的頁面用（倉鼠、家長後台）
function initFirebase() {
  if (!window.firebase) return null;
  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
  return firebase.database();
}

// 給沒有預先載 SDK 的頁面用（遊戲、字典）：要用到才去抓
let _firebaseDbPromise = null;
function getFirebaseDb() {
  if (_firebaseDbPromise) return _firebaseDbPromise;
  _firebaseDbPromise = new Promise((resolve) => {
    if (window.firebase && window.firebase.database) return resolve(initFirebase());
    let remaining = FIREBASE_SDK_URLS.length;
    let failed = false;
    FIREBASE_SDK_URLS.forEach((src) => {
      const el = document.createElement("script");
      el.src = src;
      el.onload = () => { if (--remaining === 0 && !failed) resolve(initFirebase()); };
      el.onerror = () => { failed = true; resolve(null); };
      document.head.appendChild(el);
    });
  });
  return _firebaseDbPromise;
}
