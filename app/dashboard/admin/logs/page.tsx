"use client";

import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Activity, 
  User as UserIcon, 
  RefreshCw,
  Terminal,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

type LogType = 'error' | 'warning' | 'info' | 'success';

interface ApiLog {
  _id: string;
  module: string;
  event: string;
  actorUserId: string | null;
  actorRole: string;
  targetId: string | null;
  meta?: Record<string, any>;
  createdAt: string;
}

interface ApiLogsResponse {
  items: ApiLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const fetchUsers = async () => {
    try {
      const usersRes = await fetch("/api/backend/users", { cache: "no-store" });
      if (!usersRes.ok) return;
      const users = await usersRes.json();
      const map: Record<string, string> = {};
      (users || []).forEach((u: any) => {
        const id = u?._id || u?.id;
        if (id) map[id] = u.fullname || u.name || u.email || id;
      });
      setUsersMap(map);
    } catch (err) {
      console.error("Failed to fetch users for logs", err);
    }
  };

  const fetchLogs = async (showLoading = false, requestedPage = page) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/backend/logs?page=${requestedPage}&limit=${pagination.limit}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json() as ApiLogsResponse;
        setLogs(data.items || []);
        if (data.pagination) {
          setPagination(data.pagination);
          setPage(data.pagination.page);
        }
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredLogs = logs;

  const handleRefresh = () => {
    fetchLogs(true, page);
  };

  const eventToType = (event: string): LogType => {
    const e = (event || "").toLowerCase();
    if (e.includes("error") || e.includes("failed") || e.includes("denied")) return "error";
    if (e.includes("delete") || e.includes("remove") || e.includes("warning")) return "warning";
    if (e.includes("create") || e.includes("assigned") || e.includes("updated")) return "success";
    return "info";
  };

  const formatEvent = (event: string) => {
    return (event || "")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
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
    total: pagination.total,
    errors: logs.filter(l => eventToType(l.event) === 'error').length,
    warnings: logs.filter(l => eventToType(l.event) === 'warning').length,
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
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Evenements</span>
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
                <th className="p-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Evenement</th>
                <th className="p-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Source</th>
                <th className="p-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Utilisateur</th>
                <th className="p-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Horodatage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono text-[13px]">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const type = eventToType(log.event);
                  const actorName =
                    (log.actorUserId && usersMap[log.actorUserId]) ||
                    (log.actorRole ? `${log.actorRole.toUpperCase()}` : "Système");
                  const details = log.meta ? JSON.stringify(log.meta) : "—";
                  return (
                  <tr key={log._id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-4 px-6">
                      <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold tracking-tight w-fit ${getStatusColor(type)}`}>
                        {getStatusIcon(type)}
                        {type.toUpperCase()}
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-foreground font-bold tracking-tight">{formatEvent(log.event)}</span>
                        <span className="text-[11px] text-muted-foreground truncate max-w-xs">{details}</span>
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-medium border border-border">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-4 px-6">
                      <div className="flex items-center gap-2 text-foreground">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center border border-border">
                          <UserIcon size={12} className="text-muted-foreground" />
                        </div>
                        {actorName}
                      </div>
                    </td>
                    <td className="p-4 px-6 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span className="text-muted-foreground font-medium">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[10px] text-muted-foreground/60">{new Date(log.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                  </tr>
                )})
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
            <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-widest gap-4">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Système Connecté</span>
                    <span>Tailing : OFF</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchLogs(true, Math.max(1, page - 1))}
                    disabled={page <= 1 || isRefreshing}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border disabled:opacity-50 hover:bg-muted transition-colors"
                  >
                    <ChevronLeft size={12} /> Préc
                  </button>
                  <span>Page {pagination.page} / {pagination.totalPages}</span>
                  <button
                    onClick={() => fetchLogs(true, Math.min(pagination.totalPages, page + 1))}
                    disabled={page >= pagination.totalPages || isRefreshing}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border disabled:opacity-50 hover:bg-muted transition-colors"
                  >
                    Suiv <ChevronRight size={12} />
                  </button>
                  <span className="ml-2">Affichage de {filteredLogs.length} sur {pagination.total}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
