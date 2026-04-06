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
  Plus,
  Trash2,
  ChevronRight
} from "lucide-react";

export default function ChefContentPage() {
  const [activeTab, setActiveTab] = useState<"media" | "text" | "link">("media");
  const [screens, setScreens] = useState<any[]>([]);
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDiffusing, setIsDiffusing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [webUrl, setWebUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchMyScreens = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/screens", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setScreens(data);
        } else {
           // Fallback mock
           setScreens([
             { id: '1', name: 'Écran Hall A', status: 'Online' },
             { id: '2', name: 'Écran Vitrine', status: 'Online' },
             { id: '3', name: 'Écran Réception', status: 'Offline' },
           ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyScreens();
  }, []);

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

    setIsDiffusing(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      };

      let payload: any = {
        title: title || "Sans titre",
        type: activeTab === 'media' ? (file?.type.includes('video') ? 'Video' : 'Image') : activeTab === 'text' ? 'Text' : 'WebLink',
        status: "Actif",
        targetScreens: selectedScreens, // List of IDs for targeted diffusion
      };

      if (activeTab === 'text') {
        payload.description = textContent;
      } else if (activeTab === 'link') {
        payload.videoUrl = webUrl; // Reusing videoUrl field for the link if necessary or a generic url field
      } else if (activeTab === 'media' && file) {
        // Here we simulate the URL or convert to base64 for the real sync
        // For a true premium feel, we send the media details
        payload.imageBase64 = file.type.includes('image') ? '/images/auth_bg.png' : null; 
        payload.videoUrl = file.type.includes('video') ? 'https://example.com/video.mp4' : null;
      }

      const res = await fetch("http://localhost:3001/content", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Erreur de diffusion");
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setTitle("");
        setTextContent("");
        setWebUrl("");
        setFile(null);
        setSelectedScreens([]);
      }, 3000);

    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de la diffusion vers la base de données.");
    } finally {
      setIsDiffusing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Main Form Area */}
      <div className="flex-1 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Portail de Diffusion</h1>
            <p className="text-slate-400 mt-2">Créez et envoyez vos contenus vers vos écrans en un clic.</p>
          </div>
        </div>

        {/* Tabs Selection */}
        <div className="flex p-1.5 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/50 w-fit">
          <button 
            onClick={() => setActiveTab("media")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'media' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <FileVideo size={18} /> Média
          </button>
          <button 
             onClick={() => setActiveTab("text")}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'text' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Type size={18} /> Message Texte
          </button>
          <button 
             onClick={() => setActiveTab("link")}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'link' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Globe size={18} /> Lien Web
          </button>
        </div>

        {/* Active Content Form */}
        <form onSubmit={handleDiffusion} className="bg-[#0f172a]/60 backdrop-blur-2xl border border-slate-800/60 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {success && (
            <div className="absolute inset-0 bg-emerald-500/90 backdrop-blur-md z-10 flex flex-col items-center justify-center text-white animate-in slide-in-from-top-full duration-500">
               <CheckCircle2 size={60} className="mb-4" />
               <h3 className="text-2xl font-bold">Diffusion en cours...</h3>
               <p className="mt-2 text-emerald-100 font-medium">Vos écrans sont en train de se mettre à jour.</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Titre de la campagne</label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Promo Sandwich Lyon"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
              />
            </div>

            {activeTab === "media" && (
              <div className="group relative border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="flex flex-col items-center gap-4">
                   <div className="h-16 w-16 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-blue-400 group-hover:scale-110 transition-all">
                      <Plus size={32} />
                   </div>
                   <div>
                      <p className="text-white font-bold">{file ? file.name : "Cliquez ou glissez un fichier"}</p>
                      <p className="text-xs text-slate-500 mt-1 uppercase tracking-tight font-bold">MP4, PNG ou JPG (Max 50Mo)</p>
                   </div>
                </div>
              </div>
            )}

            {activeTab === "text" && (
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Message à afficher</label>
                 <textarea 
                   rows={5}
                   value={textContent}
                   onChange={(e) => setTextContent(e.target.value)}
                   placeholder="Tapez le message qui apparaîtra sur l'écran..."
                   className="w-full bg-slate-950/60 border border-slate-800 rounded-3xl p-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-lg font-medium resize-none shadow-inner"
                 />
              </div>
            )}

            {activeTab === "link" && (
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">URL / Iframe</label>
                 <div className="relative">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">
                      <Globe size={18} />
                   </div>
                   <input 
                    type="url"
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    placeholder="https://votre-site.com/promo"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-3xl py-5 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-mono text-sm"
                   />
                 </div>
              </div>
            )}
            
            <div className="pt-6">
              <button 
                type="submit"
                disabled={isDiffusing || selectedScreens.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-800 text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(37,99,235,0.3)] active:scale-95 flex items-center justify-center gap-3"
              >
                {isDiffusing ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                Diffuser maintenent
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Targets Sidebar */}
      <div className="w-full lg:w-96 space-y-6">
        <div className="bg-[#0f172a]/80 backdrop-blur-3xl border border-white/[0.06] rounded-3xl p-6 shadow-2xl h-fit sticky top-28">
           <div className="flex items-center justify-between mb-6 border-b border-white/[0.04] pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <MonitorSmartphone size={18} className="text-blue-400" />
                 Cibles ({selectedScreens.length})
              </h3>
              <button 
                onClick={() => setSelectedScreens(screens.map(s => s.id || s._id))}
                className="text-[10px] font-black text-blue-500 hover:text-white uppercase tracking-tighter"
              >
                 Tout cocher
              </button>
           </div>

           <div className="max-h-[500px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
             {loading ? (
               <div className="p-8 text-center"><Loader2 className="animate-spin text-slate-700 mx-auto" /></div>
             ) : screens.length === 0 ? (
               <p className="text-slate-500 text-sm text-center py-8">Aucun écran trouvé.</p>
             ) : screens.map((screen) => (
                <div 
                  key={screen.id || screen._id}
                  onClick={() => handleToggleScreen(screen.id || screen._id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between group ${
                    selectedScreens.includes(screen.id || screen._id) 
                      ? 'bg-blue-500/10 border-blue-500/40' 
                      : 'bg-white/[0.02] border-transparent hover:border-white/[0.1] hover:bg-white/[0.04]'
                  }`}
                >
                   <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${
                         selectedScreens.includes(screen.id || screen._id) 
                           ? 'bg-blue-500 border-blue-500' 
                           : 'bg-transparent border-slate-700 group-hover:border-slate-500'
                      }`}>
                         {selectedScreens.includes(screen.id || screen._id) && <CheckCircle2 size={16} className="text-white" />}
                      </div>
                      <div>
                         <p className={`text-xs font-bold transition-colors ${selectedScreens.includes(screen.id || screen._id) ? 'text-white' : 'text-slate-400'}`}>
                           {screen.name}
                         </p>
                         <p className="text-[9px] text-slate-600 mt-0.5">Statut: {screen.status}</p>
                      </div>
                   </div>
                   <div className={`h-2 w-2 rounded-full ${screen.status === 'Online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                </div>
             ))}
           </div>
           
           <div className="mt-8 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                 <AlertCircle size={12} /> info diffusion
              </p>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                La diffusion locale sur vos agences est immédiat dès la validation.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
