# ========== FADI UNIVERSE SERVER للربط ==========
from flask import Flask, render_template_string, jsonify
from flask_socketio import SocketIO
import os
import socket
import threading
import time
import json
import logging
import requests

logging.basicConfig(level=logging.INFO)
app = Flask(__name__)
app.config['SECRET_KEY'] = 'fadi-universe-secret'
socketio = SocketIO(app, cors_allowed_origins="*", logger=True)

# ========== نظام الكون ==========
class UniverseServer:
    def __init__(self):
        self.name = "FADI-UNIVERSE"
        self.ip = self.get_public_ip()
        self.children = []
        self.services = {}
        self.start_time = time.time()
        
    def get_public_ip(self):
        try:
            return requests.get('https://api.ipify.org', timeout=5).text
        except:
            return socket.gethostbyname(socket.gethostname())
    
    def get_status(self):
        return {
            'name': self.name,
            'ip': self.ip,
            'uptime': int(time.time() - self.start_time),
            'children': len(self.children),
            'services': list(self.services.keys())
        }

# ننشئ الكون
universe = UniverseServer()

# ========== صفحة الويب ==========
@app.route('/')
def index():
    status = universe.get_status()
    return render_template_string(HTML_CODE, status=status)

@app.route('/status')
def get_status():
    return jsonify(universe.get_status())

@app.route('/health')
def health():
    return {"status": "alive", "time": time.time()}

# ========== WebSocket ==========
@socketio.on('connect')
def handle_connect():
    print(f"🟢 عميل متصل: {request.sid}")
    emit('connected', {'status': 'ok'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f"🔴 عميل قطع: {request.sid}")

# ========== كود الواجهة ==========
HTML_CODE = '''
<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌌 FADI UNIVERSE</title>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
        body { 
            background: linear-gradient(135deg, #0b0719, #1a0f2e);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .card {
            background: rgba(20, 15, 40, 0.9);
            backdrop-filter: blur(10px);
            border: 2px solid gold;
            border-radius: 40px;
            padding: 40px;
            width: 100%;
            max-width: 800px;
            color: white;
            box-shadow: 0 0 50px rgba(255, 215, 0, 0.3);
        }
        h1 {
            text-align: center;
            color: gold;
            font-size: 3em;
            margin-bottom: 20px;
        }
        .status-box {
            background: rgba(0,0,0,0.4);
            border-radius: 30px;
            padding: 30px;
            margin: 20px 0;
            border: 1px solid gold;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 15px;
            border-bottom: 1px solid rgba(255,215,0,0.2);
            font-size: 1.2em;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            color: cyan;
        }
        .value {
            color: gold;
            font-weight: bold;
        }
        .online-dot {
            width: 12px;
            height: 12px;
            background: #00ff88;
            border-radius: 50%;
            display: inline-block;
            margin-left: 8px;
            box-shadow: 0 0 15px #00ff88;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        .services {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
            margin: 20px 0;
        }
        .service-tag {
            background: rgba(255,215,0,0.1);
            border: 1px solid gold;
            border-radius: 30px;
            padding: 8px 20px;
            color: gold;
        }
        .buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 30px;
        }
        .btn {
            background: gold;
            color: black;
            border: none;
            padding: 15px 30px;
            border-radius: 60px;
            font-weight: bold;
            cursor: pointer;
            transition: 0.3s;
        }
        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px gold;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>🌌 FADI UNIVERSE</h1>
        <div style="text-align: center; margin-bottom: 20px;">
            <span class="online-dot"></span>
            <span id="statusText">النظام شغال</span>
        </div>
        
        <div class="status-box">
            <div class="info-row">
                <span class="label">🚀 اسم الكون:</span>
                <span class="value" id="name">{{ status.name }}</span>
            </div>
            <div class="info-row">
                <span class="label">📡 IP العام:</span>
                <span class="value" id="ip">{{ status.ip }}</span>
            </div>
            <div class="info-row">
                <span class="label">⏰ وقت التشغيل:</span>
                <span class="value" id="uptime">0 ثانية</span>
            </div>
            <div class="info-row">
                <span class="label">🖥️ السيرفرات الابنة:</span>
                <span class="value" id="children">{{ status.children }}</span>
            </div>
        </div>
        
        <div class="services" id="services">
            {% for service in status.services %}
            <span class="service-tag">🔧 {{ service }}</span>
            {% endfor %}
        </div>
        
        <div class="buttons">
            <button class="btn" onclick="window.location.reload()">🔄 تحديث</button>
            <button class="btn" onclick="testConnection()">📡 اختبار الاتصال</button>
        </div>
        
        <div class="footer">
            <p>نظام سحابي متكامل يخلق نفسه بنفسه</p>
            <p id="timestamp"></p>
        </div>
    </div>
    
    <script>
        const socket = io();
        
        socket.on('connect', () => {
            console.log('✅ متصل بالسيرفر');
        });
        
        function updateUptime() {
            const uptimeEl = document.getElementById('uptime');
            if (uptimeEl) {
                const seconds = {{ status.uptime }};
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const secs = seconds % 60;
                uptimeEl.textContent = `${hours}:${minutes.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
            }
        }
        
        function testConnection() {
            fetch('/health')
                .then(res => res.json())
                .then(data => {
                    alert('✅ السيرفر شغال!');
                })
                .catch(err => {
                    alert('❌ فشل الاتصال');
                });
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
    socketio.run(app, host='0.0.0.0', port=port, debug=False)
