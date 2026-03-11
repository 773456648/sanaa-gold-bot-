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
    if (registeredBots.length === 0) return; // لا داعي للتحليل إذا لم يوجد مشتركين

    try {
        // جلب بيانات الشموع من بينانس (14 شمعة دقيقة واحدة)
        const res = await axios.get('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=14');
        const closes = res.data.map(k => parseFloat(k[4]));
        const currentPrice = closes[closes.length - 1];

        // حساب RSI حقيقي
        let gains = 0, losses = 0;
        for (let i = 1; i < closes.length; i++) {
            let diff = closes[i] - closes[i-1];
            if (diff > 0) gains += diff; else losses -= diff;
        }
        const rsi = 100 - (100 / (1 + (gains / (losses || 1))));

        // إرسال الإشارة فقط عند تجاوز المناطق المحددة (RSI < 30 أو > 70)
        if (rsi <= 31 || rsi >= 69) {
            const type = rsi <= 31 ? "🟢 شراء (CALL)" : "🔴 بيع (PUT)";
            const msg = `🎯 *إشارة قناص مؤكدة!*\n\nالنوع: ${type}\nالسعر: $${currentPrice}\nقوة الإشارة: ${rsi.toFixed(2)}%\n\nنفذ الصفقة الآن لمدة 1-3 دقائق.`;
            
            // إرسال لكل بوت مسجل
            for (let bot of registeredBots) {
                try {
                    await axios.post(`https://api.telegram.org/bot${bot.botToken}/sendMessage`, {
                        chat_id: bot.chatId,
                        text: msg,
                        parse_mode: 'Markdown'
                    });
                } catch (err) {
                    console.log(`فشل الإرسال للبوت الخاص بـ ${bot.ownerName}`);
                }
            }
        }
    } catch (e) {
        console.log("خطأ في جلب بيانات السوق من بينانس");
    }
}

// تشغيل الرادار كل 10 ثوانٍ (أفضل لتجنب الحظر وللحصول على استقرار)
setInterval(runRadar, 10000);

// --- APIs ---

app.post('/api/link-bot', (req, res) => {
    const { ownerName, botToken, chatId, userPassword } = req.body;
    if(!ownerName || !botToken || !chatId || !userPassword) {
        return res.json({success: false, msg: "يرجى تعبئة كافة الحقول"});
    }
    
    // إضافة المشترك للقائمة
    registeredBots.push({ 
        id: Date.now(), 
        ownerName, 
        botToken, 
        chatId, 
        userPassword 
    });
    
    console.log(`تم تسجيل مشترك جديد: ${ownerName}`);
    res.json({ success: true });
});

app.get('/api/list-bots', (req, res) => {
    // إرسال القائمة بدون كلمات السر للأمان
    const safeList = registeredBots.map(b => ({
        id: b.id,
        ownerName: b.ownerName,
        chatId: b.chatId
    }));
    res.json(safeList);
});

app.post('/api/remove-bot', (req, res) => {
    const { id, pass } = req.body;
    const idx = registeredBots.findIndex(b => b.id === id);
    
    if(idx === -1) return res.json({success: false, msg: "المشترك غير موجود"});

    // التحقق من كلمة السر الخاصة بالمشترك أو الماستر كي
    if(registeredBots[idx].userPassword === pass || pass === MASTER_SYSTEM_KEY) {
        registeredBots.splice(idx, 1);
        res.json({success: true});
    } else {
        res.json({success: false, msg: "كلمة السر خاطئة"});
    }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`   ATOMIC SYSTEM ACTIVE ON PORT ${PORT}   `);
    console.log(`========================================`);
});