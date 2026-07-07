"""Quick sanity check on the modal implementation"""
import re
from pathlib import Path

base = Path(r'D:\系统默认\桌面\数学题')
app = (base / 'frontend' / 'app.js').read_text(encoding='utf-8')
html = (base / 'frontend' / 'index.html').read_text(encoding='utf-8')
css = (base / 'frontend' / 'style.css').read_text(encoding='utf-8')

def check(name, cond):
    mark = 'OK' if cond else 'FAIL'
    print(f"  [{mark}] {name}")

print("=== app.js ===")
check("openLoginModal defined", 'function openLoginModal' in app)
check("closeLoginModal defined", 'function closeLoginModal' in app)
check("setAuthMode defined", 'function setAuthMode' in app)
check("btn-open-login handler", "btn-open-login" in app and "addEventListener" in app)
check("modal-close handler", "modal-close" in app and "addEventListener" in app)
check("modal-submit handler", "modal-submit" in app and "addEventListener" in app)
check("renderUser uses navLoginBtn", 'navLoginBtn' in app and 'hidden' in app)
check("Old auth-btn removed", "$('#auth-btn')" not in app)
check("Old login-card ref removed", "$('#login-card')" not in app)
check("Auto-open on action-btn", 'openLoginModal' in app and 'action-btn' in app)

print("\n=== index.html ===")
check('nav-login-btn exists', 'id="btn-open-login"' in html)
check('login-modal exists', 'id="login-modal"' in html)
check('modal-tabs exists', 'id="modal-tabs"' in html)
check('modal-username exists', 'id="modal-username"' in html)
check('modal-password exists', 'id="modal-password"' in html)
check('modal-submit exists', 'id="modal-submit"' in html)
check('Old login-card removed', 'id="login-card"' not in html)
check('Old auth-btn removed', 'id="auth-btn"' not in html)

print("\n=== style.css ===")
check('.nav-login-btn style', '.nav-login-btn' in css)
check('.modal-overlay style', '.modal-overlay' in css)
check('.modal-dialog style', '.modal-dialog' in css)
check('@keyframes modalPop', '@keyframes modalPop' in css)
check('.grade-pill style', '.grade-pill' in css)

# ID cross-check
all_ids = set(re.findall(r"\$\('(#[a-zA-Z][\w-]*)'\)", app))
html_ids = set(re.findall(r'id="([a-zA-Z][\w-]*)"', html))
print(f"\n=== ID cross-check ===")
print(f"  JS refs {len(all_ids)} unique IDs, HTML has {len(html_ids)} unique IDs")
missing = all_ids - html_ids
if missing:
    print(f"  Missing in HTML: {sorted(missing)}")
else:
    print("  All JS IDs exist in HTML")
