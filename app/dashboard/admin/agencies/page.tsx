"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2, AlertCircle, Building2, MapPin, Phone, Building, Edit2, Trash2, Search, Globe, RefreshCcw } from "lucide-react";
import { TUNISIA_CITIES } from "@/app/lib/constants/tunisia-cities";

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', city: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchAgencies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/agencies", {
        headers: { "Authorization": `Bearer ${token}` }
      });
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
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette agence ?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/agencies/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
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
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', address: '', city: '', phone: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      let res;
      if (editingId) {
        res = await fetch(`http://localhost:3001/agencies/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      } else {
        res = await fetch("http://localhost:3001/agencies", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      }
      
      if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
      setSubmitSuccess(true);
      fetchAgencies();
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setFormData({ name: '', address: '', city: '', phone: '' });
        setEditingId(null);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 transition-colors">
                {filteredAgencies.map((agency: any) => (
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
                      {agency.address}
                    </td>
                    <td className="px-6 py-4">
                      {agency.phone}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <button onClick={() => openEditModal(agency)} className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors border border-primary/20" title="Modifier">
                          <Edit2 size={16} />
                       </button>
                       <button onClick={() => handleDelete(agency._id || agency.id)} className="p-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors border border-destructive/20" title="Supprimer">
                          <Trash2 size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal - Nouvelle/Modifier Agence */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
            onClick={() => !isSubmitting && !submitSuccess && setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
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
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                    <MapPin size={16} className="text-primary" />
                    Quartier / Adresse exacte
                  </label>
                  <input
                    required
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
                    Numéro de contact
                  </label>
                  <input
                    required
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
