"""把 4 张人物图的白色背景改成透明, 保存为 PNG"""
from PIL import Image
from pathlib import Path

base = Path(r'D:\系统默认\桌面\数学题\frontend\assets\avatars')
files = ['char-1.png', 'char-2.png', 'char-3.png', 'char-4.png']

# 容差: 颜色在 240+ 都视为白
THRESHOLD = 245

for name in files:
    src = base / name
    img = Image.open(src).convert('RGBA')
    pixels = img.load()
    w, h = img.size

    # 边缘 alpha 也要 partial, 否则边缘会锯齿
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r >= THRESHOLD and g >= THRESHOLD and b >= THRESHOLD:
                pixels[x, y] = (255, 255, 255, 0)
            else:
                # 越接近白 -> 越透明 (柔化边缘)
                avg = (r + g + b) / 3
                if avg > 220:
                    # 200~245 之间用 partial alpha
                    new_a = int(255 * (245 - avg) / (245 - 220))
                    pixels[x, y] = (r, g, b, new_a)
                else:
                    pixels[x, y] = (r, g, b, 255)

    # 保存 (覆盖原文件)
    img.save(src, 'PNG', optimize=True)
    print(f"  {name}: {src.stat().st_size / 1024:.1f} KB")

print("\nDone - all 4 avatars now have transparent backgrounds")
