const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_master_db.json';

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

// --- نظام البصمة الموثقة الجديد ---

app.post('/api/v-create', (req, res) => {
    const { debtor, merchant, amount, currency, code } = req.body;
    
    // التحقق من تكرار الكود النشط
    if(db.fingerprints.some(f => f.code === code && f.status === 'active')) {
        return res.status(400).json({ error: "كود البصمة هذا مستخدم ونشط حالياً." });
    }

    const newFp = {
        code, debtor, merchant, amount: parseFloat(amount), 
        remaining: parseFloat(amount), currency, status: 'active', date: new Date().toISOString()
    };
    db.fingerprints.push(newFp);
    saveDB();
    sendToTelegram(`✍️ **توثيق بصمة جديد**\nالمواطن: ${debtor}\nالتاجر: ${merchant}\nالمبلغ: ${amount} ${currency}\nالكود: \`${code}\``);
    res.json({ success: true });
});

app.post('/api/v-pay', (req, res) => {
    const { code, payAmount, merchant } = req.body;
    const fp = db.fingerprints.find(f => f.code === code && f.status === 'active');
    
    if(!fp) return res.status(404).json({ error: "كود البصمة غير موجود أو تم انتهاؤه." });
    if(fp.merchant !== merchant) return res.status(403).json({ error: "هذه البصمة موثقة لتاجر آخر!" });
    if(parseFloat(payAmount) > fp.remaining) return res.status(400).json({ error: "المبلغ المطلوب خصمه أكبر من الرصيد الموثق في البصمة!" });

    fp.remaining -= parseFloat(payAmount);
    if(fp.remaining <= 0) fp.status = 'completed';
    
    saveDB();
    sendToTelegram(`💰 **خصم بصمة**\nالتاجر: ${merchant}\nالكود: \`${code}\`\nالمخصوم: ${payAmount}\nالمتبقي بالبصمة: ${fp.remaining}`);
    
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

// --- الأكواد الأصلية المتبقية (الدخول، المزامنة، التلجرام) ---

app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    const user = db.users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.type === type);
    if (action === 'reg') {
        if (user) return res.status(400).json({ error: "الاسم مسجل مسبقاً." });
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