# ========== FADI UNIVERSE - بدون مشاكل ==========
from flask import Flask, render_template_string, jsonify
import os
import socket
import time
import json
import random
from datetime import datetime

app = Flask(__name__)

# ========== نظام الكون البسيط ==========
class Universe:
    def __init__(self):
        self.name = "FADI-UNIVERSE"
        self.start_time = time.time()
        self.visitors = 0
        self.status = "active"
        
    def get_info(self):
        return {
            'name': self.name,
            'uptime': int(time.time() - self.start_time),
            'visitors': self.visitors,
            'status': self.status,
            'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'server': socket.gethostname(),
            'random': random.randint(1, 1000)
        }

universe = Universe()

# ========== الصفحات ==========
@app.route('/')
def index():
    universe.visitors += 1
    info = universe.get_info()
    return render_template_string(HOME_PAGE, info=info)

@app.route('/api')
def api():
    return jsonify(universe.get_info())

@app.route('/health')
def health():
    return {"status": "alive"}

# ========== صفحة ويب بسيطة ==========
HOME_PAGE = '''
<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌌 FADI UNIVERSE</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', sans-serif;
        }
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
            max-width: 600px;
            color: white;
            box-shadow: 0 0 50px rgba(255, 215, 0, 0.3);
            text-align: center;
        }
        h1 {
            color: gold;
            font-size: 2.5em;
            margin-bottom: 20px;
        }
        .info {
            background: rgba(0,0,0,0.4);
            border-radius: 30px;
            padding: 30px;
            margin: 20px 0;
        }
        .row {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            border-bottom: 1px solid rgba(255,215,0,0.2);
        }
        .label {
            color: cyan;
        }
        .value {
            color: gold;
            font-weight: bold;
        }
        .status {
            display: inline-block;
            width: 10px;
            height: 10px;
            background: #00ff88;
            border-radius: 50%;
            box-shadow: 0 0 15px #00ff88;
            margin-left: 8px;
        }
        .footer {
            margin-top: 20px;
            color: #666;
        }
        button {
            background: gold;
            color: black;
            border: none;
            padding: 15px 30px;
            border-radius: 60px;
            font-weight: bold;
            cursor: pointer;
            margin: 10px;
            transition: 0.3s;
        }
        button:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px gold;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>🌌 FADI UNIVERSE</h1>
        <div style="margin-bottom: 20px;">
            <span class="status"></span>
            <span>النظام شغال</span>
        </div>
        
        <div class="info" id="info">
            <div class="row">
                <span class="label">🚀 الاسم:</span>
                <span class="value">{{ info.name }}</span>
            </div>
            <div class="row">
                <span class="label">⏰ وقت التشغيل:</span>
                <span class="value" id="uptime">0</span>
            </div>
            <div class="row">
                <span class="label">👥 الزوار:</span>
                <span class="value">{{ info.visitors }}</span>
            </div>
            <div class="row">
                <span class="label">🖥️ السيرفر:</span>
                <span class="value">{{ info.server }}</span>
            </div>
            <div class="row">
                <span class="label">🎲 رقم عشوائي:</span>
                <span class="value">{{ info.random }}</span>
            </div>
        </div>
        
        <div>
            <button onclick="refresh()">🔄 تحديث</button>
            <button onclick="api()">📡 API</button>
        </div>
        
        <div class="footer">
            <p id="time">{{ info.time }}</p>
        </div>
    </div>
    
    <script>
        function updateUptime() {
            fetch('/api')
                .then(res => res.json())
                .then(data => {
                    const seconds = data.uptime;
                    const hours = Math.floor(seconds / 3600);
                    const minutes = Math.floor((seconds % 3600) / 60);
                    const secs = seconds % 60;
                    document.getElementById('uptime').textContent = 
                        `${hours}:${minutes.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
                });
        }
        
        function refresh() {
            window.location.reload();
        }
        
        function api() {
            fetch('/api')
                .then(res => res.json())
                .then(data => {
                    alert(JSON.stringify(data, null, 2));
                });
        }
        
        setInterval(updateUptime, 1000);
    </script>
</body>
</html>
'''

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
