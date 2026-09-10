"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Store } from "lucide-react";

export default function LoginPage() {
  const { signInWithGoogle, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError("Gagal masuk. Coba lagi nanti.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090A0F] text-foreground flex flex-col justify-between px-5 py-8 max-w-md mx-auto relative overflow-hidden">
      {/* Background OLED + Gradient Blob Glow Oranye Samar di Tengah */}
      <div 
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full pointer-events-none blur-[120px] opacity-25"
        style={{
          background: "radial-gradient(circle, #FF8918 0%, #DA4E24 55%, transparent 75%)"
        }}
      />
      <div 
        aria-hidden="true"
        className="absolute -top-12 right-0 w-[220px] h-[220px] rounded-full pointer-events-none blur-[100px] opacity-15"
        style={{
          background: "radial-gradient(circle, #FF8918 0%, transparent 70%)"
        }}
      />

      {/* Area Atas: Logo & Judul Aplikasi */}
      <header className="relative z-10 pt-4 safe-top">
        <div className="flex items-center gap-3.5 mb-5">
          {/* Logo 80x80 dengan Glassmorphism & Solar Glow */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl glass-panel flex items-center justify-center relative shadow-[0_0_24px_rgba(255,137,24,0.2)] border border-white/10 shrink-0">
            <Store className="w-8 h-8 sm:w-10 sm:h-10 text-solar-500" />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-tr from-solar-600 to-solar-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium tracking-wide text-slate-300">
                FusionAI Engine
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
              SiKasir <span className="text-transparent bg-clip-text bg-gradient-to-r from-solar-500 to-solar-600">AI</span>
            </h1>
            <p className="text-xs text-slate-400 font-normal mt-0.5">
              Asisten Kasir Pintar UMKM
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">
          Asisten Kasir Pintar UMKM &amp; Pelaku Kreatif Indonesia. Catat kasir &amp; transaksi instan dengan kecerdasan buatan.
        </p>
      </header>

      {/* Area Tengah: Glassmorphism Card */}
      <section className="relative z-10 my-auto py-4">
        <div className="p-5 rounded-2xl glass-panel shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative overflow-hidden">
          {/* Aksen kilau tipis di dalam card */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-solar-500/40 to-transparent" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Masuk Akun</span>
            <span className="text-[11px] text-solar-500 bg-solar-500/10 border border-solar-500/20 px-2 py-0.5 rounded-md font-mono">
              Fast Auth
            </span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Zap className="w-4 h-4 text-solar-500 shrink-0" />
              <span>Input kasir via suara &amp; foto nota instan</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Offline-first &amp; privasi data kas UMKM terjamin</span>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl border border-crimson/30 bg-crimson/10 text-crimson text-xs text-center font-medium">
              {error}
            </div>
          )}

          {/* Tombol Google OAuth Full Lebar, Thumb-friendly */}
          <button
            onClick={handleLogin}
            disabled={loading || authLoading}
            className="w-full h-14 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 bg-white text-slate-900 border border-white/20 shadow-[0_0_18px_rgba(255,137,24,0.18)] hover:shadow-[0_0_24px_rgba(255,137,24,0.45)] hover:border-solar-500/60 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 select-none cursor-pointer"
          >
            {loading || authLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Menghubungkan...</span>
              </div>
            ) : (
              <>
                {/* Official Google G Logo SVG */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Masuk dengan Google</span>
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </>
            )}
          </button>
        </div>
      </section>

      {/* Area Bawah: Kebijakan Privasi & Indikator Status Version */}
      <footer className="relative z-10 pt-2 pb-2 safe-bottom flex items-end justify-between gap-4">
        <p className="text-[11px] text-slate-500 leading-relaxed flex-1">
          Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi SiKasir AI.
        </p>
        <div className="shrink-0">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-white/[0.04] border border-white/[0.08]">
            v2.0
          </span>
        </div>
      </footer>
    </main>
  );
}
