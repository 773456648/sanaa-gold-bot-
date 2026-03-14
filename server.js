const express = require('express');
const fs = require('fs');
const axios = require('axios'); // للمراسلة مع تلجرام
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_empire.json';

// --- إعدادات البوت (ضع بياناتك هنا) ---
const TELEGRAM_TOKEN = ''; // ضع التوكن هنا
const MY_CHAT_ID = '';      // ضع معرف الشات الخاص بك هنا

app.use(express.json());
app.use(express.static('public'));

let db = { users: [] };
if (fs.existsSync(DB_PATH)) {
    try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch (e) { db = { users: [] }; }
}

const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// وظيفة إرسال رسالة لتلجرام
async function sendToTelegram(message) {
    if (!TELEGRAM_TOKEN || !MY_CHAT_ID) return;
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: MY_CHAT_ID,
            text: `⚠️ تنبيه المنظومة:\n${message}`,
            parse_mode: 'HTML'
        });
    } catch (e) { console.error("Telegram Error"); }
}

// تسجيل ودخول
app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    const normalized = name.trim().toLowerCase();
    const existingUser = db.users.find(u => u.name.toLowerCase() === normalized);

    if (action === 'reg') {
        if (existingUser) return res.status(400).json({ error: "الاسم مستخدم" });
        const newUser = {
            id: "ID_" + Math.random().toString(36).substr(2, 9),
            name: name.trim(),
            password,
            type,
            myRecords: [],
            createdAt: new Date().toISOString()
        };
        db.users.push(newUser);
        saveDB();
        
        // إشعار للبوت
        sendToTelegram(`👤 حساب جديد!\nالاسم: ${newUser.name}\nالنوع: ${type === 'merchant' ? 'تاجر' : 'مدين'}`);
        
        return res.json(newUser);
    } else {
        const user = db.users.find(u => u.name.toLowerCase() === normalized && u.password === password);
        if (!user) return res.status(403).json({ error: "خطأ في البيانات" });
        return res.json(user);
    }
});

// ميزة المزامنة الذكية
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

// مزامنة وحفظ
app.post('/api/sync', (req, res) => {
    const { userId, myRecords } = req.body;
    const idx = db.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
        db.users[idx].myRecords = myRecords;
        saveDB();
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "غير موجود" });
    }
});

// واجهة التحكم للبوت (Webhook Sim)
// يمكنك عمل طلب لهذه الـ API من البوت لحذف مستخدم
app.post('/api/admin/control', async (req, res) => {
    const { adminSecret, action, targetName } = req.body;
    // التحقق من أن الطلب منك فعلاً
    if (adminSecret !== TELEGRAM_TOKEN) return res.status(403).send("Unauthorized");

    if (action === 'delete') {
        const initialCount = db.users.length;
        db.users = db.users.filter(u => u.name.toLowerCase() !== targetName.toLowerCase());
        if (db.users.length < initialCount) {
            saveDB();
            sendToTelegram(`🗑 تم حذف حساب [${targetName}] بنجاح من المنصة.`);
            res.json({ success: true });
        } else {
            res.json({ success: false, msg: "لم يتم العثور على الحساب" });
        }
    } else if (action === 'info') {
        const user = db.users.find(u => u.name.toLowerCase() === targetName.toLowerCase());
        if (user) {
            const yer = user.myRecords.reduce((s, r) => s + (r.currency === 'YER' ? (r.type === 'دين' ? parseFloat(r.amount) : -parseFloat(r.amount)) : 0), 0);
            sendToTelegram(`ℹ️ تفاصيل [${targetName}]:\nالنوع: ${user.type}\nالرصيد يمني: ${yer}\nالعمليات: ${user.myRecords.length}`);
            res.json(user);
        } else {
            sendToTelegram(`❌ الحساب [${targetName}] غير موجود.`);
            res.json(null);
        }
    }
});

app.listen(PORT, () => console.log(`🏛 HEIBA EMPIRE SYSTEM WITH BOT CONTROL ACTIVE`));