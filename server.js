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

// --- Webhook ---
app.post('/api/tg-webhook', async (req, res) => {
    const update = req.body;
    if (!update.message || !update.message.text) return res.sendStatus(200);
    const chatId = String(update.message.chat.id);
    const text = update.message.text.trim();
    if (chatId !== MY_CHAT_ID) return res.sendStatus(200);

    if (text === "العدد") {
        const t = db.users.length;
        sendToTelegram(`📊 المشتركين: ${t}`);
    } else {
        const found = db.users.filter(u => u.name.toLowerCase() === text.toLowerCase());
        if (found.length > 0) {
            let r = `📊 بيانات [${text}]:\n`;
            found.forEach(u => r += `\nالنوع: ${u.type}\nالسر: ${u.password}`);
            sendToTelegram(r);
        }
    }
    res.sendStatus(200);
});

// --- API ---
app.post('/api/auth', (req, res) => {
    const { name, password, type, action } = req.body;
    const user = db.users.find(u => u.name.toLowerCase() === name.trim().toLowerCase() && u.type === type);
    if (action === 'reg') {
        if (user) return res.status(400).json({ error: "موجود مسبقاً" });
        const n = { id: "H"+Date.now(), name: name.trim(), password, type, myRecords: [] };
        db.users.push(n); saveDB();
        sendToTelegram(`✨ مستخدم جديد: ${n.name}`);
        return res.json(n);
    } else {
        const u = db.users.find(u => u.name.toLowerCase() === name.trim().toLowerCase() && u.password === password && u.type === type);
        if (!u) return res.status(403).json({ error: "خطأ" });
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
        saveDB(); sendToTelegram(`✅ قبول الكل من ${debtorName}`);
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
    if (u) { u.myRecords = myRecords; saveDB(); res.json({ success: true }); }
    else res.status(404).send();
});

app.get('/api/auto-discover', (req, res) => {
    const { debtorName } = req.query;
    const results = db.users.filter(u => u.type === 'merchant' && u.myRecords.some(r => r.targetName.toLowerCase() === debtorName.toLowerCase()))
    .map(u => ({ merchantName: u.name, records: u.myRecords.filter(r => r.targetName.toLowerCase() === debtorName.toLowerCase()) }));
    res.json(results);
});

app.listen(PORT, () => console.log(`HEIBA RUNNING`));