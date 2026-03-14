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
  const [view, setView] = useState('home'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [allVaults, setAllVaults] = useState([]);
  const [myVault, setMyVault] = useState(null);
  const [authName, setAuthName] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  // حالة البوت الذكي
  const [botCmd, setBotCmd] = useState('');
  const [botMsg, setBotMsg] = useState('مرحباً بك.. اكتب اسم الشخص للاستعلام أو "حذف فلان" للإزالة');

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

  // وظيفة البوت الذكي
  const handleBotAction = async () => {
    const cmd = botCmd.trim();
    if (!cmd) return;

    if (cmd.startsWith('حذف ')) {
      const target = cmd.replace('حذف ', '').trim();
      const exist = myVault.debts.find(d => d.debtor === target);
      if (exist) {
        const filtered = myVault.debts.filter(d => d.debtor !== target);
        await updateVault({ ...myVault, debts: filtered });
        setBotMsg(`تم الحذف بنجاح.. تم مسح سجلات (${target})`);
      } else {
        setBotMsg(`عذراً.. (${target}) مشو مسجل عندي.`);
      }
    } else {
      const found = myVault.debts.filter(d => d.debtor.includes(cmd));
      if (found.length > 0) {
        const yer = found.filter(f => f.currency === 'YER').reduce((a, b) => a + b.amount, 0);
        const usd = found.filter(f => f.currency === 'USD').reduce((a, b) => a + b.amount, 0);
        setBotMsg(`سجلات (${cmd}): مسجل عليه ${found.length} عمليات. الإجمالي: ${yer.toLocaleString()} ريال و ${usd.toLocaleString()} دولار.`);
      } else {
        setBotMsg(`الاسم (${cmd}) مشو مسجل.`);
      }
    }
    setBotCmd('');
  };

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
      
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10 border-b border-yellow-600/10 pb-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter bg-gradient-to-r from-yellow-200 to-yellow-600 bg-clip-text text-transparent">HEIBA ELITE</h1>
          <p className="text-[10px] uppercase tracking-[0.5em] text-gray-600">منظومة البوت المالي الذكي</p>
        </div>
        {view !== 'home' && (
          <button onClick={() => setView('home')} className="bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-xs">خروج</button>
        )}
      </div>

      {view === 'home' && (
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="bg-[#0f0f15] p-8 md:p-12 rounded-[3rem] border border-yellow-600/10 shadow-2xl space-y-8">
            <h2 className="text-2xl font-bold text-center">كاشف المديونية الشامل</h2>
            <div className="flex gap-2">
              <input type="text" placeholder="ادخل الاسم للبحث..." className="flex-1 bg-black border border-white/5 rounded-2xl p-4 outline-none focus:border-yellow-600 transition" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button onClick={handleSearch} className="bg-yellow-600 text-black font-black px-8 rounded-2xl hover:bg-yellow-500 transition">بحث</button>
            </div>
            {searchResult && (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {searchResult.length > 0 ? searchResult.map((res, i) => (
                  <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-xs text-yellow-500 mb-2 font-bold">التاجر: {res.merchant}</p>
                    {res.records.map((rec, j) => (
                      <div key={j} className="flex justify-between text-sm py-1 border-b border-white/5 last:border-0">
                        <span>{rec.debtor} <small className="text-gray-500">({rec.note})</small></span>
                        <span className="font-bold">{rec.amount.toLocaleString()} {rec.currency}</span>
                      </div>
                    ))}
                  </div>
                )) : <p className="text-center py-5 text-gray-600 italic">مشو مسجل عندنا.</p>}
              </div>
            )}
          </div>

          <div className="max-w-md mx-auto bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-center">دخول التاجر</h3>
            <div className="space-y-3">
              <input type="text" placeholder="اسم التاجر" className="w-full bg-black p-4 rounded-xl border border-white/5 outline-none" value={authName} onChange={e => setAuthName(e.target.value)} />
              <input type="password" placeholder="الرمز" className="w-full bg-black p-4 rounded-xl border border-white/5 outline-none text-center" value={authPass} onChange={e => setAuthPass(e.target.value)} />
              <button onClick={accessVault} className="w-full bg-white text-black font-black py-4 rounded-xl">فتح الخزنة</button>
            </div>
          </div>
        </div>
      )}

      {view === 'vault' && myVault && (
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* قسم البوت الذكي */}
          <div className="bg-[#0b0b12] p-6 rounded-[2rem] border border-yellow-600/20 shadow-xl">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-black font-black italic shadow-lg shadow-yellow-600/20">B</div>
                <div className="bg-yellow-600/5 border border-yellow-600/10 p-3 rounded-2xl flex-1 text-xs text-yellow-500">
                  {botMsg}
                </div>
             </div>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder='اكتب اسم الشخص أو "حذف فلان"...' 
                  className="flex-1 bg-black p-4 rounded-2xl border border-white/10 outline-none focus:border-yellow-600 transition"
                  value={botCmd}
                  onChange={e => setBotCmd(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleBotAction()}
                />
                <button onClick={handleBotAction} className="bg-yellow-600 text-black font-bold px-6 rounded-2xl">أمر</button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#0f0f15] p-6 rounded-[2rem] border border-white/5 space-y-4">
                <h3 className="font-bold">تسجيل يدوي</h3>
                <input id="dn" type="text" placeholder="اسم الزبون" className="w-full bg-black p-4 rounded-xl border border-white/5 outline-none" />
                <div className="flex gap-2">
                  <input id="da" type="number" placeholder="المبلغ" className="flex-1 bg-black p-4 rounded-xl border border-white/5 outline-none" />
                  <select id="dc" className="bg-black border border-white/5 rounded-xl px-2">
                    <option value="YER">YER</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <input id="dt" type="text" placeholder="البيان" className="w-full bg-black p-4 rounded-xl border border-white/5 outline-none text-xs" />
                <button 
                  onClick={() => {
                    const n = document.getElementById('dn').value;
                    const a = document.getElementById('da').value;
                    const c = document.getElementById('dc').value;
                    const t = document.getElementById('dt').value;
                    if(n && a) {
                       const entry = { id: Date.now(), debtor: n.trim(), amount: parseFloat(a), currency: c, note: t, date: new Date().toISOString() };
                       updateVault({ ...myVault, debts: [...(myVault.debts || []), entry] });
                       document.getElementById('dn').value = ''; document.getElementById('da').value = ''; document.getElementById('dt').value = '';
                    }
                  }}
                  className="w-full bg-yellow-600 text-black font-black py-4 rounded-xl"
                >تأمين وحفظ</button>
              </div>
              <button onClick={deleteVault} className="w-full py-2 text-[10px] text-red-900 border border-red-900/10 rounded-lg">حذف الخزنة نهائياً</button>
            </div>

            <div className="lg:col-span-8 bg-[#0f0f15] p-8 rounded-[2.5rem] border border-white/5 min-h-[500px]">
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <h3 className="text-xl font-bold">خزنة : <span className="text-yellow-500">{myVault.name}</span></h3>
                <div className="flex gap-4 text-xs">
                  <span className="text-yellow-500">{myVault.debts?.filter(d=>d.currency==='YER').reduce((a,b)=>a+b.amount,0).toLocaleString()} ريال</span>
                  <span className="text-blue-400">{myVault.debts?.filter(d=>d.currency==='USD').reduce((a,b)=>a+b.amount,0).toLocaleString()} دولار</span>
                </div>
              </div>
              <div className="space-y-3">
                {myVault.debts?.slice().reverse().map((d) => (
                  <div key={d.id} className="bg-white/[0.02] p-4 rounded-xl border border-white/5 flex justify-between items-center">
                    <div>
                      <p className="font-bold">{d.debtor}</p>
                      <p className="text-[10px] text-gray-500">{d.note} • {new Date(d.date).toLocaleDateString('ar-YE')}</p>
                    </div>
                    <div className="font-black">{d.amount.toLocaleString()} {d.currency}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}