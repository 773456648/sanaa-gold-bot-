import telebot, requests, re

# التوكن حقك يا ذيب
API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

print("🚀 سارة بدأت العمل! البوت شغال ذلحين، ادخل التلجرام يا مسمار.")

def fadi_investigator(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        res = requests.get(url, headers=headers, timeout=15)
        content = res.text
        
        # صيد روابط المجموعات
        fb_groups = re.findall(r'facebook\.com/groups/[\w\.]+', content)
        tg_links = re.findall(r't\.me/[\w\.\+]+', content)
        wa_links = re.findall(r'chat\.whatsapp\.com/[\w]+', content)
        emails = re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', content)

        report = []
        if fb_groups: report.append("👥 مجموعات فيسبوك:\n" + "\n".join(set(fb_groups)))
        if tg_links: report.append("✈️ روابط تلجرام:\n" + "\n".join(set(tg_links)))
        if wa_links: report.append("🟢 مجموعات واتساب:\n" + "\n".join(set(wa_links)))
        if emails: report.append("📧 إيميلات مكتشفة:\n" + "\n".join(set(emails)))

        return "\n\n".join(report) if report else "🧐 نبشت الرابط وما لقيت فيه مجموعات مكشوفة."
    except:
        return "❌ الرابط ما فتح معي، يمكنه محمي أو طافي."

@bot.message_handler(commands=['start'])
def welcome(message):
    bot.reply_to(message, "أرحب يا مسمار! 🫡\nأرسل لي أي رابط (فيسبوك، موقع، قناة) وأنا أطلع لك كل المجموعات والروابط اللي داخله.")

@bot.message_handler(func=lambda m: m.text and "http" in m.text)
def handle_msg(message):
    bot.reply_to(message, "⏳ جاري الاقتحام والتحري..")
    result = fadi_investigator(message.text)
    bot.send_message(message.chat.id, f"📝 تقرير الاستخبارات لـ فادي:\n\n{result}")

bot.polling()
