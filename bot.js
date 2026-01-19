const { chromium } = require('playwright');
const TelegramBot = require('node-telegram-bot-api');

// حط توكن بوتك هنا
const bot = new TelegramBot('YOUR_TELEGRAM_TOKEN', {polling: true});

async function runTask(url) {
    // تشغيل المتصفح باستخدام "ملف الجلسة" اللي سحبناه من VNC
    const browser = await chromium.launchPersistentContext('./user_data', {
        headless: true // خليه true عشان يشتغل في خلفية السيرفر
    });
    
    const page = await browser.newPage();
    await page.goto(url);
    
    // مثال: سحب عنوان الصفحة أو عمل أي مهرة
    const title = await page.title();
    console.log(`تم فتح: ${title}`);
    
    await browser.close();
    return title;
}

// استقبال الروابط من تليجرام
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const url = msg.text;

    if (url.includes('facebook.com')) {
        bot.sendMessage(chatId, "جاري التنفيذ داخل الجلسة الحقيقية... 🚀");
        const result = await runTask(url);
        bot.sendMessage(chatId, `تمت المهمة في: ${result}`);
    }
});

