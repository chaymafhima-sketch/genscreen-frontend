"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowRight, MonitorPlay, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import LanguageToggle from "@/app/components/LanguageToggle";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const { t } = useLanguage();

  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Update email if query param changes
  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(t.auth.success_forgot_password);
      } else {
        if (response.status === 401) {
          setError(t.auth.error_email_not_found);
        } else {
          setError(data.message || t.common.error);
        }
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError(t.common.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
            <Mail size={20} />
          </div>
          <input
            type="email"
            placeholder={t.auth.email_placeholder}
            className="block w-full rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 pl-12 text-sm text-slate-100 shadow-sm transition-all focus:border-blue-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || success !== ""}
        className="group flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
      >
        {isLoading ? t.auth.verifying : t.auth.send_link_button}
        {!isLoading && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
      </button>
    </form>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useLanguage();

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
            {t.auth.brand_title} <span className="text-blue-400">{t.auth.brand_highlight}</span>
          </h1>
          <p className="mt-4 text-xl text-slate-300 leading-relaxed">
            {t.auth.brand_subtitle}
          </p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex w-full flex-col lg:w-1/2 relative bg-slate-950">
        <div className="flex justify-between items-center px-8 sm:px-12 lg:px-12 pt-6 z-10">
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={18} />
            {t.auth.back_to_login}
          </button>
          <LanguageToggle />
        </div>

        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="flex flex-1 flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32">
          <div className="w-full max-w-md mx-auto z-10">
            <div className="mb-10 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                  <MonitorPlay size={24} />
                </div>
                <span className="text-2xl font-bold tracking-wider text-slate-100 uppercase">TUS</span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                {t.auth.forgot_password_title}
              </h2>
              <p className="text-sm text-slate-400">
                {t.auth.forgot_password_subtitle}
              </p>
            </div>

            <Suspense fallback={<div className="text-center text-slate-400">{t.common.loading}</div>}>
              <ForgotPasswordForm />
            </Suspense>

            <p className="mt-8 text-center text-sm text-slate-500 italic">
              {t.auth.platform_reserved}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
