"use client";

import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Activity, 
  Calendar, 
  User as UserIcon, 
  ShieldCheck, 
  Trash2, 
  Download, 
  Search, 
  Filter,
  Eye,
  RefreshCw,
  Terminal
} from "lucide-react";

type LogType = 'error' | 'warning' | 'info' | 'success';

interface LogEntry {
  id: string;
  type: LogType;
  action: string;
  source: string;
  user: string;
  timestamp: string;
  details: string;
}

const MOCK_LOGS: LogEntry[] = [
  { id: '1', type: 'error', action: 'Échec authentification', source: 'Auth', user: 'invité@test.com', timestamp: '2026-04-06 13:45:12', details: 'Tentative avec mot de passe erroné (3 fois).' },
  { id: '2', type: 'success', action: 'Création agence', source: 'Agencies', user: 'Admin', timestamp: '2026-04-06 13:40:05', details: 'Agence "Paris Centre" créée avec succès.' },
  { id: '3', type: 'info', action: 'Upload média', source: 'Content', user: 'Chef_Agence_01', timestamp: '2026-04-06 13:30:45', details: 'Fichier "promo_printemps.mp4" (45MB) en cours.' },
  { id: '4', type: 'warning', action: 'Connexion inhabituelle', source: 'Security', user: 'chef_02@tus.com', timestamp: '2026-04-06 12:55:00', details: 'Connexion depuis une IP non référencée.' },
  { id: '5', type: 'success', action: 'Mise à jour paramètres', source: 'System', user: 'Admin', timestamp: '2026-04-06 12:30:12', details: 'Cache système purgé.' },
  { id: '6', type: 'error', action: 'Erreur Sync Écran', source: 'Screens', user: 'Écran_ID_88', timestamp: '2026-04-06 12:15:33', details: 'Dépassement du délai de connexion au socket.' },
  { id: '7', type: 'info', action: 'Déconnexion session', source: 'Auth', user: 'Chef_Agence_03', timestamp: '2026-04-06 11:58:04', details: 'Déconnexion manuelle par utilisateur.' },
];

export default function LogsPage() {
  const [filter, setFilter] = useState<LogType | 'all'>('all');
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredLogs = logs.filter(log => {
      const matchType = filter === 'all' || log.type === filter;
      const matchSearch = log.action.toLowerCase().includes(search.toLowerCase()) || 
                          log.user.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLogs([...MOCK_LOGS]); // Simulation de rafraîchissement
      setIsRefreshing(false);
    }, 800);
  };

  const getStatusIcon = (type: LogType) => {
    switch (type) {
      case 'error': return <AlertTriangle size={18} className="text-red-400" />;
      case 'warning': return <Activity size={18} className="text-amber-400" />;
      case 'success': return <CheckCircle2 size={18} className="text-emerald-400" />;
      case 'info': return <Info size={18} className="text-blue-400" />;
    }
  };

  const getStatusColor = (type: LogType) => {
    switch (type) {
      case 'error': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'warning': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'success': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'info': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const stats = {
    total: logs.length,
    errors: logs.filter(l => l.type === 'error').length,
    warnings: logs.filter(l => l.type === 'warning').length,
    activeSessions: 12 // Mock constant
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Main Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Terminal size={18} className="text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Supervision & Logs</h1>
          </div>
          <p className="text-slate-400">Suivi en temps réel des activités système et erreurs réseau.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <div className="flex-1 lg:flex-none flex items-center gap-4 bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-3 px-5 rounded-2xl shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Alertes Critiques</span>
              <span className="text-xl font-bold text-red-500">{stats.errors}</span>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Total Événements</span>
              <span className="text-xl font-bold text-white">{stats.total}</span>
            </div>
          </div>
          
          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20 group active:scale-95">
            <Download size={16} />
            <span>Exporter Rapport</span>
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5 relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher une action, un utilisateur..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/40 border border-slate-800/80 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="md:col-span-5 flex items-center gap-2">
          {['all', 'info', 'success', 'warning', 'error'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t as any)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                filter === t 
                  ? 'bg-slate-100 text-slate-950 border-slate-100 shadow-lg' 
                  : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              {t === 'all' ? 'Tous' : t}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button 
            onClick={handleRefresh}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-slate-400 hover:text-blue-400 transition-all hover:bg-slate-900/80"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            <span className="text-sm font-medium">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Logs Table Container */}
      <div className="bg-slate-950/40 backdrop-blur-sm border border-slate-900/80 rounded-2xl shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
        <div className="overflow-x-auto overflow-y-auto max-h-[65vh] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-950/90 backdrop-blur-md z-10">
              <tr className="border-b border-slate-900/80">
                <th className="p-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="p-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Événement</th>
                <th className="p-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source</th>
                <th className="p-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Utilisateur</th>
                <th className="p-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Horodatage</th>
                <th className="p-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40 font-mono text-[13px]">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/20 transition-colors group">
                    <td className="p-4 px-6">
                      <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold tracking-tight w-fit ${getStatusColor(log.type)}`}>
                        {getStatusIcon(log.type)}
                        {log.type.toUpperCase()}
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-slate-100 font-bold tracking-tight">{log.action}</span>
                        <span className="text-[11px] text-slate-500 truncate max-w-xs">{log.details}</span>
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 text-[11px] font-medium border border-slate-800">
                        {log.source}
                      </span>
                    </td>
                    <td className="p-4 px-6">
                      <div className="flex items-center gap-2 text-slate-300">
                        <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center">
                          <UserIcon size={12} className="text-slate-500" />
                        </div>
                        {log.user}
                      </div>
                    </td>
                    <td className="p-4 px-6 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span className="text-slate-400 font-medium">{log.timestamp.split(' ')[1]}</span>
                        <span className="text-[10px] text-slate-600">{log.timestamp.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td className="p-4 px-6 text-right">
                      <button className="p-2 text-slate-500 hover:text-blue-400 transition-colors bg-slate-950/40 rounded-lg border border-slate-900 hover:border-blue-500/30">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 rounded-full bg-slate-900 text-slate-700">
                        <AlertTriangle size={32} />
                      </div>
                      <p className="text-slate-500 font-medium">Aucun événement ne correspond à vos filtres.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info bar */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-900 border-t-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Système Connecté</span>
                    <span>Tailing : OFF</span>
                </div>
                <div>Affichage de {filteredLogs.length} sur {logs.length} entrées</div>
            </div>
        </div>
      </div>
    </div>
  );
}
