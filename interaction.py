import requests
import time
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"
# حط رابط أي منشور من الحساب هنا للتجربة
target_post_url = "https://www.instagram.com/p/رقم_المنشور/" 

headers = {
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    'x-csrftoken': 'xqC3a9sB54luuuH3G7zuPQrPK08dE3GB',
    'cookie': 'mid=aTDTXwABAAFiu3_BoialtOF0PsTV; ig_did=7AE4BD2C-97A8-4D67-A707-5868ACBD8A2E; datr=X9MwaXSnirEs05IjOyuRfXV7; ds_user_id=79987135024; sessionid=79987135024%3A9haATiVjjPWdng%3A16%3AAYg2uCT0KxXGsPTEsqpwIUQNFls5J11c2S0RGApAFQ; csrftoken=xqC3a9sB54luuuH3G7zuPQrPK08dE3GB; rur="RVA\05479987135024\0541800124509:01fe485211aa310842f1b202f499f5f56986e7794bfa7a12e82b4bec17fe9aceb3ba985a"'
}

def send_tele(msg):
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        requests.get(url, params={"chat_id": chat_id, "text": msg})
    except: pass

def start_bot():
    send_tele("🛠 جاري محاولة دعس منشور محدد لتخطي خطأ JSON...")
    try:
        # استخراج الـ ID من الرابط يدوياً لو احتجنا أو محاولة اللايك
        # هذه المرة عأخلي البوت يطبع نص الاستجابة لو فشل
        res = requests.get(target_post_url, headers=headers)
        if res.status_code == 200:
            send_tele("✅ المنشور متاح، جاري إرسال اللايك...")
            # هنا يجي كود إرسال اللايك المباشر
        else:
            send_tele(f"🚫 انستقرام رفض الدخول: {res.status_code}")
    except Exception as e:
        send_tele(f"🚫 خطأ جديد: {str(e)}")

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Fixing Error")

if __name__ == "__main__":
    Thread(target=start_bot).start()
    HTTPServer(('0.0.0.0', 8080), MyServer).serve_forever()
