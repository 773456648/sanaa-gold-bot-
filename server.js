// هذا الكود هو "المحرك" اللي بيشتغل داخل Render
// وظيفته يستقبل اتصال تليفونك ويحوله لنت للألعاب

const express = require('express');
const { createProxyServer } = require('http-proxy');
const app = express();
const port = process.env.PORT || 3000;

// واجهة المنظومة
app.get('/', (req, res) => {
  res.send(`
    <body style="background:#000;color:#f3ba2f;font-family:sans-serif;text-align:center;padding:50px;">
      <h1>Sanaa Gold VPN Server</h1>
      <p style="color:#fff">السيرفر الآن شغال وجاهز للربط</p>
      <div style="border:1px solid #f3ba2f;padding:20px;display:inline-block;border-radius:20px;">
        <p style="font-size:12px;color:#888;">استخدم هذا الرابط في تطبيق OpenVPN:</p>
        <code style="color:#22c55e">sanaa-gold-bot-1.onrender.com</code>
      </div>
    </body>
  `);
});

// هذا الجزء هو اللي بيخلي السيرفر "يسبر" ويشتغل بروكسي للألعاب
const proxy = createProxyServer({});
app.all('*', (req, res) => {
  proxy.web(req, res, { target: 'http://target-game-server' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});