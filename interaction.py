import requests
import time
import random
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

headers = {
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    'x-csrftoken': 'S9PgOBigOlwByQ7ctSzurtWtwO01AwOd',
    'cookie': 'mid=aWrFHQABAAH9A3ASrdAZlnnxlmsS; ig_did=706D09F6-1F32-4B14-AA56-779F749B05B5; datr=HMVqafZ5ZgTvWCe2vSvPmI1-; ds_user_id=79987135024; sessionid=79987135024%3ATU9PJJ4iPmU37o%3A26%3AAYgp84aUoGStnk-s5AgCFc6obXdi8YVui0gbGnhgEg; csrftoken=S9PgOBigOlwByQ7ctSzurtWtwO01AwOd; rur="CLN\05479987135024\0541800141116:01fec76244b81cfa7de42d041e5c2def16f92f2ae597f5ca94d46c11ca06f16948c3f0ad"'
}

def send_tele(msg):
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        requests.get(url, params={"chat_id": chat_id, "text": msg})
    except: pass

def start_bot():
    try:
        # جلب معلومات الحساب للتأكيد
        check_url = "https://www.instagram.com/api/v1/accounts/current_user/?edit=true"
        res = requests.get(check_url, headers=headers).json()
        username = res.get('user', {}).get('username', 'غير معروف')
        user_id = res.get('user', {}).get('pk', 'غير معروف')
        
        send_tele(f"👤 تم الدخول بنجاح يا فادي!\n✅ الحساب: @{username}\n🆔 الآيدي: {user_id}\n🔥 الموتور شغال ذلحين!")
        
        # بعد التأكيد، نرجع لمحط اللايكات
        tags = ['yemen', 'explore']
        while True:
            tag = random.choice(tags)
            r = requests.get(f"https://www.instagram.com/explore/tags/{tag}/?__a=1&__d=dis", headers=headers).json()
            posts = r['graphql']['hashtag']['edge_hashtag_to_media']['edges']
            for p in posts[:5]:
                p_id = p['node']['id']
                requests.post(f"https://www.instagram.com/web/likes/{p_id}/like/", headers=headers)
                send_tele(f"❤️ لايك مسمار للمنشور: {p_id}")
                time.sleep(20)
            time.sleep(300)
    except Exception as e:
        send_tele(f"🚫 فشل في سحب اسم الحساب، الكوكيز قد تكون انتهت. الخطأ: {str(e)[:50]}")

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Confirmation Bot Active")

if __name__ == "__main__":
    Thread(target=start_bot).start()
    HTTPServer(('0.0.0.0', 8080), MyServer).serve_forever()
