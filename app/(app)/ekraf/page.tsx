"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Camera, 
  ShieldCheck, 
  Bot, 
  Settings, 
  Award, 
  ArrowRight, 
  Zap, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  Flame
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";

export default function EkrafHubPage() {
  const router = useRouter();
  const { user, business } = useAuth();

  const services = [
    {
      id: "studio",
      title: "Studio Foto Produk AI",
      subtitle: "Katalog & Caption Cepat",
      description: "Sulap foto meja jadi foto studio profesional & buat caption jualan sosmed otomatis.",
      route: "/studio",
      icon: Camera,
      badge: "AI Vision",
      badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/30",
      glowColor: "from-orange-500/20 to-transparent",
      accentIconBg: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    },
    {
      id: "hki",
      title: "Klinik & Valuasi HKI",
      subtitle: "Estimasi Nilai Hak Cipta",
      description: "Hitung estimasi nilai ekonomi merek/resep & cetak dokumen pra-pendaftaran DJKI.",
      route: "/hki",
      icon: ShieldCheck,
      badge: "Pra-Valuasi",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      glowColor: "from-emerald-500/20 to-transparent",
      accentIconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      id: "asisten",
      title: "Asisten Legalitas & Bisnis",
      subtitle: "Chatbot NIB & Halal",
      description: "Tanya jawab izin usaha, sertifikat halal gratis, tips omzet, dan strategi permodalan.",
      route: "/asisten",
      icon: Bot,
      badge: "Chatbot 24/7",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      glowColor: "from-cyan-500/20 to-transparent",
      accentIconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    },
    {
      id: "pengaturan",
      title: "Pengaturan & Privasi Data",
      subtitle: "Profil & Keamanan",
      description: "Kelola data usaha, kontrol isolasi akun, sinkronisasi offline outbox, dan ekspor data.",
      route: "/pengaturan",
      icon: Settings,
      badge: "Akun & Data",
      badgeColor: "bg-slate-500/10 text-slate-300 border-slate-500/30",
      glowColor: "from-slate-500/20 to-transparent",
      accentIconBg: "bg-white/[0.05] text-slate-300 border-white/[0.1]",
    },
  ];

  return (
    <main className="min-h-screen bg-[#090A0F] text-slate-100 px-4 sm:px-5 pt-6 pb-28 max-w-md mx-auto relative overflow-hidden">
      {/* Background Solar Ambient Flare */}
      <div
        className="absolute top-[-90px] right-[-40px] w-[300px] h-[300px] rounded-full pointer-events-none blur-[120px] opacity-15"
        style={{
          background: "radial-gradient(circle, #FF8918 0%, #DA4E24 50%, transparent 80%)",
        }}
      />

      {/* Header Bar */}
      <div className="mb-5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Solusi Kreatif &amp; Legalitas UMKM</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Layanan Ekraf &amp; Bisnis
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {business?.name ? `${business.name} • ` : ""}Alat bantu cerdas untuk ekspansi usaha Anda
        </p>
      </div>

      {/* Gamifikasi Banner Ringan */}
      <div 
        onClick={() => router.push("/gamifikasi")}
        className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-white/[0.02] to-transparent border border-orange-500/20 mb-5 flex items-center justify-between cursor-pointer hover:border-orange-500/40 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,137,24,0.3)]">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Pencapaian &amp; Misi Harian</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-500/20 text-orange-300 font-semibold">
                Baru
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Lihat streak rajin mencatat &amp; kumpulkan lencana usaha
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
      </div>

      {/* Grid 4 Kartu Layanan Ekraf */}
      <div className="space-y-3.5">
        {services.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => router.push(item.route)}
              className="group p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15] active:scale-[0.99] transition-all cursor-pointer relative overflow-hidden backdrop-blur-md"
            >
              {/* Subtle card glow */}
              <div
                className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-bl ${item.glowColor}`}
              />

              <div className="flex items-start gap-3.5 relative z-10">
                {/* Icon Box */}
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${item.accentIconBg}`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h2 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                      {item.title}
                    </h2>
                    <span
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium mb-1">
                    {item.subtitle}
                  </p>

                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Bottom Action Hint */}
              <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-400 group-hover:text-slate-200">
                <span>Buka Layanan</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-orange-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info & Disclaimer */}
      <div className="mt-8 text-center space-y-2 text-[11px] text-slate-500">
        <p>
          SiKasir AI • Program Akselerasi UMKM &amp; Ekonomi Kreatif Indonesia
        </p>
        <div className="flex items-center justify-center gap-3 text-slate-400">
          <button 
            type="button" 
            onClick={() => router.push("/legal/privasi")}
            className="hover:underline hover:text-slate-300"
          >
            Kebijakan Privasi
          </button>
          <span>•</span>
          <button 
            type="button" 
            onClick={() => router.push("/legal/syarat")}
            className="hover:underline hover:text-slate-300"
          >
            Syarat &amp; Ketentuan
          </button>
          <span>•</span>
          <button 
            type="button" 
            onClick={() => router.push("/asisten")}
            className="hover:underline hover:text-slate-300"
          >
            Pusat Bantuan
          </button>
        </div>
      </div>
    </main>
  );
}
