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
            animation: glow 3s infinite;
        }
        @keyframes glow {
            0%, 100% { box-shadow: 0 0 50px rgba(255, 215, 0, 0.5); }
            50% { box-shadow: 0 0 100px rgba(255, 215, 0, 0.8); }
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
            background: linear-gradient(135deg, #ffd700, #ffaa00, #ff8800);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        .subtitle {
            text-align: center;
            color: cyan;
            margin-bottom: 30px;
            font-size: 1.1em;
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
            transition: all 0.3s;
        }
        .input-field:focus {
            outline: none;
            border-color: cyan;
            box-shadow: 0 0 30px cyan;
            transform: scale(1.02);
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
            transition: 0.3s;
            box-shadow: 0 10px 30px rgba(255, 215, 0, 0.5);
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
            box-shadow: 0 0 70px rgba(255, 215, 0, 0.5);
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
        .room-info {
            color: gold;
            font-weight: bold;
            font-size: 1.1em;
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
        .remote-video {
            background: black;
            border-radius: 30px;
            overflow: hidden;
            aspect-ratio: 16/9;
            border: 3px solid gold;
            box-shadow: 0 0 40px gold;
        }
        .local-video {
            background: black;
            border-radius: 20px;
            overflow: hidden;
            aspect-ratio: 4/3;
            border: 2px solid cyan;
            box-shadow: 0 0 30px cyan;
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
            box-shadow: 0 0 50px cyan;
        }
        .call-btn.active {
            background: gold;
            color: #1a1f35;
            border-color: white;
        }
        .call-btn.danger {
            border-color: red;
            color: red;
        }
        .call-btn.danger:hover {
            border-color: darkred;
            color: darkred;
            box-shadow: 0 0 50px red;
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
            animation: slideIn 0.3s;
        }
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        .message.me {
            background: linear-gradient(135deg, #1a2f4a, #0f1f35);
            border-right: 5px solid cyan;
            margin-left: auto;
        }
        .message.other {
            background: linear-gradient(135deg, #2a1f3a, #1a0f28);
            border-left: 5px solid gold;
        }
        .message.system {
            background: rgba(255, 215, 0, 0.1);
            border: 1px dashed gold;
            color: gold;
            text-align: center;
            max-width: 100%;
        }
        .sender-name {
            color: gold;
            font-size: 0.85em;
            margin-bottom: 5px;
        }
        .message-time {
            font-size: 0.7em;
            color: #888;
            margin-top: 5px;
            text-align: left;
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
            padding: 12px;
            border-bottom: 1px solid rgba(255, 215, 0, 0.2);
        }
        .member-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(145deg, #1a1f35, #0f1220);
            border: 2px solid gold;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .member-status {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #00ff88;
            box-shadow: 0 0 15px #00ff88;
        }
        .send-area {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        .message-input {
            flex: 1;
            padding: 18px 25px;
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid gold;
            border-radius: 60px;
            color: white;
            font-size: 1.1em;
        }
        .send-btn {
            padding: 18px 35px;
            background: linear-gradient(145deg, #1a1f35, #0f1220);
            border: 2px solid gold;
            border-radius: 60px;
            color: gold;
            font-size: 1.2em;
            font-weight: bold;
            cursor: pointer;
            transition: 0.3s;
        }
        .send-btn:hover {
            background: gold;
            color: #1a1f35;
            box-shadow: 0 0 40px gold;
        }
        .notification {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(145deg, #1a1f35, #0f1220);
            border: 2px solid gold;
            border-radius: 60px;
            padding: 18px 40px;
            color: gold;
            font-size: 1.2em;
            box-shadow: 0 0 100px gold;
            z-index: 9999;
            animation: notifSlide 0.5s;
        }
        @keyframes notifSlide {
            0% { top: -100px; opacity: 0; }
            100% { top: 20px; opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="login-container" id="loginScreen">
        <div class="crown">👑</div>
        <h1>FADI GOLD</h1>
        <div class="subtitle">فيديو + صوت + دردشة</div>
        
        <input type="text" class="input-field" id="nameInput" placeholder="اسمك الذهبي" value="فادي">
        <input type="text" class="input-field" id="roomInput" placeholder="رقم الغرفة" value="123">
        
        <button class="gold-btn" onclick="joinRoom()">🚀 دخول الغرفة</button>
        
        <div style="text-align: center; margin-top: 20px; color: cyan;">
            💬 دردشة + 📹 فيديو + 🎤 صوت
        </div>
    </div>
    
    <div class="chat-container" id="chatScreen">
        <div class="status-bar">
            <div class="online-indicator">
                <span class="dot"></span>
                <span id="memberCount">1</span> متصل
            </div>
            <div class="room-info">
                الغرفة: <span id="roomDisplay"></span>
            </div>
            <div class="online-indicator">
                <span>👤</span>
                <span id="myNameDisplay"></span>
            </div>
        </div>
        
        <div class="video-area" id="videoArea">
            <div class="remote-video">
                <video id="remoteVideo" autoplay playsinline></video>
            </div>
            <div class="local-video">
                <video id="localVideo" autoplay muted playsinline></video>
            </div>
        </div>
        
        <div class="call-toolbar">
            <div class="call-btn" onclick="startVideoCall()" title="مكالمة فيديو">📹</div>
            <div class="call-btn" onclick="startAudioCall()" title="مكالمة صوتية">🎤</div>
            <div class="call-btn danger" onclick="endCall()" title="إنهاء المكالمة" id="endCallBtn" style="display: none;">🛑</div>
        </div>
        
        <div class="chat-layout">
            <div class="messages-area" id="messagesArea">
                <div class="message system">✨ مرحباً بك في عالم فادي الذهبي</div>
            </div>
            
            <div class="members-panel">
                <h3>👥 الأعضاء المتصلون</h3>
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
        let myName = '';
        let myRoom = '';
        let peer = null;
        let currentCall = null;
        let myStream = null;
        let members = [];
        
        const loginScreen = document.getElementById('loginScreen');
        const chatScreen = document.getElementById('chatScreen');
        const messagesArea = document.getElementById('messagesArea');
        const membersList = document.getElementById('membersList');
        const roomDisplay = document.getElementById('roomDisplay');
        const myNameDisplay = document.getElementById('myNameDisplay');
        const memberCount = document.getElementById('memberCount');
        const videoArea = document.getElementById('videoArea');
        const localVideo = document.getElementById('localVideo');
        const remoteVideo = document.getElementById('remoteVideo');
        const remoteAudio = document.getElementById('remoteAudio');
        const endCallBtn = document.getElementById('endCallBtn');
        
        function joinRoom() {
            myName = document.getElementById('nameInput').value.trim();
            myRoom = document.getElementById('roomInput').value.trim();
            
            if (!myName || !myRoom) {
                alert('أدخل اسمك ورقم الغرفة');
                return;
            }
            
            loginScreen.style.display = 'none';
            chatScreen.style.display = 'block';
            roomDisplay.innerText = myRoom;
            myNameDisplay.innerText = myName;
            
            // إنشاء PeerJS
            const peerId = myName + '-' + Math.random().toString(36).substr(2, 8);
            peer = new Peer(peerId, {
                config: {
                    'iceServers': [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'stun:stun2.l.google.com:19302' },
                        { urls: 'stun:stun3.l.google.com:19302' },
                        {
                            urls: 'turn:openrelay.metered.ca:80',
                            username: 'openrelayproject',
                            credential: 'openrelayproject'
                        }
                    ]
                }
            });
            
            peer.on('open', () => {
                socket.emit('join-room', { name: myName, room: myRoom });
            });
            
            peer.on('call', (call) => {
                if (confirm('📞 مكالمة واردة. هل تريد الرد؟')) {
                    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                        .then(stream => {
                            call.answer(stream);
                            setupCall(call, stream);
                            if (stream.getVideoTracks().length > 0) {
                                localVideo.srcObject = stream;
                                videoArea.style.display = 'grid';
                            }
                            endCallBtn.style.display = 'flex';
                        })
                        .catch(err => {
                            alert('❌ لا يمكن الوصول للكاميرا: ' + err);
                        });
                } else {
                    call.close();
                }
            });
        }
        
        socket.on('room-members', (updatedMembers) => {
            members = updatedMembers;
            memberCount.innerText = members.length;
            
            membersList.innerHTML = '';
            members.forEach(member => {
                const memberDiv = document.createElement('div');
                memberDiv.className = 'member-item';
                memberDiv.innerHTML = `
                    <div class="member-avatar">👤</div>
                    <div style="flex: 1;">${member.name}</div>
                    <div class="member-status"></div>
                `;
                membersList.appendChild(memberDiv);
            });
        });
        
        socket.on('system-message', (msg) => {
            addMessage(msg, 'system');
        });
        
        socket.on('new-message', (data) => {
            addMessage(data.name + ': ' + data.text, 'other');
        });
        
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
            messagesArea.appendChild(div);
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }
        
        function startVideoCall() {
            startMedia(true);
        }
        
        function startAudioCall() {
            startMedia(false);
        }
        
        function startMedia(isVideo) {
            navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo })
                .then(stream => {
                    myStream = stream;
                    
                    if (isVideo) {
                        localVideo.srcObject = stream;
                        videoArea.style.display = 'grid';
                    }
                    
                    // الاتصال بجميع الأعضاء
                    members.forEach(member => {
                        if (member.id !== socket.id) {
                            const call = peer.call(member.id, stream);
                            setupCall(call, stream);
                        }
                    });
                    
                    endCallBtn.style.display = 'flex';
                })
                .catch(err => {
                    alert('❌ لا يمكن الوصول للكاميرا أو المايك: ' + err);
                });
        }
        
        function setupCall(call, stream) {
            currentCall = call;
            
            call.on('stream', (remoteStream) => {
                if (remoteStream.getVideoTracks().length > 0) {
                    remoteVideo.srcObject = remoteStream;
                    videoArea.style.display = 'grid';
                } else {
                    remoteAudio.srcObject = remoteStream;
                }
            });
            
            call.on('close', () => {
                endCall();
            });
        }
        
        function endCall() {
            if (currentCall) {
                currentCall.close();
                currentCall = null;
            }
            
            if (myStream) {
                myStream.getTracks().forEach(track => track.stop());
                myStream = null;
            }
            
            videoArea.style.display = 'none';
            endCallBtn.style.display = 'none';
            localVideo.srcObject = null;
            remoteVideo.srcObject = null;
            remoteAudio.srcObject = null;
        }
    </script>
</body>
</html>
'''

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    socketio.run(app, host='0.0.0.0', port=port, debug=False)
