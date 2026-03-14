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
const appId = typeof __app_id !== 'undefined' ? __app_id : 'heiba-elite-pro-v3';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [allVaults, setAllVaults] = useState([]);
  const [myVault, setMyVault] = useState(null);
  const [authName, setAuthName] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInAnonymously(auth);
      } else {
        await signInAnonymously(auth);
      }
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
    }, (err) => console.error("Firestore Error:", err));
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
      } else alert("الرمز غير صحيح");
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

  const updateVaultData = async (updated) => {
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'vaults', updated.name);
    await updateDoc(docRef, updated);
    setMyVault(updated);
  };

  const deleteVaultForever = async () => {
    if (window.confirm("سيتم حذف حسابك وكل الديون المسجلة فيه نهائياً! هل أنت متأكد؟")) {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'vaults', myVault.name);
      await deleteDoc(docRef);
      setView('home');
      setMyVault(null);
    }
  };

  const addDebtEntry = (debtor, amount, currency, note) => {
    const entry = {
      id: Date.now(),
      debtor: debtor.trim(),
      amount: parseFloat(amount),
      currency,
      note: note || '',
      date: new Date().toISOString()
    };
    const updated = { ...myVault, debts: [...(myVault.debts || []), entry] };
    updateVaultData(updated);
  };

  const removeDebtEntry = (id) => {
    const updated = { ...myVault, debts: myVault.debts.filter(d => d.id !== id) };
    updateVaultData(updated);
  };

  const performGlobalSearch = () => {
    if (!searchQuery) return;
    const results = [];
    allVaults.forEach(v => {
      // بحث مرن: إذا كان الاسم يحتوي على جزء من النص المكتوب
      const match = v.debts?.filter(d => d.debtor.toLowerCase().includes(searchQuery.toLowerCase()));
      if (match && match.length > 0) {
        results.push({ merchant: v.name, records: match });
      }
    });
    setSearchResult(results);
  };

  const GoldGradient = "bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-700 bg-clip-text text-transparent";

  return (
    <div className="min-h-screen bg-[#07070a] text-gray-200 font-sans p-4 md:p-8 dir-rtl text-right">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 border-b border-yellow-600/10 pb-6 gap-4">
        <div>
          <h1 className={`text-5xl font-black italic tracking-tighter ${GoldGradient}`}>HEIBA ELITE</h1>
          <p className="text-[10px] uppercase tracking-[0.5em] text-gray-500 mt-1 text-center md:text-right">منظومة الرقابة المالية المتكاملة</p>
        </div>
        <div className="flex gap-2">
          {view !== 'home' && (
            <button onClick={() => setView('home')} className="bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-sm hover:bg-white/10 transition">الرئيسية</button>
          )}
        </div>
      </div>

      {/* Views */}
      {view === 'home' && (
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Public Search Area */}
          <div className="bg-[#0f0f15] p-10 rounded-[3rem] border border-yellow-600/20 shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-600/5 blur-3xl"></div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">كاشف الذمم المالية</h2>
              <p className="text-gray-500">ابحث عن اسمك أو أي اسم لمعرفة الديون المسجلة لدى التجار</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3">
              <input 
                type="text" 
                placeholder="ادخل الاسم (مثلاً: أحمد علي...)" 
                className="flex-1 bg-black/50 border border-white/10 rounded-2xl p-5 outline-none focus:border-yellow-600 text-lg transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                onClick={performGlobalSearch}
                className="bg-yellow-600 text-black font-black px-10 py-5 rounded-2xl hover:bg-yellow-500 hover:scale-105 transition active:scale-95"
              >
                فحص السجلات
              </button>
            </div>

            {searchResult && (
              <div className="mt-10 space-y-6 animate-in fade-in duration-500">
                {searchResult.length > 0 ? (
                  <>
                    {searchResult.map((res, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="bg-yellow-600/10 p-4 border-b border-white/5 flex justify-between items-center">
                          <span className="text-sm">التاجر: <strong className="text-yellow-500">{res.merchant}</strong></span>
                          <span className="text-[10px] text-gray-500">{res.records.length} سجلات</span>
                        </div>
                        <div className="p-4 space-y-3">
                          {res.records.map((rec, j) => (
                            <div key={j} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                              <div>
                                <div className="font-bold text-gray-300">{rec.debtor}</div>
                                <div className="text-[10px] text-gray-500 italic">{rec.note || 'بدون ملاحظات'}</div>
                              </div>
                              <div className="text-left">
                                <div className="font-black text-white">{rec.amount.toLocaleString()} <span className="text-[10px] text-yellow-600">{rec.currency}</span></div>
                                <div className="text-[9px] text-gray-600">{new Date(rec.date).toLocaleDateString('ar-YE')}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {/* Totals Summary for Search */}
                    <div className="bg-yellow-600 p-6 rounded-2xl text-black flex justify-around items-center shadow-xl shadow-yellow-600/20">
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-bold opacity-70">إجمالي الريال</p>
                        <p className="text-2xl font-black">{searchResult.reduce((acc, curr) => acc + curr.records.filter(r => r.currency === 'YER').reduce((a, b) => a + b.amount, 0), 0).toLocaleString()}</p>
                      </div>
                      <div className="w-px h-10 bg-black/10"></div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-bold opacity-70">إجمالي الدولار</p>
                        <p className="text-2xl font-black">{searchResult.reduce((acc, curr) => acc + curr.records.filter(r => r.currency === 'USD').reduce((a, b) => a + b.amount, 0), 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10 text-gray-600 italic">لا توجد نتائج مطابقة لهذا الاسم.</div>
                )}
              </div>
            )}
          </div>

          {/* Access Area */}
          <div className="max-w-md mx-auto bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-6">
            <h3 className="text-xl font-bold text-center">دخول التجار والمسؤولين</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="اسم المتجر / التاجر" 
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 outline-none focus:border-yellow-600"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="رمز الحماية" 
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 outline-none focus:border-yellow-600 text-center tracking-widest"
                value={authPass}
                onChange={(e) => setAuthPass(e.target.value)}
              />
              <button onClick={accessVault} className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-yellow-500 transition">فتح الخزنة الخاصة</button>
            </div>
          </div>
        </div>
      )}

      {view === 'vault' && myVault && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar: Control & Input */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0f0f15] p-6 rounded-[2rem] border border-white/5 space-y-5 shadow-xl">
              <h3 className="text-lg font-black flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
                تسجيل معاملة جديدة
              </h3>
              <div className="space-y-3">
                <input id="in-name" type="text" placeholder="اسم الزبون الكامل" className="w-full bg-black p-4 rounded-xl border border-white/5 focus:border-yellow-600 outline-none" />
                <div className="flex gap-2">
                  <input id="in-amt" type="number" placeholder="المبلغ" className="flex-1 bg-black p-4 rounded-xl border border-white/5 focus:border-yellow-600 outline-none" />
                  <select id="in-cur" className="bg-black border border-white/5 rounded-xl px-2 outline-none">
                    <option value="YER">YER</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <input id="in-note" type="text" placeholder="ملاحظة السعر (مثلاً: كيس دقيق سعة ..)" className="w-full bg-black p-4 rounded-xl border border-white/5 focus:border-yellow-600 outline-none text-xs" />
                <button 
                  onClick={() => {
                    const n = document.getElementById('in-name').value;
                    const a = document.getElementById('in-amt').value;
                    const c = document.getElementById('in-cur').value;
                    const nt = document.getElementById('in-note').value;
                    if(n && a) {
                      addDebtEntry(n, a, c, nt);
                      document.getElementById('in-name').value = '';
                      document.getElementById('in-amt').value = '';
                      document.getElementById('in-note').value = '';
                    }
                  }}
                  className="w-full bg-yellow-600 text-black font-black py-4 rounded-xl shadow-lg shadow-yellow-600/10 active:scale-95 transition"
                >
                  حفظ السجل في السحابة
                </button>
              </div>
            </div>

            <div className="bg-red-900/10 p-6 rounded-[2rem] border border-red-900/20">
              <h4 className="text-xs font-bold text-red-500 mb-4 uppercase tracking-widest">منطقة الخطر</h4>
              <button onClick={deleteVaultForever} className="w-full py-3 text-xs text-red-500 border border-red-900/30 rounded-xl hover:bg-red-900/20 transition">حذف المنظومة بالكامل</button>
            </div>
          </div>

          {/* Main Content: Vault Records */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#0f0f15] p-8 rounded-[2.5rem] border border-white/5 min-h-[600px] shadow-2xl relative">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black italic">خزنة : <span className={GoldGradient}>{myVault.name}</span></h3>
                  <p className="text-[10px] text-gray-500 mt-1">إجمالي السجلات: {myVault.debts?.length || 0}</p>
                </div>
                <div className="bg-black/50 p-3 rounded-2xl flex gap-6 text-sm border border-white/5">
                  <div className="text-center">
                    <p className="text-[9px] text-gray-500">مجموع YER</p>
                    <p className="font-bold text-yellow-500">{myVault.debts?.filter(d => d.currency === 'YER').reduce((a,b) => a + b.amount, 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-gray-500">مجموع USD</p>
                    <p className="font-bold text-blue-400">{myVault.debts?.filter(d => d.currency === 'USD').reduce((a,b) => a + b.amount, 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {myVault.debts && myVault.debts.length > 0 ? (
                  myVault.debts.slice().reverse().map((d) => (
                    <div key={d.id} className="group bg-white/[0.03] hover:bg-white/[0.07] p-5 rounded-2xl border border-white/5 flex justify-between items-center transition-all">
                      <div className="flex-1">
                        <div className="font-bold text-lg">{d.debtor}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          <span className="bg-black px-2 py-0.5 rounded text-[10px] border border-white/5">البيان: {d.note || 'لا يوجد'}</span>
                          <span>• {new Date(d.date).toLocaleDateString('ar-YE')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-left">
                          <div className={`text-xl font-black ${d.currency === 'USD' ? 'text-blue-400' : 'text-yellow-500'}`}>
                            {d.amount.toLocaleString()} 
                            <span className="text-[10px] mr-1 opacity-50">{d.currency}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeDebtEntry(d.id)}
                          className="opacity-0 group-hover:opacity-100 bg-red-900/20 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                          title="حذف هذا السجل"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-40 opacity-20">
                    <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 00-2 2H6a2 2 0 00-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                    <p>الخزنة فارغة حالياً</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-20 text-center">
        <div className="inline-block bg-white/[0.02] px-6 py-2 rounded-full border border-white/5">
          <p className="text-[9px] text-gray-600 tracking-widest uppercase">Encryption Active • Secure Peer-to-Peer Finance Network</p>
        </div>
      </div>
    </div>
  );
}