from flask import Flask, render_template_string
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template_string(HTML_CODE)

# منظومة فادي المستقلة - تشتغل عبر سيرفرك مباشرة 👑
HTML_CODE = '''
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>💎 FADI PRIVATE SERVER</title>
    <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
    <style>
        body { background: #05080a; color: #ffcc00; font-family: sans-serif; text-align: center; padding: 20px; }
        .status-box { border: 2px solid #00ffe0; padding: 20px; border-radius: 15px; background: #161b22; }
        input { padding: 10px; margin: 10px; border-radius: 5px; width: 80%; background: #000; color: #fff; border: 1px solid #333; }
        .btn { background: #ffcc00; color: #000; padding: 15px 30px; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; width: 100%; }
    </style>
</head>
<body>
    <h1>👑 منظومة فادي المستقلة 👑</h1>
    <div class="status-box" id="setup">
        <input type="text" id="roomNum" placeholder="أدخل رقم الغرفة السرية">
        <button class="btn" onclick="connectToFadiServer()">🚀 تشغيل عبر السيرفر الخاص</button>
    </div>
    <div id="displayStatus" style="margin-top:20px; color: #00ffe0; font-weight: bold;"></div>

<script>
    let peer;

    function connectToFadiServer() {
        let room = document.getElementById('roomNum').value;
        if(!room) return alert("وين رقم الغرفة؟");

        // الربط المباشر بسيرفرك الشخصي
        peer = new Peer(room, {
            host: 'sanaa-gold-bot.onrender.com', 
            port: 443,
            path: '/peerjs', 
            secure: true,
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
            document.getElementById('displayStatus').innerText = "✅ السيرفر الشخصي شغال.. الغرفة: " + id;
            document.getElementById('setup').style.display = 'none';
        });

        peer.on('connection', (conn) => {
            document.getElementById('displayStatus').innerText = "🤝 اشتباك ناجح! شخص دخل معك";
        });
        
        peer.on('error', (err) => {
            if(err.type === 'unavailable-id') {
                joinAsGuest(room);
            } else {
                document.getElementById('displayStatus').innerText = "❌ خطأ في السيرفر: " + err.type;
            }
        });
    }

    function joinAsGuest(room) {
        let guestId = 'guest-' + Math.floor(Math.random()*999);
        peer = new Peer(guestId, {
            host: 'sanaa-gold-bot.onrender.com',
            port: 443,
            path: '/peerjs',
            secure: true
        });
        peer.on('open', () => {
            peer.connect(room);
            document.getElementById('displayStatus').innerText = "✅ انضممت بنجاح للغرفة: " + room;
        });
    }
</script>
</body>
</html>
'''

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
