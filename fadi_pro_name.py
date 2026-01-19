import telebot, re, mechanize

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

# بياناتك يا فادي (الاسم فوق والباسورد تحت)
USER_NAME = "فادي عبد الحكيم حاتم"
FB_PASS = "god12god1"
FB_USER_ID = "100050824960231" # معرفك للدخول

def get_fadi_groups():
    try:
        br = mechanize.Browser()
        br.set_handle_robots(False)
        br.addheaders = [('User-agent', 'Mozilla/5.0 (Android 11; Mobile; rv:90.0)')]
        
        # 1. تسجيل الدخول
        br.open("https://mbasic.facebook.com")
        br.select_form(nr=0)
        br["email"] = FB_USER_ID
        br["pass"] = FB_PASS
        br.submit()
        
        # 2. الدخول لصفحة مجموعاتك
        res = br.open("https://mbasic.facebook.com/groups/?seemore").read().decode('utf-8')
        
        # 3. استخراج المجموعات
        groups = re.findall(r'href="/groups/(\d+)/?.*?>(.*?)</a>', res)
        
        if groups:
            report = f"👤 **المستخدم:** {USER_NAME}\n"
            report += f"🔑 **كلمة السر:** {FB_PASS}\n"
            report += "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n"
            report += "🎯 **المجموعات المكتشفة في حسابك:**\n\n"
            for g_id, g_name in list(set(groups))[:25]:
                if "span" not in g_name and "خروج" not in g_name:
                    report += f"📦 **{g_name}**\n🔗 https://facebook.com/groups/{g_id}\n\n"
            return report
        return "🧐 دخلت الحساب بس ما لقيت قائمة المجموعات."
    except Exception as e:
        return f"❌ حصل خطأ في الدخول: {str(e)}"

@bot.message_handler(commands=['start', 'fadi'])
def start(message):
    bot.reply_to(message, f"🚀 أرحب يا {USER_NAME}! جاري نحر مجموعات حسابك...")
    result = get_fadi_groups()
    bot.send_message(message.chat.id, result, disable_web_page_preview=True)

print(f"البوت شغال باسم {USER_NAME}.. ارسل /fadi في التلجرام!")
bot.polling()
