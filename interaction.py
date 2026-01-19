import telebot
import requests
from bs4 import BeautifulSoup

TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
ADMIN_ID = 5042495708

bot = telebot.TeleBot(TOKEN)

@bot.message_handler(func=lambda message: True)
def handle_message(message):
    if message.from_user.id != ADMIN_ID:
        return # تجاهل أي شخص غير فادي

    if 'http' in message.text:
        bot.reply_to(message, "أبشر يا فادي، جاري سحب البيانات من قلب السيرفر... 🚀")
        try:
            res = requests.get(message.text, timeout=15)
            soup = BeautifulSoup(res.text, 'html.parser')
            title = soup.title.string if soup.title else "بدون عنوان"
            bot.reply_to(message, f"✅ السيرفر يقول لك العنوان هو: {title}")
        except Exception as e:
            bot.reply_to(message, f"❌ السيرفر تعب شوية: {str(e)}")

print("البوت شغال ذلحين على سيرفر Render مستقر!")
bot.infinity_polling()
