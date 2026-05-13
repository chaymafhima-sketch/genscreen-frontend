"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  Edit,
  Edit2,
  Globe,
  Key,
  Loader2,
  Mail,
  MapPin,
  Plus,
  RefreshCcw,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";

export default function UsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("fullname");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "manager",
    canDiffuse: false,
    address: "",
    city: "",
    isActive: true,
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/backend/users", { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setUsers(data.filter((u: any) => u.role === "manager"));
    } catch (err: any) {
      setError("Impossible de charger les responsables.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = isEditing
        ? `/api/backend/users/${editingUserId}`
        : "/api/backend/users/create";
      const method = isEditing ? "PUT" : "POST";

      // Nettoyage du body pour éviter d'envoyer l'ID dans le corps (déjà dans l'URL)
      const body: any = { ...formData };
      delete body._id;
      delete body.id;
      
      if (isEditing && !body.password) {
        delete body.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Une erreur est survenue");
      }

      setSubmitSuccess(true);
      fetchData();
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setIsEditing(false);
        setEditingUserId(null);
        setFormData({
          fullname: "",
          email: "",
          password: "",
          role: "manager",
          canDiffuse: false,
          address: "",
          city: "",
          isActive: true,
        });
      }, 1500);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (user: any) => {
    try {
      const idStr = getUserId(user);
      const res = await fetch(`/api/backend/users/${idStr}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour");
      fetchData();
      toast.success(user.isActive ? t.auth.error_deactivated : "Compte activé");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleDiffusion = async (user: any) => {
    try {
      const idStr = getUserId(user);
      const res = await fetch(`/api/backend/users/${idStr}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canDiffuse: !user.canDiffuse }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/backend/users/${userToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      fetchData();
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      toast.success("Responsable supprimé");
    } catch (err: any) {
      toast.error(err.message || "Impossible de supprimer cet utilisateur");
    } finally {
      setIsDeleting(false);
    }
  };

  const getUserId = (user: any) => {
    if (!user) return "";
    const id = user._id || user.id;
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id?.$oid) return id.$oid;
    return String(id);
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.fullname || user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{t.users.title}</h1>
          <p className="text-muted-foreground mt-1.5 font-medium">{t.users.subtitle}</p>
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
            placeholder={t.users.search_placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchData}
            title={t.common.refresh}
            className="h-10 w-10 bg-card border border-border rounded-xl flex items-center justify-center transition-all hover:bg-muted/50 active:scale-[0.98] group shadow-sm"
          >
            <div className="text-primary flex items-center justify-center group-active:rotate-180 transition-transform duration-500">
              <RefreshCcw size={18} />
            </div>
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setFormData({
                fullname: "",
                email: "",
                password: "",
                role: "manager",
                canDiffuse: false,
                address: "",
                city: "",
                isActive: true,
              });
              setIsModalOpen(true);
            }}
            className="shrink-0 bg-primary hover:opacity-90 text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} /> {t.users.add_button}
          </button>
        </div>
      </div>



      {/* Users Table */}
      <div className="soft-card overflow-hidden min-h-[400px] flex flex-col shadow-sm">
        <div className="flex-1 p-0 overflow-x-auto">
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
          ) : filteredUsers.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-muted-foreground text-center">
              <UserX size={48} className="mb-4 opacity-50 mx-auto" />
              <p>{t.common.no_data}</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-muted/50 text-xs uppercase font-medium text-muted-foreground border-b border-border">
                <tr>
                  <th scope="col" className="px-6 py-4 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort("fullname")}>
                    <span className="flex items-center gap-1.5">{t.users.table.name} <ArrowUpDown size={12} className={sortField === 'fullname' ? 'text-primary' : 'opacity-40'} /></span>
                  </th>
                  <th scope="col" className="px-6 py-4 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort("email")}>
                    <span className="flex items-center gap-1.5">{t.users.table.email} <ArrowUpDown size={12} className={sortField === 'email' ? 'text-primary' : 'opacity-40'} /></span>
                  </th>
                  <th scope="col" className="px-6 py-4 text-center">{t.users.table.status}</th>
                  <th scope="col" className="px-6 py-4 text-center">{t.users.table.diffusions}</th>
                  <th scope="col" className="px-6 py-4 text-right">{t.dashboard.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {[...filteredUsers].sort((a: any, b: any) => {
                  const valA = (a[sortField] || a.name || "").toString().toLowerCase();
                  const valB = (b[sortField] || b.name || "").toString().toLowerCase();
                  return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
                }).map((user: any, index: number) => (
                  <tr key={`${user._id || user.id}-${index}`} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-foreground">{user.fullname || user.name}</td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2"><Mail size={14}/> {user.email}</div></td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggleActive(user)} className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${user.isActive ? "bg-success/10 text-success border-success/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                        {user.isActive ? t.users.table.active : t.users.table.deactivated}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggleDiffusion(user)} className={`p-2 rounded-xl transition-all ${user.canDiffuse ? "text-success bg-success/10" : "text-muted-foreground bg-muted"}`}>
                        {user.canDiffuse ? <Shield size={18} /> : <ShieldOff size={18} />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => { 
                        setEditingUserId(getUserId(user)); 
                        setIsEditing(true); 
                        setFormData({ ...user, password: "" }); 
                        setIsModalOpen(true); 
                      }} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Edit size={16}/></button>
                      <button onClick={() => {
                        handleDeleteClick(getUserId(user));
                      }} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
              <h2 className="text-xl font-bold">{isEditing ? t.users.modal.edit_title : t.users.modal.add_title}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={20}/></button>
            </div>

            {submitSuccess ? (
              <div className="p-12 text-center animate-in fade-in">
                <div className="h-16 w-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-4 mx-auto border border-success/20">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold">{isEditing ? t.users.edit_success : t.users.modal.creating}</h3>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="max-h-[450px] overflow-y-auto custom-users-scrollbar">
                  <style dangerouslySetInnerHTML={{ __html: `
                    .custom-users-scrollbar::-webkit-scrollbar {
                      width: 8px !important;
                      display: block !important;
                    }
                    .custom-users-scrollbar::-webkit-scrollbar-track {
                      background: rgba(255, 255, 255, 0.05) !important;
                    }
                    .custom-users-scrollbar::-webkit-scrollbar-thumb {
                      background-color: #ffffff !important;
                      border-radius: 10px !important;
                    }
                    .custom-users-scrollbar {
                      scrollbar-width: thin !important;
                      scrollbar-color: #ffffff rgba(255, 255, 255, 0.05) !important;
                    }
                  `}} />
                  <div className="p-6 space-y-4 pb-20">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground">{t.users.modal.fullname}</label>
                      <input required type="text" value={formData.fullname} onChange={(e) => setFormData({...formData, fullname: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground">{t.users.modal.email}</label>
                      <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground">{t.users.modal.password} {isEditing && <span className="text-[10px] opacity-70">{t.users.modal.password_hint}</span>}</label>
                      <input required={!isEditing} type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary" />
                    </div>

                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                        <label htmlFor="isActive" className="text-sm font-bold text-foreground cursor-pointer">{t.users.modal.active_status}</label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" id="canDiffuse" checked={formData.canDiffuse} onChange={(e) => setFormData({...formData, canDiffuse: e.target.checked})} className="h-4 w-4 rounded border-border text-emerald-500 focus:ring-emerald-500" />
                        <label htmlFor="canDiffuse" className="text-sm font-bold text-foreground cursor-pointer">{t.users.modal.can_diffuse}</label>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border/50 mt-6">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 border border-border rounded-xl font-bold hover:bg-muted transition-all text-foreground">
                        {t.common.cancel}
                      </button>
                      <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all">
                        {isSubmitting ? t.common.loading : (isEditing ? t.common.save : t.dashboard.add)}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 flex flex-col items-center text-center">
            <div className="h-20 w-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
              <Trash2 size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground mb-2">
              {t.users.delete_confirm.title} ?
            </h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              {t.users.delete_confirm.message}
            </p>
            <div className="flex gap-4 w-full">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3.5 border border-border rounded-xl font-bold hover:bg-muted transition-all text-foreground">{t.dashboard.cancel}</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-3.5 border border-border text-foreground rounded-xl font-bold hover:bg-muted transition-all disabled:opacity-50">
                {isDeleting ? t.users.delete_confirm.deleting : t.users.delete_confirm.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
