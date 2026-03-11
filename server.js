const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;
const DB_FILE = './heiba_vault.json';

app.use(express.json());
app.use(express.static('public'));

// قاعدة البيانات: الرصيد، البوتات، والصفقات
let vault = { balance: 10000, bots: [], trades: [] };
if (fs.existsSync(DB_FILE)) { 
    try { vault = JSON.parse(fs.readFileSync(DB_FILE)); } catch (e) { console.log("Init DB"); }
}

const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(vault, null, 2));

// مسار جلب البيانات
app.get('/api/data', (req, res) => res.json(vault));

// تنفيذ صفقة وخصم المبلغ من الرصيد التجريبي
app.post('/api/trade', (req, res) => {
    const trade = { ...req.body, id: Date.now(), time: new Date().toLocaleString() };
    if (vault.balance >= trade.amount) {
        vault.balance -= trade.amount;
        vault.trades.push(trade);
        saveDB();
        res.json(trade);
    } else {
        res.status(400).send("الرصيد لا يكفي");
    }
});

// إغلاق صفقة وإعادة المبلغ مع الربح أو الخسارة
app.post('/api/close-trade', (req, res) => {
    const { id, currentPrice } = req.body;
    const tIndex = vault.trades.findIndex(t => t.id == id);
    if (tIndex > -1) {
        const t = vault.trades[tIndex];
        const diff = currentPrice - t.entryPrice;
        const pnl = t.side === 'BUY' ? (diff * t.amount / t.entryPrice) : (-diff * t.amount / t.entryPrice);
        
        vault.balance += (t.amount + pnl);
        vault.trades.splice(tIndex, 1);
        saveDB();
        res.json({ newBalance: vault.balance });
    } else {
        res.status(404).send("الصفقة غير موجودة");
    }
});

// محرك الذكاء الاصطناعي الخاص بالمنظومة
app.post('/api/ai-chat', (req, res) => {
    const { question, price, asset } = req.body;
    let answer = "";
    
    if (question.includes("ذهب") || question.includes("اشتري")) {
        answer = `يا قائد، سعر ${asset} الآن ${price}$. فنياً، إذا كان السعر في اتجاه صاعد، فالشراء بـ 2% من رصيدك التجريبي ($${(vault.balance * 0.02).toFixed(2)}) هو القرار الأذكى لتقليل الخسارة.`;
    } else if (question.includes("خسارة") || question.includes("ايش اسوي")) {
        answer = "لا تقلق! التداول علم وصبر. راقب الشارت جيداً، وإذا كنت خاسراً الآن، انتظر منطقة الارتداد ولا تستعجل في إغلاق الصفقة.";
    } else {
        answer = `أنا معك يا قائد! رصيدك الحالي $${vault.balance.toFixed(2)}. السوق اليوم فيه سيولة قوية، اسألني عن أي صفقة تريد تحليلها.`;
    }
    res.json({ answer });
});

app.post('/api/bots', (req, res) => {
    vault.bots = [req.body];
    saveDB();
    res.send("Saved");
});

app.listen(PORT, () => console.log(`🚀 HEIBA SMART SYSTEM ACTIVE ON ${PORT}`));