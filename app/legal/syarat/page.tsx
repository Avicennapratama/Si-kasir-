"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function SyaratKetentuanPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#090A0F] text-slate-100 px-4 sm:px-5 pt-6 pb-20 w-full relative overflow-hidden">
      {/* Background Glow */}
      <div
        className="absolute top-[-90px] left-[-40px] w-[260px] h-[260px] rounded-full pointer-events-none blur-[120px] opacity-15"
        style={{
          background: "radial-gradient(circle, #FF8918 0%, transparent 80%)",
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
          <h1 className="text-base font-bold text-white leading-tight">Syarat &amp; Ketentuan</h1>
          <p className="text-[11px] text-slate-400">Ketentuan Layanan Aplikasi SiKasir AI</p>
        </div>
      </div>

      <div className="space-y-5 text-xs text-slate-300 leading-relaxed">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
            <FileText className="w-4 h-4" />
            <span>Pemanfaatan Layanan SiKasir AI</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Dengan menggunakan SiKasir AI, Anda menyetujui seluruh ketentuan ini untuk pencatatan keuangan dan operasional bisnis mikro, kecil, dan menengah secara sah dan bertanggung jawab.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            1. Verifikasi Manual Draft AI
          </h2>
          <p className="text-slate-400 text-[11px]">
            Sistem pengenalan suara dan ekstraksi struk berbasis kecerdasan buatan merupakan alat bantu operasional. Pengguna memegang kendali penuh dan kewajiban mutlak untuk memeriksa kebenaran nominal angka pada layar Review Draft sebelum menyimpan transaksi ke database.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-cyan-400" />
            2. Batasan Tanggung Jawab Hukum &amp; Keuangan
          </h2>
          <p className="text-slate-400 text-[11px]">
            Perhitungan valuasi HKI, rekomendasi kelas DJKI, dan konsultasi asisten legalitas bersifat indikasi edukatif awal. Layanan ini bukan merupakan penaksir resmi penjaminan pinjaman bank, otoritas pajak, atau kantor konsultan hukum berizin.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            3. Kepemilikan Konten &amp; Data Usaha
          </h2>
          <p className="text-slate-400 text-[11px]">
            Seluruh data transaksi usaha, aset foto produk studio, dan informasi bisnis adalah milik eksklusif pengguna. SiKasir AI tidak mengklaim hak cipta apa pun atas aset atau foto yang Anda unggah.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[10px] text-slate-500 text-center mt-6">
          Versi 1.0.0 • Berlaku per September 2026
        </div>
      </div>
    </main>
  );
}
