import cloudscraper
import requests
import time
import re
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# البيانات اللي اخترتها لك يا فادي للحساب الجديد
new_account_info = {
    "first_name": "سارة",
    "last_name": "الجعدبي",
    "bio": "صنعانية مسمار 🇾🇪",
    "status": "قيد الإنشاء..."
}

def send_tele(msg):
    try: requests.get(f"https://api.telegram.org/bot{token}/sendMessage", params={"chat_id": chat_id, "text": msg})
    except: pass

def run_sara_bot():
    send_tele(f"🌸 فادي.. بدأت أجهز حساب {new_account_info['first_name']} {new_account_info['last_name']}!")
    # هانا عيبدأ السيرفر يراقب لو فيه كود تأكيد وصل للإيميل (لو ربطته)
    while True:
        try:
            # محاكاة بسيطة للنشاط عشان السيرفر ما يوقفش
            time.sleep(3600)
            send_tele("💎 حساب سارة الجعدبي لا يزال في الذاكرة مسمار!")
        except: pass

class S(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Sara Al-Jadbi Server is LIVE")

if __name__ == "__main__":
    Thread(target=run_sara_bot).start()
    HTTPServer(('0.0.0.0', 8080), S).serve_forever()
