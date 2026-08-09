// Daisy 單字資料
//
// curriculum 依「學期」分層。新學期只要在這裡加一組，並把 CURRENT_TERM 指過去，
// 遊戲選單、字典的來源標籤都會自動跟上 —— 不需要改任何頁面。
//
// 為什麼要分學期：一下有 Wk 2，二上也會有 Wk 2。沒有這一層的話，
// words["FET Spelling"]["Wk 2"] 會被後面的直接覆蓋，而且是靜默的。

const CURRENT_TERM = "1-2";

const curriculum = {
  "1-2": {
    label: "一下",
    lists: {
      "FET Spelling": {
        "Wk 2": [
          "beautiful",
          "calf",
          "graze",
          "forest",
          "angry",
          "catch",
          "sad",
          "promise",
          "grassy",
          "happy"
        ],
        "Wk 3": [
          "agree",
          "quickly",
          "return",
          "surprised",
          "pleased",
          "truth",
          "mad",
          "protect",
          "always",
          "promise"
        ],
        "Wk 4": [
          "school",
          "learn",
          "math",
          "problem",
          "important",
          "think",
          "art",
          "because",
          "creative",
          "imagination"
        ],
        "Wk 5": [
          "figure out",
          "amazing",
          "music",
          "concentrate",
          "remember",
          "teamwork",
          "reason",
          "best",
          "important",
          "learn"
        ],
        "Wk 6": [
          "baseball",
          "love",
          "sport",
          "college",
          "team",
          "allowed",
          "meet",
          "field",
          "cheer",
          "boo"
        ],
        "Wk 7": [
          "hard",
          "season",
          "become",
          "nasty",
          "teammate",
          "stand up",
          "admire",
          "die",
          "baseball",
          "sport"
        ],
        "Wk 10": [
          "memory",
          "discovers",
          "amaze",
          "wonder",
          "tunes",
          "alone",
          "struggle",
          "dream",
          "achieve",
          "world"
        ],
        "Wk 11/12": [
          "wonder",
          "whisper",
          "bones",
          "delight",
          "children",
          "mountain",
          "artist",
          "surround",
          "desert",
          "season"
        ],
        "Wk 13": [
          "autumn",
          "spring",
          "summer",
          "winter",
          "speckled",
          "woven",
          "showers",
          "sprout",
          "bloom",
          "spread"
        ],
        "Wk 14": [
          "slither",
          "barefoot",
          "flutter",
          "taste",
          "scurry",
          "scatter",
          "jacket",
          "secret",
          "honk",
          "store"
        ],
        "Wk 15": [
          "crisp",
          "gray",
          "rush",
          "spider",
          "weave",
          "chilly",
          "zip",
          "agree",
          "chipmunk",
          "dig"
        ],
        "Wk 16": [
          "autumn",
          "whisper",
          "fly",
          "shake",
          "spin",
          "dash",
          "empty",
          "jar",
          "fetch",
          "lie"
        ]
      },
      "CET Vocabulary": {
        "Wk 1&2": [
          "cool",
          "fun",
          "world",
          "mall",
          "picnic",
          "basket",
          "office",
          "shop",
          "fold",
          "cross"
        ],
        "Wk 3": [
          "come",
          "piano",
          "violin",
          "music",
          "building",
          "cover",
          "glass",
          "stair",
          "shell",
          "sink"
        ],
        "Wk 4": [
          "visit",
          "community",
          "bookshelf",
          "library",
          "real",
          "front",
          "garage",
          "create",
          "elephant",
          "climb"
        ],
        "Wk 5": [
          "country",
          "hear",
          "quiet",
          "mouse",
          "letter",
          "cousin",
          "pick",
          "excited",
          "imagine",
          "phone"
        ],
        "Wk 6": [
          "feet",
          "scary",
          "street",
          "skateboard",
          "zoom",
          "shout",
          "behind",
          "jump",
          "garbage",
          "can"
        ],
        "Wk 7&8": [
          "ambulance",
          "hospital",
          "city",
          "busy",
          "loud",
          "sick",
          "tomorrow",
          "soon",
          "later"
        ],
        "Wk 10": [
          "field",
          "museum",
          "dinosaur",
          "drawing",
          "model",
          "fossil",
          "alive",
          "trip",
          "break"
        ],
        "Wk 11": [
          "cow",
          "together",
          "puzzle",
          "about",
          "could",
          "show",
          "chicken",
          "four",
          "bird"
        ],
        "Wk 12": [
          "claw",
          "catch",
          "horn",
          "teeth",
          "ate",
          "clue",
          "flat",
          "other",
          "meat",
          "past"
        ],
        "Wk 13": [
          "sky",
          "cloud",
          "float",
          "plane",
          "over",
          "dream",
          "stretch",
          "pilot",
          "doctor",
          "silly"
        ],
        "Wk 14": [
          "train",
          "neighbor",
          "ask",
          "tough",
          "brave",
          "remind",
          "talented",
          "wait",
          "minute",
          "job"
        ],
        "Wk 15&16": [
          "trick",
          "fly",
          "flew",
          "learn",
          "start",
          "famous",
          "stop"
        ],
        "Wk 18": [
          "elf",
          "shoemaker",
          "imagination",
          "leather",
          "shed",
          "pair",
          "shiny",
          "peek"
        ]
      }
    }
  }
  // 二上： "2-1": { label: "二上", lists: { "FET Spelling": {...}, ... } }
};

// 不屬於任何學期、一直都用得到的字
const evergreen = {
  "常用單字": {
    "星期": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ],
    "月份": [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ]
  }
};

const wordEntries = {
  "figure out": { s:[{zh:"想出",z:["ㄒㄧㄤˇ","ㄔㄨ"]}] },
  "stand up": { s:[{zh:"站起來",z:["ㄓㄢˋ","ㄑㄧˇ","ㄌㄞ˙"]}] },
  "beautiful": { s:[{zh:"美麗的",z:["ㄇㄟˇ","ㄌㄧˋ","ㄉㄜ˙"]}] },
  "calf": { s:[{zh:"小牛",z:["ㄒㄧㄠˇ","ㄋㄧㄡˊ"]}] },
  "graze": { s:[{zh:"吃草",z:["ㄔ","ㄘㄠˇ"]}] },
  "forest": { s:[{zh:"森林",z:["ㄙㄣ","ㄌㄧㄣˊ"]}] },
  "angry": { s:[{zh:"生氣的",z:["ㄕㄥ","ㄑㄧˋ","ㄉㄜ˙"]}] },
  "catch": { s:[{zh:"抓",z:["ㄓㄨㄚ"]}] },
  "sad": { s:[{zh:"難過的",z:["ㄋㄢˊ","ㄍㄨㄛˋ","ㄉㄜ˙"]}] },
  "promise": { s:[{zh:"答應",z:["ㄉㄚ","ㄧㄥˋ"]}] },
  "grassy": { s:[{zh:"長滿草的",z:["ㄓㄤˇ","ㄇㄢˇ","ㄘㄠˇ","ㄉㄜ˙"]}] },
  "happy": { s:[{zh:"快樂的",z:["ㄎㄨㄞˋ","ㄌㄜˋ","ㄉㄜ˙"]}] },
  "agree": { s:[{zh:"同意",z:["ㄊㄨㄥˊ","ㄧˋ"]}] },
  "quickly": { s:[{zh:"快速地",z:["ㄎㄨㄞˋ","ㄙㄨˋ","ㄉㄜ˙"]}] },
  "return": { s:[{zh:"返回",z:["ㄈㄢˇ","ㄏㄨㄟˊ"]}] },
  "surprised": { s:[{zh:"驚訝的",z:["ㄐㄧㄥ","ㄧㄚˋ","ㄉㄜ˙"]}] },
  "pleased": { s:[{zh:"高興的",z:["ㄍㄠ","ㄒㄧㄥˋ","ㄉㄜ˙"]}] },
  "truth": { s:[{zh:"真相",z:["ㄓㄣ","ㄒㄧㄤˋ"]}] },
  "mad": { s:[{zh:"生氣的",z:["ㄕㄥ","ㄑㄧˋ","ㄉㄜ˙"]}] },
  "protect": { s:[{zh:"保護",z:["ㄅㄠˇ","ㄏㄨˋ"]}] },
  "always": { s:[{zh:"總是",z:["ㄗㄨㄥˇ","ㄕˋ"]}] },
  "school": { s:[{zh:"學校",z:["ㄒㄩㄝˊ","ㄒㄧㄠˋ"]}] },
  "learn": { s:[{zh:"學習",z:["ㄒㄩㄝˊ","ㄒㄧˊ"]}] },
  "math": { s:[{zh:"數學",z:["ㄕㄨˋ","ㄒㄩㄝˊ"]}] },
  "problem": { s:[{zh:"問題",z:["ㄨㄣˋ","ㄊㄧˊ"]}] },
  "important": { s:[{zh:"重要的",z:["ㄓㄨㄥˋ","ㄧㄠˋ","ㄉㄜ˙"]}] },
  "think": { s:[{zh:"思考",z:["ㄙ","ㄎㄠˇ"]}] },
  "art": { s:[{zh:"藝術",z:["ㄧˋ","ㄕㄨˋ"]}] },
  "because": { s:[{zh:"因為",z:["ㄧㄣ","ㄨㄟˋ"]}] },
  "creative": { s:[{zh:"有創意的",z:["ㄧㄡˇ","ㄔㄨㄤˋ","ㄧˋ","ㄉㄜ˙"]}] },
  "imagination": { s:[{zh:"想像力",z:["ㄒㄧㄤˇ","ㄒㄧㄤˋ","ㄌㄧˋ"]}] },
  "amazing": { s:[{zh:"驚人的",z:["ㄐㄧㄥ","ㄖㄣˊ","ㄉㄜ˙"]}] },
  "music": { s:[{zh:"音樂",z:["ㄧㄣ","ㄩㄝˋ"]}] },
  "concentrate": { s:[{zh:"專心",z:["ㄓㄨㄢ","ㄒㄧㄣ"]}] },
  "remember": { s:[{zh:"記得",z:["ㄐㄧˋ","ㄉㄜˊ"]}] },
  "teamwork": { s:[{zh:"團隊合作",z:["ㄊㄨㄢˊ","ㄉㄨㄟˋ","ㄏㄜˊ","ㄗㄨㄛˋ"]}] },
  "reason": { s:[{zh:"理由",z:["ㄌㄧˇ","ㄧㄡˊ"]}] },
  "best": { s:[{zh:"最好的",z:["ㄗㄨㄟˋ","ㄏㄠˇ","ㄉㄜ˙"]}] },
  "baseball": { s:[{zh:"棒球",z:["ㄅㄤˋ","ㄑㄧㄡˊ"]}] },
  "love": { s:[{zh:"愛",z:["ㄞˋ"]}] },
  "sport": { s:[{zh:"運動",z:["ㄩㄣˋ","ㄉㄨㄥˋ"]}] },
  "college": { s:[{zh:"大學",z:["ㄉㄚˋ","ㄒㄩㄝˊ"]}] },
  "team": { s:[{zh:"隊伍",z:["ㄉㄨㄟˋ","ㄨˇ"]}] },
  "allowed": { s:[{zh:"允許的",z:["ㄩㄣˇ","ㄒㄩˇ","ㄉㄜ˙"]}] },
  "meet": { s:[{zh:"遇見",z:["ㄩˋ","ㄐㄧㄢˋ"]}] },
  "field": { s:[{zh:"原野",z:["ㄩㄢˊ","ㄧㄝˇ"]},{zh:"球場",z:["ㄑㄧㄡˊ","ㄔㄤˇ"]}] },
  "cheer": { s:[{zh:"歡呼",z:["ㄏㄨㄢ","ㄏㄨ"]}] },
  "boo": { s:[{zh:"噓聲",z:["ㄒㄩ","ㄕㄥ"]}] },
  "memory": { s:[{zh:"記憶",z:["ㄐㄧˋ","ㄧˋ"]}] },
  "discovers": { s:[{zh:"發現",z:["ㄈㄚ","ㄒㄧㄢˋ"]}] },
  "amaze": { s:[{zh:"使驚訝",z:["ㄕˇ","ㄐㄧㄥ","ㄧㄚˋ"]}] },
  "wonder": { s:[{zh:"奇蹟",z:["ㄑㄧˊ","ㄐㄧ"]},{zh:"想知道",z:["ㄒㄧㄤˇ","ㄓ","ㄉㄠˋ"]}] },
  "tunes": { s:[{zh:"曲調",z:["ㄑㄩˇ","ㄉㄧㄠˋ"]}] },
  "alone": { s:[{zh:"單獨的",z:["ㄉㄢ","ㄉㄨˊ","ㄉㄜ˙"]}] },
  "struggle": { s:[{zh:"掙扎",z:["ㄓㄥ","ㄓㄚˊ"]}] },
  "dream": { s:[{zh:"夢想",z:["ㄇㄥˋ","ㄒㄧㄤˇ"]}] },
  "achieve": { s:[{zh:"達成",z:["ㄉㄚˊ","ㄔㄥˊ"]}] },
  "world": { s:[{zh:"世界",z:["ㄕˋ","ㄐㄧㄝˋ"]}] },
  "whisper": { s:[{zh:"耳語",z:["ㄦˇ","ㄩˇ"]}] },
  "bones": { s:[{zh:"骨頭",z:["ㄍㄨˇ","ㄊㄡ˙"]}] },
  "delight": { s:[{zh:"愉快",z:["ㄩˊ","ㄎㄨㄞˋ"]}] },
  "children": { s:[{zh:"孩子們",z:["ㄏㄞˊ","ㄗ˙","ㄇㄣ˙"]}] },
  "mountain": { s:[{zh:"山",z:["ㄕㄢ"]}] },
  "artist": { s:[{zh:"藝術家",z:["ㄧˋ","ㄕㄨˋ","ㄐㄧㄚ"]}] },
  "surround": { s:[{zh:"圍繞",z:["ㄨㄟˊ","ㄖㄠˋ"]}] },
  "desert": { s:[{zh:"沙漠",z:["ㄕㄚ","ㄇㄛˋ"]}] },
  "season": { s:[{zh:"季節",z:["ㄐㄧˋ","ㄐㄧㄝˊ"]}] },
  "autumn": { s:[{zh:"秋天",z:["ㄑㄧㄡ","ㄊㄧㄢ"]}] },
  "spring": { s:[{zh:"春天",z:["ㄔㄨㄣ","ㄊㄧㄢ"]}] },
  "summer": { s:[{zh:"夏天",z:["ㄒㄧㄚˋ","ㄊㄧㄢ"]}] },
  "winter": { s:[{zh:"冬天",z:["ㄉㄨㄥ","ㄊㄧㄢ"]}] },
  "speckled": { s:[{zh:"有斑點的",z:["ㄧㄡˇ","ㄅㄢ","ㄉㄧㄢˇ","ㄉㄜ˙"]}] },
  "woven": { s:[{zh:"編織的",z:["ㄅㄧㄢ","ㄓ","ㄉㄜ˙"]}] },
  "showers": { s:[{zh:"陣雨",z:["ㄓㄣˋ","ㄩˇ"]}] },
  "sprout": { s:[{zh:"發芽",z:["ㄈㄚ","ㄧㄚˊ"]}] },
  "bloom": { s:[{zh:"開花",z:["ㄎㄞ","ㄏㄨㄚ"]}] },
  "spread": { s:[{zh:"傳播",z:["ㄔㄨㄢˊ","ㄅㄛˋ"]}] },
  "slither": { s:[{zh:"滑行",z:["ㄏㄨㄚˊ","ㄒㄧㄥˊ"]}] },
  "barefoot": { s:[{zh:"赤腳",z:["ㄔˋ","ㄐㄧㄠˇ"]}] },
  "flutter": { s:[{zh:"拍翅",z:["ㄆㄞ","ㄔˋ"]}] },
  "taste": { s:[{zh:"味道",z:["ㄨㄟˋ","ㄉㄠˋ"]}] },
  "scurry": { s:[{zh:"碎步快跑",z:["ㄙㄨㄟˋ","ㄅㄨˋ","ㄎㄨㄞˋ","ㄆㄠˇ"]}] },
  "scatter": { s:[{zh:"散開",z:["ㄙㄢˋ","ㄎㄞ"]}] },
  "jacket": { s:[{zh:"夾克",z:["ㄐㄧㄚˊ","ㄎㄜˋ"]}] },
  "secret": { s:[{zh:"秘密",z:["ㄇㄧˋ","ㄇㄧˋ"]}] },
  "honk": { s:[{zh:"喇叭聲",z:["ㄌㄚˇ","ㄅㄚ","ㄕㄥ"]}] },
  "store": { s:[{zh:"商店",z:["ㄕㄤ","ㄉㄧㄢˋ"]}] },
  "crisp": { s:[{zh:"清爽的",z:["ㄑㄧㄥ","ㄕㄨㄤˇ","ㄉㄜ˙"]}] },
  "gray": { s:[{zh:"灰色的",z:["ㄏㄨㄟ","ㄙㄜˋ","ㄉㄜ˙"]}] },
  "rush": { s:[{zh:"急動",z:["ㄐㄧˊ","ㄉㄨㄥˋ"]}] },
  "spider": { s:[{zh:"蜘蛛",z:["ㄓ","ㄓㄨ"]}] },
  "weave": { s:[{zh:"編織",z:["ㄅㄧㄢ","ㄓ"]}] },
  "chilly": { s:[{zh:"寒冷的",z:["ㄏㄢˊ","ㄌㄥˇ","ㄉㄜ˙"]}] },
  "zip": { s:[{zh:"拉鍊",z:["ㄌㄚ","ㄌㄧㄢˋ"]}] },
  "chipmunk": { s:[{zh:"花栗鼠",z:["ㄏㄨㄚ","ㄌㄧˋ","ㄕㄨˇ"]}] },
  "dig": { s:[{zh:"挖",z:["ㄨㄚ"]}] },
  "fly": { s:[{zh:"飛",z:["ㄈㄟ"]}] },
  "shake": { s:[{zh:"搖動",z:["ㄧㄠˊ","ㄉㄨㄥˋ"]}] },
  "spin": { s:[{zh:"旋轉",z:["ㄒㄩㄢˊ","ㄓㄨㄢˇ"]}] },
  "dash": { s:[{zh:"衝刺",z:["ㄔㄨㄥ","ㄘˋ"]}] },
  "empty": { s:[{zh:"空的",z:["ㄎㄨㄥ","ㄉㄜ˙"]}] },
  "jar": { s:[{zh:"罐子",z:["ㄍㄨㄢˋ","ㄗ˙"]}] },
  "fetch": { s:[{zh:"拿來",z:["ㄋㄚˊ","ㄌㄞˊ"]}] },
  "lie": { s:[{zh:"躺",z:["ㄊㄤˇ"]},{zh:"說謊",z:["ㄕㄨㄛ","ㄏㄨㄤˇ"]}] },
  "hard": { s:[{zh:"困難的",z:["ㄎㄨㄣˋ","ㄋㄢˊ","ㄉㄜ˙"]},{zh:"硬的",z:["ㄧㄥˋ","ㄉㄜ˙"]}] },
  "become": { s:[{zh:"變成",z:["ㄅㄧㄢˋ","ㄔㄥˊ"]}] },
  "nasty": { s:[{zh:"糟糕的",z:["ㄗㄠ","ㄍㄠ","ㄉㄜ˙"]}] },
  "teammate": { s:[{zh:"隊友",z:["ㄉㄨㄟˋ","ㄧㄡˇ"]}] },
  "stand": { s:[{zh:"站起來",z:["ㄓㄢˋ","ㄑㄧˇ","ㄌㄞˊ"]}] },
  "admire": { s:[{zh:"欣賞",z:["ㄒㄧㄣ","ㄕㄤˇ"]},{zh:"欽佩",z:["ㄑㄧㄣ","ㄆㄟˋ"]}] },
  "die": { s:[{zh:"死亡",z:["ㄙˇ","ㄨㄤˊ"]}] },
  "cool": { s:[{zh:"酷的",z:["ㄎㄨˋ","ㄉㄜ˙"]}] },
  "fun": { s:[{zh:"有趣的",z:["ㄧㄡˇ","ㄑㄩˋ","ㄉㄜ˙"]}] },
  "mall": { s:[{zh:"購物中心",z:["ㄍㄡˋ","ㄨˋ","ㄓㄨㄥ","ㄒㄧㄣ"]}] },
  "picnic": { s:[{zh:"野餐",z:["ㄧㄝˇ","ㄘㄢ"]}] },
  "basket": { s:[{zh:"籃子",z:["ㄌㄢˊ","ㄗ˙"]}] },
  "office": { s:[{zh:"辦公室",z:["ㄅㄢˋ","ㄍㄨㄥ","ㄕˋ"]}] },
  "shop": { s:[{zh:"商店",z:["ㄕㄤ","ㄉㄧㄢˋ"]}] },
  "fold": { s:[{zh:"摺疊",z:["ㄓㄜˊ","ㄉㄧㄝˊ"]}] },
  "cross": { s:[{zh:"越過",z:["ㄩㄝˋ","ㄍㄨㄛˋ"]}] },
  "come": { s:[{zh:"來",z:["ㄌㄞˊ"]}] },
  "piano": { s:[{zh:"鋼琴",z:["ㄍㄤ","ㄑㄧㄣˊ"]}] },
  "violin": { s:[{zh:"小提琴",z:["ㄒㄧㄠˇ","ㄊㄧˊ","ㄑㄧㄣˊ"]}] },
  "building": { s:[{zh:"建築物",z:["ㄐㄧㄢˋ","ㄓㄨˊ","ㄨˋ"]}] },
  "cover": { s:[{zh:"覆蓋",z:["ㄈㄨˋ","ㄍㄞˋ"]}] },
  "glass": { s:[{zh:"玻璃",z:["ㄅㄛ","ㄌㄧˊ"]}] },
  "stair": { s:[{zh:"樓梯",z:["ㄌㄡˊ","ㄊㄧ"]}] },
  "shell": { s:[{zh:"貝殼",z:["ㄅㄟˋ","ㄎㄜˊ"]}] },
  "sink": { s:[{zh:"水槽",z:["ㄕㄨㄟˇ","ㄘㄠˊ"]}] },
  "visit": { s:[{zh:"拜訪",z:["ㄅㄞˋ","ㄈㄤˇ"]}] },
  "community": { s:[{zh:"社區",z:["ㄕㄜˋ","ㄑㄩ"]}] },
  "bookshelf": { s:[{zh:"書架",z:["ㄕㄨ","ㄐㄧㄚˋ"]}] },
  "library": { s:[{zh:"圖書館",z:["ㄊㄨˊ","ㄕㄨ","ㄍㄨㄢˇ"]}] },
  "real": { s:[{zh:"真實的",z:["ㄓㄣ","ㄕˊ","ㄉㄜ˙"]}] },
  "front": { s:[{zh:"前面",z:["ㄑㄧㄢˊ","ㄇㄧㄢˋ"]}] },
  "garage": { s:[{zh:"車庫",z:["ㄔㄜ","ㄎㄨˋ"]}] },
  "create": { s:[{zh:"創造",z:["ㄔㄨㄤˋ","ㄗㄠˋ"]}] },
  "elephant": { s:[{zh:"大象",z:["ㄉㄚˋ","ㄒㄧㄤˋ"]}] },
  "climb": { s:[{zh:"爬",z:["ㄆㄚˊ"]}] },
  "country": { s:[{zh:"國家",z:["ㄍㄨㄛˊ","ㄐㄧㄚ"]},{zh:"鄉村",z:["ㄒㄧㄤ","ㄘㄨㄣ"]}] },
  "hear": { s:[{zh:"聽見",z:["ㄊㄧㄥ","ㄐㄧㄢˋ"]}] },
  "quiet": { s:[{zh:"安靜的",z:["ㄢ","ㄐㄧㄥˋ","ㄉㄜ˙"]}] },
  "mouse": { s:[{zh:"老鼠",z:["ㄌㄠˇ","ㄕㄨˇ"]}] },
  "letter": { s:[{zh:"信",z:["ㄒㄧㄣˋ"]},{zh:"字母",z:["ㄗˋ","ㄇㄨˇ"]}] },
  "cousin": { s:[{zh:"堂表親",z:["ㄊㄤˊ","ㄅㄧㄠˇ","ㄑㄧㄣ"]}] },
  "pick": { s:[{zh:"撿",z:["ㄐㄧㄢˇ"]}] },
  "excited": { s:[{zh:"興奮的",z:["ㄒㄧㄥ","ㄈㄣˋ","ㄉㄜ˙"]}] },
  "imagine": { s:[{zh:"想像",z:["ㄒㄧㄤˇ","ㄒㄧㄤˋ"]}] },
  "phone": { s:[{zh:"電話",z:["ㄉㄧㄢˋ","ㄏㄨㄚˋ"]}] },
  "feet": { s:[{zh:"腳",z:["ㄐㄧㄠˇ"]}] },
  "scary": { s:[{zh:"可怕的",z:["ㄎㄜˇ","ㄆㄚˋ","ㄉㄜ˙"]}] },
  "street": { s:[{zh:"街道",z:["ㄐㄧㄝ","ㄉㄠˋ"]}] },
  "skateboard": { s:[{zh:"滑板",z:["ㄏㄨㄚˊ","ㄅㄢˇ"]}] },
  "zoom": { s:[{zh:"快速移動",z:["ㄎㄨㄞˋ","ㄙㄨˋ","ㄧˊ","ㄉㄨㄥˋ"]}] },
  "shout": { s:[{zh:"大喊",z:["ㄉㄚˋ","ㄏㄢˇ"]}] },
  "behind": { s:[{zh:"在……後面",z:["ㄗㄞˋ","","","ㄏㄡˋ","ㄇㄧㄢ˙"]}] },
  "jump": { s:[{zh:"跳",z:["ㄊㄧㄠˋ"]}] },
  "garbage": { s:[{zh:"垃圾",z:["ㄌㄜˋ","ㄙㄜˋ"]}] },
  "can": { s:[{zh:"可以",z:["ㄎㄜˇ","ㄧˇ"]},{zh:"罐子",z:["ㄍㄨㄢˋ","ㄗ˙"]}] },
  "ambulance": { s:[{zh:"救護車",z:["ㄐㄧㄡˋ","ㄏㄨˋ","ㄔㄜ"]}] },
  "hospital": { s:[{zh:"醫院",z:["ㄧ","ㄩㄢˋ"]}] },
  "city": { s:[{zh:"城市",z:["ㄔㄥˊ","ㄕˋ"]}] },
  "busy": { s:[{zh:"忙碌的",z:["ㄇㄤˊ","ㄌㄨˋ","ㄉㄜ˙"]}] },
  "loud": { s:[{zh:"大聲的",z:["ㄉㄚˋ","ㄕㄥ","ㄉㄜ˙"]}] },
  "sick": { s:[{zh:"生病的",z:["ㄕㄥ","ㄅㄧㄥˋ","ㄉㄜ˙"]}] },
  "tomorrow": { s:[{zh:"明天",z:["ㄇㄧㄥˊ","ㄊㄧㄢ"]}] },
  "soon": { s:[{zh:"很快地",z:["ㄏㄣˇ","ㄎㄨㄞˋ","ㄉㄜ˙"]}] },
  "later": { s:[{zh:"稍後",z:["ㄕㄠ","ㄏㄡˋ"]}] },
  "museum": { s:[{zh:"博物館",z:["ㄅㄛˊ","ㄨˋ","ㄍㄨㄢˇ"]}] },
  "dinosaur": { s:[{zh:"恐龍",z:["ㄎㄨㄥˇ","ㄌㄨㄥˊ"]}] },
  "drawing": { s:[{zh:"畫畫",z:["ㄏㄨㄚˋ","ㄏㄨㄚˋ"]}] },
  "model": { s:[{zh:"模型",z:["ㄇㄛˊ","ㄒㄧㄥˊ"]}] },
  "fossil": { s:[{zh:"化石",z:["ㄏㄨㄚˋ","ㄕˊ"]}] },
  "alive": { s:[{zh:"活著的",z:["ㄏㄨㄛˊ","ㄓㄜ˙","ㄉㄜ˙"]}] },
  "trip": { s:[{zh:"旅行",z:["ㄌㄩˇ","ㄒㄧㄥˊ"]}] },
  "break": { s:[{zh:"休息",z:["ㄒㄧㄡ","ㄒㄧˊ"]}] },
  "cow": { s:[{zh:"母牛",z:["ㄇㄨˇ","ㄋㄧㄡˊ"]}] },
  "together": { s:[{zh:"一起",z:["ㄧˋ","ㄑㄧˇ"]}] },
  "puzzle": { s:[{zh:"拼圖",z:["ㄆㄧㄣ","ㄊㄨˊ"]}] },
  "about": { s:[{zh:"關於",z:["ㄍㄨㄢ","ㄩˊ"]}] },
  "could": { s:[{zh:"可以",z:["ㄎㄜˇ","ㄧˇ"]}] },
  "show": { s:[{zh:"顯示",z:["ㄒㄧㄢˇ","ㄕˋ"]}] },
  "chicken": { s:[{zh:"雞",z:["ㄐㄧ"]}] },
  "four": { s:[{zh:"四",z:["ㄙˋ"]}] },
  "bird": { s:[{zh:"鳥",z:["ㄋㄧㄠˇ"]}] },
  "claw": { s:[{zh:"爪子",z:["ㄓㄨㄚˇ","ㄗ˙"]}] },
  "horn": { s:[{zh:"角",z:["ㄐㄧㄠˇ"]}] },
  "teeth": { s:[{zh:"牙齒",z:["ㄧㄚˊ","ㄔˇ"]}] },
  "ate": { s:[{zh:"吃",z:["ㄔ"],note:"過去式"}] },
  "clue": { s:[{zh:"線索",z:["ㄒㄧㄢˋ","ㄙㄨㄛˇ"]}] },
  "flat": { s:[{zh:"平的",z:["ㄆㄧㄥˊ","ㄉㄜ˙"]}] },
  "other": { s:[{zh:"其他的",z:["ㄑㄧˊ","ㄊㄚ","ㄉㄜ˙"]}] },
  "meat": { s:[{zh:"肉",z:["ㄖㄡˋ"]}] },
  "past": { s:[{zh:"過去",z:["ㄍㄨㄛˋ","ㄑㄩˋ"]}] },
  "sky": { s:[{zh:"天空",z:["ㄊㄧㄢ","ㄎㄨㄥ"]}] },
  "cloud": { s:[{zh:"雲",z:["ㄩㄣˊ"]}] },
  "float": { s:[{zh:"漂浮",z:["ㄆㄧㄠ","ㄈㄨˊ"]}] },
  "plane": { s:[{zh:"飛機",z:["ㄈㄟ","ㄐㄧ"]}] },
  "over": { s:[{zh:"在……上方",z:["ㄗㄞˋ","","","ㄕㄤˋ","ㄈㄤ"]}] },
  "stretch": { s:[{zh:"伸展",z:["ㄕㄣ","ㄓㄢˇ"]}] },
  "pilot": { s:[{zh:"飛行員",z:["ㄈㄟ","ㄒㄧㄥˊ","ㄩㄢˊ"]}] },
  "doctor": { s:[{zh:"醫生",z:["ㄧ","ㄕㄥ"]}] },
  "silly": { s:[{zh:"傻的",z:["ㄕㄚˇ","ㄉㄜ˙"]}] },
  "train": { s:[{zh:"火車",z:["ㄏㄨㄛˇ","ㄔㄜ"]}] },
  "neighbor": { s:[{zh:"鄰居",z:["ㄌㄧㄣˊ","ㄐㄩ"]}] },
  "ask": { s:[{zh:"問",z:["ㄨㄣˋ"]}] },
  "tough": { s:[{zh:"堅強的",z:["ㄐㄧㄢ","ㄑㄧㄤˊ","ㄉㄜ˙"]}] },
  "brave": { s:[{zh:"勇敢的",z:["ㄩㄥˇ","ㄍㄢˇ","ㄉㄜ˙"]}] },
  "remind": { s:[{zh:"提醒",z:["ㄊㄧˊ","ㄒㄧㄥˇ"]}] },
  "talented": { s:[{zh:"有天賦的",z:["ㄧㄡˇ","ㄊㄧㄢ","ㄈㄨˋ","ㄉㄜ˙"]}] },
  "wait": { s:[{zh:"等待",z:["ㄉㄥˇ","ㄉㄞˋ"]}] },
  "minute": { s:[{zh:"分鐘",z:["ㄈㄣ","ㄓㄨㄥ"]}] },
  "job": { s:[{zh:"工作",z:["ㄍㄨㄥ","ㄗㄨㄛˋ"]}] },
  "trick": { s:[{zh:"把戲",z:["ㄅㄚˇ","ㄒㄧˋ"]}] },
  "flew": { s:[{zh:"飛",z:["ㄈㄟ"],note:"過去式"}] },
  "start": { s:[{zh:"開始",z:["ㄎㄞ","ㄕˇ"]}] },
  "famous": { s:[{zh:"有名的",z:["ㄧㄡˇ","ㄇㄧㄥˊ","ㄉㄜ˙"]}] },
  "stop": { s:[{zh:"停止",z:["ㄊㄧㄥˊ","ㄓˇ"]}] },
  "elf": { s:[{zh:"精靈",z:["ㄐㄧㄥ","ㄌㄧㄥˊ"]}] },
  "shoemaker": { s:[{zh:"鞋匠",z:["ㄒㄧㄝˊ","ㄐㄧㄤˋ"]}] },
  "leather": { s:[{zh:"皮革",z:["ㄆㄧˊ","ㄍㄜˊ"]}] },
  "shed": { s:[{zh:"小屋",z:["ㄒㄧㄠˇ","ㄨ"]}] },
  "pair": { s:[{zh:"一對",z:["ㄧˊ","ㄉㄨㄟˋ"]}] },
  "shiny": { s:[{zh:"閃亮的",z:["ㄕㄢˇ","ㄌㄧㄤˋ","ㄉㄜ˙"]}] },
  "peek": { s:[{zh:"偷看",z:["ㄊㄡ","ㄎㄢˋ"]}] },
  "Monday": { s:[{zh:"星期一",z:["ㄒㄧㄥ","ㄑㄧˊ","ㄧ"]}] },
  "Tuesday": { s:[{zh:"星期二",z:["ㄒㄧㄥ","ㄑㄧˊ","ㄦˋ"]}] },
  "Wednesday": { s:[{zh:"星期三",z:["ㄒㄧㄥ","ㄑㄧˊ","ㄙㄢ"]}] },
  "Thursday": { s:[{zh:"星期四",z:["ㄒㄧㄥ","ㄑㄧˊ","ㄙˋ"]}] },
  "Friday": { s:[{zh:"星期五",z:["ㄒㄧㄥ","ㄑㄧˊ","ㄨˇ"]}] },
  "Saturday": { s:[{zh:"星期六",z:["ㄒㄧㄥ","ㄑㄧˊ","ㄌㄧㄡˋ"]}] },
  "Sunday": { s:[{zh:"星期日",z:["ㄒㄧㄥ","ㄑㄧˊ","ㄖˋ"]}] },
  "January": { s:[{zh:"一月",z:["ㄧ","ㄩㄝˋ"]}] },
  "February": { s:[{zh:"二月",z:["ㄦˋ","ㄩㄝˋ"]}] },
  "March": { s:[{zh:"三月",z:["ㄙㄢ","ㄩㄝˋ"]}] },
  "April": { s:[{zh:"四月",z:["ㄙˋ","ㄩㄝˋ"]}] },
  "May": { s:[{zh:"五月",z:["ㄨˇ","ㄩㄝˋ"]}] },
  "June": { s:[{zh:"六月",z:["ㄌㄧㄡˋ","ㄩㄝˋ"]}] },
  "July": { s:[{zh:"七月",z:["ㄑㄧ","ㄩㄝˋ"]}] },
  "August": { s:[{zh:"八月",z:["ㄅㄚ","ㄩㄝˋ"]}] },
  "September": { s:[{zh:"九月",z:["ㄐㄧㄡˇ","ㄩㄝˋ"]}] },
  "October": { s:[{zh:"十月",z:["ㄕˊ","ㄩㄝˋ"]}] },
  "November": { s:[{zh:"十一月",z:["ㄕˊ","ㄧ","ㄩㄝˋ"]}] },
  "December": { s:[{zh:"十二月",z:["ㄕˊ","ㄦˋ","ㄩㄝˋ"]}] }
};

// ---- 以下都是推導出來的，不要手動維護 ----

// 遊戲讀的還是這個扁平結構，所以四個遊戲一行都不用改。
// 順序：本學期 -> 常用 -> 以前學過的（新的在前）
function activeTerm() {
  if (curriculum[CURRENT_TERM]) return CURRENT_TERM;
  // 很容易先把 CURRENT_TERM 改成新學期、資料卻還沒貼進來。
  // 沒有這個保護的話，本學期的清單會整個消失而且不會報錯。
  const fallback = Object.keys(curriculum).sort().pop();
  if (typeof console !== "undefined") {
    console.warn(`words.js: CURRENT_TERM "${CURRENT_TERM}" 在 curriculum 裡找不到，暫時改用 "${fallback}"`);
  }
  return fallback;
}

// 每個清單都標學期，本學期的也標 —— 不然「FET Spelling」到底是哪一學期
// 的看不出來，而她同時看得到兩個學期的清單。
function buildWords() {
  const out = {};
  const active = activeTerm();
  const cur = curriculum[active];
  if (cur) for (const [list, weeks] of Object.entries(cur.lists)) out[`${cur.label} · ${list}`] = weeks;
  for (const [name, weeks] of Object.entries(evergreen)) out[name] = weeks;
  for (const [term, t] of Object.entries(curriculum).sort().reverse()) {
    if (term === active) continue;
    for (const [list, weeks] of Object.entries(t.lists)) out[`${t.label} · ${list}`] = weeks;
  }
  return out;
}

const words = buildWords();

// 一個字出自哪些地方。即時推導，加學期時不會有一份資料忘了同步。
function wordSources(word) {
  const w = String(word).toLowerCase();
  const hits = [];
  const scan = (prefix, lists) => {
    for (const [list, weeks] of Object.entries(lists))
      for (const [wk, ws] of Object.entries(weeks))
        if (ws.some((x) => x.toLowerCase() === w))
          hits.push({ term: prefix.term, label: prefix.label, list, week: wk,
                      text: (prefix.label ? prefix.label + " · " : "") + list + " / " + wk });
  };
  for (const [term, t] of Object.entries(curriculum)) scan({ term, label: t.label }, t.lists);
  scan({ term: null, label: "" }, evergreen);
  return hits;
}

function isCurrentTerm(word) {
  const active = activeTerm();
  return wordSources(word).some((s) => s.term === active || s.term === null);
}

// ---- 向後相容層：組回舊的 "中文 (ㄅㄆㄇ)" 字串 ----
function formatSense(s) {
  const zy = s.z.filter(Boolean).join(" ");
  return s.zh + (zy ? " (" + zy + ")" : "") + (s.note ? "〔" + s.note + "〕" : "");
}

const wordTranslations = {};
for (const [w, e] of Object.entries(wordEntries)) {
  const text = e.s.map(formatSense).join(" / ");
  wordTranslations[w] = text;
  // 遊戲是用 wordTranslations[word.toLowerCase()] 查表，但 Monday~Sunday /
  // January~December 這 19 個 key 是大寫開頭，原本永遠查不到。補上小寫別名。
  wordTranslations[w.toLowerCase()] = text;
}

function lookupWord(word) {
  const w = String(word).trim();
  return wordEntries[w] || wordEntries[w.toLowerCase()] ||
         Object.entries(wordEntries).find(([k]) => k.toLowerCase() === w.toLowerCase())?.[1] || null;
}
