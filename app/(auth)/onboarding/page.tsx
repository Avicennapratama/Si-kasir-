"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";
import { Store, MapPin, Tag, ArrowRight, CheckCircle2 } from "lucide-react";

const CATEGORIES = [
  { id: "kuliner", label: "🍜 Kuliner / Warung", desc: "Makanan, minuman, cafe" },
  { id: "fashion", label: "👕 Fashion & Pakaian", desc: "Baju, jilbab, distro" },
  { id: "kriya", label: "🎨 Kriya & Seni", desc: "Kerajinan tangan, souvenir" },
  { id: "jasa", label: "✂️ Jasa & Servis", desc: "Laundry, pangkas rambut, bengkel" },
  { id: "kelontong", label: "🏪 Toko Kelontong", desc: "Sembako, pulsa, warung harian" },
  { id: "lainnya", label: "📦 Usaha Lainnya", desc: "Agribisnis, online shop, dll" },
];

export default function OnboardingPage() {
  const { user, business, updateBusinessProfile } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(business?.name || "");
  const [category, setCategory] = useState(business?.category || "kuliner");
  const [city, setCity] = useState("Bandung");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama usaha tidak boleh kosong.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (updateBusinessProfile) {
        await updateBusinessProfile({
          name: name.trim(),
          category,
        });
      }
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError("Gagal menyimpan profil usaha. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col justify-between px-5 py-8 w-full relative overflow-hidden">
      {/* Solar Flare Ambient Glow */}
      <div 
        className="absolute top-[-80px] right-[-80px] w-[280px] h-[280px] rounded-full pointer-events-none blur-[100px] opacity-20"
        style={{
          background: "radial-gradient(circle, #FF8918 0%, #DA4E24 60%, transparent 80%)"
        }}
      />

      {/* Header Section */}
      <div className="pt-4 relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Store className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
            Langkah Terakhir
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1.5">
          Profil Usaha Anda
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Beri tahu kami nama tokomu agar laporan kasir dan struk AI bisa disesuaikan otomatis.
        </p>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="my-auto py-6 space-y-5 relative z-10">
        {error && (
          <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Input Nama Usaha */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-slate-400" />
            <span>Nama Toko / Usaha <span className="text-orange-400">*</span></span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Mie Ayam Berkah Cak Man"
            className="w-full h-12 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 text-sm text-white placeholder-slate-500 transition-all"
          />
        </div>

        {/* Selector Kategori Usaha (Bento Pill Selection) */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>Kategori Usaha</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-orange-500/50 bg-orange-500/10 text-white shadow-[0_0_12px_rgba(255,137,24,0.1)]"
                      : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/10"
                  }`}
                >
                  <div className="text-xs font-semibold leading-snug flex items-center justify-between">
                    <span>{cat.label}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 truncate">
                    {cat.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kota / Wilayah */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Kota / Kabupaten Usaha</span>
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Contoh: Bandung, Surabaya, Jakarta Selatan"
            className="w-full h-12 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 text-sm text-white placeholder-slate-500 transition-all"
          />
        </div>
      </form>

      {/* Submit Button */}
      <div className="relative z-10 pt-4">
        <button
          onClick={handleSubmit}
          disabled={loading || !name.trim()}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#FF8918] to-[#DA4E24] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,137,24,0.3)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Mulai Buka Kasir</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </main>
  );
}