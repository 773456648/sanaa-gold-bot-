import telebot, re

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

@bot.message_handler(func=lambda m: True)
def handle_spy(message):
    uid = re.search(r'(\d{10,})', message.text)
    if uid:
        id = uid.group(1)
        bot.reply_to(message, "🔦 ذلحين عأطلع لك أثره في المجموعات غصب.. افتح هذي الروابط:")
        
        report = f"""
🎯 **نحر المنشورات والنشاط (UID: {id}):**

1️⃣ **المنشورات اللي نشرها في مجموعات عامة:**
https://www.facebook.com/search/{id}/stories-published

2️⃣ **التعليقات اللي كتبها في المجموعات:**
https://www.facebook.com/search/{id}/stories-commented

3️⃣ **الصور اللي تم الإشارة إليه فيها:**
https://www.facebook.com/search/{id}/photos-of

💡 *يا فادي، لو دخلت على أول رابط "Stories Published" عتبسر كل منشوراته في المجموعات، ومن هناك ادخل المجموعة اللي تعجبك.*
"""
        bot.send_message(message.chat.id, report, disable_web_page_preview=True)
    else:
        bot.reply_to(message, "أرسل الـ ID يا مسمار.")

bot.polling()
