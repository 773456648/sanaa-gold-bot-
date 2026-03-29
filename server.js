const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const SYSTEM_PASSWORD = '771232690';
const DB_FILE = path.join(__dirname, 'accounts.json');

// مخزن الجلسات النشطة في ذاكرة السيرفر
const activeBots = {};

function getAccounts() {
    if (!fs.existsSync(DB_FILE)) return [];
    try {
        const data = fs.readFileSync(DB_FILE);
        return JSON.parse(data);
    } catch (e) { return []; }
}

function saveAccounts(accounts) {
    fs.writeFileSync(DB_FILE, JSON.stringify(accounts, null, 2));
}

async function startBotLogic(username, cookies) {
    // إذا الحساب شغال أصلاً، ما نكررش التشغيل
    if (activeBots[username]) return;

    try {
        console.log(`[${username}] جاري إطلاق المتصفح الخفي...`);
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        let cookieArray = JSON.parse(cookies);
        await page.setCookie(...cookieArray);

        // الذهاب للخاص لضمان حالة "نشط الآن"
        await page.goto('https://www.instagram.com/direct/', { waitUntil: 'networkidle2' });
        
        const activityInterval = setInterval(async () => {
            try {
                if (browser.isConnected()) {
                    await page.mouse.move(Math.random() * 500, Math.random() * 500);
                } else {
                    clearInterval(activityInterval);
                }
            } catch (e) {}
        }, 30000);

        activeBots[username] = { 
            browser, 
            interval: activityInterval,
            startTime: new Date().toISOString() 
        };
        console.log(`[${username}] البوت شغال الآن في السيرفر بنجاح.`);

    } catch (error) {
        console.log(`[${username}] خطأ: ${error.message}`);
    }
}

app.post('/api/login', (req, res) => {
    res.json({ success: req.body.password === SYSTEM_PASSWORD });
});

app.get('/api/accounts', (req, res) => res.json(getAccounts()));

app.post('/api/accounts', (req, res) => {
    const { username, cookies } = req.body;
    let accounts = getAccounts();
    const idx = accounts.findIndex(acc => acc.username === username);
    if (idx >= 0) accounts[idx].cookies = cookies;
    else accounts.push({ username, cookies });
    saveAccounts(accounts);
    res.json({ success: true });
});

app.get('/api/status', (req, res) => {
    // نرسل قائمة باليوزرات الشغالة حالياً في السيرفر
    res.json({ activeBots: Object.keys(activeBots) });
});

app.post('/api/start', (req, res) => {
    const { username, cookies } = req.body;
    startBotLogic(username, cookies);
    res.json({ success: true });
});

app.post('/api/stop', async (req, res) => {
    const { username } = req.body;
    if (activeBots[username]) {
        clearInterval(activeBots[username].interval);
        try { await activeBots[username].browser.close(); } catch (e) {}
        delete activeBots[username];
    }
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    // إعادة تشغيل الجلسات المحفوظة تلقائياً عند إعادة تشغيل السيرفر
    const saved = getAccounts();
    saved.forEach(acc => startBotLogic(acc.username, acc.cookies));
});