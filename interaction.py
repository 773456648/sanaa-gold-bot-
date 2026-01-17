import requests
import time
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

def send_tele(msg):
    try: requests.get(f"https://api.telegram.org/bot{token}/sendMessage", params={"chat_id": chat_id, "text": msg})
    except: pass

def test_recent():
    # هذا واحد من الفيديوهات اللي نشرها أبو فلة مؤخراً (عن بطولة العرب)
    recent_vid = "https://www.youtube.com/watch?v=yYf-Gg5C5tQ" 
    send_tele(f"🔥 فادي.. هذا فيديو من المنشورات الأخيرة لأبو فلة:\n\n📌 العنوان: أصعب بطولة في حياتي!\n🔗 {recent_vid}\n\nذلحين تأكدت إن الرادار قناص؟ 😉")

class S(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Recent Video Sent")

if __name__ == "__main__":
    Thread(target=test_recent).start()
    HTTPServer(('0.0.0.0', 8080), S).serve_forever()
