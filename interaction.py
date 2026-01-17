import requests
import time
import re
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"
channel_id = "UCqq5n-Oe-r1EEHI3yvhVJcA" # آيدي قناة أبو فلة الرسمي

def send_tele(msg):
    try: requests.get(f"https://api.telegram.org/bot{token}/sendMessage", params={"chat_id": chat_id, "text": msg})
    except: pass

def get_latest_valid_video():
    try:
        # سحب أحدث فيديو شغال وموجود فعلياً عبر RSS
        url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
        res = requests.get(url, timeout=15).text
        v_id = re.search(r'<yt:videoId>(.*?)</yt:videoId>', res).group(1)
        v_title = re.search(r'<title>(.*?)</title>', res).group(1)
        
        send_tele(f"✅ فادي.. ذلحين الرابط مسمار وشغال!\n\n📌 أحدث فيديو: {v_title}\n🔗 https://www.youtube.com/watch?v={v_id}\n\nهذا الرابط مستحيل يقول لك 'غير متوفر' 😉")
    except Exception as e:
        send_tele(f"❌ وقع بلى في السحب: {str(e)}")

class S(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Link Fix Active")

if __name__ == "__main__":
    Thread(target=get_latest_valid_video).start()
    HTTPServer(('0.0.0.0', 8080), S).serve_forever()
