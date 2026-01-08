import requests
import time

TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
CHAT_ID = "5042495708"

# أسعار صرف صنعاء (ثابتة صميل)
USD_SANAA = 535 
SAR_SANAA = 140 

def get_gold_sanaa():
    try:
        # سحب سعر الذهب العالمي (عيار 24)
        r = requests.get("https://api.coinbase.com/v2/prices/XAU-USD/spot").json()
        gold_24_usd = float(r['data']['amount']) / 31.1035
        
        # حسبة عيار 21 (نضرب في 0.875)
        gold_21_usd = gold_24_usd * 0.875
        
        # التحويل للريال اليمني (صنعاء)
        gold_24_yer = round(gold_24_usd * USD_SANAA, 0)
        gold_21_yer = round(gold_21_usd * USD_SANAA, 0)
        
        return (
            f"💰 --- تقرير الزلط والذهب (صنعاء) --- 💰\n\n"
            f"💵 الـ 100 دولار = {100 * USD_SANAA} ريال\n"
            f"🇸🇦 الـ 100 سعودي = {100 * SAR_SANAA} ريال\n\n"
            f"✨ جرام الذهب (24): {gold_24_yer} ريال\n"
            f"✨ جرام الذهب (21): {gold_21_yer} ريال\n\n"
            f"✅ الحسبة دقيقة يا فادي وعلى عيارات السوق!"
        )
    except:
        return None

# إرسال التقرير فوراً
report = get_gold_sanaa()
if report:
    requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", json={"chat_id": CHAT_ID, "text": report})
    print("تم إرسال التقرير بالعيارات الجديدة!")
