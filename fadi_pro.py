import requests
from bs4 import BeautifulSoup

# هنا بنعلم السكريبت كيف "يتخفى" ويقول للموقع إنه متصفح حقيقي بصدق
url = "https://flatfy.com.eg/" # موقع عقارات بسيط عشان نصيد أي نص منه
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

try:
    r = requests.get(url, headers=headers, timeout=10)
    soup = BeautifulSoup(r.text, 'html.parser')
    # بنصيد أول نص موجود في وسم h1 بصدق
    text = soup.find('h1').text.strip()
    print("\n--- نصر مبرمجين صاملين ---")
    print(f"النص المحصود: {text}")
    print("--------------------------")
    print("النت شغال والكود قهر الحجب بصدق!")
except Exception as e:
    print(f"النت خراط أو المكتبة ناقصة: {e}")
