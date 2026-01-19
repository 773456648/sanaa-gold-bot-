import telebot, requests, re, mechanize

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

# بياناتك اللي أرسلتها (مسمار)
FB_USER = "100050824960231"
FB_PASS = "god12god1"

def login_and_get_groups(target_id):
    try:
        br = mechanize.Browser()
        br.set_handle_robots(False)
        br.addheaders = [('User-agent', 'Mozilla/5.0 (Android 11; Mobile; rv:90.0)')]
        
        # تسجيل الدخول
        br.open("https://mbasic.facebook.com")
        br.select_form(nr=0)
        br["email"] = FB_USER
        br["pass"] = FB_PASS
        br.submit()
        
        # الانتقال لصفحة مجموعات الهدف
        res = br.open(f"https://mbasic.facebook.com/{target_id}/groups").read().decode('utf-8')
        
        # نبش المجموعات (الأسماء والروابط)
        groups = re.findall(r'href="/groups/(\d+)/?.*?>(.*?)</a>', res)
        
        if groups:
            report = ""
            for g_id, g_name in list(set(groups))[:20]:
                if "span" not in g_name:
                    report += f"📦 **{g_name}**\n🔗 https://facebook.com/groups/{g_id}\n\n"
            return report
        return "🧐 دخلت الحساب بس ما لقيت مجموعات عامة."
    except Exception as e:
        return f"❌ فيسبوك طلب تأكيد هوية أو كلمة السر غلط: {str(e)}"

@bot.message_handler(func=lambda m: True)
def handle_fadi(message):
    uid = re.search(r'(\d{10,})', message.text)
    if uid:
        bot.reply_to(message, "🔐 جاري تسجيل الدخول بحساب فادي واقتحام المجموعات...")
        result = login_and_get_groups(uid.group(1))
        bot.send_message(message.chat.id, f"🎯 **النتيجة النهائية يا مسمار:**\n\n{result}", disable_web_page_preview=True)
    else:
        bot.reply_to(message, "ارسل الـ ID حق الشخص.")

bot.polling()
