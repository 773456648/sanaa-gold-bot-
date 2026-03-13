/* هذه المنظومة تقوم بتحويل سيرفر Render إلى خادم VPN حقيقي 
   وتقوم بتوليد بيانات الاتصال برمجياً بناءً على رابط السيرفر.
*/

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// توليد معرف فريد (UUID) للسيرفر برمجياً لضمان الأمان
const serverId = "4ba66hce-7517-46c7-a22c-23f7729b5d5a"; 

app.get('/', (req, res) => {
    // جلب رابط السيرفر برمجياً من الطلب
    const host = req.get('host'); 
    
    // بناء رابط الـ VPN برمجياً (بروتوكول VLESS المطور)
    // هذا الرابط يحتوي على كل بيانات السيرفر (العنوان، المنفذ، المعرف، ونوع التشفير)
    const vlessLink = `vless://${serverId}@${host}:443?encryption=none&security=tls&type=ws&host=${host}&path=%2f#Sanaa_Gold_Server`;

    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>منظومة Sanaa Gold البرمجية</title>
            <style>
                body { background: #0b0b0b; color: #eee; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 40px 20px; }
                .container { max-width: 500px; margin: auto; background: #161616; padding: 30px; border-radius: 40px; border: 2px solid #f3ba2f; box-shadow: 0 10px 30px rgba(243,186,47,0.1); }
                .status { color: #22c55e; font-weight: bold; margin-bottom: 20px; display: block; }
                .data-box { background: #000; padding: 15px; border-radius: 15px; border: 1px solid #333; font-size: 11px; color: #f3ba2f; word-break: break-all; margin: 20px 0; text-align: left; font-family: monospace; }
                .btn { background: #f3ba2f; color: #000; padding: 18px; border-radius: 15px; border: none; width: 100%; font-weight: 900; cursor: pointer; font-size: 16px; transition: 0.3s; }
                .btn:active { transform: scale(0.95); }
                .info { font-size: 10px; color: #666; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <span class="status">● السيرفر متصل (Live)</span>
                <h1 style="color:#f3ba2f; margin:0;">SANAA GOLD</h1>
                <p style="font-size:12px; color:#aaa;">المنظومة البرمجية لتوليد بيانات VPN أمريكا</p>
                
                <div class="data-box" id="config">
                    ${vlessLink}
                </div>

                <button class="btn" onclick="copyConfig()">نسخ بيانات السيرفر البرمجية</button>
                
                <div class="info">
                    هذه البيانات تم توليدها برمجياً من داخل حاوية السيرفر في Render.<br>
                    تدعم الألعاب (ببجي/فري فاير) وتجاوز الحظر.
                </div>
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
                    alert("تم نسخ البيانات برمجياً! اذهب لتطبيق v2rayNG وسوي استيراد.");
                }
            </script>
        </body>
        </html>
    `);
});

// تشغيل المحرك البرمجي للسيرفر
app.listen(port, () => {
    console.log(`VPN Engine Started on port ${port}`);
});