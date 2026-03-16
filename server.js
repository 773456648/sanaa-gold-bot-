const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_royal_db.json';

const TELEGRAM_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const MY_CHAT_ID = '5042495708';
const WEBHOOK_URL = 'https://sanaa-gold-bot-1.onrender.com/api/tg-webhook';

app.use(express.json());
app.use(express.static('public'));

let db = { users: [], stamps: [] };
if (fs.existsSync(DB_PATH)) {
    try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch (e) { db = { users: [], stamps: [] }; }
}

const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// إعداد الـ Webhook عند بدء التشغيل
const setupWebhook = async () => {
    try {
        await axios.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${WEBHOOK_URL}`);
        console.log("Webhook Set Successfully");
    } catch (e) { console.error("Webhook Error"); }
};
setupWebhook();

// --- معالج أوامر البوت (Webhook) ---
app.post('/api/tg-webhook', async (req, res) => {
    const message = req.body.message;
    if (!message || !message.text) return res.sendStatus(200);

    const chatId = message.chat.id.toString();
    const text = message.text.trim();

    // تأكد أن المتحكم هو أنت فقط
    if (chatId !== MY_CHAT_ID) return res.sendStatus(200);

    let reply = "";

    if (text === 'العدد') {
        reply = `📊 عدد المشتركين: ${db.users.length}`;
    } 
    else if (text === 'كل المشتركين') {
        reply = "👥 قائمة المشتركين:\n" + db.users.map(u => `- ${u.name} (${u.type})`).join('\n');
    }
    else if (text.startsWith('بحث ')) {
        const name = text.replace('بحث ', '').trim();
        const u = db.users.find(x => x.name.toLowerCase() === name.toLowerCase());
        reply = u ? `🔍 الاسم: ${u.name}\n🔑 السر: ${u.password}\n🎭 النوع: ${u.type}` : "❌ غير موجود";
    }
    else if (text.startsWith('حذف ')) {
        const name = text.replace('حذف ', '').trim();
        const initialLen = db.users.length;
        db.users = db.users.filter(x => x.name.toLowerCase() !== name.toLowerCase());
        if (db.users.length < initialLen) {
            saveDB();
            reply = `🗑️ تم حذف [${name}] نهائياً من النظام.`;
        } else reply = "❌ الاسم غير موجود.";
    }

    if (reply) {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, { chat_id: chatId, text: reply });
    }
    res.sendStatus(200);
});

// --- نظام التوثيق والخصم الآلي الفوري ---
app.post('/api/verify-auth', (req, res) => {
    const { action, debtorName, merchantName, authCode, merchantId, amount, currency } = req.body;

    if (action === 'create_smart') {
        if(db.stamps.some(s => s.authCode === authCode)) return res.status(400).json({error: "الكود مستخدم مسبقاً"});
        db.stamps.push({ debtorName, merchantName, authCode, amount: parseFloat(amount), currency, createdAt: Date.now() });
        saveDB();
        return res.json({ success: true });
    }

    if (action === 'check') {
        const merch = db.users.find(u => u.id === merchantId);
        const stamp = db.stamps.find(s => s.authCode === authCode && s.merchantName === merch.name);
        
        if(!stamp) return res.status(400).json({error: "كود خاطئ"});

        // الخصم الفوري الطوالي من الرصيد
        let amountToVerify = parseFloat(stamp.amount);
        merch.myRecords.forEach(r => {
            if(r.targetName === stamp.debtorName && r.currency === stamp.currency && !r.isVerified && r.type === 'دين' && amountToVerify > 0) {
                let rAmt = parseFloat(r.amount);
                if (rAmt <= amountToVerify) {
                    r.isVerified = true;
                    r.authCode = authCode;
                    amountToVerify -= rAmt;
                }
            }
        });

        saveDB();
        res.json({ newRecords: merch.myRecords });
    }
});

// --- الدخول والمزامنة الحية ---
app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    let user = db.users.find(u => u.name.toLowerCase() === name.toLowerCase().trim() && u.type === type);

    if (action === 'reg') {
        if (user) return res.status(400).json({ error: "مسجل مسبقاً" });
        user = { id: "H" + Math.random().toString(36).substr(2, 5), name: name.trim(), password, type, myRecords: [] };
        db.users.push(user); saveDB();
        return res.json(user);
    } else {
        if (!user || user.password !== password) return res.status(403).json({ error: "بيانات خاطئة" });
        return res.json(user);
    }
});

app.post('/api/sync', (req, res) => {
    const { userId, op } = req.body;
    const u = db.users.find(x => x.id === userId);
    if (!u) return res.status(404).send();
    u.myRecords.push(op);
    saveDB();
    res.json({ newRecords: u.myRecords });
});

app.get('/api/auto-discover', (req, res) => {
    const results = db.users.filter(u => u.type === 'merchant' && u.myRecords.some(r => r.targetName.toLowerCase() === req.query.debtorName.toLowerCase()))
    .map(u => ({ merchantName: u.name, records: u.myRecords.filter(r => r.targetName.toLowerCase() === req.query.debtorName.toLowerCase()) }));
    res.json(results);
});

app.listen(PORT, () => console.log(`SYSTEM ACTIVE ON PORT ${PORT}`));