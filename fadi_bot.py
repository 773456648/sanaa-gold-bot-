import telebot
from pytubefix import Search
import os

TOKEN = '7548949822:AAEqp7D0PzYhW6e89UuP2kK_Mv_f6R-Oqog'
bot = telebot.TeleBot(TOKEN)
CHAT_ID = '7151528641'

def download_and_send():
    print("🔍 جاري البحث عن فيديوهات شاشمة...")
    try:
        # البحث عن فيديوهات قصيرة مضحكة
        results = Search("funny shorts 2026").videos
        for yt in results[:5]: 
            try:
                print(f"📥 جاري محاولة تحميل: {yt.title}")
                # نختار جودة متوسطة عشان يرسل بسرعة وما يعلق
                stream = yt.streams.filter(progressive=True, file_extension='mp4').first()
                video_file = stream.download()
                
                print("📤 جاري الإرسال لتلجرام يا فادي...")
                with open(video_file, 'rb') as video:
                    bot.send_video(CHAT_ID, video, caption=f"شف هذا يضحك 😂\n{yt.title}")
                
                os.remove(video_file)
                print("✅ تمت المهمة! روح شيك تلجرام ذلحين.")
                return 
            except Exception as e:
                print(f"⚠️ الفيديو هذا حنق، بنجرب اللي بعده...")
                continue
    except Exception as e:
        print(f"❌ وقع خطأ: {e}")

if __name__ == "__main__":
    download_and_send()
