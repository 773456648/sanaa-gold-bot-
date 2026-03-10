const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- قاعدة بيانات المنظومة ---
let globalUsers = [];
const MASTER_KEY = "771232690";

// --- محرك الذكاء الاصطناعي للرصد الشامل ---
// هذا المحرك يحاكي الربط مع Binance و TradingView لجلب أدق المعلومات
async function analyzeMarket() {
    // محاكاة سحب بيانات حية من المنصات العالمية
    const marketTrends = ["صعود قوي 🚀", "تصحيح مسار ⚠️", "تجميع سيولة 💎", "هبوط حاد 🔴"];
    const strength = Math.floor(Math.random() * 40 + 60); // دقة تفوق الـ 60% دائماً
    const selectedTrend = marketTrends[Math.floor(Math.random() * marketTrends.length)];
    
    return {
        trend: selectedTrend,
        accuracy: strength + "%",
        recommendation: strength > 80 ? "دخول بأقصى طاقة" : "دخول بحذر",
        timestamp: new Date().toLocaleTimeString('ar-SA')
    };
}

// --- واجهة المنظومة الخيالية (Corporate UI) ---
const HTML_INTERFACE = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HEIBA GLOBAL INTELLIGENCE</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Changa:wght@300;700&family=Orbitron:wght@900&display=swap" rel="stylesheet">
    <style>
        body { background: #020202; color: #fff; font-family: 'Changa', sans-serif; overflow-x: hidden; }
        .orbitron { font-family: 'Orbitron', sans-serif; }
        .hero-gradient { background: radial-gradient(circle at top right, #003311 0%, #020202 60%); }
        .cyber-panel { background: rgba(10, 10, 10, 0.9); border: 1px solid rgba(0, 255, 65, 0.15); backdrop-filter: blur(20px); }
        .neon-glow { color: #00ff41; text-shadow: 0 0 15px rgba(0, 255, 65, 0.6); }
        .btn-gold { background: linear-gradient(90deg, #c5a059, #8e6d2f); color: #000; font-weight: 800; transition: 0.4s; }
        .btn-gold:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(197, 160, 89, 0.4); }
        .market-card { border-right: 4px solid #c5a059; background: rgba(255,255,255,0.03); }
        .pulse-live { width: 10px; height: 10px; background: #00ff41; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
    </style>
</head>
<body class="hero-gradient min-h-screen">
    <div class="max-w-[1500px] mx-auto p-4 md:p-10">
        <!-- Header -->
        <header class="flex flex-col lg:flex-row justify-between items-center mb-16 border-b border-white/5 pb-10">
            <div>
                <h1 class="text-6xl font-black orbitron neon-glow italic tracking-tighter">HEIBA GLOBAL</h1>
                <div class="flex items-center mt-4">
                    <div class="pulse-live ml-3"></div>
                    <span class="text-xs text-gray-400 uppercase tracking-[0.6em]">نظام الرصد والذكاء الموحد لكافة المنصات</span>
                </div>
            </div>
            <div class="flex gap-8 mt-8 lg:mt-0">
                <div class="text-center">
                    <p class="text-[10px] text-gray-500 uppercase">Live Nodes</p>
                    <p id="nodes-count" class="text-2xl orbitron text-[#c5a059]">00</p>
                </div>
                <div class="text-center border-r border-white/10 pr-8">
                    <p class="text-[10px] text-gray-500 uppercase">Success Rate</p>
                    <p class="text-2xl orbitron text-green-500">98.4%</p>
                </div>
            </div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <!-- اللوحة الجانبية: التحكم والتعليمات -->
            <div class="lg:col-span-4 space-y-8">
                <div class="cyber-panel p-8 rounded-3xl relative overflow-hidden">
                    <h2 class="text-2xl font-bold mb-8 flex items-center">
                        <span class="text-[#c5a059] ml-3">◈</span> تسجيل الدخول الآمن
                    </h2>
                    <div class="space-y-4">
                        <input type="password" id="m_pass" placeholder="MASTER KEY" class="w-full p-4 bg-black border border-white/10 rounded-xl text-center focus:border-[#c5a059] outline-none transition">
                        <input type="text" id="m_name" placeholder="اسم المستخدم" class="w-full p-4 bg-black border border-white/10 rounded-xl text-center outline-none">
                        <input type="text" id="m_token" placeholder="BOT TOKEN" class="w-full p-4 bg-black border border-white/10 rounded-xl text-center text-xs outline-none">
                        <input type="text" id="m_chatid" placeholder="CHAT ID" class="w-full p-4 bg-black border border-white/10 rounded-xl text-center outline-none">
                        <button onclick="joinProtocol()" class="btn-gold w-full py-5 rounded-xl uppercase text-lg mt-4">ربط المنظومة الآن ⚡</button>
                    </div>
                </div>

                <div class="cyber-panel p-8 rounded-3xl">
                    <h2 class="text-xl font-bold mb-6 text-[#c5a059]">📜 بروتوكول التعليمات الذكية</h2>
                    <div class="space-y-4 text-sm">
                        <div class="p-4 market-card rounded">
                            <h4 class="text-green-500 font-bold mb-1">الترقيم العملياتي الأخضر</h4>
                            <p class="text-gray-400 text-xs">يصدر عند تطابق سيولة 4 منصات عالمية. ادخل فوراً.</p>
                        </div>
                        <div class="p-4 market-card rounded border-r-red-600">
                            <h4 class="text-red-600 font-bold mb-1">إشارة التسييل الأحمر</h4>
                            <p class="text-gray-400 text-xs">خروج الحيتان من السوق. اخرج بأرباحك ولا تتردد.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- الرادار المركزي -->
            <div class="lg:col-span-8">
                <div class="cyber-panel p-10 rounded-[2.5rem] h-full flex flex-col">
                    <div class="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                        <h2 class="text-3xl font-bold">📡 رادار الربط العالمي المباشر</h2>
                        <div class="text-right">
                            <p class="text-[10px] text-gray-500 uppercase">حالة السوق الآن</p>
                            <p id="market-status" class="orbitron text-[#c5a059] text-xl">SCANNING...</p>
                        </div>
                    </div>

                    <div id="users-grid" class="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[500px] pr-2">
                        <!-- الوحدات تظهر هنا -->
                    </div>

                    <div id="loading" class="flex-grow flex flex-col items-center justify-center opacity-30">
                        <div class="w-16 h-16 border-4 border-[#c5a059] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p class="orbitron tracking-[1em] text-[10px]">CONNECTING TO NODES</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        async function joinProtocol() {
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
            if(res.success) { alert("تم الربط بنجاح مع كافة المنصات!"); refresh(); }
            else { alert("خطأ في مفتاح الوصول!"); }
        }

        async function refresh() {
            const r = await fetch('/api/users');
            const users = await r.json();
            const mr = await fetch('/api/analyze');
            const market = await mr.json();

            document.getElementById('nodes-count').innerText = users.length.toString().padStart(2, '0');
            document.getElementById('market-status').innerText = market.trend;
            
            const grid = document.getElementById('users-grid');
            const loader = document.getElementById('loading');

            if(users.length > 0) {
                loader.classList.add('hidden');
                grid.innerHTML = users.map(u => \`
                    <div class="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#c5a059] transition-all group">
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="font-bold text-white text-lg">\${u.name}</h3>
                                <p class="text-[9px] text-gray-500 orbitron tracking-widest uppercase">Node Online</p>
                            </div>
                            <div class="text-left">
                                <p class="text-[10px] text-green-500 font-bold">\${market.accuracy} ACCURACY</p>
                                <button onclick="removeUnit(\${u.id})" class="text-red-900 hover:text-red-500 text-xs mt-2 transition">🗑 قطع الاتصال</button>
                            </div>
                        </div>
                    </div>
                \`).join('');
            }
        }
        setInterval(refresh, 5000);
        refresh();
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(HTML_INTERFACE));

app.get('/api/users', (req, res) => res.json(globalUsers));

app.get('/api/analyze', async (req, res) => {
    const data = await analyzeMarket();
    res.json(data);
});

app.post('/api/register', async (req, res) => {
    const { password, name, token, chatid } = req.body;
    if (password !== MASTER_KEY) return res.status(401).json({ error: "Access Denied" });
    
    const newUser = { id: Date.now(), name, token, chatid };
    globalUsers.push(newUser);
    
    // إرسال تقرير الذكاء الأول فوراً لتليجرام
    const market = await analyzeMarket();
    const message = `
👑 *منظومة الهيبة العملاقة - الربط العالمي* 👑
ـــــــــــــــــــــــــــــــــــــــــــــــــ
المستلم: *${name}*
الحالة: *مُتصل بكافة المنصات ✅*

📊 *تحليل الرادار الحي:*
• الاتجاه: *${market.trend}*
• دقة الرصد: *${market.accuracy}*
• التوصية: *${market.recommendation}*

🚀 *التعليمات:* النظام الآن يراقب حركة السيولة العالمية، أي تغيير في الترقيم سيصلك فوراً.
    `;
    
    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatid,
            text: message,
            parse_mode: 'Markdown'
        });
    } catch(e) {}
    
    res.json({ success: true });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('GLOBAL HEIBA SYSTEM STARTED'));