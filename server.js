const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// هامة جداً: تخبر السيرفر أين يجد ملف الـ HTML (باعتبار الملف في نفس المجلد)
app.use(express.static(path.join(__dirname, '.')));

// مخزن البوتات المؤقت
let registeredBots = [];
const MASTER_KEY = "771232690";

// دالة إرسال التعليمات الملكية
async function sendHeibaInstructions(token, chatid, userName) {
    const instructions = `
🔥 *مَنْظُومَةُ الهَيْبَةِ - تَمَّ التَّفْعِيلُ* 🔥

أهلاً بك يا ${userName} في النخبة.
لقد تم ربط حسابك بالسيرفر العالمي للترقيم بنجاح.

*إليك تعليمات "الزلط" والربح:*
1️⃣ عند وصول رسالة "ترقيم شراء"، ادخل فوراً بنسبة 20% من محفظتك.
2️⃣ لا تطمع! المنظومة ستخبرك متى "تهرب بالزلط".
3️⃣ حافظ على سرية كلمة المرور الخاصة بك.

*الحالة الآن:* متصل وجاهز للترقيم 🟢
    `;
    
    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatid,
            text: instructions,
            parse_mode: 'Markdown'
        });
        return true;
    } catch (e) { return false; }
}

// العرض الأساسي للواجهة (حل مشكلة Cannot GET /)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// جلب البوتات
app.get('/api/bots', (req, res) => {
    res.json(registeredBots);
});

// إضافة بوت
app.post('/api/bots/register', async (req, res) => {
    const { name, token, chatid, password } = req.body;
    if (password !== MASTER_KEY) return res.status(401).json({ error: "كلمة السر خطأ!" });

    const newBot = { id: Date.now(), name, token, chatid };
    registeredBots.push(newBot);
    const sent = await sendHeibaInstructions(token, chatid, name);

    res.json({ success: true, message: "تم الربط وإرسال التعليمات ✅" });
});

// حذف بوت
app.post('/api/bots/remove', (req, res) => {
    const { id, password } = req.body;
    if (password !== MASTER_KEY) return res.status(401).json({ error: "لا تملك الصلاحية!" });
    registeredBots = registeredBots.filter(b => b.id !== id);
    res.json({ success: true });
});

// تحديد المنفذ تلقائياً لـ Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`المنظومة تعمل على المنفذ ${PORT}`));