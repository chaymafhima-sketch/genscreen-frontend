"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MonitorPlay, ChevronRight, LogOut, User, Mail } from "lucide-react";
import React from "react";

export interface SidebarLinkType {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function Sidebar({ links, role }: { links: SidebarLinkType[], role: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const [userData, setUserData] = React.useState<{name?: string, fullname?: string, email?: string}>({});

  React.useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        setUserData(JSON.parse(user));
      } catch (e) {
        console.error("Erreur sidebar user data", e);
      }
    }
  }, []);

  // On considère un lien actif si :
  // 1. C'est le lien "Vue d'ensemble" (exactement /dashboard/admin ou /dashboard/chef)
  // 2. Ou si l'URL actuelle commence par ce lien (pour les sous-pages des autres sections)
  const checkActive = (href: string) => {
    if (href === "/dashboard/admin" || href === "/dashboard/chef") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-slate-950 border-r border-slate-800/50 flex flex-col z-40">
      {/* Branding Area */}
      <div className="p-8 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <MonitorPlay size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight leading-none">TUS</h2>
            <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest shadow-sm">
              <div className="w-1 h-1 rounded-full bg-blue-400 mr-1.5 animate-pulse" />
              {role}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto custom-scrollbar">
        {links.map((link) => {
          const active = checkActive(link.href);
          return (
            <Link key={link.href} href={link.href} className="block">
              <div
                className={`
                  group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 relative
                  ${active 
                    ? "bg-gradient-to-r from-blue-600/15 to-transparent text-blue-400 border-l border-blue-500 shadow-[inset_1px_0_0_0_rgba(59,130,246,0.5)]" 
                    : "text-slate-400 hover:text-white hover:bg-slate-900/50 border-l border-transparent"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`${active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"} transition-colors`}>
                    {link.icon}
                  </div>
                  <span className="text-sm font-medium">{link.label}</span>
                </div>

                {active ? (
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                ) : (
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all text-slate-600" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-6 border-t border-slate-900/50 bg-slate-950/50">
        <div className="bg-slate-900/40 rounded-2xl p-4 border border-slate-800/30 backdrop-blur-sm shadow-inner group/user">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 group-hover/user:border-blue-500/30 transition-colors shrink-0">
               <User size={20} />
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
      </div>
    </aside>
  );
}
