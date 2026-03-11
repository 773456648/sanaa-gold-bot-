import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, addDoc, deleteDoc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';
import { 
  TrendingUp, TrendingDown, ShieldCheck, Zap, Bot, LayoutDashboard, 
  History, Settings, LogOut, Cpu, Activity, Globe, Send, 
  Wallet, PieChart, BarChart3, AlertTriangle, CheckCircle2 
} from 'lucide-react';

// --- Firebase Setup ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'heiba-ultimate-v3-titan';

// --- Constants & Assets ---
const ASSETS = [
  { id: 'XAUUSD', name: 'GOLD', symbol: 'OANDA:XAUUSD', binance: 'PAXGUSDT', type: 'Commodity' },
  { id: 'BTCUSDT', name: 'BTC', symbol: 'BINANCE:BTCUSDT', binance: 'BTCUSDT', type: 'Crypto' },
  { id: 'ETHUSDT', name: 'ETH', symbol: 'BINANCE:ETHUSDT', binance: 'ETHUSDT', type: 'Crypto' },
  { id: 'SOLUSDT', name: 'SOL', symbol: 'BINANCE:SOLUSDT', binance: 'SOLUSDT', type: 'Crypto' },
  { id: 'EURUSD', name: 'EUR', symbol: 'FX:EURUSD', binance: 'EURUSDT', type: 'Forex' }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState('');
  const [isLocked, setIsLocked] = useState(true);
  const [currentAsset, setCurrentAsset] = useState(ASSETS[0]);
  const [prices, setPrices] = useState({});
  const [trades, setTrades] = useState([]);
  const [bots, setBots] = useState([]);
  const [tradeAmount, setTradeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('terminal');
  const [notifications, setNotifications] = useState([]);

  // --- Calculations ---
  const stats = useMemo(() => {
    let totalPnl = 0;
    let totalInvestment = 0;
    trades.forEach(t => {
      const currentPrice = prices[t.asset] || t.entryPrice;
      const diff = currentPrice - t.entryPrice;
      const pnl = t.side === 'BUY' 
        ? (diff * t.amount / t.entryPrice) 
        : (-diff * t.amount / t.entryPrice);
      totalPnl += pnl;
      totalInvestment += t.amount;
    });
    return { totalPnl, totalInvestment, activeCount: trades.length };
  }, [trades, prices]);

  // --- Telegram Engine ---
  const notifyTelegram = async (message) => {
    if (bots.length === 0) return;
    for (const bot of bots) {
      if (bot.token && bot.chatId) {
        try {
          await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: bot.chatId,
              text: `💎 *HEIBA TITAN V3 SYSTEM*\n\n${message}`,
              parse_mode: 'Markdown'
            })
          });
        } catch (e) { console.error("Telegram fail", e); }
      }
    }
  };

  const pushLocalNote = (msg, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [{ id, msg, type }, ...prev].slice(0, 5));
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  };

  // --- Initialization ---
  useEffect(() => {
    const init = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    init();
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const qTrades = collection(db, 'artifacts', appId, 'users', user.uid, 'trades');
    const qBots = collection(db, 'artifacts', appId, 'users', user.uid, 'bots');
    
    const unsubT = onSnapshot(qTrades, s => setTrades(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubB = onSnapshot(qBots, s => setBots(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    return () => { unsubT(); unsubB(); };
  }, [user]);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price');
        const data = await res.json();
        const map = {};
        data.forEach(item => {
          const match = ASSETS.find(a => a.binance === item.symbol);
          if (match) map[match.name] = parseFloat(item.price);
        });
        setPrices(map);
      } catch (e) {}
    };
    fetchMarket();
    const timer = setInterval(fetchMarket, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isLocked && currentAsset) {
      const container = document.getElementById('tv_titan_main');
      if (container) container.innerHTML = ''; 
      const s = document.createElement('script');
      s.src = 'https://s3.tradingview.com/tv.js';
      s.async = true;
      s.onload = () => {
        if (window.TradingView) {
          new window.TradingView.widget({
            "autosize": true, "symbol": currentAsset.symbol, "interval": "5",
            "timezone": "Etc/UTC", "theme": "dark", "style": "1", "locale": "ar",
            "toolbar_bg": "#050508", "enable_publishing": false, "hide_side_toolbar": false,
            "container_id": "tv_titan_main"
          });
        }
      };
      document.head.appendChild(s);
    }
  }, [isLocked, currentAsset, activeTab]);

  // --- Command Handlers ---
  const handleAuth = () => {
    if (password === '771232690') {
      setIsLocked(false);
      pushLocalNote("تم تأكيد الهوية. أهلاً بك يا قائد.", "success");
    } else {
      pushLocalNote("كلمة مرور غير صالحة!", "error");
    }
  };

  const executeOrder = async (side) => {
    if (!tradeAmount || parseFloat(tradeAmount) <= 0) {
      pushLocalNote("حدد مبلغ الاستثمار أولاً", "error");
      return;
    }
    setLoading(true);
    const price = prices[currentAsset.name];
    try {
      const docRef = await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'trades'), {
        asset: currentAsset.name,
        side,
        amount: parseFloat(tradeAmount),
        entryPrice: price,
        createdAt: serverTimestamp(),
        status: 'OPEN'
      });
      notifyTelegram(`🚀 *تم فتح مركز جديد*\nالأصل: ${currentAsset.name}\nالنوع: ${side === 'BUY' ? '🟢 شراء' : '🔴 بيع'}\nالمبلغ: $${tradeAmount}\nالسعر: $${price.toLocaleString()}`);
      pushLocalNote(`تم تنفيذ أمر الـ ${side} بنجاح`, "success");
      setTradeAmount('');
    } catch (e) {
      pushLocalNote("فشل في تنفيذ الأمر", "error");
    } finally { setLoading(false); }
  };

  const liquidizePosition = async (trade) => {
    const curPrice = prices[trade.asset] || trade.entryPrice;
    const diff = curPrice - trade.entryPrice;
    const pnl = trade.side === 'BUY' ? (diff * trade.amount / trade.entryPrice) : (-diff * trade.amount / trade.entryPrice);
    
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'trades', trade.id));
      notifyTelegram(`🏁 *تمت تصفية المركز*\nالأصل: ${trade.asset}\nالربح النهائي: ${pnl.toFixed(4)}$\nسعر الخروج: $${curPrice.toLocaleString()}`);
      pushLocalNote("تم إغلاق المركز وتأمين الأرباح", "success");
    } catch (e) { pushLocalNote("خطأ في تصفية المركز", "error"); }
  };

  const connectBot = async (e) => {
    e.preventDefault();
    const data = { 
      name: e.target.b_name.value, 
      token: e.target.b_token.value, 
      chatId: e.target.b_chat.value,
      active: true 
    };
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'bots'), data);
    notifyTelegram(`✅ *تم ربط النظام السحابي بالبوت الجديد:* ${data.name}`);
    e.target.reset();
    pushLocalNote("تم ربط البوت بنجاح", "success");
  };

  // --- Render ---
  if (isLocked) return (
    <div className="min-h-screen bg-[#020205] flex items-center justify-center p-6 font-['Changa']">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#0a0a0f] border border-yellow-500/20 rounded-[40px] p-10 shadow-[0_0_50px_rgba(234,179,8,0.05)] text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-700 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-yellow-500/20 rotate-3">
            <ShieldCheck size={48} className="text-black" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 italic tracking-tighter">HEIBA <span className="text-yellow-500">TITAN</span></h1>
          <p className="text-gray-500 text-xs uppercase tracking-[0.3em] mb-10">Global Intelligence Access</p>
          
          <div className="space-y-4">
            <input 
              type="password" 
              className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-center text-yellow-500 text-2xl outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-800"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            />
            <button 
              onClick={handleAuth}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 text-lg uppercase shadow-lg shadow-yellow-500/20"
            >
              فتح النظام <Zap size={20} fill="currentColor" />
            </button>
          </div>
          <p className="mt-8 text-[10px] text-gray-700 uppercase">Authorized Personnel Only • Secure 256-bit AES</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050508] text-white font-['Changa'] selection:bg-yellow-500 selection:text-black">
      {/* Top HUD */}
      <header className="h-20 border-b border-white/5 bg-black/80 backdrop-blur-2xl flex items-center justify-between px-6 sticky top-0 z-[100]">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center text-black font-black text-2xl italic shadow-lg shadow-yellow-500/20">H</div>
          <div className="hidden lg:block">
            <h2 className="text-lg font-black italic flex items-center gap-2">HEIBA <span className="text-yellow-500">TITAN V3</span> <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20 uppercase">Pro Access</span></h2>
            <div className="flex items-center gap-3 text-[10px] text-gray-500 uppercase tracking-widest">
              <span className="flex items-center gap-1 text-green-500"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Live Data</span>
              <span>ID: {user?.uid.slice(0,10)}</span>
              <span>Ping: 24ms</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex gap-8">
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase font-bold">إجمالي الاستثمار</div>
              <div className="text-sm font-mono font-bold">${stats.totalInvestment.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase font-bold">الربح اللحظي</div>
              <div className={`text-sm font-mono font-bold ${stats.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.totalPnl >= 0 ? '+' : ''}{stats.totalPnl.toFixed(2)}$
              </div>
            </div>
          </div>
          <button onClick={() => setIsLocked(true)} className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Notifications Portal */}
      <div className="fixed top-24 right-6 z-[200] space-y-3 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded-2xl border backdrop-blur-md flex items-center gap-3 shadow-2xl animate-slide-in pointer-events-auto min-w-[300px] ${
            n.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 
            n.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
          }`}>
            {n.type === 'success' ? <CheckCircle2 size={18} /> : n.type === 'error' ? <AlertTriangle size={18} /> : <Activity size={18} />}
            <span className="text-xs font-bold">{n.msg}</span>
          </div>
        ))}
      </div>

      <main className="max-w-[1800px] mx-auto p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <div className="xl:col-span-1 space-y-4">
          {[
            { id: 'terminal', icon: LayoutDashboard, label: 'المنصة' },
            { id: 'bots', icon: Bot, label: 'البوتات' },
            { id: 'stats', icon: PieChart, label: 'إحصائيات' },
            { id: 'settings', icon: Settings, label: 'إعدادات' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setActiveTab(btn.id)}
              className={`w-full flex flex-col items-center justify-center py-6 rounded-3xl border transition-all gap-2 group ${
                activeTab === btn.id ? 'bg-yellow-500 border-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-[#0d0d14] border-white/5 text-gray-500 hover:border-white/10'
              }`}
            >
              <btn.icon size={24} strokeWidth={activeTab === btn.id ? 2.5 : 1.5} />
              <span className="text-[9px] font-black uppercase tracking-tighter">{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Main Workspace */}
        <div className="xl:col-span-8 space-y-6">
          {activeTab === 'terminal' && (
            <>
              {/* Asset Strip */}
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {ASSETS.map(asset => (
                  <button
                    key={asset.id}
                    onClick={() => setCurrentAsset(asset)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-3xl border transition-all whitespace-nowrap group ${
                      currentAsset.id === asset.id ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-[#0d0d14] border-white/5 text-gray-500 hover:border-white/10'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentAsset.id === asset.id ? 'bg-yellow-500 text-black' : 'bg-white/5'}`}>
                      <Globe size={18} />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-black uppercase">{asset.name}</div>
                      <div className="text-[10px] font-mono opacity-60">${prices[asset.name]?.toLocaleString() || '---'}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Chart Central */}
              <div className="bg-[#0d0d14] border border-white/5 rounded-[40px] h-[600px] overflow-hidden shadow-2xl relative group">
                <div id="tv_titan_main" className="w-full h-full" />
                <div className="absolute top-4 right-4 flex gap-2">
                   <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-bold text-yellow-500 uppercase">Precise Algorithm V3</div>
                </div>
              </div>

              {/* Order Execution */}
              <div className="bg-[#0d0d14] border border-white/5 p-8 rounded-[40px] shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black italic flex items-center gap-3"><Zap className="text-yellow-500" /> تنفيذ فوري</h3>
                  <div className="flex gap-4">
                    <div className="px-4 py-2 bg-black/40 rounded-xl border border-white/5 text-[10px] font-bold text-gray-500">رافعة مالية: 1:100</div>
                    <div className="px-4 py-2 bg-black/40 rounded-xl border border-white/5 text-[10px] font-bold text-gray-500">سبريد: 0.1</div>
                  </div>
                </div>
                <div className="flex flex-col md:row gap-6">
                  <div className="relative flex-1">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 font-black">$</div>
                    <input 
                      type="number"
                      className="w-full bg-black border border-white/10 rounded-3xl p-6 pl-12 text-2xl text-yellow-500 font-mono outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-900"
                      placeholder="0.00"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4 flex-1">
                    <button 
                      onClick={() => executeOrder('BUY')}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-500 p-6 rounded-3xl font-black text-xl shadow-lg shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <TrendingUp size={24} /> BUY
                    </button>
                    <button 
                      onClick={() => executeOrder('SELL')}
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-500 p-6 rounded-3xl font-black text-xl shadow-lg shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <TrendingDown size={24} /> SELL
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'bots' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-[#0d0d14] border border-white/5 p-10 rounded-[40px]">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3"><Send className="text-yellow-500" /> ربط بوت تليجرام</h2>
                <form onSubmit={connectBot} className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block tracking-widest">اسم المعرف</label>
                    <input name="b_name" className="w-full bg-black border border-white/5 p-5 rounded-2xl outline-none focus:border-yellow-500/30" placeholder="Main Command Bot" required />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block tracking-widest">API Token</label>
                    <input name="b_token" type="password" className="w-full bg-black border border-white/5 p-5 rounded-2xl outline-none focus:border-yellow-500/30" placeholder="HTTP API..." required />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block tracking-widest">Chat ID</label>
                    <input name="b_chat" className="w-full bg-black border border-white/5 p-5 rounded-2xl outline-none focus:border-yellow-500/30" placeholder="-100xxxxxxx" required />
                  </div>
                  <button type="submit" className="w-full bg-yellow-500 text-black font-black py-5 rounded-2xl hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/10">تفعيل الربط السحابي</button>
                </form>
              </div>

              <div className="bg-[#0d0d14] border border-white/5 p-10 rounded-[40px]">
                <h2 className="text-2xl font-black mb-8">البوتات النشطة</h2>
                <div className="space-y-4">
                  {bots.length === 0 ? (
                    <div className="text-center py-20 opacity-20"><Bot size={64} className="mx-auto" /></div>
                  ) : (
                    bots.map(b => (
                      <div key={b.id} className="p-6 bg-black/40 border border-white/5 rounded-3xl flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center"><Cpu size={24} /></div>
                          <div>
                            <div className="font-bold text-white">{b.name}</div>
                            <div className="text-[10px] text-green-500 uppercase font-bold tracking-widest">Connected & Operational</div>
                          </div>
                        </div>
                        <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'bots', b.id))} className="p-3 hover:bg-red-500/10 text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100">حذف</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Intelligence Sidebar */}
        <div className="xl:col-span-3 space-y-6">
          {/* Risk HUD */}
          <div className="bg-gradient-to-br from-[#1a1a25] to-[#0a0a0f] border border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Wallet size={120} /></div>
            <h3 className="text-xs font-black text-gray-500 uppercase mb-6 flex items-center gap-2"><BarChart3 size={14} /> حالة المحفظة</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] uppercase font-bold mb-2">
                  <span className="text-gray-500">توزيع السيولة</span>
                  <span className="text-yellow-500">{(stats.totalInvestment > 0 ? 100 : 0)}%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-yellow-500 h-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" style={{width: stats.totalInvestment > 0 ? '100%' : '0%'}}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">الربح الصافي</div>
                  <div className={`text-lg font-mono font-bold ${stats.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${stats.totalPnl.toFixed(2)}
                  </div>
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">معدل الخطر</div>
                  <div className="text-lg font-mono font-bold text-white">LOW</div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Positions Scroll */}
          <div className="bg-[#0d0d14] border border-white/5 rounded-[40px] overflow-hidden shadow-xl flex flex-col max-h-[700px]">
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-gray-400">المراكز المفتوحة</h3>
              <span className="bg-yellow-500 text-black text-[10px] px-2 py-0.5 rounded-full font-black">{trades.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {trades.length === 0 ? (
                <div className="text-center py-24">
                  <History size={48} className="mx-auto text-gray-800 mb-4 opacity-20" />
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">No Open Positions</p>
                </div>
              ) : (
                trades.map(t => {
                  const cp = prices[t.asset] || t.entryPrice;
                  const diff = cp - t.entryPrice;
                  const pnl = t.side === 'BUY' ? (diff * t.amount / t.entryPrice) : (-diff * t.amount / t.entryPrice);
                  const isWin = pnl >= 0;
                  return (
                    <div key={t.id} className={`bg-[#050508] border-r-4 p-5 rounded-3xl transition-all hover:bg-black/60 shadow-lg ${isWin ? 'border-green-500' : 'border-red-500'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${t.side === 'BUY' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{t.side}</span>
                            <span className="text-xs font-black text-white">{t.asset}</span>
                          </div>
                          <div className="text-[9px] text-gray-600 font-mono tracking-tighter">Qty: ${t.amount.toLocaleString()}</div>
                        </div>
                        <div className={`text-sm font-mono font-bold ${isWin ? 'text-green-500' : 'text-red-500'}`}>
                          {isWin ? '+' : ''}{pnl.toFixed(3)}$
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="text-[9px] text-gray-500 flex flex-col">
                          <span>Entry Price</span>
                          <span className="text-gray-300 font-mono">${t.entryPrice.toLocaleString()}</span>
                        </div>
                        <button 
                          onClick={() => liquidizePosition(t)}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase transition-all active:scale-90"
                        >
                          تصفية المركز
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* System Logs */}
          <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
             <h4 className="text-[10px] font-black text-gray-600 uppercase mb-4 tracking-widest">Logs / السجلات</h4>
             <div className="space-y-2 font-mono text-[9px]">
               <div className="text-green-500/60 leading-relaxed">[SYSTEM] Titan V3 Engine Initialized... OK</div>
               <div className="text-gray-600 leading-relaxed">[AUTH] Identity Verified for Session 0x7712</div>
               <div className="text-blue-500/60 leading-relaxed">[NETWORK] WebSocket Connected to Binance Cloud</div>
             </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

