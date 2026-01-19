import telebot
import requests
from bs4 import BeautifulSoup

bot = telebot.TeleBot('7684061554:AAH9p8oTz-L2yP8T4Vj4W4p6Y8p4')

@bot.message_handler(func=lambda message: True)
def echo_all(message):
    if 'http' in message.text:
        bot.reply_to(message, "جاري سحب المعلومات من السيرفر... 🚀")
        try:
            res = requests.get(message.text)
            soup = BeautifulSoup(res.text, 'html.parser')
            title = soup.title.string if soup.title else "بدون عنوان"
            bot.reply_to(message, f"✅ تم بنجاح: {title}")
        except Exception as e:
            bot.reply_to(message, f"❌ حصلت عكة: {str(e)}")

print("البوت شغال ذلحين بنظام بايثون المتوافق مع Render!")
bot.infinity_polling()
