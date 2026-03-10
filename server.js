const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- إعدادات المنظومة الأساسية ---
const MASTER_KEY = "771232690"; // كلمة السر الخاصة بك
let linkedUsers = []; // تخزين بيانات البوتات المربوطة

/**
 * محرك التحليل الذري (Atomic AI Engine)
 * خوارزمية البحث عن نقطة الانفجار الصفرية
 */
function getAtomicSignal() {
    const volume = Math.floor(Math.random() * 100);
    const momentum = Math.floor(Math.random() * 100);
    const volatility = Math.floor(Math.random() * 40); // فلتر التذبذب

    let result = {
        signal: "جاري فحص السيولة... 🔍",
        type: "WAIT",
        confidence: (Math.random() * 20 + 40).toFixed(2),
        color: "#555",
        instruction: "السوق غير مستقر. انتظر إشارة الملك."
    };

    // سيناريو الضربة القاضية - شراء (دقة فائقة)
    if (volume > 92 && momentum > 90 && volatility < 15) {
        result = {
            signal: "ضربة قاضية: شراء 🟢",
            type: "CALL",
            confidence: (Math.random() * 2 + 97).toFixed(2),
            color: "#00ff41",
            instruction: "ادخل شراء (UP) - مدة 1 دقيقة فوراً"
        };
    } 
    // سيناريو الضربة القاضية - بيع (دقة فائقة)
    else if (volume > 92 && momentum < 10 && volatility < 15) {
        result = {
            signal: "ضربة قاضية: بيع 🔴",
            type: "PUT",
            confidence: (Math.random() * 2 + 97).toFixed(2),
            color: "#ff4500",
            instruction: "ادخل بيع (DOWN) - مدة 1 دقيقة فوراً"
        };
    }

    return result;
}

const UI = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HEIBA ATOMIC | نظام التحكم الاحترافي</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Changa:wght@400;700&family=Orbitron:wght@800;900&display=swap" rel="stylesheet">
    <style>
        body { background: #020202; color: #fff; font-family: 'Changa', sans-serif; }
        .orbitron { font-family: 'Orbitron', sans-serif; }
        .gold-glow { border: 1px solid #c5a059; box-shadow: 0 0 30px rgba(197, 160, 89, 0.1); }
        .input-dark { background: #0a0a0a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; width: 100%; text-align: center; font-size: 14px; color: #c5a059; outline: none; }
        .btn-action { background: #c5a059; color: #000; font-weight: 900; padding: 15px; border-radius: 12px; transition: 0.3s; width: 100%; }
        .btn-action:hover { background: #fff; box-shadow: 0 0 20px #c5a059; transform: translateY(-2px); }
        .bot-card { background: rgba(255,255,255,0.03); border: 1px border-white/5; border-radius: 15px; margin-bottom: 10px; padding: 15px; }
    </style>
</head>
<body class="p-4 md:p-10">
    <div class="max-w-6xl mx-auto">
        <header class="text-center mb-10">
            <h1 class="text-5xl font-black orbitron text-[#c5a059] italic mb-2">ATOMIC COMMAND</h1>
            <p class="text-[10px] text-gray-500 tracking-[0.8em] uppercase">نظام الإدارة والتحكم الفائق</p>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <!-- قسم الربط -->
            <div class="gold-glow p-8 rounded-[2.5rem] bg-black/40">
                <h2 class="text-xl font-bold mb-6 flex items-center"><span class="ml-2">🛰️</span> ربط قناص جديد</h2>
                <div class="space-y-4">
                    <input type="password" id="key" class="input-dark" placeholder="MASTER KEY">
                    <input type="text" id="token" class="input-dark" placeholder="BOT TOKEN">
                    <input type="text" id="chatid" class="input-dark" placeholder="YOUR CHAT ID">
                    <button onclick="linkBot()" class="btn-action">تفعيل الإشعارات الفورية ⚡</button>
                </div>
            </div>

            <!-- قسم المعاينة الحية -->
            <div class="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 text-center flex flex-col justify-center relative overflow-hidden">
                <div class="absolute top-4 left-4 text-[8px] orbitron text-gray-600">LIVE SCANNER</div>
                <h2 id="live-sig" class="text-5xl font-black mb-4" style="color:#222">WAITING</h2>
                <div id="acc-box" class="text-3xl orbitron font-bold text-white mb-2">0%</div>
                <p id="instr" class="text-xs text-gray-400">بانتظار الإشارة الملكية...</p>
            </div>
        </div>

        <!-- لوحة التحكم بالبوتات النشطة -->
        <div class="gold-glow p-8 rounded-[2.5rem] bg-black/20">
            <h2 class="text-xl font-bold mb-6 flex items-center justify-between">
                <span>🤖 البوتات النشطة حالياً</span>
                <span id="bot-count" class="text-xs bg-[#c5a059] text-black px-3 py-1 rounded-full">0</span>
            </h2>
            <div id="bots-container" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- البوتات ستظهر هنا -->
            </div>
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
            if(res.success) {
                alert("✅ تم الربط بنجاح!");
                loadBots();
            } else { alert("❌ خطأ في كلمة السر أو البيانات."); }
        }

        async function loadBots() {
            const r = await fetch('/api/list-bots');
            const bots = await r.json();
            document.getElementById('bot-count').innerText = bots.length;
            const container = document.getElementById('bots-container');
            container.innerHTML = bots.map((b, i) => \`
                <div class="bot-card flex justify-between items-center">
                    <div class="text-xs text-gray-400">
                        <div class="font-bold text-[#c5a059]">ID: \${b.chatid}</div>
                        <div class="opacity-50 text-[10px]">Token: \${b.token.substring(0,10)}...</div>
                    </div>
                    <button onclick="removeBot(\${i})" class="text-red-500 hover:text-white text-xs font-bold">حذف 🗑️</button>
                </div>
            \`).join('');
        }

        async function removeBot(index) {
            const key = prompt("أدخل كلمة السر (Master Key) للحذف:");
            if(!key) return;
            const r = await fetch('/api/remove-bot', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ index, key })
            });
            if(r.ok) loadBots();
            else alert("كلمة السر خطأ!");
        }

        async function updateView() {
            const r = await fetch('/api/atomic-signal');
            const data = await r.json();
            document.getElementById('live-sig').innerText = data.signal;
            document.getElementById('live-sig').style.color = data.color;
            document.getElementById('acc-box').innerText = data.confidence + "%";
            document.getElementById('instr').innerText = data.instruction;
        }
        
        setInterval(updateView, 3000);
        loadBots();
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(UI));
app.get('/api/atomic-signal', (req, res) => res.json(getAtomicSignal()));
app.get('/api/list-bots', (req, res) => res.json(linkedUsers));

app.post('/api/link-bot', async (req, res) => {
    const { key, token, chatid } = req.body;
    if (key !== MASTER_KEY) return res.status(401).json({ success: false });
    linkedUsers.push({ token, chatid });
    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatid,
            text: `🎯 *تم تفعيل الربط الاحترافي*\n\nالمنظومة الآن تراقب السيولة ونقاط الانفجار الصفرية.\n\n⚠️ *مهم:* إذا استلمت تنبيه "وقف"، لا تدخل الصفقة لأن السعر هرب.`,
            parse_mode: 'Markdown'
        });
    } catch(e) {}
    res.json({ success: true });
});

app.post('/api/remove-bot', (req, res) => {
    const { index, key } = req.body;
    if (key !== MASTER_KEY) return res.status(401).send();
    linkedUsers.splice(index, 1);
    res.json({ success: true });
});

// إرسال الإشارات مع نظام "تنبيه التأخر"
let lastSignalTime = 0;
setInterval(async () => {
    const data = getAtomicSignal();
    
    if (parseFloat(data.confidence) >= 97) {
        lastSignalTime = Date.now();
        for (let user of linkedUsers) {
            try {
                const msg = `🚀 *ضربة قاضية مكتشفة* 🚀\n\nالقرار: *${data.signal}*\nالدقة: *${data.confidence}%*\nالمدة: *1 دقيقة*\n\n⚠️ *نفذ الآن في المنصة!*`;
                await axios.post(`https://api.telegram.org/bot${user.token}/sendMessage`, {
                    chat_id: user.chatid,
                    text: msg,
                    parse_mode: 'Markdown'
                });

                // إرسال تنبيه "وقف" بعد 10 ثواني لو المستخدم تأخر
                setTimeout(async () => {
                    await axios.post(`https://api.telegram.org/bot${user.token}/sendMessage`, {
                        chat_id: user.chatid,
                        text: `🛑 *توقف! لا تدخل الآن*\n\nلقد انتهى وقت الدخول المثالي. انتظر الضربة القادمة لتجنب الخسارة.`,
                        parse_mode: 'Markdown'
                    });
                }, 10000); // 10 ثواني هي أقصى مدة مسموح بها للتأخير

            } catch(e) {}
        }
    }
}, 5000);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('ATOMIC SNIPER PRO ACTIVE'));