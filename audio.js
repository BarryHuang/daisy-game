// audio.js — 音效與背景音樂，全站共用
//
// 為什麼要有這個檔：以前每個頁面都只有一個 playTone()，那是一個裸的振盪器，
// 沒有包絡也沒有層次，所以聽起來就是「嗶」。
//
// 分成兩塊，刻意用不同做法：
//   ① 音效：真的音檔（sfx/*.wav，由 tools/build_sfx.py 合成）。短音效疊了
//      多層波形和包絡，用檔案最省事也最好聽，整包才 260KB。
//   ② 背景音樂：Web Audio 即時演奏，不放檔案。一首兩分鐘的音樂壓成 mp3
//      也要好幾百 KB，而且這裡要「每張地圖一首」，七首就爆了。即時演奏
//      的話每首只是一小塊資料，還能無縫循環、隨地圖切換。
//
// 開關存在 localStorage["daisy_feel"]（跟震動設定同一包）。

(function () {
  'use strict';

  // menu.js 會在每一頁補上這支檔案，而倉鼠頁自己也放了一個 <script>。
  // 載兩次就會多一組解鎖監聽和第二套音樂排程，所以先擋掉。
  if (window.daisyAudio) return;

  var ctx = null, master = null, sfxBus = null, musicBus = null, delayBus = null;
  var buffers = {};          // name -> AudioBuffer
  var loading = false;
  var unlocked = false;

  var SFX_NAMES = ['coin', 'pop', 'eat', 'jump', 'land', 'levelup', 'error', 'success',
                   'sparkle', 'whoosh', 'splash', 'bump', 'ride', 'door', 'sleep',
                   'wheel', 'click'];

  function feel() {
    try { return JSON.parse(localStorage.getItem('daisy_feel') || '{}'); }
    catch (e) { return {}; }
  }
  function sfxOn()   { return feel().sfx !== false; }      // 預設開
  function musicOn() { return feel().music !== false; }    // 預設開
  function reduced() {
    try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  /** 建立音訊圖。瀏覽器規定要有使用者動作才能出聲，所以第一次碰畫面才開。 */
  function ensureCtx() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();

    master = ctx.createGain();   master.gain.value = 0.9;
    master.connect(ctx.destination);

    sfxBus = ctx.createGain();   sfxBus.gain.value = 0.85;
    sfxBus.connect(master);

    musicBus = ctx.createGain(); musicBus.gain.value = 0.0;   // 淡入用
    musicBus.connect(master);

    // 一點點回音，音色才不會乾。用 delay 就夠了，Convolver 要外部 IR 檔案。
    delayBus = ctx.createDelay(0.6);
    delayBus.delayTime.value = 0.26;
    var fb = ctx.createGain(); fb.gain.value = 0.26;
    var tone = ctx.createBiquadFilter();
    tone.type = 'lowpass'; tone.frequency.value = 2200;
    delayBus.connect(fb); fb.connect(tone); tone.connect(delayBus);
    var wet = ctx.createGain(); wet.gain.value = 0.5;
    delayBus.connect(wet); wet.connect(master);

    return ctx;
  }

  /** 第一次有使用者動作時解鎖並開始載入音效 */
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    var c = ensureCtx();
    if (!c) return;
    if (c.state === 'suspended') c.resume().catch(function () {});
    loadAll();
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, unlock, { once: false, passive: true });
  });

  function loadAll() {
    if (loading || !ctx) return;
    loading = true;
    SFX_NAMES.forEach(function (name) {
      fetch('sfx/' + name + '.wav')
        .then(function (r) { return r.ok ? r.arrayBuffer() : Promise.reject(); })
        .then(function (ab) {
          return new Promise(function (res, rej) {
            // 舊版 Safari 只有 callback 版的 decodeAudioData
            var p = ctx.decodeAudioData(ab, res, rej);
            if (p && p.then) p.then(res, rej);
          });
        })
        .then(function (buf) { buffers[name] = buf; })
        .catch(function () { /* 載不到就退回 playTone */ });
    });
  }

  /**
   * 播一個音效。
   * opts.rate 改播放速度（順便改音高），opts.vol 改音量。
   * 每次都加一點點隨機，連續觸發時才不會像機關槍。
   *
   * 回傳 true 表示「這次的聲音我處理掉了」——包含使用者自己把音效關掉的情況。
   * 回傳 false 只有一種意思：音檔還沒好（還在載、載失敗、或瀏覽器不支援），
   * 呼叫端應該退回舊的 playTone()，不要整個沒聲音。
   */
  function sfx(name, opts) {
    opts = opts || {};
    if (!sfxOn()) return true;          // 關掉了也算處理完，別再用合成音補
    var c = ensureCtx();
    if (!c) return false;
    if (c.state === 'suspended') c.resume().catch(function () {});
    var buf = buffers[name];
    if (!buf) { if (!loading) loadAll(); return false; }

    var src = c.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = (opts.rate || 1) * (1 + (Math.random() - 0.5) * 0.06);
    var g = c.createGain();
    g.gain.value = (opts.vol == null ? 1 : opts.vol) * (0.92 + Math.random() * 0.12);
    src.connect(g); g.connect(sfxBus);
    if (opts.space) g.connect(delayBus);
    src.start();
    return true;
  }

  // ==================================================================
  // 背景音樂
  // ==================================================================
  // 每張地圖一首。資料很小：一組和弦進行 + 一段旋律，引擎照著排程演奏。
  // 旋律刻意走五聲音階，隨便接都不會難聽。
  var M = function (n) { return 440 * Math.pow(2, (n - 69) / 12); };   // MIDI -> Hz

  // [拍子起點, MIDI 音高, 長度(拍)]
  var TUNES = {
    home: {   // 溫暖的客廳，慢
      bpm: 76, bars: 4, lead: 'triangle', bass: 'sine', padVol: 0.08,
      prog: [[60, 'maj'], [57, 'min'], [65, 'maj'], [67, 'maj']],
      mel: [[0,76,1],[1,79,.5],[1.5,81,.5],[2,79,1],[3,76,1],
            [4,74,1],[5,76,1],[6,72,2],
            [8,77,1],[9,81,.5],[9.5,84,.5],[10,81,1],[11,77,1],
            [12,79,1.5],[13.5,74,.5],[14,72,2]]
    },
    garden: { // 後院，明亮
      bpm: 92, bars: 4, lead: 'triangle', bass: 'sine', padVol: 0.07,
      prog: [[65, 'maj'], [72, 'maj'], [62, 'min'], [65, 'maj']],
      mel: [[0,77,.5],[.5,81,.5],[1,84,1],[2,81,.5],[2.5,77,.5],[3,79,1],
            [4,76,.5],[4.5,79,.5],[5,84,1],[6,83,2],
            [8,74,.5],[8.5,77,.5],[9,81,1],[10,77,1],[11,74,1],
            [12,77,1],[13,79,1],[14,77,2]]
    },
    park: {   // 公園，悠閒
      bpm: 84, bars: 4, lead: 'sine', bass: 'sine', padVol: 0.09,
      prog: [[67, 'maj'], [64, 'min'], [60, 'maj'], [67, 'maj']],
      mel: [[0,79,1.5],[1.5,83,.5],[2,86,1],[3,83,1],
            [4,81,1],[5,79,1],[6,76,2],
            [8,72,1],[9,76,1],[10,79,1.5],[11.5,76,.5],
            [12,74,1],[13,79,1],[14,79,2]]
    },
    street: { // 街道，輕快
      bpm: 108, bars: 4, lead: 'square', bass: 'triangle', padVol: 0.05, duty: .3,
      prog: [[62, 'maj'], [69, 'min'], [67, 'maj'], [62, 'maj']],
      mel: [[0,74,.5],[.5,78,.5],[1,81,.5],[1.5,78,.5],[2,74,1],[3,76,1],
            [4,81,.5],[4.5,84,.5],[5,81,1],[6,78,1],[7,76,1],
            [8,79,.5],[8.5,83,.5],[9,86,1],[10,83,1],[11,79,1],
            [12,78,.5],[12.5,74,.5],[13,78,1],[14,74,2]]
    },
    arcade: { // 遊戲中心，電玩味
      bpm: 132, bars: 4, lead: 'square', bass: 'square', padVol: 0.04,
      prog: [[57, 'min'], [65, 'maj'], [60, 'maj'], [67, 'maj']],
      mel: [[0,69,.5],[.5,72,.5],[1,76,.5],[1.5,72,.5],[2,69,.5],[2.5,67,.5],[3,69,1],
            [4,77,.5],[4.5,81,.5],[5,84,.5],[5.5,81,.5],[6,77,1],[7,76,1],
            [8,72,.5],[8.5,76,.5],[9,79,.5],[9.5,76,.5],[10,72,1],[11,74,1],
            [12,79,.5],[12.5,83,.5],[13,86,1],[14,79,2]]
    },
    fair: {   // 遊樂園，三拍的旋轉木馬
      bpm: 120, bars: 4, beatsPerBar: 3, lead: 'triangle', bass: 'sine', padVol: 0.09,
      prog: [[60, 'maj'], [67, 'maj'], [65, 'maj'], [60, 'maj']],
      mel: [[0,72,1],[1,76,.5],[1.5,79,.5],[2,76,1],
            [3,79,1],[4,83,.5],[4.5,79,.5],[5,74,1],
            [6,77,1],[7,81,.5],[7.5,77,.5],[8,72,1],
            [9,76,1],[10,72,1],[11,72,1]]
    },
    beach: {  // 沙灘，慵懶
      bpm: 72, bars: 4, lead: 'sine', bass: 'sine', padVol: 0.10,
      prog: [[65, 'maj'], [60, 'maj'], [62, 'min'], [67, 'maj']],
      mel: [[0,81,2],[2,84,1],[3,81,1],
            [4,79,1.5],[5.5,76,.5],[6,72,2],
            [8,74,1],[9,77,1],[10,81,2],
            [12,79,1],[13,74,1],[14,77,2]]
    }
  };
  var CHORD = { maj: [0, 4, 7], min: [0, 3, 7] };

  var music = { tune: null, name: null, timer: 0, next: 0, step: 0, playing: false };

  function voice(type, freq, t, dur, vol, cutoff, send) {
    var o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    var g = ctx.createGain();
    var f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(cutoff || 2600, t);
    f.Q.value = 0.8;
    // ADSR。有包絡才像樂器，沒有就是「嗶」。
    var a = 0.02, r = Math.min(0.45, dur * 0.7);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol * 0.65), t + Math.min(dur * 0.5, a + 0.12));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + r);
    o.connect(f); f.connect(g); g.connect(musicBus);
    if (send) g.connect(delayBus);
    o.start(t);
    o.stop(t + dur + r + 0.05);
  }

  /** 排一個小節的音符。用 lookahead 排程，不然 setInterval 的抖動會聽得出來。 */
  function scheduleBar(tune, bar, t0) {
    var bpb = tune.beatsPerBar || 4;
    var spb = 60 / tune.bpm;
    var ch = tune.prog[bar % tune.prog.length];
    var root = ch[0], iv = CHORD[ch[1]];

    // 低音：每小節第一拍和中間各一下
    voice(tune.bass, M(root - 24), t0, spb * 0.9, 0.16, 900);
    voice(tune.bass, M(root - 24), t0 + spb * (bpb / 2), spb * 0.7, 0.11, 900);
    // 和弦墊底，音量很小，只負責「有空氣」
    iv.forEach(function (s, i) {
      voice('triangle', M(root - 12 + s), t0 + i * 0.012, spb * bpb * 0.92,
            tune.padVol, 1200);
    });
    // 旋律
    var barStart = bar * bpb, barEnd = barStart + bpb;
    tune.mel.forEach(function (n) {
      var b = n[0];
      if (b < barStart || b >= barEnd) return;
      voice(tune.lead, M(n[1]), t0 + (b - barStart) * spb, n[2] * spb * 0.92,
            0.14, 3200, true);
    });
  }

  function tick() {
    if (!music.playing || !ctx) return;
    var tune = music.tune;
    var bpb = tune.beatsPerBar || 4;
    var barLen = (60 / tune.bpm) * bpb;
    // 分頁被切走、或 AudioContext 還沒解鎖的時候 currentTime 不會前進，
    // 回來時 music.next 已經落後一大截。不重新對齊的話 while 會一口氣把
    // 好幾十個小節全部排進同一瞬間，變成一聲巨響。
    if (music.next < ctx.currentTime - 0.5) music.next = ctx.currentTime + 0.05;
    // 往前看 0.4 秒，把該排的小節排進去
    while (music.next < ctx.currentTime + 0.4) {
      scheduleBar(tune, music.step, music.next);
      music.step = (music.step + 1) % (tune.mel.length ? Math.max(tune.bars, 1) : 1);
      music.next += barLen;
    }
  }

  function musicPlay(name) {
    var tune = TUNES[name] || TUNES.home;
    if (!musicOn() || reduced()) { musicStop(); return; }
    var c = ensureCtx();
    if (!c) return;
    if (c.state === 'suspended') c.resume().catch(function () {});
    if (music.playing && music.name === name) return;

    musicStopTimer();
    music.tune = tune; music.name = name;
    music.step = 0;
    music.next = c.currentTime + 0.12;
    music.playing = true;
    musicBus.gain.cancelScheduledValues(c.currentTime);
    musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), c.currentTime);
    musicBus.gain.linearRampToValueAtTime(0.5, c.currentTime + 1.2);   // 淡入
    music.timer = setInterval(tick, 60);
    tick();
  }

  function musicStopTimer() {
    if (music.timer) { clearInterval(music.timer); music.timer = 0; }
  }

  function musicStop() {
    if (!ctx) { music.playing = false; return; }
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setValueAtTime(musicBus.gain.value, ctx.currentTime);
    musicBus.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    music.playing = false;
    setTimeout(musicStopTimer, 600);
  }

  /** 唸單字的時候把音樂壓小聲，不然聽不清楚發音 */
  function duck(ms) {
    if (!ctx || !music.playing) return;
    var t = ctx.currentTime;
    musicBus.gain.cancelScheduledValues(t);
    musicBus.gain.setValueAtTime(musicBus.gain.value, t);
    musicBus.gain.linearRampToValueAtTime(0.08, t + 0.12);
    musicBus.gain.setValueAtTime(0.08, t + (ms || 1200) / 1000);
    musicBus.gain.linearRampToValueAtTime(0.5, t + (ms || 1200) / 1000 + 0.6);
  }

  /** 設定改了之後叫這個：關掉就靜音，打開就接回去 */
  function refresh(mapName) {
    if (!musicOn()) musicStop();
    else if (mapName) musicPlay(mapName);
  }

  window.daisyAudio = {
    sfx: sfx, unlock: unlock,
    musicPlay: musicPlay, musicStop: musicStop, duck: duck, refresh: refresh,
    isPlaying: function () { return music.playing; }
  };
  window.sfx = sfx;     // 給頁面直接叫
})();
