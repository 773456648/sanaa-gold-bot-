import requests
import time

TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
CHAT_ID = "5042495708"

USD_SANAA = 535 

# هذه هي "الذاكرة" عشان يحفظ آخر سعر أرسله لك
last_gold_price = 0

def get_gold_report():
    try:
        r = requests.get("https://api.coinbase.com/v2/prices/XAU-USD/spot", timeout=10).json()
        price = float(r['data']['amount'])
        return price
    except:
        return None

print("بدأ البوت وضع القناص (يرسل عند التغيير فقط)...")

while True:
    current_price = get_gold_report()
    
    if current_price and current_price != last_gold_price:
        # إذا السعر اختلف عن آخر مرة، احسب وأرسل
        gold_24_usd = current_price / 31.1035
        def sanaa_price(usd_val):
            return int(usd_val * 0.94 * USD_SANAA)

        gold_21_yer = sanaa_price(gold_24_usd * 0.875)
        
        msg = (
            f"⚠️ التغير الجديد في السوق! ⚠️\n\n"
            f"✨ عيار (21): {gold_21_yer:,} ريال يمني\n"
            f"💰 السعر العالمي للأونصة: {current_price:,} $\n\n"
            f"يا فادي، السعر تغير ذلحين ولقطته لك طوالي!"
        )
        
        requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", 
                      json={"chat_id": CHAT_ID, "text": msg})
        
        # حدّث الذاكرة بالسعر الجديد
        last_gold_price = current_price
        print(f"تم إرسال التحديث! السعر الجديد: {current_price}")
    
    # يفحص كل 5 دقائق (300 ثانية) عشان ما يثقلش على السيرفر
    time.sleep(300) 
