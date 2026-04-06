"use client";

import { useEffect, useState, useRef } from "react";
import { 
  LogOut, 
  Bell, 
  Search, 
  User, 
  Mail, 
  ChevronDown, 
  Building2, 
  FileVideo, 
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userData, setUserData] = useState<{name?: string, fullname?: string, email?: string, role?: string}>({});
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ agencies: any[], contents: any[] }>({ agencies: [], contents: [] });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Nouvelle agence enregistrée", type: "success", time: "Il y a 5 min", read: false },
    { id: 2, title: "Erreur écran: Agence Paris 12", type: "error", time: "Il y a 12 min", read: false },
    { id: 3, title: "Contenu 'Promo Été' mis à jour", type: "info", time: "Il y a 1h", read: true },
  ]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        setUserData(JSON.parse(user));
      } catch (e) {
        console.error("Erreur parsing user data", e);
      }
    }
  }, []);

  // Real-time search logic
  useEffect(() => {
    if (searchQuery.length < 1) {
      setSearchResults({ agencies: [], contents: [] });
      setShowSearchDropdown(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      setShowSearchDropdown(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { "Authorization": `Bearer ${token}` };

        const [resAgencies, resContent] = await Promise.all([
          fetch("http://localhost:3001/agencies", { headers }),
          fetch("http://localhost:3001/content", { headers })
        ]);

        const agencies = resAgencies.ok ? await resAgencies.json() : [];
        const contents = resContent.ok ? await resContent.json() : [];

        const filteredAgencies = agencies.filter((a: any) => 
          a.name?.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 3);

        const filteredContents = contents.filter((c: any) => 
          c.title?.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 3);

        setSearchResults({ agencies: filteredAgencies, contents: filteredContents });
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      router.push(`/dashboard/admin/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <header className="h-20 bg-[#0f172a]/90 backdrop-blur-2xl border-b border-white/[0.06] sticky top-0 z-50 px-8 flex items-center justify-between">
      {/* Search Bar Container */}
      <div className="flex items-center gap-4 w-1/3 relative" ref={searchRef}>
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md hidden md:block group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
            placeholder="Rechercher une agence, un contenu..." 
            className="w-full bg-slate-900/60 border border-slate-800/80 text-white text-sm rounded-xl pl-12 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all placeholder:text-slate-600 shadow-2xl"
          />
        </form>

        {/* Floating Search Results */}
        {showSearchDropdown && (
          <div className="absolute top-full left-0 mt-3 w-[450px] bg-slate-900/95 backdrop-blur-3xl border border-white/[0.08] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-white/[0.04] bg-white/[0.02]">
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Résultats de recherche rapide</h5>
            </div>
            
            <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-2 space-y-1">
              {isSearching ? (
                 <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                    <div className="h-5 w-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-xs">Recherche en cours...</span>
                 </div>
              ) : (searchResults.agencies.length === 0 && searchResults.contents.length === 0) ? (
                <div className="p-8 text-center text-slate-500 text-xs">Aucun résultat pour "{searchQuery}"</div>
              ) : (
                <>
                  {/* Agency Results */}
                  {searchResults.agencies.map((agency) => (
                    <button 
                      key={agency._id || agency.id}
                      onClick={() => { router.push('/dashboard/admin/agencies'); setShowSearchDropdown(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] text-left transition-colors group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                        <Building2 size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate">{agency.name}</p>
                        <p className="text-[10px] text-slate-500">Agence · {agency.location || "Locale"}</p>
                      </div>
                      <ArrowRight size={14} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  ))}

                  {/* Content Results */}
                  {searchResults.contents.map((item) => (
                    <button 
                      key={item._id || item.id}
                      onClick={() => { router.push('/dashboard/admin/content'); setShowSearchDropdown(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] text-left transition-colors group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <FileVideo size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-500 uppercase">Média · {item.type}</p>
                      </div>
                      <ArrowRight size={14} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  ))}
                  
                  <button 
                    onClick={handleSearchSubmit}
                    className="w-full mt-2 p-2.5 text-center text-xs font-semibold text-blue-400 hover:text-blue-300 border-t border-white/[0.04] transition-colors"
                  >
                    Voir tous les résultats pour "{searchQuery}"
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-5">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`relative p-2.5 text-slate-400 hover:text-white transition-all rounded-xl border ${
              isNotificationsOpen ? 'bg-slate-900 border-white/[0.1]' : 'border-transparent hover:bg-slate-900'
            }`}
          >
            <Bell size={20} />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-[#0f172a] shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
            )}
          </button>

          {/* Notifications Center */}
          {isNotificationsOpen && (
            <>
              <div className="fixed inset-0 z-[-1]" onClick={() => setIsNotificationsOpen(false)} />
              <div className="absolute right-0 mt-3 w-80 bg-slate-900/95 backdrop-blur-3xl border border-white/[0.08] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-white/[0.04] bg-white/[0.02] flex justify-between items-center">
                  <h5 className="text-xs font-bold text-white">Notifications Center</h5>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {notifications.filter(n => !n.read).length} New
                  </span>
                </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3 rounded-xl transition-all cursor-pointer border ${
                        notif.read ? 'bg-transparent border-transparent opacity-60' : 'bg-white/[0.03] border-white/[0.04] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex gap-3">
                         <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                           notif.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                           notif.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                         }`}>
                           {notif.type === 'success' ? <CheckCircle2 size={14} /> : 
                            notif.type === 'error' ? <AlertCircle size={14} /> : <Mail size={14} />}
                         </div>
                         <div className="min-w-0">
                           <p className="text-[11px] font-bold text-slate-200 leading-snug">{notif.title}</p>
                           <div className="flex items-center gap-1.5 mt-1 text-[9px] text-slate-500">
                             <Clock size={10} />
                             {notif.time}
                           </div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full p-3 text-center text-[10px] font-bold text-slate-500 hover:text-white bg-white/[0.02] border-t border-white/[0.04] transition-colors">
                  Vider toutes les notifications
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="h-8 w-px bg-white/[0.06] mx-2"></div>

        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-3 p-1.5 pr-4 rounded-full transition-all duration-300 border ${
              isProfileOpen 
                ? "bg-slate-900 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                : "bg-slate-900/40 border-slate-800/50 hover:border-blue-500/30 hover:bg-slate-900/80"
            }`}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
              <User size={16} />
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-[11px] font-bold text-slate-100 truncate max-w-[120px]">
                {userData.fullname || userData.name || "Administrateur"}
              </span>
              <span className="text-[9px] font-medium text-slate-500 truncate max-w-[120px]">
                {userData.email || "session active"}
              </span>
            </div>
            <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <>
              <div 
                className="fixed inset-0 z-[-1]" 
                onClick={() => setIsProfileOpen(false)} 
              />
              <div className="absolute right-0 mt-3 w-80 bg-slate-900/95 backdrop-blur-3xl border border-white/[0.08] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* User Info Header */}
                <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 border-b border-white/[0.04]">
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                        <User size={24} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{userData.fullname || userData.name || "Administrateur"}</h4>
                        <p className="text-xs text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                          <Mail size={12} className="text-blue-500/70" />
                          {userData.email || "session active"}
                        </p>
                      </div>
                   </div>
                </div>

                {/* Actions */}
                <div className="p-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-red-400 hover:text-white hover:bg-red-500 transition-all duration-300 group/logout"
                  >
                    <div className="flex items-center gap-1.5">
                      <LogOut size={18} className="group-hover/logout:-translate-x-1 transition-transform" />
                      <span className="text-sm font-semibold">Déconnexion</span>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
