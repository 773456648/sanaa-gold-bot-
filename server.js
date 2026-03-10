const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// مخزن البوتات (يفضل استخدام MongoDB أو SQL في الإنتاج)
let registeredBots = [];

// الإعدادات الذهبية
const MASTER_KEY = "771232690";

// دالة إرسال التوجيهات الفورية
async function sendHeibaInstructions(token, chatid, userName) {
    const instructions = `
🔥 *مَنْظُومَةُ الهَيْبَةِ - تَمَّ التَّفْعِيلُ* 🔥

أهلاً بك يا ${userName} في النخبة.
لقد تم ربط حسابك بالسيرفر العالمي للترقيم بنجاح.

*إليك تعليمات "الزلط" والربح:*
1️⃣ المنظومة تراقب السيولة (Whale Alerts) والزخم (RSI).
2️⃣ عند وصول رسالة "ترقيم شراء"، ادخل فوراً بنسبة 20% من محفظتك.
3️⃣ لا تطمع! المنظومة ستخبرك متى "تهرب بالزلط" (ترقيم بيع).
4️⃣ حافظ على سرية كلمة المرور الخاصة بك.

*الحالة الآن:* متصل وجاهز للترقيم 🟢
    `;
    
    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatid,
            text: instructions,
            parse_mode: 'Markdown'
        });
        return true;
    } catch (e) {
        return false;
    }
}

// جلب البوتات
app.get('/api/bots', (req, res) => {
    res.json(registeredBots);
});

// إضافة بوت وإرسال التعليمات فورا
app.post('/api/bots/register', async (req, res) => {
    const { name, token, chatid, password } = req.body;

    if (password !== MASTER_KEY) {
        return res.status(401).json({ error: "كلمة السر غير صحيحة يا صاحبي!" });
    }

    const newBot = { id: Date.now(), name, token, chatid };
    registeredBots.push(newBot);

    // إرسال التعليمات فوراً لتليجرام
    const sent = await sendHeibaInstructions(token, chatid, name);

    res.json({ 
        success: true, 
        message: sent ? "تم التسجيل وإرسال التعليمات لتليجرام ✅" : "تم التسجيل لكن فشل إرسال التعليمات (تأكد من التوكن) ⚠️" 
    });
});

// حذف بوت
app.post('/api/bots/remove', (req, res) => {
    const { id, password } = req.body;
    if (password !== MASTER_KEY) {
        return res.status(401).json({ error: "لا تملك الصلاحية!" });
    }
    registeredBots = registeredBots.filter(b => b.id !== id);
    res.json({ success: true });
});

app.listen(3000, () => console.log('Heiba Server is Running on port 3000'));