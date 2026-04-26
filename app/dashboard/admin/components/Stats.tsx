"use client";

import { useEffect, useState } from "react";
import { 
  Building2, 
  UserCheck,
  FileVideo, 
  TrendingUp, 
  MonitorSmartphone,
  ArrowUpRight
} from "lucide-react";

export default function Stats() {
  const [data, setData] = useState({ contents: 0, agencies: 0, users: 0, screens: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resContent, resAgencies, resUsers, resScreens] = await Promise.all([
          fetch("/api/backend/content", { cache: "no-store" }),
          fetch("/api/backend/agencies", { cache: "no-store" }),
          fetch("/api/backend/users", { cache: "no-store" }),
          fetch("/api/backend/screens", { cache: "no-store" }),
        ]);

        const contents = resContent.ok ? await resContent.json() : [];
        const agencies = resAgencies.ok ? await resAgencies.json() : [];
        const users = resUsers.ok ? await resUsers.json() : [];
        const screens = resScreens.ok ? await resScreens.json() : [];

        setData({
          contents: contents.length,
          agencies: agencies.length,
          users: users.filter((u: any) => u.role === "chef").length,
          screens: screens.length,
        });

      } catch (err) {
        console.error("Erreur stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      title: "Agences Partenaires",
      value: loading ? "..." : data.agencies.toString(),
      trend: "Réseau",
      trendUp: true,
      icon: <Building2 size={20} />,
      color: "text-indigo-400",
      bgBase: "bg-indigo-400/10",
      borderBase: "border-indigo-400/20",
      glow: "shadow-indigo-500/10",
    },
    {
      title: "Chefs d'Agence",
      value: loading ? "..." : data.users.toString(),
      trend: "Utilisateurs",
      trendUp: true,
      icon: <UserCheck size={20} />,
      color: "text-amber-500",
      bgBase: "bg-amber-500/10",
      borderBase: "border-amber-500/20",
      glow: "shadow-amber-500/10",
    },
    {
      title: "Médias Diffusés",
      value: loading ? "..." : data.contents.toString(),
      trend: "Bibliothèque",
      trendUp: true,
      icon: <FileVideo size={20} />,
      color: "text-emerald-400",
      bgBase: "bg-emerald-400/10",
      borderBase: "border-emerald-400/20",
      glow: "shadow-emerald-500/10",
    },
    {
      title: "Écrans enregistrés",
      value: loading ? "..." : data.screens.toString(),
      trend: "Parc",
      trendUp: true,
      icon: <MonitorSmartphone size={20} />,
      color: "text-violet-500",
      bgBase: "bg-violet-500/10",
      borderBase: "border-violet-500/20",
      glow: "shadow-violet-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="relative group soft-card p-6 transition-all duration-300 hover:-translate-y-1"
        >
          {/* Subtle Top Glow */}
          {/* Subtle Top Glow */}
          <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent opacity-0 group-hover:opacity-60 transition-opacity`} />

          <div className="flex justify-between items-start mb-6">
            <div className={`p-2.5 rounded-lg border ${stat.bgBase} ${stat.borderBase} ${stat.color} shadow-inner transition-transform group-hover:scale-110 duration-300`}>
              {stat.icon}
            </div>
            
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight uppercase border ${
              stat.trendUp 
                ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/10' 
                : 'text-red-500 bg-red-400/10 border-red-500/10'
            }`}>
              {stat.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {stat.trend}
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase opacity-70">
              {stat.title}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-foreground tracking-tight">
                {stat.value}
              </span>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 text-muted-foreground opacity-0 group-hover:opacity-40 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
             <ArrowUpRight size={24} />
          </div>
        </div>
      ))}
    </div>
  );
}