const axios = require('axios');

const TELEGRAM_TOKEN = '7543475859:AAENXZxHPQZafOlvBwFr6EatUFD31iYq-ks';
const CHAT_ID = '5042495708';
const SITE_URL = 'https://fadi-pro.onrender.com'; // استبدل هذا برابط موقعك الحقيقي على ريندر

async function sendToTelegram(prop) {
    // رسالة تفصيلية تحتوي على كل البيانات ورابط الدخول المباشر
    const message = `
📢 **إشعار عقاري جديد**
━━━━━━━━━━━━━━━
👤 **المعلن:** ${prop.owner}
📞 **الهاتف:** ${prop.phone}
🏠 **العقار:** ${prop.title}
💰 **السعر:** ${prop.price} $
📏 **المساحة:** ${prop.space} لبنة
🔑 **كلمة السر:** ${prop.password}
━━━━━━━━━━━━━━━
🔗 **رابط الدخول المباشر:**
${SITE_URL}
    `;

    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
    } catch (error) {
        console.error("فشل إرسال التقرير الكامل");
    }
}
