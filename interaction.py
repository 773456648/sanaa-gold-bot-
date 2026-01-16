import requests
import time
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# الكوكيز والتوكن حقك
headers = {
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; Mobile; rv:119.0) Gecko/119.0 Firefox/119.0', # تحديث الـ UA
    'x-csrftoken': 'S9PgOBigOlwByQ7ctSzurtWtwO01AwOd',
    'cookie': 'mid=aWrFHQABAAH9A3ASrdAZlnnxlmsS; ig_did=706D09F6-1F32-4B14-AA56-779F749B05B5; datr=HMVqafZ5ZgTvWCe2vSvPmI1-; ds_user_id=79987135024; sessionid=79987135024%3ATU9PJJ4iPmU37o%3A26%3AAYgp84aUoGStnk-s5AgCFc6obXdi8YVui0gbGnhgEg; csrftoken=S9PgOBigOlwByQ7ctSzurtWtwO01AwOd; rur="CLN\05479987135024\0541800141116:01fec76244b81cfa7de42d041e5c2def16f92f2ae597f5ca94d46c11ca06f16948c3f0ad"'
}

def send_tele(msg):
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        requests.get(url, params={"chat_id": chat_id, "text": msg})
    except: pass

def start_bot():
    send_tele("🛠 جاري المحاولة الأخيرة لإرسال DM بـ UserAgent مطابق...")
    target_id = "70560938556"
    url = "https://www.instagram.com/api/v1/direct_v2/threads/broadcast/text/"
    
    data = {
        'recipient_users': f'[[{target_id}]]',
        'text': 'هذه رسالة من سارة.. حساب فادي شغال يا وحش! 😉',
        'action': 'send_item',
        'client_context': str(int(time.time() * 1000))
    }
    
    try:
        # إضافة headers إضافية لتمويه انستقرام
        headers['x-instagram-ajax'] = '1'
        headers['x-requested-with'] = 'XMLHttpRequest'
        
        response = requests.post(url, headers=headers, data=data)
        if response.status_code == 200:
            send_tele("✅ أخيراً! الرسالة وصلت والحساب نشد رسمي.")
        else:
            send_tele(f"⚠️ رفض ثاني (Code: {response.status_code})")
            send_tele(f"السبب الجديد: {response.text[:100]}")
    except Exception as e:
        send_tele(f"🚫 خطأ: {str(e)}")

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"UA Fix Active")

if __name__ == "__main__":
    Thread(target=start_bot).start()
    HTTPServer(('0.0.0.0', 8080), MyServer).serve_forever()
