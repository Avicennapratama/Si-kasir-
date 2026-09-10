"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  EyeOff, 
  Sparkles, 
  Check, 
  ExternalLink,
  Info,
  Server,
  Trash2
} from "lucide-react";

export default function PengaturanPrivasiPage() {
  const router = useRouter();

  const [voiceAiConsent, setVoiceAiConsent] = useState(true);
  const [receiptAiConsent, setReceiptAiConsent] = useState(true);
  const [autoDeleteMedia, setAutoDeleteMedia] = useState(true);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#090A0F] text-slate-100 px-4 sm:px-5 pt-6 pb-28 max-w-md mx-auto relative overflow-hidden">
      {/* Solar Flare Ambient */}
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
          <h1 className="text-base font-bold text-white">Privasi &amp; AI</h1>
          <p className="text-[11px] text-slate-400">Kendali data &amp; kedaulatan UMKM</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="space-y-4 relative z-10">
        {/* Banner Prinsip OPSEC / Privasi */}
        <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <h2 className="font-bold text-emerald-300 mb-1">Prinsip Nol Kebocoran Data</h2>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Data kas, harga modal, dan transaksi usaha Anda adalah rahasia dagang Anda. SiKasir AI tidak menjual data Anda kepada pihak ketiga.
            </p>
          </div>
        </div>

        {/* Section 1: Kendali Izin AI */}
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Izin Fitur Kecerdasan Buatan (AI)</span>
            </label>
            {savedFeedback && (
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                <Check className="w-3 h-3" /> Tersimpan
              </span>
            )}
          </div>

          {/* Toggle 1: Suara AI */}
          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <div className="pr-3">
              <p className="text-xs font-semibold text-white">Ekstraksi Catat Suara</p>
              <p className="text-[11px] text-slate-400">
                AI memproses audio suara untuk mengenali nominal kasir. Audio tidak disimpan permanen.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setVoiceAiConsent(!voiceAiConsent);
                handleSave();
              }}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                voiceAiConsent ? "bg-orange-500" : "bg-white/10"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  voiceAiConsent ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Nota AI */}
          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <div className="pr-3">
              <p className="text-xs font-semibold text-white">OCR Pindai Nota &amp; Struk</p>
              <p className="text-[11px] text-slate-400">
                AI memindai angka dan item dari foto nota belanja Anda untuk draft transaksi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setReceiptAiConsent(!receiptAiConsent);
                handleSave();
              }}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                receiptAiConsent ? "bg-orange-500" : "bg-white/10"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  receiptAiConsent ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: Auto Delete Media */}
          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <div className="pr-3">
              <p className="text-xs font-semibold text-white">Pembersihan Otomatis Media</p>
              <p className="text-[11px] text-slate-400">
                Hapus foto nota &amp; file audio sementara dari server segera setelah transaksi dikonfirmasi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAutoDeleteMedia(!autoDeleteMedia);
                handleSave();
              }}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                autoDeleteMedia ? "bg-emerald-500" : "bg-white/10"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  autoDeleteMedia ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Locked Setting: Model Training Opt-Out */}
          <div className="flex items-center justify-between py-2 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04]">
            <div className="pr-3">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-white">Pengecualian Latihan Model</p>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                  Terkunci Aktif
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Data Anda dilindungi dan 100% dikecualikan dari pelatihan model AI pihak luar.
              </p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Section 2: Kebijakan Legal */}
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Dokumen Kebijakan Resmi
          </label>

          <button
            type="button"
            onClick={() => router.push("/legal/privasi")}
            className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <span>Kebijakan Privasi Lengkap</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => router.push("/legal/syarat")}
            className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <span>Syarat &amp; Ketentuan Layanan</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </main>
  );
}
