const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_auto_sync.json';

app.use(express.json());
app.use(express.static('public'));

let db = { users: [] };
if (fs.existsSync(DB_PATH)) {
    try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch (e) { db = { users: [] }; }
}

const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// نظام الدخول والتسجيل
app.post('/api/auth', (req, res) => {
    const { name, password, type, action } = req.body;
    const normalized = name.trim().toLowerCase();
    const existingUser = db.users.find(u => u.name.toLowerCase() === normalized);

    if (action === 'reg') {
        if (existingUser) return res.status(400).json({ error: "الاسم مستخدم بالفعل" });
        const newUser = {
            id: "ID_" + Math.random().toString(36).substr(2, 9),
            name: name.trim(),
            password,
            type, // 'merchant' or 'debtor'
            myRecords: [] 
        };
        db.users.push(newUser);
        saveDB();
        return res.json(newUser);
    } else {
        const user = db.users.find(u => u.name.toLowerCase() === normalized && u.password === password);
        if (!user) return res.status(403).json({ error: "بيانات خاطئة" });
        return res.json(user);
    }
});

// ميزة المزامنة الذكية: جلب كل التجار الذين سجلوا ديون على هذا الاسم
app.get('/api/auto-discover', (req, res) => {
    const { debtorName } = req.query;
    const normalizedDebtor = debtorName.trim().toLowerCase();
    
    // نبحث في كل حسابات التجار عن أي سجلات لهذا الاسم
    const merchantsWithDebts = db.users.filter(u => 
        u.type === 'merchant' && 
        u.myRecords.some(r => r.targetName.toLowerCase() === normalizedDebtor)
    ).map(u => ({
        merchantName: u.name,
        records: u.myRecords.filter(r => r.targetName.toLowerCase() === normalizedDebtor)
    }));

    res.json(merchantsWithDebts);
});

// حفظ البيانات
app.post('/api/sync', (req, res) => {
    const { userId, myRecords } = req.body;
    const idx = db.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
        db.users[idx].myRecords = myRecords;
        saveDB();
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "المستخدم غير موجود" });
    }
});

app.listen(PORT, () => console.log(`🚀 HEIBA AUTO-SYNC SYSTEM ONLINE`));