"use client";

import { useEffect, useState, useRef } from "react";
import { FileVideo, Search, Loader2, AlertCircle, PlayCircle, Clock, Video, Image as ImageIcon, Plus, X, UploadCloud, FileText, Edit2, Trash2, Globe, MessageSquare, RefreshCcw } from "lucide-react";

export default function ContentPage() {
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      alert("TVs assignées mises à jour.");
      setAssigningContentId(null);
      setSelectedScreenIds([]);
    } catch (err: any) {
      alert(err?.message || "Erreur lors de l'assignation.");
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
      alert(err.message || "Impossible de supprimer ce contenu");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let res;
      const contentType = formData.type.toLowerCase();

      if (editingId) {
        // Pour la modification, on envoie du JSON pour mettre à jour les textes/noms
        // Si un fichier est sélectionné, on pourrait gérer l'upload, mais ici on se concentre sur les textes
        res = await fetch(`/api/backend/content/${editingId}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json"
          },
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
            <PlayCircle size={12} /> Actif
          </span>
        );
      case "desactive":
        return (
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <X size={12} /> désactivé
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
    const t = type?.toLowerCase();
    if (t?.includes("video")) return <Video size={20} className="text-purple-400" />;
    if (t?.includes("url")) return <Globe size={20} className="text-cyan-400" />;
    if (t?.includes("message")) return <MessageSquare size={20} className="text-amber-400" />;
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
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item._id || item.id);
    setFormData({ title: item.title || '', type: item.type || 'image', url: item.url || '', message: item.message || '' });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const openAssignTvsModal = (contentId: string) => {
    const preselected = (contentAssignedScreensMap[contentId] || [])
      .map((s: any) => s._id || s.id)
      .filter(Boolean);
    setAssigningContentId(contentId);
    setSelectedScreenIds(preselected);
  };

  const isFileType = formData.type.toLowerCase() === 'image' || formData.type.toLowerCase() === 'video';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Contenus Média</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Bibliothèque de tous vos médias, campagnes et annonces.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchContents}
            className="p-2.5 rounded-xl border border-border text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:rotate-180 duration-500"
            title="Rafraîchir"
          >
            <RefreshCcw size={20} />
          </button>
          <button 
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
          >
            <Plus size={18} /> Ajouter un contenu
          </button>
        </div>
      </div>

      <div className="soft-card overflow-hidden min-h-[400px] flex flex-col transition-colors shadow-none">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30 transition-colors">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un contenu..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
            />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{filteredContents.length} contenus au total</span>
        </div>

        <div className="flex-1 p-0">
          {loading ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-muted-foreground">
              <Loader2 className="animate-spin text-primary mb-4" size={32} />
              <p>Chargement des contenus...</p>
            </div>
          ) : error ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-destructive">
              <AlertCircle size={32} className="mb-4" />
              <p>{error}</p>
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-muted-foreground">
              <FileVideo size={48} className="mb-4 opacity-50" />
              <p>{searchQuery ? "Aucun contenu ne correspond à votre recherche." : "Votre bibliothèque est vide."}</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-muted/50 text-xs uppercase font-medium text-muted-foreground border-b border-border transition-colors">
                <tr>
                  <th scope="col" className="px-6 py-4">Média</th>
                  <th scope="col" className="px-6 py-4">Statut</th>
                  <th scope="col" className="px-6 py-4">Détails</th>
                  <th scope="col" className="px-6 py-4">TVs assignées</th>
                  <th scope="col" className="px-6 py-4">Créé le</th>
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
                       <div className="h-12 w-16 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center rounded-lg shadow-inner overflow-hidden relative transition-colors">
                         {item.imageBase64 ? (
                           <img src={`http://localhost:3001${item.imageBase64}`} alt="thumbnail" className="object-cover w-full h-full opacity-60" />
                         ) : (
                           getMediaIcon(item.type)
                         )}
                         {item.videoUrl && <PlayCircle size={16} className="absolute text-white drop-shadow-md" />}
                       </div>
                      <div className="flex flex-col flex-1">
                         <span>{item.title || "Contenu sans nom"}</span>
                         <span className="text-xs text-slate-500 font-normal uppercase tracking-wider">{item.type || "Inconnu"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate">
                      {item.type === 'url' && item.url ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-xs">{item.url}</a>
                      ) : item.type === 'message' && item.message ? (
                        <span className="text-xs italic text-amber-400">{item.message.length > 60 ? item.message.substring(0, 60) + '...' : item.message}</span>
                      ) : item.imageBase64 ? (
                        <span className="text-xs">{item.imageBase64}</span>
                      ) : item.videoUrl ? (
                        <span className="text-xs">{item.videoUrl}</span>
                      ) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {assignedScreens.length === 0 ? (
                        <span className="text-xs text-muted-foreground">Aucune TV</span>
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
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Récemment"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 flex items-center justify-end">
                     <button onClick={() => openAssignTvsModal(contentId)} className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20" title="Modifier TVs assignées">
                        <PlayCircle size={16} />
                     </button>
                     <button onClick={() => openEditModal(item)} className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20" title="Modifier">
                        <Edit2 size={16} />
                     </button>
                     <button onClick={() => handleDeleteClick(item._id || item.id)} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20" title="Supprimer">
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

      {/* Modal - Ajouter/Modifier Contenu */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-md" onClick={() => !isSubmitting && !submitSuccess && setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? "Modifier le Contenu" : "Ajouter un Contenu"}</h2>
                <p className="text-xs text-slate-400 mt-1">{editingId ? "Modifiez les informations." : "Image, vidéo, URL ou message."}</p>
              </div>
              <button onClick={() => !isSubmitting && !submitSuccess && setIsModalOpen(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X size={20} />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-12 flex flex-col items-center justify-center text-center animate-in fade-in">
                <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                  <UploadCloud size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Contenu cree !</h3>
                <p className="text-sm text-slate-400">Ajoute a la bibliothèque.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Titre du contenu</label>
                  <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: Campagne d'été 2026"
                    className="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type de contenu</label>
                  <select
                    className="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="image">🖼️ Image (.jpg, .png)</option>
                    <option value="video">🎬 Vidéo (.mp4)</option>
                    <option value="url">🌐 Site Web (URL)</option>
                    <option value="message">💬 Message texte</option>
                  </select>
                </div>

                {/* File upload for Image/Video */}
                {isFileType && (
                  <div onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-800/60 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/10 hover:border-blue-500/30 transition-colors cursor-pointer group"
                  >
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange}
                      accept={formData.type === 'image' ? 'image/*' : 'video/*'}
                    />
                    {editingId && !selectedFile ? (
                      <div className="flex flex-col items-center">
                        <FileText size={32} className="text-slate-500 mb-2" />
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Média existant conservé</p>
                        <p className="text-xs text-slate-500 mt-1">Cliquez pour le remplacer</p>
                      </div>
                    ) : selectedFile ? (
                      <div className="flex flex-col items-center animate-in fade-in zoom-in-95">
                        <FileText size={32} className="text-blue-400 mb-2" />
                        <p className="text-sm text-slate-900 dark:text-slate-200 font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                        <p className="text-xs text-slate-500 italic mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={32} className="text-slate-500 group-hover:text-blue-400 transition-colors mb-3" />
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Cliquez pour sélectionner un fichier</p>
                        <p className="text-xs text-slate-500 mt-1">{formData.type === 'image' ? 'PNG, JPG, SVG' : 'MP4, WebM'} (Max 10MB)</p>
                      </>
                    )}
                  </div>
                )}

                {/* URL input */}
                {formData.type === 'url' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">🔗 Adresse du site web</label>
                    <input required type="url" value={formData.url || ''} onChange={(e) => setFormData({...formData, url: e.target.value})}
                      placeholder="https://www.exemple.com"
                      className="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                  </div>
                )}

                {/* Message textarea */}
                {formData.type === 'message' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">📝 Votre message</label>
                    <textarea required value={formData.message || ''} onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Tapez votre message ici..." rows={4}
                      className="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => { setIsModalOpen(false); setSelectedFile(null); }}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >Annuler</button>
                  <button type="submit" disabled={isSubmitting || (isFileType && !editingId && !selectedFile)}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                  >
                    {isSubmitting ? (<><Loader2 size={16} className="animate-spin" /> Creation...</>) : (editingId ? "Mettre a jour" : "Creer le contenu")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {assigningContentId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-md" onClick={() => !isAssigning && setAssigningContentId(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800/50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Modifier les TVs assignées</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ajout et retrait automatiques selon votre sélection.</p>
              </div>
              <button onClick={() => !isAssigning && setAssigningContentId(null)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 max-h-[360px] overflow-y-auto space-y-2">
              {screens.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Aucun écran disponible.</p>
              ) : (
                screens.map((screen: any) => {
                  const id = screen._id || screen.id;
                  const checked = selectedScreenIds.includes(id);
                  return (
                    <label key={id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/20 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedScreenIds((prev) =>
                            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                          )
                        }
                        className="h-4 w-4"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{screen.name || "Ecran"}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{screen.etablissement?.name || "Sans établissement"}</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800/50 flex justify-end gap-3">
              <button type="button" onClick={() => setAssigningContentId(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Annuler
              </button>
              <button type="button" disabled={isAssigning} onClick={handleSaveAssignedTvs} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2">
                {isAssigning ? <Loader2 size={16} className="animate-spin" /> : null}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de suppression */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-md"
            onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Supprimer le contenu ?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Cette action supprimera définitivement ce contenu et ses données.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full pt-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    "Supprimer"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
