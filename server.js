const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// الإعدادات
const MASTER_SYSTEM_KEY = "771232690"; 
let registeredBots = []; 

/**
 * محرك التحليل المركزي (الرادار)
 * يقوم بمراقبة السوق وإرسال تنبيهات لكل البوتات المسجلة
 */
async function runRadar() {
    try {
        // جلب بيانات الشموع من بينانس
        const res = await axios.get('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=14');
        const closes = res.data.map(k => parseFloat(k[4]));
        const currentPrice = closes[closes.length - 1];

        // حساب RSI بسيط
        let gains = 0, losses = 0;
        for (let i = 1; i < closes.length; i++) {
            let diff = closes[i] - closes[i-1];
            if (diff > 0) gains += diff; else losses -= diff;
        }
        const rsi = 100 - (100 / (1 + (gains / (losses || 1))));

        // إذا وجدت إشارة قوية، أرسل لكل المشتركين
        if (rsi < 30 || rsi > 70) {
            const type = rsi < 30 ? "شراء 🟢 (CALL)" : "بيع 🔴 (PUT)";
            const msg = `🎯 إشارة قناص مؤكدة!\n\nالنوع: ${type}\nالسعر: $${currentPrice}\nقوة الإشارة: ${rsi.toFixed(2)}%\n\nنفذ الصفقة الآن لمدة 1-3 دقائق.`;
            
            for (let bot of registeredBots) {
                axios.post(`https://api.telegram.org/bot${bot.botToken}/sendMessage`, {
                    chat_id: bot.chatId,
                    text: msg
                }).catch(e => console.log("خطأ في إرسال لبوت معين"));
            }
        }
    } catch (e) {
        console.log("خطأ في الرادار");
    }
}

// تشغيل الرادار كل 5 ثوانٍ
setInterval(runRadar, 5000);

// --- APIs ---

app.post('/api/link-bot', (req, res) => {
    const { ownerName, botToken, chatId, userPassword } = req.body;
    if(!ownerName || !botToken || !chatId || !userPassword) return res.json({success: false, msg: "بيانات ناقصة"});
    
    registeredBots.push({ id: Date.now(), ownerName, botToken, chatId, userPassword });
    res.json({ success: true });
});

app.get('/api/list-bots', (req, res) => {
    res.json(registeredBots.map(b => ({ id: b.id, ownerName: b.ownerName, chatId: b.chatId })));
});

app.post('/api/remove-bot', (req, res) => {
    const { id, pass } = req.body;
    const idx = registeredBots.findIndex(b => b.id === id);
    if(idx === -1) return res.json({success: false});

    if(registeredBots[idx].userPassword === pass || pass === MASTER_SYSTEM_KEY) {
        registeredBots.splice(idx, 1);
        res.json({success: true});
    } else {
        res.json({success: false, msg: "كلمة السر خطأ"});
    }
});

// لجلب الإشارة الحالية للواجهة
app.get('/api/current-signal', async (req, res) => {
    try {
        const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
        res.json({ price: response.data.lastPrice });
    } catch(e) { res.json({price: "0"}); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`المنظومة الشاملة تعمل على ${PORT}`));