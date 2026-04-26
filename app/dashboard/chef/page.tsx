"use client";

import { useEffect, useState } from "react";
import Stats from "../admin/components/Stats"; // Reusing the same premium cards
import { 
  Plus, 
  Send, 
  MonitorSmartphone, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  Activity,
  FileVideo,
  LayoutDashboard,
  Building,
  Loader2,
  AlertCircle,
  Globe
} from "lucide-react";
import Link from "next/link";

export default function ChefDashboard() {
  const [userData, setUserData] = useState<{name?: string, fullname?: string, role?: string, canDiffuse?: boolean, address?: string, city?: string}>({});
  const [loading, setLoading] = useState(true);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loadingAgencies, setLoadingAgencies] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      let currentUser = userData;

      try {
        const res = await fetch("/api/backend/users/profile", { cache: "no-store" });
        if (res.ok) {
          const latestUser = await res.json();
          setUserData(latestUser);
          currentUser = latestUser;
        }
      } catch (e) {
        console.error("Erreur profile fetch", e);
      }
      setLoading(false);

      // Fetch Agencies
      try {
        const res = await fetch("/api/backend/agencies", { cache: "no-store" });
        if (res.ok) {
          // Backend should already return only agencies assigned to current chef
          const assignedAgencies = await res.json();
          setAgencies(assignedAgencies || []);
        }
      } catch (e) {
        console.error("Erreur fetch agencies", e);
      } finally {
        setLoadingAgencies(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight flex items-center gap-3">
             <LayoutDashboard size={32} className="text-primary" />
             Salut, {userData.fullname || userData.name || "Manager"} !
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-muted-foreground text-lg">Gérez vos écrans et diffusez vos messages en direct sur vos agences.</p>
            {userData.city && (
              <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <Globe size={12} /> Zone : {userData.city}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <Stats />

      {/* Local Content & Screens Summary */}
      <div className="grid grid-cols-1 gap-8">
        {/* Managed Screens Activity */}
        <div className="soft-card p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <MonitorSmartphone size={22} className="text-indigo-500" />
              Mes Agences ({agencies.length})
            </h3>
            <Link href="/dashboard/chef/screens" className="text-xs font-bold text-primary hover:opacity-80 uppercase tracking-widest flex items-center gap-1 group">
              Écrans <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="space-y-4">
             {loadingAgencies ? (
               <div className="flex flex-col items-center py-10 text-muted-foreground animate-pulse">
                 <Loader2 className="animate-spin mb-2" size={24} />
                 <p className="text-xs">Recherche de vos agences...</p>
               </div>
             ) : agencies.length > 0 ? (
               agencies.map((agency, i) => (
                 <div key={agency._id || i} className="bg-muted/30 border border-border/40 p-4 rounded-2xl flex items-center justify-between transition-all hover:border-primary/30 group">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Building size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-foreground">{agency.name}</p>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-tight">{agency.city || "Ville non renseignée"}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{agency.address}</p>
                       </div>
                    </div>
                    <Activity size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                 </div>
               ))
             ) : (
               <div className="flex flex-col items-center py-10 text-center px-6">
                 <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                   <AlertCircle size={24} className="text-muted-foreground" />
                 </div>
                 <p className="text-sm font-bold text-foreground">Aucune agence assignée</p>
                 <p className="text-xs text-muted-foreground mt-1">Vos agences s'afficheront ici en fonction de votre ville : <span className="font-bold text-primary">{userData.city || "Non définie"}</span></p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}