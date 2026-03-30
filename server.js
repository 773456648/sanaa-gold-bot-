require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { IgApiClient } = require('instagram-private-api');

const app = express();
const port = process.env.PORT || 3000;

// إعدادات الـ CORS للسماح للتطبيق بإرسال البيانات
app.use(cors({
    origin: '*',
    methods: ['POST', 'GET']
}));
app.use(express.json());

// متغير لتخزين بيانات الجلسة في الذاكرة
let currentSessionData = null;
const ig = new IgApiClient();

// 1. مسار (Endpoint) لاستقبال بيانات الجلسة من التطبيق
app.post('/api/save-session', (req, res) => {
    const { cookies, userAgent } = req.body;

    if (!cookies || !userAgent) {
        console.log('❌ طلب غير مكتمل من التطبيق.');
        return res.status(400).json({ error: 'Missing data' });
    }

    // حفظ البيانات
    currentSessionData = { cookies, userAgent };
    console.log('✅ تم استلام جلسة جديدة بنجاح من التطبيق!');
    console.log('📱 User-Agent المستلم:', userAgent);
    
    // تشغيل النشاط فوراً بعد استلام الجلسة
    performActivity();

    res.status(200).json({ message: 'Session saved successfully', status: 'active' });
});

// 2. مسار للتحقق من حالة السيرفر (مفيد لموقع Cron-job.org)
app.get('/', (req, res) => {
    const status = currentSessionData ? 'يوجد جلسة نشطة 🟢' : 'بانتظار الجلسة من التطبيق 🔴';
    res.send(`<h1>سيرفر البقاء متصلاً يعمل</h1><p>الحالة: ${status}</p>`);
});

// 3. الدالة التي تقوم بمحاكاة النشاط على إنستقرام
async function performActivity() {
    if (!currentSessionData) {
        console.log('⏳ لا توجد جلسة محفوظة بعد. بانتظار التطبيق...');
        return;
    }

    try {
        console.log('🔄 جاري إرسال إشارة "نشط الآن" لإنستقرام...');

        // إعداد العميل (Client) بنفس بصمة الهاتف
        ig.state.generateDevice(process.env.IG_USERNAME || 'android_device');
        
        // استعادة الجلسة (Deserialize) باستخدام الكوكيز والـ User-Agent المستلمة
        await ig.state.deserialize({
            constants: ig.state.constants,
            cookies: currentSessionData.cookies,
        });

        // محاولة تعيين الـ User-Agent بشكل يدوي ليتطابق مع الهاتف
        ig.request.defaults.headers = {
            ...ig.request.defaults.headers,
            'User-Agent': currentSessionData.userAgent
        };

        // الإجراء 1: تحديث صندوق الرسائل (أقوى إشارة للنشاط)
        await ig.feed.directInbox().items();
        
        // الإجراء 2: تحديث الصفحة الرئيسية (Feed)
        await ig.feed.timeline().items();

        console.log(`✅ تمت محاكاة النشاط بنجاح في: ${new Date().toLocaleTimeString()}`);

    } catch (error) {
        console.error('❌ حدث خطأ أثناء محاكاة النشاط:', error.message);
        
        // إذا انتهت صلاحية الجلسة أو تم تسجيل الخروج
        if (error.message.includes('login_required') || error.status === 401) {
            console.log('⚠️ الجلسة منتهية الصلاحية. السيرفر بانتظار تسجيل دخول جديد من التطبيق.');
            currentSessionData = null; // تفريغ الجلسة
        }
    }
}

// 4. تشغيل السيرفر
app.listen(port, () => {
    console.log(`🚀 السيرفر يعمل على المنفذ ${port}`);
    console.log(`🔗 رابط استلام الجلسات سيكون: https://[your-render-app-url]/api/save-session`);
    
    // إعداد التكرار (Interval): تشغيل دالة النشاط كل 4 دقائق (240,000 مللي ثانية)
    setInterval(performActivity, 240000);
});