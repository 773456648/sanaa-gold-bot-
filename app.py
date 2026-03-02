from flask import Flask, render_template_string, jsonify
import os
import socket
import requests
import random
import string

app = Flask(__name__)

def get_public_ip():
    try:
        return requests.get('https://api.ipify.org', timeout=5).text.strip()
    except:
        return socket.gethostbyname(socket.gethostname())

def generate_server_id():
    public_ip = get_public_ip().replace('.', '-')
    local_ip = socket.gethostbyname(socket.gethostname()).replace('.', '-')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"{public_ip}-{local_ip}-{random_str}"

HTML_CODE = '''
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>💎 GOLD CONNECT</title>
    <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial; }
        body { background: #0b0719; padding: 20px; color: white; }
        .container { background: #1a1f35; border: 2px solid gold; border-radius: 40px; padding: 30px; max-width: 500px; margin: auto; }
        h1 { text-align: center; color: gold; margin-bottom: 20px; }
        .server-box { background: #000; border: 2px solid cyan; border-radius: 20px; padding: 15px; margin: 15px 0; text-align: center; }
        .server-id { color: cyan; font-size: 1.2em; word-break: break-all; }
        .copy-btn { background: gold; color: black; border: none; padding: 10px 20px; border-radius: 30px; cursor: pointer; margin: 10px 0; width: 100%; }
        .tabs { display: flex; gap: 10px; margin: 20px 0; }
        .tab { flex: 1; padding: 15px; background: #333; border: 2px solid gold; border-radius: 30px; text-align: center; cursor: pointer; }
        .active { background: gold; color: black; }
        input { width: 100%; padding: 15px; margin: 10px 0; background: #333; border: 2px solid gold; border-radius: 30px; color: white; }
        .btn { width: 100%; padding: 15px; background: #1a1f35; border: 2px solid gold; color: gold; border-radius: 30px; font-weight: bold; cursor: pointer; }
        .chat { background: #222; height: 200px; overflow-y: auto; padding: 10px; border-radius: 20px; margin: 10px 0; }
        .msg { padding: 8px; margin: 5px; border-radius: 15px; max-width: 70%; }
        .me { background: #1a2f4a; align-self: flex-start; }
        .other { background: #2a1f3a; align-self: flex-end; }
    </style>
</head>
<body>
<div class="container">
    <h1>👑 GOLD CONNECT</h1>
    
    <!-- الرقم التسلسلي (يظهر للمشرف فقط) -->
    <div id="serverInfo" style="display: none;">
        <div class="server-box">
            <div style="color: gold; margin-bottom: 10px;">🔒 ID</div>
            <div class="server-id" id="serverIdDisplay">...</div>
            <button class="copy-btn" onclick="copyServerId()">📋 نسخ الـ ID</button>
        </div>
    </div>
    
    <!-- اختيار نوع الدخول -->
    <div class="tabs">
        <div class="tab active" onclick="selectTab('local')" id="tabLocal">🏅 محلي</div>
        <div class="tab" onclick="selectTab('remote')" id="tabRemote">🎯 عن بعد</div>
    </div>
    
    <!-- دخول محلي -->
    <div id="localDiv">
        <input type="text" id="localName" placeholder="اسمك">
        <input type="text" id="localRoom" placeholder="رقم الغرفة">
        <button class="btn" onclick="enterLocal()">👤 دخول</button>
    </div>
    
    <!-- دخول عن بعد -->
    <div id="remoteDiv" style="display: none;">
        <input type="text" id="remoteName" placeholder="اسمك">
        <input type="text" id="remoteServerId" placeholder="الرقم التسلسلي">
        <input type="text" id="remoteRoom" placeholder="رقم الغرفة">
        <button class="btn" onclick="enterRemote()">🌍 دخول</button>
    </div>
    
    <!-- منطقة الدردشة -->
    <div id="chatArea" style="display: none; margin-top: 20px;">
        <div class="chat" id="messages"></div>
        <div style="display: flex; gap: 10px;">
            <input type="text" id="msgInput" placeholder="رسالة..." style="flex: 1;">
            <button class="btn" style="width: 100px;" onclick="sendMsg()">إرسال</button>
        </div>
    </div>
</div>

<script>
    let peer, myName, myRoom, myId, conn, isHost = false;
    let serverId = '';

    // جلب الرقم التسلسلي من السيرفر
    async function fetchServerId() {
        try {
            const res = await fetch('/api/server-info');
            const data = await res.json();
            serverId = data.server_id;
            document.getElementById('serverIdDisplay').innerText = serverId;
            document.getElementById('serverInfo').style.display = 'block';
        } catch(e) {}
    }
    fetchServerId();

    function copyServerId() {
        navigator.clipboard.writeText(serverId);
        alert('✅ تم النسخ');
    }

    function selectTab(type) {
        if(type === 'local') {
            document.getElementById('tabLocal').classList.add('active');
            document.getElementById('tabRemote').classList.remove('active');
            document.getElementById('localDiv').style.display = 'block';
            document.getElementById('remoteDiv').style.display = 'none';
        } else {
            document.getElementById('tabRemote').classList.add('active');
            document.getElementById('tabLocal').classList.remove('active');
            document.getElementById('localDiv').style.display = 'none';
            document.getElementById('remoteDiv').style.display = 'block';
        }
    }

    function enterLocal() {
        myName = document.getElementById('localName').value.trim();
        myRoom = document.getElementById('localRoom').value.trim();
        if(!myName || !myRoom) return alert('اكتب البيانات');
        
        // محاولة استضافة الغرفة
        peer = new Peer(myRoom);
        peer.on('open', (id) => {
            isHost = true;
            myId = id;
            startChat();
        });
        peer.on('error', () => joinRoom()); // لو الغرفة موجودة، انضم
        peer.on('connection', (c) => { conn = c; setupConn(); });
    }

    function joinRoom() {
        peer = new Peer();
        peer.on('open', (id) => {
            myId = id;
            conn = peer.connect(myRoom);
            setupConn();
            startChat();
        });
    }

    function enterRemote() {
        myName = document.getElementById('remoteName').value.trim();
        let remoteId = document.getElementById('remoteServerId').value.trim();
        myRoom = document.getElementById('remoteRoom').value.trim();
        if(!myName || !remoteId || !myRoom) return alert('اكتب البيانات');
        
        let targetId = remoteId + '-' + myRoom;
        peer = new Peer();
        peer.on('open', (id) => {
            myId = id;
            conn = peer.connect(targetId);
            setupConn();
            startChat();
        });
    }

    function setupConn() {
        conn.on('open', () => {
            conn.send({type: 'join', user: myName});
        });
        conn.on('data', (data) => {
            if(data.type === 'msg') addMessage('other', data.user + ': ' + data.text);
            if(data.type === 'join') addMessage('other', '🌟 ' + data.user + ' دخل');
        });
    }

    function startChat() {
        document.querySelector('.container').style.display = 'none';
        document.getElementById('chatArea').style.display = 'block';
    }

    function sendMsg() {
        let txt = document.getElementById('msgInput').value.trim();
        if(!txt || !conn) return;
        conn.send({type: 'msg', user: myName, text: txt});
        addMessage('me', txt);
        document.getElementById('msgInput').value = '';
    }

    function addMessage(type, text) {
        let d = document.createElement('div');
        d.className = 'msg ' + type;
        d.innerText = text;
        document.getElementById('messages').appendChild(d);
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
