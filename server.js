const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;
const DELETE_SECRET = "heiba_777_delete_2026"; // 👈 غيرها لو تبي

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// ------------------- رابط قاعدة البيانات (عدل هذا فقط) -------------------
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://heiba:heiba123@cluster0.xxxxx.mongodb.net/trading?retryWrites=true&w=majority";
// ⚠️ غير الرابط أعلاه برابطك من MongoDB Atlas
// مثال: mongodb+srv://heiba:heiba123@cluster0.abcd1.mongodb.net/trading

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ متصل بقاعدة البيانات السحابية'))
    .catch(err => console.error('❌ فشل الاتصال:', err.message));

// ------------------- نماذج البيانات -------------------
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: { type: String, default: 'user' }
});

const TradeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    asset: String,
    side: String,
    amount: Number,
    entryPrice: Number,
    status: { type: String, default: 'OPEN' },
    timestamp: { type: Date, default: Date.now }
});

const BotSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    token: String,
    chatId: String
});

const User = mongoose.model('User', UserSchema);
const Trade = mongoose.model('Trade', TradeSchema);
const Bot = mongoose.model('Bot', BotSchema);

// ------------------- API -------------------

app.post('/api/login', async (req, res) => {
    const { password } = req.body;
    
    if(password === '771232690') {
        let user = await User.findOne({ username: 'admin' });
        if(!user) {
            user = new User({ username: 'admin', password: '771232690', role: 'admin' });
            await user.save();
        }
        return res.json({ success: true, userId: user._id, role: user.role, username: user.username });
    }
    
    const user = await User.findOne({ password });
    if(user) {
        return res.json({ success: true, userId: user._id, role: user.role, username: user.username });
    }
    
    res.json({ success: false, error: 'كلمة سر خطأ' });
});

app.post('/api/users', async (req, res) => {
    const { adminPassword, newUsername, newPassword } = req.body;
    
    if(adminPassword !== '771232690') {
        return res.status(403).json({ error: 'ما لك صلاحية' });
    }
    
    const existing = await User.findOne({ password: newPassword });
    if(existing) {
        return res.status(400).json({ error: 'المستخدم موجود' });
    }
    
    const user = new User({ username: newUsername, password: newPassword, role: 'user' });
    await user.save();
    res.json({ success: true, userId: user._id });
});

app.get('/api/trades/:userId', async (req, res) => {
    const trades = await Trade.find({ userId: req.params.userId });
    res.json(trades);
});

app.get('/api/all-trades/:adminId', async (req, res) => {
    const admin = await User.findById(req.params.adminId);
    if(admin.role !== 'admin') {
        return res.status(403).json({ error: 'صلاحية أدمن مطلوبة' });
    }
    const trades = await Trade.find().populate('userId', 'username');
    res.json(trades);
});

app.post('/api/trade', async (req, res) => {
    const { userId, asset, side, amount, entryPrice } = req.body;
    
    const trade = new Trade({ userId, asset, side, amount, entryPrice });
    await trade.save();
    res.json(trade);
});

app.delete('/api/trade/:id', async (req, res) => {
    const { deleteSecret, userId } = req.body;
    
    if(deleteSecret !== DELETE_SECRET) {
        return res.status(403).json({ error: 'كلمة سر الحذف غلط' });
    }
    
    const user = await User.findById(userId);
    const trade = await Trade.findById(req.params.id);
    
    if(!trade) {
        return res.status(404).json({ error: 'الصفقة مو موجودة' });
    }
    
    if(user.role === 'admin' || trade.userId.toString() === userId) {
        await Trade.findByIdAndDelete(req.params.id);
        return res.json({ success: true });
    }
    
    res.status(403).json({ error: 'ما لك صلاحية' });
});

app.listen(PORT, () => {
    console.log(`🚀 HEIBA CLOUD ACTIVE ON PORT ${PORT}`);
    console.log(`📍 افتح المتصفح على: http://localhost:${PORT}`);
});