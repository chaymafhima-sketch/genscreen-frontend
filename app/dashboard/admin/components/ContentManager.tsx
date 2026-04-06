"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MoreHorizontal, PlayCircle, Clock, AlertCircle, Loader2 } from "lucide-react";

export default function ContentManager() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/content", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des contenus");
        }

        const data = await res.json();
        setContents(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erreur de connexion");
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, []);

  const getStatusBadge = (status?: string) => {
    // Si la bdd n'a pas encoré de statut, on met un statut par défaut
    const currentStatus = status || "Actif"; 
    
    switch (currentStatus) {
      case "Actif":
        return (
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <PlayCircle size={12} /> Actif
          </span>
        );
      case "En attente":
        return (
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Clock size={12} /> En attente
          </span>
        );
      case "Erreur":
        return (
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle size={12} /> Erreur
          </span>
        );
      default:
        return <span>{currentStatus}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
       <div className="flex justify-center items-center h-48 bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl text-red-400 gap-2">
         <AlertCircle size={24} />
         <span>{error}</span>
       </div>
    );
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-950/50 text-xs uppercase font-medium text-slate-300 border-b border-slate-800/50">
            <tr>
              <th scope="col" className="px-6 py-4">Nom du Contenu</th>
              <th scope="col" className="px-6 py-4">Type</th>
              <th scope="col" className="px-6 py-4">Statut</th>
              <th scope="col" className="px-6 py-4">Créé le</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {contents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Aucun contenu trouvé.
                </td>
              </tr>
            ) : (
              contents.slice(0, 5).map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-200">
                    {item.title || "Contenu Sans Nom"}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {item.type || "Inconnu"}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Récemment"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-500 hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-500/10">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {contents.length > 5 && (
        <div className="p-4 border-t border-slate-800/50 bg-slate-950/20 flex justify-center">
          <Link href="/dashboard/admin/content" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Voir tous les contenus ({contents.length}) →
          </Link>
        </div>
      )}
    </div>
  );
}