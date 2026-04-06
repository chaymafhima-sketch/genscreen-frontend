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
  Key,
  UserPlus
} from "lucide-react";

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
    canDiffuse: false 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch Users
      const usersRes = await fetch("http://localhost:3001/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
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

  const handleRegisterChef = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Erreur lors de la création du chef");
      
      setSubmitSuccess(true);
      fetchData();
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setFormData({ fullname: '', email: '', password: '', role: 'chef', canDiffuse: false });
      }, 1500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDiffusion = async (user: any) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/users/${user._id || user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ canDiffuse: !user.canDiffuse })
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gestion des Chefs d'Agence</h1>
          <p className="text-slate-400 mt-2">Inscrivez de nouveaux managers et gérez leurs permissions de diffusion.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
        >
          <UserPlus size={18} /> Nouveau Chef
        </button>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl shadow-xl overflow-hidden min-h-[400px] flex flex-col">
        <div className="flex-1 p-0">
          {loading ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-slate-500">
              <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
              <p>Chargement des managers...</p>
            </div>
          ) : error ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-red-400">
              <AlertCircle size={32} className="mb-4" />
              <p>{error}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 text-slate-500">
              <UserCheck size={48} className="mb-4 opacity-50" />
              <p>Aucun chef d'agence trouvé.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950/50 text-xs uppercase font-medium text-slate-300 border-b border-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4">Nom Complet</th>
                  <th scope="col" className="px-6 py-4">Email</th>
                  <th scope="col" className="px-6 py-4 text-center">Autorisation Diffusion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {users.map((user: any) => {
                   return (
                    <tr key={user._id || user.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">
                        {user.fullname || user.name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <Mail size={14} className="text-slate-500" />
                           {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => toggleDiffusion(user)}
                            className={`group relative flex items-center gap-3 px-6 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 border ${
                              user.canDiffuse 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 shadow-lg shadow-emerald-500/10" 
                                : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:text-white hover:border-slate-600 shadow-inner"
                            }`}
                          >
                            <div className={`h-2 w-2 rounded-full animate-pulse mr-1 ${user.canDiffuse ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                            {user.canDiffuse ? (
                              <span className="tracking-wide">DIFFUSION ACTIVÉE</span>
                            ) : (
                              <span className="tracking-wide">DIFFUSION DÉSACTIVÉE</span>
                            )}
                            <div className={`ml-2 p-1 rounded-lg transition-colors ${user.canDiffuse ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700/50 text-slate-500 group-hover:text-white'}`}>
                               {user.canDiffuse ? <Shield size={14} /> : <ShieldOff size={14} />}
                            </div>
                          </button>
                        </div>
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
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            onClick={() => !isSubmitting && !submitSuccess && setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-800/50">
              <div>
                <h2 className="text-xl font-bold text-white">Nouveau Chef d'Agence</h2>
                <p className="text-xs text-slate-400 mt-1">Créez un compte pour un nouveau manager.</p>
              </div>
              <button 
                onClick={() => !isSubmitting && !submitSuccess && setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-12 flex flex-col items-center justify-center text-center animate-in fade-in">
                <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                  <UserCheck size={32} />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Compte créé avec succès !</h3>
                <p className="text-sm text-slate-400">Le chef d'agence peut maintenant se connecter.</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterChef} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    Nom Complet
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.fullname}
                    onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                    placeholder="Prénom Nom"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Mail size={16} className="text-blue-400" />
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@exemple.com"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Key size={16} className="text-blue-400" />
                    Mot de passe
                  </label>
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl transition-all hover:border-blue-500/30 group">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl transition-colors ${formData.canDiffuse ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {formData.canDiffuse ? <Shield size={20} /> : <ShieldOff size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight">Autorisation de diffusion</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Permettre au chef de diffuser du contenu</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, canDiffuse: !formData.canDiffuse})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.canDiffuse ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.canDiffuse ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <><Loader2 size={16} className="animate-spin" /> Création...</>
                    ) : (
                      'Créer le compte'
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
