import telebot, requests, re

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

print("🚀 سارة شغلت 'البوت القناص'.. ارسل الاسم أو الرابط يا فادي!")

def google_scout(query):
    try:
        # البحث عن اسم المستخدم في مجموعات فيسبوك وتلجرام عبر قوقل
        search_url = f"https://www.google.com/search?q=site:facebook.com/groups OR site:t.me {query}"
        headers = {'User-Agent': 'Mozilla/5.0'}
        res = requests.get(search_url, headers=headers, timeout=15)
        
        # استخراج الروابط
        links = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', res.text)
        relevant = [l for l in links if "facebook.com/groups" in l or "t.me" in l]
        
        if relevant:
            return "🎯 صيد استخباراتي! لقيت نشاط لهذا الشخص هنا:\n\n" + "\n".join(set(relevant[:5]))
        else:
            return "🧐 بحثت في الأرشيف وما لقيت مجموعات عامة مرتبطة به."
    except:
        return "❌ محرك البحث محظور ذلحين، جرب بعد ثواني."

@bot.message_handler(func=lambda m: True)
def handle_spy(message):
    bot.reply_to(message, "🔦 جاري النبش في أرشيف الإنترنت والمجموعات...")
    # استخراج اليوزر من الرابط
    user = message.text.split('/')[-1].replace('?', ' ')
    report = google_scout(user)
    bot.send_message(message.chat.id, f"📝 التقرير القناص لـ فادي:\n\n{report}")

bot.polling()
