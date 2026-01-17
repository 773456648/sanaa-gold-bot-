import cloudscraper
import requests
import time
import re
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# الكوكيز الجديدة (3:24 ص)
fb_cookies = {
    'sb': 'iWplaTgxXWaKpJpcZOMr2nJZ',
    'datr': 'iGplaV28PgweKRFA2B3ALpcC',
    'c_user': '100003550913323',
    'xs': '31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1',
    'fr': '0ZAmSGvgnip1quTXs.AWfRTDZ-S2cbOfwD2fZ_funCa-r2EykBNyQ_go_hn0bDZ6T7k3Y.BpZWqJ..AAA.0.0.BpatMt.AWcVAZBuZCdEuvvsCQOi0RJtst4',
    'fbl_st': '100735087%3BT%3A29476822',
    'locale': 'ar_AR'
}

def send_tele(msg):
    try: requests.get(f"https://api.telegram.org/bot{token}/sendMessage", params={"chat_id": chat_id, "text": msg})
    except: pass

def run_logic():
    send_tele("🚀 فادي.. السيرفر بدأ يشتغل بالكوكيز الجديدة!")
    scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'android', 'desktop': False})
    
    while True:
        try:
            res = scraper.get("https://mbasic.facebook.com/profile.php", cookies=fb_cookies)
            if "Logout" in res.text or "تسجيل الخروج" in res.text:
                name_match = re.search(r'<title>(.*?)</title>', res.text)
                name = name_match.group(1).split('|')[0].strip() if name_match else "فادي"
                send_tele(f"✅ الحساب شغال مسمار!\n👤 الاسم: {name}")
                time.sleep(3600)
            else:
                send_tele("⚠️ الجلسة هبكت! فيسبوك يشتي كوكيز جديدة.")
                break
        except: time.sleep(600)

class S(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Mismar Server Active")

if __name__ == "__main__":
    Thread(target=run_logic).start()
    HTTPServer(('0.0.0.0', 8080), S).serve_forever()
