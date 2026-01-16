import requests
import time
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# كوكيز فيسبوك الجديدة
fb_cookies = "sb=iWplaTgxXWaKpJpcZOMr2nJZ; datr=iGplaV28PgweKRFA2B3ALpcC; c_user=100003550913323; xs=31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1; fr=0ZAmSGvgnip1quTXs.AWfO5TEMDmr4I_ahRMc5SkFdl_khbvLMuz1tXYJvQX1K5sCB4uc.BpZWqJ..AAA.0.0.BpaszI.AWdkt9w65diMSuQhlAvfRiG6Q0c; locale=ar_AR"

headers = {
    'authority': 'mbasic.facebook.com',
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    'cookie': fb_cookies,
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'accept-language': 'ar-YE,ar;q=0.9,en-US;q=0.8,en;q=0.7',
}

def send_tele(msg):
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        requests.get(url, params={"chat_id": chat_id, "text": msg})
    except: pass

def start_bot():
    try:
        # محاولة سحب الاسم من صفحة mbasic (أخف وأسرع للبوتات)
        response = requests.get("https://mbasic.facebook.com/profile.php", headers=headers)
        if "Logout" in response.text or "تسجيل الخروج" in response.text:
            # استخراج الاسم بشكل بسيط
            try:
                name = response.text.split('<title>')[1].split('</title>')[0]
            except:
                name = "تم الدخول بنجاح"
            send_tele(f"💙 فيسبوك شغال يا فادي!\n👤 الحساب: {name}\n🆔 الآيدي: 100003550913323\n🚀 البوت ذلحين يتفقد الإشعارات.")
        else:
            send_tele("❌ فشل الدخول لفيسبوك، الكوكيز شكلها طفيت.")
    except Exception as e:
        send_tele(f"🚫 خطأ فيسبوك: {str(e)[:50]}")

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Facebook Bot Active")

if __name__ == "__main__":
    Thread(target=start_bot).start()
    HTTPServer(('0.0.0.0', 8080), MyServer).serve_forever()
