"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Check, 
  AlertTriangle, 
  RefreshCw, 
  Trash2, 
  Calendar, 
  Receipt, 
  Mic, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Eye
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export interface TransactionDraft {
  draftId: string;
  source: "voice" | "receipt";
  data: {
    type: "income" | "expense";
    amount: number;
    category: string;
    note: string;
    transactionDate: string;
    items?: Array<{ name: string; qty?: number; price?: number }>;
  };
  aiMeta: {
    confidence: number;
    rawInput?: string;
    lowConfidenceFields: string[];
    receiptImage?: string;
  };
}

interface DraftReviewScreenProps {
  draft: TransactionDraft;
  onConfirm: (confirmedData: TransactionDraft["data"]) => Promise<void>;
  onReject: () => void;
  onManualFallback: () => void;
}

const INCOME_CATEGORIES = [
  "Penjualan Produk",
  "Pendapatan Jasa",
  "Piutang Masuk",
  "Modal Tambahan",
  "Pendapatan Lain",
];

const EXPENSE_CATEGORIES = [
  "Bahan Baku",
  "Operasional",
  "Gaji Karyawan",
  "Sewa Tempat",
  "Listrik & Air",
  "Pemasaran",
  "Pengeluaran Lain",
];

export function DraftReviewScreen({
  draft,
  onConfirm,
  onReject,
  onManualFallback,
}: DraftReviewScreenProps) {
  const [formData, setFormData] = useState(draft.data);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProof, setShowProof] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const isLowConfidence = (field: string) =>
    draft.aiMeta.lowConfidenceFields.includes(field) || draft.aiMeta.confidence < 0.7;

  const currentCategories =
    formData.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) return;
    setIsSubmitting(true);
    try {
      await onConfirm(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col justify-between">
      {/* Top Section */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <button
            type="button"
            onClick={() => setShowRejectConfirm(true)}
            className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white">Periksa Hasil AI</h1>
          </div>

          {/* Source Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.04] border border-white/[0.08] text-slate-300">
            {draft.source === "voice" ? (
              <>
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
                <span>Suara</span>
              </>
            ) : (
              <>
                <Receipt className="w-3.5 h-3.5 text-solar-400" />
                <span>Nota</span>
              </>
            )}
          </div>
        </div>

        {/* Confidence Banner */}
        <div
          className={`p-3.5 rounded-2xl border backdrop-blur-md flex items-start gap-3 ${
            draft.aiMeta.confidence >= 0.85
              ? "bg-emerald-500/[0.08] border-emerald-500/30 text-emerald-300"
              : "bg-amber-500/[0.08] border-amber-500/30 text-amber-300"
          }`}
        >
          {draft.aiMeta.confidence >= 0.85 ? (
            <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs leading-relaxed">
            <p className="font-semibold mb-0.5">
              {draft.aiMeta.confidence >= 0.85
                ? `Akurasi Tinggi (${Math.round(draft.aiMeta.confidence * 100)}%)`
                : `Periksa Ulang (${Math.round(draft.aiMeta.confidence * 100)}%)`}
            </p>
            <p className="text-slate-300">
              {draft.aiMeta.confidence >= 0.85
                ? "Data berhasil dibaca dengan jelas. Periksa cepat sebelum menyimpan."
                : "Beberapa field mungkin kurang jelas. Silakan koreksi sebelum simpan."}
            </p>
          </div>
        </div>

        {/* Form Koreksi Langsung */}
        <form id="review-form" onSubmit={handleSave} className="space-y-4 pt-1">
          {/* Toggle Jenis: Masuk vs Keluar */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Jenis Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    type: "income",
                    category: INCOME_CATEGORIES[0],
                  })
                }
                className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                  formData.type === "income"
                    ? "bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                + Uang Masuk
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    type: "expense",
                    category: EXPENSE_CATEGORIES[0],
                  })
                }
                className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                  formData.type === "expense"
                    ? "bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.35)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                - Uang Keluar
              </button>
            </div>
          </div>

          {/* Nominal Edit (Besar Mono) */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Total Nominal (Rp)
            </label>
            <div
              className={`relative rounded-2xl border bg-white/[0.03] overflow-hidden ${
                isLowConfidence("amount")
                  ? "border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  : "border-white/[0.1] focus-within:border-solar-500"
              }`}
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-mono text-slate-400">
                Rp
              </div>
              <input
                type="number"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
                className="w-full h-14 pl-12 pr-4 bg-transparent text-xl font-bold font-mono text-white focus:outline-none"
                placeholder="0"
              />
            </div>
            {isLowConfidence("amount") && (
              <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Nominal diragukan, mohon pastikan nilainya.
              </p>
            )}
          </div>

          {/* Kategori Chips Scrollable */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Kategori Usaha
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {currentCategories.map((cat) => {
                const isSelected = formData.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      isSelected
                        ? "bg-solar-500 text-slate-950 font-semibold shadow-[0_0_15px_rgba(255,137,24,0.3)]"
                        : "bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catatan / Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Keterangan / Catatan
            </label>
            <input
              type="text"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full h-11 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-solar-500"
              placeholder="Contoh: Belanja bahan pokok"
            />
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Tanggal Transaksi
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.transactionDate}
                onChange={(e) =>
                  setFormData({ ...formData, transactionDate: e.target.value })
                }
                className="w-full h-11 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-solar-500"
              />
            </div>
          </div>

          {/* Bukti Asli Accordion (Foto Nota / Transkrip Suara) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowProof(!showProof)}
              className="w-full p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs text-slate-300 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-solar-400" />
                <span>
                  {draft.source === "receipt"
                    ? "Lihat Foto Nota Asli"
                    : "Lihat Kutipan Suara Asli"}
                </span>
              </div>
              {showProof ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showProof && (
              <div className="mt-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-2 animate-in fade-in">
                {draft.source === "receipt" && draft.aiMeta.receiptImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={draft.aiMeta.receiptImage}
                    alt="Foto Nota Asli"
                    className="w-full max-h-60 object-contain rounded-xl border border-white/[0.08]"
                  />
                ) : (
                  <p className="italic text-slate-400 leading-relaxed">
                    &ldquo;{draft.aiMeta.rawInput || "Ucapan pengguna"}&rdquo;
                  </p>
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#090A0F]/90 backdrop-blur-xl sticky bottom-0 z-20">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowRejectConfirm(true)}
            className="w-28 h-12 rounded-2xl border border-rose-500/30 bg-rose-500/[0.05] text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>

          <button
            type="submit"
            form="review-form"
            disabled={isSubmitting || formData.amount <= 0}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.35)] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
            )}
            <span>Benar &amp; Simpan</span>
          </button>
        </div>
      </div>

      {/* Modal Konfirmasi Batalkan / Hapus Draft */}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-sm rounded-3xl bg-[#0D0E14] border border-white/[0.08] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 text-center">
              Hapus Draft Ini?
            </h3>
            <p className="text-xs text-slate-400 mb-6 text-center leading-relaxed">
              Data hasil bacaan AI ini akan dihapus dan tidak disimpan ke buku kas Anda.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowRejectConfirm(false)}
                className="flex-1 h-11 rounded-2xl border border-white/[0.08] bg-white/[0.03] text-xs font-semibold text-slate-300 hover:text-white"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={onReject}
                className="flex-1 h-11 rounded-2xl bg-rose-600 text-xs font-semibold text-white shadow-[0_0_20px_rgba(244,63,94,0.35)]"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
