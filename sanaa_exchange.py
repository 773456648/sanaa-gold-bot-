import requests

# بنستخدم سيرفر بيحدث أسعار العملات في المنطقة بصدق
url = "https://api.exchangerate-api.com/v4/latest/USD"

try:
    r = requests.get(url, timeout=15)
    data = r.json()
    
    # السعر العالمي لليمني (رسمي)
    yer_rate = data['rates']['YER']
    # السعر السعودي العالمي
    sar_rate = data['rates']['SAR']
    
    # حسبة بسيطة عشان نعرف كم "السعودي مقابل اليمني" عالمياً بصدق
    sanaani_sar = round(yer_rate / sar_rate, 2)

    print("\n--- بوت مراقبة الصرف (نسخة فادي) ---")
    print(f"السعر العالمي للدولار: {yer_rate} ريال يمني")
    print(f"السعر العالمي للسعودي: {sanaani_sar} ريال يمني")
    print("---------------------------------------")
    print("ملاحظة: هذا السعر العالمي، بكره نربطه بسعر 'الكاش' في صنعاء صميل!")
except Exception as e:
    print(f"السوق معلق أو النت بيخراط! السبب: {e}")
