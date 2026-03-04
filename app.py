# ========== FADI UNIVERSE - نظام ذاتي ==========
import os
import socket
import threading
import time
import json
import random
import hashlib
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler

# ========== النظام الذاتي ==========
class FadiUniverse:
    def __init__(self):
        self.name = "FADI-UNIVERSE"
        self.born = time.time()
        self.ip = self.get_ip()
        self.children = []  # أبناءه
        self.services = {}  # خدماته
        self.memory = {}    # ذاكرته
        self.alive = True
        
        # يبدأ نفسه
        self.start_services()
        print(f"🌌 {self.name} ولد في {datetime.now()}")
        
    def get_ip(self):
        try:
            return socket.gethostbyname(socket.gethostname())
        except:
            return "127.0.0.1"
    
    def start_services(self):
        """يشتغل من نفسه"""
        # يخلق خدمات داخلية
        self.services = {
            'core': {'status': 'active', 'pid': os.getpid()},
            'memory': {'size': '1GB', 'used': '0MB'},
            'threads': threading.active_count(),
            'children': 0
        }
    
    def create_child(self):
        """يخلق ابن"""
        child_id = hashlib.md5(f"{time.time()}{random.random()}".encode()).hexdigest()[:8]
        child = {
            'id': child_id,
            'born': time.time(),
            'status': 'active'
        }
        self.children.append(child)
        self.services['children'] = len(self.children)
        return child
    
    def get_status(self):
        """حالته الآن"""
        return {
            'name': self.name,
            'age': int(time.time() - self.born),
            'ip': self.ip,
            'children': len(self.children),
            'services': list(self.services.keys()),
            'memory': self.memory,
            'time': datetime.now().isoformat()
        }

# ========== خادم الويب البسيط ==========
class Handler(BaseHTTPRequestHandler):
    universe = FadiUniverse()
    
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            
            # يصنع ابن جديد كلما زاره أحد
            child = self.universe.create_child()
            
            html = f"""
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>🌌 {self.universe.name}</title>
                <style>
                    * {{ margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI',sans-serif; }}
                    body {{
                        background: linear-gradient(135deg, #0b0719, #1a0f2e);
                        min-height: 100vh;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 20px;
                    }}
                    .card {{
                        background: rgba(20,15,40,0.9);
                        border: 2px solid gold;
                        border-radius: 40px;
                        padding: 40px;
                        max-width: 800px;
                        color: white;
                        box-shadow: 0 0 50px rgba(255,215,0,0.3);
                    }}
                    h1 {{ color: gold; font-size: 2.5em; text-align: center; }}
                    .info {{ background: rgba(0,0,0,0.4); border-radius: 30px; padding: 20px; margin: 20px 0; }}
                    .row {{ display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid rgba(255,215,0,0.2); }}
                    .label {{ color: cyan; }}
                    .value {{ color: gold; font-weight: bold; }}
                    .child {{ 
                        background: rgba(255,215,0,0.1);
                        border: 1px solid gold;
                        border-radius: 20px;
                        padding: 10px;
                        margin: 5px;
                        display: inline-block;
                    }}
                    .status {{ 
                        width: 10px; height: 10px; background: #00ff88; border-radius: 50%;
                        display: inline-block; box-shadow: 0 0 15px #00ff88; margin-left: 8px;
                    }}
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>🌌 {self.universe.name}</h1>
                    <div style="text-align:center; margin:20px;">
                        <span class="status"></span>
                        <span>النظام ذاتي التكاثر</span>
                    </div>
                    
                    <div class="info">
                        <div class="row">
                            <span class="label">🆔 المعرف:</span>
                            <span class="value">{hashlib.md5(str(time.time()).encode()).hexdigest()[:8]}</span>
                        </div>
                        <div class="row">
                            <span class="label">⏰ العمر:</span>
                            <span class="value" id="age">{int(time.time() - self.universe.born)} ثانية</span>
                        </div>
                        <div class="row">
                            <span class="label">📡 IP:</span>
                            <span class="value">{self.universe.ip}</span>
                        </div>
                        <div class="row">
                            <span class="label">👥 الأبناء:</span>
                            <span class="value">{len(self.universe.children)}</span>
                        </div>
                    </div>
                    
                    <h3 style="color:gold; margin:20px 0 10px;">👶 قائمة الأبناء</h3>
                    <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center;">
                        {''.join([f'<div class="child">#{c["id"][:4]}</div>' for c in self.universe.children[-8:]])}
                    </div>
                    
                    <div style="text-align:center; margin-top:30px;">
                        <button onclick="window.location.reload()" style="
                            background: gold;
                            color: black;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 60px;
                            font-weight: bold;
                            cursor: pointer;
                        ">➕ زورني وازيد ولد</button>
                    </div>
                    
                    <div style="text-align:center; margin-top:20px; color:#666;">
                        <p id="time">{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    </div>
                </div>
                
                <script>
                    let age = {int(time.time() - self.universe.born)};
                    setInterval(() => {{
                        age++;
                        document.getElementById('age').innerHTML = age + ' ثانية';
                    }}, 1000);
                    
                    setInterval(() => {{
                        fetch('/stats')
                            .then(r => r.json())
                            .then(d => console.log('📊', d));
                    }}, 5000);
                </script>
            </body>
            </html>
            """
            self.wfile.write(html.encode())
            
        elif self.path == '/stats':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(self.universe.get_status()).encode())
        
        elif self.path == '/health':
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'{"status":"alive"}')
    
    def log_message(self, format, *args):
        pass  # يخفي اللوقات

# ========== التشغيل ==========
def run():
    port = int(os.environ.get("PORT", 10000))
    server = HTTPServer(('0.0.0.0', port), Handler)
    print(f"🚀 {Handler.universe.name} شغال على port {port}")
    print(f"🌐 الرابط: http://localhost:{port}")
    print("🤖 النظام يخلق أبناء جدد مع كل زيارة!")
    
    # يخلق أبناء في الخلفية
    def background_birth():
        while True:
            time.sleep(30)
            Handler.universe.create_child()
            print(f"👶 ولد جديد! المجموع: {len(Handler.universe.children)}")
    
    threading.Thread(target=background_birth, daemon=True).start()
    
    server.serve_forever()

if __name__ == "__main__":
    run()
