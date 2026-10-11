// myon_data.js — Continents and Oceans 讀本的句子與單字資料
//
// 課本：Continents and Oceans, Nancy Kelly Allen, Rubicon Publishing, Level H
// 這是她 CET Wk 5/6/7 的課文來源（那三十個字 100% 出自這一本）。
//
// 四個頁面共用這一份：閱讀頁、理解測驗、聽寫克漏字、選擇克漏字。
// 資料放一份，頁面只管怎麼呈現。
//
// sentences: { id, raw 英文, zh 中譯, zy 注音, ks 這句用到的關鍵字, note? 文法註解 }
// vocab:     { b 原形, f 課文中的形態, kk, ipa, zh, zy, c 分類, t 記憶點, pos 詞性 }

const MYON = {
  sentences: [
 {
  "id": 1,
  "raw": "Earth is sometimes called the blue planet.",
  "zh": "地球有時被稱為藍色星球。",
  "zy": "ㄉㄧˋ ㄑㄧㄡˊ ㄧㄡˇ ㄕˊ ㄅㄟˋ ㄔㄥ ㄨㄟˊ ㄌㄢˊ ㄙㄜˋ ㄒㄧㄥ ㄑㄧㄡˊ",
  "ks": [
   "Earth",
   "planet"
  ]
 },
 {
  "id": 2,
  "raw": "Almost three-quarters of Earth's surface is water.",
  "zh": "地球表面將近四分之三是水。",
  "zy": "ㄉㄧˋ ㄑㄧㄡˊ ㄅㄧㄠˇ ㄇㄧㄢˋ ㄐㄧㄤ ㄐㄧㄣˋ ㄙˋ ㄈㄣ ㄓ ㄙㄢ ㄕˋ ㄕㄨㄟˇ",
  "ks": [
   "Earth",
   "surface",
   "water",
   "three-quarters"
  ]
 },
 {
  "id": 3,
  "raw": "From space, the water looks blue.",
  "zh": "從太空看，水看起來是藍色的。",
  "zy": "ㄘㄨㄥˊ ㄊㄞˋ ㄎㄨㄥ ㄎㄢˋ ㄕㄨㄟˇ ㄎㄢˋ ㄑㄧˇ ㄌㄞˊ ㄕˋ ㄌㄢˊ ㄙㄜˋ ㄉㄜ˙",
  "ks": [
   "space",
   "water"
  ]
 },
 {
  "id": 4,
  "raw": "All land on Earth is divided into seven large pieces.",
  "zh": "地球上所有的陸地被分成七個大塊。",
  "zy": "ㄉㄧˋ ㄑㄧㄡˊ ㄕㄤˋ ㄙㄨㄛˇ ㄧㄡˇ ㄉㄜ˙ ㄌㄨˋ ㄉㄧˋ ㄅㄟˋ ㄈㄣ ㄔㄥˊ ㄑㄧ ㄍㄜ˙ ㄉㄚˋ ㄎㄨㄞˋ",
  "ks": [
   "land",
   "Earth",
   "divide",
   "piece"
  ]
 },
 {
  "id": 5,
  "raw": "These pieces are called continents.",
  "zh": "這些大塊被稱為大陸。",
  "zy": "ㄓㄜˋ ㄒㄧㄝ ㄉㄚˋ ㄎㄨㄞˋ ㄅㄟˋ ㄔㄥ ㄨㄟˊ ㄉㄚˋ ㄌㄨˋ",
  "ks": [
   "piece",
   "continent"
  ]
 },
 {
  "id": 6,
  "raw": "The seven continents are Asia, Africa, North America, South America, Antarctica, Europe, and Australia.",
  "zh": "七大洲是亞洲、非洲、北美洲、南美洲、南極洲、歐洲和澳洲。",
  "zy": "ㄑㄧ ㄉㄚˋ ㄓㄡ ㄕˋ ㄧㄚˋ ㄓㄡ ㄈㄟ ㄓㄡ ㄅㄟˇ ㄇㄟˇ ㄓㄡ ㄋㄢˊ ㄇㄟˇ ㄓㄡ ㄋㄢˊ ㄐㄧˊ ㄓㄡ ㄡ ㄓㄡ ㄏㄢˊ ㄠˋ ㄓㄡ",
  "ks": [
   "continent",
   "Asia",
   "Africa",
   "North America",
   "South America",
   "Antarctica",
   "Europe",
   "Australia"
  ]
 },
 {
  "id": 7,
  "raw": "Landforms are natural features on Earth.",
  "zh": "地形是地球上自然的地貌特徵。",
  "zy": "ㄉㄧˋ ㄒㄧㄥˊ ㄕˋ ㄉㄧˋ ㄑㄧㄡˊ ㄕㄤˋ ㄗˋ ㄖㄢˊ ㄉㄜ˙ ㄉㄧˋ ㄇㄠˋ ㄊㄜˋ ㄓㄥ",
  "ks": [
   "landform",
   "natural",
   "feature",
   "Earth"
  ]
 },
 {
  "id": 8,
  "raw": "They are made of rocks and dirt.",
  "zh": "它們由岩石和泥土構成。",
  "zy": "ㄊㄚ ㄇㄣ˙ ㄧㄡˊ ㄧㄢˊ ㄕˊ ㄏㄢˊ ㄋㄧˊ ㄊㄨˇ ㄍㄡˋ ㄔㄥˊ",
  "ks": [
   "rock",
   "dirt"
  ]
 },
 {
  "id": 9,
  "raw": "A mountain is a landform.",
  "zh": "山是一種地形。",
  "zy": "ㄕㄢ ㄕˋ ㄧ ㄓㄨㄥˇ ㄉㄧˋ ㄒㄧㄥˊ",
  "ks": [
   "mountain",
   "landform"
  ]
 },
 {
  "id": 10,
  "raw": "Mount Everest is one of the world's tallest mountains.",
  "zh": "聖母峰是世界上最高的山之一。",
  "zy": "ㄕㄥˋ ㄇㄨˇ ㄈㄥ ㄕˋ ㄕˋ ㄐㄧㄝˋ ㄕㄤˋ ㄗㄨㄟˋ ㄍㄠ ㄉㄜ˙ ㄕㄢ ㄓ ㄧ",
  "ks": [
   "mountain"
  ]
 },
 {
  "id": 11,
  "raw": "A valley is another landform.",
  "zh": "山谷是另一種地形。",
  "zy": "ㄕㄢ ㄍㄨˇ ㄕˋ ㄌㄧㄥˋ ㄧ ㄓㄨㄥˇ ㄉㄧˋ ㄒㄧㄥˊ",
  "ks": [
   "valley",
   "landform"
  ]
 },
 {
  "id": 12,
  "raw": "Valleys are long areas of low land.",
  "zh": "山谷是長條形的低地。",
  "zy": "ㄕㄢ ㄍㄨˇ ㄕˋ ㄔㄤˊ ㄊㄧㄠˊ ㄒㄧㄥˊ ㄉㄜ˙ ㄉㄧ ㄉㄧˋ",
  "ks": [
   "valley",
   "area",
   "land"
  ]
 },
 {
  "id": 13,
  "raw": "Valleys lie between hills or mountains.",
  "zh": "山谷位於丘陵或山脈之間。",
  "zy": "ㄕㄢ ㄍㄨˇ ㄨㄟˋ ㄩˊ ㄑㄧㄡ ㄌㄧㄥˊ ㄏㄨㄛˋ ㄕㄢ ㄇㄞˋ ㄓ ㄐㄧㄢ",
  "ks": [
   "valley",
   "lie",
   "mountain"
  ]
 },
 {
  "id": 14,
  "raw": "A canyon is a very deep valley.",
  "zh": "峽谷是非常深的山谷。",
  "zy": "ㄒㄧㄚˊ ㄍㄨˇ ㄕˋ ㄈㄟ ㄔㄤˊ ㄕㄣ ㄉㄜ˙ ㄕㄢ ㄍㄨˇ",
  "ks": [
   "canyon",
   "deep",
   "valley"
  ]
 },
 {
  "id": 15,
  "raw": "An island is a body of land surrounded by water.",
  "zh": "島嶼是一塊被水包圍的陸地。",
  "zy": "ㄉㄠˇ ㄩˇ ㄕˋ ㄧ ㄎㄨㄞˋ ㄅㄟˋ ㄕㄨㄟˇ ㄅㄠ ㄨㄟˊ ㄉㄜ˙ ㄌㄨˋ ㄉㄧˋ",
  "ks": [
   "island",
   "body",
   "land",
   "surround",
   "water"
  ]
 },
 {
  "id": 16,
  "raw": "An island is smaller than a continent.",
  "zh": "島嶼比大陸小。",
  "zy": "ㄉㄠˇ ㄩˇ ㄅㄧˋ ㄉㄚˋ ㄌㄨˋ ㄒㄧㄠˇ",
  "ks": [
   "island",
   "continent"
  ]
 },
 {
  "id": 17,
  "raw": "Greenland is the world's largest island.",
  "zh": "格陵蘭是世界最大的島嶼。",
  "zy": "ㄍㄜˊ ㄌㄧㄥˊ ㄌㄢˊ ㄕˋ ㄕˋ ㄐㄧㄝˋ ㄗㄨㄟˋ ㄉㄚˋ ㄉㄜ˙ ㄉㄠˇ ㄩˇ",
  "ks": [
   "Greenland",
   "island"
  ]
 },
 {
  "id": 18,
  "raw": "There are bodies of water on continents and islands.",
  "zh": "大陸和島嶼上都有水體。",
  "zy": "ㄉㄚˋ ㄌㄨˋ ㄏㄢˊ ㄉㄠˇ ㄩˇ ㄕㄤˋ ㄉㄡ ㄧㄡˇ ㄕㄨㄟˇ ㄊㄧˇ",
  "ks": [
   "body",
   "water",
   "continent",
   "island"
  ]
 },
 {
  "id": 19,
  "raw": "A river is a moving stream of water.",
  "zh": "河流是流動的水流。",
  "zy": "ㄏㄜˊ ㄌㄧㄡˊ ㄕˋ ㄌㄧㄡˊ ㄉㄨㄥˋ ㄉㄜ˙ ㄕㄨㄟˇ ㄌㄧㄡˊ",
  "ks": [
   "river",
   "stream",
   "water"
  ]
 },
 {
  "id": 20,
  "raw": "Rivers flow to other rivers, lakes, and even oceans.",
  "zh": "河流流向其他河流、湖泊甚至海洋。",
  "zy": "ㄏㄜˊ ㄌㄧㄡˊ ㄌㄧㄡˊ ㄒㄧㄤˋ ㄑㄧˊ ㄊㄚ ㄏㄜˊ ㄌㄧㄡˊ ㄏㄨˊ ㄆㄛ ㄕㄣˋ ㄓˋ ㄏㄞˇ ㄧㄤˊ",
  "ks": [
   "river",
   "flow",
   "lake",
   "ocean",
   "stream"
  ]
 },
 {
  "id": 21,
  "raw": "A lake is a large body of water surrounded by land.",
  "zh": "湖泊是被陸地包圍的大片水體。",
  "zy": "ㄏㄨˊ ㄆㄛ ㄕˋ ㄅㄟˋ ㄌㄨˋ ㄉㄧˋ ㄅㄠ ㄨㄟˊ ㄉㄜ˙ ㄉㄚˋ ㄆㄧㄢˋ ㄕㄨㄟˇ ㄊㄧˇ",
  "ks": [
   "lake",
   "body",
   "water",
   "surround",
   "land"
  ]
 },
 {
  "id": 22,
  "raw": "The Dead Sea is a lake.",
  "zh": "死海是一個湖。",
  "zy": "ㄙˇ ㄏㄞˇ ㄕˋ ㄧ ㄍㄜ˙ ㄏㄨˊ",
  "ks": [
   "Dead Sea",
   "lake"
  ]
 },
 {
  "id": 23,
  "raw": "Plants and animals cannot survive there.",
  "zh": "動植物無法在那裡生存。",
  "zy": "ㄉㄨㄥˋ ㄓˊ ㄨˊ ㄈㄚˇ ㄗㄞˋ ㄋㄚˋ ㄌㄧˇ ㄕㄥ ㄘㄨㄣˊ",
  "ks": [
   "survive"
  ]
 },
 {
  "id": 24,
  "raw": "The water is too salty.",
  "zh": "水太鹹了。",
  "zy": "ㄕㄨㄟˇ ㄊㄞˋ ㄒㄧㄢˊ ㄌㄜ˙",
  "ks": [
   "water",
   "salty"
  ]
 },
 {
  "id": 25,
  "raw": "The Dead Sea is about eight times saltier than an ocean.",
  "zh": "死海比海洋鹹大約八倍。",
  "zy": "ㄙˇ ㄏㄞˇ ㄅㄧˋ ㄏㄞˇ ㄧㄤˊ ㄒㄧㄢˊ ㄉㄚˋ ㄧㄚ ㄅㄞ ㄅㄟ",
  "ks": [
   "Dead Sea",
   "saltier",
   "ocean"
  ]
 },
 {
  "id": 26,
  "raw": "The largest bodies of water are oceans.",
  "zh": "最大的水體是海洋。",
  "zy": "ㄗㄨㄟˋ ㄉㄚˋ ㄉㄜ˙ ㄕㄨㄟˇ ㄊㄧˇ ㄕˋ ㄏㄞˇ ㄧㄤˊ",
  "ks": [
   "body",
   "water",
   "ocean"
  ]
 },
 {
  "id": 27,
  "raw": "There are five of them.",
  "zh": "有五個。",
  "zy": "ㄧㄡˇ ㄨˇ ㄍㄜ˙",
  "ks": []
 },
 {
  "id": 28,
  "raw": "From largest to smallest, they are the Pacific, Atlantic, Indian, Antarctic, and Arctic Oceans.",
  "zh": "從最大到最小，它們是太平洋、大西洋、印度洋、南冰洋和北冰洋。",
  "zy": "ㄘㄨㄥˊ ㄗㄨㄟˋ ㄉㄚˋ ㄉㄠˋ ㄗㄨㄟˋ ㄒㄧㄠˇ ㄊㄚ ㄇㄣ˙ ㄕˋ ㄊㄞˋ ㄆㄧㄥˊ ㄧㄤˊ ㄉㄚˋ ㄒㄧ ㄧㄤˊ ㄧㄣˋ ㄉㄨˋ ㄧㄤˊ ㄋㄢˊ ㄅㄧㄥ ㄧㄤˊ ㄏㄢˊ ㄅㄟˇ ㄅㄧㄥ ㄧㄤˊ",
  "ks": [
   "Pacific",
   "Atlantic",
   "Indian",
   "Antarctic",
   "Arctic",
   "ocean"
  ]
 },
 {
  "id": 29,
  "raw": "The oceans are connected.",
  "zh": "海洋是互相連接的。",
  "zy": "ㄏㄞˇ ㄧㄤˊ ㄕˋ ㄏㄨˋ ㄒㄧㄤ ㄌㄧㄢˊ ㄐㄧㄝ ㄉㄜ˙",
  "ks": [
   "ocean"
  ]
 },
 {
  "id": 30,
  "raw": "All the continents are surrounded by ocean water.",
  "zh": "所有大陸都被海水包圍。",
  "zy": "ㄙㄨㄛˇ ㄧㄡˇ ㄉㄚˋ ㄌㄨˋ ㄉㄡ ㄅㄟˋ ㄏㄞˇ ㄕㄨㄟˇ ㄅㄠ ㄨㄟˊ",
  "ks": [
   "continent",
   "surround",
   "ocean",
   "water"
  ]
 },
 {
  "id": 31,
  "raw": "Ocean water is salty.",
  "zh": "海水是鹹的。",
  "zy": "ㄏㄞˇ ㄕㄨㄟˇ ㄕˋ ㄒㄧㄢˊ ㄉㄜ˙",
  "ks": [
   "ocean",
   "water",
   "salty"
  ]
 },
 {
  "id": 32,
  "raw": "But oceans are full of life.",
  "zh": "但海洋充滿生命。",
  "zy": "ㄉㄢˋ ㄏㄞˇ ㄧㄤˊ ㄔㄨㄥ ㄇㄢˇ ㄕㄥ ㄇㄧㄥˋ",
  "ks": [
   "ocean"
  ]
 },
 {
  "id": 33,
  "raw": "Giant kelp can grow up to two feet per day.",
  "zh": "巨藻一天最多可以長兩英尺。",
  "zy": "ㄐㄩˋ ㄗㄠˇ ㄧ ㄊㄧㄢ ㄗㄨㄟˋ ㄉㄨㄛ ㄎㄜˊ ㄧˇ ㄓㄤˇ ㄌㄧㄤˇ ㄧㄥ ㄔˇ",
  "ks": [
   "kelp",
   "grow"
  ]
 },
 {
  "id": 34,
  "raw": "Oceans are important to humans.",
  "zh": "海洋對人類很重要。",
  "zy": "ㄏㄞˇ ㄧㄤˊ ㄉㄨㄟˋ ㄖㄣˊ ㄌㄟˋ ㄏㄣˇ ㄓㄨㄥˋ ㄧㄠˋ",
  "ks": [
   "ocean",
   "human"
  ]
 },
 {
  "id": 35,
  "raw": "Tiny ocean plants produce oxygen.",
  "zh": "微小的海洋植物產生氧氣。",
  "zy": "ㄨㄟ ㄒㄧㄠˇ ㄉㄜ˙ ㄏㄞˇ ㄧㄤˊ ㄓˊ ㄨˋ ㄔㄢˇ ㄕㄥ ㄧㄤˇ ㄑㄧˋ",
  "ks": [
   "ocean",
   "produce",
   "oxygen"
  ]
 },
 {
  "id": 36,
  "raw": "Humans need oxygen to breathe.",
  "zh": "人類需要氧氣來呼吸。",
  "zy": "ㄖㄣˊ ㄌㄟˋ ㄒㄩ ㄧㄠˋ ㄧㄤˇ ㄑㄧˋ ㄌㄞˊ ㄏㄨ ㄒㄧ",
  "ks": [
   "human",
   "oxygen",
   "breathe"
  ]
 },
 {
  "id": 37,
  "raw": "Sunlight shines through 650 feet of ocean water.",
  "zh": "陽光穿透650英尺的海水。",
  "zy": "ㄧㄤˊ ㄍㄨㄤ ㄔㄨㄢ ㄊㄡˋ ㄌㄧㄡˇ ㄅㄞˋ ㄨˇ ㄕˊ ㄧㄥ ㄔˇ ㄉㄜ˙ ㄏㄞˇ ㄕㄨㄟˇ",
  "ks": [
   "shine",
   "ocean",
   "water"
  ]
 },
 {
  "id": 38,
  "raw": "The bottom of the ocean is called the ocean floor.",
  "zh": "海洋的底部被稱為海床。",
  "zy": "ㄏㄞˇ ㄧㄤˊ ㄉㄜ˙ ㄉㄧˇ ㄅㄨˋ ㄅㄟˋ ㄔㄥ ㄨㄟˊ ㄏㄞˇ ㄔㄨㄤˊ",
  "ks": [
   "bottom",
   "ocean",
   "floor"
  ]
 },
 {
  "id": 39,
  "raw": "The water in the ocean is always moving.",
  "zh": "海中的水一直在移動。",
  "zy": "ㄏㄞˇ ㄓㄨㄥ ㄉㄜ˙ ㄕㄨㄟˇ ㄧ ㄓˊ ㄗㄞˋ ㄧˊ ㄉㄨㄥˋ",
  "ks": [
   "water",
   "ocean"
  ]
 },
 {
  "id": 40,
  "raw": "Strong winds cause high waves.",
  "zh": "強風引起大浪。",
  "zy": "ㄑㄧㄤˊ ㄈㄥ ㄧㄣˇ ㄑㄧˇ ㄉㄚˋ ㄌㄤˋ",
  "ks": [
   "strong",
   "wave",
   "cause"
  ]
 },
 {
  "id": 41,
  "raw": "Hurricanes are huge storms that form over oceans.",
  "zh": "颶風是在海洋上形成的巨大風暴。",
  "zy": "ㄐㄩˋ ㄈㄥ ㄕˋ ㄗㄞˋ ㄏㄞˇ ㄧㄤˊ ㄕㄤˋ ㄒㄧㄥˊ ㄔㄥˊ ㄉㄜ˙ ㄐㄩˋ ㄉㄚˋ ㄈㄥ ㄅㄠˋ",
  "ks": [
   "hurricane",
   "storm",
   "ocean"
  ],
  "note": "💡 form over = form (形成) + over (在...上方) = 在海洋上形成"
 },
 {
  "id": 42,
  "raw": "Warm ocean water and wind make the storm grow.",
  "zh": "溫暖的海水和風讓風暴增強。",
  "zy": "ㄨㄣ ㄋㄨㄢˇ ㄉㄜ˙ ㄏㄞˇ ㄕㄨㄟˇ ㄏㄢˊ ㄈㄥ ㄖㄤˋ ㄈㄥ ㄅㄠˋ ㄗㄥ ㄑㄧㄤˊ",
  "ks": [
   "ocean",
   "water",
   "storm",
   "grow"
  ]
 },
 {
  "id": 43,
  "raw": "Ice covers parts of the Arctic Ocean and the Antarctic Ocean.",
  "zh": "冰覆蓋了北冰洋和南冰洋的部分區域。",
  "zy": "ㄅㄧㄥ ㄈㄨˋ ㄍㄞˋ ㄌㄜ˙ ㄅㄟˇ ㄅㄧㄥ ㄧㄤˊ ㄏㄢˊ ㄋㄢˊ ㄅㄧㄥ ㄧㄤˊ ㄉㄜ˙ ㄅㄨˋ ㄈㄣ ㄑㄩ ㄩˋ",
  "ks": [
   "Arctic",
   "Antarctic",
   "ocean"
  ]
 },
 {
  "id": 44,
  "raw": "Cold temperatures freeze the water.",
  "zh": "低溫使水結冰。",
  "zy": "ㄉㄧ ㄨㄣ ㄕˇ ㄕㄨㄟˇ ㄐㄧㄝˊ ㄅㄧㄥ",
  "ks": [
   "freeze",
   "water"
  ]
 },
 {
  "id": 45,
  "raw": "Some Arctic ice sheets are 15 feet thick.",
  "zh": "有些北極冰層有15英尺厚。",
  "zy": "ㄧㄡˇ ㄒㄧㄝ ㄅㄟˇ ㄐㄧˊ ㄅㄧㄥ ㄘㄥˊ ㄧㄡˇ ㄕˊ ㄨˇ ㄧㄥ ㄔˇ ㄏㄡˋ",
  "ks": [
   "Arctic",
   "thick",
   "sheet"
  ]
 },
 {
  "id": 46,
  "raw": "Hurricanes can cause floods and damage buildings.",
  "zh": "颶風會造成洪水並毀壞建築物。",
  "zy": "ㄐㄩˋ ㄈㄥ ㄏㄨㄟˋ ㄗㄠˋ ㄔㄥˊ ㄏㄨㄥˊ ㄕㄨㄟˇ ㄅㄧㄥˋ ㄏㄨㄟˇ ㄏㄨㄞˋ ㄐㄧㄢˋ ㄓㄨˊ ㄨˋ",
  "ks": [
   "hurricane",
   "cause",
   "flood",
   "damage"
  ]
 },
 {
  "id": 47,
  "raw": "The coast is where the land and the ocean meet.",
  "zh": "海岸是陸地和海洋相遇的地方。",
  "zy": "ㄏㄞˇ ㄢˋ ㄕˋ ㄌㄨˋ ㄉㄧˋ ㄏㄢˊ ㄏㄞˇ ㄧㄤˊ ㄒㄧㄤ ㄩˋ ㄉㄜ˙ ㄉㄧˋ ㄈㄤ",
  "ks": [
   "coast",
   "land",
   "ocean"
  ]
 },
 {
  "id": 48,
  "raw": "About half of the people on Earth live near a coast.",
  "zh": "地球上大約一半的人住在海岸附近。",
  "zy": "ㄉㄧˋ ㄑㄧㄡˊ ㄕㄤˋ ㄉㄚˋ ㄧㄚ ㄅㄢˋ ㄉㄜ˙ ㄖㄣˊ ㄓㄨˋ ㄗㄞˋ ㄏㄞˇ ㄢˋ ㄈㄨˋ ㄐㄧㄣˋ",
  "ks": [
   "Earth",
   "coast",
   "half"
  ],
  "note": "💡 half of = 一半的...，後面接可數或不可數名詞。half of the people = 一半的人。注意 half of 後面通常要加 the / this / my 等限定詞。"
 },
 {
  "id": 49,
  "raw": "The coast is home to wildlife.",
  "zh": "海岸是野生動物的家。",
  "zy": "ㄏㄞˇ ㄢˋ ㄕˋ ㄧㄝˇ ㄕㄥ ㄉㄨㄥˋ ㄨˋ ㄉㄜ˙ ㄐㄧㄚ",
  "ks": [
   "coast",
   "wildlife"
  ]
 },
 {
  "id": 50,
  "raw": "Birds such as gulls feed on fish.",
  "zh": "像海鷗這樣的鳥以魚為食。",
  "zy": "ㄒㄧㄤˋ ㄏㄞˇ ㄡ ㄓㄜˋ ㄧㄤˋ ㄉㄜ˙ ㄋㄧㄠˇ ㄧˇ ㄩˊ ㄨㄟˊ ㄕˊ",
  "ks": [
   "gull",
   "feed on",
   "feed"
  ],
  "note": "💡 feed on 片語動詞 = 以...為食、靠...吃。feed on fish = 以魚為食。文法：主詞 + feed on + 食物。例：Birds feed on fish. / Cats feed on mice."
 },
 {
  "id": 51,
  "raw": "Water and land need to be protected.",
  "zh": "水和陸地需要被保護。",
  "zy": "ㄕㄨㄟˇ ㄏㄢˊ ㄌㄨˋ ㄉㄧˋ ㄒㄩ ㄧㄠˋ ㄅㄟˋ ㄅㄠˇ ㄏㄨˋ",
  "ks": [
   "water",
   "land",
   "protect"
  ]
 },
 {
  "id": 52,
  "raw": "Land gives us food and places to live.",
  "zh": "陸地給我們食物和居住的地方。",
  "zy": "ㄌㄨˋ ㄉㄧˋ ㄍㄟˇ ㄨㄛˇ ㄇㄣ˙ ㄕˊ ㄨˋ ㄏㄢˊ ㄐㄩ ㄓㄨˋ ㄉㄜ˙ ㄉㄧˋ ㄈㄤ",
  "ks": [
   "land"
  ]
 },
 {
  "id": 53,
  "raw": "Water keeps us alive.",
  "zh": "水讓我們活著。",
  "zy": "ㄕㄨㄟˇ ㄖㄤˋ ㄨㄛˇ ㄇㄣ˙ ㄏㄨㄛˊ ㄓㄜ˙",
  "ks": [
   "water",
   "alive"
  ]
 },
 {
  "id": 54,
  "raw": "A healthy Earth helps all of us stay healthy.",
  "zh": "健康的地球幫助我們大家保持健康。",
  "zy": "ㄐㄧㄢˋ ㄎㄤ ㄉㄜ˙ ㄉㄧˋ ㄑㄧㄡˊ ㄅㄤ ㄓㄨˋ ㄨㄛˇ ㄇㄣ˙ ㄉㄚˋ ㄐㄧㄚ ㄅㄠˇ ㄔˊ ㄐㄧㄢˋ ㄎㄤ",
  "ks": [
   "healthy",
   "Earth"
  ]
 }
],
  vocab: [
 {
  "b": "planet",
  "f": "planet",
  "kk": "[ˈplænɪt]",
  "ipa": "/ˈplæn.ɪt/",
  "zh": "行星、地球",
  "zy": "ㄒㄧㄥˊ ㄒㄧㄥ",
  "c": "geo",
  "t": "plan平面+et外星人，太空中的圓圓平面",
  "pos": "n. 名詞"
 },
 {
  "b": "surface",
  "f": "surface",
  "kk": "[ˈsɝfɪs]",
  "ipa": "/ˈsɝː.fɪs/",
  "zh": "表面、地表",
  "zy": "ㄅㄧㄠˇ ㄇㄧㄢˋ",
  "c": "geo",
  "t": "sur在上+face臉，臉上的那一層就是表面",
  "pos": "n. 名詞"
 },
 {
  "b": "space",
  "f": "space",
  "kk": "[spes]",
  "ipa": "/speɪs/",
  "zh": "太空、空間",
  "zy": "ㄊㄞˋ ㄎㄨㄥ",
  "c": "geo",
  "t": "太空空空的",
  "pos": "n. 名詞"
 },
 {
  "b": "divide",
  "f": "divided",
  "kk": "[dɪˈvaɪd]",
  "ipa": "/dɪˈvaɪd/",
  "zh": "分割、劃分",
  "zy": "ㄈㄣ ㄍㄜ ㄏㄨㄚˋ ㄈㄣ",
  "c": "action",
  "t": "di分開+vide看，視線分開切",
  "pos": "v. 動詞"
 },
 {
  "b": "piece",
  "f": "pieces",
  "kk": "[pis]",
  "ipa": "/piːs/",
  "zh": "塊、片",
  "zy": "ㄎㄨㄞˋ",
  "c": "geo",
  "t": "a piece of pie 一塊派",
  "pos": "n. 名詞"
 },
 {
  "b": "continent",
  "f": "continents",
  "kk": "[ˈkɑntənənt]",
  "ipa": "/ˈkɑːn.tən.ənt/",
  "zh": "大陸、大洲",
  "zy": "ㄉㄚˋ ㄌㄨˋ",
  "c": "geo",
  "t": "con一起+tin，連續一大片陸地",
  "pos": "n. 名詞"
 },
 {
  "b": "natural",
  "f": "natural",
  "kk": "[ˈnætʃərəl]",
  "ipa": "/ˈnætʃ.ɚ.əl/",
  "zh": "自然的、天然的",
  "zy": "ㄗˋ ㄖㄢˊ ㄉㄜ˙",
  "c": "geo",
  "t": "nature自然+al的",
  "pos": "adj. 形容詞"
 },
 {
  "b": "feature",
  "f": "features",
  "kk": "[ˈfitʃɚ]",
  "ipa": "/ˈfiː.tʃɚ/",
  "zh": "特徵、地貌特徵",
  "zy": "ㄊㄜˋ ㄓㄥ",
  "c": "geo",
  "t": "fea看+ure，值得一看的特點",
  "pos": "n. 名詞"
 },
 {
  "b": "landform",
  "f": "Landforms",
  "kk": "[ˈlændˌfɔrm]",
  "ipa": "/ˈlænd.fɔːrm/",
  "zh": "地形",
  "zy": "ㄉㄧˋ ㄒㄧㄥˊ",
  "c": "geo",
  "t": "land土地+form形狀，地的形狀",
  "pos": "n. 名詞"
 },
 {
  "b": "mountain",
  "f": "mountain",
  "kk": "[ˈmaʊntən]",
  "ipa": "/ˈmaʊn.tən/",
  "zh": "山、高山",
  "zy": "ㄕㄢ",
  "c": "geo",
  "t": "mount往上堆+ain，越堆越高就是山",
  "pos": "n. 名詞"
 },
 {
  "b": "valley",
  "f": "Valleys",
  "kk": "[ˈvæli]",
  "ipa": "/ˈvæl.i/",
  "zh": "山谷、溪谷",
  "zy": "ㄕㄢ ㄍㄨˇ",
  "c": "geo",
  "t": "V字形的低地就是valley",
  "pos": "n. 名詞"
 },
 {
  "b": "lie",
  "f": "lie",
  "kk": "[laɪ]",
  "ipa": "/laɪ/",
  "zh": "位於、躺臥",
  "zy": "ㄨㄟˋ ㄩˊ",
  "c": "action",
  "t": "lie躺著就位於那裡",
  "pos": "v. 動詞"
 },
 {
  "b": "wide",
  "f": "wide",
  "kk": "[waɪd]",
  "ipa": "/waɪd/",
  "zh": "寬的、寬闊的",
  "zy": "ㄎㄨㄢ ㄉㄜ˙",
  "c": "geo",
  "t": "wide打開手臂很寬",
  "pos": "adj. 形容詞"
 },
 {
  "b": "island",
  "f": "island",
  "kk": "[ˈaɪlənd]",
  "ipa": "/ˈaɪ.lənd/",
  "zh": "島嶼、島",
  "zy": "ㄉㄠˇ",
  "c": "home",
  "t": "is水+land地，水中的地就是島，s不發音",
  "pos": "n. 名詞"
 },
 {
  "b": "flow",
  "f": "flow",
  "kk": "[flo]",
  "ipa": "/floʊ/",
  "zh": "流動、流",
  "zy": "ㄌㄧㄡˊ ㄉㄨㄥˋ",
  "c": "action",
  "t": "水流flow像風吹",
  "pos": "v. 動詞"
 },
 {
  "b": "popular",
  "f": "popular",
  "kk": "[ˈpɑpjəlɚ]",
  "ipa": "/ˈpɑː.pjə.lɚ/",
  "zh": "受歡迎的、熱門的",
  "zy": "ㄕㄡˋ ㄏㄨㄢ ㄧㄥˊ",
  "c": "geo",
  "t": "pop人氣+ular，像pop流行音樂",
  "pos": "adj. 形容詞"
 },
 {
  "b": "survive",
  "f": "survive",
  "kk": "[sɚˈvaɪv]",
  "ipa": "/sɚˈvaɪv/",
  "zh": "生存、存活",
  "zy": "ㄕㄥ ㄘㄨㄣˊ",
  "c": "action",
  "t": "sur超過+vive活，活過難關就是生存",
  "pos": "v. 動詞"
 },
 {
  "b": "salty",
  "f": "salty",
  "kk": "[ˈsɔlti]",
  "ipa": "/ˈsɑːl.ti/",
  "zh": "鹹的、含鹽的",
  "zy": "ㄒㄧㄢˊ ㄉㄜ˙",
  "c": "geo",
  "t": "salt鹽+y，鹽鹽的",
  "pos": "adj. 形容詞"
 },
 {
  "b": "saltier",
  "f": "saltier",
  "kk": "[ˈsɔltiɚ]",
  "ipa": "/ˈsɑːl.ti.ɚ/",
  "zh": "更鹹的",
  "zy": "ㄍㄥˋ ㄒㄧㄢˊ",
  "c": "geo",
  "t": "salty的比較級",
  "pos": "adj. 形容詞 (比較級)"
 },
 {
  "b": "human",
  "f": "humans",
  "kk": "[ˈhjumən]",
  "ipa": "/ˈhjuː.mən/",
  "zh": "人類",
  "zy": "ㄖㄣˊ ㄌㄟˋ",
  "c": "body",
  "t": "hu有+man人，有人就是人類",
  "pos": "n. 名詞"
 },
 {
  "b": "produce",
  "f": "produce",
  "kk": "[prəˈdus]",
  "ipa": "/prəˈduːs/",
  "zh": "生產、產生、製造",
  "zy": "ㄕㄥ ㄔㄢˇ",
  "c": "action",
  "t": "pro向前+duce引導，引出東西就是生產",
  "pos": "v. 動詞"
 },
 {
  "b": "breathe",
  "f": "breathe",
  "kk": "[brið]",
  "ipa": "/briːð/",
  "zh": "呼吸",
  "zy": "ㄏㄨ ㄒㄧ",
  "c": "body",
  "t": "breath呼吸+breathe動詞，e結尾長音",
  "pos": "v. 動詞"
 },
 {
  "b": "oxygen",
  "f": "oxygen",
  "kk": "[ˈɑksɪdʒən]",
  "ipa": "/ˈɑːk.sə.dʒən/",
  "zh": "氧氣",
  "zy": "ㄧㄤˇ ㄑㄧˋ",
  "c": "body",
  "t": "oxy尖+gen產生，尖銳的氣體讓人活",
  "pos": "n. 名詞 (不可數)"
 },
 {
  "b": "bottom",
  "f": "bottom",
  "kk": "[ˈbɑtəm]",
  "ipa": "/ˈbɑː.təm/",
  "zh": "底部、海底",
  "zy": "ㄉㄧˇ ㄅㄨˋ",
  "c": "body",
  "t": "瓶子bot最下面",
  "pos": "n. 名詞"
 },
 {
  "b": "strong",
  "f": "Strong",
  "kk": "[strɔŋ]",
  "ipa": "/strɑːŋ/",
  "zh": "強的、強烈的",
  "zy": "ㄑㄧㄤˊ",
  "c": "enemy",
  "t": "strong像strong man大力士",
  "pos": "adj. 形容詞"
 },
 {
  "b": "wave",
  "f": "waves",
  "kk": "[wev]",
  "ipa": "/weɪv/",
  "zh": "海浪、波浪",
  "zy": "ㄏㄞˇ ㄌㄤˋ",
  "c": "enemy",
  "t": "水wavy彎彎就是波浪",
  "pos": "n. 名詞"
 },
 {
  "b": "hurricane",
  "f": "Hurricanes",
  "kk": "[ˈhɝəˌken]",
  "ipa": "/ˈhɝː.ə.keɪn/",
  "zh": "颶風",
  "zy": "ㄐㄩˋ ㄈㄥ",
  "c": "enemy",
  "t": "hurry急+ cane拐杖，急速旋轉像拐杖",
  "pos": "n. 名詞"
 },
 {
  "b": "storm",
  "f": "storms",
  "kk": "[storm]",
  "ipa": "/stɔːrm/",
  "zh": "暴風雨、風暴",
  "zy": "ㄅㄠˋ ㄈㄥ ㄩˇ",
  "c": "enemy",
  "t": "storm來了大家都store躲起來",
  "pos": "n. 名詞"
 },
 {
  "b": "cause",
  "f": "cause",
  "kk": "[kɔz]",
  "ipa": "/kɑːz/",
  "zh": "造成、引起",
  "zy": "ㄗㄠˋ ㄔㄥˊ",
  "c": "action",
  "t": "因為cause所以結果",
  "pos": "v. 動詞"
 },
 {
  "b": "grow",
  "f": "grow",
  "kk": "[gro]",
  "ipa": "/ɡroʊ/",
  "zh": "成長、變大、增強",
  "zy": "ㄔㄥˊ ㄓㄤˇ",
  "c": "action",
  "t": "小草grow往上長",
  "pos": "v. 動詞"
 },
 {
  "b": "damage",
  "f": "damage",
  "kk": "[ˈdæmɪdʒ]",
  "ipa": "/ˈdæm.ɪdʒ/",
  "zh": "損壞、毀壞、損害",
  "zy": "ㄙㄨㄣˇ ㄏㄨㄞˋ",
  "c": "enemy",
  "t": "dam水壩+age，壞掉像水壩破掉",
  "pos": "v. 動詞 / n. 名詞"
 },
 {
  "b": "freeze",
  "f": "freeze",
  "kk": "[friz]",
  "ipa": "/friːz/",
  "zh": "結冰、凍結、結凍",
  "zy": "ㄐㄧㄝˊ ㄅㄧㄥ",
  "c": "action",
  "t": "freezer冰箱讓水freeze",
  "pos": "v. 動詞"
 },
 {
  "b": "thick",
  "f": "thick",
  "kk": "[θɪk]",
  "ipa": "/θɪk/",
  "zh": "厚的",
  "zy": "ㄏㄡˋ",
  "c": "geo",
  "t": "th厚+i+ck，厚厚的冰",
  "pos": "adj. 形容詞"
 },
 {
  "b": "Earth",
  "f": "Earth",
  "kk": "[ɝθ]",
  "ipa": "/ɝːθ/",
  "zh": "地球",
  "zy": "ㄉㄧˋ ㄑㄧㄡˊ",
  "c": "geo",
  "t": "我們住的Earth",
  "pos": "n. 名詞 (專有名詞)"
 },
 {
  "b": "water",
  "f": "water",
  "kk": "[ˈwɔtɚ]",
  "ipa": "/ˈwɑː.tɚ/",
  "zh": "水",
  "zy": "ㄕㄨㄟˇ",
  "c": "geo",
  "t": "water嘩啦啦水聲",
  "pos": "n. 名詞"
 },
 {
  "b": "land",
  "f": "land",
  "kk": "[lænd]",
  "ipa": "/lænd/",
  "zh": "陸地、土地",
  "zy": "ㄌㄨˋ ㄉㄧˋ",
  "c": "geo",
  "t": "land站在上面的地",
  "pos": "n. 名詞"
 },
 {
  "b": "ocean",
  "f": "oceans",
  "kk": "[ˈoʃən]",
  "ipa": "/ˈoʊ.ʃən/",
  "zh": "海洋",
  "zy": "ㄏㄞˇ ㄧㄤˊ",
  "c": "geo",
  "t": "O大+cean，像大大的海",
  "pos": "n. 名詞"
 },
 {
  "b": "river",
  "f": "river",
  "kk": "[ˈrɪvɚ]",
  "ipa": "/ˈrɪv.ɚ/",
  "zh": "河流、河",
  "zy": "ㄏㄜˊ",
  "c": "home",
  "t": "rive切+river，河切開大地",
  "pos": "n. 名詞"
 },
 {
  "b": "lake",
  "f": "lake",
  "kk": "[lek]",
  "ipa": "/leɪk/",
  "zh": "湖泊、湖",
  "zy": "ㄏㄨˊ",
  "c": "home",
  "t": "lake像一碗水被地抱著",
  "pos": "n. 名詞"
 },
 {
  "b": "body",
  "f": "body",
  "kk": "[ˈbɑdi]",
  "ipa": "/ˈbɑː.di/",
  "zh": "身體、水體",
  "zy": "ㄕㄣ ㄊㄧˇ",
  "c": "body",
  "t": "身體就是body",
  "pos": "n. 名詞"
 },
 {
  "b": "surround",
  "f": "surrounded",
  "kk": "[səˈraʊnd]",
  "ipa": "/səˈraʊnd/",
  "zh": "包圍、環繞",
  "zy": "ㄅㄠ ㄨㄟˊ",
  "c": "action",
  "t": "sur周圍+round圓，圓圓圍住",
  "pos": "v. 動詞"
 },
 {
  "b": "deep",
  "f": "deep",
  "kk": "[dip]",
  "ipa": "/diːp/",
  "zh": "深的",
  "zy": "ㄕㄣ",
  "c": "geo",
  "t": "deep往下深不見底",
  "pos": "adj. 形容詞"
 },
 {
  "b": "flood",
  "f": "floods",
  "kk": "[flʌd]",
  "ipa": "/flʌd/",
  "zh": "洪水、水災",
  "zy": "ㄏㄨㄥˊ ㄕㄨㄟˇ",
  "c": "enemy",
  "t": "flood像floor地板全是水",
  "pos": "n. 名詞"
 },
 {
  "b": "coast",
  "f": "coast",
  "kk": "[kost]",
  "ipa": "/koʊst/",
  "zh": "海岸、海濱",
  "zy": "ㄏㄞˇ ㄢˋ",
  "c": "home",
  "t": "coast是land和ocean相遇的地方",
  "pos": "n. 名詞"
 },
 {
  "b": "floor",
  "f": "floor",
  "kk": "[flor]",
  "ipa": "/flɔːr/",
  "zh": "地板、海底",
  "zy": "ㄉㄧˋ ㄅㄢˇ",
  "c": "home",
  "t": "ocean floor海洋的地板",
  "pos": "n. 名詞"
 },
 {
  "b": "shine",
  "f": "shines",
  "kk": "[ʃaɪn]",
  "ipa": "/ʃaɪn/",
  "zh": "照耀、發光",
  "zy": "ㄓㄠˋ ㄧㄠˋ",
  "c": "action",
  "t": "sunshine太陽閃亮shine",
  "pos": "v. 動詞"
 },
 {
  "b": "Asia",
  "f": "Asia",
  "kk": "[ˈeʃə]",
  "ipa": "/ˈeɪ.ʒə/",
  "zh": "亞洲",
  "zy": "ㄧㄚˋ ㄓㄡ",
  "c": "geo",
  "t": "最大洲，Mount Everest在Asia",
  "pos": "n. 名詞 (專有名詞)"
 },
 {
  "b": "Africa",
  "f": "Africa",
  "kk": "[ˈæfrɪkə]",
  "ipa": "/ˈæf.rɪ.kə/",
  "zh": "非洲",
  "zy": "ㄈㄟ ㄓㄡ",
  "c": "geo",
  "t": "第二大洲，有很多野生動物",
  "pos": "n. 名詞"
 },
 {
  "b": "North America",
  "f": "North America",
  "kk": "[nɔrθ əˈmɛrɪkə]",
  "ipa": "/nɔːrθ əˈmer.ɪ.kə/",
  "zh": "北美洲",
  "zy": "ㄅㄟˇ ㄇㄟˇ ㄓㄡ",
  "c": "geo",
  "t": "我們常說的美國、加拿大在這",
  "pos": "n. 名詞"
 },
 {
  "b": "South America",
  "f": "South America",
  "kk": "[saʊθ əˈmɛrɪkə]",
  "ipa": "/saʊθ əˈmer.ɪ.kə/",
  "zh": "南美洲",
  "zy": "ㄋㄢˊ ㄇㄟˇ ㄓㄡ",
  "c": "geo",
  "t": "有亞馬遜雨林Amazon",
  "pos": "n. 名詞"
 },
 {
  "b": "Antarctica",
  "f": "Antarctica",
  "kk": "[ænˈtɑrk·tɪ·kə]",
  "ipa": "/ænˈtɑːrk.tɪ.kə/",
  "zh": "南極洲",
  "zy": "ㄋㄢˊ ㄐㄧˊ ㄓㄡ",
  "c": "geo",
  "t": "最冷的大洲，重音在TAR，tark",
  "pos": "n. 名詞"
 },
 {
  "b": "Europe",
  "f": "Europe",
  "kk": "[ˈjʊrəp]",
  "ipa": "/ˈjʊr.əp/",
  "zh": "歐洲",
  "zy": "ㄡ ㄓㄡ",
  "c": "geo",
  "t": "有很多古老國家",
  "pos": "n. 名詞"
 },
 {
  "b": "Australia",
  "f": "Australia",
  "kk": "[ɔˈstreljə]",
  "ipa": "/ɑːˈstreɪl.jə/",
  "zh": "澳洲、大洋洲",
  "zy": "ㄠˋ ㄓㄡ",
  "c": "geo",
  "t": "袋鼠的家，單獨一個大洲",
  "pos": "n. 名詞"
 },
 {
  "b": "Pacific",
  "f": "Pacific",
  "kk": "[pəˈsɪfɪk]",
  "ipa": "/pəˈsɪf.ɪk/",
  "zh": "太平洋",
  "zy": "ㄊㄞˋ ㄆㄧㄥˊ ㄧㄤˊ",
  "c": "geo",
  "t": "最大海洋，pa平靜+cific，Peaceful",
  "pos": "n. 名詞 / adj."
 },
 {
  "b": "Atlantic",
  "f": "Atlantic",
  "kk": "[ætˈlæntɪk]",
  "ipa": "/ətˈlæn.tɪk/",
  "zh": "大西洋",
  "zy": "ㄉㄚˋ ㄒㄧ ㄧㄤˊ",
  "c": "geo",
  "t": "第二大洋，Atlas巨人托著的大洋",
  "pos": "n. 名詞"
 },
 {
  "b": "Indian",
  "f": "Indian",
  "kk": "[ˈɪndiən]",
  "ipa": "/ˈɪn.di.ən/",
  "zh": "印度洋",
  "zy": "ㄧㄣˋ ㄉㄨˋ ㄧㄤˊ",
  "c": "geo",
  "t": "在India印度旁邊的海洋",
  "pos": "n. 名詞"
 },
 {
  "b": "Arctic",
  "f": "Arctic",
  "kk": "[ˈɑrktɪk]",
  "ipa": "/ˈɑːrk.tɪk/",
  "zh": "北極的、北冰洋",
  "zy": "ㄅㄟˇ ㄅㄧㄥ ㄧㄤˊ",
  "c": "geo",
  "t": "Arctic北極，北極熊住的地方",
  "pos": "n. 名詞 / adj."
 },
 {
  "b": "Antarctic",
  "f": "Antarctic",
  "kk": "[æntˈɑrktɪk]",
  "ipa": "/æntˈɑːrk.tɪk/",
  "zh": "南極的、南冰洋",
  "zy": "ㄋㄢˊ ㄅㄧㄥ ㄧㄤˊ",
  "c": "geo",
  "t": "Ant對面+arctic北極，對面就是南極",
  "pos": "n. 名詞 / adj."
 },
 {
  "b": "Greenland",
  "f": "Greenland",
  "kk": "[ˈɡrinˌlænd]",
  "ipa": "/ˈɡriːn.lənd/",
  "zh": "格陵蘭",
  "zy": "ㄍㄜˊ ㄌㄧㄥˊ ㄌㄢˊ",
  "c": "geo",
  "t": "Green綠+land地，但其實都是冰",
  "pos": "n. 名詞"
 },
 {
  "b": "Dead Sea",
  "f": "Dead Sea",
  "kk": "[dɛd si]",
  "ipa": "/ded siː/",
  "zh": "死海",
  "zy": "ㄙˇ ㄏㄞˇ",
  "c": "geo",
  "t": "太鹹salty，沒有生物survive所以叫Dead",
  "pos": "n. 名詞"
 },
 {
  "b": "three-quarters",
  "f": "three-quarters",
  "kk": "[ˌθriˈkwɔrtɚz]",
  "ipa": "/ˌθriːˈkwɔː.tərz/",
  "zh": "四分之三",
  "zy": "ㄙˋ ㄈㄣ ㄓ ㄙㄢ",
  "c": "geo",
  "t": "three三+quarters四分之一",
  "pos": "n. 名詞 / 數量詞"
 },
 {
  "b": "area",
  "f": "areas",
  "kk": "[ˈɛriə]",
  "ipa": "/ˈer.i.ə/",
  "zh": "區域、地區",
  "zy": "ㄑㄩ ㄩˋ",
  "c": "geo",
  "t": "are在的地方就是區域",
  "pos": "n. 名詞"
 },
 {
  "b": "stream",
  "f": "stream",
  "kk": "[strim]",
  "ipa": "/striːm/",
  "zh": "溪流、水流、流",
  "zy": "ㄒㄧ ㄌㄧㄡˊ",
  "c": "home",
  "t": "stream像一條細細的水線在流",
  "pos": "n. 名詞 / v. 動詞"
 },
 {
  "b": "rock",
  "f": "rocks",
  "kk": "[rɑk]",
  "ipa": "/rɑːk/",
  "zh": "岩石",
  "zy": "ㄧㄢˊ ㄕˊ",
  "c": "geo",
  "t": "rock硬硬的石頭",
  "pos": "n. 名詞"
 },
 {
  "b": "dirt",
  "f": "dirt",
  "kk": "[dɝt]",
  "ipa": "/dɝːt/",
  "zh": "泥土、灰塵",
  "zy": "ㄋㄧˊ ㄊㄨˇ",
  "c": "geo",
  "t": "dirt髒髒的土",
  "pos": "n. 名詞"
 },
 {
  "b": "canyon",
  "f": "canyon",
  "kk": "[ˈkænjən]",
  "ipa": "/ˈkæn.jən/",
  "zh": "峽谷",
  "zy": "ㄒㄧㄚˊ ㄍㄨˇ",
  "c": "geo",
  "t": "can罐子+yon，像罐子一樣深深的谷",
  "pos": "n. 名詞"
 },
 {
  "b": "wildlife",
  "f": "wildlife",
  "kk": "[ˈwaɪldˌlaɪf]",
  "ipa": "/ˈwaɪld.laɪf/",
  "zh": "野生動物",
  "zy": "ㄧㄝˇ ㄕㄥ ㄉㄨㄥˋ ㄨˋ",
  "c": "home",
  "t": "wild野的+life生命，野外的生命",
  "pos": "n. 名詞"
 },
 {
  "b": "gull",
  "f": "gulls",
  "kk": "[ɡʌl]",
  "ipa": "/ɡʌl/",
  "zh": "海鷗",
  "zy": "ㄏㄞˇ ㄡ",
  "c": "home",
  "t": "gull在海邊叫gull gull",
  "pos": "n. 名詞"
 },
 {
  "b": "kelp",
  "f": "kelp",
  "kk": "[kɛlp]",
  "ipa": "/kelp/",
  "zh": "巨藻、海帶",
  "zy": "ㄐㄩˋ ㄗㄠˇ",
  "c": "home",
  "t": "kelp長長的海帶在海裡飄",
  "pos": "n. 名詞"
 },
 {
  "b": "protect",
  "f": "protected",
  "kk": "[prəˈtɛkt]",
  "ipa": "/prəˈtekt/",
  "zh": "保護",
  "zy": "ㄅㄠˇ ㄏㄨˋ",
  "c": "action",
  "t": "pro向前+tect蓋，蓋住保護",
  "pos": "v. 動詞"
 },
 {
  "b": "alive",
  "f": "alive",
  "kk": "[əˈlaɪv]",
  "ipa": "/əˈlaɪv/",
  "zh": "活著的、有生命的",
  "zy": "ㄏㄨㄛˊ ㄓㄜ˙ ㄉㄜ˙",
  "c": "body",
  "t": "a一直+live活，一直活著",
  "pos": "adj. 形容詞"
 },
 {
  "b": "healthy",
  "f": "healthy",
  "kk": "[ˈhɛlθi]",
  "ipa": "/ˈhel.θi/",
  "zh": "健康的",
  "zy": "ㄐㄧㄢˋ ㄎㄤ ㄉㄜ˙",
  "c": "body",
  "t": "health健康+y，健康胖胖",
  "pos": "adj. 形容詞"
 },
 {
  "b": "sheet",
  "f": "sheets",
  "kk": "[ʃit]",
  "ipa": "/ʃiːt/",
  "zh": "片、層、冰層",
  "zy": "ㄆㄧㄢˋ",
  "c": "geo",
  "t": "sheet像一張紙一樣的一層，ice sheet冰層",
  "pos": "n. 名詞"
 },
 {
  "b": "half",
  "f": "half of",
  "kk": "[hæf]",
  "ipa": "/hæf/",
  "zh": "一半、一半的",
  "zy": "ㄧ ㄅㄢˋ",
  "c": "geo",
  "t": "half切一半，像切蛋糕切一半",
  "pos": "n. / det. 名詞/限定詞，half of 一半的..."
 },
 {
  "b": "feed on",
  "f": "feed on",
  "kk": "[fid ɑn]",
  "ipa": "/fiːd ɑːn/",
  "zh": "以...為食、靠...餵養",
  "zy": "ㄧˇ...ㄨㄟˊ ㄕˊ",
  "c": "action",
  "t": "feed餵+on在...上，靠吃魚feed on fish長大",
  "pos": "phr. v. 片語動詞"
 },
 {
  "b": "feed",
  "f": "feed",
  "kk": "[fid]",
  "ipa": "/fiːd/",
  "zh": "餵養、吃",
  "zy": "ㄨㄟˋ ㄧㄤˇ",
  "c": "action",
  "t": "feed給食物吃",
  "pos": "v. 動詞"
 }
]
};
