"use client";

import { useEffect, useState } from "react";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  ChevronRight,
  MonitorSmartphone,
  CheckCircle2,
  Loader2,
  Search
} from "lucide-react";

export default function ChefAgenciesPage() {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMyAgencies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/agencies", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAgencies(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAgencies();
  }, []);

  const filteredAgencies = agencies.filter(a => a.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Gestion de Mes Agences</h2>
          <p className="text-slate-400 mt-2">Gérez les informations et les ressources de vos établissements.</p>
        </div>
        <div className="flex bg-[#0f172a]/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/[0.04]">
           <div className="px-5 py-2 text-xs font-black text-blue-400 uppercase tracking-widest border-r border-white/[0.04]">
              {agencies.length} Agences
           </div>
           <div className="px-5 py-2 text-xs font-black text-slate-500 uppercase tracking-widest">
              Manager Local
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
          placeholder="Rechercher une agence spécifique..."
          className="w-full bg-[#0f172a]/60 backdrop-blur-md border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
        />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredAgencies.map((agency) => (
            <div key={agency.id || agency._id} className="bg-[#0f172a]/60 backdrop-blur-2xl border border-slate-800/60 rounded-3xl p-8 shadow-2xl group hover:border-slate-700/60 transition-all">
               <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                     <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                        <Building2 size={32} />
                     </div>
                     <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{agency.name}</h3>
                        <p className="text-xs text-blue-500 font-black uppercase tracking-widest mt-1">ID: {agency.id?.slice(-6) || "LOCAL"}</p>
                     </div>
                  </div>
                  <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                     {agency.status || 'Opérationnel'}
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
                        <MapPin size={18} className="text-blue-500/60 shrink-0" />
                        <span className="text-sm font-medium leading-relaxed">{agency.address || "Adresse non définie"}</span>
                     </div>
                     <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
                        <Phone size={18} className="text-blue-500/60 shrink-0" />
                        <span className="text-sm font-medium">{agency.phone || "Non renseigné"}</span>
                     </div>
                  </div>
                  
                  <div className="bg-white/[0.02] border border-white/[0.04] p-5 rounded-2xl flex flex-col items-center justify-center text-center">
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Parc d'écrans</p>
                     <div className="flex items-center gap-3">
                        <MonitorSmartphone size={24} className="text-indigo-400" />
                        <span className="text-3xl font-black text-white">{agency.screensCount || 0}</span>
                     </div>
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-white/[0.04] flex justify-between items-center">
                  <div className="flex -space-x-2">
                     <div className="h-8 w-8 rounded-full bg-slate-800 border-2 border-[#0f172a] flex items-center justify-center text-[10px] text-slate-500 font-bold">U1</div>
                     <div className="h-8 w-8 rounded-full bg-slate-800 border-2 border-[#0f172a] flex items-center justify-center text-[10px] text-slate-500 font-bold">U2</div>
                     <div className="h-8 w-8 rounded-full bg-blue-600 border-2 border-[#0f172a] flex items-center justify-center text-[10px] text-white font-bold">+2</div>
                  </div>
                  <button className="flex items-center gap-2 text-xs font-black text-blue-500 hover:text-white uppercase tracking-widest transition-all group/btn">
                     Paramètres Agence <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
