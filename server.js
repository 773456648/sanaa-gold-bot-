const express = require('express');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const app = express();

const PORT = process.env.PORT || 3000;
const DB_PATH = './hazards_db.json';

// إعدادات التلجرام (تنبيه: يُفضل عدم مشاركة التوكن علناً في المستقبل)
const TELEGRAM_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const MY_CHAT_ID = '5042495708';
const ADMIN_PASSWORD = '771'; // اختصرت الرقم السري لسهولة الاستخدام

app.use(express.json());
app.use(express.static('public'));

let db = { hazards: [] };
if (fs.existsSync(DB_PATH)) {
    try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch (e) { db = { hazards: [] }; }
}

const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

async function sendToTelegram(message) {
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: MY_CHAT_ID, text: message, parse_mode: 'Markdown'
        });
    } catch (e) { console.error("خطأ في إرسال رسالة التلجرام"); }
}

let lastBackupMessageId = null;

async function sendFileToTelegram(caption = "📦 نسخة احتياطية محدثة لرادار الطرق") {
    try {
        if (lastBackupMessageId) {
            try {
                await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/deleteMessage`, {
                    chat_id: MY_CHAT_ID, message_id: lastBackupMessageId
                });
            } catch (e) {} // تجاهل إذا لم يتم العثور على الرسالة
        }

        const form = new FormData();
        form.append('chat_id', MY_CHAT_ID);
        form.append('caption', caption);
        form.append('document', fs.createReadStream(DB_PATH));

        const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`, form, {
            headers: form.getHeaders()
        });

        if (response.data && response.data.result) {
            lastBackupMessageId = response.data.result.message_id;
        }
    } catch (e) { console.error("خطأ في إرسال ملف النسخة الاحتياطية"); }
}

// --- أوامر البوت واستعادة النسخة ---
app.post('/api/tg-webhook', async (req, res) => {
    const update = req.body;
    if (!update.message) return res.sendStatus(200);

    // استعادة البيانات عند إرسال ملف JSON للبوت
    if (update.message.document) {
        const doc = update.message.document;
        if (doc.file_name === 'hazards_db.json') {
            try {
                const fileRes = await axios.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${doc.file_id}`);
                const filePath = fileRes.data.result.file_path;
                const response = await axios.get(`https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`);
                db = response.data;
                saveDB();
                await sendToTelegram("✅ *تم استعادة خريطة المطبات والحفر بنجاح!*");
            } catch (e) { await sendToTelegram("❌ *فشل تحميل الملف.*"); }
        }
        return res.sendStatus(200);
    }

    if (!update.message.text) return res.sendStatus(200);
    
    const chatId = String(update.message.chat.id);
    const fullText = update.message.text.trim();

    if (chatId !== MY_CHAT_ID || !fullText.startsWith(ADMIN_PASSWORD)) return res.sendStatus(200);

    let cmd = fullText.substring(ADMIN_PASSWORD.length).trim();
    if (!cmd) return res.sendStatus(200);

    if (cmd === "نسخة") {
        await sendFileToTelegram("📦 أحدث نسخة من خريطة الرادار.");
    } else if (cmd === "الاحصائيات") {
        const total = db.hazards.length;
        await sendToTelegram(`📊 *إحصائيات الرادار:*\n\nتوجد ${total} نقطة خطر مسجلة في النظام.`);
    } else if (cmd === "مسح الكل") {
        db.hazards = [];
        saveDB();
        await sendFileToTelegram("🗑️ تم تصفير قاعدة البيانات.");
    }
    res.sendStatus(200);
});

// --- واجهات برمجة الرادار (APIs) ---
app.get('/api/hazards', (req, res) => {
    res.json(db.hazards);
});

app.post('/api/hazards', (req, res) => {
    const newHazard = req.body;
    db.hazards.push(newHazard);
    saveDB();
    sendFileToTelegram(`⚠️ *رصد جديد!*\nالنوع: ${newHazard.type}\nبواسطة: ${newHazard.reporter}`);
    res.json({ success: true });
});

app.post('/api/sync-offline', (req, res) => {
    const offlineHazards = req.body;
    let added = 0;
    offlineHazards.forEach(h => {
        if (!db.hazards.find(existing => existing.id === h.id)) {
            db.hazards.push(h);
            added++;
        }
    });
    if (added > 0) {
        saveDB();
        sendFileToTelegram(`🔄 *مزامنة أوفلاين!*\nتم إضافة ${added} نقاط جديدة بعد عودة الإنترنت.`);
    }
    res.json({ success: true, total: db.hazards.length });
});

app.listen(PORT, () => console.log(`SYSTEM RUNNING ON PORT ${PORT}`));