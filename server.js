const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// إعدادات البوت والتحكم
const MASTER_KEY = "771232690";
let linkedUsers = []; // [{token, chatid}]

// دالة لجلب البيانات وتحليلها في الخلفية (لإرسال التنبيهات)
async function monitorMarket() {
    try {
        const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
        const price = parseFloat(response.data.lastPrice);
        
        // جلب بيانات الشموع لحساب RSI (بسيط)
        const klines = await axios.get('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=14');
        const closes = klines.data.map(k => parseFloat(k[4]));
        
        // حساب تقريبي للـ RSI
        let gains = 0, losses = 0;
        for (let i = 1; i < closes.length; i++) {
            let diff = closes[i] - closes[i-1];
            if (diff > 0) gains += diff; else losses -= diff;
        }
        const rsi = 100 - (100 / (1 + (gains / (losses || 1))));

        // إرسال تنبيه إذا كانت الإشارة قوية جداً
        if ((rsi < 25 || rsi > 75) && linkedUsers.length > 0) {
            const signalType = rsi < 25 ? "شراء 🟢" : "بيع 🔴";
            for (let user of linkedUsers) {
                await axios.post(`https://api.telegram.org/bot${user.token}/sendMessage`, {
                    chat_id: user.chatid,
                    text: `🎯 *إشارة قناص مؤكدة*\n\nالنوع: ${signalType}\nالسعر: $${price}\nقوة الإشارة: ${rsi.toFixed(2)}%\n\n⚠️ نفذ الآن!`,
                    parse_mode: 'Markdown'
                });
            }
        }
    } catch (e) {
        console.log("خطأ في المراقبة:");
    }
}

// تشغيل المراقبة كل 10 ثوانٍ
setInterval(monitorMarket, 10000);

// المسارات (API)
app.post('/api/link-bot', (req, res) => {
    const { key, token, chatid } = req.body;
    if (key !== MASTER_KEY) return res.status(401).json({ success: false });
    linkedUsers.push({ token, chatid });
    res.json({ success: true });
});

app.get('/api/status', (req, res) => {
    res.json({ active_bots: linkedUsers.length, status: "Running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`سيرفر القناص يعمل على المنفذ ${PORT}`));