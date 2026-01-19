import telebot, requests, time, random, os
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
MY_ID = "5042495708"
video_url = "https://www.instagram.com/p/DTlmigjDKfv/"
bot = telebot.TeleBot(API_TOKEN)

class S(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers()
        self.wfile.write(b"IG Booster is Running!")

def send_views_loop():
    headers_list = ["Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)"]
    count = 0
    try: bot.send_message(MY_ID, "🚀 قرحنا يا فادي! التحديث الجديد وصل والسيرفر بدأ يرشق بالآيدي حقك.")
    except: pass
    while True:
        try:
            requests.get(video_url, headers={'User-Agent': random.choice(headers_list)}, timeout=10)
            count += 1
            if count % 100 == 0: bot.send_message(MY_ID, f"✅ تم إرسال {count} مشاهدة!")
            time.sleep(1)
        except: time.sleep(5)

if __name__ == "__main__":
    Thread(target=lambda: HTTPServer(('', int(os.environ.get("PORT", 8080))), S).serve_forever(), daemon=True).start()
    Thread(target=send_views_loop, daemon=True).start()
    bot.polling(none_stop=True)
