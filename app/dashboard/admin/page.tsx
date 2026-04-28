"use client";

import Stats from "./components/Stats";
import ContentManager from "./components/ContentManager";

export default function AdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Vue d&apos;ensemble</h1>
          <p className="text-muted-foreground mt-2">Bienvenue sur votre tableau de bord centralisé.</p>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input
            name="q"
            type="text"
            placeholder="Rechercher établissements, écrans, contenus..."
            className="w-full bg-card border border-border text-foreground text-sm rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40 shadow-sm"
          />
        </form>
      </div>

      <Stats />

      <div className="pt-4">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          Activité récente
          <div className="h-px bg-border flex-1 ml-4 decoration-slice"></div>
        </h2>
        <ContentManager />
      </div>
    </div>
  );
}
