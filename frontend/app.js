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
    }
    renderUser();  // 无论登录与否都调一次,确保 UI 状态正确
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

// 退出登录
$(document).on('click', '#btn-logout', async () => {
    if (!confirm('确定要退出登录吗？退出后会清除本地数据，需要重新登录。')) return;
    await apiRouter.logout();
    // 离线模式清理
    try {
        sessionStorage.removeItem('offline_user_id');
        localStorage.removeItem('math_quiz_users');
        localStorage.removeItem('math_quiz_records');
    } catch (e) {}
    state.user = null;
    renderUser();
    showPage('home');
    toast('已退出登录', 'success');
});

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

// ========== Battle 模式 ==========

// 战斗状态常量
const BATTLE = {
    PLAYER_TURN: 'player_turn',     // 等待玩家选答案
    PLAYER_HIT: 'player_hit',        // 玩家攻击动画
    ENEMY_HIT: 'enemy_hit',          // 怪兽被击中
    ENEMY_ATTACK: 'enemy_attack',    // 怪兽攻击动画
    PLAYER_HURT: 'player_hurt',      // 玩家被击中
    FINISHED: 'finished'             // 战斗结束
};

let battleState = BATTLE.PLAYER_TURN;
let battleData = {
    monsterMaxHp: 0,
    monsterHp: 0,
    hearts: 3,
    maxHearts: 3,
    score: 0,
    combo: 0,
    maxCombo: 0
};

const MONSTERS = [
    { name: '史莱姆 Lv.1', color: 'green' },
    { name: '幽灵 Lv.2', color: 'purple' },
    { name: '机器人 Lv.3', color: 'orange' }
];

function pickMonster() {
    return MONSTERS[0]; // P1: 先只用史莱姆
}

async function startPractice({ grade, knowledge = '', count = 10, source = 'normal' }) {
    const res = await apiRouter.getQuestions({ grade, knowledge, count });
    if (res.code !== 0) return toast(res.msg, 'error');
    if (!res.data.length) return toast('没有题目', 'error');

    // 战斗数据
    const monster = pickMonster();
    battleData = {
        monsterMaxHp: res.data.length * 10,
        monsterHp: res.data.length * 10,
        hearts: 3,
        maxHearts: 3,
        score: 0,
        combo: 0,
        maxCombo: 0
    };
    battleState = BATTLE.PLAYER_TURN;

    state.practice = {
        questions: res.data,
        currentIndex: 0,
        rightCount: 0,
        wrongCount: 0,
        answers: [],
        startedAt: Date.now(),
        questionStartTime: Date.now(),
        source,
        monster
    };
    showPage('practice');
    $('#question-card').style.display = 'block';
    $('#result-card').style.display = 'none';

    // 初始化战斗 HUD
    $('#monster-name-bar').textContent = monster.name;
    updateMonsterHp();
    updateHearts();
    updateCombo();
    updateScore();
    $('#q-total').textContent = res.data.length;
    $('#monster-sprite').classList.remove('dying', 'hurt');
    $('#monster-sprite').classList.add('idle');
    $('#player-sprite').classList.remove('attacking', 'charging', 'hurt');
    $('#player-sprite').classList.add('idle');
    $('#damage-numbers').innerHTML = '';

    renderQuestion();
    startTimer();
}

function updateMonsterHp() {
    const pct = Math.max(0, battleData.monsterHp / battleData.monsterMaxHp * 100);
    const fill = $('#monster-hp-fill');
    if (fill) fill.style.width = pct + '%';
    $('#monster-hp-text').textContent = `${battleData.monsterHp}/${battleData.monsterMaxHp}`;
    // 血量低时变色
    if (fill) {
        if (pct < 25) fill.style.background = 'linear-gradient(180deg,#EF4444,#DC2626,#991B1B)';
        else if (pct < 50) fill.style.background = 'linear-gradient(180deg,#FBBF24,#F59E0B,#D97706)';
    }
}

function updateHearts() {
    document.querySelectorAll('#hearts .heart').forEach((h, i) => {
        if (i < battleData.hearts) h.classList.remove('lost');
        else h.classList.add('lost');
    });
}

function updateCombo() {
    const c = $('#combo');
    if (battleData.combo >= 2) {
        c.style.display = 'inline-flex';
        $('#combo-num').textContent = '🔥 ×' + battleData.combo;
    } else {
        c.style.display = 'none';
    }
}

function updateScore() {
    $('#battle-score').textContent = battleData.score;
}

function showDamage(text, type = 'hp-loss', x = 0.5, y = 0.5) {
    const wrap = $('#damage-numbers');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'damage-text ' + type;
    el.textContent = text;
    el.style.left = (x * 100) + '%';
    el.style.top = (y * 100) + '%';
    el.style.transform = 'translateX(-50%)';
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 1200);
}

function showSlash(isCrit) {
    const stage = $('#battle-stage');
    const s = document.createElement('div');
    s.className = 'attack-slash' + (isCrit ? ' crit' : '');
    stage.appendChild(s);
    setTimeout(() => s.remove(), 400);
}

function shake(stageId = 'battle-stage') {
    const stage = $('#' + stageId);
    if (!stage) return;
    stage.classList.add('shake');
    setTimeout(() => stage.classList.remove('shake'), 400);
}

function flashHit() {
    const stage = $('#battle-stage');
    if (!stage) return;
    stage.classList.add('hit-flash');
    setTimeout(() => stage.classList.remove('hit-flash'), 300);
}

function showVictoryStars() {
    const stage = $('#battle-stage');
    const wrap = document.createElement('div');
    wrap.className = 'victory-stars';
    const colors = ['⭐', '🌟', '✨', '💫'];
    for (let i = 0; i < 20; i++) {
        const s = document.createElement('div');
        s.className = 'victory-star';
        s.textContent = colors[Math.floor(Math.random() * colors.length)];
        s.style.left = Math.random() * 90 + 5 + '%';
        s.style.animationDelay = (Math.random() * 0.8) + 's';
        s.style.animationDuration = (1.5 + Math.random() * 1) + 's';
        wrap.appendChild(s);
    }
    stage.appendChild(wrap);
    setTimeout(() => wrap.remove(), 3000);
}

let _quizTimer = null;
function startTimer() {
    clearInterval(_quizTimer);
    _quizTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - state.practice.startedAt) / 1000);
        const t = $('#timer');
        if (t) t.textContent = '⏱ ' + fmtTime(elapsed);
    }, 1000);
}

function renderQuestion() {
    try {
        const p = state.practice;
        if (!p || !p.questions || !p.questions.length) {
            console.error('renderQuestion: state.practice invalid', p);
            return;
        }
        const q = p.questions[p.currentIndex];
        if (!q) {
            console.error('renderQuestion: no current question', p.currentIndex);
            return;
        }

        $('#q-current').textContent = p.currentIndex + 1;
        $('#q-total').textContent = p.questions.length;
        // 注:旧版有 #right-count / #wrong-count / #progress-fill,战斗模式改版后已移除
        // 如需"答对/答错"实时计数,可在 #battle-hud 增加对应元素后恢复

        // 更新进度条
        const fill = $('#progress-fill');
        if (fill) fill.style.width = ((p.currentIndex + 1) / p.questions.length * 100) + '%';

        const typeText = { choice: '选择题', fill: '填空题', judge: '判断题' }[q.question_type] || '题目';
        $('#q-type').textContent = typeText;
        $('#q-content').textContent = q.content || '(题目内容缺失)';
        $('#feedback').style.display = 'none';
        $('#btn-submit').style.display = 'flex';
        $('#btn-next').style.display = 'none';

        // 解锁答题区
        const bq = $('#question-card');
        if (bq) bq.classList.remove('locked');

        const optionsArea = $('#options-area');
        const fillArea = $('#fill-area');
        optionsArea.innerHTML = '';
        fillArea.style.display = 'none';
        optionsArea.style.display = 'none';

        if (q.question_type === 'choice' && q.options) {
            optionsArea.style.display = 'grid';
            optionsArea.innerHTML = q.options.map((opt, i) =>
                `<button class="option-btn" data-value="${opt}"><span class="opt-letter">${String.fromCharCode(65 + i)}</span><span>${opt}</span></button>`
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
    } catch (err) {
        console.error('renderQuestion failed:', err);
        const qc = $('#q-content');
        if (qc) qc.textContent = '题目加载失败: ' + err.message;
    }
}

$('#btn-submit').addEventListener('click', async () => {
    // 锁住战斗状态
    if (battleState !== BATTLE.PLAYER_TURN) return;
    battleState = BATTLE.PLAYER_HIT;

    const p = state.practice;
    const q = p.questions[p.currentIndex];
    let userAnswer = '';

    if (q.question_type === 'choice' && q.options) {
        const selected = document.querySelector('.option-btn.selected');
        if (!selected) { battleState = BATTLE.PLAYER_TURN; return toast('请先选择一个答案', 'error'); }
        userAnswer = selected.dataset.value;
    } else {
        userAnswer = $('#fill-input').value.trim();
        if (!userAnswer) { battleState = BATTLE.PLAYER_TURN; return toast('请输入答案', 'error'); }
    }

    // 锁定答题区
    const bq = $('#question-card');
    if (bq) bq.classList.add('locked');
    $('#btn-submit').style.display = 'none';
    if (q.question_type === 'choice') {
        document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
    }

    const timeSpent = Math.floor((Date.now() - p.questionStartTime) / 1000);
    const res = await apiRouter.submit({
        question_id: q.id,
        answer: userAnswer,
        time_spent: timeSpent
    });

    if (res.code !== 0) {
        battleState = BATTLE.PLAYER_TURN;
        if (bq) bq.classList.remove('locked');
        $('#btn-submit').style.display = 'flex';
        return toast(res.msg, 'error');
    }

    const result = res.data;
    p.answers.push({ question: q, userAnswer, isCorrect: result.is_correct });

    // 显示选项正误
    if (q.question_type === 'choice') {
        document.querySelectorAll('.option-btn').forEach(b => {
            if (b.dataset.value === q.answer) b.classList.add('correct');
            if (b.classList.contains('selected') && !result.is_correct) b.classList.add('wrong');
        });
    }

    if (result.is_correct) {
        // === 玩家攻击 ===
        p.rightCount++;
        battleData.combo++;
        if (battleData.combo > battleData.maxCombo) battleData.maxCombo = battleData.combo;

        const isCrit = battleData.combo >= 3;
        const dmg = isCrit ? 20 : 10;
        battleData.monsterHp = Math.max(0, battleData.monsterHp - dmg);
        battleData.score += isCrit ? 30 : 10;

        // 1. 玩家蓄力 → 攻击
        const ps = $('#player-sprite');
        ps.classList.remove('idle');
        ps.classList.add('charging');
        setTimeout(() => {
            ps.classList.remove('charging');
            ps.classList.add('attacking');
        }, 250);

        // 2. 命中特效
        setTimeout(() => {
            showSlash(isCrit);
            flashHit();
            const ms = $('#monster-sprite');
            ms.classList.remove('idle');
            ms.classList.add('hurt');
            showDamage('-' + dmg, isCrit ? 'critical' : 'hp-loss', 0.78, 0.45);
            if (isCrit) showDamage('CRITICAL!', 'crit-text', 0.78, 0.20);
            updateMonsterHp();
            updateScore();
            updateCombo();
        }, 500);

        // 3. 怪兽恢复
        setTimeout(() => {
            const ms = $('#monster-sprite');
            ms.classList.remove('hurt');
            ms.classList.add('idle');
        }, 900);

        // 4. 检查胜负
        setTimeout(() => {
            if (battleData.monsterHp <= 0) {
                battleState = BATTLE.FINISHED;
                showBattleEnd(true);
            } else {
                $('#btn-next').style.display = 'flex';
                battleState = BATTLE.PLAYER_TURN;
            }
        }, 1200);

    } else {
        // === 怪兽反击 ===
        p.wrongCount++;
        battleData.hearts = Math.max(0, battleData.hearts - 1);
        battleData.combo = 0;

        // 1. 怪兽蓄力
        const ms = $('#monster-sprite');
        ms.classList.remove('idle');
        ms.classList.add('attacking');

        // 2. 攻击命中
        setTimeout(() => {
            shake();
            flashHit();
            const ps = $('#player-sprite');
            ps.classList.remove('attacking', 'charging', 'idle');
            ps.classList.add('hurt');
            showDamage('-1 ❤️', 'heart-loss', 0.20, 0.40);
            updateHearts();
            updateCombo();
        }, 400);

        // 3. 玩家恢复
        setTimeout(() => {
            const ps = $('#player-sprite');
            ps.classList.remove('hurt');
            ps.classList.add('idle');
        }, 800);

        // 4. 检查胜负
        setTimeout(() => {
            const ms = $('#monster-sprite');
            ms.classList.remove('attacking');
            ms.classList.add('idle');
            if (battleData.hearts <= 0) {
                battleState = BATTLE.FINISHED;
                showBattleEnd(false);
            } else {
                $('#btn-next').style.display = 'flex';
                battleState = BATTLE.PLAYER_TURN;
            }
        }, 1100);
    }

    $('#feedback').style.display = 'block';
    if (result.is_correct) {
        $('#feedback').className = 'feedback correct';
        $('#feedback').innerHTML = '<div class="feedback-title">💥 击中！</div><div class="feedback-explain">' + (result.explanation || '') + '</div>';
    } else {
        $('#feedback').className = 'feedback wrong';
        $('#feedback').innerHTML = '<div class="feedback-title">💔 被攻击！</div><div class="feedback-explain">正确答案: <b>' + result.correct_answer + '</b>' + (result.explanation ? ' · ' + result.explanation : '') + '</div>';
    }
});

$('#btn-next').addEventListener('click', () => {
    const p = state.practice;
    if (p.currentIndex < p.questions.length - 1) {
        p.currentIndex++;
        renderQuestion();
    } else {
        // 题目打完但怪兽还没死(理论不会发生,但兜底)
        showBattleEnd(true);
    }
});

function showBattleEnd(isWin) {
    clearInterval(_quizTimer);
    const p = state.practice;

    if (isWin) {
        // 怪兽死亡动画
        const ms = $('#monster-sprite');
        ms.classList.remove('idle', 'hurt', 'attacking');
        ms.classList.add('dying');
        showVictoryStars();
    }

    setTimeout(() => {
        $('#question-card').style.display = 'none';
        $('#result-card').style.display = 'block';

        const accuracy = p.questions.length > 0 ? Math.round(p.rightCount / p.questions.length * 100) : 0;
        $('#r-right').textContent = p.rightCount;
        $('#r-wrong').textContent = p.wrongCount;
        $('#r-accuracy').textContent = accuracy + '%';

        let emoji, title, comment;
        if (isWin) {
            if (battleData.hearts === 3 && p.rightCount === p.questions.length) {
                emoji = '🏆'; title = '完美胜利！'; comment = '零失误击败怪兽！你是数学小英雄！';
            } else if (battleData.hearts >= 2) {
                emoji = '🌟'; title = '战斗胜利！'; comment = '成功击败了' + (p.monster ? p.monster.name : '怪兽') + '！';
            } else {
                emoji = '💪'; title = '惊险胜利！'; comment = '虽然受了不少伤，但你还是赢了！';
            }
        } else {
            emoji = '💀'; title = '战斗失败…'; comment = '再接再厉，下次一定能赢！';
        }
        $('#r-emoji').textContent = emoji;
        $('#r-title').textContent = title;
        $('#r-comment').textContent = comment;
    }, isWin ? 1000 : 200);

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

// 撤退按钮
$(document).on('click', '#btn-flee', () => {
    if (confirm('确定要撤退吗？当前战斗进度会丢失。')) {
        battleState = BATTLE.FINISHED;
        clearInterval(_quizTimer);
        showPage('home');
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
    // 兼容新的 wrong-count-display 和原 summary 结构
    const wcDisplay = $('#wrong-count-display');
    if (wcDisplay) wcDisplay.textContent = wrong.length;
    if (summary.querySelector('.wrong-item')) {
        summary.innerHTML = `
            <div class="num">${wrong.length}</div>
            <div class="label">道错题等待巩固</div>
        `;
    }
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

    // 战斗数据(与 startPractice 保持一致)
    const monster = pickMonster();
    battleData = {
        monsterMaxHp: res.data.length * 10,
        monsterHp: res.data.length * 10,
        hearts: 3,
        maxHearts: 3,
        score: 0,
        combo: 0,
        maxCombo: 0
    };
    battleState = BATTLE.PLAYER_TURN;

    state.practice = {
        questions: res.data,
        currentIndex: 0,
        rightCount: 0,
        wrongCount: 0,
        answers: [],
        startedAt: Date.now(),
        questionStartTime: Date.now(),
        source: 'wrong',
        monster
    };
    showPage('practice');
    $('#question-card').style.display = 'block';
    $('#result-card').style.display = 'none';

    // 初始化战斗 HUD
    $('#monster-name-bar').textContent = monster.name;
    updateMonsterHp();
    updateHearts();
    updateCombo();
    updateScore();
    $('#q-total').textContent = res.data.length;
    $('#monster-sprite').classList.remove('dying', 'hurt');
    $('#monster-sprite').classList.add('idle');
    $('#player-sprite').classList.remove('attacking', 'charging', 'hurt');
    $('#player-sprite').classList.add('idle');
    $('#damage-numbers').innerHTML = '';

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

    // 圆环图:周长 2*PI*58 ≈ 364
    const circumference = 2 * Math.PI * 58;
    const ringEl = $('#ring-progress');
    const ringAcc = $('#ring-accuracy');
    if (ringEl) ringEl.setAttribute('stroke-dasharray', `${(d.accuracy / 100) * circumference} ${circumference}`);
    if (ringAcc) ringAcc.textContent = d.accuracy + '%';

    // 右侧小卡
    const mini = $('#report-mini');
    if (mini) {
        mini.innerHTML = `
            <div class="report-mini-card">
                <div class="label">总答题数</div>
                <div class="num">${d.total}</div>
            </div>
            <div class="report-mini-card">
                <div class="label">答对数</div>
                <div class="num">${d.correct}</div>
            </div>
        `;
    }

    if (!d.knowledge_stats || d.knowledge_stats.length === 0) {
        $('#knowledge-chart').innerHTML = '<div class="loading">还没有答题记录，去做几道题吧</div>';
        return;
    }
    $('#knowledge-chart').innerHTML = d.knowledge_stats.map(k => `
        <div class="k-bar ${k.accuracy < 60 ? 'weak' : (k.accuracy >= 90 ? 'strong' : '')}">
            <div class="label">${k.name} <small>(${k.correct}/${k.total})</small></div>
            <div class="bar-bg"><div class="bar-fill" style="width:${k.accuracy}%"></div></div>
            <div class="pct">${k.accuracy}%</div>
        </div>
    `).join('');
}

// ========== 启动 ==========
checkLogin();
