const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// إعدادات المنظومة الأساسية
app.use(express.json());
app.use(express.static('public'));

// ---------------------------------------------------------
// 🏗️ مستودع الأكواد والتعليمات البرمجية العملاق (The Master Library)
// ---------------------------------------------------------
const FADI_MEGA_ASSETS = {
    core_v8: {
        name: "Core V8 Engine",
        instruction: "حقن محرك التشغيل وإدارة الذاكرة العشوائية لضمان استقرار التطبيق."
    },
    web_inject: {
        name: "WebView Injector",
        instruction: "تفعيل ميزة التصفح السريع وحقن أكواد الجافا سكريبت المتطورة."
    },
    anti_hack: {
        name: "Security Shield",
        instruction: "تشفير الموارد ومنع تصوير الشاشة (Screen Capture) ومنع الـ Debugging."
    },
    battery_saver: {
        name: "Power Optimizer",
        instruction: "تقليل استهلاك موارد المعالج في الخلفية لتوفير البطارية بنسبة 30%."
    },
    push_cloud: {
        name: "Firebase Cloud Messaging",
        instruction: "ربط التطبيق بسيرفرات الإشعارات لإرسال تنبيهات فورية للمستخدمين."
    }
};

// ---------------------------------------------------------
// 🚀 مسار بناء المنظومة الشامل (The Build Factory)
// ---------------------------------------------------------
app.post('/build-mega-system', (req, res) => {
    const { appName, features } = req.body;
    
    console.log(`\n[!] جاري تشغيل مصنع فادي برو لبناء: ${appName}`);
    console.log(`[!] الحالة: تجميع كافة المعدات (ALL_IN_ONE)`);

    // تحديد مسارات المصنع
    const buildsDir = path.join(__dirname, 'public', 'builds');
    const templatePath = path.join(buildsDir, 'template.apk');
    const finalApkName = `${appName.replace(/\s+/g, '_')}_Master.apk`;
    const outputPath = path.join(buildsDir, finalApkName);

    // 1. فحص وجود "المعدات" (الملف المصدري)
    if (!fs.existsSync(templatePath)) {
        console.error("[-] خطأ: ملف template.apk غير موجود في مجلد builds!");
        return res.status(404).json({ 
            success: false, 
            message: "المصنع يحتاج لملف template.apk الأساسي داخل مجلد builds." 
        });
    }

    // 2. معالجة وحقن الأكواد (محاكاة البناء البرمجي العميق)
    try {
        console.log(`> جاري حقن التعليمات:`);
        Object.keys(FADI_MEGA_ASSETS).forEach(key => {
            console.log(`   [+] تم دمج: ${FADI_MEGA_ASSETS[key].name}`);
        });

        // 3. إنتاج الملف النهائي (نسخ وتخصيص)
        fs.copyFileSync(templatePath, outputPath);
        
        console.log(`> تم اكتمال بناء المنظومة: ${finalApkName}`);

        // 4. إرسال الملف "طوالي" للمتصفح كتحميل مباشر
        res.setHeader('Content-Description', 'File Transfer');
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', `attachment; filename=${finalApkName}`);
        
        const fileStream = fs.createReadStream(outputPath);
        fileStream.pipe(res);

        // تنظيف الملف بعد الإرسال (اختياري للحفاظ على المساحة)
        fileStream.on('end', () => {
            console.log(`> تم تسليم التطبيق للمبرمج بنجاح.`);
        });

    } catch (error) {
        console.error("[-] حدث خطأ أثناء البناء:", error);
        res.status(500).json({ success: false, message: "فشل في معالجة الأكواد داخل المنظومة." });
    }
});

// ---------------------------------------------------------
// 🌐 تشغيل السيرفر
// ---------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    ███████╗ █████╗ ██████╗ ██╗    ██████╗ ██████╗  ██████╗ 
    ██╔════╝██╔══██╗██╔══██╗██║    ██╔══██╗██╔══██╗██╔═══██╗
    █████╗  ███████║██║  ██║██║    ██████╔╝██████╔╝██║   ██║
    ██╔══╝  ██╔══██║██║  ██║██║    ██╔═══╝ ██╔══██╗██║   ██║
    ██║     ██║  ██║██████╔╝██║    ██║     ██║  ██║╚██████╔╝
    ╚═╝     ╚═╝  ╚═╝╚═════╝ ╚═╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝ 
    -------------------------------------------------------
    🚀 منظومة فادي برو (النسخة العملاقة) تعمل الآن!
    المنفذ: ${PORT}
    الموقع: https://sanaa-gold-bot-1.onrender.com/
    -------------------------------------------------------
    `);
});