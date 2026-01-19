import telebot, requests, re

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
# ملاحظة: عشان يشتغل بقوة Monokai لازم يكون معك FB_TOKEN
# ذلحين بنخليه يبحث بالذكاء المفتوح
bot = telebot.TeleBot(API_TOKEN)

print("🚀 بوت 'مسمار توول' شغال.. أرسل الرابط وأنحره فحص!")

def extract_groups(target_url):
    try:
        # استخراج المعرف (ID) أو اليوزر نيم
        user_id = target_url.split('/')[-1].split('?')[0]
        
        # محاكاة البحث في مكاتب الفيسبوك المفتوحة
        search_query = f"https://www.facebook.com/search/groups/?q={user_id}"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        
        res = requests.get(search_url, headers=headers, timeout=15)
        # البحث عن أنماط المجموعات في الكود
        found_groups = re.findall(r'facebook\.com/groups/(\d+)', res.text)
        
        if found_groups:
            links = [f"🔗 https://www.facebook.com/groups/{g}" for g in set(found_groups)]
            return "🎯 صيد Monokai! لقيت نشاط في هذه المجموعات:\n\n" + "\n".join(links[:10])
        else:
            return "🧐 الحساب مأمن أو المجموعات خاصة (Private). جرب تبحث بالاسم الصريح."
    except:
        return "❌ حصل خطأ في الاتصال بقواعد البيانات."

@bot.message_handler(func=lambda m: True)
def handle_fadi(message):
    bot.reply_to(message, "🔍 جاري تشغيل محرك 'Monokai' للبحث عن المجموعات...")
    report = extract_groups(message.text)
    bot.send_message(message.chat.id, f"📝 تقرير مسمار لـ فادي:\n\n{report}")

bot.polling()
