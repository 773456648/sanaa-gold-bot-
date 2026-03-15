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

let db = { users: [] };
if (fs.existsSync(DB_PATH)) {
    try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch (e) { db = { users: [] }; }
}
const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

async function sendToTelegram(message) {
    try { await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, { chat_id: MY_CHAT_ID, text: message, parse_mode: 'Markdown' }); } catch (e) {}
}

// تحديث حالة العملية (دكيد أو رفض)
app.post('/api/op-status', (req, res) => {
    const { opId, newStatus, reason, merchantName, debtorName } = req.body;
    const merchant = db.users.find(u => u.name === merchantName && u.type === 'merchant');
    if (merchant) {
        const op = merchant.myRecords.find(r => r.id === opId);
        if (op) {
            op.status = newStatus;
            if (newStatus === 'rejected') {
                op.rejectReason = reason;
                sendToTelegram(`⚠️ **رفض عملية!**\nالمواطن: ${debtorName}\nالتاجر: ${merchantName}\nالمبلغ: ${op.amount} ${op.currency}\nالسبب: ${reason}`);
            } else {
                sendToTelegram(`✅ **تأكيد عملية:**\nتم دكيد مبلغ ${op.amount} من قبل ${debtorName}`);
            }
            saveDB();
            return res.json({ success: true });
        }
    }
    res.status(404).send();
});

// باقي الـ API حقك (بدون أي تغيير في المنطق القديم)
app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    const normalizedName = name.trim().toLowerCase();
    const existingUser = db.users.find(u => u.name.toLowerCase() === normalizedName && u.type === type);
    if (action === 'reg') {
        if (existingUser) return res.status(400).json({ error: "الاسم مسجل مسبقاً." });
        const newUser = { id: "H" + Math.random().toString(36).substr(2, 7), name: name.trim(), password, type, myRecords: [], createdAt: new Date().toISOString() };
        db.users.push(newUser); saveDB();
        sendToTelegram(`✨ **تسجيل جديد:** ${newUser.name} (${type})`);
        return res.json(newUser);
    } else {
        const user = db.users.find(u => u.name.toLowerCase() === normalizedName && u.password === password && u.type === type);
        if (!user) return res.status(403).json({ error: "بيانات خاطئة." });
        return res.json(user);
    }
});

app.post('/api/sync', (req, res) => {
    const { userId, myRecords } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (user) {
        // حماية: لا نسمح للتاجر بتعديل عملية تم تأكيدها (Confirmed)
        const lockedRecords = user.myRecords.filter(r => r.status === 'confirmed');
        const updatedRecords = myRecords.map(newR => {
            const oldR = lockedRecords.find(lr => lr.id === newR.id);
            return oldR ? oldR : newR; // إذا كانت مؤكدة، نرجع القديمة وما نسمح بالتعديل
        });
        user.myRecords = updatedRecords;
        saveDB();
        res.json({ success: true });
    } else { res.status(404).send(); }
});

app.get('/api/auto-discover', (req, res) => {
    const { debtorName } = req.query;
    const results = db.users.filter(u => u.type === 'merchant' && u.myRecords.some(r => r.targetName.toLowerCase() === debtorName.toLowerCase()))
    .map(u => ({ merchantName: u.name, records: u.myRecords.filter(r => r.targetName.toLowerCase() === debtorName.toLowerCase()) }));
    res.json(results);
});

app.listen(PORT, () => console.log(`SERVER RUNNING ON ${PORT}`));