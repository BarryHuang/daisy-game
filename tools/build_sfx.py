#!/usr/bin/env python3
"""產生 sfx/*.wav —— 遊戲音效。

為什麼要自己合成：這台機器沒有 ffmpeg 也沒有 numpy，外部的免費音效網站
（kenney.nl、opengameart）又被 proxy 擋著。用 Python 的 wave 模組自己疊
波形其實效果不差，而且每個音效都短，檔案很小（22050Hz 單聲道 16bit，
0.3 秒約 13KB），整包放進 Service Worker 的快取也沒負擔。

跟原本的 playTone() 差在哪：playTone 是一個裸的振盪器，沒有包絡也沒有
層次，所以聽起來就是「嗶」。這裡每個音效都是多層波形 + ADSR 包絡 +
滑音 + 濾波雜訊疊出來的。

    python3 tools/build_sfx.py
"""
import math, os, struct, wave

SR = 22050          # 取樣率。卡通音效不需要 44.1k，一半的檔案大小
AMP = 0.82          # 主音量（留 headroom 給疊加）

# ── 基本波形 ──────────────────────────────────────────────────────────
def _phase(freq_at, n):
    """依每個取樣點的頻率累積相位，這樣才做得出滑音。"""
    ph, out = 0.0, []
    for i in range(n):
        ph += 2 * math.pi * freq_at(i / SR) / SR
        out.append(ph)
    return out

def osc(kind, freq, dur, detune=0.0):
    """freq 可以是數字，也可以是 t -> Hz 的函式（滑音）。"""
    n = int(dur * SR)
    f = freq if callable(freq) else (lambda t, _f=freq: _f)
    ff = (lambda t: f(t) * (1 + detune)) if detune else f
    buf = []
    for ph in _phase(ff, n):
        x = ph % (2 * math.pi)
        if kind == 'sine':      v = math.sin(ph)
        elif kind == 'square':  v = 1.0 if x < math.pi else -1.0
        elif kind == 'saw':     v = x / math.pi - 1.0
        elif kind == 'tri':     v = (2 / math.pi) * math.asin(math.sin(ph))
        else:                   v = 0.0
        buf.append(v)
    return buf

_seed = [12345]
def rnd():
    """自己寫的亂數，才不用管 random 的版本差異，結果也永遠一樣。"""
    _seed[0] = (1103515245 * _seed[0] + 12345) % (1 << 31)
    return _seed[0] / (1 << 30) - 1.0

def noise(dur):
    return [rnd() for _ in range(int(dur * SR))]

# ── 包絡與處理 ────────────────────────────────────────────────────────
def adsr(buf, a=0.005, d=0.06, s=0.5, r=0.12):
    """標準的 ADSR。沒有包絡的音聽起來就是「嗶」，有了才像樂器。"""
    n = len(buf)
    na, nd = int(a * SR), int(d * SR)
    nr = min(int(r * SR), max(0, n - na - nd))
    ns = max(0, n - na - nd - nr)
    out = []
    for i, v in enumerate(buf):
        if i < na:                 g = i / max(1, na)
        elif i < na + nd:          g = 1 - (1 - s) * (i - na) / max(1, nd)
        elif i < na + nd + ns:     g = s
        else:                      g = s * max(0.0, 1 - (i - na - nd - ns) / max(1, nr))
        out.append(v * g)
    return out

def decay(buf, k=8.0):
    """指數衰減，敲擊類的音用這個比 ADSR 自然。"""
    return [v * math.exp(-k * i / SR) for i, v in enumerate(buf)]

def lowpass(buf, cut):
    """一階低通。把雜訊磨圓，不然聽起來像收音機沒轉到台。"""
    a = 1 - math.exp(-2 * math.pi * cut / SR)
    y, out = 0.0, []
    for v in buf:
        y += a * (v - y)
        out.append(y)
    return out

def highpass(buf, cut):
    lp = lowpass(buf, cut)
    return [v - l for v, l in zip(buf, lp)]

def mix(*layers):
    n = max(len(l) for l in layers)
    out = [0.0] * n
    for l in layers:
        for i, v in enumerate(l):
            out[i] += v
    return out

def at(buf, t):
    """把一段音放到 t 秒的位置（前面補靜音）。"""
    return [0.0] * int(t * SR) + buf

def gain(buf, g):
    return [v * g for v in buf]

def clip(buf):
    """軟削波：疊太多層時不要爆掉，而是柔和地壓回來。"""
    return [math.tanh(v * 1.1) for v in buf]

def write(name, buf):
    buf = clip(gain(buf, AMP))
    # 尾巴淡出，避免喇叭「啪」一聲
    nf = min(int(0.008 * SR), len(buf))
    for i in range(nf):
        buf[len(buf) - nf + i] *= 1 - i / nf
    path = os.path.join("sfx", name + ".wav")
    with wave.open(path, "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, v)) * 32000)) for v in buf))
    return path, os.path.getsize(path)

def glide(f0, f1, dur, curve=1.0):
    """t -> Hz 的滑音函式。curve>1 先慢後快。"""
    return lambda t: f0 + (f1 - f0) * min(1.0, (t / dur)) ** curve

# ── 音效 ──────────────────────────────────────────────────────────────
N = lambda s: 440 * 2 ** ((s - 9) / 12)      # 半音 -> Hz（0 = C4）

SFX = {}

def sfx(fn):
    SFX[fn.__name__] = fn
    return fn

@sfx
def coin():
    """金幣：兩個上行的方波音，像跳起來接到硬幣。"""
    a = decay(osc('square', N(23), .07), 26)        # B5
    b = decay(osc('square', N(28), .30), 11)        # E6
    c = decay(osc('sine',   N(40), .18), 18)        # 上面加一層亮的
    return mix(a, at(b, .06), at(gain(c, .28), .06))

@sfx
def pop():
    """摸摸／點一下：短短的 blip。"""
    o = decay(osc('sine', glide(420, 980, .05), .11), 32)
    n = decay(lowpass(noise(.03), 3000), 60)
    return mix(o, gain(n, .18))

@sfx
def eat():
    """吃東西：三個低頻短音，咀嚼感。"""
    out = []
    for i, t in enumerate((0, .07, .15)):
        o = decay(osc('tri', 190 - i * 18, .06), 40)
        n = decay(lowpass(noise(.05), 1400), 48)
        out.append(at(mix(o, gain(n, .3)), t))
    return mix(*out)

@sfx
def jump():
    """跳：上行滑音。"""
    o = decay(osc('square', glide(280, 720, .13, 1.6), .17), 17)
    return mix(gain(o, .8), gain(decay(osc('sine', glide(560, 1440, .13, 1.6), .17), 17), .22))

@sfx
def land():
    """落地：低頻 thump + 一撮塵土。"""
    o = decay(osc('sine', glide(200, 70, .10), .16), 26)
    n = decay(lowpass(noise(.10), 900), 30)
    return mix(o, gain(n, .35))

@sfx
def levelup():
    """升級：C-E-G-C 上行琶音，三角波帶一點顫音。"""
    out = []
    for i, s in enumerate((12, 16, 19, 24)):
        f = N(s)
        vib = (lambda t, _f=f: _f * (1 + .008 * math.sin(2 * math.pi * 5.5 * t)))
        o = adsr(osc('tri', vib, .42), a=.006, d=.10, s=.55, r=.30)
        o = mix(o, gain(osc('sine', f * 2, .42), .18))
        out.append(at(decay(o, 4.2), i * .10))
    return mix(*out)

@sfx
def error():
    """不行：兩個下行的低方波。"""
    a = decay(osc('square', 240, .11), 20)
    b = decay(osc('square', 180, .22), 13)
    return mix(gain(a, .55), at(gain(b, .55), .10))

@sfx
def success():
    """買到東西／完成：三個上行音 + 亮尾巴。"""
    out = []
    for i, s in enumerate((12, 17, 21)):
        out.append(at(decay(adsr(osc('tri', N(s), .26), a=.005, d=.07, s=.6, r=.18), 6), i * .075))
    tail = at(gain(decay(osc('sine', N(33), .3), 9), .25), .2)
    return mix(*out, tail)

@sfx
def sparkle():
    """星星：高頻的快速琶音，帶一點隨機。"""
    out = []
    for i in range(7):
        f = N(28 + (i * 5) % 12 + 12 * (i // 4))
        out.append(at(gain(decay(osc('sine', f, .16), 26), .42), i * .035))
    return mix(*out)

@sfx
def whoosh():
    """轉場／衝刺：濾波雜訊掃過去。"""
    n = noise(.34)
    sw = []
    for i, v in enumerate(n):                       # 手動掃低通的截止頻率
        t = i / SR
        cut = 400 + 3800 * math.sin(math.pi * min(1, t / .34))
        sw.append((v, cut))
    y, out = 0.0, []
    for v, cut in sw:
        a = 1 - math.exp(-2 * math.pi * cut / SR)
        y += a * (v - y)
        out.append(y)
    env = [math.sin(math.pi * min(1, i / SR / .34)) ** 1.4 for i in range(len(out))]
    return [v * e * .8 for v, e in zip(out, env)]

@sfx
def splash():
    """水花：雜訊 burst，低通快速往下掃。"""
    n = noise(.30)
    y, out = 0.0, []
    for i, v in enumerate(n):
        cut = 5200 * math.exp(-6 * i / SR) + 300
        a = 1 - math.exp(-2 * math.pi * cut / SR)
        y += a * (v - y)
        out.append(y)
    out = decay(out, 7)
    blob = decay(osc('sine', glide(700, 180, .12), .2), 14)
    return mix(gain(out, .9), gain(blob, .3))

@sfx
def bump():
    """碰碰車撞擊：短低頻 + 一點失真。"""
    o = decay(osc('square', glide(150, 60, .07), .13), 34)
    n = decay(lowpass(noise(.06), 1100), 55)
    return [math.tanh(v * 2.2) * .7 for v in mix(o, gain(n, .5))]

@sfx
def ride():
    """設施啟動：柔和的上行。"""
    o = adsr(osc('tri', glide(180, 340, .5, .7), .62), a=.06, d=.2, s=.7, r=.3)
    o2 = gain(adsr(osc('sine', glide(360, 680, .5, .7), .62), a=.08, d=.2, s=.6, r=.3), .3)
    return mix(o, o2)

@sfx
def door():
    """換地圖：兩個柔和的木頭音。"""
    a = decay(mix(osc('tri', 330, .2), gain(osc('sine', 660, .2), .2)), 12)
    b = decay(mix(osc('tri', 247, .3), gain(osc('sine', 494, .3), .2)), 9)
    return mix(gain(a, .7), at(gain(b, .7), .12))

@sfx
def sleep():
    """睡覺：緩慢下行的柔音。"""
    o = adsr(osc('sine', glide(420, 200, .7, .8), .85), a=.09, d=.3, s=.5, r=.4)
    o2 = gain(adsr(osc('tri', glide(210, 100, .7, .8), .85), a=.1, d=.3, s=.5, r=.4), .35)
    return mix(o, o2)

@sfx
def wheel():
    """跑輪：一小段機械感的循環。"""
    out = []
    for i in range(6):
        out.append(at(decay(lowpass(noise(.05), 2200), 42), i * .055))
    tone = gain(decay(osc('saw', glide(220, 300, .33), .36), 6), .18)
    return mix(*out, tone)

@sfx
def click():
    """UI 點擊：很短的木頭聲。"""
    o = decay(osc('tri', 880, .05), 55)
    n = decay(highpass(noise(.02), 2000), 90)
    return mix(gain(o, .6), gain(n, .3))

if __name__ == "__main__":
    total = 0
    for name in sorted(SFX):
        path, size = write(name, SFX[name]())
        total += size
        print("  %-10s %6.1f KB" % (name, size / 1024))
    print("共 %d 個音效，%.1f KB" % (len(SFX), total / 1024))
