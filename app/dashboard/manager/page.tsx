"use client";

import { useLanguage } from "@/lib/dictionaries/LanguageContext";
import Stats from "../admin/components/Stats"; // Reusing the component for now, it should handle roles

export default function ManagerDashboard() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{t.dashboard.overview}</h1>
          <p className="text-muted-foreground mt-2">{t.dashboard.overview_subtitle}</p>
        </div>
        
        <div className="hidden md:block" />
      </div>

      <Stats />
    </div>
  );
}
