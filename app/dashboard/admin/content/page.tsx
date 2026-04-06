"use client";

import { useEffect, useState, useRef } from "react";
import { MoreHorizontal, FileVideo, Search, Loader2, AlertCircle, PlayCircle, Clock, Video, Image as ImageIcon, Plus, X, UploadCloud, FileText } from "lucide-react";

export default function ContentPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', type: 'Image' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchContents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/content", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Erreur de récupération des contenus");
      }

      const data = await res.json();
      setContents(data);
    } catch (err: any) {
      setError(err.message || "Erreur de connexion serveur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      
      // Simulation d'upload ou envoi direct si l'API accepte du JSON simple
      // Pour une vraie application, on utiliserait FormData
      const res = await fetch("http://localhost:3001/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          ...formData, 
          status: "Actif",
          // On simule l'URL ou le base64 ici pour la démonstration
          imageBase64: formData.type === 'Image' ? '/images/auth_bg.png' : null,
          videoUrl: formData.type === 'Video' ? 'https://example.com/video.mp4' : null
        })
      });

      if (!res.ok) throw new Error("Erreur lors de l'upload");
      
      setSubmitSuccess(true);
      fetchContents();
      
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setFormData({ title: '', type: 'Image' });
        setSelectedFile(null);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    const currentStatus = status || "Actif"; 
    switch (currentStatus) {
      case "Actif":
        return (
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <PlayCircle size={12} /> Actif
          </span>
        );
      case "En attente":
        return (
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Clock size={12} /> En attente
          </span>
        );
      case "Erreur":
        return (
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle size={12} /> Erreur
          </span>
        );
      default:
        return <span>{currentStatus}</span>;
    }
  };

  const getMediaIcon = (type?: string) => {
    if (type?.toLowerCase().includes("video")) return <Video size={20} className="text-purple-400" />;
    return <ImageIcon size={20} className="text-blue-400" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Contenus Média</h1>
          <p className="text-slate-400 mt-2">Bibliothèque de tous vos médias, campagnes et annonces.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
        >
          <Plus size={18} /> Ajouter un média
        </button>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl shadow-xl overflow-hidden min-h-[400px] flex flex-col">
        <div className="p-4 border-b border-slate-800/50 flex justify-between items-center bg-slate-950/30">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un contenu..." 
              className="w-full bg-slate-900/50 border border-slate-800/50 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
            />
          </div>
          <span className="text-sm font-medium text-slate-500">{contents.length} contenus au total</span>
        </div>

        <div className="flex-1 p-0">
          {loading ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-slate-500">
              <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
              <p>Chargement des contenus...</p>
            </div>
          ) : error ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-red-400">
              <AlertCircle size={32} className="mb-4" />
              <p>{error}</p>
            </div>
          ) : contents.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-slate-500">
              <FileVideo size={48} className="mb-4 opacity-50" />
              <p>Votre bibliothèque de médias est vide.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950/50 text-xs uppercase font-medium text-slate-300 border-b border-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4">Média</th>
                  <th scope="col" className="px-6 py-4">Statut</th>
                  <th scope="col" className="px-6 py-4">Taille / Poids</th>
                  <th scope="col" className="px-6 py-4">Créé le</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {contents.map((item: any) => (
                  <tr key={item._id || item.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200 flex items-center gap-4">
                       <div className="h-12 w-16 bg-slate-950/80 border border-slate-700 flex items-center justify-center rounded-lg shadow-inner overflow-hidden relative">
                         {item.imageBase64 || item.videoUrl ? (
                           <img src={item.imageBase64 || '/images/auth_bg.png'} alt="thumbnail" className="object-cover w-full h-full opacity-60" />
                         ) : (
                           getMediaIcon(item.type)
                         )}
                         {item.videoUrl && <PlayCircle size={16} className="absolute text-white drop-shadow-md shadow-black" />}
                       </div>
                      <div className="flex flex-col">
                         <span>{item.title || "Contenu sans nom"}</span>
                         <span className="text-xs text-slate-500 font-normal uppercase tracking-wider">{item.type || "Inconnu"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      —
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Récemment"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-500 hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-500/10">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal - Upload Média */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            onClick={() => !isSubmitting && !submitSuccess && setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-800/50">
              <div>
                <h2 className="text-xl font-bold text-white">Ajouter un Média</h2>
                <p className="text-xs text-slate-400 mt-1">Uploadez une nouvelle image ou vidéo.</p>
              </div>
              <button 
                onClick={() => !isSubmitting && !submitSuccess && setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-12 flex flex-col items-center justify-center text-center animate-in fade-in">
                <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                  <UploadCloud size={32} />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Upload réussi !</h3>
                <p className="text-sm text-slate-400">Votre média a été ajouté à la bibliothèque.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    Titre du contenu
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: Campagne d'été 2026"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    Type de média
                  </label>
                  <select
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Image">Image (.jpg, .png)</option>
                    <option value="Video">Vidéo (.mp4)</option>
                  </select>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 border-2 border-dashed border-slate-800/60 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-800/10 hover:border-blue-500/30 transition-colors cursor-pointer group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept={formData.type === 'Image' ? 'image/*' : 'video/*'}
                  />
                  {selectedFile ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in-95">
                      <FileText size={32} className="text-blue-400 mb-2" />
                      <p className="text-sm text-slate-200 font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500 italic mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={32} className="text-slate-500 group-hover:text-blue-400 transition-colors mb-3" />
                      <p className="text-sm text-slate-300 font-medium">Cliquez pour parcourir ou glissez le fichier ici</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formData.type === 'Image' ? 'SVG, PNG, JPG' : 'MP4, WebM'} (Max 10MB)
                      </p>
                    </>
                  )}
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedFile}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <><Loader2 size={16} className="animate-spin" /> Upload en cours...</>
                    ) : (
                      'Uploader le média'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
