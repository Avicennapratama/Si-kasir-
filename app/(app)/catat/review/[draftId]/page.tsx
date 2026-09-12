"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { DraftReviewScreen, TransactionDraft } from "./components/DraftSummary";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/firebase/auth-context";
import { addToOutbox } from "@/lib/offline/outbox";
import { RefreshCw } from "lucide-react";

export default function ReviewDraftPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [draft, setDraft] = useState<TransactionDraft | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const draftId = params?.draftId as string;
    if (!draftId) return;
    const raw = sessionStorage.getItem(`sikasir_draft_${draftId}`);
    if (raw) {
      try {
        setDraft(JSON.parse(raw) as TransactionDraft);
      } catch {
        setNotFound(true);
      }
    } else {
      setNotFound(true);
    }
  }, [params]);

  const handleConfirm = async (data: TransactionDraft["data"]) => {
    const source: "suara" | "nota" = draft?.source === "receipt" ? "nota" : "suara";
    const tx = {
      type: data.type,
      amount: data.amount,
      category: data.category,
      note: data.note,
      transactionDate: data.transactionDate,
      items: data.items || [],
      source,
      userId: user?.uid || "",
      createdAt: serverTimestamp(),
    };

    try {
      if (navigator.onLine && user) {
        await addDoc(collection(db, "transactions"), tx);
      } else {
        addToOutbox({
          type: data.type,
          amount: data.amount,
          category: data.category,
          note: data.note,
          transactionDate: data.transactionDate,
          source,
        });
      }
      sessionStorage.removeItem(`sikasir_draft_${draft?.draftId}`);
      router.push("/riwayat");
    } catch {
      addToOutbox({
        type: data.type,
        amount: data.amount,
        category: data.category,
        note: data.note,
        transactionDate: data.transactionDate,
        source,
      });
      sessionStorage.removeItem(`sikasir_draft_${draft?.draftId}`);
      router.push("/riwayat");
    }
  };

  if (notFound) {
    return (
      <main className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-slate-400 mb-6 max-w-xs leading-relaxed">
          Draft transaksi sudah kedaluwarsa atau telah disimpan sebelumnya.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="h-12 px-8 rounded-2xl bg-gradient-to-r from-solar-500 to-solar-600 text-slate-950 text-sm font-semibold shadow-[0_0_25px_rgba(255,137,24,0.3)] active:scale-95 transition-all"
        >
          Ke Beranda
        </button>
      </main>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-[#090A0F] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-solar-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#090A0F] flex justify-center">
      <div className="w-full bg-[#090A0F] shadow-2xl">
        <DraftReviewScreen
          draft={draft}
          onConfirm={handleConfirm}
          onReject={() => {
            sessionStorage.removeItem(`sikasir_draft_${draft.draftId}`);
            router.push("/dashboard");
          }}
          onManualFallback={() => router.push("/catat/manual")}
        />
      </div>
    </main>
  );
}
