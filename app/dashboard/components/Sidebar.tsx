"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MonitorPlay, ChevronRight, LogOut, User, Mail } from "lucide-react";
import React from "react";
import { signOut, useSession } from "next-auth/react";

export interface SidebarLinkType {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function Sidebar({ links, role }: { links: SidebarLinkType[], role: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session } = useSession();
  const userData = ((session as any)?.user || {}) as {name?: string, fullname?: string, email?: string};

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
    signOut({ callbackUrl: "/login" });
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-muted/50 border-r border-border flex flex-col z-40 transition-colors duration-300">
      {/* Branding Area */}
      <div className="p-8 border-b border-border transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <MonitorPlay size={20} className="text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary tracking-tight leading-none transition-colors duration-300">TUS</h2>
            <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest shadow-sm">
              <div className="w-1 h-1 rounded-full bg-primary mr-1.5 animate-pulse" />
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
                    ? "bg-primary/10 text-primary border-l-[3px] border-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted border-l-[3px] border-transparent"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"} transition-colors`}>
                    {link.icon}
                  </div>
                  <span className="text-sm font-medium">{link.label}</span>
                </div>

                {active ? (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                ) : (
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all text-muted-foreground/50" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>


    </aside>
  );
}
