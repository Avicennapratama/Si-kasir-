"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Bot, 
  Send, 
  Store, 
  FileText, 
  TrendingUp, 
  PieChart, 
  HelpCircle,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";

// Quick Action Topics
const QUICK_TOPICS = [
  { id: "nib", title: "Cara Bikin NIB Gratis di OSS", icon: FileText },
  { id: "halal", title: "Syarat Sertifikat Halal UMKM", icon: ShieldCheck },
  { id: "cashflow", title: "Tips Mengatur Arus Kas Warung", icon: TrendingUp },
  { id: "separation", title: "Cara Pisahkan Uang Pribadi & Toko", icon: PieChart },
];

import { ShieldCheck } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

export default function AsistenPage() {
  const router = useRouter();
  const { business } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Mock AI Response with delay
    setTimeout(() => {
      let aiResponseText = "";
      const lower = text.toLowerCase();

      if (lower.includes("nib") || lower.includes("izin")) {
        aiResponseText = "Untuk membuat NIB gratis, kamu bisa akses website OSS (oss.go.id). Siapkan KTP, NPWP, dan nomor telepon aktif. Jika usahamu skala mikro, pilih opsi UMK dan ikuti panduannya sampai NIB terbit. Mudah kok!";
      } else if (lower.includes("halal")) {
        aiResponseText = "Sertifikat Halal untuk UMKM sekarang lebih mudah lewat jalur Sehati (Sertifikasi Halal Gratis). Syarat utamanya: punya NIB, produk tidak mengandung daging yang disembelih (kecuali ada sertifikat halal potong hewan), dan bahan-bahan sudah jelas kehalalannya.";
      } else if (lower.includes("kas") || lower.includes("uang")) {
        aiResponseText = "Tips paling penting: JANGAN gabung uang pribadi dan uang toko! Bikin dua dompet atau dua rekening berbeda. Kalau ambil barang toko untuk dimakan sendiri, catat sebagai 'Pengeluaran Lainnya' agar stok dan kas tetap sinkron.";
      } else {
        aiResponseText = `Pertanyaan bagus! Sebagai asisten dari ${business?.name || "toko ini"}, saya menyarankan kamu selalu rutin mencatat transaksi setiap hari agar datanya bisa saya pelajari dan saya kasih saran yang lebih akurat.`;
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: aiResponseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <main className="flex flex-col h-screen bg-[#090A0F] text-slate-100 max-w-md mx-auto relative overflow-hidden">
      {/* Background Flare */}
      <div 
        className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] rounded-full pointer-events-none blur-[100px] opacity-15"
        style={{ background: "radial-gradient(circle, #0098F3 0%, #0077CC 50%, transparent 80%)" }}
      />

      {/* Header */}
      <header className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] relative z-10 bg-[#090A0F]/80 backdrop-blur-xl">
        <button
          onClick={() => router.push("/ekraf")}
          className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-white">Asisten Legalitas</h1>
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Bot className="w-5 h-5" />
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10 scrollbar-hide">
        
        {/* Welcome & Quick Topics */}
        {messages.length === 0 && (
          <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0 mt-1 border border-cyan-500/20">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/[0.08] text-sm text-slate-200 leading-relaxed shadow-lg">
                Halo! Saya asisten pintar SiKasir AI. Ada yang bisa saya bantu soal izin usaha, sertifikat halal, atau tips atur uang toko?
              </div>
            </div>

            <div className="pl-11 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_TOPICS.map((topic) => {
                const Icon = topic.icon;
                return (
                  <button
                    key={topic.id}
                    onClick={() => handleSend(topic.title)}
                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-white/[0.06] text-left transition-all active:scale-95 flex gap-2 items-start group"
                  >
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-slate-300 group-hover:text-cyan-300">
                      {topic.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Messages Stream */}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {msg.role === "ai" ? (
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0 mt-1 border border-cyan-500/20 shadow-[0_0_10px_rgba(0,152,243,0.1)]">
                <Bot className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0 mt-1 border border-orange-500/20">
                <Store className="w-4 h-4" />
              </div>
            )}
            
            <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-lg max-w-[85%] ${
              msg.role === "user" 
                ? "rounded-tr-sm bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 text-emerald-50"
                : "rounded-tl-sm bg-white/[0.04] border border-white/[0.08] text-slate-200"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 animate-in fade-in duration-300">
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0 mt-1 border border-cyan-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/[0.08] flex items-center gap-1.5 h-11 w-16">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}

        {/* Disclaimer Warning - Show only after first AI response */}
        {messages.length > 0 && !isTyping && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 mx-4 mt-8">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-orange-300/80 leading-tight">
              Asisten memberikan panduan informatif awal, bukan penasihat hukum resmi. Pastikan selalu cross-check ke instansi terkait.
            </p>
          </div>
        )}

        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/[0.08] bg-[#090A0F]/80 backdrop-blur-xl relative z-20 pb-[env(safe-area-inset-bottom,16px)]">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ketik pertanyaan usahamu di sini..."
            className="flex-1 h-12 bg-black/50 border border-white/[0.08] rounded-2xl px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="w-12 h-12 shrink-0 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center hover:bg-cyan-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </main>
  );
}