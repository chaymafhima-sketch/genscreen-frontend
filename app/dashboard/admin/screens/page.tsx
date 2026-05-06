"use client";

import { useEffect, useState } from "react";
import { 
  MonitorSmartphone, 
  Plus, 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  RefreshCcw, 
  Activity,
  Globe,
  Wifi,
  WifiOff,
  Layers,
  Building2,
  Edit2,
  Trash2,
  FileVideo,
  ChevronRight
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";

export default function ScreensPage() {
  const { t } = useLanguage();
  const [screens, setScreens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [etablissements, setEtablissements] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAssigningContent, setIsAssigningContent] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<any[]>([]);
  const [screenForContent, setScreenForContent] = useState<any>(null);
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({ name: '', etablissementId: '', location: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [screenToDelete, setScreenToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchScreens = async () => {
    try {
      const res = await fetch("/api/backend/screens", { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur de récupération des écrans");
      const data = await res.json();
      setScreens(data);
    } catch (err: any) {
      setError("Impossible de charger les écrans.");
    } finally {
      setLoading(false);
    }
  };

  const fetchetablissements = async () => {
    try {
      const res = await fetch("/api/backend/etablissements", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setEtablissements(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContents = async () => {
    try {
      const res = await fetch("/api/backend/content", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setContents(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchScreens();
    fetchetablissements();
    fetchContents();
    const interval = setInterval(fetchScreens, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteClick = (id: string) => {
    setScreenToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!screenToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/backend/screens/${screenToDelete}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      fetchScreens();
      setIsDeleteModalOpen(false);
      setScreenToDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Impossible de supprimer cet écran");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (screen: any) => {
    setEditingId(screen._id || screen.id);
    const etablissementId = screen.etablissementId || (screen.etablissement?._id || screen.etablissement?.id) || '';
    setFormData({ name: screen.name || '', etablissementId: String(etablissementId), location: screen.location || '' });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', etablissementId: '', location: '' });
    setIsModalOpen(true);
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
    const playlist = currentPlaylist.map(item => ({ contentId: item._id || item.id, duration: parseInt(item.duration) || 10 }));
    setIsAssigningContent(true);
    try {
      const res = await fetch(`/api/backend/screens/${screenId}/playlist`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlist }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour");
      toast.success("Playlist mise à jour !");
      setIsDetailsModalOpen(false);
      fetchScreens();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsAssigningContent(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/backend/screens/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      } else {
        res = await fetch("/api/backend/screens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      }
      if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
      setSubmitSuccess(true);
      fetchScreens();
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setFormData({ name: '', etablissementId: '', location: '' });
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
    s.etablissement?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: screens.length,
    online: screens.filter(s => s.status === 'Online' || s.status === 'online').length,
    offline: screens.filter(s => s.status !== 'Online' && s.status !== 'online').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
             {t.screens.title}
             <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">{stats.total} {t.dashboard.stats.registered_screens.toLowerCase()}</span>
          </h1>
          <p className="text-muted-foreground mt-2">{t.screens.subtitle}</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={fetchScreens} className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:rotate-180 duration-500" title={t.common.refresh}>
            <RefreshCcw size={20} />
          </button>
          <button onClick={openAddModal} className="flex-1 md:flex-initial bg-primary hover:opacity-90 text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2">
            <Plus size={18} /> {t.screens.add_button}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><Wifi size={20} /></div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{t.screens.stats.operational}</p>
              <p className="text-xl font-bold text-foreground">{stats.online}</p>
            </div>
         </div>
         <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center"><WifiOff size={20} /></div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{t.screens.stats.offline}</p>
              <p className="text-xl font-bold text-foreground">{stats.offline}</p>
            </div>
         </div>
         <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Activity size={20} /></div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{t.screens.stats.average_flow}</p>
              <p className="text-xl font-bold text-foreground">4.2 Mb/s</p>
            </div>
         </div>
      </div>

      <div className="flex items-center gap-4 bg-muted/40 p-2 rounded-2xl border border-border">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input type="text" placeholder={t.screens.search_placeholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
           <Loader2 className="animate-spin text-primary mb-4" size={32} />
           <p>{t.common.loading}</p>
        </div>
      ) : filteredScreens.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-3xl">
           <MonitorSmartphone size={48} className="mb-4 opacity-20" />
           <p>{t.common.no_data}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScreens.map((screen) => (
            <div key={screen.id || screen._id} className="relative soft-card overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 group">
              <div className="relative h-44 bg-muted/40 overflow-hidden">
                {screen.thumbnail ? (
                  <img src={`http://localhost:3001${screen.thumbnail}`} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" alt="Screen preview" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                     <Layers size={60} />
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 opacity-50">{t.screens.status.no_stream}</p>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border">
                   <div className={`h-2 w-2 rounded-full ${screen.status === 'Online' || screen.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                   <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">{screen.status === 'Online' || screen.status === 'online' ? t.screens.status.online : t.screens.status.offline}</span>
                </div>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => openEditModal(screen)} className="p-1.5 bg-primary/80 backdrop-blur-md rounded-lg border border-primary/30 text-white" title={t.dashboard.edit}><Edit2 size={16} /></button>
                   <button onClick={() => handleDeleteClick(screen._id || screen.id)} className="p-1.5 bg-destructive/80 backdrop-blur-md rounded-lg border border-destructive/30 text-white" title={t.dashboard.delete}><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                 <div className="flex justify-between items-start">
                    <div>
                       <h3 className="text-foreground font-bold tracking-tight">{screen.name}</h3>
                       <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><Building2 size={12} className="text-primary" /> {screen.etablissement?.name || "---"}</p>
                    </div>
                    <div className="px-2 py-1 bg-primary/10 border border-primary/20 rounded-md">
                       <span className="text-[9px] font-black text-primary uppercase">ID: {screen.id?.slice(-4) || screen._id?.slice(-4) || "????"}</span>
                    </div>
                 </div>
                 <button onClick={() => openDetailsModal(screen)} className="w-full mt-2 py-3 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl text-xs font-bold border border-primary/10 flex items-center justify-center gap-2">
                    Détails & Playlist <ChevronRight size={14} />
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => !isSubmitting && setIsModalOpen(false)} />
           <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
                 <h2 className="text-xl font-bold">{editingId ? t.dashboard.edit : t.screens.add_button}</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={24} /></button>
              </div>
              {submitSuccess ? (
                <div className="p-12 text-center animate-in fade-in">
                   <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 mx-auto border border-emerald-500/20"><CheckCircle2 size={32} /></div>
                   <h3 className="text-lg font-bold">{t.dashboard.save}</h3>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">{t.etablissements.table.name}</label>
                      <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border rounded-xl p-3 outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">{t.dashboard.etablissements}</label>
                      <select required value={formData.etablissementId} onChange={(e) => setFormData({...formData, etablissementId: e.target.value})} className="w-full bg-background border border-border rounded-xl p-3 outline-none focus:border-primary">
                        <option value="">{t.common.loading}</option>
                        {etablissements.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                      </select>
                    </div>
                    <div className="pt-4 flex gap-4">
                       <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-muted py-3 rounded-xl font-bold">{t.dashboard.cancel}</button>
                       <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold">{isSubmitting ? t.common.loading : t.dashboard.save}</button>
                    </div>
                </form>
              )}
           </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-destructive mb-2">{t.dashboard.delete}?</h2>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 border border-border rounded-xl font-bold">{t.dashboard.cancel}</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-3 bg-destructive text-white rounded-xl font-bold">{isDeleting ? t.common.loading : t.dashboard.delete}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
