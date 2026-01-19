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

def get_channel_id(input_text):
    if "UC" in input_text and len(input_text) > 20 and "/" not in input_text:
        return input_text
    try:
        url = input_text if "http" in input_text else f"https://www.youtube.com/{input_text}"
        res = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=15).text
        match = re.search(r'browse_id":"(UC[a-zA-Z0-9_-]{22})"', res)
        if not match: match = re.search(r'channel/(UC[a-zA-Z0-9_-]{22})"', res)
        return match.group(1) if match else None
    except: return None

@bot.message_handler(commands=['start'])
def start(message):
    welcome = "🚀 **رادار المشاهير - نسخة الشورتس والفيديوهات!**\n\nأرسل رابط القناة وعأجيب لك كل جديد ينزل (طويل أو قصير) في ثواني! 🔥"
    bot.reply_to(message, welcome, parse_mode='Markdown')

@bot.message_handler(func=lambda m: True)
def add_sub(message):
    uid = get_channel_id(message.text.strip())
    if uid:
        conn = sqlite3.connect('users.db'); c = conn.cursor()
        c.execute("INSERT OR REPLACE INTO subs VALUES (?, ?, ?)", (str(message.chat.id), uid, ""))
        conn.commit(); conn.close()
        bot.reply_to(message, f"✅ تم تفعيل الرادار!\n🆔 ID: `{uid}`\n\nذلحين عأقنص لك حتى الـ Shorts! 🎥")
    else:
        bot.reply_to(message, "❌ ما عرفت القناة! أرسل رابطها الرسمي.")

def monitor():
    while True:
        try:
            conn = sqlite3.connect('users.db'); c = conn.cursor()
            c.execute("SELECT * FROM subs"); rows = c.fetchall()
            for chat_id, cid, last_v in rows:
                # فحص الفيديوهات العادية
                feed = requests.get(f"https://www.youtube.com/feeds/videos.xml?channel_id={cid}").text
                v_ids = re.findall(r'<yt:videoId>(.*?)</yt:videoId>', feed)
                if v_ids:
                    current_v = v_ids[0]
                    if current_v != last_v:
                        msg = f"🚨 **فيديو جديد نزل!**\n🔗 https://youtu.be/{current_v}"
                        if "shorts" in requests.get(f"https://www.youtube.com/shorts/{current_v}").url:
                            msg = f"📱 **شورت جديد نزل!**\n🔗 https://youtube.com/shorts/{current_v}"
                        
                        bot.send_message(chat_id, msg)
                        c.execute("UPDATE subs SET last_v=? WHERE chat_id=? AND channel_id=?", (current_v, chat_id, cid))
            conn.commit(); conn.close()
        except: pass
        time.sleep(60)

class S(BaseHTTPRequestHandler):
    def do_GET(self): self.send_response(200); self.end_headers(); self.wfile.write(b"Radar Online")

if __name__ == "__main__":
    sqlite3.connect('users.db').cursor().execute('CREATE TABLE IF NOT EXISTS subs (chat_id TEXT, channel_id TEXT, last_v TEXT)')
    Thread(target=lambda: HTTPServer(('0.0.0.0', int(os.environ.get("PORT", 8080))), S).serve_forever()).start()
    Thread(target=monitor).start()
    bot.remove_webhook()
    bot.polling(none_stop=True)
