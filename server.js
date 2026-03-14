import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, getDoc, 
  query, onSnapshot, updateDoc, deleteDoc, signInAnonymously, 
  getAuth, onAuthStateChanged 
} from 'firebase/firestore';

const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'heiba-elite-bot-v1';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [allVaults, setAllVaults] = useState([]);
  const [myVault, setMyVault] = useState(null);
  const [authName, setAuthName] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  
  // بوت الأوامر
  const [botCommand, setBotCommand] = useState('');
  const [botResponse, setBotResponse] = useState({ text: 'مرحباً بك في بوت الهيبة.. اكتب اسم الشخص للاستعلام أو "حذف اسم" للإزالة', type: 'info' });

  useEffect(() => {
    const init = async () => {
      await signInAnonymously(auth);
    };
    init();
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'vaults');
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllVaults(docs);
    });
    return () => unsub();
  }, [user]);

  const accessVault = async () => {
    if (!authName || !authPass) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'vaults', authName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      if (docSnap.data().password === authPass) {
        setMyVault(docSnap.data());
        setView('vault');
      } else alert("الرمز السري خاطئ");
    } else {
      const newVault = {
        name: authName,
        password: authPass,
        debts: [],
        ownerId: user.uid,
        timestamp: Date.now()
      };
      await setDoc(docRef, newVault);
      setMyVault(newVault);
      setView('vault');
    }
  };

  const updateVault = async (updated) => {
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'vaults', updated.name);
    await updateDoc(docRef, updated);
    setMyVault(updated);
  };

  // معالج أوامر البوت
  const processBotCommand = async () => {
    const cmd = botCommand.trim();
    if (!cmd) return;

    if (cmd.startsWith('حذف ')) {
      const targetName = cmd.replace('حذف ', '').trim();
      const initialCount = myVault.debts.length;
      const filteredDebts = myVault.debts.filter(d => d.debtor !== targetName);
      
      if (filteredDebts.length < initialCount) {
        const updated = { ...myVault, debts: filteredDebts };
        await updateVault(updated);
        setBotResponse({ text: `تم حذف جميع سجلات (${targetName}) بنجاح من الخزنة.`, type: 'success' });
      } else {
        setBotResponse({ text: `عذراً، الاسم (${targetName}) غير مسجل في منظومتك.`, type: 'error' });
      }
    } else {
      // استعلام عن اسم
      const records = myVault.debts.filter(d => d.debtor.includes(cmd));
      if (records.length > 0) {
        const totalYER = records.filter(r => r.currency === 'YER').reduce((a, b) => a + b.amount, 0);
        const totalUSD = records.filter(r => r.currency === 'USD').reduce((a, b) => a + b.amount, 0);
        setBotResponse({ 
          text: `وجدنا ${records.length} سجلات لـ (${cmd}). الإجمالي: ${totalYER.toLocaleString()} ريال و ${totalUSD.toLocaleString()} دولار.`, 
          type: 'info' 
        });
      } else {
        setBotResponse({ text: `لا يوجد سجلات نشطة لاسم (${cmd}).`, type: 'error' });
      }
    }
    setBotCommand('');
  };

  const handleGlobalSearch = () => {
    if (!searchQuery) return;
    const results = [];
    allVaults.forEach(v => {
      const match = v.debts?.filter(d => d.debtor.toLowerCase().includes(searchQuery.toLowerCase()));
      if (match && match.length > 0) {
        results.push({ merchant: v.name, records: match });
      }
    });
    setSearchResult(results);
  };

  const GoldText = "bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-800 bg-clip-text text-transparent font-black";

  return (
    <div className="min-h-screen bg-[#050508] text-gray-200 p-4 md:p-8 dir-rtl text-right font-sans" dir="rtl">
      
      {/* Top Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10 border-b border-yellow-600/10 pb-6">
        <div>
          <h1 className={`text-4xl italic tracking-tighter ${GoldText}`}>HEIBA ELITE BOT</h1>
          <p className="text-[10px] text-gray-600 tracking-[0.4em] uppercase">نظام الخزنة الذكي</p>
        </div>
        {view !== 'home' && (
          <button onClick={() => setView('home')} className="bg-white/5 border border-white/10 px-5 py-2 rounded-xl text-xs">خروج</button>
        )}
      </div>

      {view === 'home' && (
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Public Search */}
          <div className="bg-[#0f0f15] p-10 rounded-[2.5rem] border border-yellow-600/10 shadow-2xl space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">كاشف الذمم (بحث عام)</h2>
              <p className="text-gray-500 text-xs">تتبع المديونيات في كافة فروع المنظومة</p>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="ادخل الاسم للبحث..." 
                className="flex-1 bg-black border border-white/5 rounded-2xl p-4 outline-none focus:border-yellow-600 transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button onClick={handleGlobalSearch} className="bg-yellow-600 text-black font-bold px-8 rounded-2xl hover:bg-yellow-500 transition shadow-lg">بحث</button>
            </div>

            {searchResult && (
              <div className="space-y-4 pt-4 max-h-96 overflow-y-auto pr-2">
                {searchResult.length > 0 ? (
                  searchResult.map((res, i) => (
                    <div key={i} className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                      <div className="bg-yellow-600/5 p-3 px-5 text-xs flex justify-between">
                        <span>التاجر: <strong className="text-yellow-500">{res.merchant}</strong></span>
                        <span className="text-gray-600 italic">سجلات مؤمنة</span>
                      </div>
                      <div className="p-4 space-y-2">
                        {res.records.map((rec, j) => (
                          <div key={j} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                            <span>{rec.debtor} <br/><small className="text-gray-500">{rec.note}</small></span>
                            <span className="font-bold">{rec.amount.toLocaleString()} <small className="text-yellow-600">{rec.currency}</small></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-700 py-10">لا توجد بيانات لهذا الاسم</p>
                )}
              </div>
            )}
          </div>

          {/* Login */}
          <div className="max-w-md mx-auto bg-white/5 p-8 rounded-[2rem] border border-white/10 space-y-4">
            <h3 className="text-center font-bold">لوحة تحكم التجار</h3>
            <input type="text" placeholder="اسم الخزنة" className="w-full bg-black border border-white/5 p-4 rounded-xl outline-none" value={authName} onChange={e => setAuthName(e.target.value)} />
            <input type="password" placeholder="الرمز السري" className="w-full bg-black border border-white/5 p-4 rounded-xl outline-none text-center" value={authPass} onChange={e => setAuthPass(e.target.value)} />
            <button onClick={accessVault} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-yellow-500 transition">دخول الخزنة</button>
          </div>
        </div>
      )}

      {view === 'vault' && myVault && (
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Bot Command Center */}
          <div className="bg-[#0a0a0f] p-6 rounded-[2rem] border-2 border-yellow-600/20 shadow-[0_0_50px_rgba(212,175,55,0.05)]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-black font-black animate-pulse text-xl italic">H</div>
              <div className={`p-3 rounded-2xl flex-1 text-sm ${botResponse.type === 'error' ? 'bg-red-900/20 text-red-400' : botResponse.type === 'success' ? 'bg-green-900/20 text-green-400' : 'bg-yellow-600/10 text-yellow-500'}`}>
                {botResponse.text}
              </div>
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="اكتب (اسم الشخص) للاستعلام أو (حذف اسم الشخص) للإزالة..." 
                className="w-full bg-black border border-white/10 rounded-2xl p-5 pr-14 outline-none focus:border-yellow-600 text-lg shadow-inner"
                value={botCommand}
                onChange={(e) => setBotCommand(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && processBotCommand()}
              />
              <button onClick={processBotCommand} className="absolute left-4 top-1/2 -translate-y-1/2 bg-yellow-600 p-2 rounded-xl text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form */}
            <div className="lg:col-span-4 bg-[#0f0f15] p-6 rounded-[2rem] border border-white/5 space-y-4 h-fit">
              <h3 className="font-bold border-b border-white/5 pb-2 mb-4">إضافة سجل سريع</h3>
              <input id="dn" type="text" placeholder="الاسم الكامل" className="w-full bg-black p-4 rounded-xl border border-white/5 outline-none" />
              <div className="flex gap-2">
                <input id="da" type="number" placeholder="المبلغ" className="flex-1 bg-black p-4 rounded-xl border border-white/5 outline-none" />
                <select id="dc" className="bg-black border border-white/5 rounded-xl px-2">
                  <option value="YER">YER</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <input id="dt" type="text" placeholder="ملاحظة السعر والبيان" className="w-full bg-black p-4 rounded-xl border border-white/5 outline-none text-xs" />
              <button 
                onClick={() => {
                  const n = document.getElementById('dn').value;
                  const a = document.getElementById('da').value;
                  const c = document.getElementById('dc').value;
                  const t = document.getElementById('dt').value;
                  if(n && a) {
                    const entry = { id: Date.now(), debtor: n.trim(), amount: parseFloat(a), currency: c, note: t, date: new Date().toISOString() };
                    const updated = { ...myVault, debts: [...(myVault.debts || []), entry] };
                    updateVault(updated);
                    document.getElementById('dn').value = ''; document.getElementById('da').value = ''; document.getElementById('dt').value = '';
                    setBotResponse({ text: `تم تأمين سجل جديد لـ (${n}) بنجاح.`, type: 'success' });
                  }
                }}
                className="w-full bg-yellow-600 text-black font-black py-4 rounded-xl shadow-lg shadow-yellow-600/10"
              >
                تأمين وحفظ
              </button>
            </div>

            {/* List */}
            <div className="lg:col-span-8 bg-[#0f0f15] p-8 rounded-[2.5rem] border border-white/5 min-h-[500px]">
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <h3 className="text-xl font-bold">سجلات : <span className="text-yellow-500">{myVault.name}</span></h3>
                <div className="flex gap-4">
                  <div className="text-left"><p className="text-[9px] text-gray-500">YER</p><p className="font-bold text-yellow-500">{myVault.debts?.filter(d=>d.currency==='YER').reduce((a,b)=>a+b.amount,0).toLocaleString()}</p></div>
                  <div className="text-left"><p className="text-[9px] text-gray-500">USD</p><p className="font-bold text-blue-400">{myVault.debts?.filter(d=>d.currency==='USD').reduce((a,b)=>a+b.amount,0).toLocaleString()}</p></div>
                </div>
              </div>

              <div className="space-y-3">
                {myVault.debts && myVault.debts.length > 0 ? (
                  myVault.debts.slice().reverse().map((d) => (
                    <div key={d.id} className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 flex justify-between items-center group">
                      <div>
                        <div className="font-bold text-lg">{d.debtor}</div>
                        <div className="text-[10px] text-gray-500 italic mt-1">{d.note} • {new Date(d.date).toLocaleDateString('ar-YE')}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-left font-black text-xl text-white">
                          {d.amount.toLocaleString()} <span className="text-[10px] text-yellow-600">{d.currency}</span>
                        </div>
                        <button 
                          onClick={() => {
                            const updated = { ...myVault, debts: myVault.debts.filter(item => item.id !== d.id) };
                            updateVault(updated);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-900 hover:text-red-500 transition"
                        >حذف</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-20 text-gray-700 italic">لا توجد سجلات حالية.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-20 text-center opacity-20 pointer-events-none pb-10">
        <p className="text-[10px] uppercase tracking-[1em]">Heiba Elite Intelligence &copy; 2026</p>
      </div>
    </div>
  );
}