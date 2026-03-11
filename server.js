const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'heiba_shared_vault.json');

// ===== وسيطات السيرفر =====
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== قاعدة البيانات =====
let vault = {
    bots: [],
    trades: [],
    logs: []
};

// تحميل البيانات
if (fs.existsSync(DB_FILE)) {
    try {
        vault = JSON.parse(fs.readFileSync(DB_FILE));
    } catch (e) { 
        console.log("🔵 تم إنشاء قاعدة بيانات جديدة"); 
    }
}

// ===== دوال مساعدة =====
const saveAndLog = (msg) => {
    const time = new Date().toLocaleTimeString('ar-YE');
    vault.logs.push({ time, msg });
    if(vault.logs.length > 50) vault.logs.shift();
    fs.writeFileSync(DB_FILE, JSON.stringify(vault, null, 2));
    console.log(`📝 ${msg}`);
};

// ===== API Routes =====

// جلب البيانات
app.get('/api/data', (req, res) => {
    res.json(vault);
});

// إضافة بوت
app.post('/api/bots', (req, res) => {
    const bot = req.body;
    vault.bots.push(bot);
    saveAndLog(`➕ بوت جديد: ${bot.name} بواسطة ${bot.user}`);
    res.json({ success: true });
});

// حذف بوت
app.delete('/api/bots/:id', (req, res) => {
    const { id } = req.params;
    const { pass } = req.body;
    const index = vault.bots.findIndex(b => b.id == id);
    
    if (index > -1) {
        if (vault.bots[index].pass === pass) {
            const botName = vault.bots[index].name;
            vault.bots.splice(index, 1);
            saveAndLog(`🗑 حذف بوت: ${botName}`);
            res.json({ success: true });
        } else {
            res.json({ success: false, msg: "❌ كلمة السر خطأ" });
        }
    } else {
        res.json({ success: false, msg: "❌ البوت غير موجود" });
    }
});

// فتح صفقة
app.post('/api/trade', (req, res) => {
    const trade = req.body;
    vault.trades.push(trade);
    saveAndLog(`💰 صفقة جديدة: ${trade.user} فتح ${trade.side} على ${trade.asset} بمبلغ $${trade.amount}`);
    res.json({ success: true });
});

// إغلاق صفقة
app.delete('/api/trade/:id', (req, res) => {
    const { id } = req.params;
    const { pass } = req.body;
    const index = vault.trades.findIndex(t => t.id == id);

    if (index > -1) {
        if (vault.trades[index].pass === pass) {
            const trade = vault.trades[index];
            vault.trades.splice(index, 1);
            saveAndLog(`🔒 صفقة مغلقة: ${trade.user} - ${trade.asset}`);
            res.json({ success: true });
        } else {
            res.json({ success: false, msg: "❌ كلمة السر خطأ" });
        }
    } else {
        res.json({ success: false, msg: "❌ الصفقة غير موجودة" });
    }
});

// ===== تجهيز كل طلبات الواجهة =====
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== تشغيل السيرفر =====
app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════╗
    ║     🚀 HEIBA GLOBAL ACTIVE       ║
    ║     📡 PORT: ${PORT}                     ║
    ║     💾 Database: ${DB_FILE}    ║
    ╚══════════════════════════════════╝
    `);
});