import cloudscraper
import requests
import time
import re
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# بيانات المراقبة
targets = {
    "facebook": "AboFlah",
    "youtube_main": "UCqq5n-Oe-r1EEHI3yvhVJcA",
    "youtube_gaming": "UCRu9mro2nPafhMxVy2CRfXA"
}

last_data = {"fb": None, "yt_main": None, "yt_gaming": None}

def send_tele(msg):
    try: requests.get(f"https://api.telegram.org/bot{token}/sendMessage", params={"chat_id": chat_id, "text": msg})
    except: pass

def check_youtube(channel_id, key):
    try:
        url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
        res = requests.get(url, timeout=20)
        video_id = re.search(r'<yt:videoId>(.*?)</yt:videoId>', res.text).group(1)
        if last_data[key] != video_id:
            if last_data[key] is not None:
                title = re.search(r'<title>(.*?)</title>', res.text).group(1)
                send_tele(f"📺 فيديو جديد من أبو فلة!\n📌 العنوان: {title}\n🔗 الرابط: https://youtu.be/{video_id}")
            last_data[key] = video_id
    except: pass

def check_facebook():
    try:
        scraper = cloudscraper.create_scraper(browser={'browser': 'chrome','platform': 'android','desktop': False})
        res = scraper.get(f"https://mbasic.facebook.com/{targets['facebook']}", timeout=20)
        posts = re.findall(r'/story.php\?story_fbid=([0-9]+)', res.text)
        if posts and last_data["fb"] != posts[0]:
            if last_data["fb"] is not None:
                send_tele(f"🔵 منشور جديد على فيسبوك أبو فلة!\n🔗 الرابط: https://facebook.com/{posts[0]}")
            last_data["fb"] = posts[0]
    except: pass

def monitor_loop():
    send_tele("🛰️ تم تفعيل الرادار الشامل.. نراقب أبو فلة في كل مكان يا فادي!")
    while True:
        check_youtube(targets["youtube_main"], "yt_main")
        check_youtube(targets["youtube_gaming"], "yt_gaming")
        check_facebook()
        time.sleep(300) # فحص كل 5 دقائق

class WebS(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Radar All-Platforms is Online")

if __name__ == "__main__":
    Thread(target=monitor_loop).start()
    HTTPServer(('0.0.0.0', 8080), WebS).serve_forever()
