from flask import Flask, render_template_string
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fadi-gold-secret')

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
        .glass-card { background: rgba(20, 15, 40, 0.8); backdrop-filter: blur(10px); border: 2px solid gold; border-radius: 40px; padding: 30px; max-width: 600px; margin: 20px auto; }
        .royal-header { text-align: center; margin-bottom: 30px; }
        .royal-header h1 { font-size: 2.8em; background: linear-gradient(135deg, gold, orange); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .crown-icon { font-size: 3em; animation: float 3s infinite; display: inline-block; }
        @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
        .elegant-input { width: 100%; padding: 15px 20px; margin: 10px 0; background: rgba(0,0,0,0.5); border: 2px solid gold; border-radius: 60px; color: white; font-size: 1.1em; }
        .elegant-input:focus { outline: none; border-color: cyan; box-shadow: 0 0 30px cyan; }
        .royal-btn { width: 100%; padding: 15px; margin: 10px 0; background: #1a1f35; border: 2px solid gold; color: gold; border-radius: 60px; font-size: 1.3em; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .royal-btn:hover { transform: scale(1.05); box-shadow: 0 0 50px gold; }
        .toolbar { display: flex; justify-content: center; gap: 15px; margin: 20px 0; flex-wrap: wrap; }
        .tool { width: 70px; height: 70px; border-radius: 50%; background: #1a1f35; border: 3px solid gold; color: gold; font-size: 2em; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
        .tool:hover { transform: scale(1.1); border-color: cyan; color: cyan; }
        .tool.active { background: gold; color: black; }
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
        @keyframes msgIn { 0%{opacity:0;transform:translateX(20px);} 100%{opacity:1;transform:translateX(0);} }
        .message.me { background: #1a2f4a; border-right: 5px solid cyan; align-self: flex-start; }
        .message.other { background: #2a1f3a; border-left: 5px solid gold; align-self: flex-end; }
        .message.system { background: rgba(255,215,0,0.1); border: 1px dashed gold; color: gold; text-align: center; max-width: 100%; }
        .send-area { display: flex; gap: 10px; margin: 10px 0; }
        .send-input { flex: 1; padding: 15px 20px; background: rgba(0,0,0,0.5); border: 2px solid gold; border-radius: 60px; color: white; }
        .send-btn { padding: 15px 30px; background: #1a1f35; border: 2px solid gold; color: gold; border-radius: 60px; cursor: pointer; }
        .members-panel { background: rgba(0,0,0,0.5); border: 2px solid cyan; border-radius: 30px; padding: 15px; margin: 20px 0; display: none; }
        .member-item { display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid gold; }
        .status-bar { display: flex; justify-content: center; gap: 20px; margin: 15px 0; }
        .status-item { background: rgba(0,0,0,0.5); border: 1px solid gold; border-radius: 50px; padding: 8px 20px; display: flex; align-items: center; gap: 8px; }
        .online-dot { width: 10px; height: 10px; background: #00ff88; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
        .notification { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #1a1f35; border: 2px solid gold; border-radius: 60px; padding: 15px 30px; color: gold; z-index: 9999; animation: slideDown 0.5s; }
        @keyframes slideDown { 0%{top:-100px;} 100%{top:20px;} }
    </style>
</head>
<body>

<!-- شاشة الدخول -->
<div id="entryScreen" class="glass-card">
    <div class="royal-header">
        <div class="crown-icon">👑</div>
        <h1>FADI GOLD</h1>
        <div style="color: cyan; margin-top: 10px;">تم تصميمه من قبل فادي </div>
    </div>
    <input type="text" class="elegant-input" id="loginName" placeholder="اسمك">
    <input type="text" class="elegant-input" id="loginRoom" placeholder="رقم الغرفة">
    <button class="royal-btn" onclick="enterRoom()">🚀 دخول</button>
</div>

<!-- العالم الرئيسي -->
<div id="mainWorld" style="display: none;">
    <div class="glass-card" style="max-width: 100%;">
        <div class="royal-header">
            <div class="crown-icon">👑</div>
            <h1 id="roomTitle">FADI GOLD</h1>
            <div class="status-bar">
                <div class="status-item"><span class="online-dot"></span><span id="membersCount">1</span></div>
                <div class="status-item"><span>💬</span><span id="msgCount">0</span></div>
                <div class="status-item" id="callStatus" style="display: none;"><span>📞</span><span>مكالمة نشطة</span></div>
            </div>
        </div>
    </div>

    <!-- شريط الأدوات -->
    <div class="toolbar">
        <div class="tool" onclick="showChat()" title="الدردشة">💬</div>
        <div class="tool" onclick="toggleMembers()" title="الأعضاء">👥</div>
        <div class="tool" onclick="startVideoCall()" title="مكالمة فيديو">📹</div>
        <div class="tool" onclick="startAudioCall()" title="مكالمة صوتية فقط">🎤</div>
        <div class="tool" onclick="shareScreen()" title="مشاركة الشاشة">🖥️</div>
        <div class="tool" onclick="endAllCalls()" id="endCallBtn" style="display: none; color: red; border-color: red;" title="إنهاء المكالمة">🛑</div>
    </div>

    <!-- منطقة الفيديو -->
    <div class="video-area" id="videoContainer">
        <div class="remote-vid"><video id="remoteVideo" autoplay playsinline></video></div>
        <div class="local-vid"><video id="localVideo" autoplay muted playsinline></video></div>
    </div>

    <!-- منطقة الصوت فقط -->
    <div class="audio-area" id="audioContainer">
        <div class="audio-wave">🎤 🔊 🎵</div>
        <h3 style="color: cyan;">مكالمة صوتية فقط</h3>
        <p style="color: gold;">تحدث الآن، الجميع يسمعك</p>
    </div>

    <!-- قائمة الأعضاء -->
    <div class="members-panel" id="membersPanel">
        <div id="membersList"></div>
    </div>

    <!-- منطقة الدردشة -->
    <div class="chat-area" id="chatContainer"></div>

    <!-- منطقة الإرسال -->
    <div class="send-area">
        <input type="text" class="send-input" id="messageInput" placeholder="اكتب رسالتك للجميع..." onkeypress="if(event.key==='Enter') sendMessage()">
        <button class="send-btn" onclick="sendMessage()">إرسال للكل</button>
    </div>
</div>

<!-- عناصر الصوت -->
<audio id="remoteAudio" autoplay></audio>

<script>
    // ========== المتغيرات العامة ==========
    let peer = null;
    let myName = '';
    let myRoom = '';
    let myId = '';
    let connections = [];
    let members = [];
    let calls = [];
    let myStream = null;
    let isHost = false;
    let msgCount = 0;
    let isAudioOnly = false;
    let isVideoActive = false;

    // عناصر الصفحة
    const chatContainer = document.getElementById('chatContainer');
    const videoContainer = document.getElementById('videoContainer');
    const audioContainer = document.getElementById('audioContainer');
    const remoteVideo = document.getElementById('remoteVideo');
    const localVideo = document.getElementById('localVideo');
    const remoteAudio = document.getElementById('remoteAudio');
    const endCallBtn = document.getElementById('endCallBtn');
    const callStatus = document.getElementById('callStatus');

    // ========== دوال مساعدة ==========
    function notify(text) {
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.innerText = text;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }

    // ========== دخول الغرفة ==========
    function enterRoom() {
        myName = document.getElementById('loginName').value.trim();
        myRoom = document.getElementById('loginRoom').value.trim();

        if (!myName || !myRoom) {
            notify('❌ اكتب اسمك ورقم الغرفة');
            return;
        }

        document.getElementById('entryScreen').style.display = 'none';
        document.getElementById('mainWorld').style.display = 'block';
        document.getElementById('roomTitle').innerText = ` 
FADI GOLD ${myRoom}`;

        notify('✨ جاري الاتصال...');
        setTimeout(() => {
            tryHost();
            addMessage('system', '✨ مرحباً بك في FADI GOLD');
            addMessage('system', '🌟 الجميع يرسل - الجميع يتكلم');
        }, 500);
    }

    // ========== محاولة استضافة الغرفة ==========
    function tryHost() {
        peer = new Peer(myRoom, {
            config: {'iceServers': [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]}
        });

        peer.on('open', (id) => {
            isHost = true;
            myId = id;
            notify('👑 أنت مضيف الغرفة');
            updateMembersList();
            updateMembersCount();
        });

        peer.on('connection', (conn) => {
            connections.push(conn);
            setupConnection(conn);
            
            // إرسال قائمة الأعضاء للمستخدم الجديد
            setTimeout(() => {
                conn.send({ 
                    type: 'members', 
                    list: members,
                    host: myId 
                });
            }, 500);
        });

        peer.on('call', (call) => {
            handleIncomingCall(call);
        });

        peer.on('error', (err) => {
            console.log('Peer error:', err);
            if (err.type === 'unavailable-id') {
                joinRoom();
            }
        });
    }

    // ========== الانضمام إلى غرفة ==========
    function joinRoom() {
        const randomId = myRoom + '-' + Math.floor(Math.random() * 10000);
        
        peer = new Peer(randomId, {
            config: {'iceServers': [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]}
        });

        peer.on('open', (id) => {
            myId = id;
            notify('✅ دخلت الغرفة');
            
            // الاتصال بالمضيف
            const conn = peer.connect(myRoom);
            connections.push(conn);
            setupConnection(conn);
        });

        peer.on('call', (call) => {
            handleIncomingCall(call);
        });

        peer.on('error', (err) => {
            console.log('Join error:', err);
            notify('⚠️ خطأ في الانضمام للغرفة');
        });
    }

    // ========== إعداد اتصال مع مستخدم ==========
    function setupConnection(conn) {
        conn.on('open', () => {
            // إرسال بياناتي للمستخدم الآخر
            conn.send({ 
                type: 'join', 
                user: myName, 
                id: myId 
            });
        });

        conn.on('data', (data) => {
            handleData(data, conn);
        });

        conn.on('close', () => {
            // إزالة الاتصال المغلق
            connections = connections.filter(c => c !== conn);
            
            // إزالة العضو من القائمة
            members = members.filter(m => m.id !== conn.peer);
            
            updateMembersList();
            updateMembersCount();
            addMessage('system', `👋 أحدهم غادر الغرفة`);
        });
    }

    // ========== معالجة البيانات الواردة ==========
    function handleData(data, conn) {
        console.log('Data received:', data);

        // حالة 1: مستخدم جديد دخل الغرفة
        if (data.type === 'join') {
            // إضافة العضو الجديد للقائمة
            const newMember = { name: data.user, id: data.id };
            members.push(newMember);
            
            addMessage('system', `🌟 ${data.user} دخل إلى الغرفة`);
            updateMembersCount();
            updateMembersList();

            // إذا كنت المضيف، أرسل القائمة المحدثة للجميع
            if (isHost) {
                broadcastToAll({ 
                    type: 'members', 
                    list: members 
                });
            }
        }
        
        // حالة 2: رسالة نصية (الجميع يقدر يرسل ويستقبل)
        else if (data.type === 'msg') {
            addMessage('other', data.text, data.user);
            msgCount++;
            document.getElementById('msgCount').innerText = msgCount;
            
            // إعادة بث الرسالة للجميع (إذا كنت المضيف)
            if (isHost) {
                broadcastToAll({
                    type: 'msg',
                    user: data.user,
                    text: data.text
                });
            }
        }
        
        // حالة 3: تحديث قائمة الأعضاء
        else if (data.type === 'members') {
            members = data.list || [];
            updateMembersList();
            updateMembersCount();
        }
    }

    // ========== البث للجميع (فقط المضيف يستخدمها) ==========
    function broadcastToAll(data) {
        connections.forEach(conn => {
            if (conn.open) {
                conn.send(data);
            }
        });
    }

    // ========== إرسال رسالة (أي عضو يقدر يرسل) ==========
    function sendMessage() {
        const input = document.getElementById('messageInput');
        const text = input.value.trim();

        if (!text) return;

        // عرض الرسالة عندي
        addMessage('me', text, myName);
        msgCount++;
        document.getElementById('msgCount').innerText = msgCount;

        // إرسال الرسالة لكل الاتصالات المفتوحة
        // كل عضو يرسل مباشرة للآخرين (Peer to Peer)
        connections.forEach(conn => {
            if (conn.open) {
                conn.send({
                    type: 'msg',
                    user: myName,
                    text: text
                });
            }
        });

        // تفريغ حقل الإدخال
        input.value = '';
    }

    // ========== إضافة رسالة للشات ==========
    function addMessage(type, text, user = '') {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;

        if (type === 'system') {
            msgDiv.innerText = text;
        } else {
            msgDiv.innerHTML = `
                <div style="color: gold; font-size: 0.9em; margin-bottom: 5px;">${user}</div>
                ${text}
            `;
        }

        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // ========== تحديث قائمة الأعضاء ==========
    function updateMembersList() {
        const listDiv = document.getElementById('membersList');
        listDiv.innerHTML = '';

        // إضافة نفسي أولاً
        const myDiv = document.createElement('div');
        myDiv.className = 'member-item';
        myDiv.innerHTML = `
            <div class="member-avatar">👑</div>
            <div class="member-name">${myName} (أنت)</div>
            <div class="online-dot"></div>
        `;
        listDiv.appendChild(myDiv);

        // إضافة باقي الأعضاء
        members.forEach(m => {
            if (m.id !== myId) {
                const memberDiv = document.createElement('div');
                memberDiv.className = 'member-item';
                memberDiv.innerHTML = `
                    <div class="member-avatar">👤</div>
                    <div class="member-name">${m.name}</div>
                    <div class="online-dot"></div>
                `;
                listDiv.appendChild(memberDiv);
            }
        });
    }

    function updateMembersCount() {
        document.getElementById('membersCount').innerText = members.length + 1;
    }

    function showChat() {
        document.getElementById('membersPanel').style.display = 'none';
    }

    function toggleMembers() {
        const panel = document.getElementById('membersPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    // ========== دوال المكالمات ==========
    async function startVideoCall() {
        if (isVideoActive || isAudioOnly) {
            endAllCalls();
        } else {
            try {
                myStream = await navigator.mediaDevices.getUserMedia({ 
                    video: true, 
                    audio: true 
                });
                
                isVideoActive = true;
                isAudioOnly = false;
                
                videoContainer.style.display = 'grid';
                audioContainer.style.display = 'none';
                localVideo.srcObject = myStream;

                // الاتصال بجميع الأعضاء
                connections.forEach(conn => {
                    if (conn.open) {
                        const call = peer.call(conn.peer, myStream, { 
                            metadata: { 
                                type: 'video', 
                                user: myName 
                            } 
                        });
                        setupCall(call, true);
                    }
                });

                endCallBtn.style.display = 'flex';
                callStatus.style.display = 'flex';
                notify('📹 مكالمة فيديو بدأت');
            } catch (err) {
                notify('❌ فشل تشغيل الكاميرا');
            }
        }
    }

    async function startAudioCall() {
        if (isAudioOnly || isVideoActive) {
            endAllCalls();
        } else {
            try {
                myStream = await navigator.mediaDevices.getUserMedia({ 
                    video: false, 
                    audio: true 
                });
                
                isAudioOnly = true;
                isVideoActive = false;
                
                videoContainer.style.display = 'none';
                audioContainer.style.display = 'block';

                // الاتصال بجميع الأعضاء
                connections.forEach(conn => {
                    if (conn.open) {
                        const call = peer.call(conn.peer, myStream, { 
                            metadata: { 
                                type: 'audio', 
                                user: myName 
                            } 
                        });
                        setupCall(call, false);
                    }
                });

                endCallBtn.style.display = 'flex';
                callStatus.style.display = 'flex';
                notify('🎤 مكالمة صوتية بدأت');
            } catch (err) {
                notify('❌ فشل تشغيل الميكروفون');
            }
        }
    }

    async function shareScreen() {
        if (myStream) endAllCalls();
        
        try {
            myStream = await navigator.mediaDevices.getDisplayMedia({ 
                video: true, 
                audio: true 
            });
            
            isVideoActive = true;
            isAudioOnly = false;
            
            videoContainer.style.display = 'grid';
            audioContainer.style.display = 'none';
            localVideo.srcObject = myStream;

            // الاتصال بجميع الأعضاء
            connections.forEach(conn => {
                if (conn.open) {
                    const call = peer.call(conn.peer, myStream, { 
                        metadata: { 
                            type: 'screen', 
                            user: myName 
                        } 
                    });
                    setupCall(call, true);
                }
            });

            endCallBtn.style.display = 'flex';
            callStatus.style.display = 'flex';
            notify('🖥️ مشاركة الشاشة بدأت');

            // عند إيقاف مشاركة الشاشة
            myStream.getVideoTracks()[0].onended = () => {
                endAllCalls();
            };

        } catch (err) {
            notify('❌ فشل مشاركة الشاشة');
        }
    }

    function handleIncomingCall(call) {
        const type = call.metadata?.type || 'video';
        const userName = call.metadata?.user || 'مستخدم';
        
        if (confirm(`📞 مكالمة ${type === 'audio' ? 'صوتية' : 'فيديو'} واردة من ${userName}\nهل تريد الرد؟`)) {
            
            navigator.mediaDevices.getUserMedia({ 
                audio: true, 
                video: type !== 'audio' 
            }).then(stream => {
                myStream = stream;
                call.answer(stream);
                
                isVideoActive = (type !== 'audio');
                isAudioOnly = (type === 'audio');

                if (type === 'audio') {
                    videoContainer.style.display = 'none';
                    audioContainer.style.display = 'block';
                } else {
                    videoContainer.style.display = 'grid';
                    audioContainer.style.display = 'none';
                    localVideo.srcObject = stream;
                }

                setupCall(call, type !== 'audio');
                
                endCallBtn.style.display = 'flex';
                callStatus.style.display = 'flex';
                notify('📞 المكالمة بدأت');

            }).catch(() => {
                notify('❌ فشل الرد على المكالمة');
            });

        } else {
            call.close();
        }
    }

    function setupCall(call, hasVideo) {
        calls.push(call);

        call.on('stream', (remoteStream) => {
            if (hasVideo) {
                remoteVideo.srcObject = remoteStream;
            } else {
                remoteAudio.srcObject = remoteStream;
            }
        });

        call.on('close', () => {
            calls = calls.filter(c => c !== call);
            if (calls.length === 0) {
                resetCallUI();
            }
        });

        call.on('error', (err) => {
            console.error('Call error:', err);
            calls = calls.filter(c => c !== call);
            if (calls.length === 0) {
                resetCallUI();
            }
        });
    }

    function endAllCalls() {
        calls.forEach(call => {
            if (call.open) {
                call.close();
            }
        });
        calls = [];

        if (myStream) {
            myStream.getTracks().forEach(t => t.stop());
            myStream = null;
        }

        resetCallUI();
        notify('📞 المكالمة انتهت');
    }

    function resetCallUI() {
        videoContainer.style.display = 'none';
        audioContainer.style.display = 'none';
        endCallBtn.style.display = 'none';
        callStatus.style.display = 'none';
        
        remoteVideo.srcObject = null;
        localVideo.srcObject = null;
        remoteAudio.srcObject = null;
        
        isVideoActive = false;
        isAudioOnly = false;
    }

    // تنظيف عند الخروج
    window.onbeforeunload = function() {
        if (myStream) {
            myStream.getTracks().forEach(t => t.stop());
        }
        if (peer) {
            peer.destroy();
        }
    };
</script>
</body>
</html>
'''

@app.route('/')
def index():
    return render_template_string(HTML_CODE)

@app.route('/health')
def health():
    return {'status': 'healthy'}, 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=False)
