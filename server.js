const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- قاعدة بيانات المستخدمين والمحافظ ---
let userWallets = [];
const MASTER_KEY = "771232690";

// --- محرك حساب الأرباح والخسائر (المحاكاة الذكية) ---
// في الواقع يتم ربط هذا بـ API المنصة لسحب الرصيد الحقيقي
function updateWalletStatus(wallet) {
    const changePercent = (Math.random() * 4 - 2); // تذبذب بين -2% و +2%
    const oldBalance = parseFloat(wallet.currentBalance);
    const newBalance = (oldBalance + (oldBalance * (changePercent / 100))).toFixed(2);
    const profit = (newBalance - parseFloat(wallet.initialDeposit)).toFixed(2);
    
    return {
        newBalance,
        profit,
        status: profit >= 0 ? "ارتفاع 📈" : "انخفاض 📉",
        change: changePercent.toFixed(2) + "%"
    };
}

// --- الواجهة الملكية (Portfolio Dashboard) ---
const UI = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HEIBA PORTFOLIO | إدارة الزلط والأرباح</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Changa:wght@400;700&family=Orbitron:wght@600;900&display=swap" rel="stylesheet">
    <style>
        body { background: #050505; color: #fff; font-family: 'Changa', sans-serif; }
        .orbitron { font-family: 'Orbitron', sans-serif; }
        .glass { background: rgba(20, 20, 20, 0.8); border: 1px solid rgba(197, 160, 89, 0.2); backdrop-filter: blur(10px); }
        .gold-text { color: #c5a059; text-shadow: 0 0 10px rgba(197, 160, 89, 0.3); }
        .profit-up { color: #00ff41; }
        .profit-down { color: #ff4500; }
        .card-inner { background: linear-gradient(145deg, #0a0a0a, #151515); }
        .btn-royal { background: #c5a059; color: #000; font-weight: bold; transition: 0.3s; }
        .btn-royal:hover { background: #fff; box-shadow: 0 0 20px #c5a059; }
    </style>
</head>
<body class="p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <header class="flex justify-between items-center mb-10 border-b border-white/5 pb-8">
            <div class="text-right">
                <h1 class="text-4xl font-black orbitron gold-text uppercase italic">Heiba Portfolio</h1>
                <p class="text-[10px] text-gray-500 tracking-[0.4em] mt-1">نظام رصد الأرباح والسيولة الذكي</p>
            </div>
            <div class="bg-white/5 p-4 rounded-xl border border-white/10">
                <p class="text-[10px] text-gray-400">إجمالي السيولة المدارة</p>
                <p id="total-assets" class="orbitron text-2xl text-white">$0.00</p>
            </div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- إدخال بيانات المحفظة -->
            <div class="lg:col-span-4">
                <div class="glass p-6 rounded-2xl">
                    <h2 class="text-xl font-bold mb-6 flex items-center">
                        <span class="ml-3 text-[#c5a059]">💰</span> ربط محفظة جديدة
                    </h2>
                    <div class="space-y-4">
                        <input type="password" id="m_pass" placeholder="MASTER KEY" class="w-full p-4 bg-black border border-white/10 rounded-xl text-center text-[#c5a059] orbitron">
                        <input type="text" id="u_name" placeholder="اسم صاحب المحفظة" class="w-full p-4 bg-black border border-white/10 rounded-xl text-center">
                        <input type="number" id="u_deposit" placeholder="رأس المال ($)" class="w-full p-4 bg-black border border-white/10 rounded-xl text-center orbitron">
                        <input type="text" id="u_token" placeholder="BOT TOKEN" class="w-full p-4 bg-black border border-white/10 rounded-xl text-center text-xs">
                        <input type="text" id="u_chatid" placeholder="CHAT ID" class="w-full p-4 bg-black border border-white/10 rounded-xl text-center">
                        <button onclick="linkWallet()" class="btn-royal w-full py-5 rounded-xl uppercase mt-4">بدء الرصد الذكي ⚡</button>
                    </div>
                </div>
            </div>

            <!-- عرض المحافظ والأرباح -->
            <div class="lg:col-span-8">
                <div class="glass p-8 rounded-3xl h-full">
                    <h2 class="text-2xl font-bold mb-8 border-b border-white/5 pb-4">📊 رادار المحافظ الحية</h2>
                    <div id="wallets-grid" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- المحافظ تظهر هنا -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        async function linkWallet() {
            const data = {
                password: document.getElementById('m_pass').value,
                name: document.getElementById('u_name').value,
                deposit: document.getElementById('u_deposit').value,
                token: document.getElementById('u_token').value,
                chatid: document.getElementById('u_chatid').value
            };
            const r = await fetch('/api/wallet/link', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            const res = await r.json();
            if(res.success) { alert("تم ربط المحفظة وبدء الرصد!"); refresh(); }
            else { alert("فشل الربط: " + res.error); }
        }

        async function refresh() {
            const r = await fetch('/api/wallets');
            const wallets = await r.json();
            
            let total = 0;
            const grid = document.getElementById('wallets-grid');
            grid.innerHTML = wallets.map(w => {
                total += parseFloat(w.currentBalance);
                const isProfit = parseFloat(w.profit) >= 0;
                return \`
                    <div class="card-inner p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h3 class="font-bold text-lg">\${w.name}</h3>
                                <p class="text-[10px] text-gray-500 uppercase orbitron">Balance Tracked</p>
                            </div>
                            <span class="\${isProfit ? 'profit-up' : 'profit-down'} text-xs font-bold orbitron">
                                \${isProfit ? '+' : ''}\${w.change}
                            </span>
                        </div>
                        <div class="mt-4">
                            <p class="text-3xl font-black orbitron">$\${w.currentBalance}</p>
                            <p class="text-xs mt-2 \${isProfit ? 'text-green-500' : 'text-red-500'}">
                                \${isProfit ? 'ربح:' : 'خسارة:'} $\${w.profit}
                            </p>
                        </div>
                    </div>
                \`;
            }).join('');
            
            document.getElementById('total-assets').innerText = "$" + total.toFixed(2);
        }

        setInterval(refresh, 5000);
        refresh();
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(UI));

app.get('/api/wallets', (req, res) => res.json(userWallets));

app.post('/api/wallet/link', async (req, res) => {
    const { password, name, deposit, token, chatid } = req.body;
    if (password !== MASTER_KEY) return res.status(401).json({ error: "Access Denied" });
    
    const newWallet = {
        id: Date.now(),
        name,
        initialDeposit: deposit,
        currentBalance: deposit,
        profit: "0.00",
        change: "0.00%",
        token,
        chatid
    };
    userWallets.push(newWallet);
    
    // إرسال أول رسالة لتليجرام
    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatid,
            text: `💰 *تم ربط محفظتك بنجاح*\n\nالاسم: ${name}\nرأس المال: $${deposit}\n\nالنظام سيقوم بإرسال تحديثات دورية عن "زلطك" والأرباح.`,
            parse_mode: 'Markdown'
        });
    } catch(e) {}
    
    res.json({ success: true });
});

// وظيفة لتحديث المحافظ وإرسال تنبيهات تليجرام تلقائياً
setInterval(async () => {
    for (let wallet of userWallets) {
        const update = updateWalletStatus(wallet);
        wallet.currentBalance = update.newBalance;
        wallet.profit = update.profit;
        wallet.change = update.change;
        
        // إرسال تنبيه لتليجرام إذا كان هناك ربح ملحوظ (محاكاة)
        if (Math.abs(parseFloat(update.profit)) > 1) {
             try {
                await axios.post(`https://api.telegram.org/bot${wallet.token}/sendMessage`, {
                    chat_id: wallet.chatid,
                    text: `📢 *تحديث الرصيد*\n\nصاحب المحفظة: ${wallet.name}\nالرصيد الحالي: *$${wallet.currentBalance}*\nالأرباح/الخسائر: *$${wallet.profit}*\nالحالة: ${update.status}`,
                    parse_mode: 'Markdown'
                });
            } catch(e) {}
        }
    }
}, 30000); // تحديث تليجرام كل 30 ثانية

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('WALLET TRACKER ACTIVE'));