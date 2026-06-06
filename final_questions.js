// =========================================================================
// 期末測驗題庫 — final_questions.js
// 範圍: FET Wk 10-16  ×  CET Wk 10-16
// 格式: { sentence, answer, options[3], hint(中文), source }
// 干擾選項皆來自同一考試範圍的單字。
// =========================================================================

const finalQuestions = [

  // ── FET Week 10 ─────────────────────────────────────────────────────────
  {
    sentence: "She has a very good ___ and remembers everyone's names.",
    answer: "memory",
    options: ["memory", "world", "wonder"],
    hint: "記憶 🧠",
    source: "FET Wk 10"
  },
  {
    sentence: "He ___ a hidden cave in the forest while walking.",
    answer: "discovers",
    options: ["discovers", "amaze", "achieve"],
    hint: "發現 🔍",
    source: "FET Wk 10"
  },
  {
    sentence: "The magician's trick will ___ you with its speed.",
    answer: "amaze",
    options: ["amaze", "struggle", "alone"],
    hint: "使驚訝 ✨",
    source: "FET Wk 10"
  },
  {
    sentence: "She was sitting ___ in her room reading a book.",
    answer: "alone",
    options: ["alone", "memory", "tunes"],
    hint: "單獨的 🧍",
    source: "FET Wk 10"
  },
  {
    sentence: "If you work hard, you can ___ your goals.",
    answer: "achieve",
    options: ["achieve", "wonder", "struggle"],
    hint: "達成 🏆",
    source: "FET Wk 10"
  },
  {
    sentence: "The internet connects people all over the ___.",
    answer: "world",
    options: ["world", "alone", "dream"],
    hint: "世界 🌍",
    source: "FET Wk 10"
  },

  // ── FET Week 11/12 ──────────────────────────────────────────────────────
  {
    sentence: "Please ___ quietly so the baby won't wake up.",
    answer: "whisper",
    options: ["whisper", "delight", "surround"],
    hint: "耳語 🤫",
    source: "FET Wk 11/12"
  },
  {
    sentence: "Dogs love to chew on ___ after dinner.",
    answer: "bones",
    options: ["bones", "children", "artist"],
    hint: "骨頭 🦴",
    source: "FET Wk 11/12"
  },
  {
    sentence: "The beautiful rainbow was a ___ to see.",
    answer: "delight",
    options: ["delight", "mountain", "desert"],
    hint: "愉快 😄",
    source: "FET Wk 11/12"
  },
  {
    sentence: "They climbed to the top of the tall ___.",
    answer: "mountain",
    options: ["mountain", "whisper", "season"],
    hint: "山 ⛰️",
    source: "FET Wk 11/12"
  },
  {
    sentence: "The ___ painted a beautiful picture of the ocean.",
    answer: "artist",
    options: ["artist", "wonder", "bones"],
    hint: "藝術家 🎨",
    source: "FET Wk 11/12"
  },
  {
    sentence: "A camel can live in the hot, dry ___ for days.",
    answer: "desert",
    options: ["desert", "mountain", "children"],
    hint: "沙漠 🏜️",
    source: "FET Wk 11/12"
  },

  // ── FET Week 13 ─────────────────────────────────────────────────────────
  {
    sentence: "In ___, the leaves change color and fall from the trees.",
    answer: "autumn",
    options: ["autumn", "spring", "summer"],
    hint: "秋天 🍁",
    source: "FET Wk 13"
  },
  {
    sentence: "The bird's eggs are white and ___ with brown dots.",
    answer: "speckled",
    options: ["speckled", "woven", "sprout"],
    hint: "有斑點的 🥚",
    source: "FET Wk 13"
  },
  {
    sentence: "She carried a beautifully ___ basket to the market.",
    answer: "woven",
    options: ["woven", "speckled", "bloom"],
    hint: "編織的 🧺",
    source: "FET Wk 13"
  },
  {
    sentence: "With a little water, the seeds will begin to ___.",
    answer: "sprout",
    options: ["sprout", "spread", "autumn"],
    hint: "發芽 🌱",
    source: "FET Wk 13"
  },
  {
    sentence: "The roses in the garden will ___ beautifully in May.",
    answer: "bloom",
    options: ["bloom", "sprout", "showers"],
    hint: "開花 🌺",
    source: "FET Wk 13"
  },
  {
    sentence: "Please ___ the butter evenly on the toast.",
    answer: "spread",
    options: ["spread", "woven", "bloom"],
    hint: "傳播 🌊",
    source: "FET Wk 13"
  },

  // ── FET Week 14 ─────────────────────────────────────────────────────────
  {
    sentence: "The snake will ___ quietly through the tall grass.",
    answer: "slither",
    options: ["slither", "flutter", "scurry"],
    hint: "滑行 🐍",
    source: "FET Wk 14"
  },
  {
    sentence: "The butterflies ___ their wings as they fly from flower to flower.",
    answer: "flutter",
    options: ["flutter", "slither", "scatter"],
    hint: "拍翅 🦋",
    source: "FET Wk 14"
  },
  {
    sentence: "The mice ___ quickly across the floor to hide.",
    answer: "scurry",
    options: ["scurry", "honk", "taste"],
    hint: "碎步快跑 🐭",
    source: "FET Wk 14"
  },
  {
    sentence: "Please don't tell anyone. It's a ___.",
    answer: "secret",
    options: ["secret", "jacket", "store"],
    hint: "秘密 🤫",
    source: "FET Wk 14"
  },
  {
    sentence: "Let's go to the ___ to buy some milk and bread.",
    answer: "store",
    options: ["store", "secret", "jacket"],
    hint: "商店 🏪",
    source: "FET Wk 14"
  },
  {
    sentence: "It's cold outside, so put on your warm ___.",
    answer: "jacket",
    options: ["jacket", "taste", "barefoot"],
    hint: "夾克 🧥",
    source: "FET Wk 14"
  },

  // ── FET Week 15 ─────────────────────────────────────────────────────────
  {
    sentence: "The autumn air is cool and ___ in the morning.",
    answer: "crisp",
    options: ["crisp", "gray", "chilly"],
    hint: "清爽的 🍏",
    source: "FET Wk 15"
  },
  {
    sentence: "We must ___ to the station so we don't miss the train.",
    answer: "rush",
    options: ["rush", "dig", "weave"],
    hint: "急動 🏃",
    source: "FET Wk 15"
  },
  {
    sentence: "The ___ caught a fly in its sticky web.",
    answer: "spider",
    options: ["spider", "chipmunk", "rush"],
    hint: "蜘蛛 🕷️",
    source: "FET Wk 15"
  },
  {
    sentence: "Spiders can ___ beautiful webs to catch bugs.",
    answer: "weave",
    options: ["weave", "dig", "zip"],
    hint: "編織 🕸️",
    source: "FET Wk 15"
  },
  {
    sentence: "It is quite ___ today, so wear a sweater.",
    answer: "chilly",
    options: ["chilly", "crisp", "gray"],
    hint: "寒冷的 🥶",
    source: "FET Wk 15"
  },
  {
    sentence: "The little ___ quickly hid its food in the tree.",
    answer: "chipmunk",
    options: ["chipmunk", "spider", "rush"],
    hint: "花栗鼠 🐿️",
    source: "FET Wk 15"
  },

  // ── FET Week 16 ─────────────────────────────────────────────────────────
  {
    sentence: "Birds use their wings to ___ high in the sky.",
    answer: "fly",
    options: ["fly", "spin", "dash"],
    hint: "飛 🦅",
    source: "FET Wk 16"
  },
  {
    sentence: "Remember to ___ the bottle before you drink the juice.",
    answer: "shake",
    options: ["shake", "fetch", "lie"],
    hint: "搖動 🫨",
    source: "FET Wk 16"
  },
  {
    sentence: "The top will ___ around and around on the table.",
    answer: "spin",
    options: ["spin", "shake", "fly"],
    hint: "旋轉 🌀",
    source: "FET Wk 16"
  },
  {
    sentence: "He made a quick ___ for the door when the bell rang.",
    answer: "dash",
    options: ["dash", "spin", "fetch"],
    hint: "衝刺 💨",
    source: "FET Wk 16"
  },
  {
    sentence: "The glass is ___. There is no water left.",
    answer: "empty",
    options: ["empty", "jar", "lie"],
    hint: "空的 📭",
    source: "FET Wk 16"
  },
  {
    sentence: "My dog loves to run and ___ the ball when I throw it.",
    answer: "fetch",
    options: ["fetch", "dash", "shake"],
    hint: "拿來 🐕",
    source: "FET Wk 16"
  },

  // ── CET Week 10 ─────────────────────────────────────────────────────────
  {
    sentence: "We saw many old paintings at the art ___.",
    answer: "museum",
    options: ["museum", "field", "fossil"],
    hint: "博物館 🏛️",
    source: "CET Wk 10"
  },
  {
    sentence: "The T-Rex is a very famous ___ that lived long ago.",
    answer: "dinosaur",
    options: ["dinosaur", "model", "trip"],
    hint: "恐龍 🦕",
    source: "CET Wk 10"
  },
  {
    sentence: "Scientists found a fish ___ in the solid rock.",
    answer: "fossil",
    options: ["fossil", "museum", "drawing"],
    hint: "化石 🦴",
    source: "CET Wk 10"
  },
  {
    sentence: "Please give the plant some water so it can stay ___.",
    answer: "alive",
    options: ["alive", "break", "dinosaur"],
    hint: "活著的 🌱",
    source: "CET Wk 10"
  },
  {
    sentence: "Our family went on a ___ to the beach last summer.",
    answer: "trip",
    options: ["trip", "model", "field"],
    hint: "旅行 🚌",
    source: "CET Wk 10"
  },
  {
    sentence: "After playing for an hour, the kids took a short ___.",
    answer: "break",
    options: ["break", "alive", "fossil"],
    hint: "休息 ☕",
    source: "CET Wk 10"
  },

  // ── CET Week 11 ─────────────────────────────────────────────────────────
  {
    sentence: "Let's work ___ to clean up the room faster.",
    answer: "together",
    options: ["together", "about", "could"],
    hint: "一起 🤝",
    source: "CET Wk 11"
  },
  {
    sentence: "Can you help me solve this 100-piece ___?",
    answer: "puzzle",
    options: ["puzzle", "chicken", "bird"],
    hint: "拼圖 🧩",
    source: "CET Wk 11"
  },
  {
    sentence: "Please ___ me how to play this fun new game.",
    answer: "show",
    options: ["show", "could", "together"],
    hint: "顯示 👁️",
    source: "CET Wk 11"
  },
  {
    sentence: "The farmer feeds the ___ every morning.",
    answer: "chicken",
    options: ["chicken", "cow", "bird"],
    hint: "雞 🐔",
    source: "CET Wk 11"
  },
  {
    sentence: "A little blue ___ sat on the branch and sang a song.",
    answer: "bird",
    options: ["bird", "puzzle", "show"],
    hint: "鳥 🐦",
    source: "CET Wk 11"
  },

  // ── CET Week 12 ─────────────────────────────────────────────────────────
  {
    sentence: "The cat used its sharp ___ to scratch the post.",
    answer: "claw",
    options: ["claw", "horn", "teeth"],
    hint: "爪子 🦁",
    source: "CET Wk 12"
  },
  {
    sentence: "The rhino has a big ___ on its nose.",
    answer: "horn",
    options: ["horn", "meat", "clue"],
    hint: "角 🦏",
    source: "CET Wk 12"
  },
  {
    sentence: "Don't forget to brush your ___ before going to bed.",
    answer: "teeth",
    options: ["teeth", "claw", "flat"],
    hint: "牙齒 🦷",
    source: "CET Wk 12"
  },
  {
    sentence: "The road was very ___ and easy to bike on.",
    answer: "flat",
    options: ["flat", "other", "past"],
    hint: "平的 🛣️",
    source: "CET Wk 12"
  },
  {
    sentence: "Lions and tigers hunt for ___ to eat.",
    answer: "meat",
    options: ["meat", "catch", "ate"],
    hint: "肉 🥩",
    source: "CET Wk 12"
  },

  // ── CET Week 13 ─────────────────────────────────────────────────────────
  {
    sentence: "The ___ was bright blue without a single cloud.",
    answer: "sky",
    options: ["sky", "cloud", "plane"],
    hint: "天空 🌤️",
    source: "CET Wk 13"
  },
  {
    sentence: "That big fluffy ___ looks just like a sheep!",
    answer: "cloud",
    options: ["cloud", "sky", "doctor"],
    hint: "雲 ☁️",
    source: "CET Wk 13"
  },
  {
    sentence: "Watch the red balloon ___ away into the air.",
    answer: "float",
    options: ["float", "stretch", "over"],
    hint: "漂浮 🎈",
    source: "CET Wk 13"
  },
  {
    sentence: "The ___ flew the airplane safely to the airport.",
    answer: "pilot",
    options: ["pilot", "doctor", "silly"],
    hint: "飛行員 ✈️",
    source: "CET Wk 13"
  },
  {
    sentence: "The clown made a ___ face and everyone laughed.",
    answer: "silly",
    options: ["silly", "pilot", "dream"],
    hint: "傻的 🤪",
    source: "CET Wk 13"
  },

  // ── CET Week 14 ─────────────────────────────────────────────────────────
  {
    sentence: "We rode the fast ___ from the city to the mountains.",
    answer: "train",
    options: ["train", "neighbor", "job"],
    hint: "火車 🚂",
    source: "CET Wk 14"
  },
  {
    sentence: "The ___ firefighter ran into the burning house to save the dog.",
    answer: "brave",
    options: ["brave", "tough", "talented"],
    hint: "勇敢的 🦁",
    source: "CET Wk 14"
  },
  {
    sentence: "Please ___ me to call my mom after school.",
    answer: "remind",
    options: ["remind", "ask", "wait"],
    hint: "提醒 🔔",
    source: "CET Wk 14"
  },
  {
    sentence: "She is a very ___ singer who wins many contests.",
    answer: "talented",
    options: ["talented", "brave", "tough"],
    hint: "有天賦的 🎤",
    source: "CET Wk 14"
  },
  {
    sentence: "You have to ___ for the green light before you cross the street.",
    answer: "wait",
    options: ["wait", "ask", "remind"],
    hint: "等待 ⏳",
    source: "CET Wk 14"
  },
  {
    sentence: "His ___ is to teach children how to read.",
    answer: "job",
    options: ["job", "minute", "train"],
    hint: "工作 💼",
    source: "CET Wk 14"
  },

  // ── CET Week 15&16 ──────────────────────────────────────────────────────
  {
    sentence: "The magician pulled a rabbit out of his hat as a cool ___.",
    answer: "trick",
    options: ["trick", "learn", "start"],
    hint: "把戲 🎩",
    source: "CET Wk 15&16"
  },
  {
    sentence: "The eagle ___ high over the mountains yesterday.",
    answer: "flew",
    options: ["flew", "fly", "stop"],
    hint: "飛(過去式) 🦅",
    source: "CET Wk 15&16"
  },
  {
    sentence: "Ready, set, ___! The race has begun.",
    answer: "start",
    options: ["start", "stop", "learn"],
    hint: "開始 🚦",
    source: "CET Wk 15&16"
  },
  {
    sentence: "She is a ___ movie star and everyone knows her name.",
    answer: "famous",
    options: ["famous", "flew", "trick"],
    hint: "有名的 ⭐",
    source: "CET Wk 15&16"
  },
  {
    sentence: "You must ___ your car when the traffic light is red.",
    answer: "stop",
    options: ["stop", "start", "learn"],
    hint: "停止 🛑",
    source: "CET Wk 15&16"
  }

]; // end finalQuestions
