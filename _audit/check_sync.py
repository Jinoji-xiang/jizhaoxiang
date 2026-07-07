"""
审计脚本 v3: 用 ast 解析 Python 端数据,跟 JS 端用宽松正则匹配
"""
import re
import ast
import sys
from pathlib import Path

base = Path(r'D:\系统默认\桌面\数学题')
js_file = base / 'frontend' / 'data' / 'questions.js'
py_file = base / 'backend' / 'seed_data.py'

# 解析 Python: 直接 exec 文件里的 GRADE_1 + GRADE_2
py_ns = {}
exec(compile(py_file.read_text(encoding='utf-8'), str(py_file), 'exec'), py_ns)
g1 = py_ns['GRADE_1']
g2 = py_ns['GRADE_2']
print(f'Python 一年级: {len(g1)} 题')
print(f'Python 二年级: {len(g2)} 题')

# 构建 set
py_set = set()
for q in g1 + g2:
    py_set.add((q['grade'], q['content'], q['answer']))

# 解析 JS: 提取每行大括号内字段
js_text = js_file.read_text(encoding='utf-8')
# JS 题目结构: { id:'xxx', knowledge:'xxx', question_type:'xxx', content:'xxx', options:[...], answer:'xxx', ... }
# 直接 split by 行,每行解析一道题
js_set = set()
js_count = 0
for line in js_text.split('\n'):
    line = line.strip()
    if not line.startswith('{'):
        continue
    # 提取 content 和 answer
    m_content = re.search(r"content:'((?:\\'|[^'])*)'", line)
    m_answer = re.search(r"answer:'((?:\\'|[^'])*)'", line)
    if m_content and m_answer:
        js_set.add((m_content.group(1), m_answer.group(1)))
        js_count += 1

print(f'JS 解析: {js_count} 题')

# 比对
py_set_ca = set((c, a) for g, c, a in py_set)
only_js = js_set - py_set_ca
only_py = py_set_ca - js_set
print(f'\n仅在 JS: {len(only_js)}')
print(f'仅在 Python: {len(only_py)}')
if only_js:
    print('--- JS 独有 ---')
    for c, a in list(only_js)[:10]:
        print(f'  {c[:60]} -> {a}')
if only_py:
    print('--- Python 独有 ---')
    for c, a in list(only_py)[:10]:
        print(f'  {c[:60]} -> {a}')

if js_set == py_set_ca:
    print('\n✓ 题目完全一致')
    sys.exit(0)
else:
    print('\n✗ 题目不一致')
    sys.exit(1)
