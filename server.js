const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static('public'));

// مخزن العقارات العام (أي واحد يضيف يظهر هنا)
let globalProperties = [
    { title: "عمارة فادي برو - المركز الرئيسي", price: "مساحة واسعة", space: "100 لبنة", type: "للإيجار", icon: "fa-city", color: "#ffd700" }
];

// طريق لجلب كل العقارات
app.get('/api/properties', (req, res) => {
    res.json(globalProperties);
});

// طريق لإضافة عقار جديد يظهر للكل
app.post('/api/properties', (req, res) => {
    const newProp = req.body;
    globalProperties.push(newProp);
    res.json({ success: true });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(10000, () => {
    console.log('سيرفر منظومة فادي العالمية شغال على منفذ 10000');
});