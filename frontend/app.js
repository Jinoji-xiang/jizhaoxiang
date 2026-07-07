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

// ============== 金币系统 ==============
// 每用户独立存储 (offline_user_id 作 key)
const GoldManager = {
    _key(uid) { return 'math_quiz_gold_' + uid; },
    get(uid) {
        if (!uid) return 0;
        return store.get('gold_' + uid, 0);
    },
    add(uid, n) {
        if (!uid) return 0;
        const cur = this.get(uid);
        const next = cur + n;
        store.set('gold_' + uid, next);
        return next;
    },
    reset(uid) {
        if (!uid) return;
        store.set('gold_' + uid, 0);
    }
};

function getCurrentUid() {
    // 优先用登录用户的 id; 离线模式从 sessionStorage 读
    if (state.user && state.user.id) return state.user.id;
    const sid = +sessionStorage.getItem('offline_user_id');
    return sid || null;
}

function updateGoldDisplay() {
    const el = $('#gold-num');
    if (!el) return;
    const uid = getCurrentUid();
    const g = GoldManager.get(uid);
    el.textContent = g;
}

function flashGoldDisplay() {
    const el = $('#gold-display');
    if (!el) return;
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 600);
}

// ============== 成就系统 ==============
const ACHIEVEMENTS = [
    {
        id: 'one_shot',
        emoji: '🩸',
        title: '一击必杀',
        desc: '暴击一次打掉 100+ HP'
    },
    {
        id: 'perfect_clear',
        emoji: '🎯',
        title: '零失误',
        desc: '一关不扣心通关'
    },
    {
        id: 'combo_master',
        emoji: '🔥',
        title: '连击大师',
        desc: '单次连击 ≥ 10'
    },
    {
        id: 'math_master',
        emoji: '🏆',
        title: '数学小达人',
        desc: '累计答对 100 题'
    },
    {
        id: 'boss_killer',
        emoji: '👑',
        title: 'Boss 克星',
        desc: '击败大魔王 (敬请期待)'
    }
];

const AchievementManager = {
    _key(uid) { return 'achievements_' + uid; },
    _totalKey(uid) { return 'total_correct_' + uid; },

    // 已解锁集合 (id 列表)
    getUnlocked(uid) {
        if (!uid) return [];
        return store.get('achievements_' + uid, []);
    },

    isUnlocked(uid, id) {
        return this.getUnlocked(uid).includes(id);
    },

    // 总答对数 (跨会话累计, 用于 "数学小达人")
    getTotalCorrect(uid) {
        if (!uid) return 0;
        return store.get('total_correct_' + uid, 0);
    },

    addTotalCorrect(uid, n = 1) {
        if (!uid) return 0;
        const cur = this.getTotalCorrect(uid);
        const next = cur + n;
        store.set('total_correct_' + uid, next);
        return next;
    },

    /**
     * 解锁一个成就(若有). 触发 toast + 更新 UI
     * @returns {boolean} 是否新解锁
     */
    unlock(uid, id) {
        if (!uid) return false;
        if (this.isUnlocked(uid, id)) return false;
        const list = this.getUnlocked(uid);
        list.push(id);
        store.set('achievements_' + uid, list);
        const ach = ACHIEVEMENTS.find(a => a.id === id);
        if (ach) {
            showAchievementToast(`成就解锁: ${ach.title}`);
        }
        updateAchievementBadge();
        return true;
    },

    // 解锁 boss 克星 (供未来调用)
    unlockBossKiller(uid) {
        return this.unlock(uid, 'boss_killer');
    },

    reset(uid) {
        if (!uid) return;
        store.set('achievements_' + uid, []);
        store.set('total_correct_' + uid, 0);
    }
};

function showAchievementToast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast show achievement-toast';
    setTimeout(() => t.classList.remove('show'), 2800);
}

function updateAchievementBadge() {
    const badge = $('#achievement-badge');
    if (!badge) return;
    const uid = getCurrentUid();
    const unlocked = AchievementManager.getUnlocked(uid);
    const n = unlocked.length;
    if (n > 0) {
        badge.hidden = false;
        badge.textContent = n;
    } else {
        badge.hidden = true;
    }
}

function renderAchievementList() {
    const list = $('#achievement-list');
    const total = ACHIEVEMENTS.length;
    if (!list) return;
    const uid = getCurrentUid();
    const unlocked = AchievementManager.getUnlocked(uid);
    const totalCorrect = AchievementManager.getTotalCorrect(uid);
    $('#ach-total').textContent = total;
    $('#ach-progress').textContent = unlocked.length;
    list.innerHTML = ACHIEVEMENTS.map(a => {
        const isOn = unlocked.includes(a.id);
        let progress = '';
        if (a.id === 'math_master') {
            progress = ` <b style="color:${isOn ? '#92400E' : '#9CA3AF'}">(${Math.min(totalCorrect, 100)}/100)</b>`;
        }
        return `
            <div class="achievement-item ${isOn ? 'unlocked' : ''}">
                <div class="ach-emoji">${a.emoji}</div>
                <div class="ach-info">
                    <div class="ach-title">${a.title}${progress}</div>
                    <div class="ach-desc">${a.desc}</div>
                </div>
                <div class="ach-status">${isOn ? '✓' : '🔒'}</div>
            </div>
        `;
    }).join('');
}

function openAchievementModal() {
    renderAchievementList();
    const m = $('#achievement-modal');
    if (m) {
        m.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeAchievementModal() {
    const m = $('#achievement-modal');
    if (m) m.style.display = 'none';
    document.body.style.overflow = '';
}

// ============== 技能系统 ==============
// 每用户持久化: heal_used (整局只用 1 次, 跨战斗保留)
// 每场战斗内存中: hint_used, charge_remaining (3 题 ×2)
const SkillManager = {
    /**
     * 战斗中临时状态 (非持久)
     * hint_used: 本场是否已用过提示
     * charge_remaining: 蓄力剩余生效题数
     */
    battle: {
        hint_used: false,
        charge_remaining: 0
    },

    // heal_used 全局 (跨战斗)
    isHealUsed(uid) {
        if (!uid) return false;
        return store.get('skill_heal_used_' + uid, false);
    },

    markHealUsed(uid) {
        if (!uid) return;
        store.set('skill_heal_used_' + uid, true);
    },

    resetHeal(uid) {
        if (!uid) return;
        store.set('skill_heal_used_' + uid, false);
    },

    // 每场战斗开始时调用 — 重置 hint + charge
    resetBattleState() {
        this.battle.hint_used = false;
        this.battle.charge_remaining = 0;
    },

    // UI 状态刷新
    render() {
        const uid = getCurrentUid();
        const healUsed = this.isHealUsed(uid);
        const hintUsed = this.battle.hint_used;

        const hintBtn = $('#skill-hint');
        const healBtn = $('#skill-heal');
        const chargeBtn = $('#skill-charge');

        if (hintBtn) {
            hintBtn.classList.toggle('used', hintUsed);
            hintBtn.disabled = hintUsed;
            const c = $('#skill-hint-count');
            if (c) c.textContent = hintUsed ? '0' : '1';
        }
        if (healBtn) {
            healBtn.classList.toggle('used', healUsed);
            healBtn.disabled = healUsed;
            const c = $('#skill-heal-count');
            if (c) c.textContent = healUsed ? '0' : '1';
        }
        if (chargeBtn) {
            const cr = this.battle.charge_remaining;
            chargeBtn.disabled = cr > 0;
            chargeBtn.classList.toggle('used', cr > 0);
            const c = $('#skill-charge-count');
            if (c) c.textContent = cr > 0 ? `×${cr}` : '1';
        }
    }
};

function useSkill(skillId) {
    if (battleState !== BATTLE.PLAYER_TURN) {
        toast('战斗中无法使用技能', 'error');
        return;
    }
    const uid = getCurrentUid();
    if (skillId === 'hint') {
        if (SkillManager.battle.hint_used) return;
        const q = state.practice.questions[state.practice.currentIndex];
        if (!q || q.question_type !== 'choice' || !q.options || !q.options.length) {
            return toast('当前题目不能用提示', 'error');
        }
        // 找到正确答案,排除一个错误选项
        const correctVal = q.answer;
        const wrongOpts = q.options.filter(o => String(o).trim() !== String(correctVal).trim());
        if (wrongOpts.length === 0) return toast('没有可排除的选项', 'error');
        // 随机排除一个错误选项
        const target = wrongOpts[Math.floor(Math.random() * wrongOpts.length)];
        const btn = document.querySelector(`.option-btn[data-value="${CSS.escape(target)}"]`);
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.35';
            btn.style.textDecoration = 'line-through';
            btn.classList.add('hinted');
        }
        SkillManager.battle.hint_used = true;
        const sb = $('#skill-hint');
        if (sb) sb.classList.add('fired');
        setTimeout(() => sb && sb.classList.remove('fired'), 500);
        SkillManager.render();
        toast('💡 已为你排除一个错误选项', 'info');
    } else if (skillId === 'heal') {
        if (SkillManager.isHealUsed(uid)) return;
        if (battleData.hearts >= battleData.maxHearts) {
            return toast('心已满,无需治疗', 'error');
        }
        battleData.hearts = Math.min(battleData.maxHearts, battleData.hearts + 1);
        updateHearts();
        SkillManager.markHealUsed(uid);
        // 视觉反馈
        const sb = $('#skill-heal');
        if (sb) sb.classList.add('fired');
        setTimeout(() => sb && sb.classList.remove('fired'), 500);
        showDamage('+1 ❤️', 'heal', 0.20, 0.30);
        SkillManager.render();
        toast('❤️ 已恢复 1 颗心', 'success');
    } else if (skillId === 'charge') {
        if (SkillManager.battle.charge_remaining > 0) return;
        SkillManager.battle.charge_remaining = 3;
        const sb = $('#skill-charge');
        if (sb) sb.classList.add('fired');
        setTimeout(() => sb && sb.classList.remove('fired'), 500);
        SkillManager.render();
        toast('⚡ 蓄力完成!下 3 题伤害 ×2', 'success');
    }
}

// 检查技能是否启用 (后续可在战斗中检查 battleState)
function checkAchievementsOnCorrect(dmg, isCrit) {
    const uid = getCurrentUid();
    if (!uid) return;
    // 🩸 一击必杀: 单次暴击伤害足够大 (单发 >= 40 = 蓄力暴击) 或 一击杀掉 100+ HP 的怪兽
    const killsBigMonster = isCrit && battleData.monsterMaxHp >= 100 && battleData.monsterHp <= 0;
    if (dmg >= 100 || (isCrit && dmg >= 40) || killsBigMonster) {
        AchievementManager.unlock(uid, 'one_shot');
    }
    // 🔥 连击大师: 单次连击 >= 10
    if (battleData.combo >= 10) {
        AchievementManager.unlock(uid, 'combo_master');
    }
    // 🏆 数学小达人: 累计答对 100 题
    const totalCorrect = AchievementManager.addTotalCorrect(uid, 1);
    if (totalCorrect >= 100) {
        AchievementManager.unlock(uid, 'math_master');
    }
}

function checkPerfectClearAchievement() {
    const uid = getCurrentUid();
    if (!uid) return;
    // 🎯 零失误: 通关且 hearts 仍为 max
    if (battleData.hearts >= battleData.maxHearts) {
        AchievementManager.unlock(uid, 'perfect_clear');
    }
}

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
    async register({ username, password, grade, avatar }) {
        if (!username || username.length < 2) return { code: 1, msg: '用户名至少2个字符' };
        if (!password || password.length < 4) return { code: 1, msg: '密码至少4个字符' };
        if (offlineDB.users.find(u => u.username === username)) return { code: 1, msg: '用户名已被占用' };
        // 如果用户传了 avatar 路径,使用;否则用 emoji 兜底
        const userAvatar = avatar || `emoji:${['🐱','🐶','🐰','🐻','🐼','🦊','🐯','🐸'][Math.floor(Math.random()*8)]}`;
        const user = {
            id: offlineDB.nextUserId++,
            username, password, grade,
            avatar: userAvatar,
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
        // 公平随机: 使用 crypto.getRandomValues 种子 + Fisher-Yates,避免 sort 偏置
        const shuffled = shuffleFair(filtered);
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
        const picked = shuffleFair(ids).slice(0, count);
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

// 公平随机洗牌:Fisher-Yates 算法,避免 Array.sort(() => Math.random() - 0.5) 的偏置问题
// 老式 sort 洗牌对 >10 元素的数组不是均匀分布,题目顺序容易"看着像固定"
function shuffleFair(arr) {
    const a = arr.slice();
    const n = a.length;
    if (n <= 1) return a;
    // 优先使用密码学级随机源 (现代浏览器/HTTPS 环境),回退到 Math.random
    const useCrypto = typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function';
    const rnd = () => {
        if (useCrypto) {
            // 用 32 位 int 取模,比一次 Math.random 更均匀
            const buf = new Uint32Array(1);
            crypto.getRandomValues(buf);
            return buf[0] / 0x100000000;
        }
        return Math.random();
    };
    for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
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

    // 各页面的进入钩子 (case 分发)
    switch (pageName) {
        case 'map':
            // 关卡地图页 — 渲染 7 个区域卡片
            if (typeof loadMap === 'function') loadMap();
            break;
        case 'practice':
            // 战斗页 — 已在 startPractice/startWrongPractice 中渲染
            break;
        case 'wrong':
            // 错题本
            if (typeof loadWrongQuestions === 'function') loadWrongQuestions();
            break;
        case 'report':
            // 学习报告
            if (typeof loadReport === 'function') loadReport();
            break;
        case 'knowledge':
            // 知识点选择
            if (typeof loadKnowledgeList === 'function' && state.user) {
                loadKnowledgeList(state.user.grade);
            }
            break;
        case 'home':
        default:
            // 首页无需特殊处理
            break;
    }

    // BGM: 进入 practice 时启动,离开时停止
    if (window.SoundFX) {
        if (pageName === 'practice') {
            SoundFX.playBGM();
        } else if (state._lastPracticePage) {
            SoundFX.stopBGM();
        }
        state._lastPracticePage = (pageName === 'practice');
    }
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
        if ((page === 'wrong' || page === 'practice' || page === 'report') && !state.user) {
            openLoginModal('login');
            toast('登录后就能用啦~', 'info');
            return;
        }
        if (page === 'practice') {
            // 顶部"开始练习" = 快速随机10道(等同首页"快速练习")
            startPractice({ grade: state.user.grade, count: 10 });
            return;
        }
        if (page === 'report') loadReport();
        if (page === 'wrong') loadWrongQuestions();
        if (page === 'map') loadMap();
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

// ========== 登录/注册 弹窗 ==========
let _authMode = 'login';  // 当前模式:'login' 或 'register'
let _selectedChar = 1;    // 注册时选的人物 1-4

function openLoginModal(mode = 'login') {
    setAuthMode(mode);
    $('#login-modal').style.display = 'flex';
    setTimeout(() => $('#modal-username').focus(), 100);
    // 打开时把 body 锁滚动
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    $('#login-modal').style.display = 'none';
    document.body.style.overflow = '';
    // 清空表单
    $('#modal-username').value = '';
    $('#modal-password').value = '';
}

function setAuthMode(mode) {
    _authMode = mode;
    $$('#modal-tabs .tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === mode);
    });
    if (mode === 'login') {
        $('#modal-title').textContent = '欢迎回到数学乐园';
        $('#modal-sub').textContent = '登录后继续你的冒险之旅';
        $('#modal-submit-text').textContent = '登录';
        $('#modal-grade-field').style.display = 'none';
        $('#modal-character-field').style.display = 'none';
    } else {
        $('#modal-title').textContent = '加入数学乐园';
        $('#modal-sub').textContent = '注册后开启专属学习计划';
        $('#modal-submit-text').textContent = '注册';
        $('#modal-grade-field').style.display = 'flex';
        $('#modal-character-field').style.display = 'flex';
    }
}

// 打开弹窗
$('#btn-open-login').addEventListener('click', () => openLoginModal('login'));

// P5 · 顶栏声音开关按钮
$('#btn-sound').addEventListener('click', () => {
    if (!window.SoundFX) return;
    const muted = SoundFX.toggleMute();
    $('#btn-sound').classList.toggle('muted', muted);
    // 给用户一个轻微的听觉反馈(取消静音时); 静音时当然不发声
    if (!muted) SoundFX.playCorrect();
});

// 顶栏成就按钮
$('#btn-open-achievements').addEventListener('click', () => openAchievementModal());
$('#achievement-close').addEventListener('click', closeAchievementModal);
$('#achievement-modal').addEventListener('click', (e) => {
    if (e.target.id === 'achievement-modal') closeAchievementModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('#achievement-modal').style.display === 'flex') {
        closeAchievementModal();
    }
});

// 技能按钮点击
document.addEventListener('click', (e) => {
    const sb = e.target.closest && e.target.closest('.skill-btn');
    if (sb && !sb.disabled) {
        const skill = sb.dataset.skill;
        if (skill) useSkill(skill);
    }
});

// 关闭弹窗
$('#modal-close').addEventListener('click', closeLoginModal);
$('#login-modal').addEventListener('click', (e) => {
    if (e.target.id === 'login-modal') closeLoginModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('#login-modal').style.display === 'flex') {
        closeLoginModal();
    }
});

// 模式切换
$$('#modal-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => setAuthMode(tab.dataset.tab));
});

// 年级 pill
$$('.grade-pill').forEach(p => {
    p.addEventListener('click', () => {
        $$('.grade-pill').forEach(x => x.classList.remove('active'));
        p.classList.add('active');
    });
});

// 人物卡选择
$$('.char-card').forEach(card => {
    card.addEventListener('click', () => {
        $$('.char-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        _selectedChar = parseInt(card.dataset.char);
    });
});

// 提交
$('#modal-submit').addEventListener('click', async () => {
    const mode = _authMode;
    const username = $('#modal-username').value.trim();
    const password = $('#modal-password').value;

    if (!username || !password) return toast('请填写用户名和密码', 'error');
    if (username.length < 2) return toast('用户名至少 2 个字符', 'error');
    if (password.length < 4) return toast('密码至少 4 个字符', 'error');

    const body = { username, password };
    if (mode === 'register') {
        const activePill = document.querySelector('.grade-pill.active');
        body.grade = activePill ? parseInt(activePill.dataset.grade) : 1;
        body.avatar = `assets/avatars/char-${_selectedChar}.png`;
    }

    const submitBtn = $('#modal-submit');
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    const res = await apiRouter[mode](body);
    submitBtn.disabled = false;
    submitBtn.style.opacity = '';

    if (res.code === 0) {
        state.user = res.data;
        renderUser();
        closeLoginModal();
        toast(res.msg, 'success');
    } else {
        toast(res.msg, 'error');
    }
});

// Enter 键提交
$('#modal-password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#modal-submit').click();
});

async function checkLogin() {
    const res = await apiRouter.getUser();
    if (res.code === 0 && res.data) {
        state.user = res.data;
    }
    renderUser();
    // P7: 登录态变化后刷新金币显示和成就徽章
    updateGoldDisplay();
    updateAchievementBadge();
}

// 渲染用户头像:支持图片路径或 emoji 兜底
function renderAvatar(avatarData, targetEl, size = 'normal') {
    if (!targetEl) return;
    if (avatarData && avatarData.startsWith && avatarData.startsWith('assets/')) {
        // 图片路径
        const sizePx = size === 'large' ? '88px' : '64px';
        targetEl.innerHTML = `<img src="${avatarData}" alt="头像" style="width:${sizePx};height:${sizePx};border-radius:50%;object-fit:cover;background:linear-gradient(135deg,#EEF2FF,#FCE7F3);" />`;
    } else if (avatarData && avatarData.startsWith && avatarData.startsWith('emoji:')) {
        // emoji: 形式
        targetEl.textContent = avatarData.slice(6) || '🐱';
    } else {
        // 旧版直接是 emoji 字符
        targetEl.textContent = avatarData || '🐱';
    }
}

function renderUser() {
    const navLoginBtn = $('#btn-open-login');
    if (!state.user) {
        // 未登录:nav 显示登录按钮,user-info-card 隐藏
        if (navLoginBtn) navLoginBtn.hidden = false;
        $('#user-info-card').style.display = 'none';
        return;
    }
    // 已登录
    if (navLoginBtn) navLoginBtn.hidden = true;
    $('#user-info-card').style.display = 'block';
    renderAvatar(state.user.avatar, $('#user-avatar'));
    $('#user-name').textContent = state.user.username;
    $('#user-grade').textContent = state.user.grade === 1 ? '一年级' : '二年级';
    $('#stat-total').textContent = state.user.total_questions;
    $('#stat-correct').textContent = state.user.correct_count;
    $('#stat-accuracy').textContent = state.user.accuracy + '%';
}

// 退出登录
document.addEventListener('click', async (e) => {
    const logout = e.target.closest && e.target.closest('#btn-logout');
    if (logout) {
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
    }
});

// ========== 快捷操作 ==========
$$('.action-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        if (!state.user) {
            openLoginModal('login');
            toast('先登录一下就能开始啦~', 'info');
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

// 8 只怪兽图鉴：每只怪兽绑定一个知识点，CSS 像素艺术由 spriteClass 控制
// hpMultiplier 为难度倍率（图鉴/难度参考值）；实战血量仍沿用「题目数 * 10」，见 startPractice
const MONSTERS = [
    { name: '史莱姆 Lv.1',  color: 'green',   knowledge: '10以内加减',  hpMultiplier: 50,  spriteClass: 'sprite-slime' },
    { name: '幽灵 Lv.2',    color: 'purple',  knowledge: '20以内加减',  hpMultiplier: 60,  spriteClass: 'sprite-ghost' },
    { name: '机器人 Lv.3',  color: 'orange',  knowledge: '表内乘法',    hpMultiplier: 80,  spriteClass: 'sprite-robot' },
    { name: '小龙 Lv.4',    color: 'red',     knowledge: '表内除法',    hpMultiplier: 90,  spriteClass: 'sprite-wyvern' },
    { name: '木乃伊 Lv.5',  color: 'yellow',  knowledge: '凑十法/破十法', hpMultiplier: 70,  spriteClass: 'sprite-mummy' },
    { name: '骷髅王 Lv.6',  color: 'black',   knowledge: '应用题',      hpMultiplier: 100, spriteClass: 'sprite-skeleton' },
    { name: '大魔王 Lv.7',  color: 'magenta', knowledge: '综合 Boss',   hpMultiplier: 150, spriteClass: 'sprite-demon' },
    { name: '混沌龙 Lv.8',  color: 'rainbow', knowledge: '终极',        hpMultiplier: 200, spriteClass: 'sprite-chaos' }
];

// 所有 sprite class，用于切换怪兽时先移除
const SPRITE_CLASSES = MONSTERS.map(m => m.spriteClass);

// 根据知识点字符串挑选怪兽（子串匹配，容忍知识点命名差异）；无匹配则返回史莱姆
function pickMonster(knowledge = '') {
    const k = String(knowledge || '');
    if (!k) return MONSTERS[0];
    if (/终极|混沌/.test(k))            return MONSTERS[7]; // 混沌龙
    if (/综合|boss|Boss|BOSS/.test(k))  return MONSTERS[6]; // 大魔王
    if (/应用题|应用/.test(k))          return MONSTERS[5]; // 骷髅王
    if (/凑十|破十/.test(k))            return MONSTERS[4]; // 木乃伊
    if (/除法/.test(k))                 return MONSTERS[3]; // 小龙
    if (/乘法/.test(k))                 return MONSTERS[2]; // 机器人
    if (/20以内|二十以内/.test(k))       return MONSTERS[1]; // 幽灵
    return MONSTERS[0]; // 默认史莱姆（含 10以内加减）
}

// 把 #monster-sprite 的 sprite class 切换为指定怪兽
function applyMonsterSprite(monster) {
    const ms = $('#monster-sprite');
    if (!ms || !monster) return;
    ms.classList.remove(...SPRITE_CLASSES);
    ms.classList.add(monster.spriteClass || 'sprite-slime');
}

// ========== P6 · 关卡地图 ==========
// 7 个 RPG 风格区域,每个区域绑定一个知识点。
// 解锁机制: 默认只解锁第一个,通关后解锁下一个 (在 showBattleEnd 中触发)。
// P3 已把 MONSTERS 扩展为 8 只图鉴,这里仍保留独立的 LEVEL_MAPS,
// 因为"区域/怪兽名/主题色"是地图 UI 的概念,与 MONSTERS 的图鉴数据不完全重叠。
const LEVEL_MAPS = [
    { name: '森林',     monster: '史莱姆',   emoji: '🟢', color: 'green',   knowledge: '5以内加法' },
    { name: '城堡',     monster: '幽灵',     emoji: '👻', color: 'purple',  knowledge: '5以内减法' },
    { name: '火山',     monster: '机器人',   emoji: '🤖', color: 'orange',  knowledge: '10以内加法' },
    { name: '冰原',     monster: '小龙',     emoji: '🐲', color: 'cyan',    knowledge: '10以内减法' },
    { name: '沙漠',     monster: '骷髅王',   emoji: '💀', color: 'yellow',  knowledge: '凑十法' },
    { name: '王座大厅', monster: '大魔王',   emoji: '👿', color: 'red',     knowledge: '20以内加法' },
    { name: '龙穴',     monster: '混沌龙',   emoji: '🐉', color: 'magenta', knowledge: '20以内减法' }
];

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

function getUnlockedLevels() {
    // 默认只解锁第一个
    return store.get('unlocked', [LEVEL_MAPS[0].knowledge]);
}

function setUnlockedLevels(list) {
    store.set('unlocked', list);
}

function getClearedLevels() {
    return store.get('cleared', []);
}

function markLevelCleared(knowledge) {
    const cleared = getClearedLevels();
    if (!cleared.includes(knowledge)) {
        cleared.push(knowledge);
        store.set('cleared', cleared);
    }
}

function unlockNextLevel(knowledge) {
    const idx = LEVEL_MAPS.findIndex(m => m.knowledge === knowledge);
    if (idx === -1) return null;
    if (idx >= LEVEL_MAPS.length - 1) return null;  // 已是最后一关
    const unlocked = getUnlockedLevels();
    const nextKey = LEVEL_MAPS[idx + 1].knowledge;
    if (!unlocked.includes(nextKey)) {
        unlocked.push(nextKey);
        setUnlockedLevels(unlocked);
    }
    return LEVEL_MAPS[idx + 1];
}

function loadMap() {
    // 不要 showPage('map') — showPage 已经会调用 loadMap,否则无限递归
    const grid = $('#map-grid');
    if (!grid) return;

    const unlocked = getUnlockedLevels();
    const cleared = getClearedLevels();

    grid.innerHTML = LEVEL_MAPS.map((lv, i) => {
        const isUnlocked = unlocked.includes(lv.knowledge);
        const isCleared = cleared.includes(lv.knowledge);
        const isCurrent = isUnlocked && !isCleared;   // 最新解锁且未通关 = 当前挑战
        const statusClass = isCleared ? 'cleared' : (isCurrent ? 'current' : 'locked');
        const statusHtml = isCleared
            ? '<span class="map-card-stars">⭐⭐⭐</span>'
            : (isCurrent
                ? '<span class="map-card-stars">⚔️ 挑战</span>'
                : '<span class="map-card-lock-icon">🔒</span><span class="map-card-lock-hint">先通关前一关</span>');
        const safeName = escapeHtml(lv.name);
        const safeMonster = escapeHtml(lv.monster);
        const safeKnowledge = escapeHtml(lv.knowledge);
        return `
            <div class="map-card ${statusClass}"
                 data-knowledge="${safeKnowledge}"
                 data-color="${lv.color}"
                 data-locked="${isUnlocked ? '0' : '1'}">
                <div class="map-card-level">Lv.${i + 1}</div>
                <div class="map-card-icon">${lv.emoji}</div>
                <div class="map-card-name">${safeName}</div>
                <div class="map-card-monster">${safeMonster}</div>
                <div class="map-card-status">${statusHtml}</div>
            </div>
        `;
    }).join('');

    grid.querySelectorAll('.map-card').forEach(card => {
        card.addEventListener('click', () => {
            if (card.dataset.locked === '1') {
                toast('先通关前一关', 'info');
                return;
            }
            const knowledge = card.dataset.knowledge;
            const lv = LEVEL_MAPS.find(x => x.knowledge === knowledge);
            if (!lv) return toast('关卡配置缺失', 'error');
            startPractice({
                grade: 1,
                knowledge,
                count: 10,
                source: 'levelmap'
            });
        });
    });
}

async function startPractice({ grade, knowledge = '', count = 10, source = 'normal' }) {
    const res = await apiRouter.getQuestions({ grade, knowledge, count });
    if (res.code !== 0) return toast(res.msg, 'error');
    if (!res.data.length) return toast('没有题目', 'error');

    // 战斗数据（怪兽按知识点挑选）
    // 未显式传 knowledge（如快速练习）时，回退用第一题的 knowledge，让怪兽与实际题目主题一致
    const effectiveKnowledge = knowledge || (res.data[0] && res.data[0].knowledge) || '';
    const monster = pickMonster(effectiveKnowledge);
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
    applyMonsterSprite(monster);
    $('#monster-sprite').classList.remove('dying', 'hurt');
    $('#monster-sprite').classList.add('idle');
    $('#player-sprite').classList.remove('attacking', 'charging', 'hurt');
    $('#player-sprite').classList.add('idle');
    // 同步玩家头像图(从用户选择)
    const playerImg = $('#player-sprite-img');
    if (playerImg) {
        const av = state.user && state.user.avatar;
        playerImg.src = (av && av.startsWith && av.startsWith('assets/')) ? av : 'assets/avatars/char-1.png';
    }
    $('#damage-numbers').innerHTML = '';

    // P7: 重置本场战斗的技能状态 (hint/charge), 刷新金币显示
    SkillManager.resetBattleState();
    SkillManager.render();
    updateGoldDisplay();

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
        let dmg = isCrit ? 20 : 10;
        // 蓄力技能: dmg ×2, 持续 3 题
        if (SkillManager.battle.charge_remaining > 0) {
            dmg = dmg * 2;
            SkillManager.battle.charge_remaining--;
            // 实时刷新蓄力计数 UI (×3 → ×2 → ×1 → 1)
            SkillManager.render();
        }
        battleData.monsterHp = Math.max(0, battleData.monsterHp - dmg);
        battleData.score += isCrit ? 30 : 10;

        // 💰 答对 +10 金币
        const uid = getCurrentUid();
        GoldManager.add(uid, 10);
        updateGoldDisplay();
        flashGoldDisplay();

        // 成就检查
        checkAchievementsOnCorrect(dmg, isCrit);

        // 🔊 P5 · 答对音效: ding
        if (window.SoundFX) SoundFX.playCorrect();

        // 1. 玩家蓄力 → 攻击
        const ps = $('#player-sprite');
        ps.classList.remove('idle');
        ps.classList.add('charging');
        setTimeout(() => {
            ps.classList.remove('charging');
            ps.classList.add('attacking');
            // 🔊 P5 · 攻击嗖声
            if (window.SoundFX) SoundFX.playAttack();
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
            // 🔊 P5 · 命中/暴击音效
            if (window.SoundFX) {
                if (isCrit) SoundFX.playCrit();
                else SoundFX.playHit();
            }
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
                // 解锁答题区 — 否则 继续 按钮点不到 (pointer-events: none 阻断)
                if (bq) bq.classList.remove('locked');
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
            // 🔊 P5 · 答错 + 受伤 音效
            if (window.SoundFX) {
                SoundFX.playWrong();
                SoundFX.playHurt();
            }
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
                // 解锁答题区 — 否则 继续 按钮点不到 (pointer-events: none 阻断)
                if (bq) bq.classList.remove('locked');
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

        // 🔊 P5 · 胜利旋律
        if (window.SoundFX) SoundFX.playWin();

        // P7 · 通关奖励: +50 金币 + 检查 零失误 成就
        const uid = getCurrentUid();
        if (uid) {
            GoldManager.add(uid, 50);
            updateGoldDisplay();
            flashGoldDisplay();
            checkPerfectClearAchievement();
        }
    } else {
        // 🔊 P5 · 失败 sad 旋律
        if (window.SoundFX) SoundFX.playLose();
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

    // P6 · 关卡地图:通关后解锁下一关 + 标记本关已通关
    // 任务要求: 用 currentIndex >= questions.length - 1 判断"通关"
    // 仅 source === 'levelmap' 的战斗中触发,避免快速练习/错题本误触发解锁
    const clearedReachedEnd = p.currentIndex >= (p.questions.length - 1);
    if (isWin && p.source === 'levelmap' && clearedReachedEnd) {
        const knowledge = p.questions && p.questions[0] ? p.questions[0].knowledge : '';
        if (knowledge) {
            markLevelCleared(knowledge);
            const next = unlockNextLevel(knowledge);
            if (next) {
                // 延迟提示,等结果卡片显示后再 toast
                setTimeout(() => {
                    toast(`🎉 已解锁新区域:${next.name}!`, 'success');
                }, isWin ? 1400 : 600);
            } else {
                // 最后一关
                setTimeout(() => {
                    toast('🏆 已通关全部区域!你是真正的数学小英雄!', 'success');
                }, isWin ? 1400 : 600);
            }
        }
    }

    checkLogin();
}

$('#btn-again').addEventListener('click', () => {
    const p = state.practice;
    const source = p.source;
    const grade = p.questions[0]?.grade || state.user.grade;
    if (source === 'wrong') {
        startWrongPractice();
    } else {
        const knowledge = p.questions[0]?.knowledge || '';
        startPractice({ grade, knowledge, count: 10 });
    }
});

// 撤退按钮
document.addEventListener('click', (e) => {
    const flee = e.target.closest && e.target.closest('#btn-flee');
    if (flee) {
        if (confirm('确定要撤退吗？当前战斗进度会丢失。')) {
            battleState = BATTLE.FINISHED;
            clearInterval(_quizTimer);
            showPage('home');
        }
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
    applyMonsterSprite(monster);
    $('#monster-sprite').classList.remove('dying', 'hurt');
    $('#monster-sprite').classList.add('idle');
    $('#player-sprite').classList.remove('attacking', 'charging', 'hurt');
    $('#player-sprite').classList.add('idle');
    // 同步玩家头像图
    const playerImg2 = $('#player-sprite-img');
    if (playerImg2) {
        const av = state.user && state.user.avatar;
        playerImg2.src = (av && av.startsWith && av.startsWith('assets/')) ? av : 'assets/avatars/char-1.png';
    }
    $('#damage-numbers').innerHTML = '';

    // P7: 错题重做也要重置技能状态
    SkillManager.resetBattleState();
    SkillManager.render();
    updateGoldDisplay();

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

// ========== P5 · Web Audio API 8-bit 音效系统 ==========
// 完全使用 OscillatorNode + 噪声 Buffer 实时合成,无 mp3/wav 依赖
// 必须在用户首次点击后调用 init() (浏览器 autoplay policy)
window.SoundFX = (function () {
    let ctx = null;            // AudioContext 实例(懒创建)
    let masterGain = null;     // 主音量 GainNode
    let initialized = false;   // 是否已初始化
    let muted = false;         // 静音状态
    let bgmTimer = null;       // BGM 调度 timer
    let bgmNoteIdx = 0;        // 当前播放到 BGM 哪个音符
    let bgmShouldPlay = false; // BGM 是否应该播放(用于 mute 切换后恢复)
    let bgmActive = false;     // BGM 调度循环是否在跑

    // 从 localStorage 恢复静音状态
    try {
        muted = localStorage.getItem('math_quiz_muted') === '1';
    } catch (e) { /* 隐私模式可能抛错,默认未静音 */ }

    // ----- 内部工具 -----
    function init() {
        if (initialized) return true;
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return false;
            ctx = new AC();
            masterGain = ctx.createGain();
            masterGain.gain.value = muted ? 0 : 0.32;
            masterGain.connect(ctx.destination);
            initialized = true;
            // 有些浏览器初始化时是 suspended,resume 一下
            if (ctx.state === 'suspended') {
                ctx.resume().catch(() => {});
            }
            return true;
        } catch (e) {
            console.warn('[SoundFX] init failed:', e);
            return false;
        }
    }

    // 每次播放前确保 ctx 可用 + 处于 running 状态
    function ensureCtx() {
        if (!initialized) init();
        if (!ctx) return null;
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        return ctx;
    }

    // 简化的 ADSR 包络:attackTime 内升到 peak,然后指数衰减到 ~0
    function envelope(gainNode, peak, duration, attackTime) {
        const c = gainNode.context;
        const now = c.currentTime;
        const at = attackTime != null ? attackTime : 0.005;
        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0001), now + at);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }

    // 播放一个固定音调的 tone
    function tone(c, type, freq, duration, peak, attackTime) {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        envelope(g, peak != null ? peak : 0.2, duration, attackTime);
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
        osc.stop(c.currentTime + duration + 0.05);
    }

    // 频率扫描:从 freqStart 平滑滑到 freqEnd
    function sweep(c, type, freqStart, freqEnd, duration, peak) {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = type;
        const now = c.currentTime;
        osc.frequency.setValueAtTime(freqStart, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 0.01), now + duration);
        envelope(g, peak != null ? peak : 0.2, duration, 0.005);
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
        osc.stop(now + duration + 0.05);
    }

    // 噪声 burst(可经 lowpass 滤波模拟空气声/冲击声)
    function noise(c, duration, peak, filterFreq) {
        const bufferSize = Math.max(1, Math.floor(c.sampleRate * duration));
        const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const src = c.createBufferSource();
        src.buffer = buffer;
        const filter = c.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = filterFreq != null ? filterFreq : 1500;
        const g = c.createGain();
        envelope(g, peak != null ? peak : 0.15, duration, 0.002);
        src.connect(filter);
        filter.connect(g);
        g.connect(masterGain);
        src.start();
        src.stop(c.currentTime + duration + 0.05);
    }

    // ----- 8 个音效 -----
    // 答对: 短促上扬 400→800Hz, 80ms
    function playCorrect() {
        const c = ensureCtx(); if (!c || muted) return;
        sweep(c, 'square', 400, 800, 0.08, 0.18);
    }

    // 答错: 低频锯齿 100Hz, 200ms
    function playWrong() {
        const c = ensureCtx(); if (!c || muted) return;
        tone(c, 'sawtooth', 100, 0.20, 0.15, 0.005);
        // 加一个更低的低频底,让它听起来更"钝"
        tone(c, 'sine', 60, 0.18, 0.10, 0.005);
    }

    // 玩家攻击: "嗖" 200→100Hz, 150ms + 一点空气声
    function playAttack() {
        const c = ensureCtx(); if (!c || muted) return;
        sweep(c, 'sawtooth', 200, 100, 0.15, 0.18);
        noise(c, 0.08, 0.06, 2500);
    }

    // 命中: 金属重击 square 200Hz + 噪声, 100ms
    function playHit() {
        const c = ensureCtx(); if (!c || muted) return;
        tone(c, 'square', 200, 0.10, 0.20);
        noise(c, 0.08, 0.18, 4000);
    }

    // 暴击: playHit + 上扬颤音, 200ms
    function playCrit() {
        const c = ensureCtx(); if (!c || muted) return;
        playHit();
        // 上扬颤音:300→900Hz over 150ms,叠在 hit 之上
        sweep(c, 'square', 300, 900, 0.15, 0.14);
        // 尾音高音
        setTimeout(() => {
            if (muted || !c) return;
            tone(c, 'square', 1200, 0.05, 0.16);
        }, 80);
    }

    // 玩家受伤: 低频冲击 sine 80Hz, 300ms
    function playHurt() {
        const c = ensureCtx(); if (!c || muted) return;
        // 80Hz 主调 + 120→40Hz 下潜,更厚重的"咚"
        tone(c, 'sine', 80, 0.30, 0.24, 0.02);
        sweep(c, 'sine', 120, 40, 0.25, 0.14);
    }

    // 胜利: C-E-G-C 上行, 600ms(每音 150ms)
    function playWin() {
        const c = ensureCtx(); if (!c || muted) return;
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4 E4 G4 C5
        const dur = 0.15;
        notes.forEach((f, i) => {
            setTimeout(() => {
                if (muted || !c) return;
                tone(c, 'square', f, dur * 1.3, 0.20);
            }, i * dur * 1000);
        });
    }

    // 失败: C-A-F-D 下行 sad, 800ms(每音 200ms)
    function playLose() {
        const c = ensureCtx(); if (!c || muted) return;
        const notes = [523.25, 440.00, 349.23, 293.66]; // C5 A4 F4 D4
        const dur = 0.20;
        notes.forEach((f, i) => {
            setTimeout(() => {
                if (muted || !c) return;
                tone(c, 'triangle', f, dur * 1.3, 0.18);
            }, i * dur * 1000);
        });
    }

    // ----- BGM: 8-bit 复古轻快循环, 8 个音符一段 -----
    // 主旋律: C5 E5 G5 E5 C5 G4 A4 C5(长音)
    // 同时叠低音(低八度 triangle),更厚实
    const BGM_PATTERN = [
        [523.25, 0.22], // C5
        [659.25, 0.22], // E5
        [783.99, 0.22], // G5
        [659.25, 0.22], // E5
        [523.25, 0.22], // C5
        [392.00, 0.22], // G4
        [440.00, 0.22], // A4
        [523.25, 0.44], // C5 (longer)
    ];

    function scheduleBGM(c) {
        const tick = () => {
            if (!initialized || muted || !c) { bgmActive = false; return; }
            const entry = BGM_PATTERN[bgmNoteIdx];
            if (!entry) { bgmNoteIdx = 0; bgmTimer = setTimeout(tick, 50); return; }
            const [freq, dur] = entry;
            // 主旋律 square
            tone(c, 'square', freq, dur * 0.85, 0.07);
            // 低八度低音 triangle(几乎同时响,营造 8-bit 厚度)
            tone(c, 'triangle', freq / 2, dur * 0.8, 0.05);
            bgmNoteIdx = (bgmNoteIdx + 1) % BGM_PATTERN.length;
            bgmTimer = setTimeout(tick, dur * 1000);
        };
        tick();
    }

    function playBGM() {
        bgmShouldPlay = true;
        const c = ensureCtx();
        if (!c || muted) return;
        if (bgmActive) return;
        bgmActive = true;
        bgmNoteIdx = 0;
        scheduleBGM(c);
    }

    function stopBGM() {
        bgmShouldPlay = false;
        bgmActive = false;
        if (bgmTimer) { clearTimeout(bgmTimer); bgmTimer = null; }
        bgmNoteIdx = 0;
    }

    // ----- 静音控制 -----
    function setMute(val) {
        muted = !!val;
        try { localStorage.setItem('math_quiz_muted', muted ? '1' : '0'); } catch (e) {}
        if (masterGain) {
            masterGain.gain.value = muted ? 0 : 0.32;
        }
        if (muted) {
            // 立即停 BGM
            bgmActive = false;
            if (bgmTimer) { clearTimeout(bgmTimer); bgmTimer = null; }
        } else if (bgmShouldPlay) {
            // 取消静音时若 BGM 应该播放,重新启动
            const c = ensureCtx();
            if (c) { bgmActive = true; scheduleBGM(c); }
        }
    }

    function toggleMute() { setMute(!muted); return muted; }
    function isMuted() { return muted; }

    return {
        init, ensureCtx,
        playCorrect, playWrong, playAttack, playHit, playCrit,
        playHurt, playWin, playLose,
        playBGM, stopBGM,
        setMute, isMuted, toggleMute
    };
})();

// 首次用户点击时初始化 AudioContext(浏览器 autoplay policy 要求)
(function setupFirstClickInit() {
    let initialized = false;
    const handler = function () {
        if (initialized) return;
        initialized = true;
        if (window.SoundFX) SoundFX.init();
        document.removeEventListener('click', handler, true);
        document.removeEventListener('keydown', handler, true);
        document.removeEventListener('touchstart', handler, true);
    };
    document.addEventListener('click', handler, true);
    document.addEventListener('keydown', handler, true);
    document.addEventListener('touchstart', handler, true);
})();

// DOM 加载完后,把 #btn-sound 的视觉状态与持久化的 mute 同步
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-sound');
    if (btn && window.SoundFX && SoundFX.isMuted()) {
        btn.classList.add('muted');
    }
});

// ========== 启动 ==========
// P7: 初始化技能槽 UI (默认全部可用, 真实持久状态在登录后由 SkillManager.render 刷新)
SkillManager.render();
updateGoldDisplay();
updateAchievementBadge();
checkLogin();
