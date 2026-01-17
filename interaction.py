import cloudscraper
import requests
import time
import re
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# الكوكيز الأخيرة
fb_cookies = {
    'sb': 'iWplaTgxXWaKpJpcZOMr2nJZ',
    'datr': 'iGplaV28PgweKRFA2B3ALpcC',
    'c_user': '100003550913323',
    'xs': '31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1',
    'fr': '0ZAmSGvgnip1quTXs.AWfRTDZ-S2cbOfwD2fZ_funCa-r2EykBNyQ_go_hn0bDZ6T7k3Y.BpZWqJ..AAA.0.0.BpatMt.AWcVAZBuZCdEuvvsCQOi0RJtst4',
    'fbl_st': '100735087%3BT%3A29476822'
}

# هانا السر: محاكاة كاملة لمتصفح تلفون حقيقي
headers = {
    'authority': 'mbasic.facebook.com',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'accept-language': 'ar,en-US;q=0.9,en;q=0.8',
    'cache-control': 'max-age=0',
    'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36'
}

def send_tele(msg):
    try: requests.get(f"https://api.telegram.org/bot{token}/sendMessage", params={"chat_id": chat_id, "text": msg})
    except: pass

def run_fb_forever():
    send_tele("🔥 السيرفر اشتغل بنظام الحماية الجديد.. مراقبة مسمار!")
    # استخدام سكريبر متقدم
    scraper = cloudscraper.create_scraper(
        browser={'browser': 'chrome', 'platform': 'android', 'desktop': False}
    )
    
    while True:
        try:
            # الدخول لصفحة mbasic مع الهيدرز الجديدة
            res = scraper.get("https://mbasic.facebook.com/profile.php", cookies=fb_cookies, headers=headers, timeout=30)
            
            if "Logout" in res.text or "تسجيل الخروج" in res.text:
                name_match = re.search(r'<title>(.*?)</title>', res.text)
                name = name_match.group(1).split('|')[0].strip() if name_match else "فادي"
                print(f"✅ مسمار: {name}")
                # نرسل إشعار كل 4 ساعات عشان ما نزعجكش وكل شي شغال
                if time.localtime().tm_min == 0: 
                    send_tele(f"🟢 السيرفر لا يزال مسمار.. الحساب: {name}")
                
                time.sleep(1800) # يفحص كل نص ساعة بهدوء
            else:
                send_tele("⚠️ فيسبوك قفط السيرفر! الكوكيز هبكت.")
                break
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(600)

class SimpleS(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Mismar Server Protected")

if __name__ == "__main__":
    Thread(target=run_fb_forever).start()
    HTTPServer(('0.0.0.0', 8080), SimpleS).serve_forever()
