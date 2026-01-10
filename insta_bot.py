from instagrapi import Client
import time
import random
import requests

# بيانات التلجرام (حق بوت الذهب حقك)
TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
CHAT_ID = "5042495708"

# بيانات الانستقرام
USERNAME = 'malk.mostafa.946517'
PASSWORD = 'god12god13'

cl = Client()

def send_telegram(msg):
    try:
        requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", 
                      json={"chat_id": CHAT_ID, "text": msg})
    except:
        pass

def run_bot():
    try:
        print("جاري الدخول...")
        cl.login(USERNAME, PASSWORD)
        send_telegram("🚀 أبشرك يا فادي.. بوت الانستا سجل دخول وشغال ذلحين يقنص!")
        
        hashtags = ["اليمن", "صنعاء", "برمجة"]
        
        while True:
            tag = random.choice(hashtags)
            medias = cl.hashtag_medias_recent(tag, amount=2)
            
            for media in medias:
                cl.media_like(media.id)
                info = f"❤️ سويت لايك لمنشور في هاشتاج (# {tag})\nالمعرف: {media.id}"
                print(info)
                # إذا تشتي يرسل لك في التلجرام عن كل لايك (بس عتوقع رسائل كثير)
                # send_telegram(info) 
                
                time.sleep(random.randint(600, 900)) # خليه ثقيل عشان الأمان
                
    except Exception as e:
        send_telegram(f"⚠️ الحق يا فادي، البوت وقف بسبب: {e}")

if __name__ == "__main__":
    run_bot()
