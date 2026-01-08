import requests
from bs4 import BeautifulSoup

url = "https://www.google.com/search?q=Yemen+Weather"
headers = {'User-Agent': 'Mozilla/5.0'}

try:
    r = requests.get(url, headers=headers, timeout=10)
    soup = BeautifulSoup(r.text, 'html.parser')
    # بيسحب أي نص من الصفحة عشان نثبت إنه دخل
    print("\n--- نصر مبرمجين صاملين ---")
    print("قدرنا ندخل جوجل ونسحب بيانات!")
    print(f"الحالة: {r.status_code}")
    print("--------------------------")
except Exception as e:
    print(f"النت ميت صميل يا فادي! والسبب: {e}")
