const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_ordered_finance.json';

app.use(express.json());
app.use(express.static('public'));

let db = { users: [] };
if (fs.existsSync(DB_PATH)) db = JSON.parse(fs.readFileSync(DB_PATH));
const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// إنشاء حساب
app.post('/api/auth/register', (req, res) => {
    const { name, password, type } = req.body;
    if (db.users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
        return res.status(400).json({ error: "الاسم مستخدم بالفعل" });
    }
    const newUser = {
        id: "U" + Date.now(),
        name: name.trim(),
        password,
        type: type || 'merchant',
        merchants: [],
        history: [],
        createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDB();
    res.json({ success: true, user: newUser });
});

// دخول
app.post('/api/auth/login', (req, res) => {
    const { name, password } = req.body;
    const user = db.users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.password === password);
    if (!user) return res.status(403).json({ error: "بيانات خاطئة" });
    res.json(user);
});

// مزامنة تلقائية
app.post('/api/user/sync', (req, res) => {
    const { id, password, data } = req.body;
    const idx = db.users.findIndex(u => u.id === id && u.password === password);
    if (idx === -1) return res.status(403).send("Error");
    db.users[idx].merchants = data.merchants;
    db.users[idx].history = data.history;
    saveDB();
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`🚀 HEIBA ORDERED SYSTEM ONLINE`));