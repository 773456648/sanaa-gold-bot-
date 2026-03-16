const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());
app.use(express.static('public'));

const DB_PATH = './heiba_royal_db.json';
let db = { users: [], pendingStamps: [] };

if (fs.existsSync(DB_PATH)) {
    try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch (e) { db = { users: [], pendingStamps: [] }; }
}
if(!db.pendingStamps) db.pendingStamps = [];

const save = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// نظام البصمة والمطابقة
app.post('/api/verify-auth', (req, res) => {
    const { action, debtorName, merchantName, opId, authCode, merchantId } = req.body;

    if (action === 'create') {
        db.pendingStamps.push({ debtorName, merchantName, opId, authCode, status: 'pending' });
        save();
        return res.json({ success: true });
    }

    if (action === 'check') {
        const merchant = db.users.find(u => u.id === merchantId);
        if (!merchant) return res.status(404).send();

        const stampIdx = db.pendingStamps.findIndex(s => s.authCode === authCode && s.merchantName === merchant.name);
        if (stampIdx !== -1) {
            const stamp = db.pendingStamps[stampIdx];
            let count = 0;
            merchant.myRecords.forEach(r => {
                if (r.targetName === stamp.debtorName && (stamp.opId === 'all' || r.id === stamp.opId)) {
                    r.isVerified = true;
                    r.authCode = authCode;
                    count++;
                }
            });
            db.pendingStamps.splice(stampIdx, 1);
            save();
            return res.json({ success: true, count, newRecords: merchant.myRecords });
        }
        return res.status(400).json({ error: "كود غير صحيح" });
    }
});

app.post('/api/auth', (req, res) => {
    const { name, password, type, action } = req.body;
    let u = db.users.find(x => x.name === name && x.type === type);
    if (action === 'reg') {
        if (u) return res.status(400).json({ error: "الاسم مسجل" });
        u = { id: Date.now().toString(), name, password, type, myRecords: [] };
        db.users.push(u); save();
    } else {
        if (!u || u.password !== password) return res.status(403).json({ error: "خطأ في البيانات" });
    }
    res.json(u);
});

app.post('/api/sync', (req, res) => {
    const { userId, myRecords } = req.body;
    const u = db.users.find(x => x.id === userId);
    if (u) { u.myRecords = myRecords; save(); res.json({ success: true }); }
});

app.get('/api/auto-discover', (req, res) => {
    const { debtorName } = req.query;
    const results = db.users.filter(u => u.type === 'merchant' && u.myRecords.some(r => r.targetName === debtorName))
        .map(u => ({ merchantName: u.name, records: u.myRecords.filter(r => r.targetName === debtorName) }));
    res.json(results);
});

app.post('/api/update-pass', (req, res) => {
    const { userId, newPass } = req.body;
    const u = db.users.find(x => x.id === userId);
    if (u) { u.password = newPass; save(); res.json({ success: true }); }
});

app.listen(3000, () => console.log('Heiba Server Running on 3000'));