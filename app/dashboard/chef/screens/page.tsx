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
  X,
  FileVideo,
  Plus
} from "lucide-react";

export default function ChefScreensPage() {
  const [screens, setScreens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [myAgencies, setMyAgencies] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  
  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', agencyId: '', location: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [screenForContent, setScreenForContent] = useState<any>(null);
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const [isAssigningContent, setIsAssigningContent] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<any[]>([]);

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const profileRes = await fetch("/api/backend/users/profile", { cache: "no-store" });
      const user = profileRes.ok ? await profileRes.json() : null;
      if (!user) return;
      setUserData(user);

      const agenciesRes = await fetch("/api/backend/agencies", { cache: "no-store" });

        if (agenciesRes.ok) {
          // Backend should already return only agencies assigned to current chef
          const filteredAgencies = await agenciesRes.json();
          setMyAgencies(filteredAgencies);
          
          // Continue with screens fetch...
          const screensRes = await fetch("/api/backend/screens", { cache: "no-store" });
          if (screensRes.ok) {
             const allScreens = await screensRes.json();
             const agencyIds = new Set(filteredAgencies.map((a: { _id: any; id: any }) => a._id || a.id));
             const filteredScreens = allScreens.filter((s: any) => agencyIds.has(s.agencyId));
             setScreens(filteredScreens);
          }
        }

      const contentRes = await fetch("/api/backend/content", { cache: "no-store" });
      if (contentRes.ok) {
        const contentData = await contentRes.json();
        setContents(contentData);
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
      const res = await fetch(`/api/backend/screens/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      
      // Log deletion
      const user = userData || {};
      await fetch("/api/backend/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    const agencyId = screen.agencyId || (screen.agency?._id || screen.agency?.id) || '';
    setFormData({ 
      name: screen.name || '', 
      agencyId: String(agencyId), 
      location: screen.location || '' 
    });
    setIsModalOpen(true);
  };

  const openContentModal = async (screen: any) => {
    setScreenForContent(screen);
    setIsContentModalOpen(true);
    setSelectedContentIds([]);
    try {
      const res = await fetch(`/api/backend/screens/${screen._id || screen.id}/content`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSelectedContentIds((data || []).map((c: any) => c?._id || c?.id).filter(Boolean));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleContentSelection = (contentId: string) => {
    setSelectedContentIds((prev) =>
      prev.includes(contentId) ? prev.filter((id) => id !== contentId) : [...prev, contentId]
    );
  };

  const openDetailsModal = async (screen: any) => {
    setScreenForContent(screen);
    setIsDetailsModalOpen(true);
    try {
      const res = await fetch(`/api/backend/screens/${screen._id || screen.id}/content`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCurrentPlaylist(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePlaylist = async () => {
    if (!screenForContent) return;
    const screenId = screenForContent._id || screenForContent.id;
    
    const playlist = currentPlaylist.map(item => ({
      contentId: item._id || item.id,
      duration: parseInt(item.duration) || 10
    }));

    setIsAssigningContent(true);
    try {
      const res = await fetch(`/api/backend/screens/${screenId}/playlist`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlist }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour de la playlist");
      alert("Playlist mise à jour !");
      setIsDetailsModalOpen(false);
      fetchData(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAssigningContent(false);
    }
  };

  const applyContentAction = async (mode: "replace" | "add" | "remove") => {
    if (!screenForContent) return;
    if (selectedContentIds.length === 0) {
      alert("Veuillez sélectionner au moins un contenu.");
      return;
    }
    const screenId = screenForContent._id || screenForContent.id;
    const endpoint =
      mode === "replace"
        ? `/api/backend/screens/${screenId}/content`
        : mode === "add"
          ? `/api/backend/screens/${screenId}/content/add`
          : `/api/backend/screens/${screenId}/content/remove`;

    setIsAssigningContent(true);
    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentIds: selectedContentIds }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour");
      alert("Assignation mise à jour.");
    } catch (err: any) {
      alert(err?.message || "Échec de l'assignation.");
    } finally {
      setIsAssigningContent(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/backend/screens/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
      
      // Log modification
      const user = userData || {};
      await fetch("/api/backend/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
            <div key={screen.id || screen._id} className="soft-card overflow-hidden group border-border transition-all hover:-translate-y-1 duration-300">
               {/* Card Header (Preview) */}
               <div className="relative h-40 bg-muted/40 overflow-hidden border-b border-border">
                {screen.thumbnail ? (
                  <img src={`http://localhost:3001${screen.thumbnail}`} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-700" alt="Screen preview" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 group-hover:scale-110 transition-transform duration-700">
                     <Layers size={48} />
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 opacity-50">Aucun Flux</p>
                  </div>
                )}
                
                {/* Status Badge Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-border">
                   <div className={`h-1.5 w-1.5 rounded-full ${screen.status === 'Online' || screen.status === 'online' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
                   <span className="text-[9px] font-bold text-foreground uppercase tracking-wider">{screen.status}</span>
                </div>
               </div>

               <div className="p-6">
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
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Code de Jumelage</p>
                       <p className={`text-xs font-mono mt-1 ${!screen.isPaired ? 'text-primary font-bold' : 'text-muted-foreground opacity-50'}`}>
                         {screen.pairingCode || "---"}
                       </p>
                     </div>
                     <div className="text-right">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">S/N</p>
                       <p className="text-xs text-foreground font-mono mt-1 truncate">{screen.serialNumber || "Non lié"}</p>
                     </div>
                  </div>

                  <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Dernier Heartbeat</p>
                       <p className="text-xs text-foreground font-medium mt-1">{screen.lastSeen || "Maintenant"}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Adresse IP</p>
                       <p className="text-xs text-muted-foreground font-mono mt-1">{screen.ip || "0.0.0.0"}</p>
                     </div>
                  </div>
                  
                  <button 
                    onClick={() => openDetailsModal(screen)}
                    className="w-full mt-4 py-3 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition-all border border-border hover:border-primary/20 flex items-center justify-center gap-2"
                  >
                     Détails & Playlist <ChevronRight size={14} />
                  </button>
               </div>
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
                    <div className="grid grid-cols-1 gap-6">
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

      {isContentModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => !isAssigningContent && setIsContentModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Gérer contenus de l'écran</h3>
                <p className="text-xs text-muted-foreground mt-1">{screenForContent?.name || "Écran"}</p>
              </div>
              <button onClick={() => !isAssigningContent && setIsContentModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 max-h-[420px] overflow-y-auto space-y-2">
              {contents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun contenu disponible.</p>
              ) : (
                contents.map((content: any) => {
                  const id = content._id || content.id;
                  const checked = selectedContentIds.includes(id);
                  return (
                    <label key={id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors cursor-pointer">
                      <input type="checkbox" checked={checked} onChange={() => toggleContentSelection(id)} className="h-4 w-4 accent-[var(--primary)]" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{content.title || "Sans titre"}</p>
                        <p className="text-[11px] text-muted-foreground uppercase">{content.type || "unknown"}</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
            <div className="p-6 border-t border-border bg-muted/20 flex flex-wrap justify-end gap-2">
              <button type="button" disabled={isAssigningContent} onClick={() => applyContentAction("remove")} className="px-4 py-2 rounded-xl text-sm font-medium border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50">Retirer</button>
              <button type="button" disabled={isAssigningContent} onClick={() => applyContentAction("add")} className="px-4 py-2 rounded-xl text-sm font-medium border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 transition-colors disabled:opacity-50">Ajouter</button>
              <button type="button" disabled={isAssigningContent} onClick={() => applyContentAction("replace")} className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2">
                {isAssigningContent ? <Loader2 size={14} className="animate-spin" /> : null}
                Remplacer
              </button>
            </div>
          </div>
        </div>
      )}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => !isAssigningContent && setIsDetailsModalOpen(false)} />
          <div className="relative w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  screenForContent?.status === 'Online' || screenForContent?.status === 'online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
                }`}>
                  <MonitorSmartphone size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{screenForContent?.name}</h3>
                  <p className="text-xs text-muted-foreground">Configuration de la diffusion</p>
                </div>
              </div>
              <button onClick={() => !isAssigningContent && setIsDetailsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Technical Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Statut</p>
                  <p className="text-sm font-bold mt-1 flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${screenForContent?.status === 'Online' || screenForContent?.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {screenForContent?.status}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Adresse IP</p>
                  <p className="text-sm font-mono mt-1">{screenForContent?.ip || "---"}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">S/N</p>
                  <p className="text-sm font-mono mt-1 truncate">{screenForContent?.serialNumber || "---"}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Contenus</p>
                  <p className="text-sm font-bold mt-1">{currentPlaylist.length} Médias</p>
                </div>
              </div>

              {/* Playlist Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Layers size={14} /> Playlist & Séquençage
                  </h4>
                  {currentPlaylist.length === 1 && (
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20">
                      DIFFUSION PERMANENTE
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {currentPlaylist.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl text-muted-foreground">
                      <FileVideo size={40} className="opacity-20 mb-3" />
                      <p className="text-sm">Aucun contenu assigné à cet écran.</p>
                    </div>
                  ) : (
                    currentPlaylist.map((item, idx) => (
                      <div key={item._id || item.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 transition-colors">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border">
                          {item.imageBase64 ? (
                            <img src={`http://localhost:3001${item.imageBase64}`} className="w-full h-full object-cover" alt="" />
                          ) : item.type === 'video' ? (
                            <Activity size={20} className="text-primary" />
                          ) : (
                            <Globe size={20} className="text-primary" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.type}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-end">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Durée (sec)</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                min="1"
                                value={item.duration || 10}
                                onChange={(e) => {
                                  const newVal = parseInt(e.target.value);
                                  const nextP = [...currentPlaylist];
                                  nextP[idx].duration = newVal;
                                  setCurrentPlaylist(nextP);
                                }}
                                disabled={currentPlaylist.length <= 1}
                                className="w-20 bg-muted border border-border rounded-lg px-3 py-1.5 text-sm font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                              />
                              <span className="text-xs font-bold text-muted-foreground">s</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => {
                              const nextP = currentPlaylist.filter((_, i) => i !== idx);
                              setCurrentPlaylist(nextP);
                            }}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                            title="Retirer de la playlist"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Content Section */}
              <div className="space-y-4 pt-8 border-t border-border">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Plus size={14} /> Ajouter du contenu à la playlist
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {contents.filter(c => !currentPlaylist.some(p => (p._id || p.id) === (c._id || c.id))).map((content) => (
                    <button
                      key={content._id || content.id}
                      onClick={() => {
                        const newItem = { ...content, duration: 30 };
                        setCurrentPlaylist([...currentPlaylist, newItem]);
                      }}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all"
                    >
                      {content.imageBase64 ? (
                        <img src={`http://localhost:3001${content.imageBase64}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      ) : (
                        <div className="w-full h-full bg-muted flex flex-col items-center justify-center p-2 text-center">
                          <Activity size={24} className="text-primary mb-1" />
                          <p className="text-[9px] font-bold truncate w-full">{content.title}</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Plus className="text-white drop-shadow-lg" size={32} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                Fermer
              </button>
              <button 
                onClick={handleUpdatePlaylist}
                disabled={isAssigningContent || currentPlaylist.length === 0}
                className="px-8 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isAssigningContent ? <Loader2 size={16} className="animate-spin" /> : null}
                Appliquer la Playlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

