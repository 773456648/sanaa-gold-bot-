import requests

# البصمة الجديدة يا فادي
cookies = {
    'c_user': '100003550913323',
    'xs': '31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1',
    'fr': '0ZAmSGvgnip1quTXs.AWfzSueuMXxd_mA9dRQT6pHPV6ekP7rFswmgramcUIJj5LwKP_0.BpZWqJ..AAA.0.0.BpaXdf.AWdM-MLHWfD20iUiQgY1mror1sU',
    'datr': 'iGplaV28PgweKRFA2B3ALpcC',
    'sb': 'iWplaTgxXWaKpJpcZOMr2nJZ'
}

def check_fb():
    # محاولة دخول صفحة الإعدادات للتأكد
    url = "https://mbasic.facebook.com/settings"
    r = requests.get(url, cookies=cookies)
    if "100003550913323" in r.text or "logout" in r.text.lower():
        print("\n✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅")
        print("تم الدخول بنجاح يا مبرمج فادي!")
        print("الحساب شغال ذلحين والبوت جاهز للمراقبة.")
        print("✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅\n")
    else:
        print("\n❌ لسه في مشكلة، فيسبوك رفض البصمة.")

check_fb()
