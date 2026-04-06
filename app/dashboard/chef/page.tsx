export default function ChefDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Espace Chef d'Agence</h1>
        <p className="text-slate-400 mt-2">Gérez vos agences, écrans et contenus en toute simplicité.</p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 p-8 rounded-2xl shadow-xl flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <p className="text-slate-400 text-lg">Sélectionnez une option dans le menu pour commencer.</p>
        </div>
      </div>
    </div>
  );
}