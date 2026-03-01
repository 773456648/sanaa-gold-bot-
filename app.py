from flask import Flask, render_template_string
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template_string(HTML_CODE)

HTML_CODE = '''
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>💬 FADI CHAT ONLY</title>
    <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
    <style>
        body { background: #05080a; color: #ffcc00; font-family: sans-serif; text-align: center; padding: 20px; }
        .box { border: 2px solid #00ffe0; padding: 15px; border-radius: 12px; background: #161b22; }
        #chat { height: 250px; overflow-y: auto; background: rgba(0,0,0,0.5); margin: 15px 0; padding: 10px; border-radius: 8px; text-align: right; color: white; border: 1px solid #333; }
        input { width: 70%; padding: 10px; border-radius: 5px; }
        button { background: #ffcc00; color: #000; padding: 10px; border-radius: 5px; font-weight: bold; cursor: pointer; }
    </style>
</head>
<body>
    <h1>💎 منظومة الدردشة 💎</h1>
    <div class="box" id="setup">
        <input type="text" id="room" placeholder="رقم الغرفة">
        <button onclick="start()">🚀 اشتبك</button>
    </div>
    <div id="mainUI" style="display:none;">
        <div id="chat"></div>
        <input type="text" id="msg" placeholder="اكتب رسالة...">
        <button onclick="send()">إرسال</button>
    </div>

<script>
    let peer, conn;
    function start() {
        let room = document.getElementById('room').value;
        if(!room) return;
        document.getElementById('setup').style.display = 'none';
        document.getElementById('mainUI').style.display = 'block';
        
        peer = new Peer(room);
        peer.on('open', (id) => { log("✅ جاهز في الغرفة: " + id); });
        
        peer.on('connection', (c) => { 
            conn = c; 
            log("🤝 اشتبك صاحبك معك!");
            setupConn();
        });

        peer.on('error', () => {
            const guest = new Peer();
            guest.on('open', () => {
                conn = guest.connect(room);
                log("✅ متصل الآن بالغرفة: " + room);
                setupConn();
            });
        });
    }

    function setupConn() {
        conn.on('data', (data) => { log("صاحبك: " + data); });
    }

    function send() {
        let m = document.getElementById('msg').value;
        if(conn && conn.open) {
            conn.send(m);
            log("أنا: " + m);
            document.getElementById('msg').value = "";
        }
    }

    function log(m) {
        let d = document.createElement('div');
        d.innerText = m;
        document.getElementById('chat').appendChild(d);
        document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
    }
</script>
</body>
</html>
'''

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
