const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_central_system.json';

app.use(express.json());
app.use(express.static('public'));

let db = { users: [] };
if (fs.existsSync(DB_PATH)) {
    try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch (e) { db = { users: [] }; }
}

const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// تسجيل ودخول
app.post('/api/auth', (req, res) => {
    const { name, password, type, action } = req.body;
    const normalized = name.trim().toLowerCase();
    const existingUser = db.users.find(u => u.name.toLowerCase() === normalized);

    if (action === 'reg') {
        if (existingUser) return res.status(400).json({ error: "الاسم مستخدم" });
        const newUser = {
            id: "ID_" + Math.random().toString(36).substr(2, 9),
            name: name.trim(),
            password,
            type, // 'merchant' or 'debtor'
            myRecords: [], // ديونه الشخصية (لو هو مدين) أو ديون الناس عنده (لو هو تاجر)
            linkedMerchants: [] // للتجار الذين يتابعهم المدين
        };
        db.users.push(newUser);
        saveDB();
        return res.json(newUser);
    } else {
        const user = db.users.find(u => u.name.toLowerCase() === normalized && u.password === password);
        if (!user) return res.status(403).json({ error: "خطأ في البيانات" });
        return res.json(user);
    }
});

// البحث عن تجار
app.get('/api/merchants/search', (req, res) => {
    const q = req.query.q.toLowerCase();
    const merchants = db.users
        .filter(u => u.type === 'merchant' && u.name.toLowerCase().includes(q))
        .map(u => ({ id: u.id, name: u.name }));
    res.json(merchants);
});

// مزامنة البيانات
app.post('/api/sync', (req, res) => {
    const { userId, myRecords, linkedMerchants } = req.body;
    const idx = db.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
        db.users[idx].myRecords = myRecords;
        db.users[idx].linkedMerchants = linkedMerchants;
        saveDB();
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "المستخدم غير موجود" });
    }
});

// جلب ديون من منصة تاجر (للمدين)
app.get('/api/fetch-debts', (req, res) => {
    const { merchantName, debtorName } = req.query;
    const merchant = db.users.find(u => u.name.toLowerCase() === merchantName.toLowerCase());
    if (!merchant) return res.json([]);
    
    // جلب العمليات التي سجلها هذا التاجر على هذا المدين
    const records = merchant.myRecords.filter(r => r.targetName.toLowerCase() === debtorName.toLowerCase());
    res.json(ops = records);
});

app.listen(PORT, () => console.log(`🏛 HEIBA SYSTEM READY`));