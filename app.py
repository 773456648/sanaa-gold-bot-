from flask import Flask, render_template_string, request, jsonify
import os
import socket
import requests
import random
import string

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fadi-gold-secret-key-2026')

def get_public_ip():
    try:
        # محاولة جلب الآيبي الحقيقي للسيرفر
        return requests.get('https://api.ipify.org', timeout=5).text.strip()
    except:
        return "127.0.0.1"

def generate_server_id():
    # توليد معرف فريد يعتمد على الآيبي لضمان التوجيه الصحيح في PeerJS
    pub_ip = get_public_ip().replace('.', 'x')
    return f"FADI-GOLD-{pub_ip}"

HTML_CODE = '''
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>👑 FADI GOLD CONNECT</title>
    <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
    <style>
        :root { --gold: #ffd700; --cyan: #00ffff; --dark: #0b0719; }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
        body { background: linear-gradient(135deg, var(--dark), #1a0f2e); min-height: 100vh; color: white; padding: 15px; }
        
        .glass-card { background: rgba(20, 15, 40, 0.9); backdrop-filter: blur(10px); border: 2px solid var(--gold); border-radius: 25px; padding: 25px; max-width: 500px; margin: 20px auto; box-shadow: 0 0 30px rgba(255,215,0,0.2); }
        .royal-header { text-align: center; margin-bottom: 20px; }
        .royal-header h1 { font-size: 2.2em; color: var(--gold); text-shadow: 0 0 10px var(--gold); }
        
        .server-box { background: #000; border: 1px solid var(--cyan); border-radius: 15px; padding: 15px; margin: 15px 0; text-align: center; }
        .server-id { color: var(--cyan); font-family: monospace; font-size: 1.1em; word-break: break-all; }
        
        .input-field { width: 100%; padding: 12px 20px; margin: 10px 0; background: rgba(0,0,0,0.5); border: 1px solid var(--gold); border-radius: 50px; color: white; text-align: center; }
        .btn { width: 100%; padding: 12px; margin: 10px 0; background: var(--gold); color: black; border: none; border-radius: 50px; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .btn:hover { transform: scale(1.05); box-shadow: 0 0 15px var(--gold); }
        
        #mainWorld { display: none; }
        .video-grid { display: none; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; }
        video { width: 100%; border-radius: 15px; border: 2px solid var(--gold); background: #000; }
        
        .chat-box { background: rgba(0,0,0,0.4); border-radius: 15px; height: 250px; overflow-y: auto; padding: 15px; margin-bottom: 10px; border: 1px solid #333; }
        .msg { margin-bottom: 8px; padding: 8px 12px; border-radius: 10px; font-size: 0.9em; }
        .msg.me { background: #1a2f4a; border-right: 3px solid var(--cyan); }
        .msg.other { background: #2a1f3a; border-left: 3px solid var(--gold); text-align: left; }
        .msg.system { color: gray; text-align: center; font-size: 0.8em; }

        .controls { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 15px; }
        .icon-btn { width: 50px; height: 50px; border-radius: 50%; border: 2px solid var(--gold); background: none; color: var(--gold); cursor: pointer; font-size: 1.2em; display: flex; align-items: center; justify-content: center; }
        .icon-btn.active { background: var(--gold); color: black; }
    </style>
</head>
<body>

<div id="entryScreen" class="glass-card">
    <div class="royal-header"><h1>👑 FADI GOLD</h1><p>اتصال آمن ومشفر</p></div>
    
    <div class="server-box">
        <div style="font-size: 0.8em; color: var(--gold);">ID الغرفة العالمي:</div>
        <div class="server-id" id="displayId">جاري التوليد...</div>
    </div>

    <input type="text" id="userName" class="input-field" placeholder="أدخل اسمك">
    <input type="text" id="targetId" class="input-field" placeholder="ID الشخص الآخر (اتركه فارغاً إذا كنت المضيف)">
    
    <button class="btn" onclick="startConnect()">🚀 دخول النظام</button>
</div>

<div id="mainWorld" class="glass-card" style="max-width: 800px;">
    <div class="royal-header"><h2 id="roomStatus">متصل كـ: ...</h2></div>
    
    <div class="video-grid" id="videoGrid">
        <video id="localVideo" autoplay muted playsinline></video>
        <video id="remoteVideo" autoplay playsinline></video>
    </div>

    <div class="controls">
        <button class="icon-btn" onclick="toggleVideo()" id="vidBtn">📹</button>
        <button class="icon-btn" onclick="toggleAudio()" id="audBtn">🎤</button>
        <button class="icon-btn" style="border-color: red; color: red;" onclick="location.reload()">🛑</button>
    </div>

    <div class="chat-box" id="chatBox"></div>
    <div style="display: flex; gap: 5px;">
        <input type="text" id="msgInput" class="input-field" style="margin:0;" placeholder="اكتب رسالة...">
        <button class="btn" style="width: 80px; margin:0;" onclick="sendChat()">إرسال</button>
    </div>
</div>

<script>
    let peer, conn, myStream;
    let myId = "";
    let name = "";

    async function startConnect() {
        name = document.getElementById('userName').value || "مجهول";
        const target = document.getElementById('targetId').value.trim();
        
        // جلب الـ ID المولد من السيرفر
        const res = await fetch('/api/server-info');
        const data = await res.json();
        myId = data.server_id + "-" + Math.floor(Math.random() * 999);

        peer = new Peer(myId, {
            config: {'iceServers': [{ urls: 'stun:stun.l.google.com:19302' }]}
        });

        peer.on('open', (id) => {
            document.getElementById('entryScreen').style.display = 'none';
            document.getElementById('mainWorld').style.display = 'block';
            document.getElementById('roomStatus').innerText = "هويتك: " + id;
            addMsg('system', 'تم فتح القناة بنجاح');
            
            if(target) {
                conn = peer.connect(target);
                setupConn();
            }
        });

        peer.on('connection', (c) => {
            conn = c;
            setupConn();
        });

        peer.on('call', async (call) => {
            if(confirm("مكالمة واردة، هل ترغب بالرد؟")) {
                myStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
                call.answer(myStream);
                handleStream(call);
            }
        });
    }

    function setupConn() {
        conn.on('open', () => {
            addMsg('system', 'متصل الآن مع الطرف الآخر');
            conn.on('data', (data) => addMsg('other', data));
        });
    }

    function sendChat() {
        const val = document.getElementById('msgInput').value;
        if(val && conn) {
            conn.send(name + ": " + val);
            addMsg('me', val);
            document.getElementById('msgInput').value = "";
        }
    }

    function addMsg(type, text) {
        const div = document.createElement('div');
        div.className = "msg " + type;
        div.innerText = text;
        const box = document.getElementById('chatBox');
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    }

    async function toggleVideo() {
        if(!myStream) {
            myStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
            document.getElementById('localVideo').srcObject = myStream;
            document.getElementById('videoGrid').style.display = 'grid';
            document.getElementById('vidBtn').classList.add('active');
            
            const target = document.getElementById('targetId').value;
            if(target || conn) {
                const call = peer.call(conn.peer, myStream);
                handleStream(call);
            }
        } else {
            location.reload(); // أسهل طريقة لإنهاء البث وتصفير الكاميرا
        }
    }

    function handleStream(call) {
        call.on('stream', (remoteStream) => {
            document.getElementById('videoGrid').style.display = 'grid';
            document.getElementById('remoteVideo').srcObject = remoteStream;
        });
    }

    // جلب الـ ID الأولي للعرض فقط
    fetch('/api/server-info').then(r => r.json()).then(d => {
        document.getElementById('displayId').innerText = d.server_id;
    });
</script>
</body>
</html>
'''

@app.route('/')
def index():
    return render_template_string(HTML_CODE)

@app.route('/api/server-info')
def server_info():
    return jsonify({'server_id': generate_server_id()})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
