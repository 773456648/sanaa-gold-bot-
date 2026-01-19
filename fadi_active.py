import telebot, requests, re

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

print("🚀 سارة شغلت المحرك ذلحين.. أرسل الـ ID يا فادي!")

def get_groups_fixed(uid):
    try:
        # البحث في واجهة فيسبوك المفتوحة
        url = f"https://mbasic.facebook.com/{uid}?v=timeline"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        res = requests.get(url, headers=headers, timeout=10).text
        
        # نبش أي أثر لمجموعات أو روابط
        groups = re.findall(r'groups/(\d+)', res)
        
        if groups:
            return "\n".join([f"🔗 https://facebook.com/groups/{g}" for g in set(groups)])
        else:
            return "🧐 الحساب مأمن، جرب ترسل يوزر نيم الشخص مباشرة."
    except:
        return "❌ فيسبوك رفض الطلب، جرب بعد شوية."

@bot.message_handler(func=lambda m: True)
def handle(message):
    uid = re.findall(r'\d+', message.text)
    if uid:
        bot.reply_to(message, f"⏳ جاري النبش عن مجموعات `{uid[0]}`...")
        result = get_groups_fixed(uid[0])
        bot.send_message(message.chat.id, f"🎯 نتائج فادي:\n\n{result}")
    else:
        bot.reply_to(message, "أرسل الـ ID الصافي يا مسمار.")

bot.polling()
