const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.post('/build-fadi-system', (req, res) => {
    const { appName, megaCode } = req.body;
    const buildDir = path.join(__dirname, 'fadi_factory_auto');
    const outputApk = path.join(__dirname, 'public', `${appName}.apk`);

    // 1. المنظومة تخلق المجلدات وترتبها تلقائياً (بدون تدخل منك)
    const smaliDir = path.join(buildDir, 'smali/com/fadi/pro');
    fs.mkdirSync(smaliDir, { recursive: true });

    // 2. وضع الكود في مكانه الصحيح داخل الهيكل البرمجي
    fs.writeFileSync(path.join(smaliDir, 'MainActivity.smali'), megaCode);

    // 3. أمر التجميع النهائي (التغليف)
    // ملاحظة: يجب أن تكون أدوات apktool مثبتة على النظام ليعمل هذا الأمر
    exec(`apktool b ${buildDir} -o ${outputApk}`, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "فشل الترتيب التلقائي، السيرفر يحتاج أدوات البناء." });
        }
        // 4. إرسال التطبيق الجاهز للتحميل طوالى
        res.download(outputApk);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 منظومة فادي العملاقة جاهزة للعمل`));