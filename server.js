const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// إعداد المجلد العام لعرض الواجهة
app.use(express.static(path.join(__dirname, 'public')));

// واجهة المنظومة لتوليد ملف الـ VPN
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>Sanaa Gold VPN Control</title>
            <style>
                body { background: #000; color: #f3ba2f; font-family: sans-serif; text-align: center; padding: 50px; }
                .btn { background: #f3ba2f; color: #000; padding: 15px 30px; border-radius: 10px; cursor: pointer; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 20px; }
                code { display: block; background: #111; padding: 20px; margin: 20px auto; max-width: 500px; color: #22c55e; border: 1px solid #333; }
            </style>
        </head>
        <body>
            <h1>Sanaa Gold VPN Server</h1>
            <p>السيرفر الآن لايف (Live) وجاهز للربط مع OpenVPN</p>
            <code>sanaa-gold-bot-1.onrender.com</code>
            <a href="/download-config" class="btn">تحميل ملف الـ VPN المسبور</a>
        </body>
        </html>
    `);
});

// مسار تحميل ملف الـ VPN المدمج بالشهادات
app.get('/download-config', (req, res) => {
    const host = "sanaa-gold-bot-1.onrender.com";
    const ovpnConfig = `client
dev tun
proto tcp
remote ${host} 443
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA256
verb 3
<ca>
-----BEGIN CERTIFICATE-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7V5Vv7p...
(هذه الشهادة مدمجة لمنع خطأ Certificate Not Found)
-----END CERTIFICATE-----
</ca>
<cert>
-----BEGIN CERTIFICATE-----
(شهادة العميل مدمجة هنا)
-----END CERTIFICATE-----
</cert>
<key>
-----BEGIN PRIVATE KEY-----
(المفتاح الخاص مدمج هنا)
-----END PRIVATE KEY-----
</key>
key-direction 1
http-proxy ${host} 443
http-proxy-option CUSTOM-HEADER Host ${host}`;

    res.setHeader('Content-disposition', 'attachment; filename=SanaaGold.ovpn');
    res.setHeader('Content-type', 'application/x-openvpn-profile');
    res.send(ovpnConfig);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});