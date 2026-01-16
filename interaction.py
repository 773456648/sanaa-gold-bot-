import requests
import time
import json
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# الكوكيز الجديدة
headers = {
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    'x-csrftoken': 'S9PgOBigOlwByQ7ctSzurtWtwO01AwOd',
    'x-instagram-ajax': '1',
    'x-requested-with': 'XMLHttpRequest',
    'cookie': 'mid=aWrFHQABAAH9A3ASrdAZlnnxlmsS; ig_did=706D09F6-1F32-4B14-AA56-779F749B05B5; datr=HMVqafZ5ZgTvWCe2vSvPmI1-; ds_user_id=79987135024; sessionid=79987135024%3ATU9PJJ4iPmU37o%3A26%3AAYgp84aUoGStnk-s5AgCFc6obXdi8YVui0gbGnhgEg; csrftoken=S9PgOBigOlwByQ7ctSzurtWtwO01AwOd; rur="CLN\05479987135024\0541800141116:01fec76244b81cfa7de42d041e5c2def16f92f2ae597f5ca94d46c11ca06f16948c3f0ad"'
}

def send_tele(msg):
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        requests.get(url, params={"chat_id": chat_id, "text": msg})
    except: pass

def start_bot():
    send_tele("📨 جاري محاولة إرسال رسالة DM للتأكد من الكوكيز...")
    target_id = "70560938556" # ID حساب malk.mostafa
    msg_text = "سلام يا حب، هذه رسالة تجربة من بوت فادي المبرمج! 😉"
    
    url = "https://www.instagram.com/api/v1/direct_v2/threads/broadcast/text/"
    data = {
        'recipient_users': f'[[{target_id}]]',
        'thread_ids': '[]',
        'text': msg_text,
        'action': 'send_item',
        'client_context': str(int(time.time() * 1000))
    }
    
    try:
        response = requests.post(url, headers=headers, data=data)
        if response.status_code == 200:
            send_tele("✅ تم إرسال الرسالة بنجاح! كوكيزك شغال نار.")
        else:
            send_tele(f"⚠️ انستقرام رفض إرسال الرسالة. (Code: {response.status_code})")
            send_tele(f"السبب: {response.text[:100]}")
    except Exception as e:
        send_tele(f"🚫 خطأ في الإرسال: {str(e)}")

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"DM Test Active")

if __name__ == "__main__":
    Thread(target=start_bot).start()
    HTTPServer(('0.0.0.0', 8080), MyServer).serve_forever()
