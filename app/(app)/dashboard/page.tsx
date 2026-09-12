"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";
import { 
  Flame, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Keyboard, 
  Mic, 
  Camera, 
  TrendingUp, 
  ChevronRight,
  Store,
  Sparkles
} from "lucide-react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getOutbox } from "@/lib/offline/outbox";

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  note?: string;
  source: string;
  createdAt: any;
}

export default function DashboardPage() {
  const { user, business } = useAuth();
  const router = useRouter();

  const [todayIncome, setTodayIncome] = useState(0);
  const [todayExpense, setTodayExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [isOnline, setIsOnline] = useState(true);

  // navigator tidak tersedia saat SSR — cek di client saja
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // Load Real Data from Firestore
  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      try {
        let inc = 0;
        let exp = 0;
        const txs: Transaction[] = [];

        // 1. Ambil dari Offline Outbox hari ini
        const todayStr = new Date().toISOString().split("T")[0];
        const outbox = getOutbox();
        outbox.forEach((item) => {
          const itemDate = item.transactionDate || new Date(item.createdAt).toISOString().split("T")[0];
          if (itemDate === todayStr) {
            if (item.type === "income") inc += item.amount || 0;
            if (item.type === "expense") exp += item.amount || 0;
            txs.push({
              id: item.id,
              amount: item.amount,
              type: item.type,
              category: item.category,
              note: item.note,
              source: item.source || "manual",
              createdAt: item.createdAt,
            });
          }
        });

        // 2. Ambil dari Firestore jika online
        if (navigator.onLine && db && user) {
          try {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const q = query(
              collection(db, "transactions"),
              where("userId", "==", user.uid),
              where("createdAt", ">=", startOfDay),
              orderBy("createdAt", "desc"),
              limit(10)
            );

            const snap = await getDocs(q);
            snap.forEach((doc) => {
              const { id: _ignored, ...rest } = doc.data() as Transaction;
              if (rest.type === "income") inc += rest.amount || 0;
              if (rest.type === "expense") exp += rest.amount || 0;
              txs.push({ id: doc.id, ...rest });
            });
          } catch (fErr) {
            console.warn("Firestore fetch error, relying on outbox/cache:", fErr);
          }
        }

        setTodayIncome(inc);
        setTodayExpense(exp);
        setRecentTransactions(txs.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const netBalance = todayIncome - todayExpense;

  return (
    <main className="min-h-screen bg-[#090A0F] text-slate-100 px-5 sm:px-8 lg:px-10 pt-6 pb-28 w-full relative overflow-hidden">
      {/* Background Solar Flare Ambient Glow */}
      <div 
        className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full pointer-events-none blur-[140px] opacity-20"
        style={{
          background: "radial-gradient(circle, #FF8918 0%, #DA4E24 50%, transparent 80%)"
        }}
      />

      {/* Top Bar Header */}
      <header className="flex items-center justify-between relative z-10 mb-3 mt-2">
        <button 
          type="button"
          onClick={() => router.push("/pengaturan/usaha")}
          className="flex items-center gap-3 text-left hover:opacity-80 active:scale-95 transition-all"
        >
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide truncate max-w-[200px]">
              {business?.name || "Usaha Saya"}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-xs text-slate-400 font-medium capitalize">
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </button>

        {/* Avatar Profil */}
        <button 
          type="button"
          onClick={() => router.push("/pengaturan")}
          className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center overflow-hidden shrink-0 hover:border-white/30 active:scale-95 transition-all"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profil" className="w-full h-full object-cover" />
          ) : (
            <div className="text-sm font-bold text-slate-300">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
            </div>
          )}
        </button>
      </header>

      {/* Banner Streak Gamifikasi */}
      <div 
        onClick={() => router.push("/gamifikasi")}
        className="relative z-10 w-full p-3 rounded-xl border border-orange-500/20 bg-orange-500/10 mb-5 flex items-center gap-3 cursor-pointer hover:bg-orange-500/20 active:scale-[0.98] transition-all"
      >
        <Flame className="w-5 h-5 text-orange-400 fill-orange-400 shrink-0" />
        <p className="text-[11px] font-medium text-orange-100 leading-snug">
          <strong className="font-bold text-orange-300">3 Hari Berturut-turut!</strong> Catat transaksi hari ini agar streak tidak putus.
        </p>
      </div>

      {/* Hero Bento Card - Saldo Kas Hari Ini */}
      <section className="relative z-10 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] mb-6">
        <span className="text-[12px] font-medium text-slate-400">
          Sisa Saldo Hari Ini
        </span>

        {/* Nominal Bersih Mono */}
        <div className="text-[32px] font-bold font-mono tracking-tight text-white mt-1 mb-4 flex items-baseline gap-1">
          <span className="text-xl text-slate-500 font-sans font-normal">Rp</span>
          <span>{netBalance.toLocaleString("id-ID")}</span>
        </div>

        {/* Split Masuk & Keluar Bar */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/[0.06]">
          {/* Uang Masuk */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-emerald-400 text-[12px] font-medium mb-1">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Uang Masuk</span>
            </div>
            <span className="text-[16px] font-semibold font-mono text-emerald-400">
              +Rp {todayIncome.toLocaleString("id-ID")}
            </span>
          </div>

          {/* Uang Keluar */}
          <div className="flex flex-col border-l border-white/[0.06] pl-3">
            <div className="flex items-center gap-1.5 text-rose-400 text-[12px] font-medium mb-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Uang Keluar</span>
            </div>
            <span className="text-[16px] font-semibold font-mono text-rose-400">
              -Rp {todayExpense.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </section>

      {/* Quick Action Bar (3 Tombol Utama Sesuai Spesifikasi) */}
      <section className="relative z-10 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {/* Catat Manual */}
          <button
            onClick={() => router.push("/catat/manual")}
            className="h-[72px] rounded-xl border border-white/[0.08] bg-white/[0.03] flex flex-col items-center justify-center gap-1.5 hover:border-white/20 active:scale-95 transition-all text-center group"
          >
            <Keyboard className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
            <span className="text-[11px] font-medium text-slate-300">Manual</span>
          </button>

          {/* Catat Suara (Solar Glow Aksen) */}
          <button
            onClick={() => router.push("/catat/suara")}
            className="h-[72px] rounded-xl border border-orange-500/30 bg-orange-500/[0.08] flex flex-col items-center justify-center gap-1.5 hover:bg-orange-500/10 shadow-[0_0_15px_rgba(255,137,24,0.1)] active:scale-95 transition-all text-center group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-transparent opacity-50" />
            <Mic className="w-5 h-5 text-orange-400 relative z-10" />
            <span className="text-[11px] font-semibold text-orange-300 relative z-10">Suara AI</span>
          </button>

          {/* Pindai Nota */}
          <button
            onClick={() => router.push("/catat/nota")}
            className="h-[72px] rounded-xl border border-white/[0.08] bg-white/[0.03] flex flex-col items-center justify-center gap-1.5 hover:border-white/20 active:scale-95 transition-all text-center group"
          >
            <Camera className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
            <span className="text-[11px] font-medium text-slate-300">Pindai Nota</span>
          </button>
        </div>
      </section>

      {/* Riwayat Transaksi Hari Ini List */}
      <section className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[16px] font-semibold text-white">
            Transaksi Hari Ini
          </span>
          <button 
            onClick={() => router.push("/riwayat")}
            className="text-[14px] font-medium text-emerald-400 hover:text-emerald-300"
          >
            Lihat Semua
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          /* Empty State Ramah */
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center text-slate-600 mb-2">
              <TrendingUp className="w-10 h-10 opacity-50" />
            </div>
            <h4 className="text-[14px] font-medium text-slate-300 mb-1">Belum ada transaksi hari ini</h4>
            <p className="text-[12px] text-slate-500 max-w-[240px] leading-relaxed">
              Ketuk salah satu tombol di atas untuk mulai mencatat!
            </p>
          </div>
        ) : (
          <div className="space-y-0 border-t border-white/[0.06]">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="h-[60px] flex items-center justify-between border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    tx.type === "income" 
                      ? "bg-emerald-500/10 text-emerald-400" 
                      : "bg-rose-500/10 text-rose-400"
                  }`}>
                    {tx.type === "income" ? "+" : "-"}
                  </div>
                  <div>
                    <h5 className="text-[14px] font-medium text-slate-200 truncate max-w-[140px]">
                      {tx.note || tx.category || "Transaksi"}
                    </h5>
                    <span className="text-[10px] font-mono text-slate-500">
                      [{tx.source || "manual"}] • {new Date(tx.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[14px] font-semibold font-mono ${
                    tx.type === "income" ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {tx.type === "income" ? "+" : "-"}Rp {tx.amount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}