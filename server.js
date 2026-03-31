const express = require('express');
const { IgApiClient } = require('instagram-private-api');
const app = express();
// Render يستخدم المنفذ 10000 عادةً أو المتغير البيئي PORT
const port = process.env.PORT || 10000;

const ig = new IgApiClient();

// بيانات الحساب
const USERNAME = 'dvqkcaqnssa39';
const PASSWORD = 'god12god12';

let loginStatus = "⏳ جاري محاولة تسجيل الدخول...";
let lastCheck = "لم يتم الفحص بعد";

async function loginToInstagram() {
    try {
        // توليد هوية جهاز عشوائية فريدة لكل مرة لضمان عدم الحظر
        ig.state.generateDevice(USERNAME);
        
        // محاكاة الخطوات الطبيعية للتطبيق
        await ig.simulate.preLoginFlow();
        
        console.log(`محاولة الدخول للحساب: ${USERNAME}`);
        
        // محاولة الدخول
        const loggedInUser = await ig.account.login(USERNAME, PASSWORD);
        
        // محاكاة نشاط بعد الدخول لضمان استقرار الجلسة
        process.nextTick(async () => await ig.simulate.postLoginFlow());
        
        loginStatus = `✅ تم الدخول بنجاح! الحساب: ${loggedInUser.username}`;
        lastCheck = new Date().toLocaleString('ar-YE');
        console.log(loginStatus);
        
    } catch (error) {
        if (error.message.includes('checkpoint')) {
            loginStatus = "⚠️ تأكيد هوية مطلوب: افتح تطبيق إنستقرام في جوالك واضغط على زر 'هذا أنا' (This was me).";
        } else if (error.message.includes('bad_password')) {
            loginStatus = "❌ خطأ: كلمة السر غير صحيحة. يرجى التأكد منها.";
        } else if (error.message.includes('rate_limit')) {
            loginStatus = "⏳ محاولات كثيرة: إنستقرام طلب الانتظار قليلاً. سيحاول السيرفر لاحقاً.";
        } else {
            loginStatus = `❌ فشل الدخول: ${error.message}`;
        }
        lastCheck = new Date().toLocaleString('ar-YE');
        console.error("Login Error:", error.message);
    }
}

// تنفيذ الدخول عند بدء التشغيل
loginToInstagram();

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>مراقب الحساب النشط</title>
            <style>
                body { background: #121212; color: #fff; font-family: 'Segoe UI', Tahoma, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .container { background: #1e1e1e; padding: 30px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.7); text-align: center; border: 1px solid #333; max-width: 90%; }
                .status-icon { font-size: 50px; margin-bottom: 10px; }
                .status-text { font-size: 1.3em; margin: 15px 0; padding: 15px; border-radius: 10px; line-height: 1.6; }
                .success { background: rgba(76, 175, 80, 0.1); color: #4caf50; border: 1px solid #4caf50; }
                .error { background: rgba(244, 67, 54, 0.1); color: #f44336; border: 1px solid #f44336; }
                .warning { background: rgba(255, 152, 0, 0.1); color: #ff9800; border: 1px solid #ff9800; }
                .info { color: #888; font-size: 0.9em; }
                button { background: #0095f6; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; transition: 0.3s; }
                button:hover { background: #0077c7; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="status-icon">${loginStatus.includes('✅') ? '🚀' : '⚙️'}</div>
                <h2>مراقب نظام الدخول</h2>
                <div class="status-text ${loginStatus.includes('✅') ? 'success' : (loginStatus.includes('⚠️') ? 'warning' : 'error')}">
                    ${loginStatus}
                </div>
                <p class="info">آخر فحص: ${lastCheck}</p>
                <button onclick="location.reload()">تحديث الحالة الآن</button>
                <div style="margin-top: 20px; border-top: 1px solid #333; padding-top: 15px;">
                    <small style="color: #555;">مراقب بواسطة UptimeRobot</small>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Server started successfully on port ${port}`);
});