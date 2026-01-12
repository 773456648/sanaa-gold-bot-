from fbchat import Client
from fbchat.models import *
import telebot
import sys

# بياناتك يا مبرمج
FB_USER = "488intellectual@gmail.com"
FB_PASS = "god12god1"
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
                print(f"❌ خطأ تلجرام: {e}")

try:
    print("🚀 جاري محاولة تسجيل الدخول لفيسبوك...")
    client = fb_to_tg(FB_USER, FB_PASS)
    if client.isLoggedIn():
        print("✅ تم الربط بنجاح! البوت شغال ذلحين..")
        bot.send_message(TG_ID, "✅ البوت اشتغل وربط بفيسبوك يا فادي!")
        client.listen()
except Exception as e:
    print(f"❌ العلة هنا: {e}")
    # إذا طلع خطأ، عيرسله لك للتلجرام عشان تبصر
    try: bot.send_message(TG_ID, f"❌ فشل الدخول: {e}")
    except: pass
