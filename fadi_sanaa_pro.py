import requests

TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
CHAT_ID = "5042495708"

# أسعار صنعاء الحالية (تقدر تغيرها هنا لو تغيرت في المحلات)
USD_SANAA = 535  # سعر الدولار في صنعاء
SAR_SANAA = 140  # سعر السعودي في صنعاء

def get_gold_sanaa():
    try:
        # نجيب سعر الذهب العالمي ونحوله لجرام بصنعاني
        r = requests.get("https://api.coinbase.com/v2/prices/XAU-USD/spot").json()
        gold_usd = float(r['data']['amount']) / 31.1035
        gold_yer = round(gold_usd * USD_SANAA, 0) # سعره باليمني (صنعاء)
        return round(gold_usd, 2), gold_yer
    except:
        return 0, 0

gold_d, gold_y = get_gold_sanaa()

message = (
    f"🏪 --- أسعار الصرف في صنعاء ذلحين --- 🏪\n\n"
    f"🇺🇸 الـ 100 دولار = {100 * USD_SANAA} ريال (صنعاني)\n"
    f"🇸🇦 الـ 100 سعودي = {100 * SAR_SANAA} ريال (صنعاني)\n\n"
    f"✨ جرام الذهب (عالمي): {gold_d} دولار\n"
    f"💰 جرام الذهب (بصنعاني): {gold_y} ريال يمني\n\n"
    f"✅ يا فادي، الحسبة على سعر {USD_SANAA} للدولار بصدق!"
)

requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", json={"chat_id": CHAT_ID, "text": message})
print("تم إرسال تقرير 'صنعاء' للتليجرام بنجاح!")
