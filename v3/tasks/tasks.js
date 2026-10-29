// tasks.js — v3 的「今日任務」（v1 的鮮豔遊戲風）
//
// 每天要練什麼，由 v2 的規劃器排（v2/core/planner.js：看日曆和記憶盒，複習週／新字週／
// 週四聽寫／週五考試日／週末各有不同的排法）。題目也沿用 v2 的 activities.js
// （只記第一次作答、答錯的排到最後再練一次），樣子由 tasks.css 改成 v1 風。
// 這支只管：任務板、過關畫面、寶箱、金幣、連續天數。
//
// 存的地方和 v2 一樣（daisy2_today_<日期>、daisy2_seen），在 v2 做過的不會不見。
// ★ 一天的任務第一次打開就定下來、存起來。練到一半記憶盒會變，重排的話會換一批字。
//
// 要先載入的全域（v3/index.html）：words.js、calendar.js、mastery.js、rewards.js、
// firebase-config.js、zhuyin.js、audio.js

import { planToday } from '../../v2/core/planner.js';
import { runStation } from '../../v2/core/activities.js';
import { zy, meaningOf, exampleOf, say, sfx, unlockAudio, award as payCoins, loginCode } from '../../v2/core/kit.js';
import { clozeOf } from '../../v2/core/cloze.js';
import { todaysWords } from '../../v2/core/shelf.js';
import { sectionById, routeOf } from '../core/nav.js';

// 一關 5 金幣、寶箱 40：整條走完 55–60 枚，比任何一個遊戲都多 ——「做完今日任務」要明顯是賺最多的方式
export const REWARD = { station: 5, chest: 40 };
// 「用今天的字玩」：這 6 個遊戲看得懂 ?set=（wordset.js）
export const SET_GAMES = ['daisy_memory.html', 'daisy_whack.html', 'daisy_claw.html', 'daisy_pusher.html', 'daisy_hangman.html', 'daisy_scramble.html'];

/** 幾顆星：全對 3 顆、六成以上 2 顆，其他 1 顆（做完就有星星，不羞辱） */
export const starsOf = (right, total) => (total && right / total >= 0.9 ? 3 : total && right / total >= 0.6 ? 2 : 1);

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** 這學期到這週為止學過的字 —— 出錯誤選項用 */
function termWords(week) {
  const out = new Set();
  if (week.kind === 'review') reviewScope(week.n).forEach(({ list, key }) => (words[list][key] || []).forEach((w) => out.add(w)));
  else [TERM.lists.fet, TERM.lists.cet].forEach((l) => Object.entries(words[l] || {}).forEach(([k, arr]) => {
    const ns = (k.match(/\d+/g) || []).map(Number);
    if (ns.length && Math.min(...ns) <= Math.max(1, week.n)) arr.forEach((w) => out.add(w));
  }));
  return [...out].filter((w) => meaningOf(w));
}

let booted = null;   // 同一次開 App 只做一次雲端同步

/** 把今日任務畫進 main（v3/index.html 的內容區） */
export async function mount(main) {
  const params = new URLSearchParams(location.search);
  const preview = !!params.get('date');                      // ?date=YYYYMMDD 預覽別天：另存一份、不發金幣
  const ymd = preview ? +params.get('date') : taipeiDay();
  const KEY = (preview ? 'daisy2_preview_' : 'daisy2_today_') + ymd, SEEN = 'daisy2_seen';
  const award = (n) => (preview ? Promise.resolve(false) : payCoins(n));
  const code = loginCode();

  main.innerHTML = `<div class="page-head tasks-head"><span class="em" aria-hidden="true">⭐</span><h1>${zy('今日任務', 'ㄐㄧㄣ ㄖˋ ㄖㄣˋ ㄨˋ')}</h1></div>
    <div class="tasks"><div class="loading-dots" style="font-size:40px;text-align:center;padding:40px">🐹</div></div>`;

  let state = read(KEY, null) || { v: 1, plan: null, done: [], rewarded: [], chest: false };
  const save = () => write(KEY, state);

  if (!state.plan) {
    if (code && !booted) {
      // 換裝置的時候，記憶盒在雲端：先同步再排（最多等 2.5 秒，網路慢就用本機的）
      booted = (async () => {
        await Promise.race([new Promise((r) => syncMastery(() => r())), new Promise((r) => setTimeout(r, 2500))]);
        try {
          const db = await getFirebaseDb();
          if (db) {
            const snap = await Promise.race([db.ref('users/' + code + '/petData/stats/mistakeWords').once('value'), new Promise((r) => setTimeout(() => r(null), 2000))]);
            if (snap && snap.val()) importLegacyMistakes(snap.val());
          }
        } catch (e) {}
      })();
    }
    await booted;
    state = read(KEY, null) || state;     // 等同步的時候，另一個分頁可能已經排好了
    if (!state.plan) {
      const week = currentWeek(ymd);
      state.plan = planToday({
        ymd, week, words, lists: TERM.lists,
        scope: week.kind === 'review' ? reviewScope(week.n) : null,
        mastery: readMastery(), seen: read(SEEN, {}),
        hasMeaning: (w) => !!meaningOf(w),
        canCloze: (w) => !!clozeOf(w, exampleOf(w)),
      });
      save();
    }
  }
  if (!main.isConnected) return;
  const distractors = termWords(currentWeek(ymd));
  // 只留最近兩週的紀錄
  try {
    Object.keys(localStorage).filter((k) => (k.startsWith('daisy2_today_') && +k.slice(13) < addDays(ymd, -14))
      || (k.startsWith('daisy2_preview_') && k !== KEY)).forEach((k) => localStorage.removeItem(k));
  } catch (e) {}

  const stations = () => state.plan.stations;
  const firstUndone = () => { const i = stations().findIndex((s) => s.type !== 'chest' && !state.done.includes(s.id)); return i < 0 ? stations().length - 1 : i; };
  const stateOf = (i) => {
    const s = stations()[i], now = firstUndone();
    if (s.type === 'chest') return state.chest ? 'done' : (i === now ? 'now' : 'later');
    return state.done.includes(s.id) ? 'done' : (i === now ? 'now' : 'later');
  };
  function streakDays() {
    let n = 0, d = ymd;
    for (; n < 365; n++) { const st = read('daisy2_today_' + d, null); if (!st || !st.chest) break; d = addDays(d, -1); }
    return n;
  }

  // ── 任務板 ──────────────────────────────────────────────────────────
  function board() {
    if (!main.isConnected) return;
    const p = state.plan, list = stations();
    const work = list.filter((s) => s.type !== 'chest');
    const doneN = work.filter((s) => state.done.includes(s.id)).length;
    const games = sectionById('games');
    const tw = todaysWords(p);
    const n = streakDays();
    const goLabel = (st, s) => st === 'done' ? zy('完成', 'ㄨㄢˊ ㄔㄥˊ')
      : st === 'now' ? (s.type === 'chest' ? zy('打開', 'ㄉㄚˇ ㄎㄞ') : zy('開始', 'ㄎㄞ ㄕˇ') + ' ▶')
      : zy('等一下', 'ㄉㄥˇ ㄧ ㄒㄧㄚˋ');
    main.innerHTML = `
      <div class="page-head tasks-head"><span class="em" aria-hidden="true">⭐</span><h1>${zy('今日任務', 'ㄐㄧㄣ ㄖˋ ㄖㄣˋ ㄨˋ')}</h1>
        <button class="headline" data-say="${esc('今天是' + p.headline.map((h) => h.zh).join('，') + '。今天有' + work.length + '個任務，做完可以開寶箱。')}">
          ${p.headline.map((h) => `<span>${zy(h.zh, h.zy)}</span>`).join('<span class="dot">·</span>')} <span aria-hidden="true">🔊</span></button>
        ${n >= 2 ? `<span class="streak">🔥 ${zy('連續', 'ㄌㄧㄢˊ ㄒㄩˋ')} ${n} ${zy('天', 'ㄊㄧㄢ')}</span>` : ''}
        ${preview ? `<span class="badge">預覽 ${ymd}・不發金幣</span>` : ''}
      </div>
      <div class="tasks"><div class="tasks-in">
        <div class="meter"><img src="../v2/art/hamster.svg" alt="">
          <div class="bar"><i style="--p:${Math.round(doneN / Math.max(1, work.length) * 100)}%"></i></div>
          <span class="num">${doneN} / ${work.length}</span></div>
        <div class="missions">${list.map((s, i) => {
          const st = stateOf(i), chest = s.type === 'chest';
          return `<button class="mission ${st} ${chest ? 'chest' : ''} c-${s.color}" data-i="${i}">
            ${chest ? '' : `<span class="badge-n">${i + 1}</span>`}
            <span class="ball"><span class="em" aria-hidden="true">${s.em}</span></span>
            <span class="txt"><span class="zh">${zy(s.name, s.zy)}</span>
              <span class="sub">${chest ? '+' + REWARD.chest + ' 🪙' : s.words.length + ' 個字 · +' + REWARD.station + ' 🪙'}</span></span>
            <span class="go">${goLabel(st, s)}</span>
          </button>`;
        }).join('')}</div>
        ${tw.length ? `<div class="section-title"><span aria-hidden="true">🎮</span>${zy('用今天的字玩', 'ㄩㄥˋ ㄐㄧㄣ ㄊㄧㄢ ㄉㄜ˙ ㄗˋ ㄨㄢˊ')}
            <button class="say-btn" data-say="用今天練的字玩遊戲。" aria-label="唸出來">🔊</button></div>
          <div class="games-row">${games.items.filter((it) => SET_GAMES.includes(it.page)).map((it) => `
            <a href="${routeOf(games, { page: it.page + '?set=' + tw.map(encodeURIComponent).join(',') })}">
              <span class="em" aria-hidden="true">${it.em}</span><span>${zy(it.name, it.zy)}</span></a>`).join('')}</div>` : ''}
      </div></div>`;
    main.querySelector('.missions').onclick = (e) => {
      const b = e.target.closest('.mission'); if (!b) return;
      const i = +b.dataset.i, s = stations()[i], st = stateOf(i);
      if (st === 'later') {
        sfx('bump'); b.classList.remove('nudge'); void b.offsetWidth; b.classList.add('nudge');
        say('先完成前面的任務喔。'); return;
      }
      if (s.type === 'chest') return chest();
      play(s);
    };
  }

  // ── 一關 ────────────────────────────────────────────────────────────
  async function play(s) {
    unlockAudio();
    main.innerHTML = '<div id="task-play"></div>';
    const res = await runStation(main.querySelector('#task-play'), s, {
      distractors,
      record: (w, ok, errs, skill) => { try { recordAttempt(w, ok, errs, skill); } catch (e) { console.warn(e); } },
      markSeen: (w) => { const m = read(SEEN, {}); m[w.toLowerCase()] = ymd; write(SEEN, m); },
    });
    if (!main.isConnected) return;
    if (res.aborted) return board();
    const first = !state.done.includes(s.id);
    if (first) { state.done.push(s.id); save(); }
    // 一關的金幣一天只發一次（重玩已經過的關卡不再發）
    let paid = false;
    if (first && !state.rewarded.includes(s.id)) { state.rewarded.push(s.id); save(); paid = await award(REWARD.station); }
    const stars = s.type === 'card' ? 3 : starsOf(res.right, res.total);
    main.innerHTML = `<div class="celebrate">
      <div class="stars">${[1, 2, 3].map((k) => `<span class="${k > stars ? 'off' : ''}">⭐</span>`).join('')}</div>
      <h2>${stars === 3 ? zy('太棒了', 'ㄊㄞˋ ㄅㄤˋ ㄌㄜ˙') : zy('完成了', 'ㄨㄢˊ ㄔㄥˊ ㄌㄜ˙')}</h2>
      ${s.type !== 'card' ? `<div class="score">${res.right} / ${res.total}</div>` : ''}
      ${paid ? `<div class="coin">+${REWARD.station} 🪙</div>` : ''}
    </div>`;
    sfx('levelup');
    say(stars === 3 ? '太棒了！' : '完成了！');
    setTimeout(() => { if (main.querySelector('.celebrate')) board(); }, 1900);
  }

  // ── 寶箱 ────────────────────────────────────────────────────────────
  function chest() {
    const tw = todaysWords(state.plan);
    const after = () => {
      const n = streakDays();
      main.querySelector('.celebrate').insertAdjacentHTML('beforeend', `
        ${n >= 2 ? `<div class="streak">🔥 ${zy('連續', 'ㄌㄧㄢˊ ㄒㄩˋ')} ${n} ${zy('天', 'ㄊㄧㄢ')}</div>` : ''}
        <div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-top:8px">
          <a class="big-btn" href="#world"><span aria-hidden="true">🐹</span>${zy('去找倉鼠玩', 'ㄑㄩˋ ㄓㄠˇ ㄘㄤ ㄕㄨˇ ㄨㄢˊ')}</a>
          ${tw.length && !preview ? `<a class="big-btn alt" href="#games/daisy_memory.html?set=${tw.map(encodeURIComponent).join(',')}"><span aria-hidden="true">🎮</span>${zy('用今天的字玩', 'ㄩㄥˋ ㄐㄧㄣ ㄊㄧㄢ ㄉㄜ˙ ㄗˋ ㄨㄢˊ')}</a>` : ''}
          <button class="big-btn" data-back style="background:#fff;color:var(--grape);box-shadow:var(--shadow)">${zy('回任務板', 'ㄏㄨㄟˊ ㄖㄣˋ ㄨˋ ㄅㄢˇ')}</button>
        </div>`);
      main.querySelector('[data-back]').onclick = board;
    };
    main.innerHTML = `<div class="celebrate">
      <h2>${zy(state.chest ? '今天完成了' : '打開寶箱', state.chest ? 'ㄐㄧㄣ ㄊㄧㄢ ㄨㄢˊ ㄔㄥˊ ㄌㄜ˙' : 'ㄉㄚˇ ㄎㄞ ㄅㄠˇ ㄒㄧㄤ')}</h2>
      <button class="big-chest ${state.chest ? 'opened' : ''}" aria-label="打開寶箱">${state.chest ? '✨' : '🎁'}</button>
      <div class="coin" id="reward"></div>
    </div>`;
    if (state.chest) return after();
    const btn = main.querySelector('.big-chest');
    btn.onclick = async () => {
      if (state.chest) return;
      state.chest = true; save();
      btn.classList.add('opened'); btn.textContent = '✨'; sfx('levelup');
      const r = btn.getBoundingClientRect();
      for (let k = 0; k < 14; k++) {
        const c = document.createElement('span'); c.className = 'fly-coin'; c.textContent = '🪙';
        c.style.left = (r.left + r.width / 2) + 'px'; c.style.top = (r.top + r.height / 2) + 'px';
        c.style.setProperty('--dx', (Math.random() * 300 - 150) + 'px'); c.style.setProperty('--dy', (-80 - Math.random() * 160) + 'px');
        c.style.setProperty('--r', (Math.random() * 360) + 'deg'); c.style.animationDelay = (k * 40) + 'ms';
        document.body.appendChild(c); setTimeout(() => c.remove(), 1700);
      }
      const paid = await award(REWARD.chest);
      const rw = main.querySelector('#reward'); if (rw) rw.textContent = paid ? '+' + REWARD.chest + ' 🪙' : '';
      const h = main.querySelector('.celebrate h2'); if (h) h.innerHTML = zy('今天完成了', 'ㄐㄧㄣ ㄊㄧㄢ ㄨㄢˊ ㄔㄥˊ ㄌㄜ˙');
      say(paid ? '拿到' + REWARD.chest + '個金幣！' : '今天完成了！');
      setTimeout(() => { if (main.querySelector('.celebrate')) after(); }, 1000);
    };
  }

  board();
  window.v3tasks = { state, ymd, play, chest };   // 給測試用
}
