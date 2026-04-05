"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, ArrowRight, MonitorPlay, Shield, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "chef",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log(data);

      if (res.ok || data.success) {
        setSuccess("Inscription réussie ! Redirection vers la page de connexion...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        let msg = data.message || "Erreur lors de l'inscription";
        if (Array.isArray(msg)) msg = msg[0]; // Extraire le premier message d'erreur si c'est un tableau de validation
        
        if (msg === "Utilisateur déjà existant") {
          setError("Cette adresse email est déjà utilisée.");
        } else {
          setError(msg);
        }
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de contacter le serveur. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Left Pane - Visual Branding */}
      <div className="relative hidden w-1/2 lg:block">
        <div className="absolute inset-0 z-10 bg-slate-900/40 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        <img
          src="/images/auth_bg.png"
          alt="Dashboard Background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute bottom-12 left-12 z-20 max-w-xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-6">
            L'affichage dynamique, <span className="text-blue-400">réinventé</span>.
          </h1>
          <p className="mt-4 text-xl text-slate-300 leading-relaxed">
            Créez, gérez et diffusez vos contenus avec une précision absolue.
            Rejoignez notre plateforme de nouvelle génération.
          </p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex w-full flex-col justify-center px-8 sm:px-12 lg:w-1/2 lg:px-24 xl:px-32 relative bg-slate-950">
        
        {/* Subtle background glow effect for right pane */}
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="w-full max-w-md mx-auto z-10">
          <div className="mb-10 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <MonitorPlay size={24} />
              </div>
              <span className="text-2xl font-bold tracking-wider text-slate-100 uppercase">TUS</span>
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
              Créer un compte
            </h2>
            <p className="text-sm text-slate-400">
              Inscrivez-vous pour accéder au tableau de bord professionnel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-red-500 border border-red-500/20">
                <AlertCircle size={20} className="shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 p-4 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 size={20} className="shrink-0" />
                <span className="text-sm font-medium">{success}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Name Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Nom complet"
                  className="block w-full rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 pl-12 text-sm text-slate-100 shadow-sm transition-all focus:border-blue-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Email Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  placeholder="Adresse email"
                  className="block w-full rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 pl-12 text-sm text-slate-100 shadow-sm transition-all focus:border-blue-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              {/* Password Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  placeholder="Mot de passe"
                  className="block w-full rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 pl-12 text-sm text-slate-100 shadow-sm transition-all focus:border-blue-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              {/* Role Select Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <Shield size={20} />
                </div>
                <select
                  className="block w-full rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 pl-12 text-sm text-slate-100 shadow-sm transition-all focus:border-blue-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="chef" className="bg-slate-900 text-slate-100">Chef d'agence</option>
                  <option value="admin" className="bg-slate-900 text-slate-100">Administrateur</option>
                </select>
                {/* Custom arrow for select since appearance is none */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? "Création en cours..." : "S'inscrire"}
              {!isLoading && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Déjà inscrit ?{" "}
            <a
              href="/login"
              className="font-semibold text-blue-400 transition-colors hover:text-blue-300 hover:underline underline-offset-4"
            >
              Connectez-vous ici
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}