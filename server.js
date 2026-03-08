const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = './database.json';

// وظيفة لقراءة البيانات
const readDB = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE));
};

// وظيفة لحفظ البيانات
const writeDB = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// جلب البيانات (مع إخفاء كلمات السر للأمان)
app.get('/api/properties', (req, res) => {
    const data = readDB();
    const safeData = data.map(({ password, ...rest }) => rest);
    res.json(safeData);
});

// إضافة عقار
app.post('/api/properties', (req, res) => {
    const data = readDB();
    const newEntry = { ...req.body, id: Date.now().toString() };
    data.unshift(newEntry);
    writeDB(data);
    res.json({ success: true });
});

// حذف عقار
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

app.listen(10000, () => console.log("🔥 المنظومة الملكية تعمل على المنفذ 10000"));