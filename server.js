const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // لتشغيل ملفات المجلد public تلقائياً

const MASTER_KEY = "771232690";
let users = [];

// API لربط البوت
app.post('/api/link-bot', async (req, res) => {
    const { key, token, chatid } = req.body;
    if (key !== MASTER_KEY) return res.status(401).json({ success: false });
    
    users.push({ token, chatid });
    
    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatid,
            text: "✅ *تم ربط القناص بنجاح*\n\nسأقوم بإرسال أقوى ضربات الانفجار السعري هنا فور اكتشافها.",
            parse_mode: 'Markdown'
        });
    } catch(e) {}
    
    res.json({ success: true });
});

// مراقبة السوق وإرسال التنبيهات في الخلفية
setInterval(async () => {
    try {
        const res = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        const price = parseFloat(res.data.price);
        
        // هنا يمكنك إضافة منطق تحليل RSI حقيقي للسيرفر لإرسال التنبيهات حتى والمتصفح مغلق
        // مثال بسيط: إرسال تنبيه في حال وجود حركة كبيرة
    } catch(e) {}
}, 10000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ATOMIC PRO ACTIVE ON PORT ${PORT}`));