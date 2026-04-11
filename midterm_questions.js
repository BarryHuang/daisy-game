// =========================================================================
// 期中測驗題庫 — midterm_questions.js
// 範圍: FET Wk 2-7  ×  CET Wk 1-8
// 格式: { sentence, answer, options[3], hint(中文), source }
// 每題確保前後語意足以讓 Daisy 推理出正確答案。
// =========================================================================

const midtermQuestions = [

  // ── FET Week 2 ──────────────────────────────────────────────────────────
  // Theme: farm animals, nature, emotions (calf, graze, forest, promise…)
  {
    sentence: "The little ___ runs in the green field with its mother.",
    answer: "calf",
    options: ["calf", "bird", "fish"],
    hint: "小牛 🐄",
    source: "FET Wk 2"
  },
  {
    sentence: "The cows like to ___ on the grassy hill all morning.",
    answer: "graze",
    options: ["graze", "swim", "fly"],
    hint: "吃草 🌿",
    source: "FET Wk 2"
  },
  {
    sentence: "There are tall trees and many animals in the ___.",
    answer: "forest",
    options: ["forest", "ocean", "city"],
    hint: "森林 🌲",
    source: "FET Wk 2"
  },
  {
    sentence: "The field is ___ and soft after the spring rain.",
    answer: "grassy",
    options: ["grassy", "rocky", "sandy"],
    hint: "長滿草的 🌾",
    source: "FET Wk 2"
  },
  {
    sentence: "She was ___ because her friend broke her favorite toy.",
    answer: "angry",
    options: ["angry", "happy", "tired"],
    hint: "生氣的 😠",
    source: "FET Wk 2"
  },
  {
    sentence: "I ___ to help you clean the room every day.",
    answer: "promise",
    options: ["promise", "forget", "refuse"],
    hint: "答應 🤝",
    source: "FET Wk 2"
  },
  {
    sentence: "She felt ___ and smiled when she saw the gift.",
    answer: "happy",
    options: ["happy", "sad", "angry"],
    hint: "快樂的 😊",
    source: "FET Wk 2"
  },

  // ── FET Week 3 ──────────────────────────────────────────────────────────
  // Theme: honesty, promises, returning (agree, truth, protect, always…)
  {
    sentence: "She was ___ to see her best friend come back after a long time.",
    answer: "surprised",
    options: ["surprised", "bored", "sleepy"],
    hint: "驚訝的 😮",
    source: "FET Wk 3"
  },
  {
    sentence: "I will ___ love you, even when we are far apart.",
    answer: "always",
    options: ["always", "never", "rarely"],
    hint: "總是 💕",
    source: "FET Wk 3"
  },
  {
    sentence: "Please tell me the ___. I want to know what really happened.",
    answer: "truth",
    options: ["truth", "joke", "secret"],
    hint: "真相 💬",
    source: "FET Wk 3"
  },
  {
    sentence: "The mother hen will ___ her little chicks from the rain.",
    answer: "protect",
    options: ["protect", "chase", "forget"],
    hint: "保護 🐔",
    source: "FET Wk 3"
  },
  {
    sentence: "The children ___ to walk home together after school.",
    answer: "agreed",
    options: ["agreed", "refused", "forgot"],
    hint: "同意 👍",
    source: "FET Wk 3"
  },
  {
    sentence: "She was ___ with her score because she studied hard.",
    answer: "pleased",
    options: ["pleased", "sad", "mad"],
    hint: "高興的 😄",
    source: "FET Wk 3"
  },
  {
    sentence: "He ___ home after a long trip and hugged his family.",
    answer: "returned",
    options: ["returned", "left", "forgot"],
    hint: "返回 🏠",
    source: "FET Wk 3"
  },

  // ── FET Week 4 ──────────────────────────────────────────────────────────
  // Theme: school subjects, creativity (school, math, art, imagination…)
  {
    sentence: "I love ___ class! We draw pictures and make crafts.",
    answer: "art",
    options: ["art", "math", "PE"],
    hint: "藝術 🎨",
    source: "FET Wk 4"
  },
  {
    sentence: "She is very ___. She always thinks of new ideas.",
    answer: "creative",
    options: ["creative", "lazy", "quiet"],
    hint: "有創意的 💡",
    source: "FET Wk 4"
  },
  {
    sentence: "It is ___ to eat breakfast every morning before school.",
    answer: "important",
    options: ["important", "boring", "impossible"],
    hint: "重要的 ⭐",
    source: "FET Wk 4"
  },
  {
    sentence: "He loves to read and ___ new things every day.",
    answer: "learn",
    options: ["learn", "sleep", "forget"],
    hint: "學習 📚",
    source: "FET Wk 4"
  },
  {
    sentence: "Use your ___ to picture a dragon flying over the mountains!",
    answer: "imagination",
    options: ["imagination", "pencil", "ruler"],
    hint: "想像力 🌈",
    source: "FET Wk 4"
  },
  {
    sentence: "She can solve any ___ in math. She is very smart!",
    answer: "problem",
    options: ["problem", "picture", "color"],
    hint: "問題 🤔",
    source: "FET Wk 4"
  },

  // ── FET Week 5 ──────────────────────────────────────────────────────────
  // Theme: music, focus, working together (amazing, concentrate, teamwork…)
  {
    sentence: "We need good ___ to win. Everyone must work together!",
    answer: "teamwork",
    options: ["teamwork", "money", "luck"],
    hint: "團隊合作 🤝",
    source: "FET Wk 5"
  },
  {
    sentence: "The piano concert was ___. Everyone stood up and clapped!",
    answer: "amazing",
    options: ["amazing", "boring", "noisy"],
    hint: "驚人的 🌟",
    source: "FET Wk 5"
  },
  {
    sentence: "Please ___ during the test. No talking!",
    answer: "concentrate",
    options: ["concentrate", "shout", "play"],
    hint: "專心 🎯",
    source: "FET Wk 5"
  },
  {
    sentence: "Can you ___ the name of our new math teacher?",
    answer: "remember",
    options: ["remember", "forget", "shout"],
    hint: "記得 💭",
    source: "FET Wk 5"
  },
  {
    sentence: "She loves to listen to ___ while she reads.",
    answer: "music",
    options: ["music", "noise", "thunder"],
    hint: "音樂 🎵",
    source: "FET Wk 5"
  },

  // ── FET Week 6 ──────────────────────────────────────────────────────────
  // Theme: baseball, sports, teams (baseball, team, field, cheer, college…)
  {
    sentence: "The players run across the ___ to catch the ball.",
    answer: "field",
    options: ["field", "rooftop", "kitchen"],
    hint: "球場 ⚾",
    source: "FET Wk 6"
  },
  {
    sentence: "The fans ___ and wave flags when their team scores.",
    answer: "cheer",
    options: ["cheer", "sleep", "cry"],
    hint: "歡呼 📣",
    source: "FET Wk 6"
  },
  {
    sentence: "He plays ___ with his friends every weekend at the park.",
    answer: "baseball",
    options: ["baseball", "violin", "chess"],
    hint: "棒球 ⚾",
    source: "FET Wk 6"
  },
  {
    sentence: "Students are not ___ to use phones during class.",
    answer: "allowed",
    options: ["allowed", "happy", "ready"],
    hint: "允許的 🚫",
    source: "FET Wk 6"
  },
  {
    sentence: "She wants to go to ___ one day and study science.",
    answer: "college",
    options: ["college", "hospital", "farm"],
    hint: "大學 🎓",
    source: "FET Wk 6"
  },
  {
    sentence: "Every player on the ___ must practice together.",
    answer: "team",
    options: ["team", "library", "forest"],
    hint: "隊伍 👕",
    source: "FET Wk 6"
  },

  // ── FET Week 7 ──────────────────────────────────────────────────────────
  // Theme: baseball season, hard work, sportsmanship (hard, season, admire…)
  {
    sentence: "Summer is my favorite ___ because I love swimming!",
    answer: "season",
    options: ["season", "color", "subject"],
    hint: "季節 🌞",
    source: "FET Wk 7"
  },
  {
    sentence: "She works ___ every day so she can be the best player.",
    answer: "hard",
    options: ["hard", "slow", "sadly"],
    hint: "努力地 💪",
    source: "FET Wk 7"
  },
  {
    sentence: "I really ___ my big sister. She is kind and talented.",
    answer: "admire",
    options: ["admire", "ignore", "dislike"],
    hint: "崇拜 🌟",
    source: "FET Wk 7"
  },
  {
    sentence: "He wants to ___ a great baseball player when he grows up.",
    answer: "become",
    options: ["become", "forget", "break"],
    hint: "成為 🏆",
    source: "FET Wk 7"
  },
  {
    sentence: "My ___ passed the ball to me, and I scored a home run!",
    answer: "teammate",
    options: ["teammate", "teacher", "parent"],
    hint: "隊友 ⚾",
    source: "FET Wk 7"
  },
  {
    sentence: "The other team played in a ___ way. They were not fair.",
    answer: "nasty",
    options: ["nasty", "kind", "quiet"],
    hint: "討厭的 😤",
    source: "FET Wk 7"
  },

  // ── CET Week 1 & 2 ──────────────────────────────────────────────────────
  // Theme: everyday life, shopping, family outings (mall, picnic, basket…)
  {
    sentence: "We went to the ___ to buy new shoes and clothes.",
    answer: "mall",
    options: ["mall", "hospital", "forest"],
    hint: "購物中心 🛍️",
    source: "CET Wk 1&2"
  },
  {
    sentence: "We had a ___ in the park. We ate sandwiches on the grass.",
    answer: "picnic",
    options: ["picnic", "party", "nap"],
    hint: "野餐 🧺",
    source: "CET Wk 1&2"
  },
  {
    sentence: "Please put the apples in the ___ and bring them to the table.",
    answer: "basket",
    options: ["basket", "bottle", "bowl"],
    hint: "籃子 🧺",
    source: "CET Wk 1&2"
  },
  {
    sentence: "Playing games with your friends is so ___!",
    answer: "fun",
    options: ["fun", "scary", "hard"],
    hint: "有趣的 🎉",
    source: "CET Wk 1&2"
  },
  {
    sentence: "She works in a big ___ building near the river.",
    answer: "office",
    options: ["office", "jungle", "mountain"],
    hint: "辦公室 🏢",
    source: "CET Wk 1&2"
  },
  {
    sentence: "The weather today is so ___! Let's go for a walk.",
    answer: "cool",
    options: ["cool", "hot", "rainy"],
    hint: "涼爽的 😎",
    source: "CET Wk 1&2"
  },

  // ── CET Week 3 ──────────────────────────────────────────────────────────
  // Theme: music, home objects (piano, violin, glass, stair, building…)
  {
    sentence: "She practices ___ for one hour every evening.",
    answer: "piano",
    options: ["piano", "baseball", "cooking"],
    hint: "鋼琴 🎹",
    source: "CET Wk 3"
  },
  {
    sentence: "Be careful! Don't drop the ___. It will break!",
    answer: "glass",
    options: ["glass", "pillow", "hat"],
    hint: "玻璃杯 🥛",
    source: "CET Wk 3"
  },
  {
    sentence: "I walked up the ___ to get to the second floor.",
    answer: "stair",
    options: ["stair", "window", "door"],
    hint: "樓梯 🪜",
    source: "CET Wk 3"
  },
  {
    sentence: "She plays the ___ in the school orchestra.",
    answer: "violin",
    options: ["violin", "skateboard", "ruler"],
    hint: "小提琴 🎻",
    source: "CET Wk 3"
  },
  {
    sentence: "The tall ___ in the city has 50 floors and a big lobby.",
    answer: "building",
    options: ["building", "pond", "flower"],
    hint: "大樓 🏢",
    source: "CET Wk 3"
  },

  // ── CET Week 4 ──────────────────────────────────────────────────────────
  // Theme: community, library, places (library, garage, elephant, climb…)
  {
    sentence: "I go to the ___ every week to borrow books.",
    answer: "library",
    options: ["library", "jungle", "mall"],
    hint: "圖書館 📚",
    source: "CET Wk 4"
  },
  {
    sentence: "The ___ is the largest animal that lives on land.",
    answer: "elephant",
    options: ["elephant", "rabbit", "fish"],
    hint: "大象 🐘",
    source: "CET Wk 4"
  },
  {
    sentence: "Dad parks the car in the ___ every night.",
    answer: "garage",
    options: ["garage", "kitchen", "garden"],
    hint: "車庫 🚗",
    source: "CET Wk 4"
  },
  {
    sentence: "We can ___ wonderful things with our imagination!",
    answer: "create",
    options: ["create", "break", "drop"],
    hint: "創造 🌈",
    source: "CET Wk 4"
  },
  {
    sentence: "He loves to ___ trees in the park with his friends.",
    answer: "climb",
    options: ["climb", "water", "paint"],
    hint: "攀爬 🌳",
    source: "CET Wk 4"
  },

  // ── CET Week 5 ──────────────────────────────────────────────────────────
  // Theme: feelings, family, communication (excited, hear, cousin, letter…)
  {
    sentence: "She was so ___ about her birthday party tomorrow!",
    answer: "excited",
    options: ["excited", "bored", "tired"],
    hint: "興奮的 🎉",
    source: "CET Wk 5"
  },
  {
    sentence: "Can you ___ the music? It is coming from next door.",
    answer: "hear",
    options: ["hear", "touch", "taste"],
    hint: "聽到 👂",
    source: "CET Wk 5"
  },
  {
    sentence: "I got a ___ from my grandmother. She wrote it by hand!",
    answer: "letter",
    options: ["letter", "phone", "ball"],
    hint: "信 ✉️",
    source: "CET Wk 5"
  },
  {
    sentence: "Please be ___. The baby is sleeping in the next room.",
    answer: "quiet",
    options: ["quiet", "loud", "fast"],
    hint: "安靜的 🤫",
    source: "CET Wk 5"
  },
  {
    sentence: "My ___ is coming to visit. She is my aunt's daughter.",
    answer: "cousin",
    options: ["cousin", "teacher", "neighbor"],
    hint: "表兄弟姊妹 👫",
    source: "CET Wk 5"
  },

  // ── CET Week 6 ──────────────────────────────────────────────────────────
  // Theme: city, streets, actions (skateboard, shout, scary, jump, behind…)
  {
    sentence: "He rides his ___ to school every morning.",
    answer: "skateboard",
    options: ["skateboard", "elephant", "basket"],
    hint: "滑板 🛹",
    source: "CET Wk 6"
  },
  {
    sentence: "Don't ___ in the library. Please use a quiet voice.",
    answer: "shout",
    options: ["shout", "sing", "read"],
    hint: "大叫 📢",
    source: "CET Wk 6"
  },
  {
    sentence: "The haunted house was really ___. I held my sister's hand!",
    answer: "scary",
    options: ["scary", "yummy", "soft"],
    hint: "可怕的 👻",
    source: "CET Wk 6"
  },
  {
    sentence: "She loves to ___ rope in the playground after lunch.",
    answer: "jump",
    options: ["jump", "fold", "draw"],
    hint: "跳 🦘",
    source: "CET Wk 6"
  },
  {
    sentence: "He is hiding ___ the door. Can you find him?",
    answer: "behind",
    options: ["behind", "above", "inside"],
    hint: "在…後面 🙈",
    source: "CET Wk 6"
  },

  // ── CET Week 7 & 8 ──────────────────────────────────────────────────────
  // Theme: health, city life, time (ambulance, hospital, sick, loud, city…)
  {
    sentence: "The ___ rushed to the accident with its lights flashing.",
    answer: "ambulance",
    options: ["ambulance", "bicycle", "train"],
    hint: "救護車 🚑",
    source: "CET Wk 7&8"
  },
  {
    sentence: "She felt ___, so her mom took her to the doctor.",
    answer: "sick",
    options: ["sick", "happy", "bored"],
    hint: "生病的 🤒",
    source: "CET Wk 7&8"
  },
  {
    sentence: "The ___ is a big and busy place with tall buildings.",
    answer: "city",
    options: ["city", "forest", "island"],
    hint: "城市 🏙️",
    source: "CET Wk 7&8"
  },
  {
    sentence: "We will go to the beach ___. Let's pack our bags tonight!",
    answer: "tomorrow",
    options: ["tomorrow", "yesterday", "never"],
    hint: "明天 📅",
    source: "CET Wk 7&8"
  },
  {
    sentence: "The music was so ___ that I had to cover my ears.",
    answer: "loud",
    options: ["loud", "sweet", "cold"],
    hint: "吵鬧的 🔊",
    source: "CET Wk 7&8"
  },
  {
    sentence: "She went to the ___ to visit her grandpa who was ill.",
    answer: "hospital",
    options: ["hospital", "school", "library"],
    hint: "醫院 🏥",
    source: "CET Wk 7&8"
  },
  {
    sentence: "The city is ___ in the morning. Everyone is rushing to work!",
    answer: "busy",
    options: ["busy", "quiet", "empty"],
    hint: "忙碌的 🏃",
    source: "CET Wk 7&8"
  },


  // ── 常用單字：星期 ──────────────────────────────────────────────────────
  {
    sentence: "School starts again on ___. It is the first day of the week.",
    answer: "Monday",
    options: ["Monday", "Friday", "Sunday"],
    hint: "星期一 📅",
    source: "常用單字"
  },
  {
    sentence: "We have P.E. class on ___. I love running outside!",
    answer: "Tuesday",
    options: ["Tuesday", "Monday", "Thursday"],
    hint: "星期二 📅",
    source: "常用單字"
  },
  {
    sentence: "We cook lunch together every ___ at home.",
    answer: "Wednesday",
    options: ["Wednesday", "Tuesday", "Saturday"],
    hint: "星期三 📅",
    source: "常用單字"
  },
  {
    sentence: "Mom picks me up early every ___ for my piano lesson.",
    answer: "Thursday",
    options: ["Thursday", "Wednesday", "Sunday"],
    hint: "星期四 📅",
    source: "常用單字"
  },
  {
    sentence: "I am so happy because today is ___. The weekend is here!",
    answer: "Friday",
    options: ["Friday", "Monday", "Tuesday"],
    hint: "星期五 📅",
    source: "常用單字"
  },
  {
    sentence: "We go to the park every ___ morning as a family.",
    answer: "Saturday",
    options: ["Saturday", "Friday", "Wednesday"],
    hint: "星期六 📅",
    source: "常用單字"
  },
  {
    sentence: "We rest and go to grandma's house on ___.",
    answer: "Sunday",
    options: ["Sunday", "Saturday", "Thursday"],
    hint: "星期日 📅",
    source: "常用單字"
  },

  // ── 常用單字：月份 ──────────────────────────────────────────────────────
  {
    sentence: "The new year starts in ___. Everyone makes a wish!",
    answer: "January",
    options: ["January", "March", "October"],
    hint: "一月 🎆",
    source: "常用單字"
  },
  {
    sentence: "Valentine's Day is in ___. We give cards to our friends.",
    answer: "February",
    options: ["February", "January", "April"],
    hint: "二月 💝",
    source: "常用單字"
  },
  {
    sentence: "Spring arrives in ___. Flowers begin to bloom everywhere.",
    answer: "March",
    options: ["March", "February", "July"],
    hint: "三月 🌸",
    source: "常用單字"
  },
  {
    sentence: "It rains a lot in ___. I always bring my umbrella.",
    answer: "April",
    options: ["April", "June", "August"],
    hint: "四月 🌧️",
    source: "常用單字"
  },
  {
    sentence: "Mother's Day is in ___. I made a card for my mom.",
    answer: "May",
    options: ["May", "March", "September"],
    hint: "五月 🌹",
    source: "常用單字"
  },
  {
    sentence: "School ends in ___. Summer vacation is about to begin!",
    answer: "June",
    options: ["June", "May", "July"],
    hint: "六月 🎓",
    source: "常用單字"
  },
  {
    sentence: "It is very hot in ___. We love to swim in the pool.",
    answer: "July",
    options: ["July", "April", "November"],
    hint: "七月 ☀️",
    source: "常用單字"
  },
  {
    sentence: "We go to the beach every ___ because the weather is warm.",
    answer: "August",
    options: ["August", "December", "February"],
    hint: "八月 🏖️",
    source: "常用單字"
  },
  {
    sentence: "Leaves turn red and yellow in ___. Fall has arrived!",
    answer: "September",
    options: ["September", "June", "January"],
    hint: "九月 🍂",
    source: "常用單字"
  },
  {
    sentence: "Halloween is at the end of ___. I dress up as a witch!",
    answer: "October",
    options: ["October", "August", "March"],
    hint: "十月 🎃",
    source: "常用單字"
  },
  {
    sentence: "It gets cold in ___. I wear a thick coat to school.",
    answer: "November",
    options: ["November", "September", "May"],
    hint: "十一月 🧥",
    source: "常用單字"
  },
  {
    sentence: "Christmas is in ___. Santa brings presents for everyone!",
    answer: "December",
    options: ["December", "October", "July"],
    hint: "十二月 🎄",
    source: "常用單字"
  }

]; // end midtermQuestions
