const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;
const DB_FILE = './heiba_vault.json';

// إعدادات السيرفر
app.use(express.json());
app.use(express.static('public'));

// قاعدة بيانات تلقائية الإنشاء
let vault = {
    bots: [],
    trades: [],
    settings: { masterKey: "771232690" }
};

if (fs.existsSync(DB_FILE)) {
    vault = JSON.parse(fs.readFileSync(DB_FILE));
}

const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(vault, null, 2));

// --- العمليات (APIs) ---

// جلب كل البيانات بلمحة واحدة
app.get('/api/vault', (req, res) => res.json(vault));

// إضافة بوت وإرسال إشعار ترحيب فوري
app.post('/api/bots', async (req, res) => {
    const { name, token, chatId } = req.body;
    const newBot = { id: Date.now(), name, token, chatId };
    vault.bots.push(newBot);
    saveDB();
    
    // إرسال رسالة تجريبية
    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: `🔱 تم ربط بوت [${name}] بنجاح بمنظومة الهيبة المركزية.\nالسيرفر الآن تحت سيطرتك.`
        });
    } catch (e) { console.log("Telegram Token Invalid"); }
    
    res.json(newBot);
});

// تنفيذ صفقة وحفظها في السجل السحابي
app.post('/api/trades', (req, res) => {
    const { side, amount, entry, asset } = req.body;
    const trade = {
        id: Date.now(),
        side, // BUY or SELL
        amount: parseFloat(amount),
        entry: parseFloat(entry),
        asset: asset || "GOLD",
        time: new Date().toLocaleString('ar-YE')
    };
    vault.trades.push(trade);
    saveDB();
    res.json(trade);
});

// إغلاق الصفقة
app.delete('/api/trades/:id', (req, res) => {
    vault.trades = vault.trades.filter(t => t.id != req.params.id);
    saveDB();
    res.send("Closed");
});

// حذف بوت بكلمة السر
app.post('/api/bots/delete', (req, res) => {
    const { id, key } = req.body;
    if (key !== vault.settings.masterKey) return res.status(403).send("Wrong Key");
    vault.bots = vault.bots.filter(b => b.id != id);
    saveDB();
    res.send("Deleted");
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 HEIBA COMMANDER SERVER IS LIVE ON ${PORT}`);
    console.log(`=========================================`);
});