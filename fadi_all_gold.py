import requests

TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
CHAT_ID = "5042495708"

USD_SANAA = 535 

def get_full_gold_report():
    try:
        r = requests.get("https://api.coinbase.com/v2/prices/XAU-USD/spot", timeout=10).json()
        gold_24_usd = float(r['data']['amount']) / 31.1035
        
        # حسبة العيارات مع خصم 6% عشان سوق صنعاء
        def sanaa_price(usd_val):
            return int(usd_val * 0.94 * USD_SANAA)

        gold_24_yer = sanaa_price(gold_24_usd)        # عيار 24
        gold_21_yer = sanaa_price(gold_24_usd * 0.875) # عيار 21
        gold_18_yer = sanaa_price(gold_24_usd * 0.750) # عيار 18
        
        return (
            f"👑 --- تقرير فادي لعيارات الذهب --- 👑\n\n"
            f"✨ جرام عيار (24): {gold_24_yer} ريال\n"
            f"✨ جرام عيار (21): {gold_21_yer} ريال\n"
            f"✨ جرام عيار (18): {gold_18_yer} ريال\n\n"
            f"💰 حسبة الـ 100$: {100 * USD_SANAA} ريال\n\n"
            f"يا فادي، هكذا السوق بين يدك بصدق!"
        )
    except:
        return "النت بيخراط!"

requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", 
              json={"chat_id": CHAT_ID, "text": get_full_gold_report()})
print("تم إرسال طقم العيارات كامل يا بطل!")
