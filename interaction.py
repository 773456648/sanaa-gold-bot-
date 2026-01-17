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

# دالة الاستقبال عشان موقع cron-job ما يطلع خطأ 404
class S(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b"Radar is Online!")

def run_server():
    port = int(os.environ.get("PORT", 8080))
    server_address = ('', port)
    httpd = HTTPServer(server_address, S)
    print(f"Starting server on port {port}...")
    httpd.serve_forever()

@bot.message_handler(commands=['start'])
def start(message):
    bot.reply_to(message, "🚀 رادار المشاهير جاهز وقناص!")

# بقية كود المراقبة (monitor) والعمليات...
# تأكد إنك حاطط كود الـ monitor هنا

if __name__ == "__main__":
    # تشغيل السيرفر في خيط منفصل عشان يجاوب على cron-job
    Thread(target=run_server).start()
    bot.remove_webhook()
    bot.polling(none_stop=True)
