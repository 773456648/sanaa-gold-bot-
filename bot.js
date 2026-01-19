const { chromium } = require('playwright');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('7684061554:AAH9p8oTz-L2yP8T4Vj4W4p6Y8p4', {polling: true});
async function runTask(url) {
    const browser = await chromium.launchPersistentContext('./session_data', { headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url);
    const title = await page.title();
    await browser.close();
    return title;
}
bot.on('message', async (msg) => {
    if (msg.text.includes('http')) {
        bot.sendMessage(msg.chat.id, "جاري التنفيذ في السيرفر... 🚀");
        const res = await runTask(msg.text);
        bot.sendMessage(msg.chat.id, "تم بنجاح: " + res);
    }
});
