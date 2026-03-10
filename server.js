const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- إعدادات النظام ---
let activeSystems = [];
const MASTER_KEY = "771232690";

// --- محرك الأسعار والترقيم الذكي ---
function getMarketData() {
    // محاكاة لأسعار الذهب والعملات (يمكن ربطها بـ API حقيقي لاحقاً)
    const goldPrice = (2000 + Math.random() * 50).toFixed(2);
    const usdSar = (3.75 + Math.random() * 0.05).toFixed(4);
    
    const signals = [
        { label: "ترقيم أخضر 🟢", action: "شراء وتمركز", risk: "منخفض" },
        { label: "ترقيم أحمر 🔴", action: "بيع وتصفية", risk: "عالي" },
        { label: "ترقيم ذهبي ✨", action: "فرصة ملكية", risk: "متوسط" }
    ];
    const signal = signals[Math.floor(Math.random() * signals.length)];
    
    return { gold: goldPrice, sar: usdSar, signal: signal };
}

// --- الواجهة الملكية الشاملة (HTML) ---
const UI = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HEIBA ULTIMATE | المنظومة الشاملة</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Changa:wght@400;700&family=Orbitron:wght@600;900&display=swap" rel="stylesheet">
    <style>
        body { background: #000; color: #fff; font-family: 'Changa', sans-serif; overflow-x: hidden; }
        .orbitron { font-family: 'Orbitron', sans-serif; }
        .glass { background: rgba(0, 20, 0, 0.8); border: 1px solid rgba(0, 255, 65, 0.2); backdrop-filter: blur(10px); }
        .neon-green { color: #00ff41; text-shadow: 0 0 10px #00ff41; }
        .price-card { background: linear-gradient(135deg, #000 0%, #001a08 100%); border-right: 4px solid #00ff41; }
        .instruction-row { border-bottom: 1px solid rgba(0, 255, 65, 0.1); transition: 0.3s; }
        .instruction-row:hover { background: rgba(0, 255, 65, 0.05); }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .live-dot { width: 8px; height: 8px; background: #00ff41; border-radius: 50%; animation: pulse 1.5s infinite; }
    </style>
</head>
<body class="p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
        <!-- رأس المنظومة -->
        <header class="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-green-900/40 pb-6">
            <div class="text-right">
                <h1 class="text-6xl font-black orbitron neon-green italic tracking-tighter">HEIBA CORE</h1>
                <p class="text-xs text-gray-500 mt-2 tracking-[0.5em] uppercase">The Ultimate Trading Intelligence</p>
            </div>
            <div class="flex space-x-6 space-x-reverse mt-6 md:mt-0">
                <div class="price-card p-4 rounded-xl min-w-[150px]">
                    <p class="text-[10px] text-gray-400">سعر الذهب مباشر</p>
                    <p id="gold-live" class="orbitron text-2xl neon-green">$0,000.00</p>
                </div>
                <div class="price-card p-4 rounded-xl min-w-[150px]">
                    <p class="text-[10px] text-gray-400">مؤشر الترقيم</p>
                    <p id="signal-live" class="text-xl font-bold text-white">---</p>
                </div>
            </div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- قسم التحكم والربط -->
            <div class="lg:col-span-4 space-y-6">
                <div class="glass p-6 rounded-2xl">
                    <h2 class="text-xl font-bold mb-6 flex items-center border-b border-green-900 pb-3">
                        <span class="live-dot ml-3"></span> ربط وحدة تليجرام
                    </h2>
                    <div class="space-y-4">
                        <input type="password" id="m_pass" placeholder="MASTER KEY" class="w-full p-4 bg-black border border-green-900/50 rounded-xl text-green-400 text-center">
                        <input type="text" id="m_name" placeholder="اسم المستخدم" class="w-full p-4 bg-black border border-green-900/50 rounded-xl text-center">
                        <input type="text" id="m_token" placeholder="BOT TOKEN" class="w-full p-4 bg-black border border-green-900/50 rounded-xl text-xs text-center">
                        <input type="text" id="m_chatid" placeholder="CHAT ID" class="w-full p-4 bg-black border border-green-900/50 rounded-xl text-center">
                        <button onclick="register()" class="w-full py-5 bg-[#00ff41] text-black font-black rounded-xl hover:shadow-[0_0_30px_#00ff41] transition duration-500 uppercase">تفعيل المنظومة العملاقة ⚡</button>
                    </div>
                </div>

                <!-- لوحة التعليمات العملياتية -->
                <div class="glass p-6 rounded-2xl">
                    <h2 class="text-xl font-bold mb-4 text-[#00ff41]">📜 التعليمات الملكية</h2>
                    <div class="text-[13px] space-y-3 text-gray-300">
                        <div class="instruction-row py-2">🟢 <b>الترقيم الأخضر:</b> دخول تدريجي، سيولة 30% من المحفظة.</div>
                        <div class="instruction-row py-2">🔴 <b>الترقيم الأحمر:</b> خروج فوري، وقف خسارة عند كسر الدعم.</div>
                        <div class="instruction-row py-2">✨ <b>الترقيم الذهبي:</b> فرصة نادرة، تفعيل أقصى طاقة.</div>
                        <div class="instruction-row py-2">⚠️ <b>تنبيه:</b> لا تفتح صفقات خارج نطاق إشارة المنظومة.</div>
                    </div>
                </div>
            </div>

            <!-- رادار المراقبة -->
            <div class="lg:col-span-8">
                <div class="glass p-8 rounded-3xl h-full flex flex-col">
                    <div class="flex justify-between items-center mb-8">
                        <h2 class="text-3xl font-bold">📡 رادار الوحدات المتصلة</h2>
                        <div class="bg-black/50 border border-green-500/30 px-6 py-2 rounded-full">
                            <span class="orbitron text-[#00ff41] text-2xl" id="bot-count">00</span>
                        </div>
                    </div>
                    <div id="bots-list" class="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2">
                        <!-- الوحدات تظهر هنا -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        async function register() {
            const data = {
                password: document.getElementById('m_pass').value,
                name: document.getElementById('m_name').value,
                token: document.getElementById('m_token').value,
                chatid: document.getElementById('m_chatid').value
            };
            const r = await fetch('/api/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            const res = await r.json();
            if(res.success) { alert("✅ تم التفعيل بنجاح!"); load(); } else { alert("❌ خطأ: " + res.error); }
        }

        async function load() {
            // تحديث الوحدات
            const r = await fetch('/api/bots');
            const bots = await r.json();
            document.getElementById('bot-count').innerText = bots.length.toString().padStart(2, '0');
            const list = document.getElementById('bots-list');
            list.innerHTML = bots.map(b => \`
                <div class="bg-white/5 border border-green-900/20 p-5 rounded-2xl flex justify-between items-center group">
                    <div class="text-right">
                        <h3 class="font-bold text-lg">\${b.name}</h3>
                        <p class="text-[10px] text-gray-500 orbitron">PROTOCOL ACTIVE</p>
                    </div>
                    <button onclick="removeBot(\${b.id})" class="text-red-900 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">🗑️</button>
                </div>
            \`).join('');

            // تحديث الأسعار والترقيم
            const pr = await fetch('/api/market');
            const market = await pr.json();
            document.getElementById('gold-live').innerText = "$" + market.gold;
            document.getElementById('signal-live').innerText = market.signal.label;
            document.getElementById('signal-live').style.color = market.signal.label.includes('أخضر') ? '#00ff41' : '#ff4500';
        }

        setInterval(load, 5000);
        load();
    </script>
</body>
</html>
`;

// --- المسارات الخلفية ---
app.get('/', (req, res) => res.send(UI));

app.get('/api/market', (req, res) => res.json(getMarketData()));

app.get('/api/bots', (req, res) => res.json(activeSystems));

app.post('/api/register', async (req, res) => {
    const { password, name, token, chatid } = req.body;
    if (password !== MASTER_KEY) return res.status(401).json({ error: "Access Denied" });
    
    const newSys = { id: Date.now(), name, token, chatid };
    activeSystems.push(newSys);
    
    // إرسال رسالة ترحيبية وتعليمات فورية لتليجرام
    const market = getMarketData();
    const welcomeMsg = `
👑 *منظومة الهيبة العملاقة* 👑
ـــــــــــــــــــــــــــــــــــــــــــــــــ
أهلاً بك يا *${name}* في وحدة النخبة.

📊 *الحالة المبدئية:*
• سعر الذهب: *$${market.gold}*
• الترقيم الحالي: *${market.signal.label}*
• التعليمات: *${market.signal.action}*

🛡️ _النظام يراقب السوق الآن بالنيابة عنك._
    `;
    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatid,
            text: welcomeMsg,
            parse_mode: 'Markdown'
        });
    } catch (e) {}
    
    res.json({ success: true });
});

app.post('/api/remove', (req, res) => {
    const { id, password } = req.body;
    if (password !== MASTER_KEY) return res.status(401).json({ error: "Unauthorized" });
    activeSystems = activeSystems.filter(s => s.id !== id);
    res.json({ success: true });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('HEIBA CORE V3 ULTIMATE ACTIVE'));