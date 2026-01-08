import requests
from bs4 import BeautifulSoup

url = "https://developers.coindesk.com/"
headers = {'User-Agent': 'Mozilla/5.0'}

try:
    r = requests.get(url, headers=headers, timeout=15)
    soup = BeautifulSoup(r.text, 'html.parser')
    title = soup.find('h1')
    if title:
        print("\n--- صيد مبرمج محترف بصدق ---")
        print(f"العنوان: {title.text.strip()}")
        print("----------------------------")
    else:
        print("الموقع فتح بس ما بش عناوين!")
except Exception as e:
    print(f"عصلجت! السبب: {e}")
