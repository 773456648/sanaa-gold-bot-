const express = require('express');
const fs = require('fs').promises; // استخدام النسخة الغير حاصرة (Async) لأداء أفضل
const { existsSync } = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'heiba_royal_db.json');

// إعدادات التلجرام (يُفضل لاحقاً وضعها في ملف .env)
const TELEGRAM_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const MY_CHAT_ID = '5042495708';
const ADMIN_PASSWORD = '771232690'; 

// إعدادات Express
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

let db = { users: [] };

// تهيئة قاعدة البيانات عند بدء التشغيل
async function initDB() {
    if (existsSync(DB_PATH)) {
        try { 
            const data = await fs.readFile(DB_PATH, 'utf8');
            db = JSON.parse(data); 
        } catch (e) { 
            console.error("خطأ في قراءة القاعدة، سيتم البدء بقاعدة جديدة.", e);
            db = { users: [] }; 
        }
    }
}
initDB();

const saveDB = async () => {
    try { await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2)); }
    catch(e) { console.error("خطأ في حفظ البيانات:", e); }
};

// --- دوال التلجرام ---
async function sendToTelegram(message) {
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: MY_CHAT_ID, text: message, parse_mode: 'Markdown'
        });
    } catch (e) { console.error("فشل إرسال رسالة التلجرام"); }
}

let lastBackupMessageId = null;

async function sendFileToTelegram(caption = "📦 نسخة احتياطية محدثة") {
    try {
        if (lastBackupMessageId) {
            try {
                await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/deleteMessage`, {
                    chat_id: MY_CHAT_ID, message_id: lastBackupMessageId
                });
            } catch (deleteError) { /* تجاهل خطأ الحذف إذا انتهت الصلاحية */ }
        }

        const form = new FormData();
        form.append('chat_id', MY_CHAT_ID);
        form.append('caption', caption);
        
        // استخدام fs.createReadStream القياسي هنا لأن FormData يحتاج Stream
        form.append('document', require('fs').createReadStream(DB_PATH));

        const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`, form, {
            headers: form.getHeaders()
        });

        if (response.data && response.data.result) {
            lastBackupMessageId = response.data.result.message_id;
        }
    } catch (e) { console.error("فشل إرسال ملف النسخة الاحتياطية للتلجرام"); }
}

// --- مسار استقبال أوامر التلجرام (Webhook/Polling) ---
app.post('/api/tg-webhook', async (req, res) => {
    // نرسل رد 200 فوراً حتى لا نعلق سيرفر التلجرام
    res.sendStatus(200);
    
    const update = req.body;
    if (!update.message) return;

    // استعادة النسخة
    if (update.message.document) {
        const doc = update.message.document;
        if (doc.file_name === 'heiba_royal_db.json') {
            try {
                const fileRes = await axios.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${doc.file_id}`);
                const filePath = fileRes.data.result.file_path;
                const downloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;
                
                const response = await axios.get(downloadUrl);
                db = response.data;
                await saveDB();
                await sendToTelegram("✅ *تم استعادة قاعدة البيانات بنجاح! المنظومة الآن جاهزة.*");
            } catch (e) {
                await sendToTelegram("❌ *فشل تحميل الملف، تأكد من الصيغة.*");
            }
        }
        return;
    }

    if (!update.message.text) return;
    
    const chatId = String(update.message.chat.id);
    const fullText = update.message.text.trim();

    if (chatId !== MY_CHAT_ID || !fullText.startsWith(ADMIN_PASSWORD)) return;

    let cmd = fullText.substring(ADMIN_PASSWORD.length).trim();
    if (!cmd) return;

    try {
        if (cmd === "نسخة" || cmd === "البيانات") {
            await sendFileToTelegram("📦 هذه آخر نسخة من قاعدة البيانات لديك.");
        } else if (cmd === "العدد") {
            const total = db.users.length;
            const m = db.users.filter(u => u.type === 'merchant').length;
            const d = db.users.filter(u => u.type === 'debtor').length;
            await sendToTelegram(`📊 *الإحصائيات:*\n\n👥 الكل: ${total}\n👑 تجار: ${m}\n👤 مواطنين: ${d}`);
        } else if (cmd === "كل الأعضاء" || cmd === "كل العضا") {
            if (db.users.length === 0) return sendToTelegram("⚠️ القائمة فارغة.");
            let list = "📋 *قائمة الأعضاء:*\n";
            db.users.forEach((u, i) => list += `\n${i + 1}. ${u.name} ${u.verified ? '✅' : ''} (${u.type === 'merchant' ? 'تاجر' : 'مواطن'})`);
            await sendToTelegram(list);
        } else if (cmd.includes("الغاء توثيق")) {
            const name = cmd.replace("الغاء توثيق", "").trim();
            const targets = db.users.filter(u => u.name.toLowerCase() === name.toLowerCase());
            if (targets.length > 0) {
                targets.forEach(u => u.verified = false);
                await saveDB();
                await sendToTelegram(`🚫 *إلغاء التوثيق:* [${name}]`);
            } else await sendToTelegram(`❌ الاسم [${name}] غير موجود.`);
        } else if (cmd.includes("توثيق")) {
            const name = cmd.replace("توثيق", "").trim();
            const targets = db.users.filter(u => u.name.toLowerCase() === name.toLowerCase());
            if (targets.length > 0) {
                targets.forEach(u => u.verified = true);
                await saveDB();
                await sendToTelegram(`✅ *تم التوثيق:* [${name}]`);
            } else await sendToTelegram(`❌ الاسم [${name}] غير موجود.`);
        } else if (cmd.includes("حذف")) {
            const name = cmd.replace("حذف", "").trim();
            const initialCount = db.users.length;
            db.users = db.users.filter(u => u.name.toLowerCase() !== name.toLowerCase());
            if (db.users.length < initialCount) {
                await saveDB();
                await sendToTelegram(`🗑 *تم الحذف:* جميع حسابات [${name}]`);
            } else await sendToTelegram(`❌ الاسم [${name}] غير موجود.`);
        } else {
            // البحث عن مستخدم
            const name = cmd.trim();
            const found = db.users.filter(u => u.name.toLowerCase() === name.toLowerCase());
            if (found.length > 0) {
                let rep = `📊 *بيانات الحساب [${name}]:*\n`;
                found.forEach(u => {
                    let y=0, usd=0, s=0;
                    (u.myRecords || []).forEach(r => {
                        const a = parseFloat(r.amount) || 0; const d = r.type === 'دين';
                        if(r.currency === 'YER') y += d?a:-a; 
                        else if(r.currency === 'USD') usd += d?a:-a; 
                        else if(r.currency === 'SAR') s += d?a:-a;
                    });
                    rep += `\n👤 النوع: ${u.type === 'merchant' ? 'تاجر' : 'مواطن'}\n✨ الحالة: ${u.verified ? '✅ موثق' : '❌ غير موثق'}\n🔑 السر: \`${u.password}\`\n💰 يمني: ${y}\n💵 دولار: ${usd}\n🇸🇦 سعودي: ${s}\n---`;
                });
                await sendToTelegram(rep);
            } else {
                await sendToTelegram(`🔍 لم يتم العثور على [${name}]`);
            }
        }
    } catch(err) { console.error("Bot Command Error:", err); }
});

// --- APIs النظام ---

app.post('/api/auth', async (req, res) => {
    try {
        const { name, password, type, action } = req.body;
        if(!name || !password) return res.status(400).json({error: "البيانات غير مكتملة"});
        const normalizedName = name.trim().toLowerCase();
        
        const userIndex = db.users.findIndex(u => u.name.toLowerCase() === normalizedName && u.type === type);
        
        if (action === 'reg') {
            if (userIndex !== -1) return res.status(400).json({ error: "هذا الاسم مسجل مسبقاً كنفس نوع الحساب." });
            const newUser = { 
                id: "H" + Math.random().toString(36).substr(2, 9), 
                name: name.trim(), 
                password, 
                type, 
                myRecords: [], 
                verified: false, 
                createdAt: new Date().toISOString() 
            };
            db.users.push(newUser);
            await saveDB();
            sendToTelegram(`✨ *تسجيل جديد:*\nالاسم: ${newUser.name}\nالنوع: ${type === 'merchant' ? 'تاجر' : 'مواطن'}`);
            return res.json(newUser);
        } else {
            const user = db.users[userIndex];
            if (!user || user.password !== password) return res.status(403).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة." });
            return res.json(user);
        }
    } catch(e) {
        res.status(500).json({ error: "خطأ داخلي في الخادم" });
    }
});

app.post('/api/update-pass', async (req, res) => {
    const { userId, newPass } = req.body;
    const user = db.users.find(u => u.id === userId);
    if(user) {
        user.password = newPass;
        await saveDB();
        res.json({success: true});
    } else res.status(404).json({error: "المستخدم غير موجود"});
});

app.post('/api/sync', async (req, res) => {
    const { userId, myRecords } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (user) { 
        user.myRecords = myRecords; 
        await saveDB(); 
        sendFileToTelegram(`🔄 *تحديث تلقائي:* قام [${user.name}] بمزامنة سجلاته الآن.`);
        res.json({ success: true }); 
    }
    else res.status(404).json({ error: "المستخدم غير موجود" });
});

app.post('/api/check-status', (req, res) => {
    const { names, requesterId } = req.body; 
    const response = { statuses: {}, requesterStatus: null };
    
    if (names && Array.isArray(names)) {
        names.forEach(n => {
            const found = db.users.find(u => u.name.toLowerCase() === n.toLowerCase() && u.type === 'debtor');
            response.statuses[n] = { registered: !!found, verified: found ? !!found.verified : false };
        });
    }
    
    if (requesterId) {
        const reqUser = db.users.find(u => u.id === requesterId);
        if (reqUser) response.requesterStatus = { verified: !!reqUser.verified };
    }
    
    res.json(response);
});

app.get('/api/auto-discover', (req, res) => {
    const { debtorName } = req.query;
    if(!debtorName) return res.json([]);
    
    const results = db.users.filter(u => u.type === 'merchant' && u.myRecords.some(r => r.targetName.toLowerCase() === debtorName.toLowerCase()))
    .map(u => ({ 
        merchantName: u.name, 
        merchantVerified: u.verified || false, 
        records: u.myRecords.filter(r => r.targetName.toLowerCase() === debtorName.toLowerCase()) 
    }));
    
    res.json(results);
});

app.listen(PORT, () => console.log(`🚀 HEIBA SYSTEM RUNNING ON PORT ${PORT}`));