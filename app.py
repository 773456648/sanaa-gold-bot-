from flask import Flask, render_template_string, jsonify
import os
import socket
import requests

app = Flask(__name__)

# تخزين IP العام مرة واحدة فقط (ثابت)
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

# الرقم التسلسلي = IP العام (بدون نقاط) + جزء عشوائي صغير للتمييز بين الغرف
def generate_server_id():
    public_ip = get_public_ip().replace('.', '-')
    # نضيف random صغير عشان لو فيه غرف متعددة تحت نفس IP
    # لكن الرقم الأساسي ثابت (IP)
    return public_ip

HTML_CODE = '''
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>💎 GOLD CONNECT</title>
    <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
    <style>
        body { background: #0b0719; color: white; font-family: Arial; padding: 20px; }
        .box { background: #1a1f35; border: 2px solid gold; border-radius: 30px; padding: 30px; max-width: 500px; margin: auto; }
        h1 { text-align: center; color: gold; }
        .server { background: #000; border: 2px solid cyan; border-radius: 20px; padding: 20px; margin: 20px 0; text-align: center; }
        .server-id { color: cyan; font-size: 1.2em; word-break: break-all; }
        .copy-btn { background: gold; color: black; border: none; padding: 10px; width: 100%; border-radius: 30px; cursor: pointer; }
        .tab { display: inline-block; width: 49%; padding: 10px; background: #333; border: 1px solid gold; text-align: center; cursor: pointer; }
        .active { background: gold; color: black; }
        input { width: 100%; padding: 10px; margin: 10px 0; background: #222; border: 2px solid gold; border-radius: 30px; color: white; }
        .btn { width: 100%; padding: 10px; background: #1a1f35; border: 2px solid gold; color: gold; border-radius: 30px; cursor: pointer; }
        .notification { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #1a1f35; border: 2px solid gold; padding: 15px; border-radius: 30px; z-index: 9999; }
    </style>
</head>
<body>
<div class="box" id="loginBox">
    <h1>👑 GOLD CONNECT</h1>
    
    <!-- الرقم التسلسلي يظهر فوراً -->
    <div class="server" id="serverInfo">
        <div style="color: gold;">🔐 رقم الشبكة (ثابت)</div>
        <div class="server-id" id="serverIdDisplay">جاري التحميل...</div>
        <button class="copy-btn" onclick="copyServerId()">📋 نسخ الرقم</button>
        <div style="color: #aaa; font-size: 0.8em; margin-top: 10px;">أرسل هذا الرقم للأعضاء خارج الشبكة</div>
    </div>
    
    <div style="margin: 20px 0;">
        <span class="tab active" onclick="switchTab('local')" id="tabLocal">🏠 محلي</span>
        <span class="tab" onclick="switchTab('remote')" id="tabRemote">🌍 عن بعد</span>
    </div>
    
    <div id="localDiv">
        <input type="text" id="localName" placeholder="اسمك">
        <input type="text" id="localRoom" placeholder="رقم الغرفة (مثال: 123)">
        <button class="btn" onclick="enterLocal()">🚀 دخول</button>
        <div style="color: #aaa;">✅ للأجهزة في نفس الشبكة</div>
    </div>
    
    <div id="remoteDiv" style="display: none;">
        <input type="text" id="remoteName" placeholder="اسمك">
        <input type="text" id="remoteServerId" placeholder="الرقم التسلسلي (ألصق الرقم)">
        <input type="text" id="remoteRoom" placeholder="رقم الغرفة">
        <button class="btn" onclick="enterRemote()">🌍 دخول</button>
        <div style="color: #aaa;">🌐 للأجهزة خارج الشبكة</div>
    </div>
</div>

<script>
    let peer, myName, myRoom, myId, conn;
    let serverId = '';

    // جلب الرقم التسلسلي فور تحميل الصفحة
    async function fetchServerId() {
        try {
            const res = await fetch('/api/server-info');
            const data = await res.json();
            serverId = data.server_id;
            document.getElementById('serverIdDisplay').innerText = serverId;
        } catch(err) {
            document.getElementById('serverIdDisplay').innerText = 'خطأ في التحميل';
        }
    }
    fetchServerId();

    function copyServerId() {
        navigator.clipboard.writeText(serverId).then(() => {
            showNotification('✅ تم نسخ الرقم');
        });
    }

    function showNotification(text) {
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.innerText = text;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2000);
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

    function enterLocal() {
        myName = document.getElementById('localName').value.trim();
        myRoom = document.getElementById('localRoom').value.trim();
        if (!myName || !myRoom) {
            showNotification('❌ اكتب اسمك ورقم الغرفة');
            return;
        }

        // نستخدم الرقم التسلسلي كأساس للغرفة (serverId + room)
        const roomId = serverId + '-' + myRoom;

        // محاولة استضافة الغرفة
        peer = new Peer(roomId);
        peer.on('open', (id) => {
            myId = id;
            document.getElementById('loginBox').style.display = 'none';
            showNotification('👑 أنت مضيف الغرفة');
            startChat();
        });

        peer.on('connection', (c) => {
            conn = c;
            setupConn();
        });

        peer.on('error', (err) => {
            // إذا الغرفة موجودة، انضم كعضو
            if (err.type === 'unavailable-id') {
                peer = new Peer();
                peer.on('open', (id) => {
                    myId = id;
                    conn = peer.connect(roomId);
                    setupConn();
                    document.getElementById('loginBox').style.display = 'none';
                    showNotification('✅ دخلت الغرفة');
                });
            }
        });
    }

    function enterRemote() {
        myName = document.getElementById('remoteName').value.trim();
        const remoteServerId = document.getElementById('remoteServerId').value.trim();
        myRoom = document.getElementById('remoteRoom').value.trim();

        if (!myName || !remoteServerId || !myRoom) {
            showNotification('❌ اكتب جميع البيانات');
            return;
        }

        const roomId = remoteServerId + '-' + myRoom;

        peer = new Peer();
        peer.on('open', (id) => {
            myId = id;
            conn = peer.connect(roomId);
            setupConn();
            document.getElementById('loginBox').style.display = 'none';
            showNotification('🌍 دخلت من خارج الشبكة');
        });
    }

    function setupConn() {
        conn.on('open', () => {
            conn.send({ type: 'join', user: myName });
        });

        conn.on('data', (data) => {
            if (data.type === 'join') {
                addMessage('system', `🌟 ${data.user} دخل`);
            } else if (data.type === 'msg') {
                addMessage('other', `${data.user}: ${data.text}`);
            }
        });
    }

    function startChat() {
        // إنشاء واجهة الدردشة (مبسطة)
        const chatDiv = document.createElement('div');
        chatDiv.className = 'box';
        chatDiv.id = 'chatBox';
        chatDiv.innerHTML = `
            <h1>💬 غرفة ${myRoom}</h1>
            <div id="messages" style="background: #222; height: 300px; overflow-y: auto; padding: 10px; border-radius: 20px; margin: 20px 0;"></div>
            <div style="display: flex; gap: 10px;">
                <input type="text" id="msgInput" placeholder="رسالتك..." style="flex: 1; padding: 10px; background: #222; border: 2px solid gold; border-radius: 30px; color: white;">
                <button class="btn" style="width: 100px;" onclick="sendMsg()">إرسال</button>
            </div>
        `;
        document.body.innerHTML = '';
        document.body.appendChild(chatDiv);
    }

    function sendMsg() {
        const txt = document.getElementById('msgInput').value.trim();
        if (!txt || !conn) return;
        conn.send({ type: 'msg', user: myName, text: txt });
        addMessage('me', `${myName}: ${txt}`);
        document.getElementById('msgInput').value = '';
    }

    function addMessage(type, text) {
        const msgDiv = document.createElement('div');
        msgDiv.style.padding = '8px';
        msgDiv.style.margin = '5px';
        msgDiv.style.borderRadius = '15px';
        msgDiv.style.maxWidth = '70%';
        msgDiv.style.backgroundColor = type === 'me' ? '#1a2f4a' : (type === 'other' ? '#2a1f3a' : '#333');
        msgDiv.style.alignSelf = type === 'me' ? 'flex-start' : 'flex-end';
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
    # الرقم التسلسلي ثابت = IP العام (بدون نقاط)
    server_id = get_public_ip().replace('.', '-')
    return jsonify({'server_id': server_id})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
