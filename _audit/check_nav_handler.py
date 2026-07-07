"""Verify nav-link handler in deployed JS handles 'practice' correctly"""
import urllib.request
import re

url = "https://jinoji-xiang.github.io/jizhaoxiang/app.js"
req = urllib.request.Request(url, headers={"User-Agent": "audit/1.0", "Cache-Control": "no-cache"})
with urllib.request.urlopen(req, timeout=15) as r:
    text = r.read().decode("utf-8", errors="replace")

# Find the nav-link handler block
m = re.search(r"// ========== 导航 ==========.*?showPage\(page\);", text, re.DOTALL)
if m:
    block = m.group(0)
    print("Deployed nav-link handler block:")
    print(block[:800])
    print("...")
    print("Has startPractice call:", "startPractice" in block)
    print("Handles 'practice' page:", "page === 'practice'" in block)
else:
    print("Could not find nav-link handler in deployed JS")
