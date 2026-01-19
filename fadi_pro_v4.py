import telebot, requests, re

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

def get_fb_id(url):
    try:
        res = requests.get(url, timeout=10).text
        # محاولة سحب الـ ID من الكود المصدري
        id_match = re.search(r'"userID":"(\d+)"|fb://profile/(\d+)|"entity_id":"(\d+)"', res)
        if id_match:
            return next(item for item in id_match.groups() if item is not None)
        return None
    except:
        return None

@bot.message_handler(func=lambda m: True)
def handle_fadi(message):
    url = message.text
    if "facebook.com" in url:
        bot.reply_to(message, "🔍 جاري استخراج المعرف الرقمي (UID) وفتح الثغرة...")
        user_id = get_fb_id(url)
        
        if user_id:
            # روابط Monokai السرية للبحث العميق
            report = f"""
🎯 **تم استخراج البيانات يا فادي!**
🆔 المعرف: `{user_id}`

🧬 **روابط الاستكشاف (اضغط وشوف بنفسك):**
1️⃣ المجموعات المشترك بها:
https://www.facebook.com/search/{user_id}/groups

2️⃣ المنشورات اللي علق عليها:
https://www.facebook.com/search/{user_id}/stories-commented

3️⃣ الصور اللي سوى لها لايك:
https://www.facebook.com/search/{user_id}/photos-liked

💡 *ملاحظة: افتح الروابط بمتصفح مسجل فيه حسابك.*
"""
            bot.send_message(message.chat.id, report, parse_mode='Markdown')
        else:
            bot.reply_to(message, "❌ ما قدرت أسحب الـ ID، تأكد إن الرابط صحيح يا ذيب.")

bot.polling()
