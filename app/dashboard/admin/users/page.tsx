"use client";

import { useState, useEffect } from "react";
import { 
  Trash2, Edit, Plus, Search, UserCheck, Mail, MapPin, 
  Loader2, Shield, ShieldOff, AlertCircle, CheckCircle2, 
  UserX, X, RefreshCcw, Key, Globe, Edit2 
} from "lucide-react";
import { TUNISIA_CITIES } from "@/app/lib/constants/tunisia-cities";
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
      setError("Impossible de charger les managers.");
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

      // Si c'est une édition et que le password est vide, on l'enlève du body
      const body: any = { ...formData };
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
      const res = await fetch(`/api/backend/users/${user._id || user.id}`, {
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
      const res = await fetch(`/api/backend/users/${user._id || user.id}`, {
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
      toast.success("Manager supprimé");
    } catch (err: any) {
      toast.error(err.message || "Impossible de supprimer cet utilisateur");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.fullname || user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{t.users.title}</h1>
          <p className="text-muted-foreground mt-1.5 font-medium">{t.users.subtitle}</p>
        </div>
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
          className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          <Plus size={20} />
          {t.users.add_button}
        </button>
      </div>

      {/* Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder={t.users.search_placeholder}
            className="w-full pl-12 pr-4 py-4 bg-card/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="hidden md:flex items-center justify-end">
          <span className="text-sm font-bold text-muted-foreground bg-muted px-4 py-2 rounded-full">
            {filteredUsers.length} Managers
          </span>
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
                  <th scope="col" className="px-6 py-4">{t.users.table.name}</th>
                  <th scope="col" className="px-6 py-4">{t.dashboard.screens} (Zone)</th>
                  <th scope="col" className="px-6 py-4">{t.users.table.email}</th>
                  <th scope="col" className="px-6 py-4 text-center">{t.users.table.status}</th>
                  <th scope="col" className="px-6 py-4 text-center">{t.users.table.permissions}</th>
                  <th scope="col" className="px-6 py-4 text-right">{t.dashboard.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredUsers.map((user: any) => (
                  <tr key={user._id || user.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-foreground">{user.fullname || user.name}</td>
                    <td className="px-6 py-4 font-bold text-primary">{user.city || "—"}</td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2"><Mail size={14}/> {user.email}</div></td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggleActive(user)} className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${user.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                        {user.isActive ? t.users.table.active : t.users.table.deactivated}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggleDiffusion(user)} className={`p-2 rounded-xl transition-all ${user.canDiffuse ? "text-emerald-500 bg-emerald-500/10" : "text-muted-foreground bg-muted"}`}>
                        {user.canDiffuse ? <Shield size={18} /> : <ShieldOff size={18} />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => { setEditingUserId(user._id || user.id); setIsEditing(true); setFormData({ ...user, password: "" }); setIsModalOpen(true); }} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Edit size={16}/></button>
                      <button onClick={() => handleDeleteClick(user._id || user.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={16}/></button>
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
                <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 mx-auto border border-emerald-500/20">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold">{isEditing ? t.dashboard.save : t.users.modal.creating}</h3>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">{t.users.modal.city}</label>
                  <select required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary">
                    <option value="">Sélectionnez...</option>
                    {TUNISIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                  <label className="text-sm font-bold text-foreground">{t.users.modal.active_status}</label>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all mt-4">
                  {isSubmitting ? t.common.loading : (isEditing ? t.dashboard.save : t.dashboard.add)}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-destructive mb-2">{t.users.delete_confirm.title}</h2>
            <p className="text-muted-foreground text-sm mb-6">{t.users.delete_confirm.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 border border-border rounded-xl font-bold hover:bg-muted transition-all">{t.dashboard.cancel}</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-3 bg-destructive text-white rounded-xl font-bold hover:bg-destructive/90 transition-all disabled:opacity-50">
                {isDeleting ? t.users.delete_confirm.deleting : t.users.delete_confirm.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
