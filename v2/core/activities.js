// activities.js — 小徑上的每一關：看新字、聽一聽、選意思、拼拼看（含小考）
//
//   runStation(host, station, ctx) → Promise<{ aborted, right, total }>
//
// ctx：
//   record(word, correct, errors, skill)   記進熟練度（mastery.js 的 recordAttempt）
//   markSeen(word)                          看過新字卡
//   distractors                             出錯誤選項用的字（同一個範圍的字）
//
// ★ 熟練度只記「第一次」作答。答錯的字會排到這一關最後再出一次，讓她再練一遍，
//   但第二次不記 —— 看過答案之後再答對，不能算她會了，不然記憶盒會被灌水。

import { $, $$, zy, meaningOf, meaningHTML, emojiOf, exampleOf, say, speakEn, sfx, shuffle } from './kit.js';

const HELP = {
  card:  '看新字。聽一聽，看一看，記住它。',
  hear:  '聽一聽。聽英文，選出你聽到的字。',
  see:   '選意思。這個英文是什麼意思？',
  spell: '拼拼看。聽英文，把它拼出來。',
  test:  '小考。只聽聲音，把字拼出來。',
};

export function runStation(host, station, ctx) {
  return new Promise((resolve) => {
    const queue = station.words.map((w) => ({ w, retry: false }));
    const total = station.words.length;
    let answered = 0, right = 0, finished = false;

    host.className = 'screen on c-' + station.color;
    host.innerHTML = `
      <div class="topbar">
        <button class="icon-btn sketch" data-x aria-label="回到小徑">✕</button>
        <div class="progress sketch"><i class="hatch"></i></div>
        <button class="icon-btn sketch" data-help aria-label="說明">🔊</button>
      </div>
      <div class="stage" data-stage></div>`;
    const stage = $('[data-stage]', host), bar = $('.progress i', host);
    $('[data-x]', host).onclick = () => { finished = true; window.speechSynthesis && window.speechSynthesis.cancel(); resolve({ aborted: true, right, total }); };
    $('[data-help]', host).onclick = () => say(HELP[station.type]);
    const setBar = () => { bar.style.setProperty('--p', Math.round(answered / Math.max(1, total) * 100) + '%'); };
    setBar();

    /** 一題答完。correct = 這次對不對；errors = 拼字按錯幾次 */
    function answer(item, correct, errors) {
      if (!item.retry) {
        answered++;
        if (correct) right++;
        if (station.skill) ctx.record(item.w, correct, errors || 0, station.skill);
        if (!correct) queue.push({ w: item.w, retry: true });   // 最後再練一次，但不再記
        setBar();
      }
    }
    function next(first) {
      if (finished) return;
      const kb = $('.keyboard', host); if (kb) kb.remove();
      if (!queue.length) { finished = true; return resolve({ aborted: false, right, total }); }
      const item = queue.shift();
      RENDER[station.type](item, first);
    }

    // ── 看新字 ──────────────────────────────────────────────────────────
    function card(item, first) {
      const w = item.w, ex = exampleOf(w);
      const exHTML = ex ? ex.replace(new RegExp('\\b(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w*)', 'i'), '<b>$1</b>') : '';
      stage.innerHTML = `
        <div class="prompt card sketch">
          <div class="pic">${emojiOf(w)}</div>
          <div class="row"><span class="word">${w}</span><button class="icon-btn sketch" data-say-en="${w}" aria-label="唸 ${w}">🔊</button></div>
          <div class="meaning zh">${meaningHTML(w)}</div>
          ${ex ? `<div class="example"><span>${exHTML}</span><button class="icon-btn sketch" data-say-en="${ex.replace(/"/g, '&quot;')}" aria-label="唸例句">🔊</button></div>` : ''}
        </div>
        <button class="btn wide sketch hatch" style="max-width:600px" data-next>${zy('下一個', 'ㄒㄧㄚˋ ㄧ ㄍㄜ˙')} <span aria-hidden="true">→</span></button>`;
      speakEn(w);
      ctx.markSeen(w);
      $('[data-next]', stage).onclick = () => { sfx('whoosh'); next(); };
      answered++; setBar();
    }

    // ── 選項題（聽一聽、選意思）────────────────────────────────────────
    function options(item, mode) {
      const w = item.w, lw = w.toLowerCase();
      const pool = shuffle(ctx.distractors.filter((d) => d.toLowerCase() !== lw));
      let wrong;
      if (mode === 'see') {
        const zh = meaningOf(w).zh, seen = new Set([zh]);
        wrong = pool.filter((d) => { const m = meaningOf(d); if (!m || seen.has(m.zh)) return false; seen.add(m.zh); return true; }).slice(0, 2);
      } else {
        // 聽一聽：挑長度接近的字當誘答，不然一聽就知道是短的那個
        wrong = pool.filter((d) => Math.abs(d.length - w.length) <= 3).slice(0, 2);
        if (wrong.length < 2) wrong = wrong.concat(pool.filter((d) => !wrong.includes(d)).slice(0, 2 - wrong.length));
      }
      const opts = shuffle([w, ...wrong]);
      stage.innerHTML = mode === 'see'
        ? `<div class="prompt card sketch"><div class="row"><span class="word">${w}</span>
             <button class="icon-btn sketch" data-say-en="${w}" aria-label="再唸一次">🔊</button></div></div>
           <div class="options">${opts.map((o) => `<button class="opt sketch zh" data-o="${o}">${meaningHTML(o)}</button>`).join('')}</div>`
        : `<button class="big-ear sketch hatch" data-say-en="${w}" aria-label="再聽一次">🔊</button>
           <div class="zh" style="font-size:20px;color:var(--ink-2)">${zy('再聽一次', 'ㄗㄞˋ ㄊㄧㄥ ㄧ ㄘˋ')}</div>
           <div class="options">${opts.map((o) => `<button class="opt en sketch" data-o="${o}">${o}</button>`).join('')}</div>`;
      speakEn(w);
      let done = false;
      $$('.opt', stage).forEach((b) => b.onclick = () => {
        if (done) return; done = true;
        const ok = b.dataset.o === w;
        answer(item, ok, 0);
        const rightBtn = $$('.opt', stage).find((x) => x.dataset.o === w);
        rightBtn.classList.add('right');
        $$('.opt', stage).forEach((x) => { if (x !== rightBtn && x !== b) x.classList.add('fade'); });
        if (ok) { sfx('success'); setTimeout(next, 800); }
        else {
          // 答錯不羞辱：選錯的輕輕搖、變淡；把對的圈起來、再唸一次
          b.classList.add('wrong'); sfx('bump');
          setTimeout(() => speakEn(w), 250);
          setTimeout(next, 1900);
        }
      });
    }

    // ── 拼拼看（小考 = 只有聲音，沒有圖和中文）──────────────────────────
    function spell(item) {
      const w = item.w, dict = !!station.dictation;
      const chars = [...w];
      const isLetter = (c) => /[A-Za-z]/.test(c);
      let idx = 0, misses = 0, errs = 0;   // misses：這一格錯幾次（提示用）；errs：這個字總共錯幾次
      stage.innerHTML = (dict
        ? `<button class="big-ear sketch hatch" data-say-en="${w}" aria-label="再聽一次">🔊</button>
           <div class="zh" style="font-size:22px">${zy('聽寫', 'ㄊㄧㄥ ㄒㄧㄝˇ')}</div>`
        : `<div class="prompt card sketch" style="flex-direction:row;justify-content:center">
             <div class="pic" style="width:96px;height:96px;font-size:54px">${emojiOf(w)}</div>
             <div class="meaning zh" style="font-size:clamp(34px,9vw,48px)">${meaningHTML(w)}</div>
             <button class="icon-btn sketch" data-say-en="${w}" aria-label="唸 ${w}">🔊</button>
           </div>`)
        + `<div class="slots">${chars.map((c) => isLetter(c) ? '<div class="slot"></div>' : `<div class="slot gap">${c === ' ' ? '' : c}</div>`).join('')}</div>
           <div class="praise" aria-live="polite"></div>`;
      const kb = document.createElement('div');
      kb.className = 'keyboard';
      kb.innerHTML = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].map((r) =>
        `<div class="krow">${[...r].map((c) => `<button class="key" data-k="${c}">${c}</button>`).join('')}</div>`).join('');
      host.appendChild(kb);
      const slots = $$('.slot', stage);
      // 空白和連字號自動填好、跳過：她只要拼字母
      const skip = () => { while (idx < chars.length && !isLetter(chars[idx])) idx++; slots.forEach((s, i) => s.classList.toggle('cur', i === idx)); };
      skip();
      speakEn(w);
      kb.addEventListener('click', (e) => {
        const k = e.target.closest('.key'); if (!k || idx >= chars.length) return;
        if (k.dataset.k === chars[idx].toLowerCase()) {
          sfx('pop');
          $$('.key', kb).forEach((x) => x.classList.remove('hint'));
          slots[idx].textContent = chars[idx]; slots[idx].classList.add('filled');
          idx++; misses = 0; skip();
          if (idx >= chars.length) {
            $('.slots', stage).classList.add('win'); sfx('success');
            $('.praise', stage).innerHTML = '✨ ' + zy('拼對了', 'ㄆㄧㄣ ㄉㄨㄟˋ ㄌㄜ˙') + ' ✨';
            // 按錯兩次以上不算會（和 mastery.js 的容錯一致），最後再練一次
            answer(item, errs <= 1, errs);
            setTimeout(() => speakEn(w), 200);
            setTimeout(next, 1400);
          }
        } else {
          // 答錯不羞辱：不變紅，只輕輕搖一下；同一格錯兩次，正確的鍵亮起來
          sfx('bump'); errs++;
          k.classList.remove('nope'); void k.offsetWidth; k.classList.add('nope');
          if (++misses >= 2) { const h = $(`.key[data-k="${chars[idx].toLowerCase()}"]`, kb); h && h.classList.add('hint'); }
        }
      });
    }

    const RENDER = { card, hear: (i) => options(i, 'hear'), see: (i) => options(i, 'see'), spell, test: spell };
    // 用 onclick 指定、不用 addEventListener：host 每一關都重用，addEventListener 會
    // 一關疊一個，玩到第三關點一下 🔊 會連唸三次
    host.onclick = (e) => { const s = e.target.closest('[data-say-en]'); if (s) speakEn(s.dataset.sayEn); };
    next(true);
  });
}
