"use client";

import { useLanguage } from "@/lib/dictionaries/LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative flex items-center bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-full p-1 gap-0.5">
      <div
        className={`absolute top-1 h-7 w-10 rounded-full bg-indigo-900 dark:bg-indigo-500 shadow-lg shadow-indigo-900/30 dark:shadow-indigo-500/30 transition-all duration-300 ease-out ${
          language === "fr" ? "left-1" : "left-[calc(50%+1px)]"
        }`}
      />
      <button
        onClick={() => setLanguage("fr")}
        className={`relative z-10 w-10 h-7 text-[11px] font-black tracking-widest rounded-full transition-colors duration-300 ${
          language === "fr" ? "text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
      >
        FR
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`relative z-10 w-10 h-7 text-[11px] font-black tracking-widest rounded-full transition-colors duration-300 ${
          language === "en" ? "text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
      >
        EN
      </button>
    </div>
  );
}
