const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static('public')); // مجلد الواجهة

// نقطة بناء التطبيق
app.post('/build', (req, res) => {
    const { appName, appUrl } = req.body;
    const buildId = Date.now();
    const apkPath = `./builds/app-${buildId}.apk`;

    console.log(`بدء بناء تطبيق: ${appName}`);

    // الأوامر البرمجية لبناء APK حقيقي (نستخدم Capacitor كمثال)
    // ملاحظة: السيرفر لازم يكون فيه Android SDK مثبت
    const command = `npx cap copy && cd android && ./gradlew assembleDebug && cp app/build/outputs/apk/debug/app-debug.apk .${apkPath}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`خطأ: ${error}`);
            return res.status(500).json({ success: false, message: "فشل البناء" });
        }
        
        // إرسال رابط التحميل المباشر للمنصة
        res.json({ success: true, downloadUrl: `/download/app-${buildId}.apk` });
    });
});

// رابط تحميل الملف
app.get('/download/:filename', (req, res) => {
    const file = path.join(__dirname, 'builds', req.params.filename);
    res.download(file);
});

app.listen(3000, () => console.log('منصة فادي برو تعمل على منفذ 3000'));