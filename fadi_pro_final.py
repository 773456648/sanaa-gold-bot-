import telebot, requests, re

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

# الكوكيز حقك يا ذيب عشان الاقتحام
FB_COOKIES = {
    'c_user': '100003550913323',
    'xs': '31:yHNizqiAxU5oow:2:1768254323:-1:-1'
}

def get_fb_id(url):
    try:
        res = requests.get(url, timeout=10).text
        id_match = re.search(r'"userID":"(\d+)"|fb://profile/(\d+)|"entity_id":"(\d+)"', res)
        if id_match:
            return next(item for item in id_match.groups() if item is not None)
        return None
    except: return None

def get_groups_list(uid):
    try:
        # الدخول لصفحة البحث عن المجموعات بالكوكيز
        search_url = f"https://mbasic.facebook.com/search/{uid}/groups"
        headers = {'User-Agent': 'Mozilla/5.0'}
        res = requests.get(search_url, cookies=FB_COOKIES, headers=headers, timeout=15).text
        
        # استخراج المعرفات والأسماء (محاولة)
        group_ids = re.findall(r'/groups/(\d+)', res)
        if group_ids:
            report = []
            for g_id in list(set(group_ids))[:15]:
                report.append(f"📦 مجموعة: https://www.facebook.com/groups/{g_id}")
            return "\n".join(report)
        return "🧐 دخلت الحساب بس ما لقيت مجموعات عامة ظاهرة."
    except:
        return "❌ حصل خطأ أثناء سحب المجموعات."

@bot.message_handler(func=lambda m: True)
def handle_fadi(message):
    url = message.text
    if "facebook.com" in url:
        bot.reply_to(message, "🔍 جاري استخراج الـ UID ونبش المجموعات... اصبر يا مسمار.")
        user_id = get_fb_id(url)
        
        if user_id:
            groups_data = get_groups_list(user_id)
            final_msg = f"🎯 **تم النحر بنجاح!**\n🆔 المعرف: `{user_id}`\n\n**📂 المجموعات المكتشفة:**\n{groups_data}"
            bot.send_message(message.chat.id, final_msg, parse_mode='Markdown')
        else:
            bot.reply_to(message, "❌ ما قدرت أسحب الـ ID، يمكن الحساب محمي بقوة.")
    else:
        bot.reply_to(message, "ارسل رابط حساب فيسبوك.")

bot.polling()
