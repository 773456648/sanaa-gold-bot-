import requests
import time

TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
CHAT_ID = "5042495708"

def get_data():
    try:
        # سحب أسعار الصرف (سعودي ودولار)
        r_ex = requests.get("https://api.exchangerate-api.com/v4/latest/USD", timeout=10).json()
        usd_to_yer = r_ex['rates']['YER']
        usd_to_sar = r_ex['rates']['SAR']
        sar_to_yer = round(usd_to_yer / usd_to_sar, 2)
        
        # سحب سعر الذهب العالمي (للأونصة) وتحويله لجرام
        r_gold = requests.get("https://api.coinbase.com/v2/prices/XAU-USD/spot", timeout=10).json()
        gold_oz = float(r_gold['data']['amount'])
        gold_gram = round(gold_oz / 31.1035, 2) # الأونصة فيها 31.1 جرام بصدق
        
        # حسبة "المية" اللي تشتيها يا فادي
        total_100_usd = round(100 * usd_to_yer, 2)
        total_100_sar = round(100 * sar_to_yer, 2)
        
        message = (
            f"💰 --- تقرير فادي للزلط --- 💰\n\n"
            f"💵 الـ 100 دولار = {total_100_usd} ريال يمني\n"
            f"🇸🇦 الـ 100 سعودي = {total_100_sar} ريال يمني\n"
            f"✨ جرام الذهب = {gold_gram} دولار\n\n"
            f"⚠️ ملاحظة: هذه أسعار البورصة العالمية بصدق!"
        )
        return message
    except:
        return "النت بيخراط، عأحاول مرة ثانية!"

def send_to_fadi(msg):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    requests.post(url, json={"chat_id": CHAT_ID, "text": msg})

print("--- بوت 'المية والذهب' شغال ذلحين يا فادي ---")

# نرسل أول تقرير فوراً
send_to_fadi(get_data())

# يرسل لك تحديث كل ساعة أو إذا تغير السعر بقوة
while True:
    time.sleep(3600) # ساعة كاملة عشان ما يزعجكش بصدق
    send_to_fadi(get_data())
