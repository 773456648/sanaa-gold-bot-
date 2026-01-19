import requests, time, os
from bs4 import BeautifulSoup

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
MY_ID = "5042495708"
TARGET_URL = "https://www.google.com" # غيره لأي موقع تشتي تصيده

def send_to_telegram(message):
    try:
        url = f"https://api.telegram.org/bot{API_TOKEN}/sendMessage"
        requests.post(url, data={"chat_id": MY_ID, "text": message})
    except: pass

def code_auditor():
    files = [f for f in os.listdir('.') if f.endswith('.py')]
    report = []
    vulnerabilities = ["exec(", "eval(", "os.system("]
    for file in files:
        with open(file, 'r') as f:
            for i, line in enumerate(f):
                for bug in vulnerabilities:
                    if bug in line:
                        report.append(f"⚠️ {file} (L{i+1}): {bug}")
    return report

if __name__ == "__main__":
    send_to_telegram("🚀 بدأت المهمة يا فادي! المحلل والمصيد شغالين ذلحين.")
    # تشغيل المحلل مرة واحدة
    bugs = code_auditor()
    if bugs:
        send_to_telegram("🔍 نتائج المحلل:\n" + "\n".join(bugs))
    
    # تشغيل المصيد (مراقبة قوقل كمثال)
    last_h = ""
    while True:
        try:
            res = requests.get(TARGET_URL, timeout=10)
            if last_h and res.text != last_h:
                send_to_telegram(f"🚨 فادي! حصل تغيير في: {TARGET_URL}")
            last_h = res.text
            time.sleep(60)
        except: time.sleep(10)
