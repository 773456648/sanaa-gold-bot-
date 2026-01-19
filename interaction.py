import telebot
import requests
from bs4 import BeautifulSoup

# التوكن حقك الجديد يا مسمار
TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'

bot = telebot.TeleBot(TOKEN)

@bot.message_handler(func=lambda message: True)
def echo_all(message):
    if 'http' in message.text:
        bot.reply_to(message, "جاري العمل من قلب السيرفر يا مسمار... 🚀")
        try:
            res = requests.get(message.text, timeout=10)
            soup = BeautifulSoup(res.text, 'html.parser')
            title = soup.title.string if soup.title else "بدون عنوان"
            bot.reply_to(message, f"✅ تم بنجاح جلب العنوان: {title}")
        except Exception as e:
            bot.reply_to(message, f"❌ حصلت عكة بسيطة: {str(e)}")

print("البوت شغال ذلحين بالتوكن الصحيح!")
bot.infinity_polling()
