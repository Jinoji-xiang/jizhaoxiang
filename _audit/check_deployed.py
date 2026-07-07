"""Check deployed site JS for our fixes"""
import urllib.request

urls = [
    "https://jinoji-xiang.github.io/jizhaoxiang/app.js",
    "https://jinoji-xiang.github.io/jizhaoxiang/index.html",
    "https://jinoji-xiang.github.io/jizhaoxiang/style.css",
]

for url in urls:
    name = url.split("/")[-1]
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "audit/1.0", "Cache-Control": "no-cache"})
        with urllib.request.urlopen(req, timeout=15) as r:
            text = r.read().decode("utf-8", errors="replace")
        actual = r.geturl()
        print(f"\n=== {name} (from {actual}) ===")
        print(f"  Size: {len(text)}")
        if name == "app.js":
            tests = {
                "openLoginModal": "openLoginModal",
                "login-modal handler": "login-modal",
                "startWrongPractice": "startWrongPractice",
                "right-count ref (should be False)": "$('#right-count')",
                "wrong-count ref (should be False)": "$('#wrong-count')",
            }
            for label, needle in tests.items():
                mark = "OK" if (needle in text) != ("should be False" in label) else "FAIL"
                print(f"  [{mark}] {label}: {needle in text}")
        elif name == "index.html":
            tests = {
                "login-modal present": "login-modal",
                "btn-open-login present": "btn-open-login",
                "login-card removed (should be False)": 'id="login-card"',
                "user-info-card hidden by default": 'user-info-card" style="display:none"',
            }
            for label, needle in tests.items():
                mark = "OK" if (needle in text) != ("should be False" in label) else "FAIL"
                print(f"  [{mark}] {label}: {needle in text}")
        elif name == "style.css":
            tests = {
                ".modal-overlay style": ".modal-overlay",
                ".nav-login-btn style": ".nav-login-btn",
                "@keyframes modalPop": "@keyframes modalPop",
            }
            for label, needle in tests.items():
                mark = "OK" if needle in text else "FAIL"
                print(f"  [{mark}] {label}: {needle in text}")
    except Exception as e:
        print(f"\n=== {name} ===")
        print(f"  ERROR: {e}")
