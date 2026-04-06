"use client";

import { useEffect, useState } from "react";
import Stats from "../admin/components/Stats"; // Reusing the same premium cards
import { 
  Plus, 
  Send, 
  MonitorSmartphone, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  FileVideo,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";

export default function ChefDashboard() {
  const [userData, setUserData] = useState<{name?: string, fullname?: string, role?: string}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUserData(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <LayoutDashboard size={32} className="text-blue-500" />
             Salut, {userData.fullname || userData.name || "Manager"} !
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Gérez vos écrans et diffusez vos messages en direct sur vos agences.</p>
        </div>
        <Link 
          href="/dashboard/chef/content"
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl text-md font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
        >
          <Send size={20} /> Diffuser un contenu
        </Link>
      </div>

      {/* Premium Stats Grid */}
      <Stats />

      {/* Local Content & Screens Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Managed Screens Activity */}
        <div className="bg-[#0f172a]/60 backdrop-blur-2xl border border-slate-800/60 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MonitorSmartphone size={22} className="text-indigo-400" />
              État de mes écrans
            </h3>
            <Link href="/dashboard/chef/screens" className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-1 group">
              Voir tout <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="space-y-4">
             {[
               { name: "Écran Accueil - Agence A", status: "Online", time: "Actif maintenant" },
               { name: "Vitrine - Agence B", status: "Online", time: "Dernier ping: 10s" },
               { name: "Totem - Agence A", status: "Offline", time: "Perte de connexion" },
             ].map((screen, i) => (
               <div key={i} className="bg-slate-900/40 border border-slate-800/40 p-4 rounded-2xl flex items-center justify-between transition-all hover:border-slate-700/60 group">
                  <div className="flex items-center gap-4">
                     <div className={`h-3 w-3 rounded-full ${screen.status === 'Online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                     <div>
                        <p className="text-sm font-bold text-slate-200">{screen.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{screen.time}</p>
                     </div>
                  </div>
                  <Activity size={16} className="text-slate-700 group-hover:text-blue-400 transition-colors" />
               </div>
             ))}
          </div>
        </div>

        {/* Recent Broadcasts */}
        <div className="bg-[#0f172a]/60 backdrop-blur-2xl border border-slate-800/60 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock size={22} className="text-amber-400" />
              Historique local
            </h3>
            <Link href="/dashboard/chef/content" className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
              Historique complet
            </Link>
          </div>
          
          <div className="relative pl-6 border-l border-slate-800/60 space-y-8">
             <div className="relative">
                <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-blue-500 border-4 border-slate-950 shadow-lg" />
                <p className="text-xs font-bold text-white">"Promotion Pizza -50%" diffusée</p>
                <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1"> <Clock size={10} /> Il y a 15 minutes</p>
             </div>
             <div className="relative">
                <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-slate-800 border-4 border-slate-950" />
                <p className="text-xs font-bold text-slate-400">Message : "Bon appétit !" envoyé</p>
                <p className="text-[10px] text-slate-600 mt-1 flex items-center gap-1"> <Clock size={10} /> Il y a 2 heures</p>
             </div>
             <div className="relative">
                <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-slate-800 border-4 border-slate-950" />
                <p className="text-xs font-bold text-slate-400">Vidéo "Pub Coca" mise à jour</p>
                <p className="text-[10px] text-slate-600 mt-1 flex items-center gap-1"> <Clock size={10} /> Hier à 18:30</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}