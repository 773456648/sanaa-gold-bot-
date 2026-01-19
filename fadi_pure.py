import telebot, requests, re

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

# الكوكيز حقك عشان نكسر الحاجز
MY_COOKIES = {
    'c_user': '100003550913323',
    'xs': '31:yHNizqiAxU5oow:2:1768254323:-1:-1'
}

def get_only_groups(target_id):
    try:
        url = f"https://mbasic.facebook.com/{target_id}/groups"
        headers = {'User-Agent': 'Mozilla/5.0'}
        res = requests.get(url, cookies=MY_COOKIES, headers=headers, timeout=15).text
        
        # استخراج روابط المجموعات فقط
        links = re.findall(r'/groups/(\d+)', res)
        if links:
            return "\n".join([f"🔗 https://facebook.com/groups/{l}" for l in set(links)])
        return "🧐 ما لقيت مجموعات ظاهرة، يمكن الحساب مخفي تماماً."
    except:
        return "❌ فيسبوك رفض الاتصال، جرب بعد ثواني."

@bot.message_handler(func=lambda m: True)
def handle_msg(message):
    uid = re.search(r'\d+', message.text)
    if uid:
        bot.reply_to(message, "⏳ جاري تصفية المجموعات فقط...")
        report = get_only_groups(uid.group())
        bot.send_message(message.chat.id, f"📦 مجموعات الهدف:\n\n{report}")
    else:
        bot.reply_to(message, "أرسل الـ ID حق الشخص يا مسمار.")

bot.polling()
