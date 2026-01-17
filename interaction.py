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

def get_channel_id_pro(input_text):
    try:
        if "UC" in input_text and len(input_text) > 20 and "/" not in input_text:
            return input_text
        
        url = input_text if "http" in input_text else f"https://www.youtube.com/{input_text}"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        res = requests.get(url, headers=headers, timeout=15).text
        
        # محاولة البحث بـ 3 طرق مختلفة
        patterns = [
            r'browse_id":"(UC[a-zA-Z0-9_-]{22})"',
            r'channel/(UC[a-zA-Z0-9_-]{22})"',
            r'canonical" href="https://www.youtube.com/channel/(UC[a-zA-Z0-9_-]{22})"'
        ]
        
        for p in patterns:
            match = re.search(p, res)
            if match: return match.group(1)
        return None
    except: return None

def init_db():
    conn = sqlite3.connect('users.db'); c = conn.cursor()
    c.execute('CREATE TABLE IF NOT EXISTS subs (chat_id TEXT, channel_id TEXT, last_v TEXT)')
    conn.commit(); conn.close()

@bot.message_handler(commands=['start'])
def start(message):
    bot.reply_to(message, "🚀 **رادار المشاهير جاهز!**\n\nأرسل رابط القناة أو اليوزر (مثلاً @AboFlah) وعأجيب لك كل جديد!")

@bot.message_handler(func=lambda m: True)
def add_sub(message):
    bot.send_message(message.chat.id, "⏳ جاري استخراج معرف القناة..")
    uid = get_channel_id_pro(message.text.strip())
    if uid:
        conn = sqlite3.connect('users.db'); c = conn.cursor()
        c.execute("INSERT INTO subs VALUES (?, ?, ?)", (str(message.chat.id), uid, ""))
        conn.commit(); conn.close()
        bot.reply_to(message, f"✅ تم تفعيل الرادار بنجاح!\n🆔 ID: `{uid}`")
    else:
        bot.reply_to(message, "❌ لسه يوتيوب معقد المهرة! جرب تنسخ رابط القناة 'الرسمي' من صفحة (لمحة/About).")

def monitor():
    while True:
        try:
            conn = sqlite3.connect('users.db'); c = conn.cursor()
            c.execute("SELECT * FROM subs"); rows = c.fetchall()
            for chat_id, cid, last_v in rows:
                feed = requests.get(f"https://www.youtube.com/feeds/videos.xml?channel_id={cid}").text
                v_id = re.search(r'<yt:videoId>(.*?)</yt:videoId>', feed).group(1)
                if v_id != last_v:
                    bot.send_message(chat_id, f"🚨 **عاجل: نزل فيديو جديد!**\n🔗 https://youtu.be/{v_id}")
                    c.execute("UPDATE subs SET last_v=? WHERE chat_id=? AND channel_id=?", (v_id, chat_id, cid))
            conn.commit(); conn.close()
        except: pass
        time.sleep(60)

class S(BaseHTTPRequestHandler):
    def do_GET(self): self.send_response(200); self.end_headers(); self.wfile.write(b"Radar Active")

if __name__ == "__main__":
    init_db()
    Thread(target=lambda: HTTPServer(('0.0.0.0', int(os.environ.get("PORT", 8080))), S).serve_forever()).start()
    Thread(target=monitor).start()
    bot.polling(none_stop=True)
