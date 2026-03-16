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
if (fs.existsSync(DB_PATH)) { try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch (e) { db = { users: [] }; } }
const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

async function sendToTelegram(message) {
    try { await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, { chat_id: MY_CHAT_ID, text: message, parse_mode: 'Markdown' }); } catch (e) {}
}

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

app.post('/api/update-status', (req, res) => {
    const { debtorName, opId, status } = req.body;
    db.users.forEach(u => {
        if (u.type === 'merchant') {
            const op = u.myRecords.find(r => r.id == opId && r.targetName.toLowerCase() === debtorName.toLowerCase());
            if (op) { op.status = status; if(status === 'accepted') sendToTelegram(`✅ قبول: ${debtorName} وافق على مبلغ ${op.amount}`); }
        }
    });
    saveDB(); res.json({ success: true });
});

app.post('/api/accept-all', (req, res) => {
    const { debtorName, merchantName } = req.body;
    const m = db.users.find(u => u.name.toLowerCase() === merchantName.toLowerCase() && u.type === 'merchant');
    if (m) {
        m.myRecords.forEach(r => { if (r.targetName.toLowerCase() === debtorName.toLowerCase() && r.status !== 'accepted') r.status = 'accepted'; });
        saveDB(); sendToTelegram(`✅ قبول الكل من: ${debtorName}`);
        res.json({ success: true });
    } else res.status(404).send();
});

app.post('/api/send-chat', (req, res) => {
    const { opId, msg } = req.body;
    db.users.forEach(u => {
        const op = u.myRecords.find(r => r.id == opId);
        if (op) { op.chat = (op.chat || "") + "\n" + msg; sendToTelegram(`💬 نقاش: ${msg}`); }
    });
    saveDB(); res.json({ success: true });
});

app.post('/api/sync', (req, res) => {
    const { userId, myRecords } = req.body;
    const u = db.users.find(u => u.id === userId);
    if (u) { u.myRecords = myRecords; saveDB(); res.json({ success: true }); } else res.status(404).send();
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

app.listen(PORT, () => console.log(`SERVER ON ${PORT}`));