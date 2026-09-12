"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, ArrowLeft, Keyboard, AlertTriangle, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { parseIndonesianVoice } from "@/lib/ai/voice-parser";
import { processVoiceInput } from "@/lib/api/voice.api";

type PageState = "idle" | "recording" | "processing";
type ErrorModal = "permission" | "silent" | "failed" | null;

export default function CatatSuaraPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [state, setState] = useState<PageState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [errorModal, setErrorModal] = useState<ErrorModal>(null);
  const [successFlash, setSuccessFlash] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} / 01:00`;
  };

  const stopAllMedia = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopAllMedia();
    };
  }, []);

  const startRecording = async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setErrorModal("permission");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      transcriptRef.current = "";
      setLiveTranscript("");

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((t) => t.stop());
          audioStreamRef.current = null;
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        handleProcess(audioBlob, transcriptRef.current);
      };

      // Inisialisasi Web Speech API (speech recognition native browser bahasa Indonesia)
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognizer = new SpeechRecognition();
          recognizer.lang = "id-ID";
          recognizer.continuous = true;
          recognizer.interimResults = true;

          recognizer.onresult = (event: any) => {
            let current = "";
            for (let i = 0; i < event.results.length; i++) {
              current += event.results[i][0].transcript + " ";
            }
            const clean = current.trim();
            transcriptRef.current = clean;
            setLiveTranscript(clean);
          };

          recognizer.onerror = (e: any) => {
            console.warn("SpeechRecognition error:", e);
          };

          recognizer.start();
          recognitionRef.current = recognizer;
        } catch (recErr) {
          console.warn("Could not start speech recognition:", recErr);
        }
      }

      recorder.start(200);
      setState("recording");
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s >= 59) {
            stopRecording();
            return 60;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setErrorModal("permission");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      setState("processing");
      mediaRecorderRef.current.stop();
    }
  };

  const handleBack = () => {
    stopAllMedia();
    router.push("/dashboard");
  };

  const handleProcess = async (audioBlob: Blob, liveText: string) => {
    setState("processing");

    try {
      // Tunggu buffer sebentar agar user melihat status processing
      await new Promise((r) => setTimeout(r, 600));

      if (audioBlob.size < 800 && !liveText) {
        setState("idle");
        setErrorModal("silent");
        return;
      }

      // Transkrip wajib ada. Sebelumnya bila kosong kode memakai kalimat
      // contoh hardcoded — user merekam tanpa bicara lalu mendapat transaksi
      // "mie ayam 30 ribu" palsu yang masuk pembukuan.
      const inputTranscript = liveText.trim();
      if (!inputTranscript) {
        setState("idle");
        setErrorModal("silent");
        return;
      }

      // Kategori tidak dikembalikan Gemini, jadi parser lokal yang
      // menentukannya — murni pencocokan kata kunci, deterministik, 0.09ms.
      const localGuess = parseIndonesianVoice(inputTranscript);

      // Gemini dulu (95.8% pada kasus sulit); parser lokal jadi fallback offline.
      let engine: "gemini" | "lokal" = "lokal";
      let parsed = localGuess;

      if (typeof navigator !== "undefined" && navigator.onLine) {
        const remote = await processVoiceInput(inputTranscript);
        if (remote.success && remote.data && remote.data.amount && remote.data.amount > 0) {
          engine = "gemini";
          parsed = {
            type: remote.data.type || localGuess.type,
            amount: remote.data.amount,
            note: remote.data.note || inputTranscript,
            category: localGuess.category,
            items: (remote.data.items || []).map((it) => ({
              name: it.name,
              qty: it.qty ?? 1,
              price: it.price ?? 0,
            })),
            confidence: remote.data.confidence ?? 0.9,
            lowConfidenceFields: remote.data.lowConfidenceFields ?? [],
            rawTranscript: inputTranscript,
          };
        }
      }

      // Simpan draft transaksi terstandar ke sessionStorage
      const draftId = `draft_${Date.now()}`;
      const draftPayload = {
        draftId,
        source: "voice" as const,
        data: {
          type: parsed.type,
          amount: parsed.amount,
          category: parsed.category,
          note: parsed.note,
          transactionDate: new Date().toISOString().split("T")[0],
          items: parsed.items || [],
        },
        aiMeta: {
          confidence: parsed.confidence,
          lowConfidenceFields: parsed.lowConfidenceFields,
          rawInput: parsed.rawTranscript,
          engine,
        },
      };

      sessionStorage.setItem(`sikasir_draft_${draftId}`, JSON.stringify(draftPayload));

      setSuccessFlash(true);
      setTimeout(() => {
        router.push(`/catat/review/${draftId}`);
      }, 500);
    } catch (err) {
      console.error("Audio processing failed:", err);
      setState("idle");
      setErrorModal("failed");
    }
  };

  return (
    <main className="min-h-screen bg-[#090A0F] text-slate-100 px-5 pt-6 pb-10 w-full relative overflow-hidden flex flex-col">
      {/* Background Solar Glow */}
      <div
        className={`absolute top-[-100px] left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full pointer-events-none blur-[130px] transition-opacity duration-700 ${
          state === "recording" ? "opacity-40" : "opacity-15"
        }`}
        style={{
          background:
            state === "recording"
              ? "radial-gradient(circle, #F43F5E 0%, #DA4E24 40%, transparent 75%)"
              : "radial-gradient(circle, #FF8918 0%, #DA4E24 50%, transparent 80%)",
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-5 mt-2">
        <button
          type="button"
          onClick={handleBack}
          className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[18px] font-bold text-white">Catat Suara Pintar</h1>
        <div className="w-10" />
      </div>

      {/* Tips Card */}
      <div className="relative z-10 p-3.5 rounded-[14px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-md mb-6">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-cyan-300 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>💡 Contoh cara bicara:</span>
        </div>
        <div className="space-y-1.5">
          <p className="text-[13px] italic text-slate-300 leading-relaxed">
            &ldquo;Laku soto ayam dua porsi tiga puluh ribu&rdquo;
          </p>
          <p className="text-[13px] italic text-slate-300 leading-relaxed">
            &ldquo;Beli minyak goreng dua liter tiga puluh lima ribu di pasar&rdquo;
          </p>
        </div>
      </div>

      {/* Center Visualization Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center min-h-[260px]">
        {state === "idle" && (
          <div className="flex flex-col items-center animate-in fade-in">
            <div className="w-20 h-20 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(255,255,255,0.02)]">
              <Mic className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-[14px] font-medium text-slate-400 text-center px-6">
              Ketuk tombol mikrofon di bawah untuk mulai bicara
            </p>
          </div>
        )}

        {state === "recording" && (
          <div className="flex flex-col items-center w-full">
            {/* Pulse ring + waveform */}
            <div className="relative flex items-center justify-center w-24 h-24 mb-5">
              <div className="absolute inset-0 rounded-full border-2 border-rose-500/40 animate-ping" />
              <div className="absolute inset-2 rounded-full border border-rose-500/25 animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center overflow-hidden">
                <div className="flex items-center justify-center gap-1 h-8">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full bg-rose-400 animate-pulse"
                      style={{
                        height: `${18 + (i % 3) * 12}px`,
                        animationDelay: `${i * 0.12}s`,
                        animationDuration: "0.8s",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Timer mono besar */}
            <div className="text-[24px] font-bold font-mono text-rose-400 mb-1 tracking-tight">
              {formatTime(seconds)}
            </div>
            <p className="text-[14px] font-semibold text-rose-300/80 mb-4">
              Mendengarkan suara Anda...
            </p>

            {/* Live speech preview */}
            {liveTranscript && (
              <div className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center max-h-20 overflow-y-auto">
                <p className="text-xs italic text-slate-300">&ldquo;{liveTranscript}&rdquo;</p>
              </div>
            )}
          </div>
        )}

        {state === "processing" && (
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 mb-5">
              <div className="absolute inset-0 rounded-full border-2 border-solar-500/30 border-t-solar-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-solar-500" />
              </div>
            </div>
            <p className="text-[14px] font-medium text-slate-200 text-center mb-1">
              AI sedang mendengarkan &amp; menyusun transaksi...
            </p>
            <p className="text-[12px] text-slate-500">Biasanya butuh 2-3 detik</p>
          </div>
        )}
      </div>

      {/* Main Record Button */}
      <div className="relative z-10 flex flex-col items-center gap-6 pb-4">
        <button
          type="button"
          onClick={state === "recording" ? stopRecording : startRecording}
          disabled={state === "processing"}
          aria-label={state === "recording" ? "Hentikan rekaman" : "Mulai rekam suara"}
          className={`w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${
            state === "recording"
              ? "bg-gradient-to-br from-rose-500 to-rose-600 shadow-[0_0_35px_rgba(244,63,94,0.4)]"
              : "bg-gradient-to-br from-solar-500 to-solar-600 shadow-[0_0_35px_rgba(255,137,24,0.35)]"
          }`}
        >
          {state === "recording" ? (
            <Square className="w-7 h-7 text-white fill-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </button>

        {/* Fallback link */}
        <button
          type="button"
          onClick={() => {
            stopAllMedia();
            router.push("/catat/manual");
          }}
          className="text-[14px] text-slate-300 hover:text-solar-300 transition-colors"
        >
          Suara bising atau koneksi lambat? <strong className="underline text-solar-400">Beralih ke Catat Manual</strong>
        </button>
      </div>

      {/* Success flash overlay */}
      {successFlash && (
        <div className="fixed inset-0 bg-emerald-500/20 backdrop-blur-sm z-40 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.6)] animate-pulse">
            <Sparkles className="w-8 h-8 text-slate-950" />
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-sm rounded-3xl bg-[#0D0E14] border border-white/[0.08] p-6 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
            </div>

            {errorModal === "permission" && (
              <>
                <h3 className="text-base font-bold text-white text-center mb-2">
                  Izin Mikrofon Diperlukan
                </h3>
                <p className="text-[13px] text-slate-400 text-center mb-6 leading-relaxed">
                  SiKasir AI membutuhkan akses mikrofon agar bisa mendengar ucapan transaksi Anda.
                  Silakan izinkan akses pada browser Anda.
                </p>
              </>
            )}

            {errorModal === "silent" && (
              <>
                <h3 className="text-base font-bold text-white text-center mb-2">
                  Suara Tidak Terdeteksi
                </h3>
                <p className="text-[13px] text-slate-400 text-center mb-6 leading-relaxed">
                  Suara tidak terdengar jelas. Pastikan Anda berbicara dekat mikrofon.
                </p>
              </>
            )}

            {errorModal === "failed" && (
              <>
                <h3 className="text-base font-bold text-white text-center mb-2">
                  Ekstraksi Gagal
                </h3>
                <p className="text-[13px] text-slate-400 text-center mb-6 leading-relaxed">
                  AI belum dapat mengenali nominal dari ucapan tadi. Mau coba bicara lagi atau
                  ketik manual?
                </p>
              </>
            )}

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  stopAllMedia();
                  router.push("/catat/manual");
                }}
                className="flex-1 h-12 rounded-2xl border border-white/[0.08] bg-white/[0.03] text-xs font-semibold text-slate-300 hover:text-white active:scale-[0.98] transition-all"
              >
                Ketik Manual
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorModal(null);
                  setTimeout(startRecording, 150);
                }}
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-solar-500 to-solar-600 text-xs font-semibold text-slate-950 shadow-[0_0_20px_rgba(255,137,24,0.3)] active:scale-[0.98] transition-all"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
