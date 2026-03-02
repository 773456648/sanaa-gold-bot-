from flask import Flask, render_template_string, request, jsonify
import os, requests, random, string

app = Flask(__name__)

def generate_server_id():
    try:
        ip = requests.get('https://api.ipify.org', timeout=5).text.strip().replace('.', 'x')
    except:
        ip = "local"
    return f"GOLD-{ip}-{''.join(random.choices(string.ascii_uppercase, k=4))}"

HTML_CODE = """
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>💎 FADI GOLD</title>
    <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
    <style>
        body { background: #0b0719; color: white; font-family: sans-serif; text-align: center; padding: 20px; }
        .card { background: rgba(255,255,255,0.05); border: 2px solid gold; border-radius: 20px; padding: 20px; max-width: 500px; margin: auto; box-shadow: 0 0 20px rgba(255,215,0,0.2); }
        input { width: 85%; padding: 12px; margin: 10px; border-radius: 25px; border: 1px solid gold; background: #000; color: white; outline: none; }
        .btn { background: linear-gradient(gold, #ffcc00); color: black; padding: 12px 30px; border: none; border-radius: 25px; cursor: pointer; font-weight: bold; margin: 5px; transition: 0.3s; }
        .btn:hover { transform: scale(1.05); box-shadow: 0 0 15px gold; }
        #vArea { display: none; margin-top: 20px; gap: 10px; justify-content: center; }
        video { width: 45%; border: 2px solid cyan; border-radius: 15px; background: #000; }
        .chat { height: 250px; overflow-y: auto; border: 1px solid #444; margin: 15px 0; padding: 15px; text-align: right; background: rgba(0,0,0,0.3); border-radius: 15px; }
        .system-msg { color: gold; font-size: 0.8em; text-align: center; display: block; margin: 5px 0; }
    </style>
</head>
<body>
    <div class="card" id="entry">
        <h1 style="color:gold">👑 FADI GOLD</h1>
        <p id="srvId" style="color:cyan; font-family: monospace;">جاري استخراج المعرف...</p>
        <input type="text" id="uName" placeholder="اسمك المستعار">
        <input type="text" id="uRoom" placeholder="رقم الغرفة (مثلاً: 101)">
        <button class="btn" onclick="start()">دخول العالم الذهبي 🚀</button>
    </div>

    <div class="card" id="main" style="display:none; max-width: 800px;">
        <h2 id="roomTitle" style="color:gold"></h2>
        <div id="vArea">
            <video id="lVid" autoplay muted playsinline></video>
            <video id="rVid" autoplay playsinline></video>
        </div>
        <div class="chat" id="chat"></div>
        <div style="display:flex; gap:5px; align-items:center;">
            <input type="text" id="msgI" placeholder="اكتب رسالة..." style="margin:0; flex:1;">
            <button class="btn" onclick="send()" style="padding:10px 20px;">ارسل</button>
        </div>
        <div style="margin-top:15px;">
            <button class="btn" onclick="makeCall()" style="background:cyan">اتصال فيديو 📹</button>
            <button class="btn" onclick="location.reload()" style="background:red; color:white;">خروج 🚪</button>
        </div>
    </div>

    <script>
        let peer, conn, myStream;
        fetch('/api/server-info').then(r=>r.json()).then(d=>document.getElementById('srvId').innerText="Server ID: "+d.server_id);

        function start() {
            const name = document.getElementById('uName').value.trim();
            const room = document.getElementById('uRoom').value.trim();
            if(!name || !room) return alert("يا خبير، سجل اسمك ورقم الغرفة!");
            
            peer = new Peer('FADI-'+room+'-'+name);
            
            peer.on('open', id => {
                document.getElementById('entry').style.display='none';
                document.getElementById('main').style.display='block';
                document.getElementById('roomTitle').innerText="غرفة ذهبية رقم: "+room;
                addMsg('system', 'تم الدخول بنجاح كـ ' + name);
            });

            peer.on('connection', c => {
                conn = c;
                conn.on('data', data => {
                    if(data.type === 'msg') addMsg('other', data.user + ": " + data.txt);
                });
            });

            peer.on('call', async call => {
                if(confirm("مكالمة فيديو واردة.. تشتي ترد؟")) {
                    myStream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
                    document.getElementById('vArea').style.display='flex';
                    document.getElementById('lVid').srcObject = myStream;
                    call.answer(myStream);
                    call.on('stream', s => document.getElementById('rVid').srcObject = s);
                }
            });
        }

        async function makeCall() {
            const friend = prompt("اكتب اسم صديقك الموجود في الغرفة حالياً:");
            if(!friend) return;
            try {
                myStream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
                document.getElementById('vArea').style.display='flex';
                document.getElementById('lVid').srcObject = myStream;
                const destId = 'FADI-'+document.getElementById('uRoom').value+'-'+friend;
                const call = peer.call(destId, myStream);
                call.on('stream', s => document.getElementById('rVid').srcObject = s);
            } catch(e) { alert("تأكد من إذن الكاميرا!"); }
        }

        function send() {
            const txt = document.getElementById('msgI').value;
            const name = document.getElementById('uName').value;
            if(!txt) return;
            if(conn) conn.send({type:'msg', user:name, txt:txt});
            addMsg('me', "أنا: " + txt);
            document.getElementById('msgI').value = '';
        }

        function addMsg(type, text) {
            const p = document.createElement('p');
            p.className = type === 'system' ? 'system-msg' : '';
            p.innerText = text;
            const chat = document.getElementById('chat');
            chat.appendChild(p);
            chat.scrollTop = chat.scrollHeight;
        }
    </script>
</body>
</html>
"""

@app.route('/')
def index(): return render_template_string(HTML_CODE)

@app.route('/api/server-info')
def srv(): return jsonify({'server_id': generate_server_id()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 10000)))
