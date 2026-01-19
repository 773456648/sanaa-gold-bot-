import telebot
import requests
from bs4 import BeautifulSoup
import os

# التوكن حقك يا ذيب
API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

print("🚀 سارة بدأت العمل.. البوت شغال ذلحين يا فادي!")

def deep_analyze(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.text, 'html.parser')
        text = res.text.lower()
        
        findings = []
        if "t.me/" in text: findings.append("👥 مرتبط بمجموعات/قنوات تلجرام")
        if "login" in text or "password" in text: findings.append("🔐 فيه صفحات دخول أو كلمات سر")
        if len(soup.find_all('script')) > 5: findings.append("🕵️ فيه سكربتات كثيرة (احتمال فحص أو تعقب)")
        
        return "\n".join(findings) if findings else "🧐 الرابط سابر بس ما بش فيه حركات واضحة."
    except:
        return "❌ الرابط ما استجاب، يمكنه محظور أو طافي."

@bot.message_handler(commands=['start'])
def welcome(message):
    bot.reply_to(message, "أرحب يا فادي! 🫡\nأنا شغال تلقائياً ذلحين. أرسل لي أي رابط أحلله لك.")

@bot.message_handler(func=lambda m: m.text and m.text.startswith('http'))
def handle_link(message):
    bot.reply_to(message, "⏳ جاري النبش في الرابط..")
    report = deep_analyze(message.text)
    bot.send_message(message.chat.id, f"📝 تقرير فادي الاستخباراتي:\n\n{report}")

bot.polling()
