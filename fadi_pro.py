import telebot, subprocess, re, requests

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

print("🚀 سارة شغلت المحرك الذكي.. اطلقني يا فادي!")

def deep_investigate(username):
    # استخدام أداة OSINT حقيقية للبحث في 300+ موقع ومجموعة
    try:
        command = f"npx social-analyzer --username {username}"
        result = subprocess.check_output(command, shell=True, text=True)
        # تصفية النتائج عشان نعطيك المجموعات والروابط بس
        found_links = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', result)
        return "\n".join(set(found_links[:10])) if found_links else "🧐 ما لقيت مجموعات عامة، الحساب محمي بقوة."
    except:
        return "❌ الأداة ذلحين مضغوطة، جرب بعد قليل."

@bot.message_handler(func=lambda m: True)
def handle_all(message):
    input_data = message.text
    bot.reply_to(message, "🔍 ذلحين بدأت الذكاء.. جاري اقتحام قواعد البيانات والبحث عن المجموعات...")
    
    # استخراج اليوزر نيم من الرابط
    username = input_data.split('/')[-1].split('?')[0]
    report = deep_investigate(username)
    
    bot.send_message(message.chat.id, f"📝 التقرير الذكي لـ فادي:\n\n{report}")

bot.polling()
