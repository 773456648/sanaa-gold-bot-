import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, getDoc, 
  query, onSnapshot, updateDoc, deleteDoc, signInAnonymously, 
  getAuth, onAuthStateChanged 
} from 'firebase/firestore';

// التكوين السحابي
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'heiba-elite-final';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); // home, vault
  const [searchQuery, setSearchQuery] = useState('');
  const [allVaults, setAllVaults] = useState([]);
  const [myVault, setMyVault] = useState(null);
  const [authName, setAuthName] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  // المصادقة التلقائية
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

  // جلب البيانات العامة للبحث
  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'vaults');
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllVaults(docs);
    });
    return () => unsub();
  }, [user]);

  // إدارة الدخول للخزنة
  const accessVault = async () => {
    if (!authName || !authPass) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'vaults', authName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      if (docSnap.data().password === authPass) {
        setMyVault(docSnap.data());
        setView('vault');
      } else alert("رمز الحماية غير صحيح!");
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

  const deleteVault = async () => {
    if (confirm("هل أنت متأكد من حذف خزنتك وكل بياناتها نهائياً؟")) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'vaults', myVault.name));
      setView('home');
      setMyVault(null);
    }
  };

  const addDebt = (debtor, amount, currency, note) => {
    const entry = {
      id: Date.now(),
      debtor: debtor.trim(),
      amount: parseFloat(amount),
      currency,
      note: note || '',
      date: new Date().toISOString()
    };
    const updated = { ...myVault, debts: [...(myVault.debts || []), entry] };
    updateVault(updated);
  };

  const removeDebt = (id) => {
    const updated = { ...myVault, debts: myVault.debts.filter(d => d.id !== id) };
    updateVault(updated);
  };

  // وظيفة البحث المرن
  const handleSearch = () => {
    if (!searchQuery) { setSearchResult(null); return; }
    const results = [];
    allVaults.forEach(v => {
      const match = v.debts?.filter(d => d.debtor.toLowerCase().includes(searchQuery.toLowerCase()));
      if (match && match.length > 0) {
        results.push({ merchant: v.name, records: match });
      }
    });
    setSearchResult(results);
  };

  return (
    <div className="min-h-screen bg-[#060608] text-gray-200 font-sans p-4 md:p-8 dir-rtl text-right" dir="rtl">
      
      {/* الستار العلوي */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10 border-b border-yellow-600/10 pb-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter bg-gradient-to-r from-yellow-200 to-yellow-600 bg-clip-text text-transparent">HEIBA ELITE</h1>
          <p className="text-[10px] uppercase tracking-[0.5em] text-gray-600">منصة الذمم المالية والتحليل</p>
        </div>
        {view !== 'home' && (
          <button onClick={() => setView('home')} className="bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-xs hover:bg-white/10 transition">خروج للمنصة العامة</button>
        )}
      </div>

      {/* الواجهة الرئيسية: البحث العام */}
      {view === 'home' && (
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="bg-[#0f0f15] p-8 md:p-12 rounded-[3rem] border border-yellow-600/10 shadow-2xl space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">كاشف المديونية الشامل</h2>
              <p className="text-gray-500 text-sm">ابحث عن أي اسم لمعرفة كافة الديون المسجلة عليه لدى مختلف التجار</p>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="ادخل الاسم الكامل للبحث..." 
                className="flex-1 bg-black border border-white/5 rounded-2xl p-4 outline-none focus:border-yellow-600 transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button onClick={handleSearch} className="bg-yellow-600 text-black font-black px-8 rounded-2xl hover:bg-yellow-500 transition shadow-lg shadow-yellow-600/20">بحث</button>
            </div>

            {searchResult && (
              <div className="space-y-4 pt-6">
                {searchResult.length > 0 ? (
                  <>
                    {searchResult.map((res, i) => (
                      <div key={i} className="bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                        <div className="bg-yellow-600/5 p-3 px-5 border-b border-white/5 flex justify-between text-xs">
                          <span>التاجر: <span className="text-yellow-500 font-bold">{res.merchant}</span></span>
                          <span className="text-gray-500">عدد السجلات: {res.records.length}</span>
                        </div>
                        <div className="p-4 space-y-3">
                          {res.records.map((rec, j) => (
                            <div key={j} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                              <div>
                                <div className="font-bold">{rec.debtor}</div>
                                <div className="text-[10px] text-gray-500 italic">البيان: {rec.note || 'لا يوجد'}</div>
                              </div>
                              <div className="text-left font-black text-white">
                                {rec.amount.toLocaleString()} <span className="text-[10px] text-yellow-600">{rec.currency}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {/* ملخص الحساب الكلي */}
                    <div className="bg-yellow-600 text-black p-6 rounded-2xl flex justify-around text-center shadow-xl">
                      <div>
                        <div className="text-[9px] font-bold opacity-60">إجمالي ريال يمني</div>
                        <div className="text-2xl font-black">{searchResult.reduce((acc, curr) => acc + curr.records.filter(r => r.currency === 'YER').reduce((a, b) => a + b.amount, 0), 0).toLocaleString()}</div>
                      </div>
                      <div className="w-px bg-black/10"></div>
                      <div>
                        <div className="text-[9px] font-bold opacity-60">إجمالي دولار</div>
                        <div className="text-2xl font-black">{searchResult.reduce((acc, curr) => acc + curr.records.filter(r => r.currency === 'USD').reduce((a, b) => a + b.amount, 0), 0).toLocaleString()}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10 text-gray-700 italic">لا توجد سجلات مطابقة.</div>
                )}
              </div>
            )}
          </div>

          {/* بوابة دخول التاجر */}
          <div className="max-w-md mx-auto bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-center">دخول التجار والمسؤولين</h3>
            <div className="space-y-3">
              <input type="text" placeholder="اسم التاجر" className="w-full bg-black p-4 rounded-xl border border-white/5 outline-none focus:border-yellow-600" value={authName} onChange={e => setAuthName(e.target.value)} />
              <input type="password" placeholder="الرمز السري" className="w-full bg-black p-4 rounded-xl border border-white/5 outline-none focus:border-yellow-600 text-center tracking-widest" value={authPass} onChange={e => setAuthPass(e.target.value)} />
              <button onClick={accessVault} className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-yellow-500 transition">فتح الخزنة</button>
            </div>
          </div>
        </div>
      )}

      {/* واجهة الخزنة (لوحة تحكم التاجر) */}
      {view === 'vault' && myVault && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0f0f15] p-6 rounded-[2rem] border border-white/5 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">تسجيل دين جديد</h3>
              <input id="dn" type="text" placeholder="اسم الزبون" className="w-full bg-black p-4 rounded-xl border border-white/5 outline-none focus:border-yellow-600" />
              <div className="flex gap-2">
                <input id="da" type="number" placeholder="المبلغ" className="flex-1 bg-black p-4 rounded-xl border border-white/5 outline-none" />
                <select id="dc" className="bg-black border border-white/5 rounded-xl px-3 outline-none">
                  <option value="YER">YER</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <input id="dt" type="text" placeholder="تفاصيل السعر (منعاً للمغوة)" className="w-full bg-black p-4 rounded-xl border border-white/5 outline-none text-xs" />
              <button 
                onClick={() => {
                  const n = document.getElementById('dn').value;
                  const a = document.getElementById('da').value;
                  const c = document.getElementById('dc').value;
                  const t = document.getElementById('dt').value;
                  if(n && a) {
                    addDebt(n, a, c, t);
                    document.getElementById('dn').value = '';
                    document.getElementById('da').value = '';
                    document.getElementById('dt').value = '';
                  }
                }}
                className="w-full bg-yellow-600 text-black font-black py-4 rounded-xl active:scale-95 transition"
              >
                تأمين وحفظ
              </button>
            </div>

            <button onClick={deleteVault} className="w-full py-3 text-[10px] text-red-900 border border-red-900/20 rounded-xl hover:bg-red-900/10">حذف الحساب بالكامل</button>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#0f0f15] p-8 rounded-[2.5rem] border border-white/5 min-h-[500px]">
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <div>
                  <h3 className="text-xl font-bold">خزنة : <span className="text-yellow-500">{myVault.name}</span></h3>
                  <p className="text-xs text-gray-500 mt-1">إجمالي الحركات: {myVault.debts?.length || 0}</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-left"><p className="text-[9px] text-gray-500">ريال</p><p className="font-bold text-yellow-500">{myVault.debts?.filter(d=>d.currency==='YER').reduce((a,b)=>a+b.amount,0).toLocaleString()}</p></div>
                  <div className="text-left"><p className="text-[9px] text-gray-500">دولار</p><p className="font-bold text-blue-400">{myVault.debts?.filter(d=>d.currency==='USD').reduce((a,b)=>a+b.amount,0).toLocaleString()}</p></div>
                </div>
              </div>

              <div className="space-y-3">
                {myVault.debts && myVault.debts.length > 0 ? (
                  myVault.debts.slice().reverse().map((d) => (
                    <div key={d.id} className="group bg-white/[0.02] hover:bg-white/[0.05] p-5 rounded-2xl border border-white/5 flex justify-between items-center transition">
                      <div>
                        <div className="font-bold text-lg">{d.debtor}</div>
                        <div className="text-[10px] text-gray-500 flex gap-3 mt-1 italic">
                          <span>البيان: {d.note || 'لا يوجد'}</span>
                          <span>• {new Date(d.date).toLocaleDateString('ar-YE')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-left font-black text-xl text-white">
                          {d.amount.toLocaleString()} <span className="text-[10px] text-yellow-600">{d.currency}</span>
                        </div>
                        <button onClick={() => removeDebt(d.id)} className="opacity-0 group-hover:opacity-100 text-red-900 hover:text-red-500 transition">حذف</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 opacity-20 italic">لا توجد بيانات مسجلة.</div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* تذييل */}
      <div className="mt-20 text-center opacity-20 pointer-events-none">
        <p className="text-[10px] uppercase tracking-[1em]">Heiba Elite Financial Vault &copy; 2026</p>
      </div>
    </div>
  );
}