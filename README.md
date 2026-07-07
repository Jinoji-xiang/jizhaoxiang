# 🧮 小学数学题库系统（1~2年级）

一个专为小学 1~2 年级设计的数学练习网站。支持两种部署方式：

| 部署方式 | 适合场景 | 用户数据存储 |
|----------|----------|---------------|
| **GitHub Pages（纯前端）** | 个人快速访问、演示、家庭使用 | 浏览器 localStorage |
| **Render（Python 全栈）** | 正式运营、多用户、多设备同步 | SQLite / 后续可换 MySQL |

> ✨ 双部署可同时运行：GitHub Pages 静态版快速加载，Render 后端版完整功能。

---

## ✨ 功能特性

- 👤 用户注册 / 登录（自动登录）
- 📚 题库覆盖 1~2 年级数学
- 🎯 三种练习模式：快速练习 / 知识点专项 / 错题重做
- 📊 学习报告：总正确率 + 各知识点掌握情况
- 📒 错题本：自动收录、可标记掌握
- 📱 响应式 UI：手机、平板、桌面都能用
- 🎨 儿童友好界面

---

## 🏗️ 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Python 3.11 + Flask 3 + SQLAlchemy |
| 数据库 | SQLite（部署在 Render 时持久化为 disk volume） |
| 前端 | 原生 HTML5 + CSS3 + JavaScript（零依赖） |
| 静态部署 | 可纯前端部署到 GitHub Pages |
| API 部署 | 可部署到 Render / Railway / Fly.io |

---

## 📁 项目结构

```
数学题/
├── backend/                   # Flask 后端
│   ├── app.py                 # 主应用 + API
│   ├── seed_data.py           # 题库种子数据
│   └── requirements.txt       # Python 依赖（含 gunicorn）
├── frontend/                  # 前端代码（智能双模式）
│   ├── index.html
│   ├── style.css
│   ├── app.js                 # API_MODE 自动切换
│   └── data/
│       └── questions.js       # 静态版用的内嵌题目
├── .github/
│   └── workflows/
│       └── deploy.yml         # 自动部署 GitHub Pages
├── render.yaml                # Render 一键部署配置
├── runtime.txt                # Python 版本
├── start.bat / 启动.bat       # 本地启动脚本
└── README.md                  # 本文档
```

---

## 🚀 本地启动（开发用）

### Windows
双击 `start.bat`

### 手动启动（任何系统）
```bash
cd backend
pip install -r requirements.txt
python app.py
```

打开浏览器访问 `http://127.0.0.1:5000`

---

## 🌐 部署方案 A：GitHub Pages（纯前端，推荐）

### 优点
- ✅ 完全免费
- ✅ 全 CDN 加速，访问极快
- ✅ 维护简单，推代码自动部署
- ✅ HTTPS 自动签发

### 限制
- 用户数据存浏览器 localStorage，不同设备/浏览器数据不互通
- 没有真正的用户系统（可视为"伪登录"）

### 步骤

#### 1. 在 GitHub 创建新仓库
访问 https://github.com/new，创建一个新仓库（例如 `math-quiz`），**不要勾选任何初始化选项**。

#### 2. 推送代码
在项目根目录打开终端（PowerShell / CMD / Bash），逐行执行：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<你的用户名>/math-quiz.git
git push -u origin main
```

> 把 `<你的用户名>` 替换成你的 GitHub 用户名。

#### 3. 启用 GitHub Pages
1. 进入仓库页面 → 点击 **Settings** → 左侧 **Pages**
2. Source 选 **GitHub Actions**
3. 等 Actions 跑完（点 **Actions** 选项卡可看进度），通常 1~2 分钟
4. 部署成功后会显示网址，类似：
   ```
   https://<你的用户名>.github.io/math-quiz/
   ```
5. 浏览器访问这个地址即可

### 自定义域名（可选）
在 Pages 设置 → Custom domain 填你的域名，然后去 DNS 配置 CNAME 即可。

---

## 🚀 部署方案 B：Render（Python 全栈）

### 优点
- ✅ 真正的用户系统（数据服务器存储）
- ✅ 多设备数据同步
- ✅ 完整错题本、学习报告功能
- ✅ 免费额度（每月 750 小时）

### 限制
- ⚠️ 免费版冷启动慢（30 秒左右）
- ⚠️ 免费版 SQLite 是临时存储，需要付费才持久化
- ⚠️ 免费版 15 分钟无访问会休眠

### 步骤

#### 1. 推送代码到 GitHub（同方案 A 第 1~2 步）

#### 2. 注册 Render
访问 https://render.com，用 GitHub 账号登录。

#### 3. 一键部署
1. Render 仪表板 → **New** → **Blueprint**
2. 选择你的 `math-quiz` 仓库
3. Render 会自动识别 `render.yaml`
4. 点击 **Apply**
5. 等 3~5 分钟，部署完成后会得到一个网址：
   ```
   https://math-quiz-backend.onrender.com
   ```

#### 4. 注意事项
- 免费实例休眠后首次访问会变慢
- 如需持久化数据，免费版可考虑升级，或换成 PostgreSQL

---

## 🌐 同时部署两个

最推荐：**GitHub Pages 做主入口（快），Render 做后端 API**

1. 部署 GitHub Pages → 拿到静态页地址 `https://x.github.io/math-quiz/`
2. 部署 Render → 拿到后端地址 `https://math-quiz-backend.onrender.com`
3. 用户用 Pages 那个网址访问，速度快
4. 答题时前端会自动连 Render 后端（同源问题需要解决，见下）

⚠️ 当前代码默认同源策略，浏览器会拒绝跨域请求。如要让前端连远端后端，需在 `app.js` 顶部加：

```js
const API_BASE = 'https://math-quiz-backend.onrender.com';  // 改这里
```

然后所有 `api.get('/api/xxx')` 改为 `api.get(API_BASE + '/api/xxx')`。

需要这个功能告诉我，我可以一键改。

---

## 📚 题库知识点

### 一年级
- 10 以内加法 / 减法
- 20 以内加法 / 减法
- 比大小 / 认识图形 / 找规律 / 应用题

### 二年级
- 100 以内加法 / 减法
- 乘法初步 / 乘法口诀
- 除法初步 / 时间认识 / 找规律 / 应用题

---

## 🔌 API 接口

| 方法 | 路径 | 用途 |
|------|------|------|
| GET  | /api/health | 健康检查（含题库数量） |
| POST | /api/register | 注册 |
| POST | /api/login | 登录 |
| POST | /api/logout | 退出 |
| GET  | /api/user | 当前用户 |
| GET  | /api/user/report | 学习报告 |
| GET  | /api/questions | 抽题 |
| GET  | /api/knowledge | 知识点列表 |
| POST | /api/submit | 提交答案 |
| GET  | /api/wrong-questions | 错题列表 |
| POST | /api/wrong-questions/\<id\>/mark-mastered | 标记掌握 |
| POST | /api/practice-wrong | 错题重做 |

---

## 🛠️ 后续扩展建议

- 题目数量扩到 500+ 道
- 加单元测试（pytest）
- 加 CI/CD（GitHub Actions 已配置 Pages，Render 自动部署）
- 切 PostgreSQL 替代 SQLite
- 加移动端 PWA（支持添加到桌面）
- 加管理员后台

---

## 📄 License

MIT
