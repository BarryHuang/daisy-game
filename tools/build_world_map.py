#!/usr/bin/env python3
"""產生 world-map.svg —— 繪本風格的倉鼠世界鳥瞰圖。

風格參考安野光雅那類色鉛筆繪本：米白紙、淡淡的黃綠色塊、成百上千棵小樹點成
一片森林、屋頂是橘色的小房子聚成村莊，沒有粗黑外框。

為什麼用程式產生而不是手寫 SVG：這種風格的重點就是「很多很小的東西」——
四百多棵樹、三十幾間房子、成排的白楊木，手寫排不出來也改不動。
要調密度或位置改這個檔再跑一次就好：

    python3 tools/build_world_map.py

七個景點的中心座標由 PLACES 決定，跑完會印出 daisy_hamster.html 裡
WORLD_MAP_PINS 要用的數值 —— 兩邊要一致，不然名牌會跟景點對不起來。
"""
import math, random

W, H = 420, 700
rnd = random.Random(20260918)          # 固定種子：每次產生的圖都一樣

# ── 景點（世界座標）。走的順序就是這個順序 ────────────────────────────
PLACES = [
    ("home",   150, 112),
    ("garden", 244, 168),
    ("park",   166, 274),
    ("street", 300, 344),
    ("arcade", 204, 432),
    ("fair",   314, 516),
    ("beach",  150, 606),
]
P = {k: (x, y) for k, x, y in PLACES}

# ── 調色盤：全部偏淡，讓紙的白透出來 ──────────────────────────────────
PAPER   = "#fbfaf2"
SEA     = ["#dceef6", "#c9e2ef", "#b6d7e8"]
SAND    = "#eee0bd"
GREENS  = ["#e6eeca", "#dbe8b6", "#cee1a4", "#c1da96", "#b2d188"]
FOREST  = ["#aed08f", "#9dc680", "#8cba72"]
FIELD   = ["#e8ecb4", "#dde6a2", "#eae4b0", "#d5e4a6"]
ROOF    = ["#e59a63", "#dd8551", "#d2703f", "#e8a877"]
WALL    = "#f7efe0"
ROAD    = "#e3d6b8"

out = []
add = out.append

def esc(v):
    return ("%.1f" % v).rstrip("0").rstrip(".")

def use(sym, x, y, s=1.0):
    if abs(s - 1.0) < 0.01:
        add('<use href="#%s" transform="translate(%s %s)"/>' % (sym, esc(x), esc(y)))
    else:
        add('<use href="#%s" transform="translate(%s %s) scale(%s)"/>'
            % (sym, esc(x), esc(y), esc(s)))

# ── 陸地與水 ──────────────────────────────────────────────────────────
# 海岸線：左上角一個海灣，沿著左邊往下，再從左下橫過底部。
COAST = ("M0 0 L188 0 C150 40 120 66 92 96 C60 132 78 168 118 196 "
         "C150 218 140 250 96 276 C52 302 40 344 74 380 C106 414 96 452 56 486 "
         "C22 514 34 556 84 584 C140 616 236 632 316 622 C368 616 404 600 420 584 "
         "L420 700 L0 700 Z")
SHORE = ("M188 0 C150 40 120 66 92 96 C60 132 78 168 118 196 "
         "C150 218 140 250 96 276 C52 302 40 344 74 380 C106 414 96 452 56 486 "
         "C22 514 34 556 84 584 C140 616 236 632 316 622 C368 616 404 600 420 584")

def land_ok(x, y):
    """粗略判斷 (x,y) 在不在陸地上。海岸線是一條由上而下的曲線，
    對每個 y 取一個大概的岸邊 x，右邊算陸地。"""
    if y < 0 or y > H:
        return False
    pts = [(0, 188), (96, 92), (196, 118), (276, 96), (380, 74), (486, 56),
           (584, 84), (622, 316), (700, 420)]
    for i in range(len(pts) - 1):
        y0, x0 = pts[i]; y1, x1 = pts[i + 1]
        if y0 <= y <= y1:
            t = (y - y0) / (y1 - y0 or 1)
            edge = x0 + (x1 - x0) * t
            if y >= 584:                      # 底部是海，岸線變成橫的
                return y < 584 + (1 - abs(x - 200) / 260) * 40
            return x > edge + 8
    return x > 40

def near_place(x, y, r=40):
    return any((x - px) ** 2 + (y - py) ** 2 < r * r for px, py in P.values())

# ── 道路：串起七個景點的一條淡土路 ───────────────────────────────────
def road_path():
    pts = [P[k] for k, _, _ in PLACES]
    d = "M%s %s" % (esc(pts[0][0]), esc(pts[0][1]))
    for i in range(len(pts) - 1):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        # 讓每一段都彎一點，不要是直線
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2
        nx, ny = -(y1 - y0), (x1 - x0)
        L = math.hypot(nx, ny) or 1
        bend = 26 if i % 2 == 0 else -26
        cx, cy = mx + nx / L * bend, my + ny / L * bend
        d += " Q%s %s %s %s" % (esc(cx), esc(cy), esc(x1), esc(y1))
    return d

ROAD_D = road_path()

def near_road(x, y, r=13):
    """離道路太近就不要種樹，路才不會被蓋掉。用取樣點近似。"""
    pts = [P[k] for k, _, _ in PLACES]
    for i in range(len(pts) - 1):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        for t in range(0, 11):
            t /= 10.0
            sx = x0 + (x1 - x0) * t
            sy = y0 + (y1 - y0) * t
            if (x - sx) ** 2 + (y - sy) ** 2 < r * r:
                return True
    return False

# ── 開始輸出 ──────────────────────────────────────────────────────────
add('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d">' % (W, H, W, H))
add('<!-- 這個檔是 tools/build_world_map.py 產生的，不要手改。 -->')
add('<!-- 景點中心：' + ' '.join('%s(%d,%d)' % (k, x, y) for k, x, y in PLACES) + ' -->')

# 濾鏡：紙的顆粒 + 手繪的抖動
add('''<defs>
<filter id="grain" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" seed="7" result="n"/>
  <feColorMatrix in="n" type="saturate" values="0"/>
  <feComponentTransfer><feFuncA type="linear" slope="0.42"/></feComponentTransfer>
</filter>
<filter id="wob" x="-6%" y="-6%" width="112%" height="112%">
  <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="3" seed="3" result="t"/>
  <feDisplacementMap in="SourceGraphic" in2="t" scale="6" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="wob2" x="-6%" y="-6%" width="112%" height="112%">
  <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="11" result="t"/>
  <feDisplacementMap in="SourceGraphic" in2="t" scale="3" xChannelSelector="R" yChannelSelector="G"/>
</filter>''')

# 樹的樣板。每種樹一個 <g>，之後用 <use> 擺幾百次，檔案才不會爆掉。
for i, c in enumerate(FOREST):
    dark = ["#7fae63", "#6fa257", "#63954c"][i]
    add('<g id="t%d">'
        '<path d="M0 6v-5" stroke="#9c8a63" stroke-width="1.2"/>'
        '<ellipse cx="0" cy="-2" rx="6.2" ry="5.4" fill="%s"/>'
        '<ellipse cx="-3" cy="0" rx="4" ry="3.6" fill="%s"/>'
        '<ellipse cx="3.2" cy="-0.6" rx="3.8" ry="3.4" fill="%s"/>'
        '<ellipse cx="1.4" cy="-4.4" rx="2.6" ry="2.2" fill="%s" opacity=".5"/>'
        '</g>' % (i, c, c, c, dark))
# 白楊木（細長）
add('<g id="tp"><path d="M0 7v-6" stroke="#9c8a63" stroke-width="1.1"/>'
    '<ellipse cx="0" cy="-5" rx="3.1" ry="9" fill="#a9cf8b"/>'
    '<ellipse cx="-0.9" cy="-6" rx="1.7" ry="5.4" fill="#93c077" opacity=".55"/></g>')
# 松樹（三角）
add('<g id="tc"><path d="M0 7v-4" stroke="#9c8a63" stroke-width="1.1"/>'
    '<path d="M0 -11 L5.6 3 H-5.6 Z" fill="#86b573"/>'
    '<path d="M0 -11 L2.4 3 H-1 Z" fill="#74a562" opacity=".5"/></g>')
# 灌木
add('<g id="tb"><ellipse cx="0" cy="0" rx="5" ry="3.4" fill="#b2d492"/>'
    '<ellipse cx="-2.4" cy="-1" rx="3" ry="2.4" fill="#a2c982"/></g>')
# 小房子（橘屋頂）
add('<g id="hs">'
    '<path d="M-5 1 h10 v6 h-10 z" fill="%s"/>'
    '<path d="M-6.4 1 L0 -4.6 L6.4 1 Z" fill="ROOF1"/>'
    '<path d="M-1.4 3 h2.8 v4 h-2.8 z" fill="#d9c8a8"/>'
    '</g>' % WALL)
add('</defs>')

# 紙
add('<rect width="%d" height="%d" fill="%s"/>' % (W, H, PAPER))

# ── 海 ────────────────────────────────────────────────────────────────
add('<g filter="url(#wob)">')
add('<path d="%s" fill="%s"/>' % (COAST, SEA[1]))
add('<path d="%s" fill="%s" opacity=".55" transform="translate(-10 -8)"/>' % (COAST, SEA[2]))
add('</g>')
# 海面的細紋
add('<g stroke="%s" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".55">' % "#e6f2f8")
for _ in range(46):
    x = rnd.uniform(0, W); y = rnd.uniform(0, H)
    if land_ok(x, y):
        continue
    add('<path d="M%s %sq7 -2 14 0"/>' % (esc(x), esc(y)))
add('</g>')
# 沙岸
add('<path d="%s" fill="none" stroke="%s" stroke-width="13" stroke-linecap="round" '
    'opacity=".85" filter="url(#wob2)"/>' % (SHORE, SAND))

# ── 陸地的大色塊：一層一層淡綠疊上去，邊緣用抖動濾鏡弄軟 ─────────────
add('<g filter="url(#wob)">')
blobs = [
    (250, 120, 140, 82, GREENS[0], .52), (334, 250, 118, 100, GREENS[1], .46),
    (198, 206, 106, 72, GREENS[1], .38), (148, 344, 96, 82, GREENS[0], .44),
    (306, 424, 126, 100, GREENS[2], .38), (192, 502, 108, 82, GREENS[1], .40),
    (332, 600, 110, 72, GREENS[0], .38), (118, 182, 72, 62, GREENS[2], .26),
    (382, 142, 82, 82, GREENS[3], .28), (252, 620, 110, 64, GREENS[1], .32),
]
for cx, cy, rx, ry, c, o in blobs:
    add('<ellipse cx="%d" cy="%d" rx="%d" ry="%d" fill="%s" opacity="%s"/>' % (cx, cy, rx, ry, c, o))
# 幾塊留白的草原。繪本裡大片的白紙跟綠色一樣重要，全鋪滿反而會悶。
for cx, cy, rx, ry in [(196, 150, 56, 34), (128, 300, 46, 30), (272, 392, 60, 34),
                       (160, 470, 48, 30), (352, 340, 44, 34), (240, 556, 52, 28)]:
    add('<ellipse cx="%d" cy="%d" rx="%d" ry="%d" fill="#fbfaf2" opacity=".55"/>' % (cx, cy, rx, ry))
add('</g>')

# ── 田：淡黃綠的小方塊，斜斜地排成一片 ───────────────────────────────
add('<g filter="url(#wob2)">')
for cx, cy, ang, nx, ny in [(258, 210, -18, 4, 3), (206, 396, 14, 3, 3),
                            (346, 470, -12, 3, 2), (300, 588, 10, 3, 2)]:
    add('<g transform="translate(%d %d) rotate(%d)" opacity=".75">' % (cx, cy, ang))
    for i in range(nx):
        for j in range(ny):
            x = (i - nx / 2) * 22; y = (j - ny / 2) * 15
            add('<rect x="%s" y="%s" width="21" height="14" fill="%s" opacity=".9"/>'
                % (esc(x), esc(y), FIELD[(i + j) % len(FIELD)]))
    add('</g>')
add('</g>')

# ── 道路 ──────────────────────────────────────────────────────────────
add('<g filter="url(#wob2)">')
add('<path d="%s" fill="none" stroke="%s" stroke-width="8" stroke-linecap="round" opacity=".95"/>' % (ROAD_D, ROAD))
add('<path d="%s" fill="none" stroke="#f8f1e0" stroke-width="3.4" stroke-linecap="round" opacity=".9"/>' % ROAD_D)
add('</g>')

# ── 森林：右邊和右上密、靠海邊疏 ─────────────────────────────────────
add('<g>')
planted = []

def plant(x, y):
    if not land_ok(x, y) or near_place(x, y, 32) or near_road(x, y, 11):
        return False
    if any((x - px) ** 2 + (y - py) ** 2 < 40 for px, py in planted):
        return False
    planted.append((x, y))
    r = rnd.random()
    sc = rnd.uniform(.72, 1.25)
    if r < .1:   use("tc", x, y, sc * 1.05)
    elif r < .2: use("tb", x, y, sc)
    else:        use("t%d" % rnd.randrange(3), x, y, sc)
    return True

# 一叢一叢地種：先挑一個叢心，再在它周圍灑十幾棵。
# 均勻亂撒會變成「綠色的雜訊」，繪本裡的森林是一團一團的。
clumps = 0
tries = 0
while clumps < 54 and tries < 4000:
    tries += 1
    cx = rnd.uniform(10, W - 10); cy = rnd.uniform(10, H - 10)
    if not land_ok(cx, cy) or near_place(cx, cy, 44):
        continue
    if (cx - 300) ** 2 + (cy - 344) ** 2 < 80 ** 2:     # 村莊周圍留空
        continue
    if rnd.random() > 0.46 + 0.54 * (cx / W):           # 越靠右越容易長森林
        continue
    clumps += 1
    n = rnd.randrange(6, 20)
    rx = rnd.uniform(16, 34); ry = rnd.uniform(12, 26)
    for _ in range(n * 3):
        a = rnd.uniform(0, math.tau); rr = math.sqrt(rnd.random())
        plant(cx + math.cos(a) * rr * rx, cy + math.sin(a) * rr * ry)
        if len(planted) % 400 == 0:
            break
# 零星的散樹，讓草原上不會空得太乾淨
for _ in range(1400):
    if len(planted) > 470:
        break
    plant(rnd.uniform(6, W - 6), rnd.uniform(6, H - 6))
add('</g>')

# ── 成排的白楊木（沿著田邊，繪本裡最有味道的一筆）─────────────────────
add('<g>')
for x0, y0, dx, dy, n in [(214, 120, 11, 5, 9), (258, 262, 10, -4, 7),
                          (150, 450, 12, 6, 6), (330, 552, -11, 5, 6),
                          (368, 300, -4, 13, 6)]:
    for i in range(n):
        x = x0 + dx * i + rnd.uniform(-1.2, 1.2)
        y = y0 + dy * i + rnd.uniform(-1.2, 1.2)
        if land_ok(x, y) and not near_place(x, y, 26):
            use("tp", x, y, rnd.uniform(.82, 1.12))
add('</g>')

# ── 七個景點 ──────────────────────────────────────────────────────────
def house(x, y, s=1.0, roof=None):
    roof = roof or ROOF[rnd.randrange(len(ROOF))]
    add('<g transform="translate(%s %s) scale(%s)">'
        '<path d="M-5 1 h10 v6 h-10 z" fill="%s"/>'
        '<path d="M-6.6 1.2 L0 -4.8 L6.6 1.2 Z" fill="%s"/>'
        '<path d="M-1.4 3 h2.8 v4 h-2.8 z" fill="#cdb894"/>'
        '</g>' % (esc(x), esc(y), esc(s), WALL, roof))

# ① 倉鼠的家：一間比較大的小屋 + 旁邊兩棵樹
x, y = P["home"]
add('<g filter="url(#wob2)">')
add('<ellipse cx="%s" cy="%s" rx="30" ry="18" fill="%s" opacity=".55"/>' % (esc(x), esc(y + 6), GREENS[0]))
add('</g>')
house(x, y, 1.9, "#d2703f")
use("t1", x - 20, y + 6, 1.1); use("tb", x + 19, y + 9, 1.0)

# ② 後院草地：菜畦 + 一排小花
x, y = P["garden"]
add('<g transform="translate(%s %s)" filter="url(#wob2)">' % (esc(x), esc(y)))
add('<ellipse cx="0" cy="4" rx="26" ry="15" fill="#e4ecac" opacity=".9"/>')
for i in range(4):
    add('<rect x="%d" y="-6" width="7" height="18" rx="2" fill="#cfe0a0" opacity=".9"/>' % (-16 + i * 9))
add('</g>')
add('<g>')
for i in range(5):
    add('<circle cx="%s" cy="%s" r="2.2" fill="#f2c94c"/>' % (esc(x - 15 + i * 7.5), esc(y - 9)))
add('</g>')

# ③ 大公園：池塘 + 大樹 + 長椅
x, y = P["park"]
add('<g filter="url(#wob2)">')
add('<ellipse cx="%s" cy="%s" rx="26" ry="14" fill="%s"/>' % (esc(x + 10), esc(y + 6), SEA[0]))
add('<ellipse cx="%s" cy="%s" rx="19" ry="9" fill="%s" opacity=".7"/>' % (esc(x + 10), esc(y + 5), SEA[1]))
add('</g>')
use("t0", x - 15, y - 4, 2.0); use("t2", x - 24, y + 5, 1.3)
add('<g stroke="#b99a6c" stroke-width="1.6"><path d="M%s %sh10"/></g>' % (esc(x - 8), esc(y + 12)))

# ④ 熱鬧街道：一團橘屋頂的村莊（繪本裡的重點）
x, y = P["street"]
add('<g filter="url(#wob2)"><ellipse cx="%s" cy="%s" rx="52" ry="34" fill="%s" opacity=".55"/></g>'
    % (esc(x), esc(y + 4), GREENS[0]))
spots = []
while len(spots) < 26:
    a = rnd.uniform(0, math.tau); r = math.sqrt(rnd.random())
    hx = x + math.cos(a) * r * 44; hy = y + math.sin(a) * r * 27
    if any((hx - ox) ** 2 + (hy - oy) ** 2 < 62 for ox, oy in spots):
        continue
    spots.append((hx, hy))
for hx, hy in sorted(spots, key=lambda p: p[1]):
    house(hx, hy, rnd.uniform(.85, 1.15))
use("tp", x - 44, y - 12, .9); use("tp", x + 45, y + 8, .9)

# ⑤ 遊戲中心：一棟大一點、屋頂顏色不一樣的建築
x, y = P["arcade"]
add('<g filter="url(#wob2)"><ellipse cx="%s" cy="%s" rx="30" ry="18" fill="%s" opacity=".5"/></g>'
    % (esc(x), esc(y + 5), GREENS[1]))
add('<g transform="translate(%s %s) scale(2.1)">'
    '<path d="M-7 1 h14 v7 h-14 z" fill="#efe4d2"/>'
    '<path d="M-8.6 1.2 L0 -5.4 L8.6 1.2 Z" fill="#8f7ac2"/>'
    '<rect x="-4.6" y="2.4" width="3.4" height="3" fill="#7fc6de"/>'
    '<rect x="1.2" y="2.4" width="3.4" height="3" fill="#e69bc4"/>'
    '<path d="M-2 4 h4 v4 h-4 z" fill="#cdb894"/>'
    '</g>' % (esc(x), esc(y)))
use("t1", x - 24, y + 7, 1.0)

# ⑥ 遊樂園：摩天輪 + 兩頂帳篷
x, y = P["fair"]
add('<g filter="url(#wob2)"><ellipse cx="%s" cy="%s" rx="40" ry="24" fill="%s" opacity=".5"/></g>'
    % (esc(x), esc(y + 4), GREENS[0]))
add('<g transform="translate(%s %s)">' % (esc(x - 12), esc(y - 2)))
add('<path d="M0 0 L-10 19M0 0 L10 19" stroke="#c0a678" stroke-width="2.2"/>')
add('<circle cx="0" cy="0" r="17" fill="none" stroke="#dd8551" stroke-width="2.2"/>')
add('<g stroke="#eaa987" stroke-width="1.2">')
for k in range(6):
    a = k * math.pi / 3
    add('<path d="M0 0 L%s %s"/>' % (esc(math.sin(a) * 17), esc(-math.cos(a) * 17)))
add('</g>')
for k in range(6):
    a = k * math.pi / 3
    add('<rect x="-2.4" y="-2" width="4.8" height="4" rx="1.4" fill="%s" '
        'transform="translate(%s %s)"/>'
        % (ROOF[k % 4], esc(math.sin(a) * 17), esc(-math.cos(a) * 17 + 2.8)))
add('<circle cx="0" cy="0" r="2.2" fill="#f2c94c"/></g>')
for tx, ty, c in [(x + 14, y + 6, "#e59a63"), (x + 27, y + 11, "#7fb6df")]:
    add('<g transform="translate(%s %s)"><path d="M-8 6 L0 -8 L8 6 Z" fill="%s"/>'
        '<path d="M0 -8 L2 6 h-3 z" fill="#fbf4ea" opacity=".8"/></g>' % (esc(tx), esc(ty), c))

# ⑦ 陽光沙灘：椰子樹 + 遮陽傘 + 沙堡，就在岸邊
x, y = P["beach"]
add('<g filter="url(#wob2)"><ellipse cx="%s" cy="%s" rx="42" ry="17" fill="%s" opacity=".9"/></g>'
    % (esc(x), esc(y + 6), SAND))
add('<g transform="translate(%s %s)">' % (esc(x - 16), esc(y)))
add('<path d="M0 8 q-3 -10 1 -15" stroke="#b08a5c" stroke-width="2" fill="none"/>')
add('<g fill="#6fb37a"><path d="M2 -7 q-10 -4 -15 -1 q7 -1 14 3 z"/>'
    '<path d="M2 -7 q10 -5 15 -2 q-7 -1 -14 4 z"/>'
    '<path d="M2 -8 q-4 -9 -11 -11 q6 5 10 12 z"/>'
    '<path d="M2 -8 q5 -9 12 -10 q-7 4 -11 11 z"/></g></g>')
add('<g transform="translate(%s %s)"><path d="M-9 1 a9 6 0 0 1 18 0 z" fill="#ec8a6a"/>'
    '<path d="M-9 1 a9 6 0 0 1 4 -5 l1 5 z" fill="#fbf4ea"/>'
    '<path d="M4 -4 a9 6 0 0 1 5 5 h-4 z" fill="#fbf4ea"/>'
    '<rect x="-.7" y="1" width="1.4" height="8" fill="#d6c3a0"/></g>' % (esc(x + 12), esc(y + 2)))
add('<g fill="#e3cd9c"><rect x="%s" y="%s" width="12" height="6" rx="1"/>'
    '<rect x="%s" y="%s" width="4" height="5" rx="1"/>'
    '<rect x="%s" y="%s" width="4" height="5" rx="1"/></g>'
    % (esc(x - 2), esc(y + 7), esc(x - 1), esc(y + 3), esc(x + 4), esc(y + 3)))

# ── 零星的小房子（讓世界不要只有景點）────────────────────────────────
add('<g>')
for _ in range(14):
    hx = rnd.uniform(30, W - 20); hy = rnd.uniform(40, H - 90)
    if land_ok(hx, hy) and not near_place(hx, hy, 52) and not near_road(hx, hy, 9):
        house(hx, hy, rnd.uniform(.8, 1.1))
add('</g>')

# ── 紙的顆粒 ──────────────────────────────────────────────────────────
add('<rect width="%d" height="%d" filter="url(#grain)" opacity=".20" '
    'style="mix-blend-mode:multiply"/>' % (W, H))
add('</svg>')

svg = "\n".join(out)
with open("world-map.svg", "w", encoding="utf-8") as f:
    f.write(svg)

print("world-map.svg  %.1f KB" % (len(svg.encode()) / 1024))
print("WORLD_MAP_PINS：")
for k, x, y in PLACES:
    print("            %-8s{ x: %3d / %d, y: %3d / %d }," % (k + ":", x, W, y, H))
