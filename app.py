from flask import Flask, render_template_string, request, jsonify
import os
import socket
import requests
import random
import string

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fadi-gold-secret-key')

def get_public_ip():
    try:
        # أضفنا timeout عشان ما يعلق السيرفر لو النت ثقيل
        response = requests.get('https://api.ipify.org', timeout=5)
        return response.text.strip()
    except:
        return socket.gethostbyname(socket.gethostname())

def generate_server_id():
    public_ip = get_public_ip()
    # تصحيح: PeerJS ما يقبل النقاط في الـ ID، حولناها لشرطات
    clean_ip = public_ip.replace('.', '-')
    local_ip = socket.gethostbyname(socket.gethostname()).replace('.', '-')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"{clean_ip}-{local_ip}-{random_str}"

# كود الـ HTML حقك "الأسطوري" كامل بدون نقص
HTML_CODE = '''
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>💎 FADI GOLD CONNECT</title>
    <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, sans-serif; }
        body { background: linear-gradient(135deg, #0b0719, #1a0f2e); min-height: 100vh; padding: 20px; color: white; }
        .glass-card { background: rgba(20, 15, 40, 0.85); backdrop-filter: blur(10px); border: 2px solid gold; border-radius: 40px; padding: 30px; max-width: 600px; margin: 20px auto; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .royal-header { text-align: center; margin-bottom: 30px; }
        .royal-header h1 { font-size: 2.5em; background: linear-gradient(135deg, gold, orange); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .server-info { background: linear-gradient(145deg, #1a1f35, #0f1220); border: 2px solid gold; border-radius: 30px; padding: 20px; margin: 20px 0; text-align: center; border-right: 5px solid cyan; }
        .server-id-box { background: #000; border: 2px solid cyan; border-radius: 20px; padding: 15px; margin: 10px 0; direction: ltr; }
        .server-id-text { color: cyan; font-size: 1.2em; font-weight: bold; letter-spacing: 1px; word-break: break-all; }
        .copy-btn { background: transparent; border: 2px solid gold; color: gold; padding: 10px 30px; border-radius: 60px; margin: 10px 0; cursor: pointer; transition: 0.3s; }
        .tabs { display: flex; gap: 10px; margin: 20px 0; }
        .tab { flex: 1; padding: 15px; background: rgba(0,0,0,0.5); border: 2px solid gold; border-radius: 60px; text-align: center; cursor: pointer; }
        .tab.active { background: gold; color: black; }
        .input-field { width: 100%; padding: 15px 20px; margin: 10px 0; background: rgba(0,0,0,0.7); border: 2px solid gold; border-radius: 60px; color: white; }
        .btn { width: 100%; padding: 15px; background: linear-gradient(145deg, #1a1f35, #0f1220); border: 2px solid gold; color: gold; border-radius: 60px; font-weight: bold; cursor: pointer; }
        .toolbar { display: flex; justify-content: center; gap: 10px; margin: 20px 0; flex-wrap: wrap; }
        .tool { width: 65px; height: 65px; border-radius: 50%; background: #1a1f35; border: 3px solid gold; color: gold; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .video-area { display: none; grid-template-columns: 2fr 1fr; gap: 15px; margin: 20px 0; background: rgba(0,0,0,0.8); border-radius: 30px; padding: 20px; border: 2px solid gold; }
        video { width: 100%; height: 100%; object-fit: cover; border-radius: 20px; }
        .chat-area { background: rgba(0,0,0,0.5); border: 2px solid gold; border-radius: 30px; padding: 20px; height: 300px; overflow-y: auto; margin: 20px 0; display: flex; flex-direction: column; }
        .message { padding: 10px 15px; margin: 5px 0; border-radius: 20px; max-width: 80%; }
        .message.me { background: #1a2f4a; align-self: flex-start; }
        .message.other { background: #2a1f3a; align-self: flex-end; }
        .send-area { display: flex; gap: 10px; }
        .send-input { flex: 1; padding: 15px; background: rgba(0,0,0,0.5); border: 2px solid gold; border-radius: 60px; color: white; }
        .notification { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #1a1f35; border: 2px solid gold; padding: 15px; color: gold; border-radius: 60px; z-index: 9999; }
    </style>
</head>
<body>
<div id="entryScreen" class="glass-card">
    <div class="royal-header"><h1>👑 FADI GOLD</h1></div>
    <div id="serverInfoSection" style="display: none;">
        <div class="server-info">
            <div class="server-id-box"><div class="server-id-text" id="serverIdDisplay">...</div></div>
            <button class="copy-btn" onclick="copyServerId()">📋 نسخ الـ ID</button>
        </div>
    </div>
    <div class="tabs">
        <div class="tab active" onclick="selectTab('local')" id="tabLocal">🏠 محلي</div>
        <div class="tab" onclick="selectTab('remote')" id="tabRemote">🌍 عن بعد</div>
    </div>
    <div id="localForm">
        <input type="text" class="input-field" id="localName" placeholder="اسمك">
        <input type="text" class="input-field" id="localRoom" placeholder="رقم الغرفة">
        <button class="btn" onclick="enterLocal()">🚀 دخول</button>
    </div>
    <div id="remoteForm" style="display: none;">
        <input type="text" class="input-field" id="remoteName" placeholder="اسمك">
        <input type="text" class="input-field" id="remoteServerId" placeholder="الرقم التسلسلي">
        <input type="text" class="input-field" id="remoteRoom" placeholder="رقم الغرفة">
        <button class="btn" onclick="enterRemote()">🌍 دخول عالمي</button>
    </div>
</div>

<div id="mainWorld" style="display: none;">
    <div class="glass-card" style="max-width: 100%;">
        <h1 id="roomTitle">FADI GOLD</h1>
        <div class="toolbar">
            <div class="tool" onclick="startVideoCall()">📹</div>
            <div class="tool" onclick="startAudioCall()">🎤</div>
            <div class="tool" onclick="shareScreen()">🖥️</div>
            <div class="tool" onclick="location.reload()" style="color:red;">🛑</div>
        </div>
        <div class="video-area" id="videoContainer">
            <video id="remoteVideo" autoplay playsinline></video>
            <video id="localVideo" autoplay muted playsinline></video>
        </div>
        <div class="chat-area" id="chatContainer"></div>
        <div class="send-area">
            <input type="text" class="send-input" id="messageInput" placeholder="اكتب هنا...">
            <button class="btn" style="width:100px;" onclick="sendMessage()">إرسال</button>
        </div>
    </div>
</div>

<script>
    let peer, myName, myRoom, myId, conn, myStream;
    let serverId = '';

    async function fetchServerInfo() {
        const res = await fetch('/api/server-info');
        const data = await res.json();
        serverId = data.server_id;
        document.getElementById('serverIdDisplay').innerText = serverId;
        document.getElementById('serverInfoSection').style.display = 'block';
    }
    fetchServerInfo();

    function selectTab(t) {
        document.getElementById('localForm').style.display = t==='local'?'block':'none';
        document.getElementById('remoteForm').style.display = t==='remote'?'block':'none';
        document.getElementById('tabLocal').className = t==='local'?'tab active':'tab';
        document.getElementById('tabRemote').className = t==='remote'?'tab active':'tab';
    }

    function enterLocal() {
        myName = document.getElementById('localName').value;
        myRoom = document.getElementById('localRoom').value;
        initPeer(myRoom);
    }

    function enterRemote() {
        myName = document.getElementById('remoteName').value;
        let rSrv = document.getElementById('remoteServerId').value;
        myRoom = document.getElementById('remoteRoom').value;
        initPeer(null, rSrv + "-" + myRoom);
    }

    function initPeer(id, target = null) {
        peer = new Peer(id, { config: {'iceServers': [{ urls: 'stun:stun.l.google.com:19302' }]}});
        peer.on('open', (i) => {
            myId = i;
            document.getElementById('entryScreen').style.display = 'none';
            document.getElementById('mainWorld').style.display = 'block';
            if(target) {
                conn = peer.connect(target);
                setupConn();
            }
        });
        peer.on('connection', (c) => { conn = c; setupConn(); });
        peer.on('call', (call) => {
            if(confirm("مكالمة واردة، رد؟")) {
                navigator.mediaDevices.getUserMedia({video:true, audio:true}).then(s => {
                    myStream = s;
                    call.answer(s);
                    document.getElementById('videoContainer').style.display = 'grid';
                    document.getElementById('localVideo').srcObject = s;
                    call.on('stream', rs => document.getElementById('remoteVideo').srcObject = rs);
                });
            }
        });
    }

    function setupConn() {
        conn.on('data', d => addMsg('other', d.user + ": " + d.text));
    }

    function sendMessage() {
        let txt = document.getElementById('messageInput').value;
        if(conn) conn.send({user: myName, text: txt});
        addMsg('me', txt);
        document.getElementById('messageInput').value = '';
    }

    function addMsg(type, text) {
        let d = document.createElement('div');
        d.className = 'message ' + type;
        d.innerText = text;
        document.getElementById('chatContainer').appendChild(d);
    }

    async function startVideoCall() {
        myStream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
        document.getElementById('videoContainer').style.display = 'grid';
        document.getElementById('localVideo').srcObject = myStream;
        let call = peer.call(conn.peer, myStream);
        call.on('stream', rs => document.getElementById('remoteVideo').srcObject = rs);
    }
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
