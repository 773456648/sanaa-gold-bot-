import requests
import time
import re

cookies = {
    'c_user': '100003550913323',
    'xs': '31%3AyHNizqiAxU5oow%3A2%3A1768254323%3A-1%3A-1',
    'fr': '0ZAmSGvgnip1quTXs.AWfzSueuMXxd_mA9dRQT6pHPV6ekP7rFswmgramcUIJj5LwKP_0.BpZWqJ..AAA.0.0.BpaXdf.AWdM-MLHWfD20iUiQgY1mror1sU',
    'datr': 'iGplaV28PgweKRFA2B3ALpcC',
    'sb': 'iWplaTgxXWaKpJpcZOMr2nJZ'
}

def start():
    print("🚀 بدأت المهرة.. حسابك ذلحين يدعس لايكات")
    while True:
        try:
            r = requests.get("https://mbasic.facebook.com/", cookies=cookies)
            likes = re.findall(r'/a/like.php\?.*?"', r.text)
            if likes:
                for u in likes[:3]:
                    link = "https://mbasic.facebook.com" + u.replace('"', '').replace('&amp;', '&')
                    requests.get(link, cookies=cookies)
                    print("👍 تم عمل لايك جديد")
                    time.sleep(10)
            print("💤 منتظر شوية ويرجع يدعس")
            time.sleep(300)
        except:
            time.sleep(60)

start()
