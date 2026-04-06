"use client";

import { useEffect, useState, useRef } from "react";
import { 
  MonitorSmartphone, 
  Plus, 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Filter, 
  RefreshCcw, 
  Activity,
  Globe,
  Wifi,
  WifiOff,
  MoreVertical,
  Layers,
  Building2
} from "lucide-react";

export default function ScreensPage() {
  const [screens, setScreens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({ name: '', macAddress: '', agencyId: '', location: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchScreens = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/screens", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Erreur de récupération des écrans");
      const data = await res.json();
      setScreens(data);
      setError("");
    } catch (err: any) {
      console.error(err);
      // Fallback fallback mock local pour développement si l'API n'est pas encore parfaite
      if (screens.length === 0) {
        setScreens([
          { id: '1', name: 'Écran Accueil', status: 'Online', agency: { name: 'Paris Centrale' }, ip: '192.168.1.15', lastSeen: 'Il y a 2 min', thumbnail: '/images/auth_bg.png' },
          { id: '2', name: 'Vitrine Droite', status: 'Offline', agency: { name: 'Lyon Part-Dieu' }, ip: '192.168.2.42', lastSeen: 'Il y a 1h', thumbnail: null },
          { id: '3', name: 'Totem Entrée', status: 'Online', agency: { name: 'Marseille Vieux-Port' }, ip: '10.0.0.8', lastSeen: 'En direct', thumbnail: '/images/auth_bg.png' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreens();
    const interval = setInterval(fetchScreens, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/screens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
      setSubmitSuccess(true);
      fetchScreens();
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setFormData({ name: '', macAddress: '', agencyId: '', location: '' });
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredScreens = screens.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.agency?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: screens.length,
    online: screens.filter(s => s.status === 'Online' || s.status === 'online').length,
    offline: screens.filter(s => s.status !== 'Online' && s.status !== 'online').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             Parc d'Écrans
             <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">{stats.total} Totaux</span>
          </h1>
          <p className="text-slate-400 mt-2">Supervisez l'état et la diffusion de votre flotte d'affichage en direct.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={fetchScreens}
            className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:rotate-180 duration-500"
            title="Rafraîchir"
          >
            <RefreshCcw size={20} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-initial bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Ajouter un écran
          </button>
        </div>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         <div className="bg-slate-900/30 border border-slate-800/50 p-4 rounded-2xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Wifi size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Opérationnels</p>
              <p className="text-xl font-bold text-white">{stats.online}</p>
            </div>
         </div>
         <div className="bg-slate-900/30 border border-slate-800/50 p-4 rounded-2xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <WifiOff size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Hors ligne</p>
              <p className="text-xl font-bold text-white">{stats.offline}</p>
            </div>
         </div>
         <div className="bg-slate-900/30 border border-slate-800/50 p-4 rounded-2xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Flux Moyen</p>
              <p className="text-xl font-bold text-white">4.2 Mb/s</p>
            </div>
         </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 bg-slate-900/20 p-2 rounded-2xl border border-slate-800/30 pointer-events-auto">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou agence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/40 border border-slate-800/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
          />
        </div>
        <button className="hidden sm:flex items-center gap-2 p-2.5 px-4 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all text-sm font-medium">
          <Filter size={18} />
          Filtrer
        </button>
      </div>

      {/* Screens Monitoring Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
           <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
           <p>Initialisation du flux de données...</p>
        </div>
      ) : filteredScreens.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800/50 rounded-3xl">
           <MonitorSmartphone size={48} className="mb-4 opacity-20" />
           <p>Aucun écran ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScreens.map((screen) => (
            <div 
              key={screen.id || screen._id}
              className="group relative bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-slate-700 hover:-translate-y-1"
            >
              {/* Card Header (Preview) */}
              <div className="relative h-44 bg-slate-950 overflow-hidden">
                {screen.thumbnail ? (
                  <img src={screen.thumbnail} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700" alt="Screen preview" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-800 group-hover:scale-110 transition-transform duration-700">
                     <Layers size={60} />
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 opacity-50">Aucun Flux</p>
                  </div>
                )}
                
                {/* Status Badge Overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                   <div className={`h-2 w-2 rounded-full ${screen.status === 'Online' || screen.status === 'online' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
                   <span className="text-[10px] font-bold text-white uppercase tracking-wider">{screen.status}</span>
                </div>

                <div className="absolute top-4 right-4">
                   <button className="p-1.5 bg-slate-900/80 backdrop-blur-md rounded-lg border border-white/5 text-slate-400 hover:text-white transition-colors">
                      <MoreVertical size={16} />
                   </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                 <div className="flex justify-between items-start">
                    <div>
                       <h3 className="text-white font-bold tracking-tight">{screen.name}</h3>
                       <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                          <Building2 size={12} className="text-blue-500" />
                          {screen.agency?.name || "Sans agence"}
                       </p>
                    </div>
                    <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md">
                       <span className="text-[9px] font-black text-blue-400">ID: {screen.id?.slice(-4) || "????"}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/40">
                    <div>
                       <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Adresse IP</p>
                       <p className="text-xs text-slate-300 font-mono mt-0.5">{screen.ip || "0.0.0.0"}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Dernière activité</p>
                       <p className="text-xs text-slate-400 mt-0.5">{screen.lastSeen || "Inconnu"}</p>
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Add Screen */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div 
             className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" 
             onClick={() => !isSubmitting && !submitSuccess && setIsModalOpen(false)} 
           />
           <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-white/[0.04] bg-white/[0.02]">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Ajouter un écran</h2>
                    <p className="text-sm text-slate-400 mt-1">Enregistrez un nouveau périphérique sur votre réseau.</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>
              </div>

              {submitSuccess ? (
                <div className="p-16 flex flex-col items-center justify-center text-center">
                   <div className="h-20 w-20 bg-emerald-500/10 text-emerald-400 rounded-3xl flex items-center justify-center mb-6 border border-emerald-500/20">
                      <CheckCircle2 size={40} />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">Enregistrement Réussi</h3>
                   <p className="text-slate-400">L'écran a été configuré et peut maintenant recevoir des flux.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom de l'écran</label>
                        <input 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Ex: Écran Hall A" 
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Adresse MAC</label>
                        <input 
                          required
                          value={formData.macAddress}
                          onChange={(e) => setFormData({...formData, macAddress: e.target.value})}
                          placeholder="00:00:00:00:00:00" 
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Affecter à une agence</label>
                      <select 
                         required
                         value={formData.agencyId}
                         onChange={(e) => setFormData({...formData, agencyId: e.target.value})}
                         className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                      >
                         <option value="">Sélectionner une agence...</option>
                         <option value="1">Paris Centrale</option>
                         <option value="2">Lyon Part-Dieu</option>
                         <option value="3">Marseille Vieux-Port</option>
                      </select>
                   </div>

                   <div className="pt-6 flex gap-4">
                      <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 bg-slate-800/50 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all"
                      >
                         Annuler
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                      >
                         {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : "Confirmer"}
                      </button>
                   </div>
                </form>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
