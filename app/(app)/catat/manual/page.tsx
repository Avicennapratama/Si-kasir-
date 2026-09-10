"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { 
  ArrowLeft, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  Tag, 
  FileText, 
  Check, 
  Sparkles,
  AlertCircle
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { addToOutbox } from "@/lib/offline/outbox";

// Kategori Uang Masuk
const INCOME_CATEGORIES = [
  "Penjualan Produk",
  "Pendapatan Jasa",
  "Modal Tambahan",
  "Piutang Dibayar",
  "Pendapatan Lain",
];

// Kategori Uang Keluar
const EXPENSE_CATEGORIES = [
  "Bahan Baku",
  "Sewa Tempat",
  "Listrik & Air",
  "Gaji Karyawan",
  "Operasional",
  "Pemasaran",
  "Pengeluaran Lain",
];

export default function CatatManualPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Form State
  const [type, setType] = useState<"income" | "expense">("income");
  const [rawAmount, setRawAmount] = useState<string>("");
  const [category, setCategory] = useState<string>(INCOME_CATEGORIES[0]);
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Ganti tipe otomatis reset kategori ke pilihan pertama yang sesuai
  const handleTypeChange = (newType: "income" | "expense") => {
    setType(newType);
    setCategory(newType === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  // Format ribuan untuk input nominal
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.replace(/\D/g, "");
    setRawAmount(cleanValue);
  };

  // Shortcut chip penambah nominal
  const addAmount = (addVal: number) => {
    const current = parseInt(rawAmount || "0", 10);
    setRawAmount((current + addVal).toString());
  };

  const parsedAmount = parseInt(rawAmount || "0", 10);
  const formattedDisplay = rawAmount
    ? parsedAmount.toLocaleString("id-ID")
    : "0";

  // Simpan Transaksi (Online Firestore + Offline Fallback Outbox)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      setError("Masukkan nominal yang valid di atas Rp 0.");
      return;
    }

    setLoading(true);
    setError(null);

    const transactionData = {
      userId: user?.uid || "anonymous",
      type,
      amount: parsedAmount,
      category,
      note: note.trim() || category,
      source: "manual",
      transactionDate: date,
      createdAt: serverTimestamp(),
    };

    try {
      if (navigator.onLine && user) {
        await addDoc(collection(db, "transactions"), transactionData);
      } else {
        addToOutbox({
          type,
          amount: parsedAmount,
          category,
          note: note.trim() || category,
          transactionDate: date,
          source: "manual",
        });
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 600);
    } catch (err: any) {
      console.warn("Gagal simpan online, simpan lokal:", err);
      addToOutbox({
        type,
        amount: parsedAmount,
        category,
        note: note.trim() || category,
        transactionDate: date,
        source: "manual",
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  const currentCategories =
    type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <main className="min-h-screen bg-[#090A0F] text-slate-100 px-5 pt-6 pb-28 max-w-md mx-auto relative overflow-hidden flex flex-col justify-between">
      {/* Background Solar Glow */}
      <div 
        className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full pointer-events-none blur-[120px] opacity-15"
        style={{
          background: type === "income" 
            ? "radial-gradient(circle, #10B981 0%, transparent 70%)" 
            : "radial-gradient(circle, #F43F5E 0%, transparent 70%)"
        }}
      />

      {/* Top Bar Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5 mt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white tracking-wide">Catat Manual</h1>
          <div className="w-10" /> {/* Spacer seimbang */}
        </div>

        {/* Toggle Tipe: Uang Masuk vs Keluar */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] mb-6">
          <button
            type="button"
            onClick={() => handleTypeChange("income")}
            className={`h-12 rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all ${
              type === "income"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Uang Masuk</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange("expense")}
            className={`h-12 rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all ${
              type === "expense"
                ? "bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>- Uang Keluar</span>
          </button>
        </div>

        {/* Display Nominal Raksasa di Tengah */}
        <div className="py-6 px-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md text-center mb-5">
          <div className="mt-1 flex items-center justify-center gap-1.5 font-mono font-bold tracking-tight">
            <span className="text-[20px] text-slate-500 font-sans">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              value={rawAmount ? formattedDisplay : ""}
              onChange={handleAmountChange}
              placeholder="0"
              className={`w-full text-center bg-transparent focus:outline-none text-[36px] font-bold font-mono ${
                type === "income" ? "text-emerald-400" : "text-rose-400"
              } placeholder-slate-600`}
            />
          </div>

          {/* Quick Add Chips (+10rb, +20rb, +50rb, +100rb) */}
          <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
            {[10000, 20000, 50000, 100000].map((val) => (
              <button
                type="button"
                key={val}
                onClick={() => addAmount(val)}
                className="px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[12px] font-mono text-slate-300 hover:border-white/20 hover:bg-white/[0.08] active:scale-95 transition-all"
              >
                +{val.toLocaleString("id-ID")}
              </button>
            ))}
          </div>
        </div>

        {/* Picker Kategori (Horizontal Chips) */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span>Kategori</span>
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {currentCategories.map((cat) => {
              const isSelected = category === cat;
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-medium whitespace-nowrap border transition-all ${
                    isSelected
                      ? type === "income"
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                        : "border-rose-500/50 bg-rose-500/10 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                      : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/10"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Keterangan / Catatan */}
        <div className="space-y-1.5 mb-4">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Keterangan (Opsional)</span>
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: 2 Porsi Bakso Spesial"
            className="w-full h-12 px-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] focus:border-white/20 focus:outline-none text-sm text-white placeholder-slate-500 transition-all"
          />
        </div>

        {/* Date Picker */}
        <div className="space-y-1.5 mb-6">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Tanggal Transaksi</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-12 px-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] focus:border-white/20 focus:outline-none text-sm text-slate-300 transition-all"
          />
        </div>

        {error && (
          <div className="p-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Button */}
      <div className="relative z-10 pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || parsedAmount <= 0}
          className={`w-full h-14 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none ${
            success
              ? "bg-emerald-500 text-slate-950"
              : type === "income"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:brightness-110"
              : "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-[0_0_25px_rgba(244,63,94,0.3)] hover:brightness-110"
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : success ? (
            <>
              <Check className="w-5 h-5" />
              <span>Tersimpan!</span>
            </>
          ) : (
            <span>Simpan Transaksi {type === "income" ? "Masuk" : "Keluar"}</span>
          )}
        </button>
      </div>
    </main>
  );
}