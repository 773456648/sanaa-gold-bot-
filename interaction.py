import requests
import time
import random
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

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
    send_tele("👣 بدأت غارة المتابعات العشوائية! جهز حالك يا فادي.")
    tags = ['yemen', 'coding', 'cars', 'explore']
    while True:
        try:
            tag = random.choice(tags)
            res = requests.get(f"https://www.instagram.com/explore/tags/{tag}/?__a=1&__d=dis", headers=headers).json()
            items = res['graphql']['hashtag']['edge_hashtag_to_media']['edges']
            
            for item in items[:5]:
                user_id = item['node']['owner']['id']
                follow_url = f"https://www.instagram.com/web/friendships/{user_id}/follow/"
                response = requests.post(follow_url, headers=headers)
                
                if response.status_code == 200:
                    send_tele(f"👤 تم متابعة مستخدم جديد بنجاح! (ID: {user_id})")
                else:
                    send_tele(f"⚠️ فشلت المتابعة، انستقرام قفل المهرة (Code: {response.status_code})")
                
                time.sleep(random.randint(20, 40)) # وقت عشان ما ننحظر
            time.sleep(300) 
        except Exception as e:
            time.sleep(60)

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Follow Bot Active")

if __name__ == "__main__":
    Thread(target=start_bot).start()
    HTTPServer(('0.0.0.0', 8080), MyServer).serve_forever()
