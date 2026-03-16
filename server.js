const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_royal_db.json';

// إعدادات التلجرام
const TELEGRAM_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const MY_CHAT_ID = '5042495708';

app.use(express.json());
app.use(express.static('public'));

let db = { users: [], discountStamps: [] };
if (fs.existsSync(DB_PATH)) {
    try { 
        db = JSON.parse(fs.readFileSync(DB_PATH)); 
        if (!db.discountStamps) db.discountStamps = []; 
    } catch (e) { db = { users: [], discountStamps: [] }; }
}

const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

async function sendToTelegram(message) {
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: MY_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
    } catch (e) { console.error("Telegram Send Error"); }
}

// --- نظام بلاغات الخصم (البصمة المتناقصة) ---

// 1. إنشاء بلاغ خصم (بصمة) بواسطة المواطن
app.post('/api/stamps/create', (req, res) => {
    const { debtorName, merchantName, amount, currency, code } = req.body;
    if (db.discountStamps.find(s => s.code === code)) return res.status(400).json({ error: "الكود مستخدم مسبقاً" });
    
    db.discountStamps.push({ 
        debtorName, 
        merchantName, 
        originalAmount: parseFloat(amount),
        currentAmount: parseFloat(amount), 
        currency, 
        code, 
        history: [], // لسجل الخصومات الجزئية
        date: new Date().toISOString() 
    });
    saveDB();
    sendToTelegram(`📢 **بلاغ خصم جديد:**\nالمواطن: ${debtorName}\nالتاجر: ${merchantName}\nالمبلغ: ${amount} ${currency}\nالكود: \`${code}\``);
    res.json({ success: true });
});

// 2. البحث عن تفاصيل البلاغ (للتاجر والمواطن)
app.get('/api/stamps/info/:code', (req, res) => {
    const stamp = db.discountStamps.find(s => s.code === req.params.code);
    if (stamp) res.json(stamp);
    else res.status(404).json({ error: "البلاغ غير موجود" });
});

// 3. تنفيذ الخصم من البلاغ (بواسطة التاجر)
app.post('/api/stamps/apply-discount', (req, res) => {
    const { merchantId, code, discountAmount } = req.body;
    const merchant = db.users.find(u => u.id === merchantId);
    const stampIdx = db.discountStamps.findIndex(s => s.code === code && s.merchantName.toLowerCase() === merchant.name.toLowerCase());
    
    if (stampIdx === -1) return res.status(404).json({ error: "الكود لا يخصك أو غير موجود" });

    const stamp = db.discountStamps[stampIdx];
    const deduct = parseFloat(discountAmount);

    if (deduct > stamp.currentAmount) return res.status(400).json({ error: "المبلغ المطلوب خصمه أكبر من الرصيد المتبقي في الكود" });

    // إضافة العملية لسجل التاجر
    merchant.myRecords.push({
        id: Date.now(),
        targetName: stamp.debtorName,
        amount: deduct,
        currency: stamp.currency,
        type: 'سداد',
        note: `خصم من بلاغ كود: ${code}`,
        isStamp: true,
        date: new Date().toISOString()
    });

    // تحديث البلاغ (البصمة)
    stamp.history.push({ amount: deduct, date: new Date().toISOString() });
    stamp.currentAmount -= deduct;

    // إذا انتهى المبلغ نحذف البلاغ، أو نتركه بصفر (حسب رغبتك) - هنا سنبقيه حتى يراه المواطن
    if (stamp.currentAmount <= 0) {
        // يمكن حذفه هنا إذا أردت: db.discountStamps.splice(stampIdx, 1);
    }

    saveDB();
    sendToTelegram(`✅ **تم الخصم من كود:**\nالتاجر: ${merchant.name}\nالكود: ${code}\nالمبلغ المخصوم: ${deduct}\nالمتبقي بالكود: ${stamp.currentAmount}`);
    res.json({ success: true, merchant });
});

// --- بقية الـ API الأصلية للمنصة ---
app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    const normalizedName = name.trim().toLowerCase();
    const existingUser = db.users.find(u => u.name.toLowerCase() === normalizedName && u.type === type);
    if (action === 'reg') {
        if (existingUser) return res.status(400).json({ error: "الاسم مسجل مسبقاً." });
        const newUser = { id: "H"+Math.random().toString(36).substr(2,7), name: name.trim(), password, type, myRecords: [], createdAt: new Date().toISOString() };
        db.users.push(newUser); saveDB();
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
    
    // إضافة البلاغات النشطة لهذا المواطن
    const myStamps = db.discountStamps.filter(s => s.debtorName.toLowerCase() === debtorName.toLowerCase());
    res.json({ results, myStamps });
});

app.listen(PORT, () => console.log(`HEIBA ROYAL SYSTEM ACTIVE`));