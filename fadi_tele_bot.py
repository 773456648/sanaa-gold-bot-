import requests
import time

# التوكن حقك اللي طلع في الصورة بصدق
TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
# حط هنا رقم الـ ID حقك (تقدر تجيبه من بوت @userinfobot)
CHAT_ID = "اكتب_رقم_حسابك_هنا"

def send_to_fadi(message):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    payload = {"chat_id": CHAT_ID, "text": message}
    try:
        requests.post(url, json=payload)
        print("أرسلنا الرسالة للتليجرام بنجاح!")
    except:
        print("عصلج النت وما رضي يرسل!")

print("--- البوت بدأ يراقب الصرف ذلحين يا فادي ---")
send_to_fadi("يا فادي، أنا بوتك الجديد وشغال ذلحين زي اللوز!")

# هنا السكريبت عيجلس يراقب السعر ويرسله لك
last_price = 0
while True:
    try:
        r = requests.get("https://api.exchangerate-api.com/v4/latest/SAR", timeout=10)
        price = r.json()['rates']['YER']
        if price != last_price:
            send_to_fadi(f"📢 السعر تغير في البورصة!\n1 ريال سعودي = {price} يمني")
            last_price = price
        time.sleep(60) # يشيك كل دقيقة بصدق
    except:
        time.sleep(10)
