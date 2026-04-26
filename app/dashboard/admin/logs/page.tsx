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
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const res = await fetch("/api/backend/logs", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(true);
    const interval = setInterval(() => fetchLogs(), 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs;

  const handleRefresh = () => {
    fetchLogs(true);
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
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Terminal size={18} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Historique</h1>
          </div>
          <p className="text-muted-foreground">Historique en temps réel des actions et événements du système.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <div className="flex-1 lg:flex-none flex items-center gap-4 bg-muted/50 backdrop-blur-md border border-border p-3 px-5 rounded-2xl shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Alertes Critiques</span>
              <span className="text-xl font-bold text-destructive">{stats.errors}</span>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Événements</span>
              <span className="text-xl font-bold text-foreground">{stats.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex justify-end items-center">
        <button 
          onClick={handleRefresh}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-card border border-border text-muted-foreground hover:text-primary transition-all hover:bg-muted w-full md:w-auto soft-card shadow-sm"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          <span className="text-sm font-medium">Actualiser</span>
        </button>
      </div>

      {/* Logs Table Container */}
      <div className="soft-card overflow-hidden min-h-[500px] flex flex-col shadow-none">
        <div className="overflow-x-auto overflow-y-auto max-h-[65vh] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-muted/90 backdrop-blur-md z-10">
              <tr className="border-b border-border">
                <th className="p-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                <th className="p-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Événement</th>
                <th className="p-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Source</th>
                <th className="p-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Utilisateur</th>
                <th className="p-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Horodatage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono text-[13px]">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log: any) => (
                  <tr key={log._id || log.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-4 px-6">
                      <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold tracking-tight w-fit ${getStatusColor(log.type)}`}>
                        {getStatusIcon(log.type)}
                        {log.type.toUpperCase()}
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-foreground font-bold tracking-tight">{log.action}</span>
                        <span className="text-[11px] text-muted-foreground truncate max-w-xs">{log.details}</span>
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-medium border border-border">
                        {log.source}
                      </span>
                    </td>
                    <td className="p-4 px-6">
                      <div className="flex items-center gap-2 text-foreground">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center border border-border">
                          <UserIcon size={12} className="text-muted-foreground" />
                        </div>
                        {log.user}
                      </div>
                    </td>
                    <td className="p-4 px-6 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span className="text-muted-foreground font-medium">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[10px] text-muted-foreground/60">{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 rounded-full bg-muted text-muted-foreground">
                        <AlertTriangle size={32} />
                      </div>
                      <p className="text-muted-foreground font-medium">Aucun événement ne correspond à vos filtres.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info bar */}
        <div className="p-4 bg-muted/50 border-t border-border">
            <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
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
