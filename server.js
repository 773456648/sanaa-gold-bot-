const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// إعدادات الخادم للتعامل مع البيانات بصيغة JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// مصفوفة لتخزين الإعلانات مؤقتاً في الذاكرة (يمكن استبدالها بقاعدة بيانات لاحقاً)
let ads = [
    { 
        id: 1, 
        category: 'real-estate', 
        title: 'عمارة سكنية 4 أدوار', 
        price: '500,000', 
        seller: 'أحمد علي', 
        phone: '777000111', 
        desc: 'موقع استراتيجي، تشطيب سوبر لوكس، مساحة واسعة.' 
    }
];

// تقديم الملفات الساكنة (ملف HTML الخاص بك)
app.use(express.static(path.join(__dirname, 'public')));

// جلب جميع الإعلانات
app.get('/api/ads', (req, res) => {
    res.json(ads);
});

// إضافة إعلان جديد
app.post('/api/ads', (req, res) => {
    const newAd = {
        id: Date.now(),
        ...req.body
    };
    ads.unshift(newAd);
    res.status(201).json({ message: 'تم إضافة الإعلان بنجاح في سوق فادي', ad: newAd });
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`----------------------------------------`);
    console.log(`سوق فادي يعمل الآن على: http://localhost:${PORT}`);
    console.log(`تم التصميم والبرمجة بواسطة: فادي`);
    console.log(`----------------------------------------`);
});