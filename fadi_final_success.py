import telebot, requests, re

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

# حط الكوكيز حقك هنا (بدونهم ما عيشتغل شي)
C_USER = "100050824960231"
XS_TOKEN = "طرح_هنا_قيمة_xs" 

def get_groups():
    cookies = {'c_user': C_USER, 'xs': XS_TOKEN}
    headers = {'User-Agent': 'Mozilla/5.0 (Linux; Android 10)'}
    try:
        # الدخول لصفحة مجموعاتك مباشرة
        res = requests.get("https://mbasic.facebook.com/groups/?seemore", cookies=cookies, headers=headers).text
        groups = re.findall(r'href="/groups/(\d+)/?.*?>(.*?)</a>', res)
        
        if groups:
            report = "🎯 **يا فادي، هذي مجموعاتك سُوي:**\n\n"
            for g_id, g_name in list(set(groups))[:20]:
                if "span" not in g_name:
                    report += f"📦 **{g_name}**\n🔗 https://facebook.com/groups/{g_id}\n\n"
            return report
        return "🧐 الكوكيز غلط أو منتهية، حدثها."
    except: return "❌ مشكلة في الاتصال."

@bot.message_handler(commands=['fadi'])
def start(message):
    bot.reply_to(message, "🚀 جاري سحب المجموعات بالكوكيز...")
    bot.send_message(message.chat.id, get_groups())

bot.polling()
