"""
小学数学题库系统 - Flask 后端
"""
import os
import sys
import json
import random
import traceback
from datetime import datetime
from flask import Flask, request, jsonify, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

# ============== 应用根目录 ==============
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
FRONTEND_DIR = os.path.join(PROJECT_ROOT, 'frontend')
INSTANCE_DIR = os.path.join(BASE_DIR, 'instance')
os.makedirs(INSTANCE_DIR, exist_ok=True)

# ============== 启动日志(便于排错) ==============
LOG_FILE = os.path.join(BASE_DIR, 'startup.log')

def log(msg):
    line = f'[{datetime.now().strftime("%H:%M:%S")}] {msg}'
    print(line)
    try:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(line + '\n')
    except Exception:
        pass

log('--- Math Quiz starting ---')
log(f'BASE_DIR     = {BASE_DIR}')
log(f'FRONTEND_DIR = {FRONTEND_DIR}')
log(f'INSTANCE_DIR = {INSTANCE_DIR}')

# ============== 应用初始化 ==============
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
app.config['SECRET_KEY'] = 'math-quiz-secret-key-2026'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(INSTANCE_DIR, 'math_quiz.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_AS_ASCII'] = False

db = SQLAlchemy(app)
CORS(app, supports_credentials=True)

# ============== 数据模型 ==============

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    grade = db.Column(db.Integer, default=1)
    avatar = db.Column(db.String(20), default='🐱')
    total_questions = db.Column(db.Integer, default=0)
    correct_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.now)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'grade': self.grade,
            'avatar': self.avatar,
            'total_questions': self.total_questions,
            'correct_count': self.correct_count,
            'accuracy': round(self.correct_count / self.total_questions * 100, 1) if self.total_questions > 0 else 0
        }

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    grade = db.Column(db.Integer, nullable=False)
    knowledge = db.Column(db.String(50), nullable=False)
    question_type = db.Column(db.String(20), nullable=False)
    content = db.Column(db.String(500), nullable=False)
    options = db.Column(db.String(200))
    answer = db.Column(db.String(50), nullable=False)
    explanation = db.Column(db.String(500))
    difficulty = db.Column(db.Integer, default=1)

    def to_dict(self):
        return {
            'id': self.id,
            'grade': self.grade,
            'knowledge': self.knowledge,
            'question_type': self.question_type,
            'content': self.content,
            'options': json.loads(self.options) if self.options else None,
            'answer': self.answer,
            'explanation': self.explanation,
            'difficulty': self.difficulty
        }

class AnswerRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    user_answer = db.Column(db.String(50))
    is_correct = db.Column(db.Boolean, default=False)
    time_spent = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.now)

    question = db.relationship('Question', backref='records')

    def to_dict(self):
        return {
            'id': self.id,
            'question_id': self.question_id,
            'question': self.question.to_dict(),
            'user_answer': self.user_answer,
            'is_correct': self.is_correct,
            'time_spent': self.time_spent,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

# ============== 辅助函数 ==============

def current_user():
    user_id = session.get('user_id')
    if user_id:
        return User.query.get(user_id)
    return None

def opts(*args):
    return json.dumps(list(args), ensure_ascii=False)

# ============== 用户相关接口 ==============

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    grade = data.get('grade', 1)

    if len(username) < 2:
        return jsonify({'code': 1, 'msg': '用户名至少2个字符'})
    if len(password) < 4:
        return jsonify({'code': 1, 'msg': '密码至少4个字符'})

    if User.query.filter_by(username=username).first():
        return jsonify({'code': 1, 'msg': '用户名已被占用'})

    avatars = ['🐱', '🐶', '🐰', '🐻', '🐼', '🦊', '🐯', '🐸']
    user = User(
        username=username,
        password_hash=generate_password_hash(password),
        grade=grade,
        avatar=random.choice(avatars)
    )
    db.session.add(user)
    db.session.commit()
    session['user_id'] = user.id
    return jsonify({'code': 0, 'msg': '注册成功', 'data': user.to_dict()})


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'code': 1, 'msg': '用户名或密码错误'})

    session['user_id'] = user.id
    return jsonify({'code': 0, 'msg': '登录成功', 'data': user.to_dict()})


@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'code': 0, 'msg': '已退出'})


@app.route('/api/user', methods=['GET'])
def get_user():
    user = current_user()
    if not user:
        return jsonify({'code': 1, 'msg': '未登录', 'data': None})
    return jsonify({'code': 0, 'data': user.to_dict()})


@app.route('/api/user/report', methods=['GET'])
def user_report():
    user = current_user()
    if not user:
        return jsonify({'code': 1, 'msg': '未登录'})

    records = AnswerRecord.query.filter_by(user_id=user.id).all()
    total = len(records)
    correct = sum(1 for r in records if r.is_correct)
    accuracy = round(correct / total * 100, 1) if total > 0 else 0

    knowledge_stats = {}
    for r in records:
        k = r.question.knowledge
        if k not in knowledge_stats:
            knowledge_stats[k] = {'total': 0, 'correct': 0}
        knowledge_stats[k]['total'] += 1
        if r.is_correct:
            knowledge_stats[k]['correct'] += 1

    knowledge_list = [
        {'name': k, 'total': v['total'], 'correct': v['correct'],
         'accuracy': round(v['correct'] / v['total'] * 100, 1)}
        for k, v in knowledge_stats.items()
    ]
    knowledge_list.sort(key=lambda x: x['accuracy'])

    return jsonify({
        'code': 0,
        'data': {
            'total': total, 'correct': correct, 'accuracy': accuracy,
            'knowledge_stats': knowledge_list
        }
    })

# ============== 题目相关接口 ==============

@app.route('/api/questions', methods=['GET'])
def get_questions():
    grade = request.args.get('grade', type=int)
    knowledge = request.args.get('knowledge', '')
    count = request.args.get('count', 10, type=int)
    exclude_ids = request.args.get('exclude', '')

    query = Question.query
    if grade:
        query = query.filter_by(grade=grade)
    if knowledge:
        query = query.filter_by(knowledge=knowledge)

    all_questions = query.all()
    if exclude_ids:
        exclude_set = set(int(x) for x in exclude_ids.split(',') if x)
        all_questions = [q for q in all_questions if q.id not in exclude_set]

    if not all_questions:
        return jsonify({'code': 1, 'msg': '没有符合条件的题目'})

    selected = random.sample(all_questions, min(count, len(all_questions)))
    return jsonify({'code': 0, 'data': [q.to_dict() for q in selected]})


@app.route('/api/knowledge', methods=['GET'])
def get_knowledge():
    grade = request.args.get('grade', 1, type=int)
    knowledge_list = db.session.query(Question.knowledge).filter_by(grade=grade).distinct().all()
    result = [{'name': k[0], 'count': Question.query.filter_by(grade=grade, knowledge=k[0]).count()}
              for k in knowledge_list]
    return jsonify({'code': 0, 'data': result})

# ============== 答题 ==============

@app.route('/api/submit', methods=['POST'])
def submit_answer():
    user = current_user()
    if not user:
        return jsonify({'code': 1, 'msg': '请先登录'})

    data = request.json
    question_id = data.get('question_id')
    user_answer = str(data.get('answer', '')).strip()
    time_spent = data.get('time_spent', 0)

    question = Question.query.get(question_id)
    if not question:
        return jsonify({'code': 1, 'msg': '题目不存在'})

    is_correct = str(question.answer).strip() == user_answer

    record = AnswerRecord(
        user_id=user.id,
        question_id=question_id,
        user_answer=user_answer,
        is_correct=is_correct,
        time_spent=time_spent
    )
    db.session.add(record)
    user.total_questions += 1
    if is_correct:
        user.correct_count += 1
    db.session.commit()

    return jsonify({
        'code': 0,
        'data': {
            'is_correct': is_correct,
            'correct_answer': question.answer,
            'explanation': question.explanation
        }
    })

# ============== 错题本 ==============

@app.route('/api/wrong-questions', methods=['GET'])
def wrong_questions():
    user = current_user()
    if not user:
        return jsonify({'code': 1, 'msg': '请先登录'})

    records = AnswerRecord.query.filter_by(user_id=user.id, is_correct=False).all()
    seen = set()
    wrong_list = []
    for r in reversed(records):
        if r.question_id in seen:
            continue
        seen.add(r.question_id)
        wrong_list.append({
            'record_id': r.id,
            'question': r.question.to_dict(),
            'user_answer': r.user_answer,
            'wrong_time': r.created_at.strftime('%Y-%m-%d %H:%M')
        })
    return jsonify({'code': 0, 'data': wrong_list})


@app.route('/api/wrong-questions/<int:rid>/mark-mastered', methods=['POST'])
def mark_mastered(rid):
    user = current_user()
    if not user:
        return jsonify({'code': 1, 'msg': '请先登录'})

    record = AnswerRecord.query.filter_by(id=rid, user_id=user.id).first()
    if record:
        db.session.delete(record)
        db.session.commit()
    return jsonify({'code': 0, 'msg': '已掌握'})


@app.route('/api/practice-wrong', methods=['POST'])
def practice_wrong():
    user = current_user()
    if not user:
        return jsonify({'code': 1, 'msg': '请先登录'})

    data = request.json or {}
    count = data.get('count', 10)

    records = AnswerRecord.query.filter_by(user_id=user.id, is_correct=False).all()
    question_ids = list(set(r.question_id for r in records))
    if not question_ids:
        return jsonify({'code': 1, 'msg': '错题本是空的,太棒了!'})

    selected_ids = random.sample(question_ids, min(count, len(question_ids)))
    questions = Question.query.filter(Question.id.in_(selected_ids)).all()
    return jsonify({'code': 0, 'data': [q.to_dict() for q in questions]})

# ============== 静态文件 ==============

@app.route('/')
def index():
    return send_from_directory(FRONTEND_DIR, 'index.html')


@app.route('/<path:path>')
def static_file(path):
    return send_from_directory(FRONTEND_DIR, path)

# ============== 健康检查(便于手动测试) ==============

@app.route('/api/health')
def health():
    return jsonify({'code': 0, 'msg': 'OK', 'data': {
        'questions': Question.query.count(),
        'users': User.query.count()
    }})

# ============== 初始化数据库 ==============

def init_db():
    """初始化数据库 + 种子题库 - 必须 in app context"""
    with app.app_context():
        db.create_all()
        if Question.query.count() == 0:
            log('Importing seed questions...')
            try:
                from seed_data import SEED_QUESTIONS
                for q in SEED_QUESTIONS:
                    db.session.add(Question(**q))
                db.session.commit()
                log(f'Imported {len(SEED_QUESTIONS)} questions.')
            except Exception as e:
                log(f'ERROR importing seed: {e}')
                log(traceback.format_exc())
                raise
        else:
            log(f'Database already has {Question.query.count()} questions, skip seed.')

# ============== 入口 ==============

if __name__ == '__main__':
    try:
        init_db()
        log('Init OK, starting Flask...')
        print()
        print('=' * 50)
        print('  Math Quiz running at: http://127.0.0.1:5000')
        print('  Press Ctrl+C to stop.')
        print('=' * 50)
        print()
        # use_reloader=False 防止重启两次导致端口冲突
        app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)
    except Exception as e:
        log('FATAL: ' + str(e))
        log(traceback.format_exc())
        print()
        print('=' * 50)
        print('  STARTUP FAILED!')
        print(f'  Error: {e}')
        print(f'  See log: {LOG_FILE}')
        print('=' * 50)
        input('Press Enter to exit...')
        sys.exit(1)
