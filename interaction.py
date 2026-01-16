import requests
import time
import re
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

# معلوماتك يا مبرمج فادي
token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

def send_tele(msg):
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        params = {"chat_id": chat_id, "text": msg}
        requests.get(url, params=params)
    except: pass

cookies = {
    'c_user': '100003550913323',
    'xs': '31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1',
    'fr': '0ZAmSGvgnip1quTXs.AWfzSueuMXxd_mA9dRQT6pHPV6ekP7rFswmgramcUIJj5LwKP_0.BpZWqJ..AAA.0.0.BpaXdf.AWdM-MLHWfD20iUiQgY1mror1sU',
    'datr': 'iGplaV28PgweKRFA2B3ALpcC',
    'sb': 'iWplaTgxXWaKpJpcZOMr2nJZ'
}

def start_bot():
    send_tele("🚀 أبشرك يا فادي.. البوت اشتغل في السحاب وعتوصلك التقارير هنا!")
    while True:
        try:
            r = requests.get("https://mbasic.facebook.com/", cookies=cookies)
            likes = re.findall(r'/a/like.php\?.*?"', r.text)
            if likes:
                for u in likes[:1]: # لايك واحد كل عشر دقائق عشان الأمان
                    link = "https://mbasic.facebook.com" + u.replace('"', '').replace('&amp;', '&')
                    requests.get(link, cookies=cookies)
                    send_tele("👍 تم عمل لايك جديد بنجاح من السيرفر!")
                    time.sleep(15)
            time.sleep(600) 
        except Exception as e:
            time.sleep(60)

# سيرفر وهمي عشان Render ما يغلق البوت
class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Bot is Live!")

if __name__ == "__main__":
    Thread(target=start_bot).start()
    server = HTTPServer(('0.0.0.0', 8080), MyServer)
    server.serve_forever()

