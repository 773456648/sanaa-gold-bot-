const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/call', (req, res) => {
    const { number } = req.body;
    console.log("جاري طلب الاتصال للرقم: " + number);
    // هنا المنظومة ترسل الأمر للمودم عبر IP المودم
    res.send({ status: "تم إرسال الطلب للمودم بنجاح" });
});

app.listen(port, () => {
    console.log(`المنظومة تعمل الآن على الرابط الخاص بك في Render`);
});