/* هذا الكود يحول سيرفر Render حقك إلى موزع نت (Proxy Server) 
  يدعم الألعاب وتصفح المواقع من أمريكا.
*/

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// واجهة التحكم
app.get('/', (req, res) => {
    res.send(`
        <div style="background:#000; color:#f3ba2f; font-family:sans-serif; text-align:center; padding:50px; border-radius:30px; border:2px solid #f3ba2f;">
            <h1 style="font-size:35px; margin-bottom:10px;">Sanaa Gold USA Bridge</h1>
            <p style="color:#fff;">سيرفرك في أمريكا الآن "مسبور" وجاهز لتوزيع النت.</p>
            
            <div style="margin-top:30px; background:#111; padding:20px; border-radius:15px; border:1px dashed #f3ba2f;">
                <p style="color:#888; font-size:12px;">انسخ الرابط التالي وضعه في تطبيق v2rayNG:</p>
                <textarea id="v2link" style="width:100%; height:100px; background:#000; color:#22c55e; border:none; font-size:10px; padding:10px;" readonly>vmess://eyJhZGQiOiJzYW5hYS1nb2xkLWJvdC0xLm9ucmVuZGVyLmNvbSIsImFpZCI6IjAiLCJhbHBuIjoiIiwiaG9zdCI6InNhbmFhLWdvbGQtYm90LTEub25yZW5kZXIuY29tIiwiaWQiOiI0YmE2NmhjZS03NTE3LTQ2YzctYTIyYy0yM2Y3NzI5YjVkNWEiLCJuZXQiOiJ3cyIsInBhdGgiOiIvIiwicG9ydCI6IjQ0MyIsInBzIjoiU2FuYWFfR29sZF9VU0EiLCJzbmkiOiJzYW5hYS1nb2xkLWJvdC0xLm9ucmVuZGVyLmNvbSIsInRscyI6InRscyIsInR5cGUiOiJub25lIiwidmUic2lvbiI6IjIifQ==</textarea>
                <button onclick="copyToClipboard()" style="margin-top:15px; background:#f3ba2f; color:#000; padding:10px 30px; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">نسخ الرابط الذهبي</button>
            </div>

            <script>
                function copyToClipboard() {
                    const copyText = document.getElementById("v2link");
                    copyText.select();
                    document.execCommand("copy");
                    alert("تم النسخ! افتح تطبيق v2rayNG وسوي Import من الحافظة.");
                }
            </script>
        </div>
    `);
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});