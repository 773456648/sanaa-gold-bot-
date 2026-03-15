const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_royal_db.json';

// إعدادات التلجرام الخاصة بك
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
    } catch (e) {}
}

// --- نظام الويب هوك الخاص بالإدارة (العدد، حذف، بحث) ---
app.post('/api/tg-webhook', async (req, res) => {
    const update = req.body;
    if (!update.message || !update.message.text) return res.sendStatus(200);
    const chatId = String(update.message.chat.id);
    const text = update.message.text.trim();
    if (chatId !== MY_CHAT_ID) return res.sendStatus(200);

    if (text === "العدد") {
        sendToTelegram(`📊 **إجمالي المشتركين:** ${db.users.length}`);
    } else if (text === "كل الأعضاء") {
        let list = "📋 **قائمة الأعضاء:**\n" + db.users.map((u, i) => `${i + 1}. ${u.name} (${u.type})`).join('\n');
        sendToTelegram(list);
    } else if (text.endsWith("حذف")) {
        const target = text.replace("حذف", "").trim();
        db.users = db.users.filter(u => u.name.toLowerCase() !== target.toLowerCase());
        saveDB();
        sendToTelegram(`🗑 تم حذف الحساب: [${target}] بنجاح.`);
    } else {
        const found = db.users.filter(u => u.name.toLowerCase() === text.toLowerCase());
        if (found.length > 0) {
            sendToTelegram(`🔍 **بيانات الحساب:**\nالاسم: ${found[0].name}\nكلمة السر: \`${found[0].password}\`\nالنوع: ${found[0].type}`);
        }
    }
    res.sendStatus(200);
});

// --- نظام تحديث الحالة (موافقة/رفض) وإرسال إشعار للمدير ---
app.post('/api/op-status', (req, res) => {
    const { opId, newStatus, reason, merchantName, debtorName } = req.body;
    const merchant = db.users.find(u => u.name === merchantName && u.type === 'merchant');
    if (merchant) {
        const op = merchant.myRecords.find(r => r.id === opId);
        if (op) {
            op.status = newStatus;
            if (newStatus === 'rejected') {
                op.rejectReason = reason;
                sendToTelegram(`⚠️ **اعتراض (سد):**\nالمواطن: ${debtorName}\nالتاجر: ${merchantName}\nالمبلغ: ${op.amount}\nالسبب: ${reason}`);
            } else {
                sendToTelegram(`✅ **دكيد (موافقة):**\nوافق المواطن ${debtorName} على عملية التاجر ${merchantName} بمبلغ ${op.amount}`);
            }
            saveDB();
            return res.json({ success: true });
        }
    }
    res.status(404).send();
});

// ميزة المزامنة للتاجر لرؤية تحديثات المواطن فوراً
app.get('/api/merchant-sync', (req, res) => {
    const user = db.users.find(u => u.id === req.query.userId);
    res.json({ myRecords: user ? user.myRecords : [] });
});

app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    const normalizedName = name.trim().toLowerCase();
    const existing = db.users.find(u => u.name.toLowerCase() === normalizedName && u.type === type);
    
    if (action === 'reg') {
        if (existing) return res.status(400).json({ error: "الاسم مسجل مسبقاً" });
        const newUser = { 
            id: "H" + Date.now() + Math.floor(Math.random() * 1000), 
            name: name.trim(), 
            password, 
            type, 
            myRecords: [], 
            createdAt: new Date().toISOString() 
        };
        db.users.push(newUser);
        saveDB();
        sendToTelegram(`✨ **عضو جديد انضم:**\nالاسم: ${name}\nالرتبة: ${type}`);
        return res.json(newUser);
    } else {
        const user = db.users.find(u => u.name.toLowerCase() === normalizedName && u.password === password && u.type === type);
        if (!user) return res.status(403).json({ error: "بيانات الدخول غير صحيحة" });
        return res.json(user);
    }
});

app.post('/api/sync', (req, res) => {
    const user = db.users.find(u => u.id === req.body.userId);
    if (user) {
        user.myRecords = req.body.myRecords;
        saveDB();
        res.json({ success: true });
    } else res.status(404).send();
});

app.get('/api/auto-discover', (req, res) => {
    const dName = req.query.debtorName.toLowerCase();
    const results = db.users.filter(u => u.type === 'merchant' && u.myRecords.some(r => r.targetName.toLowerCase() === dName))
    .map(u => ({ merchantName: u.name, records: u.myRecords.filter(r => r.targetName.toLowerCase() === dName) }));
    res.json(results);
});

app.post('/api/update-pass', (req, res) => {
    const user = db.users.find(u => u.id === req.body.userId);
    if (user) {
        user.password = req.body.newPass;
        saveDB();
        sendToTelegram(`🔐 **تحديث كلمة سر:**\nالمستخدم: ${user.name}`);
        res.json({ success: true });
    } else res.status(404).send();
});

app.listen(PORT, () => console.log(`HEIBA ROYAL SYSTEM READY ON PORT ${PORT}`));