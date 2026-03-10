const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { RSI, SMA } = require('technicalindicators');

const app = express();
app.use(cors());
app.use(express.json());

// --- الإعدادات ---
const MASTER_KEY = "771232690";
let linkedUsers = [];

/**
 * جلب بيانات السوق الحقيقية من Binance
 * سنستخدم زوج BTCUSDT كمؤشر عام للسوق
 */
async function fetchMarketData(symbol = "BTCUSDT") {
    try {
        const response = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=100`);
        return response.data.map(d => ({
            close: parseFloat(d[4]), // سعر الإغلاق
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            volume: parseFloat(d[5])
        }));
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        return null;
    }
}

/**
 * المحرك التحليلي الحقيقي (Real Technical Analysis)
 */
async function analyzeMarket() {
    const data = await fetchMarketData();
    if (!data) return { signal: "خطأ في الاتصال", type: "ERROR" };

    const prices = data.map(d => d.close);
    
    // 1. حساب مؤشر RSI (فترة 14)
    const rsiValues = RSI.calculate({ values: prices, period: 14 });
    const currentRSI = rsiValues[rsiValues.length - 1];

    // 2. حساب المتوسط المتحرك البسيط SMA (فترة 10)
    const smaValues = SMA.calculate({ values: prices, period: 10 });
    const currentSMA = smaValues[smaValues.length - 1];
    const currentPrice = prices[prices.length - 1];

    let result = {
        signal: "تحليل السوق... 📊",
        type: "WAIT",
        confidence: 0,
        color: "#555",
        instruction: "السوق متذبذب، انتظر لحظة الاختراق."
    };

    // استراتيجية الاختراق والارتداد:
    // شراء إذا كان RSI أقل من 30 (تشبع بيعي) والسعر بدأ يرتفع فوق المتوسط
    if (currentRSI < 30 && currentPrice > currentSMA) {
        result = {
            signal: "دخول شراء 🟢",
            type: "CALL",
            confidence: (100 - currentRSI).toFixed(2),
            color: "#00ff41",
            instruction: "إشارة ارتداد قوية - شراء لمدة 1-3 دقائق"
        };
    } 
    // بيع إذا كان RSI أعلى من 70 (تشبع شرائي) والسعر كسر المتوسط للأسفل
    else if (currentRSI > 70 && currentPrice < currentSMA) {
        result = {
            signal: "دخول بيع 🔴",
            type: "PUT",
            confidence: currentRSI.toFixed(2),
            color: "#ff4500",
            instruction: "إشارة تشبع شرائي - بيع لمدة 1-3 دقائق"
        };
    }

    return { ...result, rsi: currentRSI.toFixed(2), price: currentPrice };
}

// واجهة المستخدم (HTML المستضافة)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>ATOMIC REAL-TIME | نظام التحليل الحقيقي</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                body { background: #050505; color: white; font-family: sans-serif; }
                .card { background: rgba(20,20,20,0.8); border: 1px solid #c5a059; }
            </style>
        </head>
        <body class="p-10">
            <div class="max-w-2xl mx-auto text-center">
                <h1 class="text-4xl font-bold mb-8 text-[#c5a059]">ATOMIC LIVE SCANNER</h1>
                <div class="card p-10 rounded-3xl shadow-2xl">
                    <div id="sig" class="text-6xl font-black mb-4">LOADING...</div>
                    <div id="acc" class="text-2xl text-gray-400 mb-6">Confidence: --%</div>
                    <div class="grid grid-cols-2 gap-4 text-sm mb-6 text-gray-500">
                        <div class="bg-black/50 p-3 rounded">RSI: <span id="rsi-val">--</span></div>
                        <div class="bg-black/50 p-3 rounded">PRICE: <span id="price-val">--</span></div>
                    </div>
                    <p id="instr" class="italic text-yellow-500">جاري الاتصال بسيرفرات Binance...</p>
                </div>
            </div>
            <script>
                async function update() {
                    try {
                        const r = await fetch('/api/signal');
                        const d = await r.json();
                        document.getElementById('sig').innerText = d.signal;
                        document.getElementById('sig').style.color = d.color;
                        document.getElementById('acc').innerText = "Confidence: " + d.confidence + "%";
                        document.getElementById('rsi-val').innerText = d.rsi;
                        document.getElementById('price-val').innerText = d.price;
                        document.getElementById('instr').innerText = d.instruction;
                    } catch(e) {}
                }
                setInterval(update, 3000);
            </script>
        </body>
        </html>
    `);
});

app.get('/api/signal', async (req, res) => {
    const analysis = await analyzeMarket();
    res.json(analysis);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('REAL ANALYTICS ENGINE START'));