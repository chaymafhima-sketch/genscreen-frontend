"use client";

import React, { useState, useEffect } from "react";
import Sidebar, { SidebarLinkType } from "./components/Sidebar";
import Header from "./components/Header";
import { LayoutDashboard, Building2, MonitorSmartphone, FileVideo, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = React.useState<any>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const { t } = useLanguage();

  React.useEffect(() => {
     const fetchProfile = async () => {
       try {
         const res = await fetch("/api/backend/users/profile", { cache: "no-store" });
         if (res.ok) {
           const data = await res.json();
           setUserData(data);
         } else {
           // fallback to session user if profile endpoint fails
           setUserData((session as any)?.user || {});
         }
       } catch (e) {
         console.error("Layout profile fetch failed", e);
         setUserData((session as any)?.user || {});
       }
     };
     fetchProfile();
  }, [session]);

  const managerLinks: SidebarLinkType[] = [
    { href: "/dashboard/manager/screens", label: t.dashboard.screens, icon: <MonitorSmartphone size={20} /> },
    { href: "/dashboard/manager/etablissement", label: t.dashboard.etablissements, icon: <Building2 size={20} /> },
    ...(userData.canDiffuse ? [{ href: "/dashboard/manager/content", label: t.dashboard.content, icon: <FileVideo size={20} /> }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300">
      <Sidebar links={managerLinks} role={t.dashboard.manager} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 md:ml-72 relative flex flex-col min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 md:p-8 flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
