# ========== FADI GOLD CHAT + فيديو عبر السيرفر ==========
from flask import Flask, render_template_string, request
from flask_socketio import SocketIO, emit, join_room
import os
import logging
import asyncio
import threading
import json
import socket

logging.basicConfig(level=logging.INFO)
app = Flask(__name__)
app.config['SECRET_KEY'] = 'fadi-gold-secret'
socketio = SocketIO(app, cors_allowed_origins="*", logger=True)

# ========== تخزين الغرف ==========
rooms = {}

# ========== الحصول على IP السيرفر ==========
def get_server_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "localhost"

SERVER_IP = get_server_ip()
print(f"✅ IP السيرفر: {SERVER_IP}")

# ========== TURN Server بسيط (aiortc) ==========
try:
    from aiohttp import web
    from aiortc import RTCPeerConnection, RTCSessionDescription
    from aiortc.contrib.media import MediaRelay
    
    TURN_AVAILABLE = True
    pcs = set()
    relay = MediaRelay()
    
    async def offer(request):
        params = await request.json()
        offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])
        
        pc = RTCPeerConnection()
        pcs.add(pc)
        
        @pc.on("iceconnectionstatechange")
        async def on_iceconnectionstatechange():
            if pc.iceConnectionState == "failed":
                await pc.close()
                pcs.discard(pc)
        
        await pc.setRemoteDescription(offer)
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        
        return web.Response(
            content_type="application/json",
            text=json.dumps({
                "sdp": pc.localDescription.sdp,
                "type": pc.localDescription.type
            })
        )
    
    async def start_turn_server():
        turn_app = web.Application()
        turn_app.router.post("/offer", offer)
        runner = web.AppRunner(turn_app)
        await runner.setup()
        site = web.TCPSite(runner, "0.0.0.0", 8080)
        await site.start()
        print("✅ TURN server شغال على port 8080")
    
    def run_turn_server():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(start_turn_server())
        loop.run_forever()
    
    threading.Thread(target=run_turn_server, daemon=True).start()
    
except Exception as e:
    print(f"❌ TURN server ما اشتغل: {e}")
    TURN_AVAILABLE = False

# ========== الصفحة الرئيسية ==========
@app.route('/')
def index():
    return render_template_string(HTML_CODE.replace('{{SERVER_IP}}', SERVER_IP))

# ========== أحداث Socket.IO ==========
@socketio.on('join-room')
def handle_join(data):
    name = data['name']
    room = data['room']
    
    join_room(room)
    
    if room not in rooms:
        rooms[room] = []
    
    member_info = {'id': request.sid, 'name': name}
    rooms[room].append(member_info)
    
    emit('room-members', rooms[room], to=room)
    emit('existing-users', [m for m in rooms[room] if m['id'] != request.sid], to=request.sid)
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

@socketio.on('video-offer')
def handle_video_offer(data):
    emit('video-offer', {
        'offer': data['offer'],
        'from': request.sid
    }, to=data['target'])

@socketio.on('video-answer')
def handle_video_answer(data):
    emit('video-answer', {
        'answer': data['answer'],
        'from': request.sid
    }, to=data['target'])

@socketio.on('ice-candidate')
def handle_ice_candidate(data):
    emit('ice-candidate', {
        'candidate': data['candidate'],
        'from': request.sid
    }, to=data['target'])

@socketio.on('request-video-users')
def handle_request_video(data):
    if data['room'] in rooms:
        users = [m for m in rooms[data['room']] if m['id'] != request.sid]
        emit('existing-users', users, to=request.sid)

@socketio.on('disconnect')
def handle_disconnect():
    for room_name, members in rooms.items():
        for member in members[:]:
            if member['id'] == request.sid:
                members.remove(member)
                emit('system-message', f'🔴 {member["name"]} خرج من الغرفة', to=room_name)
                emit('room-members', members, to=room_name)
                emit('user-left-video', {'userId': request.sid}, to=room_name)
                if len(members) == 0:
                    del rooms[room_name]
                return

# ========== كود الواجهة مع فيديو عبر السيرفر ==========
HTML_CODE = '''
<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>💬 FADI GOLD CHAT + فيديو</title>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
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
        h1 { text-align: center; color: gold; font-size: 2.5em; margin-bottom: 20px; }
        input, button { width: 100%; padding: 15px; margin: 8px 0; border-radius: 60px; border: none; font-size: 1em; }
        input { background: rgba(0,0,0,0.5); border: 2px solid gold; color: white; }
        button { background: gold; color: black; font-weight: bold; cursor: pointer; transition: 0.3s; }
        button:hover { transform: translateY(-3px); box-shadow: 0 10px 30px gold; }
        button.danger { background: #ff4444; color: white; }
        button.success { background: #00C851; color: white; }
        .main-container { display: flex; gap: 20px; flex-wrap: wrap; }
        .video-container { flex: 2; min-width: 300px; }
        .chat-container { flex: 1; min-width: 300px; background: rgba(0,0,0,0.3); border-radius: 30px; padding: 20px; }
        .videos-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .video-wrapper { position: relative; background: #000; border-radius: 20px; overflow: hidden; aspect-ratio: 4/3; border: 2px solid gold; }
        .video-wrapper video { width: 100%; height: 100%; object-fit: cover; }
        .video-label { position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.7); color: gold; padding: 5px 15px; border-radius: 20px; font-size: 0.9em; border: 1px solid gold; }
        .video-controls { display: flex; gap: 10px; justify-content: center; margin: 15px 0; flex-wrap: wrap; }
        .video-controls button { width: auto; padding: 12px 25px; margin: 0; }
        .chat-box { background: rgba(0,0,0,0.4); border-radius: 30px; padding: 20px; height: 400px; overflow-y: auto; margin: 20px 0; }
        .message { padding: 12px 18px; margin: 8px 0; border-radius: 25px; max-width: 80%; word-wrap: break-word; }
        .message.me { background: #1f3a5f; border-right: 5px solid cyan; margin-left: auto; }
        .message.other { background: #2f1f4a; border-left: 5px solid gold; }
        .message.system { background: rgba(255,215,0,0.1); border: 1px dashed gold; color: gold; text-align: center; max-width: 100%; }
        .flex-row { display: flex; gap: 10px; }
        .flex-row input { flex: 1; }
        .flex-row button { width: auto; padding: 15px 25px; }
        .status-bar { display: flex; justify-content: space-between; background: rgba(0,0,0,0.3); padding: 12px 20px; border-radius: 60px; margin: 15px 0; border: 1px solid gold; }
        .online-dot { width: 10px; height: 10px; background: #00ff88; border-radius: 50%; display: inline-block; margin-left: 8px; box-shadow: 0 0 15px #00ff88; }
    </style>
</head>
<body>
    <div class="card" id="loginCard">
        <h1>👑 FADI GOLD</h1>
        <div style="text-align: center; color: cyan; margin-bottom: 20px;">دردشة + فيديو عبر السيرفر</div>
        <input type="text" id="nameInput" placeholder="اسمك" value="فادي">
        <input type="text" id="roomInput" placeholder="رقم الغرفة" value="123">
        <button onclick="joinRoom()">🚀 دخول الغرفة</button>
    </div>
    
    <div class="card" id="chatCard" style="display: none;">
        <h1>💬 <span id="roomName"></span></h1>
        
        <div class="status-bar">
            <span><span class="online-dot"></span> <span id="memberCount">1</span> متصل</span>
            <span>🆔 <span id="myName"></span></span>
        </div>
        
        <div class="main-container">
            <div class="video-container">
                <div class="videos-grid" id="videosGrid"></div>
                <div class="video-controls">
                    <button id="startVideoBtn" class="success" onclick="startVideo()">▶️ بدء الفيديو</button>
                    <button id="stopVideoBtn" class="danger" onclick="stopVideo()" style="display: none;">⏹️ إيقاف الفيديو</button>
                </div>
            </div>
            
            <div class="chat-container">
                <div class="chat-box" id="chatArea">
                    <div class="message system">✨ مرحباً بك في دردشة فادي الذهبية</div>
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
        let myName = '', myRoom = '', myStream = null;
        const peers = {};
        
        function joinRoom() {
            myName = document.getElementById('nameInput').value.trim();
            myRoom = document.getElementById('roomInput').value.trim();
            if (!myName || !myRoom) return;
            
            document.getElementById('loginCard').style.display = 'none';
            document.getElementById('chatCard').style.display = 'block';
            document.getElementById('roomName').innerText = myRoom;
            document.getElementById('myName').innerText = myName;
            
            socket.emit('join-room', { name: myName, room: myRoom });
        }
        
        async function startVideo() {
            try {
                myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                addVideoElement('my-video', myName + ' (أنت)', true);
                document.getElementById('my-video').srcObject = myStream;
                
                document.getElementById('startVideoBtn').style.display = 'none';
                document.getElementById('stopVideoBtn').style.display = 'inline-block';
                
                socket.emit('request-video-users', { room: myRoom });
            } catch (err) {
                alert('لا يمكن الوصول للكاميرا: ' + err.message);
            }
        }
        
        function stopVideo() {
            if (myStream) {
                myStream.getTracks().forEach(track => track.stop());
                myStream = null;
            }
            document.getElementById('my-video')?.remove();
            document.getElementById('startVideoBtn').style.display = 'inline-block';
            document.getElementById('stopVideoBtn').style.display = 'none';
            
            Object.values(peers).forEach(p => p.close());
            Object.keys(peers).forEach(k => delete peers[k]);
        }
        
        function addVideoElement(id, label, isLocal) {
            if (document.getElementById(id)) return;
            
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
            document.getElementById('videosGrid').appendChild(wrapper);
            return video;
        }
        
        function addMessage(text, type) {
            const div = document.createElement('div');
            div.className = 'message ' + type;
            div.innerText = text;
            document.getElementById('chatArea').appendChild(div);
            document.getElementById('chatArea').scrollTop = document.getElementById('chatArea').scrollHeight;
        }
        
        function sendMessage() {
            const input = document.getElementById('messageInput');
            const text = input.value.trim();
            if (!text) return;
            
            addMessage(myName + ': ' + text, 'me');
            socket.emit('send-message', { room: myRoom, text: text });
            input.value = '';
        }
        
        socket.on('room-members', (members) => {
            document.getElementById('memberCount').innerText = members.length;
        });
        
        socket.on('system-message', (msg) => addMessage(msg, 'system'));
        socket.on('new-message', (data) => addMessage(data.name + ': ' + data.text, 'other'));
        
        socket.on('existing-users', (users) => {
            if (!myStream) return;
            users.forEach(user => {
                if (!peers[user.id]) createPeerConnection(user.id, true);
            });
        });
        
        socket.on('video-offer', async (data) => {
            if (!myStream) return;
            if (!peers[data.from]) await createPeerConnection(data.from, false);
            
            const peer = peers[data.from];
            await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            
            socket.emit('video-answer', { target: data.from, answer: peer.localDescription, room: myRoom });
        });
        
        socket.on('video-answer', async (data) => {
            const peer = peers[data.from];
            if (peer) await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
        });
        
        socket.on('ice-candidate', async (data) => {
            const peer = peers[data.from];
            if (peer) await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
        });
        
        socket.on('user-left-video', (data) => {
            document.getElementById('user-' + data.userId)?.remove();
            if (peers[data.userId]) {
                peers[data.userId].close();
                delete peers[data.userId];
            }
        });
        
        async function createPeerConnection(targetId, isInitiator) {
            const peer = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { 
                        urls: 'turn:' + window.location.hostname + ':8080',
                        username: 'user',
                        credential: 'pass'
                    }
                ]
            });
            
            peers[targetId] = peer;
            
            myStream.getTracks().forEach(track => peer.addTrack(track, myStream));
            
            peer.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice-candidate', { target: targetId, candidate: event.candidate, room: myRoom });
                }
            };
            
            peer.ontrack = (event) => {
                const videoId = 'user-' + targetId;
                let videoEl = document.getElementById(videoId);
                if (!videoEl) videoEl = addVideoElement(videoId, 'مستخدم', false);
                if (videoEl) videoEl.srcObject = event.streams[0];
            };
            
            if (isInitiator) {
                const offer = await peer.createOffer();
                await peer.setLocalDescription(offer);
                socket.emit('video-offer', { target: targetId, offer: peer.localDescription, room: myRoom });
            }
            
            return peer;
        }
    </script>
</body>
</html>
'''

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    socketio.run(app, host='0.0.0.0', port=port)
