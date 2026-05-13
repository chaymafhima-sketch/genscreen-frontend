"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  Building2, 
  UserCheck,
  FileVideo, 
  MonitorSmartphone,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";

export default function Stats() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [data, setData] = useState({ 
    contents: 0, 
    établissements: 0, 
    users: 0, 
    screens: 0,
    onlineScreens: 0,
    offlineScreens: 0
  });
  const [loading, setLoading] = useState(true);

  const isAdmin = (session as any)?.user?.role === "admin";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resContent, resetablissements, resUsers, resScreens] = await Promise.all([
          fetch("/api/backend/content", { cache: "no-store" }),
          fetch("/api/backend/etablissements", { cache: "no-store" }),
          fetch("/api/backend/users", { cache: "no-store" }),
          fetch("/api/backend/screens", { cache: "no-store" }),
        ]);

        const contents = resContent.ok ? await resContent.json() : [];
        const etablissements = resetablissements.ok ? await resetablissements.json() : [];
        const users = resUsers.ok ? await resUsers.json() : [];
        const screens = resScreens.ok ? await resScreens.json() : [];

        const online = screens.filter((s: any) => s.status === "Online" || s.status === "online").length;
        const offline = screens.length - online;

        setData({
          contents: contents.length,
          établissements: etablissements.length,
          users: users.filter((u: any) => u.role === "manager").length,
          screens: screens.length,
          onlineScreens: online,
          offlineScreens: offline,
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
      title: t.dashboard.stats.partners,
      value: loading ? "..." : data.établissements.toString(),
      icon: <Building2 size={24} />,
      color: "text-indigo-400",
      bgBase: "bg-indigo-400/10",
      borderBase: "border-indigo-400/20",
      glow: "shadow-indigo-500/10",
    },
    {
      title: t.dashboard.stats.managers,
      value: loading ? "..." : data.users.toString(),
      icon: <UserCheck size={24} />,
      color: "text-amber-500",
      bgBase: "bg-amber-500/10",
      borderBase: "border-amber-500/20",
      glow: "shadow-amber-500/10",
    },
    {
      title: t.dashboard.stats.broadcasted,
      value: loading ? "..." : data.contents.toString(),
      icon: <FileVideo size={24} />,
      color: "text-success",
      bgBase: "bg-success/10",
      borderBase: "border-success/20",
      glow: "shadow-success/10",
    },
    {
      title: t.dashboard.stats.registered_screens,
      value: loading ? "..." : data.screens.toString(),
      icon: <MonitorSmartphone size={24} />,
      color: "text-violet-500",
      bgBase: "bg-violet-500/10",
      borderBase: "border-violet-500/20",
      glow: "shadow-violet-500/10",
    },
    {
      title: t.screens.stats.operational,
      value: loading ? "..." : data.onlineScreens.toString(),
      icon: <Wifi size={24} />,
      color: "text-success",
      bgBase: "bg-success/10",
      borderBase: "border-success/20",
      glow: "shadow-success/10",
    },
    {
      title: t.screens.stats.offline,
      value: loading ? "..." : data.offlineScreens.toString(),
      icon: <WifiOff size={24} />,
      color: "text-red-500",
      bgBase: "bg-red-500/10",
      borderBase: "border-red-500/20",
      glow: "shadow-red-500/10",
    },
  ].filter(stat => isAdmin || stat.title !== t.dashboard.stats.managers);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="relative group soft-card p-6 transition-all duration-300 hover:-translate-y-1"
        >
          <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent opacity-0 group-hover:opacity-60 transition-opacity`} />

          <div className="space-y-4">
            <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
              {stat.title}
            </h3>
            
            <div className="flex items-end justify-between pr-14">
              <div className={`p-3 rounded-xl border ${stat.bgBase} ${stat.borderBase} ${stat.color} shadow-inner transition-transform group-hover:scale-110 duration-300`}>
                {stat.icon}
              </div>

              <span className="text-4xl font-bold text-foreground tracking-tight">
                {stat.value}
              </span>
            </div>
          </div>


        </div>
      ))}
    </div>
  );
}
