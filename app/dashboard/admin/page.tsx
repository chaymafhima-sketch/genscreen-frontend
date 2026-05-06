"use client";

import Stats from "./components/Stats";
import ContentManager from "./components/ContentManager";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";
import { Search } from "lucide-react";

export default function AdminDashboard() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{t.dashboard.overview}</h1>
          <p className="text-muted-foreground mt-2">{t.dashboard.overview_subtitle}</p>
        </div>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
            if (q.trim()) window.location.href = `/dashboard/search?q=${encodeURIComponent(q)}`;
          }}
          className="relative w-full max-w-md group"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search size={18} />
          </div>
          <input
            name="q"
            type="text"
            placeholder={t.dashboard.search}
            className="w-full bg-card border border-border text-foreground text-sm rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40 shadow-sm"
          />
        </form>
      </div>

      <Stats />

      <div className="pt-4">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          {t.dashboard.recent_activity}
          <div className="h-px bg-border flex-1 ml-4 decoration-slice"></div>
        </h2>
        <ContentManager />
      </div>
    </div>
  );
}
