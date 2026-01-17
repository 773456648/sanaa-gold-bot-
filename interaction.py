import requests
import time
import re
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"
yt_channels = ["UCqq5n-Oe-r1EEHI3yvhVJcA", "UCRu9mro2nPafhMxVy2CRfXA"]
last_data = {cid: None for cid in yt_channels}

def send_tele(msg):
    try: requests.get(f"https://api.telegram.org/bot{token}/sendMessage", params={"chat_id": chat_id, "text": msg})
    except: pass

def fast_monitor():
    send_tele("🚀 تم تفعيل السرعة القصوى! عيقع الإشعار قبل الكل يا مسمار.")
    while True:
        for cid in yt_channels:
            try:
                url = f"https://www.youtube.com/feeds/videos.xml?channel_id={cid}"
                res = requests.get(url, timeout=10).text
                v_id = re.search(r'<yt:videoId>(.*?)</yt:videoId>', res).group(1)
                if last_data[cid] != v_id:
                    if last_data[cid] is not None:
                        title = re.search(r'<title>(.*?)</title>', res).group(1)
                        send_tele(f"🚨 عاجل: أبو فلة نشر فيديو جديد!\n📌 {title}\n🔗 https://youtu.be/{v_id}")
                    last_data[cid] = v_id
            except: pass
        time.sleep(60) # فحص كل دقيقة واحدة بس (سرعة جنونية)

class S(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Turbo Active")

if __name__ == "__main__":
    Thread(target=fast_monitor).start()
    HTTPServer(('0.0.0.0', 8080), S).serve_forever()
