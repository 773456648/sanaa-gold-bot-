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

# دالة لتشغيل سيرفر وهمي لإرضاء Render
class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Radar is Live!")

def run_health_server():
    port = int(os.environ.get("PORT", 8080))
    server = HTTPServer(('0.0.0.0', port), HealthCheckHandler)
    server.serve_forever()

def init_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS subscriptions 
                 (chat_id TEXT, channel_id TEXT, last_video TEXT)''')
    conn.commit()
    conn.close()

def get_latest_video(channel_id):
    try:
        url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
        res = requests.get(url, timeout=10).text
        v_id = re.search(r'<yt:videoId>(.*?)</yt:videoId>', res).group(1)
        return v_id
    except: return None

@bot.message_handler(commands=['start'])
def start(message):
    bot.reply_to(message, "🤖 **أهلاً بك في رادار المشاهير!**\n\nأرسل لي آيدي (Channel ID) أي قناة يوتيوب تشتي تراقبها، وعأرسل لك الرابط أول ما ينزل الفيديو بـ 'ثواني'!")

@bot.message_handler(func=lambda m: True)
def add_channel(message):
    chat_id = str(message.chat.id)
    channel_id = message.text.strip()
    if "UC" not in channel_id:
        bot.reply_to(message, "❌ أرسل آيدي القناة الصحيح يا مسمار!")
        return
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    last_v = get_latest_video(channel_id)
    c.execute("INSERT INTO subscriptions VALUES (?, ?, ?)", (chat_id, channel_id, last_v))
    conn.commit(); conn.close()
    bot.reply_to(message, "✅ تم تفعيل الرادار لهذه القناة!")

def monitor_loop():
    while True:
        try:
            conn = sqlite3.connect('users.db')
            c = conn.cursor()
            c.execute("SELECT chat_id, channel_id, last_video FROM subscriptions")
            rows = c.fetchall()
            for chat_id, channel_id, last_v in rows:
                current_v = get_latest_video(channel_id)
                if current_v and current_v != last_v:
                    bot.send_message(chat_id, f"🚨 **عاجل: نزل فيديو جديد!**\n🔗 https://youtu.be/{current_v}")
                    c.execute("UPDATE subscriptions SET last_video = ? WHERE chat_id = ? AND channel_id = ?", (current_v, chat_id, channel_id))
            conn.commit(); conn.close()
        except: pass
        time.sleep(60)

if __name__ == "__main__":
    init_db()
    Thread(target=run_health_server).start() # تشغيل السيرفر الوهمي
    Thread(target=monitor_loop).start() # تشغيل المراقبة
    bot.polling(none_stop=True)
