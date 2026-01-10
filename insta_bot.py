import pyotp
from instagrapi import Client
import telebot

# التوكن والـ ID اللي استخرجتهم أنت ذلحين
BOT_TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
CHAT_ID = "5042495708"

bot = telebot.TeleBot(BOT_TOKEN)
cl = Client()
# مفتاح الأمان (2FA) حقك
totp = pyotp.TOTP("UZ6SLU76H7KNYI3YSTV26T27O53EUKG2")

def login_to_insta():
    try:
        bot.send_message(CHAT_ID, "🚀 السيرفر اشتغل يا فادي.. جاري كسر حماية انستقرام!")
        cl.login("fadi97781", "god12god12")
        bot.send_message(CHAT_ID, "✅ تم الدخول للحساب بنجاح!")
    except Exception as e:
        if "two_factor_required" in str(e):
            verification_code = totp.now()
            cl.two_factor_login(verification_code)
            bot.send_message(CHAT_ID, "✅ تم توليد كود الأمان والدخول بنجاح!")
        else:
            bot.send_message(CHAT_ID, f"❌ وقع خطأ: {str(e)}")

if __name__ == "__main__":
    login_to_insta()
