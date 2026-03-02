from flask import Flask, render_template_string, request, jsonify
import os, socket, requests, random, string

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
        .card { background: rgba(255,255,255,0.05); border: 2px solid gold; border-radius: 20px; padding: 20px; max-width: 500px; margin: auto; }
        input { width: 80%; padding: 10px; margin: 10px; border-radius: 10px; border: 1px solid gold; background: #000; color: white; }
        .btn { background: gold; color: black; padding: 12px 25px; border: none; border-radius: 20px; cursor: pointer; font-weight: bold; }
        #vArea { display: none; margin-top: 20px; }
        video { width: 45%; border: 1px solid cyan; border-radius: 10px; background: #000; }
        .chat { height: 200px; overflow-y: auto; border: 1px solid #333; margin: 10px 0; padding: 10px; text-align: right; }
    </style>
</head>
<body>
    <div class="card" id="entry">
        <h1 style="color:gold">👑 FADI GOLD</h1>
        <p id="srvId" style="color:cyan">جاري التحميل...</p>
        <input type="text" id="uName" placeholder="اسمك يا بطل">
        <input type="text" id="uRoom" placeholder="رقم الغرفة">
        <button class="btn" onclick="start()">دخول 🚀</button>
    </div>

    <div class="card" id="main" style="display:none">
        <h2 id="roomTitle"></h2>
        <div id="vArea">
            <video id="lVid" autoplay muted playsinline></video>
            <video id="rVid" autoplay playsinline></video>
        </div>
        <div class="chat" id="chat"></div>
        <input type="text" id="msgI" placeholder="اكتب رسالة...">
        <button class="btn" onclick="send()">إرسال</button>
        <button class="btn" onclick="call()" style="background:cyan">اتصال 📞</button>
    </div>

    <script>
        let peer, conn, myStream;
        fetch('/api/server-info').then(r=>r.json()).then(d=>document.getElementById('srvId').innerText="ID: "+d.server_id);

        function start() {
            const name = document.getElementById('uName').value;
            const room = document.getElementById('uRoom').value;
            if(!name || !room) return alert("املا البيانات!");
            
            peer = new Peer('FADI-'+room+'-'+name);
            peer.on('open', id => {
                document.getElementById('entry').style.display='none';
                document.getElementById('main').style.display='block';
                document.getElementById('roomTitle').innerText="غرفة: "+room;
            });
            peer.on('connection', c => { conn = c; setup(); });
            peer.on('call', async call => {
                if(confirm("مكالمة واردة؟")) {
                    myStream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
                    document.getElementById('vArea').style.display='block';
                    document.getElementById('lVid').srcObject = myStream;
                    call.answer(myStream);
                    call.on('stream', s => document.getElementById('rVid').srcObject = s);
                }
            });
        }

        async function call() {
            const friend = prompt("ادخل اسم الصديق اللي في الغرفة:");
            myStream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
            document.getElementById('vArea').style.display='block';
            document.getElementById('lVid').srcObject = myStream;
            const c = peer.call('FADI-'+document.getElementById('uRoom').value+'-'+friend, myStream);
            c.on('stream', s => document.getElementById('rVid').srcObject = s);
        }

        function send() {
            const txt = document.getElementById('msgI').value;
            const msg = document.createElement('p'); msg.innerText = "أنا: " + txt;
            document.getElementById('chat').appendChild(msg);
            document.getElementById('msgI').value = '';
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
