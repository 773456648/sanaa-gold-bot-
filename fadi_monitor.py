import requests
import time

def get_price():
    url = "https://api.coindesk.com/v1/bpi/currentprice.json"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        r = requests.get(url, headers=headers, timeout=10)
        return r.json()['bpi']['USD']['rate']
    except:
        return None

print("--- بدأنا مراقبة السوق يا فادي ---")
old_price = ""

while True:
    current_price = get_price()
    if current_price:
        if current_price != old_price:
            print(f"[{time.strftime('%H:%M:%S')}] السعر تغير: {current_price} $")
            old_price = current_price
        else:
            print(f"[{time.strftime('%H:%M:%S')}] السعر ثابت...")
    else:
        print("النت بيخراط علينا...")
    
    time.sleep(10) # انتظر 10 ثواني قبل الصيد الجاي
