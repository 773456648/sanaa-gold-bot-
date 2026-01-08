import requests
# بنجرب جوجل مباشرة عشان نقطع الشك باليقين بصدق
url = "https://www.google.com"
try:
    r = requests.get(url, timeout=10)
    print("\n--- نصر المبرمجين الصاملين ---")
    print(f"الحالة: {r.status_code} - النت شغال طيارة!")
    print("-----------------------------------")
    print("ذلحين تقدر تنام وأنت ملك بصدق!")
except Exception as e:
    print(f"النت محبوس صميل! والسبب: {e}")
