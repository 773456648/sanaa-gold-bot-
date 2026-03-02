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
    <title>💎 FADI CONNECT | منصة الاتصالات</title>
    <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, sans-serif; }
        body { background: linear-gradient(135deg, #0b0719, #1a0f2e); min-height: 100vh; padding: 20px; color: white; position: relative; overflow-x: hidden; }
        .bg-glow { position: fixed; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 50%); animation: rotate 20s linear infinite; z-index: -2; }
        .bg-particles { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: url('data:image/svg+xml;utf8,<svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><circle cx="15" cy="15" r="1" fill="rgba(255,215,0,0.3)"/></svg>'); opacity: 0.5; z-index: -1; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .glass-card { background: rgba(20, 15, 40, 0.6); backdrop-filter: blur(15px); border: 1.5px solid rgba(255, 215, 0, 0.4); border-radius: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(255,215,0,0.2); padding: 30px; margin-bottom: 20px; transition: all 0.4s; }
        .glass-card:hover { border-color: gold; box-shadow: 0 20px 60px rgba(255,215,0,0.3); }
        .royal-header { text-align: center; margin-bottom: 30px; position: relative; }
        .royal-header h1 { font-size: 2.8em; background: linear-gradient(135deg, #ffd700, #ffb347, #ff8c00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 40px rgba(255,215,0,0.5); margin-bottom: 10px; letter-spacing: 2px; }
        .crown-icon { font-size: 3em; animation: crownFloat 3s ease-in-out infinite; display: inline-block; filter: drop-shadow(0 0 20px gold); }
        @keyframes crownFloat { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(5deg); } }
        .status-bar { display: flex; justify-content: center; gap: 30px; margin-top: 20px; }
        .status-item { background: rgba(0,0,0,0.4); border-radius: 50px; padding: 10px 25px; border: 1px solid gold; display: flex; align-items: center; gap: 10px; }
        .online-dot { width: 12px; height: 12px; background: #00ff88; border-radius: 50%; box-shadow: 0 0 20px #00ff88; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
        .elegant-input { width: 100%; padding: 18px 25px; margin: 12px 0; background: rgba(0, 0, 0, 0.6); border: 2px solid rgba(255, 215, 0, 0.5); border-radius: 60px; color: white; font-size: 1.1em; transition: all 0.3s; }
        .elegant-input:focus { outline: none; border-color: #ffd700; box-shadow: 0 0 40px rgba(255,215,0,0.4); transform: scale(1.02); }
        .royal-btn { width: 100%; padding: 18px; margin: 10px 0; background: linear-gradient(145deg, #1a1f35, #0f1220); border: 2px solid #ffd700; color: #ffd700; border-radius: 60px; font-size: 1.3em; font-weight: bold; cursor: pointer; transition: all 0.3s; text-shadow: 0 0 15px gold; box-shadow: 0 10px 30px rgba(255,215,0,0.2); position: relative; overflow: hidden; }
        .royal-btn:hover { transform: translateY(-5px); box-shadow: 0 20px 50px gold; background: linear-gradient(145deg, #0f1220, #1a1f35); }
        .toolbar-panel { display: flex; justify-content: center; gap: 20px; margin: 25px 0; flex-wrap: wrap; }
        .tool-icon { width: 75px; height: 75px; border-radius: 50%; background: linear-gradient(145deg, #1a1f35, #0f1220); border: 3px solid gold; color: gold; font-size: 2.2em; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; box-shadow: 0 5px 20px rgba(255,215,0,0.3); }
        .tool-icon:hover { transform: scale(1.15) rotate(8deg); border-color: cyan; color: cyan; box-shadow: 0 0 50px cyan; }
        .tool-icon.active { background: gold; color: #1a1f35; border-color: white; }
        .video-studio { display: none; grid-template-columns: 2fr 1fr; gap: 15px; margin: 20px 0; background: rgba(0,0,0,0.7); border-radius: 40px; padding: 20px; border: 2px solid gold; }
        .remote-vid { width: 100%; height: 300px; background: #000; border-radius: 30px; overflow: hidden; border: 3px solid gold; box-shadow: 0 0 40px gold; }
        .remote-vid video { width: 100%; height: 100%; object-fit: cover; }
        .local-vid { width: 100%; height: 150px; background: #000; border-radius: 20px; overflow: hidden; border: 2px solid cyan; box-shadow: 0 0 30px cyan; }
        .local-vid video { width: 100%; height: 100%; object-fit: cover; }
        .chat-lounge { background: rgba(10, 5, 20, 0.7); backdrop-filter: blur(10px); border: 2px solid rgba(255,215,0,0.5); border-radius: 40px; padding: 20px; height: 350px; overflow-y: auto; margin: 25px 0; display: flex; flex-direction: column; }
        .message { padding: 15px 20px; margin: 10px 0; border-radius: 30px; max-width: 80%; animation: messageGlide 0.4s; }
        @keyframes messageGlide { 0% { opacity: 0; transform: translateX(30px); } 100% { opacity: 1; transform: translateX(0); } }
        .message.me { background: linear-gradient(135deg, #1a2f4a, #0f1f35); border-right: 5px solid cyan; align-self: flex-start; box-shadow: 0 5px 20px rgba(0,255,255,0.2); }
        .message.other { background: linear-gradient(135deg, #2a1f3a, #1a0f28); border-left: 5px solid gold; align-self: flex-end; box-shadow: 0 5px 20px rgba(255,215,0,0.2); }
        .message.system { background: rgba(255,215,0,0.1); border: 1px dashed gold; color: gold; text-align: center; max-width: 100%; }
        .msg-sender { font-weight: bold; color: gold; margin-bottom: 5px; font-size: 0.9em; }
        .msg-time { font-size: 0.7em; color: #888; margin-top: 5px; text-align: left; }
        .send-area { display: flex; gap: 15px; margin: 15px 0; }
        .send-input { flex: 1; padding: 18px 25px; background: rgba(0,0,0,0.6); border: 2px solid gold; border-radius: 60px; color: white; font-size: 1.1em; }
        .send-btn { width: 120px; background: linear-gradient(145deg, #1a1f35, #0f1220); border: 2px solid gold; color: gold; border-radius: 60px; font-size: 1.2em; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .send-btn:hover { background: gold; color: #1a1f35; box-shadow: 0 0 40px gold; }
        .control-panel { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
        .control-item { background: rgba(0,0,0,0.5); border: 1px solid gold; border-radius: 30px; padding: 20px; text-align: center; transition: 0.3s; }
        .control-item:hover { background: rgba(255,215,0,0.1); transform: translateY(-5px); }
        .control-value { font-size: 2.2em; font-weight: bold; color: gold; }
        .control-label { color: #aaa; margin-top: 5px; }
        .members-panel { background: rgba(0,0,0,0.5); border-radius: 30px; padding: 15px; margin: 20px 0; border: 1px solid cyan; }
        .member-item { display: flex; align-items: center; gap: 15px; padding: 12px; border-bottom: 1px solid rgba(255,215,0,0.2); }
        .member-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(145deg, #1a1f35, #0f1220); border: 2px solid gold; display: flex; align-items: center; justify-content: center; font-size: 1.3em; }
        .member-name { flex: 1; font-weight: bold; }
        .member-status { width: 10px; height: 10px; border-radius: 50%; background: #00ff88; box-shadow: 0 0 15px #00ff88; }
        .fadi-notification { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: linear-gradient(145deg, #1a1f35, #0f1220); border: 2px solid gold; border-radius: 60px; padding: 18px 40px; color: gold; font-size: 1.2em; box-shadow: 0 0 100px gold; z-index: 9999; animation: notifSlide 0.5s; }
        @keyframes notifSlide { 0% { top: -100px; opacity: 0; } 100% { top: 20px; opacity: 1; } }
        .footer-elegant { display: flex; justify-content: space-between; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 60px; margin-top: 30px; border: 1px solid gold; color: #aaa; }
    </style>
</head>
<body>
<div class="bg-glow"></div>
<div class="bg-particles"></div>
<div id="entryScreen" class="glass-card" style="max-width: 600px; margin: 40px auto;">
    <div class="royal-header"><div class="crown-icon">👑</div><h1>FADI CONNECT</h1><div style="color: cyan; margin-top: 5px;">منصة الاتصالات آمنة</div></div>
    <input type="text" class="elegant-input" id="loginName" placeholder="اسمك"><input type="text" class="elegant-input" id="loginRoom" placeholder="رقم الغرفة">
    <button class="royal-btn" onclick="enterFadiConnect()">🚀 ادخل إلى المنصة</button>
</div>
<div id="mainWorld" style="display: none;">
    <div class="glass-card"><div class="royal-header"><div class="crown-icon">👑</div><h1 id="worldTitle">FADI CONNECT</h1><div class="status-bar"><div class="status-item"><span class="online-dot"></span><span id="membersCount">1</span> متصل</div><div class="status-item"><span>💬</span><span id="messagesCount">0</span></div></div></div></div>
    <div class="toolbar-panel">
        <div class="tool-icon" onclick="showChat()" id="chatTool">💬</div>
        <div class="tool-icon" onclick="toggleMembers()" id="membersTool">👥</div>
        <div class="tool-icon" onclick="callVideo()" id="videoTool">📹</div>
        <div class="tool-icon" onclick="callAudio()" id="audioTool">🎤</div>
        <div class="tool-icon" onclick="shareScreen()" id="screenTool">🖥️</div>
        <div class="tool-icon" onclick="endCall()" id="endCallTool" style="display: none; color:red; border-color:red;">🛑</div>
    </div>
    <div class="video-studio" id="videoArea"><div class="remote-vid"><video id="remoteVideo" autoplay playsinline></video></div><div class="local-vid"><video id="localVideo" autoplay muted playsinline></video></div></div>
    <div class="members-panel" id="membersPanel" style="display: none;"><div id="membersList"></div></div>
    <div class="chat-lounge" id="chatArea"></div>
    <div class="send-area"><input type="text" class="send-input" id="messageInput" placeholder="اكتب رسالتك..." onkeypress="if(event.key==='Enter') sendMessage()"><button class="send-btn" onclick="sendMessage()">إرسال</button></div>
</div>
<audio id="remoteAudio" autoplay></audio>
<script>
    let peer, myName, myRoom, connections = [], members = [], currentCall, myStream, isHost = false, messageCount = 0;
    const chatArea = document.getElementById('chatArea');
    function enterFadiConnect() {
        myName = document.getElementById('loginName').value.trim();
        myRoom = document.getElementById('loginRoom').value.trim();
        if (!myName || !myRoom) return showNotification('اكتب البيانات!');
        document.getElementById('entryScreen').style.display = 'none';
        document.getElementById('mainWorld').style.display = 'block';
        document.getElementById('worldTitle').innerText = `FADI CONNECT | غرفة ${myRoom}`;
        tryHost();
        setTimeout(() => { addMessage('system', '✨ مرحباً بك في FADI CONNECT'); addMessage('system', '🌟 منصة اتصالات تم تصميمه من قبل فادي'); }, 500);
    }
    function tryHost() {
        peer = new Peer(myRoom);
        peer.on('open', () => { isHost = true; addMessage('system', '👑 أنت مضيف الغرفة'); updateMembersList(); peer.on('connection', c => { connections.push(c); setupConnection(c); }); peer.on('call', c => handleCall(c)); });
        peer.on('error', e => { if (e.type === 'unavailable-id') joinRoom(); });
    }
    function joinRoom() {
        peer = new Peer(myRoom + '-' + Math.floor(Math.random()*1000));
        peer.on('open', () => { addMessage('system', '✅ دخلت الغرفة'); const c = peer.connect(myRoom); connections.push(c); setupConnection(c); });
        peer.on('call', c => handleCall(c));
    }
    function setupConnection(c) {
        c.on('open', () => c.send({type:'join', user:myName, id:peer.id}));
        c.on('data', d => handleData(d));
    }
    function handleData(d) {
        if(isHost && d.type !== 'join') connections.forEach(c => c.send(d));
        if(d.type==='join') { members.push({name:d.user, id:d.id}); addMessage('system', `🌟 ${d.user} دخل`); updateMembersCount(); updateMembersList(); if(isHost) connections.forEach(c => c.send({type:'members', list:members})); }
        if(d.type==='msg') { addMessage('other', d.text, d.user); messageCount++; document.getElementById('messagesCount').innerText = messageCount; }
        if(d.type==='members') { members = d.list; updateMembersList(); updateMembersCount(); }
    }
    function sendMessage() {
        let text = document.getElementById('messageInput').value.trim();
        if(!text) return;
        addMessage('me', text, myName); messageCount++; document.getElementById('messagesCount').innerText = messageCount;
        connections.forEach(c => c.send({type:'msg', user:myName, text:text}));
        document.getElementById('messageInput').value = '';
    }
    function addMessage(type, text, user = '') {
        let d = document.createElement('div'); d.className = `message ${type}`;
        if(type==='system') d.innerText = text;
        else d.innerHTML = `<div class="msg-sender">${user}</div>${text}`;
        chatArea.appendChild(d); chatArea.scrollTop = chatArea.scrollHeight;
    }
    function showNotification(t) { let n = document.createElement('div'); n.className='fadi-notification'; n.innerText=t; document.body.appendChild(n); setTimeout(()=>n.remove(), 3000); }
    function updateMembersList() {
        let list = document.getElementById('membersList'); list.innerHTML = '';
        [{name:myName, id:peer.id}, ...members].forEach(m => {
            let i = document.createElement('div'); i.className = 'member-item';
            i.innerHTML = `<div class="member-avatar">👤</div><div class="member-name">${m.name}</div><div class="member-status"></div>`;
            list.appendChild(i);
        });
    }
    function updateMembersCount() { document.getElementById('membersCount').innerText = members.length + 1; }
    function callVideo() { startMedia(true); }
    function callAudio() { startMedia(false); }
    function startMedia(v) {
        navigator.mediaDevices.getUserMedia({video:v, audio:true}).then(s => {
            myStream = s; document.getElementById('videoArea').style.display='grid'; document.getElementById('localVideo').srcObject=s;
            connections.forEach(c => setupCall(peer.call(c.peer, s, {metadata:{video:v}}), v));
            document.getElementById('endCallTool').style.display='flex';
        }).catch(()=>showNotification('❌ خطأ في الكاميرا'));
    }
    function handleCall(call) { if(confirm('مكالمة واردة؟')) { navigator.mediaDevices.getUserMedia({video:true, audio:true}).then(s => { myStream=s; call.answer(s); setupCall(call, true); }); } }
    function setupCall(call, v) {
        currentCall = call; if(v) { document.getElementById('videoArea').style.display='grid'; document.getElementById('localVideo').srcObject=myStream; }
        call.on('stream', s => { if(v) document.getElementById('remoteVideo').srcObject=s; else document.getElementById('remoteAudio').srcObject=s; });
        document.getElementById('endCallTool').style.display='flex';
    }
    function endCall() { if(currentCall) currentCall.close(); if(myStream) myStream.getTracks().forEach(t=>t.stop()); document.getElementById('videoArea').style.display='none'; document.getElementById('endCallTool').style.display='none'; }
    function toggleMembers() { let p = document.getElementById('membersPanel'); p.style.display = p.style.display==='none'?'block':'none'; }
    function showChat() { document.getElementById('membersPanel').style.display='none'; }
    function shareScreen() { navigator.mediaDevices.getDisplayMedia({video:true}).then(s => { myStream=s; document.getElementById('videoArea').style.display='grid'; document.getElementById('localVideo').srcObject=s; connections.forEach(c => setupCall(peer.call(c.peer, s, {metadata:{video:true}}), true)); }); }
</script>
</body>
</html>
'''

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
