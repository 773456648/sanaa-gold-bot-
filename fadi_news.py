import requests
from bs4 import BeautifulSoup # لو مش عندك علمك كيف تنزلها في ثانية

url = "https://www.bbc.com/arabic"
try:
    r = requests.get(url, timeout=10)
    soup = BeautifulSoup(r.text, 'html.parser')
    # صيد أول عنوان خبر كبير في الصفحة بصدق
    title = soup.find('h2').text.strip()
    print("\n--- صيد مبرمجين محترفين ---")
    print(f"آخر خبر ذلحين: {title}")
    print("----------------------------")
    print("النت شاعل والمهرة تمام يا فادي!")
except Exception as e:
    print(f"وقع تعليق بسيط: {e}")
    print("جرب تنزل المكتبة: pip install beautifulsoup4")
