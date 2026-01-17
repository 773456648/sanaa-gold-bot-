import cloudscraper
import requests
import time
import re
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# الكوكيز الطازة يا مبرمج
fb_cookies = {
    'sb': 'iWplaTgxXWaKpJpcZOMr2nJZ',
    'datr': 'iGplaV28PgweKRFA2B3ALpcC',
    'c_user': '100003550913323',
    'xs': '31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1',
    'fr': '0ZAmSGvgnip1quTXs.AWfRTDZ-S2cbOfwD2fZ_funCa-r2EykBNyQ_go_hn0bDZ6T7k3Y.BpZWqJ..AAA.0.0.BpatMt.AWcVAZBuZCdEuvvsCQOi0RJtst4',
    'locale': 'ar_AR'
}

def send_tele(msg):
    try:
        requests.get(f"https://api.telegram.org/bot{token}/sendMessage", params={"chat_id": chat_id, "text": msg})
    except: pass

def monitor_fb():
    send_tele("🚀 السيرفر اشتغل ذلحين.. جاري صيد اسم الحساب!")
    scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'android', 'desktop': False})
    
    while True:
        try:
            res = scraper.get("https://mbasic.facebook.com/profile.php", cookies=fb_cookies)
            if "Logout" in res.text or "تسجيل الخروج" in res.text:
                name = re.search(r'<title>(.*?)</title>', res.text).group(1).split('|')[0].strip()
                send_tele(f"👤 الحساب نشط: {name}\n✅ السيرفر يراقب ذلحين مسمار.")
                time.sleep(3600) # يفحص كل ساعة
            else:
                send_tele("⚠️ الجلسة طفت! فيسبوك يحتاج كوكيز جديدة يا فادي.")
                break
        except:
            time.sleep(600)

class WebServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Facebook Server LIVE")

if __name__ == "__main__":
    Thread(target=monitor_fb).start()
    HTTPServer(('0.0.0.0', 8080), WebServer).serve_forever()
