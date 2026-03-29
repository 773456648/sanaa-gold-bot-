const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); 

// كلمة السر للدخول للنظام
const SYSTEM_PASSWORD = '771232690';
const DB_FILE = path.join(__dirname, 'accounts.json');

// ذاكرة السيرفر للحسابات الشغالة حالياً
const activeBots = {};

// دوال حفظ وقراءة الحسابات
function getAccounts() {
    if (!fs.existsSync(DB_FILE)) return [];
    try {
        const data = fs.readFileSync(DB_FILE);
        return JSON.parse(data);
    } catch(e) { return []; }
}

function saveAccounts(accounts) {
    fs.writeFileSync(DB_FILE, JSON.stringify(accounts, null, 2));
}

// الدالة الأسطورية لتشغيل البوت بذكاء
async function startBotLogic(username, cookies) {
    // تنظيف أي جلسة سابقة لنفس الحساب عشان ما يصير تعليق
    if (activeBots[username]) {
        console.log(`[${username}] يتم إيقاف الجلسة القديمة لتجديدها...`);
        clearInterval(activeBots[username].interval);
        try { await activeBots[username].browser.close(); } catch (e) {}
        delete activeBots[username];
    }

    try {
        console.log(`[${username}] جاري تهيئة المتصفح الخفي...`);
        
        // إعدادات مدرعة مخصصة للسيرفرات الضعيفة مثل Render لتوفير الرام
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        
        // منع تحميل الصور والفيديوهات لتوفير 80% من الرامات
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (req.resourceType() === 'image' || req.resourceType() === 'media' || req.resourceType() === 'font') {
                req.abort();
            } else {
                req.continue();
            }
        });

        // تمويه البصمة
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1366, height: 768 });

        // زرع الكوكيز بحذر
        let cookieArray = [];
        try {
            cookieArray = JSON.parse(cookies);
        } catch (e) {
            console.log(`[${username}] خطأ: صيغة الكوكيز غير صحيحة!`);
            await browser.close();
            return;
        }
        await page.setCookie(...cookieArray);

        // الدخول لصفحة الرسائل
        console.log(`[${username}] جاري الدخول لانستقرام...`);
        await page.goto('https://www.instagram.com/direct/', { waitUntil: 'domcontentloaded', timeout: 90000 });
        
        console.log(`[${username}] متصل الآن 🟢`);

        // محاكاة النشاط البشري كل 45 ثانية
        const activityInterval = setInterval(async () => {
            try {
                if (browser.isConnected()) {
                    // حركة ماوس عشوائية
                    await page.mouse.move(Math.floor(Math.random() * 800), Math.floor(Math.random() * 600));
                    // سكرول عشوائي للأعلى والأسفل
                    await page.evaluate(() => {
                        window.scrollBy(0, Math.floor(Math.random() * 300) - 150);
                    });
                } else {
                    clearInterval(activityInterval);
                    delete activeBots[username];
                }
            } catch (e) {
                // تجاهل الأخطاء البسيطة أثناء التحريك
            }
        }, 45000);

        // حفظ البوت في الذاكرة
        activeBots[username] = { browser, interval: activityInterval };

    } catch (error) {
        console.error(`[${username}] خطأ فادح أثناء التشغيل: ${error.message}`);
        if(activeBots[username]) {
            clearInterval(activeBots[username].interval);
            try { await activeBots[username].browser.close(); } catch(e){}
            delete activeBots[username];
        }
    }
}

// مسارات الـ API (الروابط)
app.post('/api/login', (req, res) => {
    if (req.body.password === SYSTEM_PASSWORD) res.json({ success: true });
    else res.status(401).json({ success: false, message: 'كلمة السر خاطئة' });
});

app.get('/api/accounts', (req, res) => res.json(getAccounts()));

app.post('/api/start', (req, res) => {
    const { username, cookies } = req.body;
    if (!username || !cookies) return res.status(400).json({ error: 'بيانات ناقصة' });

    // حفظ في القاعدة لضمان الاستمرارية
    let accounts = getAccounts();
    const index = accounts.findIndex(a => a.username === username);
    if (index >= 0) accounts[index].cookies = cookies;
    else accounts.push({ username, cookies });
    saveAccounts(accounts);

    // تشغيل فوري في الخلفية
    startBotLogic(username, cookies);
    res.json({ success: true, message: 'تم استلام الأمر، السيرفر يعمل الآن...' });
});

app.post('/api/stop', async (req, res) => {
    const { username } = req.body;
    if (activeBots[username]) {
        clearInterval(activeBots[username].interval);
        try { await activeBots[username].browser.close(); } catch (e) {}
        delete activeBots[username];
        console.log(`[${username}] تم إيقاف الجلسة يدوياً.`);
    }
    res.json({ success: true });
});

app.delete('/api/accounts/:username', async (req, res) => {
    const username = req.params.username;
    let accounts = getAccounts();
    accounts = accounts.filter(a => a.username !== username);
    saveAccounts(accounts);
    
    if (activeBots[username]) {
        clearInterval(activeBots[username].interval);
        try { await activeBots[username].browser.close(); } catch (e) {}
        delete activeBots[username];
    }
    res.json({ success: true });
});

// لمعرفة حالة البوتات الشغالة حالياً (مهم للواجهة)
app.get('/api/status', (req, res) => res.json({ activeBots: Object.keys(activeBots) }));

// مسار مهم جداً لإنعاش السيرفر من موقع cron-job
app.get('/ping', (req, res) => res.send('Server is awake!'));

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`Server is LIVE on port ${PORT}`);
    
    // النظام المدرع: تشغيل الحسابات المحفوظة فور إقلاع السيرفر
    const saved = getAccounts();
    if(saved.length > 0) {
        console.log(`جارِ إعادة تشغيل ${saved.length} حسابات محفوظة مسبقاً...`);
        saved.forEach(acc => startBotLogic(acc.username, acc.cookies));
    }
});