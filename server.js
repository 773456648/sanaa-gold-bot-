const express = require('express');
const { IgApiClient } = require('instagram-private-api');
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

const app = express();
const port = process.env.PORT || 10000;

// إعداد SQLite
const db = new sqlite3.Database('./session.db');
const dbGet = promisify(db.get).bind(db);
const dbRun = promisify(db.run).bind(db);

// إنشاء الجدول
dbRun(`
  CREATE TABLE IF NOT EXISTS session (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`).catch(err => console.error('خطأ في إنشاء جدول الجلسة:', err));

// دوال مساعدة
async function loadSession() {
  try {
    const row = await dbGet("SELECT value FROM session WHERE key = 'instagram_session'");
    if (row && row.value) {
      return JSON.parse(row.value);
    }
  } catch (err) {
    console.error('فشل في تحميل الجلسة:', err);
  }
  return null;
}

async function saveSession(data) {
  if (!data) {
    console.error('⚠️ محاولة حفظ جلسة فارغة (undefined) – تم تجاهلها');
    return false;
  }
  try {
    await dbRun(
      "INSERT OR REPLACE INTO session (key, value) VALUES (?, ?)",
      ['instagram_session', JSON.stringify(data)]
    );
    return true;
  } catch (err) {
    console.error('فشل في حفظ الجلسة:', err);
    return false;
  }
}

async function clearSession() {
  try {
    await dbRun("DELETE FROM session WHERE key = 'instagram_session'");
    console.log('🗑️ تم مسح الجلسة المخزنة');
  } catch (err) {
    console.error('فشل في مسح الجلسة:', err);
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// متغيرات البيئة (يجب تعيينها في لوحة التحكم)
const USERNAME = process.env.INSTA_USERNAME;
const PASSWORD = process.env.INSTA_PASSWORD;
const PROXY_URL = process.env.PROXY_URL;

let loginStatus = "⏳ جاري تهيئة النظام...";
let rawErrorDetails = "لا يوجد أخطاء بعد.";
let isLoggingIn = false;
let ig = null;  // سيتم إنشاؤه داخل كل محاولة

// دالة إنشاء عميل جديد
function createIgClient() {
  const client = new IgApiClient();
  if (PROXY_URL) {
    client.state.proxyUrl = PROXY_URL;
  }
  return client;
}

// محاولة تسجيل الدخول
async function performLogin(forceFresh = false) {
  if (isLoggingIn) {
    console.log('محاولة دخول قيد التنفيذ بالفعل، انتظر...');
    return false;
  }
  isLoggingIn = true;
  ig = createIgClient();

  try {
    console.log('بدء عملية تسجيل الدخول...');
    loginStatus = "🔄 جاري تسجيل الدخول...";

    ig.state.generateDevice(USERNAME);

    // محاولة استعادة الجلسة إذا لم نطلب تسجيل دخول جديد
    if (!forceFresh) {
      const savedSession = await loadSession();
      if (savedSession && savedSession.cookies) {
        console.log('استعادة جلسة محفوظة...');
        try {
          await ig.state.deserialize(savedSession);
          // التحقق من صحة الجلسة
          const userInfo = await ig.user.info(ig.state.cookieUserId);
          loginStatus = `✅ تم الدخول بالجلسة المحفوظة! الحساب: ${userInfo.username}`;
          rawErrorDetails = "تمت العملية بنجاح.";
          console.log(loginStatus);
          isLoggingIn = false;
          return true;
        } catch (err) {
          console.log('فشلت استعادة الجلسة، سنحاول تسجيل الدخول من جديد.');
          await clearSession();
          // نستمر لتسجيل الدخول العادي
        }
      }
    }

    // تسجيل دخول جديد
    console.log('تنفيذ preLoginFlow...');
    await ig.simulate.preLoginFlow();
    await delay(3000);

    console.log('محاولة تسجيل الدخول بالباسورد...');
    const loggedInUser = await ig.account.login(USERNAME, PASSWORD);
    await delay(2000);

    // حفظ الجلسة
    const serialized = await ig.state.serialize();
    if (!serialized) {
      throw new Error('serialize returned undefined');
    }
    delete serialized.constants;
    const saved = await saveSession(serialized);
    if (!saved) {
      console.warn('⚠️ لم نتمكن من حفظ الجلسة، لكن الدخول تم بنجاح مؤقتاً');
    }

    process.nextTick(() => ig.simulate.postLoginFlow().catch(e => console.log('postLoginFlow error:', e.message)));

    loginStatus = `✅ تم الدخول بنجاح! المستخدم: ${loggedInUser.username}`;
    rawErrorDetails = "تمت العملية بنجاح.";
    console.log(loginStatus);
    isLoggingIn = false;
    return true;

  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    rawErrorDetails = error.toString();

    if (error.message.includes('checkpoint_required')) {
      loginStatus = "⚠️ إنستقرام طلب تحقق (checkpoint). يجب فتح الجوال والضغط على 'هذا أنا'.";
    } else if (error.message.includes('bad_password')) {
      loginStatus = "❌ إنستقرام يرفض السيرفر بحجة كلمة سر خاطئة (غالباً حماية IP).";
    } else if (error.message.includes('challenge')) {
      loginStatus = "🔐 مطلوب تأكيد عبر الإيميل أو الجوال. راجع حسابك.";
    } else {
      loginStatus = `❌ فشل الدخول: ${error.message.substring(0, 100)}`;
    }

    isLoggingIn = false;
    return false;
  }
}

// بدء المحاولة فور التشغيل
performLogin().catch(console.error);

// إعادة محاولة كل 30 دقيقة إذا لم يكن مسجلاً
setInterval(() => {
  if (!loginStatus.includes('✅')) {
    console.log('حالة الدخول غير ناجحة، إعادة محاولة...');
    performLogin(false).catch(console.error);
  }
}, 30 * 60 * 1000);

// صفحة المراقبة
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
        .info { font-size: 0.8em; color: #aaa; margin-top: 10px; }
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

        <button onclick="retryLogin()">محاولة تسجيل الدخول مجدداً 🔄</button>
        <button onclick="resetAndRetry()" style="background: #444; margin-top: 8px;">إعادة ضبط الجلسة والمحاولة 🧹</button>
        <div class="info">dvqkcaqnssa39 | تحديث تلقائي كل 30 دقيقة</div>
      </div>

      <script>
        async function retryLogin() {
          const btn = document.querySelector('button');
          btn.innerText = 'جاري المحاولة...';
          btn.disabled = true;
          try {
            const response = await fetch('/retry-login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ reset: false }) });
            const result = await response.json();
            if (result.status === 'started') {
              alert('تم بدء محاولة جديدة، انتظر قليلاً ثم أعد تحميل الصفحة.');
              setTimeout(() => location.reload(), 4000);
            } else {
              alert('فشل في بدء المحاولة: ' + result.message);
              btn.innerText = 'محاولة تسجيل الدخول مجدداً 🔄';
              btn.disabled = false;
            }
          } catch (err) {
            alert('حدث خطأ في الاتصال بالسيرفر.');
            btn.innerText = 'محاولة تسجيل الدخول مجدداً 🔄';
            btn.disabled = false;
          }
        }

        async function resetAndRetry() {
          if (!confirm('هل تريد مسح الجلسة المخزنة والمحاولة من جديد؟')) return;
          const btn = event.target;
          btn.innerText = 'جاري...';
          btn.disabled = true;
          try {
            const response = await fetch('/retry-login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ reset: true }) });
            const result = await response.json();
            if (result.status === 'started') {
              alert('تم مسح الجلسة وبدء محاولة جديدة، انتظر قليلاً ثم أعد تحميل الصفحة.');
              setTimeout(() => location.reload(), 4000);
            } else {
              alert('فشل: ' + result.message);
              btn.innerText = 'إعادة ضبط الجلسة والمحاولة 🧹';
              btn.disabled = false;
            }
          } catch (err) {
            alert('خطأ في الاتصال.');
            btn.innerText = 'إعادة ضبط الجلسة والمحاولة 🧹';
            btn.disabled = false;
          }
        }
      </script>
    </body>
    </html>
  `);
});

// نقاط API للمحاولة
app.post('/retry-login', async (req, res) => {
  let reset = false;
  if (req.body && req.body.reset === true) reset = true;

  if (isLoggingIn) {
    return res.json({ status: 'busy', message: 'يوجد محاولة دخول قيد التنفيذ حالياً.' });
  }

  if (reset) {
    await clearSession();
  }

  // بدء محاولة جديدة في الخلفية
  performLogin(reset).catch(console.error);
  res.json({ status: 'started', message: reset ? 'تم مسح الجلسة وبدء محاولة جديدة.' : 'تم بدء محاولة تسجيل الدخول.' });
});

// تشغيل السيرفر
app.listen(port, () => {
  console.log(`🚀 السيرفر يعمل على المنفذ ${port}`);
  console.log(`📁 قاعدة البيانات: session.db`);
  if (!USERNAME || !PASSWORD) {
    console.error('❌ خطير: لم يتم تعيين INSTA_USERNAME و INSTA_PASSWORD كمتغيرات بيئة!');
    loginStatus = '⚠️ متغيرات البيئة غير مكتملة.';
  }
});