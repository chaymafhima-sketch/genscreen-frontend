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
        const res = await fetch("/api/backend/content", { cache: "no-store" });

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
      <div className="flex justify-center items-center h-48 bg-card border border-border rounded-2xl transition-colors">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error) {
    return (
       <div className="flex justify-center items-center h-48 bg-card border border-border rounded-2xl text-destructive gap-2 transition-colors">
         <AlertCircle size={24} />
         <span>{error}</span>
       </div>
    );
  }

  return (
    <div className="soft-card overflow-hidden shadow-sm transition-colors p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-muted-foreground">
          <thead className="bg-muted/50 text-xs uppercase font-medium text-muted-foreground border-b border-border transition-colors">
            <tr>
              <th scope="col" className="px-6 py-4">Nom du Contenu</th>
              <th scope="col" className="px-6 py-4">Type</th>
              <th scope="col" className="px-6 py-4">Statut</th>
              <th scope="col" className="px-6 py-4">Créé le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 transition-colors">
            {contents.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  Aucun contenu trouvé.
                </td>
              </tr>
            ) : (
              contents.slice(0, 5).map((item: any) => (
                <tr key={item._id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {item.title || "Contenu Sans Nom"}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {item.type || "Inconnu"}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground/60">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Récemment"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {contents.length > 5 && (
        <div className="p-4 border-t border-border bg-muted/20 flex justify-center transition-colors">
          <Link href="/dashboard/admin/content" className="text-sm text-primary hover:opacity-80 font-medium transition-colors">
            Voir tous les contenus ({contents.length}) →
          </Link>
        </div>
      )}
    </div>
  );
}