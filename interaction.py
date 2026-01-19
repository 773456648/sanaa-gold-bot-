import telebot
from playwright.sync_api import sync_playwright
import os

# المعلومات السرية حقك
TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
ADMIN_ID = 5042495708  # الـ ID حقك يا فادي

bot = telebot.TeleBot(TOKEN)
os.environ["DISPLAY"] = ":1"

def run_browser(url):
    with sync_playwright() as p:
        browser = p.chromium.launch_persistent_context(
            user_data_dir="./user_data",
            headless=False,
            args=['--no-sandbox']
        )
        page = browser.new_page()
        page.goto(url)
        title = page.title()
        return title

@bot.message_handler(func=lambda message: True)
def handle_message(message):
    # التأكد إن المرسل هو فادي (صاحب الـ ID)
    if message.from_user.id != ADMIN_ID:
        bot.reply_to(message, "ممنوع اللقافة! البوت هذا حق فادي بس. 😤")
        return

    if 'http' in message.text:
        bot.reply_to(message, "أبشر يا فادي، فتحت لك المتصفح في الـ VNC.. بصره ذلحين! 🚀")
        try:
            title = run_browser(message.text)
            bot.send_message(message.chat.id, f"✅ الصفحة مفتوحة ذلحين: {title}")
        except Exception as e:
            bot.reply_to(message, f"❌ حصلت عكة: {str(e)}")
    else:
        bot.reply_to(message, "ارسل رابط يا مسمار عشان افتحه لك.")

print(f"البوت شغال ومؤمن لـ فادي (ID: {ADMIN_ID})")
bot.infinity_polling()
