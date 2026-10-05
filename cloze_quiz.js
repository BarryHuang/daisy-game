// cloze_quiz.js — 選擇填空測驗引擎，各週測驗頁共用
//
// 為什麼要抽出來：每張測驗卷的差別只有題目，版面和計分邏輯完全一樣。
// 三份各複製一次等於三份要一起改，而她的測驗卷會一直增加。
//
// 用法：頁面只要放一個 <div id="quiz"></div>，然後
//   startClozeQuiz({ title, subtitle, accent, questions })
//
// 每一題：
//   { sentence: 'Did you ___ the new bird?',   // ___ 就是要填的空格
//     answer: 'notice',
//     wrong: ['explain', 'collect'],
//     source: 'CET Wk 4' }

(function () {
  'use strict';

  var BLANK = '___';
  var cfg = null, questions = [], answers = {}, submitted = false;

  // ──────────────────────────────────────────────────────────────
  // 版面。沿用單字測驗卷那張考卷的樣子，只有主色由各頁自己決定，
  // 三份卷子才分得出來是哪一週。
  // ──────────────────────────────────────────────────────────────
  var CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  body { font-family: -apple-system, 'Arial', sans-serif; background: #fff8f0;
         color: #222; padding-bottom: 110px; min-height: 100vh; }
  /* 左邊留 58px：menu.js 會在左上角注入一顆浮動的 ☰，不讓開就會疊在一起 */
  .back-link { display: inline-flex; align-items: center; gap: 6px;
               padding: 14px 20px 14px 58px;
               font-size: 15px; color: var(--accent); font-weight: bold; text-decoration: none; }
  .back-link:active { opacity: .6; }
  #quiz-wrap { max-width: 768px; margin: 0 auto; padding: 0 16px 20px; }

  .header-card { background: #fff; border-radius: 16px; padding: 20px; margin-bottom: 16px;
                 box-shadow: 0 2px 12px rgba(0,0,0,.1); border-top: 5px solid var(--accent); }
  .header-card h1 { font-size: 20px; color: var(--accent); letter-spacing: 1px; margin-bottom: 4px; }
  .header-card .subtitle { font-size: 13px; color: #666; margin-bottom: 14px; }
  .info-row { display: flex; gap: 12px; margin-bottom: 14px; }
  .info-field { flex: 1; display: flex; align-items: center; gap: 6px; }
  .info-field label { font-size: 13px; color: #888; font-weight: bold; }
  .info-field input { flex: 1; min-width: 0; border: none; border-bottom: 2px dotted #ccc;
                      background: transparent; font-family: inherit; font-size: 14px; padding: 4px 2px; }
  .info-field input:focus { outline: none; border-bottom-color: var(--accent); }

  .progress-label { display: flex; justify-content: space-between; font-size: 12px;
                    color: #888; font-weight: bold; margin-bottom: 5px; }
  .progress-bar-bg { background: #eee; height: 8px; border-radius: 4px; overflow: hidden; }
  .progress-bar-fill { height: 100%; width: 0; background: var(--accent);
                       border-radius: 4px; transition: width .3s ease; }

  .instr { font-size: 14px; color: #666; margin-bottom: 12px; font-style: italic; padding-left: 4px; }

  .q-card { background: #fff; border-radius: 14px; padding: 16px; margin-bottom: 12px;
            box-shadow: 0 1px 6px rgba(0,0,0,.07); }
  .q-num-row { display: flex; gap: 10px; margin-bottom: 4px; }
  .q-num-badge { flex: none; width: 26px; height: 26px; border-radius: 50%; background: var(--accent);
                 color: #fff; font-size: 13px; font-weight: bold; display: flex;
                 align-items: center; justify-content: center; }
  .q-sentence { font-size: 17px; line-height: 1.65; flex: 1; }
  /* 空格要一眼看得出來是「這裡要填」，所以給底線和淡色塊 */
  .q-blank { display: inline-block; min-width: 86px; border-bottom: 3px solid var(--accent);
             background: color-mix(in srgb, var(--accent) 10%, transparent);
             border-radius: 4px 4px 0 0; text-align: center; font-weight: bold;
             color: var(--accent); padding: 0 6px; }
  .q-meta { margin: 8px 0 10px 36px; display: flex; align-items: center; gap: 8px; }
  .q-source-tag { font-size: 11px; color: #aaa; background: #f3f3f3;
                  border-radius: 999px; padding: 2px 8px; }
  .q-speak { border: none; background: #f3f3f3; border-radius: 999px; cursor: pointer;
             font-size: 13px; padding: 3px 10px; font-family: inherit; color: #666; }
  .q-speak:active { transform: scale(.94); }

  .options-wrap { display: flex; flex-direction: column; gap: 8px; }
  .opt-btn { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left;
             padding: 11px 13px; border: 2px solid #e8e8e8; border-radius: 11px; background: #fff;
             font-family: inherit; font-size: 16px; cursor: pointer; color: #222;
             transition: border-color .15s ease, background .15s ease; }
  .opt-btn:active { transform: scale(.985); }
  .opt-letter { flex: none; width: 23px; height: 23px; border-radius: 50%; background: #eee;
                color: #888; font-size: 12px; font-weight: bold; display: flex;
                align-items: center; justify-content: center; }
  .opt-btn.selected { border-color: var(--accent);
                      background: color-mix(in srgb, var(--accent) 9%, transparent); }
  .opt-btn.selected .opt-letter { background: var(--accent); color: #fff; }
  .opt-btn.correct      { border-color: #2e9e5b; background: #e9f8ee; }
  .opt-btn.show-correct { border-color: #2e9e5b; background: #e9f8ee; }
  .opt-btn.wrong        { border-color: #d14343; background: #fdeaea; }

  .feedback-tag { display: inline-block; margin-top: 9px; font-size: 13px;
                  font-weight: bold; border-radius: 999px; padding: 4px 11px; }
  .correct-tag { background: #e9f8ee; color: #1f7a45; }
  .wrong-tag   { background: #fdeaea; color: #b53333; }

  #submit-area { position: fixed; left: 0; right: 0; bottom: 0; padding: 12px 16px;
                 background: rgba(255,248,240,.96); backdrop-filter: blur(6px);
                 box-shadow: 0 -2px 10px rgba(0,0,0,.08); }
  #submit-btn { display: block; width: 100%; max-width: 768px; margin: 0 auto; padding: 15px;
                border: none; border-radius: 13px; background: var(--accent); color: #fff;
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

  @media (prefers-reduced-motion: reduce) {
    .progress-bar-fill { transition: none; }
  }`;

  function injectCss(accent) {
    var s = document.createElement('style');
    s.textContent = ':root{--accent:' + accent + ';}' + CSS;
    document.head.appendChild(s);
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // 唸句子。跟倉鼠頁同一套：iOS 直接用系統語音（非同步的 .catch 會失去使用者
  // 手勢權限），其他裝置用 Google TTS，失敗再退回系統語音。
  function speak(text) {
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
             || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var native = function () {
      try {
        if (!('speechSynthesis' in window)) return;
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US'; u.rate = 0.85;
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
      } catch (e) { /* 唸不出來就算了，不要擋住作答 */ }
    };
    if (window.daisyAudio) window.daisyAudio.duck(1600);
    if (isIOS) return native();
    try {
      var url = 'https://translate.googleapis.com/translate_tts?ie=UTF-8&q='
              + encodeURIComponent(text) + '&tl=en&client=tw-ob';
      new Audio(url).play().catch(native);
    } catch (e) { native(); }
  }

  /** 把句子裡的 ___ 換成空格，或換成某個字 */
  function fill(sentence, word) {
    return esc(sentence).split(BLANK).join(
      word ? word : '<span class="q-blank">?</span>');
  }

  function build() {
    return cfg.questions.map(function (q) {
      return {
        sentence: q.sentence, answer: q.answer,
        source: q.source, options: shuffle([q.answer].concat(q.wrong))
      };
    });
  }

  // ──────────────────────────────────────────────────────────────
  // 畫面
  // ──────────────────────────────────────────────────────────────
  function renderShell() {
    // 不能用 document.body.innerHTML = ...：那會把頁尾的 <script src="menu.js">
    // 一起洗掉，選單和音效就沒了。附加一個容器進去就好。
    var root = document.createElement('div');
    root.innerHTML =
      '<a href="daisy_hamster.html" class="back-link">← 返回主頁</a>'
    + '<div id="quiz-wrap">'
    +   '<div class="header-card">'
    +     '<h1>' + esc(cfg.title) + '</h1>'
    +     '<div class="subtitle">' + esc(cfg.subtitle) + '</div>'
    +     '<div class="info-row">'
    +       '<div class="info-field"><label>Name:</label>'
    +         '<input type="text" id="student-name" value="Daisy"></div>'
    +       '<div class="info-field"><label>Date:</label>'
    +         '<input type="text" id="student-date"></div>'
    +     '</div>'
    +     '<div class="progress-label"><span id="progress-text"></span>'
    +       '<span id="progress-pct">0%</span></div>'
    +     '<div class="progress-bar-bg"><div class="progress-bar-fill" id="progress-fill"></div></div>'
    +   '</div>'
    +   '<p class="instr">每題選一個字填進空格。共 ' + cfg.questions.length + ' 題，每題 '
    +     (100 / cfg.questions.length).toFixed(0) + ' 分。</p>'
    +   '<div id="questions-container"></div>'
    + '</div>'
    + '<div id="result-screen"><div class="result-card">'
    +   '<div class="result-score-big" id="score-display">--</div>'
    +   '<div class="result-out-of">/ 100 分</div>'
    +   '<div class="result-stars" id="stars-display">☆☆☆</div>'
    +   '<div class="result-msg" id="result-msg"></div>'
    +   '<div class="result-sub" id="result-sub"></div>'
    +   '<button class="result-btn btn-review" id="btn-review">查看詳解</button>'
    +   '<button class="result-btn btn-reset" id="btn-reset">重新作答</button>'
    + '</div></div>'
    + '<div id="submit-area"><button id="submit-btn" disabled>交卷</button></div>';
    document.body.appendChild(root);

    document.getElementById('submit-btn').addEventListener('click', submit);
    document.getElementById('btn-review').addEventListener('click', review);
    document.getElementById('btn-reset').addEventListener('click', reset);

    var d = new Date();
    document.getElementById('student-date').value = d.getFullYear() + '-'
      + String(d.getMonth() + 1).padStart(2, '0') + '-'
      + String(d.getDate()).padStart(2, '0');
  }

  function renderQuestions() {
    var box = document.getElementById('questions-container');
    box.innerHTML = '';
    var letters = ['A', 'B', 'C', 'D'];

    questions.forEach(function (q, i) {
      var card = document.createElement('div');
      card.className = 'q-card';
      card.innerHTML =
        '<div class="q-num-row"><span class="q-num-badge">' + (i + 1) + '</span>'
      +   '<span class="q-sentence">' + fill(q.sentence) + '</span></div>'
      + '<div class="q-meta"><button class="q-speak" type="button" data-i="' + i + '">🔊 唸一次</button>'
      +   '<span class="q-source-tag">' + esc(q.source) + '</span></div>'
      + '<div class="options-wrap">'
      +   q.options.map(function (o, k) {
            return '<button class="opt-btn" type="button" data-i="' + i + '" data-v="' + esc(o) + '">'
                 + '<span class="opt-letter">' + letters[k] + '</span><span>' + esc(o) + '</span></button>';
          }).join('')
      + '</div><div class="feedback" id="fb_' + i + '"></div>';
      box.appendChild(card);
    });

    // 綁在容器上並且只綁一次 —— renderQuestions 每次「重新作答」都會跑，
    // 每次都綁的話一個點擊會觸發好幾次
    if (!box.dataset.bound) {
      box.dataset.bound = '1';
      box.addEventListener('click', onClick);
    }
  }

  function onClick(e) {
    var speakBtn = e.target.closest('.q-speak');
    if (speakBtn) {
      var q = questions[+speakBtn.dataset.i];
      // 作答前唸完整句子會直接把答案講出來，所以空格先唸成 "blank"
      speak(q.sentence.split(BLANK).join(submitted ? ' ' + q.answer + ' ' : ' blank '));
      return;
    }
    var opt = e.target.closest('.opt-btn');
    if (!opt || submitted) return;
    select(+opt.dataset.i, opt.dataset.v);
  }

  function select(i, value) {
    answers[i] = value;
    if (window.snd) window.snd('click', 660, 'sine', .06);
    var card = document.querySelectorAll('.q-card')[i];
    card.querySelectorAll('.opt-btn').forEach(function (b) {
      b.classList.toggle('selected', b.dataset.v === value);
    });
    updateProgress();
  }

  function updateProgress() {
    var n = Object.keys(answers).length, total = questions.length;
    var pct = Math.round(n / total * 100);
    document.getElementById('progress-text').textContent = n + ' / ' + total + ' 已作答';
    document.getElementById('progress-pct').textContent = pct + '%';
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('submit-btn').disabled = n < total;
  }

  function submit() {
    if (submitted) return;
    submitted = true;

    var right = 0;
    questions.forEach(function (q, i) {
      var ok = answers[i] === q.answer;
      if (ok) right++;
      // 餵給熟練度系統：倉鼠的書櫃和幾個遊戲都會optionally拿弱字當題庫
      if (typeof recordAttempt === 'function') {
        try { recordAttempt(q.answer, ok, ok ? 0 : 1); } catch (e) {}
      }
    });
    var score = Math.round(right / questions.length * 100);

    document.getElementById('quiz-wrap').style.display = 'none';
    document.getElementById('submit-area').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('score-display').textContent = score;

    var stars, msg, sub;
    if (score >= 90)      { stars = '⭐⭐⭐'; msg = '太厲害了！'; sub = '這一週的單字都掌握得很好！'; }
    else if (score >= 70) { stars = '⭐⭐';   msg = '很好，繼續努力！'; sub = '大部分都答對了，再複習一下錯的吧！'; }
    else if (score >= 50) { stars = '⭐';     msg = '不錯喔，再加油！'; sub = '還有一些單字要練習，不要放棄！'; }
    else                  { stars = '💪';     msg = '繼續努力，你可以的！'; sub = '多複習幾次，下次一定會更好！'; }
    document.getElementById('stars-display').textContent = stars;
    document.getElementById('result-msg').textContent = msg;
    document.getElementById('result-sub').textContent = sub;

    if (score >= 70) {
      if (window.snd) window.snd('levelup', 800, 'sine', .3);
      if (typeof confetti === 'function') confetti({ particleCount: 150, spread: 100 });
    } else if (window.snd) {
      window.snd('pop', 520, 'sine', .12);
    }

    // 答對的題目換成金幣。跟其他遊戲同一套 awardCoins()
    if (typeof awardCoins === 'function') {
      try { awardCoins(right); } catch (e) {}
    }
    window.scrollTo(0, 0);
  }

  function review() {
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('quiz-wrap').style.display = 'block';

    questions.forEach(function (q, i) {
      var card = document.querySelectorAll('.q-card')[i];
      var chosen = answers[i], ok = chosen === q.answer;

      // 詳解時把正確答案填進句子，整句讀起來才完整
      card.querySelector('.q-sentence').innerHTML =
        fill(q.sentence, '<b style="color:var(--accent)">' + esc(q.answer) + '</b>');

      card.querySelectorAll('.opt-btn').forEach(function (b) {
        b.classList.remove('selected');
        var v = b.dataset.v;
        if (v === q.answer) b.classList.add(ok ? 'correct' : 'show-correct');
        else if (v === chosen) b.classList.add('wrong');
      });
      card.querySelector('.feedback').innerHTML = ok
        ? '<span class="feedback-tag correct-tag">✓ 答對了！</span>'
        : '<span class="feedback-tag wrong-tag">✗ 正確答案是：' + esc(q.answer) + '</span>';
    });
    window.scrollTo(0, 0);
  }

  function reset() {
    answers = {}; submitted = false;
    questions = build();          // 選項順序重新洗牌
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('quiz-wrap').style.display = 'block';
    document.getElementById('submit-area').style.display = 'block';
    renderQuestions();
    updateProgress();
    window.scrollTo(0, 0);
  }

  window.startClozeQuiz = function (options) {
    cfg = options;
    injectCss(options.accent || '#e65100');
    questions = build();
    renderShell();
    renderQuestions();
    updateProgress();
  };
})();
