import requests
import time

TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
CHAT_ID = "5042495708"

def send_to_fadi(message):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    payload = {"chat_id": CHAT_ID, "text": message}
    try:
        requests.post(url, json=payload)
    except:
        pass

print("--- البوت شغال وبيقنص السعر ذلحين ---")
send_to_fadi("✅ يا فادي، أنا بوتك وشغال ذلحين! استعد للزلط!")

last_price = 0
while True:
    try:
        r = requests.get("https://api.exchangerate-api.com/v4/latest/SAR", timeout=10)
        price = r.json()['rates']['YER']
        if price != last_price:
            send_to_fadi(f"📢 السعر تغير!\n1 ريال سعودي = {price} يمني 💰")
            last_price = price
        time.sleep(30)
    except:
        time.sleep(10)
