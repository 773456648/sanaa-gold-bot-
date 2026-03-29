const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// إعدادات الميدلوير
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // ربط مجلد الواجهة

// كلمة السر للدخول
const SYSTEM_PASSWORD = '771232690';
const DB_FILE = path.join(__dirname, 'accounts.json');

// المتغير لحفظ البوتات الشغالة
const activeBots = {};

// دالة قراءة الحسابات المحفوظة
function getAccounts() {
    if (!fs.existsSync(DB_FILE)) return [];
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
}

// دالة حفظ الحسابات
function saveAccounts(accounts) {
    fs.writeFileSync(DB_FILE, JSON.stringify(accounts, null, 2));
}

// 1. مسار تسجيل الدخول
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === SYSTEM_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'كلمة السر خاطئة' });
    }
});

// 2. مسار جلب الحسابات المحفوظة
app.get('/api/accounts', (req, res) => {
    res.json(getAccounts());
});

// 3. مسار حفظ حساب جديد
app.post('/api/accounts', (req, res) => {
    const { username, cookies } = req.body;
    if (!username || !cookies) return res.status(400).json({ error: 'بيانات ناقصة' });

    let accounts = getAccounts();
    // تحديث إذا كان موجود، أو إضافة جديد
    const existingIndex = accounts.findIndex(acc => acc.username === username);
    if (existingIndex >= 0) {
        accounts[existingIndex].cookies = cookies;
    } else {
        accounts.push({ username, cookies });
    }
    
    saveAccounts(accounts);
    res.json({ success: true, message: 'تم الحفظ بنجاح' });
});

// 4. مسار حذف حساب
app.delete('/api/accounts/:username', (req, res) => {
    const username = req.params.username;
    let accounts = getAccounts();
    accounts = accounts.filter(acc => acc.username !== username);
    saveAccounts(accounts);
    
    // إيقاف البوت إذا كان شغال
    if (activeBots[username]) {
        clearInterval(activeBots[username]);
        delete activeBots[username];
    }
    
    res.json({ success: true, message: 'تم الحذف' });
});

// 5. مسار تشغيل البوت (Ping)
app.post('/api/start', (req, res) => {
    const { username, cookies } = req.body;
    
    // إذا كان شغال مسبقاً، نوقفه أولاً
    if (activeBots[username]) {
        clearInterval(activeBots[username]);
    }

    // تجهيز الكوكيز بصيغة String لطلب axios
    let cookieString = cookies;
    try {
        // إذا كان بصيغة JSON القادمة من الإضافة، نحولها
        const cookieObj = JSON.parse(cookies);
        if(Array.isArray(cookieObj)){
             cookieString = cookieObj.map(c => `${c.name}=${c.value}`).join('; ');
        }
    } catch (e) {
        // إذا كان نص عادي نتركه كما هو
    }

    // دالة محاكاة التصفح
    const pingInstagram = async () => {
        try {
            await axios.get('https://www.instagram.com/', {
                headers: {
                    'Cookie': cookieString,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
                }
            });
            console.log(`[${new Date().toLocaleTimeString()}] Ping Success for ${username}`);
        } catch (error) {
            console.log(`[${new Date().toLocaleTimeString()}] Ping Failed for ${username} - ${error.message}`);
        }
    };

    // تشغيل فوري ثم كل 5 دقائق
    pingInstagram();
    activeBots[username] = setInterval(pingInstagram, 5 * 60 * 1000); // 5 دقائق

    res.json({ success: true, message: 'تم تشغيل السيرفر لهذا الحساب' });
});

// 6. مسار إيقاف البوت
app.post('/api/stop', (req, res) => {
    const { username } = req.body;
    if (activeBots[username]) {
        clearInterval(activeBots[username]);
        delete activeBots[username];
    }
    res.json({ success: true, message: 'تم الإيقاف' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});