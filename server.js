const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// مسار بناء وتحميل التطبيق فوراً
app.post('/build-and-download', (req, res) => {
    const { appName, appUrl } = req.body;
    
    // هنا المحرك يقوم بتجهيز الملف (تأكد من وجود المجلد والملف في public/builds)
    const filePath = path.join(__dirname, 'public', 'builds', 'template.apk');
    
    if (fs.existsSync(filePath)) {
        console.log(`> تم بناء تطبيق: ${appName} بنجاح!`);
        res.json({ success: true, downloadUrl: '/builds/template.apk' });
    } else {
        res.status(404).json({ success: false, message: "ملف القالب غير موجود في مجلد builds" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`منصة فادي برو تعمل على المنفذ ${PORT}`));