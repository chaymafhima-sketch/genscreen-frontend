"use client";

import { signOut } from "next-auth/react";
import LanguageToggle from "@/app/components/LanguageToggle";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";
import { LogOut } from "lucide-react";

export default function Header() {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80">
      <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
        {t.dashboard.admin}
      </h1>
      <div className="flex items-center gap-6">
        <LanguageToggle />
        <button
          onClick={() => {
            signOut({ callbackUrl: "/login" });
          }}
          className="flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-red-500/20"
        >
          <LogOut size={16} />
          {t.common.logout}
        </button>
      </div>
    </div>
  );
}
