import requests

token = "7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks"
chat_id = "5042495708"

# الكوكيز الجديدة المحدثة
fb_cookies = "sb=iWplaTgxXWaKpJpcZOMr2nJZ; datr=iGplaV28PgweKRFA2B3ALpcC; c_user=100003550913323; xs=31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1; fr=0ZAmSGvgnip1quTXs.AWeV0Tp6gnMW6w_r2S2s1VtnAjDmiOd7TobRSbffHhccgP1GlrU.BpZWqJ..AAA.0.0.Bpas1t.AWdLyjZQSZk73I9__BMN-noje7Q; locale=ar_AR"

headers = {
    'authority': 'mbasic.facebook.com',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'cookie': fb_cookies,
}

def check_fb():
    print("⏳ جاري محاولة اختراق الواجهة...")
    try:
        # الدخول لصفحة البروفايل للتأكيد
        response = requests.get("https://mbasic.facebook.com/profile.php", headers=headers)
        
        if "Logout" in response.text or "تسجيل الخروج" in response.text or "100003550913323" in response.text:
            try:
                name = response.text.split('<title>')[1].split('</title>')[0]
            except:
                name = "حساب فادي"
            
            msg = f"💙 فيسبوك شغال ونار يا فادي!\n👤 الحساب: {name}\n✅ الكوكيز ذلحين مسمار!"
            print(f"✅ سبرت! الحساب هو: {name}")
            requests.get(f"https://api.telegram.org/bot{token}/sendMessage", params={"chat_id": chat_id, "text": msg})
        else:
            print("❌ لسه فيسبوك بيقول الكوكيز غلط. جرب تفتح mbasic.facebook.com في Kiwi وتحدث الصفحة.")
    except Exception as e:
        print(f"🚫 خطأ تقني: {e}")

if __name__ == "__main__":
    check_fb()
