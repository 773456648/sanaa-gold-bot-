const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// هذا السطر هو الأهم: يخبر السيرفر أن يبحث عن الملفات في نفس المجلد
app.use(express.static(path.join(__dirname, '.')));

let registeredBots = [];
const MASTER_KEY = "771232690";

async function sendRoyalInstructions(token, chatid, userName) {
    const msg = `👑 *مَنْظُومَةُ الهَيْبَةِ* 👑\nمرحباً بك يا *${userName}* في وحدة النخبة.`;
    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatid,
            text: msg,
            parse_mode: 'Markdown'
        });
    } catch (e) { console.log("Telegram Error"); }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/bots', (req, res) => res.json(registeredBots));

app.post('/api/bots/register', async (req, res) => {
    const { name, token, chatid, password } = req.body;
    if (password !== MASTER_KEY) return res.status(401).json({ error: "خطأ في الباسورد" });
    const newBot = { id: Date.now(), name, token, chatid };
    registeredBots.push(newBot);
    await sendRoyalInstructions(token, chatid, name);
    res.json({ success: true });
});

app.post('/api/bots/remove', (req, res) => {
    const { id, password } = req.body;
    if (password !== MASTER_KEY) return res.status(401).json({ error: "صلاحية مرفوضة" });
    registeredBots = registeredBots.filter(b => b.id !== id);
    res.json({ success: true });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));