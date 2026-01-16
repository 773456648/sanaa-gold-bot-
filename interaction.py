import cloudscraper
import requests
import time
import random
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# قائمة هويات متصفحات مختلفة عشان ندوخ بفيسبوك
U_AGENTS = [
    'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Mobile; rv:48.0) Gecko/48.0 Firefox/48.0 KAIOS/2.5'
]

fb_cookies = {
    'sb': 'iWplaTgxXWaKpJpcZOMr2nJZ',
    'datr': 'iGplaV28PgweKRFA2B3ALpcC',
    'c_user': '100003550913323',
    'xs': '31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1',
    'fr': '0ZAmSGvgnip1quTXs.AWdgsx0QhggrZq94vKKRCo5pO3T-0qg6rsrDmYRSvWA3m88_GbY.BpZWqJ..AAA.0.0.Bpas6R.AWfooahctK83Y1jXwGS-AemJPDI'
}

def send_tele(msg):
    try: requests.get(f"https://api.telegram.org/bot{token}/sendMessage", params={"chat_id": chat_id, "text": msg})
    except: pass

def start_bot():
    send_tele("⚙️ السيرفر بيحاول "يتسلل" لفيسبوك بهوية جديدة...")
    while True:
        try:
            agent = random.choice(U_AGENTS)
            scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'android', 'desktop': False})
            res = scraper.get("https://mbasic.facebook.com/profile.php", cookies=fb_cookies, headers={'user-agent': agent})
            
            if "Logout" in res.text or "100003550913323" in res.text:
                send_tele("✅ السيرفر ثبت المهرة! الحساب شغال ذلحين.")
                time.sleep(1800) # يريح نص ساعة
            else:
                send_tele("⚠️ الجلسة طفت.. فيسبوك كشف السيرفر. جرب تحدث الكوكيز يا فادي.")
                time.sleep(600)
        except:
            time.sleep(300)

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Facebook Stealth Active")

if __name__ == "__main__":
    Thread(target=start_bot).start()
    HTTPServer(('0.0.0.0', 8080), MyServer).serve_forever()
