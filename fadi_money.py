import requests

# هذا الرابط بيعطي أسعار الصرف الحقيقية للزلط
url = "https://api.exchangerate-api.com/v4/latest/USD"

try:
    r = requests.get(url, timeout=10)
    data = r.json()
    price = data['rates']['SAR'] # بنشوف كم الريال السعودي مقابل الدولار
    print(f"\n--- سكريبت الصراف فادي ---")
    print(f"1 دولار = {price} ريال سعودي")
    print("--------------------------")
    print("هذا هو الكود اللي يتباع لشركات الصرافة يا ذيب!")
except:
    print("السيرفر حق الزلط معلق!")
