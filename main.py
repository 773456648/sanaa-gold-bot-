cat <<EOF > main.py
import requests
import time

TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
CHAT_ID = "5042495708"

# أسعار الصرف في صنعاء
USD_SANAA = 535 
SAR_SANAA = 141

def get_gold_report():
    try:
        r = requests.get("https://api.coinbase.com/v2/prices/XAU-USD/spot", timeout=10).json()
        gold_24_usd = float(r['data']['amount']) / 31.1035
        
        def sanaa_price(usd_val):
            return int(usd_val * 0.94 * USD_SANAA)

        gold_24_yer = sanaa_price(gold_24_usd)
        gold_21_yer = sanaa_price(gold_24_usd * 0.875)
        gold_18_yer = sanaa_price(gold_24_usd * 0.750)
        
        return (
            f"📢 --- تحديث تلقائي للأسعار --- 📢\n\n"
            f"✨ عيار (24): {gold_24_yer:,} ريال\n"
            f"✨ عيار (21): {gold_21_yer:,} ريال\n"
            f"✨ عيار (18): {gold_18_yer:,} ريال\n\n"
            f"💵 الـ 100\$: {100 * USD_SANAA:,} ريال\n"
            f"🇸🇦 الـ 1000سعودي: {1000 * SAR_SANAA:,} ريال\n\n"
            f"البوت شغال يراقب السوق عشانك يا فادي! 😎"
        )
    except:
        return None

print("بدأ البوت وضع المراقبة التلقائية...")

# دوّارة لا نهائية تجلس تفحص وترسل كل ساعة
while True:
    report = get_gold_report()
    if report:
        requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", 
                      json={"chat_id": CHAT_ID, "text": report})
        print("تم إرسال التحديث التلقائي!")
    
    # انتظر ساعة كاملة (3600 ثانية) قبل الفحص القادم
    time.sleep(3600) 
EOF

