import telebot, re, mechanize

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

# بياناتك يا مسمار (اليوزر فوق والباسورد تحت)
FB_USER = "100050824960231"
FB_PASS = "god12god1"

def get_my_own_groups():
    try:
        br = mechanize.Browser()
        br.set_handle_robots(False)
        br.addheaders = [('User-agent', 'Mozilla/5.0 (Android 11; Mobile; rv:90.0)')]
        
        # 1. تسجيل الدخول المباشر
        br.open("https://mbasic.facebook.com")
        br.select_form(nr=0)
        br["email"] = FB_USER
        br["pass"] = FB_PASS
        br.submit()
        
        # 2. الدخول لصفحة المجموعات الخاصة بك طوالي
        res = br.open("https://mbasic.facebook.com/groups/?seemore").read().decode('utf-8')
        
        # 3. نبش أسماء وروابط المجموعات
        groups = re.findall(r'href="/groups/(\d+)/?.*?>(.*?)</a>', res)
        
        if groups:
            report = "🎯 **تم اقتحام حسابك ونبش المجموعات:**\n\n"
            for g_id, g_name in list(set(groups))[:25]:
                if "span" not in g_name and "خروج" not in g_name:
                    report += f"📦 **{g_name}**\n🔗 https://facebook.com/groups/{g_id}\n\n"
            return report
        return "🧐 دخلت الحساب بس ما لقيت قائمة المجموعات، تأكد من الحساب."
    except Exception as e:
        return f"❌ حصلت مشكلة أثناء تسجيل الدخول: {str(e)}"

@bot.message_handler(commands=['start', 'go'])
def start(message):
    bot.reply_to(message, "🚀 أرحب يا فادي! جاري الدخول لحسابك وسحب مجموعاتك طوالي...")
    result = get_my_own_groups()
    bot.send_message(message.chat.id, result, disable_web_page_preview=True)

print("البوت شغال.. ارسل /go في التلجرام عشان يبدأ النحر المباشر!")
bot.polling()
