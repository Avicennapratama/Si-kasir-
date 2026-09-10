"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  ArrowLeft, 
  Mail, 
  ShieldCheck, 
  Bell, 
  LogOut, 
  Key, 
  Calendar,
  Sparkles,
  Check
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";

export default function PengaturanProfilPage() {
  const router = useRouter();
  const { user, business, logout } = useAuth();

  // Notification Preferences
  const [dailyReminder, setDailyReminder] = useState(true);
  const [streakReminder, setStreakReminder] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleLogout = async () => {
    if (confirm("Keluar dari akun SiKasir AI?")) {
      await logout();
      router.push("/login");
    }
  };

  const handleSavePreferences = () => {
    setSavingPrefs(true);
    setTimeout(() => {
      setSavingPrefs(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }, 600);
  };

  return (
    <main className="min-h-screen bg-[#090A0F] text-slate-100 px-4 sm:px-5 pt-6 pb-28 max-w-md mx-auto relative overflow-hidden">
      {/* Solar Ambient Glow */}
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
          <h1 className="text-base font-bold text-white">Profil Pengguna</h1>
          <p className="text-[11px] text-slate-400">Informasi akun &amp; preferensi</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="space-y-4 relative z-10">
        {/* User Card */}
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3.5">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-14 h-14 rounded-2xl border border-white/10 object-cover shadow-[0_0_15px_rgba(255,137,24,0.2)]"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(255,137,24,0.3)]">
              {user?.email?.slice(0, 2).toUpperCase() || "SK"}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white truncate">
              {user?.displayName || "Pengguna SiKasir"}
            </h2>
            <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-cyan-400" />
              <span>{user?.email || "Belum ada email"}</span>
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Google OAuth Terverifikasi</span>
              </span>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Detail Identitas Sistem
          </label>

          <div className="flex items-center justify-between text-xs py-1 border-b border-white/[0.04]">
            <span className="text-slate-400">User ID (UID)</span>
            <span className="text-slate-300 font-mono text-[11px] truncate max-w-[180px]">
              {user?.uid || "Local Demo"}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-white/[0.04]">
            <span className="text-slate-400">Toko Terkait</span>
            <span className="text-slate-200 font-semibold truncate max-w-[180px]">
              {business?.name || "Belum ada"}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-slate-400">Status Akun</span>
            <span className="text-emerald-400 font-semibold">Aktif</span>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-orange-400" />
              <span>Pengingat &amp; Notifikasi</span>
            </label>
            {savedSuccess && (
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                <Check className="w-3 h-3" /> Tersimpan
              </span>
            )}
          </div>

          {/* Toggle 1 */}
          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <div>
              <p className="text-xs font-semibold text-white">Pengingat Tutup Kas Harian</p>
              <p className="text-[11px] text-slate-400">Ingatkan catat kas setiap jam 20:00 WIB</p>
            </div>
            <button
              type="button"
              onClick={() => setDailyReminder(!dailyReminder)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                dailyReminder ? "bg-orange-500" : "bg-white/10"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  dailyReminder ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Toggle 2 */}
          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <div>
              <p className="text-xs font-semibold text-white">Pemberitahuan Streak &amp; Misi</p>
              <p className="text-[11px] text-slate-400">Notifikasi jika streak mencatat hampir putus</p>
            </div>
            <button
              type="button"
              onClick={() => setStreakReminder(!streakReminder)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                streakReminder ? "bg-orange-500" : "bg-white/10"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  streakReminder ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Toggle 3 */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-semibold text-white">Ringkasan Laporan Mingguan</p>
              <p className="text-[11px] text-slate-400">Kirim rekapan laba rugi ke email setiap hari Senin</p>
            </div>
            <button
              type="button"
              onClick={() => setWeeklyReport(!weeklyReport)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                weeklyReport ? "bg-orange-500" : "bg-white/10"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  weeklyReport ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSavePreferences}
            disabled={savingPrefs}
            className="w-full h-10 mt-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>{savingPrefs ? "Menyimpan..." : "Simpan Pengaturan Notifikasi"}</span>
          </button>
        </div>

        {/* Logout Section */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-12 rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_15px_rgba(244,63,94,0.15)]"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>
    </main>
  );
}
