import cloudscraper
import requests
import time
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# كوكيز فيسبوك حقك يا ذيب
fb_cookies = {
    'sb': 'iWplaTgxXWaKpJpcZOMr2nJZ',
    'datr': 'iGplaV28PgweKRFA2B3ALpcC',
    'c_user': '100003550913323',
    'xs': '31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1',
    'fr': '0ZAmSGvgnip1quTXs.AWdgsx0QhggrZq94vKKRCo5pO3T-0qg6rsrDmYRSvWA3m88_GbY.BpZWqJ..AAA.0.0.Bpas6R.AWfooahctK83Y1jXwGS-AemJPDI',
    'locale': 'ar_AR'
}

def send_tele(msg):
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        requests.get(url, params={"chat_id": chat_id, "text": msg})
    except: pass

def start_bot():
    send_tele("⚙️ جاري تشغيل سيرفر فيسبوك في السحاب...")
    scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'android', 'desktop': False})
    
    while True:
        try:
            url = "https://mbasic.facebook.com/profile.php"
            res = scraper.get(url, cookies=fb_cookies)
            
            if "Logout" in res.text or "تسجيل الخروج" in res.text:
                # محاولة سحب الاسم للتأكيد
                try:
                    name = res.text.split('<title>')[1].split('</title>')[0]
                except:
                    name = "فادي"
                send_tele(f"✅ السيرفر شغال! الحساب: {name}\n🚀 جاري فحص الإشعارات...")
            else:
                send_tele("⚠️ السيرفر فقد الاتصال بالكوكيز، حدثها من Kiwi يا فادي.")
                break # يوقف لو الكوكيز ماتت عشان ما ينحظر الآيبي
                
            time.sleep(1800) # يفحص كل نص ساعة عشان ما يزعج فيسبوك
        except Exception as e:
            send_tele(f"🚫 خطأ في السيرفر: {str(e)[:50]}")
            time.sleep(300)

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Facebook Server is LIVE")

if __name__ == "__main__":
    # تشغيل البوت في خلفية السيرفر
    Thread(target=start_bot).start()
    # تشغيل السيرفر عشان Render ما يطفى
    HTTPServer(('0.0.0.0', 8080), MyServer).serve_forever()
