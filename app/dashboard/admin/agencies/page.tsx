"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2, AlertCircle, Building2, MapPin, Phone, Building, Edit2, Trash2, Search, Globe, RefreshCcw, Users } from "lucide-react";
import { TUNISIA_CITIES } from "@/app/lib/constants/tunisia-cities";

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', city: '', phone: '' });
  const [users, setUsers] = useState<any[]>([]);
  const [userIds, setUserIds] = useState<string[]>([]);
  const [initialUserIds, setInitialUserIds] = useState<string[]>([]);
  const [usersQuery, setUsersQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/backend/users", { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur de récupération des utilisateurs");
      const data = await res.json();
      setUsers(data || []);
    } catch (err: any) {
      // Keep agencies screen usable even if users fetch fails
      console.error(err?.message || err);
      setUsers([]);
    }
  };

  const fetchAgencies = async () => {
    try {
      const res = await fetch("/api/backend/agencies", { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur de récupération des agences");
      const data = await res.json();
      setAgencies(data);
    } catch (err: any) {
      setError(err.message || "Erreur de connexion serveur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette agence ?")) return;
    try {
      const res = await fetch(`/api/backend/agencies/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      fetchAgencies();
    } catch (err: any) {
      alert(err.message || "Impossible de supprimer cette agence");
    }
  };

  const openEditModal = (agency: any) => {
    setEditingId(agency._id || agency.id);
    setFormData({ name: agency.name || '', address: agency.address || '', city: agency.city || '', phone: agency.phone || '' });

    const currentUserIds: string[] =
      agency?.userIds ||
      agency?.users?.map((u: any) => u?._id || u?.id).filter(Boolean) ||
      [];

    setUserIds(currentUserIds);
    setInitialUserIds(currentUserIds);
    setUsersQuery("");
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', address: '', city: '', phone: '' });
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
        // If users changed, assign/replace via dedicated endpoint (admin only)
        if (!arraysEqual(userIds, initialUserIds)) {
          const assignRes = await fetch(`/api/backend/agencies/${editingId}/assign-users`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userIds })
          });
          if (!assignRes.ok) throw new Error("Erreur lors de l'assignation des utilisateurs");
          setInitialUserIds(userIds);
        }

        res = await fetch(`/api/backend/agencies/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData)
        });
      } else {
        if (!userIds.length) throw new Error("Veuillez sélectionner au moins un utilisateur");
        res = await fetch("/api/backend/agencies", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData, userIds })
        });
      }
      
      if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
      setSubmitSuccess(true);
      fetchAgencies();
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setFormData({ name: '', address: '', city: '', phone: '' });
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
    const label = `${u?.fullname || u?.name || ""} ${u?.email || ""} ${u?.role || ""}`.toLowerCase();
    return label.includes(q);
  });

  const filteredAgencies = agencies.filter(agency => 
    (agency.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (agency.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (agency.city || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Agences</h1>
          <p className="text-muted-foreground mt-2">Gérez vos différentes agences et leurs configurations globales.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAgencies}
            className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:rotate-180 duration-500"
            title="Rafraîchir"
          >
            <RefreshCcw size={20} />
          </button>
          <button 
            onClick={openAddModal}
            className="bg-primary hover:opacity-90 text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center gap-2"
          >
            <Plus size={18} /> Nouvelle Agence
          </button>
        </div>
      </div>

      <div className="soft-card overflow-hidden min-h-[400px] flex flex-col transition-colors shadow-sm">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30 transition-colors">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher une agence..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/60"
            />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{filteredAgencies.length} agences au total</span>
        </div>

        <div className="flex-1 p-0">
          {loading ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-muted-foreground">
              <Loader2 className="animate-spin text-primary mb-4" size={32} />
              <p>Chargement des agences...</p>
            </div>
          ) : error ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-destructive">
              <AlertCircle size={32} className="mb-4" />
              <p>{error}</p>
            </div>
          ) : filteredAgencies.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-muted-foreground">
              <Building size={48} className="mb-4 opacity-50" />
              <p>{searchQuery ? "Aucune agence ne correspond à votre recherche." : "Aucune agence trouvée."}</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-muted/50 text-xs uppercase font-medium text-muted-foreground border-b border-border transition-colors">
                <tr>
                  <th scope="col" className="px-6 py-4">Ville</th>
                  <th scope="col" className="px-6 py-4">Quartier / Adresse</th>
                  <th scope="col" className="px-6 py-4">Contact</th>
                  <th scope="col" className="px-6 py-4">Téléphone</th>
                  <th scope="col" className="px-6 py-4">Utilisateurs assignés</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 transition-colors">
                {filteredAgencies.map((agency: any) => {
                  const agencyUserIds: string[] =
                    agency?.userIds ||
                    agency?.users?.map((u: any) => u?._id || u?.id).filter(Boolean) ||
                    [];

                  const assignedUsers = users.filter((u: any) => agencyUserIds.includes(u._id || u.id));

                  return (
                    <tr key={agency._id || agency.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Building2 size={18} />
                        </div>
                        {agency.name}
                      </td>
                      <td className="px-6 py-4 font-bold text-primary">
                        {agency.city || "—"}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {agency.address || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {agency.phone || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {assignedUsers.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Aucun utilisateur</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {assignedUsers.slice(0, 3).map((u: any) => (
                              <span
                                key={u._id || u.id}
                                className="px-2 py-1 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20"
                              >
                                {u.fullname || u.name || u.email || "User"}
                              </span>
                            ))}
                            {assignedUsers.length > 3 ? (
                              <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                                +{assignedUsers.length - 3}
                              </span>
                            ) : null}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 flex items-center justify-end">
                         <button onClick={() => openEditModal(agency)} className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors border border-primary/20" title="Modifier">
                            <Edit2 size={16} />
                         </button>
                         <button onClick={() => handleDelete(agency._id || agency.id)} className="p-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors border border-destructive/20" title="Supprimer">
                            <Trash2 size={16} />
                         </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal - Nouvelle/Modifier Agence */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
          <div 
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
            onClick={() => !isSubmitting && !submitSuccess && setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md max-h-[92vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-border bg-muted/30 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-foreground">{editingId ? "Modifier l'Agence" : "Nouvelle Agence"}</h2>
                <p className="text-xs text-muted-foreground mt-1">{editingId ? "Modifiez les informations." : "Ajoutez un nouvel établissement à votre réseau."}</p>
              </div>
              <button 
                onClick={() => !isSubmitting && !submitSuccess && setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-12 flex flex-col items-center justify-center text-center animate-in fade-in">
                <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                  <Building2 size={32} />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Agence créée avec succès !</h3>
                <p className="text-sm text-muted-foreground">L'agence a été ajoutée à la base de données.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Building2 size={16} className="text-primary" />
                    Nom de l'agence
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Agence Paris Centrale"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/40"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Globe size={16} className="text-primary" />
                    Ville (Gouvernorat)
                  </label>
                  <select
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="">Sélectionnez une ville...</option>
                    {TUNISIA_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users size={16} className="text-primary" />
                    Utilisateurs assignés {editingId ? <span className="text-xs text-muted-foreground/70">(remplacer)</span> : <span className="text-xs text-muted-foreground/70">(obligatoire)</span>}
                  </label>

                  <input
                    type="text"
                    value={usersQuery}
                    onChange={(e) => setUsersQuery(e.target.value)}
                    placeholder="Rechercher un utilisateur (nom, email, rôle)..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                  />

                  <div className="w-full bg-background border border-border rounded-xl p-3 max-h-56 overflow-auto space-y-2">
                    {filteredUsers.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-2">Aucun utilisateur trouvé.</div>
                    ) : (
                      filteredUsers.map((u: any) => {
                        const id = (u._id || u.id) as string | undefined;
                        if (!id) return null;
                        const checked = userIds.includes(id);
                        const label = u.fullname || u.name || u.email || id;
                        return (
                          <label
                            key={id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? Array.from(new Set([...userIds, id]))
                                  : userIds.filter((x) => x !== id);
                                setUserIds(next);
                              }}
                              className="h-4 w-4 accent-[var(--primary)]"
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-foreground truncate">{label}</div>
                              <div className="text-[11px] text-muted-foreground truncate">
                                {u.email ? u.email : "—"}{u.role ? ` • ${u.role}` : ""}
                              </div>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground/80">
                    <span>{userIds.length} sélectionné(s)</span>
                    <button
                      type="button"
                      onClick={() => setUserIds([])}
                      className="hover:text-foreground transition-colors"
                    >
                      Tout désélectionner
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin size={16} className="text-primary" />
                    Quartier / Adresse exacte <span className="text-xs text-muted-foreground/70">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Ex: Ennasr 2, Rue de la Paix"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/40"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone size={16} className="text-primary" />
                    Numéro de contact <span className="text-xs text-muted-foreground/70">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Ex: +33 1 23 45 67 89"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/40"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary hover:opacity-90 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <><Loader2 size={16} className="animate-spin" /> Création...</>
                    ) : (
                      'Valider'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
