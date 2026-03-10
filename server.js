const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// تشغيل الملفات الثابتة من مجلد public (بناءً على صورتك)
app.use(express.static(path.join(__dirname, 'public')));
// وأيضاً من المجلد الرئيسي للاحتياط
app.use(express.static(path.join(__dirname, '.')));

let registeredBots = [];
const MASTER_KEY = "771232690";

// دالة إرسال التعليمات لتليجرام
async function sendRoyalInstructions(token, chatid, userName) {
    const msg = `👑 *منظومة الهيبة الملكية*\nأهلاً بك يا *${userName}*.\nتم تفعيل الربط بنجاح! 🛡️`;
    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatid,
            text: msg,
            parse_mode: 'Markdown'
        });
    } catch (e) { console.log("Telegram Error"); }
}

// المسار الأساسي - يبحث عن index.html في كل مكان محتمل
app.get('/', (req, res) => {
    const paths = [
        path.join(__dirname, 'index.html'),
        path.join(__dirname, 'public', 'index.html')
    ];
    
    for (const p of paths) {
        if (fs.existsSync(p)) {
            return res.sendFile(p);
        }
    }
    res.status(404).send("خطأ: لم يتم العثور على index.html. تأكد من وجوده في المجلد الرئيسي أو داخل مجلد public.");
});

app.get('/api/bots', (req, res) => res.json(registeredBots));

app.post('/api/bots/register', async (req, res) => {
    const { name, token, chatid, password } = req.body;
    if (password !== MASTER_KEY) return res.status(401).json({ error: "خطأ في الوصول" });
    const newBot = { id: Date.now(), name, token, chatid };
    registeredBots.push(newBot);
    await sendRoyalInstructions(token, chatid, name);
    res.json({ success: true });
});

app.post('/api/bots/remove', (req, res) => {
    const { id, password } = req.body;
    if (password !== MASTER_KEY) return res.status(401).json({ error: "غير مصرح" });
    registeredBots = registeredBots.filter(b => b.id !== id);
    res.json({ success: true });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Royal System Online on ${PORT}`));