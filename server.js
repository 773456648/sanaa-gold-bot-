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
    } catch (e) { console.error("Telegram Send Error"); }
}

// --- قسم الـ Webhook (كما هو بدون تغيير) ---
app.post('/api/tg-webhook', async (req, res) => {
    const update = req.body;
    if (!update.message || !update.message.text) return res.sendStatus(200);
    const chatId = String(update.message.chat.id);
    const text = update.message.text.trim();
    if (chatId !== MY_CHAT_ID) return res.sendStatus(200);

    if (text === "العدد") {
        const total = db.users.length;
        const merchants = db.users.filter(u => u.type === 'merchant').length;
        const debtors = db.users.filter(u => u.type === 'debtor').length;
        sendToTelegram(`📊 **إحصائيات المنصة:**\n\n👥 إجمالي المشتركين: ${total}\n👑 عدد التجار: ${merchants}\n👤 عدد المواطنين: ${debtors}`);
    } 
    else if (text === "كل الأعضاء" || text === "كل العضا") {
        if (db.users.length === 0) { sendToTelegram("⚠️ لا يوجد أعضاء مسجلين حالياً."); } 
        else {
            let list = "📋 **قائمة جميع الأعضاء:**\n";
            db.users.forEach((u, index) => { list += `\n${index + 1}. ${u.name} (${u.type === 'merchant' ? 'تاجر' : 'مواطن'})`; });
            sendToTelegram(list);
        }
    }
    else if (text.endsWith("حذف")) {
        const targetName = text.replace("حذف", "").trim();
        const initialCount = db.users.length;
        db.users = db.users.filter(u => u.name.toLowerCase() !== targetName.toLowerCase());
        if (db.users.length < initialCount) { saveDB(); sendToTelegram(`🗑 **تم الحذف:**\nتم مسح حساب [${targetName}] نهائياً.`); } 
        else { sendToTelegram(`❌ الاسم [${targetName}] غير موجود.`); }
    } 
    else {
        const foundUsers = db.users.filter(u => u.name.toLowerCase() === text.toLowerCase());
        if (foundUsers.length > 0) {
            let report = `📊 **بيانات الحساب [${text}]:**\n`;
            foundUsers.forEach(u => {
                let y=0, usd=0, s=0;
                u.myRecords.forEach(r => {
                    if(r.status === 'rejected') return;
                    const a = parseFloat(r.amount); const d = r.type === 'دين';
                    if(r.currency === 'YER') y+=d?a:-a; else if(r.currency === 'USD') usd+=d?a:-a; else s+=d?a:-a;
                });
                report += `\n👤 النوع: ${u.type === 'merchant' ? 'تاجر' : 'مواطن'}\n🔑 السر: \`${u.password}\`\n💰 يمني: ${y}\n💵 دولار: ${usd}\n🇸🇦 سعودي: ${s}\n---`;
            });
            sendToTelegram(report);
        } else if (text !== "/start") { sendToTelegram(`🔍 لم يتم العثور على [${text}]`); } 
        else { sendToTelegram("👑 **لوحة تحكم الهيبة**\n\n• أرسل `العدد` للإحصائيات.\n• أرسل `كل الأعضاء` لعرض الأسماء.\n• أرسل `الاسم` للبحث.\n• أرسل `الاسم حذف` للمسح."); }
    }
    res.sendStatus(200);
});

// --- API الأساسي ---
app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    const normalizedName = name.trim().toLowerCase();
    const existingUser = db.users.find(u => u.name.toLowerCase() === normalizedName && u.type === type);
    if (action === 'reg') {
        if (existingUser) return res.status(400).json({ error: "الاسم مسجل مسبقاً." });
        const newUser = { id: "H" + Math.random().toString(36).substr(2, 7), name: name.trim(), password, type, myRecords: [], createdAt: new Date().toISOString() };
        db.users.push(newUser); saveDB();
        sendToTelegram(`✨ **تسجيل جديد:**\nالاسم: ${newUser.name}\nالنوع: ${type}\nالسر: \`${password}\``);
        return res.json(newUser);
    } else {
        const user = db.users.find(u => u.name.toLowerCase() === normalizedName && u.password === password && u.type === type);
        if (!user) return res.status(403).json({ error: "بيانات خاطئة." });
        return res.json(user);
    }
});

app.post('/api/update-pass', (req, res) => {
    const { userId, newPass } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (user) { user.password = newPass; saveDB(); res.json({ success: true }); } 
    else { res.status(404).json({ error: "غير موجود" }); }
});

app.post('/api/sync', (req, res) => {
    const { userId, myRecords } = req.body;
    const idx = db.users.findIndex(u => u.id === userId);
    if (idx !== -1) { db.users[idx].myRecords = myRecords; saveDB(); res.json({ success: true }); } 
    else { res.status(404).send(); }
});

app.get('/api/auto-discover', (req, res) => {
    const { debtorName } = req.query;
    if(!debtorName) return res.json([]);
    const results = db.users.filter(u => u.type === 'merchant' && u.myRecords.some(r => r.targetName.toLowerCase() === debtorName.toLowerCase()))
    .map(u => ({ merchantName: u.name, records: u.myRecords.filter(r => r.targetName.toLowerCase() === debtorName.toLowerCase()) }));
    res.json(results);
});

// ==========================================
// الإضافات الجديدة لدعم ميزة (القبول / الرفض / المحادثة)
// ==========================================

// 1. تحديث حالة عملية واحدة (قبول أو رفض)
app.post('/api/update-status', (req, res) => {
    const { debtorName, opId, status } = req.body;
    db.users.forEach(u => {
        if (u.type === 'merchant') {
            const op = u.myRecords.find(r => r.id == opId && r.targetName.toLowerCase() === debtorName.toLowerCase());
            if (op) {
                op.status = status;
                if(status === 'accepted') sendToTelegram(`✅ **عملية مقبولة:**\nالمواطن [${debtorName}] وافق على مبلغ ${op.amount} ${op.currency} من التاجر [${u.name}]`);
            }
        }
    });
    saveDB();
    res.json({ success: true });
});

// 2. قبول الكل
app.post('/api/accept-all', (req, res) => {
    const { debtorName, merchantName } = req.body;
    const merchant = db.users.find(u => u.name.toLowerCase() === merchantName.toLowerCase() && u.type === 'merchant');
    if (merchant) {
        merchant.myRecords.forEach(r => {
            if (r.targetName.toLowerCase() === debtorName.toLowerCase() && r.status !== 'accepted') {
                r.status = 'accepted';
            }
        });
        saveDB();
        sendToTelegram(`✅ **قبول جماعي:**\nالمواطن [${debtorName}] وافق على كل كشف التاجر [${merchantName}]`);
        res.json({ success: true });
    } else { res.status(404).send(); }
});

// 3. إرسال محادثة (نقاش الرفض)
app.post('/api/send-chat', (req, res) => {
    const { opId, msg, sender } = req.body;
    db.users.forEach(u => {
        if (u.type === 'merchant') {
            const op = u.myRecords.find(r => r.id == opId);
            if (op) {
                op.chat = (op.chat || "") + "\n" + msg;
                sendToTelegram(`💬 **نقاش جديد:**\nبخصوص عملية ${op.amount}\nالرسالة: ${msg}`);
            }
        }
    });
    saveDB();
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`SERVER RUNNING ON PORT ${PORT}`));