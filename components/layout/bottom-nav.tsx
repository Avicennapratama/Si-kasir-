"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Clock, Plus, BarChart2, LayoutGrid, Keyboard, Mic, Camera, X } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showFabSheet, setShowFabSheet] = useState(false);

  // Jangan tampilkan di auth, onboarding, atau page spesifik yang hide nav
  const hidePaths = ["/login", "/onboarding"];
  const isHidden = hidePaths.some(p => pathname?.startsWith(p));
  const isFormMode = pathname?.includes("/catat/"); // Hide jika sedang di dalam layar form manual/suara/nota
  
  if (isHidden || isFormMode) return null;

  const handleNav = (path: string) => {
    router.push(path);
  };

  return (
    <>
      {/* --- Overlay Backdrop untuk Bottom Sheet FAB --- */}
      <div 
        className={`fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ease-out ${showFabSheet ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setShowFabSheet(false)}
      />

      {/* --- Bottom Sheet Modal (Menu Catat) --- */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${showFabSheet ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="bg-[#0D0E15] border-t border-white/[0.08] rounded-t-3xl p-5 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          {/* Drag Handle */}
          <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
          
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-white">Catat Transaksi</h3>
            <button 
              onClick={() => setShowFabSheet(false)}
              className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Opsi 1: Manual */}
            <button 
              onClick={() => { setShowFabSheet(false); router.push("/catat/manual"); }}
              className="w-full p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center gap-4 hover:bg-white/[0.04] transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center text-slate-200">
                <Keyboard className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-white">Ketik Manual</div>
                <div className="text-xs text-slate-400">Input form tradisional</div>
              </div>
            </button>

            {/* Opsi 2: Suara (Glow) */}
            <button 
              onClick={() => { setShowFabSheet(false); router.push("/catat/suara"); }}
              className="w-full p-4 rounded-2xl border border-orange-500/30 bg-orange-500/[0.08] flex items-center gap-4 hover:bg-orange-500/10 transition-colors shadow-[0_0_15px_rgba(255,137,24,0.05)]"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF8918] to-[#DA4E24] flex items-center justify-center text-white shadow-[0_0_10px_rgba(255,137,24,0.3)]">
                <Mic className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-orange-400">Bicara Suara AI</div>
                <div className="text-xs text-slate-400">Otomatis ekstrak nominal & item</div>
              </div>
            </button>

            {/* Opsi 3: Nota */}
            <button 
              onClick={() => { setShowFabSheet(false); router.push("/catat/nota"); }}
              className="w-full p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center gap-4 hover:bg-white/[0.04] transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center text-slate-200">
                <Camera className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-white">Foto Struk / Nota</div>
                <div className="text-xs text-slate-400">Pindai isi nota otomatis</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* --- Bottom Navigation Bar --- */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 pb-[env(safe-area-inset-bottom)] bg-black/80 backdrop-blur-xl border-t border-white/[0.08]">
        <div className="flex items-center justify-around h-16 w-full max-w-lg mx-auto relative px-2">
          
          {/* Menu 1: Beranda */}
          <button 
            onClick={() => handleNav("/dashboard")}
            className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors ${pathname === "/dashboard" ? "text-orange-400" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Home className="w-5 h-5" strokeWidth={pathname === "/dashboard" ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Beranda</span>
          </button>

          {/* Menu 2: Riwayat */}
          <button 
            onClick={() => handleNav("/riwayat")}
            className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors ${pathname === "/riwayat" ? "text-orange-400" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Clock className="w-5 h-5" strokeWidth={pathname === "/riwayat" ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Riwayat</span>
          </button>

          {/* Spacer Tengah FAB */}
          <div className="w-16 relative">
            <button 
              onClick={() => setShowFabSheet(true)}
              className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-[#FF8918] to-[#DA4E24] flex items-center justify-center shadow-[0_4px_20px_rgba(255,137,24,0.4)] active:scale-95 transition-transform"
            >
              <Plus className={`w-7 h-7 text-white transition-transform duration-300 ${showFabSheet ? 'rotate-45' : ''}`} />
            </button>
          </div>

          {/* Menu 4: Laporan */}
          <button 
            onClick={() => handleNav("/laporan")}
            className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors ${pathname === "/laporan" ? "text-orange-400" : "text-slate-500 hover:text-slate-300"}`}
          >
            <BarChart2 className="w-5 h-5" strokeWidth={pathname === "/laporan" ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Laporan</span>
          </button>

          {/* Menu 5: Ekraf / Menu Lain */}
          <button 
            onClick={() => handleNav("/ekraf")}
            className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors ${pathname === "/ekraf" ? "text-orange-400" : "text-slate-500 hover:text-slate-300"}`}
          >
            <LayoutGrid className="w-5 h-5" strokeWidth={pathname === "/ekraf" ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Menu</span>
          </button>

        </div>
      </nav>
    </>
  );
}