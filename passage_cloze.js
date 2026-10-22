// passage_cloze.js — 整段課文挖空，從單字庫裡挑字填進去
//
// 和 cloze_quiz.js 的差別：那個是一題一句、每句三個選項；這個是**一整段文章**
// 挖好幾個洞，下面放一個共用單字庫。難度完全不同 —— 選項從 3 個變成十幾個，
// 而且要讀懂上下文才知道哪個洞該放哪個字。這才是課本上說的「克漏字」。
//
// 操作刻意做成兩段式（先點洞、再點字），不用拖曳：
// 拖曳在手機上很容易失手，而且捲動中的長文章更難拖。
//
// 用法：
//   startPassageCloze({
//     title, subtitle, accent, source,
//     paragraphs: [ 'The cat sat on the {mat} and looked at the {bird}.', ... ],
//     extra: ['feature', 'thick']        // 單字庫裡多放幾個用不到的，增加難度
//   })
// {花括號} 裡的字就是答案，會變成一個洞。
// 答案是變化形時寫成 {divided|divide}：前面是填進去的字，後面是記熟練度用的
// 原形。不分開的話 divided 和 divide 會被當成兩個不同的字，弱字清單就散了。

(function () {
  'use strict';

  var cfg = null, blanks = [], bank = [], submitted = false, active = -1;

  var CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  body { font-family: -apple-system, 'Arial', sans-serif; background: #fff8f0;
         color: #222; padding-bottom: 260px; min-height: 100vh; }
  /* 左邊留 58px 讓開 menu.js 注入的浮動 ☰ */
  .back-link { display: inline-flex; align-items: center; gap: 6px;
               padding: 14px 20px 14px 58px; font-size: 15px;
               color: var(--accent); font-weight: bold; text-decoration: none; }
  #wrap { max-width: 768px; margin: 0 auto; padding: 0 16px 20px; }

  .header-card { background: #fff; border-radius: 16px; padding: 20px; margin-bottom: 14px;
                 box-shadow: 0 2px 12px rgba(0,0,0,.1); border-top: 5px solid var(--accent); }
  .header-card h1 { font-size: 20px; color: var(--accent); margin-bottom: 4px; }
  .header-card .subtitle { font-size: 13px; color: #666; margin-bottom: 14px; }
  .progress-label { display: flex; justify-content: space-between; font-size: 12px;
                    color: #888; font-weight: bold; margin-bottom: 5px; }
  .progress-bar-bg { background: #eee; height: 8px; border-radius: 4px; overflow: hidden; }
  .progress-bar-fill { height: 100%; width: 0; background: var(--accent);
                       border-radius: 4px; transition: width .3s ease; }
  .instr { font-size: 14px; color: #666; margin-bottom: 12px;
           font-style: italic; padding-left: 4px; }

  .passage { background: #fff; border-radius: 16px; padding: 18px 16px;
             box-shadow: 0 1px 6px rgba(0,0,0,.07); font-size: 17px; line-height: 2.5; }
  .passage p { margin-bottom: 14px; }
  .passage p:last-child { margin-bottom: 0; }
  .src { text-align: right; font-size: 11px; color: #aaa; margin-top: 12px; }

  /* 一個洞。空的時候是虛線，選中的時候跳出來，填好之後顯示那個字 */
  .blank {
    display: inline-block; min-width: 92px; padding: 1px 8px; margin: 0 2px;
    border: 0; border-bottom: 3px solid #d7c9b8; border-radius: 5px 5px 0 0;
    background: #faf4ec; font-family: inherit; font-size: 16px; font-weight: 800;
    color: var(--accent); text-align: center; cursor: pointer; vertical-align: baseline;
  }
  .blank .n { font-size: 11px; color: #b0a192; font-weight: 700; margin-right: 3px; }
  .blank.active { border-bottom-color: var(--accent);
                  background: color-mix(in srgb, var(--accent) 16%, transparent);
                  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent); }
  .blank.filled { border-bottom-style: solid; background: #fff; }
  .blank.correct { border-bottom-color: #2e9e5b; background: #e9f8ee; color: #1f7a45; }
  .blank.wrong   { border-bottom-color: #d14343; background: #fdeaea; color: #b53333; }
  .blank .fix { display: block; font-size: 11px; color: #1f7a45; font-weight: 700; }

  /* 單字庫固定在下面，捲動長文章時隨時點得到 */
  #bank-wrap { position: fixed; left: 0; right: 0; bottom: 0; z-index: 10;
               background: rgba(255,248,240,.97); backdrop-filter: blur(6px);
               box-shadow: 0 -2px 10px rgba(0,0,0,.1); padding: 10px 16px 12px; }
  #bank-inner { max-width: 768px; margin: 0 auto; }
  .bank-title { font-size: 12px; color: #888; font-weight: bold; margin-bottom: 7px; }
  /* 十幾個字大概三排。給得下三排的高度，第四排才靠捲動 */
  .bank { display: flex; flex-wrap: wrap; gap: 7px; max-height: 140px;
          overflow-y: auto; -webkit-overflow-scrolling: touch; }
  .word { padding: 7px 13px; border-radius: 999px; border: 2px solid #e8d9c8;
          background: #fff; font-family: inherit; font-size: 15px; font-weight: 700;
          color: #5a3b26; cursor: pointer; }
  .word:active { transform: scale(.95); }
  .word.used { opacity: .32; }
  #submit-btn { display: block; width: 100%; margin-top: 10px; padding: 14px; border: none;
                border-radius: 13px; background: var(--accent); color: #fff;
                font-family: inherit; font-size: 17px; font-weight: bold; cursor: pointer; }
  #submit-btn:disabled { background: #ccc; cursor: not-allowed; }

  #result-screen { display: none; max-width: 768px; margin: 0 auto; padding: 20px 16px; }
  .result-card { background: #fff; border-radius: 18px; padding: 32px 20px; text-align: center;
                 box-shadow: 0 4px 18px rgba(0,0,0,.12); border-top: 6px solid var(--accent); }
  .result-score-big { font-size: 62px; font-weight: bold; color: var(--accent); line-height: 1; }
  .result-out-of { font-size: 14px; color: #999; margin-top: 4px; }
  .result-stars { font-size: 30px; margin: 14px 0 8px; }
  .result-msg { font-size: 18px; font-weight: bold; margin-bottom: 6px; }
  .result-sub { font-size: 14px; color: #777; margin-bottom: 20px; }
  .result-btn { display: block; width: 100%; padding: 13px; margin-top: 9px; border: none;
                border-radius: 12px; font-family: inherit; font-size: 16px;
                font-weight: bold; cursor: pointer; }
  .btn-review { background: var(--accent); color: #fff; }
  .btn-reset  { background: #eee; color: #555; }
  @media (prefers-reduced-motion: reduce) { .progress-bar-fill { transition: none; } }`;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /** 把 "the blue {planet}." 拆成文字和洞 */
  function parse(paragraphs) {
    blanks = [];
    return paragraphs.map(function (p) {
      return '<p>' + p.replace(/\{([^}]+)\}/g, function (_, spec) {
        var bits = spec.split('|');
        var word = bits[0].trim(), lemma = (bits[1] || bits[0]).trim();
        var i = blanks.length;
        blanks.push({ answer: word, lemma: lemma, filled: null });
        return '<button class="blank" type="button" data-b="' + i + '">'
             + '<span class="n">' + (i + 1) + '</span><span class="t">?</span></button>';
      }) + '</p>';
    }).join('');
  }

  function renderShell() {
    var root = document.createElement('div');
    root.innerHTML =
      '<a href="daisy_hamster.html" class="back-link">← 返回主頁</a>'
    + '<div id="wrap">'
    +   '<div class="header-card"><h1>' + esc(cfg.title) + '</h1>'
    +     '<div class="subtitle">' + esc(cfg.subtitle) + '</div>'
    +     '<div class="progress-label"><span id="progress-text"></span>'
    +       '<span id="progress-pct">0%</span></div>'
    +     '<div class="progress-bar-bg"><div class="progress-bar-fill" id="progress-fill"></div></div>'
    +   '</div>'
    +   '<p class="instr">先點一個空格，再從下面的單字庫挑字填進去。點已經填好的格子可以收回來。</p>'
    +   '<div class="passage" id="passage">' + parse(cfg.paragraphs)
    +     '<div class="src">' + esc(cfg.source || '') + '</div></div>'
    + '</div>'
    + '<div id="result-screen"><div class="result-card">'
    +   '<div class="result-score-big" id="score-display">--</div>'
    +   '<div class="result-out-of">/ 100 分</div>'
    +   '<div class="result-stars" id="stars-display">☆☆☆</div>'
    +   '<div class="result-msg" id="result-msg"></div>'
    +   '<div class="result-sub" id="result-sub"></div>'
    +   '<button class="result-btn btn-review" id="btn-review">看哪裡錯了</button>'
    +   '<button class="result-btn btn-reset" id="btn-reset">重新作答</button>'
    + '</div></div>'
    + '<div id="bank-wrap"><div id="bank-inner">'
    +   '<div class="bank-title">單字庫（有幾個是用不到的）</div>'
    +   '<div class="bank" id="bank"></div>'
    +   '<button id="submit-btn" disabled>交卷</button>'
    + '</div></div>';
    document.body.appendChild(root);

    document.getElementById('submit-btn').addEventListener('click', submit);
    document.getElementById('btn-review').addEventListener('click', review);
    document.getElementById('btn-reset').addEventListener('click', reset);
    document.addEventListener('click', onClick);
  }

  function renderBank() {
    document.getElementById('bank').innerHTML = bank.map(function (w, i) {
      var used = blanks.some(function (b) { return b.filled === i; });
      return '<button class="word' + (used ? ' used' : '') + '" type="button" data-w="'
           + i + '">' + esc(w) + '</button>';
    }).join('');
  }

  function paintBlanks() {
    document.querySelectorAll('.blank').forEach(function (el, i) {
      var b = blanks[i];
      el.classList.toggle('active', i === active && !submitted);
      el.classList.toggle('filled', b.filled !== null);
      el.querySelector('.t').textContent = b.filled === null ? '?' : bank[b.filled];
    });
  }

  function updateProgress() {
    var n = blanks.filter(function (b) { return b.filled !== null; }).length;
    var pct = Math.round(n / blanks.length * 100);
    document.getElementById('progress-text').textContent = n + ' / ' + blanks.length + ' 已填';
    document.getElementById('progress-pct').textContent = pct + '%';
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('submit-btn').disabled = n < blanks.length;
  }

  /** 下一個還沒填的洞。填完一個自動跳過去，不用每次都回頭點 */
  function nextEmpty(from) {
    for (var k = 1; k <= blanks.length; k++) {
      var i = (from + k) % blanks.length;
      if (blanks[i].filled === null) return i;
    }
    return -1;
  }

  function onClick(e) {
    if (submitted) return;
    var bl = e.target.closest('.blank');
    if (bl) {
      var i = +bl.dataset.b;
      if (blanks[i].filled !== null) { blanks[i].filled = null; renderBank(); }
      active = i;
      paintBlanks(); updateProgress();
      return;
    }
    var w = e.target.closest('.word');
    if (!w) return;
    var wi = +w.dataset.w;
    if (blanks.some(function (b) { return b.filled === wi; })) return;   // 已經用掉了
    if (active < 0 || blanks[active].filled !== null) active = nextEmpty(active);
    if (active < 0) return;
    blanks[active].filled = wi;
    if (window.snd) window.snd('click', 660, 'sine', .06);
    active = nextEmpty(active);
    renderBank(); paintBlanks(); updateProgress();
  }

  function submit() {
    if (submitted) return;
    submitted = true;
    var right = 0;
    blanks.forEach(function (b) {
      var ok = b.filled !== null && bank[b.filled] === b.answer;
      if (ok) right++;
      if (typeof recordAttempt === 'function') {
        try { recordAttempt(b.lemma, ok, ok ? 0 : 1, 'use'); } catch (e) {}
      }
    });
    var score = Math.round(right / blanks.length * 100);

    document.getElementById('wrap').style.display = 'none';
    document.getElementById('bank-wrap').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('score-display').textContent = score;

    var stars, msg, sub;
    if (score >= 90)      { stars = '⭐⭐⭐'; msg = '太厲害了！'; sub = '整篇課文都讀懂了！'; }
    else if (score >= 70) { stars = '⭐⭐';   msg = '很好，繼續努力！'; sub = '大部分都填對了，看看錯的那幾個。'; }
    else if (score >= 50) { stars = '⭐';     msg = '不錯喔，再加油！'; sub = '回去把課文再讀一次會更順。'; }
    else                  { stars = '💪';     msg = '繼續努力，你可以的！'; sub = '先讀課文再來填，會容易很多。'; }
    document.getElementById('stars-display').textContent = stars;
    document.getElementById('result-msg').textContent = msg;
    document.getElementById('result-sub').textContent = sub;

    if (score >= 70) {
      if (window.snd) window.snd('levelup', 800, 'sine', .3);
      if (typeof confetti === 'function') confetti({ particleCount: 150, spread: 100 });
    } else if (window.snd) { window.snd('pop', 520, 'sine', .12); }
    if (typeof awardCoins === 'function') { try { awardCoins(right); } catch (e) {} }
    window.scrollTo(0, 0);
  }

  function review() {
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('wrap').style.display = 'block';
    document.querySelectorAll('.blank').forEach(function (el, i) {
      var b = blanks[i];
      var ok = b.filled !== null && bank[b.filled] === b.answer;
      el.classList.remove('active');
      el.classList.add(ok ? 'correct' : 'wrong');
      el.querySelector('.t').textContent = b.filled === null ? '（沒填）' : bank[b.filled];
      // 填錯的在下面補一行正解，不用來回翻
      if (!ok) el.insertAdjacentHTML('beforeend',
        '<span class="fix">✓ ' + esc(b.answer) + '</span>');
    });
    window.scrollTo(0, 0);
  }

  function reset() {
    submitted = false; active = -1;
    blanks.forEach(function (b) { b.filled = null; });
    bank = shuffle(blanks.map(function (b) { return b.answer; }).concat(cfg.extra || []));
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('wrap').style.display = 'block';
    document.getElementById('bank-wrap').style.display = '';
    document.querySelectorAll('.blank').forEach(function (el) {
      el.classList.remove('correct', 'wrong', 'filled');
      var fix = el.querySelector('.fix');
      if (fix) fix.remove();
    });
    renderBank(); paintBlanks(); updateProgress();
    window.scrollTo(0, 0);
  }

  window.startPassageCloze = function (options) {
    cfg = options;
    var st = document.createElement('style');
    st.textContent = ':root{--accent:' + (options.accent || '#e65100') + ';}' + CSS;
    document.head.appendChild(st);
    renderShell();
    bank = shuffle(blanks.map(function (b) { return b.answer; }).concat(options.extra || []));
    renderBank(); paintBlanks(); updateProgress();
  };
})();
