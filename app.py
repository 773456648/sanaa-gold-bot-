# ========== FADI GOLD CHAT ==========
from flask import Flask, render_template_string, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'fadi-gold-secret'
socketio = SocketIO(app, cors_allowed_origins="*")

# ========== تخزين الغرف ==========
rooms = {}

# ========== الصفحة الرئيسية ==========
@app.route('/')
def index():
    return render_template_string(HTML_CODE)

# ========== أحداث Socket.IO ==========
@socketio.on('join-room')
def handle_join(data):
    name = data['name']
    room = data['room']
    
    join_room(room)
    
    if room not in rooms:
        rooms[room] = []
    
    rooms[room].append({
        'id': request.sid,
        'name': name
    })
    
    # إرسال قائمة الأعضاء للجميع
    emit('room-members', rooms[room], to=room)
    
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

@socketio.on('disconnect')
def handle_disconnect():
    for room_name, members in rooms.items():
        for member in members[:]:  # نسخة من القائمة للتعديل الآمن
            if member['id'] == request.sid:
                members.remove(member)
                emit('system-message', f'🔴 {member["name"]} خرج من الغرفة', to=room_name)
                emit('room-members', members, to=room_name)
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
    <title>💬 FADI GOLD CHAT</title>
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
            max-width: 600px;
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
        .chat-box {
            background: rgba(0,0,0,0.4);
            border-radius: 30px;
            padding: 20px;
            height: 350px;
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
    </style>
</head>
<body>
    <div class="card" id="loginCard">
        <h1>👑 FADI GOLD</h1>
        <div style="text-align: center; color: cyan; margin-bottom: 20px;">دردشة سحابية · كل الشبكات</div>
        
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
        
        <div class="chat-box" id="chatArea">
            <div class="message system">✨ مرحباً بك في دردشة فادي الذهبية</div>
        </div>
        
        <div class="flex-row">
            <input type="text" id="messageInput" placeholder="اكتب رسالتك..." onkeypress="if(event.key==='Enter') sendMessage()">
            <button onclick="sendMessage()">إرسال</button>
        </div>
    </div>
    
    <script>
        const socket = io();
        let myName = '';
        let myRoom = '';
        
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
        
        socket.on('room-members', (members) => {
            document.getElementById('memberCount').innerText = members.length;
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
            document.getElementById('chatArea').appendChild(div);
            document.getElementById('chatArea').scrollTop = document.getElementById('chatArea').scrollHeight;
        }
    </script>
</body>
</html>
'''

# ========== التشغيل ==========
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    socketio.run(app, host='0.0.0.0', port=port)
