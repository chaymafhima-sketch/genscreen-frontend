"use client";

import { useState } from "react";
import { Sparkles, Image as ImageIcon, Loader2, CheckCircle2, RefreshCcw, X, ZoomIn } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";

interface AIGeneratorPanelProps {
  onUse: (url: string, type: "image" | "video", title?: string) => void;
  onClose: () => void;
}

export default function AIGeneratorPanel({ onUse, onClose }: AIGeneratorPanelProps) {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.ai.error);
      setResult(data.url);
      toast.success(t.ai.success);
    } catch (err: any) {
      setError(err.message || t.ai.error);
      toast.error(err.message || t.ai.error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Sparkles size={16} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{t.ai.title}</h2>
              <p className="text-xs text-muted-foreground">{t.ai.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">

          {/* Nom du contenu */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              {t.ai.name_label}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.ai.name_placeholder}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>

          {/* Prompt */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              {t.ai.description_label}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.ai.placeholder}
              rows={3}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
            />
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground hover:opacity-90 text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-primary/20"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t.ai.generating}
              </>
            ) : (
              <>
                <Sparkles size={16} />
                {t.ai.generate}
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/15 p-3 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Preview */}
          {result && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setIsZoomed(true)}
                className="group relative block w-full rounded-xl overflow-hidden border border-border bg-black/20 aspect-video cursor-zoom-in"
              >
                <img src={result} alt="Generated" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={10} /> {t.ai.generated}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 opacity-0 group-hover:opacity-100 transition-all">
                  <span className="flex items-center gap-1.5 text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full">
                    <ZoomIn size={14} /> Voir en grand
                  </span>
                </div>
              </button>

              <div className="flex gap-2">
                  <button
                    onClick={generate}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    <RefreshCcw size={13} /> {t.ai.regenerate}
                  </button>
                  <button
                    onClick={() => onUse(result, "image", title)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground hover:opacity-90 text-sm font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
                  >
                    <CheckCircle2 size={15} /> {t.ai.use}
                  </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Aperçu plein écran */}
      {isZoomed && result && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={26} />
          </button>
          <img
            src={result}
            alt="Aperçu plein écran"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
