import telebot, requests, re

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

# الكوكيز حقك يا فادي (بدل التوكن عشان يفتح الأبواب)
MY_COOKIES = {
    'c_user': '100003550913323',
    'xs': '31:yHNizqiAxU5oow:2:1768254323:-1:-1'
}

def get_fb_id(target):
    # محاولة جلب الـ ID سواء أرسلت يوزر نيم أو رابط
    try:
        res = requests.get(target, timeout=10).text
        id_match = re.search(r'"userID":"(\d+)"|fb://profile/(\d+)', res)
        return next(item for item in id_match.groups() if item is not None)
    except: return target if target.isdigit() else None

def scan_groups(uid):
    try:
        # استخدام رابط 'mbasic' لأنه يسرب الأسماء والروابط مثل التطبيقات القديمة
        url = f"https://mbasic.facebook.com/{uid}/groups"
        headers = {'User-Agent': 'Mozilla/5.0'}
        res = requests.get(url, cookies=MY_COOKIES, headers=headers, timeout=15).text
        
        # استخراج أسماء المجموعات وروابطها مع بعض
        # البحث عن النمط: <a href="/groups/ID">NAME</a>
        found = re.findall(r'href="/groups/(\d+)/?.*?>(.*?)</a>', res)
        
        if found:
            report = ""
            for g_id, g_name in list(set(found))[:15]:
                if "span" not in g_name: # تنظيف النتيجة
                    report += f"📦 **{g_name}**\n🔗 https://facebook.com/groups/{g_id}\n\n"
            return report
        return "🧐 الحساب مأمن، أو الكوكيز حقتك تحتاج تحديث."
    except: return "❌ حصل خطأ في الاتصال."

@bot.message_handler(func=lambda m: True)
def handle_fadi(message):
    bot.reply_to(message, "⏳ جاري بدء 'المسح' مثل التطبيق.. اصبر يا مسمار.")
    uid = get_fb_id(message.text)
    
    if uid:
        data = scan_groups(uid)
        final_msg = f"🎯 **نتائج المسح لـ فادي:**\n🆔 المعرف: `{uid}`\n\n{data}"
        bot.send_message(message.chat.id, final_msg, disable_web_page_preview=True, parse_mode='Markdown')
    else:
        bot.reply_to(message, "ارسل رابط الحساب أو الـ ID يا ذيب.")

bot.polling()
