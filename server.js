const express = require('express');
const { IgApiClient } = require('instagram-private-api');
const app = express();
const port = process.env.PORT || 10000;

const ig = new IgApiClient();

// بيانات حسابك
const USERNAME = 'dvqkcaqnssa39';
const PASSWORD = 'god12god1';

let loginStatus = "جاري محاولة تسجيل الدخول...";

async function loginToInstagram() {
    try {
        // توليد هوية جهاز أندرويد حقيقية لتجنب اكتشاف البوت
        ig.state.generateDevice(USERNAME);
        
        // محاكاة الخطوات التي يقوم بها التطبيق قبل تسجيل الدخول
        await ig.simulate.preLoginFlow();
        
        console.log("Attempting login for " + USERNAME);
        
        // محاولة تسجيل الدخول
        const loggedInUser = await ig.account.login(USERNAME, PASSWORD);
        
        // محاكاة الخطوات بعد الدخول لضمان استقرار الجلسة
        process.nextTick(async () => await ig.simulate.postLoginFlow());
        
        loginStatus = `✅ تم الدخول بنجاح! المستخدم: ${loggedInUser.username}`;
        console.log(loginStatus);
        
    } catch (error) {
        if (error.message.includes('Facebook')) {
            loginStatus = "❌ إنستقرام يطلب الدخول عبر فيسبوك. الحل: اذهب لإعدادات إنستقرام من جوالك وافصل ربط فيسبوك (Unlink Facebook) ثم أعد تشغيل السيرفر.";
        } else if (error.message.includes('checkpoint')) {
            loginStatus = "⚠️ تأكيد هوية مطلوب: افتح إنستقرام من جوالك واضغط على 'هذا أنا'.";
        } else {
            loginStatus = `❌ فشل تسجيل الدخول: ${error.message}`;
        }
        console.error("Error Detail:", error.message);
    }
}

// تنفيذ الدخول
loginToInstagram();

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>حالة بوت إنستقرام</title>
            <style>
                body { background-color: #0e0e0e; color: #e0e0e0; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .card { background: #1a1a1a; padding: 40px; border-radius: 20px; border: 1px solid #333; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); max-width: 400px; }
                .status { padding: 15px; border-radius: 10px; margin-top: 20px; font-weight: bold; border: 1px solid; }
                .success { border-color: #2ecc71; color: #2ecc71; background: rgba(46, 204, 113, 0.1); }
                .error { border-color: #e74c3c; color: #e74c3c; background: rgba(231, 76, 60, 0.1); }
                .warning { border-color: #f1c40f; color: #f1c40f; background: rgba(241, 196, 15, 0.1); }
                button { background: #333; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>مراقب الحساب 🤖</h2>
                <p>حساب: <strong>${USERNAME}</strong></p>
                <div class="status ${loginStatus.includes('✅') ? 'success' : (loginStatus.includes('⚠️') ? 'warning' : 'error')}">
                    ${loginStatus}
                </div>
                <button onclick="location.reload()">تحديث الحالة</button>
                <p style="font-size: 0.8em; color: #555; margin-top: 20px;">سيظل UptimeRobot يراقب هذا الرابط لإبقاء الجلسة نشطة.</p>
            </div>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});