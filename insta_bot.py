import pyotp
from instagrapi import Client
import telebot

# إعداداتك (تأكد من التوكن والـ ID)
BOT_TOKEN = "7547470402:AAH93lK8X6P13rI4YI-e_R-mGv8f4eF7_oI"
CHAT_ID = "6106644026"

bot = telebot.TeleBot(BOT_TOKEN)
cl = Client()
# مفتاح الأمان حقك
totp = pyotp.TOTP("UZ6SLU76H7KNYI3YSTV26T27O53EUKG2")

def login_to_insta():
    try:
        bot.send_message(CHAT_ID, "🚀 جاري محاولة الدخول (fadi97781)...")
        cl.login("fadi97781", "god12god12")
        bot.send_message(CHAT_ID, "✅ تم الدخول بنجاح يا فادي!")
    except Exception as e:
        if "two_factor_required" in str(e):
            verification_code = totp.now()
            cl.two_factor_login(verification_code)
            bot.send_message(CHAT_ID, "✅ تم تخطي الـ 2FA والدخول بنجاح!")
        else:
            bot.send_message(CHAT_ID, f"❌ خطأ: {str(e)}")

if __name__ == "__main__":
    login_to_insta()
