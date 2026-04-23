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
  Loader2,
  Globe,
  Edit2,
  Trash2,
  X
} from "lucide-react";

export default function ChefScreensPage() {
  const [screens, setScreens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [myAgencies, setMyAgencies] = useState<any[]>([]);
  
  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', macAddress: '', agencyId: '', location: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (!storedUser || !token) return;
      
      const user = JSON.parse(storedUser);
      setUserData(user);

      const agenciesRes = await fetch("http://localhost:3001/agencies", {
        headers: { "Authorization": `Bearer ${token}` }
      });

        if (agenciesRes.ok) {
          const allAgencies = await agenciesRes.json();
          const filteredAgencies = allAgencies.filter((a: any) => {
            const uCity = (user.city || "").toLowerCase().trim();
            const aCity = (a.city || "").toLowerCase().trim();
            const aAddr = (a.address || "").toLowerCase().trim();
            
            return uCity && (aCity === uCity || aAddr === uCity || aAddr.includes(uCity));
          });
          setMyAgencies(filteredAgencies);
          
          // Continue with screens fetch...
          const screensRes = await fetch("http://localhost:3001/screens", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (screensRes.ok) {
             const allScreens = await screensRes.json();
             const agencyIds = new Set(filteredAgencies.map((a: { _id: any; id: any }) => a._id || a.id));
             const filteredScreens = allScreens.filter((s: any) => agencyIds.has(s.agencyId));
             setScreens(filteredScreens);
          }
        }
    } catch (err) {
      console.error(err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 15000); // 15s polling
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
      
      // Log deletion
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await fetch("http://localhost:3001/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          type: "warning",
          action: "Suppression écran",
          source: "Chef d'Agence",
          user: user.name || user.email || "Chef",
          details: `Suppression définitive d'un écran.`
        })
      });

      fetchData();
    } catch (err: any) {
      alert(err.message || "Impossible de supprimer cet écran");
    }
  };

  const openEditModal = (screen: any) => {
    setEditingId(screen._id || screen.id);
    setFormData({ 
      name: screen.name || '', 
      macAddress: screen.macAddress || '', 
      agencyId: screen.agencyId || '', 
      location: screen.location || '' 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/screens/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
      
      // Log modification
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await fetch("http://localhost:3001/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          type: "info",
          action: "Modification écran",
          source: "Chef d'Agence",
          user: user.name || user.email || "Chef",
          details: `Mise à jour des infos de l'écran "${formData.name}"`
        })
      });

      setSubmitSuccess(true);
      fetchData();
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setEditingId(null);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Supervision de Mes Écrans</h2>
          <p className="text-muted-foreground mt-2">Suivez l'état de votre parc d'affichage local.</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
             onClick={() => fetchData()}
             className="p-3 bg-muted border border-border text-muted-foreground hover:text-foreground rounded-2xl transition-all active:rotate-180 duration-500 hover:shadow-md"
           >
             <RefreshCcw size={20} />
           </button>
           <div className="flex bg-muted/30 border border-border p-1.5 rounded-2xl">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold">
                 <Wifi size={14} /> {stats.online}
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-xs font-bold ml-1">
                 <WifiOff size={14} /> {stats.offline}
              </div>
           </div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher parmi mes écrans..."
          className="w-full bg-card border border-border rounded-2xl py-4 pl-14 pr-6 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium placeholder:text-muted-foreground/40 shadow-sm"
        />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScreens.map((screen) => (
            <div key={screen.id || screen._id} className="soft-card p-6 shadow-sm group border-border transition-all">
               <div className="flex justify-between items-start mb-6">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                    screen.status === 'Online' || screen.status === 'online' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
                  }`}>
                    <MonitorSmartphone size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(screen)} className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors border border-primary/20" title="Modifier">
                       <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(screen._id || screen.id)} className="p-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl transition-colors border border-destructive/20" title="Supprimer">
                       <Trash2 size={16} />
                    </button>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground tracking-tight">{screen.name}</h3>
                    <div className="flex flex-col gap-1 mt-1">
                      <p className="text-[10px] text-primary font-bold flex items-center gap-1.5 leading-none tracking-tight">
                        <Globe size={11} className="text-primary/70" /> {screen.agency?.city || "Ville"}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Building2 size={12} className="text-primary/60" /> {screen.agency?.name || "Agence locale"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Dernier Heartbeat</p>
                       <p className="text-xs text-foreground font-medium mt-1">{screen.lastSeen || "Maintenant"}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Adresse IP</p>
                       <p className="text-xs text-muted-foreground font-mono mt-1">{screen.ip || "192.168.1.1"}</p>
                     </div>
                  </div>
                  
                  <button className="w-full mt-4 py-3 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition-all border border-border hover:border-primary/20 flex items-center justify-center gap-2">
                     Accéder au contrôle direct <ChevronRight size={14} />
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}
      {/* Modal - Edit Screen */}
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
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Modifier l'écran</h2>
                    <p className="text-sm text-muted-foreground mt-1">Mettez à jour les informations de votre périphérique.</p>
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
                   <h3 className="text-xl font-bold text-foreground mb-2">Mise à jour Réussie</h3>
                   <p className="text-muted-foreground">Les informations de l'écran ont été actualisées.</p>
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
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Agence (Lecture seule)</label>
                      <select 
                         disabled
                         value={formData.agencyId}
                         className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm text-muted-foreground cursor-not-allowed opacity-70"
                      >
                         {myAgencies.map((agency) => (
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
                         {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : "Enregistrer"}
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

