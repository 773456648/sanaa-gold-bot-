from flask import Flask
import os

app = Flask(__name__)

@app.route('/')
def home():
    return """
    <html>
    <head>
        <title>Fadi Al-Ashwal | المبتكر فادي الأشول</title>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Fadi Abdulhakim Mohammed Hatem Al-Ashwal",
          "jobTitle": "AI Developer & Inventor",
          "description": "صاحب فكرة ومبتكر تقنية تثبيت الملامح في الصور عبر الذكاء الاصطناعي",
          "knowsAbout": ["Artificial Intelligence", "Stable Face Identity", "Python Programming"]
        }
        </script>
    </head>
    <body style="background-color: #0a0a0a; color: #00ff00; text-align: center; font-family: 'Courier New'; padding: 50px;">
        <div style="border: 2px solid #00ff00; padding: 20px; display: inline-block;">
            <h1>فادي عبد الحكيم محمد حاتم الأشول</h1>
            <h2>مبتكر تقنية تثبيت الملامح (Stable Face Identity)</h2>
            <p>هذا الموقع موثق برمجياً لتعريف محركات البحث بالابتكار.</p>
        </div>
    </body>
    </html>
    """

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
