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

let db = { users: [], authCodes: [] };
if (fs.existsSync(DB_PATH)) { 
    try { 
        db = JSON.parse(fs.readFileSync(DB_PATH)); 
        if(!db.authCodes) db.authCodes = [];
    } catch (e) { db = { users: [], authCodes: [] }; } 
}
const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

async function sendToTelegram(message) {
    try { await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, { chat_id: MY_CHAT_ID, text: message, parse_mode: 'Markdown' }); } catch (e) {}
}

// المواطن يحفظ كوده الخاص
app.post('/api/set-custom-code', (req, res) => {
    const { debtorName, customCode } = req.body;
    if(!customCode) return res.status(400).json({ error: "ادخل كود" });
    db.authCodes = db.authCodes.filter(c => c.owner !== debtorName.toLowerCase());
    db.authCodes.push({ code: customCode, owner: debtorName.toLowerCase() });
    saveDB();
    res.json({ success: true });
});

// التاجر يفحص الكود (وينحذف فوراً إذا صح)
app.post('/api/verify-code', (req, res) => {
    const { code, debtorName } = req.body;
    const idx = db.authCodes.findIndex(c => c.code === code && c.owner === debtorName.toLowerCase());
    if (idx !== -1) {
        db.authCodes.splice(idx, 1); 
        saveDB();
        res.json({ success: true });
    } else {
        res.status(400).json({ error: "كود خاطئ" });
    }
});

app.post('/api/auth', (req, res) => {
    const { name, password, type, action } = req.body;
    const normalized = name.trim().toLowerCase();
    const user = db.users.find(u => u.name.toLowerCase() === normalized && u.type === type);
    if (action === 'reg') {
        if (user) return res.status(400).json({ error: "الاسم مسجل" });
        const newUser = { id: "H"+Date.now(), name: name.trim(), password, type, myRecords: [] };
        db.users.push(newUser); saveDB();
        sendToTelegram(`✨ عضو جديد: ${name} (${type})`);
        return res.json(newUser);
    } else {
        const u = db.users.find(u => u.name.toLowerCase() === normalized && u.password === password && u.type === type);
        if (!u) return res.status(403).json({ error: "بيانات خاطئة" });
        return res.json(u);
    }
});

app.post('/api/sync', (req, res) => {
    const { userId, myRecords } = req.body;
    const u = db.users.find(u => u.id === userId);
    if (u) { u.myRecords = myRecords; saveDB(); res.json({ success: true }); }
    else res.status(404).send();
});

app.post('/api/update-status', (req, res) => {
    const { debtorName, opId, status } = req.body;
    db.users.forEach(u => {
        if (u.type === 'merchant') {
            const op = u.myRecords.find(r => r.id == opId && r.targetName.toLowerCase() === debtorName.toLowerCase());
            if (op) op.status = status;
        }
    });
    saveDB(); res.json({ success: true });
});

app.post('/api/send-chat', (req, res) => {
    const { opId, msg } = req.body;
    db.users.forEach(u => {
        const op = u.myRecords.find(r => r.id == opId);
        if (op) op.chat = (op.chat || "") + "\n" + msg;
    });
    saveDB(); res.json({ success: true });
});

app.get('/api/get-my-data', (req, res) => {
    const u = db.users.find(u => u.id === req.query.id);
    if (u) res.json({ myRecords: u.myRecords }); else res.status(404).send();
});

app.get('/api/auto-discover', (req, res) => {
    const { debtorName } = req.query;
    const resArr = db.users.filter(u => u.type === 'merchant' && u.myRecords.some(r => r.targetName.toLowerCase() === debtorName.toLowerCase()))
    .map(u => ({ merchantName: u.name, records: u.myRecords.filter(r => r.targetName.toLowerCase() === debtorName.toLowerCase()) }));
    res.json(resArr);
});

app.listen(PORT, () => console.log(`HEIBA ROYAL READY`));