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
    <main className="min-h-screen bg-[#090A0F] text-slate-100 px-5 pt-6 pb-28 max-w-md mx-auto relative overflow-hidden">
      {/* Background Solar Flare Ambient Glow */}
      <div 
        className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full pointer-events-none blur-[140px] opacity-20"
        style={{
          background: "radial-gradient(circle, #FF8918 0%, #DA4E24 50%, transparent 80%)"
        }}
      />

      {/* Top Bar Header */}
      <header className="flex items-center justify-between relative z-10 mb-5">
        <button 
          type="button"
          onClick={() => router.push("/pengaturan/usaha")}
          className="flex items-center gap-3 text-left hover:opacity-80 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-orange-400 shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide truncate max-w-[140px]">
              {business?.name || "Usaha Saya"}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="text-[11px] text-slate-400 font-medium capitalize truncate">
                {business?.category || "Kasir Aktif"}
              </span>
            </div>
          </div>
        </button>

        {/* Streak Badge */}
        <button 
          type="button"
          onClick={() => router.push("/gamifikasi")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 shadow-[0_0_15px_rgba(255,137,24,0.15)] hover:bg-orange-500/20 active:scale-95 transition-all"
        >
          <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
          <span className="text-xs font-bold font-mono text-orange-300">
            3 Hari
          </span>
        </button>
      </header>

      {/* Hero Bento Card - Saldo Kas Hari Ini */}
      <section className="relative z-10 p-5 rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] mb-6">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Saldo Kas Bersih Hari Ini
        </span>

        {/* Nominal Bersih Mono */}
        <div className="text-3xl font-bold font-mono tracking-tight text-white mt-1.5 mb-5 flex items-baseline gap-1">
          <span className="text-lg text-slate-500 font-sans font-normal">Rp</span>
          <span>{netBalance.toLocaleString("id-ID")}</span>
        </div>

        {/* Split Masuk & Keluar Bar */}
        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-white/[0.06]">
          {/* Uang Masuk */}
          <div className="p-3 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 flex flex-col">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium mb-1">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </div>
            <span className="text-sm font-bold font-mono text-emerald-300">
              +Rp {todayIncome.toLocaleString("id-ID")}
            </span>
          </div>

          {/* Uang Keluar */}
          <div className="p-3 rounded-2xl bg-rose-500/[0.06] border border-rose-500/20 flex flex-col">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-medium mb-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </div>
            <span className="text-sm font-bold font-mono text-rose-300">
              -Rp {todayExpense.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </section>

      {/* Quick Action Bar (3 Tombol Utama Sesuai Spesifikasi) */}
      <section className="relative z-10 mb-6">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Catat Transaksi Kasir
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Catat Manual */}
          <button
            onClick={() => router.push("/catat/manual")}
            className="p-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex flex-col items-center justify-center gap-2 hover:border-white/20 active:scale-95 transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-slate-200 group-hover:text-white transition-colors">
              <Keyboard className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-300">Manual</span>
          </button>

          {/* Catat Suara (Solar Glow Aksen) */}
          <button
            onClick={() => router.push("/catat/suara")}
            className="p-3.5 rounded-2xl border border-orange-500/30 bg-orange-500/[0.08] flex flex-col items-center justify-center gap-2 hover:border-orange-500/50 shadow-[0_0_20px_rgba(255,137,24,0.15)] active:scale-95 transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF8918] to-[#DA4E24] flex items-center justify-center text-white shadow-[0_0_12px_rgba(255,137,24,0.4)]">
              <Mic className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-orange-300">Suara AI</span>
          </button>

          {/* Pindai Nota */}
          <button
            onClick={() => router.push("/catat/nota")}
            className="p-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex flex-col items-center justify-center gap-2 hover:border-white/20 active:scale-95 transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-slate-200 group-hover:text-white transition-colors">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-300">Foto Nota</span>
          </button>
        </div>
      </section>

      {/* Riwayat Transaksi Hari Ini List */}
      <section className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Aktivitas Hari Ini
          </span>
          <button 
            onClick={() => router.push("/riwayat")}
            className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-0.5"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          /* Empty State Ramah */
          <div className="p-6 rounded-3xl border border-white/[0.06] bg-white/[0.01] text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500 mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-300 mb-1">Belum Ada Transaksi</h4>
            <p className="text-xs text-slate-500 max-w-[220px] leading-relaxed">
              Mulai catat transaksi pertama hari ini lewat tombol manual, suara, atau foto nota.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                    tx.type === "income" 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}>
                    {tx.type === "income" ? "+" : "-"}
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">
                      {tx.note || tx.category || "Transaksi"}
                    </h5>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {tx.category} • {tx.source || "manual"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-bold font-mono ${
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