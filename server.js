const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_final_database.json';

// --- إعدادات البوت الخاصة بك يا هيبة ---
const TELEGRAM_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const MY_CHAT_ID = '5042495708';

app.use(express.json());
app.use(express.static('public'));

let db = { users: [] };
if (fs.existsSync(DB_PATH)) {
    try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch (e) { db = { users: [] }; }
}

const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// وظيفة إرسال رسائل تلجرام مع معالجة الأخطاء
async function sendToTelegram(message) {
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: MY_CHAT_ID,
            text: `🏛 **نظام الهيبة المركزي**\n\n${message}`,
            parse_mode: 'Markdown'
        });
    } catch (e) {
        console.error("Telegram Notification Failed");
    }
}

// تسجيل / دخول
app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    const normalized = name.trim().toLowerCase();
    const existingUser = db.users.find(u => u.name.toLowerCase() === normalized);

    if (action === 'reg') {
        if (existingUser) return res.status(400).json({ error: "الاسم مسجل مسبقاً" });
        const newUser = {
            id: "H" + Math.random().toString(36).substr(2, 7),
            name: name.trim(),
            password,
            type,
            myRecords: [],
            createdAt: new Date().toISOString()
        };
        db.users.push(newUser);
        saveDB();
        sendToTelegram(`✅ *عضو جديد انضم:*\nالاسم: ${newUser.name}\nالرتبة: ${type === 'merchant' ? 'تاجر' : 'مدين'}`);
        return res.json(newUser);
    } else {
        const user = db.users.find(u => u.name.toLowerCase() === normalized && u.password === password);
        if (!user) return res.status(403).json({ error: "بيانات الدخول غير صحيحة" });
        return res.json(user);
    }
});

// تحديث كلمة السر
app.post('/api/update-pass', (req, res) => {
    const { userId, newPass } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (user) {
        user.password = newPass;
        saveDB();
        sendToTelegram(`🔐 *تنبيه أمني:*\nالمستخدم [${user.name}] قام بتغيير كلمة السر.`);
        res.json({ success: true });
    } else {
        res.status(404).send();
    }
});

// المزامنة التلقائية للمدينين
app.get('/api/auto-discover', (req, res) => {
    const { debtorName } = req.query;
    const normalizedDebtor = debtorName.trim().toLowerCase();
    const results = db.users.filter(u => 
        u.type === 'merchant' && 
        u.myRecords.some(r => r.targetName.toLowerCase() === normalizedDebtor)
    ).map(u => ({
        merchantName: u.name,
        records: u.myRecords.filter(r => r.targetName.toLowerCase() === normalizedDebtor)
    }));
    res.json(results);
});

// حفظ السجلات
app.post('/api/sync', (req, res) => {
    const { userId, myRecords } = req.body;
    const idx = db.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
        db.users[idx].myRecords = myRecords;
        saveDB();
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "فشل المزامنة" });
    }
});

app.listen(PORT, () => console.log(`SYSTEM RUNNING ON PORT ${PORT}`));