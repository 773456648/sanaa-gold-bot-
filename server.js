const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

const DB_PATH = './royal_database.json';
let db = { users: [], stamps: [] };

if (fs.existsSync(DB_PATH)) db = JSON.parse(fs.readFileSync(DB_PATH));
const save = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// استعلام عن بصمة
app.get('/api/search-stamp', (req, res) => {
    const s = db.stamps.find(x => x.authCode === req.query.code);
    if(s) res.json(s); else res.status(404).json({error: "Not found"});
});

// نظام البصمة
app.post('/api/verify-auth', (req, res) => {
    const { action, debtorName, merchantName, opId, authCode, merchantId } = req.body;

    if (action === 'create') {
        if(db.stamps.some(s => s.authCode === authCode)) return res.status(400).json({error: "الكود مستخدم سابقاً"});
        
        // قفل الـ 48 ساعة
        const existing = db.stamps.find(s => s.debtorName === debtorName && s.opId === opId);
        if(existing && (Date.now() - existing.createdAt < 172800000)) return res.status(400).json({error: "لا يمكن تعديل البصمة إلا بعد 48 ساعة"});

        db.stamps = db.stamps.filter(s => !(s.debtorName === debtorName && s.opId === opId));
        db.stamps.push({ debtorName, merchantName, opId, authCode, createdAt: Date.now(), status: 'pending' });
        save();
        return res.json({ success: true });
    }

    if (action === 'check') {
        const merch = db.users.find(u => u.id === merchantId);
        const stamp = db.stamps.find(s => s.authCode === authCode && s.merchantName === merch.name);
        if(!stamp) return res.status(400).json({error: "كود خاطئ"});

        merch.myRecords.forEach(r => {
            if(r.id === stamp.opId || (stamp.opId === 'all' && r.targetName === stamp.debtorName)) {
                r.isVerified = true; r.authCode = authCode;
                stamp.status = 'active'; stamp.amount = r.amount; stamp.currency = r.currency;
            }
        });
        save();
        res.json({ newRecords: merch.myRecords });
    }
});

// الحفظ والخصم الذكي
app.post('/api/sync', (req, res) => {
    const { userId, op } = req.body;
    const u = db.users.find(x => x.id === userId);
    if(!u) return res.status(404).send();

    if(op.type === 'سداد') {
        let amt = parseFloat(op.amount);
        u.myRecords.forEach(r => {
            if(r.targetName === op.targetName && r.currency === op.currency && r.isVerified && amt > 0) {
                let rAmt = parseFloat(r.amount);
                let deduct = Math.min(rAmt, amt);
                r.amount = (rAmt - deduct).toString();
                amt -= deduct;
                if(parseFloat(r.amount) <= 0) db.stamps = db.stamps.filter(s => s.authCode !== r.authCode);
            }
        });
        op.amount = amt.toString();
    }
    u.myRecords.push(op); save();
    res.json({ newRecords: u.myRecords });
});

app.post('/api/auth', (req, res) => {
    const { name, password, type, action } = req.body;
    let u = db.users.find(x => x.name === name && x.type === type);
    if(action === 'reg') {
        if(u) return res.status(400).json({error: "مسجل مسبقاً"});
        u = { id: Date.now().toString(), name, password, type, myRecords: [] };
        db.users.push(u); save();
    }
    if(!u || u.password !== password) return res.status(403).json({error: "خطأ في الدخول"});
    res.json(u);
});

app.get('/api/auto-discover', (req, res) => {
    const results = db.users.filter(u => u.type === 'merchant' && u.myRecords.some(r => r.targetName === req.query.name))
        .map(u => ({ merchantName: u.name, records: u.myRecords.filter(r => r.targetName === req.query.name) }));
    res.json(results);
});

app.listen(3000, () => console.log('Server running on 3000'));