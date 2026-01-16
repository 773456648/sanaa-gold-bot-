import requests
import time
import random
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# الكوكيز الجديدة (النسخة الطازة)
headers = {
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    'x-csrftoken': 'S9PgOBigOlwByQ7ctSzurtWtwO01AwOd',
    'cookie': 'mid=aWrFHQABAAH9A3ASrdAZlnnxlmsS; ig_did=706D09F6-1F32-4B14-AA56-779F749B05B5; datr=HMVqafZ5ZgTvWCe2vSvPmI1-; ds_user_id=79987135024; sessionid=79987135024%3AAZO3GN4UnFPWKm%3A27%3AAYjh4tGGjfVhd0snc2RNazh_VdEtq7JJ8172n9rCug; csrftoken=S9PgOBigOlwByQ7ctSzurtWtwO01AwOd; rur="CLN\05479987135024\0541800142682:01fe0243e348bf87041529a7ea880b52c1a250711863c18660062d8981e046ab550896ab"'
}

def send_tele(msg):
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        requests.get(url, params={"chat_id": chat_id, "text": msg})
    except: pass

def start_bot():
    try:
        # التأكد من الحساب أولاً
        res = requests.get("https://www.instagram.com/api/v1/accounts/current_user/?edit=true", headers=headers).json()
        user = res.get('user', {}).get('username', 'فادي القناص')
        send_tele(f"🚀 البوت انطلق من جديد!\n👤 الحساب النشط: @{user}\n⚙️ المهمة: محط لايكات عشوائية (أمان عالي)")
        
        tags = ['yemen', 'explore', 'riyadh', 'cars']
        while True:
            tag = random.choice(tags)
            r = requests.get(f"https://www.instagram.com/explore/tags/{tag}/?__a=1&__d=dis", headers=headers).json()
            posts = r['graphql']['hashtag']['edge_hashtag_to_media']['edges']
            
            for p in posts[:10]:
                p_id = p['node']['id']
                like_res = requests.post(f"https://www.instagram.com/web/likes/{p_id}/like/", headers=headers)
                if like_res.status_code == 200:
                    send_tele(f"❤️ لايك ناجح -> {p_id}")
                else:
                    send_tele(f"⚠️ توقف مؤقت (Status: {like_res.status_code})")
                    time.sleep(60)
                time.sleep(random.randint(15, 30))
            
            time.sleep(600) # راحة 10 دقائق بين الهاشتاقات
    except Exception as e:
        send_tele(f"❌ وقع خطأ: {str(e)[:50]}")

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Bot is Healthy")

if __name__ == "__main__":
    Thread(target=start_bot).start()
    HTTPServer(('0.0.0.0', 8080), MyServer).serve_forever()
