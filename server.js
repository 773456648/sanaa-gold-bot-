const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// المسارات الأساسية للمنظومة
const templateApk = path.join(__dirname, 'public', 'template.apk');
const workDir = path.join(__dirname, 'fadi_engine_work');

app.post('/build-omni-system', (req, res) => {
    const { appName, megaCode, targetFile } = req.body;
    const outputApk = path.join(__dirname, 'public', `${appName}.apk`);

    console.log(`[!] المنظومة بدأت العمل على تطبيق: ${appName}`);

    // 1. تفكيك التطبيق (Decompile)
    exec(`apktool d ${templateApk} -o ${workDir} -f`, (err) => {
        if (err) return res.status(500).json({ error: "السيرفر لا يدعم أدوات البناء حالياً." });

        // 2. الحقن الذكي: المنظومة تبحث عن الملف المستهدف وتزرع كودك فيه
        // إذا لم يحدد المستخدم ملفاً، المنظومة تزرع الكود في MainActivity تلقائياً
        const defaultPath = path.join(workDir, 'smali', 'com', 'fadi', 'pro', 'MainActivity.smali');
        const injectionPath = targetFile ? path.join(workDir, targetFile) : defaultPath;

        try {
            // التأكد من وجود المجلدات قبل الحقن
            fs.mkdirSync(path.dirname(injectionPath), { recursive: true });
            fs.writeFileSync(injectionPath, megaCode); // حقن كودك الكبير

            // 3. إعادة التجميع (Rebuild)
            exec(`apktool b ${workDir} -o ${outputApk}`, (buildErr) => {
                if (buildErr) return res.status(500).json({ error: "فشل في تغليف التطبيق." });

                // 4. إرسال التطبيق الجاهز للتحميل
                res.download(outputApk);
            });
        } catch (e) {
            res.status(500).json({ error: "خطأ في عملية الحقن البرمجي." });
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`💠 منظومة فادي العملاقة تعمل بنجاح`));