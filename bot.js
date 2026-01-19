const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot('7684061554:AAH9p8oTz-L2yP8T4Vj4W4p6Y8p4', {polling: true});

bot.on('message', async (msg) => {
    if (msg.text && msg.text.includes('http')) {
        bot.sendMessage(msg.chat.id, "جاري جلب معلومات الرابط من السيرفر... 🚀");
        try {
            const response = await axios.get(msg.text);
            const title = response.data.match(/<title>(.*?)<\/title>/)[1];
            bot.sendMessage(msg.chat.id, "✅ تم بنجاح: " + title);
        } catch (err) {
            bot.sendMessage(msg.chat.id, "❌ عكّة بسيطة: " + err.message);
        }
    }
});
console.log("البوت شغال بنظام خفيف ومناسب لـ Render!");
