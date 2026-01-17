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

# هذه القطعة هي اللي عتحل مشكلة الـ 404
class WebServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b"Radar is Online and Awake!")

def run_web_server():
    port = int(os.environ.get("PORT", 8080))
    httpd = HTTPServer(('', port), WebServer)
    httpd.serve_forever()

@bot.message_handler(commands=['start'])
def start(message):
    bot.reply_to(message, "🚀 رادار فادي شغال وقناص للكل!")

# هنا كود المراقبة (monitor) حقك...
# ... (تأكد إنه موجود في ملفك الأصلي)

if __name__ == "__main__":
    # تشغيل صفحة الاستقبال في الخلفية
    Thread(target=run_web_server, daemon=True).start()
    bot.remove_webhook()
    bot.polling(none_stop=True)
