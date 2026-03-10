const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// تشغيل الواجهة من المجلد الرئيسي
app.use(express.static(path.join(__dirname, '.')));

// بيانات النظام
let registeredBots = [];
const MASTER_KEY = "771232690";

// دالة إرسال التوجيهات لتليجرام
async function sendRoyalInstructions(token, chatid, userName) {
    const msg = `
👑 *مَنْظُومَةُ الهَيْبَةِ المَلَكِيَّةِ* 👑
ـــــــــــــــــــــــــــــــــــــــــــــــــ
أهلاً بك يا *${userName}* في السيرفر الرئيسي.
تم تفعيل الربط السحابي المشفر بنجاح 🛡️

*📜 بورتوكول العمل:*
1️⃣ التنبيهات تصلك هنا مباشرة.
2️⃣ "ترقيم شراء" 🟢 = إشارة دخول.
3️⃣ "ترقيم بيع" 🔴 = إشارة خروج.

*الحالة:* متصل بالسيرفر العالمي 📡
    `;
    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatid,
            text: msg,
            parse_mode: 'Markdown'
        });
    } catch (e) { console.log("Telegram Error"); }
}

// العرض الأساسي
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// APIs المنظومة
app.get('/api/bots', (req, res) => res.json(registeredBots));

app.post('/api/bots/register', async (req, res) => {
    const { name, token, chatid, password } = req.body;
    if (password !== MASTER_KEY) return res.status(401).json({ error: "كلمة السر خطأ" });
    
    const newBot = { id: Date.now(), name, token, chatid };
    registeredBots.push(newBot);
    await sendRoyalInstructions(token, chatid, name);
    res.json({ success: true });
});

app.post('/api/bots/remove', (req, res) => {
    const { id, password } = req.body;
    if (password !== MASTER_KEY) return res.status(401).json({ error: "لا تملك الصلاحية" });
    registeredBots = registeredBots.filter(b => b.id !== id);
    res.json({ success: true });
});

// المنفذ الخاص بـ Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`System Online on Port ${PORT}`));