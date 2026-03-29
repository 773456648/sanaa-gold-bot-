const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// كلمة السر للدخول
const SYSTEM_PASSWORD = '771232690';

app.use(express.json());
app.use(express.static('public'));

app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === SYSTEM_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'كلمة السر خاطئة' });
    }
});

// توفير رابط للمتصفح - سنستخدم خدمة تتوافق مع السيرفرات
app.get('/api/browser-config', (req, res) => {
    res.json({ 
        // سنحاول توجيهه للمنفذ المخصص للواجهة الرسومية
        browserUrl: `https://${req.get('host')}/browser/`,
        status: 'Online' 
    });
});

app.listen(PORT, () => {
    console.log(`System is active on port ${PORT}`);
});