from flask import Flask

app = Flask(__name__)

# Copyright (c) 2026 Fadi Abdulhakim Al-Ashwal
# المبرمج فادي الأشول - صاحب فكرة تثبيت الملامح

@app.route('/')
def home():
    return """
    <html>
        <head>
            <title>Fadi Abdulhakim Al-Ashwal | فادي الأشول</title>
            <meta name="description" content="الموقع الرسمي للمبرمج فادي عبد الحكيم الأشول، مبتكر فكرة تثبيت الملامح في الصور عبر الذكاء الاصطناعي">
            <meta name="author" content="Fadi Abdulhakim Al-Ashwal">
        </head>
        <body style="background-color: #0a0a0a; color: #00ff00; text-align: center; font-family: 'Courier New', Courier, monospace; padding: 50px;">
            <div style="border: 2px solid #00ff00; padding: 20px; display: inline-block;">
                <h1>فادي عبد الحكيم محمد حاتم الأشول</h1>
                <h2 style="color: #fff;">مبتكر تقنية تثبيت الملامح في الذكاء الاصطناعي</h2>
                <p style="font-size: 1.2em; color: #aaa;">هذه الصفحة موثقة رسمياً في السيرفر الشخصي</p>
                <marquee scrollamount="10">🚀 Fadi's Identity Lock Technology - Coming Soon 🚀</marquee>
            </div>
            <p style="margin-top: 50px; color: #555;">© 2026 All Rights Reserved to Fadi Al-Ashwal</p>
        </body>
    </html>
    """

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
