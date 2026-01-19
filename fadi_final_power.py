import telebot, re

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

print("🚀 سارة شغلت 'الرادار النووي'.. أرحب يا فادي!")

@bot.message_handler(func=lambda m: True)
def handle_spy(message):
    # استخراج الـ ID سواء أرسل رابط أو رقم
    uid_match = re.search(r'(\d{10,})', message.text)
    if uid_match:
        uid = uid_match.group(1)
        bot.reply_to(message, f"⏳ جاري تجهيز 'مفاتيح' الاقتحام للمعرف `{uid}`...")
        
        # هذه الروابط تكسر خصوصية البروفايل وتوريك نشاطه في المجموعات غصب
        report = f"""
🎯 **تم النحر يا فادي! (اضغط الروابط وابسر المهرة):**

🆔 المعرف: `{uid}`

📦 **[1] المجموعات والنشاط العام:**
https://www.facebook.com/search/{uid}/groups-joined

💬 **[2] المنشورات اللي علق عليها (فضحته):**
https://www.facebook.com/search/{uid}/stories-commented

👍 **[3] لايكاته في كل مكان:**
https://www.facebook.com/search/{uid}/photos-liked

👥 **[4] أصدقاؤه والناس اللي يتابعهم:**
https://www.facebook.com/search/{uid}/friends

💡 *ملاحظة: الروابط هذي تفتح لك "كنز" معلومات في متصفحك ما يقدر فيسبوك يخفيها.*
"""
        bot.send_message(message.chat.id, report, disable_web_page_preview=True)
    else:
        bot.reply_to(message, "ارسل رابط الشخص أو الـ ID حقه يا ذيب.")

bot.polling()
