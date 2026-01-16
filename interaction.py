import requests
import time
import random
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# الكوكيز الجديدة اللي أديتها لي ذلحين
headers = {
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    'x-csrftoken': 'S9PgOBigOlwByQ7ctSzurtWtwO01AwOd',
    'cookie': 'mid=aWrFHQABAAH9A3ASrdAZlnnxlmsS; ig_did=706D09F6-1F32-4B14-AA56-779F749B05B5; datr=HMVqafZ5ZgTvWCe2vSvPmI1-; ds_user_id=79987135024; sessionid=79987135024%3AAZO3GN4UnFPWKm%3A27%3AAYjh4tGGjfVhd0snc2RNazh_VdEtq7JJ8172n9rCug; csrftoken=S9PgOBigOlwByQ7ctSzurtWtwO01AwOd; rur="CLN\05479987135024\0541800142831:01fe0c68f39429bde678dba0903f58077575c7d3b2f865dcff522fbea6bcd0da2271c2ef"'
}

def send_tele(msg):
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        requests.get(url, params={"chat_id": chat_id, "text": msg})
    except: pass

def start_bot():
    try:
        # محاولة سحب الاسم أولاً للتأكيد
        res = requests.get("https://i.instagram.com/api/v1/accounts/current_user/?edit=true", headers=headers).json()
        user = res.get('user', {}).get('username', 'فادي')
        send_tele(f"✨ أبشرك يا فادي.. البوت دخل الحساب: @{user}")
        
        tags = ['yemen', 'explore', 'riyadh']
        while True:
            tag = random.choice(tags)
            r = requests.get(f"https://www.instagram.com/explore/tags/{tag}/?__a=1&__d=dis", headers=headers).json()
            posts = r['graphql']['hashtag']['edge_hashtag_to_media']['edges']
            
            count = 0
            for p in posts[:10]:
                p_id = p['node']['id']
                like_res = requests.post(f"https://www.instagram.com/web/likes/{p_id}/like/", headers=headers)
                if like_res.status_code == 200:
                    count += 1
                time.sleep(random.randint(20, 40))
            
            send_tele(f"✅ خلصت جولة هاشتاق #{tag} ودعست {count} لايكات.")
            time.sleep(600) # راحة 10 دقائق
    except Exception as e:
        send_tele(f"❌ عاد الخبر نفس الخبر (JSON Error).. يمكن انستقرام حظر الآيبي حق السيرفر.")

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Bot is Ready")

if __name__ == "__main__":
    Thread(target=start_bot).start()
    HTTPServer(('0.0.0.0', 8080), MyServer).serve_forever()
