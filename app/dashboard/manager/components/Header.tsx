"use client";

import { useEffect, useState, useRef } from "react";
import {
  LogOut,
  Search,
  User,
  Mail,
  ChevronDown,
  Building2,
  FileVideo,
  MonitorSmartphone,
  UserCheck,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const showSearch = pathname.startsWith("/dashboard");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: session } = useSession();
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

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    etablissements: any[];
    contents: any[];
    users: any[];
    screens: any[];
  }>({ etablissements: [], contents: [], users: [], screens: [] });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notifications State Removed

  // Real-time search logic
  useEffect(() => {
    if (searchQuery.length < 1) {
      setSearchResults({
        etablissements: [],
        contents: [],
        users: [],
        screens: [],
      });
      setShowSearchDropdown(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      setShowSearchDropdown(true);
      try {
        const [resetablissements, resContent, resUsers, resScreens] =
          await Promise.all([
            fetch("/api/backend/etablissements", { cache: "no-store" }),
            fetch("/api/backend/content", { cache: "no-store" }),
            fetch("/api/backend/users", { cache: "no-store" }),
            fetch("/api/backend/screens", { cache: "no-store" }),
          ]);

        const etablissements = resetablissements.ok
          ? await resetablissements.json()
          : [];
        const contents = resContent.ok ? await resContent.json() : [];
        const users = resUsers.ok ? await resUsers.json() : [];
        const screens = resScreens.ok ? await resScreens.json() : [];

        const filteredetablissements = etablissements
          .filter((a: any) =>
            `${a.name || ""} ${a.city || ""} ${a.address || ""}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
          )
          .slice(0, 3);

        const filteredContents = contents
          .filter((c: any) =>
            `${c.title || ""} ${c.type || ""}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
          )
          .slice(0, 3);

        const filteredUsers = users
          .filter((u: any) =>
            `${u.fullname || u.name || ""} ${u.email || ""} ${u.role || ""}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
          )
          .slice(0, 3);

        const filteredScreens = screens
          .filter((s: any) =>
            `${s.name || ""} ${s.status || ""} ${s.ip || ""}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
          )
          .slice(0, 3);

        setSearchResults({
          etablissements: filteredetablissements,
          contents: filteredContents,
          users: filteredUsers,
          screens: filteredScreens,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  return (
    <header className="h-20 bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-50 px-8 flex items-center justify-between transition-colors duration-300">
      {/* Spacer to keep layout balanced */}
      <div className="hidden md:block w-1/3" />

      {/* Right Actions */}
      <div className="flex items-center gap-5">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2.5 text-muted-foreground hover:text-foreground transition-all rounded-xl border border-transparent hover:bg-muted focus:outline-none"
          aria-label="Toggle Dark Mode"
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )
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
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 active:scale-95 transition-transform">
              <User size={16} />
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-[11px] font-bold text-foreground truncate max-w-[120px]">
                {userData.fullname || userData.name || "Administrateur"}
              </span>
              <span className="text-[9px] font-medium text-muted-foreground truncate max-w-[120px]">
                {userData.email || "session active"}
              </span>
            </div>
            <ChevronDown
              size={14}
              className={`text-muted-foreground transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-[-1]"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-3 w-80 bg-card border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* User Info Header */}
                <div className="p-6 bg-muted/30 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                      <User size={24} className="text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate">
                        {userData.fullname || userData.name || "Administrateur"}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                        <Mail size={12} className="text-primary/70" />
                        {userData.email || "session active"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
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
                      <span className="text-sm font-semibold">Mon profil</span>
                    </div>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 group/logout"
                  >
                    <div className="flex items-center gap-1.5">
                      <LogOut
                        size={18}
                        className="group-hover/logout:-translate-x-1 transition-transform"
                      />
                      <span className="text-sm font-semibold">Déconnexion</span>
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
