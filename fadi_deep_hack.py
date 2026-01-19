import telebot, requests, re

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

# الكوكيز حقك (الوقود)
FB_COOKIES = "c_user=100003550913323; xs=31:yHNizqiAxU5oow:2:1768254323:-1:-1;"

def get_groups_by_force(uid):
    try:
        # رابط GraphQL اللي يستخدمه تطبيق فيسبوك لسحب المجموعات
        headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
            'Cookie': FB_COOKIES,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': 'https://m.facebook.com/'
        }
        
        # ندخل لصفحة المجموعات في نسخة الموبايل "القديمة" لأنها تسرب البيانات
        res = requests.get(f"https://m.facebook.com/{uid}/groups", headers=headers, timeout=20).text
        
        # نبش الروابط والأسماء باستخدام Regex "نحيت"
        groups = re.findall(r'href="/groups/(\d+)/.*?>(.*?)<', res)
        
        if groups:
            report = ""
            for g_id, g_name in list(set(groups))[:20]:
                if "span" not in g_name: # تصفية الأكواد الزائدة
                    report += f"📦 **{g_name}**\n🔗 https://facebook.com/groups/{g_id}\n\n"
            return report if report else "🧐 الحساب هذا مغلّق بقفل حديد، حتى الـ GraphQL ما قدر له."
        else:
            return "🧐 ما لقيت ولا مجموعة عامة، الشخص هذا إما مش مشترك في مجموعات أو مخفي تماماً."
    except Exception as e:
        return f"❌ حصل خطأ في الاختراق: {str(e)}"

@bot.message_handler(func=lambda m: True)
def handle(message):
    uid = re.search(r'(\d{10,})', message.text)
    if uid:
        bot.reply_to(message, "🔦 ذلحين اشتغلت المهرة الصدق.. جاري الاقتحام!")
        result = get_groups_by_force(uid.group(1))
        bot.send_message(message.chat.id, f"🎯 **نتيجة سارة لـ فادي:**\n\n{result}", disable_web_page_preview=True)
    else:
        bot.reply_to(message, "ارسل الـ ID يا مسمار.")

bot.polling()
