# -*- coding: utf-8 -*-
"""把版本號蓋到 version.js 和 sw.js。每次要部署之前跑一次。

    python3 tools/stamp_version.py

版本號是部署時間（單調遞增，一看就知道新舊）。一個地方決定，兩個地方跟著走：
  - version.js  -> 選單底部顯示，用來確認手機上載到的是不是最新版
  - sw.js       -> CACHE_NAME，版本一變舊快取就整批換掉

以前 CACHE_NAME 是手動改的，忘記升版就會繼續餵舊檔案，而且完全沒有徵兆。

時間一律用台北時間，不看機器的時區。這支以前是 datetime.now()，在筆電上蓋
出來是台北時間、在雲端跑就變 UTC —— 差 8 小時。兩個後果：
  1. 她媽媽在手機上看到的版本會比實際部署時間早 8 小時，對不上
  2. 更嚴重的是「單調遞增」會破功：UTC 蓋的 02:17 比更早在台北蓋的 09:30 還小，
     看數字反而以為是舊版
台灣自 1979 年起沒有日光節約時間，所以直接寫死 +08:00 就是正確的，
也不用依賴機器上有沒有 tzdata。
"""
import io, re, subprocess, sys, datetime, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
TAIPEI = datetime.timezone(datetime.timedelta(hours=8), "Taipei")


def git(*args):
    return subprocess.run(["git", "-C", str(ROOT), *args],
                          capture_output=True, text=True).stdout.strip()


def main():
    # 用時間而不是 commit sha：蓋章必然發生在 commit 之前，抓 HEAD 只會拿到
    # 上一版的 sha，反而誤導。時間戳單調遞增，直接比大小就知道新舊。
    now = datetime.datetime.now(TAIPEI)
    version = now.strftime("%Y-%m-%d %H:%M")
    slug = now.strftime("%Y%m%d-%H%M")          # 快取名稱只用 ASCII

    io.open(ROOT / "version.js", "w", encoding="utf-8").write(
        f'''// 由 tools/stamp_version.py 產生，不要手改。
// 選單底部會顯示這個，用來確認手機載到的是不是最新版。
const APP_VERSION = "{version}";
''')

    sw_path = ROOT / "sw.js"
    sw = io.open(sw_path, encoding="utf-8").read()
    new_sw, n = re.subn(r"const CACHE_NAME = '[^']*';",
                        f"const CACHE_NAME = 'daisy-{slug}';", sw, count=1)
    if n != 1:
        sys.exit("sw.js: 找不到 CACHE_NAME")
    io.open(sw_path, "w", encoding="utf-8").write(new_sw)

    print(f"版本 {version}（台北時間）")
    print("  version.js 已更新")
    print(f"  sw.js CACHE_NAME -> daisy-{slug}")
    if git("status", "--porcelain"):
        print("  提醒：記得把 version.js 和 sw.js 一起 commit")


main()
