"use client";

import { useEffect, useState } from "react";
import { User, Mail, Shield, MapPin, Save, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";

export default function AdminProfilePage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ fullname: "", city: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/backend/users/profile", { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      setProfile(data);
      setForm({
        fullname: data.fullname || data.name || "",
        city: data.city || "",
        address: data.address || "",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?._id && !profile?.id) return;
    setSaving(true);
    try {
      const userId = profile._id || profile.id;
      const res = await fetch(`/api/backend/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erreur");
      await fetchProfile();
      toast.success(t.dashboard.save);
    } catch (err: any) {
      toast.error(t.common.error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 flex items-center justify-center text-muted-foreground"><Loader2 className="animate-spin mr-2" /> {t.common.loading}</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">{t.profile.title}</h1>
        <p className="text-muted-foreground mt-2">{t.profile.subtitle}</p>
      </div>
      <div className="soft-card p-8 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-4 rounded-xl bg-muted/40 border border-border"><p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2"><Mail size={14} /> Email</p><p className="text-sm font-medium text-foreground">{profile?.email || "---"}</p></div>
          <div className="p-4 rounded-xl bg-muted/40 border border-border"><p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2"><Shield size={14} /> Role</p><p className="text-sm font-medium text-foreground uppercase">{profile?.role || "---"}</p></div>
        </div>
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-2"><label className="text-sm font-medium text-muted-foreground flex items-center gap-2"><User size={15} /> {t.profile.full_name}</label><input value={form.fullname} onChange={(e) => setForm((p) => ({ ...p, fullname: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-muted-foreground flex items-center gap-2"><MapPin size={15} /> {t.profile.city}</label><input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-muted-foreground flex items-center gap-2"><MapPin size={15} /> {t.profile.address}</label><input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" /></div>
          <div className="pt-3 flex justify-end"><button type="submit" disabled={saving} className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-primary/20 flex items-center gap-2">{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {t.common.save}</button></div>
        </form>
      </div>
    </div>
  );
}
