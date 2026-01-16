import requests
import time
import random
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# تجهيز الكوكيز من البيانات اللي أديتها لي يا فادي
headers = {
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    'x-csrftoken': 'xqC3a9sB54luuuH3G7zuPQrPK08dE3GB',
    'cookie': 'mid=aTDTXwABAAFiu3_BoialtOF0PsTV; ig_did=7AE4BD2C-97A8-4D67-A707-5868ACBD8A2E; datr=X9MwaXSnirEs05IjOyuRfXV7; ds_user_id=79987135024; sessionid=79987135024%3A9haATiVjjPWdng%3A16%3AAYg2uCT0KxXGsPTEsqpwIUQNFls5J11c2S0RGApAFQ; csrftoken=xqC3a9sB54luuuH3G7zuPQrPK08dE3GB; rur="CLN\05479987135024\0541800123205:01fe1026c2ddf9a3dc958acae060a0c095116e9e9adb46f2ef6ff989a39f8d6fced128d7"'
}

def send_tele(msg):
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        requests.get(url, params={"chat_id": chat_id, "text": msg})
    except: pass

def start_bot():
    send_tele("🎲 بدأت غارة اللايكات العشوائية على انستقرام يا فادي!")
    tags = ['explore', 'yemen', 'nature', 'coding']
    while True:
        try:
            tag = random.choice(tags)
            # جلب منشورات عشوائية من هاشتاق
            res = requests.get(f"https://www.instagram.com/explore/tags/{tag}/?__a=1&__d=dis", headers=headers).json()
            posts = res['graphql']['hashtag']['edge_hashtag_to_media']['edges']
            
            for post in posts[:5]: # يدي 5 لايكات كل جولة
                post_id = post['node']['id']
                like_url = f"https://www.instagram.com/web/likes/{post_id}/like/"
                requests.post(like_url, headers=headers)
                send_tele(f"❤️ لايك عشوائي (هاشتاق #{tag}) لمنشور: {post_id}")
                time.sleep(random.randint(30, 60)) # وقت عشوائي عشان الحماية
                
            time.sleep(600) # يرتاح 10 دقائق ويرجع يكمل
        except Exception as e:
            time.sleep(300)

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Insta Random Active")

if __name__ == "__main__":
    Thread(target=start_bot).start()
    HTTPServer(('0.0.0.0', 8080), MyServer).serve_forever()
