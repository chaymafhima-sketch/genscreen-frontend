"use client";

import Sidebar, { SidebarLinkType } from "../components/Sidebar";
import Header from "../components/Header";
import { LayoutDashboard, Building2, MonitorSmartphone, FileVideo, Activity } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminLinks: SidebarLinkType[] = [
    { href: "/dashboard/admin", label: "Vue d'ensemble", icon: <LayoutDashboard size={20} /> },
    { href: "/dashboard/admin/agencies", label: "Agences", icon: <Building2 size={20} /> },
    { href: "/dashboard/admin/screens", label: "Écrans", icon: <MonitorSmartphone size={20} /> },
    { href: "/dashboard/admin/content", label: "Contenus", icon: <FileVideo size={20} /> },
    { href: "/dashboard/admin/logs", label: "Logs & Erreurs", icon: <Activity size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30">
      <Sidebar links={adminLinks} role="Administrateur" />
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