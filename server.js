const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = './heiba_shared_vault.json';

app.use(express.json());
app.use(express.static('public'));

// قاعدة بيانات تدعم تعدد المستخدمين والعمليات
let vault = {
    bots: [],
    trades: [],
    logs: []
};

// تحميل البيانات المخزنة
if (fs.existsSync(DB_FILE)) {
    try {
        vault = JSON.parse(fs.readFileSync(DB_FILE));
    } catch (e) { console.log("Init Database"); }
}

const saveAndLog = (msg) => {
    const time = new Date().toLocaleTimeString('ar-YE');
    vault.logs.push({ time, msg });
    if(vault.logs.length > 50) vault.logs.shift(); // الاحتفاظ بآخر 50 نشاط
    fs.writeFileSync(DB_FILE, JSON.stringify(vault, null, 2));
};

// جلب البيانات للجميع
app.get('/api/data', (req, res) => res.json(vault));

// إضافة بوت بهوية
app.post('/api/bots', (req, res) => {
    const bot = req.body;
    vault.bots.push(bot);
    saveAndLog(`قام ${bot.user} بإضافة رصد جديد باسم ${bot.name}`);
    res.json({ success: true });
});

// حذف بوت مع فحص كلمة السر
app.delete('/api/bots/:id', (req, res) => {
    const { id } = req.params;
    const { pass } = req.body;
    const index = vault.bots.findIndex(b => b.id == id);
    
    if (index > -1) {
        if (vault.bots[index].pass === pass) {
            const botName = vault.bots[index].name;
            const userName = vault.bots[index].user;
            vault.bots.splice(index, 1);
            saveAndLog(`تم حذف رصد ${botName} الخاص بـ ${userName}`);
            res.json({ success: true });
        } else {
            res.json({ success: false, msg: "كلمة السر خاطئة!" });
        }
    } else {
        res.json({ success: false, msg: "البوت غير موجود" });
    }
});

// تنفيذ صفقة بهوية
app.post('/api/trade', (req, res) => {
    const trade = req.body;
    vault.trades.push(trade);
    saveAndLog(`فتح ${trade.user} صفقة ${trade.side} على ${trade.asset}`);
    res.json({ success: true });
});

// إغلاق صفقة مع فحص كلمة السر
app.delete('/api/trade/:id', (req, res) => {
    const { id } = req.params;
    const { pass } = req.body;
    const index = vault.trades.findIndex(t => t.id == id);

    if (index > -1) {
        if (vault.trades[index].pass === pass) {
            const trade = vault.trades[index];
            vault.trades.splice(index, 1);
            saveAndLog(`أغلق ${trade.user} صفقة الـ ${trade.asset}`);
            res.json({ success: true });
        } else {
            res.json({ success: false, msg: "كلمة السر خاطئة لإغلاق الصفقة!" });
        }
    } else {
        res.json({ success: false, msg: "الصفقة غير موجودة" });
    }
});

app.listen(PORT, () => console.log(`🚀 HEIBA SHARED SYSTEM ACTIVE ON ${PORT}`));