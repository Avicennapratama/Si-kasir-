"use client";

import React, { useState } from "react";
import { ArrowLeft, Check, AlertTriangle, RefreshCw, XCircle } from "lucide-react";
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
  };
}

interface DraftReviewScreenProps {
  draft: TransactionDraft;
  onConfirm: (confirmedData: TransactionDraft["data"]) => Promise<void>;
  onReject: () => void;
  onManualFallback: () => void;
}

export function DraftReviewScreen({
  draft,
  onConfirm,
  onReject,
  onManualFallback,
}: DraftReviewScreenProps) {
  const [formData, setFormData] = useState(draft.data);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLowConfidence = (field: string) =>
    draft.aiMeta.lowConfidenceFields.includes(field) || draft.aiMeta.confidence < 0.7;

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
    <div className="p-4 space-y-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <button onClick={onReject} className="p-1 rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Periksa Draft AI</h1>
        </div>
        {/* Confidence Badge */}
        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
            draft.aiMeta.confidence >= 0.85
              ? "bg-emerald-100 text-emerald-800"
              : draft.aiMeta.confidence >= 0.7
              ? "bg-amber-100 text-amber-800"
              : "bg-rose-100 text-rose-800"
          }`}
        >
          {draft.aiMeta.confidence < 0.7 && <AlertTriangle className="w-3.5 h-3.5" />}
          <span>{Math.round(draft.aiMeta.confidence * 100)}% Yakin</span>
        </div>
      </div>

      {/* Raw Context Notice */}
      {draft.aiMeta.rawInput && (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
          <span className="font-semibold block text-slate-700 mb-0.5">
            Sumber: {draft.source === "voice" ? "Suara" : "Foto Nota"}
          </span>
          &ldquo;{draft.aiMeta.rawInput}&rdquo;
        </div>
      )}

      {/* Form Review & Edit */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* Tipe Transaksi */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Tipe
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "income" })}
              className={`py-2 text-sm font-semibold rounded-lg border ${
                formData.type === "income"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              Pemasukan (+)
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "expense" })}
              className={`py-2 text-sm font-semibold rounded-lg border ${
                formData.type === "expense"
                  ? "bg-rose-600 text-white border-rose-600"
                  : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              Pengeluaran (-)
            </button>
          </div>
        </div>

        {/* Nominal Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nominal (Rp)
            </label>
            {isLowConfidence("amount") && (
              <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Perlu dicek
              </span>
            )}
          </div>
          <input
            type="number"
            value={formData.amount || ""}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            className={`w-full text-2xl font-bold p-3 rounded-xl border ${
              isLowConfidence("amount")
                ? "border-amber-400 bg-amber-50/30 focus:border-amber-600"
                : "border-slate-200 focus:border-emerald-600"
            } focus:outline-none`}
            required
          />
          <span className="text-xs text-slate-400 mt-1 block">
            {formatRupiah(formData.amount || 0)}
          </span>
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Kategori
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-none"
            required
          />
        </div>

        {/* Catatan / Deskripsi */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Keterangan
          </label>
          <input
            type="text"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-none"
          />
        </div>

        {/* Tanggal */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Tanggal
          </label>
          <input
            type="date"
            value={formData.transactionDate}
            onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
            className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-none"
            required
          />
        </div>

        {/* Breakdown Items if any */}
        {formData.items && formData.items.length > 0 && (
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-2">
              Item Terbaca ({formData.items.length})
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {formData.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-xs text-slate-700">
                  <span>{it.qty ? `${it.qty}x ` : ""}{it.name}</span>
                  <span className="font-semibold">{it.price ? formatRupiah(it.price) : "-"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            type="submit"
            disabled={isSubmitting || formData.amount <= 0}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md"
          >
            {isSubmitting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Simpan Transaksi</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onReject}
              className="py-2.5 text-xs font-semibold text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 flex items-center justify-center gap-1"
            >
              <XCircle className="w-4 h-4" />
              <span>Tolak Hasil</span>
            </button>
            <button
              type="button"
              onClick={onManualFallback}
              className="py-2.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Buka Form Manual
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
