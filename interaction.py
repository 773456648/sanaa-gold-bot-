import requests
import time
import re
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"
target_url = "https://mbasic.facebook.com/share/16nxCnAQvX/"

def send_tele(msg):
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        requests.get(url, params={"chat_id": chat_id, "text": msg})
    except: pass

cookies = {
    'c_user': '100003550913323',
    'xs': '31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1',
    'fr': '0ZAmSGvgnip1quTXs.AWfzSueuMXxd_mA9dRQT6pHPV6ekP7rFswmgramcUIJj5LwKP_0.BpZWqJ..AAA.0.0.BpaXdf.AWdM-MLHWfD20iUiQgY1mror1sU',
    'datr': 'iGplaV28PgweKRFA2B3ALpcC',
    'sb': 'iWplaTgxXWaKpJpcZOMr2nJZ'
}

def start_bot():
    send_tele("🚀 بدأت عملية تصفية الحساب (قديم وجديد) يا فادي!")
    current_page = target_url
    while True:
        try:
            r = requests.get(current_page, cookies=cookies)
            # بحث عن أزرار اللايك
            likes = re.findall(r'/a/like.php\?.*?"', r.text)
            for u in likes:
                link = "https://mbasic.facebook.com" + u.replace('"', '').replace('&amp;', '&')
                requests.get(link, cookies=cookies)
                send_tele("✅ تم دعس لايك (منشور قديم/جديد)")
                time.sleep(15) # هدوء عشان ما ننحظر
            
            # بحث عن زر "عرض المزيد" عشان يجيب القديم
            next_page = re.findall(r'/profile/timeline/stream/\?.*?"', r.text)
            if next_page:
                current_page = "https://mbasic.facebook.com" + next_page[0].replace('"', '').replace('&amp;', '&')
                send_tele("⏳ جاري الانتقال للمنشورات الأقدم...")
            else:
                send_tele("🏁 كملت تصفية كل المنشورات المتاحة!")
                break # يوقف لو كمل كل شي
        except:
            time.sleep(60)

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Deep Scan Active")

if __name__ == "__main__":
    Thread(target=start_bot).start()
    HTTPServer(('0.0.0.0', 8080), MyServer).serve_forever()
