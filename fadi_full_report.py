import requests

TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
CHAT_ID = "5042495708"

# أسعار صنعاء اللي اتفقنا عليها صميل
USD_SANAA = 535 
SAR_SANAA = 140 

def get_full_report():
    try:
        # حسبة الذهب باليمني (صنعاء)
        r = requests.get("https://api.coinbase.com/v2/prices/XAU-USD/spot", timeout=10).json()
        gold_gram_usd = float(r['data']['amount']) / 31.1035
        gold_gram_yer = round(gold_gram_usd * USD_SANAA, 0)
        
        msg = (
            f"💰 --- تقرير الزلط الشامل (صنعاء) --- 💰\n\n"
            f"🇺🇸 الـ 100 دولار = {100 * USD_SANAA} ريال\n"
            f"🇸🇦 الـ 100 سعودي = {100 * SAR_SANAA} ريال\n"
            f"✨ جرام الذهب = {gold_gram_yer} ريال يمني\n\n"
            f"يا فادي، هكذا التقرير كامل وما بش قاصر بصدق!"
        )
        return msg
    except:
        return "النت بيخراط، ما رضي يجمع المعلومات!"

# إرسال التقرير الكامل
requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", 
              json={"chat_id": CHAT_ID, "text": get_full_report()})
print("أرسلنا التقرير الكامل فيه السعودي والدولار والذهب!")
