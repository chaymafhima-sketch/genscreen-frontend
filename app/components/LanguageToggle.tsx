"use client";

import { useLanguage } from "@/lib/dictionaries/LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative flex items-center bg-muted/60 border border-border rounded-full p-1 gap-0.5">
      {/* Sliding active indicator */}
      <div
        className={`absolute top-1 h-7 w-10 rounded-full bg-primary shadow-lg shadow-primary/30 transition-all duration-300 ease-out ${
          language === "fr" ? "left-1" : "left-[calc(50%+1px)]"
        }`}
      />

      <button
        onClick={() => setLanguage("fr")}
        className={`relative z-10 w-10 h-7 text-[11px] font-black tracking-widest rounded-full transition-colors duration-300 ${
          language === "fr"
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        FR
      </button>

      <button
        onClick={() => setLanguage("en")}
        className={`relative z-10 w-10 h-7 text-[11px] font-black tracking-widest rounded-full transition-colors duration-300 ${
          language === "en"
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}
