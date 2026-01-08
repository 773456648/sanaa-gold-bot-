import requests

TOKEN = "8202624609:AAFANTQ275DFav65KnGGtcji1SibG0-u1E0"
CHAT_ID = "5042495708"

# أسعار الصرف في صنعاء (عدلها لو زاد السعر أو نقص صميل)
USD_SANAA = 535 

def get_gold_report():
    try:
        # نجيب سعر الأونصة العالمية ونحولها لجرام
        r = requests.get("https://api.coinbase.com/v2/prices/XAU-USD/spot", timeout=10).json()
        gold_oz_usd = float(r['data']['amount'])
        gold_gram_usd = gold_oz_usd / 31.1035 # سعر الجرام بالدولار
        
        # الحسبة اللي تشتيها يا فادي: الجرام بكم يمني بصنعاء
        gold_gram_yer = round(gold_gram_usd * USD_SANAA, 0)
        
        msg = (
            f"✨ --- تقرير الذهب في صنعاء --- ✨\n\n"
            f"💰 سعر الجرام الواحد = {gold_gram_yer} ريال يمني\n"
            f"💵 (حسبناه على سعر دولار صنعاء: {USD_SANAA})\n\n"
            f"يا فادي، هذا السعر العالمي محول لصنعاني بصدق!"
        )
        return msg
    except:
        return "النت بيخراط، ما رضي يسحب سعر الذهب!"

# إرسال الرسالة للتليجرام
requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", 
              json={"chat_id": CHAT_ID, "text": get_gold_report()})
print("تم إرسال سعر جرام الذهب باليمني يا فادي!")
