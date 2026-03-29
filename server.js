const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer'); // استخدمنا المتصفح الخفي بدل axios

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// كلمة السر للدخول
const SYSTEM_PASSWORD = '771232690';
const DB_FILE = path.join(__dirname, 'accounts.json');

// المتغير لحفظ البوتات الشغالة (يحفظ المتصفح عشان نقدر نغلقه)
const activeBots = {};

function getAccounts() {
    if (!fs.existsSync(DB_FILE)) return [];
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
}

function saveAccounts(accounts) {
    fs.writeFileSync(DB_FILE, JSON.stringify(accounts, null, 2));
}

// دالة تشغيل المتصفح الخفي (الجلسة المباشرة)
async function startBotLogic(username, cookies) {
    // إيقاف المتصفح لو كان شغال من قبل
    if (activeBots[username]) {
        clearInterval(activeBots[username].interval);
        try { await activeBots[username].browser.close(); } catch (e) {}
        delete activeBots[username];
    }

    try {
        console.log(`[${username}] جاري فتح المتصفح الخفي...`);
        const browser = await puppeteer.launch({
            headless: true, // مخفي داخل السيرفر
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        
        // تمويه كأنك تتصفح من كمبيوتر حقيقي
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // تجهيز الكوكيز
        let cookieArray = [];
        try {
            cookieArray = JSON.parse(cookies);
        } catch (e) {
            console.log(`[${username}] خطأ في صيغة الكوكيز!`);
            await browser.close();
            return;
        }

        await page.setCookie(...cookieArray);

        // الدخول لصفحة الرسائل المباشرة (عشان تجس متصل بقوة)
        await page.goto('https://www.instagram.com/direct/', { waitUntil: 'networkidle2' });
        console.log(`[${new Date().toLocaleTimeString()}] ${username} مبشر الآن وجالس في الخاص!`);

        // دالة تحرك الماوس كل 30 ثانية عشان انستقرام يحسبك صاحي
        const activityInterval = setInterval(async () => {
            try {
                if (browser.isConnected()) {
                    await page.mouse.move(Math.random() * 500, Math.random() * 500);
                    // console.log(`[${username}] تحريك الماوس للتمويه...`); // مخفي عشان ما يزعج السجل
                } else {
                    clearInterval(activityInterval);
                }
            } catch (e) {}
        }, 30000);

        // حفظ الجلسة عشان نقدر نوقفها بعدين
        activeBots[username] = { browser, interval: activityInterval };

    } catch (error) {
        console.log(`[${username}] خطأ أثناء تشغيل الجلسة:`, error.message);
    }
}

app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === SYSTEM_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'كلمة السر خاطئة' });
    }
});

app.get('/api/accounts', (req, res) => {
    res.json(getAccounts());
});

app.post('/api/accounts', (req, res) => {
    const { username, cookies } = req.body;
    if (!username || !cookies) return res.status(400).json({ error: 'بيانات ناقصة' });

    let accounts = getAccounts();
    const existingIndex = accounts.findIndex(acc => acc.username === username);
    if (existingIndex >= 0) {
        accounts[existingIndex].cookies = cookies;
    } else {
        accounts.push({ username, cookies });
    }
    
    saveAccounts(accounts);
    res.json({ success: true, message: 'تم الحفظ بنجاح' });
});

app.delete('/api/accounts/:username', async (req, res) => {
    const username = req.params.username;
    let accounts = getAccounts();
    accounts = accounts.filter(acc => acc.username !== username);
    saveAccounts(accounts);
    
    if (activeBots[username]) {
        clearInterval(activeBots[username].interval);
        try { await activeBots[username].browser.close(); } catch (e) {}
        delete activeBots[username];
    }
    
    res.json({ success: true, message: 'تم الحذف' });
});

app.post('/api/start', (req, res) => {
    const { username, cookies } = req.body;
    startBotLogic(username, cookies);
    res.json({ success: true, message: 'تم فتح متصفح مباشر لهذا الحساب' });
});

app.post('/api/stop', async (req, res) => {
    const { username } = req.body;
    if (activeBots[username]) {
        clearInterval(activeBots[username].interval);
        try { await activeBots[username].browser.close(); } catch (e) {}
        delete activeBots[username];
    }
    res.json({ success: true, message: 'تم إغلاق المتصفح الخفي' });
});

app.get('/api/status', (req, res) => {
    res.json({ activeBots: Object.keys(activeBots) });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
    const savedAccounts = getAccounts();
    if(savedAccounts.length > 0) {
        console.log(`Auto-starting ${savedAccounts.length} saved live sessions...`);
        savedAccounts.forEach(acc => {
            startBotLogic(acc.username, acc.cookies);
        });
    }
});