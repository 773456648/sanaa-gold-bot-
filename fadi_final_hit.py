from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

# بياناتك يا مسمار
USER_NAME = "فادي عبد الحكيم حاتم"
FB_USER = "100050824960231"
FB_PASS = "god12god1"

print(f"🚀 أرحب يا {USER_NAME}.. جاري اقتحام الحصون!")

chrome_options = Options()
chrome_options.add_argument('--headless') # تشغيل مخفي لتوفير الرام
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')

driver = webdriver.Chrome(options=chrome_options)

try:
    # دخول فيسبوك
    driver.get("https://m.facebook.com")
    time.sleep(2)
    
    # تعبئة البيانات
    driver.find_element("id", "m_login_email").send_keys(FB_USER)
    driver.find_element("id", "m_login_password").send_keys(FB_PASS)
    driver.find_element("name", "login").click()
    
    time.sleep(5) # انتظار تسجيل الدخول
    
    # الانتقال للمجموعات مباشرة
    driver.get("https://m.facebook.com/groups/?seemore")
    time.sleep(3)
    
    print(f"🎯 تم الدخول بنجاح يا {USER_NAME}!")
    print("🔗 رابط صفحة مجموعاتك المباشر:")
    print(driver.current_url)
    
except Exception as e:
    print(f"❌ فيسبوك عادوه معاند: {e}")

driver.quit()
