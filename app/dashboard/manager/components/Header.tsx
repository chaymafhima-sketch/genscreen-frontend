"use client";

import { useEffect, useState, useRef } from "react";
import {
  LogOut,
  User,
  Mail,
  ChevronDown,
  Sun,
  Moon,
  Search,
  Command,
  Menu,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";
import LanguageToggle from "@/app/components/LanguageToggle";

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: session } = useSession();
  const { t } = useLanguage();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isOverviewPage = pathname === "/dashboard/admin" || pathname === "/dashboard/manager";

  useEffect(() => {
    if (!isOverviewPage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOverviewPage]);

  const userData = ((session as any)?.user || {}) as {
    name?: string;
    fullname?: string;
    email?: string;
    role?: string;
  };
  const profilePath =
    userData.role === "admin"
      ? "/dashboard/admin/profile"
      : "/dashboard/manager/profile";

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="h-20 bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-50 px-8 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-2 md:w-1/3">
        {/* Bouton menu (mobile uniquement) */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-1 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors focus:outline-none"
          aria-label="Ouvrir le menu"
        >
          <Menu size={22} />
        </button>
        <div className="hidden md:flex w-full items-center">
        {isOverviewPage && (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
              if (q.trim()) router.push(`/dashboard/search?q=${encodeURIComponent(q)}`);
            }}
            className="relative w-full max-w-sm lg:max-w-md group transition-all duration-300 focus-within:max-w-xl"
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search size={18} />
            </div>
            <input
              ref={searchInputRef}
              name="q"
              type="text"
              placeholder={t.dashboard.search}
              className="w-full bg-muted/40 border border-border/50 text-foreground text-sm rounded-xl pl-12 pr-12 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-background transition-all placeholder:text-muted-foreground/50 shadow-inner"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted border border-border rounded-md shadow-sm group-focus-within:opacity-0 transition-opacity">
                <Command size={10} /> K
              </kbd>
            </div>
          </form>
        )}
        </div>
      </div>

      <div className="flex items-center gap-5">
        <LanguageToggle />

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2.5 text-muted-foreground hover:text-foreground transition-all rounded-xl border border-transparent hover:bg-muted focus:outline-none"
          aria-label="Toggle Dark Mode"
        >
          {mounted ? (
            theme === "dark" ? <Sun size={20} /> : <Moon size={20} />
          ) : (
            <div className="w-5 h-5" />
          )}
        </button>

        <div className="h-8 w-px bg-border mx-2"></div>

        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-3 p-1.5 pr-4 rounded-full transition-all duration-300 border ${
              isProfileOpen
                ? "bg-muted border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                : "bg-card border-border hover:border-primary/30 hover:bg-muted"
            }`}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <User size={16} />
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-[11px] font-bold text-foreground truncate max-w-[120px]">
                {userData.fullname || userData.name || (userData.role === "admin" ? t.dashboard.admin : t.dashboard.manager)}
              </span>
              <span className="text-[9px] font-medium text-muted-foreground truncate max-w-[120px]">
                {userData.email || "Session active"}
              </span>
            </div>
            <ChevronDown
              size={14}
              className={`text-muted-foreground transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-[-1]" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 mt-3 w-80 bg-card border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 bg-muted/30 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                      <User size={24} className="text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate">
                        {userData.fullname || userData.name || (userData.role === "admin" ? t.dashboard.admin : t.dashboard.manager)}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                        <Mail size={12} className="text-primary/70" />
                        {userData.email || "---"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      router.push(profilePath);
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-foreground hover:bg-muted transition-all duration-300"
                  >
                    <div className="flex items-center gap-1.5">
                      <User size={18} />
                      <span className="text-sm font-semibold">{t.common.profile}</span>
                    </div>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-destructive hover:bg-destructive hover:text-white transition-all duration-300 group/logout"
                  >
                    <div className="flex items-center gap-1.5">
                      <LogOut size={18} className="group-hover/logout:-translate-x-1 transition-transform" />
                      <span className="text-sm font-semibold">{t.common.logout}</span>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
