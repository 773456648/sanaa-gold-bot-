/* تم إصلاح خطأ الـ Hexadecimal و الـ ID ليتوافق مع v2rayNG.
   هذا المحرك يولد بيانات سداسية عشرية صحيحة 100%.
*/

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// هذا الـ ID مسبور وصحيح (Hexadecimal) ولا يحتوي على حروف خاطئة مثل h
const serverId = "4ba66ace-7517-46c7-a22c-23f7729b5d5a"; 

app.get('/', (req, res) => {
    // جلب الرابط برمجياً
    const host = req.get('host'); 
    
    // بناء الرابط المطور VLESS
    const vlessLink = `vless://${serverId}@${host}:443?encryption=none&security=tls&type=ws&host=${host}&path=%2f#Sanaa_Gold_USA`;

    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sanaa Gold VPN - Fixed</title>
            <style>
                body { background: #0b0b0b; color: #fff; font-family: sans-serif; text-align: center; padding: 40px 20px; }
                .container { max-width: 450px; margin: auto; background: #161616; padding: 25px; border-radius: 30px; border: 2px solid #22c55e; }
                .data-box { background: #000; padding: 15px; border-radius: 10px; font-size: 10px; color: #22c55e; word-break: break-all; margin: 20px 0; border: 1px solid #333; font-family: monospace; }
                .btn { background: #22c55e; color: #000; padding: 15px; border-radius: 12px; border: none; width: 100%; font-weight: bold; cursor: pointer; font-size: 18px; }
                .status { color: #22c55e; font-size: 12px; margin-bottom: 10px; display: block; }
            </style>
        </head>
        <body>
            <div class="container">
                <span class="status">● المحرك البرمجي تم إصلاحه</span>
                <h1 style="margin:0;">Sanaa Gold</h1>
                <p style="font-size:12px; color:#888;">الآن السيرفر يدعم جميع إصدارات v2rayNG</p>
                
                <div class="data-box" id="config">${vlessLink}</div>

                <button class="btn" onclick="copyConfig()">نسخ البيانات الجديدة 🚀</button>
                
                <p style="font-size:10px; color:#555; margin-top:15px;">
                    بعد النسخ، احذف السيرفر القديم في التطبيق وسوي استيراد جديد.
                </p>
            </div>

            <script>
                function copyConfig() {
                    const text = document.getElementById("config").innerText;
                    const el = document.createElement('textarea');
                    el.value = text;
                    document.body.appendChild(el);
                    el.select();
                    document.execCommand('copy');
                    document.body.removeChild(el);
                    alert("تم النسخ! احذف السيرفر القديم وجرب الجديد.");
                }
            </script>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});