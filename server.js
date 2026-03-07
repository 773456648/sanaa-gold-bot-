const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static('public'));

let sharedProperties = [];

app.get('/api/properties', (req, res) => {
    res.json(sharedProperties);
});

app.post('/api/properties', (req, res) => {
    const prop = req.body;
    prop.id = Date.now().toString();
    prop.time = new Date().toLocaleString('ar-YE'); // ميزة وقت النشر
    sharedProperties.unshift(prop); 
    res.json({ success: true });
});

app.post('/api/delete', (req, res) => {
    const { id, password } = req.body;
    const index = sharedProperties.findIndex(p => p.id === id);

    if (index !== -1 && sharedProperties[index].password === password) {
        sharedProperties.splice(index, 1);
        return res.json({ success: true });
    }
    res.json({ success: false, message: "كلمة السر غلط" });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`المنظومة شغالة على منفذ ${PORT}`);
});