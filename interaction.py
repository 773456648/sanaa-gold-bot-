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

def get_uc_from_url(url):
    try:
        response = requests.get(url, timeout=10).text
        # البحث عن كود UC داخل صفحة القناة
        match = re.search(r'browse_id":"(UC[a-zA-Z0-9_-]{22})"', response)
        if match:
            return match.group(1)
        return None
    except:
        return None

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
    bot.reply_to(message, "🤖 **رادار المشاهير جاهز!**\n\nأرسل لي رابط أي قناة يوتيوب (أو الـ ID) وعأراقبها لك طوالي.")

@bot.message_handler(func=lambda m: True)
def add_channel(message):
    input_text = message.text.strip()
    channel_id = None

    if input_text.startswith("UC") and len(input_text) > 20:
        channel_id = input_text
    elif "youtube.com" in input_text or "youtu.be" in input_text:
        bot.reply_to(message, "⏳ جاري استخراج معرف القناة..")
        channel_id = get_uc_from_url(input_text)
    
    if not channel_id:
        bot.reply_to(message, "❌ لم أستطع التعرف على القناة. تأكد من إرسال رابط القناة الصحيح!")
        return

    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    last_v = get_latest_video(channel_id)
    c.execute("INSERT INTO subscriptions VALUES (?, ?, ?)", (str(message.chat.id), channel_id, last_v))
    conn.commit(); conn.close()
    bot.reply_to(message, f"✅ تم تفعيل الرادار!\n🆔 ID: `{channel_id}`")

# كود السيرفر والمراقبة يبقى كما هو...
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

class S(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"Live")

if __name__ == "__main__":
    init_db()
    Thread(target=lambda: HTTPServer(('0.0.0.0', int(os.environ.get("PORT", 8080))), S).serve_forever()).start()
    Thread(target=monitor_loop).start()
    bot.polling(none_stop=True)
