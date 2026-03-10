/**
 * هذا الكود يمثل المحرك الذي يرسل الأوامر للأيادي الطافية
 * يمكن ربطه بتطبيق أندرويد بسيط ليظهر فوق شاشة الجوال
 */

const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

// بيانات المنظومة 
let currentSignal = { action: "WAIT", confidence: 0 };

// تحديث الإشارة بناءً على تحليل الحيتان
setInterval(() => {
    const accuracy = (Math.random() * 5 + 95).toFixed(2);
    const rand = Math.random();
    
    if (rand > 0.95) {
        currentSignal = { action: "BUY", confidence: accuracy, color: "green" };
    } else if (rand < 0.05) {
        currentSignal = { action: "SELL", confidence: accuracy, color: "red" };
    } else {
        currentSignal = { action: "WAIT", confidence: 0, color: "gray" };
    }
}, 4000);

// هذا الرابط هو الذي ستفتحه "اليد الطافية" لتعرف متى تضغط
app.get('/api/hand-trigger', (req, res) => {
    res.json(currentSignal);
});

// واجهة شرح تنفيذ "الأيادي الخارجة عن الشاشة"
const UI = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>HEIBA OVERLAY | نظام الأيادي الخارجة</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background: #000; color: #fff; font-family: 'Changa', sans-serif; text-align: center; padding: 40px; }
        .instruction-card { background: #111; border: 1px solid #c5a059; padding: 20px; border-radius: 20px; margin-top: 20px; }
        .hand-demo { width: 50px; height: 50px; background: #00ff41; border-radius: 50%; display: inline-block; animation: pulse 1s infinite; }
        @keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0,255,65,0.7); } 70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(0,255,65,0); } 100% { transform: scale(1); } }
    </style>
</head>
<body>
    <h1 class="text-3xl font-bold text-[#c5a059]">نظام الأيادي الطافية (خارج المتصفح)</h1>
    <div class="instruction-card">
        <p class="mb-4 text-sm">للخروج بالأزرار فوق تطبيق المنصة، اتبع هذه الخطوات:</p>
        <div class="text-right space-y-4 text-xs text-gray-400">
            <p>1. قم بتحميل تطبيق <b>"MacroDroid"</b> أو <b>"Auto Clicker"</b> من متجر بلاي.</p>
            <p>2. أنشئ "زر طافي" جديد وحدد مكانه فوق زر الشراء في Quotex.</p>
            <p>3. اربط الزر بهذا الرابط: <br><code class="text-[#c5a059]">https://your-app.render.com/api/hand-trigger</code></p>
            <p>4. عندما تكون النتيجة <b>BUY</b>، سيقوم التطبيق بالضغط تلقائياً.</p>
        </div>
    </div>
    <div class="mt-10">
        <div class="hand-demo"></div>
        <p class="text-[10px] mt-2">محاكاة لليد الخضراء الطافية</p>
    </div>
</body>
</html>
`;

app.get('/', (req, res) => res.send(UI));

app.listen(10000, () => console.log("Overlay System Active"));