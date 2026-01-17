import cloudscraper
import requests
import re

# معلومات البوت حقك
token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# الكوكيز المسمار
fb_cookies = {
    'sb': 'iWplaTgxXWaKpJpcZOMr2nJZ',
    'datr': 'iGplaV28PgweKRFA2B3ALpcC',
    'c_user': '100003550913323',
    'xs': '31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1',
    'fr': '0ZAmSGvgnip1quTXs.AWce2dqg1ECDs6EJph5VK7Arna1bGbVfYsQRq0CpV9ymc76uqJE.BpZWqJ..AAA.0.0.BpatIx.AWeK-HlIWO3Cl6MNFk_HUmRCDUA',
    'locale': 'ar_AR'
}

def send_tele(msg):
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        r = requests.get(url, params={"chat_id": chat_id, "text": msg})
        if r.status_code == 200:
            print("✅ وصلت الرسالة للتليجرام!")
        else:
            print(f"❌ التليجرام رفض! الخطأ: {r.text}")
    except Exception as e:
        print(f"🚫 فشل الاتصال بالتليجرام: {e}")

def get_name():
    print("⏳ جاري سحب الاسم ومحاكاة الدخول...")
    scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'android', 'desktop': False})
    
    try:
        res = scraper.get("https://mbasic.facebook.com/profile.php", cookies=fb_cookies)
        
        if "Logout" in res.text or "تسجيل الخروج" in res.text:
            try:
                name = re.search(r'<title>(.*?)</title>', res.text).group(1).split('|')[0].strip()
            except:
                name = "فادي"
            
            output = f"👤 اسم الحساب: {name}\n🆔 الآيدي: 100003550913323\n🚀 الموتور شغال!"
            print(f"✅ سبرت! {output}")
            send_tele(output) # هانا الفعل القوي!
        else:
            print("❌ الكوكيز ما سبرت، فيسبوك طلب تسجيل دخول.")
            send_tele("⚠️ يا فادي الكوكيز طفيت، حدثها!")
            
    except Exception as e:
        print(f"🚫 خطأ: {e}")

if __name__ == "__main__":
    get_name()
