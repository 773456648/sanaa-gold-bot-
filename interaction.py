import telebot, requests, time, random, os
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
MY_ID = "5042495708"
new_post_url = "https://www.instagram.com/p/DTimxHejDKB/"
bot = telebot.TeleBot(API_TOKEN)

# هذا الجزء عشان ريندر ما يزعل ويقول مابش Port
class S(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers()
        self.wfile.write(b"Server is Alive and Boosting!")

def worker():
    while True:
        try:
            requests.get(new_post_url, timeout=5)
            time.sleep(random.uniform(0.1, 0.5))
        except: pass

if __name__ == "__main__":
    # تشغيل سيرفر الويب في الخلفية
    port = int(os.environ.get("PORT", 8080))
    Thread(target=lambda: HTTPServer(('', port), S).serve_forever(), daemon=True).start()
    
    # تشغيل 5 مسارات رشق
    for i in range(30):
        Thread(target=worker, daemon=True).start()
    
    bot.send_message(MY_ID, "🔥 تم الإصلاح! السيرفر ذلحين شغال 'مسمار' وبدون أخطاء في ريندر.")
    bot.polling(none_stop=True)
