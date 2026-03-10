const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// تشغيل الملفات من المجلد الرئيسي مباشرة
app.use(express.static(path.join(__dirname, '.')));

let registeredBots = [];
const MASTER_KEY = "771232690";

// دالة إرسال التوجيهات الملكية
async function sendRoyalInstructions(token, chatid, userName) {
    const msg = `
👑 *مَنْظُومَةُ الهَيْبَةِ المَلَكِيَّةِ* 👑
ـــــــــــــــــــــــــــــــــــــــــــــــــ
مرحباً بك يا *${userName}* في وحدة النخبة.
تم تفعيل الربط المشفر بنجاح 🛡️

*📜 بورتوكول العمل:*
• التنبيهات تصلك هنا بسرعة (0.5ms).
• "ترقيم شراء" 🟢 = دخول آمن.
• "ترقيم بيع" 🔴 = جني أرباح.

*الحالة:* مُتَّصِل بالسيرفر الرئيسي 📡
    `;
    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatid,
            text: msg,
            parse_mode: 'Markdown'
        });
    } catch (e) { console.log("Telegram API Error"); }
}

// العرض الأساسي - هذا الجزء هو الذي يحل مشكلة ENOENT
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("خطأ ملكي: ملف index.html غير موجود في المجلد الرئيسي على GitHub. تأكد من رفعه بجانب server.js مباشرة.");
    }
});

app.get('/api/bots', (req, res) => res.json(registeredBots));

app.post('/api/bots/register', async (req, res) => {
    const { name, token, chatid, password } = req.body;
    if (password !== MASTER_KEY) return res.status(401).json({ error: "كلمة السر غير صحيحة" });
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Royal Heiba System Live on Port ${PORT}`));