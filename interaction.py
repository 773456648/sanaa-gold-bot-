import telebot
import sqlite3
import requests
import re
import time
import os
from threading import Thread
from http.server import BaseHTTPRequestHandler, HTTPServer

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)
MY_ID = "6943805872"  # الآيدي حقك يا فادي

class WebServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers()
        self.wfile.write(b"Radar is Online!")

@bot.message_handler(commands=['start'])
def start(message):
    bot.reply_to(message, "🚀 رادار فادي جاهز وقناص للكل!")

# هنا الميزة الجديدة: يرسل لك أول ما يشتغل
def send_startup_msg():
    try:
        bot.send_message(MY_ID, "✅ أبشرك يا فادي.. السيرفر اشتغل والرادار ذلحين صاحي وقناص! 🎯")
    except: pass

if __name__ == "__main__":
    Thread(target=lambda: HTTPServer(('', int(os.environ.get("PORT", 8080))), WebServer).serve_forever(), daemon=True).start()
    send_startup_msg() # تشغيل رسالة التنبيه
    bot.remove_webhook()
    bot.polling(none_stop=True)
