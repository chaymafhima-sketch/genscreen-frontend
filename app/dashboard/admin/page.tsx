import Stats from "./components/Stats";
import ContentManager from "./components/ContentManager";

export default function AdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Vue d'ensemble</h1>
        <p className="text-slate-400 mt-2">Bienvenue sur votre tableau de bord centralisé.</p>
      </div>

      <Stats />

      <div className="pt-4">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          Activité récente
          <div className="h-px bg-slate-800/60 flex-1 ml-4 decoration-slice"></div>
        </h2>
        <ContentManager />
      </div>
    </div>
  );
}