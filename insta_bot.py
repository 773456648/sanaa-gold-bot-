import pyotp
from instagrapi import Client
import telebot

# بياناتك الجديدة يا ذيب
BOT_TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
CHAT_ID = "5042495708"

bot = telebot.TeleBot(BOT_TOKEN)
cl = Client()

# بيانات حساب انستقرام الجديد
USER = "joker771232"
PASS = "god12god1"
# مفتاح الأمان القديم (إذا غيرته في الحساب الجديد اديني الخبر)
SECRET = "UZ6SLU76H7KNYI3YSTV26T27O53EUKG2"
totp = pyotp.TOTP(SECRET.replace(" ", ""))

def login_to_insta():
    try:
        bot.send_message(CHAT_ID, f"🚀 جاري محاولة الدخول للحساب الجديد ({USER})...")
        cl.login(USER, PASS)
        bot.send_message(CHAT_ID, "✅ تم الدخول بنجاح يا فادي! الحساب الجديد شغال.")
    except Exception as e:
        if "two_factor_required" in str(e):
            bot.send_message(CHAT_ID, "🔐 طلب كود الأمان.. جاري التوليد...")
            verification_code = totp.now()
            cl.two_factor_login(verification_code)
            bot.send_message(CHAT_ID, "✅ تم تخطي الأمان والدخول بنجاح!")
        else:
            bot.send_message(CHAT_ID, f"❌ وقع خطأ: {str(e)}")

if __name__ == "__main__":
    login_to_insta()
