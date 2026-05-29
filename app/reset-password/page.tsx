"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, MonitorPlay, AlertCircle, CheckCircle2, ArrowLeft, Sun, Moon } from "lucide-react";
import LanguageToggle from "@/app/components/LanguageToggle";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";
import { useTheme } from "@/app/components/theme-provider";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { t } = useLanguage();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError(t.auth.error_passwords_dont_match);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/backend/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: form.password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(t.auth.success_reset_password);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(data.message || t.common.error);
      }
    } catch {
      setError(t.common.error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl bg-red-500/10 p-3.5 text-red-400 border border-red-500/15">
        <AlertCircle size={16} className="shrink-0" />
        <span className="text-xs font-medium">Token manquant ou invalide.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl bg-red-500/10 p-3.5 text-red-400 border border-red-500/15">
          <AlertCircle size={16} className="shrink-0" />
          <span className="text-xs font-medium">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-500/10 p-3.5 text-emerald-400 border border-emerald-500/15">
          <CheckCircle2 size={16} className="shrink-0" />
          <span className="text-xs font-medium">{success}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">
          {t.auth.new_password_label}
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none dark:text-slate-500 text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Lock size={16} />
          </div>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full dark:bg-white/5 bg-slate-50 dark:border-white/10 border-slate-200 border rounded-xl py-3 pl-10 pr-4 text-sm dark:text-white text-slate-900 dark:placeholder-slate-600 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">
          {t.auth.confirm_password_label}
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none dark:text-slate-500 text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Lock size={16} />
          </div>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full dark:bg-white/5 bg-slate-50 dark:border-white/10 border-slate-200 border rounded-xl py-3 pl-10 pr-4 text-sm dark:text-white text-slate-900 dark:placeholder-slate-600 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            required
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || success !== ""}
        className="group w-full flex items-center justify-center gap-2.5 py-3.5 bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-900/25 dark:shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none mt-2"
      >
        {isLoading ? t.auth.verifying : t.auth.reset_button}
        {!isLoading && success === "" && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-screen overflow-hidden font-sans dark:bg-gradient-to-br dark:from-[#0b0f2a] dark:via-[#0d1235] dark:to-[#080b1e] bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center transition-colors duration-300 p-6">

      <img src="/images/auth_bg.png" alt="" className="absolute inset-0 w-full h-full object-cover dark:opacity-10 opacity-5 mix-blend-luminosity" />

      <div className="absolute top-10 right-14 dark:opacity-20 opacity-30">
        <div className="relative w-10 h-10">
          <div className="absolute top-1/2 left-0 w-full h-[2px] dark:bg-blue-400 bg-blue-600 -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 h-full w-[2px] dark:bg-blue-400 bg-blue-600 -translate-x-1/2" />
        </div>
      </div>
      <div className="absolute bottom-10 left-8 dark:opacity-15 opacity-25 flex flex-col gap-1.5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-[1.5px] dark:bg-blue-400 bg-blue-500 rounded" style={{ width: `${40 + i * 12}px` }} />
        ))}
      </div>
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full dark:bg-blue-600/10 bg-blue-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-56 h-56 rounded-full dark:bg-indigo-600/10 bg-indigo-400/20 blur-[80px] pointer-events-none" />

      <div className="absolute top-6 right-8 z-30 flex items-center gap-3">
        <LanguageToggle />
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-xl dark:text-slate-400 text-slate-500 hover:text-white hover:bg-white/10 dark:border-white/10 border-slate-200 border transition-all"
          aria-label="Toggle theme"
        >
          {mounted ? (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />) : <div className="w-[18px] h-[18px]" />}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-8 lg:px-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 py-16">

        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-10">
            <div className="h-12 w-12 dark:bg-blue-600/20 bg-blue-600/10 dark:border-blue-500/30 border-blue-500/40 border rounded-xl flex items-center justify-center">
              <MonitorPlay size={24} className="dark:text-blue-400 text-blue-600" />
            </div>
            <span className="dark:text-white text-slate-900 font-black tracking-[0.2em] uppercase text-2xl">TUS</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold dark:text-white text-slate-900 leading-[1.1] mb-5">
            {t.auth.brand_title}<br />
            <span className="dark:text-blue-400 text-blue-600">{t.auth.brand_highlight}</span>
          </h1>
          <div className="w-12 h-1 dark:bg-blue-500 bg-blue-600 rounded-full mb-6 mx-auto lg:mx-0" />
          <p className="dark:text-slate-400 text-slate-500 leading-relaxed max-w-sm mx-auto lg:mx-0 text-sm">
            {t.auth.brand_subtitle}
          </p>
        </div>

        <div className="w-full max-w-sm lg:max-w-[360px] shrink-0">
          <div className="dark:bg-white/[0.06] bg-white/80 backdrop-blur-xl rounded-3xl p-8 dark:border-white/10 border-slate-200/80 border shadow-2xl dark:shadow-black/40 shadow-blue-200/50">

            <button
              onClick={() => router.push("/login")}
              className="flex items-center gap-1.5 dark:text-slate-400 text-slate-500 hover:dark:text-white hover:text-slate-800 transition-colors text-xs font-medium mb-6"
            >
              <ArrowLeft size={14} />
              {t.auth.back_to_login}
            </button>

            <h2 className="text-2xl font-bold dark:text-white text-slate-900 text-center mb-2 tracking-tight">
              {t.auth.reset_password_title}
            </h2>
            <p className="text-xs dark:text-slate-500 text-slate-400 text-center mb-7 leading-relaxed">
              {t.auth.reset_password_subtitle}
            </p>

            <Suspense fallback={<div className="text-center dark:text-slate-400 text-slate-500 text-sm">{t.common.loading}</div>}>
              <ResetPasswordForm />
            </Suspense>

            <p className="mt-6 text-center text-[11px] dark:text-slate-700 text-slate-400 italic">
              {t.auth.platform_reserved}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
