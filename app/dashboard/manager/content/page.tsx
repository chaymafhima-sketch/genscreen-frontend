"use client";

import { useEffect, useState } from "react";
import {
  Send,
  FileVideo,
  Globe,
  MonitorSmartphone,
  CheckCircle2,
  Loader2,
  PlayCircle,
  Image as ImageIcon,
  MessageSquare,
  Video,
  RefreshCcw,
  Edit2,
  X,
  Search,
  Plus,
  Trash2,
  Music,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";

export default function ManagerContentPage() {
  const { t } = useLanguage();
  const [screens, setScreens] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | "">("");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingContents, setLoadingContents] = useState(true);
  const [isDiffusing, setIsDiffusing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({ title: "", message: "" });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<any>({ title: "", type: "message", url: "", message: "" });
  const [createFile, setCreateFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createVisualFile, setCreateVisualFile] = useState<File | null>(null);

  const fetchData = async () => {
    try {
      const profileRes = await fetch("/api/backend/users/profile", { cache: "no-store" });
      const user = profileRes.ok ? await profileRes.json() : null;
      if (!user) return;
      setUserData(user);

      const etablissementsRes = await fetch("/api/backend/etablissements", { cache: "no-store" });
      let myetablissementIds = new Set<string>();
      if (etablissementsRes.ok) {
        const filteredetablissements = await etablissementsRes.json();
        myetablissementIds = new Set(filteredetablissements.map((a: { _id: any; id: any }) => a._id || a.id));
      }

      const screensRes = await fetch("/api/backend/screens", { cache: "no-store" });
      if (screensRes.ok) {
        const allScreens = await screensRes.json();
        setScreens(allScreens.filter((s: any) => myetablissementIds.has(s.etablissementId)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContents = async () => {
    try {
      setLoadingContents(true);
      const res = await fetch("/api/backend/content", { cache: "no-store" });
      if (res.ok) {
        setContents(await res.json() || []);
      }
    } catch (err) {
      console.error("Failed to fetch contents", err);
    } finally {
      setLoadingContents(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (userData) fetchContents();
  }, [userData]);

  const openEditModal = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setEditingContent(item);
    setEditFormData({ title: item.title || "", message: item.message || "" });
    setIsEditModalOpen(true);
  };

  const handleUpdateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/backend/content/${editingContent._id || editingContent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      if (!res.ok) throw new Error("Erreur");
      setIsEditModalOpen(false);
      fetchContents();
    } catch (err) {
      toast.error("Impossible de mettre à jour");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleScreen = (id: string) => {
    setSelectedScreens((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const handleDiffusion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedScreens.length === 0) {
      toast.error("Sélectionnez un écran");
      return;
    }
    if (!selectedContentId) {
      toast.error("Sélectionnez un contenu");
      return;
    }

    setIsDiffusing(true);
    try {
      await Promise.all(selectedScreens.map((screenId) =>
        fetch(`/api/backend/screens/${screenId}/content/add`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentIds: [selectedContentId] }),
        })
      ));

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedScreens([]);
        setSelectedContentId(null);
        setDuration("");
      }, 3000);
    } catch (err) {
      toast.error("Erreur diffusion");
    } finally {
      setIsDiffusing(false);
    }
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      let res: Response;
      const type = (createFormData.type || "").toLowerCase();
      if (type === "url" || type === "message") {
        res = await fetch("/api/backend/content/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: createFormData.title, type, url: type === "url" ? createFormData.url : undefined, message: type === "message" ? createFormData.message : undefined }),
        });
      } else {
        if (!createFile) throw new Error("Fichier requis");
        const data = new FormData();
        data.append("file", createFile);
        data.append("title", createFormData.title);
        data.append("type", createFormData.type);
        if (createVisualFile) data.append("visual", createVisualFile);
        res = await fetch("/api/backend/content/upload", { method: "POST", body: data });
      }

      if (!res.ok) throw new Error("Erreur création");
      setIsCreateModalOpen(false);
      setCreateFormData({ title: "", type: "message", url: "", message: "" });
      setCreateFile(null);
      fetchContents();
    } catch (err: any) {
      toast.error(err?.message || "Erreur");
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!contentToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/backend/content/${contentToDelete}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur");
      fetchContents();
      setIsDeleteModalOpen(false);
      setContentToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || "Erreur");
    } finally {
      setIsDeleting(false);
    }
  };

  const getMediaIcon = (type?: string) => {
    const tLower = type?.toLowerCase();
    if (tLower?.includes("video")) return <Video size={20} className="text-purple-400" />;
    if (tLower?.includes("url")) return <Globe size={20} className="text-cyan-400" />;
    if (tLower?.includes("message")) return <MessageSquare size={20} className="text-amber-400" />;
    if (tLower?.includes("audio")) return <Music size={20} className="text-emerald-400" />;
    return <ImageIcon size={20} className="text-blue-400" />;
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-700">
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{t.content.title}</h1>
            <p className="text-muted-foreground mt-2">{t.content.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setIsCreateModalOpen(true)} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2">
              <Plus size={16} /> {t.content.add_button}
            </button>
            <button type="button" onClick={() => { fetchData(); fetchContents(); }} className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:rotate-180 duration-500" title={t.common.refresh}>
              <RefreshCcw size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleDiffusion} className="soft-card p-8 shadow-sm relative overflow-hidden flex flex-col h-[600px]">
          {success && (
            <div className="absolute inset-0 bg-emerald-500 z-10 flex flex-col items-center justify-center text-white animate-in slide-in-from-top-full duration-500">
              <CheckCircle2 size={60} className="mb-4" /><h3 className="text-2xl font-bold">{t.dashboard.save}</h3>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold text-foreground">{t.content.title}</h3>
            <div className="relative group flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
              <input type="text" placeholder={t.content.search_placeholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-10 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {loadingContents ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground"><Loader2 className="animate-spin text-primary mb-4" size={32} /></div>
            ) : contents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground"><FileVideo size={48} className="mb-4 opacity-50" /><p>{t.common.no_data}</p></div>
            ) : (
              contents.filter((item) => (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || (item.type || "").toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                <div key={item._id || item.id} onClick={() => setSelectedContentId(prev => prev === (item._id || item.id) ? null : (item._id || item.id))} className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between group ${selectedContentId === (item._id || item.id) ? "bg-primary/10 border-primary/50 shadow-md" : "bg-background border-border hover:border-primary/30"}`}>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-16 bg-muted/50 border border-border flex items-center justify-center rounded-lg overflow-hidden relative">
                      {item.imageBase64 ? <img src={`http://localhost:3001${item.imageBase64}`} alt="thumbnail" className="object-cover w-full h-full" /> : getMediaIcon(item.type)}
                      {(item.videoUrl && item.type !== "audio") && <PlayCircle size={16} className="absolute text-white" />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold transition-colors ${selectedContentId === (item._id || item.id) ? "text-primary" : "text-foreground"}`}>{item.title || "---"}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{item.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={(e) => openEditModal(e, item)} className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors border border-primary/20 opacity-0 group-hover:opacity-100"><Edit2 size={14} /></button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setContentToDelete(item._id || item.id); setIsDeleteModalOpen(true); }} className="p-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors border border-destructive/20 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedContentId === (item._id || item.id) ? "bg-primary border-primary" : "bg-transparent border-border"}`}>
                      {selectedContentId === (item._id || item.id) && <CheckCircle2 size={14} className="text-primary-foreground" />}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            <label className="text-sm font-bold text-foreground">Écran(s)</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {screens.map((screen) => (
                <div key={screen._id || screen.id} onClick={() => handleToggleScreen(screen._id || screen.id)} className={`p-3 rounded-xl cursor-pointer border flex items-center gap-3 transition-all ${selectedScreens.includes(screen._id || screen.id) ? "bg-primary/10 border-primary/50" : "bg-background border-border hover:border-primary/30"}`}>
                  <MonitorSmartphone size={16} />
                  <span className="text-sm font-medium">{screen.name || "---"}</span>
                  <div className={`ml-auto h-4 w-4 rounded-full border-2 ${selectedScreens.includes(screen._id || screen.id) ? "bg-primary border-primary" : "border-border"}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Durée (secondes)</label>
              <input type="number" min="1" placeholder="Ex: 30" value={duration} onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : "")} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground" />
            </div>
            <button type="submit" disabled={isDiffusing || selectedScreens.length === 0 || !duration || Number(duration) <= 0} className="w-full bg-primary text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3">
              {isDiffusing ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />} {t.content.add_button}
            </button>
          </div>
        </form>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => !isUpdating && setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-start">
              <h2 className="text-xl font-bold">{t.dashboard.edit}</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateContent} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase">{t.etablissements.table.name}</label>
                <input required value={editFormData.title} onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })} className="w-full bg-background border border-border rounded-xl p-3 outline-none focus:border-primary" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-muted py-2.5 rounded-xl font-semibold">{t.dashboard.cancel}</button>
                <button type="submit" disabled={isUpdating} className="flex-1 bg-primary text-white py-2.5 rounded-xl font-semibold">{isUpdating ? t.common.loading : t.dashboard.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => !isDeleting && setIsDeleteModalOpen(false)} />
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
