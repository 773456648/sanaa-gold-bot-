const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// إعدادات تيليجرام
const TELEGRAM_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const MY_CHAT_ID = '5042495708';
const ADMIN_PASSWORD = '771232690';

// مسار قاعدة البيانات
const DB_PATH = './radar_db.json';
let db = { users: [], bumps: [] };
let writeLock = false; // قفل بسيط لمنع الكتابة المتزامنة

// تحميل قاعدة البيانات
if (fs.existsSync(DB_PATH)) {
    try {
        db = JSON.parse(fs.readFileSync(DB_PATH));
        if (!db.bumps) db.bumps = [];
    } catch (e) {
        db = { users: [], bumps: [] };
    }
}

// حفظ قاعدة البيانات مع قفل
async function saveDB() {
    while (writeLock) await new Promise(r => setTimeout(r, 10));
    writeLock = true;
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    } finally {
        writeLock = false;
    }
}

// تخزين المستخدمين المتصلين مؤقتاً
let onlineUsers = [];

// دالة إرسال رسالة إلى تيليجرام
async function sendToTelegram(message) {
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: MY_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
    } catch (e) {
        console.error('Telegram error:', e.message);
    }
}

// إرسال نسخة احتياطية (ملف قاعدة البيانات)
let lastBackupMessageId = null;
async function sendBackup(caption = '📦 نسخة احتياطية لقاعدة بيانات الرادار') {
    try {
        if (lastBackupMessageId) {
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/deleteMessage`, {
                chat_id: MY_CHAT_ID,
                message_id: lastBackupMessageId
            }).catch(() => {});
        }
        const form = new FormData();
        form.append('chat_id', MY_CHAT_ID);
        form.append('caption', caption);
        form.append('document', fs.createReadStream(DB_PATH));
        const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`, form, {
            headers: form.getHeaders()
        });
        if (response.data && response.data.result) {
            lastBackupMessageId = response.data.result.message_id;
        }
    } catch (e) {
        console.error('Backup error:', e.message);
    }
}

// إرسال نسخة احتياطية كل ساعة
setInterval(() => sendBackup('📦 نسخة احتياطية دورية'), 60 * 60 * 1000);

// Middleware
app.use(express.json());
app.use(express.static('public')); // المجلد الذي يحتوي على index.html

// ======================= واجهات برمجية =======================

// تسجيل الدخول / إنشاء حساب
app.post('/api/auth', async (req, res) => {
    const { name, password, type, action } = req.body;
    if (!name || !password || !type) {
        return res.status(400).json({ error: 'بيانات ناقصة' });
    }
    const normalizedName = name.trim().toLowerCase();
    const existingUser = db.users.find(u => u.name.toLowerCase() === normalizedName && u.type === type);

    if (action === 'reg') {
        if (existingUser) {
            return res.status(400).json({ error: 'الاسم مسجل مسبقاً' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: 'R' + Math.random().toString(36).substr(2, 7),
            name: name.trim(),
            password: hashedPassword,
            type,
            createdAt: new Date().toISOString()
        };
        db.users.push(newUser);
        await saveDB();
        sendToTelegram(`✨ *تسجيل مستخدم جديد*\nالاسم: ${newUser.name}\nالنوع: ${type === 'merchant' ? 'راصد' : 'سائق'}`);
        // لا نرسل كلمة المرور في الرد
        const { password: _, ...safeUser } = newUser;
        return res.json(safeUser);
    } else {
        // تسجيل الدخول
        if (!existingUser) {
            return res.status(403).json({ error: 'الاسم غير موجود' });
        }
        const match = await bcrypt.compare(password, existingUser.password);
        if (!match) {
            return res.status(403).json({ error: 'كلمة المرور خاطئة' });
        }
        const { password: _, ...safeUser } = existingUser;
        return res.json(safeUser);
    }
});

// جلب جميع المطبات
app.get('/api/bumps', (req, res) => {
    res.json(db.bumps);
});

// إضافة مطب جديد
app.post('/api/add-bump', async (req, res) => {
    const { lat, lng, userId, userName } = req.body;
    if (!lat || !lng || !userId || !userName) {
        return res.status(400).json({ error: 'بيانات غير كاملة' });
    }
    // التحقق من وجود المستخدم
    const user = db.users.find(u => u.id === userId);
    if (!user) {
        return res.status(403).json({ error: 'مستخدم غير مصرح به' });
    }
    const userBumpsCount = db.bumps.filter(b => b.recorderId === userId).length + 1;
    const newBump = {
        id: Date.now(),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        recorderId: userId,
        recorderName: userName,
        recorderTotal: userBumpsCount,
        timestamp: new Date().toISOString()
    };
    db.bumps.push(newBump);
    await saveDB();

    // إرسال إشعار تيليجرام
    const tgMsg = `🚨 *تم رصد مطب جديد!*\n\n📍 الإحداثيات: \`${lat}, ${lng}\`\n👤 الراصد: *${userName}*\n📈 إجمالي المطبات التي رصدها: ${userBumpsCount}\n\n[🔗 فتح على الخريطة](https://www.google.com/maps/search/?api=1&query=${lat},${lng})`;
    sendToTelegram(tgMsg);

    res.json({ success: true, bump: newBump });
});

// تحديث المستخدمين المتصلين
app.post('/api/users-online', (req, res) => {
    const { userId, name, type, loc } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId مطلوب' });
    const now = Date.now();
    // إزالة المستخدمين الذين لم يتم تحديثهم منذ 30 ثانية
    onlineUsers = onlineUsers.filter(u => now - u.lastSeen < 30000);
    const existing = onlineUsers.find(u => u.userId === userId);
    if (existing) {
        existing.name = name || existing.name;
        existing.type = type || existing.type;
        existing.loc = loc || existing.loc;
        existing.lastSeen = now;
    } else {
        onlineUsers.push({ userId, name, type, loc, lastSeen: now });
    }
    // إرجاع القائمة الكاملة
    res.json(onlineUsers);
});

// Webhook لتلقي أوامر تيليجرام
app.post('/api/tg-webhook', async (req, res) => {
    const update = req.body;
    if (!update.message) return res.sendStatus(200);

    // استعادة نسخة احتياطية من ملف مرفق
    if (update.message.document && update.message.document.file_name === 'radar_db.json') {
        const fileId = update.message.document.file_id;
        try {
            const fileInfo = await axios.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${fileId}`);
            const filePath = fileInfo.data.result.file_path;
            const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;
            const response = await axios.get(fileUrl, { responseType: 'stream' });
            const writer = fs.createWriteStream(DB_PATH);
            response.data.pipe(writer);
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            // إعادة تحميل قاعدة البيانات
            const newDb = JSON.parse(fs.readFileSync(DB_PATH));
            db = newDb;
            if (!db.bumps) db.bumps = [];
            sendToTelegram('✅ تم استعادة قاعدة البيانات بنجاح');
        } catch (e) {
            sendToTelegram('❌ فشل استعادة قاعدة البيانات');
        }
        return res.sendStatus(200);
    }

    // أوامر نصية
    if (!update.message.text) return res.sendStatus(200);
    const chatId = String(update.message.chat.id);
    const fullText = update.message.text.trim();
    if (chatId !== MY_CHAT_ID || !fullText.startsWith(ADMIN_PASSWORD)) {
        return res.sendStatus(200);
    }

    const cmd = fullText.substring(ADMIN_PASSWORD.length).trim();
    if (cmd === 'البيانات') {
        await sendBackup('📦 نسخة بناءً على طلبك');
    } else if (cmd === 'العدد') {
        await sendToTelegram(`📊 *الإحصائيات*\n👥 المستخدمون: ${db.users.length}\n⚠️ المطبات: ${db.bumps.length}`);
    } else if (cmd === 'نظف') {
        // حذف المستخدمين غير النشطين (اختياري)
        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const oldUsers = db.users.filter(u => new Date(u.createdAt).getTime() < cutoff);
        if (oldUsers.length) {
            db.users = db.users.filter(u => new Date(u.createdAt).getTime() >= cutoff);
            await saveDB();
            sendToTelegram(`🧹 تم حذف ${oldUsers.length} مستخدم قديم`);
        } else {
            sendToTelegram('لا يوجد مستخدمين قديمين للحذف');
        }
    }
    res.sendStatus(200);
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`🚀 RADAR SYSTEM running on port ${PORT}`);
    // إرسال إشعار بدء التشغيل
    sendToTelegram('🟢 نظام الرادار قيد التشغيل');
});