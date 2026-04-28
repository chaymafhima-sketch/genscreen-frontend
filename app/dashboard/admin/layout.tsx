"use client";

import Sidebar, { SidebarLinkType } from "../manager/components/Sidebar"
import Header from "../manager/components/Header"
import { LayoutDashboard, Building2, MonitorSmartphone, FileVideo, Activity, UserCheck, User } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminLinks: SidebarLinkType[] = [
    { href: "/dashboard/admin", label: "Vue d'ensemble", icon: <LayoutDashboard size={20} /> },
    { href: "/dashboard/admin/etablissement", label: "Établissements", icon: <Building2 size={20} /> },
    { href: "/dashboard/admin/users", label: "Managers", icon: <UserCheck size={20} /> },
    { href: "/dashboard/admin/screens", label: "Écrans", icon: <MonitorSmartphone size={20} /> },
    { href: "/dashboard/admin/content", label: "Contenus", icon: <FileVideo size={20} /> },
    // { href: "/dashboard/admin/profile", label: "Profil", icon: <User size={20} /> },
    { href: "/dashboard/admin/logs", label: "Historique", icon: <Activity size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300">
      <Sidebar links={adminLinks} role="admin" />
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
