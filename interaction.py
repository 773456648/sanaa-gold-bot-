import telebot, sqlite3, requests, re, time, os
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)
MY_ID = "6943805872"

class S(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers()
        self.wfile.write(b"OK")

@bot.message_handler(commands=['start'])
def start(message):
    bot.reply_to(message, "🚀 الرادار جاهز! أرسل رابط القناة بس.")

@bot.message_handler(func=lambda m: "youtube.com" in m.text or "youtu.be" in m.text)
def add_sub(message):
    bot.reply_to(message, "✅ تم! ذلحين أي فيديو أو شورت ينزل عيوصلك طوالي.")

if __name__ == "__main__":
    Thread(target=lambda: HTTPServer(('', int(os.environ.get("PORT", 8080))), S).serve_forever(), daemon=True).start()
    try: bot.send_message(MY_ID, "⚠️ السيرفر صحي وذلحين أنا أراقب!")
    except: pass
    bot.polling(none_stop=True)
