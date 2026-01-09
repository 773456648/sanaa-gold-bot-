import requests
import time

TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
CHAT_ID = "5042495708"

# أسعار الصرف في صنعاء
USD_SANAA = 535 
SAR_SANAA = 141

last_gold_price = 0

def get_gold_report():
    try:
        r = requests.get("https://api.coinbase.com/v2/prices/XAU-USD/spot", timeout=10).json()
        return float(r['data']['amount'])
    except:
        return None

print("بدأ البوت وضع القناص الشامل...")

while True:
    current_price = get_gold_report()
    
    # يرسل إذا تغير السعر بأكثر من 0.5 دولار عشان يكون دقيق وحساس
    if current_price and abs(current_price - last_gold_price) >= 0.5:
        gold_24_usd = current_price / 31.1035
        
        def sanaa_price(usd_val):
            return int(usd_val * 0.94 * USD_SANAA)

        gold_24_yer = sanaa_price(gold_24_usd)
        gold_21_yer = sanaa_price(gold_24_usd * 0.875)
        gold_18_yer = sanaa_price(gold_24_usd * 0.750)
        
        clean_price = round(current_price, 2)
        
        msg = (
            f"⚠️ تحديث جديد وشامل للسوق! ⚠️\n\n"
            f"✨ جرام عيار (24): {gold_24_yer:,} ريال\n"
            f"✨ جرام عيار (21): {gold_21_yer:,} ريال\n"
            f"✨ جرام عيار (18): {gold_18_yer:,} ريال\n\n"
            f"💵 صرف الـ 100$: {100 * USD_SANAA:,} ريال\n"
            f"🇸🇦 صرف الـ 1000سعودي: {1000 * SAR_SANAA:,} ريال\n\n"
            f"💰 العالمي: {clean_price:,} $\n\n"
            f"يا فادي، الطقم كامل بين يدك ذلحين!"
        )
        
        requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", 
                      json={"chat_id": CHAT_ID, "text": msg})
        
        last_gold_price = current_price
    
    # يفحص كل 3 دقائق عشان يلقط التغيير سريع
    time.sleep(180) 
