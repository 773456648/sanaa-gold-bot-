import cloudscraper
import requests
import time
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer
import re

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# الكوكيز المسمار يا فادي
fb_cookies = {
    'sb': 'iWplaTgxXWaKpJpcZOMr2nJZ',
    'datr': 'iGplaV28PgweKRFA2B3ALpcC',
    'c_user': '100003550913323',
    'xs': '31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1',
    'fr': '0ZAmSGvgnip1quTXs.AWce2dqg1ECDs6EJph5VK7Arna1bGbVfYsQRq0CpV9ymc76uqJE.BpZWqJ..AAA.0.0.BpatIx.AWeK-HlIWO3Cl6MNFk_HUmRCDUA',
    'locale': 'ar_AR'
}

def send_tele(msg):
    try: requests.get(f"https://api.telegram.org/bot{token}/sendMessage", params={"chat_id": chat_id, "text": msg})
    except: pass

def run_fb_server():
    send_tele("⚙️ سيرفر الاسم شغال ذلحين في السحاب...")
    scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'android', 'desktop': False})
    
    while True:
        try:
            # محاولة سحب الاسم للتأكد إن السيرفر حي
            res = scraper.get("https://mbasic.facebook.com/profile.php", cookies=fb_cookies)
            if "Logout" in res.text or "تسجيل الخروج" in res.text:
                try:
                    name = re.search(r'<title>(.*?)</title>', res.text).group(1).split('|')[0].strip()
                except:
                    name = "فادي"
                send_tele(f"✅ السيرفر مستمر في العمل..\n👤 الحساب الحالي: {name}")
                time.sleep(3600) # يفحص كل ساعة عشان ما ينكشف
            else:
                send_tele("⚠️ السيرفر فقد الجلسة! حدث الكوكيز يا وحش.")
                break
        except Exception as e:
            time.sleep(600)

class SimpleServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"FB Name Server Active")

if __name__ == "__main__":
    Thread(target=run_fb_server).start()
    HTTPServer(('0.0.0.0', 8080), SimpleServer).serve_forever()
