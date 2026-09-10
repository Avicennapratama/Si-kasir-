"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Sparkles, 
  Download, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  Printer, 
  Building2, 
  Award,
  ChevronRight,
  TrendingUp,
  Scale
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";

// Opsi Jenis Karya / HKI
const ASSET_TYPES = [
  { id: "merek", label: "Merek Dagang / Toko", defaultClass: "Kelas 30 / 43" },
  { id: "logo", label: "Logo & Identitas Visual", defaultClass: "Hak Cipta Seni Gambar" },
  { id: "resep", label: "Resep / Rahasia Dagang", defaultClass: "Rahasia Dagang" },
  { id: "desain", label: "Desain Kemasan / Produk", defaultClass: "Desain Industri" },
  { id: "kriya", label: "Karya Seni & Kriya", defaultClass: "Hak Cipta Seni Rupa" },
];

// Opsi Lama Usaha
const AGE_OPTIONS = [
  { id: "under1", label: "< 1 Tahun", multiplier: 1.2 },
  { id: "1to3", label: "1 – 3 Tahun", multiplier: 1.8 },
  { id: "above3", label: "> 3 Tahun", multiplier: 2.5 },
];

// Opsi Wilayah Pasar
const MARKET_OPTIONS = [
  { id: "city", label: "Satu Kota / Lokal", multiplier: 1.0 },
  { id: "province", label: "Antar Provinsi", multiplier: 1.4 },
  { id: "export", label: "Nasional & Ekspor", multiplier: 1.9 },
];

// Checklist Keunikan Aset
const UNIQUENESS_ITEMS = [
  { id: "original", label: "Dibuat sendiri / resep orisinal (bukan tiruan)" },
  { id: "commercial", label: "Sudah aktif digunakan bertransaksi & dipromosikan" },
  { id: "records", label: "Memiliki bukti/catatan tanggal pertama kali dibuat" },
  { id: "reputation", label: "Merek/karya sudah dikenal pelanggan setia" },
  { id: "unregistered", label: "Belum pernah diklaim atau didaftarkan pihak lain" },
];

export default function HkiValuationPage() {
  const router = useRouter();
  const { business } = useAuth();

  // Form State
  const [assetName, setAssetName] = useState(business?.name || "");
  const [assetType, setAssetType] = useState("merek");
  const [businessAge, setBusinessAge] = useState("1to3");
  const [monthlyRevenue, setMonthlyRevenue] = useState("15000000"); // 15jt default
  const [marketReach, setMarketReach] = useState("city");
  const [checkedUniqueness, setCheckedUniqueness] = useState<string[]>([
    "original",
    "commercial",
    "unregistered",
  ]);

  // Status & Modal
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);

  // Format ribuan
  const formatInputRupiah = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) return "";
    return new Intl.NumberFormat("id-ID").format(parseInt(clean, 10));
  };

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setMonthlyRevenue(raw);
  };

  // Toggle checklist
  const toggleUniqueness = (id: string) => {
    setCheckedUniqueness((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Reset form
  const handleReset = () => {
    if (confirm("Kosongkan data formulir pra-valuasi HKI?")) {
      setAssetName("");
      setAssetType("merek");
      setBusinessAge("1to3");
      setMonthlyRevenue("");
      setMarketReach("city");
      setCheckedUniqueness([]);
    }
  };

  // Kalkulasi Indikatif Valuasi & Kesiapan HKI
  const analysis = useMemo(() => {
    const rev = parseInt(monthlyRevenue || "0", 10);
    const annualRev = rev * 12;

    const ageMultiplier = AGE_OPTIONS.find((a) => a.id === businessAge)?.multiplier || 1.5;
    const reachMultiplier = MARKET_OPTIONS.find((m) => m.id === marketReach)?.multiplier || 1.0;

    // Nilai aset proporsional terhadap omzet tahunan dan faktor aset tidak berwujud (intangible)
    const uniquenessWeight = 0.6 + (checkedUniqueness.length / 5) * 0.8; // 0.6 s/d 1.4

    // Estimasi range nilai ekonomi
    const baseValuation = annualRev * 0.35 * ageMultiplier * reachMultiplier * uniquenessWeight;
    const minValuation = Math.max(Math.round(baseValuation * 0.75), 5000000);
    const maxValuation = Math.max(Math.round(baseValuation * 1.35), 10000000);

    // Skor Kesiapan Pendaftaran DJKI (0 - 100)
    let score = 30; // base score jika ada nama & omzet
    if (assetName.trim().length >= 3) score += 15;
    if (checkedUniqueness.includes("original")) score += 20;
    if (checkedUniqueness.includes("commercial")) score += 15;
    if (checkedUniqueness.includes("unregistered")) score += 10;
    if (checkedUniqueness.includes("records")) score += 10;

    score = Math.min(score, 100);

    // Rekomendasi status
    let statusText = "Perlu Dilengkapi";
    let statusColor = "text-amber-400";
    if (score >= 80) {
      statusText = "Sangat Siap Didaftarkan";
      statusColor = "text-emerald-400";
    } else if (score >= 60) {
      statusText = "Cukup Siap (Siapkan Bukti)";
      statusColor = "text-cyan-400";
    }

    // Rekomendasi kelas DJKI
    const selectedAsset = ASSET_TYPES.find((t) => t.id === assetType);
    let classNote = selectedAsset?.defaultClass || "Kelas 30 / 43";

    return {
      minValuation,
      maxValuation,
      score,
      statusText,
      statusColor,
      classNote,
      annualRevenue: annualRev,
    };
  }, [assetName, assetType, businessAge, monthlyRevenue, marketReach, checkedUniqueness]);

  // Format mata uang
  const toRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);

  // Download / Print PDF Laporan
  const handleDownloadPdf = () => {
    if (!assetName || !monthlyRevenue) {
      alert("Lengkapi nama aset dan estimasi penjualan bulanan terlebih dahulu.");
      return;
    }

    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      window.print();
    }, 400);
  };

  return (
    <main className="min-h-screen bg-[#090A0F] text-slate-100 px-4 sm:px-5 pt-6 pb-28 max-w-md mx-auto relative overflow-hidden">
      {/* Background Solar Ambient Flare */}
      <div
        className="absolute top-[-90px] left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full pointer-events-none blur-[130px] opacity-15"
        style={{
          background: "radial-gradient(circle, #10B981 0%, #059669 50%, transparent 80%)",
        }}
      />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <button
          type="button"
          onClick={() => router.push("/ekraf")}
          className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-base font-bold text-white">Pra-Valuasi HKI</h1>
          <p className="text-[11px] text-emerald-400 font-medium">
            Klinik Hak Kekayaan Intelektual
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* Intro Card */}
      <div className="p-4 rounded-3xl bg-emerald-500/[0.04] border border-emerald-500/20 mb-6 relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-emerald-300 mb-0.5">
              Lindungi Aset Tak Berwujud Anda
            </h2>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Merek, resep, dan logo adalah aset bernilai uang yang bisa dijadikan bukti saat
              mengajukan pembiayaan, investor, atau pendaftaran resmi ke DJKI Kemenkumham.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FORMULIR PRA-VALUASI                                         */}
      {/* ============================================================ */}
      <div className="space-y-5 relative z-10">
        {/* A. Nama Merek / Karya */}
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              A. Nama Merek / Karya / Produk
            </label>
            <input
              type="text"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              placeholder="Contoh: Sambal Bu Broto, Kopi Janji Kita..."
              className="w-full h-11 px-3.5 rounded-xl bg-black/50 border border-white/[0.08] focus:border-emerald-500/50 text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Jenis Aset HKI
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ASSET_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAssetType(t.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                    assetType === t.id
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="truncate">{t.label}</div>
                  <div className="text-[10px] text-slate-500 font-normal">{t.defaultClass}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* B & C. Lama Usaha & Omzet Bulanan */}
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              B. Lama Usaha / Karya Digunakan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AGE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBusinessAge(opt.id)}
                  className={`h-10 rounded-xl border text-xs font-semibold transition-all ${
                    businessAge === opt.id
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              C. Rata-rata Penjualan / Omzet Bulanan
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono font-bold text-emerald-400">
                Rp
              </span>
              <input
                type="text"
                value={formatInputRupiah(monthlyRevenue)}
                onChange={handleRevenueChange}
                placeholder="0"
                className="w-full h-12 pl-12 pr-3.5 rounded-xl bg-black/50 border border-white/[0.08] focus:border-emerald-500/50 text-base font-mono font-bold text-white placeholder-slate-600 outline-none transition-colors"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Diproyeksikan ~{toRupiah(analysis.annualRevenue)} per tahun.
            </p>
          </div>
        </div>

        {/* D. Jangkauan Pasar */}
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            D. Wilayah Jangkauan Pembeli
          </label>
          <div className="grid grid-cols-3 gap-2">
            {MARKET_OPTIONS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMarketReach(m.id)}
                className={`p-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                  marketReach === m.id
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                    : "bg-white/[0.02] border-white/[0.06] text-slate-400"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* E. Checklist Keunikan */}
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              E. Checklist Keunikan &amp; Legalitas
            </label>
            <span className="text-[10px] text-emerald-400 font-mono">
              {checkedUniqueness.length} / 5 Terpenuhi
            </span>
          </div>

          <div className="space-y-2">
            {UNIQUENESS_ITEMS.map((item) => {
              const isChecked = checkedUniqueness.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleUniqueness(item.id)}
                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                    isChecked
                      ? "bg-emerald-500/[0.06] border-emerald-500/30 text-white"
                      : "bg-white/[0.01] border-white/[0.04] text-slate-400 hover:border-white/10"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                      isChecked
                        ? "bg-emerald-500 text-slate-950"
                        : "border border-white/20 text-transparent"
                    }`}
                  >
                    ✓
                  </div>
                  <span className="text-xs leading-snug select-none">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* HASIL ANALISIS INDIKATIF AI                                 */}
        {/* ============================================================ */}
        <div className="p-5 rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 space-y-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Hasil Analisis Indikatif AI</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
              Live Valuasi
            </span>
          </div>

          {/* Estimasi Nilai Ekonomi */}
          <div>
            <div className="text-[11px] text-slate-400 mb-1">
              Estimasi Nilai Aset Tak Berwujud ({assetName || "Merek"}):
            </div>
            <div className="text-lg sm:text-xl font-mono font-bold text-white tracking-tight">
              <span className="text-emerald-400">{toRupiah(analysis.minValuation)}</span>
              <span className="text-slate-500 text-sm font-normal mx-2">s/d</span>
              <span className="text-emerald-400">{toRupiah(analysis.maxValuation)}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
              Dihitung berdasarkan kapitalisasi omzet, durasi operasional pasar, dan rasio keunikan
              produk.
            </p>
          </div>

          <div className="h-px bg-white/[0.08]" />

          {/* Skor Kesiapan DJKI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Skor Kesiapan Daftar DJKI:</span>
              <span className="text-sm font-mono font-bold text-white">
                {analysis.score} / 100
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${analysis.score}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className={`font-semibold ${analysis.statusColor}`}>
                {analysis.statusText}
              </span>
              <span className="text-slate-400">{analysis.classNote}</span>
            </div>
          </div>
        </div>

        {/* Disclaimer Legalitas Wajib (sesuai PRD & AI Prompts) */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 leading-relaxed space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Disclaimer Resmi</span>
          </div>
          <p>
            Laporan pra-valuasi ini bersifat indikasi awal &amp; edukasi independen, bukan dokumen
            hukum resmi atau jaminan persetujuan kredit bank. Untuk pendaftaran hak cipta/merek
            resmi negara, kunjungi portal resmi DJKI di <em>pdki-indonesia.dgip.go.id</em>.
          </p>
        </div>

        {/* Tombol Aksi Bawah */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="h-12 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          {/* Unduh Dokumen PDF Siap Cetak */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading || !assetName.trim()}
            className={`col-span-2 h-12 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] ${
              !assetName.trim()
                ? "bg-white/10 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 hover:brightness-110"
            }`}
          >
            {isDownloading ? (
              <span>Menyiapkan Dokumen...</span>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Cetak / Simpan Dokumen PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PRINT-ONLY DOKUMEN PRA-VALUASI RESMI                         */}
      {/* (Hanya muncul saat dicetak ke PDF via window.print)           */}
      {/* ============================================================ */}
      <div className="hidden print:block fixed inset-0 bg-white text-black p-8 z-[9999]">
        <div className="border-b-2 border-black pb-4 mb-6">
          <div className="text-xl font-bold uppercase tracking-wider">
            Dokumen Pra-Valuasi &amp; Kesiapan HKI UMKM
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Diterbitkan secara mandiri melalui Aplikasi SiKasir AI • Tanggal:{" "}
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        <div className="space-y-4 text-sm mb-6">
          <div className="grid grid-cols-2 gap-4 border p-3 rounded">
            <div>
              <div className="text-xs text-gray-500">Nama Merek / Aset:</div>
              <div className="font-bold text-base">{assetName || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Klasifikasi Aset:</div>
              <div className="font-bold">{analysis.classNote}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Omzet Tahunan:</div>
              <div className="font-bold">{toRupiah(analysis.annualRevenue)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Jangkauan Pasar:</div>
              <div className="font-bold capitalize">{marketReach}</div>
            </div>
          </div>

          <div className="border-2 border-black p-4 rounded bg-gray-50">
            <div className="text-xs font-bold uppercase text-gray-700 mb-1">
              Estimasi Rentang Nilai Ekonomi Indikatif:
            </div>
            <div className="text-2xl font-bold text-emerald-700">
              {toRupiah(analysis.minValuation)} — {toRupiah(analysis.maxValuation)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Skor Kesiapan DJKI: {analysis.score}/100 ({analysis.statusText})
            </div>
          </div>

          <div>
            <div className="font-bold mb-2">Checklist Keunikan yang Terverifikasi:</div>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              {UNIQUENESS_ITEMS.map((item) => (
                <li key={item.id} className={checkedUniqueness.includes(item.id) ? "font-semibold" : "text-gray-400 line-through"}>
                  {item.label} {checkedUniqueness.includes(item.id) ? "(Terpenuhi ✓)" : "(Belum)"}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t pt-4 text-[10px] text-gray-500 leading-relaxed">
          <strong>Pernyataan Hukum:</strong> Dokumen ini merupakan estimasi awal berbasis metodologi
          evaluasi nilai aset tak berwujud UMKM mandiri. Bukan merupakan sertifikat resmi DJKI atau
          jaminan hukum perbankan.
        </div>
      </div>
    </main>
  );
}
