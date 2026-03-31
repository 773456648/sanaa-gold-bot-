const express = require('express');
const { IgApiClient } = require('instagram-private-api');
const app = express();
const port = process.env.PORT || 3000;

const ig = new IgApiClient();

// بيانات حسابك (تأكد من تغيير كلمة السر لاحقاً للأمان)
const USERNAME = 'dvqkcaqnssa39';
const PASSWORD = 'god12god1';

let loginStatus = "جاري محاولة تسجيل الدخول...";

async function loginToInstagram() {
    try {
        ig.state.generateDevice(USERNAME);
        await ig.simulate.preLoginFlow();
        const loggedInUser = await ig.account.login(USERNAME, PASSWORD);
        
        // محاكاة نشاط بعد الدخول لضمان عدم الحظر
        process.nextTick(async () => await ig.simulate.postLoginFlow());
        
        loginStatus = `✅ تم الدخول بنجاح! اسم المستخدم: ${loggedInUser.username}`;
        console.log(loginStatus);
    } catch (error) {
        loginStatus = `❌ فشل تسجيل الدخول: ${error.message}`;
        console.error(loginStatus);
    }
}

// تشغيل محاولة الدخول عند تشغيل السيرفر
loginToInstagram();

app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: Arial; text-align: center; margin-top: 50px;">
            <h1>مراقب حساب إنستقرام</h1>
            <div style="padding: 20px; border: 2px solid #ccc; display: inline-block; border-radius: 10px;">
                <p style="font-size: 20px;">حالة الحساب الآن:</p>
                <h3 style="color: ${loginStatus.includes('✅') ? 'green' : 'red'}">${loginStatus}</h3>
            </div>
            <p style="margin-top: 20px;">هذا السيرفر يعمل الآن لضمان بقاء حسابك نشطاً.</p>
        </div>
    `);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});