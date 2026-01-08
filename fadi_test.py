import requests
try:
    # بنجرب موقع ويكيبيديا، خفيف ومستقر بصدق
    r = requests.get("https://www.wikipedia.org", timeout=5)
    print("--- نصر مبرمجين صاملين ---")
    print(f"الحالة: {r.status_code} - اشتغل النت يا ذيب!")
except Exception as e:
    print("عاد الجني حابسنا! النت ميت بصدق!")
