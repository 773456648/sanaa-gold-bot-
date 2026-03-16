const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_master_db.json';

// إعدادات التلجرام الأصلية الخاصة بك
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
    } catch (e) { console.error("خطأ في إرسال التلجرام"); }
}

// --- نظام التحكم عبر التلجرام (الويب هوك الأصلي) ---
app.post('/api/tg-webhook', async (req, res) => {
    const update = req.body;
    if (!update.message || !update.message.text) return res.sendStatus(200);
    const chatId = String(update.message.chat.id);
    const text = update.message.text.trim();
    if (chatId !== MY_CHAT_ID) return res.sendStatus(200);

    if (text === "العدد") {
        const total = db.users.length;
        sendToTelegram(`📊 إجمالي المشتركين في المنصة: ${total}`);
    } else if (text === "كل الأعضاء" || text === "كل العضا") {
        let list = "📋 قائمة أعضاء المنصة الملكية:\n";
        db.users.forEach((u, i) => list += `\n${i+1}. ${u.name} (${u.type})`);
        sendToTelegram(list);
    } else if (text.endsWith("حذف")) {
        const target = text.replace("حذف", "").trim();
        db.users = db.users.filter(u => u.name.toLowerCase() !== target.toLowerCase());
        saveDB();
        sendToTelegram(`🗑 تم حذف المستخدم: ${target}`);
    } else {
        const found = db.users.filter(u => u.name.toLowerCase() === text.toLowerCase());
        if (found.length > 0) {
            let rep = `📊 بيانات المستخدم [${text}]:\n`;
            found.forEach(u => rep += `\n👤 الرتبة: ${u.type === 'merchant' ? 'تاجر' : 'مواطن'}\n🔑 كلمة السر: \`${u.password}\`\n🆔 المعرف: \`${u.id}\``);
            sendToTelegram(rep);
        }
    }
    res.sendStatus(200);
});

// --- ميزة التوثيق بالبصمة (مربوطة بالزالط) ---
app.post('/api/v-create', (req, res) => {
    const { debtor, merchant, amount, currency, code } = req.body;
    
    // منع تكرار كود البصمة النشط
    if(db.fingerprints.some(f => f.code === code && f.status === 'active')) {
        return res.status(400).json({ error: "هذا الكود مستخدم حالياً، اختر كوداً آخر." });
    }

    const newFp = {
        code, 
        debtor, 
        merchant, 
        amount: parseFloat(amount), 
        remaining: parseFloat(amount), 
        currency, 
        status: 'active', 
        date: new Date().toISOString()
    };
    db.fingerprints.push(newFp);
    saveDB();
    sendToTelegram(`✍️ **توثيق بصمة جديد (زالط موثق)**\nالمواطن: ${debtor}\nالتاجر: ${merchant}\nالمبلغ: ${amount} ${currency}\nالكود: \`${code}\``);
    res.json({ success: true });
});

app.post('/api/v-pay', (req, res) => {
    const { code, payAmount, merchant } = req.body;
    const fp = db.fingerprints.find(f => f.code === code && f.status === 'active');
    
    if(!fp) return res.status(404).json({ error: "كود البصمة غير موجود أو منتهي." });
    if(fp.merchant !== merchant) return res.status(403).json({ error: "هذه البصمة غير موثقة عندك!" });
    if(parseFloat(payAmount) > fp.remaining) return res.status(400).json({ error: "المبلغ أكبر من الرصيد الموثق!" });

    fp.remaining -= parseFloat(payAmount);
    if(fp.remaining <= 0) fp.status = 'completed';
    
    saveDB();
    sendToTelegram(`💰 **عملية خصم من بصمة**\nالتاجر: ${merchant}\nالمواطن: ${fp.debtor}\nالكود: \`${code}\`\nالمبلغ المخصوم: ${payAmount}\nالمتبقي في البصمة: ${fp.remaining}`);
    
    res.json({ success: true, debtor: fp.debtor, currency: fp.currency });
});

app.get('/api/v-check', (req, res) => {
    const { code } = req.query;
    const fp = db.fingerprints.find(f => f.code === code);
    if(fp) res.json(fp); else res.status(404).send();
});

app.get('/api/v-fetch', (req, res) => {
    const { name, type } = req.query;
    let list = db.fingerprints.filter(f => f.status === 'active');
    if(type === 'merchant') list = list.filter(f => f.merchant === name);
    else list = list.filter(f => f.debtor === name);
    res.json(list);
});

// --- نظام الحسابات والمزامنة الأصلي ---
app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    const normalizedName = name.trim().toLowerCase();
    const user = db.users.find(u => u.name.toLowerCase() === normalizedName && u.type === type);

    if (action === 'reg') {
        if (user) return res.status(400).json({ error: "الاسم مسجل مسبقاً." });
        const newUser = {
            id: "H" + Date.now(),
            name: name.trim(), password, type, 
            myRecords: [], createdAt: new Date().toISOString()
        };
        db.users.push(newUser);
        saveDB();
        sendToTelegram(`✨ عضوية ملكية جديدة: ${newUser.name} (${type})`);
        return res.json(newUser);
    } else {
        if (!user || user.password !== password) return res.status(403).json({ error: "بيانات الدخول غير صحيحة." });
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
    .map(u => ({ 
        merchantName: u.name, 
        records: u.myRecords.filter(r => r.targetName.toLowerCase() === debtorName.toLowerCase()) 
    }));
    res.json(results);
});

app.listen(PORT, () => console.log(`HEIBA MASTER SERVER RUNNING ON PORT ${PORT}`));