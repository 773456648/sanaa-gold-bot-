import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, getDoc, 
  query, onSnapshot, updateDoc, deleteDoc, signInAnonymously, 
  getAuth, onAuthStateChanged 
} from 'firebase/firestore';

// --- إعدادات Firebase ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'heiba-elite-final-system';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [allVaults, setAllVaults] = useState([]);
  const [myVault, setMyVault] = useState(null);
  const [authName, setAuthName] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  
  // حالات بوت الأوامر الذكي
  const [botCommand, setBotCommand] = useState('');
  const [botResponse, setBotResponse] = useState({ text: 'بانتظار أوامرك.. ابحث عن اسم أو اكتب "حذف [الاسم]"', type: 'info' });

  // --- المصادقة والمزامنة ---
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInAnonymously(auth);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
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

  // --- وظائف التاجر ---
  const accessVault = async () => {
    if (!authName || !authPass) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'vaults', authName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      if (docSnap.data().password === authPass) {
        setMyVault(docSnap.data());
        setView('vault');
      } else alert("الرمز السري غير صحيح!");
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

  const deleteAccount = async () => {
    if (confirm("سيتم حذف حسابك بالكامل وجميع سجلاتك من المنظومة. هل أنت متأكد؟")) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'vaults', myVault.name));
      setView('home');
      setMyVault(null);
    }
  };

  // --- منطق بوت الأوامر الذكي ---
  const executeBotCommand = async () => {
    const cmd = botCommand.trim();
    if (!cmd) return;

    if (cmd.startsWith('حذف ')) {
      const nameToDelete = cmd.replace('حذف ', '').trim();
      const existingEntries = myVault.debts || [];
      const filtered = existingEntries.filter(d => d.debtor !== nameToDelete);
      
      if (filtered.length < existingEntries.length) {
        const updated = { ...myVault, debts: filtered };
        await updateVault(updated);
        setBotResponse({ text: `تم حذف جميع سجلات المدين (${nameToDelete}) بنجاح.`, type: 'success' });
      } else {
        setBotResponse({ text: `الاسم (${nameToDelete}) غير موجود في سجلاتك.`, type: 'error' });
      }
    } else {
      const records = (myVault.debts || []).filter(d => d.debtor.includes(cmd));
      if (records.length > 0) {
        const yerTotal = records.filter(r => r.currency === 'YER').reduce((a, b) => a + b.amount, 0);
        const usdTotal = records.filter(r => r.currency === 'USD').reduce((a, b) => a + b.amount, 0);
        setBotResponse({ 
          text: `وجدنا ${records.length} سجلات لـ (${cmd}). المجموع: ${yerTotal.toLocaleString()} ريال يمني، و ${usdTotal.toLocaleString()} دولار.`, 
          type: 'info' 
        });
      } else {
        setBotResponse({ text: `لا يوجد أي ديون مسجلة باسم (${cmd}).`, type: 'error' });
      }
    }
    setBotCommand('');
  };

  // --- البحث العام ---
  const globalSearch = () => {
    if (!searchQuery) { setSearchResult(null); return; }
    const results = [];
    allVaults.forEach(v => {
      const matches = v.debts?.filter(d => d.debtor.toLowerCase().includes(searchQuery.toLowerCase()));
      if (matches && matches.length > 0) {
        results.push({ merchant: v.name, records: matches });
      }
    });
    setSearchResult(results);
  };

  // --- التصميم والمكونات ---
  const GoldText = "bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-800 bg-clip-text text-transparent font-black";

  return (
    <div className="min-h-screen bg-[#060609] text-gray-200 p-4 md:p-8 font-sans" dir="rtl">
      
      {/* الهيدر الرئيسي */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10 border-b border-yellow-600/10 pb-6">
        <div>
          <h1 className={`text-4xl italic tracking-tighter ${GoldText}`}>HEIBA ELITE</h1>
          <p className="text-[10px] text-gray-600 tracking-[0.5em] uppercase">منظومة الرقابة المالية الذكية</p>
        </div>
        {view !== 'home' && (
          <button onClick={() => setView('home')} className="bg-white/5 border border-white/10 px-5 py-2 rounded-xl text-xs hover:bg-white/10 transition">خروج</button>
        )}
      </div>

      {/* الصفحة الرئيسية: البحث والدخول */}
      {view === 'home' && (
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* قسم البحث العام للمدينين */}
          <div className="bg-[#0f0f15] p-10 rounded-[3rem] border border-yellow-600/10 shadow-2xl space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">كاشف الذمم (البحث الشامل)</h2>
              <p className="text-gray-500 text-sm">ادخل اسمك للبحث عن ديونك لدى كافة التجار المشتركين</p>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="ابحث عن أي اسم..." 
                className="flex-1 bg-black border border-white/5 rounded-2xl p-4 outline-none focus:border-yellow-600 transition text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button onClick={globalSearch} className="bg-yellow-600 text-black font-bold px-10 rounded-2xl hover:bg-yellow-500 transition shadow-lg shadow-yellow-600/20">فحص</button>
            </div>

            {searchResult && (
              <div className="space-y-4 pt-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {searchResult.length > 0 ? (
                  <>
                    {searchResult.map((res, i) => (
                      <div key={i} className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden shadow-lg">
                        <div className="bg-yellow-600/5 p-3 px-5 text-xs flex justify-between items-center border-b border-white/5">
                          <span>التاجر: <strong className="text-yellow-500">{res.merchant}</strong></span>
                          <span className="text-gray-600">سجل رسمي</span>
                        </div>
                        <div className="p-4 space-y-3">
                          {res.records.map((rec, j) => (
                            <div key={j} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
                              <div>
                                <div className="font-bold text-gray-200">{rec.debtor}</div>
                                <div className="text-[10px] text-gray-500 italic">البيان: {rec.note || 'لا يوجد'}</div>
                              </div>
                              <div className="text-left">
                                <div className="font-black text-white text-lg">{rec.amount.toLocaleString()} <span className="text-xs text-yellow-600">{rec.currency}</span></div>
                                <div className="text-[9px] text-gray-600">{new Date(rec.date).toLocaleDateString('ar-YE')}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {/* الإجمالي الكلي للبحث */}
                    <div className="bg-gradient-to-r from-yellow-700 to-yellow-500 text-black p-6 rounded-2xl flex justify-around text-center shadow-2xl">
                      <div>
                        <div className="text-[10px] font-bold opacity-60">إجمالي ريال يمني</div>
                        <div className="text-2xl font-black">{searchResult.reduce((acc, curr) => acc + curr.records.filter(r => r.currency === 'YER').reduce((a, b) => a + b.amount, 0), 0).toLocaleString()}</div>
                      </div>
                      <div className="w-px bg-black/10"></div>
                      <div>
                        <div className="text-[10px] font-bold opacity-60">إجمالي دولار</div>
                        <div className="text-2xl font-black">{searchResult.reduce((acc, curr) => acc + curr.records.filter(r => r.currency === 'USD').reduce((a, b) => a + b.amount, 0), 0).toLocaleString()}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 text-gray-700 italic border-2 border-dashed border-white/5 rounded-3xl">لا توجد أي بيانات مسجلة لهذا الاسم في المنظومة حالياً.</div>
                )}
              </div>
            )}
          </div>

          {/* دخول التاجر */}
          <div className="max-w-md mx-auto bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-center">بوابة التجار</h3>
            <div className="space-y-4">
              <input type="text" placeholder="اسم التاجر" className="w-full bg-black p-4 rounded-xl border border-white/5 outline-none focus:border-yellow-600" value={authName} onChange={e => setAuthName(e.target.value)} />
              <input type="password" placeholder="رمز الحماية" className="w-full bg-black p-4 rounded-xl border border-white/5 outline-none focus:border-yellow-600 text-center tracking-widest" value={authPass} onChange={e => setAuthPass(e.target.value)} />
              <button onClick={accessVault} className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-yellow-500 transition shadow-lg">دخول الخزنة</button>
            </div>
          </div>
        </div>
      )}

      {/* لوحة تحكم الخزنة (التاجر + البوت الذكي) */}
      {view === 'vault' && myVault && (
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Elite Command Bot Center */}
          <div className="bg-[#0b0b12] p-6 rounded-[2.5rem] border-2 border-yellow-600/20 shadow-[0_0_60px_rgba(212,175,55,0.08)] relative overflow-hidden">
            <div className="flex items-center gap-4 mb-5 relative z-10">
              <div className="w-12 h-12 bg-yellow-600 rounded-2xl flex items-center justify-center text-black font-black animate-pulse shadow-lg shadow-yellow-600/30">H</div>
              <div className={`p-4 rounded-2xl flex-1 text-sm border ${botResponse.type === 'error' ? 'bg-red-900/10 border-red-900/20 text-red-400' : botResponse.type === 'success' ? 'bg-green-900/10 border-green-900/20 text-green-400' : 'bg-yellow-600/5 border-yellow-600/10 text-yellow-500'}`}>
                {botResponse.text}
              </div>
            </div>
            <div className="relative z-10">
              <input 
                type="text" 
                placeholder='ابحث عن شخص أو اكتب "حذف اسم الشخص" للإزالة فوراً...' 
                className="w-full bg-black border border-white/10 rounded-2xl p-5 outline-none focus:border-yellow-600 text-lg shadow-inner pr-16"
                value={botCommand}
                onChange={(e) => setBotCommand(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && executeBotCommand()}
              />
              <button onClick={executeBotCommand} className="absolute left-4 top-1/2 -translate-y-1/2 bg-yellow-600 p-3 rounded-xl text-black hover:bg-yellow-500 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
              </button>
            </div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* استمارة الإضافة السريعة */}
            <div className="lg:col-span-4 space-y-6 h-fit">
              <div className="bg-[#0f0f15] p-6 rounded-[2rem] border border-white/5 space-y-4 shadow-xl">
                <h3 className="font-bold border-b border-white/5 pb-3">تسجيل معاملة</h3>
                <input id="new-name" type="text" placeholder="اسم الزبون الكامل" className="w-full bg-black p-4 rounded-xl border border-white/5 outline-none focus:border-yellow-600" />
                <div className="flex gap-2">
                  <input id="new-amt" type="number" placeholder="المبلغ" className="flex-1 bg-black p-4 rounded-xl border border-white/5 outline-none" />
                  <select id="new-cur" className="bg-black border border-white/5 rounded-xl px-2 text-yellow-600 font-bold">
                    <option value="YER">YER</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <input id="new-note" type="text" placeholder="ملاحظة السعر/البيان" className="w-full bg-black p-4 rounded-xl border border-white/5 outline-none text-xs" />
                <button 
                  onClick={() => {
                    const n = document.getElementById('new-name').value;
                    const a = document.getElementById('new-amt').value;
                    const c = document.getElementById('new-cur').value;
                    const t = document.getElementById('new-note').value;
                    if(n && a) {
                      const entry = { id: Date.now(), debtor: n.trim(), amount: parseFloat(a), currency: c, note: t, date: new Date().toISOString() };
                      const updated = { ...myVault, debts: [...(myVault.debts || []), entry] };
                      updateVault(updated);
                      document.getElementById('new-name').value = ''; 
                      document.getElementById('new-amt').value = ''; 
                      document.getElementById('new-note').value = '';
                      setBotResponse({ text: `تم تأمين سجل جديد لـ (${n}) بنجاح.`, type: 'success' });
                    }
                  }}
                  className="w-full bg-yellow-600 text-black font-black py-4 rounded-xl shadow-lg shadow-yellow-600/20 active:scale-95 transition"
                >
                  حفظ في السحابة
                </button>
              </div>

              <button onClick={deleteAccount} className="w-full py-3 text-[10px] text-red-900 border border-red-900/20 rounded-xl hover:bg-red-900/5 transition">حذف الحساب نهائياً</button>
            </div>

            {/* سجلات الخزنة الرئيسية */}
            <div className="lg:col-span-8 bg-[#0f0f15] p-8 rounded-[3rem] border border-white/5 min-h-[600px] shadow-2xl">
              <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                <div>
                  <h3 className="text-2xl font-black italic">خزنة : <span className="text-yellow-500">{myVault.name}</span></h3>
                  <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">إجمالي السجلات المسجلة: {myVault.debts?.length || 0}</p>
                </div>
                <div className="bg-black/50 p-4 rounded-2xl flex gap-8 text-sm border border-white/5 shadow-inner">
                  <div className="text-center">
                    <p className="text-[9px] text-gray-500 mb-1">إجمالي YER</p>
                    <p className="font-black text-yellow-500 text-lg">{myVault.debts?.filter(d=>d.currency==='YER').reduce((a,b)=>a+b.amount,0).toLocaleString()}</p>
                  </div>
                  <div className="w-px bg-white/5"></div>
                  <div className="text-center">
                    <p className="text-[9px] text-gray-500 mb-1">إجمالي USD</p>
                    <p className="font-black text-blue-400 text-lg">{myVault.debts?.filter(d=>d.currency==='USD').reduce((a,b)=>a+b.amount,0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {myVault.debts && myVault.debts.length > 0 ? (
                  myVault.debts.slice().reverse().map((d) => (
                    <div key={d.id} className="group bg-white/[0.02] hover:bg-white/[0.05] p-6 rounded-2xl border border-white/5 flex justify-between items-center transition-all duration-300">
                      <div className="flex-1">
                        <div className="font-bold text-xl text-gray-100">{d.debtor}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-3 mt-2">
                          <span className="bg-black px-2 py-0.5 rounded border border-white/5">البيان: {d.note || 'بدون تفاصيل'}</span>
                          <span>• {new Date(d.date).toLocaleString('ar-YE')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-left">
                          <div className={`text-2xl font-black ${d.currency === 'USD' ? 'text-blue-400' : 'text-yellow-500'}`}>
                            {d.amount.toLocaleString()} 
                            <span className="text-xs mr-1 opacity-40">{d.currency}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            const updated = { ...myVault, debts: myVault.debts.filter(item => item.id !== d.id) };
                            updateVault(updated);
                          }}
                          className="opacity-0 group-hover:opacity-100 bg-red-900/20 text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 opacity-20 grayscale">
                    <svg className="w-24 h-24 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <p className="text-lg">لا توجد مديونيات في سجلاتك حالياً</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* الحقوق الأمنية */}
      <div className="mt-20 text-center opacity-30 pointer-events-none pb-20">
        <div className="inline-block border border-white/5 px-8 py-2 rounded-full">
          <p className="text-[9px] uppercase tracking-[0.8em]">Heiba Elite Financial Bot System • Blockchain Encryption Mode</p>
        </div>
      </div>
    </div>
  );
}