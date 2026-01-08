import requests
import time

TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
CHAT_ID = "5042495708"

# أسعار صنعاء الثابتة صميل
USD_SANAA = 535 
SAR_SANAA = 140 

def get_full_report():
    try:
        r = requests.get("https://api.coinbase.com/v2/prices/XAU-USD/spot", timeout=10).json()
        gold_gram_usd = float(r['data']['amount']) / 31.1035
        gold_gram_yer = round(gold_gram_usd * USD_SANAA, 0)
        
        return (
            f"💰 --- تقرير فادي الشامل ذلحين --- 💰\n\n"
            f"🇺🇸 الـ 100 دولار = {100 * USD_SANAA} ريال\n"
            f"🇸🇦 الـ 100 سعودي = {100 * SAR_SANAA} ريال\n"
            f"✨ جرام الذهب = {gold_gram_yer} ريال يمني\n\n"
            f"✅ شغال ومنتبه لك يا ذيب!"
        )
    except:
        return None

last_gold_price = 0
print("--- البوت بدأ المراقبة المستمرة يا فادي ---")

while True:
    report = get_full_report()
    if report:
        # إذا تغير سعر الذهب أو مرت ساعة، يرسل لك التقرير صميل
        requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", 
                      json={"chat_id": CHAT_ID, "text": report})
        print("أرسلنا التقرير المحدث للتليجرام!")
    
    # ينام لمدة ساعة (3600 ثانية) وعاود الكرة بصدق
    time.sleep(3600)
