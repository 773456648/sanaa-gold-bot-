# غلق أي بوت شغال قديم
pkill -f fadi_final_bot.py
# تشغيل البوت في الخلفية
nohup python3 fadi_final_bot.py > bot.log 2>&1 &
echo "✅ ابشرك.. البوت اشتغل في الخلفية يا فادي!"
