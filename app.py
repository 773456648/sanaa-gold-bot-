from flask import Flask, render_template_string
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template_string(HTML_CODE)

# هنا كودك الإمبراطوري حق فادي بدون أي تغيير
HTML_CODE = '''
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FADI-DISCOVERY - ويب مباشر</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        body {
            background: linear-gradient(145deg, #0a0f1e 0%, #0d1425 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            width: 100%;
            background: rgba(18, 25, 40, 0.9);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(64, 224, 208, 0.3);
            border-radius: 32px;
            padding: 30px 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
        }
        .logo {
            font-size: 28px;
            font-weight: 700;
            color: #00ffff;
            text-shadow: 0 0 10px cyan;
            letter-spacing: 2px;
            margin-bottom: 5px;
        }
        .sub {
            color: #a0e7e0;
            font-size: 14px;
            border-bottom: 1px dashed #3f6e6b;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        .buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-bottom: 30px;
        }
        .btn {
            background: #0e1a26;
            border: 1px solid #2c5f5a;
            color: #b2f0e4;
            padding: 14px 25px;
            border-radius: 40px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s;
            box-shadow: 0 5px 0 #071016;
            flex: 1;
            text-align: center;
        }
        .btn:hover {
            background: #1a3a44;
            border-color: #4cd8c0;
            color: white;
            box-shadow: 0 0 15px #00ffe0;
        }
        .server-box {
            background: #0b121f;
            border-radius: 24px;
            padding: 22px;
            border: 1px solid #1e4a4a;
            margin-top: 10px;
            direction: rtl;
        }
        .server-title {
            color: #bbffe0;
            font-size: 20px;
            margin-bottom: 12px;
            font-weight: 600;
        }
        .server-id {
            background: #010a14;
            padding: 16px;
            border-radius: 18px;
            border: 2px solid #00ccb3;
            color: #00ffe0;
            font-size: 42px;
            font-weight: 800;
            text-align: center;
            letter-spacing: 8px;
            direction: ltr;
            margin-bottom: 12px;
            word-break: break-all;
            font-family: monospace;
            box-shadow: inset 0 0 15px #00554a;
        }
        .change-link {
            color: #6fc9c0;
            text-align: left;
            font-size: 15px;
            margin-bottom: 15px;
            cursor: pointer;
            text-decoration: underline dotted;
        }
        .status {
            background: #0d1a1f;
            padding: 14px 18px;
            border-radius: 40px;
            color: #ffe69b;
            font-size: 18px;
            border-right: 6px solid #00ffc3;
            margin-top: 15px;
            font-weight: 500;
        }
        .chat-box {
            background: #041016;
            border-radius: 20px;
            padding: 18px;
            margin-top: 20px;
        }
        .chat-log {
            background: #0a141c;
            min-height: 90px;
            max-height: 150px;
            overflow-y: auto;
            padding: 12px;
            border-radius: 14px;
            color: #c6f0e6;
            font-size: 15px;
            border: 1px solid #24756b;
            margin-bottom: 15px;
            direction: ltr;
            text-align: left;
        }
        .chat-input-area {
            display: flex;
            gap: 8px;
        }
        #chatInput {
            flex: 1;
            background: #0e1e26;
            border: 1px solid #178074;
            border-radius: 30px;
            padding: 12px 18px;
            color: white;
            font-size: 16px;
            outline: none;
        }
        #chatInput::placeholder {
            color: #6d9c96;
        }
        .send-btn {
            background: #00b8a2;
            border: none;
            border-radius: 40px;
            padding: 0 22px;
            color: black;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            transition: 0.2s;
        }
        .send-btn:hover {
            background: #00ffe0;
            box-shadow: 0 0 12px cyan;
        }
        small {
            color: #7ba39e;
            display: block;
            margin-top: 15px;
            text-align: center;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="logo">FADI-DISCOVERY</div>
    <div class="sub">اكشف السيرفارات التربية - اتصل بضغطك</div>

    <div class="buttons">
        <div id="btnCreate" class="btn">➕ إنشاء سيرفر</div>
        <div id="btnConnect" class="btn">🔍 البحث عن سيرفورات</div>
    </div>

    <!-- منطقة عرض المعرف والسيرفر -->
    <div id="serverPanel" class="server-box" style="display: none;">
        <div class="server-title">🖧 أنت الآن سيرفر مشغل</div>
        <div id="myPeerId" class="server-id">...</div>
        <div id="changeIdBtn" class="change-link">[ اضغط لتغيير ]</div>
        <div id="statusMessage" class="status">⏳ السيرفر جاهز - في انتظار المتصلين...</div>
    </div>

    <!-- منطقة الاتصال والدردشة -->
    <div id="chatSection" style="display: none;">
        <div class="chat-box">
            <div id="chatLog" class="chat-log">
                ⚡ نظام الاتصال المباشر جاهز.
            </div>
            <div class="chat-input-area">
                <input type="text" id="chatInput" placeholder="اكتب رسالة..." autocomplete="off">
                <button id="sendBtn" class="send-btn">إرسال</button>
            </div>
        </div>
    </div>

    <small>اتصال حقيقي P2P عبر الإنترنت - يشبه الزابيا بالضبط</small>
</div>

<!-- مكتبة PeerJS للاتصال المباشر -->
<script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
<script>
    (function(){
        "use strict";

        // ---------- عناصر الواجهة ----------
        const btnCreate = document.getElementById('btnCreate');
        const btnConnect = document.getElementById('btnConnect');
        const serverPanel = document.getElementById('serverPanel');
        const myPeerIdEl = document.getElementById('myPeerId');
        const changeIdBtn = document.getElementById('changeIdBtn');
        const statusEl = document.getElementById('statusMessage');
        const chatSection = document.getElementById('chatSection');
        const chatLog = document.getElementById('chatLog');
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');

        // ---------- متغيرات الاتصال ----------
        let peer = null;           // كائن PeerJS
        let currentPeerId = '';    // معرفي الحقيقي
        let conn = null;          // قناة الاتصال مع الطرف الآخر
        let isServer = false;     // هل أنا منشئ السيرفر؟
        let isConnected = false;  // هل تم الاتصال مع الطرف الآخر؟

        // ---------- دالة إنشاء Peer جديد ----------
        function createPeer(customId = null) {
            if (peer && !peer.destroyed) {
                peer.destroy();
            }

            // خيارات الاتصال - iceServers تساعد على الاتصال حتى خلف الشبكات الصعبة
            const peerOptions = {
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'stun:stun2.l.google.com:19302' },
                        { urls: 'stun:stun3.l.google.com:19302' },
                        { urls: 'stun:stun4.l.google.com:19302' },
                        { urls: 'stun:stun.services.mozilla.com' },
                        { urls: 'stun:stun.stunprotocol.org:3478' },
                        {
                            urls: 'turn:turn.example.com', // للضرورة لكن بدون كلمة سر يعمل بشكل محدود
                            username: 'webrtc',
                            credential: 'webrtc'
                        }
                    ]
                },
                debug: 1
            };

            if (customId) {
                peer = new Peer(customId, peerOptions);
            } else {
                peer = new Peer(peerOptions); // ID عشوائي
            }

            // ---------- حدث فتح الاتصال (تم إنشاء المعرف) ----------
            peer.on('open', (id) => {
                currentPeerId = id;
                myPeerIdEl.textContent = id;
                serverPanel.style.display = 'block';
                statusEl.innerHTML = '⏳ السيرفر شغال - في انتظار المتصلين...';
                // إذا كان أنا منشئ السيرفر، خليني في وضع الاستماع
                if (isServer) {
                    waitForConnection();
                }
            });

            // ---------- استقبال اتصال واردة ----------
            peer.on('connection', (incomingConn) => {
                if (conn && conn.open) {
                    // إذا في اتصال قديم، نرفض الواحد الجديد أو نقفل القديم.
                    incomingConn.close();
                    return;
                }
                conn = incomingConn;
                setupConnection(conn, false); // false يعني أنا السيرفر والمتصل هو العميل
            });

            peer.on('error', (err) => {
                console.log('⚠️ Peer error:', err);
                if (err.type === 'unavailable-id' || err.type === 'id-taken') {
                    statusEl.innerHTML = '❌ المعرف مستخدم، جرب معرف آخر';
                } else {
                    statusEl.innerHTML = '⚠️ خطأ في الاتصال: ' + (err.message || 'غير معروف');
                }
            });

            peer.on('disconnected', () => {
                if (isConnected) return;
                statusEl.innerHTML = '⚠️ فقدان الاتصال بالخادم المساعد، حاول إعادة الاتصال.';
            });
        }

        // ---------- وظيفة انتظار المتصلين (للسيرفر) ----------
        function waitForConnection() {
            // لا نحتاج شيئًا هنا، peer.on('connection') هو اللي يشغل.
            // فقط نغير النصوص
            if (isServer) {
                statusEl.innerHTML = '🟢 السيرفر شغال - معرفك: ' + currentPeerId + ' - في انتظار المتصل...';
            }
        }

        // ---------- إعداد قناة الاتصال بعد نجاح الاتصال ----------
        function setupConnection(connection, amIClient = true) {
            conn = connection;

            conn.on('open', () => {
                isConnected = true;
                statusEl.innerHTML = '✅ متصل مع: ' + conn.peer;
                chatSection.style.display = 'block';
                addChatMessage('🟢 تم الاتصال المباشر بنجاح (P2P عبر الإنترنت)');
                
                // إذا كنت أنا العميل (اللي بحث واتصل)، أخلي السيرفر يظهر لي واجهة الدردشة
                if (amIClient) {
                    serverPanel.style.display = 'block';
                    myPeerIdEl.textContent = peer.id; // أعرض معرفي
                }
            });

            conn.on('data', (data) => {
                // استقبال رسالة
                addChatMessage('📩 الطرف الآخر: ' + data);
            });

            conn.on('close', () => {
                isConnected = false;
                statusEl.innerHTML = '🔴 انقطع الاتصال';
                addChatMessage('🔴 انقطع الاتصال بالطرف الآخر');
                conn = null;
            });

            conn.on('error', (err) => {
                addChatMessage('⚠️ خطأ في القناة: ' + err);
            });
        }

        // ---------- إضافة رسالة إلى شاشة الدردشة ----------
        function addChatMessage(msg) {
            const p = document.createElement('div');
            p.textContent = msg;
            p.style.marginBottom = '5px';
            p.style.borderBottom = '1px solid #2c5f5a';
            p.style.paddingBottom = '4px';
            chatLog.appendChild(p);
            chatLog.scrollTop = chatLog.scrollHeight;
        }

        // ---------- دالة الاتصال بسيرفر آخر (البحث عن سيرفورات) ----------
        function connectToPeer(targetId) {
            if (!peer || peer.destroyed) {
                alert('الرجاء إنشاء سيرفر أولاً');
                return;
            }
            if (!targetId || targetId.trim() === '') {
                alert('الرجاء إدخال معرف السيرفر');
                return;
            }

            statusEl.innerHTML = '⏳ جاري الاتصال بالمعرف: ' + targetId + '...';
            
            // محاولة الاتصال
            const connection = peer.connect(targetId, {
                reliable: true,
                serialization: 'json'
            });

            if (!connection) {
                statusEl.innerHTML = '❌ فشل بدء الاتصال';
                return;
            }

            setupConnection(connection, true); // أنا العميل
        }

        // ---------- الأحداث الخاصة بالأزرار ----------
        btnCreate.addEventListener('click', function() {
            isServer = true;
            // إنشاء سيرفر بهوية جديدة
            createPeer();  // معرف عشوائي
            chatSection.style.display = 'none'; // نخفي الدردشة لحين الاتصال
            // إعادة تعيين الرسالة
            addChatMessage('⚡ جاهز لاستقبال المتصلين...');
            chatLog.innerHTML = '⚡ جاهز لاستقبال المتصلين...\n';
        });

        btnConnect.addEventListener('click', function() {
            isServer = false;
            // المستخدم يريد الاتصال بسيرفر آخر
            const targetId = prompt('أدخل معرف السيرفر (الرقم الظاهر في شاشة الطرف الآخر):');
            if (targetId && targetId.trim() !== '') {
                // تأكد من وجود peer
                if (!peer || peer.destroyed) {
                    // أنشئ peer بدون معرف محدد (عشوائي)
                    createPeer();
                    // نعطيه وقت لحد ما يفتح ثم نكمل الاتصال
                    peer.once('open', () => {
                        connectToPeer(targetId.trim());
                    });
                } else {
                    connectToPeer(targetId.trim());
                }
            }
        });

        // تغيير المعرف (اضغط لتغيير)
        changeIdBtn.addEventListener('click', function() {
            if (!isServer) {
                alert('الرجاء إنشاء سيرفر أولاً');
                return;
            }
            const newId = prompt('أدخل معرف مخصص للسيرفر (أحرف/أرقام فقط):');
            if (newId && newId.trim() !== '') {
                isServer = true;
                createPeer(newId.trim());
            }
        });

        // إرسال الرسالة
        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        function sendMessage() {
            const msg = chatInput.value.trim();
            if (msg === '') return;
            if (!conn || !conn.open) {
                addChatMessage('⚠️ لا يوجد اتصال نشط');
                return;
            }
            try {
                conn.send(msg);
                addChatMessage('📤 أنت: ' + msg);
                chatInput.value = '';
            } catch (e) {
                addChatMessage('⚠️ فشل الإرسال: ' + e);
            }
        }

        // تنظيف عند إغلاق الصفحة
        window.addEventListener('beforeunload', function() {
            if (peer && !peer.destroyed) {
                peer.destroy();
            }
        });

        // رسالة ترحيب
        console.log('✅ جاهز، اضغط إنشاء سيرفر للبدء');
    })();
</script>

</body>
</html>
'''

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
