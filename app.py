from flask import Flask, render_template_string, jsonify
import os
import socket
import requests

app = Flask(__name__)

# الرقم التسلسلي الحقيقي (IP العام) - ثابت
PUBLIC_IP = None

def get_public_ip():
    global PUBLIC_IP
    if PUBLIC_IP:
        return PUBLIC_IP
    try:
        PUBLIC_IP = requests.get('https://api.ipify.org', timeout=5).text.strip()
    except:
        PUBLIC_IP = socket.gethostbyname(socket.gethostname())
    return PUBLIC_IP

# الرقم التسلسلي = IP العام بدون نقاط
def get_server_id():
    return get_public_ip().replace('.', '-')

HTML_CODE = '''
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>💎 GOLD CONNECT</title>
    <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, sans-serif; }
        body { background: linear-gradient(135deg, #0b0719, #1a0f2e); min-height: 100vh; padding: 20px; color: white; }
        .container { background: rgba(20, 15, 40, 0.85); border: 2px solid gold; border-radius: 40px; padding: 30px; max-width: 500px; margin: 20px auto; }
        h1 { text-align: center; color: gold; margin-bottom: 20px; }
        .server-box { background: #0f1220; border: 2px solid cyan; border-radius: 20px; padding: 20px; margin: 20px 0; text-align: center; }
        .server-id { color: cyan; font-size: 1.2em; word-break: break-all; margin: 10px 0; }
        .copy-btn { background: gold; color: black; border: none; padding: 10px; width: 100%; border-radius: 30px; cursor: pointer; font-weight: bold; }
        .tabs { display: flex; gap: 10px; margin: 20px 0; }
        .tab { flex: 1; padding: 15px; background: #333; border: 2px solid gold; border-radius: 30px; text-align: center; cursor: pointer; }
        .active { background: gold; color: black; }
        input { width: 100%; padding: 15px; margin: 10px 0; background: #222; border: 2px solid gold; border-radius: 30px; color: white; }
        .btn { width: 100%; padding: 15px; background: #1a1f35; border: 2px solid gold; color: gold; border-radius: 30px; font-weight: bold; cursor: pointer; }
        .chat-box { background: #222; height: 300px; overflow-y: auto; padding: 15px; border-radius: 20px; margin: 20px 0; }
        .message { padding: 8px 12px; margin: 5px 0; border-radius: 15px; max-width: 80%; }
        .me { background: #1a2f4a; margin-left: auto; }
        .other { background: #2a1f3a; margin-right: auto; }
        .system { background: #333; text-align: center; color: gold; margin: 10px auto; }
        .notification { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #1a1f35; border: 2px solid gold; padding: 15px 30px; border-radius: 60px; z-index: 9999; }
    </style>
</head>
<body>

<!-- شاشة الدخول -->
<div class="container" id="loginScreen">
    <h1>👑 GOLD CONNECT</h1>
    
    <div class="tabs">
        <div class="tab active" onclick="switchTab('local')" id="tabLocal">🏠 محلي</div>
        <div class="tab" onclick="switchTab('remote')" id="tabRemote">🌍 عن بعد</div>
    </div>
    
    <!-- دخول محلي -->
    <div id="localDiv">
        <input type="text" id="localName" placeholder="اسمك">
        <input type="text" id="localRoom" placeholder="رقم الغرفة">
        <button class="btn" onclick="enterLocal()">🚀 دخول</button>
        <div style="color: #aaa; text-align: center; margin-top: 10px;">للأجهزة في نفس الشبكة</div>
    </div>
    
    <!-- دخول عن بعد -->
    <div id="remoteDiv" style="display: none;">
        <input type="text" id="remoteName" placeholder="اسمك">
        <input type="text" id="remoteServerId" placeholder="الرقم التسلسلي">
        <input type="text" id="remoteRoom" placeholder="رقم الغرفة">
        <button class="btn" onclick="enterRemote()">🌍 دخول</button>
        <div style="color: #aaa; text-align: center; margin-top: 10px;">للأجهزة خارج الشبكة</div>
    </div>
</div>

<script>
    let peer, myName, myRoom, myId, connections = [], members = [];
    let isHost = false;
    let serverId = '';  // هذا هو الرقم التسلسلي الحقيقي

    // دوال مساعدة
    function showNotification(text) {
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.innerText = text;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }

    function switchTab(tab) {
        if (tab === 'local') {
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

    // ====== دخول محلي ======
    function enterLocal() {
        myName = document.getElementById('localName').value.trim();
        myRoom = document.getElementById('localRoom').value.trim();
        
        if (!myName || !myRoom) {
            showNotification('❌ اكتب اسمك ورقم الغرفة');
            return;
        }

        // جلب الرقم التسلسلي الحقيقي من السيرفر
        fetch('/api/server-info')
            .then(res => res.json())
            .then(data => {
                serverId = data.server_id;  // الرقم الحقيقي
                const roomId = serverId + '-' + myRoom;  // معرف الغرفة الكامل
                
                // محاولة استضافة الغرفة
                peer = new Peer(roomId);
                
                peer.on('open', (id) => {
                    isHost = true;
                    myId = id;
                    showNotification('👑 أنت مضيف الغرفة');
                    showServerInfo();  // إظهار الرقم التسلسلي للمشرف فقط
                    startChat();
                });

                peer.on('connection', (conn) => {
                    connections.push(conn);
                    setupConnection(conn);
                });

                peer.on('error', (err) => {
                    if (err.type === 'unavailable-id') {
                        // الغرفة موجودة، انضم كعضو (لن يظهر له الرقم)
                        peer = new Peer();
                        peer.on('open', (id) => {
                            myId = id;
                            const conn = peer.connect(roomId);
                            connections.push(conn);
                            setupConnection(conn);
                            showNotification('✅ دخلت الغرفة');
                            startChat();
                        });
                    }
                });
            });
    }

    // ====== دخول عن بعد ======
    function enterRemote() {
        myName = document.getElementById('remoteName').value.trim();
        const remoteId = document.getElementById('remoteServerId').value.trim();  // الرقم التسلسلي من المشرف
        myRoom = document.getElementById('remoteRoom').value.trim();

        if (!myName || !remoteId || !myRoom) {
            showNotification('❌ اكتب جميع البيانات');
            return;
        }

        const roomId = remoteId + '-' + myRoom;  // نفس معرف الغرفة

        peer = new Peer();
        peer.on('open', (id) => {
            myId = id;
            const conn = peer.connect(roomId);
            connections.push(conn);
            setupConnection(conn);
            showNotification('🌍 دخلت من خارج الشبكة');
            startChat();
        });
    }

    // ====== إظهار الرقم التسلسلي للمشرف فقط ======
    function showServerInfo() {
        // إنشاء صندوق الرقم التسلسلي الحقيقي
        const infoDiv = document.createElement('div');
        infoDiv.className = 'server-box';
        infoDiv.id = 'serverInfoBox';
        infoDiv.innerHTML = `
            <div style="color: gold;">🔐 رقم الشبكة الحقيقي (للمشرف فقط)</div>
            <div class="server-id">${serverId}</div>
            <button class="copy-btn" onclick="copyServerId()">📋 نسخ الرقم</button>
            <div style="color: #aaa; margin-top: 10px;">أرسل هذا الرقم للأعضاء خارج الشبكة</div>
        `;
        
        // إضافته في أعلى شاشة الدردشة
        document.getElementById('chatScreen').insertBefore(infoDiv, document.getElementById('chatScreen').firstChild);
    }

    function copyServerId() {
        navigator.clipboard.writeText(serverId).then(() => {
            showNotification('📋 تم نسخ الرقم الحقيقي');
        });
    }

    // ====== إعداد الاتصال ======
    function setupConnection(conn) {
        conn.on('open', () => {
            conn.send({ type: 'join', user: myName, id: myId });
        });

        conn.on('data', (data) => {
            if (data.type === 'join') {
                members.push(data);
                addMessage('system', `🌟 ${data.user} دخل`);
            } else if (data.type === 'msg') {
                addMessage('other', `${data.user}: ${data.text}`);
            }
        });
    }

    // ====== بدء الدردشة ======
    function startChat() {
        document.getElementById('loginScreen').style.display = 'none';
        
        // إنشاء شاشة الدردشة
        const chatDiv = document.createElement('div');
        chatDiv.className = 'container';
        chatDiv.id = 'chatScreen';
        chatDiv.style.maxWidth = '800px';
        chatDiv.innerHTML = `
            <h1>💬 غرفة ${myRoom}</h1>
            <div id="messages" class="chat-box"></div>
            <div style="display: flex; gap: 10px;">
                <input type="text" id="msgInput" placeholder="رسالتك..." style="flex: 1; padding: 15px; background: #222; border: 2px solid gold; border-radius: 30px; color: white;">
                <button class="btn" style="width: 100px;" onclick="sendMessage()">إرسال</button>
            </div>
        `;
        document.body.appendChild(chatDiv);
    }

    // ====== إرسال رسالة ======
    function sendMessage() {
        const txt = document.getElementById('msgInput').value.trim();
        if (!txt) return;

        addMessage('me', `${myName}: ${txt}`);
        
        connections.forEach(conn => {
            if (conn.open) {
                conn.send({ type: 'msg', user: myName, text: txt });
            }
        });

        document.getElementById('msgInput').value = '';
    }

    // ====== إضافة رسالة ======
    function addMessage(type, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;
        msgDiv.innerText = text;
        document.getElementById('messages').appendChild(msgDiv);
        document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
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
    # الرقم التسلسلي الحقيقي = IP العام
    return jsonify({'server_id': get_server_id()})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
