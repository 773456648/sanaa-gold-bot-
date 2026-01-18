import telebot, requests, time, random, os
from threading import Thread

# بياناتك يا فادي
API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
MY_ID = "5042495708"
# رابط المنشور الجديد (الصورة)
new_post_url = "https://www.instagram.com/p/DTimxHejDKB/"
bot = telebot.TeleBot(API_TOKEN)

def send_photo_view():
    headers = {'User-Agent': random.choice([
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X)",
        "Mozilla/5.0 (Linux; Android 13; SM-S908B)",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    ])}
    try:
        # إرسال طلب للمنشور
        requests.get(new_post_url, headers=headers, timeout=5)
    except:
        pass

def worker():
    count = 0
    while True:
        send_photo_view()
        count += 1
        if count % 100 == 0:
            try: bot.send_message(MY_ID, f"📸 أبشر يا فادي! المنشور الجديد استلم {count} زيارة مسمار!")
            except: pass
        time.sleep(random.uniform(0.2, 0.8))

if __name__ == "__main__":
    # تشغيل 3 مسارات عشان نكون في السليم مع الصور
    for i in range(3):
        Thread(target=worker, daemon=True).start()
    
    bot.send_message(MY_ID, "🚀 تم تحويل الرشق للمنشور الجديد (الصورة).. بدأت المهرة ذلحين!")
    bot.polling(none_stop=True)
