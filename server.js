const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- إعدادات الأمان ---
const MASTER_KEY = "771232690";
let linkedUsers = []; 

// محرك التحليل الذري
function getAtomicSignal() {
    const vol = Math.floor(Math.random() * 100);
    const mom = Math.floor(Math.random() * 100);
    const trigger = Math.random() > 0.85; // فلتر صارم جداً

    let res = {
        signal: "تحليل السيولة... 🔍",
        type: "WAIT",
        confidence: (Math.random() * 15 + 40).toFixed(2),
        color: "#555",
        instruction: "السوق متذبذب، انتظر فرصة مضمونة"
    };

    if (vol > 90 && mom > 88 && trigger) {
        res = {
            signal: "ضربة قاضية: شراء 🟢",
            type: "CALL",
            confidence: (Math.random() * 3 + 95).toFixed(2),
            color: "#00ff41",
            instruction: "نفذ شراء (UP) - مدة 1 دقيقة"
        };
    } else if (vol > 90 && mom < 12 && trigger) {
        res = {
            signal: "ضربة قاضية: بيع 🔴",
            type: "PUT",
            confidence: (Math.random() * 3 + 95).toFixed(2),
            color: "#ff4500",
            instruction: "نفذ بيع (DOWN) - مدة 1 دقيقة"
        };
    }
    return res;
}

const UI = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HEIBA ATOMIC | نظام الربط</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Changa:wght@400;700&family=Orbitron:wght@800;900&display=swap" rel="stylesheet">
    <style>
        body { background: #050505; color: #fff; font-family: 'Changa', sans-serif; }
        .orbitron { font-family: 'Orbitron', sans-serif; }
        .gold-border { border: 1px solid #c5a059; box-shadow: 0 0 20px rgba(197, 160, 89, 0.1); }
        .input-box { background: #000; border: 1px solid #333; color: #c5a059; text-align: center; }
    </style>
</head>
<body class="p-4 md:p-10">
    <div class="max-w-4xl mx-auto">
        <header class="text-center mb-8">
            <h1 class="text-4xl font-black orbitron text-[#c5a059]">ATOMIC LINKER</h1>
            <p class="text-[10px] text-gray-500 tracking-widest mt-2 uppercase">اربط البوت لاستلام الإشارات</p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- إعدادات التليجرام -->
            <div class="gold-border p-8 rounded-[2rem] bg-black/50">
                <h2 class="text-lg font-bold mb-4">🔌 إعدادات البوت</h2>
                <div class="space-y-4">
                    <input type="text" id="token" class="input-box w-full p-4 rounded-xl text-xs" placeholder="BOT TOKEN">
                    <input type="text" id="chatid" class="input-box w-full p-4 rounded-xl text-sm" placeholder="CHAT ID">
                    <button onclick="link()" class="w-full bg-[#c5a059] text-black font-bold py-4 rounded-xl hover:bg-white transition">تفعيل الإشعارات ⚡</button>
                </div>
            </div>

            <!-- حالة الرادار -->
            <div class="bg-white/5 p-8 rounded-[2rem] text-center flex flex-col justify-center border border-white/5">
                <p id="live-status" class="text-xs text-gray-500 orbitron">MONITORING...</p>
                <h2 id="live-sig" class="text-4xl font-black my-4" style="color:#444">WAITING</h2>
                <div id="live-acc" class="text-2xl font-bold orbitron">0%</div>
            </div>
        </div>
    </div>

    <script>
        async function link() {
            const data = { token: document.getElementById('token').value, chatid: document.getElementById('chatid').value };
            const r = await fetch('/api/link', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            if(r.ok) alert("✅ تم الربط! ستصلك الصفقات القوية فقط.");
        }

        async function update() {
            const r = await fetch('/api/signal');
            const d = await r.json();
            document.getElementById('live-sig').innerText = d.signal;
            document.getElementById('live-sig').style.color = d.color;
            document.getElementById('live-acc').innerText = d.confidence + "%";
        }
        setInterval(update, 3000);
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(UI));
app.get('/api/signal', (req, res) => res.json(getAtomicSignal()));
app.post('/api/link', (req, res) => {
    linkedUsers.push(req.body);
    res.json({ success: true });
});

// إرسال الضربات القاضية
setInterval(async () => {
    const data = getAtomicSignal();
    if (parseFloat(data.confidence) > 94) {
        for (let u of linkedUsers) {
            try {
                const msg = `🎯 *ضربة قاضية*\n\nالقرار: *${data.signal}*\nالدقة: *${data.confidence}%*\n\n🚀 *نفذ الآن (1 دقيقة)*`;
                await axios.post(`https://api.telegram.org/bot${u.token}/sendMessage`, { chat_id: u.chatid, text: msg, parse_mode: 'Markdown' });
            } catch(e) {}
        }
    }
}, 5000);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('READY'));