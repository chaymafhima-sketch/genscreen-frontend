"use client";

import { MEDIA_BASE } from "@/lib/mediaUrl";

import { useEffect, useState, useRef } from "react";
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
import AIGeneratorPanel from "@/app/components/AIGeneratorPanel";

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
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [createVisualFile, setCreateVisualFile] = useState<File | null>(null);
  const [editVisualFile, setEditVisualFile] = useState<File | null>(null);
  const editVisualRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      // Backend already returns only screens belonging to assigned etablissements
      const screensRes = await fetch("/api/backend/screens", { cache: "no-store" });
      if (screensRes.ok) {
        const myScreens = await screensRes.json();
        setScreens(myScreens);
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
    fetchContents();
  }, []);

  const openEditModal = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setEditingContent(item);
    setEditFormData({ title: item.title || "", message: item.message || "" });
    setEditVisualFile(null);
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

      // If audio with a new visual file, upload it separately
      if (editVisualFile && (editingContent.type?.toLowerCase() === 'audio')) {
        const formData = new FormData();
        formData.append('visual', editVisualFile);
        formData.append('contentId', editingContent._id || editingContent.id);
        await fetch(`/api/backend/content/${editingContent._id || editingContent.id}/visual`, {
          method: "PUT",
          body: formData,
        });
      }

      setIsEditModalOpen(false);
      setEditVisualFile(null);
      fetchContents();
      toast.success("Contenu modifié");
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
      toast.success("Contenu créé");
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
      toast.success("Contenu supprimé");
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
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{t.content.title}</h1>
          <p className="text-muted-foreground mt-2">{t.content.subtitle}</p>
        </div>

        <form onSubmit={handleDiffusion} className="soft-card p-8 shadow-sm relative overflow-hidden flex flex-col h-[600px]">
          {success && (
            <div className="absolute inset-0 bg-emerald-500 z-10 flex flex-col items-center justify-center text-white animate-in slide-in-from-top-full duration-500">
              <CheckCircle2 size={60} className="mb-4" /><h3 className="text-2xl font-bold">{t.dashboard.save}</h3>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative group flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                <input type="text" placeholder={t.content.search_placeholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
              </div>
              <button type="button" onClick={() => setIsAIModalOpen(true)} className="shrink-0 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2 whitespace-nowrap">
                <Sparkles size={16} /> {t.ai.trigger}
              </button>
              <button type="button" onClick={() => setIsCreateModalOpen(true)} className="shrink-0 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2 whitespace-nowrap">
                <Plus size={16} /> {t.content.add_button}
              </button>
              <button type="button" onClick={() => { fetchData(); fetchContents(); }} className="shrink-0 p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:rotate-180 duration-500" title={t.common.refresh}>
                <RefreshCcw size={18} />
              </button>
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
                      {item.imageBase64 ? <img src={`${MEDIA_BASE}${item.imageBase64}`} alt="thumbnail" className="object-cover w-full h-full" /> : getMediaIcon(item.type)}
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

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => !isCreating && setIsCreateModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
              <h2 className="text-xl font-bold">{t.content.add_button}</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={24} /></button>
            </div>

            <form onSubmit={handleCreateContent}>
              <div className="max-h-[450px] overflow-y-auto custom-content-scrollbar">
                <style dangerouslySetInnerHTML={{ __html: `
                  .custom-content-scrollbar::-webkit-scrollbar { width: 8px !important; display: block !important; }
                  .custom-content-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05) !important; }
                  .custom-content-scrollbar::-webkit-scrollbar-thumb { background-color: #ffffff !important; border-radius: 10px !important; }
                  .custom-content-scrollbar { scrollbar-width: thin !important; scrollbar-color: #ffffff rgba(255, 255, 255, 0.05) !important; }
                `}} />
                <div className="space-y-6 p-6 pb-10">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">Nom du contenu</label>
                      <input required type="text" value={createFormData.title} onChange={(e) => setCreateFormData({...createFormData, title: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all" placeholder="Ex: Menu du jour, Promo..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">Type de média</label>
                      <select className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary cursor-pointer transition-all" value={createFormData.type} onChange={(e) => setCreateFormData({...createFormData, type: e.target.value})}>
                        <option value="image">🖼️ Image</option>
                        <option value="video">🎬 Vidéo</option>
                        <option value="audio">🎵 Audio</option>
                        <option value="url">🌐 URL</option>
                        <option value="message">💬 Message</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(createFormData.type === 'image' || createFormData.type === 'video' || createFormData.type === 'audio') && (
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">{createFormData.type === 'audio' ? 'Piste Audio (MP3)' : 'Fichier Source'}</label>
                          <div className="relative group">
                            <input type="file" onChange={(e) => e.target.files && setCreateFile(e.target.files[0])} className="hidden" accept={createFormData.type === 'image' ? 'image/*' : createFormData.type === 'video' ? 'video/*' : 'audio/*'} id="create-file-input" />
                            <label htmlFor="create-file-input" className="w-full bg-muted/20 border-2 border-dashed border-border rounded-xl py-4 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                              <span className="text-[10px] font-medium text-muted-foreground">{createFile ? createFile.name : "Cliquez pour uploader"}</span>
                            </label>
                          </div>
                        </div>

                        {createFormData.type === 'audio' && (
                          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-[11px] font-bold text-success uppercase ml-1 flex items-center gap-1"><Sparkles size={12} /> Visuel d'accompagnement</label>
                            <div className="relative group">
                              <input type="file" onChange={(e) => e.target.files && setCreateVisualFile(e.target.files[0])} className="hidden" accept="image/*,video/*" id="create-visual-input" />
                              <label htmlFor="create-visual-input" className="w-full bg-success/5 border-2 border-dashed border-success/20 rounded-xl py-4 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-success hover:bg-success/10 transition-all">
                                <span className="text-[10px] font-medium text-muted-foreground">{createVisualFile ? createVisualFile.name : "Image ou animation (Optionnel)"}</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {createFormData.type === 'url' && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">Lien de redirection</label>
                        <input required type="url" value={createFormData.url} onChange={(e) => setCreateFormData({...createFormData, url: e.target.value})} placeholder="https://..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary" />
                      </div>
                    )}

                    {createFormData.type === 'message' && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">Message à diffuser</label>
                        <textarea required value={createFormData.message} onChange={(e) => setCreateFormData({...createFormData, message: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary min-h-[100px] resize-none" placeholder="Écrivez votre message ici..." />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-border">
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3.5 border border-border rounded-xl font-bold hover:bg-muted transition-all text-foreground">{t.common.cancel}</button>
                    <button type="submit" disabled={isCreating} className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all">{isCreating ? t.common.loading : t.dashboard.add}</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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

              {/* Visual animation upload — shown only for audio type */}
              {editingContent?.type?.toLowerCase() === 'audio' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[11px] font-bold text-success uppercase ml-1 flex items-center gap-1">
                    <Sparkles size={12} /> Visuel d'accompagnement
                  </label>
                  <input
                    type="file"
                    ref={editVisualRef}
                    onChange={(e) => e.target.files?.[0] && setEditVisualFile(e.target.files[0])}
                    className="hidden"
                    accept="image/*,video/*"
                  />
                  <div
                    onClick={() => editVisualRef.current?.click()}
                    className="w-full bg-success/5 border-2 border-dashed border-success/20 rounded-xl py-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-success hover:bg-success/10 transition-all group"
                  >
                    <ImageIcon className="text-success/50 group-hover:text-success" size={24} />
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {editVisualFile ? editVisualFile.name : "Image ou animation (Optionnel)"}
                    </span>
                  </div>
                </div>
              )}
              <div className="pt-4 flex gap-3 border-t border-border mt-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3.5 border border-border rounded-xl font-bold hover:bg-muted transition-all text-foreground">{t.dashboard.cancel}</button>
                <button type="submit" disabled={isUpdating} className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all">{isUpdating ? t.common.loading : t.dashboard.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAIModalOpen && (
        <AIGeneratorPanel
          onUse={async (url, type, title) => {
            try {
              const response = await fetch(url);
              const blob = await response.blob();
              const ext = type === "image" ? "jpg" : "mp4";
              const mimeType = type === "image" ? "image/jpeg" : "video/mp4";
              const file = new File([blob], `ia-generated.${ext}`, { type: mimeType });
              setCreateFile(file);
              setCreateFormData((prev: any) => ({
                ...prev,
                type,
                title: title?.trim() || `IA — ${new Date().toLocaleDateString("fr-FR")}`,
              }));
              setIsAIModalOpen(false);
              setIsCreateModalOpen(true);
              toast.success(t.ai.ready);
            } catch {
              toast.error("Erreur lors de l'utilisation du contenu IA");
            }
          }}
          onClose={() => setIsAIModalOpen(false)}
        />
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => !isDeleting && setIsDeleteModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 flex flex-col items-center text-center">
            <div className="h-20 w-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
              <Trash2 size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground mb-2">
              {t.dashboard.delete} ?
            </h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer ce contenu ?
            </p>
            <div className="flex gap-4 w-full">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3.5 border border-border rounded-xl font-bold hover:bg-muted transition-all text-foreground">{t.dashboard.cancel}</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-3.5 border border-border text-foreground rounded-xl font-bold hover:bg-muted transition-all disabled:opacity-50">
                {isDeleting ? t.common.loading : t.dashboard.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
