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
  ChevronRight,
  Search
} from "lucide-react";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";

type LogType = 'error' | 'warning' | 'info' | 'success';

interface ApiLog {
  _id?: string;
  id?: string;
  type?: LogType;
  action?: string;
  source?: string;
  user?: string;
  details?: string;
  timestamp?: string;
  module?: string;
  event?: string;
  actorUserId?: string | null;
  actorRole?: string;
  targetId?: string | null;
  meta?: Record<string, any>;
  createdAt?: string;
}

export default function LogsPage() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
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
        const data = await res.json();
        if (Array.isArray(data)) {
          setLogs(data);
          setPagination({ page: 1, limit: 100, total: data.length, totalPages: 1 });
        } else if (data && data.items) {
          setLogs(data.items || []);
          if (data.pagination) {
            setPagination(data.pagination);
            setPage(data.pagination.page);
          }
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
    total: logs.length,
    errors: logs.filter(l => (l.type || eventToType(l.action || l.event || '')) === 'error').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Terminal size={18} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{t.history.title}</h1>
          </div>
          <p className="text-muted-foreground">{t.history.subtitle}</p>
        </div>
        

      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 bg-muted/40 p-2 rounded-2xl border border-border transition-colors w-full">
        <div className="relative flex-1 group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder={t.history.search_placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            title={t.common.refresh}
            className="h-10 w-10 bg-card border border-border rounded-xl flex items-center justify-center transition-all hover:bg-muted/50 active:scale-[0.98] group shadow-sm"
          >
            <div className={`text-primary flex items-center justify-center transition-transform duration-500 ${isRefreshing ? "animate-spin" : "group-active:rotate-180"}`}>
              <RefreshCw size={18} />
            </div>
          </button>
        </div>
      </div>

      <div className="soft-card overflow-hidden min-h-[500px] flex flex-col shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-muted/90 backdrop-blur-md z-10">
              <tr className="border-b border-border">
                <th className="p-4 px-6 text-[10px] font-bold text-muted-foreground uppercase">{t.history.table.status}</th>
                <th className="p-4 px-6 text-[10px] font-bold text-muted-foreground uppercase">{t.history.table.event}</th>
                <th className="p-4 px-6 text-[10px] font-bold text-muted-foreground uppercase">{t.history.table.source}</th>
                <th className="p-4 px-6 text-[10px] font-bold text-muted-foreground uppercase">{t.history.table.user}</th>
                <th className="p-4 px-6 text-[10px] font-bold text-muted-foreground uppercase text-right">{t.history.table.timestamp}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono text-[13px]">
              {logs.filter(log => 
                (log.action || log.event || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (log.user || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (log.source || log.module || "").toLowerCase().includes(searchQuery.toLowerCase())
              ).length > 0 ? (
                logs.filter(log => 
                  (log.action || log.event || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (log.user || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (log.source || log.module || "").toLowerCase().includes(searchQuery.toLowerCase())
                ).map((log) => {
                  const type = log.type || eventToType(log.action || log.event || '');
                  const actorName = log.user || (log.actorUserId && usersMap[log.actorUserId]) || (log.actorRole ? `${log.actorRole.toUpperCase()}` : t.history.system);
                  const eventName = log.action || log.event || "---";
                  const moduleName = log.source || log.module || t.history.system;
                  const dateString = log.timestamp || log.createdAt || new Date().toISOString();
                  
                  return (
                  <tr key={log._id || log.id || Math.random().toString()} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 px-6">
                      <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold w-fit ${getStatusColor(type)}`}>
                        {getStatusIcon(type)}
                        {t.history.status[type]}
                      </div>
                    </td>
                    <td className="p-4 px-6 font-bold">{formatEvent(eventName)}</td>
                    <td className="p-4 px-6">
                      <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-medium border border-border">
                        {moduleName}
                      </span>
                    </td>
                    <td className="p-4 px-6">
                      <div className="flex items-center gap-2 text-foreground">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center border border-border"><UserIcon size={12} /></div>
                        {actorName}
                      </div>
                    </td>
                    <td className="p-4 px-6 text-right">
                        <span className="text-muted-foreground font-medium">{new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                  </tr>
                )})
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-muted-foreground">{t.common.no_data}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-muted/50 border-t border-border flex justify-between items-center text-[11px] font-bold text-muted-foreground uppercase">
          <div className="flex gap-4"><span>{t.history.system_online}</span></div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchLogs(true, Math.max(1, page - 1))} disabled={page <= 1 || isRefreshing} className="px-2 py-1 border rounded disabled:opacity-50"><ChevronLeft size={12} /></button>
            <span>{pagination.page} / {pagination.totalPages}</span>
            <button onClick={() => fetchLogs(true, Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages || isRefreshing} className="px-2 py-1 border rounded disabled:opacity-50"><ChevronRight size={12} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
