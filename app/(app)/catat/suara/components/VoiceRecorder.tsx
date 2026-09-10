"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2, ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";

export function VoiceRecorder({ onDraftReady }: { onDraftReady: (draft: any) => void }) {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [processing, setProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [seconds, setSeconds] = useState(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await sendToBackend(audioBlob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorderRef.current.start(200);
      setRecording(true);
      setTranscript("");
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch (err) {
      alert("Izin mikrofon dibutuhkan untuk mencatat suara");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const sendToBackend = async (audioBlob: Blob) => {
    setProcessing(true);
    try {
      const base64 = await blobToBase64(audioBlob);
      const res = await fetch("/api/voice-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64: base64 }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        onDraftReady({
          draftId: `draft_${Date.now()}`,
          source: "voice",
          data: data.data,
          aiMeta: { confidence: data.data.confidence || 0.9, lowConfidenceFields: data.data.lowConfidenceFields || [] },
        });
      } else {
        alert("Gagal memproses suara: " + (data.error || "Unknown"));
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memproses suara");
    } finally {
      setProcessing(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(blob);
    });

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Catat Suara</h1>
      </div>

      {/* Record Button */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={processing}
          className={`relative w-36 h-36 rounded-full flex items-center justify-center transition-all shadow-lg ${
            recording
              ? "bg-rose-500 animate-pulse ring-4 ring-rose-300"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {processing ? (
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </button>

        <div className="text-center">
          <p className={`text-3xl font-mono font-bold ${recording ? "text-rose-600" : "text-slate-500"}`}>
            {formatTime(seconds)}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {recording ? "Tekan untuk berhenti" : "Tekan untuk mulai merekam"}
          </p>
        </div>

        {transcript && (
          <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm text-slate-700">
            {transcript}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-800">
        <h4 className="font-semibold mb-1">Tips untuk hasil terbaik:</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>Ucapkan jelas: "Laku 3 porsi mie ayam, tiga puluh ribu"</li>
          <li>Sebutkan: Jenis, Jumlah, Harga, Tanggal (opsional)</li>
          <li>Hindari kebisingan latar</li>
        </ul>
      </div>
    </div>
  );
}