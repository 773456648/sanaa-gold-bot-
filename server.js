const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static('public'));

// مخزن العقارات العالمي - يبدأ بصفحة فاضية تماماً
let sharedProperties = [];

// جلب كل العقارات المضافة من قبل المستخدمين
app.get('/api/properties', (req, res) => {
    res.json(sharedProperties);
});

// إضافة عقار جديد ونشره للكل لحظياً
app.post('/api/properties', (req, res) => {
    const prop = req.body;
    prop.id = Date.now(); // معرف فريد لكل عقار
    sharedProperties.unshift(prop); // يخلي الجديد يظهر أول واحد فوق
    console.log("تم إضافة عقار جديد للمنظومة");
    res.json({ success: true });
});

// تشغيل الواجهة الرئيسية
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// تشغيل المنظومة على منفذ 10000 (مناسب لـ Render)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`المنظومة العالمية شغالة وجاهزة للعمل على منفذ ${PORT}`);
});