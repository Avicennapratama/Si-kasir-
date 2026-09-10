"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Store, 
  ArrowLeft, 
  Tag, 
  MapPin, 
  Phone, 
  FileText, 
  Check, 
  Loader2,
  Sparkles 
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";

const CATEGORIES = [
  "Kuliner / F&B",
  "Toko Kelontong & Sembako",
  "Fashion & Pakaian",
  "Kriya & Kerajinan Tangan",
  "Jasa & Servis",
  "Pertanian & Perkebunan",
  "Elektronik & Gadget",
  "Usaha Lainnya",
];

export default function PengaturanUsahaPage() {
  const router = useRouter();
  const { business, updateBusinessProfile } = useAuth();

  const [name, setName] = useState(business?.name || "");
  const [category, setCategory] = useState(business?.category || CATEGORIES[0]);
  const [city, setCity] = useState("Bandung");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama usaha tidak boleh kosong.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (updateBusinessProfile) {
        await updateBusinessProfile({
          name: name.trim(),
          category,
        });
      }
      setSuccess(true);
      setTimeout(() => {
        router.push("/pengaturan");
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError("Gagal memperbarui profil usaha. Coba lagi.");
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090A0F] text-slate-100 px-4 sm:px-5 pt-6 pb-28 max-w-md mx-auto relative overflow-hidden">
      {/* Solar Ambient Glow */}
      <div
        className="absolute top-[-90px] left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full pointer-events-none blur-[130px] opacity-15"
        style={{
          background: "radial-gradient(circle, #FF8918 0%, #DA4E24 50%, transparent 80%)",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <button
          type="button"
          onClick={() => router.push("/pengaturan")}
          className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-base font-bold text-white">Profil Usaha</h1>
          <p className="text-[11px] text-slate-400">Kelola identitas &amp; bidang toko</p>
        </div>
        <div className="w-10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        {/* Nama Toko */}
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-orange-400" />
            <span>Nama Usaha / Toko</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Misal: Warung Berkah Bu Siti"
            className="w-full h-11 px-3.5 rounded-xl bg-black/50 border border-white/[0.08] focus:border-orange-500/50 text-sm text-white placeholder-slate-500 outline-none transition-colors"
          />
        </div>

        {/* Kategori Usaha */}
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-cyan-400" />
            <span>Kategori Bidang Usaha</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`p-2.5 rounded-xl border text-xs text-left font-semibold transition-all ${
                  category === cat
                    ? "bg-orange-500/10 border-orange-500/40 text-orange-400"
                    : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Wilayah Operasional */}
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kota / Wilayah Operasional</span>
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Contoh: Bandung, Jawa Barat"
            className="w-full h-11 px-3.5 rounded-xl bg-black/50 border border-white/[0.08] focus:border-emerald-500/50 text-sm text-white placeholder-slate-500 outline-none transition-colors"
          />
        </div>

        {/* Kontak WhatsApp */}
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-primary-400" />
            <span>Nomor WhatsApp Bisnis (Opsional)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0812xxxxxxxx"
            className="w-full h-11 px-3.5 rounded-xl bg-black/50 border border-white/[0.08] focus:border-primary-500/50 text-sm text-white placeholder-slate-500 outline-none transition-colors font-mono"
          />
        </div>

        {/* Deskripsi Toko */}
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Slogan / Deskripsi Singkat</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Menyediakan aneka kuliner masakan rumahan lezat dan halal..."
            className="w-full p-3 rounded-xl bg-black/50 border border-white/[0.08] focus:border-white/20 text-xs text-white placeholder-slate-500 outline-none transition-colors resize-none"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={saving || success}
          className={`w-full h-13 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            success
              ? "bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              : "bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-[0_0_25px_rgba(255,137,24,0.35)] hover:shadow-[0_0_35px_rgba(255,137,24,0.5)]"
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Menyimpan Profil...</span>
            </>
          ) : success ? (
            <>
              <Check className="w-5 h-5" />
              <span>Profil Usaha Tersimpan!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Simpan Perubahan Usaha</span>
            </>
          )}
        </button>
      </form>
    </main>
  );
}
