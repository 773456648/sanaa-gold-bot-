import requests

cookies = {
    'c_user': '100003550913323',
    'xs': '31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1',
    'fr': '0ZAmSGvgnip1quTXs.AWfzSueuMXxd_mA9dRQT6pHPV6ekP7rFswmgramcUIJj5LwKP_0.BpZWqJ..AAA.0.0.BpaXdf.AWdM-MLHWfD20iUiQgY1mror1sU',
    'datr': 'iGplaV28PgweKRFA2B3ALpcC',
    'sb': 'iWplaTgxXWaKpJpcZOMr2nJZ'
}

def activate_account():
    # هذا الرابط يخلي فيسبوك يسجل إن الحساب نشط من السيرفر
    url = "https://mbasic.facebook.com/profile.php"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    }
    r = requests.get(url, cookies=cookies, headers=headers)
    
    if "100003550913323" in r.text:
        print("\n🔥 حسابك ذلحين 'مفعل' في السيرفر يا فادي!")
        print("🚀 السيرفر ذلحين يتكلم باسمك طبيعي.")
    else:
        print("\n❌ السيرفر لسه مش قادر يلقف الحساب.")

activate_account()
