from fbchat import Client
from fbchat.models import *
import telebot

# بياناتك يا مبرمج فادي - التوكن الجديد والآيدي
FB_USER = "488intellectual@gmail.com"
FB_PASS = "god12god1"
TG_TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
TG_ID = "1214068560"

bot = telebot.TeleBot(TG_TOKEN)

class fb_to_tg(Client):
    def onMessage(self, author_id, message_object, thread_id, thread_type, **kwargs):
        # عشان يرسل الرسائل اللي تجيك من الناس مش اللي ترسلها أنت
        if author_id != self.uid:
            msg_text = f"📩 رسالة فيسبوك جديدة:\n{message_object.text}"
            bot.send_message(TG_ID, msg_text)

try:
    client = fb_to_tg(FB_USER, FB_PASS)
    print("✅ تم الربط بنجاح! البوت شغال ذلحين يا فادي..")
    client.listen()
except Exception as e:
    print(f"❌ وقع خطأ: {e}")

