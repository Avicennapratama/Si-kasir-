"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Flame, 
  ArrowLeft, 
  Calendar, 
  Award, 
  Target, 
  TrendingUp, 
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { fetchGamificationStats } from "@/lib/api/gamification.api";

const BADGES = [
  { id: "first-transaction", label: "Transaksi Pertama", desc: "Mencatat transaksi pertama kali", icon: "🎉", category: "milestone" },
  { id: "streak-3", label: "3 Hari Berturut-turut", desc: "Mencatat 3 hari beruntun", icon: "🔥", category: "streak" },
  { id: "streak-7", label: "7 Hari Berturut-turut", desc: "Mencatat 7 hari beruntun (1 minggu)", icon: "🔥", category: "streak" },
  { id: "streak-14", label: "14 Hari Berturut-turut", desc: "Mencatat 14 hari beruntun (2 minggu)", icon: "🔥", category: "streak" },
  { id: "streak-30", label: "30 Hari Berturut-turut", desc: "Mencatat 30 hari beruntun (1 bulan)", icon: "👑", category: "streak" },
  { id: "high-volume", label: "Volume Tinggi", desc: "Total transaksi > 100", icon: "📈", category: "volume" },
  { id: "hk-registered", label: "HKI Terdaftar", desc: "Mendaftarkan merek ke DJKI", icon: "📜", category: "special" },
];

type BadgeCategory = "streak" | "milestone" | "volume" | "special";

function getBadgeCategoryColor(category: BadgeCategory) {
  switch (category) {
    case "streak": return "from-orange-500 to-rose-600";
    case "milestone": return "from-emerald-500 to-teal-600";
    case "volume": return "from-cyan-500 to-blue-600";
    case "special": return "from-amber-500 to-orange-600";
  }
}

function getCategoryLabel(category: BadgeCategory) {
  switch (category) {
    case "streak": return "Streak";
    case "milestone": return "Milestone";
    case "volume": return "Volume";
    case "special": return "Khusus";
  }
}

function generateCalendarDays(currentStreak: number) {
  const days = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayNum = date.getDate();
    const isToday = i === 0;
    const isInStreak = i < currentStreak;
    const isPast = i > 0;
    
    days.push({ dayNum, isToday, isInStreak, isPast, date });
  }
  return days;
}

export default function GamifikasiPage() {
  const router = useRouter();
  const { business } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState<{ badgeId: string; label: string } | null>(null);

  useEffect(() => {
    if (!business?.id) return;
    fetchGamificationStats(business.id)
      .then((res: any) => setStats(res?.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [business?.id]);

  const handleCelebrate = (badge: any) => {
    setShowCelebration({ badgeId: badge.id, label: badge.label });
    setTimeout(() => setShowCelebration(null), 3000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090A0F] text-slate-100 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const currentStreak = stats?.streak || 0;
  const achievements = stats?.achievements || [];
  const unlockedBadges = new Set(achievements.map((a: any) => a.id));
  const calendarDays = generateCalendarDays(currentStreak);

  return (
    <main className="min-h-screen bg-[#090A0F] text-slate-100 px-4 sm:px-5 pt-6 pb-28 max-w-md mx-auto relative overflow-hidden">
      {/* Ambient Flare */}
      <div
        className="absolute top-[-90px] left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full pointer-events-none blur-[120px] opacity-15"
        style={{ background: "radial-gradient(circle, #FF8918 0%, #DA4E24 50%, transparent 80%)" }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <button
          onClick={() => router.push("/ekraf")}
          className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-base font-bold text-white">Pencapaian & Misi Harian</h1>
          <p className="text-[11px] text-slate-400">Streak rajin mencatat & kumpulkan lencana usaha</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Streak Hero Card */}
      <div className="relative z-10 mb-6">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-orange-500/15 via-white/[0.02] to-transparent border border-orange-500/25 shadow-[0_0_30px_rgba(255,137,24,0.1)]">
          {/* Streak Counter */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,137,24,0.3)]">
                <Flame className="w-5 h-5 fill-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-300">STREAK SAAT INI</p>
                <p className="text-3xl font-bold text-white font-mono tracking-wider">{currentStreak} Hari</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Terpanjang</p>
              <p className="text-lg font-bold text-orange-400 font-mono">{stats?.longestStreak || currentStreak} Hari</p>
            </div>
          </div>

          {/* Calendar Grid - 30 Days */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">30 Hari Terakhir</p>
            <div className="grid grid-cols-15 gap-1.5">
              {calendarDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                    day.isToday
                      ? "ring-2 ring-orange-500 bg-orange-500/10"
                      : day.isInStreak
                      ? "bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-orange-500/30 shadow-[0_0_10px_rgba(255,137,24,0.2)]"
                      : day.isPast
                      ? "bg-white/[0.02] border border-white/[0.06]"
                      : "bg-white/[0.01] border border-white/[0.03] opacity-50"
                  }`}
                >
                  <span className={`text-[10px] font-mono font-bold ${day.isInStreak || day.isToday ? "text-orange-400" : "text-slate-500"}`}>
                    {day.dayNum}
                  </span>
                  {day.isInStreak && (
                    <Flame className="w-3 h-3 fill-orange-400 -mt-1" />
                  )}
                  {day.isToday && !day.isInStreak && (
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 -mt-1 animate-pulse" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              {currentStreak === 0 
                ? "Mulai catat hari ini untuk memulai streak! 🚀"
                : currentStreak < 7
                ? `${7 - currentStreak} hari lagi untuk lencana 7 hari!`
                : currentStreak < 14
                ? `${14 - currentStreak} hari lagi untuk lencana 14 hari!`
                : currentStreak < 30
                ? `${30 - currentStreak} hari lagi untuk lencana 30 hari! 👑`
                : "Legenda streak! Pertahankan! 🏆"}
            </p>
          </div>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            Koleksi Lencana ({achievements.filter((a: any) => a.unlocked).length}/{BADGES.length})
          </h2>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {(["semua", "streak", "milestone", "volume", "special"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {}}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-semibold border transition-all ${
                cat === "semua"
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                  : "bg-white/[0.02] border-white/[0.06] text-slate-500 hover:text-slate-300"
              }`}
            >
              {cat === "semua" ? "Semua" : getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Badge Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {BADGES.map((badge) => {
            const isUnlocked = unlockedBadges.has(badge.id);
            const badgeData = achievements.find((a: any) => a.id === badge.id);
            
            return (
              <button
                key={badge.id}
                onClick={() => isUnlocked && handleCelebrate(badge)}
                className={`p-3.5 rounded-2xl border relative overflow-hidden group flex flex-col items-center text-center transition-all active:scale-[0.98] ${
                  isUnlocked
                    ? `bg-gradient-to-br ${getBadgeCategoryColor(badge.category as BadgeCategory)} border-transparent shadow-[0_0_20px_rgba(255,137,24,0.15)]`
                    : "bg-white/[0.02] border-white/[0.06] opacity-60"
                }`}
                disabled={!isUnlocked}
              >
                {/* Lock overlay for locked badges */}
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <Lock className="w-6 h-6 text-white/50" />
                  </div>
                )}

                {/* Badge Icon */}
                <div className={`relative z-20 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110 ${
                  isUnlocked
                    ? `bg-gradient-to-br ${getBadgeCategoryColor(badge.category as BadgeCategory)} shadow-[0_0_15px_rgba(255,137,24,0.3)]`
                    : "bg-white/[0.03] text-white/20"
                }`}>
                  {badge.icon}
                </div>

                {/* Badge Label */}
                <div className={`relative z-20 mt-2 space-y-1 ${isUnlocked ? "text-white" : "text-slate-500"}`}>
                  <p className="text-xs font-bold leading-tight">{badge.label}</p>
                  <p className="text-[9px] leading-tight">{badge.desc}</p>
                </div>

                {/* Category Badge */}
                <div className={`relative z-20 mt-1.5 px-2 py-0.5 rounded-full text-[8px] font-semibold ${isUnlocked ? "" : "hidden"}`}>
                  {getCategoryLabel(badge.category as BadgeCategory)}
                </div>

                {/* Unlock Date */}
                {isUnlocked && badgeData?.unlockedAt && (
                  <p className={`relative z-20 mt-1 text-[9px] text-slate-400 ${isUnlocked ? "" : "hidden"}`}>
                    {new Date(badgeData.unlockedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </p>
                )}

                {/* Sparkle animation for newly unlocked */}
                {isUnlocked && (
                  <div className="absolute top-2 right-2 w-5 h-5">
                    <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
            <p className="text-2xl font-bold text-white font-mono">{stats?.totalTransactions || 0}</p>
            <p className="text-[10px] text-slate-400">Total Transaksi</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
            <p className="text-2xl font-bold text-emerald-400 font-mono">
              {stats?.totalIncome ? `Rp ${stats.totalIncome.toLocaleString("id-ID")}` : "Rp 0"}
            </p>
            <p className="text-[10px] text-slate-400">Total Masuk</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
            <p className="text-2xl font-bold text-rose-400 font-mono">
              {stats?.totalExpense ? `Rp ${stats.totalExpense.toLocaleString("id-ID")}` : "Rp 0"}
            </p>
            <p className="text-[10px] text-slate-400">Total Keluar</p>
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm mx-4 animate-in zoom-in duration-300">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500/20 via-rose-500/10 to-transparent border border-orange-500/40 shadow-[0_0_40px_rgba(255,137,24,0.4)] text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white shadow-[0_0_25px_rgba(255,137,24,0.5)] animate-bounce">
                <Award className="w-10 h-10 fill-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Lencana Baru Terbuka! 🎉</h3>
              <p className="text-slate-300 mb-4">{showCelebration.label}</p>
              <div className="w-16 h-1.5 mx-auto bg-gradient-to-r from-orange-500 to-rose-600 rounded-full" />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}