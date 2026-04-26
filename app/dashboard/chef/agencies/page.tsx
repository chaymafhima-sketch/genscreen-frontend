"use client";

import { useEffect, useState } from "react";
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

export default function ChefAgenciesPage() {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState<any>(null);
  
  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', city: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchMyAgencies = async () => {
    try {
      const profileRes = await fetch("/api/backend/users/profile", { cache: "no-store" });
      const user = profileRes.ok ? await profileRes.json() : null;
      if (!user) return;
      setUserData(user);

      const res = await fetch("/api/backend/agencies", { cache: "no-store" });
      if (res.ok) {
        // Backend should already return only agencies assigned to current chef
        const assignedAgencies = await res.json();
        setAgencies(assignedAgencies || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAgencies();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette agence ?")) return;
    try {
      const res = await fetch(`/api/backend/agencies/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");

      // Log deletion
      const user = userData || {};
      await fetch("/api/backend/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "warning",
          action: "Suppression agence",
          source: "Chef d'Agence",
          user: user.name || user.email || "Chef",
          details: `Suppression définitive d'une agence locale.`
        })
      });

      fetchMyAgencies();
    } catch (err: any) {
      alert(err.message || "Impossible de supprimer cette agence");
    }
  };

  const openEditModal = (agency: any) => {
    setEditingId(agency._id || agency.id);
    setFormData({ 
      name: agency.name || '', 
      address: agency.address || '', 
      city: agency.city || '', 
      phone: agency.phone || '' 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/backend/agencies/${editingId}`, {
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
          action: "Modification agence",
          source: "Chef d'Agence",
          user: user.name || user.email || "Chef",
          details: `Mise à jour de l'agence "${formData.name}"`
        })
      });

      setSubmitSuccess(true);
      fetchMyAgencies();
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

  const filteredAgencies = agencies.filter(a => a.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Gestion de Mes Agences</h2>
          <p className="text-muted-foreground mt-2">Gérez les informations et les ressources de vos établissements.</p>
        </div>
        <div className="flex bg-muted p-1.5 rounded-2xl border border-border items-center gap-1">
           <div className="px-5 py-2 text-xs font-black text-primary uppercase tracking-widest border-border">
              {filteredAgencies.length} Agences
           </div>
           <button 
             onClick={fetchMyAgencies}
             className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background transition-all active:rotate-180 duration-500"
             title="Rafraîchir"
           >
             <RefreshCcw size={16} />
           </button>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une agence spécifique..."
          className="w-full bg-card border border-border rounded-2xl py-4 pl-14 pr-6 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium placeholder:text-muted-foreground/40 shadow-sm"
        />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredAgencies.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center px-6 border-2 border-dashed border-border rounded-3xl bg-muted/20">
               <Building2 size={48} className="text-muted-foreground/30 mb-4" />
               <p className="text-lg font-bold text-foreground">Aucune agence trouvée</p>
               <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                 Aucune agence assignée pour le moment à votre compte.
               </p>
            </div>
          ) : (
            filteredAgencies.map((agency) => (
              <div key={agency.id || agency._id} className="soft-card p-8 shadow-sm group border-border transition-all hover:shadow-xl hover:shadow-primary/5">
                 <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                       <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/5 group-hover:scale-110 transition-transform">
                          <Building2 size={32} />
                       </div>
                       <div>
                          <h3 className="text-2xl font-bold text-foreground tracking-tight">{agency.name}</h3>
                          <p className="text-xs text-primary font-black uppercase tracking-widest mt-1">CODE: {agency.id?.slice(-6) || agency._id?.slice(-6) || "LOCAL"}</p>
                       </div>
                    </div>
                    <div className="flex gap-2 items-center">
                       <button onClick={() => openEditModal(agency)} className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors border border-primary/20" title="Modifier">
                          <Edit2 size={16} />
                       </button>
                       <button onClick={() => handleDelete(agency._id || agency.id)} className="p-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl transition-colors border border-destructive/20" title="Supprimer">
                          <Trash2 size={16} />
                       </button>
                       <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ml-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          {agency.status || 'Opérationnel'}
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
                          <Globe size={18} className="text-primary/60 shrink-0" />
                          <span className="text-sm font-bold text-primary">{agency.city || "Ville non définie"}</span>
                       </div>
                       <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
                          <MapPin size={18} className="text-primary/60 shrink-0" />
                          <span className="text-sm font-medium leading-relaxed">{agency.address || "Quartier non défini"}</span>
                       </div>
                       <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
                          <Phone size={18} className="text-primary/60 shrink-0" />
                          <span className="text-sm font-medium">{agency.phone || "Non renseigné"}</span>
                       </div>
                    </div>
                    
                    <div className="bg-muted/30 border border-border/40 p-5 rounded-2xl flex flex-col items-center justify-center text-center group-hover:bg-primary/5 group-hover:border-primary/10 transition-all">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Parc d'écrans</p>
                       <div className="flex items-center gap-3">
                          <MonitorSmartphone size={24} className="text-primary/70" />
                          <span className="text-3xl font-black text-foreground">{agency.screensCount || 0}</span>
                       </div>
                    </div>
                 </div>

                 <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
                    <div className="flex -space-x-2">
                       {[1, 2].map(i => (
                         <div key={i} className="h-8 w-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                           <Users size={12} />
                         </div>
                       ))}
                       <div className="h-8 w-8 rounded-full bg-primary border-2 border-card flex items-center justify-center text-[10px] text-primary-foreground font-bold">+2</div>
                    </div>
                    <button className="flex items-center gap-2 text-xs font-black text-primary hover:opacity-80 uppercase tracking-widest transition-all group/btn">
                       Détails Agence <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                 </div>
              </div>
            ))
          )}
        </div>
      )}
      {/* Modal - Edit Agency */}
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
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Modifier l'agence</h2>
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
                   <p className="text-muted-foreground">Les informations de l'agence ont été actualisées.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nom de l'agence</label>
                      <input 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Ex: Agence Centrale" 
                        className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                      />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ville</label>
                        <input 
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          placeholder="Ex: Tunis" 
                          className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Téléphone</label>
                        <input 
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="Ex: 71 000 000" 
                          className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                        />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Adresse</label>
                      <input 
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Ex: 12 Rue de l'Indépendance" 
                        className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                      />
                   </div>

                   <div className="pt-6 flex gap-4">
                      <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-semibold py-3 rounded-xl transition-all"
                      >
                         Annuler
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 bg-primary hover:opacity-90 text-primary-foreground font-semibold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                      >
                         {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : "Enregistrer"}
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

