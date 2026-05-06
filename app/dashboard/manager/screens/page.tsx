"use client";

import { useEffect, useState } from "react";
import {
  MonitorSmartphone,
  Activity,
  Wifi,
  WifiOff,
  RefreshCcw,
  Search,
  Building2,
  ChevronRight,
  Layers,
  CheckCircle2,
  Loader2,
  Globe,
  Edit2,
  Trash2,
  X,
  FileVideo,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";

export default function ManagerScreensPage() {
  const { t } = useLanguage();
  const [screens, setScreens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [myetablissements, setMyetablissements] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);

  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", etablissementId: "", location: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [screenForContent, setScreenForContent] = useState<any>(null);
  const [isAssigningContent, setIsAssigningContent] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [screenToDelete, setScreenToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const profileRes = await fetch("/api/backend/users/profile", { cache: "no-store" });
      const user = profileRes.ok ? await profileRes.json() : null;
      if (!user) return;
      setUserData(user);

      const etablissementsRes = await fetch("/api/backend/etablissements", { cache: "no-store" });
      if (etablissementsRes.ok) {
        const filteredetablissements = await etablissementsRes.json();
        setMyetablissements(filteredetablissements);

        const screensRes = await fetch("/api/backend/screens", { cache: "no-store" });
        if (screensRes.ok) {
          const allScreens = await screensRes.json();
          const etablissementIds = new Set(filteredetablissements.map((a: { _id: any; id: any }) => a._id || a.id));
          const filteredScreens = allScreens.filter((s: any) => etablissementIds.has(s.etablissementId));
          setScreens(filteredScreens);
        }
      }

      const contentRes = await fetch("/api/backend/content", { cache: "no-store" });
      if (contentRes.ok) {
        setContents(await contentRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 15000);
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
      fetchData();
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
    const etablissementId = screen.etablissementId || screen.etablissement?._id || screen.etablissement?.id || "";
    setFormData({ name: screen.name || "", etablissementId: String(etablissementId), location: screen.location || "" });
    setIsModalOpen(true);
  };

  const openDetailsModal = async (screen: any) => {
    setScreenForContent(screen);
    setIsDetailsModalOpen(true);
    try {
      const res = await fetch(`/api/backend/screens/${screen._id || screen.id}/content`, { cache: "no-store" });
      if (res.ok) {
        setCurrentPlaylist(await res.json() || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePlaylist = async () => {
    if (!screenForContent) return;
    const screenId = screenForContent._id || screenForContent.id;
    const playlist = currentPlaylist.map((item) => ({ contentId: item._id || item.id, duration: parseInt(item.duration) || 10 }));
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
      fetchData(true);
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
      const res = await fetch(`/api/backend/screens/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
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
    online: screens.filter((s) => s.status === "Online" || s.status === "online").length,
    offline: screens.filter((s) => s.status !== "Online" && s.status !== "online").length,
  };

  const filteredScreens = screens.filter((s) => s.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">{t.screens.title}</h2>
          <p className="text-muted-foreground mt-2">{t.screens.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchData()} className="p-3 bg-muted border border-border text-muted-foreground hover:text-foreground rounded-2xl transition-all active:rotate-180 duration-500 hover:shadow-md" title={t.common.refresh}>
            <RefreshCcw size={20} />
          </button>
          <div className="flex bg-muted/30 border border-border p-1.5 rounded-2xl">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold"><Wifi size={14} /> {stats.online}</div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-xs font-bold ml-1"><WifiOff size={14} /> {stats.offline}</div>
          </div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"><Search size={20} /></div>
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.screens.search_placeholder} className="w-full bg-card border border-border rounded-2xl py-4 pl-14 pr-6 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-sm" />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScreens.map((screen) => (
            <div key={screen.id || screen._id} className="soft-card overflow-hidden group border-border transition-all hover:-translate-y-1 duration-300">
              <div className="relative h-40 bg-muted/40 overflow-hidden border-b border-border">
                {screen.thumbnail ? (
                  <img src={`http://localhost:3001${screen.thumbnail}`} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" alt="Screen preview" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                    <Layers size={48} /><p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 opacity-50">{t.screens.status.no_stream}</p>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-border">
                  <div className={`h-1.5 w-1.5 rounded-full ${screen.status === "Online" || screen.status === "online" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                  <span className="text-[9px] font-bold text-foreground uppercase tracking-wider">{screen.status === "Online" || screen.status === "online" ? t.screens.status.online : t.screens.status.offline}</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${screen.status === "Online" || screen.status === "online" ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"}`}><MonitorSmartphone size={24} /></div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(screen)} className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors border border-primary/20" title={t.dashboard.edit}><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteClick(screen._id || screen.id)} className="p-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl transition-colors border border-destructive/20" title={t.dashboard.delete}><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground tracking-tight">{screen.name}</h3>
                    <div className="flex flex-col gap-1 mt-1">
                      <p className="text-[10px] text-primary font-bold flex items-center gap-1.5 leading-none tracking-tight"><Globe size={11} /> {screen.etablissement?.city || "---"}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Building2 size={12} /> {screen.etablissement?.name || "---"}</p>
                    </div>
                  </div>
                  <button onClick={() => openDetailsModal(screen)} className="w-full mt-4 py-3 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition-all border border-border flex items-center justify-center gap-2">
                    Détails & Playlist <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => !isSubmitting && !submitSuccess && setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-border bg-muted/30 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{t.dashboard.edit}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={24} /></button>
            </div>
            {submitSuccess ? (
              <div className="p-16 text-center animate-in fade-in">
                <div className="h-20 w-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mb-6 border border-emerald-500/20 mx-auto"><CheckCircle2 size={40} /></div>
                <h3 className="text-xl font-bold">{t.dashboard.save}</h3>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t.etablissements.table.name}</label>
                  <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-background border border-border rounded-xl p-3 outline-none focus:border-primary" />
                </div>
                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-muted py-3 rounded-xl font-bold">{t.dashboard.cancel}</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20">{isSubmitting ? t.common.loading : t.dashboard.save}</button>
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
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 bg-destructive text-white rounded-xl font-bold">{isDeleting ? t.common.loading : t.dashboard.delete}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
