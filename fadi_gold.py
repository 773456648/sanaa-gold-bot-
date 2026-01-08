import requests

# رابط مباشر لأسعار المعادن والعملات بصدق
url = "https://api.coinbase.com/v2/prices/XAU-USD/spot"

try:
    r = requests.get(url, timeout=15)
    data = r.json()
    gold_price = data['data']['amount']
    print("\n--- سكريبت صيد الذهب يا فادي ---")
    print(f"سعر أونصة الذهب ذلحين: {gold_price} دولار")
    print("--------------------------------")
    print("مهرة تخرج زلط ذهب بصدق!")
except Exception as e:
    print(f"السوق مغلق أو النت بيخراط! السبب: {e}")
