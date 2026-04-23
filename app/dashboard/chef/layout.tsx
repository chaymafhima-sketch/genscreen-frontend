"use client";

import React, { useState, useEffect } from "react";
import Sidebar, { SidebarLinkType } from "../components/Sidebar";
import Header from "../components/Header";
import { LayoutDashboard, Building2, MonitorSmartphone, FileVideo } from "lucide-react";

export default function ChefLayout({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = React.useState<any>({});

  React.useEffect(() => {
     const fetchProfile = async () => {
       const token = localStorage.getItem("token");
       if (token) {
         try {
           const res = await fetch("http://localhost:3001/users/profile", {
             headers: { "Authorization": `Bearer ${token}` }
           });
           if (res.ok) {
             const data = await res.json();
             setUserData(data);
           }
         } catch (e) {
           console.error("Layout profile fetch failed", e);
         }
       }
     };
     fetchProfile();
  }, []);

  const chefLinks: SidebarLinkType[] = [
    { href: "/dashboard/chef", label: "Vue d'ensemble", icon: <LayoutDashboard size={20} /> },
    { href: "/dashboard/chef/agencies", label: "Mes Agences", icon: <Building2 size={20} /> },
    { href: "/dashboard/chef/screens", label: "Mes Écrans", icon: <MonitorSmartphone size={20} /> },
    ...(userData.canDiffuse ? [{ href: "/dashboard/chef/content", label: "Mes Contenus", icon: <FileVideo size={20} /> }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300">
      <Sidebar links={chefLinks} role="Chef d'Agence" />
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
