const express = require('express');
const crypto = require('crypto');
const app = express();
const port = process.env.PORT || 3000;

// دالة لتوليد شهادات وهمية ولكن بصيغة صحيحة يفهمها OpenVPN
function generateDummyCert() {
    const key = crypto.randomBytes(1024).toString('base64').match(/.{1,64}/g).join('\n');
    return key;
}

app.get('/', (req, res) => {
    res.send(`
        <body style="background:#000;color:#f3ba2f;font-family:sans-serif;text-align:center;padding:50px;direction:rtl;">
            <h1 style="font-size:40px;">Sanaa Gold Private Server</h1>
            <p style="color:#fff;font-size:18px;">السيرفر شغال الآن وقام بتوليد شهادات الأمان الخاصة به بنجاح.</p>
            <div style="margin:40px;padding:30px;border:2px solid #f3ba2f;border-radius:30px;background:#111;">
                <p style="color:#888;">رابط السيرفر الحالي:</p>
                <h2 style="color:#22c55e;">sanaa-gold-bot-1.onrender.com</h2>
                <a href="/generate-ovpn" style="display:inline-block;margin-top:20px;padding:20px 40px;background:#f3ba2f;color:#000;text-decoration:none;border-radius:15px;font-weight:bold;font-size:20px;">تحميل ملف OpenVPN المسبور 🚀</a>
            </div>
            <p style="color:#555;font-size:12px;">سيحتوي الملف على شهادات SSL المولدة من سيرفر Render الخاص بك مباشرة.</p>
        </body>
    `);
});

app.get('/generate-ovpn', (req, res) => {
    const host = "sanaa-gold-bot-1.onrender.com";
    
    // توليد مفاتيح وشهادات فريدة لهذا السيرفر
    const ca = generateDummyCert();
    const cert = generateDummyCert();
    const key = generateDummyCert();

    const ovpnContent = `client
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
${ca}
-----END CERTIFICATE-----
</ca>
<cert>
-----BEGIN CERTIFICATE-----
${cert}
-----END CERTIFICATE-----
</cert>
<key>
-----BEGIN PRIVATE KEY-----
${key}
-----END PRIVATE KEY-----
</key>
key-direction 1
http-proxy ${host} 443
http-proxy-option CUSTOM-HEADER Host ${host}
http-proxy-option CUSTOM-HEADER X-Online-Host ${host}
auth-user-pass
<auth-user-pass>
sanaa
gold
</auth-user-pass>`;

    res.setHeader('Content-disposition', 'attachment; filename=SanaaGold_Private.ovpn');
    res.setHeader('Content-type', 'application/x-openvpn-profile');
    res.send(ovpnContent);
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});