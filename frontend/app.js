/**
 * 小学数学题库 - 前端主逻辑
 * 智能模式:
 *   - 有后端(API可达): 使用真实的注册/登录/错题本/学习报告
 *   - 无后端(静态部署): 使用 localStorage 模拟,自动从 questions.js 取题
 */

// ============== 启动模式检测 ==============
const API_MODE = (() => {
    // 同源下能 fetch 到 /api/health 就算有后端
    // 注意: GitHub Pages 部署时 origin = *.github.io,本地 = 127.0.0.1:5000
    try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/health', false);  // 同步
        xhr.send(null);
        return xhr.status === 200;
    } catch (e) {
        return false;
    }
})();

console.log('[Math Quiz] Mode:', API_MODE ? 'ONLINE (backend)' : 'OFFLINE (localStorage)');

// ============== 全局状态 ==============
const state = {
    user: null,
    currentPage: 'home',
    offline: !API_MODE,
    practice: {
        questions: [],
        currentIndex: 0,
        rightCount: 0,
        wrongCount: 0,
        answers: [],
        startedAt: null,
        questionStartTime: null
    }
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ============== 离线存储层 ==============
const store = {
    _key(k) { return 'math_quiz_' + k; },
    get(key, def) {
        try {
            const v = localStorage.getItem(this._key(key));
            return v === null ? def : JSON.parse(v);
        } catch (e) { return def; }
    },
    set(key, val) {
        localStorage.setItem(this._key(key), JSON.stringify(val));
    },
    del(key) {
        localStorage.removeItem(this._key(key));
    },
    clear() {
        localStorage.clear();
    }
};

// 离线版"数据库"
const offlineDB = {
    users: [],         // {id, username, password, grade, avatar}
    records: [],       // {id, user_id, question_id, is_correct, ...}
    nextUserId: 1,
    nextRecordId: 1,
    load() {
        this.users = store.get('users', []);
        this.records = store.get('records', []);
        this.nextUserId = store.get('nextUserId', 1);
        this.nextRecordId = store.get('nextRecordId', 1);
    },
    save() {
        store.set('users', this.users);
        store.set('records', this.records);
        store.set('nextUserId', this.nextUserId);
        store.set('nextRecordId', this.nextRecordId);
    }
};
offlineDB.load();

// ============== 离线 API ==============
const offlineAPI = {
    async register({ username, password, grade }) {
        if (!username || username.length < 2) return { code: 1, msg: '用户名至少2个字符' };
        if (!password || password.length < 4) return { code: 1, msg: '密码至少4个字符' };
        if (offlineDB.users.find(u => u.username === username)) return { code: 1, msg: '用户名已被占用' };
        const avatars = ['🐱','🐶','🐰','🐻','🐼','🦊','🐯','🐸'];
        const user = {
            id: offlineDB.nextUserId++,
            username, password, grade,
            avatar: avatars[Math.floor(Math.random() * avatars.length)],
            total_questions: 0, correct_count: 0
        };
        offlineDB.users.push(user);
        offlineDB.save();
        sessionStorage.setItem('offline_user_id', user.id);
        return { code: 0, msg: '注册成功', data: stripUser(user) };
    },
    async login({ username, password }) {
        const u = offlineDB.users.find(x => x.username === username && x.password === password);
        if (!u) return { code: 1, msg: '用户名或密码错误' };
        sessionStorage.setItem('offline_user_id', u.id);
        return { code: 0, msg: '登录成功', data: stripUser(u) };
    },
    async logout() {
        sessionStorage.removeItem('offline_user_id');
        return { code: 0, msg: '已退出' };
    },
    async getUser() {
        const id = +sessionStorage.getItem('offline_user_id');
        const u = offlineDB.users.find(x => x.id === id);
        return u ? { code: 0, data: stripUser(u) } : { code: 1, msg: '未登录', data: null };
    },
    async getQuestions({ grade, knowledge = '', count = 10 }) {
        const pool = (window.QUESTION_BANK && window.QUESTION_BANK[grade]) || [];
        let filtered = pool;
        if (knowledge) filtered = pool.filter(q => q.knowledge === knowledge);
        if (!filtered.length) return { code: 1, msg: '没有符合条件的题目' };
        const shuffled = filtered.slice().sort(() => Math.random() - 0.5);
        return { code: 0, data: shuffled.slice(0, count).map(adaptQuestion) };
    },
    async getKnowledge({ grade }) {
        const pool = (window.QUESTION_BANK && window.QUESTION_BANK[grade]) || [];
        const map = new Map();
        pool.forEach(q => map.set(q.knowledge, (map.get(q.knowledge) || 0) + 1));
        return { code: 0, data: Array.from(map.entries()).map(([name, count]) => ({ name, count })) };
    },
    async submit({ question_id, answer, time_spent }) {
        const uid = +sessionStorage.getItem('offline_user_id');
        const u = offlineDB.users.find(x => x.id === uid);
        if (!u) return { code: 1, msg: '请先登录' };
        const pool = [].concat(...Object.values(window.QUESTION_BANK || {}));
        const q = pool.find(x => x.id === question_id);
        if (!q) return { code: 1, msg: '题目不存在' };
        const is_correct = String(q.answer).trim() === String(answer).trim();
        const rec = {
            id: offlineDB.nextRecordId++,
            user_id: u.id,
            question_id, user_answer: answer,
            is_correct, time_spent: time_spent || 0,
            created_at: new Date().toISOString()
        };
        offlineDB.records.push(rec);
        u.total_questions = (u.total_questions || 0) + 1;
        if (is_correct) u.correct_count = (u.correct_count || 0) + 1;
        offlineDB.save();
        return {
            code: 0,
            data: {
                is_correct,
                correct_answer: q.answer,
                explanation: q.explanation
            }
        };
    },
    async getWrongQuestions() {
        const uid = +sessionStorage.getItem('offline_user_id');
        const recs = offlineDB.records.filter(r => r.user_id === uid && !r.is_correct);
        const pool = [].concat(...Object.values(window.QUESTION_BANK || {}));
        const seen = new Set();
        const list = [];
        for (const r of recs.reverse()) {
            if (seen.has(r.question_id)) continue;
            seen.add(r.question_id);
            const q = pool.find(x => x.id === r.question_id);
            if (q) list.push({
                record_id: r.id,
                question: adaptQuestion(q),
                user_answer: r.user_answer,
                wrong_time: new Date(r.created_at).toLocaleString('zh-CN', { hour12: false })
            });
        }
        return { code: 0, data: list };
    },
    async markMastered(rid) {
        offlineDB.records = offlineDB.records.filter(r => r.id !== rid);
        offlineDB.save();
        return { code: 0, msg: '已掌握' };
    },
    async practiceWrong({ count = 10 }) {
        const uid = +sessionStorage.getItem('offline_user_id');
        const recs = offlineDB.records.filter(r => r.user_id === uid && !r.is_correct);
        const ids = Array.from(new Set(recs.map(r => r.question_id)));
        if (!ids.length) return { code: 1, msg: '错题本是空的,太棒了!' };
        const pool = [].concat(...Object.values(window.QUESTION_BANK || {}));
        const picked = ids.sort(() => Math.random() - 0.5).slice(0, count);
        const qs = picked.map(id => pool.find(x => x.id === id)).filter(Boolean);
        return { code: 0, data: qs.map(adaptQuestion) };
    },
    async report() {
        const uid = +sessionStorage.getItem('offline_user_id');
        const recs = offlineDB.records.filter(r => r.user_id === uid);
        const total = recs.length;
        const correct = recs.filter(r => r.is_correct).length;
        const accuracy = total > 0 ? Math.round(correct / total * 1000) / 10 : 0;
        const pool = [].concat(...Object.values(window.QUESTION_BANK || {}));
        const stats = {};
        recs.forEach(r => {
            const q = pool.find(x => x.id === r.question_id);
            if (!q) return;
            if (!stats[q.knowledge]) stats[q.knowledge] = { total: 0, correct: 0 };
            stats[q.knowledge].total++;
            if (r.is_correct) stats[q.knowledge].correct++;
        });
        const knowledge_stats = Object.entries(stats)
            .map(([name, v]) => ({
                name, total: v.total, correct: v.correct,
                accuracy: Math.round(v.correct / v.total * 1000) / 10
            }))
            .sort((a, b) => a.accuracy - b.accuracy);
        return { code: 0, data: { total, correct, accuracy, knowledge_stats } };
    }
};

function stripUser(u) {
    return {
        id: u.id, username: u.username, grade: u.grade, avatar: u.avatar,
        total_questions: u.total_questions || 0,
        correct_count: u.correct_count || 0,
        accuracy: u.total_questions > 0
            ? Math.round((u.correct_count || 0) / u.total_questions * 1000) / 10
            : 0
    };
}

function adaptQuestion(q) {
    return {
        id: q.id,
        grade: q.grade,
        knowledge: q.knowledge,
        question_type: q.question_type,
        content: q.content,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
        difficulty: q.difficulty
    };
}

// ============== 后端 API 包装 ==============
const api = {
    async get(url) {
        const r = await fetch(url, { credentials: 'same-origin' });
        return r.json();
    },
    async post(url, data) {
        const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(data || {})
        });
        return r.json();
    }
};

// 路由所有 API 调用,根据 API_MODE 分流
const apiRouter = {
    register(d) { return API_MODE ? api.post('/api/register', d) : offlineAPI.register(d); },
    login(d) { return API_MODE ? api.post('/api/login', d) : offlineAPI.login(d); },
    logout() { return API_MODE ? api.post('/api/logout') : offlineAPI.logout(); },
    getUser() { return API_MODE ? api.get('/api/user') : offlineAPI.getUser(); },
    getQuestions(qs) {
        const q = new URLSearchParams(qs);
        return API_MODE ? api.get('/api/questions?' + q) : offlineAPI.getQuestions(qs);
    },
    getKnowledge(qs) {
        const q = new URLSearchParams(qs);
        return API_MODE ? api.get('/api/knowledge?' + q) : offlineAPI.getKnowledge(qs);
    },
    submit(d) { return API_MODE ? api.post('/api/submit', d) : offlineAPI.submit(d); },
    getWrongQuestions() {
        return API_MODE ? api.get('/api/wrong-questions') : offlineAPI.getWrongQuestions();
    },
    markMastered(rid) {
        return API_MODE
            ? api.post(`/api/wrong-questions/${rid}/mark-mastered`)
            : offlineAPI.markMastered(rid);
    },
    practiceWrong(d) {
        return API_MODE ? api.post('/api/practice-wrong', d) : offlineAPI.practiceWrong(d);
    },
    report() {
        return API_MODE ? api.get('/api/user/report') : offlineAPI.report();
    }
};

// ============== 工具函数 ==============
function toast(msg, type = '') {
    const t = $('#toast');
    t.textContent = msg;
    t.className = 'toast show ' + type;
    setTimeout(() => t.classList.remove('show'), 2200);
}

function showPage(pageName) {
    $$('.page').forEach(p => p.classList.remove('active'));
    $$('.nav-link').forEach(l => l.classList.remove('active'));
    const page = $('#page-' + pageName);
    if (page) page.classList.add('active');
    const link = document.querySelector(`.nav-link[data-page="${pageName}"]`);
    if (link) link.classList.add('active');
    state.currentPage = pageName;
    window.scrollTo(0, 0);
}

function fmtTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
}

// 显示离线模式标识
if (state.offline) {
    document.addEventListener('DOMContentLoaded', () => {
        const banner = document.createElement('div');
        banner.style.cssText = 'background:#fff5e1;color:#b8860b;text-align:center;padding:6px;font-size:12px;border-bottom:1px solid #f0e0a0';
        banner.textContent = '📴 离线模式 - 数据保存在浏览器本地(同步请开通后端)';
        document.body.insertBefore(banner, document.body.firstChild);
    });
}

// ========== 导航 ==========
$$('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        if ((page === 'wrong' || page === 'practice') && !state.user) {
            toast('请先登录哦~', 'error');
            showPage('home');
            return;
        }
        if (page === 'report') loadReport();
        if (page === 'wrong') loadWrongQuestions();
        showPage(page);
    });
});

document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-page]');
    if (t && !t.classList.contains('nav-link')) {
        const page = t.dataset.page;
        if (page) showPage(page);
    }
});

// ========== 登录/注册 ==========
$$('.form-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
        $$('.form-tabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const mode = tab.dataset.tab;
        $('#login-title').textContent = mode === 'login' ? '登录开始学习' : '注册新账号';
        $('#auth-btn').textContent = mode === 'login' ? '登录' : '注册';
        $('#auth-btn').dataset.mode = mode;
        $('#grade-select-wrap').style.display = mode === 'register' ? 'block' : 'none';
    });
});

$('#auth-btn').addEventListener('click', async () => {
    const mode = $('#auth-btn').dataset.mode || 'login';
    const username = $('#username').value.trim();
    const password = $('#password').value;

    if (!username || !password) return toast('请填写用户名和密码', 'error');

    const body = { username, password };
    if (mode === 'register') body.grade = parseInt($('#reg-grade').value);

    const res = await apiRouter[mode](body);
    if (res.code === 0) {
        state.user = res.data;
        renderUser();
        toast(res.msg, 'success');
        $('#username').value = '';
        $('#password').value = '';
    } else {
        toast(res.msg, 'error');
    }
});

async function checkLogin() {
    const res = await apiRouter.getUser();
    if (res.code === 0 && res.data) {
        state.user = res.data;
        renderUser();
    }
}

function renderUser() {
    if (!state.user) {
        $('#login-card').style.display = 'block';
        $('#user-info-card').style.display = 'none';
        return;
    }
    $('#login-card').style.display = 'none';
    $('#user-info-card').style.display = 'block';
    $('#user-avatar').textContent = state.user.avatar;
    $('#user-name').textContent = state.user.username;
    $('#user-grade').textContent = state.user.grade === 1 ? '一年级' : '二年级';
    $('#stat-total').textContent = state.user.total_questions;
    $('#stat-correct').textContent = state.user.correct_count;
    $('#stat-accuracy').textContent = state.user.accuracy + '%';
}

// ========== 快捷操作 ==========
$$('.action-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        if (!state.user) {
            toast('请先登录哦~', 'error');
            return;
        }
        const action = btn.dataset.action;
        if (action === 'quick-practice') {
            startPractice({ grade: state.user.grade, count: 10 });
        } else if (action === 'by-knowledge') {
            loadKnowledgeList(state.user.grade);
            showPage('knowledge');
        } else if (action === 'wrong-practice') {
            startWrongPractice();
        }
    });
});

$$('.grade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        $$('.grade-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadKnowledgeList(parseInt(btn.dataset.grade));
    });
});

async function loadKnowledgeList(grade) {
    const res = await apiRouter.getKnowledge({ grade });
    if (res.code !== 0) return toast(res.msg);

    const list = $('#knowledge-list');
    if (!res.data.length) {
        list.innerHTML = '<div class="loading">暂无题目</div>';
        return;
    }
    list.innerHTML = res.data.map(k => `
        <div class="knowledge-card" data-knowledge="${k.name}">
            <div class="name">📘 ${k.name}</div>
            <div class="count">${k.count} 道题</div>
        </div>
    `).join('');
    list.querySelectorAll('.knowledge-card').forEach(card => {
        card.addEventListener('click', () => {
            const knowledge = card.dataset.knowledge;
            startPractice({ grade, knowledge, count: 10 });
        });
    });
}

// ========== 答题 ==========
async function startPractice({ grade, knowledge = '', count = 10, source = 'normal' }) {
    const res = await apiRouter.getQuestions({ grade, knowledge, count });
    if (res.code !== 0) return toast(res.msg, 'error');
    if (!res.data.length) return toast('没有题目', 'error');

    state.practice = {
        questions: res.data,
        currentIndex: 0,
        rightCount: 0,
        wrongCount: 0,
        answers: [],
        startedAt: Date.now(),
        questionStartTime: Date.now(),
        source
    };
    showPage('practice');
    $('#question-card').style.display = 'block';
    $('#result-card').style.display = 'none';
    renderQuestion();
    startTimer();
}

let _quizTimer = null;
function startTimer() {
    clearInterval(_quizTimer);
    _quizTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - state.practice.startedAt) / 1000);
        $('#timer').textContent = '⏱ ' + fmtTime(elapsed);
    }, 1000);
}

function renderQuestion() {
    const p = state.practice;
    const q = p.questions[p.currentIndex];

    $('#q-current').textContent = p.currentIndex + 1;
    $('#q-total').textContent = p.questions.length;
    $('#right-count').textContent = p.rightCount;
    $('#wrong-count').textContent = p.wrongCount;

    const typeText = { choice: '选择题', fill: '填空题', judge: '判断题' }[q.question_type] || '题目';
    $('#q-type').textContent = typeText;
    $('#q-content').textContent = (p.currentIndex + 1) + '. ' + q.content;
    $('#feedback').style.display = 'none';
    $('#btn-submit').style.display = 'block';
    $('#btn-next').style.display = 'none';

    const optionsArea = $('#options-area');
    const fillArea = $('#fill-area');
    optionsArea.innerHTML = '';
    fillArea.style.display = 'none';
    optionsArea.style.display = 'none';

    if (q.question_type === 'choice' && q.options) {
        optionsArea.style.display = 'grid';
        optionsArea.innerHTML = q.options.map((opt, i) =>
            `<button class="option-btn" data-value="${opt}">${String.fromCharCode(65 + i)}. ${opt}</button>`
        ).join('');
        optionsArea.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                optionsArea.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
    } else {
        fillArea.style.display = 'block';
        $('#fill-input').value = '';
        $('#fill-input').focus();
        $('#fill-input').onkeydown = (e) => {
            if (e.key === 'Enter') $('#btn-submit').click();
        };
    }
    state.practice.questionStartTime = Date.now();
}

$('#btn-submit').addEventListener('click', async () => {
    const p = state.practice;
    const q = p.questions[p.currentIndex];
    let userAnswer = '';

    if (q.question_type === 'choice' && q.options) {
        const selected = document.querySelector('.option-btn.selected');
        if (!selected) return toast('请先选择一个答案', 'error');
        userAnswer = selected.dataset.value;
    } else {
        userAnswer = $('#fill-input').value.trim();
        if (!userAnswer) return toast('请输入答案', 'error');
    }

    const timeSpent = Math.floor((Date.now() - p.questionStartTime) / 1000);
    const res = await apiRouter.submit({
        question_id: q.id,
        answer: userAnswer,
        time_spent: timeSpent
    });

    if (res.code === 0) {
        const result = res.data;
        p.answers.push({ question: q, userAnswer, isCorrect: result.is_correct });
        if (result.is_correct) p.rightCount++;
        else p.wrongCount++;

        $('#feedback').style.display = 'block';
        if (result.is_correct) {
            $('#feedback').className = 'feedback correct';
            $('#feedback').innerHTML = '🎉 答对啦! 答案: <b>' + result.correct_answer + '</b><br>' + (result.explanation || '');
        } else {
            $('#feedback').className = 'feedback wrong';
            $('#feedback').innerHTML = '😅 答错了！正确答案: <b>' + result.correct_answer + '</b><br>' + (result.explanation || '');
        }

        if (q.question_type === 'choice') {
            const buttons = document.querySelectorAll('.option-btn');
            buttons.forEach(b => {
                b.disabled = true;
                if (b.dataset.value === q.answer) b.classList.add('correct');
                if (b.classList.contains('selected') && !result.is_correct) b.classList.add('wrong');
            });
        }

        $('#btn-submit').style.display = 'none';
        $('#btn-next').style.display = 'block';
        $('#btn-next').textContent = p.currentIndex === p.questions.length - 1 ? '看结果 🎉' : '下一题 →';
        $('#btn-next').focus();
    } else {
        toast(res.msg, 'error');
    }
});

$('#btn-next').addEventListener('click', () => {
    const p = state.practice;
    if (p.currentIndex < p.questions.length - 1) {
        p.currentIndex++;
        renderQuestion();
    } else {
        showResult();
    }
});

function showResult() {
    clearInterval(_quizTimer);
    const p = state.practice;
    const total = p.questions.length;
    const accuracy = total > 0 ? Math.round(p.rightCount / total * 100) : 0;

    $('#question-card').style.display = 'none';
    $('#result-card').style.display = 'block';

    $('#r-right').textContent = p.rightCount;
    $('#r-wrong').textContent = p.wrongCount;
    $('#r-accuracy').textContent = accuracy + '%';

    let emoji, comment;
    if (accuracy === 100) { emoji = '🏆'; comment = '满分！你太厉害啦！'; }
    else if (accuracy >= 80) { emoji = '🌟'; comment = '真棒！继续保持！'; }
    else if (accuracy >= 60) { emoji = '👍'; comment = '不错哦，再加把劲！'; }
    else if (accuracy >= 40) { emoji = '💪'; comment = '别灰心，多练习就好！'; }
    else { emoji = '🌱'; comment = '加油！熟能生巧！'; }
    $('#r-emoji').textContent = emoji;
    $('#r-comment').textContent = comment;

    checkLogin();
}

$('#btn-again').addEventListener('click', () => {
    const p = state.practice;
    const source = p.source;
    const grade = p.questions[0]?.grade || state.user.grade;
    if (source === 'wrong') {
        startWrongPractice();
    } else {
        startPractice({ grade, count: 10 });
    }
});

// ========== 错题本 ==========
async function loadWrongQuestions() {
    showPage('wrong');
    const res = await apiRouter.getWrongQuestions();
    const summary = $('#wrong-summary');
    const list = $('#wrong-list');

    if (res.code !== 0) {
        summary.innerHTML = '';
        list.innerHTML = `<div class="loading">${res.msg}</div>`;
        return;
    }
    const wrong = res.data;
    summary.innerHTML = `
        <div class="wrong-item">
            <div class="num">${wrong.length}</div>
            <div class="label">错题数量</div>
        </div>
    `;
    if (wrong.length === 0) {
        list.innerHTML = '<div class="loading">🎉 太棒了！错题本是空的</div>';
        return;
    }
    list.innerHTML = wrong.map(w => `
        <div class="wrong-card" data-rid="${w.record_id}">
            <div class="q-text">${w.question.content}</div>
            <div class="meta">
                <span>📘 ${w.question.knowledge}</span>
                <span>🕐 ${w.wrong_time}</span>
            </div>
            <div>
                <span class="your-answer">你的答案: ${w.user_answer}</span>
                <span class="correct-answer">正确答案: ${w.question.answer}</span>
            </div>
            <div class="actions">
                <button class="mark-btn" data-act="master">✓ 已掌握</button>
            </div>
        </div>
    `).join('');

    list.querySelectorAll('.mark-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const card = btn.closest('.wrong-card');
            const rid = parseInt(card.dataset.rid);
            const res = await apiRouter.markMastered(rid);
            if (res.code === 0) {
                toast(res.msg, 'success');
                loadWrongQuestions();
            }
        });
    });
}

async function startWrongPractice() {
    const res = await apiRouter.practiceWrong({ count: 10 });
    if (res.code !== 0) return toast(res.msg, 'error');
    state.practice = {
        questions: res.data,
        currentIndex: 0,
        rightCount: 0,
        wrongCount: 0,
        answers: [],
        startedAt: Date.now(),
        questionStartTime: Date.now(),
        source: 'wrong'
    };
    showPage('practice');
    $('#question-card').style.display = 'block';
    $('#result-card').style.display = 'none';
    renderQuestion();
    startTimer();
}

// ========== 学习报告 ==========
async function loadReport() {
    showPage('report');
    const res = await apiRouter.report();
    if (res.code !== 0) {
        $('#report-summary').innerHTML = `<div class="loading">${res.msg}</div>`;
        return;
    }
    const d = res.data;
    $('#report-summary').innerHTML = `
        <div class="big-stat">
            <div class="num-big">${d.total}</div>
            <div class="label">总答题数</div>
        </div>
        <div class="big-stat">
            <div class="num-big">${d.correct}</div>
            <div class="label">答对数</div>
        </div>
        <div class="big-stat">
            <div class="num-big">${d.accuracy}%</div>
            <div class="label">正确率</div>
        </div>
    `;
    if (!d.knowledge_stats || d.knowledge_stats.length === 0) {
        $('#knowledge-chart').innerHTML = '<div class="loading">还没有答题记录，去做几道题吧</div>';
        return;
    }
    $('#knowledge-chart').innerHTML = d.knowledge_stats.map(k => `
        <div class="k-bar ${k.accuracy < 60 ? 'weak' : ''}">
            <div class="label">
                <span>${k.name} <small>(${k.correct}/${k.total})</small></span>
                <span>${k.accuracy}%</span>
            </div>
            <div class="bar-bg">
                <div class="bar-fill" style="width:${k.accuracy}%"></div>
            </div>
        </div>
    `).join('');
}

// ========== 启动 ==========
checkLogin();
