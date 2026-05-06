"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Loader2,
  Search,
  Globe,
  RefreshCcw,
  Phone,
} from "lucide-react";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";

export default function ManagerEtablissementsPage() {
  const { t } = useLanguage();
  const [etablissements, setEtablissements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMyetablissements = async () => {
    try {
      const res = await fetch("/api/backend/etablissements", { cache: "no-store" });
      if (res.ok) {
        setEtablissements(await res.json() || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyetablissements();
  }, []);

  const filteredetablissements = etablissements.filter((a) =>
    a.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">{t.etablissements.title}</h2>
          <p className="text-muted-foreground mt-2">{t.etablissements.subtitle}</p>
        </div>
        <div className="flex bg-muted p-1.5 rounded-2xl border border-border items-center gap-1">
          <div className="px-5 py-2 text-xs font-black text-primary uppercase tracking-widest">
            {filteredetablissements.length} {t.dashboard.etablissements}
          </div>
          <button onClick={fetchMyetablissements} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background transition-all active:rotate-180 duration-500" title={t.common.refresh}>
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"><Search size={20} /></div>
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.etablissements.search_placeholder} className="w-full bg-card border border-border rounded-2xl py-4 pl-14 pr-6 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-sm" />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : (
        <div className="soft-card overflow-hidden border border-border shadow-sm">
          {filteredetablissements.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-6 bg-muted/20">
              <Building2 size={48} className="text-muted-foreground/30 mb-4" />
              <p className="text-lg font-bold text-foreground">{t.common.no_data}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase">{t.etablissements.table.name}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase">{t.etablissements.table.location}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase">{t.etablissements.table.contact}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredetablissements.map((etablissement) => (
                    <tr key={etablissement.id || etablissement._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0"><Building2 size={20} /></div>
                          <p className="font-bold text-foreground leading-none">{etablissement.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-foreground font-bold text-sm"><Globe size={14} className="text-primary" /> {etablissement.city || "—"}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium"><Phone size={14} className="text-primary/60" /> {etablissement.phone || "—"}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
