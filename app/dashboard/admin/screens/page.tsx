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
  Building2,
  Edit2,
  Trash2
} from "lucide-react";

export default function ScreensPage() {
  const [screens, setScreens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({ name: '', macAddress: '', agencyId: '', location: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

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
      setError("Impossible de charger les écrans.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgencies = async () => {
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
    }
  };

  useEffect(() => {
    fetchScreens();
    fetchAgencies();
    const interval = setInterval(fetchScreens, 15000); // 15s for more real-time feel
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet écran ?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/screens/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      fetchScreens();
    } catch (err: any) {
      alert(err.message || "Impossible de supprimer cet écran");
    }
  };

  const openEditModal = (screen: any) => {
    setEditingId(screen._id || screen.id);
    setFormData({ name: screen.name || '', macAddress: screen.macAddress || '', agencyId: screen.agencyId || '', location: screen.location || '' });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', macAddress: '', agencyId: '', location: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      let res;
      if (editingId) {
        res = await fetch(`http://localhost:3001/screens/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      } else {
        res = await fetch("http://localhost:3001/screens", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      }

      if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
      setSubmitSuccess(true);
      fetchScreens();
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setFormData({ name: '', macAddress: '', agencyId: '', location: '' });
        setEditingId(null);
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
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
             Parc d'Écrans
             <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">{stats.total} Totaux</span>
          </h1>
          <p className="text-muted-foreground mt-2">Supervisez l'état et la diffusion de votre flotte d'affichage en direct.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={fetchScreens}
            className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:rotate-180 duration-500"
            title="Rafraîchir"
          >
            <RefreshCcw size={20} />
          </button>
          <button 
            onClick={openAddModal}
            className="flex-1 md:flex-initial bg-primary hover:opacity-90 text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Ajouter un écran
          </button>
        </div>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Wifi size={20} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Opérationnels</p>
              <p className="text-xl font-bold text-foreground">{stats.online}</p>
            </div>
         </div>
         <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <WifiOff size={20} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Hors ligne</p>
              <p className="text-xl font-bold text-foreground">{stats.offline}</p>
            </div>
         </div>
         <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Flux Moyen</p>
              <p className="text-xl font-bold text-foreground">4.2 Mb/s</p>
            </div>
         </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 bg-muted/40 p-2 rounded-2xl border border-border transition-colors">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou agence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Screens Monitoring Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
           <Loader2 className="animate-spin text-primary mb-4" size={32} />
           <p>Initialisation du flux de données...</p>
        </div>
      ) : filteredScreens.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-3xl">
           <MonitorSmartphone size={48} className="mb-4 opacity-20" />
           <p>Aucun écran ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScreens.map((screen) => (
            <div 
              key={screen.id || screen._id}
              className="relative soft-card overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1"
            >
              {/* Card Header (Preview) */}
              <div className="relative h-44 bg-muted/40 overflow-hidden">
                {screen.thumbnail ? (
                  <img src={screen.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700" alt="Screen preview" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 group-hover:scale-110 transition-transform duration-700">
                     <Layers size={60} />
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 opacity-50">Aucun Flux</p>
                  </div>
                )}
                
                {/* Status Badge Overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border">
                   <div className={`h-2 w-2 rounded-full ${screen.status === 'Online' || screen.status === 'online' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
                   <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">{screen.status}</span>
                </div>

                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <button onClick={() => openEditModal(screen)} className="p-1.5 bg-primary/80 backdrop-blur-md rounded-lg border border-primary/30 text-white hover:bg-primary transition-colors" title="Modifier">
                      <Edit2 size={16} />
                   </button>
                   <button onClick={() => handleDelete(screen._id || screen.id)} className="p-1.5 bg-destructive/80 backdrop-blur-md rounded-lg border border-destructive/30 text-white hover:bg-destructive transition-colors" title="Supprimer">
                      <Trash2 size={16} />
                   </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                 <div className="flex justify-between items-start">
                    <div>
                       <h3 className="text-foreground font-bold tracking-tight">{screen.name}</h3>
                       <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                          <Building2 size={12} className="text-primary" />
                          {screen.agency?.name || "Sans agence"}
                       </p>
                    </div>
                    <div className="px-2 py-1 bg-primary/10 border border-primary/20 rounded-md">
                       <span className="text-[9px] font-black text-primary uppercase">ID: {screen.id?.slice(-4) || screen._id?.slice(-4) || "????"}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
                    <div>
                       <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Adresse IP</p>
                       <p className="text-xs text-foreground font-mono mt-0.5">{screen.ip || "0.0.0.0"}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Dernière activité</p>
                       <p className="text-xs text-muted-foreground mt-0.5">{screen.lastSeen || "Inconnu"}</p>
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Add/Edit Screen */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div 
             className="absolute inset-0 bg-background/60 backdrop-blur-md transition-opacity" 
             onClick={() => !isSubmitting && !submitSuccess && setIsModalOpen(false)} 
           />
           <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-border bg-muted/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">{editingId ? "Modifier l'écran" : "Ajouter un écran"}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{editingId ? "Mettez à jour les informations de l'écran." : "Enregistrez un nouveau périphérique sur votre réseau."}</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X size={24} />
                  </button>
                </div>
              </div>

              {submitSuccess ? (
                <div className="p-16 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-top-4">
                   <div className="h-20 w-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mb-6 border border-emerald-500/20">
                      <CheckCircle2 size={40} />
                   </div>
                   <h3 className="text-xl font-bold text-foreground mb-2">Enregistrement Réussi</h3>
                   <p className="text-muted-foreground">L'écran a été configuré et peut maintenant recevoir des flux.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nom de l'écran</label>
                        <input 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Ex: Écran Hall A" 
                          className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Adresse MAC</label>
                        <input 
                          required
                          value={formData.macAddress}
                          onChange={(e) => setFormData({...formData, macAddress: e.target.value})}
                          placeholder="00:00:00:00:00:00" 
                          className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                        />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Affecter à une agence</label>
                      <select 
                         required
                         value={formData.agencyId}
                         onChange={(e) => setFormData({...formData, agencyId: e.target.value})}
                         className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      >
                         <option value="">Sélectionner une agence...</option>
                         {agencies.map((agency) => (
                           <option key={agency._id || agency.id} value={agency._id || agency.id}>
                             {agency.name}
                           </option>
                         ))}
                      </select>
                   </div>

                   <div className="pt-6 flex gap-4">
                      <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-semibold py-3 rounded-xl transition-all"
                      >
                         Annuler
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 bg-primary hover:opacity-90 text-primary-foreground font-semibold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
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
