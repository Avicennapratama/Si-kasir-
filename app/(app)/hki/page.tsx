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
import { calculateHkiValuation } from "@/lib/api/hki.api";

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
  { id: "resep", label: "Resep rahasia sendiri" },
  { id: "logo", label: "Logo desain orisinal" },
  { id: "metode", label: "Metode produksi khas" },
  { id: "promo", label: "Paket promosi spesial" },
  { id: "lainnya", label: "Lainnya" },
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
    "resep",
    "logo",
    "metode",
    "promo",
  ]);
  const [otherUniqueness, setOtherUniqueness] = useState("");

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

  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await calculateHkiValuation({
        businessId: business?.id || "demo",
        brandName: assetName,
        category: ASSET_TYPES.find((t) => t.id === assetType)?.label,
        evidence: checkedUniqueness,
        usage: "Penggunaan lokal dan online",
        targetMarket: marketReach
      });
      setAiAnalysis(response.data || response);
    } catch (err) {
      console.error("AI Analysis failed:", err);
      alert("Gagal melakukan analisis AI. Silakan coba lagi.");
    } finally {
      setIsAnalyzing(false);
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
    if (checkedUniqueness.includes("resep")) score += 20;
    if (checkedUniqueness.includes("logo")) score += 15;
    if (checkedUniqueness.includes("metode")) score += 10;
    if (checkedUniqueness.includes("promo")) score += 10;

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
    <main className="min-h-screen bg-[#090A0F] text-slate-100 px-4 sm:px-5 pt-6 pb-28 w-full relative overflow-hidden">
      {/* Background Solar Ambient Flare */}
      <div
        className="absolute top-[-90px] left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full pointer-events-none blur-[130px] opacity-15"
        style={{
          background: "radial-gradient(circle, #10B981 0%, #059669 50%, transparent 80%)",
        }}
      />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <button
          type="button"
          onClick={() => router.push("/ekraf")}
          className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-[20px] font-bold text-white">Pra-Valuasi HKI</h1>
        </div>
        <div className="w-10" />
      </div>

      {/* ============================================================ */}
      {/* FORMULIR PRA-VALUASI                                         */}
      {/* ============================================================ */}
      <div className="space-y-6 relative z-10">
        <h2 className="text-[14px] font-semibold text-white">Nilai Aset Merek/Karya</h2>

        {/* A. Nama Merek / Karya */}
        <div className="space-y-1.5">
          <label className="block text-[13px] text-white">
            Nama Merek / Nama Karya
          </label>
          <input
            type="text"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            placeholder="Contoh: Keripik Singkong Nenek"
            className="w-full h-11 px-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] focus:border-emerald-500/50 text-[14px] text-white placeholder-slate-500 outline-none transition-colors"
          />
        </div>

        {/* B. Lama Beroperasi Usaha */}
        <div className="space-y-1.5">
          <label className="block text-[13px] text-white">
            Lama Beroperasi Usaha
          </label>
          <div className="flex flex-col gap-2">
            {[
              { id: "under1", label: "Kurang Dari 1 Tahun" },
              { id: "1to3", label: "1 – 3 Tahun" },
              { id: "above3", label: "Lebih Dari 3 Tahun" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setBusinessAge(opt.id)}
                className={`h-[48px] rounded-xl border text-[13px] font-semibold transition-all flex items-center justify-center ${
                  businessAge === opt.id
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                    : "bg-white/[0.02] border-white/[0.06] text-slate-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* C. Rata-rata Penjualan Bulanan */}
        <div className="space-y-1.5">
          <label className="block text-[13px] text-white">
            Rata-rata Penjualan Bulanan
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-medium text-emerald-400">
              Rp
            </span>
            <input
              type="text"
              value={formatInputRupiah(monthlyRevenue)}
              onChange={handleRevenueChange}
              placeholder="Masukkan rata-rata penjualan bulan ini"
              className="w-full h-[48px] pl-10 pr-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] focus:border-emerald-500/50 text-[14px] font-medium text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* D. Wilayah Jangkauan Pembeli */}
        <div className="space-y-1.5">
          <label className="block text-[13px] text-white">
            Wilayah Jangkauan Pembeli
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "city", label: "Satu Kota" },
              { id: "province", label: "Antar Provinsi" },
              { id: "export", label: "Ekspor" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMarketReach(m.id)}
                className={`px-4 h-[40px] rounded-full border text-[13px] font-semibold transition-all ${
                  marketReach === m.id
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                    : "bg-white/[0.02] border-white/[0.06] text-slate-400"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* E. Keunikan / Rahasia Dagang (Checklist) */}
        <div className="space-y-1.5">
          <label className="block text-[13px] text-white">
            Keunikan / Rahasia Dagang
          </label>
          <div className="space-y-2">
            {UNIQUENESS_ITEMS.map((item) => {
              const isChecked = checkedUniqueness.includes(item.id);
              return (
                <div key={item.id} className="space-y-2">
                  <div
                    onClick={() => toggleUniqueness(item.id)}
                    className={`h-[48px] px-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isChecked
                        ? "bg-emerald-500/[0.06] border-emerald-500 text-white"
                        : "bg-white/[0.01] border-white/[0.06] text-slate-400"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[12px] font-bold shrink-0 transition-colors ${
                        isChecked
                          ? "bg-emerald-500 text-slate-950"
                          : "border border-white/20 text-transparent"
                      }`}
                    >
                      ✓
                    </div>
                    <span className="text-[13px] font-medium">{item.label}</span>
                  </div>
                  {item.id === "lainnya" && isChecked && (
                    <input
                      type="text"
                      value={otherUniqueness}
                      onChange={(e) => setOtherUniqueness(e.target.value)}
                      placeholder="Sebutkan keunikan lainnya..."
                      className="w-full h-[40px] px-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] focus:border-emerald-500/50 text-[13px] text-white placeholder-slate-500 outline-none transition-colors ml-8"
                      style={{ width: "calc(100% - 2rem)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* HASIL ANALISIS INDIKATIF AI                                 */}
        {/* ============================================================ */}
        <div className="h-[140px] grid grid-cols-2 gap-3 mt-6">
          {/* Kolom Kiri */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-center">
            <h3 className="text-[12px] font-semibold text-emerald-400 mb-1">Estimasi Nilai Merek</h3>
            <div className="text-[14px] sm:text-[16px] font-bold text-white mb-1 leading-tight">
              {toRupiah(analysis.minValuation)} <br />
              <span className="text-[12px] font-normal text-slate-400">s/d</span> <br />
              {toRupiah(analysis.maxValuation)}
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Berdasarkan omzet pasar rata-rata & keunikan produk
            </p>
          </div>

          {/* Kolom Kanan */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-center items-center text-center">
            <h3 className="text-[12px] font-semibold text-slate-300 mb-2">Skor Kesiapan Daftar HKI</h3>
            <div className="text-[16px] font-bold text-emerald-400 mb-1">
              {analysis.score}/100
            </div>
            <p className="text-[11px] text-white leading-tight mb-2">
              {analysis.score >= 80 ? "Sangat Siap Didaftarkan ke DJKI" : "Perlu Melengkapi Data"}
            </p>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${analysis.score}%` }} />
            </div>
          </div>
        </div>

        {/* Disclaimer Legalitas */}
        <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-[12px] mb-[80px]">
          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Laporan ini bersifat edukasi dan indikasi awal, bukan dokumen penaksir resmi penjaminan bank atau otoritas hukum. Untuk nilai hakim, konsultasikan dengan AHU atau perwakilan hukum.
          </p>
        </div>

        {/* AI Deep Analysis Section */}
        {aiAnalysis ? (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
            <h3 className="text-[14px] font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Analisis Mendalam AI
            </h3>
            <p className="text-[13px] text-slate-300 leading-relaxed mb-3">
              {aiAnalysis.summary}
            </p>
            <div className="space-y-1">
              <p className="text-[12px] text-slate-400 font-semibold mb-1">Rekomendasi Langkah:</p>
              {aiAnalysis.recommendations?.map((rec: string, i: number) => (
                <div key={i} className="flex gap-2 text-[12px] text-slate-300">
                  <span className="text-emerald-500">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAIAnalysis}
            disabled={!assetName || !monthlyRevenue || isAnalyzing}
            className={`mt-4 w-full h-[48px] rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 transition-all ${
              !assetName || !monthlyRevenue || isAnalyzing
                ? "bg-white/[0.05] text-slate-500 cursor-not-allowed"
                : "bg-white/[0.05] border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            {isAnalyzing ? "AI Sedang Menganalisa..." : <><Sparkles className="w-4 h-4" /> Dapatkan Analisis Mendalam AI</>}
          </button>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 w-full p-4 bg-[#090A0F]/80 backdrop-blur-md border-t border-white/[0.08] z-50">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 h-[48px] rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-semibold text-[13px] transition-all"
          >
            Hapus Formulir
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={!assetName || !monthlyRevenue}
            className={`flex-[2] h-[48px] rounded-2xl font-semibold text-[13px] transition-all ${
              !assetName || !monthlyRevenue
                ? "bg-white/[0.05] text-slate-500 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            }`}
          >
            {isDownloading ? "Menyiapkan..." : "Unduh Laporan (PDF)"}
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
