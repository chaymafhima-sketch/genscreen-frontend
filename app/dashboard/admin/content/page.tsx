"use client";

import { useEffect, useState, useRef } from "react";
import { FileVideo, Search, Loader2, AlertCircle, PlayCircle, Clock, Video, Image as ImageIcon, Plus, X, UploadCloud, FileText, Edit2, Trash2, Globe, MessageSquare, RefreshCcw, Music, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";

export default function ContentPage() {
  const { t } = useLanguage();
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({ title: '', type: 'image', url: '', message: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [screens, setScreens] = useState<any[]>([]);
  const [contentAssignedScreensMap, setContentAssignedScreensMap] = useState<Record<string, any[]>>({});
  const [selectedScreenIds, setSelectedScreenIds] = useState<string[]>([]);
  const [assigningContentId, setAssigningContentId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedVisualFile, setSelectedVisualFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const visualInputRef = useRef<HTMLInputElement>(null);

  const fetchContents = async () => {
    try {
      const res = await fetch("/api/backend/content", { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur de récupération des contenus");
      const data = await res.json();
      setContents(data);
    } catch (err: any) {
      setError(err.message || "Erreur de connexion serveur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContents(); }, []);

  const fetchScreens = async () => {
    try {
      const res = await fetch("/api/backend/screens", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setScreens(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchScreens(); }, []);

  const fetchContentAssignments = async () => {
    try {
      if (!contents.length) {
        setContentAssignedScreensMap({});
        return;
      }

      const map: Record<string, any[]> = {};
      await Promise.all(
        contents.map(async (content: any) => {
          const contentId = content._id || content.id;
          if (!contentId) return;
          const res = await fetch(`/api/backend/screens/content/${contentId}/assigned`, { cache: "no-store" });
          if (res.ok) {
            map[contentId] = await res.json();
          }
        })
      );
      setContentAssignedScreensMap(map);
    } catch (err) {
      console.error(err);
      setContentAssignedScreensMap({});
    }
  };

  useEffect(() => {
    fetchContentAssignments();
  }, [screens, contents]);

  const handleSaveAssignedTvs = async () => {
    if (!assigningContentId) return;

    const currentlyAssigned = (contentAssignedScreensMap[assigningContentId] || [])
      .map((s: any) => s._id || s.id)
      .filter(Boolean);
    const toAdd = selectedScreenIds.filter((id) => !currentlyAssigned.includes(id));
    const toRemove = currentlyAssigned.filter((id: string) => !selectedScreenIds.includes(id));

    setIsAssigning(true);
    try {
      await Promise.all([
        ...toAdd.map((screenId) =>
          fetch(`/api/backend/screens/${screenId}/content/add`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contentIds: [assigningContentId] }),
          }).then((res) => {
            if (!res.ok) throw new Error(`Échec d'assignation sur l'écran ${screenId}`);
          })
        ),
        ...toRemove.map((screenId) =>
          fetch(`/api/backend/screens/${screenId}/content/remove`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contentIds: [assigningContentId] }),
          }).then((res) => {
            if (!res.ok) throw new Error(`Échec de retrait sur l'écran ${screenId}`);
          })
        ),
      ]);

      await fetchContentAssignments();
      toast.success("TVs assignées mises à jour.");
      setAssigningContentId(null);
      setSelectedScreenIds([]);
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l'assignation.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setContentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!contentToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/backend/content/${contentToDelete}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      fetchContents();
      setIsDeleteModalOpen(false);
      setContentToDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Impossible de supprimer ce contenu");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleVisualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedVisualFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let res;
      const contentType = formData.type.toLowerCase();

      if (editingId) {
        res = await fetch(`/api/backend/content/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            type: formData.type,
            url: formData.url,
            message: formData.message
          })
        });
      } else if (contentType === 'url') {
        res = await fetch("/api/backend/content/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: formData.title, type: 'url', url: formData.url || '' })
        });
      } else if (contentType === 'message') {
        res = await fetch("/api/backend/content/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: formData.title, type: 'message', message: formData.message || '' })
        });
      } else {
        if (!selectedFile) { setIsSubmitting(false); return; }
        const data = new FormData();
        data.append('file', selectedFile);
        data.append('title', formData.title);
        data.append('type', formData.type);
        if (selectedVisualFile) {
          data.append('visual', selectedVisualFile);
        }
        res = await fetch("/api/backend/content/upload", {
          method: "POST",
          body: data
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors de la création");
      }
      
      setSubmitSuccess(true);
      fetchContents();
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setFormData({ title: '', type: 'image', url: '', message: '' });
        setSelectedFile(null);
        setSelectedVisualFile(null);
        setEditingId(null);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    const currentStatus = status || "desactive"; 
    switch (currentStatus) {
      case "active":
        return (
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <PlayCircle size={12} /> {t.content.table.active}
          </span>
        );
      case "desactive":
        return (
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <X size={12} /> {t.content.table.inactive}
          </span>
        );
      default:
        return (
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Clock size={12} /> {currentStatus}
          </span>
        );
    }
  };

  const getMediaIcon = (type?: string) => {
    const typeLower = type?.toLowerCase();
    if (typeLower?.includes("video")) return <Video size={20} className="text-purple-400" />;
    if (typeLower?.includes("url")) return <Globe size={20} className="text-cyan-400" />;
    if (typeLower?.includes("message")) return <MessageSquare size={20} className="text-amber-400" />;
    if (typeLower?.includes("audio")) return <Music size={20} className="text-emerald-400" />;
    return <ImageIcon size={20} className="text-blue-400" />;
  };

  const filteredContents = contents.filter(item => 
    (item.title || "Contenu sans nom").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.type || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ title: '', type: 'image', url: '', message: '' });
    setSelectedFile(null);
    setSelectedVisualFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item._id || item.id);
    setFormData({ title: item.title || '', type: item.type || 'image', url: item.url || '', message: item.message || '' });
    setSelectedFile(null);
    setSelectedVisualFile(null);
    setIsModalOpen(true);
  };

  const openAssignTvsModal = (contentId: string) => {
    const preselected = (contentAssignedScreensMap[contentId] || [])
      .map((s: any) => s._id || s.id)
      .filter(Boolean);
    setAssigningContentId(contentId);
    setSelectedScreenIds(preselected);
  };

  const isFileType = formData.type.toLowerCase() === 'image' || formData.type.toLowerCase() === 'video' || formData.type.toLowerCase() === 'audio';

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.content.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t.content.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchContents} className="p-2.5 rounded-xl border border-border text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 transition-all active:rotate-180 duration-500" title={t.common.refresh}>
            <RefreshCcw size={20} />
          </button>
          <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2">
            <Plus size={18} /> {t.content.add_button}
          </button>
        </div>
      </div>

      <div className="soft-card overflow-hidden min-h-[400px] flex flex-col transition-colors">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input type="text" placeholder={t.content.search_placeholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{filteredContents.length} {t.content.title.toLowerCase()}</span>
        </div>

        <div className="flex-1 p-0">
          {loading ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-muted-foreground">
              <Loader2 className="animate-spin text-primary mb-4" size={32} />
              <p>{t.common.loading}</p>
            </div>
          ) : error ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-destructive">
              <AlertCircle size={32} className="mb-4" />
              <p>{error}</p>
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-muted-foreground">
              <FileVideo size={48} className="mb-4 opacity-50" />
              <p>{t.common.no_data}</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-muted/50 text-xs uppercase font-medium text-muted-foreground border-b border-border transition-colors">
                <tr>
                  <th scope="col" className="px-6 py-4">{t.content.table.media}</th>
                  <th scope="col" className="px-6 py-4">{t.content.table.status}</th>
                  <th scope="col" className="px-6 py-4">{t.content.table.assigned_tvs}</th>
                  <th scope="col" className="px-6 py-4">{t.content.table.created_at}</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border transition-colors">
                {filteredContents.map((item: any) => {
                  const contentId = item._id || item.id;
                  const assignedScreens = contentAssignedScreensMap[contentId] || [];
                  return (
                  <tr key={contentId} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200 flex items-center gap-4">
                       <div className="h-12 w-16 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 flex items-center justify-center rounded-lg shadow-inner overflow-hidden relative">
                         {item.imageBase64 ? (
                           <img src={`http://localhost:3001${item.imageBase64}`} alt="thumbnail" className="object-cover w-full h-full opacity-60" />
                         ) : (
                           getMediaIcon(item.type)
                         )}
                       </div>
                      <div className="flex flex-col flex-1">
                         <span>{item.title || "---"}</span>
                         <span className="text-xs text-slate-500 font-normal uppercase tracking-wider">{item.type || "---"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4">
                      {assignedScreens.length === 0 ? (
                        <span className="text-xs text-muted-foreground">{t.content.table.no_tv}</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {assignedScreens.slice(0, 2).map((screen: any) => (
                            <span key={screen._id || screen.id} className="px-2 py-1 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                              {screen.name || "TV"}
                            </span>
                          ))}
                          {assignedScreens.length > 2 ? (
                            <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                              +{assignedScreens.length - 2}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "---"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 flex items-center justify-end">
                     <button onClick={() => openAssignTvsModal(contentId)} className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20" title={t.content.table.assigned_tvs}>
                        <PlayCircle size={16} />
                     </button>
                     <button onClick={() => openEditModal(item)} className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20" title={t.dashboard.edit}>
                        <Edit2 size={16} />
                     </button>
                     <button onClick={() => handleDeleteClick(item._id || item.id)} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20" title={t.dashboard.delete}>
                        <Trash2 size={16} />
                     </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold">{editingId ? t.dashboard.edit : t.content.add_button}</h2>
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500"><X size={20} /></button>
            </div>

            {submitSuccess ? (
              <div className="p-12 text-center animate-in fade-in">
                <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4 mx-auto border border-emerald-500/20"><UploadCloud size={32} /></div>
                <h3 className="text-lg font-bold">{t.dashboard.save}</h3>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">{t.etablissements.table.name}</label>
                  <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Type</label>
                  <select className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="image">🖼️ Image</option>
                    <option value="video">🎬 Vidéo</option>
                    <option value="url">🌐 URL</option>
                    <option value="message">💬 Message</option>
                  </select>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:opacity-90 disabled:opacity-50 transition-all mt-4">
                  {isSubmitting ? t.common.loading : t.dashboard.save}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-red-600 mb-2">{t.dashboard.delete}?</h2>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 border border-border rounded-xl font-bold">{t.dashboard.cancel}</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 bg-red-600 text-white rounded-xl font-bold">{isDeleting ? t.common.loading : t.dashboard.delete}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
