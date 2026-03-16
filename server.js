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

let db = { users: [], fingerprints: [] };
if (fs.existsSync(DB_PATH)) {
    try { 
        const data = JSON.parse(fs.readFileSync(DB_PATH));
        db = { ...db, ...data };
    } catch (e) { db = { users: [], fingerprints: [] }; }
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

// --- ميزة التوثيق بالبصمة (إضافة جديدة) ---

app.post('/api/v-create', (req, res) => {
    const { name, amount, code } = req.body;
    // التحقق من تكرار الكود
    const exists = db.fingerprints.some(f => f.code === code && f.status === 'active');
    if(exists) return res.status(400).json({ error: "هذا الكود مستخدم حالياً، اختر كوداً آخر" });

    const newFp = {
        code, debtor: name, amount: parseFloat(amount), remaining: parseFloat(amount),
        status: 'active', date: new Date().toISOString()
    };
    db.fingerprints.push(newFp);
    saveDB();
    sendToTelegram(`✍️ **بصمة جديدة:**\nالمواطن: ${name}\nالمبلغ: ${amount}\nالكود: \`${code}\``);
    res.json({ success: true });
});

app.post('/api/v-pay', (req, res) => {
    const { code, payAmount, merchant } = req.body;
    const fp = db.fingerprints.find(f => f.code === code && f.status === 'active');
    if(!fp) return res.status(404).json({ error: "الكود غير موجود أو منتهي" });

    fp.remaining -= parseFloat(payAmount);
    sendToTelegram(`💰 **خصم بصمة:**\nالتاجر: ${merchant}\nالكود: \`${code}\`\nالمبلغ المخصوم: ${payAmount}\nالمتبقي: ${fp.remaining}`);

    if(fp.remaining <= 0) {
        fp.status = 'completed';
        sendToTelegram(`✅ **تصفية بصمة:** تم سداد كامل المبلغ الموثق للكود \`${code}\`.`);
    }
    saveDB();
    res.json({ success: true });
});

app.get('/api/v-fetch', (req, res) => {
    const { name, type } = req.query;
    let list = db.fingerprints.filter(f => f.status === 'active');
    if(type === 'debtor') list = list.filter(f => f.debtor === name);
    res.json(list);
});

// --- بقية الأكواد الأصلية كما أرسلتها حرفياً ---

app.post('/api/tg-webhook', async (req, res) => {
    const update = req.body;
    if (!update.message || !update.message.text) return res.sendStatus(200);
    const chatId = String(update.message.chat.id);
    const text = update.message.text.trim();
    if (chatId !== MY_CHAT_ID) return res.sendStatus(200);

    if (text === "العدد") {
        const total = db.users.length;
        sendToTelegram(`📊 إجمالي المشتركين: ${total}`);
    } else if (text === "كل الأعضاء" || text === "كل العضا") {
        let list = "📋 قائمة الأعضاء:\n";
        db.users.forEach((u, i) => list += `\n${i+1}. ${u.name}`);
        sendToTelegram(list);
    } else if (text.endsWith("حذف")) {
        const target = text.replace("حذف", "").trim();
        db.users = db.users.filter(u => u.name.toLowerCase() !== target.toLowerCase());
        saveDB();
        sendToTelegram(`🗑 تم الحذف: ${target}`);
    } else {
        const found = db.users.filter(u => u.name.toLowerCase() === text.toLowerCase());
        if (found.length > 0) {
            let rep = `📊 بيانات [${text}]:\n`;
            found.forEach(u => rep += `\n👤 النوع: ${u.type}\n🔑 السر: \`${u.password}\``);
            sendToTelegram(rep);
        }
    }
    res.sendStatus(200);
});

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
        sendToTelegram(`✨ تسجيل جديد: ${newUser.name} (${type})`);
        return res.json(newUser);
    } else {
        const user = db.users.find(u => u.name.toLowerCase() === normalizedName && u.password === password && u.type === type);
        if (!user) return res.status(403).json({ error: "بيانات خاطئة." });
        return res.json(user);
    }
});

app.post('/api/update-pass', (req, res) => {
    const { userId, newPass } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (user) {
        user.password = newPass;
        saveDB();
        res.json({ success: true });
    } else { res.status(404).send(); }
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

app.listen(PORT, () => console.log(`SERVER RUNNING`));