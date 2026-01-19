import telebot, requests, re

API_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks'
bot = telebot.TeleBot(API_TOKEN)

# الكوكيز حقك يا فادي (المحرك الأساسي)
FB_COOKIES = {
    'c_user': '100003550913323',
    'xs': '31:yHNizqiAxU5oow:2:1768254323:-1:-1',
    'datr': 'iGplaV28PgweKRFA2B3ALpcC',
    'fr': '0ZAmSGvgnip1quTXs.AWeVmklM3dgxLADEPbPf9RKOWvKKTAbGSwUurLhAX6KDPFuJweU.BpZWqJ..AAA.0.0.BpbpB2.AWd0vgC9q6yPDiy5pd3vHn0SWU4'
}

def mine_groups(uid):
    try:
        url = f"https://www.facebook.com/search/{uid}/groups"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        
        # الاقتحام بالكوكيز
        res = requests.get(url, headers=headers, cookies=FB_COOKIES, timeout=15)
        
        # البحث عن روابط وأسماء المجموعات (Regex متطور)
        # هذا النمط يبحث عن الـ IDs حق المجموعات في الكود
        group_ids = re.findall(r'facebook\.com/groups/(\d+)', res.text)
        
        if group_ids:
            results = []
            for g_id in list(set(group_ids))[:10]: # نكتفي بأول 10 مجموعات عشان ما ننحظر
                results.append(f"📦 مجموعة: https://www.facebook.com/groups/{g_id}")
            return "\n".join(results)
        else:
            return "🧐 الحساب هذا "مغلق" بقوة، أو الكوكيز حقك تحتاج تحديث."
    except:
        return "❌ حصل خطأ أثناء التنقيب."

@bot.message_handler(func=lambda m: True)
def handle_fadi(message):
    # استخراج الـ ID من الرابط أو النص
    uid_match = re.search(r'(\d{10,})', message.text)
    if uid_match:
        uid = uid_match.group(1)
        bot.reply_to(message, f"🔦 بدأت المهرة.. جاري سحب مجموعات المعرف `{uid}`...")
        data = mine_groups(uid)
        bot.send_message(message.chat.id, f"🎯 التقرير الاستخباراتي لـ فادي:\n\n{data}")
    else:
        bot.reply_to(message, "ارسل لي الـ ID اللي طلعناه قبل شوية.")

bot.polling()
