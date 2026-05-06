"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Search, Building2, FileVideo, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { t } = useLanguage();
  const [results, setResults] = useState<{ etablissements: any[], contents: any[] }>({ etablissements: [], contents: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [resetablissements, resContent] = await Promise.all([
          fetch("/api/backend/etablissements", { cache: "no-store" }),
          fetch("/api/backend/content", { cache: "no-store" }),
        ]);
        const etablissements = resetablissements.ok ? await resetablissements.json() : [];
        const content = resContent.ok ? await resContent.json() : [];

        setResults({
          etablissements: etablissements.filter((a: any) =>
            a.name?.toLowerCase().includes(query.toLowerCase()) ||
            a.location?.toLowerCase().includes(query.toLowerCase())
          ),
          contents: content.filter((c: any) =>
            c.title?.toLowerCase().includes(query.toLowerCase()) ||
            c.type?.toLowerCase().includes(query.toLowerCase())
          ),
        });
      } catch (err) {
        console.error("Erreur recherche", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [query]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Search size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {t.dashboard.search.replace("...", "")} &ldquo;{query}&rdquo;
          </h1>
          <p className="text-muted-foreground mt-1">
            {results.etablissements.length + results.contents.length} {t.common.no_data.includes("Aucune") ? "résultats" : "results"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="animate-spin text-primary mb-4" size={32} />
          <p>{t.common.loading}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Building2 size={20} className="text-indigo-400" />
              {t.dashboard.etablissements} ({results.etablissements.length})
            </h2>
            <div className="space-y-3">
              {results.etablissements.length > 0 ? results.etablissements.map((etablissement) => (
                <Link key={etablissement._id || etablissement.id} href="/dashboard/admin/etablissement">
                  <div className="group bg-muted/30 border border-border p-4 rounded-xl hover:border-primary/50 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground mb-0.5">{etablissement.name}</h4>
                        <p className="text-xs text-muted-foreground">{etablissement.city || "—"}</p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              )) : (
                <div className="p-8 bg-muted/20 rounded-xl border border-dashed border-border text-center text-muted-foreground text-sm">
                  {t.common.no_data}
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <FileVideo size={20} className="text-emerald-400" />
              {t.dashboard.content} ({results.contents.length})
            </h2>
            <div className="space-y-3">
              {results.contents.length > 0 ? results.contents.map((item) => (
                <Link key={item._id || item.id} href="/dashboard/admin/content">
                  <div className="group bg-muted/30 border border-border p-4 rounded-xl hover:border-primary/50 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                        <FileVideo size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground mb-0.5">{item.title}</h4>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">{item.type}</p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              )) : (
                <div className="p-8 bg-muted/20 rounded-xl border border-dashed border-border text-center text-muted-foreground text-sm">
                  {t.common.no_data}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-muted-foreground"><Loader2 className="animate-spin mx-auto" size={32} /></div>}>
      <SearchContent />
    </Suspense>
  );
}
