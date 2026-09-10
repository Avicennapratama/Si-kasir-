"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  X, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Mic, 
  Receipt, 
  Keyboard, 
  Clock, 
  Trash2, 
  Edit3, 
  Check, 
  AlertTriangle, 
  ChevronRight, 
  Plus, 
  CloudOff, 
  RefreshCw, 
  ShoppingBag, 
  Utensils, 
  Zap, 
  Home, 
  Users, 
  Tag, 
  Coins, 
  CheckCircle2,
  DollarSign
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { db } from "@/lib/firebase/config";
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc 
} from "firebase/firestore";
import { 
  getOutbox, 
  removeFromOutbox, 
  updateOutboxItem, 
  syncOutbox, 
  OutboxItem 
} from "@/lib/offline/outbox";
import { formatRupiah } from "@/lib/utils";

export interface UnifiedTransaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  note?: string;
  transactionDate: string; // YYYY-MM-DD
  source: "manual" | "suara" | "nota";
  items?: Array<{ name: string; qty?: number; price?: number }>;
  userId?: string;
  createdAt?: any;
  isOffline?: boolean;
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

export default function RiwayatPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("month");
  const [sourceFilter, setSourceFilter] = useState<"all" | "manual" | "suara" | "nota">("all");

  // Selected for Modal Detail / Edit / Delete
  const [selectedTx, setSelectedTx] = useState<UnifiedTransaction | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState<{
    type: "income" | "expense";
    amount: number;
    category: string;
    note: string;
    transactionDate: string;
  }>({
    type: "income",
    amount: 0,
    category: "Penjualan Produk",
    note: "",
    transactionDate: new Date().toISOString().split("T")[0],
  });

  // Load Transactions (Firestore + Local Outbox)
  const loadAllTransactions = async () => {
    setLoading(true);
    try {
      const list: UnifiedTransaction[] = [];

      // 1. Ambil dari Offline Outbox (tidak boleh ada yang terlewat!)
      const outboxItems = getOutbox();
      outboxItems.forEach((item) => {
        list.push({
          id: item.id,
          type: item.type,
          amount: item.amount,
          category: item.category,
          note: item.note,
          transactionDate: item.transactionDate || new Date(item.createdAt).toISOString().split("T")[0],
          source: item.source || "manual",
          isOffline: true,
          createdAt: item.createdAt,
        });
      });

      // 2. Ambil dari Firestore jika online
      if (navigator.onLine && db) {
        try {
          const q = query(
            collection(db, "transactions"),
            orderBy("createdAt", "desc")
          );
          const snap = await getDocs(q);
          snap.forEach((d) => {
            const data = d.data() as any;
            // Filter user jika ada userId
            if (!user || !data.userId || data.userId === user.uid) {
              list.push({
                id: d.id,
                type: data.type || "income",
                amount: Number(data.amount) || 0,
                category: data.category || "Umum",
                note: data.note || "",
                transactionDate: data.transactionDate || new Date().toISOString().split("T")[0],
                source: data.source || "manual",
                items: data.items || [],
                userId: data.userId,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                isOffline: false,
              });
            }
          });
        } catch (fErr) {
          console.warn("Firestore fetch error, displaying local/outbox records:", fErr);
        }
      }

      // Urutkan transaksi dari yang terbaru ke terlama
      list.sort((a, b) => {
        const dateA = new Date(a.transactionDate).getTime() || 0;
        const dateB = new Date(b.transactionDate).getTime() || 0;
        if (dateB !== dateA) return dateB - dateA;
        return (b.createdAt || 0) - (a.createdAt || 0);
      });

      setTransactions(list);
    } catch (err) {
      console.error("Gagal memuat riwayat transaksi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllTransactions();
  }, [user]);

  // Sinkronisasi Outbox manual
  const handleSyncOutbox = async () => {
    if (!navigator.onLine || !user) {
      setSyncToast("Koneksi offline. Hubungkan internet untuk sinkron.");
      setTimeout(() => setSyncToast(null), 3000);
      return;
    }
    setIsSyncing(true);
    try {
      const { synced } = await syncOutbox(async (item) => {
        const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
        await addDoc(collection(db, "transactions"), {
          type: item.type,
          amount: item.amount,
          category: item.category,
          note: item.note || "",
          transactionDate: item.transactionDate,
          source: item.source,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
        return true;
      });
      setSyncToast(synced > 0 ? `Berhasil menyinkronkan ${synced} transaksi!` : "Semua data sudah tersinkron.");
      setTimeout(() => setSyncToast(null), 3000);
      await loadAllTransactions();
    } catch (err) {
      setSyncToast("Gagal menyinkronkan beberapa item.");
      setTimeout(() => setSyncToast(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter & Search Logic
  const filteredTransactions = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - 7)).toISOString().split("T")[0];
    const currentMonthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM

    return transactions.filter((tx) => {
      // 1. Jenis Filter
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;

      // 2. Sumber Filter
      if (sourceFilter !== "all" && tx.source !== sourceFilter) return false;

      // 3. Tanggal Filter
      if (dateFilter === "today" && tx.transactionDate !== todayStr) return false;
      if (dateFilter === "week" && tx.transactionDate < startOfWeek) return false;
      if (dateFilter === "month" && !tx.transactionDate.startsWith(currentMonthPrefix)) return false;

      // 4. Pencarian Teks (Search query)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const noteMatch = (tx.note || "").toLowerCase().includes(q);
        const catMatch = tx.category.toLowerCase().includes(q);
        const amountMatch = String(tx.amount).includes(q);
        const itemMatch = tx.items?.some((it) => it.name.toLowerCase().includes(q));
        if (!noteMatch && !catMatch && !amountMatch && !itemMatch) return false;
      }

      return true;
    });
  }, [transactions, typeFilter, dateFilter, sourceFilter, searchQuery]);

  // Total Kas Rekap Periode Ini
  const { totalIncome, totalExpense, netBalance } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === "income") inc += t.amount;
      if (t.type === "expense") exp += t.amount;
    });
    return { totalIncome: inc, totalExpense: exp, netBalance: inc - exp };
  }, [filteredTransactions]);

  // Pengelompokan Berdasarkan Tanggal (Date Grouping)
  const groupedTransactions = useMemo(() => {
    const groups: { [dateStr: string]: UnifiedTransaction[] } = {};
    filteredTransactions.forEach((tx) => {
      const d = tx.transactionDate || "Tanpa Tanggal";
      if (!groups[d]) groups[d] = [];
      groups[d].push(tx);
    });
    return groups;
  }, [filteredTransactions]);

  // Format Header Tanggal Cantik (Indonesia)
  const formatDateHeading = (dateStr: string) => {
    const today = new Date().toISOString().split("T")[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split("T")[0];

    if (dateStr === today) return "Hari Ini";
    if (dateStr === yesterday) return "Kemarin";

    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Kategori Icon Resolver
  const getCategoryIcon = (category: string, type: "income" | "expense") => {
    const c = category.toLowerCase();
    if (c.includes("bahan") || c.includes("makan") || c.includes("ayam") || c.includes("kue")) {
      return <Utensils className="w-4 h-4 text-solar-400" />;
    }
    if (c.includes("jual") || c.includes("produk") || c.includes("belanja")) {
      return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
    }
    if (c.includes("listrik") || c.includes("air") || c.includes("wifi")) {
      return <Zap className="w-4 h-4 text-amber-400" />;
    }
    if (c.includes("sewa") || c.includes("tempat") || c.includes("ruko")) {
      return <Home className="w-4 h-4 text-cyan-400" />;
    }
    if (c.includes("gaji") || c.includes("karyawan") || c.includes("upah")) {
      return <Users className="w-4 h-4 text-rose-400" />;
    }
    return type === "income" ? (
      <Coins className="w-4 h-4 text-emerald-400" />
    ) : (
      <Tag className="w-4 h-4 text-rose-400" />
    );
  };

  // Open Modal Details
  const handleOpenDetail = (tx: UnifiedTransaction) => {
    setSelectedTx(tx);
    setIsEditMode(false);
    setShowDeleteConfirm(false);
    setEditForm({
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      note: tx.note || "",
      transactionDate: tx.transactionDate,
    });
  };

  // Handle Save Edit
  const handleSaveEdit = async () => {
    if (!selectedTx || editForm.amount <= 0) return;
    setIsProcessingAction(true);
    try {
      if (selectedTx.isOffline) {
        // Update di Outbox
        updateOutboxItem(selectedTx.id, {
          type: editForm.type,
          amount: editForm.amount,
          category: editForm.category,
          note: editForm.note,
          transactionDate: editForm.transactionDate,
        });
      } else if (navigator.onLine && db) {
        // Update di Firestore
        const ref = doc(db, "transactions", selectedTx.id);
        await updateDoc(ref, {
          type: editForm.type,
          amount: editForm.amount,
          category: editForm.category,
          note: editForm.note,
          transactionDate: editForm.transactionDate,
        });
      }

      // Update state lokal
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === selectedTx.id
            ? {
                ...item,
                type: editForm.type,
                amount: editForm.amount,
                category: editForm.category,
                note: editForm.note,
                transactionDate: editForm.transactionDate,
              }
            : item
        )
      );

      setSelectedTx(null);
      setIsEditMode(false);
    } catch (err) {
      console.error("Gagal mengupdate transaksi:", err);
      alert("Gagal mengupdate transaksi. Periksa koneksi.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handle Delete
  const handleDeleteTransaction = async () => {
    if (!selectedTx) return;
    setIsProcessingAction(true);
    try {
      if (selectedTx.isOffline) {
        // Hapus dari Outbox
        removeFromOutbox(selectedTx.id);
      } else if (navigator.onLine && db) {
        // Hapus dari Firestore
        await deleteDoc(doc(db, "transactions", selectedTx.id));
      }

      // Update state lokal
      setTransactions((prev) => prev.filter((item) => item.id !== selectedTx.id));
      setSelectedTx(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Gagal menghapus transaksi:", err);
      alert("Gagal menghapus transaksi.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const hasOutboxItems = transactions.some((t) => t.isOffline);

  return (
    <main className="min-h-screen bg-[#090A0F] text-slate-100 px-4 sm:px-5 pt-5 pb-28 max-w-md mx-auto relative overflow-hidden">
      {/* Background Ambient Flare */}
      <div
        className="absolute top-[-60px] right-[-40px] w-[260px] h-[260px] rounded-full pointer-events-none blur-[110px] opacity-15"
        style={{
          background: "radial-gradient(circle, #FF8918 0%, #DA4E24 50%, transparent 80%)",
        }}
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Riwayat Transaksi</h1>
          <p className="text-xs text-slate-400">
            {filteredTransactions.length} transaksi tercatat
          </p>
        </div>

        {/* Sync Status / Button */}
        {hasOutboxItems && (
          <button
            type="button"
            onClick={handleSyncOutbox}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>Sync ({transactions.filter((t) => t.isOffline).length})</span>
          </button>
        )}
      </div>

      {/* Toast Notifikasi Sync */}
      {syncToast && (
        <div className="mb-4 p-3 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-xs text-slate-200 flex items-center justify-between animate-in fade-in">
          <span>{syncToast}</span>
          <button onClick={() => setSyncToast(null)} className="p-1 text-slate-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="relative mb-4">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari transaksi, barang, catatan..."
          className="w-full h-[48px] pl-12 pr-10 rounded-[12px] bg-white/[0.03] border border-white/[0.08] text-[14px] text-white placeholder-slate-500 focus:outline-none focus:border-solar-500 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mini Dashboard Audit Bar (Audit Arus Kas Periode Ini) */}
      <div className="p-3.5 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md mb-4">
        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-white/[0.06]">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-0.5">
              Masuk
            </span>
            <span className="text-xs sm:text-sm font-bold font-mono text-emerald-400 block truncate">
              +{formatRupiah(totalIncome)}
            </span>
          </div>
          <div className="pl-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-0.5">
              Keluar
            </span>
            <span className="text-xs sm:text-sm font-bold font-mono text-rose-400 block truncate">
              -{formatRupiah(totalExpense)}
            </span>
          </div>
          <div className="pl-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-0.5">
              Bersih
            </span>
            <span
              className={`text-xs sm:text-sm font-bold font-mono block truncate ${
                netBalance >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {netBalance >= 0 ? "+" : ""}
              {formatRupiah(netBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs (Jenis) */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 grid grid-cols-3 gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setTypeFilter("all")}
            className={`py-1.5 text-xs font-semibold rounded-xl transition-all ${
              typeFilter === "all"
                ? "bg-white/[0.1] text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("income")}
            className={`py-1.5 text-xs font-semibold rounded-xl transition-all ${
              typeFilter === "income"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            + Masuk
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("expense")}
            className={`py-1.5 text-xs font-semibold rounded-xl transition-all ${
              typeFilter === "expense"
                ? "bg-rose-500 text-white font-bold shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            - Keluar
          </button>
        </div>
      </div>

      {/* Secondary Filter Chips: Periode & Sumber */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {/* Periode options */}
        <button
          type="button"
          onClick={() => setDateFilter("month")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            dateFilter === "month"
              ? "bg-solar-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(255,137,24,0.3)]"
              : "bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white"
          }`}
        >
          Bulan Ini
        </button>
        <button
          type="button"
          onClick={() => setDateFilter("week")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            dateFilter === "week"
              ? "bg-solar-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(255,137,24,0.3)]"
              : "bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white"
          }`}
        >
          7 Hari Terakhir
        </button>
        <button
          type="button"
          onClick={() => setDateFilter("today")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            dateFilter === "today"
              ? "bg-solar-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(255,137,24,0.3)]"
              : "bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white"
          }`}
        >
          Hari Ini
        </button>
        <button
          type="button"
          onClick={() => setDateFilter("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            dateFilter === "all"
              ? "bg-solar-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(255,137,24,0.3)]"
              : "bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white"
          }`}
        >
          Semua Periode
        </button>

        {/* Source Dropdown / Toggle */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as any)}
          className="h-7 px-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-slate-400 focus:outline-none focus:border-solar-500"
        >
          <option value="all" className="bg-[#090A0F]">Semua Jalur</option>
          <option value="manual" className="bg-[#090A0F]">⌨️ Manual</option>
          <option value="suara" className="bg-[#090A0F]">🎙️ Suara AI</option>
          <option value="nota" className="bg-[#090A0F]">📷 Nota AI</option>
        </select>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse flex items-center px-4 gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
              <div className="flex-1 space-y-2">
                <div className="w-1/2 h-3.5 rounded bg-white/[0.06]" />
                <div className="w-1/3 h-2.5 rounded bg-white/[0.04]" />
              </div>
              <div className="w-16 h-4 rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTransactions.length === 0 && (
        <div className="py-14 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-500 mb-3">
            <Search className="w-7 h-7 text-slate-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300 mb-1">
            Tidak Ada Transaksi Ditemukan
          </h3>
          <p className="text-xs text-slate-500 max-w-[220px] mb-5 leading-relaxed">
            {searchQuery
              ? "Coba gunakan kata kunci pencarian yang lain atau reset filter."
              : "Belum ada catatan transaksi pada periode yang dipilih."}
          </p>
          <button
            type="button"
            onClick={() => router.push("/catat/manual")}
            className="h-10 px-5 rounded-2xl bg-gradient-to-r from-solar-500 to-solar-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(255,137,24,0.3)] active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Transaksi Baru</span>
          </button>
        </div>
      )}

      {/* Grouped Transaction List */}
      {!loading && filteredTransactions.length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([dateStr, items]) => {
            // Subtotal harian
            const dayIncome = items
              .filter((i) => i.type === "income")
              .reduce((acc, curr) => acc + curr.amount, 0);
            const dayExpense = items
              .filter((i) => i.type === "expense")
              .reduce((acc, curr) => acc + curr.amount, 0);

            return (
              <div key={dateStr} className="space-y-2">
                {/* Sticky Date Header */}
                <div className="flex items-center justify-between sticky top-0 z-10 py-2 px-3 rounded-[8px] bg-slate-800/80 backdrop-blur-md border border-white/[0.04]">
                  <span className="text-[13px] font-semibold text-slate-300">
                    {formatDateHeading(dateStr)} - {dateStr}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    {dayIncome > 0 && (
                      <span className="text-emerald-400">+{formatRupiah(dayIncome)}</span>
                    )}
                    {dayExpense > 0 && (
                      <span className="text-rose-400">-{formatRupiah(dayExpense)}</span>
                    )}
                  </div>
                </div>

                {/* Cards List */}
                <div className="space-y-2">
                  {items.map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => handleOpenDetail(tx)}
                      className="h-[64px] px-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between gap-3"
                    >
                      {/* Icon Kategori */}
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/[0.08] flex items-center justify-center shrink-0">
                        {getCategoryIcon(tx.category, tx.type)}
                      </div>

                      {/* Info Transaksi */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-[14px] font-medium text-white truncate leading-tight mb-0.5">
                          {tx.note || tx.category}
                        </p>
                        <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
                          {/* Source badge */}
                          {tx.source === "suara" && (
                            <span className="flex items-center gap-0.5">
                              <Mic className="w-3 h-3 text-cyan-400" /> Suara
                            </span>
                          )}
                          {tx.source === "nota" && (
                            <span className="flex items-center gap-0.5">
                              <Receipt className="w-3 h-3 text-solar-400" /> Nota
                            </span>
                          )}
                          {tx.source === "manual" && (
                            <span className="flex items-center gap-0.5">
                              <Keyboard className="w-3 h-3" /> Manual
                            </span>
                          )}
                          {tx.createdAt && (
                            <>
                              <span>•</span>
                              <span>
                                {new Date(tx.createdAt).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </>
                          )}
                          {tx.isOffline && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400 font-medium">⏳ Antrian</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Nominal */}
                      <div className="text-right shrink-0">
                        <span
                          className={`text-[14px] font-bold font-mono ${
                            tx.type === "income" ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "-"}
                          {formatRupiah(tx.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOTTOM SHEET MODAL: DETAIL & EDIT TRANSAKSI                                */}
      {/* ========================================================================= */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#0D0E14] border-t sm:border border-white/[0.1] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
              <h2 className="text-sm font-bold text-white">
                {isEditMode ? "Ubah Transaksi" : "Rincian Transaksi"}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MODE 1: DETAIL VIEW */}
            {!isEditMode && !showDeleteConfirm && (
              <div className="space-y-4">
                {/* Nominal Besar Display */}
                <div className="text-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    {selectedTx.type === "income" ? "Pemasukan Uang" : "Pengeluaran Uang"}
                  </span>
                  <div
                    className={`text-2xl sm:text-3xl font-bold font-mono ${
                      selectedTx.type === "income" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {selectedTx.type === "income" ? "+" : "-"}
                    {formatRupiah(selectedTx.amount)}
                  </div>
                </div>

                {/* Data Fields List */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-slate-400">Kategori</span>
                    <span className="font-semibold text-white">{selectedTx.category}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-slate-400">Tanggal</span>
                    <span className="font-mono text-white">{selectedTx.transactionDate}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-slate-400">Catatan</span>
                    <span className="font-medium text-white text-right max-w-[200px]">
                      {selectedTx.note || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-slate-400">Jalur Input</span>
                    <span className="font-medium text-white flex items-center gap-1">
                      {selectedTx.source === "suara" && <Mic className="w-3 h-3 text-cyan-400" />}
                      {selectedTx.source === "nota" && <Receipt className="w-3 h-3 text-solar-400" />}
                      {selectedTx.source === "manual" && <Keyboard className="w-3 h-3 text-slate-400" />}
                      {selectedTx.source === "suara"
                        ? "Suara AI"
                        : selectedTx.source === "nota"
                        ? "Foto Nota AI"
                        : "Ketik Manual"}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-slate-400">Status Penyimpanan</span>
                    <span className="font-medium flex items-center gap-1">
                      {selectedTx.isOffline ? (
                        <span className="text-amber-400 flex items-center gap-1">
                          <CloudOff className="w-3 h-3" /> Antrian Offline
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Tersimpan di Cloud
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Rincian Item jika ada */}
                  {selectedTx.items && selectedTx.items.length > 0 && (
                    <div className="pt-2">
                      <span className="text-slate-400 block mb-1.5 font-semibold">
                        Rincian Barang Terdeteksi:
                      </span>
                      <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-2.5 space-y-1.5">
                        {selectedTx.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-[11px]">
                            <span className="text-slate-300">
                              {it.qty ? `${it.qty}x ` : ""}
                              {it.name}
                            </span>
                            {it.price && (
                              <span className="font-mono text-slate-400">
                                {formatRupiah(it.price)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tombol Aksi: Edit & Hapus */}
                <div className="flex flex-col gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className="w-full h-[48px] rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[14px] font-bold flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all"
                  >
                    <Edit3 className="w-4 h-4 text-white" />
                    <span>Ubah Transaksi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full h-[48px] rounded-2xl bg-transparent border border-rose-500/30 text-rose-500 text-[14px] font-semibold flex items-center justify-center gap-1.5 hover:bg-rose-500/10 transition-all active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Transaksi</span>
                  </button>
                </div>
              </div>
            )}

            {/* MODE 2: EDIT FORM */}
            {isEditMode && !showDeleteConfirm && (
              <div className="space-y-4">
                {/* Jenis Transaksi Toggle */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Jenis
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm({
                          ...editForm,
                          type: "income",
                          category: INCOME_CATEGORIES[0],
                        })
                      }
                      className={`py-2 text-xs font-bold rounded-xl transition-all ${
                        editForm.type === "income"
                          ? "bg-emerald-500 text-slate-950"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      + Uang Masuk
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm({
                          ...editForm,
                          type: "expense",
                          category: EXPENSE_CATEGORIES[0],
                        })
                      }
                      className={`py-2 text-xs font-bold rounded-xl transition-all ${
                        editForm.type === "expense"
                          ? "bg-rose-500 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      - Uang Keluar
                    </button>
                  </div>
                </div>

                {/* Nominal Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Nominal (Rp)
                  </label>
                  <div className="relative rounded-2xl border border-white/[0.1] bg-white/[0.03] focus-within:border-solar-500">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={editForm.amount || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          amount: Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                      className="w-full h-11 pl-10 pr-4 bg-transparent text-base font-bold font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full h-11 px-3 rounded-2xl bg-white/[0.03] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-solar-500"
                  >
                    {(editForm.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(
                      (cat) => (
                        <option key={cat} value={cat} className="bg-[#090A0F]">
                          {cat}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Catatan */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Catatan
                  </label>
                  <input
                    type="text"
                    value={editForm.note}
                    onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                    className="w-full h-11 px-3 rounded-2xl bg-white/[0.03] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-solar-500"
                    placeholder="Keterangan transaksi"
                  />
                </div>

                {/* Tanggal */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={editForm.transactionDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, transactionDate: e.target.value })
                    }
                    className="w-full h-11 px-3 rounded-2xl bg-white/[0.03] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-solar-500"
                  />
                </div>

                {/* Save Edit Action */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className="flex-1 h-11 rounded-2xl border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={isProcessingAction || editForm.amount <= 0}
                    className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
                  >
                    {isProcessingAction ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                    <span>Simpan</span>
                  </button>
                </div>
              </div>
            )}

            {/* MODE 3: KONFIRMASI HAPUS */}
            {showDeleteConfirm && (
              <div className="py-2 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  Hapus Transaksi {formatRupiah(selectedTx.amount)}?
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Catatan transaksi &ldquo;{selectedTx.note || selectedTx.category}&rdquo; akan dihapus secara permanen dari buku kas.
                </p>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 h-11 rounded-2xl border border-white/[0.08] text-xs font-semibold text-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteTransaction}
                    disabled={isProcessingAction}
                    className="flex-1 h-11 rounded-2xl bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                  >
                    {isProcessingAction ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Ya, Hapus</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
