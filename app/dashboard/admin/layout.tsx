"use client";

import Sidebar, { SidebarLinkType } from "../manager/components/Sidebar"
import Header from "../manager/components/Header"
import { LayoutDashboard, Building2, MonitorSmartphone, FileVideo, Activity, UserCheck, User } from "lucide-react";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();

  const adminLinks: SidebarLinkType[] = [
    { href: "/dashboard/admin", label: t.dashboard.overview, icon: <LayoutDashboard size={20} /> },
    { href: "/dashboard/admin/etablissement", label: t.dashboard.etablissements, icon: <Building2 size={20} /> },
    { href: "/dashboard/admin/users", label: t.dashboard.managers, icon: <UserCheck size={20} /> },
    { href: "/dashboard/admin/screens", label: t.dashboard.screens, icon: <MonitorSmartphone size={20} /> },
    { href: "/dashboard/admin/content", label: t.dashboard.content, icon: <FileVideo size={20} /> },
    { href: "/dashboard/admin/logs", label: t.dashboard.history, icon: <Activity size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300">
      <Sidebar links={adminLinks} role={t.dashboard.admin} />
      <div className="flex-1 ml-72 relative flex flex-col min-h-screen">
        <Header />
        <main className="p-8 flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
