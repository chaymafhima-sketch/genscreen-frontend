"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Search, Building2, FileVideo, UserCheck, MonitorSmartphone, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<{ agencies: any[]; contents: any[]; users: any[]; screens: any[] }>({
    agencies: [],
    contents: [],
    users: [],
    screens: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    const run = async () => {
      setLoading(true);
      try {
        const [resAgencies, resContent, resUsers, resScreens] = await Promise.all([
          fetch("/api/backend/agencies", { cache: "no-store" }),
          fetch("/api/backend/content", { cache: "no-store" }),
          fetch("/api/backend/users", { cache: "no-store" }),
          fetch("/api/backend/screens", { cache: "no-store" }),
        ]);

        const agencies = resAgencies.ok ? await resAgencies.json() : [];
        const contents = resContent.ok ? await resContent.json() : [];
        const users = resUsers.ok ? await resUsers.json() : [];
        const screens = resScreens.ok ? await resScreens.json() : [];

        const q = query.toLowerCase();
        setResults({
          agencies: agencies.filter((a: any) => `${a.name || ""} ${a.city || ""} ${a.address || ""}`.toLowerCase().includes(q)),
          contents: contents.filter((c: any) => `${c.title || ""} ${c.type || ""}`.toLowerCase().includes(q)),
          users: users.filter((u: any) => `${u.fullname || u.name || ""} ${u.email || ""} ${u.role || ""}`.toLowerCase().includes(q)),
          screens: screens.filter((s: any) => `${s.name || ""} ${s.status || ""} ${s.ip || ""}`.toLowerCase().includes(q)),
        });
      } catch (err) {
        console.error("Erreur recherche globale", err);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [query]);

  const total = results.agencies.length + results.contents.length + results.users.length + results.screens.length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Search size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Résultats pour "{query}"</h1>
          <p className="text-muted-foreground mt-1">{total} correspondances trouvées.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="animate-spin text-primary mb-4" size={32} />
          <p>Recherche en cours...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="soft-card p-5">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2 mb-4"><Building2 size={18} className="text-primary" /> Agences ({results.agencies.length})</h2>
            <div className="space-y-2">
              {results.agencies.length ? results.agencies.map((a) => (
                <Link key={a._id || a.id} href="/dashboard/admin/agencies" className="block p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between"><p className="text-sm font-medium text-foreground">{a.name}</p><ArrowRight size={14} className="text-muted-foreground" /></div>
                </Link>
              )) : <p className="text-xs text-muted-foreground">Aucune agence trouvée.</p>}
            </div>
          </section>

          <section className="soft-card p-5">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2 mb-4"><FileVideo size={18} className="text-emerald-500" /> Contenus ({results.contents.length})</h2>
            <div className="space-y-2">
              {results.contents.length ? results.contents.map((c) => (
                <Link key={c._id || c.id} href="/dashboard/admin/content" className="block p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between"><p className="text-sm font-medium text-foreground">{c.title}</p><ArrowRight size={14} className="text-muted-foreground" /></div>
                </Link>
              )) : <p className="text-xs text-muted-foreground">Aucun contenu trouvé.</p>}
            </div>
          </section>

          <section className="soft-card p-5">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2 mb-4"><UserCheck size={18} className="text-amber-500" /> Chefs d'agence ({results.users.length})</h2>
            <div className="space-y-2">
              {results.users.length ? results.users.map((u) => (
                <Link key={u._id || u.id} href="/dashboard/admin/users" className="block p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between"><p className="text-sm font-medium text-foreground">{u.fullname || u.name || u.email}</p><ArrowRight size={14} className="text-muted-foreground" /></div>
                </Link>
              )) : <p className="text-xs text-muted-foreground">Aucun utilisateur trouvé.</p>}
            </div>
          </section>

          <section className="soft-card p-5">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2 mb-4"><MonitorSmartphone size={18} className="text-violet-500" /> Écrans ({results.screens.length})</h2>
            <div className="space-y-2">
              {results.screens.length ? results.screens.map((s) => (
                <Link key={s._id || s.id} href="/dashboard/admin/screens" className="block p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between"><p className="text-sm font-medium text-foreground">{s.name}</p><ArrowRight size={14} className="text-muted-foreground" /></div>
                </Link>
              )) : <p className="text-xs text-muted-foreground">Aucun écran trouvé.</p>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-muted-foreground">Chargement...</div>}>
      <SearchContent />
    </Suspense>
  );
}

