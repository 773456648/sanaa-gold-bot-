const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_royal_db.json';

const TELEGRAM_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const MY_CHAT_ID = '5042495708';

app.use(express.json());
app.use(express.static('public'));

let db = { users: [] };
if (fs.existsSync(DB_PATH)) {
    try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch (e) { db = { users: [] }; }
}

const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

async function sendToTelegram(message) {
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: MY_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
    } catch (e) { console.error("Telegram Error"); }
}

app.post('/api/tg-webhook', async (req, res) => {
    const update = req.body;
    if (!update.message || !update.message.text) return res.sendStatus(200);
    const chatId = String(update.message.chat.id);
    const text = update.message.text.trim();

    if (chatId !== MY_CHAT_ID) return res.sendStatus(200);

    if (text === "العدد") {
        sendToTelegram(`📊 الحسابات: ${db.users.length}`);
    } 
    else if (text.endsWith("توثيق")) {
        const target = text.replace("توثيق", "").trim();
        let user = db.users.find(u => u.name.toLowerCase() === target.toLowerCase());
        if (user) {
            user.verified = true;
            saveDB();
            sendToTelegram(`✅ تم توثيق حساب [${target}] بنجاح.`);
        } else {
            sendToTelegram(`❌ الحساب [${target}] غير موجود.`);
        }
    }
    else if (text.endsWith("الغاء")) {
        const target = text.replace("الغاء", "").trim();
        let user = db.users.find(u => u.name.toLowerCase() === target.toLowerCase());
        if (user) {
            user.verified = false;
            saveDB();
            sendToTelegram(`⚠️ تم إلغاء توثيق [${target}].`);
        }
    }
    else if (text.endsWith("حذف")) {
        const targetName = text.replace("حذف", "").trim();
        db.users = db.users.filter(u => u.name.toLowerCase() !== targetName.toLowerCase());
        saveDB();
        sendToTelegram(`🗑 تم حذف [${targetName}].`);
    }
    else {
        sendToTelegram("👑 **أوامر التحكم:**\n• الاسم توثيق\n• الاسم الغاء\n• الاسم حذف\n• العدد");
    }
    res.sendStatus(200);
});

app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    const normalizedName = name.trim().toLowerCase();
    const existingUser = db.users.find(u => u.name.toLowerCase() === normalizedName && u.type === type);

    if (action === 'reg') {
        // إذا كان الحساب مسجل وله كلمة مرور فعلاً
        if (existingUser && existingUser.password) {
            return res.status(400).json({ error: "هذا الحساب مسجل مسبقاً بكود سري." });
        }

        if (existingUser) {
            existingUser.password = password;
        } else {
            db.users.push({
                id: "H" + Math.random().toString(36).substr(2, 7),
                name: name.trim(), password, type, myRecords: [], verified: false, createdAt: new Date().toISOString()
            });
        }
        saveDB();
        sendToTelegram(`✨ عضو جديد: ${name} (${type})`);
        return res.json(db.users.find(u => u.name.toLowerCase() === normalizedName));
    } else {
        const user = db.users.find(u => u.name.toLowerCase() === normalizedName && u.password === password && u.type === type);
        if (!user) return res.status(403).json({ error: "بيانات خاطئة أو الحساب غير موجود." });
        return res.json(user);
    }
});

app.post('/api/sync', (req, res) => {
    const { userId, myRecords } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (user) {
        user.myRecords = myRecords;
        saveDB();
        res.json({ success: true });
    } else { res.status(404).send(); }
});

app.get('/api/auto-discover', (req, res) => {
    const { debtorName } = req.query;
    if(!debtorName) return res.json([]);
    const results = db.users.filter(u => u.type === 'merchant' && u.myRecords.some(r => r.targetName.toLowerCase() === debtorName.toLowerCase()))
    .map(u => ({ merchantName: u.name, records: u.myRecords.filter(r => r.targetName.toLowerCase() === debtorName.toLowerCase()) }));
    res.json(results);
});

app.listen(PORT, () => console.log(`HEIBA RUNNING ON ${PORT}`));