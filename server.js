const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const SYSTEM_PASSWORD = '771232690';

// هنا نحفظ الجلسات الشغالة حالياً في السيرفر
const activeSessions = {};

// دالة تحويل الكوكيز من JSON إلى نص عادي عشان يقبلها السيرفر
function parseCookies(cookieInput) {
    try {
        const parsed = JSON.parse(cookieInput);
        if (Array.isArray(parsed)) {
            return parsed.map(c => `${c.name}=${c.value}`).join('; ');
        }
        return cookieInput;
    } catch (e) {
        return cookieInput; // إذا كانت نص جاهز، نرجعها زي ما هي
    }
}

// دالة التشغيل: ترسل طلب للموقع كل 60 ثانية
function startSessionPing(username, targetUrl, cookies) {
    // لو كان شغال من قبل، نوقفه عشان نحدثه
    if (activeSessions[username]) {
        clearInterval(activeSessions[username].interval);
    }

    const cookieString = parseCookies(cookies);

    // دالة إرسال الطلب (التحديث)
    const sendPing = async () => {
        try {
            await fetch(targetUrl, {
                headers: {
                    'Cookie': cookieString,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                }
            });
            console.log(`[${username}] تم إرسال تحديث الاتصال بنجاح إلى ${targetUrl}`);
        } catch (error) {
            console.log(`[${username}] فشل في إرسال التحديث، لكن السيرفر مستمر في المحاولة.`);
        }
    };

    // إرسال أول طلب فوراً
    sendPing();

    // تشغيل المؤقت: كل 60 ثانية (60000 ملي ثانية)
    const interval = setInterval(sendPing, 60000);

    // حفظ الجلسة في ذاكرة السيرفر
    activeSessions[username] = {
        targetUrl: targetUrl,
        interval: interval
    };
}


// --- روابط الـ API ---

app.post('/api/login', (req, res) => {
    if (req.body.password === SYSTEM_PASSWORD) res.json({ success: true });
    else res.status(401).json({ success: false });
});

app.post('/api/start', (req, res) => {
    const { username, targetUrl, cookies } = req.body;
    if (!username || !targetUrl || !cookies) {
        return res.status(400).json({ error: 'بيانات ناقصة' });
    }

    startSessionPing(username, targetUrl, cookies);
    res.json({ success: true });
});

app.post('/api/stop', (req, res) => {
    const { username } = req.body;
    if (activeSessions[username]) {
        clearInterval(activeSessions[username].interval);
        delete activeSessions[username];
        console.log(`[${username}] تم إيقاف الجلسة.`);
    }
    res.json({ success: true });
});

// هذا الرابط اللي الصفحة تسأله: "مين الشغال الحين؟"
app.get('/api/status', (req, res) => {
    const sessionsList = Object.keys(activeSessions).map(user => {
        return { username: user, targetUrl: activeSessions[user].targetUrl };
    });
    res.json({ activeSessions: sessionsList });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
});