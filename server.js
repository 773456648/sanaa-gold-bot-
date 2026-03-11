const express = require('express');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const app = express();

const PORT = 3000;
const DB_FILE = './heiba_vault.json';

app.use(express.json());
app.use(express.static('public'));

// إنشاء قاعدة بيانات إذا لم تكن موجودة
let vault = { bots: [], trades: [] };
if (fs.existsSync(DB_FILE)) {
    try { vault = JSON.parse(fs.readFileSync(DB_FILE)); } catch (e) { console.log("Init DB"); }
}

const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(vault, null, 2));

// إرسال تنبيه لتليجرام
async function notifyTelegram(msg) {
    if (vault.bots.length > 0) {
        const bot = vault.bots[0];
        const url = `https://api.telegram.org/bot${bot.token}/sendMessage?chat_id=${bot.chatId}&text=${encodeURIComponent(msg)}`;
        try { await axios.get(url); } catch (e) { console.log("Telegram Error"); }
    }
}

app.get('/api/data', (req, res) => res.json(vault));

app.post('/api/trade', async (req, res) => {
    const trade = { ...req.body, id: Date.now(), time: new Date().toLocaleString() };
    vault.trades.push(trade);
    saveDB();
    await notifyTelegram(`🔔 صفقة جديدة!\nالعملة: ${trade.asset}\nالنوع: ${trade.side}\nالسعر: ${trade.entryPrice}\nالمبلغ: $${trade.amount}`);
    res.json(trade);
});

app.delete('/api/trade/:id', async (req, res) => {
    const trade = vault.trades.find(t => t.id == req.params.id);
    vault.trades = vault.trades.filter(t => t.id != req.params.id);
    saveDB();
    if(trade) await notifyTelegram(`✅ تم إغلاق صفقة ${trade.asset} بنجاح`);
    res.send("Closed");
});

app.post('/api/bots', (req, res) => {
    vault.bots = [req.body]; // حفظ بوت واحد حالياً
    saveDB();
    res.send("Linked");
});

app.listen(PORT, () => {
    console.log(`
    ===========================================
    🚀 HEIBA TRADING SYSTEM IS ACTIVE
    🌐 URL: http://localhost:3000
    ===========================================
    `);
});