"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";
import { Sparkles, Store } from "lucide-react";

export default function LoginPage() {
  const { signInWithGoogle, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { isNewUser } = await signInWithGoogle();
      if (isNewUser) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      setError("Gagal masuk. Coba lagi nanti.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090A0F] text-foreground relative overflow-hidden flex flex-col items-center">
      {/* Background OLED + Gradient Blob Glow Oranye Samar di Tengah */}
      <div 
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full pointer-events-none blur-[120px] opacity-25"
        style={{ background: "radial-gradient(circle, #FF8918 0%, #DA4E24 55%, transparent 75%)" }}
      />

      {/* Main Container 343px */}
      <div className="w-full max-w-[343px] flex flex-col flex-1 relative z-10 pt-safe-top pb-safe-bottom">
        
        {/* Area Atas: Logo & Judul Aplikasi (Posisi 16px dari safe top, padding horizontal ditangani oleh max-w) */}
        <header className="flex items-center gap-4 pt-4 mt-[16px]">
          {/* Logo 80x80 */}
          <div className="w-[80px] h-[80px] rounded-[20px] glass-panel flex items-center justify-center relative shadow-[0_0_24px_rgba(255,137,24,0.2)] border border-white/10 shrink-0">
            <Store className="w-10 h-10 text-solar-500" />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-tr from-solar-600 to-solar-500 flex items-center justify-center shadow-md border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="text-[24px] font-bold text-white tracking-tight leading-tight">
              SiKasir AI
            </h1>
            <p className="text-[14px] font-normal text-slate-400 mt-1 leading-snug">
              Asisten Kasir Pintar UMKM & Pelaku Kreatif Indonesia
            </p>
          </div>
        </header>

        {/* Spacer untuk mendorong tombol ke 40% layar (sekitar 96px dari atas + header) */}
        <div className="flex-1 flex flex-col justify-center">
          {error && (
            <div className="p-3 mb-6 rounded-xl border border-crimson/30 bg-crimson/10 text-crimson text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* Tombol Masuk Google - Tinggi 52px */}
          <button
            onClick={handleLogin}
            disabled={loading || authLoading}
            className="w-full h-[52px] rounded-xl font-semibold text-[15px] flex items-center justify-center gap-3 bg-white text-slate-900 border border-white/20 shadow-[0_0_18px_rgba(255,137,24,0.18)] hover:bg-slate-50 hover:shadow-[0_0_24px_rgba(255,137,24,0.45)] hover:border-solar-500/60 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 select-none cursor-pointer"
          >
            {loading || authLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>Menghubungkan...</span>
              </div>
            ) : (
              <>
                <svg className="w-[20px] h-[20px] shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>Masuk dengan Google</span>
              </>
            )}
          </button>
        </div>

        {/* Area Bawah: Kebijakan Privasi & Indikator Status (20px dari safe bottom ditangani padding bawah container) */}
        <footer className="mt-auto mb-5 flex items-end justify-between gap-4">
          <p className="text-[12px] text-slate-500 leading-relaxed font-normal flex-1">
            Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi SiKasir AI.
          </p>
          <div className="shrink-0 flex items-center justify-center w-6 h-6 rounded-md bg-black/40 border border-white/10">
            <span className="text-[9px] font-bold text-slate-400">2.0</span>
          </div>
        </footer>

      </div>
    </main>
  );
}

