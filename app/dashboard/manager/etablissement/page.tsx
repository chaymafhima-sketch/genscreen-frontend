"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  ChevronRight,
  MonitorSmartphone,
  CheckCircle2,
  Loader2,
  Search,
  Globe,
  RefreshCcw,
  Edit2,
  Trash2,
  X
} from "lucide-react";

export default function ManagerEtablissementsPage() {
  const [etablissements, setEtablissements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState<any>(null);

  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchMyEtablissements = async () => {
    try {
      const profileRes = await fetch("/api/backend/users/profile", { cache: "no-store" });
      const user = profileRes.ok ? await profileRes.json() : null;
      if (!user) return;
      setUserData(user);

      const res = await fetch("/api/backend/etablissements", { cache: "no-store" });
      if (res.ok) {
        // Backend should already return only etablissements assigned to current manager
        const assignedEtablissements = await res.json();
        setEtablissements(assignedEtablissements || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEtablissements();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce établissement ?")) return;
    try {
      const res = await fetch(`/api/backend/etablissements/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");

      // Log deletion
      const user = userData || {};
      await fetch("/api/backend/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "warning",
          action: "Suppression établissement",
          source: "Responsable",
          user: user.name || user.email || "Responsable",
          details: `Suppression définitive d'un établissement.`
        })
      });

      fetchMyEtablissements();
    } catch (err: any) {
      toast.error(err.message || "Impossible de supprimer ce établissement");
    }
  };

  const openEditModal = (etablissement: any) => {
    setEditingId(etablissement._id || etablissement.id);
    setFormData({
      name: etablissement.name || '',
      address: etablissement.address || '',
      phone: etablissement.phone || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/backend/etablissements/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Erreur lors de l'enregistrement");

      // Log modification
      const user = userData || {};
      await fetch("/api/backend/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "info",
          action: "Modification établissement",
          source: "Responsable",
          user: user.name || user.email || "Responsable",
          details: `Mise à jour de l'établissement "${formData.name}"`
        })
      });

      setSubmitSuccess(true);
      fetchMyEtablissements();
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setEditingId(null);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEtablissements = etablissements.filter(e => e.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Gestion de Mes Établissements</h2>
          <p className="text-muted-foreground mt-2">Gérez les informations et les ressources de vos établissements.</p>
        </div>
        <div className="flex bg-muted p-1.5 rounded-2xl border border-border items-center gap-1">
          <div className="px-5 py-2 text-xs font-black text-primary uppercase tracking-widest border-border">
            {filteredEtablissements.length} Établissements
          </div>
          <button
            onClick={fetchMyEtablissements}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background transition-all active:rotate-180 duration-500"
            title="Rafraîchir"
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      <div className="relative group max-w-2xl mx-auto md:mx-0">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un établissement spécifique..."
          className="w-full bg-card/50 backdrop-blur-sm border border-border rounded-2xl py-4 pl-14 pr-6 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-card transition-all font-medium placeholder:text-muted-foreground/40 shadow-sm"
        />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : (
        <div className="soft-card overflow-hidden border border-border shadow-sm">
          {filteredEtablissements.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-6 bg-muted/20">
              <Building2 size={48} className="text-muted-foreground/30 mb-4" />
              <p className="text-lg font-bold text-foreground">Aucun établissement trouvé</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Aucun établissement assigné pour le moment à votre compte.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Établissement</th>
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Contact</th>
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredEtablissements.map((etablissement) => (
                    <tr key={etablissement.id || etablissement._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-foreground leading-none">{etablissement.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1.5">ID: {etablissement.id?.slice(-6) || etablissement._id?.slice(-6) || "LOCAL"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                          <Phone size={14} className="text-primary/60" /> {etablissement.phone || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {etablissement.status || 'Opérationnel'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {/* Modal - Edit Etablissement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-md transition-opacity"
            onClick={() => !isSubmitting && !submitSuccess && setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-border bg-muted/30">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Modifier l'Établissement</h2>
                  <p className="text-sm text-muted-foreground mt-1">Mettez à jour les coordonnées de votre établissement.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            {submitSuccess ? (
              <div className="p-16 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-top-4">
                <div className="h-20 w-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mb-6 border border-emerald-500/20">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Mise à jour Réussie</h3>
                <p className="text-muted-foreground">Les informations de l' établissement ont été actualisées.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nom de l'Établissement</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Établissement Centrale"
                    className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Téléphone</label>
                    <input
                      required
                      type="tel"
                      inputMode="numeric"
                      maxLength={8}
                      value={formData.phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                        setFormData({ ...formData, phone: digits });
                      }}
                      placeholder="Ex: 71000000"
                      className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Adresse</label>
                  <input
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ex: 12 Rue de l'Indépendance"
                    className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="pt-6 flex gap-4 border-t border-border mt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3.5 border border-border rounded-xl font-bold hover:bg-muted transition-all text-foreground"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 bg-primary hover:opacity-90 text-primary-foreground font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : "Confirmer"}
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