const express = require('express');
const { IgApiClient } = require('instagram-private-api');
const { writeFileSync, readFileSync, existsSync } = require('fs');
const app = express();
const port = process.env.PORT || 10000;

const ig = new IgApiClient();

// بيانات الحساب مع كلمة السر الجديدة
const USERNAME = 'dvqkcaqnssa39';
const PASSWORD = 'god12god12';
const SESSION_PATH = './session.json';

let loginStatus = "⏳ جاري بدء النظام ومحاولة الدخول...";

// دالة لحفظ الجلسة
async function saveSession(data) {
    try {
        writeFileSync(SESSION_PATH, JSON.stringify(data));
    } catch (err) {
        console.error("Error saving session:", err);
    }
}

// دالة لقراءة الجلسة
function loadSession() {
    if (existsSync(SESSION_PATH)) {
        return JSON.parse(readFileSync(SESSION_PATH));
    }
    return null;
}

async function loginToInstagram() {
    try {
        // توليد هوية ثابتة للحساب لتجنب الشك
        ig.state.generateDevice(USERNAME);
        
        // التحقق مما إذا كانت هناك جلسة محفوظة للدخول طوالي
        const savedSession = loadSession();
        
        if (savedSession) {
            console.log("تم العثور على جلسة محفوظة، جاري الدخول المباشر...");
            await ig.state.deserialize(savedSession);
            
            // التحقق من أن الجلسة ما زالت صالحة
            const userInfo = await ig.user.info(ig.state.cookieUserId);
            loginStatus = `✅ تم الدخول المباشر (طوالي) بنجاح! المستخدم: ${userInfo.username}`;
            console.log(loginStatus);
        } else {
            console.log("لا توجد جلسة، جاري الدخول بكلمة السر...");
            await ig.simulate.preLoginFlow();
            
            // تسجيل الدخول
            const loggedInUser = await ig.account.login(USERNAME, PASSWORD);
            
            // محاكاة نشاط بعد الدخول
            process.nextTick(async () => await ig.simulate.postLoginFlow());
            
            // حفظ الجلسة لكي يدخل طوالي في المرات القادمة
            const serialized = await ig.state.serialize();
            delete serialized.constants;
            await saveSession(serialized);
            
            loginStatus = `✅ تم تسجيل الدخول بنجاح! المستخدم: ${loggedInUser.username}`;
            console.log(loginStatus);
        }
    } catch (error) {
        if (error.message.includes('checkpoint')) {
            loginStatus = "⚠️ تأكيد هوية: افتح إنستقرام من جوالك واضغط 'هذا أنا' (This was me) ليتمكن السيرفر من الدخول.";
        } else if (error.message.includes('password')) {
            loginStatus = "❌ خطأ: كلمة السر غير صحيحة. يرجى التأكد منها.";
        } else if (error.message.includes('rate_limit')) {
            loginStatus = "⏳ محاولات كثيرة: إنستقرام طلب الانتظار، سيحاول السيرفر لاحقاً.";
        } else {
            loginStatus = `❌ فشل الدخول: ${error.message}`;
        }
        console.error("Login Error:", error.message);
    }
}

// تشغيل دالة الدخول فور تشغيل السيرفر
loginToInstagram();

// صفحة الويب لعرض الحالة
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>مراقب الحساب النشط</title>
            <style>
                body { background: #0a0a0a; color: #f0f0f0; font-family: 'Segoe UI', Tahoma, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .container { background: #1a1a1a; padding: 40px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); text-align: center; border: 1px solid #333; max-width: 90%; width: 400px; }
                .status-icon { font-size: 60px; margin-bottom: 20px; }
                .status-text { font-size: 1.2em; margin: 20px 0; padding: 20px; border-radius: 12px; line-height: 1.6; font-weight: bold; }
                .success { background: rgba(46, 204, 113, 0.15); color: #2ecc71; border: 1px solid #2ecc71; }
                .error { background: rgba(231, 76, 60, 0.15); color: #e74c3c; border: 1px solid #e74c3c; }
                .warning { background: rgba(241, 196, 15, 0.15); color: #f1c40f; border: 1px solid #f1c40f; }
                button { background: #0095f6; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1em; transition: 0.3s; width: 100%; }
                button:hover { background: #0077c7; }
                .footer { margin-top: 25px; border-top: 1px solid #333; padding-top: 15px; color: #666; font-size: 0.9em; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="status-icon">${loginStatus.includes('✅') ? '🔓' : (loginStatus.includes('⚠️') ? '📱' : '⏳')}</div>
                <h2 style="margin: 0 0 10px 0;">نظام الربط بإنستقرام</h2>
                <div class="status-text ${loginStatus.includes('✅') ? 'success' : (loginStatus.includes('⚠️') ? 'warning' : 'error')}">
                    ${loginStatus}
                </div>
                <button onclick="location.reload()">🔄 تحديث حالة الاتصال</button>
                <div class="footer">
                    حساب: <strong>${USERNAME}</strong><br>
                    مراقب بواسطة UptimeRobot 🟢
                </div>
            </div>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`🚀 السيرفر يعمل بنجاح على المنفذ ${port}`);
});