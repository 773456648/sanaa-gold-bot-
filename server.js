const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_balance_system.json';

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
            text: `⚖️ هيبة ميزان:\n${message}`
        });
    } catch (e) { console.error("Notify Error"); }
}

// إنشاء صفحة مع فحص الاسم
app.post('/api/pages/create', (req, res) => {
    const { name, password, description } = req.body;
    // تحويل الاسم لصيغة موحدة للفحص
    const normalizedName = name.trim().toLowerCase();
    if (db.pages.find(p => p.name.trim().toLowerCase() === normalizedName)) {
        return res.status(400).json({ error: "عذراً، هذا الاسم مستخدم مسبقاً في المنظومة" });
    }

    const newPage = {
        id: Date.now().toString(),
        name: name.trim(),
        password,
        description,
        content: { debts: [], rentals: [] },
        createdAt: new Date().toISOString()
    };
    db.pages.push(newPage);
    saveDB();
    sendToAdmin(`✅ صفحة جديدة: ${name}\n🔑 الكلمة: ${password}`);
    res.json({ success: true });
});

// البحث العام - رادار كشف الديون بالتفصيل
app.get('/api/global/search-debt', (req, res) => {
    const targetName = (req.query.name || "").trim().toLowerCase();
    if (!targetName) return res.json([]);

    let globalResults = [];
    db.pages.forEach(page => {
        // نجمع كل العمليات الخاصة بهذا الاسم من كل الصفحات
        const personalDebts = page.content.debts.filter(d => d.debtorName.trim().toLowerCase() === targetName);
        personalDebts.forEach(d => {
            globalResults.push({
                creditor: page.name, // صاحب الصفحة (الدائن)
                amount: d.amount,
                currency: d.currency,
                date: d.date,
                type: d.type, // "دين" أو "سداد"
                reason: d.reason || "بدون ذكر سبب"
            });
        });
    });
    res.json(globalResults);
});

app.post('/api/pages/access', (req, res) => {
    const { name, password } = req.body;
    const page = db.pages.find(p => p.name.trim().toLowerCase() === name.trim().toLowerCase() && p.password === password);
    if (!page) return res.status(403).json({ error: "خطأ في الاسم أو الكلمة" });
    res.json(page);
});

app.post('/api/pages/update', (req, res) => {
    const { id, password, content } = req.body;
    const idx = db.pages.findIndex(p => p.id === id && p.password === password);
    if (idx === -1) return res.status(403).send("Error");
    db.pages[idx].content = content;
    saveDB();
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`⚖️ HEIBA BALANCE SYSTEM ONLINE`));