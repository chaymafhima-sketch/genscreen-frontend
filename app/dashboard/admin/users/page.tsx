"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  X, 
  Loader2, 
  AlertCircle, 
  UserCheck, 
  Mail, 
  Shield, 
  ShieldOff, 
  UserPlus,
  Edit2,
  Trash2,
  Search,
  Key,
  MapPin,
  Globe,
  RefreshCcw
} from "lucide-react";
import { TUNISIA_CITIES } from "@/app/lib/constants/tunisia-cities";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    fullname: '', 
    email: '', 
    password: '', 
    role: 'chef', 
    canDiffuse: false,
    address: '',
    city: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // Fetch Users
      const usersRes = await fetch("/api/backend/users", { cache: "no-store" });
      if (!usersRes.ok) throw new Error("Erreur de récupération des utilisateurs");
      const usersData = await usersRes.json();
      // Filter for chefs only for this management page
      setUsers(usersData.filter((u: any) => u.role === 'chef'));
    } catch (err: any) {
      setError(err.message || "Erreur de connexion serveur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = isEditing 
        ? `/api/backend/users/${editingUserId}` 
        : "/api/backend/users/create";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error(`Erreur lors de la ${isEditing ? 'modification' : 'création'} du chef`);
      
      setSubmitSuccess(true);
      fetchData();
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setIsEditing(false);
        setFormData({ fullname: '', email: '', password: '', role: 'chef', canDiffuse: false, address: '', city: '' });
      }, 1500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDiffusion = async (user: any) => {
    try {
      const res = await fetch(`/api/backend/users/${user._id || user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ canDiffuse: !user.canDiffuse })
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce chef d'agence ?")) return;
    try {
      const res = await fetch(`/api/backend/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Impossible de supprimer cet utilisateur");
    }
  };

  const filteredUsers = users.filter(user => 
    (user.fullname || user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Gestion des Chefs d'Agence</h1>
          <p className="text-muted-foreground mt-2">Inscrivez de nouveaux managers et gérez leurs permissions de diffusion.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:rotate-180 duration-500"
            title="Rafraîchir"
          >
            <RefreshCcw size={20} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:opacity-90 text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center gap-2"
          >
            <UserPlus size={18} /> Nouveau Chef
          </button>
        </div>
      </div>

      <div className="soft-card overflow-hidden min-h-[400px] flex flex-col transition-colors shadow-sm">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30 transition-colors">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un chef d'agence..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/60"
            />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{filteredUsers.length} chefs au total</span>
        </div>

        <div className="flex-1 p-0">
          {loading ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-muted-foreground">
              <Loader2 className="animate-spin text-primary mb-4" size={32} />
              <p>Chargement des managers...</p>
            </div>
          ) : error ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-destructive">
              <AlertCircle size={32} className="mb-4" />
              <p>{error}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-muted-foreground">
              <UserCheck size={48} className="mb-4 opacity-50" />
              <p>{searchQuery ? "Aucun chef ne correspond à votre recherche." : "Aucun chef d'agence trouvé."}</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-muted/50 text-xs uppercase font-medium text-muted-foreground border-b border-border transition-colors">
                <tr>
                  <th scope="col" className="px-6 py-4">Nom Complet</th>
                  <th scope="col" className="px-6 py-4">Ville / Zone</th>
                  <th scope="col" className="px-6 py-4">Email</th>
                  <th scope="col" className="px-6 py-4 text-center">Autorisation Diffusion</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 transition-colors">
                {filteredUsers.map((user: any) => {
                   return (
                    <tr key={user._id || user.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {user.fullname || user.name}
                      </td>
                      <td className="px-6 py-4 font-bold text-primary">
                        {user.city || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <Mail size={14} className="text-muted-foreground" />
                           {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => toggleDiffusion(user)}
                            className={`group relative flex items-center gap-3 px-6 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 border ${
                              user.canDiffuse 
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 shadow-lg shadow-emerald-500/10" 
                                : "bg-muted text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground hover:border-muted-foreground/30 shadow-none"
                            }`}
                          >
                            <div className={`h-2 w-2 rounded-full animate-pulse mr-1 ${user.canDiffuse ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                            {user.canDiffuse ? (
                              <span className="tracking-wide">DIFFUSION ACTIVÉE</span>
                            ) : (
                              <span className="tracking-wide">DIFFUSION DÉSACTIVÉE</span>
                            )}
                            <div className={`ml-2 p-1 rounded-lg transition-colors ${user.canDiffuse ? 'bg-emerald-500/20 text-emerald-600' : 'bg-muted-foreground/10 text-muted-foreground group-hover:text-foreground'}`}>
                               {user.canDiffuse ? <Shield size={14} /> : <ShieldOff size={14} />}
                            </div>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                         <button 
                            onClick={() => {
                              setEditingUserId(user._id || user.id);
                              setIsEditing(true);
                              setFormData({
                                fullname: user.fullname || user.name || '',
                                email: user.email || '',
                                password: '', // Pass empty if not changing
                                role: user.role || 'chef',
                                canDiffuse: user.canDiffuse || false,
                                address: user.address || '',
                                city: user.city || ''
                              });
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors border border-primary/20" 
                            title="Modifier"
                         >
                            <Edit2 size={16} />
                         </button>
                         <button 
                            onClick={() => handleDelete(user._id || user.id)}
                            className="p-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors border border-destructive/20" 
                            title="Supprimer"
                         >
                            <Trash2 size={16} />
                         </button>
                      </td>
                    </tr>
                )})}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal - Nouveau Chef */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
            onClick={() => !isSubmitting && !submitSuccess && setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
              <div>
                <h2 className="text-xl font-bold text-foreground">{isEditing ? "Modifier le Chef" : "Nouveau Chef d'Agence"}</h2>
                <p className="text-xs text-muted-foreground mt-1">{isEditing ? "Mettez à jour les informations du manager." : "Créez un compte pour un nouveau manager."}</p>
              </div>
              <button 
                onClick={() => {
                  if (!isSubmitting && !submitSuccess) {
                    setIsModalOpen(false);
                    setIsEditing(false);
                    setEditingUserId(null);
                    setFormData({ fullname: '', email: '', password: '', role: 'chef', canDiffuse: false, address: '', city: '' });
                  }
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-12 flex flex-col items-center justify-center text-center animate-in fade-in">
                <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                  <UserCheck size={32} />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">{isEditing ? "Modifié avec succès !" : "Compte créé avec succès !"}</h3>
                <p className="text-sm text-muted-foreground">{isEditing ? "Les informations ont été mises à jour." : "Le chef d'agence peut maintenant se connecter."}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    Nom Complet
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.fullname}
                    onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                    placeholder="Prénom Nom"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/40"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail size={16} className="text-primary" />
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@exemple.com"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/40"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Key size={16} className="text-primary" />
                    Mot de passe {isEditing && <span className="text-[10px] opacity-70">(laisser vide pour ne pas changer)</span>}
                  </label>
                  <input
                    required={!isEditing}
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/40"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Globe size={16} className="text-primary" />
                    Ville (Gouvernorat) de gestion
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
                    <MapPin size={16} className="text-primary" />
                    Quartier / Précisions adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Ex: Marsa, Ennasr, Centre-ville..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/40"
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-2xl transition-all hover:border-primary/30 group">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl transition-colors ${formData.canDiffuse ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                        {formData.canDiffuse ? <Shield size={20} /> : <ShieldOff size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground tracking-tight">Autorisation de diffusion</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Permettre au chef de diffuser du contenu</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, canDiffuse: !formData.canDiffuse})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.canDiffuse ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${formData.canDiffuse ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
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
                      <><Loader2 size={16} className="animate-spin" /> {isEditing ? "Mise à jour..." : "Création..."}</>
                    ) : (
                      isEditing ? 'Enregistrer' : 'Créer le compte'
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
