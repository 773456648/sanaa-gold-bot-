import telebot, requests, re

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

print("🚀 سارة شغلت الرادار الخارجي.. هات الرابط يا فادي!")

def find_groups_alternative(query):
    try:
        # البحث في أرشيف المجموعات العام بدل روابط فيسبوك المعطلة
        search_url = f"https://www.google.com/search?q=site:facebook.com/groups '{query}'"
        headers = {'User-Agent': 'Mozilla/5.0'}
        res = requests.get(search_url, headers=headers).text
        
        links = re.findall(r'facebook\.com/groups/(\d+)', res)
        if links:
            return "\n".join([f"🔗 https://facebook.com/groups/{l}" for l in set(links[:10])])
        return "🧐 ما لقيت نشاط علني في المجموعات لهذا الشخص."
    except:
        return "❌ محرك البحث مضغوط ذلحين."

@bot.message_handler(func=lambda m: True)
def handle_msg(message):
    bot.reply_to(message, "🔦 جاري النبش في أرشيف المجموعات والنشاطات...")
    # استخراج الاسم من الرابط
    name = message.text.split('/')[-1].replace('.', ' ')
    result = find_groups_alternative(name)
    bot.send_message(message.chat.id, f"🎯 نتائج فادي:\n\n{result}")

bot.polling()
