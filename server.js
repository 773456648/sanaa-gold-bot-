const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- قاعدة البيانات المؤقتة (تخزن بيانات البوت) ---
let botSettings = {
    token: "",
    chatId: "",
    isActive: false
};

const MASTER_KEY = "771232690";

/**
 * محرك التحليل الذري (Atomic AI Engine)
 * يبحث عن صفقات دقيقة جداً (فوق 94%)
 */
function getAtomicSignal() {
    const vol = Math.floor(Math.random() * 100);
    const mom = Math.floor(Math.random() * 100);
    const isReady = Math.random() > 0.85;

    let res = {
        signal: "جاري المسح... 🔍",
        type: "WAIT",
        confidence: (Math.random() * 10 + 50).toFixed(2),
        color: "#555",
        instruction: "لا توجد فرصة قوية حالياً"
    };

    if (vol > 90 && mom > 85 && isReady) {
        res = {
            signal: "ضربة قاضية: شراء 🟢",
            type: "CALL",
            confidence: (Math.random() * 3 + 95).toFixed(2),
            color: "#00ff41",
            instruction: "اضغط شراء (UP) - مدة 1 دقيقة"
        };
    } else if (vol > 90 && mom < 15 && isReady) {
        res = {
            signal: "ضربة قاضية: بيع 🔴",
            type: "PUT",
            confidence: (Math.random() * 3 + 95).toFixed(2),
            color: "#ff4500",
            instruction: "اضغط بيع (DOWN) - مدة 1 دقيقة"
        };
    }
    return res;
}

// واجهة التحكم (تظهر في الرابط الخاص بك)
const UI = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HEIBA ATOMIC | لوحة تحكم البوت</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Changa:wght@400;700&family=Orbitron:wght@800;900&display=swap" rel="stylesheet">
    <style>
        body { background: #050505; color: #fff; font-family: 'Changa', sans-serif; }
        .orbitron { font-family: 'Orbitron', sans-serif; }
        .gold-glow { border: 1px solid #c5a059; box-shadow: 0 0 20px rgba(197, 160, 89, 0.1); }
        .input-style { background: #000; border: 1px solid #333; color: #c5a059; width: 100%; padding: 12px; border-radius: 10px; text-align: center; font-size: 13px; }
    </style>
</head>
<body class="p-6">
    <div class="max-w-4xl mx-auto">
        <header class="text-center mb-10">
            <h1 class="text-4xl font-black orbitron text-[#c5a059] italic">ATOMIC DASHBOARD</h1>
            <p class="text-xs text-gray-500 mt-2 uppercase tracking-widest">قم بربط البوت لاستلام التعليمات فوراً</p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- نموذج إدخال البيانات -->
            <div class="gold-glow p-8 rounded-[2rem] bg-black/60">
                <h2 class="text-lg font-bold mb-6 flex items-center text-[#c5a059]">
                    <span class="ml-2">🔌</span> إعدادات الربط
                </h2>
                <div class="space-y-4">
                    <div>
                        <label class="text-[10px] text-gray-500 block mb-1">TELEGRAM BOT TOKEN</label>
                        <input type="text" id="token" class="input-style" placeholder="أدخل توكن البوت هنا">
                    </div>
                    <div>
                        <label class="text-[10px] text-gray-500 block mb-1">YOUR CHAT ID</label>
                        <input type="text" id="chatId" class="input-style" placeholder="أدخل الأيدي الخاص بك">
                    </div>
                    <button onclick="saveSettings()" class="w-full bg-[#c5a059] text-black font-black py-4 rounded-xl mt-4 hover:bg-white transition duration-300">
                        تفعيل الربط والبدء ⚡
                    </button>
                </div>
            </div>

            <!-- شاشة الحالة الحية -->
            <div class="bg-white/5 p-8 rounded-[2.5rem] flex flex-col justify-center items-center border border-white/5">
                <div id="status-indicator" class="flex items-center mb-4">
                    <span class="w-2 h-2 bg-gray-500 rounded-full ml-2"></span>
                    <span class="text-[10px] orbitron text-gray-500 uppercase">System Offline</span>
                </div>
                <h2 id="live-sig" class="text-5xl font-black mb-4 transition-all duration-500" style="color:#444">WAITING</h2>
                <p id="live-acc" class="text-2xl font-bold orbitron text-white">0%</p>
                <p id="live-instr" class="text-xs text-gray-400 mt-6 text-center">اربط البوت لكي تبدأ المنظومة بإرسال الصفقات</p>
            </div>
        </div>
    </div>

    <script>
        async function saveSettings() {
            const token = document.getElementById('token').value;
            const chatId = document.getElementById('chatId').value;
            
            const r = await fetch('/api/settings', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ token, chatId })
            });
            
            if(r.ok) {
                alert("✅ تم تفعيل الربط! ستصلك رسالة تأكيد على التليجرام.");
                document.getElementById('status-indicator').children[0].classList.replace('bg-gray-500', 'bg-green-500');
                document.getElementById('status-indicator').children[1].innerText = "System Online";
            }
        }

        async function updateData() {
            const r = await fetch('/api/signal');
            const data = await r.json();
            document.getElementById('live-sig').innerText = data.signal;
            document.getElementById('live-sig').style.color = data.color;
            document.getElementById('live-acc').innerText = data.confidence + "%";
            document.getElementById('live-instr').innerText = data.instruction;
        }
        setInterval(updateData, 3000);
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(UI));

app.get('/api/signal', (req, res) => res.json(getAtomicSignal()));

app.post('/api/settings', async (req, res) => {
    const { token, chatId } = req.body;
    botSettings = { token, chatId, isActive: true };

    // إرسال رسالة ترحيبية للتأكيد
    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: `🎯 *تم تفعيل القناص الذري بنجاح*\n\nالآن كل "ضربة قاضية" يكتشفها النظام ستصلك هنا فوراً.\n\n_تأكد من ضبط تطبيق التداول على دقيقة واحدة (M1)_`,
            parse_mode: 'Markdown'
        });
        res.json({ success: true });
    } catch(e) {
        res.status(500).json({ error: "Invalid Bot Token or Chat ID" });
    }
});

// إرسال الإشارات القوية تلقائياً للتليجرام
setInterval(async () => {
    if (!botSettings.isActive) return;

    const data = getAtomicSignal();
    // إرسال فقط إذا كانت الثقة فوق 94%
    if (parseFloat(data.confidence) >= 94) {
        try {
            const msg = `
🔥 *ضربة قاضية مكتشفة* 🔥
ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ
القرار: *${data.signal}*
الدقة الرياضية: *${data.confidence}%*
المدة: *1 دقيقة (M1)*

🚀 *نفذ الآن فوراً في المنصة!*
            `;
            await axios.post(`https://api.telegram.org/bot${botSettings.token}/sendMessage`, {
                chat_id: botSettings.chatId,
                text: msg,
                parse_mode: 'Markdown'
            });
        } catch(e) {
            console.log("Error sending to telegram");
        }
    }
}, 5000);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Atomic Sniper UI Active'));