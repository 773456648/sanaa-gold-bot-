const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.post('/build-mega-system', (req, res) => {
    const { appName, appUrl } = req.body;
    const templateApk = path.join(__dirname, 'public', 'template.apk');
    const decompiledDir = path.join(__dirname, 'temp_build');
    const finalApk = path.join(__dirname, 'public', `${appName}_Built.apk`);

    console.log(`[!] بدء فتح ملف template.apk وتعديله...`);

    // الخطوة 1: تفكيك الـ APK (Decompile)
    exec(`apktool d ${templateApk} -o ${decompiledDir} -f`, (err) => {
        if (err) {
            console.error("[-] فشل فتح الملف. تأكد من وجود Apktool و Java.");
            return res.status(500).json({ error: "السيرفر لا يدعم أدوات التعديل الحقيقية (نقص Java/Apktool)." });
        }

        // الخطوة 2: تعديل الأكواد (حقن البيانات)
        // سنعدل اسم التطبيق داخل ملف strings.xml
        const stringsXml = path.join(decompiledDir, 'res', 'values', 'strings.xml');
        if (fs.existsSync(stringsXml)) {
            let data = fs.readFileSync(stringsXml, 'utf8');
            data = data.replace(/<string name="app_name">.*?<\/string>/, `<string name="app_name">${appName}</string>`);
            fs.writeFileSync(stringsXml, data);
            console.log(`[+] تم تغيير اسم التطبيق في الأكواد إلى: ${appName}`);
        }

        // الخطوة 3: إعادة تجميع الملف (Rebuild)
        exec(`apktool b ${decompiledDir} -o ${finalApk}`, (buildErr) => {
            if (buildErr) return res.status(500).json({ error: "فشل إعادة التجميع." });

            console.log(`[✅] تم التعديل والبناء بنجاح!`);
            res.download(finalApk);
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 مصنع التعديل الحقيقي جاهز`));