import telebot, requests, re

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

print("🚀 المحرك الاستخباراتي شغال.. ارسل الرابط يا مسمار!")

def fadi_scanner(url):
    try:
        # محاكاة متصفح حقيقي لتخطي الحجب البسيط
        headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G960F) AppleWebKit/537.36',
            'Accept-Language': 'ar-YE,ar;q=0.9'
        }
        session = requests.Session()
        res = session.get(url, headers=headers, timeout=15)
        
        # البحث عن روابط المجموعات (فيسبوك، تلجرام، واتساب)
        groups = re.findall(r'facebook\.com/groups/[\w\.]+|t\.me/[\w\.\+]+|chat\.whatsapp\.com/[\w]+', res.text)
        
        if groups:
            return "🔍 لقيت لك هذه المجموعات والروابط المرتبطة:\n\n" + "\n".join(set(groups))
        else:
            return "🧐 نبشت الرابط وما لقيت مجموعات مكشوفة للعلن، الحساب مأمن بقوة."
    except Exception as e:
        return f"❌ حصل خطأ في الاقتحام: {str(e)}"

@bot.message_handler(func=lambda m: True)
def handle_all(message):
    if "http" in message.text:
        bot.reply_to(message, "⏳ جاري الاقتحام والبحث عن المجموعات والروابط...")
        report = fadi_scanner(message.text)
        bot.send_message(message.chat.id, f"📝 التقرير الذكي لـ فادي:\n\n{report}")
    else:
        bot.reply_to(message, "ارسل رابط حساب أو مجموعة عشان أحللها لك يا ذيب.")

bot.polling()
