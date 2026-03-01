from flask import Flask, render_template_string
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template_string(HTML_CODE)

HTML_CODE = '''
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>👑 FADI SYSTEM PRO</title>
    <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
    <style>
        :root { --fadi-gold: #ffcc00; --fadi-neon: #00ffe0; --fadi-bg: #05080a; }
        body { background: var(--fadi-bg); color: white; font-family: sans-serif; margin: 0; padding: 10px; height: 100vh; display: flex; flex-direction: column; }
        .box { background: #161b22; padding: 15px; border-radius: 12px; border: 1px solid var(--fadi-neon); margin-bottom: 10px; }
        input { width: 85%; padding: 10px; margin: 5px 0; border-radius: 5px; background: #000; color: #fff; border: 1px solid #333; }
        .btn { background: var(--fadi-gold); color: #000; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; border: none; width: 100%; }
        #chat { flex: 1; overflow-y: auto; background: rgba(0,0,0,0.3); border-radius: 10px; padding: 10px; border: 1px solid #222; margin: 10px 0; }
        .msg { padding: 8px; margin: 5px 0; border-radius: 8px; max-width: 80%; font-size: 14px; }
        .msg.me { background: #1d2a35; align-self: flex-start; border-right: 3px solid var(--fadi-neon); }
        .msg.other { background: #21262d; align-self: flex-end; border-left: 3px solid #58a6ff; }
        .controls { display: flex; gap: 5px; background: #161b22; padding: 10px; border-radius: 12px; }
        .icon-btn { background: #222; border: 1px solid var(--fadi-gold); color: var(--fadi-gold); width: 45px; height: 45px; border-radius: 50%; font-size: 20px; }
        #videoArea { display: none; width: 100%; height: 180px; background: #000; border-radius: 10px; overflow: hidden; position: relative; }
        #remoteVid { width: 100%; height: 100%; object-fit: cover; }
        #localVid { width: 60px; height: 45px; position: absolute; bottom: 5px; right: 5px; border: 1px solid var(--fadi-neon); }
    </style>
</head>
<body>
    <div class="box" id="setup">
        <input type="text" id="userName" placeholder="اسمك">
        <input type="text" id="roomNum" placeholder="رقم الغرفة">
        <button class="btn" onclick="initFadi()">🚀 دخول المنظومة</button>
    </div>
    <div id="videoArea"><video id="remoteVid" autoplay playsinline></video><video id="localVid" autoplay muted playsinline></video></div>
    <div id="chat" style="display: flex; flex-direction: column;"></div>
    <audio id="remoteVoice" autoplay></audio>
    <div class="controls" id="inputSection" style="display:none;">
        <button class="icon-btn" onclick="callAll(false)">📞</button>
        <button class="icon-btn" onclick="callAll(true)">🎥</button>
        <input type="text" id="msgInput" placeholder="اكتب..." style="flex:1;">
        <button class="btn" style="width: 60px;" onclick="send()">إرسال</button>
    </div>
<script>
    let peer, myName, myRoom, conns = [];
    const cfg = { config: { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }, { 'urls': 'turn:openrelay.metered.ca:80', 'username': 'openrelayproject', 'credential': 'openrelayproject' }] } };

    function initFadi() {
        myName = document.getElementById('userName').value;
        myRoom = document.getElementById('roomNum').value;
        if(!myName || !myRoom) return;
        document.getElementById('setup').style.display = 'none';
        document.getElementById('inputSection').style.display = 'flex';
        peer = new Peer(myRoom, cfg);
        peer.on('open', () => {
            log("✅ جاهز!", "sys");
            peer.on('connection', c => { conns.push(c); setupConn(c); });
            peer.on('call', call => { if(confirm("رد؟")) { navigator.mediaDevices.getUserMedia({audio:true, video:!!call.metadata?.video}).then(s => { if(call.metadata?.video){document.getElementById('videoArea').style.display='block'; document.getElementById('localVid').srcObject=s;} call.answer(s); setupCall(call); }); } });
        });
        peer.on('error', e => { if(e.type==='unavailable-id'){ peer = new Peer('g-'+Math.floor(Math.random()*99), cfg); peer.on('open', () => { let c = peer.connect(myRoom); conns.push(c); setupConn(c); }); } });
    }

    function setupConn(c) {
        c.on('open', () => { c.on('data', d => { if(d.type==='msg') log(d.text, "other", d.user); }); });
    }

    function setupCall(call) {
        call.on('stream', rs => { if(call.metadata?.video) document.getElementById('remoteVid').srcObject=rs; else document.getElementById('remoteVoice').srcObject=rs; });
    }

    function callAll(v) {
        navigator.mediaDevices.getUserMedia({audio:true, video:v}).then(s => { if(v){document.getElementById('videoArea').style.display='block'; document.getElementById('localVid').srcObject=s;} conns.forEach(c => { let call = peer.call(c.peer, s, {metadata:{video:v}}); setupCall(call); }); });
    }

    function send() {
        let m = document.getElementById('msgInput').value;
        conns.forEach(c => c.send({type:'msg', user:myName, text:m}));
        log(m, "me", myName); document.getElementById('msgInput').value="";
    }

    function log(m, t, u) {
        let d = document.createElement('div'); d.className=`msg ${t}`; d.innerHTML= u?`<b>${u}:</b><br>${m}`:m;
        document.getElementById('chat').appendChild(d);
    }
</script>
</body>
</html>
'''

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
