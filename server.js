const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();

const PORT = 3000;
const DB_FILE = './heiba_vault.json';

app.use(express.json());
app.use(express.static('public'));

let vault = { balance: 10000, bots: [], trades: [] };
if (fs.existsSync(DB_FILE)) { vault = JSON.parse(fs.readFileSync(DB_FILE)); }

const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(vault, null, 2));

app.get('/api/data', (req, res) => res.json(vault));

app.post('/api/trade', (req, res) => {
    const trade = { ...req.body, id: Date.now() };
    vault.balance -= trade.amount; // خصم المبلغ من الرصيد التجريبي
    vault.trades.push(trade);
    saveDB();
    res.json(trade);
});

app.delete('/api/trade/:id', (req, res) => {
    const tradeIndex = vault.trades.findIndex(t => t.id == req.params.id);
    if(tradeIndex > -1) {
        const t = vault.trades[tradeIndex];
        const currentPrice = req.body.currentPrice || t.entryPrice;
        const diff = currentPrice - t.entryPrice;
        const pnl = t.side === 'BUY' ? (diff * t.amount / t.entryPrice) : (-diff * t.amount / t.entryPrice);
        
        vault.balance += (t.amount + pnl); // إعادة المبلغ مع الربح أو الخسارة
        vault.trades.splice(tradeIndex, 1);
        saveDB();
    }
    res.send("Closed");
});

app.post('/api/bots', (req, res) => {
    vault.bots = [req.body];
    saveDB();
    res.send("Saved");
});

app.listen(PORT, () => console.log(`🚀 HEIBA TRADER LIVE ON PORT ${PORT}`));