import cloudscraper
import requests
import time

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# الكوكيز الجديدة اللي أديتها لي
fb_cookies = {
    'sb': 'iWplaTgxXWaKpJpcZOMr2nJZ',
    'datr': 'iGplaV28PgweKRFA2B3ALpcC',
    'c_user': '100003550913323',
    'xs': '31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1',
    'fr': '0ZAmSGvgnip1quTXs.AWfw6uk4qDzCGUgea1BNvM1DCSzgRUHTEpWlcLo58iBFHgXciew.BpZWqJ..AAA.0.0.BpatE5.AWcjcdKnazYzQbCYdrm_tr12cos',
    'locale': 'ar_AR'
}

def hunt():
    print("🕵️ جاري محاولة الدخول بآيبي التيرمكس...")
    scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'android', 'desktop': False})
    
    try:
        # الدخول لصفحة mbasic لتفادي الحظر
        res = scraper.get("https://mbasic.facebook.com/profile.php", cookies=fb_cookies)
        
        if "Logout" in res.text or "تسجيل الخروج" in res.text or "100003550913323" in res.text:
            try:
                name = res.text.split('<title>')[1].split('</title>')[0]
            except:
                name = "فادي"
            
            print(f"✅ سبرت المهرة! الاسم: {name}")
            requests.get(f"https://api.telegram.org/bot{token}/sendMessage", 
                         params={"chat_id": chat_id, "text": f"💙 فادي.. فيسبوك شغال من التيرمكس!\n👤 الحساب: {name}"})
        else:
            print("❌ لسه فيسبوك رافض. جرب تقفل المتصفح وتفتحه وتنسخ من جديد.")
            
    except Exception as e:
        print(f"🚫 خطأ: {e}")

if __name__ == "__main__":
    hunt()
