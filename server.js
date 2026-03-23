const express = require('express');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const app = express();

const PORT = process.env.PORT || 3000;
const DB_PATH = './radar_db.json';

// إعدادات التلجرام
const TELEGRAM_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const MY_CHAT_ID = '5042495708';
const ADMIN_PASSWORD = '771'; 

app.use(express.json());
app.use(express.static('public'));

// هيكلة قاعدة البيانات الجديدة (مستخدمين + مطبات)
let db = { users: [], hazards: [] };
if (fs.existsSync(DB_PATH)) {
    try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch (e) { db = { users: [], hazards: [] }; }
}

const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

async function sendToTelegram(message) {
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: MY_CHAT_ID, text: message, parse_mode: 'Markdown'
        });
    } catch (e) { console.error("Telegram Error"); }
}

let lastBackupMessageId = null;

async function sendFileToTelegram(caption = "📦 نسخة احتياطية لرادار الطرق") {
    try {
        if (lastBackupMessageId) {
            try {
                await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/deleteMessage`, {
                    chat_id: MY_CHAT_ID, message_id: lastBackupMessageId
                });
            } catch (e) {} 
        }

        const form = new FormData();
        form.append('chat_id', MY_CHAT_ID);
        form.append('caption', caption);
        form.append('document', fs.createReadStream(DB_PATH));

        const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`, form, { headers: form.getHeaders() });

        if (response.data && response.data.result) {
            lastBackupMessageId = response.data.result.message_id;
        }
    } catch (e) { console.error("Backup Error"); }
}

// --- واجهات المستخدمين (تسجيل الدخول وإنشاء حساب) ---
app.post('/api/auth', (req, res) => {
    const { name, password, action } = req.body;
    if(!name || !password) return res.status(400).json({error: "البيانات ناقصة"});
    
    const normalizedName = name.trim().toLowerCase();
    const userIndex = db.users.findIndex(u => u.name.toLowerCase() === normalizedName);
    
    if (action === 'reg') {
        if (userIndex !== -1) return res.status(400).json({ error: "الاسم مستخدم مسبقاً." });
        const newUser = { id: Date.now().toString(), name: name.trim(), password };
        db.users.push(newUser);
        saveDB();
        sendToTelegram(`👤 *مستخدم جديد في الرادار:*\nالاسم: ${newUser.name}`);
        return res.json(newUser);
    } else {
        const user = db.users[userIndex];
        if (!user || user.password !== password) return res.status(403).json({ error: "الاسم أو كلمة المرور خاطئة." });
        return res.json(user);
    }
});

// --- واجهات المطبات (الرصد والجلب) ---
app.get('/api/hazards', (req, res) => res.json(db.hazards));

app.post('/api/hazards', (req, res) => {
    const newHazard = req.body;
    db.hazards.push(newHazard);
    saveDB();
    sendFileToTelegram(`⚠️ *نقطة خطر جديدة!*\nالنوع: ${newHazard.type}\nالراصد: ${newHazard.reporter}`);
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`SYSTEM RUNNING ON PORT ${PORT}`));