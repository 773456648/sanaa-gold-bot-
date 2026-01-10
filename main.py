import requests
import time

TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
CHAT_ID = "5042495708"

# الصرف الثابت اللي اتفقنا عليه
USD_SANAA = 535 
SAR_SANAA = 141

last_gold_price = 0

def get_gold_report():
    try:
        r = requests.get("https://api.coinbase.com/v2/prices/XAU-USD/spot", timeout=10).json()
        return float(r['data']['amount'])
    except:
        return None

print("بدأ البوت وضع القناص (تنبيه عند تغير 1$ فأكثر)...")

while True:
    current_price = get_gold_report()
    
    # هنا الشرط: الفرق لازم يكون يساوي أو أكبر من 1 دولار
    if current_price and abs(current_price - last_gold_price) >= 1.0:
        gold_24_usd = current_price / 31.1035
        
        def sanaa_price(usd_val):
            return int(usd_val * 0.94 * USD_SANAA)

        gold_24_yer = sanaa_price(gold_24_usd)
        gold_21_yer = sanaa_price(gold_24_usd * 0.875)
        gold_18_yer = sanaa_price(gold_24_usd * 0.750)
        
        msg = (
            f"⚠️ تحرك السعر دولار واحد أو أكثر! ⚠️\n\n"
            f"✨ عيار (24): {gold_24_yer:,} ريال\n"
            f"✨ عيار (21): {gold_21_yer:,} ريال\n"
            f"✨ عيار (18): {gold_18_yer:,} ريال\n\n"
            f"💵 الصرف: (535 / 141)\n"
            f"💰 السعر العالمي الحالي: {round(current_price, 2):,} $\n\n"
            f"يا فادي، السوق تحرك ذلحين ولقطته لك!"
        )
        
        requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", 
                      json={"chat_id": CHAT_ID, "text": msg})
        
        last_gold_price = current_price
    
    # يفحص كل 5 دقائق
    time.sleep(300) 
