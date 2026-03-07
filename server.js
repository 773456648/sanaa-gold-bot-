const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static('public'));

// مخزن العقارات العالمي (في ذاكرة السيرفر)
let sharedProperties = [
    { title: "برج فادي الاستثماري", price: 1000000, space: 50, type: "للبيع", category: "building", owner: "المدير فادي", date: "2026-03-08" }
];

app.get('/api/properties', (req, res) => res.json(sharedProperties));

app.post('/api/properties', (req, res) => {
    const prop = req.body;
    prop.id = Date.now(); // معرف فريد
    sharedProperties.unshift(prop); // إضافة الجديد في البداية
    res.json({ success: true });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`المنظومة العالمية شغالة على منفذ ${PORT}`));