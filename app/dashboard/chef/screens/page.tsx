"use client";

import { useEffect, useState } from "react";
import { 
  MonitorSmartphone, 
  Activity, 
  Wifi, 
  WifiOff, 
  RefreshCcw, 
  Search, 
  MoreVertical,
  Building2,
  ChevronRight,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function ChefScreensPage() {
  const [screens, setScreens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMyScreens = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/screens", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setScreens(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyScreens();
  }, []);

  const stats = {
    total: screens.length,
    online: screens.filter(s => s.status === 'Online' || s.status === 'online').length,
    offline: screens.filter(s => s.status !== 'Online' && s.status !== 'online').length,
  };

  const filteredScreens = screens.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Supervision de Mes Écrans</h2>
          <p className="text-slate-400 mt-2">Suivez l'état de votre parc d'affichage local.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={fetchMyScreens}
             className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all active:rotate-180 duration-500"
           >
             <RefreshCcw size={20} />
           </button>
           <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                 <Wifi size={14} /> {stats.online}
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-red-500/10 text-red-100 border border-red-500/20 text-xs font-bold ml-1">
                 <WifiOff size={14} /> {stats.offline}
              </div>
           </div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher parmi mes écrans..."
          className="w-full bg-[#0f172a]/60 backdrop-blur-md border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
        />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScreens.map((screen) => (
            <div key={screen.id || screen._id} className="bg-[#0f172a]/60 backdrop-blur-2xl border border-slate-800/60 rounded-3xl p-6 shadow-2xl group hover:border-slate-700/60 transition-all">
               <div className="flex justify-between items-start mb-6">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                    screen.status === 'Online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-100 border border-red-500/20'
                  }`}>
                    <MonitorSmartphone size={24} />
                  </div>
                  <div className={`h-2.5 w-2.5 rounded-full ${screen.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
               </div>
               
               <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{screen.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5"><Building2 size={12} /> {screen.agency?.name}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/40 grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Dernier Heartbeat</p>
                       <p className="text-xs text-slate-300 font-medium mt-1">{screen.lastSeen}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Adresse IP</p>
                       <p className="text-xs text-slate-400 font-mono mt-1">{screen.ip}</p>
                     </div>
                  </div>
                  
                  <button className="w-full mt-4 py-3 bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all border border-transparent hover:border-white/[0.06] flex items-center justify-center gap-2">
                     Accéder au contrôle direct <ChevronRight size={14} />
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
