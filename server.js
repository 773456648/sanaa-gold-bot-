const express = require('express');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const app = express();

const PORT = process.env.PORT || 3000;
// نفس قاعدة البيانات القديمة، لكن ضفنا مصفوفة للمطبات
const DB_PATH = './radar_db.json'; 

// إعدادات التلجرام (بناءً على الكود الخاص بك)
const TELEGRAM_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const MY_CHAT_ID = '5042495708';
const ADMIN_PASSWORD = '771232690'; 

app.use(express.json());
app.use(express.static('public'));

let db = { users: [], bumps: [] }; // تم إضافة مصفوفة المطبات
if (fs.existsSync(DB_PATH)) {
    try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch (e) { db = { users: [], bumps: [] }; }
}
if(!db.bumps) db.bumps = []; // تهيئة في حال كانت الداتا القديمة موجودة

const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

async function sendToTelegram(message) {
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: MY_CHAT_ID, text: message, parse_mode: 'Markdown'
        });
    } catch (e) { console.error("Telegram Error"); }
}

let lastBackupMessageId = null;

async function sendFileToTelegram(caption = "📦 نسخة احتياطية محدثة لرادار المطبات") {
    try {
        if (lastBackupMessageId) {
            try {
                await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/deleteMessage`, { chat_id: MY_CHAT_ID, message_id: lastBackupMessageId });
            } catch (e) {}
        }
        const form = new FormData();
        form.append('chat_id', MY_CHAT_ID); form.append('caption', caption); form.append('document', fs.createReadStream(DB_PATH));
        const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`, form, { headers: form.getHeaders() });
        if (response.data && response.data.result) lastBackupMessageId = response.data.result.message_id;
    } catch (e) { console.error("Error sending automatic backup file"); }
}

// واجهة التسجيل الموحدة
app.post('/api/auth', (req, res) => {
    const { name, password, type, action } = req.body;
    if(!name || !password) return res.status(400).json({error: "بيانات ناقصة"});
    const normalizedName = name.trim().toLowerCase();
    const userIndex = db.users.findIndex(u => u.name.toLowerCase() === normalizedName && u.type === type);
    
    if (action === 'reg') {
        if (userIndex !== -1) return res.status(400).json({ error: "الاسم مسجل مسبقاً." });
        const newUser = { id: "R" + Math.random().toString(36).substr(2, 7), name: name.trim(), password, type, createdAt: new Date().toISOString() };
        db.users.push(newUser); saveDB();
        sendToTelegram(`✨ *تسجيل مستخدم جديد في الرادار:*\nالاسم: ${newUser.name}\nالنوع: ${type === 'merchant' ? 'راصد' : 'سائق'}`);
        return res.json(newUser);
    } else {
        const user = db.users[userIndex];
        if (!user || user.password !== password) return res.status(403).json({ error: "بيانات الدخول خاطئة." });
        return res.json(user);
    }
});

// --- APIs الرادار الجديدة ---

// 1. جلب كل المطبات لجميع المستخدمين (المزامنة اللحظية)
app.get('/api/bumps', (req, res) => {
    res.json(db.bumps);
});

// 2. تسجيل مطب جديد وإرساله للتلجرام
app.post('/api/add-bump', (req, res) => {
    const { lat, lng, userId, userName } = req.body;
    
    // حساب عدد المطبات التي سجلها هذا الراصد من قبل
    const userBumpsCount = db.bumps.filter(b => b.recorderId === userId).length + 1;

    const newBump = {
        id: Date.now(),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        recorderId: userId,
        recorderName: userName,
        recorderTotal: userBumpsCount,
        timestamp: new Date().toISOString()
    };

    db.bumps.push(newBump);
    saveDB();

    // إرسال تنبيه فوري للتلجرام
    const tgMsg = `🚨 *تم رصد مطب جديد!*\n\n📍 الإحداثيات: \`${lat}, ${lng}\`\n👤 تم الرصد بواسطة: *${userName}*\n📈 إجمالي المطبات التي رصدها: ${userBumpsCount}\n\n[🔗 افتح الموقع على خرائط جوجل](https://www.google.com/maps/search/?api=1&query=${lat},${lng})`;
    sendToTelegram(tgMsg);
    
    // إرسال النسخة الاحتياطية كملف
    sendFileToTelegram(`📦 قاعدة البيانات بعد إضافة مطب جديد بواسطة ${userName}`);

    res.json({ success: true, bump: newBump });
});

// أوامر التلجرام للتحكم (نفس أوامرك السابقة مع تعديلات بسيطة)
app.post('/api/tg-webhook', async (req, res) => {
    const update = req.body;
    if (!update.message) return res.sendStatus(200);

    if (update.message.document && update.message.document.file_name === 'radar_db.json') {
        // كود استعادة النسخة الاحتياطية
        return res.sendStatus(200);
    }

    if (!update.message.text) return res.sendStatus(200);
    const chatId = String(update.message.chat.id);
    const fullText = update.message.text.trim();

    if (chatId !== MY_CHAT_ID || !fullText.startsWith(ADMIN_PASSWORD)) return res.sendStatus(200);

    let cmd = fullText.substring(ADMIN_PASSWORD.length).trim();
    if (cmd === "البيانات") {
        await sendFileToTelegram("📦 هذه آخر نسخة من قاعدة بيانات الرادار.");
    } else if (cmd === "العدد") {
        await sendToTelegram(`📊 *الإحصائيات:*\n\n👥 عدد المستخدمين: ${db.users.length}\n⚠️ عدد المطبات المرصودة: ${db.bumps.length}`);
    }
    res.sendStatus(200);
});

app.listen(PORT, () => console.log(`RADAR SYSTEM RUNNING ON PORT ${PORT}`));