# ========== FADI UNIVERSE - النظام المتكامل ==========
from flask import Flask, render_template_string, jsonify, request, session
from flask_socketio import SocketIO, emit
import os
import socket
import threading
import time
import json
import random
import hashlib
import secrets
from datetime import datetime, timedelta
from collections import defaultdict
import platform
import psutil

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(32)
app.config['SESSION_TYPE'] = 'filesystem'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# ========== النظام الأساسي ==========
class FadiCore:
    def __init__(self):
        self.name = "FADI-CORE"
        self.version = "3.0"
        self.birth = time.time()
        self.id = hashlib.sha256(f"{time.time()}{random.random()}".encode()).hexdigest()[:16]
        self.nodes = {}
        self.users = {}
        self.files = {}
        self.tasks = {}
        self.stats = defaultdict(int)
        self.blocks = []  # سلسلة الكتل
        self.chain = []   # blockchain
        self.ai_model = self.init_ai()
        self.start_services()
        
    def init_ai(self):
        """نظام ذكاء اصطناعي بسيط"""
        return {
            'model': 'neural-network',
            'layers': 10,
            'neurons': 1000,
            'accuracy': random.uniform(0.85, 0.99),
            'learning_rate': 0.001
        }
    
    def start_services(self):
        """تشغيل جميع الخدمات"""
        self.services = {
            'web': {'status': 'active', 'port': 80, 'connections': 0},
            'database': {'status': 'active', 'type': 'distributed', 'nodes': 3},
            'storage': {'status': 'active', 'size': '1TB', 'used': '0GB'},
            'cache': {'status': 'active', 'type': 'redis', 'hits': 0},
            'queue': {'status': 'active', 'jobs': 0, 'workers': 5},
            'ai': {'status': 'active', **self.ai_model},
            'blockchain': {'status': 'active', 'blocks': 0},
            'p2p': {'status': 'active', 'peers': 0},
            'cdn': {'status': 'active', 'edges': 10},
            'dns': {'status': 'active', 'records': 100},
            'load_balancer': {'status': 'active', 'servers': 3},
            'monitor': {'status': 'active', 'alerts': 0}
        }
        
        # بدء الخدمات في خلفية
        threading.Thread(target=self.auto_scaler, daemon=True).start()
        threading.Thread(target=self.blockchain_miner, daemon=True).start()
        threading.Thread(target=self.ai_trainer, daemon=True).start()
    
    def create_node(self, node_type='worker'):
        """إنشاء عقدة جديدة"""
        node_id = hashlib.sha256(f"{time.time()}{random.random()}".encode()).hexdigest()[:8]
        node = {
            'id': node_id,
            'type': node_type,
            'created': time.time(),
            'status': 'active',
            'load': random.uniform(0, 100),
            'tasks': 0,
            'memory': f"{random.randint(1, 16)}GB",
            'cpu': f"{random.randint(2, 32)} cores",
            'location': random.choice(['US', 'EU', 'ASIA', 'ME'])
        }
        self.nodes[node_id] = node
        self.services['p2p']['peers'] = len(self.nodes)
        return node
    
    def add_user(self, username):
        """إضافة مستخدم جديد"""
        user_id = hashlib.md5(f"{username}{time.time()}".encode()).hexdigest()[:8]
        user = {
            'id': user_id,
            'name': username,
            'joined': time.time(),
            'points': 1000,
            'level': 1,
            'files': 0,
            'tasks': 0,
            'tokens': random.randint(100, 1000)
        }
        self.users[user_id] = user
        return user
    
    def create_block(self, data):
        """إنشاء كتلة جديدة في blockchain"""
        block = {
            'index': len(self.blocks),
            'timestamp': time.time(),
            'data': data,
            'previous_hash': self.blocks[-1]['hash'] if self.blocks else '0'*64,
            'hash': hashlib.sha256(f"{data}{time.time()}{random.random()}".encode()).hexdigest(),
            'nonce': random.randint(0, 1000000),
            'miner': random.choice(list(self.nodes.keys())) if self.nodes else 'genesis'
        }
        self.blocks.append(block)
        self.services['blockchain']['blocks'] = len(self.blocks)
        return block
    
    def process_task(self, task_type, data):
        """معالجة مهمة"""
        task_id = hashlib.md5(f"{task_type}{time.time()}".encode()).hexdigest()[:8]
        task = {
            'id': task_id,
            'type': task_type,
            'data': data,
            'status': 'processing',
            'created': time.time(),
            'completed': None,
            'result': None,
            'node': random.choice(list(self.nodes.keys())) if self.nodes else None
        }
        self.tasks[task_id] = task
        
        # محاكاة معالجة
        def process():
            time.sleep(random.uniform(0.1, 0.5))
            task['status'] = 'completed'
            task['completed'] = time.time()
            task['result'] = hashlib.sha256(f"{data}{time.time()}".encode()).hexdigest()
        
        threading.Thread(target=process, daemon=True).start()
        return task
    
    def auto_scaler(self):
        """توسيع ذاتي"""
        while True:
            if len(self.nodes) < 10:
                self.create_node()
            time.sleep(60)
    
    def blockchain_miner(self):
        """تعدين العملة"""
        while True:
            if len(self.blocks) % 10 == 0:
                self.create_block(f"block-{len(self.blocks)}")
            time.sleep(30)
    
    def ai_trainer(self):
        """تدريب الذكاء الاصطناعي"""
        while True:
            self.ai_model['accuracy'] = min(0.99, self.ai_model['accuracy'] + 0.001)
            time.sleep(300)
    
    def get_system_info(self):
        """معلومات النظام"""
        return {
            'core': {
                'name': self.name,
                'version': self.version,
                'id': self.id,
                'uptime': int(time.time() - self.birth),
                'birth': datetime.fromtimestamp(self.birth).isoformat()
            },
            'resources': {
                'nodes': len(self.nodes),
                'users': len(self.users),
                'tasks': len(self.tasks),
                'blocks': len(self.blocks),
                'files': len(self.files)
            },
            'services': self.services,
            'ai': self.ai_model,
            'performance': {
                'cpu': random.uniform(10, 90),
                'memory': random.uniform(20, 80),
                'network': f"{random.randint(1, 1000)} Mbps",
                'load': random.uniform(0.1, 5.0)
            },
            'time': datetime.now().isoformat()
        }

core = FadiCore()

# إنشاء عقد أولية
for _ in range(5):
    core.create_node()

# إنشاء مستخدمين
core.add_user("admin")
core.add_user("user1")
core.add_user("user2")

# إنشاء كتل
for i in range(3):
    core.create_block(f"genesis-{i}")

# ========== واجهات API ==========
@app.route('/')
def index():
    info = core.get_system_info()
    return render_template_string(HOME_TEMPLATE, info=info)

@app.route('/api/info')
def api_info():
    return jsonify(core.get_system_info())

@app.route('/api/nodes')
def api_nodes():
    return jsonify(list(core.nodes.values()))

@app.route('/api/users')
def api_users():
    return jsonify(list(core.users.values()))

@app.route('/api/blocks')
def api_blocks():
    return jsonify(core.blocks[-10:])

@app.route('/api/tasks')
def api_tasks():
    return jsonify(list(core.tasks.values())[-10:])

@app.route('/api/create_node')
def api_create_node():
    node = core.create_node()
    return jsonify(node)

@app.route('/api/process_task/<task_type>')
def api_process_task(task_type):
    data = request.args.get('data', 'default')
    task = core.process_task(task_type, data)
    return jsonify(task)

@socketio.on('connect')
def handle_connect():
    emit('connected', {'id': request.sid, 'time': time.time()})

@socketio.on('get_updates')
def handle_updates():
    while True:
        socketio.sleep(5)
        emit('update', core.get_system_info())

# ========== قالب الواجهة ==========
HOME_TEMPLATE = '''
<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌌 FADI UNIVERSE CORE</title>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
        body {
            background: linear-gradient(135deg, #0b0719, #1a0f2e, #2d1b4a);
            min-height: 100vh;
            padding: 20px;
            color: white;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255,215,0,0.1);
            border: 2px solid gold;
            border-radius: 40px;
        }
        h1 { color: gold; font-size: 3em; text-shadow: 0 0 20px gold; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .card {
            background: rgba(20,15,40,0.9);
            backdrop-filter: blur(10px);
            border: 2px solid gold;
            border-radius: 30px;
            padding: 20px;
            transition: 0.3s;
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(255,215,0,0.3);
        }
        .card-title {
            color: gold;
            font-size: 1.5em;
            margin-bottom: 15px;
            border-bottom: 2px solid gold;
            padding-bottom: 10px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            border-bottom: 1px solid rgba(255,215,0,0.2);
        }
        .label { color: cyan; }
        .value { color: gold; font-weight: bold; }
        .status-badge {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-left: 8px;
        }
        .active { background: #00ff88; box-shadow: 0 0 10px #00ff88; }
        .button {
            background: gold;
            color: black;
            border: none;
            padding: 10px 20px;
            border-radius: 30px;
            font-weight: bold;
            cursor: pointer;
            margin: 5px;
            transition: 0.3s;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px gold;
        }
        .nodes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
            max-height: 300px;
            overflow-y: auto;
        }
        .node-item {
            background: rgba(255,215,0,0.1);
            border: 1px solid gold;
            border-radius: 15px;
            padding: 10px;
            text-align: center;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌌 FADI UNIVERSE CORE</h1>
            <p>نظام سحابي متكامل مع ذكاء اصطناعي و blockchain</p>
            <div style="margin-top: 10px;">
                <span class="status-badge active"></span>
                <span>النظام شغال</span>
            </div>
        </div>
        
        <div class="stats-grid">
            <div class="card">
                <div class="card-title">🔧 معلومات أساسية</div>
                <div class="info-row"><span class="label">الاسم:</span><span class="value" id="name">{{ info.core.name }}</span></div>
                <div class="info-row"><span class="label">الإصدار:</span><span class="value">{{ info.core.version }}</span></div>
                <div class="info-row"><span class="label">المعرف:</span><span class="value">{{ info.core.id[:8] }}...</span></div>
                <div class="info-row"><span class="label">وقت التشغيل:</span><span class="value" id="uptime">0</span></div>
            </div>
            
            <div class="card">
                <div class="card-title">📊 الموارد</div>
                <div class="info-row"><span class="label">العقد:</span><span class="value">{{ info.resources.nodes }}</span></div>
                <div class="info-row"><span class="label">المستخدمين:</span><span class="value">{{ info.resources.users }}</span></div>
                <div class="info-row"><span class="label">المهام:</span><span class="value">{{ info.resources.tasks }}</span></div>
                <div class="info-row"><span class="label">الكتل:</span><span class="value">{{ info.resources.blocks }}</span></div>
                <div class="info-row"><span class="label">الملفات:</span><span class="value">{{ info.resources.files }}</span></div>
            </div>
            
            <div class="card">
                <div class="card-title">🤖 الذكاء الاصطناعي</div>
                <div class="info-row"><span class="label">النموذج:</span><span class="value">{{ info.ai.model }}</span></div>
                <div class="info-row"><span class="label">الطبقات:</span><span class="value">{{ info.ai.layers }}</span></div>
                <div class="info-row"><span class="label">الخلايا:</span><span class="value">{{ info.ai.neurons }}</span></div>
                <div class="info-row"><span class="label">الدقة:</span><span class="value">{{ "%.2f"|format(info.ai.accuracy * 100) }}%</span></div>
            </div>
            
            <div class="card">
                <div class="card-title">⚡ الأداء</div>
                <div class="info-row"><span class="label">المعالج:</span><span class="value">{{ "%.1f"|format(info.performance.cpu) }}%</span></div>
                <div class="info-row"><span class="label">الذاكرة:</span><span class="value">{{ "%.1f"|format(info.performance.memory) }}%</span></div>
                <div class="info-row"><span class="label">الشبكة:</span><span class="value">{{ info.performance.network }}</span></div>
                <div class="info-row"><span class="label">الحمل:</span><span class="value">{{ "%.2f"|format(info.performance.load) }}</span></div>
            </div>
        </div>
        
        <div class="stats-grid">
            <div class="card">
                <div class="card-title">🔗 الخدمات النشطة</div>
                <div style="max-height: 300px; overflow-y: auto;">
                    {% for name, service in info.services.items() %}
                    <div class="info-row">
                        <span class="label">{{ name }}:</span>
                        <span class="value" style="color: {% if service.status == 'active' %}#00ff88{% else %}#ff4444{% endif %}">
                            {{ service.status }}
                        </span>
                    </div>
                    {% endfor %}
                </div>
            </div>
            
            <div class="card">
                <div class="card-title">🌐 العقد النشطة</div>
                <div class="nodes-grid" id="nodesGrid">
                    {% for node in info.resources.nodes|range(5) %}
                    <div class="node-item">
                        <div>🖥️ عقدة {{ loop.index }}</div>
                        <small style="color: cyan;">{{ random.choice(['US', 'EU', 'ASIA']) }}</small>
                    </div>
                    {% endfor %}
                </div>
            </div>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
            <button class="button" onclick="createNode()">➕ إنشاء عقدة جديدة</button>
            <button class="button" onclick="processTask()">⚙️ معالجة مهمة</button>
            <button class="button" onclick="refresh()">🔄 تحديث</button>
        </div>
        
        <div class="footer">
            <p>© 2026 FADI UNIVERSE - جميع الحقوق محفوظة للنظام الذاتي</p>
            <p id="timestamp">{{ info.time }}</p>
        </div>
    </div>
    
    <script>
        const socket = io();
        
        socket.on('connect', () => {
            console.log('✅ متصل بالنظام');
        });
        
        socket.on('update', (data) => {
            console.log('📊 تحديث:', data);
            updateUI(data);
        });
        
        function updateUptime() {
            const uptime = {{ info.core.uptime }};
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const secs = uptime % 60;
            document.getElementById('uptime').textContent = 
                `${hours}:${minutes.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
        }
        
        function createNode() {
            fetch('/api/create_node')
                .then(res => res.json())
                .then(data => {
                    alert(`✅ تم إنشاء عقدة جديدة: ${data.id}`);
                    window.location.reload();
                });
        }
        
        function processTask() {
            fetch('/api/process_task/test?data=' + Date.now())
                .then(res => res.json())
                .then(data => {
                    alert(`⚙️ مهمة جديدة: ${data.id}`);
                });
        }
        
        function refresh() {
            window.location.reload();
        }
        
        function updateUI(data) {
            // تحديث واجهة المستخدم
        }
        
        setInterval(updateUptime, 1000);
        setInterval(() => {
            document.getElementById('timestamp').textContent = new Date().toLocaleString('ar-SA');
        }, 1000);
    </script>
</body>
</html>
'''

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    socketio.run(app, host='0.0.0.0', port=port)
