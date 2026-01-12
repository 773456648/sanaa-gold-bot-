from fbchat import Client
from fbchat.models import *
import telebot

# بياناتك الجديدة يا ذيب
FB_USER = "488intellectual@gmail.com"
FB_PASS = "god12god13"  # حدثنا الكلمة ذلحين
TG_TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
TG_ID = "1214068560"

bot = telebot.TeleBot(TG_TOKEN)

class fb_to_tg(Client):
    def onMessage(self, author_id, message_object, thread_id, thread_type, **kwargs):
        if author_id != self.uid:
            try:
                msg_text = f"📩 رسالة فيسبوك جديدة:\n{message_object.text}"
                bot.send_message(TG_ID, msg_text)
            except Exception as e:
                print(f"Error: {e}")

try:
    print("🚀 جاري محاولة الدخول من التيرمكس...")
    client = fb_to_tg(FB_USER, FB_PASS)
    if client.isLoggedIn():
        print("✅ تم الربط بنجاح في التيرمكس!")
        print("📡 البوت شغال ذلحين.. جرب أرسل رسالة لنفسك في فيسبوك.")
        client.listen()
except Exception as e:
    print(f"❌ العلة هنا: {e}")
    print("💡 نصيحة: إذا قال لك 'Login failed'، افتح تطبيق فيسبوك وأكد 'هذا أنا'.")
