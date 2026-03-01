from flask import Flask, render_template_string
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template_string(HTML_CODE)

# كود المنظومة اللي بتشبك عبر السيرفر العام (بسبب قيود رندر المجاني)
HTML_CODE = '''
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>💎 FADI SYSTEM PRO</title>
    <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
    <style>
        body { background: #05080a; color: #ffcc00; font-family: sans-serif; text-align: center; padding: 20px; }
        .box { border: 2px solid #00ffe0; padding: 20px; border-radius: 15px; background: #161b22; }
        .btn { background: #ffcc00; color: #000; padding: 15px; border-radius: 10px; font-weight: bold; cursor: pointer; width: 100%; }
        input { padding: 10px; margin: 10px 0; width: 90%; background: #000; color: #fff; border: 1px solid #333; }
    </style>
</head>
<body>
    <h1>👑 منظومة فادي الإمبراطورية 👑</h1>
    <div class="box" id="setup">
        <input type="text" id="roomNum" placeholder="أدخل رقم الغرفة (مثلاً 777)">
        <button class="btn" onclick="startFadi()">🚀 بدء الاشتباك العالمي</button>
    </div>
    <div id="displayStatus" style="margin-top:20px; color: #00ffe0;"></div>

<script>
    function startFadi() {
        let room = document.getElementById('roomNum').value;
        if(!room) return alert("وين الرقم؟");
        
        // رجعنا للسيرفر العام مع إضافة TURN لكسر حماية بينات الجوال
        const peer = new Peer(room, {
            config: {
                'iceServers': [
                    { 'urls': 'stun:stun.l.google.com:19302' },
                    { 
                        'urls': 'turn:openrelay.metered.ca:80', 
                        'username': 'openrelayproject', 
                        'credential': 'openrelayproject' 
                    }
                ]
            }
        });

        peer.on('open', (id) => {
            document.getElementById('displayStatus').innerText = "✅ المنظومة جاهزة! الغرفة: " + id;
            document.getElementById('setup').style.display = 'none';
        });

        peer.on('connection', (conn) => {
            document.getElementById('displayStatus').innerText = "🤝 تم الاشتباك مع الطرف الآخر!";
        });

        peer.on('error', (err) => {
            if(err.type === 'unavailable-id') {
                // دخول كمشارك لو الغرفة محجوزة
                const guestPeer = new Peer();
                guestPeer.on('open', () => {
                    guestPeer.connect(room);
                    document.getElementById('displayStatus').innerText = "✅ انضممت للغرفة: " + room;
                });
            } else {
                alert("خطأ: " + err.type);
            }
        });
    }
</script>
</body>
</html>
'''

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
