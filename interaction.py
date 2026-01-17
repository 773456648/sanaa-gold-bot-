import telebot
import sqlite3
import requests
import re
import time
from threading import Thread

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

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
    welcome_text = (
        "🔥 **أهلاً بك في رادار المشاهير الأسرع!**\n\n"
        "تشتي تكون أول واحد يعلق عند مشهورك المفضل؟\n"
        "أرسل لي ذلحين (Channel ID) حق أي قناة يوتيوب تشتيها..\n"
        "وعأرسل لك الرابط أول ما ينزل الفيديو بـ 'ثواني'! ⚡\n\n"
        "📌 مثال لآيدي قناة أبو فلة:\n `UCqq5n-Oe-r1EEHI3yvhVJcA`"
    )
    bot.reply_to(message, welcome_text, parse_mode='Markdown')

@bot.message_handler(func=lambda m: True)
def add_channel(message):
    chat_id = str(message.chat.id)
    channel_id = message.text.strip()
    
    if "UC" not in channel_id or len(channel_id) < 20:
        bot.reply_to(message, "❌ يا مسمار، أرسل آيدي القناة الصح (الذي يبدأ بـ UC)!")
        return

    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    last_v = get_latest_video(channel_id)
    c.execute("INSERT INTO subscriptions VALUES (?, ?, ?)", (chat_id, channel_id, last_v))
    conn.commit()
    conn.close()
    bot.reply_to(message, "✅ تـم تفعيل الرادار! ذلحين ارقد وآمن، أول ما ينشر عيرن تلفونك! 🚀")

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
                    bot.send_message(chat_id, f"🚨 **عاجل: نزل فيديو جديد ذلحين!**\n\nاشخط تعليقك سريع قبل الكل! 👇\n🔗 https://youtu.be/{current_v}", parse_mode='Markdown')
                    c.execute("UPDATE subscriptions SET last_video = ? WHERE chat_id = ? AND channel_id = ?", (current_v, chat_id, channel_id))
            conn.commit()
            conn.close()
        except: pass
        time.sleep(60)

if __name__ == "__main__":
    init_db()
    Thread(target=monitor_loop).start()
    bot.polling()
