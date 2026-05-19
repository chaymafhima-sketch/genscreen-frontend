"use client";

import { useEffect, useState, useRef } from "react";
import { FileVideo, Search, Loader2, AlertCircle, PlayCircle, Clock, Video, Image as ImageIcon, Plus, X, UploadCloud, FileText, Edit2, Trash2, Globe, MessageSquare, RefreshCcw, Music, Sparkles, Monitor, Tv } from "lucide-react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";

export default function ContentPage() {
  const { t } = useLanguage();
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({ title: '', type: 'image', url: '', message: '' });
  const [activeMirrorId, setActiveMirrorId] = useState<string | null>(null);
  const socketRef = useRef<any>(null);
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
  const localStream = useRef<MediaStream | null>(null);
  const frameInterval = useRef<any>(null);
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
      } else if (contentType === 'mirror') {
        res = await fetch("/api/backend/content/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: formData.title, type: 'mirror' })
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

  const startMirroring = async (contentId: string) => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          cursor: "always",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 15 }
        } as any,
        audio: false
      });
      localStream.current = stream;
      setActiveMirrorId(contentId);

      const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
      const socket = io(backendUrl); 
      socketRef.current = socket;

      const iceServers = [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun.services.mozilla.com" }
      ];

      socket.on("connect", () => {
        socket.emit("join-stream-room", { streamId: contentId });
        socket.emit("start-mirror", { streamId: contentId });
      });

      socket.on("signal", async (data: any) => {
        if (!data.fromScreen) return;
        
        // Handle screen ready to receive
        if (data.signal.type === 'ready') {
          let pc = peerConnections.current[data.senderId];
          if (pc) pc.close();
          
          pc = new RTCPeerConnection({
            iceServers: iceServers
          });
          peerConnections.current[data.senderId] = pc;
          
          if (localStream.current) {
            localStream.current.getTracks().forEach(track => pc.addTrack(track, localStream.current!));
          }

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              let candidateStr = event.candidate.candidate;
              // Hack to bypass mDNS hiding on local networks
              if (candidateStr.includes(".local")) {
                const localIp = window.location.hostname;
                if (localIp.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
                  candidateStr = candidateStr.replace(/[a-f0-9-]+\.local/g, localIp);
                }
              }

              socket.emit("signal", {
                targetId: data.senderId,
                senderId: contentId,
                signal: {
                  ...event.candidate.toJSON(),
                  candidate: candidateStr
                },
                isScreen: false
              });
            }
          };

          const offer = await pc.createOffer();
          let sdp = offer.sdp || "";
          const localIp = window.location.hostname;
          if (localIp.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
            sdp = sdp.replace(/[a-f0-9-]+\.local/g, localIp);
          }
          const modifiedOffer = { type: 'offer' as RTCSdpType, sdp };
          await pc.setLocalDescription(modifiedOffer);
          
          socket.emit("signal", {
            targetId: data.senderId,
            senderId: contentId,
            signal: modifiedOffer,
            isScreen: false
          });
          return;
        }
        
        let pc = peerConnections.current[data.senderId];

        if (data.signal.sdp) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.signal));
          if (data.signal.type === "offer") {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("signal", {
              targetId: data.senderId,
              senderId: contentId,
              signal: answer,
              isScreen: false
            });
          }
        } else if (data.signal.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(data.signal));
        }
      });

      stream.getVideoTracks()[0].onended = () => {
        stopMirroring();
      };

      toast.success("Mirroring started!");

      // --- LEGACY FALLBACK: Stream frames via WebSockets ---
      const canvas = document.createElement("canvas");
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      video.play();
      
      frameInterval.current = setInterval(() => {
        if (socket.connected && video.videoWidth > 0) {
          canvas.width = 1024;
          canvas.height = (1024 * video.videoHeight) / video.videoWidth;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frame = canvas.toDataURL("image/jpeg", 0.7);
          socket.emit("mirror-frame", { streamId: contentId, frame });
        }
      }, 100);
      // -----------------------------------------------------
    } catch (err) {
      console.error(err);
      toast.error("Failed to start mirroring");
    }
  };

  const stopMirroring = () => {
    if (frameInterval.current) {
      clearInterval(frameInterval.current);
      frameInterval.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    if (socketRef.current) {
      socketRef.current.emit("stop-mirror", { streamId: activeMirrorId });
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
    setActiveMirrorId(null);
    toast.success("Mirroring stopped");
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
    if (typeLower?.includes("mirror")) return <Monitor size={20} className="text-indigo-400" />;
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            {t.content.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t.content.subtitle}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 bg-muted/40 p-2 rounded-2xl border border-border transition-colors w-full">
        <div className="relative flex-1 group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder={t.content.search_placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchContents}
            title={t.common.refresh}
            className="h-10 w-10 bg-card border border-border rounded-xl flex items-center justify-center transition-all hover:bg-muted/50 active:scale-[0.98] group shadow-sm"
          >
            <div className="text-primary flex items-center justify-center group-active:rotate-180 transition-transform duration-500">
              <RefreshCcw size={18} />
            </div>
          </button>
          <button
            onClick={openAddModal}
            className="shrink-0 bg-primary hover:opacity-90 text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} /> {t.content.add_button}
          </button>
        </div>
      </div>

      <div className="soft-card overflow-hidden min-h-[400px] flex flex-col transition-colors shadow-none mt-6">
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
                     {item.type === 'mirror' && (
                       <button 
                        onClick={() => activeMirrorId === contentId ? stopMirroring() : startMirroring(contentId)} 
                        className={`p-1.5 rounded-lg transition-colors border ${activeMirrorId === contentId ? 'bg-red-500/20 text-red-500 border-red-500/30 animate-pulse' : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border-indigo-500/20'}`}
                        title={activeMirrorId === contentId ? "Stop Mirroring" : "Start Mirroring"}
                       >
                          <Tv size={16} />
                       </button>
                     )}
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
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingId ? t.dashboard.edit : t.content.add_button}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={24} /></button>
            </div>

            {submitSuccess ? (
              <div className="p-12 text-center">
                <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4 mx-auto border border-emerald-500/20"><UploadCloud size={32} /></div>
                <h3 className="text-lg font-bold text-foreground">{t.dashboard.save}</h3>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="max-h-[450px] overflow-y-auto custom-content-scrollbar">
                  <style dangerouslySetInnerHTML={{ __html: `
                    .custom-content-scrollbar::-webkit-scrollbar {
                      width: 8px !important;
                      display: block !important;
                    }
                    .custom-content-scrollbar::-webkit-scrollbar-track {
                      background: rgba(255, 255, 255, 0.05) !important;
                    }
                    .custom-content-scrollbar::-webkit-scrollbar-thumb {
                      background-color: #ffffff !important;
                      border-radius: 10px !important;
                    }
                    .custom-content-scrollbar {
                      scrollbar-width: thin !important;
                      scrollbar-color: #ffffff rgba(255, 255, 255, 0.05) !important;
                    }
                  `}} />
                  <div className="space-y-6 p-6 pb-10">
                    {/* Informations Générales */}
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">Nom du contenu</label>
                          <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all" placeholder="Ex: Menu du jour, Promo..." />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">Type de média</label>
                          <select className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary cursor-pointer transition-all" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                            <option value="image">🖼️ Image</option>
                            <option value="video">🎬 Vidéo</option>
                            <option value="audio">🎵 Audio</option>
                            <option value="url">🌐 URL</option>
                            <option value="message">💬 Message</option>
                            <option value="mirror">📺 Mirror Screen (Live)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Médias & Contenu */}
                    <div className="space-y-4">
                      {isFileType && !editingId && (
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">{formData.type === 'audio' ? 'Piste Audio (MP3)' : 'Fichier Source'}</label>
                            <div className="relative group">
                              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept={formData.type === 'image' ? 'image/*' : formData.type === 'video' ? 'video/*' : 'audio/*'} />
                              <div onClick={() => fileInputRef.current?.click()} className="w-full bg-muted/20 border-2 border-dashed border-border rounded-xl py-4 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                                <UploadCloud className="text-muted-foreground group-hover:text-primary" size={20} />
                                <span className="text-[10px] font-medium text-muted-foreground">{selectedFile ? selectedFile.name : "Cliquez pour uploader"}</span>
                              </div>
                            </div>
                          </div>

                          {formData.type === 'audio' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                              <label className="text-[11px] font-bold text-success uppercase ml-1 flex items-center gap-1"><Sparkles size={12} /> Visuel d'accompagnement</label>
                              <div className="relative group">
                                <input type="file" ref={visualInputRef} onChange={handleVisualChange} className="hidden" accept="image/*,video/*" />
                                <div onClick={() => visualInputRef.current?.click()} className="w-full bg-success/5 border-2 border-dashed border-success/20 rounded-xl py-4 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-success hover:bg-success/10 transition-all">
                                  <ImageIcon className="text-success/50 group-hover:text-success" size={20} />
                                  <span className="text-[10px] font-medium text-muted-foreground">{selectedVisualFile ? selectedVisualFile.name : "Image ou animation (Optionnel)"}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Visual upload for audio in EDIT mode */}
                      {editingId && formData.type === 'audio' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                          <label className="text-[11px] font-bold text-success uppercase ml-1 flex items-center gap-1"><Sparkles size={12} /> Visuel d'accompagnement</label>
                          <div className="relative group">
                            <input type="file" ref={visualInputRef} onChange={handleVisualChange} className="hidden" accept="image/*,video/*" />
                            <div onClick={() => visualInputRef.current?.click()} className="w-full bg-success/5 border-2 border-dashed border-success/20 rounded-xl py-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-success hover:bg-success/10 transition-all">
                              <ImageIcon className="text-success/50 group-hover:text-success" size={24} />
                              <span className="text-[11px] font-medium text-muted-foreground">{selectedVisualFile ? selectedVisualFile.name : "Image ou animation (Optionnel)"}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.type === 'url' && (
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">Lien de redirection</label>
                          <input required type="url" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} placeholder="https://..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary" />
                        </div>
                      )}

                      {formData.type === 'message' && (
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">Message à diffuser</label>
                          <textarea required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary min-h-[100px] resize-none" placeholder="Écrivez votre message ici..." />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-border">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 border border-border rounded-xl font-bold hover:bg-muted transition-all text-foreground">{t.common.cancel}</button>
                      <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all">{isSubmitting ? t.common.loading : (editingId ? t.common.save : t.dashboard.add)}</button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsDeleteModalOpen(false)} />
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
