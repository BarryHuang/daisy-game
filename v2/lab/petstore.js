// petstore.js — v2 讀寫倉鼠存檔（petData）
//
// 和 v1 是同一份：Firebase 的 users/<通關密碼>/petData。
//
// ★ 寫入一律用 transaction，不用 v1 那種「改完記憶體再整包 set()」。
//   v1 和 v2 可能同時開著（平板開 v1、手機開 v2），整包 set 會把對方剛寫的
//   東西蓋掉 —— 例如她在 v2 剛收成拿到的金幣，被 v1 存檔時用舊的數字蓋回去。
//   transaction 會拿伺服器上最新的那份來改，改到一半有人寫入就重來。
//
// 三種模式：
//   cloud    有通關密碼、連得上 Firebase —— 正式存檔
//   demo     沒有通關密碼 —— 試玩，存在這台裝置的 localStorage，不碰任何人的存檔
//   offline  有通關密碼但連不上 —— 只能看不能改。存不進去的動作乾脆不給做，
//            不然她以為種下去了，下次打開卻不見
//
// 用法：
//   const store = openPetStore({ onChange(pet, store) { … } });
//   const r = await store.mutate((pet) => farm.plant(pet, i, 'carrot', today, todayStr));
//   // r 是 mutate 裡那個函式的回傳值；r.ok 為 false 時存檔不會被改

const DEMO_KEY = 'daisy2_demo_pet';
const DEMO_DEFAULT = { coins: 120, level: 1, exp: 0, happiness: 50, farm: {} };

function readCode() {
  try { return (localStorage.getItem('daisy_hamster_user') || '').trim(); } catch (e) { return ''; }
}

export function openPetStore({ onChange } = {}) {
  const store = { mode: 'loading', code: readCode(), pet: null, mutate: null };
  const emit = () => { try { onChange && onChange(store.pet, store); } catch (e) { console.error(e); } };

  // ── 試玩 ───────────────────────────────────────────────────────────
  function startDemo() {
    store.mode = 'demo';
    try { store.pet = JSON.parse(localStorage.getItem(DEMO_KEY)) || null; } catch (e) {}
    if (!store.pet) store.pet = JSON.parse(JSON.stringify(DEMO_DEFAULT));
    store.mutate = async (fn) => {
      const draft = JSON.parse(JSON.stringify(store.pet));
      const r = fn(draft) || {};
      if (r.ok) {
        store.pet = draft;
        try { localStorage.setItem(DEMO_KEY, JSON.stringify(draft)); } catch (e) {}
        emit();
      }
      return r;
    };
    emit();
  }

  if (!store.code || typeof getFirebaseDb !== 'function') { startDemo(); return store; }

  // ── 正式存檔 ───────────────────────────────────────────────────────
  store.mutate = async () => ({ ok: false, why: 'loading' });
  getFirebaseDb().then((db) => {
    if (!db) {
      store.mode = 'offline';
      store.mutate = async () => ({ ok: false, why: 'offline' });
      emit();
      return;
    }
    const ref = db.ref('users/' + store.code + '/petData');
    store.mode = 'cloud';
    // v1 改了什麼（或另一台裝置種了菜），這裡馬上看得到
    ref.on('value', (snap) => { store.pet = snap.val(); emit(); });

    store.mutate = (fn) => new Promise((resolve) => {
      let last = { ok: false, why: 'aborted' };
      ref.transaction((cur) => {
        // 第一次呼叫時本機可能還沒有資料（cur 是 null）。原封不動回傳，
        // Firebase 會拿伺服器上的真實資料再呼叫一次
        if (cur === null) return cur;
        last = fn(cur) || { ok: false };
        return last.ok ? cur : undefined;      // undefined = 放棄這次寫入
      }).then(({ committed }) => {
        resolve(committed ? last : Object.assign({}, last, { ok: false }));
      }).catch((e) => {
        console.warn('存檔失敗', e);
        resolve({ ok: false, why: 'error' });
      });
    });
  });
  return store;
}
