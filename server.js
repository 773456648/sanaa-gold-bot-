const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_royal_db.json';

// إعدادات التلجرام
const TELEGRAM_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const MY_CHAT_ID = '5042495708';

app.use(express.json());
app.use(express.static('public'));

let db = { users: [], stamps: [] };
if (fs.existsSync(DB_PATH)) {
    try { 
        db = JSON.parse(fs.readFileSync(DB_PATH)); 
        if (!db.stamps) db.stamps = []; // ضمان وجود مصفوفة البصمات
    } catch (e) { db = { users: [], stamps: [] }; }
}

const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

async function sendToTelegram(message) {
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: MY_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
    } catch (e) { console.error("Telegram Send Error"); }
}

// --- نظام البصمة الذكي (الجديد) ---

// 1. إنشاء بصمة (يستدعيها المواطن)
app.post('/api/stamps/create', (req, res) => {
    const { debtorName, merchantName, amount, currency, code } = req.body;
    if (db.stamps.find(s => s.code === code)) return res.status(400).json({ error: "الكود مستخدم مسبقاً" });
    
    db.stamps.push({ 
        debtorName, 
        merchantName, 
        amount: parseFloat(amount), 
        currency, 
        code, 
        date: new Date().toISOString() 
    });
    saveDB();
    sendToTelegram(`✋ **بصمة سداد معلقة:**\nالمواطن: ${debtorName}\nالتاجر: ${merchantName}\nالمبلغ: ${amount} ${currency}\nالكود: \`${code}\``);
    res.json({ success: true });
});

// 2. البحث عن بصمة (يستدعيها التاجر)
app.get('/api/stamps/check/:code', (req, res) => {
    const stamp = db.stamps.find(s => s.code === req.params.code);
    if (stamp) res.json(stamp);
    else res.status(404).json({ error: "الكود غير موجود" });
});

// 3. تأكيد البصمة (يستدعيها التاجر بالضغط على تأكيد)
app.post('/api/stamps/verify', (req, res) => {
    const { merchantId, code } = req.body;
    const merchant = db.users.find(u => u.id === merchantId);
    const sIdx = db.stamps.findIndex(s => s.code === code && s.merchantName.toLowerCase() === merchant.name.toLowerCase());
    
    if (sIdx !== -1) {
        const stamp = db.stamps[sIdx];
        merchant.myRecords.push({
            id: Date.now(),
            targetName: stamp.debtorName,
            amount: stamp.amount,
            currency: stamp.currency,
            type: 'سداد',
            note: "تم السداد عبر بصمة الكود ✅",
            verified: true,
            date: new Date().toISOString()
        });
        db.stamps.splice(sIdx, 1);
        saveDB();
        sendToTelegram(`✅ **تأكيد بصمة:**\nالتاجر [${merchant.name}] استلم [${stamp.amount}] من [${stamp.debtorName}] عبر البصمة.`);
        res.json(merchant);
    } else {
        res.status(400).json({ error: "الكود لا يخصك أو غير صحيح" });
    }
});

// --- التزامن الذكي (معدل لإنقاص البصمة تلقائياً عند السداد اليدوي) ---
app.post('/api/sync', (req, res) => {
    const { userId, myRecords } = req.body;
    const idx = db.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
        const user = db.users[idx];
        
        // إذا كان التاجر أضاف سداد يدي، ننقص من البصمات المعلقة
        if (user.type === 'merchant') {
            const oldRecCount = user.myRecords.length;
            if (myRecords.length > oldRecCount) {
                const newRecs = myRecords.slice(oldRecCount);
                newRecs.forEach(rec => {
                    if (rec.type === 'سداد') {
                        let paymentAmt = parseFloat(rec.amount);
                        db.stamps.forEach((stamp, sIdx) => {
                            if (stamp.debtorName.toLowerCase() === rec.targetName.toLowerCase() && 
                                stamp.merchantName.toLowerCase() === user.name.toLowerCase() && 
                                stamp.currency === rec.currency) {
                                
                                if (paymentAmt >= stamp.amount) {
                                    paymentAmt -= stamp.amount;
                                    db.stamps[sIdx].toDelete = true;
                                } else if (paymentAmt > 0) {
                                    db.stamps[sIdx].amount -= paymentAmt;
                                    paymentAmt = 0;
                                }
                            }
                        });
                        db.stamps = db.stamps.filter(s => !s.toDelete);
                    }
                });
            }
        }

        db.users[idx].myRecords = myRecords;
        saveDB();
        res.json({ success: true });
    } else { res.status(404).send(); }
});

// ---Webhook التلجرام (نفس كودك الأصلي) ---
app.post('/api/tg-webhook', async (req, res) => {
    const update = req.body;
    if (!update.message || !update.message.text) return res.sendStatus(200);
    const chatId = String(update.message.chat.id);
    const text = update.message.text.trim();
    if (chatId !== MY_CHAT_ID) return res.sendStatus(200);

    if (text === "العدد") {
        const total = db.users.length;
        const merchants = db.users.filter(u => u.type === 'merchant').length;
        const debtors = db.users.filter(u => u.type === 'debtor').length;
        sendToTelegram(`📊 **إحصائيات المنصة:**\n\n👥 إجمالي المشتركين: ${total}\n👑 عدد التجار: ${merchants}\n👤 عدد المواطنين: ${debtors}`);
    } else if (text === "كل الأعضاء" || text === "كل العضا") {
        if (db.users.length === 0) { sendToTelegram("⚠️ لا يوجد أعضاء."); } 
        else {
            let list = "📋 **قائمة جميع الأعضاء:**\n";
            db.users.forEach((u, i) => list += `\n${i+1}. ${u.name} (${u.type === 'merchant' ? 'تاجر' : 'مواطن'})`);
            sendToTelegram(list);
        }
    } else if (text.endsWith("حذف")) {
        const targetName = text.replace("حذف", "").trim();
        const initialCount = db.users.length;
        db.users = db.users.filter(u => u.name.toLowerCase() !== targetName.toLowerCase());
        if (db.users.length < initialCount) { saveDB(); sendToTelegram(`🗑 **تم الحذف:** [${targetName}]`); }
        else { sendToTelegram(`❌ الاسم غير موجود.`); }
    } else {
        const found = db.users.filter(u => u.name.toLowerCase() === text.toLowerCase());
        if (found.length > 0) {
            let report = `📊 **بيانات الحساب [${text}]:**\n`;
            found.forEach(u => {
                let y=0, usd=0, s=0;
                u.myRecords.forEach(r => {
                    const a = parseFloat(r.amount); const d = r.type === 'دين';
                    if(r.currency === 'YER') y+=d?a:-a; else if(r.currency === 'USD') usd+=d?a:-a; else s+=d?a:-a;
                });
                report += `\n👤 النوع: ${u.type}\n🔑 السر: \`${u.password}\`\n💰 يمني: ${y}\n💵 دولار: ${usd}\n🇸🇦 سعودي: ${s}\n---`;
            });
            sendToTelegram(report);
        } else if (text !== "/start") { sendToTelegram(`🔍 لم يتم العثور على [${text}]`); }
    }
    res.sendStatus(200);
});

// --- بقية الـ API الأصلية ---
app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    const normalizedName = name.trim().toLowerCase();
    const existingUser = db.users.find(u => u.name.toLowerCase() === normalizedName && u.type === type);
    if (action === 'reg') {
        if (existingUser) return res.status(400).json({ error: "مسجل مسبقاً." });
        const newUser = { id: "H"+Math.random().toString(36).substr(2,7), name: name.trim(), password, type, myRecords: [], createdAt: new Date().toISOString() };
        db.users.push(newUser); saveDB();
        sendToTelegram(`✨ **تسجيل جديد:** ${newUser.name} (${type})`);
        return res.json(newUser);
    } else {
        const user = db.users.find(u => u.name.toLowerCase() === normalizedName && u.password === password && u.type === type);
        if (!user) return res.status(403).json({ error: "بيانات خاطئة." });
        return res.json(user);
    }
});

app.post('/api/update-pass', (req, res) => {
    const { userId, newPass } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (user) { user.password = newPass; saveDB(); res.json({ success: true }); }
});

app.get('/api/auto-discover', (req, res) => {
    const { debtorName } = req.query;
    if(!debtorName) return res.json([]);
    const results = db.users.filter(u => u.type === 'merchant' && u.myRecords.some(r => r.targetName.toLowerCase() === debtorName.toLowerCase()))
    .map(u => ({ merchantName: u.name, records: u.myRecords.filter(r => r.targetName.toLowerCase() === debtorName.toLowerCase()) }));
    res.json(results);
});

app.listen(PORT, () => console.log(`HEIBA SERVER ACTIVE`));