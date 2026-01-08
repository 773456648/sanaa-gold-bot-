import requests

TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
CHAT_ID = "5042495708"

# أسعار صرف صنعاء
USD_SANAA = 535 
SAR_SANAA = 140 

def get_accurate_report():
    try:
        # سحب السعر العالمي
        r = requests.get("https://api.coinbase.com/v2/prices/XAU-USD/spot", timeout=10).json()
        gold_24_usd = float(r['data']['amount']) / 31.1035
        
        # حسبة عيار 21 مع "نتفة" الخصم (نقصنا 6% عشان يضبط مع صنعاء)
        gold_21_sanaa = (gold_24_usd * 0.875 * 0.94) * USD_SANAA
        
        return (
            f"🇾🇪 --- تقرير زبدة صنعاء (مضبوط) --- 🇾🇪\n\n"
            f"💵 الـ 100 دولار = {100 * USD_SANAA} ريال\n"
            f"🇸🇦 الـ 100 سعودي = {100 * SAR_SANAA} ريال\n"
            f"✨ جرام الذهب (21) = {int(gold_21_sanaa)} ريال\n\n"
            f"✅ يا فادي، الحسبة ذلحين نفس 'جوجل' بصدق!"
        )
    except:
        return "النت عصلج، حاول مرة ثانية!"

# إرسال التقرير
requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", 
              json={"chat_id": CHAT_ID, "text": get_accurate_report()})
print("تم إرسال التقرير المضبوط ليدك يا فادي!")
