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

        <h1 className="text-[20px] font-bold text-white tracking-tight">Pengaturan Aplikasi</h1>

        <div className="w-10 h-10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-slate-500" />
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {/* ============================================================ */}
        {/* SECTION 1: PROFIL USAHA                                      */}
        {/* ============================================================ */}
        <section>
          <h2 className="text-[12px] font-semibold text-slate-400 mb-3 pl-1 tracking-wider">PROFIL USAHA</h2>
          <button
            type="button"
            onClick={() => router.push("/pengaturan/usaha")}
            className="w-full h-[72px] px-4 rounded-[14px] bg-white/[0.03] border border-white/[0.08] flex items-center gap-4 active:scale-[0.98] transition-all text-left"
          >
            <div className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-[16px] shadow-sm shrink-0">
              {business?.name ? business.name.slice(0, 2).toUpperCase() : "SK"}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[16px] font-semibold text-white truncate">
                {business?.name || "Warung Berkah Bu Siti"}
              </h3>
              <p className="text-[12px] text-slate-400 truncate mt-0.5">
                {business?.category || "Kuliner & Minuman"}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
          </button>
        </section>

        {/* ============================================================ */}
        {/* SECTION 2: SINKRONISASI OFFLINE                             */}
        {/* ============================================================ */}
        <section>
          <h2 className="text-[12px] font-semibold text-slate-400 mb-3 pl-1 tracking-wider">STATUS PENYIMPANAN OFFLINE</h2>
          <div className="p-4 rounded-[14px] bg-white/[0.03] border border-white/[0.08]">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {outboxCount === 0 ? (
                  <span className="text-emerald-400 text-lg">☁️✓</span>
                ) : (
                  <span className="text-amber-400 text-lg">☁️⚠️</span>
                )}
              </div>
              <div className="flex-1">
                {outboxCount === 0 ? (
                  <>
                    <h3 className="text-[14px] font-medium text-white mb-1">Semua data kas tersinkronisasi ke cloud</h3>
                    <p className="text-[12px] text-slate-500">Terakhir disinkron: Baru saja</p>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <h3 className="text-[14px] font-semibold text-amber-400">{outboxCount} transaksi tersimpan lokal di HP</h3>
                    <button
                      onClick={handleSyncOutbox}
                      disabled={isSyncing}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[12px] font-semibold text-amber-400 active:scale-95 transition-all"
                    >
                      {isSyncing ? "Menyinkron..." : "Sinkronkan Sekarang"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 3: KENDALI PRIVASI & DATA                            */}
        {/* ============================================================ */}
        <section>
          <h2 className="text-[12px] font-semibold text-slate-400 mb-3 pl-1 tracking-wider">KENDALI PRIVASI & DATA</h2>
          <div className="rounded-[14px] bg-white/[0.03] border border-white/[0.08] overflow-hidden">
            {/* Item A */}
            <button
              onClick={() => handleExportData("json")}
              disabled={isExporting}
              className="w-full p-4 flex items-start gap-3 text-left hover:bg-white/[0.02] active:bg-white/[0.05] transition-colors border-b border-white/[0.08]"
            >
              <Download className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[14px] font-medium text-white mb-1">Unduh Seluruh Data Saya</h3>
                <p className="text-[12px] text-slate-500 leading-snug">Ekspor seluruh transaksi, profil, dan aset ke format JSON & Excel</p>
              </div>
            </button>

            {/* Item B */}
            <button
              onClick={handleClearCache}
              className="w-full p-4 flex items-start gap-3 text-left hover:bg-white/[0.02] active:bg-white/[0.05] transition-colors border-b border-white/[0.08]"
            >
              <Trash2 className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[14px] font-medium text-white mb-1">Hapus Riwayat Pencatatan AI</h3>
                <p className="text-[12px] text-slate-500 leading-snug">Hapus log suara & foto nota sementara tanpa menghapus transaksi resmi</p>
              </div>
            </button>

            {/* Item C */}
            <button
              onClick={() => setShowDeleteAccountModal(true)}
              className="w-full p-4 flex items-start gap-3 text-left hover:bg-rose-500/10 active:bg-rose-500/20 transition-colors"
            >
              <Trash2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[14px] font-medium text-rose-500 mb-1">Hapus Akun & Semua Data Permanen</h3>
                <p className="text-[12px] text-slate-500 leading-snug">Tindakan ini tidak dapat dibatalkan. Seluruh data kas Anda akan dihapus total dari server.</p>
              </div>
            </button>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 4: TENTANG APLIKASI                                  */}
        {/* ============================================================ */}
        <section>
          <h2 className="text-[12px] font-semibold text-slate-400 mb-3 pl-1 tracking-wider">TENTANG</h2>
          <div className="p-4 rounded-[14px] bg-white/[0.03] border border-white/[0.08] space-y-4">
            <p className="text-[14px] text-white font-medium">SiKasir AI v1.0.0 (Progressive Web App)</p>
            <div className="space-y-3">
              <button onClick={() => router.push("/legal/syarat")} className="block text-[14px] text-cyan-400 hover:text-cyan-300 transition-colors">
                Syarat & Ketentuan Layanan
              </button>
              <button onClick={() => router.push("/legal/privasi")} className="block text-[14px] text-cyan-400 hover:text-cyan-300 transition-colors">
                Kebijakan Privasi
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* LOGOUT BUTTON                                                */}
        {/* ============================================================ */}
        <section className="pt-2 pb-6">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full h-[48px] rounded-[12px] bg-transparent border border-rose-500 text-[16px] font-semibold text-rose-500 flex items-center justify-center gap-2 hover:bg-rose-500/10 active:scale-[0.98] transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar dari Akun</span>
          </button>
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
