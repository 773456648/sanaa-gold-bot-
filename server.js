const express = require('express');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;
const DB_FILE = './heiba_trading_vault.json';

app.use(express.json());
app.use(express.static('public'));

let vault = {
    bots: [],
    trades: [],
    activities: [], // سجل النشاط العام
    config: { masterKey: "771232690" }
};

if (fs.existsSync(DB_FILE)) {
    try {
        vault = JSON.parse(fs.readFileSync(DB_FILE));
    } catch (e) { console.log("Database initialized"); }
}

const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(vault, null, 2));

// إضافة نشاط جديد للسجل
const addActivity = (user, action) => {
    vault.activities.unshift({
        user,
        action,
        time: new Date().toLocaleTimeString('ar-SA')
    });
    if (vault.activities.length > 20) vault.activities.pop();
    saveDB();
};

app.get('/api/data', (req, res) => res.json(vault));

// إضافة بوت مع نظام الحماية
app.post('/api/bots', (req, res) => {
    const { name, token, chatid, password } = req.body;
    if(!name || !password) return res.status(400).send("الاسم وكلمة السر مطلوبان");
    
    const newBot = { id: Date.now(), name, token, chatid, password };
    vault.bots.push(newBot);
    addActivity(name, "قام بربط بوت جديد بالمنظومة");
    res.send("تم ربط البوت بنجاح");
});

// حذف بوت بشرط كلمة السر
app.post('/api/bots/delete', (req, res) => {
    const { id, password } = req.body;
    const botIndex = vault.bots.findIndex(b => b.id == id);
    
    if (botIndex === -1) return res.status(404).send("البوت غير موجود");
    
    if (vault.bots[botIndex].password === password) {
        const botName = vault.bots[botIndex].name;
        vault.bots.splice(botIndex, 1);
        addActivity(botName, "قام بحذف البوت الخاص به");
        saveDB();
        res.send("تم الحذف بنجاح");
    } else {
        res.status(403).send("كلمة السر خاطئة! لا يمكنك الحذف");
    }
});

app.post('/api/trade', (req, res) => {
    const { asset, side, amount, entryPrice, userName } = req.body;
    const newTrade = {
        id: Date.now(),
        asset,
        side,
        amount,
        entryPrice,
        userName: userName || "مجهول"
    };
    vault.trades.push(newTrade);
    addActivity(newTrade.userName, `فتح صفقة ${side} على ${asset}`);
    saveDB();
    res.json(newTrade);
});

app.listen(PORT, () => console.log(`🚀 HEIBA SYSTEM ACTIVE ON ${PORT}`));