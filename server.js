const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;
const DB_FILE = './heiba_trading_vault.json';

app.use(express.json());
app.use(express.static('public'));

// قاعدة بيانات تدعم تعدد العملات
let vault = {
    bots: [],
    trades: [], // ستخزن العملة، سعر الدخول، الكمية، والنوع
    config: { masterKey: "771232690" }
};

if (fs.existsSync(DB_FILE)) {
    try {
        vault = JSON.parse(fs.readFileSync(DB_FILE));
    } catch (e) { console.log("Database initialized"); }
}

const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(vault, null, 2));

// API لجلب البيانات
app.get('/api/data', (req, res) => res.json(vault));

// تنفيذ صفقة على أي عملة أو ذهب
app.post('/api/trade', (req, res) => {
    const { asset, side, amount, entryPrice } = req.body;
    const newTrade = {
        id: Date.now(),
        asset, // مثل BTC, GOLD, ETH
        side,  // BUY or SELL
        amount: parseFloat(amount),
        entryPrice: parseFloat(entryPrice),
        status: 'OPEN',
        timestamp: new Date().toISOString()
    };
    vault.trades.push(newTrade);
    saveDB();
    res.json(newTrade);
});

// إغلاق صفقة
app.delete('/api/trade/:id', (req, res) => {
    vault.trades = vault.trades.filter(t => t.id != req.params.id);
    saveDB();
    res.send("Closed");
});

// إدارة البوتات
app.post('/api/bots', (req, res) => {
    vault.bots.push({ ...req.body, id: Date.now() });
    saveDB();
    res.send("Bot Linked");
});

app.listen(PORT, () => console.log(`🚀 HEIBA MULTI-TRADER ACTIVE ON ${PORT}`));