const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_royal_db.json';

// إعدادات التلجرام الخاصة بك
const TELEGRAM_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const MY_CHAT_ID = '5042495708';

app.use(express.json());
app.use(express.static('public'));

// تهيئة قاعدة البيانات مع دعم الأكواد
let db = { users: [], authCodes: [] };
if (fs.existsSync(DB_PATH)) { 
    try { 
        db = JSON.parse(fs.readFileSync(DB_PATH)); 
        if(!db.authCodes) db.authCodes = []; // التأكد من وجود مصفوفة الأكواد
    } catch (e) { db = { users: [], authCodes: [] }; } 
}

const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// دالة إرسال الإشعارات للتلجرام
async function sendToTelegram(message) {
    try { 
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, { 
            chat_id: MY_CHAT_ID, 
            text: message, 
            parse_mode: 'Markdown' 
        }); 
    } catch (e) { console.error("Telegram Error"); }
}

// --- قسم الـ Webhook للتحكم من التلجرام ---
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
        if (db.users.length === 0) {
            sendToTelegram("⚠️ لا يوجد أعضاء مسجلين.");
        } else {
            let list = "📋 **قائمة الأعضاء:**\n";
            db.users.forEach((u, i) => list += `\n${i + 1}. ${u.name} (${u.type === 'merchant' ? 'تاجر' : 'مواطن'})`);
            sendToTelegram(list);
        }
    }
    else if (text.endsWith("حذف")) {
        const targetName = text.replace("حذف", "").trim();
        const initialCount = db.users.length;
        db.users = db.users.filter(u => u.name.toLowerCase() !== targetName.toLowerCase());
        if (db.users.length < initialCount) {
            saveDB();
            sendToTelegram(`🗑 **تم الحذف:** تم مسح [${targetName}] نهائياً.`);
        } else {
            sendToTelegram(`❌ الاسم [${targetName}] غير موجود.`);
        }
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
        } else if (text !== "/start") {
            sendToTelegram(`🔍 لم يتم العثور على [${text}]`);
        } else {
            sendToTelegram("👑 **لوحة تحكم الهيبة**\n• `العدد`\n• `كل الأعضاء`\n• `الاسم` للبحث\n• `الاسم حذف` للمسح");
        }
    }
    res.sendStatus(200);
});

// --- نظام الأكواد المتعددة ---
app.post('/api/add-custom-code', (req, res) => {
    const { debtorName, customCode } = req.body;
    if(!customCode) return res.status(400).json({ error: "ادخل كود" });
    db.authCodes.push({ 
        id: Date.now(),
        code: customCode.trim(), 
        owner: debtorName.toLowerCase() 
    });
    saveDB();
    res.json({ success: true });
});

app.post('/api/verify-code', (req, res) => {
    const { code, debtorName } = req.body;
    const idx = db.authCodes.findIndex(c => c.code === code.trim() && c.owner === debtorName.toLowerCase());
    if (idx !== -1) {
        db.authCodes.splice(idx, 1); // حذف الكود المستخدم فقط لمرة واحدة
        saveDB();
        res.json({ success: true });
    } else {
        res.status(400).json({ error: "كود خاطئ أو مستخدم مسبقاً" });
    }
});

// --- نظام المصادقة والمزامنة ---
app.post('/api/auth', (req, res) => {
    const { name, password, type, action } = req.body;
    const normalized = name.trim().toLowerCase();
    const user = db.users.find(u => u.name.toLowerCase() === normalized && u.type === type);
    
    if (action === 'reg') {
        if (user) return res.status(400).json({ error: "الاسم مسجل" });
        const newUser = { id: "H"+Date.now(), name: name.trim(), password, type, myRecords: [] };
        db.users.push(newUser);
        saveDB();
        sendToTelegram(`✨ **تسجيل جديد:**\nالاسم: ${name}\nالنوع: ${type}\nالسر: \`${password}\``);
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

app.listen(PORT, () => console.log(`HEIBA ROYAL SERVER READY`));