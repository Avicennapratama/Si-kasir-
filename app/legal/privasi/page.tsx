"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Lock, Database, EyeOff } from "lucide-react";

export default function KebijakanPrivasiPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#090A0F] text-slate-100 px-4 sm:px-5 pt-6 pb-20 max-w-md mx-auto relative overflow-hidden">
      {/* Background Glow */}
      <div
        className="absolute top-[-90px] right-[-40px] w-[260px] h-[260px] rounded-full pointer-events-none blur-[120px] opacity-15"
        style={{
          background: "radial-gradient(circle, #10B981 0%, transparent 80%)",
        }}
      />

      <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4 mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-bold text-white leading-tight">Kebijakan Privasi</h1>
          <p className="text-[11px] text-slate-400">Kepatuhan UU PDP No. 27 Tahun 2022</p>
        </div>
      </div>

      <div className="space-y-5 text-xs text-slate-300 leading-relaxed">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Prinsip Privasi Zero Data Leakage</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            SiKasir AI dirancang dengan standar perlindungan data tertinggi untuk pelaku UMKM. Kami tidak menjual, menyewakan, atau membagikan data transaksi kasir Anda kepada pihak ketiga atau jaringan periklanan mana pun.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Database className="w-4 h-4 text-cyan-400" />
            1. Data yang Dikumpulkan
          </h2>
          <p className="text-slate-400 text-[11px]">
            • <strong>Informasi Akun:</strong> Alamat email dan identitas profil dari Google OAuth untuk otentikasi.<br />
            • <strong>Data Usaha:</strong> Nama toko dan kategori bidang usaha UMKM Anda.<br />
            • <strong>Catatan Transaksi:</strong> Nominal, kategori, tanggal, dan catatan transaksi yang Anda konfirmasi secara sukarela.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-amber-400" />
            2. Pemrosesan AI Lokal di Perangkat
          </h2>
          <p className="text-slate-400 text-[11px]">
            Fitur pengenalan suara dan kompresi citra nota diproses secara lokal di peramban (client-side) menggunakan Web Speech API dan HTML5 Canvas native. Rekaman audio asli tidak diunggah atau disimpan ke server permanen.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <EyeOff className="w-4 h-4 text-purple-400" />
            3. Hak Penghapusan Data (Right to be Forgotten)
          </h2>
          <p className="text-slate-400 text-[11px]">
            Anda memiliki hak penuh untuk mengekspor seluruh catatan transaksi Anda dalam format CSV atau JSON kapan saja, serta menghapus seluruh data dan akun Anda secara permanen melalui menu <strong>Pengaturan &gt; Zona Berbahaya</strong>.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[10px] text-slate-500 text-center mt-6">
          Terakhir diperbarui: September 2026 • SiKasir AI
        </div>
      </div>
    </main>
  );
}
