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

# دالة ذكية لاستخراج الـ UC من أي رابط أو يوزر
def get_uc_id(input_text):
    try:
        if input_text.startswith("UC") and len(input_text) > 20:
            return input_text
        url = input_text
        if "@" in input_text and "youtube.com" not in input_text:
            url = f"https://www.youtube.com/{input_text.replace('@', '@')}"
        elif "youtube.com" not in input_text:
            url = f"https://www.youtube.com/@{input_text}"
            
        res = requests.get(url, timeout=15).text
        match = re.search(r'browse_id":"(UC[a-zA-Z0-9_-]{22})"', res)
        return match.group(1) if match else None
    except: return None

def init_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('CREATE TABLE IF NOT EXISTS subs (chat_id TEXT, channel_id TEXT, last_v TEXT)')
    conn.commit(); conn.close()

@bot.message_handler(commands=['start'])
def start(message):
    bot.reply_to(message, "🚀 **رادار المشاهير جاهز!**\n\nأرسل رابط القناة أو اليوزر (مثلاً @AboFlah) وعأجيب لك كل جديد!")

@bot.message_handler(func=lambda m: True)
def add_sub(message):
    bot.send_chat_action(message.chat.id, 'find_location')
    uid = get_uc_id(message.text.strip())
    if not uid:
        bot.reply_to(message, "❌ ما قدرت أعرف القناة، تأكد من الرابط!")
        return
    conn = sqlite3.connect('users.db'); c = conn.cursor()
    c.execute("INSERT INTO subs VALUES (?, ?, ?)", (str(message.chat.id), uid, ""))
    conn.commit(); conn.close()
    bot.reply_to(message, f"✅ تم تفعيل الرادار!\n🆔 ID: `{uid}`")

def monitor():
    while True:
        try:
            conn = sqlite3.connect('users.db'); c = conn.cursor()
            c.execute("SELECT * FROM subs"); rows = c.fetchall()
            for chat_id, cid, last_v in rows:
                feed = requests.get(f"https://www.youtube.com/feeds/videos.xml?channel_id={cid}").text
                v_id = re.search(r'<yt:videoId>(.*?)</yt:videoId>', feed).group(1)
                if v_id != last_v:
                    bot.send_message(chat_id, f"🚨 **نزل فيديو جديد!**\n🔗 https://youtu.be/{v_id}")
                    c.execute("UPDATE subs SET last_v=? WHERE chat_id=? AND channel_id=?", (v_id, chat_id, cid))
            conn.commit(); conn.close()
        except: pass
        time.sleep(60)

# سيرفر وهمي عشان Render ما يطفي البوت
class S(BaseHTTPRequestHandler):
    def do_GET(self): self.send_response(200); self.end_headers(); self.wfile.write(b"Radar Active")

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 8080))
    Thread(target=lambda: HTTPServer(('0.0.0.0', port), S).serve_forever()).start()
    Thread(target=monitor).start()
    bot.polling(none_stop=True)
