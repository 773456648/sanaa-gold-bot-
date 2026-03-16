const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

const DB_PATH = './heiba_final_db.json';
let db = { users: [], stamps: [] };

if (fs.existsSync(DB_PATH)) db = JSON.parse(fs.readFileSync(DB_PATH));
const save = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// نظام البحث عن البصمة
app.get('/api/search-stamp', (req, res) => {
    const s = db.stamps.find(x => x.authCode === req.query.code);
    if(s) res.json(s); else res.status(404).json({error:"Not found"});
});

// نظام البصمة المتطور
app.post('/api/verify-auth', (req, res) => {
    const { action, debtorName, merchantName, opId, authCode, merchantId } = req.body;

    if (action === 'create') {
        // 1. تحقق من تكرار الكود
        if(db.stamps.some(s => s.authCode === authCode)) return res.status(400).json({error:"هذا الكود مستخدم سابقاً، اختر كوداً آخر"});

        // 2. تحقق من قفل اليومين
        const lastStamp = db.stamps.find(s => s.debtorName === debtorName && s.opId === opId);
        if(lastStamp && (Date.now() - lastStamp.createdAt < 172800000)) {
            return res.status(400).json({error:"لا يمكنك تغيير بصمة هذه العملية إلا بعد يومين"});
        }

        db.stamps = db.stamps.filter(s => !(s.debtorName === debtorName && s.opId === opId)); // حذف القديم غير المفعل
        db.stamps.push({ debtorName, merchantName, opId, authCode, createdAt: Date.now(), status: 'pending' });
        save();
        return res.json({ success: true });
    }

    if (action === 'check') {
        const merchant = db.users.find(u => u.id === merchantId);
        const stampIdx = db.stamps.findIndex(s => s.authCode === authCode && s.merchantName === merchant.name);
        
        if (stampIdx !== -1) {
            const s = db.stamps[stampIdx];
            merchant.myRecords.forEach(r => {
                if(r.id === s.opId) { 
                    r.isVerified = true; r.authCode = authCode;
                    s.status = 'active'; s.amount = r.amount; s.currency = r.currency;
                }
            });
            save();
            return res.json({ success: true, newRecords: merchant.myRecords });
        }
        return res.status(400).json({ error: "الكود غير صحيح أو لا يخصك" });
    }
});

// نظام الخصم الذكي (السداد يخصم من البصمة أولاً)
app.post('/api/sync', (req, res) => {
    const { userId, op } = req.body;
    const u = db.users.find(x => x.id === userId);
    if (!u) return res.status(404).send();

    if(op.type === 'سداد') {
        let payAmt = parseFloat(op.amount);
        // اخصم من الديون الموثقة بالبصمة أولاً
        u.myRecords.forEach(r => {
            if(r.targetName === op.targetName && r.currency === op.currency && r.isVerified && payAmt > 0) {
                let currentVal = parseFloat(r.amount);
                if(currentVal > 0) {
                    let deduct = Math.min(currentVal, payAmt);
                    r.amount = (currentVal - deduct).toString();
                    payAmt -= deduct;
                    if(parseFloat(r.amount) <= 0) { 
                        // إذا استوفت البصمة، انتهى الكود
                        db.stamps = db.stamps.filter(s => s.authCode !== r.authCode);
                    }
                }
            }
        });
        // إذا بقى شيء، اخصم من الديون العادية
        if(payAmt > 0) op.amount = payAmt.toString(); else op.amount = "0";
    }

    u.myRecords.push(op);
    save();
    res.json({ newRecords: u.myRecords });
});

app.post('/api/auth', (req, res) => {
    const { name, password, type, action } = req.body;
    let u = db.users.find(x => x.name === name && x.type === type);
    if(action === 'reg') {
        if(u) return res.status(400).json({error:"الاسم موجود"});
        u = { id: Date.now().toString(), name, password, type, myRecords: [] };
        db.users.push(u); save();
    }
    if(!u || u.password !== password) return res.status(403).json({error:"خطأ في البيانات"});
    res.json(u);
});

app.get('/api/auto-discover', (req, res) => {
    const results = db.users.filter(u => u.type === 'merchant' && u.myRecords.some(r => r.targetName === req.query.name))
        .map(u => ({ merchantName: u.name, records: u.myRecords.filter(r => r.targetName === req.query.name) }));
    res.json(results);
});

app.listen(3000);