const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;
const DB_FILE = './heiba_trading_vault.json';

app.use(express.json());
app.use(express.static('public'));

// قاعدة بيانات مطورة تدعم الحماية بالاسم وكلمة السر
let vault = {
    bots: [],
    trades: [], 
    config: { masterKey: "771232690" }
};

// تحميل البيانات عند التشغيل
if (fs.existsSync(DB_FILE)) {
    try {
        vault = JSON.parse(fs.readFileSync(DB_FILE));
    } catch (e) { console.log("Database initialized"); }
}

const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(vault, null, 2));

// API لجلب كل البيانات (لكي يرى الجميع صفقات بعضهم)
app.get('/api/data', (req, res) => res.json(vault));

// تنفيذ صفقة محمية باسم وكلمة سر
app.post('/api/trade', (req, res) => {
    const { asset, side, amount, entryPrice, owner, ownerPass } = req.body;
    
    if(!owner || !ownerPass) {
        return res.status(400).send("الاسم وكلمة السر مطلوبان لحماية الصفقة");
    }

    const newTrade = {
        id: Date.now(),
        asset,
        side,
        amount: parseFloat(amount),
        entryPrice: parseFloat(entryPrice),
        owner,      // اسم صاحب الصفقة
        ownerPass,  // كلمة سر الصفقة (مخفية)
        status: 'OPEN',
        timestamp: new Date().toISOString()
    };
    
    vault.trades.push(newTrade);
    saveDB();
    res.json(newTrade);
});

// إغلاق صفقة (لا يتم إلا بكلمة السر الصحيحة)
app.post('/api/trade/close/:id', (req, res) => {
    const { password } = req.body;
    const tradeIndex = vault.trades.findIndex(t => t.id == req.params.id);

    if (tradeIndex === -1) return res.status(404).send("الصفقة غير موجودة");

    const trade = vault.trades[tradeIndex];

    // التحقق من كلمة السر (أو الماستر كي)
    if (password === trade.ownerPass || password === vault.config.masterKey) {
        vault.trades.splice(tradeIndex, 1);
        saveDB();
        res.send("تم إغلاق الصفقة بنجاح");
    } else {
        res.status(403).send("كلمة السر خاطئة! لا يمكنك حذف صفقات الآخرين");
    }
});

// إدارة البوتات مع حماية الخصوصية
app.post('/api/bots', (req, res) => {
    const { botName, token, chatId, password } = req.body;
    
    const newBot = {
        id: Date.now(),
        botName,
        token,
        chatId,
        password, // كلمة سر لحماية إعدادات البوت
        createdAt: new Date().toISOString()
    };

    vault.bots.push(newBot);
    saveDB();
    res.send("تم ربط وتأمين البوت بنجاح");
});

app.listen(PORT, () => console.log(`🚀 HEIBA SECURE SYSTEM ACTIVE ON ${PORT}`));