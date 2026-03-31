const express = require('express');
const { IgApiClient } = require('instagram-private-api');
const { writeFileSync, readFileSync, existsSync } = require('fs');
const app = express();
const port = process.env.PORT || 10000;

const ig = new IgApiClient();

// بياناتك الصحيحة 100%
const USERNAME = 'dvqkcaqnssa39';
const PASSWORD = 'god12god12';
const SESSION_PATH = './session.json';

let loginStatus = "⏳ جاري تهيئة النظام وتخطي الحماية...";
let rawErrorDetails = "لا يوجد أخطاء حالياً.";

// تأخير زمني لخداع إنستقرام (كأنه إنسان يكتب)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function loadSession() {
    if (existsSync(SESSION_PATH)) {
        return JSON.parse(readFileSync(SESSION_PATH));
    }
    return null;
}

async function saveSession(data) {
    writeFileSync(SESSION_PATH, JSON.stringify(data));
}

async function loginWithRetry() {
    try {
        // توليد جهاز ثابت بناءً على اسم المستخدم عشان إنستقرام ما يشك
        ig.state.generateDevice(USERNAME);
        
        const savedSession = loadSession();
        if (savedSession) {
            console.log("استعادة جلسة محفوظة...");
            await ig.state.deserialize(savedSession);
            const userInfo = await ig.user.info(ig.state.cookieUserId);
            loginStatus = `✅ تم الدخول بالجلسة المحفوظة! الحساب: ${userInfo.username}`;
            return;
        }

        console.log("جاري تنفيذ خطوات ما قبل الدخول (خداع السيرفر)...");
        await ig.simulate.preLoginFlow();
        await delay(2000); // انتظار ثانيتين

        console.log("محاولة تسجيل الدخول الآن...");
        const loggedInUser = await ig.account.login(USERNAME, PASSWORD);
        
        await delay(2000); // انتظار بعد الدخول
        
        // حفظ الجلسة عشان ما يطلب باسورد مرة ثانية أبداً
        const serialized = await ig.state.serialize();
        delete serialized.constants;
        await saveSession(serialized);

        process.nextTick(async () => await ig.simulate.postLoginFlow());
        
        loginStatus = `✅ تم اختراق الحماية والدخول بنجاح! المستخدم: ${loggedInUser.username}`;
        rawErrorDetails = "تمت العملية بنجاح.";
        console.log(loginStatus);

    } catch (error) {
        console.error("تفاصيل الخطأ المخفي:", error);
        rawErrorDetails = error.toString();

        if (error.message.includes('checkpoint_required')) {
            loginStatus = "⚠️ إنستقرام أوقف الدخول. افتح جوالك واضغط 'هذا أنا' (This was me).";
        } else if (error.message.includes('bad_password')) {
            // هنا نوضح لك إن إنستقرام يكذب ويحجب السيرفر
            loginStatus = "❌ إنستقرام يرفض السيرفر بحجة 'كلمة سر خطأ' (حماية IP).";
        } else if (error.message.includes('challenge')) {
            loginStatus = "🔐 مطلوب تأكيد عبر الإيميل أو الجوال. راجع حسابك.";
        } else {
            loginStatus = "❌ فشل غير معروف، انظر التفاصيل بالأسفل.";
        }
    }
}

// بدء المحاولة
loginWithRetry();

// تصميم صفحة المراقبة
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>نظام الربط الخبير</title>
            <style>
                body { background: #050505; color: #fff; font-family: 'Segoe UI', Tahoma, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
                .container { background: #151515; padding: 30px; border-radius: 15px; box-shadow: 0 0 30px rgba(0, 150, 255, 0.2); text-align: center; border: 1px solid #222; max-width: 90%; width: 450px; }
                .status-icon { font-size: 50px; margin-bottom: 15px; }
                .status-text { font-size: 1.2em; margin: 15px 0; padding: 15px; border-radius: 8px; font-weight: bold; }
                .success { background: rgba(0, 255, 100, 0.1); color: #00ff64; border: 1px solid #00ff64; }
                .error { background: rgba(255, 50, 50, 0.1); color: #ff3232; border: 1px solid #ff3232; }
                .warning { background: rgba(255, 180, 0, 0.1); color: #ffb400; border: 1px solid #ffb400; }
                .debug-box { background: #000; color: #0f0; font-family: monospace; font-size: 0.8em; padding: 10px; border-radius: 5px; text-align: left; direction: ltr; margin-top: 15px; word-wrap: break-word; overflow-y: auto; max-height: 100px; border: 1px solid #333;}
                button { background: linear-gradient(45deg, #0052d4, #4364f7); color: white; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; font-size: 1.1em; margin-top: 15px;}
                button:hover { opacity: 0.9; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="status-icon">${loginStatus.includes('✅') ? '🚀' : (loginStatus.includes('⚠️') ? '🛡️' : '🛑')}</div>
                <h2>نظام التخطي المتقدم</h2>
                <div class="status-text ${loginStatus.includes('✅') ? 'success' : (loginStatus.includes('⚠️') ? 'warning' : 'error')}">
                    ${loginStatus}
                </div>
                
                ${!loginStatus.includes('✅') ? `
                <div style="font-size: 0.9em; color: #aaa; margin-top: 10px;">
                    <strong>رسالة السيرفر الأصلية:</strong>
                    <div class="debug-box">${rawErrorDetails}</div>
                </div>` : ''}

                <button onclick="location.reload()">تحديث ومحاولة من جديد 🔄</button>
                <div style="margin-top: 20px; color: #666; font-size: 0.85em;">dvqkcaqnssa39 | UptimeRobot Active 🟢</div>
            </div>
        </body>
        </html>
    `);
});

app.listen(port, () => console.log(`Server is running on port ${port}`));