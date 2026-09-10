"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PieChart, 
  ChevronRight, 
  Sparkles, 
  Check, 
  RefreshCw,
  FileText
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { db } from "@/lib/firebase/config";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { getOutbox } from "@/lib/offline/outbox";
import { formatRupiah } from "@/lib/utils";

interface TransactionRecord {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  note?: string;
  transactionDate: string; // YYYY-MM-DD
  source?: string;
  userId?: string;
  createdAt?: any;
}

type PeriodType = "weekly" | "monthly" | "yearly";

export default function LaporanPage() {
  const router = useRouter();
  const { user, business } = useAuth();

  const [period, setPeriod] = useState<PeriodType>("monthly");
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<{
    label: string;
    income: number;
    expense: number;
  } | null>(null);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Load Transactions (Firestore + Offline Outbox)
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const list: TransactionRecord[] = [];

        // 1. Ambil dari Offline Outbox
        const outbox = getOutbox();
        outbox.forEach((item) => {
          list.push({
            id: item.id,
            type: item.type,
            amount: item.amount,
            category: item.category,
            note: item.note,
            transactionDate: item.transactionDate || new Date(item.createdAt).toISOString().split("T")[0],
            source: item.source,
          });
        });

        // 2. Ambil dari Firestore jika online
        if (navigator.onLine && db) {
          try {
            const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            snap.forEach((d) => {
              const data = d.data() as any;
              if (!user || !data.userId || data.userId === user.uid) {
                list.push({
                  id: d.id,
                  type: data.type || "income",
                  amount: Number(data.amount) || 0,
                  category: data.category || "Umum",
                  note: data.note || "",
                  transactionDate: data.transactionDate || new Date().toISOString().split("T")[0],
                  source: data.source || "manual",
                  userId: data.userId,
                });
              }
            });
          } catch (err) {
            console.warn("Firestore fetch offline fallback in reports:", err);
          }
        }

        setTransactions(list);
      } catch (e) {
        console.error("Gagal mengambil data laporan:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  // Filter transaksi berdasarkan Periode Aktif
  const { filteredTransactions, periodLabel } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    if (period === "weekly") {
      // 7 Hari Terakhir
      const sevenDaysAgo = new Date(now.getTime() - 6 * 86400000).toISOString().split("T")[0];
      const filtered = transactions.filter(
        (t) => t.transactionDate >= sevenDaysAgo && t.transactionDate <= todayStr
      );
      return {
        filteredTransactions: filtered,
        periodLabel: "7 Hari Terakhir",
      };
    }

    if (period === "monthly") {
      // Bulan Ini (YYYY-MM)
      const currentMonthPrefix = now.toISOString().slice(0, 7);
      const filtered = transactions.filter((t) => t.transactionDate.startsWith(currentMonthPrefix));
      const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      return {
        filteredTransactions: filtered,
        periodLabel: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
      };
    }

    // Yearly
    const currentYearPrefix = String(now.getFullYear());
    const filtered = transactions.filter((t) => t.transactionDate.startsWith(currentYearPrefix));
    return {
      filteredTransactions: filtered,
      periodLabel: `Tahun ${currentYearPrefix}`,
    };
  }, [transactions, period]);

  // Kalkulasi Total Pemasukan, Pengeluaran, Laba/Rugi
  const { totalIncome, totalExpense, netBalance, profitMargin } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === "income") inc += t.amount;
      if (t.type === "expense") exp += t.amount;
    });
    const net = inc - exp;
    const margin = inc > 0 ? Math.round((net / inc) * 100) : 0;
    return {
      totalIncome: inc,
      totalExpense: exp,
      netBalance: net,
      profitMargin: margin,
    };
  }, [filteredTransactions]);

  // Data Chart Bars Generator
  const chartData = useMemo(() => {
    const now = new Date();

    if (period === "weekly") {
      // 7 slot hari (dari 6 hari lalu sampai hari ini)
      const slots: Array<{ label: string; dateStr: string; income: number; expense: number }> = [];
      const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        const dateStr = d.toISOString().split("T")[0];
        const dayLabel = dayNames[d.getDay()];

        let inc = 0;
        let exp = 0;
        filteredTransactions.forEach((t) => {
          if (t.transactionDate === dateStr) {
            if (t.type === "income") inc += t.amount;
            if (t.type === "expense") exp += t.amount;
          }
        });

        slots.push({ label: dayLabel, dateStr, income: inc, expense: exp });
      }
      return slots;
    }

    if (period === "monthly") {
      // 4 slot minggu (M1: 1-7, M2: 8-14, M3: 15-21, M4: 22-akhir)
      const slots = [
        { label: "M1 (1-7)", range: [1, 7], income: 0, expense: 0 },
        { label: "M2 (8-14)", range: [8, 14], income: 0, expense: 0 },
        { label: "M3 (15-21)", range: [15, 21], income: 0, expense: 0 },
        { label: "M4 (22+)", range: [22, 31], income: 0, expense: 0 },
      ];

      filteredTransactions.forEach((t) => {
        const day = parseInt(t.transactionDate.split("-")[2], 10);
        if (day >= 1 && day <= 7) {
          if (t.type === "income") slots[0].income += t.amount;
          if (t.type === "expense") slots[0].expense += t.amount;
        } else if (day >= 8 && day <= 14) {
          if (t.type === "income") slots[1].income += t.amount;
          if (t.type === "expense") slots[1].expense += t.amount;
        } else if (day >= 15 && day <= 21) {
          if (t.type === "income") slots[2].income += t.amount;
          if (t.type === "expense") slots[2].expense += t.amount;
        } else {
          if (t.type === "income") slots[3].income += t.amount;
          if (t.type === "expense") slots[3].expense += t.amount;
        }
      });

      return slots.map((s) => ({
        label: s.label.split(" ")[0],
        dateStr: s.label,
        income: s.income,
        expense: s.expense,
      }));
    }

    // Yearly: 12 bulan (Jan - Des)
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const slots = monthLabels.map((lbl, idx) => {
      const monthPrefix = `${now.getFullYear()}-${String(idx + 1).padStart(2, "0")}`;
      let inc = 0;
      let exp = 0;
      filteredTransactions.forEach((t) => {
        if (t.transactionDate.startsWith(monthPrefix)) {
          if (t.type === "income") inc += t.amount;
          if (t.type === "expense") exp += t.amount;
        }
      });
      return { label: lbl, dateStr: lbl, income: inc, expense: exp };
    });

    return slots;
  }, [filteredTransactions, period]);

  // Hitung Nilai Bar Tertinggi untuk Skala Grafik
  const maxChartValue = useMemo(() => {
    let max = 1;
    chartData.forEach((s) => {
      if (s.income > max) max = s.income;
      if (s.expense > max) max = s.expense;
    });
    return max;
  }, [chartData]);

  // Analisis Pos Pengeluaran Terbesar (Top Expenses)
  const topExpenseCategories = useMemo(() => {
    const map: { [cat: string]: number } = {};
    filteredTransactions.forEach((t) => {
      if (t.type === "expense") {
        map[t.category] = (map[t.category] || 0) + t.amount;
      }
    });

    const entries = Object.entries(map).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }));

    // Urutkan dari terbesar ke terkecil & ambil 4 teratas
    entries.sort((a, b) => b.amount - a.amount);
    return entries.slice(0, 4);
  }, [filteredTransactions, totalExpense]);

  // Handler: Ekspor CSV Client-Side
  const handleExportCsv = () => {
    setIsExportingCsv(true);
    try {
      if (filteredTransactions.length === 0) {
        alert("Belum ada data transaksi untuk diekspor.");
        return;
      }

      // Header CSV
      const headers = ["ID", "Tanggal", "Tipe", "Kategori", "Nominal (Rp)", "Catatan", "Jalur Input"];
      const rows = filteredTransactions.map((t) => [
        t.id,
        t.transactionDate,
        t.type === "income" ? "Pemasukan" : "Pengeluaran",
        `"${(t.category || "").replace(/"/g, '""')}"`,
        t.amount,
        `"${(t.note || "").replace(/"/g, '""')}"`,
        t.source || "manual",
      ]);

      // Gabungkan dengan UTF-8 BOM agar Excel membaca format bahasa Indonesia dengan sempurna
      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Laporan_Keuangan_SiKasir_${period}_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal ekspor CSV:", err);
      alert("Gagal mengunduh file CSV.");
    } finally {
      setIsExportingCsv(false);
    }
  };

  // Handler: Cetak / Unduh PDF Native Print
  const handlePrintPdf = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 200);
  };

  return (
    <main className="min-h-screen bg-[#090A0F] text-slate-100 px-4 sm:px-5 pt-5 pb-28 max-w-md mx-auto relative overflow-hidden print:p-0 print:max-w-none print:bg-white print:text-black">
      {/* Background Solar Ambient Flare (Hide on Print) */}
      <div
        className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full pointer-events-none blur-[120px] opacity-15 print:hidden"
        style={{
          background: "radial-gradient(circle, #FF8918 0%, #DA4E24 50%, transparent 80%)",
        }}
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 print:mb-2">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight print:text-slate-900">
            Laporan Keuangan
          </h1>
          <p className="text-xs text-slate-400 print:text-slate-600">
            {business?.name || "Usaha Anda"} • {periodLabel}
          </p>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-solar-400 print:hidden">
          <BarChart3 className="w-5 h-5" />
        </div>
      </div>

      {/* Pemilih Periode Tab (Mingguan / Bulanan / Tahunan) (Hide on Print) */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-5 print:hidden">
        <button
          type="button"
          onClick={() => setPeriod("weekly")}
          className={`py-2 text-xs font-semibold rounded-xl transition-all ${
            period === "weekly"
              ? "bg-white/[0.1] text-white font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Mingguan
        </button>
        <button
          type="button"
          onClick={() => setPeriod("monthly")}
          className={`py-2 text-xs font-semibold rounded-xl transition-all ${
            period === "monthly"
              ? "bg-solar-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(255,137,24,0.3)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Bulanan
        </button>
        <button
          type="button"
          onClick={() => setPeriod("yearly")}
          className={`py-2 text-xs font-semibold rounded-xl transition-all ${
            period === "yearly"
              ? "bg-white/[0.1] text-white font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Tahunan
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          <div className="h-36 rounded-3xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
          <div className="h-48 rounded-3xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
          <div className="h-32 rounded-3xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
        </div>
      )}

      {/* Content Area */}
      {!loading && (
        <div className="space-y-5">
          {/* 1. HERO BENTO CARD: LABA / RUGI BERSIH */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] backdrop-blur-md relative overflow-hidden print:border-slate-300 print:bg-slate-50">
            {/* Glow accent */}
            <div
              className={`absolute top-0 right-0 w-28 h-28 rounded-full blur-[60px] pointer-events-none opacity-25 ${
                netBalance >= 0 ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />

            <div className="relative z-10 text-center pb-3 border-b border-white/[0.06] print:border-slate-200">
              <span className="text-[12px] uppercase font-semibold text-slate-400 tracking-wider block mb-1 print:text-slate-600">
                Laba Bersih ({periodLabel})
              </span>
              <div
                className={`text-[28px] font-bold font-mono tracking-tight ${
                  netBalance >= 0 ? "text-emerald-400 print:text-emerald-600" : "text-rose-400 print:text-rose-600"
                }`}
              >
                {netBalance >= 0 ? "+" : ""}
                {formatRupiah(netBalance)}
              </div>
              {totalIncome > 0 && (
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-300 print:text-slate-700 font-medium">
                  Margin Keuntungan: {profitMargin}%
                </span>
              )}
            </div>

            {/* Dua Kolom Total Masuk & Keluar */}
            <div className="grid grid-cols-2 gap-3 pt-3 text-center divide-x divide-white/[0.06] print:divide-slate-200">
              <div>
                <span className="text-[12px] text-slate-400 font-semibold tracking-wider block mb-0.5 print:text-slate-600">
                  Total Pemasukan
                </span>
                <span className="text-[16px] font-semibold font-mono text-emerald-400 print:text-emerald-600 block truncate">
                  +{formatRupiah(totalIncome)}
                </span>
              </div>
              <div className="pl-2">
                <span className="text-[12px] text-slate-400 font-semibold tracking-wider block mb-0.5 print:text-slate-600">
                  Total Pengeluaran
                </span>
                <span className="text-[16px] font-semibold font-mono text-rose-400 print:text-rose-600 block truncate">
                  -{formatRupiah(totalExpense)}
                </span>
              </div>
            </div>
          </div>

          {/* 2. GRAFIK TREN ARUS KAS (DUAL BAR CHART CSS NATIVE) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md print:border-slate-300">
            {/* Header Chart & Legenda */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[14px] sm:text-sm font-bold text-white print:text-slate-900">
                  Tren Arus Kas
                </h2>
                <p className="text-[10px] text-slate-400 print:text-slate-500">
                  Perbandingan masuk vs keluar
                </p>
              </div>

              {/* Legenda Titik */}
              <div className="flex items-center gap-3 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-300 print:text-slate-700">Masuk</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-slate-300 print:text-slate-700">Keluar</span>
                </div>
              </div>
            </div>

            {/* Tooltip Hover/Tap Display */}
            {activeTooltip && (
              <div className="mb-3 p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-xs flex items-center justify-between animate-in fade-in print:hidden">
                <span className="font-semibold text-slate-200">{activeTooltip.label}:</span>
                <div className="flex gap-2.5 font-mono text-[11px]">
                  <span className="text-emerald-400">+{formatRupiah(activeTooltip.income)}</span>
                  <span className="text-rose-400">-{formatRupiah(activeTooltip.expense)}</span>
                </div>
              </div>
            )}

            {/* Bar Chart Bars Container */}
            <div className="h-40 flex items-end justify-between gap-1 sm:gap-2 pt-6 pb-2 border-b border-white/[0.06] print:border-slate-200">
              {chartData.map((slot, idx) => {
                const incomeHeightPct = Math.min(100, Math.round((slot.income / maxChartValue) * 100));
                const expenseHeightPct = Math.min(100, Math.round((slot.expense / maxChartValue) * 100));

                return (
                  <div
                    key={idx}
                    onClick={() =>
                      setActiveTooltip({
                        label: slot.dateStr,
                        income: slot.income,
                        expense: slot.expense,
                      })
                    }
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    {/* Bar Pair (Masuk & Keluar Berdampingan) */}
                    <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full">
                      {/* Bar Hijau (Income) */}
                      <div
                        className="w-2 sm:w-3 rounded-t-sm sm:rounded-t-md bg-emerald-500/80 hover:bg-emerald-400 transition-all duration-300"
                        style={{ height: `${Math.max(4, incomeHeightPct)}%` }}
                        title={`Masuk: ${formatRupiah(slot.income)}`}
                      />
                      {/* Bar Merah (Expense) */}
                      <div
                        className="w-2 sm:w-3 rounded-t-sm sm:rounded-t-md bg-rose-500/80 hover:bg-rose-400 transition-all duration-300"
                        style={{ height: `${Math.max(4, expenseHeightPct)}%` }}
                        title={`Keluar: ${formatRupiah(slot.expense)}`}
                      />
                    </div>

                    {/* Label Bawah */}
                    <span className="text-[9px] sm:text-[10px] text-slate-400 group-hover:text-white mt-2 truncate max-w-full print:text-slate-600">
                      {slot.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-2 print:hidden">
              💡 Ketuk salah satu batang untuk melihat rincian nominalnya
            </p>
          </div>

          {/* 3. POS PENGELUARAN TERBESAR PER KATEGORI */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md print:border-slate-300">
            <h2 className="text-[16px] font-semibold text-white mb-3 print:text-slate-900">
              Pos Pengeluaran Terbesar
            </h2>

            {topExpenseCategories.length === 0 ? (
              <p className="text-[14px] text-slate-500 py-2">
                Belum ada transaksi di periode ini.
              </p>
            ) : (
              <div className="space-y-3.5">
                {topExpenseCategories.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 print:text-slate-800">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 print:text-slate-600">
                          {formatRupiah(item.amount)}
                        </span>
                        <span className="text-[10px] font-bold text-rose-400 print:text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded-full">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Horizontal Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden print:bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. DUA TOMBOL AKSI EKSPOR: PDF SIAP CETAK & CSV EXCEL */}
          <div className="space-y-3 pt-2 print:hidden">
            {/* Tombol PDF Siap Cetak */}
            <button
              type="button"
              onClick={handlePrintPdf}
              disabled={isPrinting}
              className="w-full h-[48px] rounded-2xl bg-emerald-500 text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <FileText className="w-5 h-5" />
              <span>{isPrinting ? "Menyiapkan PDF..." : "Unduh Laporan PDF (Siap Cetak)"}</span>
            </button>

            {/* Tombol Ekspor CSV Excel */}
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={isExportingCsv}
              className="w-full h-[48px] rounded-2xl border border-white/[0.1] bg-transparent text-[14px] text-slate-300 hover:text-white font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span>{isExportingCsv ? "Mengekspor..." : "Ekspor Data Lengkap (Excel / CSV)"}</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
