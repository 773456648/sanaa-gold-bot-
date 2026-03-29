const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// كلمة السر للدخول للنظام (نفس منطق الكود القديم الخاص بك)
const SYSTEM_PASSWORD = '771232690';

app.use(express.json());
app.use(express.static('public'));

// مسار تسجيل الدخول
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === SYSTEM_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'كلمة السر خاطئة' });
    }
});

// مسار جلب بيانات المتصفح (الآي بي والمنفذ)
app.get('/api/browser-config', (req, res) => {
    // المنفذ 5800 هو المنفذ الافتراضي لواجهة المتصفح الرسومية
    res.json({ 
        browserUrl: `http://${req.hostname}:5800`,
        status: 'Online' 
    });
});

app.listen(PORT, () => {
    console.log(`[System] Cloud Browser Manager running on port ${PORT}`);
});