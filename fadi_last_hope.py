import telebot, requests, re

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

@bot.message_handler(func=lambda m: True)
def handle_fadi(message):
    bot.reply_to(message, "🔎 جاري البحث عن 'أثر' الشخص في مجموعات فيسبوك المفتوحة...")
    # استخراج اليوزر نيم
    user = message.text.split('/')[-1]
    
    # روابط بحث يدوية "خارقة" للبحث عن التعليقات والمنشورات
    report = f"""
🎯 **يا فادي، لو ما طلع شيء هنا، فالحساب "شبح" ومخفي تماماً:**

1️⃣ البحث عن تعليقاته ومنشوراته في المجموعات:
https://www.facebook.com/search/posts/?q={user}

2️⃣ البحث عن الإشارات (Mentions) له:
https://www.facebook.com/search/top/?q={user}

💡 *نصيحة سارة: افتح الروابط هذي بمتصفحك، وشوف "المنشورات" (Posts) عتبسر المجموعات اللي هو معلق فيها.*
"""
    bot.send_message(message.chat.id, report)

bot.polling()
