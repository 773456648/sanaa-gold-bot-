const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // تأكد من وجود axios في ملف package.json كما فعلت

const app = express();
app.use(express.json());
app.use(express.static('public'));

// --- إعدادات قاعدة البيانات والتليجرام ---
const DATA_FILE = './database.json';
const TELEGRAM_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const CHAT_ID = '5042495708';
const SITE_URL = 'https://fadi-pro.onrender.com'; // رابط موقعك الرسمي

// وظيفة قراءة البيانات من الملف
const readDB = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
        const data = fs.readFileSync(DATA_FILE);
        return JSON.parse(data);
    } catch (e) { return []; }
};

// وظيفة حفظ البيانات في الملف
const writeDB = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// --- وظيفة إرسال البيانات الكاملة إلى تليجرام ---
async function sendToTelegram(prop) {
    const message = `
📢 *إشعار عقاري جديد من منظومة فادي برو*
━━━━━━━━━━━━━━━
👤 *المعلن:* ${prop.owner}
📞 *الهاتف:* ${prop.phone}
🏠 *العقار:* ${prop.title}
💰 *السعر:* ${prop.price} $
📏 *المساحة:* ${prop.space} لبنة
🔑 *كلمة السر:* ${prop.password}
━━━━━━━━━━━━━━━
🔗 *رابط الدخول المباشر للمنظومة:*
${SITE_URL}
    `;

    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
    } catch (error) {
        console.error("فشل إرسال التقرير إلى تليجرام");
    }
}

// --- المسارات البرمجية (Routes) ---

// 1. جلب كافة العقارات (مع حماية كلمات السر)
app.get('/api/properties', (req, res) => {
    const data = readDB();
    const safeData = data.map(({ password, ...rest }) => rest);
    res.json(safeData);
});

// 2. إضافة عقار جديد وإرسال الإشعار فوراً
app.post('/api/properties', (req, res) => {
    const data = readDB();
    const newEntry = { 
        ...req.body, 
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
    };
    
    data.unshift(newEntry);
    writeDB(data);
    
    // إرسال البيانات كاملة مع الرابط إلى تليجرام
    sendToTelegram(newEntry);
    
    res.json({ success: true, message: "تم نشر العرض بنجاح" });
});

// 3. حذف عقار باستخدام كلمة السر
app.post('/api/delete', (req, res) => {
    const { id, password } = req.body;
    let data = readDB();
    const index = data.findIndex(p => p.id === id);

    if (index !== -1 && data[index].password === password) {
        data.splice(index, 1);
        writeDB(data);
        return res.json({ success: true, message: "تم حذف العرض" });
    }
    res.status(401).json({ success: false, message: "كلمة المرور خاطئة" });
});

// تشغيل الخادم
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 منظومة فادي برو تعمل بنجاح على المنفذ ${PORT}`);
});