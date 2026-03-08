const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.post('/build-mega-system', (req, res) => {
    const { appName, megaCode } = req.body;
    const templateApk = path.join(__dirname, 'public', 'template.apk');
    const workDir = path.join(__dirname, 'factory_work');
    const outputApk = path.join(__dirname, 'public', `${appName}.apk`);

    console.log(`[!] جاري فك التطبيق وحقن الكود لـ: ${appName}`);

    // 1. تفكيك الملف (Decompile)
    exec(`apktool d ${templateApk} -o ${workDir} -f`, (err) => {
        if (err) return res.status(500).json({ error: "السيرفر لا يدعم أدوات الفتح (Java/Apktool غير متوفرة)." });

        // 2. حقن الكود الكبير حقك داخل ملف البرمجة (Smali)
        // بنغير ملف الـ MainActivity عشان يشتغل كودك طوالي
        const targetSmali = path.join(workDir, 'smali', 'com', 'fadi', 'pro', 'MainActivity.smali');
        
        // إذا المسار موجود، بنحط كودك الكبير مكانه
        if (fs.existsSync(targetSmali)) {
            fs.writeFileSync(targetSmali, megaCode);
        }

        // 3. إعادة التجميع (Rebuild)
        exec(`apktool b ${workDir} -o ${outputApk}`, (buildErr) => {
            if (buildErr) return res.status(500).json({ error: "فشل إعادة البناء." });
            
            // 4. إرسال الملف النهائي
            res.download(outputApk);
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 مصنع فادي برو جاهز على المنفذ ${PORT}`));