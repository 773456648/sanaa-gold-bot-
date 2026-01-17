import cloudscraper
import requests
import re

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# الكوكيز الجديدة اللي أديتها لي يا فادي
fb_cookies = "ps_l=1; datr=iGplaV28PgweKRFA2B3ALpcC; fr=0ZAmSGvgnip1quTXs.AWce2dqg1ECDs6EJph5VK7Arna1bGbVfYsQRq0CpV9ymc76uqJE.BpZWqJ..AAA.0.0.BpatIx.AWeK-HlIWO3Cl6MNFk_HUmRCDUA; vpd=v1%3B569x320x2.2222222222222223; xs=31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1; fbl_st=101029381%3BT%3A29476805; locale=ar_AR; c_user=100003550913323; dpr=2.2222222222222223; pas=100003550913323%3AqzEezjBMP9; ps_n=1; sb=iWplaTgxXWaKpJpcZOMr2nJZ; wd=980x1722; wl_cbv=v2%3Bclient_version%3A3055%3Btimestamp%3A1768608305"

def check_fb():
    print("🚀 جاري فحص الحساب بالكوكيز الجديدة...")
    scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'android', 'desktop': False})
    
    # تحويل النص إلى قاموس كوكيز
    cookies_dict = {c.split('=')[0]: c.split('=')[1] for c in fb_cookies.split('; ')}
    
    try:
        # محاولة الدخول لصفحة mbasic
        res = scraper.get("https://mbasic.facebook.com/profile.php", cookies=cookies_dict)
        
        if "Logout" in res.text or "تسجيل الخروج" in res.text:
            try:
                name = re.search(r'<title>(.*?)</title>', res.text).group(1).replace(" | Facebook", "")
            except:
                name = "فادي الونيس"
            
            print(f"✅ سبرت المهرة! الاسم: {name}")
            msg = f"💙 فيسبوك شغال مسمار ذلحين!\n👤 الحساب: {name}\n🆔 الآيدي: 100003550913323"
            requests.get(f"https://api.telegram.org/bot{token}/sendMessage", params={"chat_id": chat_id, "text": msg})
        else:
            print("❌ لسه فيسبوك "مبهرر". تأكد إنك سحبت الكوكيز من Kiwi وهو فاتح الحساب تمام.")
            
    except Exception as e:
        print(f"🚫 خطأ: {e}")

if __name__ == "__main__":
    check_fb()
