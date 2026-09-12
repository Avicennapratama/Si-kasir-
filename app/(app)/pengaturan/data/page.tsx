"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Database, 
  ArrowLeft, 
  Download, 
  Trash2, 
  FileSpreadsheet, 
  AlertTriangle, 
  Check, 
  Loader2,
  FileJson,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { db, auth } from "@/lib/firebase/config";
import { collection, query, where, getDocs, writeBatch, doc, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { getOutbox } from "@/lib/offline/outbox";

export default function PengaturanDataPage() {
  const router = useRouter();
  const { user, business, logout } = useAuth();

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Clear Cache State
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Ekspor Data JSON / CSV
  const handleExportData = async (format: "json" | "csv") => {
    setIsExporting(true);
    setExportSuccess(null);

    try {
      const exportList: any[] = [];

      // 1. Ambil dari offline outbox
      const outbox = getOutbox();
      outbox.forEach((item) => {
        exportList.push({ ...item, isOffline: true });
      });

      // 2. Ambil dari Firestore jika ada
      if (user && db) {
        try {
          const q = query(
            collection(db, "transactions"),
            where("userId", "==", user.uid)
          );
          const snap = await getDocs(q);
          snap.forEach((d) => {
            exportList.push({ id: d.id, ...d.data(), isOffline: false });
          });
        } catch (err) {
          console.warn("Error fetching Firestore for export:", err);
        }
      }

      const shopName = (business?.name || "sikasir").toLowerCase().replace(/\s+/g, "_");
      const dateStr = new Date().toISOString().split("T")[0];

      if (format === "json") {
        const jsonContent = JSON.stringify(
          {
            business: business || { name: "SiKasir UMKM" },
            userEmail: user?.email || "anonymous",
            exportedAt: new Date().toISOString(),
            totalRecords: exportList.length,
            transactions: exportList,
          },
          null,
          2
        );

        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `backup_${shopName}_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // CSV Export
        const headers = ["ID", "Tipe", "Nominal", "Kategori", "Catatan", "Tanggal", "Sumber", "Status"];
        const rows = exportList.map((tx) => [
          `"${tx.id}"`,
          `"${tx.type === "income" ? "Masuk" : "Keluar"}"`,
          tx.amount,
          `"${tx.category || "-"}"`,
          `"${(tx.note || "").replace(/"/g, '""')}"`,
          `"${tx.transactionDate || "-"}"`,
          `"${tx.source || "manual"}"`,
          `"${tx.isOffline ? "Lokal/Outbox" : "Cloud"}"`,
        ]);

        const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `laporan_${shopName}_${dateStr}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setExportSuccess(`File .${format.toUpperCase()} berhasil diunduh.`);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      alert("Gagal mengekspor data: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Bersihkan Cache Draft & Media
  const handleClearCache = () => {
    setIsClearingCache(true);
    try {
      // Hapus draft sessionStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith("sikasir_")) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));

      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 2500);
    } finally {
      setIsClearingCache(false);
    }
  };

  // Hapus Akun & Semua Data Permanen
  const handleDeleteAccountPermanent = async () => {
    if (deleteConfirmText.trim() !== "HAPUS") {
      setDeleteError("Ketik kata 'HAPUS' dengan huruf kapital untuk konfirmasi.");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      if (user && db) {
        // 1. Hapus semua transaksi milik user
        const txQuery = query(collection(db, "transactions"), where("userId", "==", user.uid));
        const txSnap = await getDocs(txQuery);
        const batch = writeBatch(db);
        txSnap.forEach((d) => batch.delete(d.ref));
        await batch.commit();

        // 2. Hapus dokumen bisnis
        if (business?.id) {
          await deleteDoc(doc(db, "businesses", business.id));
        }

        // 3. Hapus dokumen profil user
        await deleteDoc(doc(db, "users", user.uid));

        // 4. Hapus akun Auth Firebase
        if (auth.currentUser) {
          await deleteUser(auth.currentUser);
        }
      }

      // Bersihkan local storage
      localStorage.clear();
      sessionStorage.clear();

      await logout();
      router.push("/login");
    } catch (err: any) {
      console.error("Gagal hapus akun:", err);
      setDeleteError(
        "Gagal menghapus akun: " +
          (err.code === "auth/requires-recent-login"
            ? "Demi keamanan, silakan logout dan login ulang sebelum menghapus akun."
            : err.message)
      );
      setIsDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090A0F] text-slate-100 px-4 sm:px-5 pt-6 pb-28 w-full relative overflow-hidden">
      {/* Solar Flare Ambient */}
      <div
        className="absolute top-[-90px] left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full pointer-events-none blur-[130px] opacity-15"
        style={{
          background: "radial-gradient(circle, #FF8918 0%, #DA4E24 50%, transparent 80%)",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <button
          type="button"
          onClick={() => router.push("/pengaturan")}
          className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-base font-bold text-white">Kelola Data Kas</h1>
          <p className="text-[11px] text-slate-400">Ekspor, backup, &amp; pembersihan data</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="space-y-4 relative z-10">
        {/* Section 1: Ekspor Data */}
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-orange-400" />
            <span>Ekspor &amp; Backup Data</span>
          </label>
          <p className="text-xs text-slate-300 leading-relaxed">
            Unduh seluruh riwayat transaksi kas Anda untuk pembukuan akuntansi eksternal atau arsip offline.
          </p>

          {exportSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{exportSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => handleExportData("csv")}
              disabled={isExporting}
              className="h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-emerald-500/40 text-xs font-semibold text-slate-200 hover:text-emerald-300 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Ekspor Excel / CSV</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportData("json")}
              disabled={isExporting}
              className="h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-cyan-500/40 text-xs font-semibold text-slate-200 hover:text-cyan-300 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <FileJson className="w-4 h-4 text-cyan-400" />
              <span>Cadangan JSON</span>
            </button>
          </div>
        </div>

        {/* Section 2: Bersihkan Cache Draft & Media */}
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Pembersihan Cache Sementara</span>
          </label>
          <p className="text-xs text-slate-300 leading-relaxed">
            Hapus sisa pratinjau nota atau draft transaksi belum tersimpan tanpa menghapus transaksi resmi buku kas Anda.
          </p>

          <button
            type="button"
            onClick={handleClearCache}
            disabled={isClearingCache}
            className="w-full h-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-amber-500/40 text-xs font-semibold text-slate-200 hover:text-amber-300 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {cacheCleared ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Cache Berhasil Dibersihkan!</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 text-amber-400" />
                <span>Bersihkan Draft &amp; Cache Sekarang</span>
              </>
            )}
          </button>
        </div>

        {/* Section 3: Danger Zone / Hapus Akun Permanen */}
        <div className="p-4 rounded-3xl border border-rose-500/30 bg-rose-500/[0.03] space-y-3">
          <label className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Zona Bahaya — Hak Privasi (GDPR)</span>
          </label>
          <p className="text-xs text-slate-300 leading-relaxed">
            Menghapus permanen seluruh riwayat transaksi kas, data profil usaha, dan kredensial akun dari server kami.
          </p>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="w-full h-11 rounded-2xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Hapus Akun &amp; Semua Data Permanen</span>
          </button>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Akun */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#0D0E15] border border-rose-500/40 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-400">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Konfirmasi Penghapusan Total</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tindakan ini <strong>tidak dapat dibatalkan</strong>. Semua pembukuan dan akun Anda akan dihapus secara mutlak dari database.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                Ketik kata <span className="text-rose-400 font-bold">HAPUS</span> untuk melanjutkan:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="HAPUS"
                className="w-full h-11 px-3.5 rounded-xl bg-black/60 border border-white/10 focus:border-rose-500 text-sm text-center font-bold tracking-widest text-rose-400 placeholder-slate-600 outline-none uppercase"
              />
            </div>

            {deleteError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
                {deleteError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="h-11 rounded-xl bg-white/[0.05] text-slate-300 text-xs font-semibold hover:bg-white/[0.08]"
              >
                Batalkan
              </button>

              <button
                type="button"
                onClick={handleDeleteAccountPermanent}
                disabled={isDeleting || deleteConfirmText.trim() !== "HAPUS"}
                className="h-11 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus Semua</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
