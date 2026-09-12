"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Camera, 
  Image as ImageIcon, 
  Sparkles, 
  AlertTriangle, 
  Keyboard, 
  RefreshCw, 
  Receipt,
  CheckCircle2
} from "lucide-react";
import { compressImage } from "@/lib/utils/image-compression";
import { processReceiptImage } from "@/lib/api/receipt.api";

type ScanState = "idle" | "selected" | "uploading" | "analyzing" | "success" | "error";

export default function CatatNotaPage() {
  const router = useRouter();

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Berkas harus berupa foto atau gambar");
      setScanState("error");
      return;
    }

    // Validasi ukuran file mentah (> 10MB tolak)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Ukuran foto terlalu besar (maksimal 10MB)");
      setScanState("error");
      return;
    }

    try {
      setScanState("uploading");
      setProgress(25);

      // Kompresi client-side hemat bandwidth
      const { dataUrl } = await compressImage(file, 1200, 0.75);
      setImagePreview(dataUrl);
      setProgress(50);

      // Mulai proses scanning AI Vision
      setScanState("analyzing");
      setProgress(75);

      // Ekstraksi nyata lewat Gemini Vision (backend /ai/receipt/extract).
      // Sebelumnya blok ini hanya setTimeout + data hardcoded, sehingga
      // SETIAP foto nota menghasilkan Rp85.000 yang sama.
      const mimeType = (dataUrl.match(/^data:([^;]+);/) || [])[1] || "image/jpeg";
      const res = await processReceiptImage(dataUrl, mimeType);

      if (!res.success || !res.data) {
        throw new Error(res.error || "Gagal membaca nota");
      }

      const ai = res.data;
      setProgress(100);

      // Tanpa nominal, draft tidak berguna — lebih baik gagal jelas
      // daripada menyimpan angka 0 yang salah.
      if (!ai.amount || ai.amount <= 0) {
        throw new Error(
          "Nominal pada nota tidak terbaca. Coba foto ulang dengan cahaya lebih terang, atau catat manual."
        );
      }

      const draftId = `draft_${Date.now()}`;
      const draftPayload = {
        draftId,
        source: "receipt" as const,
        data: {
          type: ai.type || "expense",
          amount: ai.amount,
          category: ai.type === "income" ? "Penjualan Produk" : "Bahan Baku",
          note: ai.vendor ? `Belanja ${ai.vendor}` : "Belanja dari nota",
          transactionDate: ai.transactionDate || new Date().toISOString().split("T")[0],
          items: (ai.items || []).map((it) => ({
            name: it.name,
            qty: it.qty ?? 1,
            price: it.price ?? 0,
          })),
        },
        aiMeta: {
          confidence: ai.confidence ?? 0.5,
          lowConfidenceFields: ai.lowConfidenceFields ?? [],
          rawInput: `Nota: ${ai.vendor || "tanpa nama"} (total Rp ${(ai.total ?? ai.amount).toLocaleString("id-ID")})`,
          receiptImage: dataUrl,
          engine: "gemini",
        },
      };

      sessionStorage.setItem(`sikasir_draft_${draftId}`, JSON.stringify(draftPayload));

      setScanState("success");
      setTimeout(() => {
        router.push(`/catat/review/${draftId}`);
      }, 600);
    } catch (err: any) {
      console.error("Gagal memproses nota:", err);
      // Pemindaian nota butuh Gemini Vision, jadi offline tidak bisa.
      // Beri pesan yang jelas + arahkan ke Catat Manual, bukan error teknis.
      const offline = typeof navigator !== "undefined" && !navigator.onLine;
      setErrorMessage(
        offline
          ? "Kamu sedang offline. Pemindaian nota butuh internet — pakai Catat Manual dulu, atau coba lagi setelah tersambung."
          : err.message || "Gagal membaca nota. Silakan coba lagi."
      );
      setScanState("error");
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setScanState("idle");
    setErrorMessage(null);
    setProgress(0);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  return (
    <main className="min-h-screen bg-[#090A0F] text-slate-100 px-5 pt-6 pb-12 w-full relative overflow-hidden flex flex-col">
      {/* Hidden File Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelected}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Ambient Solar Glow */}
      <div
        className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full pointer-events-none blur-[120px] opacity-15"
        style={{
          background: "radial-gradient(circle, #FF8918 0%, #DA4E24 50%, transparent 80%)",
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-5 mt-2">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[18px] font-bold text-white">Pindai Nota Belanja</h1>
        <div className="w-10" />
      </div>

      {/* Tips Panduan Foto */}
      <div className="relative z-10 p-3 rounded-[12px] border border-solar-500/20 bg-solar-500/[0.04] backdrop-blur-md mb-4">
        <div className="flex items-start gap-2">
          <span className="text-[16px] leading-none mt-0.5">💡</span>
          <p className="text-[13px] text-slate-300/90 leading-relaxed">
            Pastikan nota rata, pencahayaan cukup, dan angka total terlihat jelas. Hindari foto blur atau terlipat.
          </p>
        </div>
      </div>

      {/* Viewfinder Nota (Area Utama) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center mb-6">
        <div className="w-full aspect-[3/4] max-h-[340px] rounded-3xl border-2 border-dashed border-white/20 bg-white/[0.02] relative overflow-hidden flex flex-col items-center justify-center p-4">
          {/* Tampilan Sebelum Ada Foto */}
          {!imagePreview && (
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-slate-400">
                <Receipt className="w-8 h-8 text-solar-500/80" />
              </div>
              <p className="text-sm font-semibold text-slate-300 mb-1">
                Area Pratinjau Nota
              </p>
              <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
                Posisikan nota Anda di dalam kotak ini agar terbaca oleh AI
              </p>
            </div>
          )}

          {/* Tampilan Setelah Foto Terpilih */}
          {imagePreview && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Pratinjau Nota"
                className="w-full h-full object-contain rounded-2xl"
              />

              {/* Laser Scan Animation Overlay saat Analyzing */}
              {scanState === "analyzing" && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                  {/* Laser bar */}
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce duration-1000 absolute top-1/3" />
                  <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px]" />
                </div>
              )}

              {/* Success Badge */}
              {scanState === "success" && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-white">Nota Terbaca!</p>
                </div>
              )}
            </div>
          )}

          {/* Sudut Viewfinder Estetik */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-solar-500/60 rounded-tl pointer-events-none" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-solar-500/60 rounded-tr pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-solar-500/60 rounded-bl pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-solar-500/60 rounded-br pointer-events-none" />
        </div>

        {/* Progress & Status Indicator */}
        {(scanState === "uploading" || scanState === "analyzing") && (
          <div className="w-full mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-solar-400 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-solar-500" />
                {scanState === "uploading" ? "Mengunggah foto..." : "Membaca teks nota..."}
              </span>
              <span className="font-mono text-slate-300">{progress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-solar-500 to-solar-600 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tombol Aksi Kamera & Galeri */}
      <div className="relative z-10 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={scanState === "uploading" || scanState === "analyzing"}
            onClick={() => cameraInputRef.current?.click()}
            className="h-12 rounded-2xl bg-gradient-to-r from-solar-500 to-solar-600 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,137,24,0.3)] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Camera className="w-4 h-4 text-slate-950" />
            <span>Ambil Foto</span>
          </button>

          <button
            type="button"
            disabled={scanState === "uploading" || scanState === "analyzing"}
            onClick={() => galleryInputRef.current?.click()}
            className="h-12 rounded-2xl border border-white/[0.12] bg-white/[0.04] text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/[0.08] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <ImageIcon className="w-4 h-4 text-slate-300" />
            <span>Pilih Galeri</span>
          </button>
        </div>

        {/* Fallback ke Manual */}
        <button
          type="button"
          onClick={() => router.push("/catat/manual")}
          className="w-full flex items-center justify-center gap-2 text-[14px] text-slate-300 hover:text-white transition-colors pt-2"
        >
          <span>Nota sobek atau tidak terbaca? <strong className="text-emerald-400 underline font-bold">Ketik Manual Saja</strong></span>
        </button>
      </div>

      {/* Error Dialog Modal */}
      {scanState === "error" && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-sm rounded-3xl bg-[#0D0E14] border border-white/[0.08] p-6 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
            </div>
            <h3 className="text-base font-bold text-white text-center mb-2">
              Nota Tidak Terbaca
            </h3>
            <p className="text-[13px] text-slate-400 text-center mb-6 leading-relaxed">
              {errorMessage || "AI tidak dapat mengenali angka pada foto ini. Pastikan foto terang dan tidak terlipat."}
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => router.push("/catat/manual")}
                className="flex-1 h-12 rounded-2xl border border-white/[0.08] bg-white/[0.03] text-xs font-semibold text-slate-300 hover:text-white"
              >
                Ketik Manual
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-solar-500 to-solar-600 text-xs font-semibold text-slate-950 shadow-[0_0_20px_rgba(255,137,24,0.3)]"
              >
                Foto Ulang
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
