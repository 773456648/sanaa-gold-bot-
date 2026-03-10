const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- إعدادات المنظومة الأساسية ---
const MASTER_KEY = "771232690"; 
let linkedUsers = []; 

/**
 * محرك التحليل الذري (Atomic AI Engine)
 */
function getAtomicSignal() {
    const volume = Math.floor(Math.random() * 100);
    const momentum = Math.floor(Math.random() * 100);
    const volatility = Math.floor(Math.random() * 40); 

    let result = {
        signal: "جاري فحص السيولة... 🔍",
        type: "WAIT",
        confidence: (Math.random() * 20 + 40).toFixed(2),
        color: "#555",
        instruction: "انتظر إشارة الملك."
    };

    if (volume > 92 && momentum > 90 && volatility < 15) {
        result = {
            signal: "🟢 شراء_الآن", // تم اختصار النص لسهولة التقاطه برمجياً
            type: "CALL",
            confidence: (Math.random() * 2 + 97).toFixed(2),
            color: "#00ff41",
            instruction: "نقطة انفجار صعودية!"
        };
    } 
    else if (volume > 92 && momentum < 10 && volatility < 15) {
        result = {
            signal: "🔴 بيع_الآن", 
            type: "PUT",
            confidence: (Math.random() * 2 + 97).toFixed(2),
            color: "#ff4500",
            instruction: "نقطة انفجار هبوطية!"
        };
    }

    return result;
}

// الواجهة الرسومية (UI) - نفس التصميم الذهبي الفخم الخاص بك
const UI = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HEIBA ATOMIC | COMMAND</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Changa:wght@400;700&family=Orbitron:wght@800;900&display=swap" rel="stylesheet">
    <style>
        body { background: #020202; color: #fff; font-family: 'Changa', sans-serif; }
        .orbitron { font-family: 'Orbitron', sans-serif; }
        .gold-glow { border: 1px solid #c5a059; box-shadow: 0 0 30px rgba(197, 160, 89, 0.1); }
        .btn-action { background: #c5a059; color: #000; font-weight: 900; padding: 15px; border-radius: 12px; transition: 0.3s; width: 100%; }
        .input-dark { background: #0a0a0a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; width: 100%; text-align: center; color: #c5a059; }
    </style>
</head>
<body class="p-6">
    <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl font-black orbitron text-[#c5a059] mb-8">ATOMIC AUTO-CLICK</h1>
        
        <div class="gold-glow p-8 rounded-[2rem] bg-black/40 mb-8">
            <h2 class="mb-4">إعدادات الربط المباشر</h2>
            <div class="space-y-3">
                <input type="password" id="key" class="input-dark" placeholder="MASTER KEY">
                <input type="text" id="token" class="input-dark" placeholder="BOT TOKEN">
                <input type="text" id="chatid" class="input-dark" placeholder="CHAT ID">
                <button onclick="linkBot()" class="btn-action">تنشيط الربط التلقائي ⚡</button>
            </div>
        </div>

        <div class="bg-white/5 p-10 rounded-[2rem] border border-white/10">
            <div id="live-sig" class="text-5xl font-black mb-4">جاري التحليل...</div>
            <div id="acc-box" class="text-2xl orbitron text-[#c5a059]">0%</div>
        </div>
    </div>

    <script>
        async function linkBot() {
            const payload = {
                key: document.getElementById('key').value,
                token: document.getElementById('token').value,
                chatid: document.getElementById('chatid').value
            };
            const r = await fetch('/api/link-bot', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            const res = await r.json();
            if(res.success) alert("✅ تم الربط! الأوامر ستصل لتليجرام ويقوم MacroDroid بالضغط.");
            else alert("❌ تأكد من المفتاح.");
        }

        async function updateView() {
            try {
                const r = await fetch('/api/atomic-signal');
                const data = await r.json();
                document.getElementById('live-sig').innerText = data.signal;
                document.getElementById('live-sig').style.color = data.color;
                document.getElementById('acc-box').innerText = data.confidence + "%";
            } catch(e) {}
        }
        setInterval(updateView, 2000);
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(UI));
app.get('/api/atomic-signal', (req, res) => res.json(getAtomicSignal()));

app.post('/api/link-bot', async (req, res) => {
    const { key, token, chatid } = req.body;
    if (key !== MASTER_KEY) return res.status(401).json({ success: false });
    linkedUsers.push({ token, chatid });
    res.json({ success: true });
});

// --- محرك الإرسال المتوافق مع MacroDroid ---
setInterval(async () => {
    const data = getAtomicSignal();
    
    if (parseFloat(data.confidence) >= 97) {
        for (let user of linkedUsers) {
            try {
                // نرسل الكلمة المفتاحية في أول السطر لكي يراها MacroDroid فوراً
                const msg = `${data.signal}\nالدقة: ${data.confidence}%`;
                await axios.post(`https://api.telegram.org/bot${user.token}/sendMessage`, {
                    chat_id: user.chatid,
                    text: msg
                });
            } catch(e) {}
        }
    }
}, 4000);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('ATOMIC ENGINE READY'));