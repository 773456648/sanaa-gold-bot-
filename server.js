const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_royal_vault.json';

// إعدادات التلجرام الأصلية
const TELEGRAM_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const MY_CHAT_ID = '5042495708';

app.use(express.json());

let db = { users: [], fingerprints: [] };
if (fs.existsSync(DB_PATH)) {
    try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch (e) { db = { users: [], fingerprints: [] }; }
}

const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

async function sendToTelegram(msg) {
    try { await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, { chat_id: MY_CHAT_ID, text: msg, parse_mode: 'Markdown' }); } catch (e) {}
}

// --- نظام البصمة المربوط بالزالط العام ---

app.post('/api/v-create', (req, res) => {
    const { debtor, merchant, amount, currency, code } = req.body;
    
    // التحقق من تكرار الكود
    if(db.fingerprints.some(f => f.code === code && f.status === 'active')) {
        return res.status(400).json({ error: "كود البصمة هذا مستخدم حالياً." });
    }

    const newFp = {
        code, debtor, merchant, amount: parseFloat(amount), 
        remaining: parseFloat(amount), currency, status: 'active', date: new Date().toISOString()
    };
    db.fingerprints.push(newFp);
    saveDB();
    sendToTelegram(`✍️ **توثيق (بصمة) زالط:**\n👤 المواطن: ${debtor}\n👑 التاجر: ${merchant}\n💰 المبلغ: ${amount} ${currency}\n🔑 الكود: \`${code}\``);
    res.json({ success: true });
});

app.post('/api/v-pay', (req, res) => {
    const { code, payAmount, merchant } = req.body;
    const fp = db.fingerprints.find(f => f.code === code && f.status === 'active');
    
    if(!fp) return res.status(404).json({ error: "كود غير موجود أو منتهي." });
    if(fp.merchant !== merchant) return res.status(403).json({ error: "هذه البصمة ليست موثقة لديك!" });
    if(parseFloat(payAmount) > fp.remaining) return res.status(400).json({ error: "المبلغ أكبر من الرصيد الموثق في البصمة!" });

    fp.remaining -= parseFloat(payAmount);
    if(fp.remaining <= 0) fp.status = 'completed';
    
    saveDB();
    sendToTelegram(`💰 **خصم بصمة شامل:**\n👑 التاجر: ${merchant}\n👤 المواطن: ${fp.debtor}\n🔑 الكود: \`${code}\`\n📉 المبلغ المخصوم: ${payAmount}\n🏦 المتبقي بالبصمة: ${fp.remaining}`);
    
    // إرجاع البيانات للواجهة لإتمام الخصم من الزالط العام تلقائياً
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

// --- أوامر التحكم عبر التلجرام الأصلية ---

app.post('/api/tg-webhook', async (req, res) => {
    const update = req.body;
    if (!update.message || !update.message.text) return res.sendStatus(200);
    const chatId = String(update.message.chat.id);
    const text = update.message.text.trim();
    if (chatId !== MY_CHAT_ID) return res.sendStatus(200);

    if (text === "العدد") {
        sendToTelegram(`📊 إجمالي المسجلين: ${db.users.length}\n💎 البصمات النشطة: ${db.fingerprints.filter(f=>f.status==='active').length}`);
    } else if (text === "كل الأعضاء") {
        let list = "👥 الأعضاء:\n";
        db.users.forEach((u, i) => list += `\n${i+1}. ${u.name} (${u.type})`);
        sendToTelegram(list);
    } else if (text.endsWith("حذف")) {
        const target = text.replace("حذف", "").trim();
        db.users = db.users.filter(u => u.name.toLowerCase() !== target.toLowerCase());
        saveDB();
        sendToTelegram(`🗑 تم حذف: ${target}`);
    } else {
        const user = db.users.find(u => u.name.toLowerCase() === text.toLowerCase());
        if (user) {
            sendToTelegram(`👤 الاسم: ${user.name}\n🔑 السر: \`${user.password}\`\n🛡 النوع: ${user.type}`);
        }
    }
    res.sendStatus(200);
});

// --- نظام الدخول والمزامنة ---

app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    const user = db.users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.type === type);
    if (action === 'reg') {
        if (user) return res.status(400).json({ error: "مسجل مسبقاً." });
        const newUser = { id: "H"+Date.now(), name, password, type, myRecords: [] };
        db.users.push(newUser); saveDB();
        sendToTelegram(`✨ عضو جديد: ${name} (${type})`);
        return res.json(newUser);
    } else {
        if (!user || user.password !== password) return res.status(403).json({ error: "بيانات خاطئة." });
        return res.json(user);
    }
});

app.post('/api/sync', (req, res) => {
    const { userId, myRecords } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (user) { user.myRecords = myRecords; saveDB(); res.json({ success: true }); }
    else res.status(404).send();
});

app.get('/api/auto-discover', (req, res) => {
    const { debtorName } = req.query;
    const results = db.users.filter(u => u.type === 'merchant' && u.myRecords.some(r => r.targetName.toLowerCase() === debtorName.toLowerCase()))
    .map(u => ({ merchantName: u.name, records: u.myRecords.filter(r => r.targetName.toLowerCase() === debtorName.toLowerCase()) }));
    res.json(results);
});

app.listen(PORT, () => console.log('HEIBA MASTER SYSTEM READY'));