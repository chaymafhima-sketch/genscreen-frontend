"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  X,
  Loader2,
  AlertCircle,
  Building2,
  MapPin,
  Phone,
  Building,
  Edit2,
  Trash2,
  Search,
  Globe,
  RefreshCcw,
  Users,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";

export default function EtablissementsPage() {
  const { t } = useLanguage();
  const [etablissements, setEtablissements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [etablissementToDelete, setEtablissementToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [users, setUsers] = useState<any[]>([]);
  const [userIds, setUserIds] = useState<string[]>([]);
  const [initialUserIds, setInitialUserIds] = useState<string[]>([]);
  const [usersQuery, setUsersQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/backend/users", { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur de récupération des utilisateurs");
      const data = await res.json();
      setUsers((data || []).filter((u: any) => u.role === "manager"));
    } catch (err: any) {
      console.error(err?.message || err);
      setUsers([]);
    }
  };

  const fetchetablissements = async () => {
    try {
      const res = await fetch("/api/backend/etablissements", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Erreur de récupération des établissements");
      const data = await res.json();
      setEtablissements(data);
    } catch (err: any) {
      setError(err.message || "Erreur de connexion serveur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchetablissements();
    fetchUsers();
  }, []);

  const handleDeleteClick = (id: string) => {
    setEtablissementToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!etablissementToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/backend/etablissements/${etablissementToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      fetchetablissements();
      setIsDeleteModalOpen(false);
      setEtablissementToDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Impossible de supprimer cet établissement");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (etablissement: any) => {
    setEditingId(etablissement._id || etablissement.id);
    setFormData({
      name: etablissement.name || "",
      address: etablissement.address || "",
      phone: etablissement.phone || "",
    });

    const currentUserIds: string[] =
      etablissement?.userIds ||
      etablissement?.users?.map((u: any) => u?._id || u?.id).filter(Boolean) ||
      [];

    setUserIds(currentUserIds);
    setInitialUserIds(currentUserIds);
    setUsersQuery("");
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: "", address: "", phone: "" });
    setUserIds([]);
    setInitialUserIds([]);
    setUsersQuery("");
    setIsModalOpen(true);
  };

  const arraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const sa = [...a].sort();
    const sb = [...b].sort();
    for (let i = 0; i < sa.length; i++) if (sa[i] !== sb[i]) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let res;
      if (editingId) {
        if (!arraysEqual(userIds, initialUserIds)) {
          const assignRes = await fetch(
            `/api/backend/etablissements/${editingId}/assign-users`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ userIds }),
            },
          );
          if (!assignRes.ok)
            throw new Error("Erreur lors de l'assignation des utilisateurs");
          setInitialUserIds(userIds);
        }

        res = await fetch(`/api/backend/etablissements/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch("/api/backend/etablissements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData, userIds }),
        });
      }

      if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
      setSubmitSuccess(true);
      fetchetablissements();
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setFormData({ name: "", address: "", phone: "" });
        setUserIds([]);
        setInitialUserIds([]);
        setEditingId(null);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u: any) => {
    const q = usersQuery.toLowerCase().trim();
    if (!q) return true;
    const label =
      `${u?.fullname || u?.name || ""} ${u?.email || ""} ${u?.role || ""}`.toLowerCase();
    return label.includes(q);
  });

  const filteredetablissements = etablissements.filter(
    (etablissement) =>
      (etablissement.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (etablissement.address || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (etablissement.city || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {t.etablissements.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t.etablissements.subtitle}
          </p>
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
            placeholder={t.etablissements.search_placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchetablissements}
            title={t.common.refresh}
            className="h-10 w-10 bg-card border border-border rounded-xl flex items-center justify-center transition-all hover:bg-muted/50 active:scale-[0.98] group shadow-sm"
          >
            <div className="text-primary flex items-center justify-center group-active:rotate-180 transition-transform duration-500">
              <RefreshCcw size={18} />
            </div>
          </button>
          <button
            onClick={openAddModal}
            className="shrink-0 bg-primary hover:opacity-90 text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} /> {t.etablissements.add_button}
          </button>
        </div>
      </div>

      <div className="soft-card overflow-hidden min-h-[400px] flex flex-col transition-colors shadow-none mt-6">
        <div className="flex-1 p-0">
          {loading ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-muted-foreground">
              <Loader2 className="animate-spin text-primary mb-4" size={32} />
              <p>{t.common.loading}</p>
            </div>
          ) : error ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-destructive">
              <AlertCircle size={32} className="mb-4" />
              <p>{error}</p>
            </div>
          ) : filteredetablissements.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-muted-foreground">
              <Building size={48} className="mb-4 opacity-50" />
              <p>{t.common.no_data}</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-muted/50 text-xs uppercase font-medium text-muted-foreground border-b border-border transition-colors">
                <tr>
                  <th scope="col" className="px-6 py-4 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort("name")}>
                    <span className="flex items-center gap-1.5">{t.etablissements.table.name} <ArrowUpDown size={12} className={sortField === 'name' ? 'text-primary' : 'opacity-40'} /></span>
                  </th>
                  <th scope="col" className="px-6 py-4 text-center">{t.etablissements.table.assigned_users}</th>
                  <th scope="col" className="px-6 py-4 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort("phone")}>
                    <span className="flex items-center gap-1.5">{t.etablissements.table.contact} <ArrowUpDown size={12} className={sortField === 'phone' ? 'text-primary' : 'opacity-40'} /></span>
                  </th>
                  <th scope="col" className="px-6 py-4 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort("createdAt")}>
                    <span className="flex items-center gap-1.5">Date <ArrowUpDown size={12} className={sortField === 'createdAt' ? 'text-primary' : 'opacity-40'} /></span>
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 transition-colors">
                {[...filteredetablissements].sort((a: any, b: any) => {
                  if (sortField === 'createdAt') {
                    const dateA = new Date(a.createdAt || 0).getTime();
                    const dateB = new Date(b.createdAt || 0).getTime();
                    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
                  }
                  const valA = (a[sortField] || "").toString().toLowerCase();
                  const valB = (b[sortField] || "").toString().toLowerCase();
                  return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
                }).map((etablissement: any) => {
                  const etablissementUserIds: string[] =
                    etablissement?.userIds ||
                    etablissement?.users
                      ?.map((u: any) => u?._id || u?.id)
                      .filter(Boolean) ||
                    [];

                  const assignedUsers = users.filter((u: any) =>
                    etablissementUserIds.includes(u._id || u.id),
                  );

                  return (
                    <tr
                      key={etablissement._id || etablissement.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Building2 size={18} />
                          </div>
                          <span className="truncate max-w-[200px]">{etablissement.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {assignedUsers.length === 0 ? (
                          <div className="flex justify-center">
                            <span className="text-xs text-muted-foreground">{t.etablissements.table.no_user}</span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 justify-center">
                            {assignedUsers.slice(0, 2).map((u: any) => (
                              <span
                                key={u._id || u.id}
                                title={u.fullname || u.name || u.email}
                                className="px-2 py-1 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 truncate max-w-[120px]"
                              >
                                {u.fullname || u.name || u.email || "User"}
                              </span>
                            ))}
                            {assignedUsers.length > 2 ? (
                              <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                                +{assignedUsers.length - 2}
                              </span>
                            ) : null}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {etablissement.phone || "—"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {etablissement.createdAt ? new Date(etablissement.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(etablissement)}
                            className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors border border-primary/20"
                            title={t.dashboard.edit}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(etablissement._id || etablissement.id)}
                            className="p-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors border border-destructive/20"
                            title={t.dashboard.delete}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
            onClick={() =>
              !isSubmitting && !submitSuccess && setIsModalOpen(false)
            }
          />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
              <h2 className="text-xl font-bold">
                {editingId ? t.dashboard.edit : t.etablissements.add_button}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-12 text-center animate-in fade-in">
                <div className="h-16 w-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-4 mx-auto border border-success/20">
                  <Building2 size={32} />
                </div>
                <h3 className="text-lg font-bold">
                  {t.dashboard.save}
                </h3>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="max-h-[450px] overflow-y-auto custom-etab-scrollbar p-6 space-y-6">
                  <style dangerouslySetInnerHTML={{ __html: `
                    .custom-etab-scrollbar::-webkit-scrollbar {
                      width: 6px !important;
                      display: block !important;
                    }
                    .custom-etab-scrollbar::-webkit-scrollbar-track {
                      background: transparent !important;
                    }
                    .custom-etab-scrollbar::-webkit-scrollbar-thumb {
                      background-color: #ffffff !important;
                      border-radius: 10px !important;
                    }
                    .custom-etab-scrollbar {
                      scrollbar-width: thin !important;
                      scrollbar-color: #ffffff transparent !important;
                    }
                  `}} />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">{t.etablissements.table.name}</label>
                      <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all" />
                    </div>
                  
                    
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">{t.etablissements.table.assigned_users}</label>
                      <div className="max-h-40 overflow-y-auto border border-border rounded-xl p-3 space-y-1 bg-muted/20 custom-etab-scrollbar">
                        {users.map(u => (
                          <label key={u._id} className="flex items-center gap-3 p-2 hover:bg-background rounded-lg cursor-pointer transition-colors group">
                            <input type="checkbox" checked={userIds.includes(u._id)} onChange={(e) => {
                              const next = e.target.checked ? [...userIds, u._id] : userIds.filter(id => id !== u._id);
                              setUserIds(next);
                            }} className="h-4 w-4 rounded border-border text-primary focus:ring-primary transition-all" />
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold group-hover:text-primary transition-colors">{u.fullname || u.name}</span>
                              <span className="text-[10px] text-muted-foreground">{u.email}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">{t.etablissements.table.contact}</label>
                      <input type="tel" inputMode="numeric" maxLength={8} value={formData.phone} onChange={(e) => { const digits = e.target.value.replace(/\D/g, '').slice(0, 8); setFormData({...formData, phone: digits}); }} placeholder="Ex: 71000000" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all" />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border mt-6">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 border border-border rounded-xl font-bold hover:bg-muted transition-all text-foreground">
                        {t.common.cancel}
                      </button>
                      <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all">
                        {isSubmitting ? t.common.loading : t.dashboard.save}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 flex flex-col items-center text-center">
            <div className="h-20 w-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
              <Trash2 size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground mb-2">
              {t.dashboard.delete} ?
            </h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer cet établissement ?
            </p>
            <div className="flex gap-4 w-full">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3.5 border border-border rounded-xl font-bold hover:bg-muted transition-all text-foreground">{t.dashboard.cancel}</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-3.5 border border-border text-foreground rounded-xl font-bold hover:bg-muted transition-all disabled:opacity-50">
                {isDeleting ? t.common.loading : t.dashboard.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
