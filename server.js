const express = require('express');
const { IgApiClient } = require('instagram-private-api');
const app = express();
const port = process.env.PORT || 3000;

const ig = new IgApiClient();

// بيانات الحساب
const USERNAME = 'dvqkcaqnssa39';
const PASSWORD = 'god12god1';

let loginStatus = "جاري محاولة تسجيل الدخول...";

async function loginToInstagram() {
    try {
        ig.state.generateDevice(USERNAME);
        
        // محاكاة الخطوات الأولية لتجنب اكتشاف البوت
        await ig.simulate.preLoginFlow();
        
        console.log("Attempting login...");
        const loggedInUser = await ig.account.login(USERNAME, PASSWORD);
        
        // إذا نجح الدخول
        loginStatus = `✅ تم الدخول بنجاح! اسم المستخدم: ${loggedInUser.username}`;
        console.log(loginStatus);
        
        // محاكاة نشاط بعد الدخول لثبيت الجلسة
        process.nextTick(async () => await ig.simulate.postLoginFlow());
        
    } catch (error) {
        if (error.message.includes('checkpoint')) {
            loginStatus = "⚠️ إنستقرام يطلب تأكيد الهوية. افتح تطبيق إنستقرام في جوالك واضغط 'هذا أنا' (This was me).";
        } else if (error.message.includes('Facebook')) {
            loginStatus = "❌ خطأ: إنستقرام يطلب الدخول عبر فيسبوك. حاول تسجيل الدخول من متصفح عادي في السيرفر أولاً أو قم بإلغاء ربط فيسبوك مؤقتاً.";
        } else {
            loginStatus = `❌ فشل تسجيل الدخول: ${error.message}`;
        }
        console.error("Login Error:", error.message);
    }
}

// محاولة الدخول
loginToInstagram();

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <style>
                body { background-color: #000; color: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding-top: 50px; }
                .container { border: 1px solid #333; padding: 30px; display: inline-block; border-radius: 15px; background: #111; max-width: 80%; }
                .status-box { margin-top: 20px; padding: 15px; border-radius: 8px; font-weight: bold; font-size: 1.2em; }
                .success { border: 1px solid green; color: #4CAF50; }
                .error { border: 1px solid red; color: #f44336; }
                .warning { border: 1px solid orange; color: #ff9800; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>مراقب حساب إنستقرام</h1>
                <hr style="border-color: #222;">
                <p>حالة الحساب الآن:</p>
                <div class="status-box ${loginStatus.includes('✅') ? 'success' : (loginStatus.includes('⚠️') ? 'warning' : 'error')}">
                    ${loginStatus}
                </div>
                <p style="color: #666; font-size: 0.9em; margin-top: 20px;">.هذا السيرفر يعمل الآن لضمان بقاء حسابك نشطاً</p>
                <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; cursor: pointer;">تحديث الحالة</button>
            </div>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});