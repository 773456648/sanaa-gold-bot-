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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>💎 GOLD CONNECT</title>
    <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, sans-serif; }
        body { background: linear-gradient(135deg, #0b0719, #1a0f2e); min-height: 100vh; padding: 20px; color: white; }
        .glass-card { background: rgba(20, 15, 40, 0.85); backdrop-filter: blur(10px); border: 2px solid gold; border-radius: 40px; padding: 30px; max-width: 600px; margin: 20px auto; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .royal-header { text-align: center; margin-bottom: 30px; }
        .royal-header h1 { font-size: 2.5em; background: linear-gradient(135deg, gold, orange); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .crown-icon { font-size: 2.5em; animation: float 3s infinite; display: inline-block; }
        @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
        
        .server-info { background: linear-gradient(145deg, #1a1f35, #0f1220); border: 2px solid gold; border-radius: 30px; padding: 20px; margin: 20px 0; text-align: center; border-right: 5px solid cyan; }
        .server-id-box { background: #000; border: 2px solid cyan; border-radius: 20px; padding: 15px; margin: 10px 0; direction: ltr; }
        .server-id-text { color: cyan; font-size: 1.2em; font-weight: bold; letter-spacing: 1px; word-break: break-all; }
        .copy-btn { background: transparent; border: 2px solid gold; color: gold; padding: 10px 30px; border-radius: 60px; margin: 10px 0; cursor: pointer; font-size: 1.1em; transition: 0.3s; }
        .copy-btn:hover { background: gold; color: black; }
        
        .tabs { display: flex; gap: 10px; margin: 20px 0; }
        .tab { flex: 1; padding: 15px; background: rgba(0,0,0,0.5); border: 2px solid gold; border-radius: 60px; text-align: center; cursor: pointer; transition: 0.3s; font-weight: bold; }
        .tab.active { background: gold; color: black; border-color: cyan; }
        .tab:hover { background: rgba(255,215,0,0.3); }
        
        .input-field { width: 100%; padding: 15px 20px; margin: 10px 0; background: rgba(0,0,0,0.7); border: 2px solid gold; border-radius: 60px; color: white; font-size: 1.1em; }
        .input-field:focus { outline: none; border-color: cyan; box-shadow: 0 0 30px cyan; }
        
        .btn { width: 100%; padding: 15px; margin: 10px 0; background: linear-gradient(145deg, #1a1f35, #0f1220); border: 2px solid gold; color: gold; border-radius: 60px; font-size: 1.2em; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .btn:hover { transform: scale(1.02); box-shadow: 0 0 30px gold; }
        
        .toolbar { display: flex; justify-content: center; gap: 10px; margin: 20px 0; flex-wrap: wrap; }
        .tool { width: 65px; height: 65px; border-radius: 50%; background: #1a1f35; border: 3px solid gold; color: gold; font-size: 1.8em; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
        .tool:hover { transform: scale(1.1); border-color: cyan; color: cyan; }
        
        .video-area { display: none; grid-template-columns: 2fr 1fr; gap: 15px; margin: 20px 0; background: rgba(0,0,0,0.8); border-radius: 30px; padding: 20px; border: 2px solid gold; }
        .remote-vid, .local-vid { background: #000; border-radius: 20px; overflow: hidden; border: 2px solid gold; }
        .remote-vid video, .local-vid video { width: 100%; height: 100%; object-fit: cover; }
        .remote-vid { height: 300px; }
        .local-vid { height: 150px; }
        
        .audio-area { display: none; text-align: center; padding: 40px; background: #1a1f35; border-radius: 40px; margin: 20px 0; border: 2px solid cyan; }
        .audio-wave { font-size: 3em; animation: wave 1.5s infinite; }
        @keyframes wave { 0%,100%{opacity:0.5;} 50%{opacity:1;transform:scale(1.1);} }
        
        .chat-area { background: rgba(0,0,0,0.5); border: 2px solid gold; border-radius: 30px; padding: 20px; height: 300px; overflow-y: auto; margin: 20px 0; display: flex; flex-direction: column; }
        .message { padding: 10px 15px; margin: 10px 0; border-radius: 20px; max-width: 80%; animation: msgIn 0.3s; }
        .message.me { background: #1a2f4a; border-right: 5px solid cyan; align-self: flex-start; }
        .message.other { background: #2a1f3a; border-left: 5px solid gold; align-self: flex-end; }
        .message.system { background: rgba(255,215,0,0.1); border: 1px dashed gold; color: gold; text-align: center; max-width: 100%; }
        
        .send-area { display: flex; gap: 10px; margin: 10px 0; }
        .send-input { flex: 1; padding: 15px 20px; background: rgba(0,0,0,0.5); border: 2px solid gold; border-radius: 60px; color: white; }
        .send-btn { padding: 15px 30px; background: #1a1f35; border: 2px solid gold; color: gold; border-radius: 60px; cursor: pointer; }
        
        .members-panel { background: rgba(0,0,0,0.5); border: 2px solid cyan; border-radius: 30px; padding: 15px; margin: 20px 0; display: none; }
        .member-item { display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid gold; }
        
        .status-bar { display: flex; justify-content: center; gap: 10px; margin: 15px 0; flex-wrap: wrap; }
        .status-item { background: rgba(0,0,0,0.5); border: 1px solid gold; border-radius: 50px; padding: 8px 15px; display: flex; align-items: center; gap: 5px; }
        .online-dot { width: 10px; height: 10px; background: #00ff88; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
        
        .notification { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #1a1f35; border: 2px solid gold; border-radius: 60px; padding: 15px 30px; color: gold; z-index: 9999; animation: slideDown 0.5s; box-shadow: 0 0 50px gold; }
        @keyframes slideDown { 0%{top:-100px;} 100%{top:20px;} }
        
        .info-text { color: #aaa; font-size: 0.9em; margin-top: 5px; }
        .badge { background: cyan; color: black; padding: 2px 8px; border-radius: 60px; font-size: 0.8em; margin-right: 5px; }
    </style>
</head>
<body>
<div id="entryScreen" class="glass-card">
    <div class="royal-header">
        <div class="crown-icon">👑</div>
        <h1>GOLD CONNECT</h1>
        <div style="color: cyan; margin: 10px 0;">نظام الاتصال الذكي</div>
    </div>
    
    <div id="serverInfoSection" style="display: none;">
        <div class="server-info">
            <div style="color: gold; margin-bottom: 15px; font-size: 1.2em;">🔐 الرقم التسلسلي للغرفة</div>
            <div class="server-id-box">
                <div class="server-id-text" id="serverIdDisplay">جاري التحميل...</div>
            </div>
            <button class="copy-btn" onclick="copyServerId()">📋 نسخ الرقم التسلسلي</button>
            <div class="info-text">أرسل هذا الرقم للأعضاء خارج الشبكة</div>
        </div>
    </div>
    
    <div class="tabs">
        <div class="tab active" onclick="selectTab('local')" id="tabLocal">🏠 دخول محلي</div>
        <div class="tab" onclick="selectTab('remote')" id="tabRemote">🌍 دخول عن بعد</div>
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
        <button class="btn" onclick="enterRemote()">🌍 دخول</button>
    </div>
</div>

<div id="mainWorld" style="display: none;">
    <div class="glass-card" style="max-width: 100%;">
        <div class="royal-header">
            <h1 id="roomTitle">GOLD CONNECT</h1>
        </div>

        <div class="toolbar">
            <div class="tool" onclick="startVideoCall()" title="فيديو">📹</div>
            <div class="tool" onclick="startAudioCall()" title="صوت">🎤</div>
            <div class="tool" onclick="shareScreen()" title="شاشة">🖥️</div>
            <div class="tool" onclick="toggleMembers()" title="الأعضاء">👥</div>
            <div class="tool" onclick="endAllCalls()" id="endCallBtn" style="display: none; color: red;">🛑</div>
        </div>

        <div class="video-area" id="videoContainer">
            <div class="remote-vid"><video id="remoteVideo" autoplay playsinline></video></div>
            <div class="local-vid"><video id="localVideo" autoplay muted playsinline></video></div>
        </div>

        <div class="audio-area" id="audioContainer">
            <div class="audio-wave">🎤 🔊 🎵</div>
            <h3 style="color: cyan;">مكالمة صوتية</h3>
        </div>

        <div class="members-panel" id="membersPanel">
            <div id="membersList"></div>
        </div>

        <div class="chat-area" id="chatContainer"></div>

        <div class="send-area">
            <input type="text" class="send-input" id="messageInput" placeholder="اكتب رسالتك..." onkeypress="if(event.key==='Enter') sendMessage()">
            <button class="send-btn" onclick="sendMessage()">إرسال</button>
        </div>
    </div>
</div>

<audio id="remoteAudio" autoplay></audio>

<script>
    let peer, myName, myRoom, myId, connections = [], members = [], calls = [], myStream;
    let isHost = false, msgCount = 0, isAudioOnly = false, isVideoActive = false, connectionMode = 'local', serverId = '';

    const chatContainer = document.getElementById('chatContainer');
    const videoContainer = document.getElementById('videoContainer');
    const audioContainer = document.getElementById('audioContainer');
    const remoteVideo = document.getElementById('remoteVideo');
    const localVideo = document.getElementById('localVideo');
    const remoteAudio = document.getElementById('remoteAudio');
    const endCallBtn = document.getElementById('endCallBtn');

    async function fetchServerInfo() {
        try {
            const response = await fetch('/api/server-info');
            const data = await response.json();
            serverId = data.server_id;
            document.getElementById('serverIdDisplay').innerText = serverId;
            document.getElementById('serverInfoSection').style.display = 'block';
        } catch (err) {}
    }
    fetchServerInfo();

    function copyServerId() {
        navigator.clipboard.writeText(serverId).then(() => showNotification('📋 تم النسخ'));
    }

    function showNotification(text) {
        let notif = document.createElement('div');
        notif.className = 'notification';
        notif.innerText = text;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }

    function selectTab(tab) {
        if (tab === 'local') {
            document.getElementById('tabLocal').classList.add('active');
            document.getElementById('tabRemote').classList.remove('active');
            document.getElementById('localForm').style.display = 'block';
            document.getElementById('remoteForm').style.display = 'none';
        } else {
            document.getElementById('tabRemote').classList.add('active');
            document.getElementById('tabLocal').classList.remove('active');
            document.getElementById('localForm').style.display = 'none';
            document.getElementById('remoteForm').style.display = 'block';
        }
    }

    function enterLocal() {
        myName = document.getElementById('localName').value.trim();
        myRoom = document.getElementById('localRoom').value.trim();
        if (!myName || !myRoom) return showNotification('❌ اكتب البيانات');
        connectionMode = 'local';
        document.getElementById('entryScreen').style.display = 'none';
        document.getElementById('mainWorld').style.display = 'block';
        initPeer();
    }

    function enterRemote() {
        myName = document.getElementById('remoteName').value.trim();
        let remoteId = document.getElementById('remoteServerId').value.trim();
        myRoom = document.getElementById('remoteRoom').value.trim();
        if (!myName || !remoteId || !myRoom) return showNotification('❌ اكتب البيانات');
        connectionMode = 'remote';
        document.getElementById('entryScreen').style.display = 'none';
        document.getElementById('mainWorld').style.display = 'block';
        connectToRemote(remoteId);
    }

    function initPeer() {
        peer = new Peer(myRoom, { config: {'iceServers': [{ urls: 'stun:stun.l.google.com:19302' }]}});
        peer.on('open', (id) => { isHost = true; myId = id; showNotification('👑 أنت المضيف'); });
        peer.on('connection', (conn) => { connections.push(conn); setupConnection(conn); });
        peer.on('call', (call) => handleIncomingCall(call));
        peer.on('error', () => joinRoom());
    }

    function joinRoom() {
        peer = new Peer({ config: {'iceServers': [{ urls: 'stun:stun.l.google.com:19302' }]}});
        peer.on('open', (id) => { myId = id; connections.push(peer.connect(myRoom)); });
        peer.on('call', (call) => handleIncomingCall(call));
    }

    function connectToRemote(remoteId) {
        let target = remoteId + '-' + myRoom;
        peer = new Peer({ config: {'iceServers': [{ urls: 'stun:stun.l.google.com:19302' }]}});
        peer.on('open', (id) => { myId = id; connections.push(peer.connect(target)); });
        peer.on('call', (call) => handleIncomingCall(call));
    }

    function setupConnection(conn) {
        conn.on('open', () => conn.send({type: 'join', user: myName, id: myId, mode: connectionMode}));
        conn.on('data', (data) => {
            if (data.type === 'join') {
                members.push(data);
                addMessage('system', `🌟 ${data.user} دخل`);
            } else if (data.type === 'msg') {
                addMessage('other', data.user + ': ' + data.text);
            }
        });
    }

    function sendMessage() {
        let txt = document.getElementById('messageInput').value.trim();
        if (!txt) return;
        addMessage('me', myName + ': ' + txt);
        connections.forEach(c => { if(c.open) c.send({type: 'msg', user: myName, text: txt}); });
        document.getElementById('messageInput').value = '';
    }

    function addMessage(type, text) {
        let div = document.createElement('div');
        div.className = 'message ' + type;
        div.innerText = text;
        chatContainer.appendChild(div);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function toggleMembers() {
        let list = '<div class="member-item"><div>👑 ' + myName + ' (أنت)</div><div class="online-dot"></div></div>';
        members.forEach(m => list += '<div class="member-item"><div>👤 ' + m.user + '</div><div class="online-dot"></div></div>');
        document.getElementById('membersList').innerHTML = list;
        document.getElementById('membersPanel').style.display = document.getElementById('membersPanel').style.display === 'none' ? 'block' : 'none';
    }

    async function startVideoCall() {
        try {
            myStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
            isVideoActive = true;
            videoContainer.style.display = 'grid';
            localVideo.srcObject = myStream;
            connections.forEach(c => { if(c.open) setupCall(peer.call(c.peer, myStream), true); });
            endCallBtn.style.display = 'flex';
        } catch(err) { showNotification('❌ فشل تشغيل الكاميرا'); }
    }

    async function startAudioCall() {
        try {
            myStream = await navigator.mediaDevices.getUserMedia({video: false, audio: true});
            isAudioOnly = true;
            audioContainer.style.display = 'block';
            connections.forEach(c => { if(c.open) setupCall(peer.call(c.peer, myStream), false); });
            endCallBtn.style.display = 'flex';
        } catch(err) { showNotification('❌ فشل تشغيل الميكروفون'); }
    }

    function handleIncomingCall(call) {
        if (confirm('📞 مكالمة واردة. رد؟')) {
            navigator.mediaDevices.getUserMedia({audio: true, video: true}).then(stream => {
                myStream = stream;
                call.answer(stream);
                videoContainer.style.display = 'grid';
                localVideo.srcObject = stream;
                setupCall(call, true);
                endCallBtn.style.display = 'flex';
            });
        } else call.close();
    }

    function setupCall(call, hasVideo) {
        calls.push(call);
        call.on('stream', (remoteStream) => {
            if (hasVideo) remoteVideo.srcObject = remoteStream;
            else remoteAudio.srcObject = remoteStream;
        });
    }

    function endAllCalls() {
        calls.forEach(c => { if(c.open) c.close(); });
        calls = [];
        if(myStream) myStream.getTracks().forEach(t => t.stop());
        videoContainer.style.display = 'none';
        audioContainer.style.display = 'none';
        endCallBtn.style.display = 'none';
        isVideoActive = false; isAudioOnly = false;
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
