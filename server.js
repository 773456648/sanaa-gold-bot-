const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.post('/build-mega-system', (req, res) => {
    const { appName, appUrl } = req.body;
    const inputApk = path.join(__dirname, 'public', 'template.apk');
    const workDir = path.join(__dirname, 'build_work');
    const finalApk = path.join(__dirname, 'public', `${appName}.apk`);

    // التأكد من وجود ملف القالب
    if (!fs.existsSync(inputApk)) {
        return res.status(404).json({ error: "خطأ: ملف template.apk غير موجود في مجلد public." });
    }

    console.log(`[!] بدء الهندسة العكسية للتطبيق: ${appName}`);

    // محاولة التفكيك والبناء (تتطلب Apktool مثبتة)
    exec(`apktool d ${inputApk} -o ${workDir} -f`, (err) => {
        if (err) {
            console.error("[-] فشل التفكيك: السيرفر يفتقر لأدوات Java/Apktool أو الذاكرة غير كافية.");
            return res.status(500).json({ error: "السيرفر لا يتحمل أدوات البناء الثقيلة." });
        }

        // هنا يتم حقن الرابط والاسم (تعديل ملفات الـ XML)
        console.log(`[+] جاري حقن البيانات: ${appUrl}`);
        
        exec(`apktool b ${workDir} -o ${finalApk}`, (buildErr) => {
            if (buildErr) return res.status(500).json({ error: "فشل في إعادة تجميع الملف." });
            
            console.log(`[✅] اكتمل البناء بنجاح!`);
            res.download(finalApk);
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 مصنع فادي "الحقيقي" يعمل على ${PORT}`));