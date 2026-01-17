import requests
import time
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

def send_tele(msg):
    try: requests.get(f"https://api.telegram.org/bot{token}/sendMessage", params={"chat_id": chat_id, "text": msg})
    except: pass

def test_link():
    # هذا فيديو قديم لأبو فلة عشان الفحص
    test_vid = "https://youtu.be/mF8y1R-Yf60" 
    send_tele(f"🧪 فحص الاتصال يا فادي..\n\nهذا رابط فيديو قديم من قناة أبو فلة للتأكد:\n🔗 {test_vid}\n\nلو وصلتك الرسالة، فالبوت مربوط بالسيرفر مسمار!")

class S(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Test Sent")

if __name__ == "__main__":
    Thread(target=test_link).start()
    HTTPServer(('0.0.0.0', 8080), S).serve_forever()
