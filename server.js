const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static('public'));

// مخزن العقارات العالمي
let sharedProperties = [];

// جلب كل العقارات
app.get('/api/properties', (req, res) => {
    res.json(sharedProperties);
});

// إضافة عقار جديد مع كلمة السر
app.post('/api/properties', (req, res) => {
    const prop = req.body;
    prop.id = Date.now().toString(); // معرف فريد نصي
    sharedProperties.unshift(prop); // الجديد يظهر أولاً
    res.json({ success: true });
});

// ميزة الحذف بكلمة السر
app.post('/api/delete', (req, res) => {
    const { id, password } = req.body;
    const index = sharedProperties.findIndex(p => p.id === id);

    if (index !== -1) {
        if (sharedProperties[index].password === password) {
            sharedProperties.splice(index, 1); // الحذف من المصفوفة
            return res.json({ success: true });
        } else {
            return res.json({ success: false, message: "كلمة السر غلط" });
        }
    }
    res.json({ success: false, message: "العقار غير موجود" });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`المنظومة شغالة على منفذ ${PORT}`);
});