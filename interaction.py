import telebot
import sqlite3
import requests
import re
import time
from threading import Thread

# توكن البوت حقك
API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

# إنشاء قاعدة بيانات للمشتركين
def init_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS subscriptions 
                 (chat_id TEXT, channel_id TEXT, last_video TEXT)''')
    conn.commit()
    conn.close()

# دالة لجلب آخر فيديو
def get_latest_video(channel_id):
    try:
        url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
        res = requests.get(url, timeout=10).text
        v_id = re.search(r'<yt:videoId>(.*?)</yt:videoId>', res).group(1)
        return v_id
    except: return None

@bot.message_handler(commands=['start'])
def start(message):
    bot.reply_to(message, "👋 أهلاً بك في بوت الرادار التجاري!\n\nأرسل آيدي قناة اليوتيوب التي تريد مراقبتها.\nمثال لآيدي أبو فلة: `UCqq5n-Oe-r1EEHI3yvhVJcA`")

@bot.message_handler(func=lambda m: True)
def add_channel(message):
    chat_id = str(message.chat.id)
    channel_id = message.text.strip()
    
    if len(channel_id) < 10:
        bot.reply_to(message, "❌ تأكد من الآيدي الصحيح!")
        return

    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    last_v = get_latest_video(channel_id)
    c.execute("INSERT INTO subscriptions VALUES (?, ?, ?)", (chat_id, channel_id, last_v))
    conn.commit()
    conn.close()
    bot.reply_to(message, "✅ تم تفعيل الرادار لهذه القناة! سأخبرك فور نزول أي فيديو.")

def monitor_loop():
    while True:
        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        c.execute("SELECT chat_id, channel_id, last_video FROM subscriptions")
        rows = c.fetchall()
        
        for chat_id, channel_id, last_v in rows:
            current_v = get_latest_video(channel_id)
            if current_v and current_v != last_v:
                bot.send_message(chat_id, f"🚨 عاجل! نزل فيديو جديد:\n🔗 https://youtu.be/{current_v}")
                c.execute("UPDATE subscriptions SET last_video = ? WHERE chat_id = ? AND channel_id = ?", (current_v, chat_id, channel_id))
        
        conn.commit()
        conn.close()
        time.sleep(120) # يفحص كل دقيقتين

if __name__ == "__main__":
    init_db()
    Thread(target=monitor_loop).start()
    bot.polling()
