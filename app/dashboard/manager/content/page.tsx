"use client";

import { useEffect, useState } from "react";
import {
  Send,
  FileVideo,
  Globe,
  MonitorSmartphone,
  CheckCircle2,
  Loader2,
  AlertCircle,
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

export default function managerContentPage() {
  const [screens, setScreens] = useState<any[]>([]);
  const [myetablissements, setMyetablissements] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [selectedetablissementIds, setSelectedetablissementIds] = useState<
    string[]
  >([]);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(
    null,
  );
  const [duration, setDuration] = useState<number | "">("");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingContents, setLoadingContents] = useState(true);
  const [isDiffusing, setIsDiffusing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Content Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({ title: "", message: "" });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<any>({
    title: "",
    type: "message",
    url: "",
    message: "",
  });
  const [createFile, setCreateFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Modal de suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createVisualFile, setCreateVisualFile] = useState<File | null>(null);

  const fetchData = async () => {
    try {
      const profileRes = await fetch("/api/backend/users/profile", {
        cache: "no-store",
      });
      const user = profileRes.ok ? await profileRes.json() : null;
      if (!user) return;
      setUserData(user);

      // Fetch etablissements to filter screens
      const etablissementsRes = await fetch("/api/backend/etablissements", {
        cache: "no-store",
      });
      let myetablissementIds = new Set<string>();
      if (etablissementsRes.ok) {
        // Backend should already return only etablissements assigned to current manager
        const filteredetablissements = await etablissementsRes.json();
        setMyetablissements(filteredetablissements);
        myetablissementIds = new Set(
          filteredetablissements.map(
            (a: { _id: any; id: any }) => a._id || a.id,
          ),
        );
      }

      // Fetch Screens
      const screensRes = await fetch("/api/backend/screens", {
        cache: "no-store",
      });
      if (screensRes.ok) {
        const allScreens = await screensRes.json();
        const filteredScreens = allScreens.filter((s: any) =>
          myetablissementIds.has(s.etablissementId),
        );
        setScreens(filteredScreens);
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
        const data = await res.json();
        setContents(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch contents", err);
    } finally {
      setLoadingContents(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchData();
    };
    init();
  }, []);

  useEffect(() => {
    if (userData) fetchContents();
  }, [userData]);

  const openEditModal = (e: React.MouseEvent, item: any) => {
    e.stopPropagation(); // Empêcher la sélection du contenu
    setEditingContent(item);
    setEditFormData({
      title: item.title || "",
      message: item.message || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(
        `/api/backend/content/${editingContent._id || editingContent.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editFormData),
        },
      );

      if (!res.ok) throw new Error("Erreur lors de la mise à jour");

      // Record in logs
      const user = userData || {};
      await fetch("/api/backend/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "info",
          action: "Modification contenu",
          source: "Manager",
          user: user.name || user.email || "manager",
          details: `Modification du contenu "${editFormData.title}"`,
        }),
      });

      setIsEditModalOpen(false);
      fetchContents();
    } catch (err) {
      console.error(err);
      toast.error("Impossible de mettre à jour le contenu");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleScreen = (id: string) => {
    setSelectedScreens((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleToggleetablissement = (id: string) => {
    setSelectedetablissementIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleDiffusion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedScreens.length === 0 && selectedetablissementIds.length === 0) {
      toast.error("Veuillez sélectionner au moins un écran.");
      return;
    }
    if (!selectedContentId) {
      toast.error("Veuillez sélectionner un contenu à diffuser.");
      return;
    }

    setIsDiffusing(true);
    try {
      const user = userData || {};
      const content = contents.find(
        (c) => (c._id || c.id) === selectedContentId,
      );
      const etablissementScreenIds = screens
        .filter((s: any) =>
          selectedetablissementIds.includes(s.etablissementId),
        )
        .map((s: any) => s._id || s.id)
        .filter(Boolean);
      const targetScreenIds = Array.from(
        new Set([...selectedScreens, ...etablissementScreenIds]),
      );

      // Real assignment: add selected content to each selected screen
      await Promise.all(
        targetScreenIds.map((screenId) =>
          fetch(`/api/backend/screens/${screenId}/content/add`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ contentIds: [selectedContentId] }),
          }).then((res) => {
            if (!res.ok)
              throw new Error(`Assignation échouée sur écran ${screenId}`);
          }),
        ),
      );

      // Record in logs/history
      await fetch("/api/backend/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "success",
          action: "Diffusion de contenu",
          source: "Manager",
          user: user.name || user.email || "manager",
          details: `Assignation de "${content?.title}" sur ${targetScreenIds.length} écran(s) pour une durée de ${duration}s.`,
        }),
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedScreens([]);
        setSelectedetablissementIds([]);
        setSelectedContentId(null);
        setDuration("");
      }, 3000);
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue lors de la diffusion.");
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
          body: JSON.stringify({
            title: createFormData.title,
            type,
            url: type === "url" ? createFormData.url : undefined,
            message: type === "message" ? createFormData.message : undefined,
          }),
        });
      } else {
        if (!createFile) throw new Error("Veuillez sélectionner un fichier.");
        const data = new FormData();
        data.append("file", createFile);
        data.append("title", createFormData.title);
        data.append("type", createFormData.type);
        if (createVisualFile) {
          data.append("visual", createVisualFile);
        }
        res = await fetch("/api/backend/content/upload", {
          method: "POST",
          body: data,
        });
      }

      if (!res.ok) throw new Error("Création du contenu échouée");
      setIsCreateModalOpen(false);
      setCreateFormData({ title: "", type: "message", url: "", message: "" });
      setCreateFile(null);
      fetchContents();
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de la création");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClick = (contentId: string) => {
    setContentToDelete(contentId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!contentToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/backend/content/${contentToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Suppression impossible");
      fetchContents();
      setIsDeleteModalOpen(false);
      setContentToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const getMediaIcon = (type?: string) => {
    const t = type?.toLowerCase();
    if (t?.includes("video"))
      return <Video size={20} className="text-purple-400" />;
    if (t?.includes("url"))
      return <Globe size={20} className="text-cyan-400" />;
    if (t?.includes("message"))
      return <MessageSquare size={20} className="text-amber-400" />;
    if (t?.includes("audio"))
      return <Music size={20} className="text-emerald-400" />;
    return <ImageIcon size={20} className="text-blue-400" />;
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Main Content Area */}
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Portail de Diffusion
            </h1>
            <p className="text-muted-foreground mt-2">
              Choisissez un contenu disponible et diffusez-le sur vos écrans.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              Ajouter contenu
            </button>
            <button
              type="button"
              onClick={() => {
                fetchData();
                fetchContents();
              }}
              className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:rotate-180 duration-500"
              title="Rafraîchir"
            >
              <RefreshCcw size={20} />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleDiffusion}
          className="soft-card p-8 shadow-sm relative overflow-hidden flex flex-col h-[600px]"
        >
          {success && (
            <div className="absolute inset-0 bg-emerald-500 z-10 flex flex-col items-center justify-center text-white animate-in slide-in-from-top-full duration-500">
              <CheckCircle2 size={60} className="mb-4" />
              <h3 className="text-2xl font-bold">Diffusion réussie !</h3>
              <p className="mt-2 text-emerald-50 font-medium">
                Vos écrans sont en train de se mettre à jour.
              </p>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold text-foreground">
              Sélectionner un contenu
            </h3>

            <div className="relative group flex-1 max-w-sm">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Rechercher par titre ou type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-10 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {loadingContents ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="animate-spin text-primary mb-4" size={32} />
                <p>Chargement des contenus...</p>
              </div>
            ) : contents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <FileVideo size={48} className="mb-4 opacity-50" />
                <p>Aucun contenu n'a été ajouté par l'administrateur.</p>
              </div>
            ) : (
              contents
                .filter(
                  (item) =>
                    (item.title || "")
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    (item.type || "")
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()),
                )
                .map((item) => (
                  <div
                    key={item._id || item.id}
                    onClick={() => setSelectedContentId(prev => prev === (item._id || item.id) ? null : (item._id || item.id))}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between group ${
                      selectedContentId === (item._id || item.id)
                        ? "bg-primary/10 border-primary/50 shadow-md"
                        : "bg-background border-border hover:border-primary/30 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-16 bg-muted/50 border border-border flex items-center justify-center rounded-lg overflow-hidden relative">
                        {item.imageBase64 ? (
                          <img
                            src={`http://localhost:3001${item.imageBase64}`}
                            alt="thumbnail"
                            className="object-cover w-full h-full"
                          />
                        ) : item.videoUrl && item.type === 'audio' ? (
                          <video src={`http://localhost:3001${item.videoUrl}`} className="object-cover w-full h-full opacity-60" />
                        ) : (
                          getMediaIcon(item.type)
                        )}
                        {(item.videoUrl && item.type !== "audio") && (
                          <PlayCircle
                            size={16}
                            className="absolute text-white drop-shadow-md"
                          />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold transition-colors ${selectedContentId === (item._id || item.id) ? "text-primary" : "text-foreground"}`}
                        >
                          {item.title || "Contenu sans nom"}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-medium">
                          {item.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => openEditModal(e, item)}
                        className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors border border-primary/20 opacity-0 group-hover:opacity-100"
                        title="Modifier"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(item._id || item.id);
                        }}
                        className="p-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors border border-destructive/20 opacity-0 group-hover:opacity-100"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedContentId === (item._id || item.id)
                            ? "bg-primary border-primary"
                            : "bg-transparent border-border"
                        }`}
                      >
                        {selectedContentId === (item._id || item.id) && (
                          <CheckCircle2
                            size={14}
                            className="text-primary-foreground"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
          {/* Section sélection écrans */}
        <div className="pt-4 border-t border-border space-y-2">
          <label className="text-sm font-bold text-foreground">
            Sélectionner un écran
          </label>
          {loading ? (
            <p className="text-muted-foreground text-sm">Chargement...</p>
          ) : screens.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun écran disponible.</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {screens.map((screen) => (
                <div
                  key={screen._id || screen.id}
                  onClick={() => handleToggleScreen(screen._id || screen.id)}
                  className={`p-3 rounded-xl cursor-pointer border flex items-center gap-3 transition-all ${
                    selectedScreens.includes(screen._id || screen.id)
                      ? "bg-primary/10 border-primary/50"
                      : "bg-background border-border hover:border-primary/30"
                  }`}
                >
                  <MonitorSmartphone size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {screen.name || screen._id}
                  </span>
                  <div className={`ml-auto h-4 w-4 rounded-full border-2 ${
                    selectedScreens.includes(screen._id || screen.id)
                      ? "bg-primary border-primary"
                      : "border-border"
                  }`} />
                </div>
              ))}
            </div>
          )}
        </div>

          <div className="pt-4 border-t border-border space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">
                Durée de la diffusion (en secondes)
              </label>
              <input
                type="number"
                min="1"
                placeholder="Ex: 30"
                value={duration}
                onChange={(e) =>
                  setDuration(e.target.value ? parseInt(e.target.value) : "")
                }
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium placeholder:text-muted-foreground/40"
              />
              <p className="text-[10px] text-muted-foreground">
                Le contenu s'affichera pendant ce temps avant de passer au
                suivant.
              </p>
            </div>
            <button
              type="submit"
              disabled={
                isDiffusing ||
                selectedScreens.length === 0 ||
                !duration || duration <= 0
              }
              className="w-full bg-primary hover:opacity-90 disabled:opacity-50 disabled:bg-muted text-primary-foreground font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(var(--primary),0.3)] active:scale-95 flex items-center justify-center gap-3"
            >
              {isDiffusing ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <Send size={24} />
              )}
              Diffuser la sélection
            </button>
          </div>
        </form>
      </div>

      {/* Modal - Edit Content (Title & Message) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-md transition-opacity"
            onClick={() => !isUpdating && setIsEditModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border bg-muted/30">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-foreground tracking-tight">
                    Modifier le contenu
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mettez à jour le nom ou le texte.
                  </p>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateContent} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Nom du contenu
                </label>
                <input
                  required
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                  placeholder="Nom du contenu..."
                  className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-inner"
                />
              </div>

              {editingContent?.type === "message" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Texte du message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={editFormData.message}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        message: e.target.value,
                      })
                    }
                    placeholder="Votre message ici..."
                    className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none shadow-inner"
                  />
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-semibold py-2.5 rounded-xl text-sm transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-primary hover:opacity-90 text-primary-foreground font-semibold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "Enregistrer"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
            onClick={() => !isCreating && setIsCreateModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                Ajouter un contenu
              </h3>
              <button
                onClick={() => !isCreating && setIsCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateContent} className="p-6 space-y-4">
              <input
                required
                value={createFormData.title}
                onChange={(e) =>
                  setCreateFormData((p: any) => ({
                    ...p,
                    title: e.target.value,
                  }))
                }
                placeholder="Titre"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground"
              />
              <select
                value={createFormData.type}
                onChange={(e) =>
                  setCreateFormData((p: any) => ({
                    ...p,
                    type: e.target.value,
                  }))
                }
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground"
              >
                <option value="image">Image</option>
                <option value="video">Vidéo</option>
                <option value="audio">Audio (MP3)</option>
                <option value="url">URL</option>
                <option value="message">Message</option>
              </select>
              {createFormData.type === "image" ||
              createFormData.type === "video" ||
              createFormData.type === "audio" ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">
                      Fichier Principal {createFormData.type === "audio" ? "(MP3)" : ""}
                    </label>
                    <input
                      type="file"
                      accept={
                        createFormData.type === "image"
                          ? "image/*"
                          : createFormData.type === "video"
                            ? "video/*"
                            : "audio/mpeg,audio/mp3"
                      }
                      onChange={(e) => setCreateFile(e.target.files?.[0] || null)}
                      className="w-full text-sm text-muted-foreground"
                    />
                  </div>

                  {createFormData.type === "audio" && (
                    <div className="space-y-1 p-3 bg-muted/30 rounded-xl border border-border border-dashed">
                      <label className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1">
                        <Sparkles size={10} /> Visuel (Optionnel)
                      </label>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) =>
                          setCreateVisualFile(e.target.files?.[0] || null)
                        }
                        className="w-full text-xs text-muted-foreground"
                      />
                    </div>
                  )}
                </div>
              ) : null}
              {createFormData.type === "url" ? (
                <input
                  required
                  value={createFormData.url || ""}
                  onChange={(e) =>
                    setCreateFormData((p: any) => ({
                      ...p,
                      url: e.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground"
                />
              ) : null}
              {createFormData.type === "message" ? (
                <textarea
                  required
                  rows={4}
                  value={createFormData.message || ""}
                  onChange={(e) =>
                    setCreateFormData((p: any) => ({
                      ...p,
                      message: e.target.value,
                    }))
                  }
                  placeholder="Votre message..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground resize-none"
                />
              ) : null}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground px-5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                >
                  {isCreating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de suppression */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
            onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">
                  Supprimer le contenu ?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cette action supprimera définitivement ce contenu.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full pt-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-destructive/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
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
