import telebot
from playwright.sync_api import sync_playwright
import os

# التوكن حقك
TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(TOKEN)

# تحديد الشاشة رقم 1 للـ VNC
os.environ["DISPLAY"] = ":1"

def run_browser(url):
    with sync_playwright() as p:
        # تشغيل متصفح حقيقي (مش مخفي) ويحفظ الجلسة
        browser = p.chromium.launch_persistent_context(
            user_data_dir="./user_data",
            headless=False, # عشان تبصره في الـ VNC
            args=['--no-sandbox']
        )
        page = browser.new_page()
        page.goto(url)
        title = page.title()
        # هنا ما غلقنا المتصفح عشان تجلس تبصره في الـ VNC وتسجل دخول
        return title

@bot.message_handler(func=lambda message: True)
def handle_message(message):
    if 'http' in message.text:
        bot.reply_to(message, "فتحت لك المتصفح في الـ VNC.. ادخل بصر!")
        try:
            title = run_browser(message.text)
            bot.send_message(message.chat.id, f"✅ الصفحة مفتوحة ذلحين: {title}")
        except Exception as e:
            bot.reply_to(message, f"❌ عكة: {str(e)}")

print("البوت شغال وبيرسل للمتصفح في الشاشة :1")
bot.infinity_polling()
