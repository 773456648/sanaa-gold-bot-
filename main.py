import telebot
from fbchat import Client
from fbchat.models import *

# بياناتك يا فادي
FB_USER = "488intellectual@gmail.com"
FB_PASS = "god12god12"
TG_TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
TG_ID = "1214068560"

bot = telebot.TeleBot(TG_TOKEN)

class MessengerBot(Client):
    def onMessage(self, author_id, message_object, thread_id, thread_type, **kwargs):
        if author_id != self.uid:
            try:
                msg = f"📩 وصلتك رسالة فيسبوك:\n{message_object.text}"
                bot.send_message(TG_ID, msg)
            except: pass

print("🚀 جاري محاولة الدخول الأخيرة...")
try:
    # استخدام نظام قديم جداً لتخطي حماية فيسبوك
    ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    client = MessengerBot(FB_USER, FB_PASS, user_agent=ua, max_tries=1)
    if client.isLoggedIn():
        print("✅ تم الربط بنجاح يا فادي! البوت شغال ذلحين.")
        client.listen()
except Exception as e:
    print(f"❌ الخبر: {e}")
    print("\n💡 يا فادي، إذا طلع 'Login failed'، افتح فيسبوكك وأكد 'هذا أنا' طوالي!")
