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

let db = { users: [], stamps: [] };
if (fs.existsSync(DB_PATH)) {
    try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch (e) { db = { users: [], stamps: [] }; }
}

const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// نظام البحث عن البصمة
app.get('/api/search-stamp', (req, res) => {
    const s = db.stamps.find(x => x.authCode === req.query.code);
    if(s) res.json(s); else res.status(404).json({error: "Not found"});
});

// تفعيل وتحقق البصمة
app.post('/api/verify-auth', (req, res) => {
    const { action, debtorName, merchantName, opId, authCode, merchantId } = req.body;

    if (action === 'create') {
        if(db.stamps.some(s => s.authCode === authCode)) return res.status(400).json({error: "الكود مستخدم مسبقاً"});
        const existing = db.stamps.find(s => s.opId === opId && s.debtorName === debtorName);
        if(existing && (Date.now() - existing.createdAt < 172800000)) return res.status(400).json({error: "قفل 48 ساعة مفعل"});
        
        db.stamps = db.stamps.filter(s => s.opId !== opId);
        db.stamps.push({ debtorName, merchantName, opId, authCode, createdAt: Date.now(), status: 'pending' });
        saveDB();
        return res.json({ success: true });
    }

    if (action === 'check') {
        const merch = db.users.find(u => u.id === merchantId);
        const stamp = db.stamps.find(s => s.authCode === authCode && s.merchantName === merch.name);
        if(!stamp) return res.status(400).json({error: "كود خاطئ"});

        merch.myRecords.forEach(r => {
            if(r.id === stamp.opId) {
                r.isVerified = true; r.authCode = authCode;
                stamp.amount = r.amount; stamp.currency = r.currency;
            }
        });
        saveDB();
        res.json({ newRecords: merch.myRecords });
    }
});

// الخصم الذكي والمزامنة (لا ينقص من حقك شيء)
app.post('/api/sync', (req, res) => {
    const { userId, op } = req.body;
    const u = db.users.find(x => x.id === userId);
    if (!u) return res.status(404).send();

    // إذا كانت العملية سداد، ابدأ بخصم مبالغ البصمات أولاً
    if(op.type === 'سداد') {
        let amountToPay = parseFloat(op.amount);
        u.myRecords.forEach(r => {
            if(r.targetName === op.targetName && r.currency === op.currency && r.isVerified && amountToPay > 0) {
                let currentDebt = parseFloat(r.amount);
                let deduct = Math.min(currentDebt, amountToPay);
                r.amount = (currentDebt - deduct).toString();
                amountToPay -= deduct;
                // إذا استوفت البصمة، احذفها من سجل البحث النشط
                if(parseFloat(r.amount) <= 0) db.stamps = db.stamps.filter(s => s.authCode !== r.authCode);
            }
        });
        op.amount = amountToPay.toString();
    }

    u.myRecords.push(op);
    saveDB();
    res.json({ newRecords: u.myRecords });
});

// بقية الدوال (الدخول، التلجرام، الاكتشاف) تظل كما هي تماماً
app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    const normalizedName = name.trim().toLowerCase();
    let user = db.users.find(u => u.name.toLowerCase() === normalizedName && u.type === type);

    if (action === 'reg') {
        if (user) return res.status(400).json({ error: "الاسم مسجل مسبقاً." });
        user = { id: "H" + Math.random().toString(36).substr(2, 7), name: name.trim(), password, type, myRecords: [], createdAt: new Date().toISOString() };
        db.users.push(user); saveDB();
        return res.json(user);
    } else {
        if (!user || user.password !== password) return res.status(403).json({ error: "بيانات خاطئة." });
        return res.json(user);
    }
});

app.get('/api/auto-discover', (req, res) => {
    const { debtorName } = req.query;
    const results = db.users.filter(u => u.type === 'merchant' && u.myRecords.some(r => r.targetName.toLowerCase() === debtorName.toLowerCase()))
    .map(u => ({ merchantName: u.name, records: u.myRecords.filter(r => r.targetName.toLowerCase() === debtorName.toLowerCase()) }));
    res.json(results);
});

app.listen(PORT, () => console.log(`SYSTEM ACTIVE ON ${PORT}`));