import requests
import time
import re
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"
# رابط المنشور اللي أديته أنت ذلحين
target_post = "https://mbasic.facebook.com/share/p/183RqY49UT/"

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
    send_tele("🔍 جاري فحص المنشور المحدد ودعسه لايك...")
    try:
        r = requests.get(target_post, cookies=cookies)
        # البحث عن زر اللايك في صفحة المنشور
        like_link = re.findall(r'/a/like.php\?.*?"', r.text)
        if like_link:
            link = "https://mbasic.facebook.com" + like_link[0].replace('"', '').replace('&amp;', '&')
            requests.get(link, cookies=cookies)
            send_tele("🔥 تم دعس اللايك بنجاح على المنشور! سير تأكد ذلحين يا فادي.")
        else:
            if "login_form" in r.text or "checkpoint" in r.text:
                send_tele("❌ يا فادي، الكوكيز حقك انتهت (Session Expired)، لازم تجددها!")
            else:
                send_tele("⚠️ مالقيت زر لايك.. يمكن قد فعلت له من قبل أو المنشور خاص.")
    except Exception as e:
        send_tele(f"🚫 حصل خطأ: {str(e)}")

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Test Active")

if __name__ == "__main__":
    Thread(target=start_bot).start()
    HTTPServer(('0.0.0.0', 8080), MyServer).serve_forever()
