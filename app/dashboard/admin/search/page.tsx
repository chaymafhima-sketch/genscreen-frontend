"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Search, Building2, FileVideo, User, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<{ etablissements: any[], contents: any[] }>({ etablissements: [], contents: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;
    
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [resetablissements, resContent] = await Promise.all([
          fetch("/api/backend/etablissements", { cache: "no-store" }),
          fetch("/api/backend/content", { cache: "no-store" })
        ]);

        const etablissements = resetablissements.ok ? await resetablissements.json() : [];
        const content = resContent.ok ? await resContent.json() : [];

        // Filter locally
        const filteredetablissements = etablissements.filter((a: any) => 
          a.name?.toLowerCase().includes(query.toLowerCase()) || 
          a.location?.toLowerCase().includes(query.toLowerCase())
        );

        const filteredContent = content.filter((c: any) => 
          c.title?.toLowerCase().includes(query.toLowerCase()) || 
          c.type?.toLowerCase().includes(query.toLowerCase())
        );

        setResults({ etablissements: filteredetablissements, contents: filteredContent });
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
      <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
        <div className="h-12 w-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400">
          <Search size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Résultats pour "{query}"</h1>
          <p className="text-slate-400 mt-1">
            {results.etablissements.length + results.contents.length} correspondances trouvées.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
          <p>Recherche en cours...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* etablissements Results */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Building2 size={20} className="text-indigo-400" />
              �tablissements ({results.etablissements.length})
            </h2>
            <div className="space-y-3">
              {results.etablissements.length > 0 ? results.etablissements.map((agency) => (
                <Link key={agency._id || agency.id} href="/dashboard/admin/etablissements">
                  <div className="group bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-4 rounded-xl hover:border-blue-500/50 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-slate-950 flex items-center justify-center text-slate-400">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-0.5">{agency.name}</h4>
                        <p className="text-xs text-slate-500">{agency.location || "Adresse non spécifiée"}</p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                  </div>
                </Link>
              )) : (
                <div className="p-8 bg-slate-900/20 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 text-sm">
                  Aucune �tablissement trouvée
                </div>
              )}
            </div>
          </section>

          {/* Content Results */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileVideo size={20} className="text-emerald-400" />
              Contenus ({results.contents.length})
            </h2>
            <div className="space-y-3">
              {results.contents.length > 0 ? results.contents.map((item) => (
                <Link key={item._id || item.id} href="/dashboard/admin/content">
                  <div className="group bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-4 rounded-xl hover:border-blue-500/50 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-lg bg-slate-950 flex items-center justify-center text-slate-400">
                        <FileVideo size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-0.5">{item.title}</h4>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">{item.type}</p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                  </div>
                </Link>
              )) : (
                <div className="p-8 bg-slate-900/20 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 text-sm">
                  Aucun contenu trouvé
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
    <Suspense fallback={<div className="p-20 text-center">Chargement...</div>}>
      <SearchContent />
    </Suspense>
  );
}
