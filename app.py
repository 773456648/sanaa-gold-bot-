# ========== FADI GOLD CHAT + فيديو مباشر ==========
from flask import Flask, render_template_string, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import os
import logging

logging.basicConfig(level=logging.INFO)
app = Flask(__name__)
app.config['SECRET_KEY'] = 'fadi-gold-secret'
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)

# ========== تخزين الغرف ==========
rooms = {}  # {room: [members]}

# ========== الصفحة الرئيسية ==========
@app.route('/')
def index():
    return render_template_string(HTML_CODE)

@app.route('/health')
def health():
    return {"status": "ok", "message": "FADI GOLD CHAT is running"}, 200

# ========== أحداث Socket.IO ==========
@socketio.on('join-room')
def handle_join(data):
    name = data['name']
    room = data['room']
    
    join_room(room)
    
    if room not in rooms:
        rooms[room] = []
    
    # تخزين معلومات العضو مع معرف السوكيت
    member_info = {
        'id': request.sid,
        'name': name
    }
    rooms[room].append(member_info)
    
    # إرسال قائمة الأعضاء للجميع
    emit('room-members', rooms[room], to=room)
    
    # إرسال قائمة الأعضاء للعضو الجديد فقط (ليعرف من المتصلين)
    emit('existing-users', [m for m in rooms[room] if m['id'] != request.sid], to=request.sid)
    
    # إعلام الآخرين
    emit('system-message', f'🔔 {name} دخل الغرفة', to=room, include_self=False)

@socketio.on('send-message')
def handle_message(data):
    room = data['room']
    text = data['text']
    
    # بحث عن اسم المرسل
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

# ========== أحداث WebRTC للفيديو ==========
@socketio.on('video-offer')
def handle_video_offer(data):
    """إرسال عرض الفيديو إلى مستخدم معين"""
    target_user = data['target']
    offer = data['offer']
    room = data['room']
    
    # إرسال العرض للمستخدم المستهدف
    emit('video-offer', {
        'offer': offer,
        'from': request.sid,
        'fromName': get_user_name(room, request.sid)
    }, to=target_user)

@socketio.on('video-answer')
def handle_video_answer(data):
    """إرسال إجابة الفيديو إلى مستخدم معين"""
    target_user = data['target']
    answer = data['answer']
    room = data['room']
    
    emit('video-answer', {
        'answer': answer,
        'from': request.sid
    }, to=target_user)

@socketio.on('ice-candidate')
def handle_ice_candidate(data):
    """تبادل معلومات الاتصال ICE"""
    target_user = data['target']
    candidate = data['candidate']
    room = data['room']
    
    emit('ice-candidate', {
        'candidate': candidate,
        'from': request.sid
    }, to=target_user)

@socketio.on('user-left-video')
def handle_user_left_video(data):
    """إعلام الآخرين بأن مستخدم معين قطع الفيديو"""
    room = data['room']
    target_user = data['target']
    
    emit('user-left-video', {
        'userId': target_user
    }, to=room)

def get_user_name(room, user_id):
    """الحصول على اسم المستخدم من معرفه"""
    if room in rooms:
        for member in rooms[room]:
            if member['id'] == user_id:
                return member['name']
    return 'شخص'

@socketio.on('disconnect')
def handle_disconnect():
    for room_name, members in rooms.items():
        for member in members[:]:
            if member['id'] == request.sid:
                members.remove(member)
                emit('system-message', f'🔴 {member["name"]} خرج من الغرفة', to=room_name)
                emit('room-members', members, to=room_name)
                emit('user-left-video', {
                    'userId': request.sid
                }, to=room_name)
                if len(members) == 0:
                    del rooms[room_name]
                return

# ========== كود الواجهة ==========
HTML_CODE = '''
<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>💬 FADI GOLD CHAT + فيديو</title>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <script src="https://unpkg.com/peerjs@1.4.7/dist/peerjs.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', sans-serif;
        }
        body {
            background: linear-gradient(135deg, #0b0719, #1a0f2e);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .card {
            background: rgba(20, 15, 40, 0.9);
            backdrop-filter: blur(10px);
            border: 2px solid gold;
            border-radius: 40px;
            padding: 30px;
            width: 100%;
            max-width: 1200px;
            color: white;
            box-shadow: 0 0 50px rgba(255, 215, 0, 0.3);
        }
        h1 {
            text-align: center;
            color: gold;
            font-size: 2.5em;
            margin-bottom: 20px;
        }
        input, button {
            width: 100%;
            padding: 15px;
            margin: 8px 0;
            border-radius: 60px;
            border: none;
            font-size: 1em;
        }
        input {
            background: rgba(0,0,0,0.5);
            border: 2px solid gold;
            color: white;
        }
        button {
            background: gold;
            color: black;
            font-weight: bold;
            cursor: pointer;
            transition: 0.3s;
        }
        button:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px gold;
        }
        button.danger {
            background: #ff4444;
            color: white;
        }
        button.success {
            background: #00C851;
            color: white;
        }
        .main-container {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        .video-container {
            flex: 2;
            min-width: 300px;
        }
        .chat-container {
            flex: 1;
            min-width: 300px;
            background: rgba(0,0,0,0.3);
            border-radius: 30px;
            padding: 20px;
        }
        .videos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .video-wrapper {
            position: relative;
            background: #000;
            border-radius: 20px;
            overflow: hidden;
            aspect-ratio: 4/3;
            border: 2px solid gold;
        }
        .video-wrapper video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .video-label {
            position: absolute;
            bottom: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            color: gold;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            border: 1px solid gold;
        }
        .video-controls {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin: 15px 0;
            flex-wrap: wrap;
        }
        .video-controls button {
            width: auto;
            padding: 12px 25px;
            margin: 0;
        }
        .chat-box {
            background: rgba(0,0,0,0.4);
            border-radius: 30px;
            padding: 20px;
            height: 400px;
            overflow-y: auto;
            margin: 20px 0;
        }
        .message {
            padding: 12px 18px;
            margin: 8px 0;
            border-radius: 25px;
            max-width: 80%;
            word-wrap: break-word;
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
        .flex-row {
            display: flex;
            gap: 10px;
        }
        .flex-row input {
            flex: 1;
        }
        .flex-row button {
            width: auto;
            padding: 15px 25px;
        }
        .status-bar {
            display: flex;
            justify-content: space-between;
            background: rgba(0,0,0,0.3);
            padding: 12px 20px;
            border-radius: 60px;
            margin: 15px 0;
            border: 1px solid gold;
        }
        .online-dot {
            width: 10px;
            height: 10px;
            background: #00ff88;
            border-radius: 50%;
            display: inline-block;
            margin-left: 8px;
            box-shadow: 0 0 15px #00ff88;
        }
        .members-list {
            background: rgba(0,0,0,0.3);
            border-radius: 20px;
            padding: 15px;
            margin: 15px 0;
        }
        .member-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px;
            border-bottom: 1px solid rgba(255,215,0,0.2);
        }
        .member-item:last-child {
            border-bottom: none;
        }
        .member-status {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #ff4444;
        }
        .member-status.online {
            background: #00ff88;
            box-shadow: 0 0 10px #00ff88;
        }
        .video-badge {
            background: gold;
            color: black;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.7em;
            margin-right: 5px;
        }
    </style>
</head>
<body>
    <div class="card" id="loginCard">
        <h1>👑 FADI GOLD</h1>
        <div style="text-align: center; color: cyan; margin-bottom: 20px;">دردشة + فيديو مباشر</div>
        
        <input type="text" id="nameInput" placeholder="اسمك" value="فادي">
        <input type="text" id="roomInput" placeholder="رقم الغرفة" value="123">
        
        <button onclick="joinRoom()">🚀 دخول الغرفة</button>
        
        <div style="text-align: center; margin-top: 20px; color: #aaa; font-size: 0.9em;">
            أول شخص ينشئ الغرفة تلقائيًا
        </div>
    </div>
    
    <div class="card" id="chatCard" style="display: none;">
        <h1>💬 <span id="roomName"></span></h1>
        
        <div class="status-bar">
            <span><span class="online-dot"></span> <span id="memberCount">1</span> متصل</span>
            <span>🆔 <span id="myName"></span></span>
        </div>
        
        <div class="main-container">
            <div class="video-container">
                <div class="videos-grid" id="videosGrid">
                    <!-- الفيديوهات تظهر هنا -->
                </div>
                
                <div class="video-controls">
                    <button id="startVideoBtn" class="success" onclick="startVideo()">▶️ بدء الفيديو</button>
                    <button id="stopVideoBtn" class="danger" onclick="stopVideo()" style="display: none;">⏹️ إيقاف الفيديو</button>
                    <button id="shareScreenBtn" onclick="shareScreen()">🖥️ مشاركة الشاشة</button>
                </div>
                
                <div class="members-list">
                    <h3 style="color: gold; margin-bottom: 10px;">👥 المتصلين</h3>
                    <div id="membersList"></div>
                </div>
            </div>
            
            <div class="chat-container">
                <div class="chat-box" id="chatArea">
                    <div class="message system">✨ مرحباً بك في دردشة فادي الذهبية مع فيديو مباشر</div>
                </div>
                
                <div class="flex-row">
                    <input type="text" id="messageInput" placeholder="اكتب رسالتك..." onkeypress="if(event.key==='Enter') sendMessage()">
                    <button onclick="sendMessage()">إرسال</button>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        const socket = io();
        let myName = '';
        let myRoom = '';
        let myStream = null;
        let myPeerId = null;
        
        // تخزين الاتصالات بالفيديو
        const peers = {};
        const videoElements = {};
        
        function joinRoom() {
            myName = document.getElementById('nameInput').value.trim();
            myRoom = document.getElementById('roomInput').value.trim();
            
            if (!myName || !myRoom) {
                alert('أدخل اسمك ورقم الغرفة');
                return;
            }
            
            document.getElementById('loginCard').style.display = 'none';
            document.getElementById('chatCard').style.display = 'block';
            document.getElementById('roomName').innerText = myRoom;
            document.getElementById('myName').innerText = myName;
            
            socket.emit('join-room', { name: myName, room: myRoom });
        }
        
        // بدء الفيديو
        async function startVideo() {
            try {
                myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                
                // عرض فيديو النفس
                addVideoElement('my-video', myName + ' (أنت)', true);
                const myVideo = document.getElementById('my-video');
                if (myVideo) myVideo.srcObject = myStream;
                
                document.getElementById('startVideoBtn').style.display = 'none';
                document.getElementById('stopVideoBtn').style.display = 'inline-block';
                
                // إعلام الآخرين بأنني بدأت الفيديو
                socket.emit('video-offer', {
                    target: 'all',
                    offer: null,
                    room: myRoom
                });
                
            } catch (err) {
                alert('لا يمكن الوصول للكاميرا: ' + err.message);
            }
        }
        
        // إيقاف الفيديو
        function stopVideo() {
            if (myStream) {
                myStream.getTracks().forEach(track => track.stop());
                myStream = null;
            }
            
            // إزالة فيديو النفس
            const myVideoEl = document.getElementById('my-video');
            if (myVideoEl) myVideoEl.remove();
            
            document.getElementById('startVideoBtn').style.display = 'inline-block';
            document.getElementById('stopVideoBtn').style.display = 'none';
            
            // إعلام الآخرين
            socket.emit('user-left-video', {
                room: myRoom,
                target: socket.id
            });
        }
        
        // مشاركة الشاشة
        async function shareScreen() {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                
                // استبدال مسار الفيديو بمسار الشاشة
                if (myStream) {
                    const videoTrack = screenStream.getVideoTracks()[0];
                    const sender = Object.values(peers).find(p => p.sender);
                    // تحديث المسار...
                }
            } catch (err) {
                alert('لا يمكن مشاركة الشاشة: ' + err.message);
            }
        }
        
        // إضافة عنصر فيديو للصفحة
        function addVideoElement(id, label, isLocal = false) {
            if (document.getElementById(id)) return;
            
            const videosGrid = document.getElementById('videosGrid');
            const wrapper = document.createElement('div');
            wrapper.className = 'video-wrapper';
            wrapper.id = id + '-wrapper';
            
            const video = document.createElement('video');
            video.id = id;
            video.autoplay = true;
            video.playsInline = true;
            if (isLocal) video.muted = true;
            
            const labelEl = document.createElement('div');
            labelEl.className = 'video-label';
            labelEl.innerText = label;
            
            wrapper.appendChild(video);
            wrapper.appendChild(labelEl);
            videosGrid.appendChild(wrapper);
            
            return video;
        }
        
        // إضافة رسالة للشات
        function addMessage(text, type) {
            const div = document.createElement('div');
            div.className = 'message ' + type;
            div.innerText = text;
            document.getElementById('chatArea').appendChild(div);
            document.getElementById('chatArea').scrollTop = document.getElementById('chatArea').scrollHeight;
        }
        
        // إرسال رسالة
        function sendMessage() {
            const input = document.getElementById('messageInput');
            const text = input.value.trim();
            
            if (!text) return;
            
            addMessage(myName + ': ' + text, 'me');
            socket.emit('send-message', { room: myRoom, text: text });
            
            input.value = '';
        }
        
        // ========== أحداث Socket.IO ==========
        socket.on('room-members', (members) => {
            document.getElementById('memberCount').innerText = members.length;
            
            // تحديث قائمة الأعضاء
            const membersList = document.getElementById('membersList');
            membersList.innerHTML = '';
            members.forEach(member => {
                const memberDiv = document.createElement('div');
                memberDiv.className = 'member-item';
                memberDiv.innerHTML = `
                    <span class="member-status online"></span>
                    <span>${member.name}</span>
                    ${member.id === socket.id ? '(أنت)' : ''}
                    <span class="video-badge" id="video-badge-${member.id}" style="display: none;">📹</span>
                `;
                membersList.appendChild(memberDiv);
            });
        });
        
        socket.on('existing-users', (users) => {
            users.forEach(user => {
                // طلب اتصال فيديو من المستخدمين الموجودين
                if (myStream) {
                    // TODO: إنشاء اتصال Peer-to-Peer
                }
            });
        });
        
        socket.on('system-message', (msg) => {
            addMessage(msg, 'system');
        });
        
        socket.on('new-message', (data) => {
            addMessage(data.name + ': ' + data.text, 'other');
        });
        
        socket.on('user-left-video', (data) => {
            // إزالة فيديو المستخدم الذي غادر
            const videoEl = document.getElementById('user-' + data.userId);
            if (videoEl) {
                const wrapper = document.getElementById('user-' + data.userId + '-wrapper');
                if (wrapper) wrapper.remove();
            }
            
            // إخفاء badge الفيديو
            const badge = document.getElementById('video-badge-' + data.userId);
            if (badge) badge.style.display = 'none';
        });
    </script>
</body>
</html>
'''

# ========== التشغيل ==========
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    socketio.run(app, host='0.0.0.0', port=port, debug=False, allow_unsafe_werkzeug=True)
