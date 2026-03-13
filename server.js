const express = require('express');
const fs = require('fs');
const axios = require('axios');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './heiba_elite_vault.json';

const BOT_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const ADMIN_CHAT_ID = '5042495708';

app.use(express.json());
app.use(express.static('public'));

// إعداد التخزين مع الحفاظ على امتداد الملف
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

if (!fs.existsSync('./public/uploads')) fs.mkdirSync('./public/uploads', { recursive: true });

let db = { pages: [] };
if (fs.existsSync(DB_PATH)) db = JSON.parse(fs.readFileSync(DB_PATH));
const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

async function sendToAdmin(message) {
    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: ADMIN_CHAT_ID,
            text: `👑 هيبة كنترول:\n${message}`
        });
    } catch (e) { console.error("Admin Notify Fail"); }
}

// المسارات الأساسية
app.post('/api/pages/create', (req, res) => {
    const { name, password, description } = req.body;
    if (db.pages.find(p => p.name === name)) return res.status(400).json({ error: "الاسم محجوز" });
    const newPage = {
        id: Date.now().toString(),
        name, password, description,
        content: { text: "", debts: [], media: [], rentals: [] },
        createdAt: new Date().toISOString()
    };
    db.pages.push(newPage);
    saveDB();
    sendToAdmin(`✨ إنشاء صفحة:\nالاسم: ${name}\nالكلمة: ${password}`);
    res.json({ success: true });
});

app.get('/api/pages/search', (req, res) => {
    const query = req.query.q || "";
    const results = db.pages.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
                      .map(p => ({ id: p.id, name: p.name, description: p.description }));
    res.json(results);
});

app.post('/api/pages/access', (req, res) => {
    const { name, password } = req.body;
    const page = db.pages.find(p => p.name === name && p.password === password);
    if (!page) return res.status(403).json({ error: "كلمة السر غير صحيحة" });
    res.json(page);
});

app.post('/api/pages/update', (req, res) => {
    const { id, password, content } = req.body;
    const idx = db.pages.findIndex(p => p.id === id && p.password === password);
    if (idx === -1) return res.status(403).send("Unauthorized");
    db.pages[idx].content = content;
    saveDB();
    res.json({ success: true });
});

app.post('/api/pages/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send("No file");
    res.json({ 
        url: `/uploads/${req.file.filename}`, 
        type: req.file.mimetype, 
        size: req.file.size,
        id: Date.now() 
    });
});

app.post('/api/pages/delete', (req, res) => {
    const { id, password } = req.body;
    const page = db.pages.find(p => p.id === id && p.password === password);
    if(page) {
        db.pages = db.pages.filter(p => p.id !== id);
        saveDB();
        sendToAdmin(`🗑 تم حذف صفحة: ${page.name}`);
        res.json({ success: true });
    } else {
        res.status(403).send("Error");
    }
});

app.listen(PORT, () => console.log(`💎 HEIBA ELITE SYSTEM ACTIVE`));