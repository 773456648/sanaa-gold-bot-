# ========== FADI GOLD ULTIMATE (فيديو + صوت + دردشة) ==========
from flask import Flask, render_template_string, request
from flask_socketio import SocketIO, emit, join_room
import os
import eventlet
eventlet.monkey_patch()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'fadi-gold-ultimate-secret'
socketio = SocketIO(app, cors_allowed_origins="*", ping_timeout=60, ping_interval=25)

rooms = {}

@app.route('/')
def index():
    return render_template_string(HTML_CODE)

@socketio.on('join-room')
def handle_join(data):
    name = data['name']
    room = data['room']
    join_room(room)
    if room not in rooms:
        rooms[room] = []
    rooms[room].append({'id': request.sid, 'name': name})
    emit('room-members', rooms[room], to=room)
    emit('system-message', f'🔔 {name} دخل الغرفة', to=room, include_self=False)

@socketio.on('send-message')
def handle_message(data):
    room = data['room']
    text = data['text']
    sender_name = 'شخص'
    if room in rooms:
        for member in rooms[room]:
            if member['id'] == request.sid:
                sender_name = member['name']
                break
    emit('new-message', {
        'name': sender_name,
        'text': text,
        'time': __import__('datetime').datetime.now().strftime('%I:%M %p')
    }, to=room)

@socketio.on('disconnect')
def handle_disconnect():
    for room_name, members in rooms.items():
        for member in members[:]:
            if member['id'] == request.sid:
                members.remove(member)
                emit('system-message', f'🔴 {member["name"]} خرج من الغرفة', to=room_name)
                emit('room-members', members, to=room_name)
                if len(members) == 0:
                    del rooms[room_name]
                return

HTML_CODE = '''
<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>👑 FADI GOLD ULTIMATE</title>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', sans-serif;
        }
        body {
            background: linear-gradient(135deg, #0a0a1f, #1a1a3a);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 15px;
        }
        .login-container {
            background: rgba(20, 15, 45, 0.95);
            backdrop-filter: blur(10px);
            border: 3px solid gold;
            border-radius: 50px;
            padding: 40px;
            width: 100%;
            max-width: 500px;
            box-shadow: 0 0 70px rgba(255, 215, 0, 0.5);
        }
        .crown {
            text-align: center;
            font-size: 5em;
            animation: float 3s ease-in-out infinite;
            filter: drop-shadow(0 0 20px gold);
        }
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
        }
        h1 {
            text-align: center;
            font-size: 2.5em;
            background: linear-gradient(135deg, #ffd700, #ffaa00);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        .subtitle {
            text-align: center;
            color: cyan;
            margin-bottom: 30px;
        }
        .input-field {
            width: 100%;
            padding: 18px 25px;
            margin: 15px 0;
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid gold;
            border-radius: 60px;
            color: white;
            font-size: 1.1em;
        }
        .gold-btn {
            width: 100%;
            padding: 18px;
            margin: 15px 0;
            background: linear-gradient(145deg, gold, #ffaa00);
            border: none;
            border-radius: 60px;
            color: #0a0a1f;
            font-size: 1.3em;
            font-weight: bold;
            cursor: pointer;
        }
        .gold-btn:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 50px gold;
        }
        .chat-container {
            background: rgba(20, 15, 45, 0.95);
            backdrop-filter: blur(10px);
            border: 3px solid gold;
            border-radius: 50px;
            padding: 25px;
            width: 100%;
            max-width: 1200px;
            display: none;
        }
        .status-bar {
            display: flex;
            justify-content: space-between;
            background: rgba(0, 0, 0, 0.3);
            padding: 15px 25px;
            border-radius: 60px;
            margin-bottom: 20px;
            border: 1px solid gold;
        }
        .online-indicator {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .dot {
            width: 12px;
            height: 12px;
            background: #00ff88;
            border-radius: 50%;
            box-shadow: 0 0 20px #00ff88;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .video-area {
            display: none;
            grid-template-columns: 2fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 40px;
            padding: 15px;
            border: 2px solid gold;
        }
        .remote-video, .local-video {
            background: black;
            border-radius: 20px;
            overflow: hidden;
            aspect-ratio: 16/9;
        }
        .remote-video {
            border: 3px solid gold;
        }
        .local-video {
            border: 2px solid cyan;
        }
        video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .call-toolbar {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        .call-btn {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: linear-gradient(145deg, #1a1f35, #0f1220);
            border: 3px solid gold;
            color: gold;
            font-size: 2em;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: 0.3s;
        }
        .call-btn:hover {
            transform: scale(1.15);
            border-color: cyan;
            color: cyan;
        }
        .call-btn.danger {
            border-color: red;
            color: red;
        }
        .chat-layout {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 20px;
            margin-top: 20px;
        }
        .messages-area {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 30px;
            padding: 20px;
            height: 300px;
            overflow-y: auto;
        }
        .message {
            padding: 12px 18px;
            margin: 10px 0;
            border-radius: 25px;
            max-width: 80%;
        }
        .message.me {
            background: #1f3a5f;
            border-right: 5px solid cyan;
            margin-left: auto;
        }
        .message.other {
            background: #2f1f4a;
            border-left: 5px solid gold;
        }
        .message.system {
            background: rgba(255,215,0,0.1);
            border: 1px dashed gold;
            color: gold;
            text-align: center;
            max-width: 100%;
        }
        .members-panel {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 30px;
            padding: 20px;
        }
        .members-panel h3 {
            color: gold;
            margin-bottom: 15px;
            text-align: center;
        }
        .member-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px;
            border-bottom: 1px solid rgba(255,215,0,0.2);
        }
        .send-area {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        .message-input {
            flex: 1;
            padding: 15px 20px;
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid gold;
            border-radius: 60px;
            color: white;
        }
        .send-btn {
            padding: 15px 30px;
            background: linear-gradient(145deg, #1a1f35, #0f1220);
            border: 2px solid gold;
            border-radius: 60px;
            color: gold;
            font-weight: bold;
            cursor: pointer;
        }
        .send-btn:hover {
            background: gold;
            color: black;
        }
    </style>
</head>
<body>
    <div class="login-container" id="loginScreen">
        <div class="crown">👑</div>
        <h1>FADI GOLD</h1>
        <div class="subtitle">فيديو + صوت + دردشة</div>
        <input type="text" class="input-field" id="nameInput" placeholder="اسمك" value="فادي">
        <input type="text" class="input-field" id="roomInput" placeholder="رقم الغرفة" value="123">
        <button class="gold-btn" onclick="joinRoom()">🚀 دخول الغرفة</button>
    </div>
    
    <div class="chat-container" id="chatScreen">
        <div class="status-bar">
            <div class="online-indicator">
                <span class="dot"></span>
                <span id="memberCount">1</span> متصل
            </div>
            <div class="room-info">الغرفة: <span id="roomDisplay"></span></div>
            <div>👤 <span id="myNameDisplay"></span></div>
        </div>
        
        <div class="video-area" id="videoArea">
            <div class="remote-video"><video id="remoteVideo" autoplay playsinline></video></div>
            <div class="local-video"><video id="localVideo" autoplay muted playsinline></video></div>
        </div>
        
        <div class="call-toolbar">
            <div class="call-btn" onclick="startVideoCall()" title="مكالمة فيديو">📹</div>
            <div class="call-btn" onclick="startAudioCall()" title="مكالمة صوتية">🎤</div>
            <div class="call-btn danger" onclick="endCall()" title="إنهاء المكالمة" id="endCallBtn" style="display:none;">🛑</div>
        </div>
        
        <div class="chat-layout">
            <div class="messages-area" id="messagesArea">
                <div class="message system">✨ مرحباً بك</div>
            </div>
            <div class="members-panel">
                <h3>👥 الأعضاء</h3>
                <div id="membersList"></div>
            </div>
        </div>
        
        <div class="send-area">
            <input type="text" class="message-input" id="messageInput" placeholder="اكتب رسالتك..." onkeypress="if(event.key==='Enter') sendMessage()">
            <button class="send-btn" onclick="sendMessage()">إرسال</button>
        </div>
    </div>
    
    <audio id="remoteAudio" autoplay></audio>
    
    <script>
        const socket = io();
        let myName = '', myRoom = '', peer = null, currentCall = null, myStream = null;
        let members = [];
        
        function joinRoom() {
            myName = document.getElementById('nameInput').value.trim();
            myRoom = document.getElementById('roomInput').value.trim();
            if (!myName || !myRoom) return alert('أدخل اسمك ورقم الغرفة');
            
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('chatScreen').style.display = 'block';
            document.getElementById('roomDisplay').innerText = myRoom;
            document.getElementById('myNameDisplay').innerText = myName;
            
            peer = new Peer(myName + '-' + Math.random().toString(36).substr(2,8), {
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' }
                    ]
                }
            });
            
            peer.on('open', () => socket.emit('join-room', { name: myName, room: myRoom }));
            
            peer.on('call', call => {
                if (confirm('📞 مكالمة واردة. هل تريد الرد؟')) {
                    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                        .then(stream => {
                            call.answer(stream);
                            setupCall(call, stream);
                        })
                        .catch(() => alert('❌ لا يمكن الوصول للكاميرا'));
                } else {
                    call.close();
                }
            });
        }
        
        socket.on('room-members', (updated) => {
            members = updated;
            document.getElementById('memberCount').innerText = members.length;
            let html = '';
            members.forEach(m => {
                html += `<div class="member-item"><div class="member-avatar">👤</div><div>${m.name}</div></div>`;
            });
            document.getElementById('membersList').innerHTML = html;
        });
        
        socket.on('system-message', (msg) => addMessage(msg, 'system'));
        socket.on('new-message', (data) => addMessage(data.name + ': ' + data.text, 'other'));
        
        function sendMessage() {
            const input = document.getElementById('messageInput');
            const text = input.value.trim();
            if (!text) return;
            addMessage(myName + ': ' + text, 'me');
            socket.emit('send-message', { room: myRoom, text: text });
            input.value = '';
        }
        
        function addMessage(text, type) {
            const div = document.createElement('div');
            div.className = 'message ' + type;
            div.innerText = text;
            document.getElementById('messagesArea').appendChild(div);
            document.getElementById('messagesArea').scrollTop = document.getElementById('messagesArea').scrollHeight;
        }
        
        function startVideoCall() { startMedia(true); }
        function startAudioCall() { startMedia(false); }
        
        function startMedia(isVideo) {
            navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo })
                .then(stream => {
                    myStream = stream;
                    if (isVideo) {
                        document.getElementById('localVideo').srcObject = stream;
                        document.getElementById('videoArea').style.display = 'grid';
                    }
                    members.forEach(m => {
                        if (m.id !== socket.id) {
                            const call = peer.call(m.id, stream);
                            setupCall(call, stream);
                        }
                    });
                    document.getElementById('endCallBtn').style.display = 'flex';
                })
                .catch(() => alert('❌ لا يمكن الوصول للكاميرا أو المايك'));
        }
        
        function setupCall(call, stream) {
            currentCall = call;
            call.on('stream', remoteStream => {
                if (remoteStream.getVideoTracks().length > 0) {
                    document.getElementById('remoteVideo').srcObject = remoteStream;
                    document.getElementById('videoArea').style.display = 'grid';
                } else {
                    document.getElementById('remoteAudio').srcObject = remoteStream;
                }
            });
            call.on('close', () => endCall());
        }
        
        function endCall() {
            if (currentCall) currentCall.close();
            if (myStream) myStream.getTracks().forEach(t => t.stop());
            document.getElementById('videoArea').style.display = 'none';
            document.getElementById('endCallBtn').style.display = 'none';
            document.getElementById('localVideo').srcObject = null;
            document.getElementById('remoteVideo').srcObject = null;
            document.getElementById('remoteAudio').srcObject = null;
        }
    </script>
</body>
</html>
'''

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    socketio.run(app, host='0.0.0.0', port=port, debug=False)
