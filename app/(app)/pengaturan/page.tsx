"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings, 
  ArrowLeft, 
  User, 
  Store, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Download, 
  Trash2, 
  LogOut, 
  ShieldCheck, 
  FileText, 
  Check, 
  AlertTriangle, 
  ChevronRight, 
  Sparkles,
  Database,
  Moon,
  Layers,
  X
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { getOutbox, syncOutbox, OutboxItem } from "@/lib/offline/outbox";
import { db, auth } from "@/lib/firebase/config";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { deleteUser } from "firebase/auth";

export default function PengaturanPage() {
  const router = useRouter();
  const { user, business, updateBusinessProfile, logout } = useAuth();

  // State online / offline
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [outboxCount, setOutboxCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Edit profil modal
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editStoreName, setEditStoreName] = useState("");
  const [editCategory, setEditCategory] = useState("Kuliner / F&B");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Data export state
  const [isExporting, setIsExporting] = useState(false);

  // Clean cache state
  const [cacheCleared, setCacheCleared] = useState(false);

  // Danger zone modals
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Hitung outbox
    const items = getOutbox();
    setOutboxCount(items.length);

    if (business) {
      setEditStoreName(business.name || "");
      setEditCategory(business.category || "Kuliner / F&B");
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [business]);

  // Sinkronisasi antrian outbox
  const handleSyncOutbox = async () => {
    if (!isOnline) {
      alert("Perangkat Anda sedang offline. Mohon sambungkan ke internet untuk sinkronisasi.");
      return;
    }

    if (outboxCount === 0) {
      setSyncFeedback("Semua data sudah tersinkronisasi.");
      setTimeout(() => setSyncFeedback(null), 3000);
      return;
    }

    setIsSyncing(true);
    setSyncFeedback(null);

    try {
      const result = await syncOutbox(async (item: OutboxItem) => {
        if (!user) return false;
        const bizId = business?.id || `biz_${user.uid}`;
        await addDoc(collection(db, "transactions"), {
          businessId: bizId,
          type: item.type,
          amount: item.amount,
          category: item.category,
          note: item.note || "",
          transactionDate: item.transactionDate,
          source: item.source,
          createdAt: new Date(item.createdAt),
          syncedFromOffline: true,
        });
        return true;
      });

      const remaining = getOutbox();
      setOutboxCount(remaining.length);
      setSyncFeedback(`Berhasil menyinkronkan ${result.synced} transaksi ke cloud.`);
    } catch (err) {
      setSyncFeedback("Gagal menyinkronkan data. Silakan coba lagi.");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  // Simpan perubahan profil usaha
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStoreName.trim()) return;

    setIsSavingProfile(true);
    try {
      await updateBusinessProfile({
        name: editStoreName.trim(),
        category: editCategory,
      });
      setShowEditProfile(false);
    } catch (err) {
      alert("Gagal memperbarui profil usaha.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Ekspor seluruh data transaksi ke JSON & CSV
  const handleExportData = async (format: "json" | "csv") => {
    setIsExporting(true);
    try {
      let transactions: any[] = [];

      // 1. Ambil dari Firestore jika login
      if (user) {
        const bizId = business?.id || `biz_${user.uid}`;
        const q = query(collection(db, "transactions"), where("businessId", "==", bizId));
        const snap = await getDocs(q);
        snap.forEach((doc) => {
          transactions.push({ id: doc.id, ...doc.data() });
        });
      }

      // 2. Gabungkan dengan antrian outbox
      const outboxItems = getOutbox();
      outboxItems.forEach((item) => {
        transactions.push({ ...item, status: "pending_offline" });
      });

      if (transactions.length === 0) {
        alert("Belum ada data transaksi yang dapat diekspor.");
        setIsExporting(false);
        return;
      }

      if (format === "json") {
        const jsonStr = JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            business: business?.name || "Toko UMKM",
            totalTransactions: transactions.length,
            transactions,
          },
          null,
          2
        );
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sikasir-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Format CSV
        const headers = ["Tanggal", "Tipe", "Nominal", "Kategori", "Catatan", "Sumber", "Status"];
        const rows = transactions.map((t) => [
          t.transactionDate || "",
          t.type === "income" ? "Pemasukan" : "Pengeluaran",
          t.amount || 0,
          `"${(t.category || "").replace(/"/g, '""')}"`,
          `"${(t.note || "").replace(/"/g, '""')}"`,
          t.source || "manual",
          t.status || "synced",
        ]);
        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sikasir-transaksi-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert("Terjadi kesalahan saat mengekspor data.");
    } finally {
      setIsExporting(false);
    }
  };

  // Bersihkan cache draft & sesi sementara
  const handleClearCache = () => {
    if (confirm("Bersihkan cache draft AI dan pratinjau foto sementara? Data transaksi yang sudah tersimpan TIDAK akan terhapus.")) {
      try {
        // Hapus sessionStorage draft AI
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.startsWith("sikasir_draft_") || key.startsWith("sikasir_cached_"))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k));

        setCacheCleared(true);
        setTimeout(() => setCacheCleared(false), 3000);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Logout handler
  const handleConfirmLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      alert("Gagal keluar akun. Silakan coba lagi.");
    }
  };

  // Hapus akun permanen (Danger Zone)
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "HAPUS") return;
    if (!user) return;

    setIsDeletingAccount(true);
    setDeleteError(null);

    try {
      const bizId = business?.id || `biz_${user.uid}`;

      // 1. Hapus transaksi di Firestore
      const q = query(collection(db, "transactions"), where("businessId", "==", bizId));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      await batch.commit();

      // 2. Hapus dokumen business
      try {
        await deleteDoc(doc(db, "businesses", bizId));
      } catch (e) {
        console.warn("Could not delete business doc", e);
      }

      // 3. Hapus dokumen user
      try {
        await deleteDoc(doc(db, "users", user.uid));
      } catch (e) {
        console.warn("Could not delete user doc", e);
      }

      // 4. Hapus data lokal di browser
      localStorage.clear();
      sessionStorage.clear();

      // 5. Hapus akun Firebase Auth
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }

      router.push("/login");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/requires-recent-login") {
        setDeleteError("Demi keamanan, mohon keluar dan login ulang sebelum menghapus akun.");
      } else {
        setDeleteError("Gagal menghapus akun: " + (err.message || "Kesalahan jaringan"));
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090A0F] text-slate-100 px-4 sm:px-5 pt-6 pb-28 max-w-md mx-auto relative overflow-hidden">
      {/* Background Glow */}
      <div
        className="absolute top-[-80px] right-[-30px] w-[260px] h-[260px] rounded-full pointer-events-none blur-[120px] opacity-15"
        style={{
          background: "radial-gradient(circle, #DA4E24 0%, transparent 80%)",
        }}
      />

      {/* ============================================================ */}
      {/* TOP BAR                                                      */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-5 relative z-10">
        <button
          type="button"
          onClick={() => router.push("/ekraf")}
          className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h1 className="text-sm font-bold text-white tracking-tight">Pengaturan &amp; Akun</h1>
          <p className="text-[10px] text-slate-400 font-mono">Pusat Kendali &amp; Privasi Data</p>
        </div>

        <div className="w-10 h-10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-slate-500" />
        </div>
      </div>

      <div className="space-y-5 relative z-10">
        {/* ============================================================ */}
        {/* SECTION 1: PROFIL PENGGUNA & TOKO                            */}
        {/* ============================================================ */}
        <section className="p-4 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary-400" />
              <span>Profil Pengguna &amp; Usaha</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/pengaturan/profil")}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Akun
              </button>
              <span className="text-slate-600">·</span>
              <button
                type="button"
                onClick={() => router.push("/pengaturan/usaha")}
                className="text-[11px] font-semibold text-primary-400 hover:text-primary-300 transition-colors"
              >
                Toko
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pt-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-base shadow-[0_0_15px_rgba(255,137,24,0.3)] shrink-0">
              {business?.name ? business.name.slice(0, 2).toUpperCase() : user?.email?.slice(0, 2).toUpperCase() || "SK"}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-white truncate">
                {business?.name || "Toko Belum Dinamai"}
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || "Mode Tamu (Offline)"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] font-mono text-slate-300">
                  <Store className="w-3 h-3 text-primary-400" />
                  <span>{business?.category || "Umum"}</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 2: SINKRONISASI OFFLINE & OUTBOX                    */}
        {/* ============================================================ */}
        <section className="p-4 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Penyimpanan &amp; Sinkronisasi</span>
            </span>
            <div className="flex items-center gap-1.5">
              {isOnline ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                  <Wifi className="w-3 h-3" />
                  <span>Online</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400">
                  <WifiOff className="w-3 h-3" />
                  <span>Offline</span>
                </span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-200">Antrian Outbox Lokal</p>
              <p className="text-[11px] text-slate-400 font-mono">
                {outboxCount > 0 ? `${outboxCount} transaksi menunggu upload` : "Semua data aman tersimpan di cloud"}
              </p>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl ${
                outboxCount > 0
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              }`}
            >
              {outboxCount} Item
            </span>
          </div>

          {syncFeedback && (
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{syncFeedback}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSyncOutbox}
              disabled={isSyncing}
              className="h-11 px-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-cyan-500/40 text-xs font-semibold text-slate-200 hover:text-cyan-300 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-cyan-400" : ""}`} />
              <span>{isSyncing ? "Sinkronisasi..." : "Sinkronkan"}</span>
            </button>

            <button
              type="button"
              onClick={handleClearCache}
              className="h-11 px-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-amber-500/40 text-xs font-semibold text-slate-200 hover:text-amber-300 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {cacheCleared ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Bersih!</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Bersih Cache AI</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 3: CADANGKAN & EKSPOR DATA                           */}
        {/* ============================================================ */}
        <section className="p-4 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ekspor &amp; Backup Data</span>
            </span>
            <button
              type="button"
              onClick={() => router.push("/pengaturan/data")}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Kelola Data
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
            Unduh salinan transaksi toko Anda ke dalam memori perangkat. Data sepenuhnya milik Anda.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleExportData("csv")}
              disabled={isExporting}
              className="h-11 px-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-emerald-500/40 text-xs font-semibold text-slate-200 hover:text-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ekspor CSV (Excel)</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportData("json")}
              disabled={isExporting}
              className="h-11 px-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-purple-500/40 text-xs font-semibold text-slate-200 hover:text-purple-400 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>Backup JSON</span>
            </button>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 4: TENTANG & KEBIJAKAN PRIVASI                       */}
        {/* ============================================================ */}
        <section className="p-4 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md space-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Privasi &amp; Ketentuan</span>
            </span>
            <button
              type="button"
              onClick={() => router.push("/pengaturan/privasi")}
              className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Kendali AI
            </button>
          </div>

          <button
            type="button"
            onClick={() => router.push("/pengaturan/privasi")}
            className="w-full py-2.5 flex items-center justify-between text-xs text-slate-300 hover:text-white group transition-colors"
          >
            <span>Izin &amp; Kendali Privasi AI</span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
          </button>

          <div className="h-px bg-white/[0.06]" />

          <button
            type="button"
            onClick={() => router.push("/legal/privasi")}
            className="w-full py-2.5 flex items-center justify-between text-xs text-slate-300 hover:text-white group transition-colors"
          >
            <span>Kebijakan Privasi (UU PDP)</span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
          </button>

          <div className="h-px bg-white/[0.06]" />

          <button
            type="button"
            onClick={() => router.push("/legal/syarat")}
            className="w-full py-2.5 flex items-center justify-between text-xs text-slate-300 hover:text-white group transition-colors"
          >
            <span>Syarat &amp; Ketentuan Layanan</span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
          </button>

          <div className="h-px bg-white/[0.06]" />

          <div className="w-full py-2.5 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Versi Aplikasi PWA</span>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-[10px]">v1.0.0 (Production)</span>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 5: DANGER ZONE                                       */}
        {/* ============================================================ */}
        <section className="p-4 rounded-3xl bg-rose-500/[0.03] border border-rose-500/20 backdrop-blur-md space-y-2.5">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Zona Akun</span>
          </span>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="h-11 px-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-slate-500 text-xs font-semibold text-slate-300 hover:text-white active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Keluar Akun</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteAccountModal(true)}
              className="h-11 px-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Hapus Akun</span>
            </button>
          </div>
        </section>
      </div>

      {/* ============================================================ */}
      {/* MODAL EDIT PROFIL                                            */}
      {/* ============================================================ */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#11131A] border border-white/[0.1] p-5 space-y-4 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-bold text-white">Ubah Data Usaha</h3>
              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1.5 block">
                  Nama Toko / Warung
                </label>
                <input
                  type="text"
                  value={editStoreName}
                  onChange={(e) => setEditStoreName(e.target.value)}
                  required
                  placeholder="Contoh: Kopi Senja Barokah"
                  className="w-full h-11 px-3.5 rounded-2xl bg-black/60 border border-white/[0.1] focus:border-primary-500/60 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1.5 block">
                  Kategori Usaha
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-2xl bg-black/60 border border-white/[0.1] focus:border-primary-500/60 text-xs text-white outline-none"
                >
                  <option value="Kuliner / F&B" className="bg-[#11131A]">Kuliner / F&amp;B</option>
                  <option value="Toko Kelontong / Sembako" className="bg-[#11131A]">Toko Kelontong / Sembako</option>
                  <option value="Fashion & Pakaian" className="bg-[#11131A]">Fashion &amp; Pakaian</option>
                  <option value="Jasa & Servis" className="bg-[#11131A]">Jasa &amp; Servis</option>
                  <option value="Kerajinan Kriya" className="bg-[#11131A]">Kerajinan Kriya</option>
                  <option value="Pertanian / Peternakan" className="bg-[#11131A]">Pertanian / Peternakan</option>
                  <option value="Lainnya" className="bg-[#11131A]">Lainnya</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 h-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-primary-500 to-amber-600 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(255,137,24,0.3)]"
                >
                  {isSavingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL LOGOUT                                                 */}
      {/* ============================================================ */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#11131A] border border-white/[0.1] p-5 space-y-4 animate-in slide-in-from-bottom-5">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-white">Keluar dari SiKasir AI?</h3>
              <p className="text-[11px] text-slate-400">
                Sesi Anda akan diakhiri. Catatan di outbox lokal tetap tersimpan di perangkat ini.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 h-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-slate-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 h-11 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL HAPUS AKUN (DANGER ZONE)                               */}
      {/* ============================================================ */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#180A0E] border border-rose-500/30 p-5 space-y-4 animate-in slide-in-from-bottom-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-sm font-bold text-white">Hapus Akun Permanen?</h3>
              <p className="text-[11px] text-rose-300/80 leading-relaxed">
                Tindakan ini <strong>tidak dapat dibatalkan</strong>. Seluruh riwayat transaksi cloud, data usaha, dan akun Anda akan dihapus permanen sesuai hak privasi.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-[11px] text-rose-300">
                {deleteError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 block text-center">
                Ketik <strong className="text-white">HAPUS</strong> untuk mengonfirmasi:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="HAPUS"
                className="w-full h-11 px-3 text-center rounded-2xl bg-black/70 border border-rose-500/40 focus:border-rose-400 text-xs font-mono font-bold text-white tracking-widest outline-none uppercase"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteAccountModal(false);
                  setDeleteConfirmText("");
                  setDeleteError(null);
                }}
                className="flex-1 h-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-slate-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "HAPUS" || isDeletingAccount}
                className={`flex-1 h-11 rounded-2xl font-bold text-xs ${
                  deleteConfirmText === "HAPUS" && !isDeletingAccount
                    ? "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                    : "bg-white/10 text-slate-500 cursor-not-allowed border border-white/5"
                }`}
              >
                {isDeletingAccount ? "Menghapus..." : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
