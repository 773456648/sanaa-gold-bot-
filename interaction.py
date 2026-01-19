import telebot
from playwright.sync_api import sync_playwright

TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
ADMIN_ID = 5042495708
bot = telebot.TeleBot(TOKEN)

@bot.message_handler(func=lambda message: True)
def handle(message):
    if message.from_user.id != ADMIN_ID: return
    
    if 'http' in message.text:
        bot.reply_to(message, "جاري فتح الصفحة وتصويرها لك... 📸")
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(args=['--no-sandbox'])
                page = browser.new_page()
                page.goto(message.text)
                # يأخذ صورة للصفحة ويرسلها لك
                page.screenshot(path="screen.png")
                bot.send_photo(message.chat.id, open("screen.png", 'rb'), caption=f"✅ هذي صورتها يا فادي: {page.title()}")
                browser.close()
        except Exception as e:
            bot.reply_to(message, f"❌ عكة: {str(e)}")

print("بوت الصور شغال!")
bot.infinity_polling()
