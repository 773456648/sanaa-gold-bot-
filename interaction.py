import telebot, requests, time, random, os
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

# بياناتك يا مسمار
API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
MY_ID = "6943805872"
video_url = "https://www.instagram.com/p/DTlmigjDKfv/"
bot = telebot.TeleBot(API_TOKEN)

# سيرفر استقبال عشان الموقع ما ينام
class S(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers()
        self.wfile.write(b"IG Booster is Running!")

def send_views_loop():
    headers_list = [
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/04.1",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    ]
    count = 0
    try: bot.send_message(MY_ID, "🚀 السيرفر اشتغل! بدأت عملية رشق المشاهدات للفيديو حقك.")
    except: pass

    while True:
        try:
            header = {'User-Agent': random.choice(headers_list)}
            response = requests.get(video_url, headers=header, timeout=10)
            if response.status_code == 200:
                count += 1
                if count % 100 == 0: # يرسل لك تقرير كل 100 مشاهدة
                    bot.send_message(MY_ID, f"✅ تم إرسال {count} مشاهدة للفيديو بنجاح!")
            time.sleep(random.uniform(1, 3))
        except:
            time.sleep(10)

if __name__ == "__main__":
    # تشغيل السيرفر في الخلفية
    Thread(target=lambda: HTTPServer(('', int(os.environ.get("PORT", 8080))), S).serve_forever(), daemon=True).start()
    
    # تشغيل رشّاق المشاهدات
    Thread(target=send_views_loop, daemon=True).start()
    
    bot.polling(none_stop=True)
