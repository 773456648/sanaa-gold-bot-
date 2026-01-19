import telebot, re

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

print("🚀 رادار سارة العالمي شغال.. ارسل الـ ID يا مسمار!")

@bot.message_handler(func=lambda m: True)
def handle_spy(message):
    uid_match = re.search(r'(\d{10,})', message.text)
    if uid_match:
        uid = uid_match.group(1)
        bot.reply_to(message, "⏳ جاري توليد روابط الاقتحام.. اضغطها وعتشوف المجموعات طوالي!")
        
        # إضافة locale=en_US هي السر عشان يشتغل الرابط وما يرجعك لصفحتك
        report = f"""
🎯 **تم النحر بنجاح يا فادي!**
🆔 المعرف: `{uid}`

🌍 **روابط التنقيب (تشتغل مع أي لغة):**

📦 **[1] مجموعاته المشترك فيها:**
https://www.facebook.com/search/{uid}/groups-joined?locale=en_US

💬 **[2] تعليقاته في كل مكان:**
https://www.facebook.com/search/{uid}/stories-commented?locale=en_US

👍 **[3] الصور اللي سوى لها لايك:**
https://www.facebook.com/search/{uid}/photos-liked?locale=en_US

👥 **[4] الأصدقاء والمتابعين:**
https://www.facebook.com/search/{uid}/friends?locale=en_US

💡 *يا فادي، ذلحين الروابط عتفتح لك النتائج طوالي في المتصفح، جرب وشوف!*
"""
        bot.send_message(message.chat.id, report, disable_web_page_preview=True)
    else:
        bot.reply_to(message, "ارسل الـ ID أو رابط الحساب يا ذيب.")

bot.polling()
