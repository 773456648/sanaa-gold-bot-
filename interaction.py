import cloudscraper
import requests
import time
import re
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# الكوكيز (ضروري عشان نبصر التعليقات)
fb_cookies = {
    'sb': 'iWplaTgxXWaKpJpcZOMr2nJZ',
    'datr': 'iGplaV28PgweKRFA2B3ALpcC',
    'c_user': '100003550913323',
    'xs': '31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1',
    'fr': '0ZAmSGvgnip1quTXs.AWfRTDZ-S2cbOfwD2fZ_funCa-r2EykBNyQ_go_hn0bDZ6T7k3Y.BpZWqJ..AAA.0.0.BpatMt.AWcVAZBuZCdEuvvsCQOi0RJtst4'
}

last_seen_comments = set()

def send_tele(msg):
    try: requests.get(f"https://api.telegram.org/bot{token}/sendMessage", params={"chat_id": chat_id, "text": msg})
    except: pass

def monitor_comments():
    send_tele("🕵️ فادي.. بدأت أنبش في تعليقات أبو فلة ذلحين!")
    scraper = cloudscraper.create_scraper(browser={'browser': 'chrome','platform': 'android','desktop': False})
    
    while True:
        try:
            # الدخول لصفحة أبو فلة
            res = scraper.get("https://mbasic.facebook.com/AboFlah", cookies=fb_cookies, timeout=20)
            # استخراج روابط المنشورات
            posts = re.findall(r'/story.php\?story_fbid=([0-9]+)&amp;id=([0-9]+)', res.text)
            
            for post_id, user_id in posts[:3]: # نراقب آخر 3 منشورات
                comment_url = f"https://mbasic.facebook.com/story.php?story_fbid={post_id}&id={user_id}"
                c_res = scraper.get(comment_url, cookies=fb_cookies, timeout=20)
                
                # البحث عن تعليق من صاحب الصفحة (أبو فلة)
                # في mbasic عادة يظهر اسمه بجانب التعليق
                if "AboFlah" in c_res.text:
                    # استخراج نص التعليق (بشكل مبسط)
                    find_comment = re.findall(r'<strong>AboFlah</strong><div>(.*?)</div>', c_res.text)
                    for comment_text in find_comment:
                        comment_hash = hash(comment_text)
                        if comment_hash not in last_seen_comments:
                            send_tele(f"💬 أبو فلة علق ذلحين!\n📝 قال: {comment_text}\n🔗 الرابط: {comment_url}")
                            last_seen_comments.add(comment_hash)
            
            time.sleep(600) # فحص كل 10 دقائق
        except: time.sleep(300)

class S(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Comment Monitor is LIVE")

if __name__ == "__main__":
    Thread(target=monitor_comments).start()
    HTTPServer(('0.0.0.0', 8080), S).serve_forever()
