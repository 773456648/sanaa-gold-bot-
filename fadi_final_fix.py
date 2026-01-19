import telebot, requests, re

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

# الكوكيز حقك يا فادي (المفتاح السحري)
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

def get_groups_perfect(uid):
    try:
        # استخدام واجهة الموبايل القديمة لأنها "تسرب" المجموعات بسهولة أكبر
        url = f"https://m.facebook.com/{uid}/groups"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G960F) AppleWebKit/537.36',
            'Accept-Language': 'ar-YE,ar;q=0.9'
        }
        res = requests.get(url, cookies=FB_COOKIES, headers=headers, timeout=15).text
        
        # استخراج الروابط بذكاء أكبر
        group_links = re.findall(r'href="/groups/(\d+)', res)
        
        if group_links:
            report = []
            for g_id in list(set(group_links))[:15]:
                # محاولة جلب اسم المجموعة (بسيط)
                report.append(f"📦 مجموعة: https://www.facebook.com/groups/{g_id}")
            return "\n".join(report)
        else:
            return "🧐 دخلت الحساب بس المجموعات مخفية تماماً عن هويتك الرقمية."
    except Exception as e:
        return f"❌ حصل خطأ في الاقتحام: {str(e)}"

@bot.message_handler(func=lambda m: True)
def handle_final(message):
    url = message.text
    if "facebook.com" in url or url.isdigit():
        bot.reply_to(message, "⏳ ذلحين عأشغل عقلي صح.. جاري نحر المجموعات والروابط...")
        user_id = get_fb_id(url) if "facebook.com" in url else url
        
        if user_id:
            groups = get_groups_perfect(user_id)
            final_msg = f"🎯 **تم الاستخراج يا فادي!**\n🆔 المعرف: `{user_id}`\n\n**📂 قائمة المجموعات المكتشفة:**\n\n{groups}"
            bot.send_message(message.chat.id, final_msg, disable_web_page_preview=True)
        else:
            bot.reply_to(message, "❌ ما بش معرف (ID) لهذا الرابط، تأكد منه.")
    else:
        bot.reply_to(message, "ارسل رابط الحساب عشان أوريك المهرة.")

bot.polling()
