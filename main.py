import requests

TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
CHAT_ID = "5042495708"

# أسعار الصرف في صنعاء (عدلها لو تغيرت)
USD_SANAA = 535 
SAR_SANAA = 141

def get_full_gold_report():
    try:
        # سحب سعر أونصة الذهب عالمياً
        r = requests.get("https://api.coinbase.com/v2/prices/XAU-USD/spot", timeout=10).json()
        gold_24_usd = float(r['data']['amount']) / 31.1035
        
        # حسبة البيع في سوق صنعاء (خصم 6%)
        def sanaa_price(usd_val):
            return int(usd_val * 0.94 * USD_SANAA)

        gold_24_yer = sanaa_price(gold_24_usd)
        gold_21_yer = sanaa_price(gold_24_usd * 0.875)
        gold_18_yer = sanaa_price(gold_24_usd * 0.750)
        
        return (
            f"👑 --- تقرير فادي لأسعار الذهب --- 👑\n\n"
            f"✨ جرام عيار (24): {gold_24_yer:,} ريال\n"
            f"✨ جرام عيار (21): {gold_21_yer:,} ريال\n"
            f"✨ جرام عيار (18): {gold_18_yer:,} ريال\n\n"
            f"💵 صرف الـ 100$: {100 * USD_SANAA:,} ريال\n"
            f"🇸🇦 صرف الـ 1000سعودي: {1000 * SAR_SANAA:,} ريال\n\n"
            f"يا فادي، السوق ذلحين بيدك والزفة تمت! 😎"
        )
    except:
        return "النت بيخراط.. تأكد من الاتصال!"

# إرسال الرسالة للتلجرام
requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", 
              json={"chat_id": CHAT_ID, "text": get_full_gold_report()})
print("تم تحديث الملف وإرسال التقرير بالسعودي! ✅")
