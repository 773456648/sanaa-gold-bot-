const express = require('express');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const app = express();

const PORT = process.env.PORT || 3000;
const DB_PATH = './hazards_db.json';

const TELEGRAM_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const MY_CHAT_ID = '5042495708';
const ADMIN_PASSWORD = '771232690'; 

app.use(express.json());
app.use(express.static('public')); // حط ملف index.html في مجلد public

let db = [];
if (fs.existsSync(DB_PATH)) {
    try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch (e) { db = []; }
}
const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// دالة حساب المسافة (Haversine)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const p1 = lat1 * Math.PI/180, p2 = lat2 * Math.PI/180;
    const dp = (lat2-lat1) * Math.PI/180, dl = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

let lastBackupMessageId = null;

async function sendToTelegram(message) {
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, { chat_id: MY_CHAT_ID, text: message });
    } catch (e) { console.error("Telegram Error"); }
}

async function sendFileToTelegram(caption = "📦 تحديث خريطة المطبات") {
    try {
        if (lastBackupMessageId) {
            try { await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/deleteMessage`, { chat_id: MY_CHAT_ID, message_id: lastBackupMessageId }); } catch (e) {}
        }
        const form = new FormData();
        form.append('chat_id', MY_CHAT_ID);
        form.append('caption', caption);
        form.append('document', fs.createReadStream(DB_PATH));

        const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`, form, { headers: form.getHeaders() });
        if (response.data && response.data.result) lastBackupMessageId = response.data.result.message_id;
    } catch (e) { console.error("Error sending backup"); }
}

// APIs
app.get('/api/hazards', (req, res) => res.json(db));

app.post('/api/hazards', (req, res) => {
    const { id, lat, lng, type, reporter, timestamp } = req.body;
    
    // فحص ذكاء منع التكرار في السيرفر (10 متر)
    const duplicate = db.find(h => getDistance(lat, lng, h.lat, h.lng) < 10);
    if(duplicate) {
        return res.status(400).json({ error: "تم رصد هذا الموقع مسبقاً", reporter: duplicate.reporter });
    }

    db.push({ id, lat, lng, type, reporter, timestamp });
    saveDB();
    
    // إرسال نسخة لتلجرام مع كل رصد جديد
    sendFileToTelegram(`🚗 تم رصد [${type}] جديد بواسطة ${reporter}`);
    res.json({ success: true });
});

// Telegram Webhook / Updates
app.post('/api/tg-webhook', async (req, res) => {
    const update = req.body;
    if (!update.message) return res.sendStatus(200);

    // استعادة ملف قاعدة البيانات
    if (update.message.document && update.message.document.file_name === 'hazards_db.json') {
        try {
            const fileRes = await axios.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${update.message.document.file_id}`);
            const response = await axios.get(`https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${fileRes.data.result.file_path}`);
            db = response.data;
            saveDB();
            await sendToTelegram("✅ تم استعادة خريطة المطبات بنجاح!");
        } catch (e) { await sendToTelegram("❌ فشل تحميل الملف."); }
        return res.sendStatus(200);
    }

    if (!update.message.text) return res.sendStatus(200);
    const text = update.message.text.trim();
    
    if (String(update.message.chat.id) !== MY_CHAT_ID || !text.startsWith(ADMIN_PASSWORD)) return res.sendStatus(200);
    
    const cmd = text.substring(ADMIN_PASSWORD.length).trim();
    if (cmd === "نسخة") await sendFileToTelegram("📦 هذه آخر نسخة من المطبات.");
    else if (cmd === "العدد") await sendToTelegram(`📊 إجمالي النقاط المرصودة: ${db.length} نقطة.`);
    
    res.sendStatus(200);
});

app.listen(PORT, () => console.log(`RADAR SYSTEM RUNNING ON PORT ${PORT}`));