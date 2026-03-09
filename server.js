const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// عرض الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__citation__, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`FADI SYSTEM PRO is running on port ${port}`);
});