import telebot, requests, re

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

# الكوكيز حقك يا فادي (المفتاح)
FB_COOKIES = {
    'c_user': '100003550913323',
    'xs': '31:yHNizqiAxU5oow:2:1768254323:-1:-1'
}

def get_fb_id(url):
    try:
        res = requests.get(url, timeout=10).text
        id_match = re.search(r'"userID":"(\d+)"|fb://profile/(\d+)|"entity_id":"(\d+)"', res)
        return next(item for item in id_match.groups() if item is not None) if id_match else None
    except: return None

def get_groups_detailed(uid):
    try:
        # استخدام نسخة mbasic لأنها تظهر الأسماء بوضوح في الكود
        url = f"https://mbasic.facebook.com/search/{uid}/groups"
        headers = {'User-Agent': 'Mozilla/5.0'}
        res = requests.get(url, cookies=FB_COOKIES, headers=headers, timeout=15).text
        
        # نبش أسماء المجموعات وروابطها
        # البحث عن أنماط الروابط التي تحتوي على معرفات المجموعات
        groups = re.findall(r'/groups/(\d+)', res)
        
        if groups:
            report = []
            for g_id in list(set(groups))[:10]:
                report.append(f"📦 مجموعة ID: `{g_id}`\n🔗 الرابط: https://facebook.com/groups/{g_id}")
            return "\n\n".join(report)
        return "🧐 دخلت الحساب بس ما قدرت أسحب أسماء المجموعات (يمكن مخفية)."
    except:
        return "❌ حصل خطأ في الاتصال بالقاعدة."

@bot.message_handler(func=lambda m: True)
def handle_spy(message):
    url = message.text
    if "facebook.com" in url or message.text.isdigit():
        bot.reply_to(message, "⏳ جاري استخراج الـ UID وتصفية روابط المجموعات...")
        user_id = get_fb_id(url) if "facebook.com" in url else url
        
        if user_id:
            data = get_groups_detailed(user_id)
            final_msg = f"🎯 **تم الاستخراج يا فادي!**\n🆔 المعرف: `{user_id}`\n\n**📂 روابط المجموعات المكتشفة:**\n\n{data}"
            bot.send_message(message.chat.id, final_msg, parse_mode='Markdown')
        else:
            bot.reply_to(message, "❌ ما قدرت ألاقي الـ ID.")

bot.polling()
