"use client";

import { useEffect, useState } from "react";
import { 
  Send, 
  FileVideo, 
  Type, 
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
  Search
} from "lucide-react";

export default function ChefContentPage() {
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

  // Content Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({ title: '', message: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (!storedUser || !token) return;
      
      const user = JSON.parse(storedUser);
      setUserData(user);

      // Fetch Agencies to filter screens
      const agenciesRes = await fetch("http://localhost:3001/agencies", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      let myAgencyIds = new Set<string>();
      if (agenciesRes.ok) {
        const allAgencies = await agenciesRes.json();
        const filteredAgencies = allAgencies.filter((a: any) => {
          const uCity = (user.city || "").toLowerCase().trim();
          const aCity = (a.city || "").toLowerCase().trim();
          const aAddr = (a.address || "").toLowerCase().trim();
          return uCity && (aCity === uCity || aAddr === uCity || aAddr.includes(uCity));
        });
        myAgencyIds = new Set(filteredAgencies.map((a: { _id: any; id: any }) => a._id || a.id));
      }

      // Fetch Screens
      const screensRes = await fetch("http://localhost:3001/screens", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (screensRes.ok) {
        const allScreens = await screensRes.json();
        const filteredScreens = allScreens.filter((s: any) => myAgencyIds.has(s.agencyId));
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
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/content", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContents(data);
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
    e.stopPropagation(); // Empêcher la sélection du contenu
    setEditingContent(item);
    setEditFormData({ 
      title: item.title || '', 
      message: item.message || '' 
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/content/${editingContent._id || editingContent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour");

      // Record in logs
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await fetch("http://localhost:3001/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          type: "info",
          action: "Modification contenu",
          source: "Chef d'Agence",
          user: user.name || user.email || "Chef",
          details: `Modification du contenu "${editFormData.title}"`
        })
      });
      
      setIsEditModalOpen(false);
      fetchContents();
    } catch (err) {
      console.error(err);
      alert("Impossible de mettre à jour le contenu");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleScreen = (id: string) => {
    setSelectedScreens(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleDiffusion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedScreens.length === 0) {
      alert("Veuillez sélectionner au moins un écran.");
      return;
    }
    if (!selectedContentId) {
      alert("Veuillez sélectionner un contenu à diffuser.");
      return;
    }

    setIsDiffusing(true);
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const content = contents.find(c => (c._id || c.id) === selectedContentId);

      // Record in logs/history
      await fetch("http://localhost:3001/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          type: "success",
          action: "Diffusion de contenu",
          source: "Chef d'Agence",
          user: user.name || user.email || "Chef",
          details: `Diffusion de "${content?.title}" sur ${selectedScreens.length} écran(s) pour une durée de ${duration}s.`
        })
      });

      // Simulation of assigning content to screen
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedScreens([]);
        setSelectedContentId(null);
        setDuration("");
      }, 3000);

    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de la diffusion.");
    } finally {
      setIsDiffusing(false);
    }
  };

  const getMediaIcon = (type?: string) => {
    const t = type?.toLowerCase();
    if (t?.includes("video")) return <Video size={20} className="text-purple-400" />;
    if (t?.includes("url")) return <Globe size={20} className="text-cyan-400" />;
    if (t?.includes("message")) return <MessageSquare size={20} className="text-amber-400" />;
    return <ImageIcon size={20} className="text-blue-400" />;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Main Content Area */}
      <div className="flex-1 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Portail de Diffusion</h1>
            <p className="text-muted-foreground mt-2">Choisissez un contenu disponible et diffusez-le sur vos écrans.</p>
          </div>
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

        <form onSubmit={handleDiffusion} className="soft-card p-8 shadow-sm relative overflow-hidden flex flex-col h-[600px]">
          {success && (
            <div className="absolute inset-0 bg-emerald-500 z-10 flex flex-col items-center justify-center text-white animate-in slide-in-from-top-full duration-500">
               <CheckCircle2 size={60} className="mb-4" />
               <h3 className="text-2xl font-bold">Diffusion réussie !</h3>
               <p className="mt-2 text-emerald-50 font-medium">Vos écrans sont en train de se mettre à jour.</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold text-foreground">1. Sélectionner un contenu</h3>
            
            <div className="relative group flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
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
                 .filter(item => 
                   (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                   (item.type || "").toLowerCase().includes(searchTerm.toLowerCase())
                 )
                 .map((item) => (
                 <div 
                   key={item._id || item.id}
                   onClick={() => setSelectedContentId(item._id || item.id)}
                   className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between group ${
                     selectedContentId === (item._id || item.id)
                       ? 'bg-primary/10 border-primary/50 shadow-md' 
                       : 'bg-background border-border hover:border-primary/30 hover:bg-muted/50'
                   }`}
                 >
                    <div className="flex items-center gap-4">
                       <div className="h-12 w-16 bg-muted/50 border border-border flex items-center justify-center rounded-lg overflow-hidden relative">
                         {item.imageBase64 ? (
                           <img src={`http://localhost:3001${item.imageBase64}`} alt="thumbnail" className="object-cover w-full h-full" />
                         ) : (
                           getMediaIcon(item.type)
                         )}
                         {item.videoUrl && <PlayCircle size={16} className="absolute text-white drop-shadow-md" />}
                       </div>
                       <div>
                          <p className={`text-sm font-bold transition-colors ${selectedContentId === (item._id || item.id) ? 'text-primary' : 'text-foreground'}`}>
                            {item.title || "Contenu sans nom"}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-medium">{item.type}</p>
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
                       <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedContentId === (item._id || item.id) 
                            ? 'bg-primary border-primary' 
                            : 'bg-transparent border-border'
                       }`}>
                          {selectedContentId === (item._id || item.id) && <CheckCircle2 size={14} className="text-primary-foreground" />}
                       </div>
                    </div>
                 </div>
               ))
            )}
          </div>
          
          <div className="pt-4 border-t border-border space-y-4">
            <div className="space-y-2">
               <label className="text-sm font-bold text-foreground">Durée de la diffusion (en secondes)</label>
               <input 
                 type="number" 
                 min="1"
                 placeholder="Ex: 30"
                 value={duration}
                 onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : "")}
                 className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium placeholder:text-muted-foreground/40"
               />
               <p className="text-[10px] text-muted-foreground">Le contenu s'affichera pendant ce temps avant de passer au suivant.</p>
            </div>
            <button 
              type="submit"
              disabled={isDiffusing || selectedScreens.length === 0 || !selectedContentId || !duration || duration <= 0}
              className="w-full bg-primary hover:opacity-90 disabled:opacity-50 disabled:bg-muted text-primary-foreground font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(var(--primary),0.3)] active:scale-95 flex items-center justify-center gap-3"
            >
              {isDiffusing ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
              Diffuser la sélection
            </button>
          </div>
        </form>
      </div>

      {/* Targets Sidebar */}
      <div className="w-full lg:w-96 space-y-6">
        <div className="soft-card p-6 shadow-sm h-[600px] flex flex-col">
           <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                 <MonitorSmartphone size={18} className="text-primary" />
                 2. Cibles ({selectedScreens.length})
              </h3>
              <button 
                onClick={() => setSelectedScreens(screens.map(s => s.id || s._id))}
                className="text-[10px] font-black text-primary hover:opacity-80 uppercase tracking-tighter"
              >
                 Tout cocher
              </button>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
             {loading ? (
               <div className="p-8 text-center"><Loader2 className="animate-spin text-primary mx-auto" /></div>
             ) : screens.length === 0 ? (
               <p className="text-muted-foreground text-sm text-center py-8">Aucun écran trouvé.</p>
             ) : screens.map((screen) => (
                <div 
                  key={screen.id || screen._id}
                  onClick={() => handleToggleScreen(screen.id || screen._id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between group ${
                    selectedScreens.includes(screen.id || screen._id) 
                      ? 'bg-primary/10 border-primary/40' 
                      : 'bg-muted/30 border-transparent hover:border-border hover:bg-muted/50'
                  }`}
                >
                   <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${
                         selectedScreens.includes(screen.id || screen._id) 
                           ? 'bg-primary border-primary' 
                           : 'bg-transparent border-border group-hover:border-muted-foreground/30'
                      }`}>
                         {selectedScreens.includes(screen.id || screen._id) && <CheckCircle2 size={16} className="text-primary-foreground" />}
                      </div>
                      <div>
                         <p className={`text-xs font-bold transition-colors ${selectedScreens.includes(screen.id || screen._id) ? 'text-foreground' : 'text-muted-foreground'}`}>
                           {screen.name}
                         </p>
                         <p className="text-[9px] text-muted-foreground/60 mt-0.5">Statut: {screen.status}</p>
                      </div>
                   </div>
                   <div className={`h-2 w-2 rounded-full ${screen.status === 'Online' ? 'bg-emerald-500' : 'bg-destructive'}`} />
                </div>
             ))}
           </div>
           
           <div className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 shrink-0">
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                 <AlertCircle size={12} /> info diffusion
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                La diffusion locale sur vos agences est immédiate dès la validation.
              </p>
           </div>
        </div>
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
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Modifier le contenu</h2>
                    <p className="text-xs text-muted-foreground mt-1">Mettez à jour le nom ou le texte.</p>
                  </div>
                  <button onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdateContent} className="p-6 space-y-5">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nom du contenu</label>
                    <input 
                      required
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                      placeholder="Nom du contenu..." 
                      className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-inner"
                    />
                 </div>

                 {editingContent?.type === 'message' && (
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Texte du message</label>
                       <textarea 
                         required
                         rows={4}
                         value={editFormData.message}
                         onChange={(e) => setEditFormData({...editFormData, message: e.target.value})}
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
                       {isUpdating ? <Loader2 size={18} className="animate-spin" /> : "Enregistrer"}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
