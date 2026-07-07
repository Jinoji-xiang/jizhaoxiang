"""Find the order of click handler binding in deployed app.js"""
import urllib.request

url = "https://jinoji-xiang.github.io/jizhaoxiang/app.js"
req = urllib.request.Request(url, headers={"User-Agent": "audit/1.0", "Cache-Control": "no-cache"})
with urllib.request.urlopen(req, timeout=15) as r:
    text = r.read().decode("utf-8", errors="replace")

lines = text.split("\n")
print(f"Total lines: {len(lines)}")
print()
print("=== Lines 1-50 (top of script) ===")
for i in range(0, 50):
    print(f"  {i+1}: {lines[i]}")

print()
print("=== Around line 325 (modal handlers) ===")
for i in range(320, 350):
    print(f"  {i+1}: {lines[i]}")

print()
print("=== Around line 480-490 (the error site) ===")
for i in range(480, 495):
    print(f"  {i+1}: {lines[i]}")
