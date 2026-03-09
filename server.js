const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

const MODEM_IP = "192.168.8.1";
const MODEM_PASS = "7712326900"; // كلمة السر الخاصة بك

app.use(express.static('public'));
app.use(express.json());

// نقطة النهاية لإرسال أمر الاتصال
app.post('/api/fadi-call', async (req, res) => {
    const { number } = req.body;
    
    try {
        // الخطوة 1: جلب التوكن من المودم
        const response = await axios.get(`http://${MODEM_IP}/api/webserver/SesTokInfo`);
        const token = response.data.match(/<TokInfo>([^<]+)/)[1];

        // الخطوة 2: إرسال أمر الاتصال الصوتي
        const xmlData = `<?xml version="1.0" encoding="UTF-8"?><request><phonenumber>${number}</phonenumber></request>`;
        
        await axios.post(`http://${MODEM_IP}/api/voice/call`, xmlData, {
            headers: {
                '__RequestVerificationToken': token,
                'Content-Type': 'application/xml'
            }
        });

        res.json({ success: true, message: `تم طلب الرقم ${number} بنجاح` });
    } catch (error) {
        res.status(500).json({ success: false, message: "تعذر الوصول للمودم. تأكد من اتصال السيرفر بالشبكة المحلية." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FADI SYSTEM running on port ${PORT}`));